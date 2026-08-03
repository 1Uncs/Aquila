import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ScreenView } from '@/core/components/ScreenView';
import { ThemedText, Card, EmptyState } from '@/core/components';
import { Ionicons } from '@expo/vector-icons';
import { usePartiesQuery } from '@/features/elections/hooks';
import { spacing, shadows, radius, sizes } from '@/constants/tokens';
import { useColorScheme } from '@/core/hooks/useColorScheme';
import Colors from '@/constants/colors';

export default function PartiesScreen() {
  const { data: parties = [] } = usePartiesQuery();
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

  return (
    <ScreenView scrollable keyboardShouldPersistTaps="handled">
      <View style={{ paddingBottom: spacing.xxl }}>
        <ThemedText variant="h2" style={{ marginHorizontal: 16, marginTop: spacing.md, marginBottom: spacing.sm }}>
          Political Parties
        </ThemedText>
        <ThemedText variant="body" color="textSecondary" style={{ marginHorizontal: 16, marginBottom: spacing.lg }}>
          Registered parties participating in elections
        </ThemedText>

        {parties.length === 0 ? (
          <EmptyState icon="people-outline" title="No Parties" subtitle="No parties registered yet" />
        ) : (
          parties.map((party) => (
            <Card key={party.id} style={shadows.sm}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                <View style={[styles.partyBadge, { backgroundColor: colors.primary + '15' }]}>
                  <ThemedText variant="label" style={{ color: colors.primary, fontWeight: '700' }}>
                    {party.acronym}
                  </ThemedText>
                </View>
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
            </Card>
          ))
        )}
      </View>
    </ScreenView>
  );
}

const styles = StyleSheet.create({
  partyBadge: {
    width: sizes.icon,
    height: sizes.icon,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
