import {
  StyleSheet,
  Pressable,
  ScrollView,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

import { MaxContentWidth, Spacing } from '@/constants/theme';
import { games, GameId } from '@/constants/games';

type SessionOut = {
  sessionId: string;
  patientId: string;
  gameId: GameId;
  score: number;
  accuracy: number;
  reactionTime: number | null;
  mistakes: number;
  attempts: number;
  difficulty: number;
  duration: number;
  timestamp: string;
};

// Temporary prototype data.
// This follows the supplied SessionOut backend structure.
// Replace with API data when the backend is connected.
const mockSessions: SessionOut[] = [
  {
    sessionId: '1',
    patientId: 'patient-1',
    gameId: 'memory_match',
    score: 86,
    accuracy: 0.86,
    reactionTime: 2.4,
    mistakes: 2,
    attempts: 14,
    difficulty: 1,
    duration: 300,
    timestamp: '2026-09-07T10:00:00',
  },
  {
    sessionId: '2',
    patientId: 'patient-1',
    gameId: 'pattern_recall',
    score: 78,
    accuracy: 0.78,
    reactionTime: 2.8,
    mistakes: 3,
    attempts: 14,
    difficulty: 2,
    duration: 320,
    timestamp: '2026-09-06T11:00:00',
  },
  {
    sessionId: '3',
    patientId: 'patient-1',
    gameId: 'number_sequence',
    score: 82,
    accuracy: 0.82,
    reactionTime: 2.6,
    mistakes: 2,
    attempts: 12,
    difficulty: 2,
    duration: 290,
    timestamp: '2026-09-06T15:00:00',
  },
];

const averageAccuracy =
  mockSessions.length > 0
    ? Math.round(
        (mockSessions.reduce(
          (total, session) => total + session.accuracy,
          0,
        ) /
          mockSessions.length) *
          100,
      )
    : 0;

const averageScore =
  mockSessions.length > 0
    ? Math.round(
        mockSessions.reduce(
          (total, session) => total + session.score,
          0,
        ) / mockSessions.length,
      )
    : 0;

function formatActivityDate(timestamp: string) {
  const date = new Date(timestamp);
  const today = new Date();

  const isToday =
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate();

  if (isToday) {
    return 'Today';
  }

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const isYesterday =
    date.getFullYear() === yesterday.getFullYear() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getDate() === yesterday.getDate();

  if (isYesterday) {
    return 'Yesterday';
  }

  return date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
  });
}

