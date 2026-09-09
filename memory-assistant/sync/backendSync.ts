/**
 * SmritiCare - Memory Assistant Module
 * Backend sync — optional integration with Member 2's API.
 *
 * Day 5 status:
 * - Push sync is implemented for POST /api/reminders/bulk.
 * - Pull sync remains intentionally stubbed until Member 2 provides the
 *   caregiver-created-reminders GET endpoint and its response contract.
 * - Offline-first behavior is preserved: SQLite remains the local source
 *   of truth and failed network sync never blocks reminder use.
 */

import { getUnsyncedReminders, markSynced } from '../db/reminderRepository';

export interface BackendSyncConfig {
  baseUrl: string;
  getAuthToken: () => Promise<string | null>;
}

/**
 * Push local reminders that have not yet been synced.
 * Safe to call while offline; failures are returned to the caller and the
 * reminders remain unsynced so a later retry can send them.
 */
export async function syncPendingReminders(
  patientId: string,
  config: BackendSyncConfig
): Promise<{ synced: number; failed: number }> {
  const pending = await getUnsyncedReminders(patientId);

  if (pending.length === 0) {
    return { synced: 0, failed: 0 };
  }

  const token = await config.getAuthToken();

  if (!token) {
    return { synced: 0, failed: pending.length };
  }

  try {
    const response = await fetch(`${config.baseUrl}/api/reminders/bulk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ reminders: pending }),
    });

    if (!response.ok) {
      return { synced: 0, failed: pending.length };
    }

    await markSynced(pending.map((r) => r.id));
    return { synced: pending.length, failed: 0 };
  } catch {
    // Offline / unreachable backend: do not touch local data.
    return { synced: 0, failed: pending.length };
  }
}

/**
 * Pull caregiver-created reminders.
 *
 * NOT IMPLEMENTED YET:
 * Member 2 still needs to provide the GET endpoint and response shape.
 * Do not invent an endpoint here because this function must match the
 * backend contract before it can safely write remote data into SQLite.
 */
// sync/backendSync.ts — replace the stub body
export async function pullCaregiverReminders(patientId: string, config: BackendSyncConfig) {
  const token = await config.getAuthToken();
  if (!token) return;
  const res = await fetch(`${config.baseUrl}/api/reminders/${patientId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return;
  const { reminders } = await res.json();
  // upsert into SQLite via your existing reminderRepository, mark synced: true
}