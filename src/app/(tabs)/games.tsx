import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { GameCard } from '@/components/game-card';

import {
  MaxContentWidth,
  Spacing,
} from '@/constants/theme';

import { games } from '@/constants/games';

export default function GamesScreen() {
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
              Cognitive Games
            </ThemedText>

            <ThemedText style={styles.subtitle}>
              Choose an activity to exercise your memory and thinking.
            </ThemedText>
          </ThemedView>

          {/* Official 7-game lineup */}
          <ThemedText style={styles.sectionTitle}>
            GAMES
          </ThemedText>

          <ThemedView style={styles.gamesList}>
            {games.map(game => (
              <GameCard
                key={game.id}
                title={game.title}
                description={game.description}
                difficulty={game.difficulty}
                onPress={() =>
                  router.push(`/webview?gameId=${game.id}`)
                }
              />
            ))}
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
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
  },

  content: {
    paddingVertical: Spacing.four,
    paddingBottom: Spacing.five,
    gap: 16,
  },

  header: {
    backgroundColor: 'transparent',
    gap: 6,
    marginBottom: 4,
  },

  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#5A1735',
  },

  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: '#6F5962',
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
    color: '#7A2348',
    marginTop: 4,
  },

  gamesList: {
    backgroundColor: 'transparent',
    gap: 14,
  },
});