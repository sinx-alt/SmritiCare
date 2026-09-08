import { StyleSheet, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

import {
  MaxContentWidth,
  Spacing,
} from '@/constants/theme';

import { games, GameId } from '@/constants/games';

export default function ActivityScreen() {
  // Temporary recommendation.
  // Later this will come from the personalization system.
  const todayGameId: GameId = 'memory_match';

  const todayGame = games.find(
    game => game.id === todayGameId
  );

  // Temporary prototype value.
  // The supplied backend schema does not currently define
  // an activity duration for this screen.
  const estimatedTime = '6 MIN';

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
              Today's Activity
            </ThemedText>

            <ThemedText style={styles.subtitle}>
              A short cognitive activity chosen for you today.
            </ThemedText>
          </ThemedView>

          {/* Today's recommended activity */}
          <ThemedView style={styles.activityCard}>
            <ThemedText style={styles.label}>
              TODAY'S ACTIVITY
            </ThemedText>

            <ThemedText style={styles.activityTitle}>
              {todayGame?.title ?? "Today's Activity"}
            </ThemedText>

            <ThemedText style={styles.description}>
              {todayGame?.description ??
                'A cognitive activity chosen for you today.'}
            </ThemedText>

            <ThemedView style={styles.details}>
              <ThemedView style={styles.detailItem}>
                <ThemedText style={styles.detailLabel}>
                  DIFFICULTY
                </ThemedText>

                <ThemedText style={styles.detailValue}>
                  {todayGame?.difficulty.toUpperCase() ?? '—'}
                </ThemedText>
              </ThemedView>

              <ThemedView style={styles.detailItem}>
                <ThemedText style={styles.detailLabel}>
                  EST. TIME
                </ThemedText>

                <ThemedText style={styles.detailValue}>
                  {estimatedTime}
                </ThemedText>
              </ThemedView>
            </ThemedView>

            <Pressable
              style={({ pressed }) => [
                styles.startButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={() =>
                router.push(
                  `/game?gameId=${todayGameId}`
                )
              }
              accessibilityRole="button"
              accessibilityLabel={`Start ${todayGame?.title ?? "today's activity"}`}
            >
              <ThemedText style={styles.startButtonText}>
                START ACTIVITY
              </ThemedText>
            </Pressable>
          </ThemedView>

          {/* Browse other games */}
          <ThemedView style={styles.otherSection}>
            <ThemedText style={styles.sectionTitle}>
              WANT SOMETHING ELSE?
            </ThemedText>

            <Pressable
              style={({ pressed }) => [
                styles.gamesButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={() => router.push('/games')}
              accessibilityRole="button"
              accessibilityLabel="View all games"
            >
              <ThemedText style={styles.gamesButtonText}>
                VIEW ALL GAMES
              </ThemedText>
            </Pressable>
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
    gap: 22,
  },

  header: {
    backgroundColor: 'transparent',
    gap: 6,
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

  activityCard: {
    backgroundColor: '#F9DDE8',
    borderRadius: 22,
    padding: 22,
    gap: 12,
  },

  label: {
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

  description: {
    fontSize: 15,
    lineHeight: 22,
    color: '#6F5962',
  },

  details: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: 'transparent',
    marginTop: 4,
  },

  detailItem: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    gap: 4,
  },

  detailLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: '#8C7A82',
  },

  detailValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#7A2348',
  },

  startButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 4,
  },

  startButtonText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: '#7A2348',
  },

  otherSection: {
    backgroundColor: 'transparent',
    gap: 10,
  },

  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    color: '#7A2348',
  },

  gamesButton: {
    borderWidth: 1,
    borderColor: '#F0E1E7',
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },

  gamesButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#7A2348',
  },

  buttonPressed: {
    opacity: 0.7,
  },
});