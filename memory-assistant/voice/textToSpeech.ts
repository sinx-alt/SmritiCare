/**
 * SmritiCare - Memory Assistant Module
 * Text-to-Speech — spoken responses using the device TTS engine.
 *
 * Requires: expo-speech
 *   npx expo install expo-speech
 */

import * as Speech from 'expo-speech';
import { LANGUAGE_MAP, FALLBACK_LANGUAGE } from './languageMap';

/**
 * Returns true when the device has a TTS voice for the requested locale.
 * We check both the exact BCP-47 tag and its base language code.
 */
async function hasVoiceForLanguage(languageTag: string): Promise<boolean> {
  const voices = await Speech.getAvailableVoicesAsync();
  const wanted = languageTag.toLowerCase();
  const base = wanted.split('-')[0];

  return voices.some((voice) => {
    const available = voice.language?.toLowerCase() ?? '';
    return available === wanted || available.split('-')[0] === base;
  });
}

/**
 * Speak using the requested language when the device supports it.
 * Otherwise fall back to Hindi, then English.
 *
 * The fallback is intentional: regional-language TTS availability varies
 * across Android/iOS devices and installed speech engines.
 */
export async function speak(
  text: string,
  language: string = 'en'
): Promise<void> {
  const requested = LANGUAGE_MAP[language] ?? language ?? 'en-IN';

  let selected = requested;

  try {
    if (!(await hasVoiceForLanguage(requested))) {
      selected = (await hasVoiceForLanguage(FALLBACK_LANGUAGE))
        ? FALLBACK_LANGUAGE
        : 'en-IN';
    }
  } catch {
    // If voice enumeration is unavailable, try the requested language.
    selected = requested;
  }

  Speech.speak(text, {
    language: selected,
    pitch: 1.0,
    rate: 0.95,
  });
}

export function stopSpeaking(): void {
  void Speech.stop();
}
