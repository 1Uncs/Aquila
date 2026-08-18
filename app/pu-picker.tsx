import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { ScreenView } from '@/core/components/ScreenView';
import { ThemedText, FlashListItem, EmptyState, Input, Button } from '@/core/components';
import { router, useLocalSearchParams } from 'expo-router';
import { spacing, radius } from '@/constants/tokens';
import { useColorScheme } from '@/core/hooks/useColorScheme';
import { useStatusBar } from '@/core/hooks/useStatusBar';
import { usePollingUnitsQuery, useLgasQuery, useStatesQuery } from '@/features/elections/hooks';
import { useAuthStore } from '@/features/auth/store';
import Colors from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';

export default function PUPickerScreen() {
  const params = useLocalSearchParams<{ mode?: string; electionId?: string }>();
  const mode = params.mode === 'incident' ? 'incident' : 'result';
  const { data: pollingUnits = [], isLoading: pusLoading } = usePollingUnitsQuery();
  const { data: lgas = [] } = useLgasQuery();
  const { data: states = [] } = useStatesQuery();
  const [search, setSearch] = useState('');
  const [selectedLga, setSelectedLga] = useState<string | null>(null);
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  useStatusBar({ barStyle: scheme === 'dark' ? 'light' : 'dark' });

  const lgaMap = new Map(lgas.map((l) => [l.id, l]));
  const stateMap = new Map(states.map((s) => [s.id, s]));

  const filtered = search
    ? pollingUnits.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.code.toLowerCase().includes(search.toLowerCase())
      )
    : selectedLga
      ? pollingUnits.filter((p) => p.lgaId === selectedLga)
      : pollingUnits;

  const handleSelect = (pu: typeof pollingUnits[0]) => {
    useAuthStore.getState().setSelectedPollingUnit(pu.id, pu.name);
    const route = mode === 'incident' ? '/incident-report' : '/result-submit';
    router.replace({
      pathname: route as any,
      params: {
        pollingUnitId: pu.id,
        pollingUnitName: pu.name,
        ...(params.electionId ? { electionId: params.electionId } : {}),
      },
    });
  };

  return (
    <ScreenView scrollable keyboardShouldPersistTaps="handled" skipAndroidTopPadding>
      <FlashList
        data={filtered}
        keyExtractor={(item) => item.id}
        removeClippedSubviews
        ListHeaderComponent={
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs }}>
              <View style={[styles.titleIndicator, { backgroundColor: colors.primary }]} />
              <ThemedText variant="h2" style={{ flex: 1 }}>Select Polling Unit</ThemedText>
            </View>
            <ThemedText variant="body" color="textSecondary" style={{ marginBottom: spacing.lg }}>
              {mode === 'incident' ? 'Choose location for this incident' : 'Choose polling unit to submit results for'}
            </ThemedText>

            <Input
              label="Search"
              placeholder="Search by name or code..."
              value={search}
              onChangeText={setSearch}
              leftIcon="search"
              containerStyle={{ marginBottom: spacing.md }}
            />

            <ThemedText variant="label" style={{ marginHorizontal: spacing.md, marginBottom: spacing.sm }}>
              Filter by LGA
            </ThemedText>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginHorizontal: spacing.md, marginBottom: spacing.lg }}>
              <Button
                label="All"
                size="sm"
                variant={selectedLga === null ? 'primary' : 'outline'}
                onPress={() => setSelectedLga(null)}
                style={{ marginBottom: spacing.sm }}
              />
              {lgas.slice(0, 20).map((lga) => (
                <Button
                  key={lga.id}
                  label={lga.name}
                  size="sm"
                  variant={selectedLga === lga.id ? 'primary' : 'outline'}
                  onPress={() => setSelectedLga(lga.id === selectedLga ? null : lga.id)}
                  style={{ marginBottom: spacing.sm }}
                />
              ))}
            </View>

            {pusLoading ? (
              <ThemedText variant="body" color="textSecondary" style={{ textAlign: 'center', marginTop: spacing.xl }}>
                Loading polling units...
              </ThemedText>
            ) : filtered.length === 0 ? (
              <EmptyState icon="location-outline" title="No Polling Units" subtitle="Try adjusting your search" />
            ) : null}
          </View>
        }
        renderItem={({ item: pu }) => {
          const lga = lgaMap.get(pu.lgaId);
          const state = stateMap.get(pu.stateId);
          return (
            <FlashListItem id={pu.id} pressable onPress={() => handleSelect(pu)}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                <View style={[styles.puIcon, { backgroundColor: colors.accent + '20' }]}>
                  <Ionicons name="location" size={20} color={colors.accent} />
                </View>
                <View style={{ flex: 1 }}>
                  <ThemedText variant="body" style={{ fontWeight: '600' }}>{pu.name}</ThemedText>
                  <ThemedText variant="caption" color="textSecondary">
                    {pu.code} · {lga?.name ?? pu.lgaName} · {state?.name ?? pu.stateName}
                  </ThemedText>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
              </View>
            </FlashListItem>
          );
        }}
        contentContainerStyle={{ paddingHorizontal: spacing.md, paddingBottom: spacing.xxl }}
      />
    </ScreenView>
  );
}

const styles = StyleSheet.create({
  puIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleIndicator: { width: 4, height: 20, borderRadius: radius.full },
});
