import { StyleSheet, Pressable } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

type GameCardProps = {
  title: string;
  description: string;
  difficulty: string;
  onPress: () => void;
};

export function GameCard({
  title,
  description,
  difficulty,
  onPress,
}: GameCardProps) {
  return (
    <ThemedView style={styles.card}>
      {/* Game information */}
      <ThemedView style={styles.info}>
        <ThemedText style={styles.title}>
          {title}
        </ThemedText>

        <ThemedText style={styles.description}>
          {description}
        </ThemedText>

        <ThemedText style={styles.difficulty}>
          {difficulty.toUpperCase()}
        </ThemedText>
      </ThemedView>

      {/* Play button */}
      <Pressable
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed,
        ]}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`Play ${title}`}
      >
        <ThemedText style={styles.buttonText}>
          PLAY
        </ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F0E1E7',
    gap: 16,
  },

  info: {
    backgroundColor: 'transparent',
    gap: 7,
  },

  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#5A1735',
  },

  description: {
    fontSize: 14,
    lineHeight: 20,
    color: '#6F5962',
  },

  difficulty: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    color: '#7A2348',
    marginTop: 3,
  },

  button: {
    backgroundColor: '#F9DDE8',
    minHeight: 48,
    paddingVertical: 13,
    paddingHorizontal: 18,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },

  buttonPressed: {
    opacity: 0.7,
  },

  buttonText: {
    color: '#7A2348',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});