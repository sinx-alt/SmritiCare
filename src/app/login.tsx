import { StyleSheet, Pressable, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { login } from '../services/api';


import { ThemedText } from '@/components/themed-text';
async function handleLogin(email: string, password: string) {
  try {
    await login(email, password);
    router.replace('/(tabs)/home');   // adjust to your actual route
  } catch (e) {
    setError('Invalid email or password');
  }
}

export default function LoginScreen() {
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loginCard}>

          {/* Decorative pink shapes */}
          <View style={styles.pinkCircleOne} />
          <View style={styles.pinkCircleTwo} />
          <View style={styles.pinkShape} />

          {/* Welcome */}
          <View style={styles.header}>
            <ThemedText style={styles.welcome}>
              Welcome to
            </ThemedText>

            <ThemedText style={styles.logo}>
              SmritiCare
            </ThemedText>
          </View>

          {/* Login form */}
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#8C7A82"
              secureTextEntry
              accessibilityLabel="Password"
            />

            <ThemedText style={styles.forgotPassword}>
              Forgot Password?
            </ThemedText>

            <Pressable
              style={({ pressed }) => [
                styles.loginButton,
                pressed && styles.loginButtonPressed,
              ]}
              onPress={() => router.replace('/(tabs)')}
              accessibilityRole="button"
              accessibilityLabel="Login"
            >
              <ThemedText style={styles.loginButtonText}>
                Login
              </ThemedText>
            </Pressable>
          </View>

          {/* Sign up */}
          <View style={styles.signupContainer}>
            <ThemedText style={styles.signupText}>
              Don't have an account?{' '}
            </ThemedText>

            <ThemedText style={styles.signupLink}>
              Sign Up
            </ThemedText>
          </View>

        </View>
      </SafeAreaView>
    </View>
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

  loginCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    paddingHorizontal: 28,
    paddingTop: 20,
    justifyContent: 'center',
  },

  pinkCircleOne: {
    position: 'absolute',
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: '#F9DDE8',
    top: -55,
    right: -45,
  },

  pinkCircleTwo: {
    position: 'absolute',
    width: 125,
    height: 125,
    borderRadius: 63,
    backgroundColor: '#F0E1E7',
    top: 65,
    right: 65,
  },

  pinkShape: {
    position: 'absolute',
    width: 180,
    height: 110,
    borderRadius: 70,
    backgroundColor: '#F9DDE8',
    top: 105,
    left: -75,
    transform: [{ rotate: '-20deg' }],
  },

  header: {
    backgroundColor: 'transparent',
    marginBottom: 55,
    zIndex: 2,
  },

  welcome: {
    fontSize: 30,
    fontWeight: '700',
    color: '#5A1735',
  },

  logo: {
    fontSize: 32,
    fontWeight: '700',
    color: '#5A1735',
    marginTop: 2,
  },

  form: {
    backgroundColor: 'transparent',
    zIndex: 2,
  },

  input: {
    height: 52,
    borderBottomWidth: 1.5,
    borderBottomColor: '#7A2348',
    fontSize: 16,
    color: '#3F3036',
    paddingHorizontal: 2,
  },

  forgotPassword: {
    fontSize: 14,
    color: '#7A2348',
    marginTop: 14,
  },

  loginButton: {
    height: 56,
    borderRadius: 28,
    backgroundColor: '#5A1735',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 42,
  },

  loginButtonPressed: {
    opacity: 0.7,
  },

  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    marginTop: 45,
    zIndex: 2,
  },

  signupText: {
    fontSize: 13,
    color: '#6F5962',
  },

  signupLink: {
    fontSize: 13,
    fontWeight: '700',
    color: '#7A2348',
  },
});