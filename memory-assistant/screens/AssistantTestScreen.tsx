/**
 * SmritiCare - Memory Assistant Module
 * Standalone test screen.
 *
 * This is NOT the polished UI (that's Member 1's job) — it's a bare-bones
 * screen so you can develop and demo reminders + voice independently,
 * exactly as the team brief asks: "Test with fixture data, independent
 * of the backend / other modules."
 *
 * Usage: import <AssistantTestScreen /> as a screen in your nav stack
 * while building, then remove it once integration with Member 1 begins.
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { Reminder } from '../types/reminder';
import {
  createReminder,
  getAllReminders,
  markComplete,
  deleteReminder,
} from '../db/reminderRepository';
import { requestNotificationPermission, scheduleReminderNotification } from '../notifications/notificationService';
import { handleTextCommand, handleVoiceCommand } from '../voice/voiceAssistant';
import { NativeVoiceSttProvider } from '../voice/speechToText';

// Fixture patient id for standalone testing — replace with real auth once integrated
const TEST_PATIENT_ID = 'P101';

// Shared across calls — @react-native-voice/voice manages one native session at a time
const sttProvider = new NativeVoiceSttProvider();

const SUPPORTED_LANGUAGES: { code: string; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'Hindi' },
  { code: 'as', label: 'Assamese' },
  { code: 'mni', label: 'Manipuri' },
  { code: 'nag', label: 'Nagamese' },
];

export default function AssistantTestScreen() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('08:00');
  const [voiceInput, setVoiceInput] = useState('');
  const [assistantReply, setAssistantReply] = useState('');
  const [language, setLanguage] = useState('en');
  const [isListening, setIsListening] = useState(false);

  const loadReminders = useCallback(async () => {
    const all = await getAllReminders(TEST_PATIENT_ID);
    setReminders(all);
  }, []);

  useEffect(() => {
    requestNotificationPermission();
    loadReminders();
  }, [loadReminders]);

  async function handleAddReminder() {
    if (!title.trim()) {
      Alert.alert('Enter a title first');
      return;
    }
    const reminder = await createReminder({
      patientId: TEST_PATIENT_ID,
      type: 'medicine',
      title: title.trim(),
      time,
      repeat: 'daily',
      language: 'en',
    });
    await scheduleReminderNotification(reminder);
    setTitle('');
    loadReminders();
  }

  async function handleComplete(id: string) {
    await markComplete(id);
    loadReminders();
  }

  async function handleDelete(id: string) {
    await deleteReminder(id);
    loadReminders();
  }

  async function handleVoiceTest() {
    if (!voiceInput.trim()) return;
    // Bypasses actual microphone/STT — types text straight into the intent
    // pipeline, so you can test intent -> action -> TTS without a mic.
    const result = await handleTextCommand(voiceInput.trim(), TEST_PATIENT_ID, language);
    setAssistantReply(result.spokenResponse);
    setVoiceInput('');
    loadReminders();
  }

  async function handleMicPress() {
    // Requires a native/dev build — @react-native-voice/voice does not run in Expo Go.
    setIsListening(true);
    setAssistantReply('');
    try {
      const result = await handleVoiceCommand(sttProvider, TEST_PATIENT_ID, language);
      setAssistantReply(result.spokenResponse);
      loadReminders();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Voice recognition failed.';
      setAssistantReply(`⚠️ ${message}`);
    } finally {
      setIsListening(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Memory Assistant — Test Screen</Text>

      {/* ---------- Manual reminder creation ---------- */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Add Reminder</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Take BP tablet"
          value={title}
          onChangeText={setTitle}
        />
        <TextInput
          style={styles.input}
          placeholder="HH:MM (24h)"
          value={time}
          onChangeText={setTime}
        />
        <Button title="Add Reminder" onPress={handleAddReminder} />
      </View>

      {/* ---------- Language picker ---------- */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Language</Text>
        <View style={styles.languageRow}>
          {SUPPORTED_LANGUAGES.map((lang) => (
            <TouchableOpacity
              key={lang.code}
              style={[styles.languageChip, language === lang.code && styles.languageChipActive]}
              onPress={() => setLanguage(lang.code)}
            >
              <Text style={language === lang.code ? styles.languageChipTextActive : styles.languageChipText}>
                {lang.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* ---------- Voice / text command tester ---------- */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Voice Command Tester (typed)</Text>
        <TextInput
          style={styles.input}
          placeholder='Try: "remind me to drink water at 3pm"'
          value={voiceInput}
          onChangeText={setVoiceInput}
        />
        <Button title="Send to Assistant" onPress={handleVoiceTest} />

        <View style={{ height: 12 }} />

        <Text style={styles.sectionTitle}>Real Microphone (requires dev build)</Text>
        <Button
          title={isListening ? 'Listening…' : '🎤 Tap to Speak'}
          onPress={handleMicPress}
          disabled={isListening}
        />

        {assistantReply ? <Text style={styles.reply}>🗣️ {assistantReply}</Text> : null}
      </View>

      {/* ---------- Reminder list ---------- */}
      <Text style={styles.sectionTitle}>All Reminders</Text>
      <FlatList
        data={reminders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.reminderRow}>
            <View style={{ flex: 1 }}>
              <Text style={item.isCompleted ? styles.completedText : styles.reminderText}>
                {item.title} — {item.time} ({item.type})
              </Text>
            </View>
            {!item.isCompleted && (
              <TouchableOpacity onPress={() => handleComplete(item.id)}>
                <Text style={styles.actionText}>✓ Done</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={() => handleDelete(item.id)}>
              <Text style={styles.actionText}>🗑</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={{ color: '#888' }}>No reminders yet.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 48 },
  header: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  reply: { marginTop: 8, fontStyle: 'italic', color: '#4a4a8a' },
  languageRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  languageChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    marginRight: 8,
    marginBottom: 8,
  },
  languageChipActive: { backgroundColor: '#4a4a8a', borderColor: '#4a4a8a' },
  languageChipText: { color: '#333', fontSize: 13 },
  languageChipTextActive: { color: '#fff', fontSize: 13 },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  reminderText: { fontSize: 15 },
  completedText: { fontSize: 15, textDecorationLine: 'line-through', color: '#999' },
  actionText: { marginLeft: 12, fontSize: 14, color: '#4a4a8a' },
});
