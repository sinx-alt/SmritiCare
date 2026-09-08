import * as SplashScreen from 'expo-splash-screen';
import { useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, { Easing, Keyframe } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { Colors } from '@/constants/theme';

const INITIAL_SCALE_FACTOR = Dimensions.get('screen').height / 90;
const DURATION = 600;

export function AnimatedSplashOverlay() {
const [animate, setAnimate] = useState(false);
const [visible, setVisible] = useState(true);

if (!visible) return null;

const splashKeyframe = new Keyframe({
0: {
transform: [{ scale: 1 }],
opacity: 1,
},
20: {
opacity: 1,
},
70: {
opacity: 0,
easing: Easing.elastic(0.7),
},
100: {
opacity: 0,
transform: [{ scale: 1 }],
easing: Easing.elastic(0.7),
},
});

return animate ? (
<Animated.View
entering={splashKeyframe.duration(DURATION).withCallback((finished) => {
'worklet';

    if (finished) {
      scheduleOnRN(setVisible, false);
    }
  })}
  style={styles.splashOverlay}
>
  <View style={styles.logoMark}>
    <View style={styles.logoInner} />
  </View>
</Animated.View>

) : (
<View
onLayout={() => {
SplashScreen.hideAsync().finally(() => {
setAnimate(true);
});
}}
style={styles.splashOverlay}
>
<View style={styles.logoMark}>
<View style={styles.logoInner} />
</View>
</View>
);
}

const keyframe = new Keyframe({
0: {
transform: [{ scale: INITIAL_SCALE_FACTOR }],
},
100: {
transform: [{ scale: 1 }],
easing: Easing.elastic(0.7),
},
});

export function AnimatedIcon() {
return (
<View style={styles.iconContainer}>
<Animated.View
entering={keyframe.duration(DURATION)}
style={styles.iconBackground}
>
<View style={styles.logoMark}>
<View style={styles.logoInner} />
</View>
</Animated.View>
</View>
);
}

const styles = StyleSheet.create({
iconContainer: {
justifyContent: 'center',
alignItems: 'center',
width: 128,
height: 128,
},
iconBackground: {
justifyContent: 'center',
alignItems: 'center',
width: 128,
height: 128,
borderRadius: 40,
backgroundColor: Colors.light.primary,
},
logoMark: {
width: 52,
height: 52,
borderRadius: 16,
borderWidth: 4,
borderColor: Colors.light.background,
justifyContent: 'center',
alignItems: 'center',
},
logoInner: {
width: 20,
height: 20,
borderRadius: 6,
backgroundColor: Colors.light.background,
},
splashOverlay: {
...StyleSheet.absoluteFill,
backgroundColor: Colors.light.background,
alignItems: 'center',
justifyContent: 'center',
zIndex: 1000,
},
});