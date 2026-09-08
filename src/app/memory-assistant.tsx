import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

import { MaxContentWidth, Spacing } from '@/constants/theme';

export default function MemoryAssistantScreen() {
  const [message, setMessage] = useState('');

  function handleSend() {
    if (!message.trim()) {
      return;
    }

    // Temporary UI-only behavior.
    // Real assistant logic will connect to the backend later.
    setMessage('');
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.keyboardArea}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <ThemedView style={styles.header}>
              <ThemedText style={styles.title}>
                Memory Assistant
              </ThemedText>

              <ThemedText style={styles.subtitle}>
                I'm here to help you remember and stay organized.
              </ThemedText>
            </ThemedView>

            <ThemedView style={styles.assistantCard}>
              <ThemedText style={styles.cardTitle}>
                How can I help?
              </ThemedText>

              <ThemedText style={styles.cardText}>
                You can ask me about your reminders, activities,
                or things you want to remember.
              </ThemedText>
            </ThemedView>

            <ThemedText style={styles.sectionTitle}>
              QUICK HELP
            </ThemedText>

            <Pressable
              style={({ pressed }) => [
                styles.quickHelpCard,
                pressed && styles.pressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Ask what activities I have today"
              onPress={() => setMessage('What activities do I have today?')}
            >
              <ThemedText style={styles.quickHelpText}>
                What activities do I have today?
              </ThemedText>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.quickHelpCard,
                pressed && styles.pressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Ask what reminders I have"
              onPress={() => setMessage('What reminders do I have?')}
            >
              <ThemedText style={styles.quickHelpText}>
                What reminders do I have?
              </ThemedText>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.quickHelpCard,
                pressed && styles.pressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Ask how I am doing"
              onPress={() => setMessage('How am I doing?')}
            >
              <ThemedText style={styles.quickHelpText}>
                How am I doing?
              </ThemedText>
            </Pressable>

            <View style={styles.inputArea}>
              <TextInput
                style={styles.input}
                placeholder="Type a message..."
                placeholderTextColor="#8C7A82"
                value={message}
                onChangeText={setMessage}
                returnKeyType="send"
                onSubmitEditing={handleSend}
                accessibilityLabel="Message input"
              />

              <Pressable
                style={({ pressed }) => [
                  styles.sendButton,
                  pressed && styles.sendButtonPressed,
                ]}
                onPress={handleSend}
                accessibilityRole="button"
                accessibilityLabel="Send message"
              >
                <ThemedText style={styles.sendText}>
                  Send
                </ThemedText>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
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

  keyboardArea: {
    flex: 1,
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

  assistantCard: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F0E1E7',
    backgroundColor: '#FFFFFF',
    marginBottom: 24,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#7A2348',
    marginBottom: 8,
  },

  cardText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#6F5962',
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
    color: '#7A2348',
    marginBottom: 12,
  },

  quickHelpCard: {
    padding: 18,
    minHeight: 56,
    justifyContent: 'center',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#F0E1E7',
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
  },

  quickHelpText: {
    fontSize: 15,
    lineHeight: 21,
    color: '#3F3036',
  },

  pressed: {
    opacity: 0.7,
  },

  inputArea: {
    marginTop: 8,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },

  input: {
    flex: 1,
    minHeight: 48,
    borderWidth: 1,
    borderColor: '#F0E1E7',
    borderRadius: 14,
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#3F3036',
    backgroundColor: '#FFFFFF',
  },

  sendButton: {
    minHeight: 48,
    paddingHorizontal: 18,
    borderRadius: 14,
    backgroundColor: '#7A2348',
    justifyContent: 'center',
    alignItems: 'center',
  },

  sendButtonPressed: {
    opacity: 0.7,
  },

  sendText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});