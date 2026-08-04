import React from 'react';
import { View, StyleSheet } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { ScreenView } from '@/core/components/ScreenView';
import { ThemedText, FlashListItem, EmptyState } from '@/core/components';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { usePartiesQuery } from '@/features/elections/hooks';
import { spacing, radius, sizes, gradientPresets } from '@/constants/tokens';
import { useColorScheme } from '@/core/hooks/useColorScheme';
import Colors from '@/constants/colors';

export default function PartiesScreen() {
  const { data: parties = [] } = usePartiesQuery();
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

  return (
    <ScreenView scrollable keyboardShouldPersistTaps="handled" skipAndroidTopPadding>
      <FlashList
        data={parties}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View>
            <ThemedText variant="h2" style={{ marginBottom: spacing.sm }}>
              Political Parties
            </ThemedText>
            <ThemedText variant="body" color="textSecondary" style={{ marginBottom: spacing.lg }}>
              Registered parties participating in elections
            </ThemedText>

            {parties.length === 0 ? (
              <EmptyState icon="people-outline" title="No Parties" subtitle="No parties registered yet" />
            ) : null}
          </View>
        }
        renderItem={({ item: party }) => (
          <FlashListItem id={party.id}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
              <LinearGradient colors={gradientPresets.accent} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.partyBadge, { borderRadius: radius.lg }]}>
                <ThemedText variant="label" style={{ color: '#fff', fontWeight: '700' }}>
                  {party.acronym}
                </ThemedText>
              </LinearGradient>
              <View style={{ flex: 1 }}>
                <ThemedText variant="body" style={{ fontWeight: '600' }}>
                  {party.name}
                </ThemedText>
                <ThemedText variant="caption" color="textSecondary">
                  Code: {party.code} · {party.status}
                </ThemedText>
              </View>
              <Ionicons
                name={party.status === 'ACTIVE' ? 'checkmark-circle' : 'close-circle'}
                size={20}
                color={party.status === 'ACTIVE' ? colors.success : colors.textMuted}
              />
            </View>
          </FlashListItem>
        )}
        contentContainerStyle={{ paddingHorizontal: spacing.md, paddingBottom: spacing.xxl }}
      />
    </ScreenView>
  );
}

const styles = StyleSheet.create({
  partyBadge: {
    width: sizes.icon,
    height: sizes.icon,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
