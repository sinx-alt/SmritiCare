/**
 * SmritiCare - Memory Assistant Module
 * Local notifications — fire reminders even with no internet connection.
 *
 * Requires: expo-notifications
 *   npx expo install expo-notifications
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Reminder } from '../types/reminder';

// Foreground notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/** Ask the user for notification permission. Call once on app start. */
export async function requestNotificationPermission(): Promise<boolean> {
  const existing = (await Notifications.getPermissionsAsync()) as { granted?: boolean; status?: string };
  let granted = existing.granted ?? existing.status === 'granted';

  if (!granted) {
    const requested = (await Notifications.requestPermissionsAsync()) as {
      granted?: boolean;
      status?: string;
    };
    granted = requested.granted ?? requested.status === 'granted';
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('reminders', {
      name: 'SmritiCare Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
    });
  }

  return granted;
}

/**
 * Schedule a local notification for a reminder.
 * Returns the OS notification id — store this alongside the reminder if you
 * want to be able to cancel it later (e.g. on delete/edit).
 */
export async function scheduleReminderNotification(reminder: Reminder): Promise<string> {
  const [hour, minute] = reminder.time.split(':').map(Number);

  const trigger: Notifications.NotificationTriggerInput =
    reminder.repeat === 'daily'
      ? { hour, minute, repeats: true } // fires every day at this time
      : reminder.repeat === 'once' && reminder.date
      ? { date: new Date(`${reminder.date}T${reminder.time}:00`) }
      : { hour, minute, repeats: true }; // 'weekly' fallback: treat as daily reminder for MVP

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: reminderTypeLabel(reminder.type),
      body: reminder.title,
      sound: 'default',
      data: { reminderId: reminder.id, patientId: reminder.patientId },
    },
    trigger,
  });

  return notificationId;
}

export async function cancelNotification(notificationId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}

export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

function reminderTypeLabel(type: Reminder['type']): string {
  const labels: Record<Reminder['type'], string> = {
    medicine: '💊 Medicine Time',
    appointment: '🏥 Appointment',
    meal: '🍽️ Meal Time',
    hydration: '💧 Drink Water',
    exercise: '🏃 Exercise Time',
    event: '🎉 Family Event',
    contact: '📞 Contact Reminder',
    note: '📝 Note',
  };
  return labels[type] ?? 'Reminder';
}
