/**
 * SmritiCare - Memory Assistant Module
 * CRUD for "Important Contacts" and "Notes" features
 */

import { getDb } from './database';
import { Contact, Note } from '../types/reminder';

function generateId(prefix: string): string {
  return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// ---------- Contacts ----------

export async function addContact(input: Omit<Contact, 'id'>): Promise<Contact> {
  const db = await getDb();
  const contact: Contact = { ...input, id: generateId('C') };
  await db.runAsync(
    `INSERT INTO contacts (id, patientId, name, relation, phone) VALUES (?, ?, ?, ?, ?)`,
    [contact.id, contact.patientId, contact.name, contact.relation, contact.phone ?? null]
  );
  return contact;
}

export async function getContacts(patientId: string): Promise<Contact[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<any>(`SELECT * FROM contacts WHERE patientId = ?`, [
    patientId,
  ]);
  return rows.map((r) => ({ ...r, phone: r.phone ?? undefined }));
}

/** Find a contact by fuzzy name match — used by the voice assistant, e.g. "call my daughter". */
export async function findContactByName(
  patientId: string,
  nameOrRelation: string
): Promise<Contact | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<any>(
    `SELECT * FROM contacts
     WHERE patientId = ?
       AND (LOWER(name) LIKE ? OR LOWER(relation) LIKE ?)
     LIMIT 1`,
    [patientId, `%${nameOrRelation.toLowerCase()}%`, `%${nameOrRelation.toLowerCase()}%`]
  );
  if (!row) return null;
  return { ...row, phone: row.phone ?? undefined };
}

export async function deleteContact(contactId: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(`DELETE FROM contacts WHERE id = ?`, [contactId]);
}

// ---------- Notes ----------

export async function addNote(patientId: string, content: string): Promise<Note> {
  const db = await getDb();
  const note: Note = {
    id: generateId('N'),
    patientId,
    content,
    createdAt: new Date().toISOString(),
  };
  await db.runAsync(`INSERT INTO notes (id, patientId, content, createdAt) VALUES (?, ?, ?, ?)`, [
    note.id,
    note.patientId,
    note.content,
    note.createdAt,
  ]);
  return note;
}

export async function getNotes(patientId: string): Promise<Note[]> {
  const db = await getDb();
  return db.getAllAsync<Note>(`SELECT * FROM notes WHERE patientId = ? ORDER BY createdAt DESC`, [
    patientId,
  ]);
}

export async function deleteNote(noteId: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(`DELETE FROM notes WHERE id = ?`, [noteId]);
}
