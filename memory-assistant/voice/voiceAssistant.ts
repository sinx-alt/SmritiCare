/**
 * SmritiCare - Memory Assistant Module
 * Voice Assistant orchestrator
 *
 * Pipeline: Speech -> Text (STT) -> Intent -> Action (reminders DB) -> Text -> Speech (TTS)
 */

import { SttProvider } from './speechToText';
import { parseIntent } from './intentParser';
import { speak } from './textToSpeech';
import {
  createReminder,
  getTodayReminders,
  markComplete,
  getAllReminders,
} from '../db/reminderRepository';
import { findContactByName } from '../db/contactNoteRepository';
import { scheduleReminderNotification } from '../notifications/notificationService';
import { Reminder, VoiceIntent } from '../types/reminder';

export interface VoiceAssistantResult {
  intent: VoiceIntent;
  spokenResponse: string;
  createdReminder?: Reminder;
}

/**
 * Run one full voice interaction: listen, understand, act, and speak back.
 * Call this from a mic button's onPress handler.
 */
export async function handleVoiceCommand(
  sttProvider: SttProvider,
  patientId: string,
  language: string = 'en'
): Promise<VoiceAssistantResult> {
  const sttResult = await sttProvider.listenOnce(language);
  return handleTextCommand(sttResult.text, patientId, language);
}

/**
 * Same pipeline but starting from already-known text — useful for testing
 * without a microphone, or for a "type instead of speak" accessibility fallback.
 */
export async function handleTextCommand(
  rawText: string,
  patientId: string,
  language: string = 'en'
): Promise<VoiceAssistantResult> {
  const intent = parseIntent(rawText);
  const { spokenResponse, createdReminder } = await executeIntent(
    intent,
    patientId,
    language
  );

  // TTS availability/fallback is handled inside speak().
  void speak(spokenResponse, language);

  return { intent, spokenResponse, createdReminder };
}

interface IntentExecutionResult {
  spokenResponse: string;
  createdReminder?: Reminder;
}

async function executeIntent(
  intent: VoiceIntent,
  patientId: string,
  language: string
): Promise<IntentExecutionResult> {
  switch (intent.name) {
    case 'create_reminder': {
      const time = intent.slots.time || '09:00';
      const type = (intent.slots.type as Reminder['type']) || 'note';
      const title = intent.slots.title || 'Reminder';

      const reminder = await createReminder({
        patientId,
        type,
        title,
        time,
        repeat: 'daily',
        language,
      });
      await scheduleReminderNotification(reminder);

      return {
        spokenResponse: `Okay, I'll remind you to ${title.toLowerCase()} at ${formatSpokenTime(time)}.`,
        createdReminder: reminder,
      };
    }

    case 'list_today_reminders': {
      const reminders = await getTodayReminders(patientId);
      if (reminders.length === 0) {
        return { spokenResponse: "You don't have any reminders for today." };
      }
      const pending = reminders.filter((r) => !r.isCompleted);
      if (pending.length === 0) {
        return { spokenResponse: "You've completed all your reminders for today. Well done!" };
      }
      const list = pending
        .map((r) => `${r.title} at ${formatSpokenTime(r.time)}`)
        .join(', then ');
      return { spokenResponse: `Today you have: ${list}.` };
    }

    case 'complete_reminder': {
      const searchTitle = intent.slots.title?.trim();
      const all = await getAllReminders(patientId);
      const match = all.find(
        (r) =>
          !r.isCompleted &&
          searchTitle &&
          r.title.toLowerCase().includes(searchTitle.toLowerCase())
      );

      if (!match) {
        return { spokenResponse: "I couldn't find that reminder. Could you say it again?" };
      }

      await markComplete(match.id);
      return { spokenResponse: `Marked "${match.title}" as done. Well done!` };
    }

    case 'ask_contact': {
      const person = intent.slots.person?.trim();
      if (!person) {
        return { spokenResponse: 'Who would you like to contact?' };
      }
      const contact = await findContactByName(patientId, person);
      if (!contact) {
        return { spokenResponse: `I couldn't find a contact matching "${person}".` };
      }
      return {
        spokenResponse: contact.phone
          ? `${contact.name}'s number is ${contact.phone}.`
          : `I found ${contact.name}, but there's no phone number saved.`,
      };
    }

    case 'unknown':
    default:
      return {
        spokenResponse:
          "Sorry, I didn't understand that. You can say things like 'remind me to take medicine at 8am' or 'what do I have today'.",
      };
  }
}

function formatSpokenTime(time24: string): string {
  const [h, m] = time24.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return m === 0
    ? `${hour12} ${period}`
    : `${hour12}:${String(m).padStart(2, '0')} ${period}`;
}
