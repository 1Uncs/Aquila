import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView, LayoutAnimation } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import { ScreenView } from '@/core/components/ScreenView';
import { ThemedText, FlashListItem, EmptyState, Button, SkeletonCard } from '@/core/components';
import { useElectionsStore } from '@/features/auth/store';
import { ROUTES } from '@/constants/routes';
import { spacing, radius } from '@/constants/tokens';
import { useRefreshControl, useForegroundRefresh } from '@/core/hooks';
import { useColorScheme } from '@/core/hooks/useColorScheme';
import { useStatusBar } from '@/core/hooks/useStatusBar';
import { useElectionsQuery, useElectionCyclesQuery } from '@/features/elections/hooks';
import Colors from '@/constants/colors';

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'textMuted',
  SCHEDULED: 'warning',
  ACTIVE: 'success',
  COMPLETED: 'primary',
  ARCHIVED: 'textSecondary',
};

export default function ElectionsScreen() {
  const { data: cycles = [], isLoading: cyclesLoading } = useElectionCyclesQuery();
  const { data: elections = [], isLoading: electionsLoading, refetch: refetchElections } = useElectionsQuery();
  const [selectedCycle, setSelectedCycle] = useState<string | null>(null);
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  useStatusBar({ barStyle: scheme === 'dark' ? 'light' : 'dark' });
  const { refreshControl } = useRefreshControl(
    cyclesLoading || electionsLoading,
    refetchElections
  );
  useForegroundRefresh([['elections', 'list'], ['elections', 'cycles']], 5 * 60 * 1000);

  const loading = cyclesLoading || electionsLoading;

  useEffect(() => {
    if (cycles.length > 0 && !selectedCycle) {
      setSelectedCycle(cycles[0]!.id);
    }
  }, [cycles, selectedCycle]);

  const filteredElections = selectedCycle
    ? elections.filter((e) => e.cycleId === selectedCycle)
    : elections;

  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

  return (
    <ScreenView scrollable keyboardShouldPersistTaps="handled" refreshControl={refreshControl}>
      <FlashList
        data={filteredElections}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm }}>
              <View style={[styles.titleIndicator, { backgroundColor: colors.primary }]} />
              <ThemedText variant="xl" style={{ flex: 1 }} minFontSize={20} maxFontSize={26}>Elections</ThemedText>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow} keyboardShouldPersistTaps="handled">
              {cycles.map((cycle) => (
                <Button
                  key={cycle.id}
                  label={cycle.name}
                  size="sm"
                  variant={selectedCycle === cycle.id ? 'primary' : 'outline'}
                  onPress={() => setSelectedCycle(cycle.id === selectedCycle ? null : cycle.id)}
                  style={styles.chip}
                />
              ))}
            </ScrollView>

            {loading ? (
              <View style={{ gap: spacing.md, paddingBottom: spacing.md }}>
                <SkeletonCard />
                <SkeletonCard />
              </View>
            ) : filteredElections.length === 0 ? (
              <EmptyState
                icon="document-text-outline"
                title="No Elections Found"
                subtitle="No elections in this cycle yet"
              />
            ) : null}
          </View>
        }
        renderItem={({ item: election }) => {
          const statusColorKey = STATUS_COLORS[election.status] || 'textSecondary';
          const statusColor = colors[statusColorKey as keyof typeof Colors.light] as string;
          return (
            <FlashListItem
              id={election.id}
              pressable
              onPress={() => {
                useElectionsStore.getState().setSelectedElectionId(election.id);
                router.push({ pathname: ROUTES.ELECTION_DETAIL, params: { id: election.id } });
              }}
            >
              <View style={styles.row}>
                <View style={styles.electionInfo}>
                  <ThemedText variant="body" style={{ fontWeight: '600' }}>
                    {election.position}
                  </ThemedText>
                  <ThemedText variant="caption" color="textSecondary" style={{ marginTop: spacing.xs }}>
                    {election.electoralArea} · {election.electoralAreaType}
                  </ThemedText>
                  <ThemedText variant="caption" color="textMuted">
                    {election.electionDate} · {election.candidateCount} candidates
                  </ThemedText>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
                  <ThemedText variant="caption" style={{ color: statusColor, fontWeight: '600' }}>
                    {election.status}
                  </ThemedText>
                </View>
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
  chipRow: { paddingHorizontal: spacing.md, gap: spacing.sm, marginBottom: spacing.lg },
  chip: { marginRight: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  electionInfo: { flex: 1 },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  titleIndicator: { width: 4, height: 16, borderRadius: radius.full, marginHorizontal: 0 },
});
