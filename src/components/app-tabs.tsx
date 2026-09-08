import { NativeTabs } from 'expo-router/unstable-native-tabs';

import { Colors } from '@/constants/theme';

export default function AppTabs() {
return (
<NativeTabs
backgroundColor={Colors.light.background}
indicatorColor={Colors.light.backgroundElement}
labelStyle={{
selected: {
color: Colors.light.text,
},
}}
>
<NativeTabs.Trigger name="index">
<NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
</NativeTabs.Trigger>

  <NativeTabs.Trigger name="games">
    <NativeTabs.Trigger.Label>Games</NativeTabs.Trigger.Label>
  </NativeTabs.Trigger>

  <NativeTabs.Trigger name="reminders">
    <NativeTabs.Trigger.Label>Reminders</NativeTabs.Trigger.Label>
  </NativeTabs.Trigger>

  <NativeTabs.Trigger name="care">
    <NativeTabs.Trigger.Label>Care</NativeTabs.Trigger.Label>
  </NativeTabs.Trigger>
</NativeTabs>

);
}