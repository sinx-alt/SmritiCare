/**
 * SmritiCare - Memory Assistant Module
 * Speech-to-Text (STT)
 *
 * Day 4 implementation:
 * Uses @react-native-voice/voice for native speech recognition.
 *
 * IMPORTANT:
 * - This package requires a native/dev build; it does NOT run in Expo Go.
 * - The recognition engine and installed language packs on the phone determine
 *   which locales actually work.
 */

import Voice from '@react-native-voice/voice';
import { LANGUAGE_MAP } from './languageMap';

export interface SttResult {
  text: string;
  confidence?: number;
  language?: string;
}

export interface SttProvider {
  /** Start listening and resolve with the recognized text once the user stops speaking. */
  listenOnce(language: string): Promise<SttResult>;
}

/**
 * Native speech-recognition provider.
 *
 * The locale is requested from the device speech-recognition engine.
 * If a requested regional locale is unavailable, Voice.start() will reject;
 * we surface that error instead of pretending that another language was used.
 */
export class NativeVoiceSttProvider implements SttProvider {
  async listenOnce(language: string): Promise<SttResult> {
    const locale = LANGUAGE_MAP[language] ?? language;

    const available = await Voice.isAvailable();
    if (!available) {
      throw new Error(
        'Speech recognition is not available on this device. Check that a speech-recognition service is enabled.'
      );
    }

    return new Promise<SttResult>(async (resolve, reject) => {
      let settled = false;
      let timeout: ReturnType<typeof setTimeout> | undefined;

      const cleanup = async () => {
        if (timeout) clearTimeout(timeout);

        Voice.onSpeechResults = () => {};
        Voice.onSpeechError = () => {};
        Voice.onSpeechEnd = () => {};

        try {
          await Voice.stop();
        } catch {
          // The recognizer may already have stopped; nothing else to do.
        }
      };

      const finish = async (result: SttResult) => {
        if (settled) return;
        settled = true;
        await cleanup();
        resolve(result);
      };

      const fail = async (error: unknown) => {
        if (settled) return;
        settled = true;
        await cleanup();

        const message =
          typeof error === 'string'
            ? error
            : error instanceof Error
              ? error.message
              : 'Speech recognition failed.';

        reject(new Error(message));
      };

      Voice.onSpeechResults = (event) => {
        const text = event.value?.[0]?.trim() ?? '';
        if (text) {
          void finish({ text, language });
        }
      };

      Voice.onSpeechError = (event) => {
        const errorCode = event.error?.code ?? 'unknown';
        const message = event.error?.message ?? 'Speech recognition failed.';
        void fail(`Speech recognition error (${errorCode}): ${message}`);
      };

      Voice.onSpeechEnd = () => {
        // If the engine ends without producing text, give the caller a useful error.
        if (!settled) {
          void fail('No speech was recognized. Please try again.');
        }
      };

      // Prevent a mic session from hanging forever.
      timeout = setTimeout(() => {
        void fail('Listening timed out. Please try again.');
      }, 30_000);

      try {
        await Voice.start(locale);
      } catch (error) {
        await fail(error);
      }
    });
  }
}
