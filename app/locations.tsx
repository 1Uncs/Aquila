import React from 'react';
import { StyleSheet, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { ScreenView } from '@/core/components/ScreenView';
import { ThemedText, FlashListItem, EmptyState, Card } from '@/core/components';
import { Ionicons } from '@expo/vector-icons';
import { spacing, radius, shadows, border, sizes } from '@/constants/tokens';
import { useColorScheme } from '@/core/hooks/useColorScheme';
import { useStatesQuery } from '@/features/elections/hooks';
import Colors from '@/constants/colors';

export default function LocationsScreen() {
  const { data: states = [] } = useStatesQuery();
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

  const SUB_UNITS = [
    { icon: 'map-outline', label: 'LGAs / Area Councils', sub: 'Local Government Areas' },
    { icon: 'git-branch-outline', label: 'Wards', sub: 'Electoral Wards' },
    { icon: 'business-outline', label: 'Polling Units', sub: 'Polling Unit registry' },
    { icon: 'map', label: 'Senatorial Districts', sub: 'Senatorial Areas' },
    { icon: 'people-outline', label: 'Constituencies', sub: 'Federal & State Constituencies' },
  ] as const;

  return (
    <ScreenView scrollable keyboardShouldPersistTaps="handled" skipAndroidTopPadding>
      <FlashList
        data={SUB_UNITS}
        keyExtractor={(item) => item.label}
        ListHeaderComponent={
          <View>
            <ThemedText variant="h2" style={{ marginBottom: spacing.sm }}>
              Electoral Geography
            </ThemedText>
            <ThemedText variant="body" color="textSecondary" style={{ marginBottom: spacing.lg }}>
              Manage electoral locations across Nigeria
            </ThemedText>

            {states.length === 0 ? (
              <EmptyState icon="location-outline" title="Loading..." subtitle="Fetching electoral geography" />
            ) : (
              <Card style={shadows.md}>
                <ThemedText variant="h3" style={{ marginBottom: spacing.md }}>
                  States & FCT ({states.length})
                </ThemedText>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, paddingHorizontal: spacing.md }}>
                  {states.map((state) => (
                    <View
                      key={state.id}
                      style={[styles.stateChip, { backgroundColor: colors.accent + '18', borderColor: colors.accent + '50' }]}
                    >
                      <ThemedText variant="caption" style={{ color: colors.primary, fontWeight: '600' }}>
                        {state.name}
                      </ThemedText>
                    </View>
                  ))}
                </View>
              </Card>
            )}

            <ThemedText variant="h3" style={{ marginHorizontal: spacing.md, marginTop: spacing.xl, marginBottom: spacing.sm }}>
              Sub-Units
            </ThemedText>
          </View>
        }
        renderItem={({ item }) => (
          <FlashListItem id={item.label} pressable>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.md, paddingVertical: spacing.md }}>
              <View style={[styles.iconCircle, { backgroundColor: colors.accent + '20' }]}>
                <Ionicons name={item.icon as any} size={22} color={colors.accent} />
              </View>
              <View>
                <ThemedText variant="body" style={{ fontWeight: '600' }}>{item.label}</ThemedText>
                <ThemedText variant="caption" color="textSecondary">{item.sub}</ThemedText>
              </View>
            </View>
          </FlashListItem>
        )}
        contentContainerStyle={{ paddingHorizontal: spacing.md, paddingBottom: spacing.xxl }}
      />
    </ScreenView>
  );
}

const styles = StyleSheet.create({
  stateChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: border.thin,
  },
  iconCircle: {
    width: sizes.icon,
    height: sizes.icon,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