export default function CareScreen() {
  const recentSessions = [...mockSessions]
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() -
        new Date(a.timestamp).getTime(),
    )
    .slice(0, 3);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          {/* HEADER */}
          <ThemedView style={styles.header}>
            <View style={styles.headerTop}>
              <ThemedText style={styles.title}>
                Care
              </ThemedText>

              <Pressable
                style={({ pressed }) => [
                  styles.menuButton,
                  pressed && styles.pressed,
                ]}
                onPress={() =>
                  router.push('/caregiver-dashboard')
                }
                accessibilityRole="button"
                accessibilityLabel="Open caregiver dashboard"
              >
                <ThemedText style={styles.menuText}>
                  ⋮
                </ThemedText>
              </Pressable>
            </View>

            <ThemedText style={styles.subtitle}>
              Your wellbeing, progress and daily support.
            </ThemedText>
          </ThemedView>

          {/* MEMORY ASSISTANT */}
          <ThemedText style={styles.sectionLabel}>
            MEMORY ASSISTANT
          </ThemedText>

          <Pressable
            style={({ pressed }) => [
              styles.assistantCard,
              pressed && styles.pressed,
            ]}
            onPress={() => router.push('/memory-assistant')}
            accessibilityRole="button"
            accessibilityLabel="Open Memory Assistant"
          >
            <View style={styles.assistantIcon}>
              <ThemedText style={styles.assistantIconText}>
                ✦
              </ThemedText>
            </View>

            <View style={styles.assistantContent}>
              <ThemedText style={styles.assistantTitle}>
                Memory Assistant
              </ThemedText>

              <ThemedText style={styles.assistantText}>
                Ask about your reminders, activities, or things
                you want to remember.
              </ThemedText>

              <View style={styles.talkButton}>
                <ThemedText style={styles.talkButtonText}>
                  Talk to me
                </ThemedText>
              </View>
            </View>
          </Pressable>

          {/* WEEKLY PERFORMANCE */}
          <ThemedText style={styles.sectionLabel}>
            THIS WEEK
          </ThemedText>

          <Pressable
            style={({ pressed }) => [
              styles.performanceCard,
              pressed && styles.cardPressed,
            ]}
            onPress={() => router.push('/progress')}
            accessibilityRole="button"
            accessibilityLabel="View weekly performance"
          >
            <View style={styles.cardHeader}>
              <View style={styles.performanceHeaderText}>
                <ThemedText style={styles.cardTitle}>
                  Weekly Performance
                </ThemedText>

                <ThemedText style={styles.cardSubtitle}>
                  Based on your recent game sessions
                </ThemedText>
              </View>

              <ThemedText style={styles.viewText}>
                View →
              </ThemedText>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <ThemedText style={styles.statValue}>
                  {mockSessions.length}
                </ThemedText>

                <ThemedText style={styles.statLabel}>
                  Games completed
                </ThemedText>
              </View>

              <View style={styles.statDivider} />

              <View style={styles.stat}>
                <ThemedText style={styles.statValue}>
                  {averageAccuracy}%
                </ThemedText>

                <ThemedText style={styles.statLabel}>
                  Average accuracy
                </ThemedText>
              </View>

              <View style={styles.statDivider} />

              <View style={styles.stat}>
                <ThemedText style={styles.statValue}>
                  {averageScore}
                </ThemedText>

                <ThemedText style={styles.statLabel}>
                  Average score
                </ThemedText>
              </View>
            </View>

            <View style={styles.performanceMessage}>
              <ThemedText style={styles.performanceMessageText}>
                Keep building your consistency through regular
                sessions.
              </ThemedText>
            </View>
          </Pressable>

          {/* PROFILE */}
          <ThemedText style={styles.sectionLabel}>
            PROFILE
          </ThemedText>

          <Pressable
            style={({ pressed }) => [
              styles.profileCard,
              pressed && styles.cardPressed,
            ]}
            onPress={() => router.push('/profile')}
            accessibilityRole="button"
            accessibilityLabel="Open profile"
          >
            <View style={styles.profileIcon}>
              <ThemedText style={styles.profileIconText}>
                P
              </ThemedText>
            </View>

            <View style={styles.profileInfo}>
              <ThemedText style={styles.profileName}>
                Your Profile
              </ThemedText>

              <ThemedText style={styles.profileDetail}>
                View and manage your personal information
              </ThemedText>

              <ThemedText style={styles.profileRole}>
                Patient
              </ThemedText>
            </View>
          </Pressable>

          {/* RECENT ACTIVITY */}
          <ThemedText style={styles.sectionLabel}>
            RECENT ACTIVITY
          </ThemedText>

          <ThemedView style={styles.activityCard}>
            {recentSessions.map((session, index) => {
              const gameTitle =
                games.find(
                  game => game.id === session.gameId,
                )?.title ?? 'Unknown Game';

              return (
                <View key={session.sessionId}>
                  <ActivityRow
                    title={gameTitle}
                    date={formatActivityDate(session.timestamp)}
                    score={String(session.score)}
                    status="Completed"
                  />

                  {index !== recentSessions.length - 1 && (
                    <View style={styles.divider} />
                  )}
                </View>
              );
            })}
          </ThemedView>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

