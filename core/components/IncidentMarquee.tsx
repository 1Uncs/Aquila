import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing, ScrollView } from 'react-native';
import { ThemedText } from '@/core/components/ThemedText';
import { spacing, radius } from '@/constants/tokens';
import Colors from '@/constants/colors';
import { useColorScheme } from '@/core/hooks/useColorScheme';
import type { IncidentReport } from '@/features/auth/store';

type Props = {
  incidents: IncidentReport[];
  style?: import('react-native').ViewStyle;
};

export function IncidentMarquee({ incidents, style }: Props) {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const translateX = useRef(new Animated.Value(0)).current;
  const contentWidthRef = useRef(0);
  const containerWidthRef = useRef(0);

  // Build ticker text: "Ballot snatching at Street X — They are beating people at Apapa — ..."
  const tickerText =
    incidents.length === 0
      ? ''
      : incidents
          .slice(0, 10)
          .map((i) => `${i.category.replace(/_/g, ' ')} @ ${i.electoralArea}: ${i.description.slice(0, 48)}`)
          .join('  \u2022  ');

  useEffect(() => {
    if (!tickerText || contentWidthRef.current === 0 || containerWidthRef.current === 0) return;
    const distance = contentWidthRef.current + containerWidthRef.current;
    const duration = Math.max(12_000, (distance / 60) * 1000);
    translateX.setValue(containerWidthRef.current);
    const anim = Animated.loop(
      Animated.timing(translateX, {
        toValue: -contentWidthRef.current,
        duration,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    anim.start();
    return () => anim.stop();
  }, [tickerText, translateX]);

  if (incidents.length === 0 || !tickerText) return null;

  return (
    <View
      style={[styles.container, { backgroundColor: colors.critical + '14', borderColor: colors.critical + '30' }, style]}
      onLayout={(e) => {
        containerWidthRef.current = e.nativeEvent.layout.width;
      }}
      accessibilityRole="text"
      accessibilityLabel={`Live incidents: ${tickerText}`}
    >
      <View style={[styles.label, { backgroundColor: colors.critical }]}>
        <ThemedText variant="caption" style={{ color: '#fff', fontWeight: '700' }}>
          LIVE
        </ThemedText>
      </View>
      <View style={styles.track}>
        <Animated.View
          style={{ transform: [{ translateX }] }}
          onLayout={(e) => {
            contentWidthRef.current = e.nativeEvent.layout.width;
          }}
        >
          <ThemedText variant="caption" style={{ color: colors.critical, fontWeight: '500' }} numberOfLines={1}>
            {tickerText}
          </ThemedText>
        </Animated.View>
      </View>
    </View>
  );
}

// Fallback scrollable marquee for web / when native driver unavailable
export function IncidentMarqueeScrollable({ incidents, style }: Props) {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  if (incidents.length === 0) return null;
  return (
    <View style={[styles.container, { backgroundColor: colors.critical + '14', borderColor: colors.critical + '30' }, style]}>
      <View style={[styles.label, { backgroundColor: colors.critical }]}>
        <ThemedText variant="caption" style={{ color: '#fff', fontWeight: '700' }}>
          LIVE
        </ThemedText>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.track} contentContainerStyle={{ gap: spacing.md }}>
        {incidents.slice(0, 8).map((i) => (
          <ThemedText key={i.id} variant="caption" style={{ color: colors.textSecondary, fontWeight: '500' }} numberOfLines={1}>
            {i.category.replace(/_/g, ' ')} @ {i.electoralArea} {'\u2022'}
          </ThemedText>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radius.full,
    overflow: 'hidden',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xs,
    gap: spacing.sm,
  },
  label: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  track: {
    flex: 1,
    overflow: 'hidden',
  },
});
