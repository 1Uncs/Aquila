import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenView } from '@/core/components/ScreenView';
import { ThemedText, Card, EmptyState, Button } from '@/core/components';
import { router } from 'expo-router';
import { spacing, shadows, radius, sizes, gradientPresets } from '@/constants/tokens';
import { useColorScheme } from '@/core/hooks/useColorScheme';
import { useResultsQuery } from '@/features/elections/hooks';
import Colors from '@/constants/colors';

export default function CollationScreen() {
  const { data: results = [] } = useResultsQuery();
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

  const totalVotesByCandidate: Record<string, number> = {};
  let totalVotes = 0;

  results.forEach((r) => {
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

        {results.length === 0 ? (
          <EmptyState icon="bar-chart-outline" title="No Collation Data" subtitle="No published results available" />
        ) : (
          <>
            <LinearGradient colors={gradientPresets.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.statCard, shadows.lg]}>
              <ThemedText variant="caption" style={{ color: 'rgba(255,255,255,0.8)' }}>
                Total Votes Cast
              </ThemedText>
              <ThemedText variant="xxl" style={{ color: '#fff', fontWeight: '700', marginVertical: spacing.xs }}>
                {totalVotes.toLocaleString()}
              </ThemedText>
              <ThemedText variant="caption" style={{ color: 'rgba(255,255,255,0.7)' }}>
                Across {results.length} Polling Units
              </ThemedText>
            </LinearGradient>

            <ThemedText variant="h3" style={{ marginHorizontal: 16, marginTop: spacing.xl, marginBottom: spacing.sm }}>
              Candidate Ranking
            </ThemedText>
            {ranked.map((entry, idx) => {
              const rankGradient = idx === 0
                ? gradientPresets.accent as readonly [string, string, ...string[]]
                : idx === 1
                  ? (['#94a3b8', '#64748b'] as const)
                  : undefined;
              const rankBg = rankGradient
                ? undefined
                : colors.border;
              return (
                <Card key={entry.candId} style={shadows.sm}>
                  <View style={styles.row}>
                    <View style={[
                      styles.rankBadge,
                      rankGradient
                        ? { borderRadius: radius.md }
                        : { backgroundColor: rankBg, borderRadius: radius.md },
                    ]}>
                      {rankGradient ? (
                        <LinearGradient colors={rankGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ position: 'absolute', inset: 0, borderRadius: radius.md }} />
                      ) : null}
                      <ThemedText variant="label" style={{ color: idx < 2 ? '#fff' : colors.text, fontWeight: '700', zIndex: 1 }}>
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
              );
            })}
          </>
        )}

        <Button label="Back to Results" variant="outline" onPress={() => router.back()} style={{ marginHorizontal: spacing.md, marginTop: spacing.lg }} />
      </View>
    </ScreenView>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  rankBadge: { width: sizes.rankBadge, height: sizes.rankBadge, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  progressTrack: { height: spacing.sm, borderRadius: radius.sm, marginTop: spacing.sm, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: radius.sm },
  statCard: { borderRadius: radius.lg, padding: spacing.lg },
});
