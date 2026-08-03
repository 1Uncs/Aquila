import React, { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { StyleSheet, ScrollView, Pressable, PressableStateCallbackType, View } from 'react-native';
import { ScreenView } from '@/core/components/ScreenView';
import { ThemedText, Card, EmptyState } from '@/core/components';
import { useElectionsStore } from '@/features/auth/store';
import { ROUTES } from '@/constants/routes';
import { spacing, radius, border } from '@/constants/tokens';
import { useColorScheme } from '@/core/hooks/useColorScheme';
import { useElectionsQuery, useElectionCyclesQuery } from '@/features/elections/hooks';
import Colors from '@/constants/colors';

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

  const statusColors: Record<string, string> = {
    DRAFT: colors.textMuted,
    SCHEDULED: colors.warning,
    ACTIVE: colors.success,
    COMPLETED: colors.primary,
    ARCHIVED: colors.textSecondary,
  };

  return (
    <ScreenView scrollable keyboardShouldPersistTaps="handled">
      <View style={{ paddingBottom: spacing.xxl }}>
        <ThemedText variant="xl" style={{ marginHorizontal: 16, marginTop: spacing.md, marginBottom: spacing.sm }}>
          Elections
        </ThemedText>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: spacing.sm, marginBottom: spacing.lg }} keyboardShouldPersistTaps="handled">
          {cycles.map((cycle) => (
            <Pressable
              key={cycle.id}
              onPress={() => setSelectedCycle(cycle.id === selectedCycle ? null : cycle.id)}
              style={({ pressed }: PressableStateCallbackType) => [
                styles.cycleChip,
                { backgroundColor: selectedCycle === cycle.id ? colors.primary : colors.card, borderColor: selectedCycle === cycle.id ? colors.primary : colors.border },
                pressed && { opacity: 0.7 },
              ]}
            >
              <ThemedText
                variant="label"
                style={{ color: selectedCycle === cycle.id ? '#fff' : colors.text }}
              >
                {cycle.name}
              </ThemedText>
            </Pressable>
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
            actionLabel="Create Election"
            onAction={() => {}}
          />
        ) : (
          filteredElections.map((election) => (
            <Card
              key={election.id}
              pressable
              onPress={() => {
                useElectionsStore.getState().setSelectedElectionId(election.id);
                router.push({ pathname: ROUTES.ELECTION_DETAIL, params: { id: election.id } });
              }}
            >
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
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
                <View style={[styles.statusBadge, { backgroundColor: statusColors[election.status] + '20' }]}>
                  <ThemedText variant="caption" style={{ color: statusColors[election.status], fontWeight: '600' }}>
                    {election.status}
                  </ThemedText>
                </View>
              </View>
            </Card>
          ))
        )}
      </View>
    </ScreenView>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  cycleChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: border.thin,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
});
