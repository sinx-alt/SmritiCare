import { useState } from 'react';
import {
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  View,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useReminders } from '@/context/ReminderContext';

import { MaxContentWidth, Spacing } from '@/constants/theme';

type ReminderCategory =
  | 'Meal'
  | 'Hydration'
  | 'Exercise'
  | 'Family';

const categories: ReminderCategory[] = [
  'Meal',
  'Hydration',
  'Exercise',
  'Family',
];

export default function RemindersScreen() {
  const {
    reminders,
    addReminder,
    toggleReminder,
    deleteReminder,
  } = useReminders();

  const [title, setTitle] = useState('');
  const [time, setTime] = useState('');

  const [category, setCategory] =
    useState<ReminderCategory>('Meal');

  const [selectedCategory, setSelectedCategory] =
    useState<ReminderCategory>('Meal');

  const [voiceOpen, setVoiceOpen] = useState(false);

  function handleAddReminder() {
    if (!title.trim()) {
      return;
    }

    addReminder(
      title.trim(),
      time.trim() || 'No time set',
      category
    );

    setTitle('');
    setTime('');
  }

  const completedCount = reminders.filter(
    reminder => reminder.completed
  ).length;

  const filteredReminders = reminders.filter(
    reminder => reminder.category === selectedCategory
  );

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* HEADER */}
          <ThemedView style={styles.header}>
            <ThemedText style={styles.eyebrow}>
              TODAY'S REMINDERS
            </ThemedText>

            <ThemedText style={styles.heading}>
              {completedCount} of {reminders.length} done
              {' • '}
              tap the mic anytime
            </ThemedText>
          </ThemedView>

          {/* VOICE ASSISTANT */}
          <Pressable
            onPress={() => setVoiceOpen(true)}
            style={({ pressed }) => [
              styles.nextCard,
              pressed && styles.nextCardPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Open Voice Assistant"
          >
            <View style={styles.nextIconBox}>
              <View style={styles.micIcon}>
                <View style={styles.micHead} />
                <View style={styles.micStem} />
                <View style={styles.micBase} />
              </View>
            </View>

            <View style={styles.nextTextContainer}>
              <ThemedText style={styles.nextLabel}>
                Voice Assistant
              </ThemedText>

              <ThemedText style={styles.nextTitle}>
                Tap the mic to talk
              </ThemedText>

              <ThemedText style={styles.nextDetails}>
                Ask SmritiCare for help
              </ThemedText>
            </View>
          </Pressable>

          {/* CATEGORY FILTERS */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryRow}
          >
            {categories.map(item => {
              const isSelected =
                selectedCategory === item;

              return (
                <Pressable
                  key={item}
                  style={[
                    styles.category,
                    isSelected && styles.activeCategory,
                  ]}
                  onPress={() => setSelectedCategory(item)}
                  accessibilityRole="button"
                  accessibilityState={{
                    selected: isSelected,
                  }}
                  accessibilityLabel={`Show ${item} reminders`}
                >
                  <ThemedText
                    style={[
                      styles.categoryText,
                      isSelected &&
                        styles.activeCategoryText,
                    ]}
                  >
                    {item}
                  </ThemedText>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* REMINDER LIST */}
          <ThemedView style={styles.listCard}>
            {reminders.length === 0 ? (
              <ThemedText style={styles.emptyText}>
                No reminders added yet.
              </ThemedText>
            ) : filteredReminders.length === 0 ? (
              <ThemedText style={styles.emptyText}>
                No {selectedCategory.toLowerCase()} reminders yet.
              </ThemedText>
            ) : (
              filteredReminders.map((reminder, index) => (
                <View
                  key={reminder.id}
                  style={[
                    styles.reminder,
                    index !== filteredReminders.length - 1 &&
                      styles.reminderBorder,
                  ]}
                >
                  {/* REMINDER ICON */}
                  <View style={styles.reminderIconBox}>
                    <View style={styles.smallBell}>
                      <View style={styles.bellBody} />
                      <View style={styles.bellClapper} />
                    </View>
                  </View>

                  {/* REMINDER INFO */}
                  <View style={styles.reminderInfo}>
                    <ThemedText
                      style={[
                        styles.reminderTitle,
                        reminder.completed &&
                          styles.completedText,
                      ]}
                    >
                      {reminder.title}
                    </ThemedText>

                    <ThemedText style={styles.reminderTime}>
                      {reminder.time}
                    </ThemedText>
                  </View>

                  {/* COMPLETE */}
                  <Pressable
                    style={[
                      styles.checkButton,
                      reminder.completed &&
                        styles.checkedButton,
                    ]}
                    onPress={() =>
                      toggleReminder(reminder.id)
                    }
                    accessibilityRole="button"
                    accessibilityLabel={
                      reminder.completed
                        ? `Mark ${reminder.title} as incomplete`
                        : `Mark ${reminder.title} as complete`
                    }
                    accessibilityState={{
                      checked: reminder.completed,
                    }}
                  >
                    <ThemedText
                      style={[
                        styles.checkText,
                        reminder.completed &&
                          styles.checkedText,
                      ]}
                    >
                      {reminder.completed ? '✓' : ''}
                    </ThemedText>
                  </Pressable>

                  {/* DELETE */}
                  <Pressable
                    style={styles.deleteButton}
                    onPress={() =>
                      deleteReminder(reminder.id)
                    }
                    accessibilityRole="button"
                    accessibilityLabel={`Delete ${reminder.title}`}
                  >
                    <ThemedText style={styles.deleteText}>
                      ×
                    </ThemedText>
                  </Pressable>
                </View>
              ))
            )}
          </ThemedView>

          {/* ADD REMINDER */}
          <ThemedView style={styles.addCard}>
            <ThemedText style={styles.addTitle}>
              Add Reminder
            </ThemedText>

            <TextInput
              style={styles.input}
              placeholder="Reminder name"
              placeholderTextColor="#8C7A82"
              value={title}
              onChangeText={setTitle}
              accessibilityLabel="Reminder name"
            />

            <TextInput
              style={styles.input}
              placeholder="Time (e.g. 8:00 AM)"
              placeholderTextColor="#8C7A82"
              value={time}
              onChangeText={setTime}
              accessibilityLabel="Reminder time"
            />

            <ThemedText style={styles.categoryLabel}>
              Category
            </ThemedText>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.addCategoryRow}
            >
              {categories.map(item => {
                const isSelected = category === item;

                return (
                  <Pressable
                    key={item}
                    style={[
                      styles.addCategory,
                      isSelected &&
                        styles.addCategoryActive,
                    ]}
                    onPress={() => setCategory(item)}
                    accessibilityRole="button"
                    accessibilityState={{
                      selected: isSelected,
                    }}
                    accessibilityLabel={`Set reminder category to ${item}`}
                  >
                    <ThemedText
                      style={[
                        styles.addCategoryText,
                        isSelected &&
                          styles.addCategoryActiveText,
                      ]}
                    >
                      {item}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </ScrollView>

            <Pressable
              style={({ pressed }) => [
                styles.addButton,
                pressed && styles.addButtonPressed,
              ]}
              onPress={handleAddReminder}
              accessibilityRole="button"
              accessibilityLabel="Add reminder"
            >
              <ThemedText style={styles.addButtonText}>
                ADD REMINDER
              </ThemedText>
            </Pressable>
          </ThemedView>
        </ScrollView>
      </SafeAreaView>

      {/* VOICE ASSISTANT POPUP */}
      <Modal
        visible={voiceOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setVoiceOpen(false)}
      >
        <Pressable
          style={styles.voiceOverlay}
          onPress={() => setVoiceOpen(false)}
        >
          <Pressable
            style={styles.voicePopup}
            onPress={event => event.stopPropagation()}
          >
            <Pressable
              style={styles.voiceCloseButton}
              onPress={() => setVoiceOpen(false)}
              accessibilityRole="button"
              accessibilityLabel="Close Voice Assistant"
            >
              <ThemedText style={styles.voiceCloseText}>
                ×
              </ThemedText>
            </Pressable>

            <ThemedText style={styles.voiceTitle}>
              SmritiCare
            </ThemedText>

            <ThemedText style={styles.voiceSubtitle}>
              Voice Assistant
            </ThemedText>

            <View style={styles.voiceMicCircle}>
              <View style={styles.largeMicIcon}>
                <View style={styles.largeMicHead} />
                <View style={styles.largeMicStem} />
                <View style={styles.largeMicBase} />
              </View>
            </View>

            <ThemedText style={styles.voiceHint}>
              Voice interaction will connect here.
            </ThemedText>
          </Pressable>
        </Pressable>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  safeArea: {
    flex: 1,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
  },

  content: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.four,
    paddingBottom: Spacing.five,
    gap: 16,
  },

  header: {
    backgroundColor: 'transparent',
    gap: 6,
  },

  eyebrow: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 1,
    color: '#7A2348',
  },

  heading: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
    color: '#5A1735',
  },

  /* VOICE CARD */

  nextCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 22,
    backgroundColor: '#F9DDE8',
    gap: 16,
  },

  nextCardPressed: {
    opacity: 0.8,
  },

  nextIconBox: {
    width: 68,
    height: 68,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },

  micIcon: {
    width: 24,
    height: 30,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },

  micHead: {
    width: 14,
    height: 19,
    borderRadius: 7,
    backgroundColor: '#7A2348',
  },

  micStem: {
    width: 3,
    height: 7,
    backgroundColor: '#7A2348',
  },

  micBase: {
    width: 16,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#7A2348',
  },

  nextTextContainer: {
    flex: 1,
    gap: 3,
  },

  nextLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#7A2348',
  },

  nextTitle: {
    fontSize: 21,
    lineHeight: 27,
    fontWeight: '700',
    color: '#5A1735',
  },

  nextDetails: {
    fontSize: 15,
    color: '#6F5962',
    marginTop: 3,
  },

  /* FILTERS */

  categoryRow: {
    gap: 10,
    paddingVertical: 2,
  },

  category: {
    minHeight: 42,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0E1E7',
  },

  activeCategory: {
    backgroundColor: '#F9DDE8',
    borderColor: '#F9DDE8',
  },

  categoryText: {
    color: '#6F5962',
  },

  activeCategoryText: {
    fontWeight: '700',
    color: '#7A2348',
  },

  /* REMINDER LIST */

  listCard: {
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0E1E7',
    overflow: 'hidden',
  },

  reminder: {
    minHeight: 82,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },

  reminderBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0E1E7',
  },

  reminderIconBox: {
    width: 52,
    height: 52,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9DDE8',
  },

  smallBell: {
    width: 22,
    height: 24,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },

  bellBody: {
    width: 18,
    height: 17,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    backgroundColor: '#7A2348',
  },

  bellClapper: {
    width: 6,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#7A2348',
    marginTop: 2,
  },

  reminderInfo: {
    flex: 1,
    justifyContent: 'center',
    gap: 4,
    paddingRight: 4,
  },

  reminderTitle: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '700',
    color: '#3F3036',
  },

  reminderTime: {
    fontSize: 15,
    lineHeight: 20,
    color: '#7A2348',
  },

  completedText: {
    opacity: 0.5,
    textDecorationLine: 'line-through',
  },

  /* COMPLETE */

  checkButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
    borderColor: '#F0E1E7',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },

  checkedButton: {
    backgroundColor: '#7A2348',
    borderColor: '#7A2348',
  },

  checkText: {
    fontSize: 19,
    lineHeight: 22,
    color: '#7A2348',
  },

  checkedText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  /* DELETE */

  deleteButton: {
    width: 30,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },

  deleteText: {
    fontSize: 23,
    lineHeight: 26,
    color: '#8C7A82',
  },

  emptyText: {
    paddingVertical: 24,
    textAlign: 'center',
    color: '#8C7A82',
  },

  /* ADD REMINDER */

  addCard: {
    padding: 18,
    borderRadius: 18,
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0E1E7',
  },

  addTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#5A1735',
    marginBottom: 2,
  },

  categoryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6F5962',
    marginTop: 2,
  },

  addCategoryRow: {
    gap: 8,
    paddingVertical: 2,
  },

  addCategory: {
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F0E1E7',
    backgroundColor: '#FFFFFF',
  },

  addCategoryActive: {
    backgroundColor: '#F9DDE8',
    borderColor: '#F9DDE8',
  },

  addCategoryText: {
    fontSize: 14,
    color: '#6F5962',
  },

  addCategoryActiveText: {
    fontWeight: '700',
    color: '#7A2348',
  },

  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: '#F0E1E7',
    borderRadius: 14,
    paddingHorizontal: 15,
    paddingVertical: 11,
    fontSize: 16,
    color: '#3F3036',
    backgroundColor: '#FFFFFF',
  },

  addButton: {
    minHeight: 48,
    paddingHorizontal: 18,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7A2348',
  },

  addButtonPressed: {
    opacity: 0.7,
  },

  addButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  /* VOICE POPUP */

  voiceOverlay: {
    flex: 1,
    backgroundColor: 'rgba(63, 48, 54, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },

  voicePopup: {
    width: '100%',
    maxWidth: 360,
    minHeight: 360,
    borderRadius: 28,
    padding: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0E1E7',
  },

  voiceCloseButton: {
    position: 'absolute',
    top: 16,
    right: 18,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9DDE8',
  },

  voiceCloseText: {
    fontSize: 25,
    lineHeight: 27,
    color: '#7A2348',
  },

  voiceTitle: {
    fontSize: 25,
    fontWeight: '700',
    color: '#5A1735',
    marginBottom: 4,
  },

  voiceSubtitle: {
    fontSize: 17,
    color: '#7A2348',
    fontWeight: '600',
  },

  voiceMicCircle: {
    width: 132,
    height: 132,
    borderRadius: 66,
    marginVertical: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9DDE8',
  },

  largeMicIcon: {
    width: 42,
    height: 58,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },

  largeMicHead: {
    width: 28,
    height: 38,
    borderRadius: 14,
    backgroundColor: '#7A2348',
  },

  largeMicStem: {
    width: 5,
    height: 13,
    backgroundColor: '#7A2348',
  },

  largeMicBase: {
    width: 34,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#7A2348',
  },

  voiceHint: {
    fontSize: 15,
    textAlign: 'center',
    color: '#6F5962',
    lineHeight: 22,
  },
});