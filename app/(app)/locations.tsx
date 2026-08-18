import React, { useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { ScreenView } from '@/core/components/ScreenView';
import { ThemedText, FlashListItem, EmptyState, Card, Button } from '@/core/components';
import { Ionicons } from '@expo/vector-icons';
import { spacing, radius, shadows, sizes } from '@/constants/tokens';
import { useColorScheme } from '@/core/hooks/useColorScheme';
import { useStatusBar } from '@/core/hooks/useStatusBar';
import { useStatesQuery, useLgasQuery, usePollingUnitsQuery, useWardsQuery, useSenatorialDistrictsQuery, useConstituenciesQuery } from '@/features/elections/hooks';
import { useLocationsStore } from '@/features/auth/store';
import Colors from '@/constants/colors';

type SubUnitType = 'lgas' | 'wards' | 'pus' | 'senatorial' | 'constituencies';

type SubUnitItem = {
  type: SubUnitType;
  label: string;
  sub: string;
  icon: keyof typeof Ionicons.glyphMap;
};

type DrillItem = {
  id: string;
  name: string;
  sub?: string;
};

type DrillLevel = 'states' | 'subUnits' | 'lgas' | 'wards' | 'pus' | 'senatorial' | 'constituencies';

export default function LocationsScreen() {
  const { data: states = [] } = useStatesQuery();
  const { data: lgas = [] } = useLgasQuery();
  const { data: pollingUnits = [] } = usePollingUnitsQuery();
  const { data: wards = [] } = useWardsQuery();
  const { data: senatorialDistricts = [] } = useSenatorialDistrictsQuery();
  const { data: constituencies = [] } = useConstituenciesQuery();
  const { selectedStateId, selectedLgaId, setSelectedStateId, setSelectedLgaId } = useLocationsStore();
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  useStatusBar({ barStyle: scheme === 'dark' ? 'light' : 'dark' });

  const [drillLevel, setDrillLevel] = useState<DrillLevel>('states');
  const [selectedStateName, setSelectedStateName] = useState<string | null>(null);
  const [selectedSubUnit, setSelectedSubUnit] = useState<SubUnitType | null>(null);

  const selectedStateLgas = selectedStateId ? lgas.filter((l) => l.stateId === selectedStateId) : [];
  const selectedLgaWards = selectedLgaId ? wards.filter((w) => w.lgaId === selectedLgaId) : [];
  const selectedLgaPus = selectedLgaId ? pollingUnits.filter((p) => p.lgaId === selectedLgaId) : [];
  const selectedStateDistricts = selectedStateId ? senatorialDistricts.filter((d) => d.stateId === selectedStateId) : [];
  const selectedStateConstituencies = selectedStateId ? constituencies.filter((c) => c.stateId === selectedStateId) : [];

  useEffect(() => {
    if (selectedStateId && drillLevel === 'states') {
      setDrillLevel('subUnits');
      const st = states.find((s) => s.id === selectedStateId);
      setSelectedStateName(st?.name ?? null);
    }
  }, [selectedStateId, drillLevel, states]);

  const handleStateSelect = (stateId: string) => {
    setSelectedStateId(stateId);
  };

  const handleSubUnitSelect = (type: SubUnitType) => {
    setSelectedSubUnit(type);
    if (type === 'wards' || type === 'pus') {
      setDrillLevel(type === 'wards' ? 'wards' : 'pus');
    } else if (type === 'lgas') {
      setDrillLevel('lgas');
    } else {
      setDrillLevel(type === 'senatorial' ? 'senatorial' : 'constituencies');
    }
  };

  const handleLgaSelect = (lgaId: string) => {
    setSelectedLgaId(lgaId);
    setDrillLevel(selectedSubUnit === 'wards' ? 'wards' : 'pus');
  };

  const handleBack = () => {
    if (drillLevel === 'wards' || drillLevel === 'pus') {
      setDrillLevel('subUnits');
      setSelectedLgaId(null);
    } else if (drillLevel === 'lgas' || drillLevel === 'senatorial' || drillLevel === 'constituencies') {
      setDrillLevel('subUnits');
      setSelectedStateId(null);
      setSelectedStateName(null);
    } else {
      setDrillLevel('states');
      setSelectedStateId(null);
      setSelectedStateName(null);
      setSelectedSubUnit(null);
    }
  };

  const SUB_UNITS: SubUnitItem[] = [
    { type: 'lgas', icon: 'map-outline', label: 'LGAs / Area Councils', sub: 'Local Government Areas' },
    { type: 'wards', icon: 'git-branch-outline', label: 'Wards', sub: 'Electoral Wards' },
    { type: 'pus', icon: 'business-outline', label: 'Polling Units', sub: 'Polling Unit registry' },
    { type: 'senatorial', icon: 'map', label: 'Senatorial Districts', sub: 'Senatorial Areas' },
    { type: 'constituencies', icon: 'people-outline', label: 'Constituencies', sub: 'Federal & State Constituencies' },
  ];

  const getListData = (): DrillItem[] => {
    if (drillLevel === 'lgas') return selectedStateLgas.map((l) => ({ id: l.id, name: l.name, sub: l.stateId }));
    if (drillLevel === 'wards') return selectedLgaWards.map((w) => ({ id: w.id, name: w.name, sub: w.lgaName }));
    if (drillLevel === 'pus') return selectedLgaPus.map((p) => ({ id: p.id, name: p.name, sub: p.code }));
    if (drillLevel === 'senatorial') return selectedStateDistricts.map((d) => ({ id: d.id, name: d.name, sub: d.stateName }));
    if (drillLevel === 'constituencies') return selectedStateConstituencies.map((c) => ({ id: c.id, name: c.name, sub: c.type }));
    return [];
  };

  const getHeaderLabel = (): string => {
    if (drillLevel === 'lgas') return `LGAs in ${selectedStateName ?? 'Selected State'}`;
    if (drillLevel === 'wards') return 'Wards';
    if (drillLevel === 'pus') return 'Polling Units';
    if (drillLevel === 'senatorial') return `Senatorial Districts in ${selectedStateName ?? 'Selected State'}`;
    if (drillLevel === 'constituencies') return `Constituencies in ${selectedStateName ?? 'Selected State'}`;
    return 'States & FCT';
  };

  const listData = getListData();
  const isEmpty = drillLevel !== 'states' && listData.length === 0;

  return (
    <ScreenView scrollable keyboardShouldPersistTaps="handled" skipAndroidTopPadding>
      <FlashList
        data={drillLevel === 'states' ? SUB_UNITS : listData as DrillItem[]}
        keyExtractor={(item: any) => 'label' in item ? item.label : item.id}
        ListHeaderComponent={
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm }}>
              {(drillLevel as string) !== 'states' ? (
                <Button label="Back" variant="ghost" size="sm" onPress={handleBack} leftIcon="arrow-back" />
              ) : null}
              <View style={[styles.titleIndicator, { backgroundColor: colors.primary }]} />
              <ThemedText variant="h2" style={{ flex: 1, marginBottom: 0 }}>Electoral Geography</ThemedText>
            </View>
            <ThemedText variant="body" color="textSecondary" style={{ marginBottom: spacing.lg }}>
              {drillLevel === 'states' ? 'Manage electoral locations across Nigeria' : getHeaderLabel()}
            </ThemedText>

            {drillLevel === 'states' && (
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
                      onPress={() => handleStateSelect(state.id)}
                      style={{ marginBottom: spacing.sm }}
                    />
                  ))}
                </View>
              </Card>
            )}

            {isEmpty && (drillLevel as string) !== 'states' && (
              <EmptyState
                icon="location-outline"
                title="No Items"
                subtitle={`No items found for this selection`}
              />
            )}
          </View>
        }
        renderItem={({ item }) => {
          if ('label' in item) {
            const unit = item as SubUnitItem;
            return (
              <FlashListItem id={unit.label} pressable onPress={() => handleSubUnitSelect(unit.type)}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
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
          const isLgaLevelItem = drillLevel === 'lgas';
          return (
            <FlashListItem id={entry.id} pressable onPress={() => isLgaLevelItem ? handleLgaSelect(entry.id) : undefined}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                <View style={[styles.iconCircle, { backgroundColor: colors.accent + '20' }]}>
                  <Ionicons name={isLgaLevelItem ? 'location' : drillLevel === 'wards' ? 'git-branch-outline' : drillLevel === 'pus' ? 'business-outline' : drillLevel === 'senatorial' ? 'map' : 'people-outline'} size={22} color={colors.accent} />
                </View>
                <View style={{ flex: 1 }}>
                  <ThemedText variant="body" style={{ fontWeight: '600' }}>{entry.name}</ThemedText>
                  {entry.sub ? <ThemedText variant="caption" color="textSecondary">{entry.sub}</ThemedText> : null}
                </View>
                {isLgaLevelItem && <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />}
              </View>
            </FlashListItem>
          );
        }}
        contentContainerStyle={{ paddingBottom: spacing.xxl }}
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
  titleIndicator: { width: 4, height: 16, borderRadius: radius.full },
});
