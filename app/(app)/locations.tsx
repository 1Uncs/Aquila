import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { ScreenView } from '@/core/components/ScreenView';
import { ThemedText, FlashListItem, Card, Button } from '@/core/components';
import { Ionicons } from '@expo/vector-icons';
import { spacing, radius, shadows, sizes } from '@/constants/tokens';
import { useColorScheme } from '@/core/hooks/useColorScheme';
import { useStatusBar } from '@/core/hooks/useStatusBar';
import { useStatesQuery, useLgasQuery, usePollingUnitsQuery, useWardsQuery, useSenatorialDistrictsQuery, useConstituenciesQuery } from '@/features/elections/hooks';
import Colors from '@/constants/colors';

export default function LocationsScreen() {
  const { data: states = [] } = useStatesQuery();
  const { data: lgas = [] } = useLgasQuery();
  const { data: pollingUnits = [] } = usePollingUnitsQuery();
  const { data: wards = [] } = useWardsQuery();
  const { data: senatorialDistricts = [] } = useSenatorialDistrictsQuery();
  const { data: constituencies = [] } = useConstituenciesQuery();
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  useStatusBar({ barStyle: scheme === 'dark' ? 'light' : 'dark' });

  const [selectedStateId, setSelectedStateId] = useState<string | null>(null);

  const countsFor = (stateId: string) => ({
    lgas: lgas.filter((l) => l.stateId === stateId).length,
    wards: wards.filter((w) => {
      const lga = lgas.find((l) => l.id === w.lgaId);
      return lga?.stateId === stateId;
    }).length,
    pus: pollingUnits.filter((p) => p.stateId === stateId || lgas.find((l) => l.id === p.lgaId)?.stateId === stateId).length,
    senatorial: senatorialDistricts.filter((d) => d.stateId === stateId).length,
    constituencies: constituencies.filter((c) => c.stateId === stateId).length,
  });

  const selected = states.find((s) => s.id === selectedStateId);
  const selectedCounts = selectedStateId ? countsFor(selectedStateId) : null;

  return (
    <ScreenView scrollable keyboardShouldPersistTaps="handled" skipAndroidTopPadding>
      <View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm }}>
          <View style={[styles.titleIndicator, { backgroundColor: colors.primary }]} />
          <ThemedText variant="h2" style={{ flex: 1, marginBottom: 0 }}>Electoral Geography</ThemedText>
        </View>
        <ThemedText variant="body" color="textSecondary" style={{ marginBottom: spacing.lg }}>
          Manage electoral locations across Nigeria
        </ThemedText>

        <Card style={shadows.md}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md }}>
            <View style={[styles.titleIndicator, { backgroundColor: colors.accent }]} />
            <ThemedText variant="h3" style={{ flex: 1 }}>States & FCT ({states.length})</ThemedText>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            {states.map((state) => (
              <Button
                key={state.id}
                label={state.name}
                size="sm"
                variant={selectedStateId === state.id ? 'primary' : 'outline'}
                onPress={() => setSelectedStateId(selectedStateId === state.id ? null : state.id)}
                style={{ marginBottom: spacing.sm }}
              />
            ))}
          </View>
        </Card>

        {selected && selectedCounts && (
          <Card style={[{ marginTop: spacing.lg }, shadows.md]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md }}>
              <View style={[styles.titleIndicator, { backgroundColor: colors.primary }]} />
              <ThemedText variant="h3" style={{ flex: 1 }}>{selected.name} overview</ThemedText>
            </View>
            <FlashList
              data={[
                { id: 'lgas', icon: 'map-outline' as const, label: 'LGAs / Area Councils', value: selectedCounts.lgas },
                { id: 'wards', icon: 'git-branch-outline' as const, label: 'Wards', value: selectedCounts.wards },
                { id: 'pus', icon: 'business-outline' as const, label: 'Polling Units', value: selectedCounts.pus },
                { id: 'senatorial', icon: 'map' as const, label: 'Senatorial Districts', value: selectedCounts.senatorial },
                { id: 'constituencies', icon: 'people-outline' as const, label: 'Constituencies', value: selectedCounts.constituencies },
              ]}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <FlashListItem id={item.id}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                    <View style={[styles.iconCircle, { backgroundColor: colors.accent + '20' }]}>
                      <Ionicons name={item.icon} size={22} color={colors.accent} />
                    </View>
                    <ThemedText variant="body" style={{ fontWeight: '600', flex: 1 }}>{item.label}</ThemedText>
                    <ThemedText variant="body" color="textSecondary">{item.value}</ThemedText>
                  </View>
                </FlashListItem>
              )}
            />
          </Card>
        )}
      </View>
    </ScreenView>
  );
}

const styles = StyleSheet.create({
  iconCircle: {
    width: sizes.icon,
    height: sizes.icon,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleIndicator: { width: 4, height: 16, borderRadius: radius.full },
});
