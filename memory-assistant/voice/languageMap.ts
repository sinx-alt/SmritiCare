/**
 * SmritiCare - Memory Assistant Module
 * Shared language-code map, used by both textToSpeech.ts and speechToText.ts.
 *
 * Keeping this in one file means adding/removing a supported language only
 * requires one edit, instead of updating STT and TTS separately and risking
 * them drifting out of sync.
 */

export const LANGUAGE_MAP: Record<string, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  as: 'as-IN', // Assamese — TTS/STT availability is device-dependent
  mni: 'mni-IN', // Manipuri / Meitei — device-dependent
  nag: 'nag-IN', // Nagamese — device-dependent
  bn: 'bn-IN', // Bengali
};

export const FALLBACK_LANGUAGE = 'hi-IN';
