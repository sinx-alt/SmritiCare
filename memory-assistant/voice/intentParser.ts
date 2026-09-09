/**
 * SmritiCare - Memory Assistant Module
 * Text -> Intent parsing
 *
 * MVP approach: lightweight keyword/regex matching.
 * Day 5 polish: add a few natural phrasings without introducing a heavy NLP dependency.
 */

import { ReminderType, VoiceIntent } from '../types/reminder';

const REMINDER_TYPE_KEYWORDS: Record<ReminderType, string[]> = {
  medicine: ['medicine', 'tablet', 'pill', 'dose', 'medication', 'meds'],
  appointment: ['appointment', 'doctor', 'checkup', 'clinic', 'visit'],
  meal: ['meal', 'lunch', 'dinner', 'breakfast', 'eat', 'food'],
  hydration: ['water', 'drink', 'hydrate'],
  exercise: ['exercise', 'walk', 'yoga', 'workout', 'stretch'],
  event: ['birthday', 'anniversary', 'event', 'festival', 'family'],
  contact: ['call', 'phone', 'contact'],
  note: ['note', 'remember that', 'write down'],
};

const TIME_REGEX = /\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/i;

/** Parse a raw recognized-speech string into a structured VoiceIntent. */
export function parseIntent(rawText: string): VoiceIntent {
  const text = rawText.toLowerCase().trim();

  if (!text) {
    return { name: 'unknown', slots: {}, rawText };
  }

  // "What do I have today?", "show today's reminders", etc.
  if (
    matchesAny(text, [
      'what do i have',
      'what do i need to do',
      'what is on today',
      "what's on today",
      'what are my reminders',
      'show my reminders',
      'show today',
      'show reminders',
      'today reminders',
      'reminders today',
      'my reminders today',
    ])
  ) {
    return { name: 'list_today_reminders', slots: {}, rawText };
  }

  // Completion phrasing.
  if (
    matchesAny(text, [
      'done',
      'completed',
      'finished',
      'i did it',
      'i have done',
      'mark as done',
      'mark it done',
      'mark completed',
      'took my',
    ])
  ) {
    return {
      name: 'complete_reminder',
      slots: {
        title: extractSubjectAfterKeywords(text, [
          'mark as done',
          'mark it done',
          'mark completed',
          'completed',
          'finished',
          'took my',
          'done',
        ]),
      },
      rawText,
    };
  }

  // Contact phrasing.
  if (
    matchesAny(text, [
      'call',
      'phone number',
      'phone of',
      'number of',
      'contact',
      'how do i reach',
    ])
  ) {
    return {
      name: 'ask_contact',
      slots: {
        person: extractSubjectAfterKeywords(text, [
          'phone number of',
          'phone of',
          'number of',
          'how do i reach',
          'call',
          'contact',
        ]),
      },
      rawText,
    };
  }

  // Reminder creation phrasing.
  if (
    matchesAny(text, [
      'remind me',
      'set a reminder',
      'set reminder',
      'add a reminder',
      'add reminder',
      'remember to',
      "don't let me forget",
      'please remind me',
      'can you remind me',
      'i need a reminder',
    ])
  ) {
    const type = detectReminderType(text);
    const time = extractTime(text);
    const title = extractReminderTitle(text);

    return {
      name: 'create_reminder',
      slots: {
        type,
        title,
        time: time ?? '',
      },
      rawText,
    };
  }

  return { name: 'unknown', slots: {}, rawText };
}

function matchesAny(text: string, keywords: string[]): boolean {
  return keywords.some((k) => text.includes(k));
}

function detectReminderType(text: string): ReminderType {
  for (const [type, keywords] of Object.entries(REMINDER_TYPE_KEYWORDS)) {
    if (keywords.some((k) => text.includes(k))) {
      return type as ReminderType;
    }
  }
  return 'note';
}

function extractTime(text: string): string | null {
  const match = text.match(TIME_REGEX);
  if (!match) return null;

  let hour = parseInt(match[1], 10);
  const minute = match[2] ? parseInt(match[2], 10) : 0;
  const meridiem = match[3]?.toLowerCase();

  if (meridiem === 'pm' && hour < 12) hour += 12;
  if (meridiem === 'am' && hour === 12) hour = 0;

  if (hour > 23 || minute > 59) return null;

  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

/** Pull a short title from a reminder command. */
function extractReminderTitle(text: string): string {
  let cleaned = text
    .replace(/please remind me( to)?/gi, '')
    .replace(/can you remind me( to)?/gi, '')
    .replace(/i need a reminder( to)?/gi, '')
    .replace(/remind me( to)?/gi, '')
    .replace(/set a reminder( to)?/gi, '')
    .replace(/set reminder( to)?/gi, '')
    .replace(/add a reminder( to)?/gi, '')
    .replace(/add reminder( to)?/gi, '')
    .replace(/remember to/gi, '')
    .replace(/don't let me forget( to)?/gi, '')
    .replace(TIME_REGEX, '')
    .replace(/\bat\b/gi, '')
    .trim();

  if (cleaned.length === 0) return 'Reminder';
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

const FILLER_WORDS = ['my', 'the', 'a', 'an', 'your', 'his', 'her', 'our', 'to', 'of'];

function extractSubjectAfterKeywords(text: string, keywords: string[]): string {
  for (const k of keywords) {
    const idx = text.indexOf(k);
    if (idx !== -1) {
      let subject = text.slice(idx + k.length).trim();

      let stripped = true;
      while (stripped) {
        stripped = false;
        for (const filler of FILLER_WORDS) {
          if (subject === filler || subject.startsWith(filler + ' ')) {
            subject = subject.slice(filler.length).trim();
            stripped = true;
            break;
          }
        }
      }

      return subject;
    }
  }
  return '';
}
