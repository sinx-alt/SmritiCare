import { StyleSheet, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

import {
  BottomTabInset,
  MaxContentWidth,
  Spacing,
} from '@/constants/theme';

import { games, GameId } from '@/constants/games';
import { useReminders } from '@/context/ReminderContext';

export default function HomeScreen() {
  const { reminders } = useReminders();

  // Temporary prototype value.
  // Later this will come from the patient profile/backend.
  const patientName = 'Kavish';

  // Temporary frontend values.
  // These will later come from backend/session data.
  const activeStreak = 4;
  const completedTasks = 1;
  const totalTasks = 6;
  const accuracy = 86;

  // Temporary recommendation.
  // Later this will come from the personalization system.
  const todayGameId: GameId = 'memory_match';

  const todayGame = games.find(
    game => game.id === todayGameId
  );

  // Sort reminders by their time.
  const sortedReminders = [...reminders].sort((a, b) =>
    a.time.localeCompare(b.time)
  );

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          {/* Header */}
          <ThemedView style={styles.header}>
            <ThemedView style={styles.greetingContainer}>
              <ThemedText style={styles.welcomeText}>
                Welcome
              </ThemedText>

              <ThemedText style={styles.patientName}>
                {patientName}
              </ThemedText>
            </ThemedView>

            <ThemedText style={styles.logoText}>
              SmritiCare
            </ThemedText>
          </ThemedView>

          {/* Today's Activity */}
          <ThemedView style={styles.activityCard}>
            <ThemedText style={styles.activityLabel}>
              TODAY'S ACTIVITY
            </ThemedText>

            <ThemedText style={styles.activityTitle}>
              {todayGame?.title ?? "Today's Activity"}
            </ThemedText>

            <ThemedText style={styles.activityDescription}>
              {todayGame?.description ??
                'An activity selected for you.'}
            </ThemedText>

            <Pressable
              style={({ pressed }) => [
                styles.startButton,
                pressed && styles.startButtonPressed,
              ]}
              onPress={() => router.push('/activity')}
              accessibilityRole="button"
              accessibilityLabel="Start today's activity"
            >
              <ThemedText style={styles.startButtonText}>
                Start today's activity
              </ThemedText>
            </Pressable>
          </ThemedView>

          {/* Quick Metrics */}
          <ThemedView style={styles.metricsRow}>
            <ThemedView style={styles.metricCard}>
              <ThemedText style={styles.metricNumber}>
                {activeStreak}
              </ThemedText>

              <ThemedText style={styles.metricLabel}>
                day streak
              </ThemedText>
            </ThemedView>

            <ThemedView style={styles.metricCard}>
              <ThemedText style={styles.metricNumber}>
                {completedTasks}/{totalTasks}
              </ThemedText>

              <ThemedText style={styles.metricLabel}>
                tasks done
              </ThemedText>
            </ThemedView>

            <ThemedView style={styles.metricCard}>
              <ThemedText style={styles.metricNumber}>
                {accuracy}%
              </ThemedText>

              <ThemedText style={styles.metricLabel}>
                accuracy
              </ThemedText>
            </ThemedView>
          </ThemedView>

          {/* Next For You */}
          <ThemedText style={styles.nextTitle}>
            NEXT FOR YOU
          </ThemedText>

          <ThemedView style={styles.remindersCard}>
            {sortedReminders.length === 0 ? (
              <ThemedText style={styles.noReminders}>
                No upcoming reminders.
              </ThemedText>
            ) : (
              sortedReminders.map(reminder => (
                <ThemedView
                  key={reminder.id}
                  style={styles.reminderRow}
                >
                  <ThemedView style={styles.reminderInfo}>
                    <ThemedText style={styles.reminderTime}>
                      {reminder.time}
                    </ThemedText>

                    <ThemedText
                      style={
                        reminder.completed
                          ? styles.completedReminder
                          : styles.reminderTitle
                      }
                    >
                      {reminder.title}
                    </ThemedText>
                  </ThemedView>
                </ThemedView>
              ))
            )}
          </ThemedView>
        </ScrollView>
      </SafeAreaView>
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
    paddingHorizontal: Spacing.four,
    paddingBottom: BottomTabInset,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
  },

  content: {
    paddingVertical: Spacing.four,
    gap: 16,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    backgroundColor: 'transparent',
    marginBottom: 4,
    transform: [{ translateY: -2 }],
  },

  greetingContainer: {
    backgroundColor: 'transparent',
    gap: 2,
  },

  welcomeText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#6F5962',
  },

  patientName: {
    fontSize: 30,
    fontFamily: 'serif',
    fontWeight: '600',
    color: '#5A1735',
  },

  logoText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#7A2348',
    marginTop: 3,
  },

  activityCard: {
    backgroundColor: '#F9DDE8',
    padding: 22,
    borderRadius: 22,
    gap: 10,
  },

  activityLabel: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    color: '#7A2348',
  },

  activityTitle: {
    fontSize: 30,
    fontWeight: '700',
    color: '#7A2348',
  },

  activityDescription: {
    fontSize: 15,
    lineHeight: 22,
    color: '#6F5962',
  },

  startButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 8,
  },

  startButtonPressed: {
    opacity: 0.7,
  },

  startButtonText: {
    color: '#7A2348',
    fontSize: 15,
    fontWeight: '700',
  },

  metricsRow: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: 'transparent',
  },

  metricCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F0E1E7',
  },

  metricNumber: {
    fontSize: 25,
    fontWeight: '700',
    color: '#7A2348',
  },

  metricLabel: {
    fontSize: 12,
    textAlign: 'center',
    color: '#6F5962',
    marginTop: 5,
  },

  nextTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: '#7A2348',
    marginTop: 6,
  },

  remindersCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#F0E1E7',
  },

  reminderRow: {
    backgroundColor: 'transparent',
    paddingVertical: 12,
  },

  reminderInfo: {
    backgroundColor: 'transparent',
    gap: 3,
  },

  reminderTime: {
    fontSize: 14,
    fontWeight: '700',
    color: '#7A2348',
  },

  reminderTitle: {
    fontSize: 15,
    color: '#3F3036',
  },

  completedReminder: {
    fontSize: 15,
    color: '#8C7A82',
    textDecorationLine: 'line-through',
  },

  noReminders: {
    paddingVertical: 14,
    color: '#8C7A82',
  },
});