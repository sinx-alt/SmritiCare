/**
 * SmritiCare - Memory Assistant Module
 * SQLite database setup (offline-first local storage)
 *
 * Requires: expo-sqlite
 *   npx expo install expo-sqlite
 */

import * as SQLite from 'expo-sqlite';

const DB_NAME = 'smriticare_assistant.db';

let dbInstance: SQLite.SQLiteDatabase | null = null;

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbInstance) {
    dbInstance = await SQLite.openDatabaseAsync(DB_NAME);
    await initSchema(dbInstance);
  }
  return dbInstance;
}

async function initSchema(db: SQLite.SQLiteDatabase) {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS reminders (
      id TEXT PRIMARY KEY NOT NULL,
      patientId TEXT NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      details TEXT,
      time TEXT NOT NULL,
      date TEXT,
      repeat TEXT NOT NULL,
      isCompleted INTEGER NOT NULL DEFAULT 0,
      language TEXT NOT NULL DEFAULT 'en',
      createdAt TEXT NOT NULL,
      synced INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS contacts (
      id TEXT PRIMARY KEY NOT NULL,
      patientId TEXT NOT NULL,
      name TEXT NOT NULL,
      relation TEXT NOT NULL,
      phone TEXT
    );

    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY NOT NULL,
      patientId TEXT NOT NULL,
      content TEXT NOT NULL,
      createdAt TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_reminders_patient_time
      ON reminders (patientId, time);
  `);
}

/** Wipe all local data — useful for dev/testing and "reset app" flows. */
export async function resetDatabase(): Promise<void> {
  const db = await getDb();
  await db.execAsync(`
    DELETE FROM reminders;
    DELETE FROM contacts;
    DELETE FROM notes;
  `);
}
