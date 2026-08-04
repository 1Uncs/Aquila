import React, { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { ScrollView, View, StyleSheet } from 'react-native';
import { ScreenView } from '@/core/components/ScreenView';
import { ThemedText, Card, EmptyState, Button } from '@/core/components';
import { useElectionsStore } from '@/features/auth/store';
import { ROUTES } from '@/constants/routes';
import { spacing, radius } from '@/constants/tokens';
import { useColorScheme } from '@/core/hooks/useColorScheme';
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
  const { data: elections = [], isLoading: electionsLoading } = useElectionsQuery();
  const [selectedCycle, setSelectedCycle] = useState<string | null>(null);
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

  const loading = cyclesLoading || electionsLoading;

  useEffect(() => {
    if (cycles.length > 0 && !selectedCycle) {
      setSelectedCycle(cycles[0]!.id);
    }
  }, [cycles, selectedCycle]);

  const filteredElections = selectedCycle
    ? elections.filter((e) => e.cycleId === selectedCycle)
    : elections;

  return (
    <ScreenView scrollable keyboardShouldPersistTaps="handled">
      <View style={styles.content}>
        <ThemedText variant="xl" style={{ marginHorizontal: 16, marginTop: spacing.md, marginBottom: spacing.sm }}>
          Elections
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
          <ThemedText variant="body" color="textSecondary" style={{ textAlign: 'center', marginTop: spacing.xxl }}>
            Loading elections...
          </ThemedText>
        ) : filteredElections.length === 0 ? (
          <EmptyState
            icon="document-text-outline"
            title="No Elections Found"
            subtitle="No elections in this cycle yet"
          />
        ) : (
          filteredElections.map((election) => {
            const statusColorKey = STATUS_COLORS[election.status] || 'textSecondary';
            const statusColor = colors[statusColorKey as keyof typeof Colors.light] as string;
            return (
              <Card
                key={election.id}
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
                    <ThemedText variant="caption" color="textSecondary" style={{ marginTop: 4 }}>
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
              </Card>
            );
          })
        )}
      </View>
    </ScreenView>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: spacing.xxl },
  chipRow: { paddingHorizontal: 16, gap: spacing.sm, marginBottom: spacing.lg },
  chip: { marginRight: spacing.sm },
  actionRow: { flexDirection: 'row', gap: spacing.sm, marginHorizontal: 16, marginBottom: spacing.lg },
  actionBtn: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  electionInfo: { flex: 1 },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
});
