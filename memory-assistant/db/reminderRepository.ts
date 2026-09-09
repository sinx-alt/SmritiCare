/**
 * SmritiCare - Memory Assistant Module
 * Reminder CRUD operations (offline-first, backed by SQLite)
 */

import { getDb } from './database';
import { Reminder, NewReminder } from '../types/reminder';

function generateId(): string {
  return 'R' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function nowIso(): string {
  return new Date().toISOString();
}

/** Create a new reminder and store it locally. Returns the full reminder. */
export async function createReminder(input: NewReminder): Promise<Reminder> {
  const db = await getDb();
  const reminder: Reminder = {
    ...input,
    id: generateId(),
    isCompleted: false,
    synced: false,
    createdAt: nowIso(),
  };

  await db.runAsync(
    `INSERT INTO reminders
      (id, patientId, type, title, details, time, date, repeat, isCompleted, language, createdAt, synced)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      reminder.id,
      reminder.patientId,
      reminder.type,
      reminder.title,
      reminder.details ?? null,
      reminder.time,
      reminder.date ?? null,
      reminder.repeat,
      reminder.isCompleted ? 1 : 0,
      reminder.language,
      reminder.createdAt,
      reminder.synced ? 1 : 0,
    ]
  );

  return reminder;
}

/** Get every reminder scheduled for "today" — daily repeats + one-off reminders dated today. */
export async function getTodayReminders(patientId: string): Promise<Reminder[]> {
  const db = await getDb();
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  const rows = await db.getAllAsync<any>(
    `SELECT * FROM reminders
     WHERE patientId = ?
       AND (repeat = 'daily' OR date = ? OR (repeat = 'weekly'))
     ORDER BY time ASC`,
    [patientId, today]
  );

  return rows.map(rowToReminder);
}

/** Get all reminders for a patient, regardless of date (for a "manage reminders" screen). */
export async function getAllReminders(patientId: string): Promise<Reminder[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<any>(
    `SELECT * FROM reminders WHERE patientId = ? ORDER BY time ASC`,
    [patientId]
  );
  return rows.map(rowToReminder);
}

/** Get reminders filtered by type, e.g. all "medicine" reminders. */
export async function getRemindersByType(
  patientId: string,
  type: Reminder['type']
): Promise<Reminder[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<any>(
    `SELECT * FROM reminders WHERE patientId = ? AND type = ? ORDER BY time ASC`,
    [patientId, type]
  );
  return rows.map(rowToReminder);
}

/** Mark a reminder as completed (used when patient taps "done" or says so via voice). */
export async function markComplete(reminderId: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(`UPDATE reminders SET isCompleted = 1 WHERE id = ?`, [reminderId]);
}

/** Mark a reminder as not completed (undo). */
export async function markIncomplete(reminderId: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(`UPDATE reminders SET isCompleted = 0 WHERE id = ?`, [reminderId]);
}

/** Update editable fields of a reminder. */
export async function updateReminder(
  reminderId: string,
  updates: Partial<Pick<Reminder, 'title' | 'details' | 'time' | 'date' | 'repeat'>>
): Promise<void> {
  const db = await getDb();
  const fields = Object.keys(updates);
  if (fields.length === 0) return;

  const setClause = fields.map((f) => `${f} = ?`).join(', ');
  const values = fields.map((f) => (updates as any)[f]);

  await db.runAsync(`UPDATE reminders SET ${setClause} WHERE id = ?`, [...values, reminderId]);
}

/** Delete a reminder permanently. */
export async function deleteReminder(reminderId: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(`DELETE FROM reminders WHERE id = ?`, [reminderId]);
}

/** Get reminders that still need to be pushed to the backend (synced = false). */
export async function getUnsyncedReminders(patientId: string): Promise<Reminder[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<any>(
    `SELECT * FROM reminders WHERE patientId = ? AND synced = 0`,
    [patientId]
  );
  return rows.map(rowToReminder);
}

/** Mark a batch of reminders as synced, after a successful backend push. */
export async function markSynced(reminderIds: string[]): Promise<void> {
  if (reminderIds.length === 0) return;
  const db = await getDb();
  const placeholders = reminderIds.map(() => '?').join(', ');
  await db.runAsync(
    `UPDATE reminders SET synced = 1 WHERE id IN (${placeholders})`,
    reminderIds
  );
}

function rowToReminder(row: any): Reminder {
  return {
    id: row.id,
    patientId: row.patientId,
    type: row.type,
    title: row.title,
    details: row.details ?? undefined,
    time: row.time,
    date: row.date ?? undefined,
    repeat: row.repeat,
    isCompleted: !!row.isCompleted,
    language: row.language,
    createdAt: row.createdAt,
    synced: !!row.synced,
  };
}
