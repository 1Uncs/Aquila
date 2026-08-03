import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ScreenView } from '@/core/components/ScreenView';
import { ThemedText, Card, EmptyState, Button } from '@/core/components';
import { useResultsStore } from '@/features/auth/store';
import { router } from 'expo-router';
import { spacing, shadows, radius } from '@/constants/tokens';
import { useColorScheme } from '@/core/hooks/useColorScheme';
import { useResultsQuery } from '@/features/elections/hooks';
import Colors from '@/constants/colors';

export default function CollationScreen() {
  const { data: results = [] } = useResultsQuery();
  const { submissions } = useResultsStore();
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

  const allResults = results.length > 0 ? results : submissions;
  const totalVotesByCandidate: Record<string, number> = {};
  let totalVotes = 0;

  allResults.forEach((r) => {
    Object.entries(r.candidateVotes).forEach(([candId, votes]) => {
      const v = votes as number;
      totalVotesByCandidate[candId] = (totalVotesByCandidate[candId] || 0) + v;
      totalVotes += v;
    });
  });

  const ranked = Object.entries(totalVotesByCandidate)
    .sort((a, b) => b[1] - a[1])
    .map(([candId, votes]) => ({
      candId,
      votes,
      pct: totalVotes > 0 ? ((votes / totalVotes) * 100).toFixed(1) : '0.0',
    }));

  return (
    <ScreenView scrollable keyboardShouldPersistTaps="handled">
      <View style={{ paddingBottom: spacing.xxl }}>
        <ThemedText variant="h2" style={{ marginHorizontal: 16, marginTop: spacing.md, marginBottom: spacing.lg }}>
          Result Collation
        </ThemedText>

        {allResults.length === 0 ? (
          <EmptyState icon="bar-chart-outline" title="No Collation Data" subtitle="No published results available" />
        ) : (
          <>
            <Card style={[shadows.md]}>
              <ThemedText variant="caption" color="textSecondary">
                Total Votes Cast
              </ThemedText>
              <ThemedText variant="xxl" style={{ fontWeight: '700', marginVertical: spacing.xs }}>
                {totalVotes.toLocaleString()}
              </ThemedText>
              <ThemedText variant="caption" color="textSecondary">
                Across {allResults.length} Polling Units
              </ThemedText>
            </Card>

            <ThemedText variant="h3" style={{ marginHorizontal: 16, marginTop: spacing.xl, marginBottom: spacing.sm }}>
              Candidate Ranking
            </ThemedText>
            {ranked.map((entry, idx) => (
              <Card key={entry.candId} style={shadows.sm}>
                <View style={styles.row}>
                  <View style={[styles.rankBadge, { backgroundColor: idx === 0 ? colors.primary : idx === 1 ? colors.secondary : colors.border }]}>
                    <ThemedText variant="label" style={{ color: idx < 2 ? '#fff' : colors.text }}>
                      #{idx + 1}
                    </ThemedText>
                  </View>
                  <View style={{ flex: 1 }}>
                    <ThemedText variant="body" style={{ fontWeight: '600' }}>{entry.candId}</ThemedText>
                    <ThemedText variant="caption" color="textSecondary">{entry.votes.toLocaleString()} votes</ThemedText>
                  </View>
                  <ThemedText variant="lg" style={{ fontWeight: '700' }}>{entry.pct}%</ThemedText>
                </View>
                <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
                  <View style={[styles.progressFill, { width: `${parseFloat(entry.pct)}%`, backgroundColor: colors.primary }]} />
                </View>
              </Card>
            ))}
          </>
        )}

        <Button label="Back to Results" variant="outline" onPress={() => router.back()} style={{ marginHorizontal: 16, marginTop: spacing.lg }} />
      </View>
    </ScreenView>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  rankBadge: { width: spacing.xl, height: spacing.xl, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center' },
  progressTrack: { height: spacing.sm, borderRadius: radius.sm, marginTop: spacing.sm, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: radius.sm },
});
