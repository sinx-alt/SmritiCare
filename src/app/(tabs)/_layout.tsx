import { Tabs } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors, BottomTabInset } from '@/constants/theme';

type TabIconProps = {
  type: 'home' | 'games' | 'reminders' | 'care';
  focused: boolean;
};

function TabIcon({ type, focused }: TabIconProps) {
  const color = focused
    ? Colors.light.accent
    : Colors.light.textMuted;

  return (
    <View style={styles.iconContainer}>
      {type === 'home' && (
        <View
          style={[
            styles.homeIcon,
            { borderColor: color },
          ]}
        >
          <View
            style={[
              styles.homeRoofLeft,
              { backgroundColor: color },
            ]}
          />

          <View
            style={[
              styles.homeRoofRight,
              { backgroundColor: color },
            ]}
          />

          <View
            style={[
              styles.homeDoor,
              { backgroundColor: color },
            ]}
          />
        </View>
      )}

      {type === 'games' && (
        <View style={styles.gamesIcon}>
          <View
            style={[
              styles.outerDiamond,
              { borderColor: color },
            ]}
          />

          <View
            style={[
              styles.innerDiamond,
              { borderColor: color },
            ]}
          />
        </View>
      )}

      {type === 'reminders' && (
        <View
          style={[
            styles.circleIcon,
            { borderColor: color },
          ]}
        >
          <ThemedText
            style={[
              styles.heart,
              { color },
            ]}
          >
            ♡
          </ThemedText>
        </View>
      )}

      {type === 'care' && (
        <View
          style={[
            styles.careIcon,
            { borderColor: color },
          ]}
        >
          <ThemedText
            style={[
              styles.heart,
              { color },
            ]}
          >
            ♡
          </ThemedText>
        </View>
      )}

      {focused && (
        <View
          style={[
            styles.activeDot,
            { backgroundColor: Colors.light.accent },
          ]}
        />
      )}
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,

        headerTitleAlign: 'center',

        headerStyle: {
          backgroundColor: Colors.light.background,
        },

        headerTintColor: Colors.light.accent,

        headerTitleStyle: {
          fontWeight: '700',
          color: Colors.light.primary,
        },

        tabBarActiveTintColor: Colors.light.accent,
        tabBarInactiveTintColor: Colors.light.textMuted,

        tabBarStyle: {
          backgroundColor: Colors.light.background,
          borderTopColor: Colors.light.border,
          height: 64 + BottomTabInset,
          paddingTop: 0,
          paddingBottom: BottomTabInset + 5,
        },

        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginTop: -1,
          marginBottom: 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarLabel: 'HOME',
          tabBarIcon: ({ focused }) => (
            <TabIcon
              type="home"
              focused={focused}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="games"
        options={{
          title: 'Games',
          tabBarLabel: 'GAMES',
          tabBarIcon: ({ focused }) => (
            <TabIcon
              type="games"
              focused={focused}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="reminders"
        options={{
          title: 'Reminders',
          tabBarLabel: 'REMINDERS',
          tabBarIcon: ({ focused }) => (
            <TabIcon
              type="reminders"
              focused={focused}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="care"
        options={{
          title: 'Care',
          tabBarLabel: 'CARE',
          tabBarIcon: ({ focused }) => (
            <TabIcon
              type="care"
              focused={focused}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    width: 48,
    height: 30,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },

  homeIcon: {
    width: 16,
    height: 13,
    borderWidth: 1.4,
    borderTopWidth: 0,
    borderRadius: 2,
    marginTop: 4,
    position: 'relative',
  },

  homeRoofLeft: {
    position: 'absolute',
    width: 10,
    height: 1.4,
    left: 0,
    top: -3,
    transform: [{ rotate: '-35deg' }],
  },

  homeRoofRight: {
    position: 'absolute',
    width: 10,
    height: 1.4,
    right: 0,
    top: -3,
    transform: [{ rotate: '35deg' }],
  },

  homeDoor: {
    position: 'absolute',
    width: 3,
    height: 5,
    bottom: 0,
    left: 5,
    borderTopLeftRadius: 1,
    borderTopRightRadius: 1,
  },

  gamesIcon: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },

  outerDiamond: {
    position: 'absolute',
    width: 15,
    height: 15,
    borderWidth: 1.4,
    transform: [{ rotate: '45deg' }],
  },

  innerDiamond: {
    position: 'absolute',
    width: 7,
    height: 7,
    borderWidth: 1.4,
    transform: [{ rotate: '45deg' }],
  },

  circleIcon: {
    width: 18,
    height: 18,
    borderWidth: 1.4,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },

  careIcon: {
    width: 18,
    height: 18,
    borderWidth: 1.4,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },

  heart: {
    fontSize: 13,
    lineHeight: 15,
    fontWeight: '400',
    marginTop: -1,
  },

  activeDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    marginTop: 2,
  },
});