import { StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

import {
  MaxContentWidth,
  Spacing,
} from '@/constants/theme';

import { games, GameId } from '@/constants/games';

type MockGameResult = {
  patientId: string;
  gameId: GameId;
  sessionId: string;

  score: number;
  accuracy: number;
  reactionTime: number;
  mistakes: number;
  attempts: number;

  difficulty: number;
  duration: number;
  timestamp: string;
};

/*
 * Temporary prototype data.
 * Later this will come from backend session history.
 *
 * reactionTime is intentionally displayed without a unit because
 * the supplied backend schema does not define its unit.
 */
const mockResults: MockGameResult[] = [
  {
    patientId: 'mock-patient',
    gameId: 'memory_match',
    sessionId: 'session-001',
    score: 86,
    accuracy: 0.9,
    reactionTime: 1.4,
    mistakes: 2,
    attempts: 20,
    difficulty: 1,
    duration: 342,
    timestamp: new Date().toISOString(),
  },
  {
    patientId: 'mock-patient',
    gameId: 'pattern_recall',
    sessionId: 'session-002',
    score: 78,
    accuracy: 0.8,
    reactionTime: 1.7,
    mistakes: 4,
    attempts: 20,
    difficulty: 2,
    duration: 390,
    timestamp: new Date().toISOString(),
  },
];

export default function ProgressScreen() {
  const latestResult = mockResults[0];

  const accuracyPercentage = Math.round(
    latestResult.accuracy * 100
  );

  const gameTitle =
    games.find(game => game.id === latestResult.gameId)?.title ??
    'Unknown Game';

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          {/* Header */}
          <ThemedView style={styles.header}>
            <ThemedText style={styles.title}>
              Progress
            </ThemedText>

            <ThemedText style={styles.subtitle}>
              Your cognitive activity and performance
            </ThemedText>
          </ThemedView>

          {/* Latest score */}
          <ThemedView style={styles.card}>
            <ThemedText style={styles.cardTitle}>
              Today's Score
            </ThemedText>

            <ThemedText style={styles.score}>
              {latestResult.score}
            </ThemedText>
          </ThemedView>

          {/* Accuracy and games */}
          <ThemedView style={styles.row}>
            <ThemedView style={styles.smallCard}>
              <ThemedText style={styles.cardTitle}>
                Accuracy
              </ThemedText>

              <ThemedText style={styles.value}>
                {accuracyPercentage}%
              </ThemedText>
            </ThemedView>

            <ThemedView style={styles.smallCard}>
              <ThemedText style={styles.cardTitle}>
                Games
              </ThemedText>

              <ThemedText style={styles.value}>
                {mockResults.length}
              </ThemedText>
            </ThemedView>
          </ThemedView>

          {/* Latest reaction time */}
          <ThemedView style={styles.card}>
            <ThemedText style={styles.cardTitle}>
              Latest Reaction Time
            </ThemedText>

            <ThemedText style={styles.value}>
              {latestResult.reactionTime}
            </ThemedText>
          </ThemedView>

          {/* Recent activity */}
          <ThemedText style={styles.sectionTitle}>
            RECENT ACTIVITY
          </ThemedText>

          {mockResults.map(result => {
            const title =
              games.find(game => game.id === result.gameId)?.title ??
              'Unknown Game';

            return (
              <ThemedView
                key={result.sessionId}
                style={styles.activityCard}
              >
                <ThemedView style={styles.activityInfo}>
                  <ThemedText style={styles.activityTitle}>
                    {title}
                  </ThemedText>

                  <ThemedText style={styles.activityDetails}>
                    Accuracy: {Math.round(result.accuracy * 100)}%
                  </ThemedText>
                </ThemedView>

                <ThemedText style={styles.activityScore}>
                  {result.score}
                </ThemedText>
              </ThemedView>
            );
          })}
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
    marginBottom: 24,
  },

  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#5A1735',
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: '#6F5962',
  },

  card: {
    padding: 20,
    borderWidth: 1,
    borderColor: '#F0E1E7',
    borderRadius: 20,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },

  cardTitle: {
    fontSize: 16,
    color: '#6F5962',
    marginBottom: 8,
  },

  score: {
    fontSize: 36,
    fontWeight: '700',
    color: '#7A2348',
  },

  value: {
    fontSize: 24,
    fontWeight: '700',
    color: '#7A2348',
  },

  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
    backgroundColor: 'transparent',
  },

  smallCard: {
    flex: 1,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F0E1E7',
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
    color: '#7A2348',
    marginTop: 8,
    marginBottom: 12,
  },

  activityCard: {
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#F0E1E7',
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
  },

  activityInfo: {
    flex: 1,
    backgroundColor: 'transparent',
  },

  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3F3036',
  },

  activityDetails: {
    fontSize: 14,
    color: '#6F5962',
    marginTop: 4,
  },

  activityScore: {
    fontSize: 22,
    fontWeight: '700',
    color: '#7A2348',
    marginLeft: 12,
  },
});