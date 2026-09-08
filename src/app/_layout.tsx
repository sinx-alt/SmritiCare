import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';

import { ReminderProvider } from '@/context/ReminderContext';

export default function RootLayout() {
  return (
    <ReminderProvider>
      <ThemeProvider value={DefaultTheme}>
        <Stack>
          <Stack.Screen
            name="login"
            options={{
              headerShown: false,
            }}
          />

          <Stack.Screen
            name="(tabs)"
            options={{
              headerShown: false,
            }}
          />

          <Stack.Screen
            name="activity"
            options={{
              title: "Today's Activity",
            }}
          />

          <Stack.Screen
            name="webview"
            options={{
              title: 'WebView',
            }}
          />

          <Stack.Screen
            name="game"
            options={{
              headerShown: false,
            }}
          />
        </Stack>
      </ThemeProvider>
    </ReminderProvider>
  );
}