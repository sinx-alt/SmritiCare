import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { useLocalSearchParams } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

import { GameId } from '@/constants/games';

/*
 * Temporary prototype URLs.
 *
 * These will be replaced with the actual game URLs/paths
 * when the individual games are integrated.
 *
 * The keys are restricted to the exact seven GameId values
 * defined by the SmritiCare backend contract.
 */
const gameUrls: Record<GameId, string> = {
  memory_match: 'https://example.com',
  pattern_recall: 'https://example.com',
  number_sequence: 'https://example.com',
  adaptive_chess: 'https://example.com',
  focus_flight: 'https://example.com',
  object_association: 'https://example.com',
  ner_memory_quiz: 'https://example.com',
};

export default function WebViewScreen() {
  const { gameId } = useLocalSearchParams<{ gameId: string }>();

  const selectedGameId = gameId as GameId | undefined;
  const gameUrl = selectedGameId
    ? gameUrls[selectedGameId]
    : undefined;

  if (!gameUrl) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.errorContainer}>
          <ThemedText style={styles.errorTitle}>
            Game unavailable
          </ThemedText>

          <ThemedText style={styles.errorText}>
            We couldn't find the selected game.
          </ThemedText>
        </SafeAreaView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.webviewContainer}>
        <WebView
          source={{ uri: gameUrl }}
          style={styles.webview}
          startInLoadingState
          javaScriptEnabled
          domStorageEnabled
        />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  webviewContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  webview: {
    flex: 1,
  },

  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#FFFFFF',
  },

  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#5A1735',
    textAlign: 'center',
  },

  errorText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#6F5962',
    textAlign: 'center',
    marginTop: 8,
  },
});