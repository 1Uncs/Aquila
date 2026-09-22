import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView, LayoutAnimation } from 'react-native';
import { router } from 'expo-router';
import { ScreenView } from '@/core/components/ScreenView';
import { ThemedText, EmptyState, Button, SkeletonCard, Card } from '@/core/components';
import { ROUTES } from '@/constants/routes';
import { spacing, radius, shadows, border } from '@/constants/tokens';
import { useRefreshControl, useForegroundRefresh } from '@/core/hooks';
import { useColorScheme } from '@/core/hooks/useColorScheme';
import { useStatusBar } from '@/core/hooks/useStatusBar';
import { useElectionsQuery, useElectionCyclesQuery } from '@/features/elections/hooks';
import Colors from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'textMuted',
  SCHEDULED: 'pending',
  ACTIVE: 'verified',
  COMPLETED: 'primary',
  ARCHIVED: 'textSecondary',
};

const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Draft',
  SCHEDULED: 'Scheduled',
  ACTIVE: 'Active',
  COMPLETED: 'Completed',
  ARCHIVED: 'Archived',
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
    <ScreenView
      scrollable
      keyboardShouldPersistTaps="handled"
      refreshControl={refreshControl}
      contentContainerStyle={{ paddingBottom: 110 }}
    >
      <View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm }}>
          <View style={[styles.titleIndicator, { backgroundColor: colors.primary }]} />
          <ThemedText variant="xl" style={{ flex: 1 }} minFontSize={20} maxFontSize={26}>Elections</ThemedText>
        </View>
        <ThemedText variant="body" color="textSecondary" style={{ marginBottom: spacing.lg }}>
          Browse election cycles and active contests
        </ThemedText>

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
          <View style={{ gap: spacing.md, paddingBottom: spacing.md, marginTop: spacing.md }}>
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

        <View style={{ marginTop: spacing.md }}>
          {filteredElections.map((election) => {
            const statusColorKey = STATUS_COLORS[election.status] || 'textSecondary';
            const statusColor = colors[statusColorKey as keyof typeof Colors.light] as string;
            const statusLabel = STATUS_LABELS[election.status] || election.status;
            return (
              <Card key={election.id} pressable onPress={() => router.push({ pathname: ROUTES.ELECTION_DETAIL, params: { id: election.id } })} style={[shadows.sm, styles.electionCard]}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, marginBottom: spacing.sm }}>
                  <View style={[styles.electionIcon, { backgroundColor: colors.primary + '14' }]}>
                    <ThemedText variant="xl" style={{ color: colors.primary, fontWeight: '800' }}>
                      {election.position.charAt(0)}
                    </ThemedText>
                  </View>
                  <View style={{ flex: 1 }}>
                    <ThemedText variant="body" style={{ fontWeight: '700', fontSize: 15 }}>{election.position}</ThemedText>
                    <ThemedText variant="caption" color="textSecondary" style={{ marginTop: spacing['2xs'] }}>
                      {election.electoralArea} · {election.electoralAreaType}
                    </ThemedText>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.xs }}>
                      <ThemedText variant="caption" color="textMuted">{election.electionDate}</ThemedText>
                      <View style={[styles.statusBadge, { backgroundColor: statusColor + '18' }]}>
                        <ThemedText variant="caption" style={{ color: statusColor, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4 }}>{statusLabel}</ThemedText>
                      </View>
                    </View>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingTop: spacing.sm, borderTopWidth: border.thin, borderTopColor: colors.border }}>
                  <ThemedText variant="caption" color="textSecondary">{election.candidateCount} candidates</ThemedText>
                  <View style={{ flex: 1 }} />
                  <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                </View>
              </Card>
            );
          })}
        </View>
      </View>
    </ScreenView>
  );
}

const styles = StyleSheet.create({
  chipRow: { gap: spacing.sm, marginBottom: spacing.lg, paddingRight: spacing.md },
  chip: { marginRight: spacing.sm },
  electionCard: { marginBottom: spacing.md, padding: spacing.md },
  titleIndicator: { width: 4, height: 16, borderRadius: radius.full },
  electionIcon: { width: 40, height: 40, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  statusBadge: { paddingHorizontal: spacing.sm, paddingVertical: spacing['2xs'], borderRadius: radius.full },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
});
