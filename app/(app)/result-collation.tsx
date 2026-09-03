import React, { useMemo } from 'react';
import { View, StyleSheet, LayoutAnimation, Platform, UIManager } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenView } from '@/core/components/ScreenView';
import { ThemedText, FlashListItem, EmptyState, Button, Card } from '@/core/components';
import { router } from 'expo-router';
import { spacing, shadows, radius, sizes, gradientPresets } from '@/constants/tokens';
import { useColorScheme } from '@/core/hooks/useColorScheme';
import { useStatusBar } from '@/core/hooks/useStatusBar';
import { useResultsQuery, useCandidatesQuery, usePollingUnitsQuery } from '@/features/elections/hooks';
import Colors from '@/constants/colors';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function CollationScreen() {
  const { data: results = [] } = useResultsQuery();
  const { data: candidates = [] } = useCandidatesQuery('e1');
  const { data: pollingUnits = [] } = usePollingUnitsQuery();
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  useStatusBar({ barStyle: scheme === 'dark' ? 'light' : 'dark' });

  const candidateMap = useMemo(() => new Map(candidates.map((c) => [c.id, c])), [candidates]);
  const puLgaMap = useMemo(() => new Map(pollingUnits.map((p) => [p.id, p.lgaName])), [pollingUnits]);

  const totalVotesByCandidate: Record<string, number> = {};
  let totalVotes = 0;

  results.forEach((r) => {
    Object.entries(r.candidateVotes).forEach(([candId, votes]) => {
      const v = votes as number;
      totalVotesByCandidate[candId] = (totalVotesByCandidate[candId] || 0) + v;
      totalVotes += v;
    });
  });

  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

  const ranked = Object.entries(totalVotesByCandidate)
    .sort((a, b) => b[1] - a[1])
    .map(([candId, votes]) => {
      const cand = candidateMap.get(candId);
      return {
        candId,
        name: cand?.fullName ?? candId,
        partyAcronym: cand?.partyAcronym ?? '',
        votes,
        pct: totalVotes > 0 ? ((votes / totalVotes) * 100).toFixed(1) : '0.0',
      };
    });

  // Hierarchical: group by LGA for “Declared Winner in {LGA}” internal projection
  const lgaGroups = useMemo(() => {
    const map = new Map<string, { lgaName: string; totals: Record<string, number>; puCount: number }>();
    results.forEach((r) => {
      const lga = puLgaMap.get(r.pollingUnitId) ?? r.pollingUnitName.split(' ').slice(0, 3).join(' ') ?? 'Unknown LGA';
      if (!map.has(lga)) map.set(lga, { lgaName: lga, totals: {}, puCount: 0 });
      const g = map.get(lga)!;
      g.puCount += 1;
      Object.entries(r.candidateVotes).forEach(([candId, v]) => {
        g.totals[candId] = (g.totals[candId] || 0) + (v as number);
      });
    });
    return Array.from(map.values()).map((g) => {
      const sorted = Object.entries(g.totals).sort((a, b) => b[1] - a[1]);
      const winnerId = sorted[0]?.[0];
      const winner = winnerId ? candidateMap.get(winnerId) : undefined;
      const winnerVotes = sorted[0]?.[1] ?? 0;
      const total = Object.values(g.totals).reduce((s, n) => s + n, 0);
      return {
        lgaName: g.lgaName,
        winnerName: winner?.fullName ?? winnerId ?? '—',
        winnerParty: winner?.partyAcronym ?? '',
        winnerVotes,
        total,
        puCount: g.puCount,
        margin: sorted.length > 1 ? winnerVotes - (sorted[1]?.[1] ?? 0) : winnerVotes,
      };
    });
  }, [results, puLgaMap, candidateMap]);

  return (
    <ScreenView scrollable keyboardShouldPersistTaps="handled" skipAndroidTopPadding>
      <FlashList
        data={ranked}
        keyExtractor={(item) => item.candId}
        ListHeaderComponent={
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm }}>
              <View style={[styles.titleIndicator, { backgroundColor: colors.primary }]} />
              <ThemedText variant="h2" style={{ flex: 1 }} minFontSize={20} maxFontSize={28}>Result Collation</ThemedText>
            </View>

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

            <Card style={[{ backgroundColor: colors.warningSubtle, borderColor: colors.warning + '30', borderWidth: 1, marginTop: spacing.md, marginBottom: spacing.sm }]}>
              <ThemedText variant="caption" style={{ color: colors.warning, fontWeight: '600' }}>
                Internal projection only — not an INEC declaration. Based on submitted PU results.
              </ThemedText>
              <ThemedText variant="caption" color="textSecondary" style={{ marginTop: 4 }}>
                Updates automatically as accredited agents publish results. Refresh interval 15s + manual pull.
              </ThemedText>
            </Card>

            {lgaGroups.length > 0 && (
              <View style={{ marginTop: spacing.lg }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm }}>
                  <View style={[styles.titleIndicator, { backgroundColor: colors.accent }]} />
                  <ThemedText variant="h3" style={{ flex: 1 }}>Leading by LGA (Internal Projection)</ThemedText>
                </View>
                {lgaGroups.slice(0, 6).map((g) => (
                  <Card key={g.lgaName} style={[shadows.sm, { marginBottom: spacing.sm }]}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <View style={{ flex: 1 }}>
                        <ThemedText variant="body" style={{ fontWeight: '600' }}>
                          {g.winnerName} ({g.winnerParty}) declared winner in {g.lgaName}
                        </ThemedText>
                        <ThemedText variant="caption" color="textSecondary">
                          {g.winnerVotes.toLocaleString()} votes · {g.puCount} PU{g.puCount !== 1 ? 's' : ''} · margin +{g.margin.toLocaleString()}
                        </ThemedText>
                      </View>
                    </View>
                    <ThemedText variant="caption" color="textMuted" style={{ marginTop: spacing.xs }}>
                      Projection from agent submissions — pending INEC official collation
                    </ThemedText>
                  </Card>
                ))}
              </View>
            )}

            <ThemedText variant="h3" style={{ marginTop: spacing.xl, marginBottom: spacing.sm }}>
              Candidate Ranking
            </ThemedText>
            {ranked.length === 0 ? (
              <EmptyState icon="bar-chart-outline" title="No Collation Data" subtitle="No published results available" />
            ) : null}
          </View>
        }
        renderItem={({ item: entry, index }) => {
          const rankGradient = index === 0
            ? gradientPresets.accent as readonly [string, string, ...string[]]
            : index === 1
              ? (['#94a3b8', '#64748b'] as const)
              : undefined;
          const rankBg = rankGradient
            ? undefined
            : colors.border;
          return (
            <FlashListItem id={entry.candId}>
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
                  <ThemedText variant="label" style={{ color: index < 2 ? '#fff' : colors.text, fontWeight: '700', zIndex: 1 }}>
                    #{index + 1}
                  </ThemedText>
                </View>
                <View style={{ flex: 1 }}>
                  <ThemedText variant="body" style={{ fontWeight: '600' }}>{entry.name}</ThemedText>
                  <ThemedText variant="caption" color="textSecondary">{entry.votes.toLocaleString()} votes</ThemedText>
                </View>
                <ThemedText variant="lg" style={{ fontWeight: '700' }}>{entry.pct}%</ThemedText>
              </View>
              <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
                <View style={[styles.progressFill, { width: `${parseFloat(entry.pct)}%`, backgroundColor: colors.primary }]} />
              </View>
            </FlashListItem>
          );
        }}
        ListFooterComponent={
          <Button label="Back to Results" variant="outline" onPress={() => router.back()} style={{ marginTop: spacing.lg }} />
        }
        contentContainerStyle={{ paddingBottom: spacing.xxl }}
      />
    </ScreenView>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  rankBadge: { width: sizes.rankBadge, height: sizes.rankBadge, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  progressTrack: { height: spacing.sm, borderRadius: radius.sm, marginTop: spacing.sm, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: radius.sm },
  statCard: { borderRadius: radius.lg, padding: spacing.lg },
  titleIndicator: { width: 4, height: 16, borderRadius: radius.full },
});
