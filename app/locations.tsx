import React, { useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { ScreenView } from '@/core/components/ScreenView';
import { ThemedText, FlashListItem, EmptyState, Card, Button } from '@/core/components';
import { Ionicons } from '@expo/vector-icons';
import { spacing, radius, shadows, sizes } from '@/constants/tokens';
import { useColorScheme } from '@/core/hooks/useColorScheme';
import { useStatesQuery, useLgasQuery, usePollingUnitsQuery } from '@/features/elections/hooks';
import { useLocationsStore } from '@/features/auth/store';
import Colors from '@/constants/colors';

type DrillLevel = 'states' | 'lgas' | 'pus';

type SubUnitItem = {
  label: string;
  sub: string;
  icon: keyof typeof Ionicons.glyphMap;
};

type DrillItem = {
  id: string;
  name: string;
  sub?: string;
};

export default function LocationsScreen() {
  const { data: states = [] } = useStatesQuery();
  const { data: lgas = [] } = useLgasQuery();
  const { data: pollingUnits = [] } = usePollingUnitsQuery();
  const { selectedStateId, selectedLgaId, setSelectedStateId, setSelectedLgaId } = useLocationsStore();
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

  const [drillLevel, setDrillLevel] = useState<DrillLevel>('states');
  const [selectedStateName, setSelectedStateName] = useState<string | null>(null);

  const selectedStateLgas = selectedStateId ? lgas.filter((l) => l.stateId === selectedStateId) : [];
  const selectedLgaPus = selectedLgaId ? pollingUnits.filter((p) => p.lgaId === selectedLgaId) : [];

  useEffect(() => {
    if (selectedStateId && drillLevel === 'states') {
      setDrillLevel('lgas');
      const st = states.find((s) => s.id === selectedStateId);
      setSelectedStateName(st?.name ?? null);
    }
    // drillLevel is intentionally omitted — we only want this to fire on selectedStateId change
    // states is stable after initial load and not needed for the side effect
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStateId]);

  const handleStateSelect = (stateId: string) => {
    setSelectedStateId(stateId);
  };

  const handleLgaSelect = (lgaId: string) => {
    setSelectedLgaId(lgaId);
    setDrillLevel('pus');
  };

  const handleBack = () => {
    if (drillLevel === 'pus') {
      setDrillLevel('lgas');
      setSelectedLgaId(null);
    } else if (drillLevel === 'lgas') {
      setDrillLevel('states');
      setSelectedStateId(null);
      setSelectedStateName(null);
    }
  };

  const SUB_UNITS: SubUnitItem[] = [
    { icon: 'map-outline', label: 'LGAs / Area Councils', sub: 'Local Government Areas' },
    { icon: 'git-branch-outline', label: 'Wards', sub: 'Electoral Wards' },
    { icon: 'business-outline', label: 'Polling Units', sub: 'Polling Unit registry' },
    { icon: 'map', label: 'Senatorial Districts', sub: 'Senatorial Areas' },
    { icon: 'people-outline', label: 'Constituencies', sub: 'Federal & State Constituencies' },
  ];

  const listData: Array<SubUnitItem | DrillItem> = drillLevel === 'states' ? SUB_UNITS : selectedStateLgas.map((l) => ({ id: l.id, name: l.name, sub: `${l.stateId}` }));
  const headerLabel = drillLevel === 'states' ? 'States & FCT' : drillLevel === 'lgas' ? `LGAs in ${selectedStateName ?? 'Selected State'}` : 'Polling Units';

  return (
    <ScreenView scrollable keyboardShouldPersistTaps="handled" skipAndroidTopPadding>
      <FlashList
        data={listData}
        keyExtractor={(item) => 'label' in item ? item.label : item.id}
        ListHeaderComponent={
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm }}>
              {drillLevel !== 'states' ? (
                <Button label="Back" variant="ghost" size="sm" onPress={handleBack} leftIcon="arrow-back" />
              ) : null}
              <ThemedText variant="h2" style={{ marginBottom: 0 }}>Electoral Geography</ThemedText>
            </View>
            <ThemedText variant="body" color="textSecondary" style={{ marginBottom: spacing.lg }}>
              {drillLevel === 'states' ? 'Manage electoral locations across Nigeria' : headerLabel}
            </ThemedText>

            {drillLevel === 'states' && (
              <Card style={shadows.md}>
                <ThemedText variant="h3" style={{ marginBottom: spacing.md }}>
                  States & FCT ({states.length})
                </ThemedText>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, paddingHorizontal: spacing.md }}>
                  {states.map((state) => (
                    <Button
                      key={state.id}
                      label={state.name}
                      size="sm"
                      variant={selectedStateId === state.id ? 'primary' : 'outline'}
                      onPress={() => handleStateSelect(state.id)}
                      style={{ marginBottom: spacing.sm }}
                    />
                  ))}
                </View>
              </Card>
            )}

            {drillLevel === 'lgas' && selectedStateLgas.length === 0 && (
              <EmptyState icon="location-outline" title="No LGAs" subtitle="No LGAs found for this state" />
            )}

            {drillLevel === 'pus' && selectedLgaPus.length === 0 && (
              <EmptyState icon="business-outline" title="No Polling Units" subtitle="No polling units found for this LGA" />
            )}
          </View>
        }
        renderItem={({ item }) => {
          if ('label' in item) {
            const unit = item as SubUnitItem;
            return (
              <FlashListItem id={unit.label} pressable>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.md, paddingVertical: spacing.md }}>
                  <View style={[styles.iconCircle, { backgroundColor: colors.accent + '20' }]}>
                    <Ionicons name={unit.icon} size={22} color={colors.accent} />
                  </View>
                  <View>
                    <ThemedText variant="body" style={{ fontWeight: '600' }}>{unit.label}</ThemedText>
                    <ThemedText variant="caption" color="textSecondary">{unit.sub}</ThemedText>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.textMuted} style={{ marginLeft: 'auto' }} />
                </View>
              </FlashListItem>
            );
          }
          const entry = item as DrillItem;
          return (
            <FlashListItem id={entry.id} pressable onPress={() => drillLevel === 'lgas' ? handleLgaSelect(entry.id) : undefined}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.md, paddingVertical: spacing.md }}>
                <View style={[styles.iconCircle, { backgroundColor: colors.accent + '20' }]}>
                  <Ionicons name={drillLevel === 'lgas' ? 'location' : 'business-outline'} size={22} color={colors.accent} />
                </View>
                <View style={{ flex: 1 }}>
                  <ThemedText variant="body" style={{ fontWeight: '600' }}>{entry.name}</ThemedText>
                  {entry.sub ? <ThemedText variant="caption" color="textSecondary">{entry.sub}</ThemedText> : null}
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
  iconCircle: {
    width: sizes.icon,
    height: sizes.icon,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
