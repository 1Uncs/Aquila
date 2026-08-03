import { NativeTabs, Icon, VectorIcon } from 'expo-router/unstable-native-tabs';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useColorScheme } from '@/core/hooks/useColorScheme';
import Colors from '@/constants/colors';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <NativeTabs
      iconColor={{ default: colors.textMuted, selected: colors.primary }}
      labelStyle={{ fontSize: 10 }}
      backgroundColor={colors.surface}
      disableTransparentOnScrollEdge
    >
      <NativeTabs.Trigger name="index" options={{ title: 'Dashboard' }}>
        <Icon
          sf={{ default: 'house', selected: 'house.fill' }}
          androidSrc={<VectorIcon family={MaterialCommunityIcons} name="home" />}
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="elections" options={{ title: 'Elections' }}>
        <Icon
          sf={{ default: 'doc.text', selected: 'doc.text.fill' }}
          androidSrc={<VectorIcon family={MaterialCommunityIcons} name="file-document" />}
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="results" options={{ title: 'Results' }}>
        <Icon
          sf={{ default: 'chart.bar', selected: 'chart.bar.fill' }}
          androidSrc={<VectorIcon family={MaterialCommunityIcons} name="chart-bar" />}
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="incidents" options={{ title: 'Incidents' }}>
        <Icon
          sf={{ default: 'exclamationmark.triangle', selected: 'exclamationmark.triangle.fill' }}
          androidSrc={<VectorIcon family={MaterialCommunityIcons} name="alert" />}
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile" options={{ title: 'Profile' }}>
        <Icon
          sf={{ default: 'person', selected: 'person.fill' }}
          androidSrc={<VectorIcon family={MaterialCommunityIcons} name="account" />}
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
