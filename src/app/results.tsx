import { StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

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

export default function ResultsScreen() {
  const { gameId } = useLocalSearchParams<{
    gameId?: string;
  }>();

  const router = useRouter();

  const selectedGame = games.find(
    game => game.id === gameId
  );

  const gameTitle =
    selectedGame?.title ?? 'Game Results';

  /*
   * Temporary mock data.
   * Later this will come from the backend/game session.
   *
   * The backend contract does not currently define the unit
   * of reactionTime, so it is displayed without a unit here.
   */
  const result: MockGameResult = {
    patientId: 'mock-patient',
    gameId: selectedGame?.id ?? 'memory_match',
    sessionId: 'mock-session',

    score: 86,
    accuracy: 0.9,
    reactionTime: 1.4,
    mistakes: 2,
    attempts: 20,

    difficulty: 1,
    duration: 342,
    timestamp: new Date().toISOString(),
  };

  const accuracyPercentage = Math.round(
    result.accuracy * 100
  );

  const minutes = Math.floor(result.duration / 60);
  const seconds = result.duration % 60;

  const formattedDuration =
    `${minutes}:${seconds.toString().padStart(2, '0')}`;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.content}>
          <ThemedText style={styles.completionMark}>
            ✓
          </ThemedText>

          <ThemedText style={styles.title}>
            Game Complete
          </ThemedText>

          <ThemedText style={styles.gameName}>
            {gameTitle}
          </ThemedText>

          {/* Score */}
          <ThemedView style={styles.scoreCard}>
            <ThemedText style={styles.scoreLabel}>
              Score
            </ThemedText>

            <ThemedText style={styles.score}>
              {result.score}%
            </ThemedText>
          </ThemedView>

          {/* Accuracy and duration */}
          <ThemedView style={styles.metricsRow}>
            <ThemedView style={styles.metricCard}>
              <ThemedText style={styles.metricValue}>
                {accuracyPercentage}%
              </ThemedText>

              <ThemedText style={styles.metricLabel}>
                Accuracy
              </ThemedText>
            </ThemedView>

            <ThemedView style={styles.metricCard}>
              <ThemedText style={styles.metricValue}>
                {formattedDuration}
              </ThemedText>

              <ThemedText style={styles.metricLabel}>
                Time
              </ThemedText>
            </ThemedView>
          </ThemedView>

          {/* Mistakes and reaction time */}
          <ThemedView style={styles.metricsRow}>
            <ThemedView style={styles.metricCard}>
              <ThemedText style={styles.metricValue}>
                {result.mistakes}
              </ThemedText>

              <ThemedText style={styles.metricLabel}>
                Mistakes
              </ThemedText>
            </ThemedView>

            <ThemedView style={styles.metricCard}>
              <ThemedText style={styles.metricValue}>
                {result.reactionTime}
              </ThemedText>

              <ThemedText style={styles.metricLabel}>
                Reaction Time
              </ThemedText>
            </ThemedView>
          </ThemedView>

          <ThemedText style={styles.message}>
            Great work!
          </ThemedText>

          <Pressable
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => router.push('/(tabs)/games')}
            accessibilityRole="button"
            accessibilityLabel="Continue to games"
          >
            <ThemedText style={styles.buttonText}>
              Continue
            </ThemedText>
          </Pressable>
        </ThemedView>
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
  },

  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 36,
    paddingBottom: 24,
  },

  completionMark: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F9DDE8',
    color: '#7A2348',
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    textAlignVertical: 'center',
    overflow: 'hidden',
    marginBottom: 14,
  },

  title: {
    color: '#5A1735',
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
  },

  gameName: {
    color: '#7A2348',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },

  scoreCard: {
    width: '100%',
    marginTop: 32,
    paddingVertical: 28,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0E1E7',
    alignItems: 'center',
  },

  scoreLabel: {
    color: '#6F5962',
    fontSize: 16,
  },

  score: {
    color: '#7A2348',
    fontSize: 42,
    fontWeight: '700',
    marginTop: 6,
  },

  metricsRow: {
    width: '100%',
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    backgroundColor: 'transparent',
  },

  metricCard: {
    flex: 1,
    minHeight: 86,
    paddingVertical: 18,
    paddingHorizontal: 8,
    borderRadius: 20,
    backgroundColor: '#F9DDE8',
    alignItems: 'center',
    justifyContent: 'center',
  },

  metricValue: {
    color: '#7A2348',
    fontSize: 22,
    fontWeight: '700',
  },

  metricLabel: {
    color: '#6F5962',
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },

  message: {
    color: '#5A1735',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 24,
  },

  button: {
    width: '100%',
    minHeight: 50,
    marginTop: 28,
    backgroundColor: '#7A2348',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  buttonPressed: {
    opacity: 0.7,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});