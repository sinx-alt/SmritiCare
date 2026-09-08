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

type PatientProfileOut = {
  userId: string;
  fullName: string;
  email: string;
  languagePref: string;
  baselineCompleted: boolean;
};

// Temporary profile data.
// This follows the real PatientProfileOut backend structure.
// Replace this with the API response when the backend is connected.
const mockProfile: PatientProfileOut = {
  userId: 'patient-1',
  fullName: 'Kavish',
  email: 'kavish@example.com',
  languagePref: 'English',
  baselineCompleted: true,
};

export default function ProfileScreen() {
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
                style={({ pressed }) => [
                  styles.backButton,
                  pressed && styles.backButtonPressed,
                ]}
                onPress={() => router.back()}
                accessibilityRole="button"
                accessibilityLabel="Go back"
              >
                <ThemedText style={styles.backText}>
                  ‹
                </ThemedText>
              </Pressable>

              <ThemedView style={styles.headerText}>
                <ThemedText style={styles.title}>
                  Profile
                </ThemedText>

                <ThemedText style={styles.subtitle}>
                  Your personal information and preferences.
                </ThemedText>
              </ThemedView>
            </ThemedView>

            {/* Profile Identity */}
            <ThemedView style={styles.identityCard}>
              <ThemedView style={styles.profileIcon}>
                <ThemedText style={styles.profileIconText}>
                  {mockProfile.fullName.charAt(0).toUpperCase()}
                </ThemedText>
              </ThemedView>

              <ThemedText style={styles.name}>
                {mockProfile.fullName}
              </ThemedText>

              <ThemedText style={styles.email}>
                {mockProfile.email}
              </ThemedText>

              <ThemedView style={styles.roleBadge}>
                <ThemedText style={styles.roleText}>
                  Patient
                </ThemedText>
              </ThemedView>
            </ThemedView>

            {/* Personal Information */}
            <ThemedText style={styles.sectionLabel}>
              PERSONAL INFORMATION
            </ThemedText>

            <ThemedView style={styles.infoCard}>
              <InfoRow
                label="Full name"
                value={mockProfile.fullName}
              />

              <ThemedView style={styles.divider} />

              <InfoRow
                label="Email"
                value={mockProfile.email}
              />
            </ThemedView>

            {/* Preferences */}
            <ThemedText style={styles.sectionLabel}>
              PREFERENCES
            </ThemedText>

            <ThemedView style={styles.infoCard}>
              <InfoRow
                label="Language"
                value={mockProfile.languagePref}
              />
            </ThemedView>

            {/* Assessment */}
            <ThemedText style={styles.sectionLabel}>
              ASSESSMENT
            </ThemedText>

            <ThemedView style={styles.baselineCard}>
              <ThemedView style={styles.baselineIcon}>
                <ThemedText style={styles.baselineIconText}>
                  ✓
                </ThemedText>
              </ThemedView>

              <ThemedView style={styles.baselineContent}>
                <ThemedText style={styles.baselineTitle}>
                  Baseline assessment
                </ThemedText>

                <ThemedText style={styles.baselineText}>
                  {mockProfile.baselineCompleted
                    ? 'Your baseline assessment has been completed.'
                    : 'Your baseline assessment has not been completed yet.'}
                </ThemedText>
              </ThemedView>
            </ThemedView>
          </ThemedView>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <ThemedView style={styles.infoRow}>
      <ThemedText style={styles.infoLabel}>
        {label}
      </ThemedText>

      <ThemedText style={styles.infoValue}>
        {value}
      </ThemedText>
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
    alignItems: 'center',
    marginBottom: Spacing.five,
    backgroundColor: 'transparent',
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: Colors.light.backgroundElement,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.two,
  },

  backButtonPressed: {
    opacity: 0.7,
  },

  backText: {
    fontSize: 32,
    lineHeight: 36,
    color: Colors.light.primary,
    marginTop: -2,
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
    marginTop: 4,
    fontSize: 14,
    lineHeight: 20,
    color: Colors.light.textSecondary,
  },

  identityCard: {
    alignItems: 'center',
    padding: Spacing.four,
    borderRadius: 22,
    backgroundColor: Colors.light.backgroundElement,
    marginBottom: Spacing.five,
  },

  profileIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.light.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },

  profileIconText: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.light.accent,
  },

  name: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.light.primary,
  },

  email: {
    marginTop: 4,
    fontSize: 14,
    color: Colors.light.textSecondary,
  },

  roleBadge: {
    marginTop: Spacing.two,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: Colors.light.background,
  },

  roleText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.light.accent,
  },

  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    color: Colors.light.accent,
    marginBottom: Spacing.two,
  },

  infoCard: {
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 20,
    paddingHorizontal: Spacing.three,
    marginBottom: Spacing.four,
    backgroundColor: Colors.light.background,
  },

  infoRow: {
    minHeight: 64,
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },

  infoLabel: {
    fontSize: 12,
    color: Colors.light.textMuted,
    marginBottom: 4,
  },

  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.light.text,
  },

  divider: {
    height: 1,
    backgroundColor: Colors.light.border,
  },

  baselineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.background,
  },

  baselineIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.light.backgroundElement,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.two,
  },

  baselineIconText: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.accent,
  },

  baselineContent: {
    flex: 1,
    backgroundColor: 'transparent',
  },

  baselineTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 4,
  },

  baselineText: {
    fontSize: 13,
    lineHeight: 19,
    color: Colors.light.textSecondary,
  },
});