import { useEffect, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { apiFetch } from '@/services/api';   // adjust to your actual path


import {
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import {
  Colors,
  MaxContentWidth,
  Spacing,
} from '@/constants/theme';
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

type PatientProfileOut = {
  userId: string;
  fullName: string;
  email: string;
  languagePref: string;
  baselineCompleted: boolean;
};

type RecommendationOut = {
  id: string;
  patientId: string;
  nextGame: GameId;
  difficulty: number;
  duration: number | null;
  reason: string | null;
  changeFlag: boolean;
};

// Temporary mock data.
// Replace these with API responses during backend integration.

type DashboardOverview = {
  patient: PatientProfileOut;
  sessions: SessionOut[];
  recommendation: RecommendationOut;
};

export default function CaregiverDashboard() {
  const { patientId } = useLocalSearchParams<{ patientId: string }>();
  const [data, setData] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!patientId) return;
    (async () => {
      try {
        const overview = await apiFetch(`/api/dashboard/${patientId}/overview`);
        setData(overview);
      } catch (e) {
        setError(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [patientId]);

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <ThemedText>Loading...</ThemedText>
        </SafeAreaView>
      </ThemedView>
    );
  }

  if (error || !data || data.sessions.length === 0) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <ThemedText>No session data yet.</ThemedText>
        </SafeAreaView>
      </ThemedView>
    );
  }

  const { patient, sessions, recommendation } = data;
  const lastSession = sessions[0];

  return (
    // ... your existing JSX, completely unchanged from here down ...

function getGameTitle(gameId: GameId) {
  return games.find(game => game.id === gameId)?.title ?? gameId;
}

function formatTimestamp(timestamp: string) {
  const date = new Date(timestamp);

  return date.toLocaleString([], {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function getTrend() {
  if (sessions.length < 2) {
    return 'Not enough data';
  }

  const latest = sessions[0];
  const previous = sessions[1];

  const accuracyChange =
    latest.accuracy - previous.accuracy;

  if (accuracyChange > 0.03) {
    return 'Accuracy is improving';
  }

  if (accuracyChange < -0.03) {
    return 'Accuracy has decreased';
  }

  return 'Performance is stable';
}

export default function CaregiverDashboard() {
  const lastSession = sessions[0];

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <ThemedView style={styles.inner}>
            {/* Header */}
            <ThemedView style={styles.header}>
              <Pressable
                onPress={() => router.back()}
                style={({ pressed }) => [
                  styles.backButton,
                  pressed && styles.backButtonPressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Go back"
              >
                <ThemedText style={styles.backText}>
                  ‹
                </ThemedText>
              </Pressable>

              <ThemedView style={styles.headerText}>
                <ThemedText style={styles.title}>
                  Caregiver Dashboard
                </ThemedText>

                <ThemedText style={styles.subtitle}>
                  Patient overview and progress.
                </ThemedText>
              </ThemedView>
            </ThemedView>

            {/* Patient Name */}
            <ThemedText style={styles.sectionLabel}>
              PATIENT
            </ThemedText>

            <ThemedView style={styles.patientCard}>
              <ThemedView style={styles.avatar}>
                <ThemedText style={styles.avatarText}>
                  {patient.fullName.charAt(0).toUpperCase()}
                </ThemedText>
              </ThemedView>

              <ThemedText style={styles.patientName}>
                {patient.fullName}
              </ThemedText>
            </ThemedView>

            {/* Total Sessions */}
            <ThemedText style={styles.sectionLabel}>
              TOTAL SESSIONS
            </ThemedText>

            <ThemedView style={styles.totalCard}>
              <ThemedText style={styles.totalValue}>
                {sessions.length}
              </ThemedText>

              <ThemedText style={styles.totalLabel}>
                Recorded sessions
              </ThemedText>
            </ThemedView>

            {/* Last Session */}
            <ThemedText style={styles.sectionLabel}>
              LAST SESSION
            </ThemedText>

            <ThemedView style={styles.sessionCard}>
              <ThemedView style={styles.sessionHeader}>
                <ThemedView style={styles.sessionInfo}>
                  <ThemedText style={styles.cardTitle}>
                    {getGameTitle(lastSession.gameId)}
                  </ThemedText>

                  <ThemedText style={styles.cardSubtitle}>
                    {formatTimestamp(lastSession.timestamp)}
                  </ThemedText>
                </ThemedView>

                <ThemedView style={styles.scoreBox}>
                  <ThemedText style={styles.scoreValue}>
                    {lastSession.score}
                  </ThemedText>

                  <ThemedText style={styles.scoreLabel}>
                    Score
                  </ThemedText>
                </ThemedView>
              </ThemedView>

              <ThemedView style={styles.metricsRow}>
                <ThemedView style={styles.metric}>
                  <ThemedText style={styles.metricValue}>
                    {Math.round(lastSession.accuracy * 100)}%
                  </ThemedText>

                  <ThemedText style={styles.metricLabel}>
                    Accuracy
                  </ThemedText>
                </ThemedView>

                <ThemedView style={styles.metric}>
                  <ThemedText style={styles.metricValue}>
                    {lastSession.mistakes}
                  </ThemedText>

                  <ThemedText style={styles.metricLabel}>
                    Mistakes
                  </ThemedText>
                </ThemedView>

                <ThemedView style={styles.metric}>
                  <ThemedText style={styles.metricValue}>
                    {lastSession.duration}
                  </ThemedText>

                  <ThemedText style={styles.metricLabel}>
                    Duration
                  </ThemedText>
                </ThemedView>
              </ThemedView>
            </ThemedView>

            {/* Trends */}
            <ThemedText style={styles.sectionLabel}>
              TRENDS
            </ThemedText>

            <ThemedView style={styles.trendCard}>
              <ThemedText
                style={styles.trendIcon}
                accessibilityLabel="Trend improving"
              >
                ↗
              </ThemedText>

              <ThemedView style={styles.trendContent}>
                <ThemedText style={styles.cardTitle}>
                  {getTrend()}
                </ThemedText>

                <ThemedText style={styles.cardSubtitle}>
                  Based on recent session accuracy.
                </ThemedText>
              </ThemedView>
            </ThemedView>

            {/* Change Flag */}
            <ThemedText style={styles.sectionLabel}>
              CHANGE FLAG
            </ThemedText>

            <ThemedView
              style={[
                styles.flagCard,
                recommendation.changeFlag
                  ? styles.flagActive
                  : styles.flagNormal,
              ]}
            >
              <ThemedView
                style={[
                  styles.flagDot,
                  recommendation.changeFlag
                    ? styles.flagDotActive
                    : styles.flagDotNormal,
                ]}
              />

              <ThemedView style={styles.flagContent}>
                <ThemedText style={styles.cardTitle}>
                  {recommendation.changeFlag
                    ? 'Change detected'
                    : 'No change flagged'}
                </ThemedText>

                <ThemedText style={styles.cardSubtitle}>
                  Recommendation change flag:{' '}
                  {recommendation.changeFlag
                    ? 'true'
                    : 'false'}
                </ThemedText>
              </ThemedView>
            </ThemedView>

            {/* Recommendation */}
            <ThemedText style={styles.sectionLabel}>
              RECOMMENDATION
            </ThemedText>

            <ThemedView style={styles.recommendationCard}>
              <ThemedText style={styles.cardTitle}>
                {getGameTitle(recommendation.nextGame)}
              </ThemedText>

              <ThemedText style={styles.cardSubtitle}>
                Difficulty: {recommendation.difficulty}
              </ThemedText>

              {recommendation.duration !== null && (
                <ThemedText style={styles.detailText}>
                  Duration: {recommendation.duration}
                </ThemedText>
              )}

              {recommendation.reason && (
                <ThemedText style={styles.reasonText}>
                  {recommendation.reason}
                </ThemedText>
              )}
            </ThemedView>
          </ThemedView>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },

  safeArea: {
    flex: 1,
  },

  content: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.six,
  },

  inner: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    backgroundColor: 'transparent',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.five,
    backgroundColor: 'transparent',
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: Colors.light.backgroundElement,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.two,
  },

  backButtonPressed: {
    opacity: 0.7,
  },

  backText: {
    fontSize: 32,
    lineHeight: 36,
    color: Colors.light.accent,
  },

  headerText: {
    flex: 1,
    backgroundColor: 'transparent',
  },

  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
    color: Colors.light.primary,
  },

  subtitle: {
    marginTop: 5,
    fontSize: 15,
    lineHeight: 21,
    color: Colors.light.textSecondary,
  },

  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    color: Colors.light.accent,
    marginBottom: Spacing.two,
  },

  patientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: 20,
    backgroundColor: Colors.light.backgroundElement,
    marginBottom: Spacing.four,
  },

  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.light.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.two,
  },

  avatarText: {
    fontSize: 21,
    fontWeight: '700',
    color: Colors.light.accent,
  },

  patientName: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.primary,
  },

  totalCard: {
    padding: Spacing.three,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.light.border,
    alignItems: 'center',
    marginBottom: Spacing.four,
    backgroundColor: Colors.light.background,
  },

  totalValue: {
    fontSize: 30,
    fontWeight: '700',
    color: Colors.light.primary,
  },

  totalLabel: {
    marginTop: 4,
    fontSize: 12,
    color: Colors.light.textMuted,
  },

  sessionCard: {
    padding: Spacing.three,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginBottom: Spacing.four,
    backgroundColor: Colors.light.background,
  },

  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    backgroundColor: 'transparent',
  },

  sessionInfo: {
    flex: 1,
    marginRight: Spacing.two,
    backgroundColor: 'transparent',
  },

  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.light.text,
  },

  cardSubtitle: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
    color: Colors.light.textSecondary,
  },

  scoreBox: {
    alignItems: 'center',
    backgroundColor: Colors.light.backgroundElement,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: Spacing.two,
  },

  scoreValue: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.primary,
  },

  scoreLabel: {
    marginTop: 2,
    fontSize: 10,
    color: Colors.light.accent,
  },

  metricsRow: {
    flexDirection: 'row',
    marginTop: Spacing.three,
    paddingTop: Spacing.two,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    backgroundColor: 'transparent',
  },

  metric: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },

  metricValue: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.light.primary,
  },

  metricLabel: {
    marginTop: 4,
    fontSize: 11,
    color: Colors.light.textMuted,
  },

  trendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: 20,
    backgroundColor: Colors.light.backgroundElement,
    marginBottom: Spacing.four,
  },

  trendIcon: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.light.accent,
    marginRight: Spacing.two,
  },

  trendContent: {
    flex: 1,
    backgroundColor: 'transparent',
  },

  flagCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: Spacing.four,
  },

  flagNormal: {
    backgroundColor: Colors.light.background,
    borderColor: Colors.light.border,
  },

  flagActive: {
    backgroundColor: Colors.light.backgroundElement,
    borderColor: Colors.light.border,
  },

  flagDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: Spacing.two,
  },

  flagDotNormal: {
    backgroundColor: Colors.light.accent,
  },

  flagDotActive: {
    backgroundColor: Colors.light.primary,
  },

  flagContent: {
    flex: 1,
    backgroundColor: 'transparent',
  },

  recommendationCard: {
    padding: Spacing.three,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.background,
  },

  detailText: {
    marginTop: Spacing.two,
    fontSize: 13,
    color: Colors.light.textSecondary,
  },

  reasonText: {
    marginTop: Spacing.three,
    fontSize: 13,
    lineHeight: 19,
    color: Colors.light.textSecondary,
  },
});