function ActivityRow({
  title,
  date,
  score,
  status,
}: {
  title: string;
  date: string;
  score: string;
  status: string;
}) {
  return (
    <View style={styles.activityRow}>
      <View style={styles.activityInfo}>
        <ThemedText style={styles.activityTitle}>
          {title}
        </ThemedText>

        <ThemedText style={styles.activityDate}>
          {date}
        </ThemedText>
      </View>

      <View style={styles.activityRight}>
        <ThemedText style={styles.activityScore}>
          {score}
        </ThemedText>

        <View style={styles.statusBadge}>
          <ThemedText style={styles.statusText}>
            {status}
          </ThemedText>
        </View>
      </View>
    </View>
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
  },

  header: {
    backgroundColor: 'transparent',
    marginBottom: 28,
  },

  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#5A1735',
  },

  subtitle: {
    marginTop: 6,
    fontSize: 15,
    lineHeight: 22,
    color: '#6F5962',
  },

  menuButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#F9DDE8',
    alignItems: 'center',
    justifyContent: 'center',
  },

  menuText: {
    fontSize: 27,
    lineHeight: 30,
    fontWeight: '700',
    color: '#7A2348',
  },

  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    color: '#7A2348',
    marginBottom: 12,
  },

  assistantCard: {
    flexDirection: 'row',
    padding: 18,
    borderRadius: 20,
    backgroundColor: '#F9DDE8',
    marginBottom: 26,
  },

  assistantIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },

  assistantIconText: {
    fontSize: 24,
    color: '#7A2348',
    fontWeight: '700',
  },

  assistantContent: {
    flex: 1,
  },

  assistantTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#5A1735',
    marginBottom: 5,
  },

  assistantText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#6F5962',
    marginBottom: 12,
  },

  talkButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#7A2348',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },

  talkButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  performanceCard: {
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F0E1E7',
    backgroundColor: '#FFFFFF',
    marginBottom: 26,
  },

  cardPressed: {
    opacity: 0.7,
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  performanceHeaderText: {
    flex: 1,
    marginRight: 10,
  },

  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#3F3036',
  },

  cardSubtitle: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
    color: '#6F5962',
  },

  viewText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#7A2348',
  },

  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 22,
  },

  stat: {
    flex: 1,
    alignItems: 'center',
  },

  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#5A1735',
  },

  statLabel: {
    marginTop: 5,
    fontSize: 11,
    lineHeight: 15,
    textAlign: 'center',
    color: '#8C7A82',
  },

  statDivider: {
    width: 1,
    height: 38,
    backgroundColor: '#F0E1E7',
  },

  performanceMessage: {
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F0E1E7',
  },

  performanceMessageText: {
    fontSize: 13,
    lineHeight: 19,
    color: '#6F5962',
  },

  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F0E1E7',
    backgroundColor: '#FFFFFF',
    marginBottom: 26,
  },

  profileIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F9DDE8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },

  profileIconText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#7A2348',
  },

  profileInfo: {
    flex: 1,
  },

  profileName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#3F3036',
  },

  profileDetail: {
    marginTop: 3,
    fontSize: 13,
    lineHeight: 18,
    color: '#6F5962',
  },

  profileRole: {
    marginTop: 5,
    fontSize: 12,
    fontWeight: '600',
    color: '#7A2348',
  },

  activityCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F0E1E7',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    marginBottom: 26,
  },

  activityRow: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  activityInfo: {
    flex: 1,
  },

  activityTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#3F3036',
  },

  activityDate: {
    marginTop: 4,
    fontSize: 12,
    color: '#8C7A82',
  },

  activityRight: {
    alignItems: 'flex-end',
  },

  activityScore: {
    fontSize: 16,
    fontWeight: '700',
    color: '#5A1735',
    marginBottom: 4,
  },

  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: '#F9DDE8',
  },

  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#7A2348',
  },

  divider: {
    height: 1,
    backgroundColor: '#F0E1E7',
  },

  pressed: {
    opacity: 0.7,
  },
});