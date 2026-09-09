/**
 * SmritiCare - Memory Assistant Module
 * Shared type definitions
 */

export type ReminderType =
  | 'medicine'
  | 'appointment'
  | 'meal'
  | 'hydration'
  | 'exercise'
  | 'event'
  | 'contact'
  | 'note';

export type RepeatType = 'once' | 'daily' | 'weekly';

export interface Reminder {
  id: string;
  patientId: string;
  type: ReminderType;
  title: string;
  details?: string;
  time: string; // "HH:MM" 24-hour format
  date?: string; // "YYYY-MM-DD", used for 'once' reminders
  repeat: RepeatType;
  isCompleted: boolean;
  language: string; // e.g. "en", "as" (Assamese), "hi"
  createdAt: string; // ISO timestamp
  synced: boolean; // whether pushed to backend yet
}

export interface Contact {
  id: string;
  patientId: string;
  name: string;
  relation: string;
  phone?: string;
}

export interface Note {
  id: string;
  patientId: string;
  content: string;
  createdAt: string;
}

// Input type for creating a reminder (id/createdAt/synced auto-generated)
export type NewReminder = Omit<Reminder, 'id' | 'createdAt' | 'synced' | 'isCompleted'>;

// Voice pipeline types
export type VoiceIntentName =
  | 'create_reminder'
  | 'list_today_reminders'
  | 'complete_reminder'
  | 'ask_contact'
  | 'unknown';

export interface VoiceIntent {
  name: VoiceIntentName;
  slots: Record<string, string>;
  rawText: string;
}
