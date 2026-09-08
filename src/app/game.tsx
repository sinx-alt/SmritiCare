import { StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

import { games, GameId } from '@/constants/games';

export default function GameScreen() {
  const { gameId } = useLocalSearchParams<{
    gameId?: string;
  }>();

  const router = useRouter();

  const selectedGame = games.find(
    game => game.id === gameId
  );

  if (!selectedGame) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <ThemedText style={styles.backText}>
              ←
            </ThemedText>
          </Pressable>

          <ThemedView style={styles.errorContent}>
            <ThemedText style={styles.errorTitle}>
              Game unavailable
            </ThemedText>

            <ThemedText style={styles.errorText}>
              We couldn't find the selected game.
            </ThemedText>
          </ThemedView>
        </SafeAreaView>
      </ThemedView>
    );
  }

  const selectedGameId = selectedGame.id as GameId;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Pressable
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <ThemedText style={styles.backText}>
            ←
          </ThemedText>
        </Pressable>

        <ThemedView style={styles.header}>
          <ThemedText style={styles.title}>
            {selectedGame.title}
          </ThemedText>

          <ThemedText style={styles.description}>
            {selectedGame.description}
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.gameArea}>
          <ThemedText style={styles.placeholder}>
            Ready to begin?
          </ThemedText>

          <ThemedText style={styles.helperText}>
            Your activity will open in the game viewer.
          </ThemedText>

          <Pressable
            style={({ pressed }) => [
              styles.startButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={() =>
              router.replace(
                `/webview?gameId=${selectedGameId}`
              )
            }
            accessibilityRole="button"
            accessibilityLabel={`Start ${selectedGame.title}`}
          >
            <ThemedText style={styles.startButtonText}>
              START GAME
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
    paddingHorizontal: 24,
  },

  backButton: {
    alignSelf: 'flex-start',
    padding: 8,
    marginTop: 4,
  },

  backText: {
    color: '#7A2348',
    fontSize: 28,
    fontWeight: '600',
  },

  header: {
    backgroundColor: 'transparent',
    alignItems: 'center',
    marginTop: 18,
    gap: 8,
  },

  title: {
    color: '#5A1735',
    fontSize: 30,
    fontWeight: '700',
    textAlign: 'center',
  },

  description: {
    color: '#6F5962',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },

  gameArea: {
    flex: 1,
    width: '100%',
    marginTop: 32,
    marginBottom: 24,
    borderRadius: 24,
    backgroundColor: '#F9DDE8',
    borderWidth: 1,
    borderColor: '#F0E1E7',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },

  placeholder: {
    color: '#7A2348',
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },

  helperText: {
    color: '#6F5962',
    fontSize: 15,
    lineHeight: 21,
    textAlign: 'center',
    marginTop: 8,
  },

  startButton: {
    minHeight: 50,
    marginTop: 24,
    backgroundColor: '#7A2348',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  startButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  errorContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: 'transparent',
  },

  errorTitle: {
    color: '#5A1735',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },

  errorText: {
    color: '#6F5962',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginTop: 8,
  },

  buttonPressed: {
    opacity: 0.7,
  },
});