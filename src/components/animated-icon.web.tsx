import { StyleSheet, View } from 'react-native';
import Animated, { Easing, Keyframe } from 'react-native-reanimated';

import { Colors } from '@/constants/theme';

const DURATION = 300;

export function AnimatedSplashOverlay() {
return null;
}

const keyframe = new Keyframe({
0: {
transform: [{ scale: 0 }],
},
60: {
transform: [{ scale: 1.2 }],
easing: Easing.elastic(1.2),
},
100: {
transform: [{ scale: 1 }],
easing: Easing.elastic(1.2),
},
});

const logoKeyframe = new Keyframe({
0: {
opacity: 0,
},
60: {
transform: [{ scale: 1.2 }],
opacity: 0,
easing: Easing.elastic(1.2),
},
100: {
transform: [{ scale: 1 }],
opacity: 1,
easing: Easing.elastic(1.2),
},
});

export function AnimatedIcon() {
return (
<View style={styles.iconContainer}>
<Animated.View
entering={keyframe.duration(DURATION)}
style={styles.background}
>
<View style={styles.logoMark}>
<View style={styles.logoInner} />
</View>
</Animated.View>

  <Animated.View
    style={styles.imageContainer}
    entering={logoKeyframe.duration(DURATION)}
  >
    <View style={styles.logoMark}>
      <View style={styles.logoInner} />
    </View>
  </Animated.View>
</View>

);
}

const styles = StyleSheet.create({
imageContainer: {
justifyContent: 'center',
alignItems: 'center',
position: 'absolute',
},
iconContainer: {
justifyContent: 'center',
alignItems: 'center',
width: 128,
height: 128,
},
background: {
width: 128,
height: 128,
position: 'absolute',
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
});