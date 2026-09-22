import React, { useMemo } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, router } from 'expo-router';
import { ScreenView } from '@/core/components/ScreenView';
import { ThemedText, Card, EmptyState, Button, ScreenHeader } from '@/core/components';
import { useResultsQuery, useCandidatesQuery, usePollingUnitsQuery } from '@/features/elections/hooks';
import { spacing, radius, shadows, border } from '@/constants/tokens';
import { useColorScheme } from '@/core/hooks/useColorScheme';
import { useStatusBar } from '@/core/hooks/useStatusBar';
import Colors from '@/constants/colors';
import { useResultsStore } from '@/features/auth/store';
import { Ionicons } from '@expo/vector-icons';
import { ROUTES } from '@/constants/routes';

export default function ResultDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: apiResults = [], isLoading: loading } = useResultsQuery();
  const { submissions } = useResultsStore();
  const { data: candidates = [] } = useCandidatesQuery('e1');
  const { data: pollingUnits = [] } = usePollingUnitsQuery();

  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  useStatusBar({ barStyle: 'light' });

  // Find result from either API or local store submissions
  const result = useMemo(() => {
    return submissions.find((s) => s.id === id) ?? apiResults.find((r) => r.id === id) ?? null;
  }, [id, submissions, apiResults]);

  const puInfo = useMemo(() => {
    if (!result) return null;
    return pollingUnits.find((p) => p.id === result.pollingUnitId);
  }, [result, pollingUnits]);

  // Combined candidate rows with full candidate metadata, vote counts, and percentages (Audio Part 3)
  const candidateRows = useMemo(() => {
    if (!result) return [];
    const totalVotes = result.totalVotesCast || 1;

    const candMap = new Map<string, (typeof candidates)[0]>();
    candidates.forEach((c) => candMap.set(c.id, c));

    return Object.entries(result.candidateVotes).map(([cId, votes]) => {
      const c = candMap.get(cId);
      const voteVal = typeof votes === 'number' ? votes : 0;
      const inecVotes = result.candidateVotesInec ? result.candidateVotesInec[cId] : undefined;
      return {
        id: cId,
        candidateNumber: c?.candidateNumber,
        name: c?.fullName ?? `Candidate (${cId})`,
        partyAcronym: c?.partyAcronym ?? 'IND',
        partyName: c?.partyName ?? 'Independent',
        votes: voteVal,
        inecVotes,
        pct: (voteVal / totalVotes) * 100,
      };
    }).sort((a, b) => b.votes - a.votes);
  }, [result, candidates]);

  const turnoutPct = result && result.totalAccreditedVoters > 0
    ? ((result.totalVotesCast / result.totalAccreditedVoters) * 100).toFixed(1)
    : '0.0';

  if (loading && !result) {
    return (
      <ScreenView scrollable={false}>
        <View style={styles.centerContainer}>
          <ThemedText variant="body" color="textSecondary">
            Loading polling unit return...
          </ThemedText>
        </View>
      </ScreenView>
    );
  }

  if (!result) {
    return (
      <ScreenView scrollable={false}>
        <EmptyState
          icon="alert-circle-outline"
          title="Result Not Found"
          subtitle="The requested polling unit return could not be retrieved."
          actionLabel="Back to Results"
          onAction={() => router.back()}
        />
      </ScreenView>
    );
  }

  const isVerified = result.status === 'PUBLISHED';

  return (
    <ScreenView scrollable contentContainerStyle={styles.scrollContent}>
      <ScreenHeader
        title="Polling Unit Return"
        category="EC8A VERIFICATION"
        subtitle={result.pollingUnitName}
      />
      {/* 1. Header Hero Card */}
      <LinearGradient
        colors={['#0D6338', '#0A4A2A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.heroCard, shadows.md]}
      >
        <View style={styles.heroTopRow}>
          <View style={{ flex: 1 }}>
            <ThemedText variant="label" color="#A3E6C2" fontFamily="bold">
              OFFICIAL POLLING UNIT RETURN
            </ThemedText>
            <ThemedText variant="h2" color="#FFFFFF" fontFamily="bold" style={{ marginTop: 2 }}>
              {result.pollingUnitName}
            </ThemedText>
            <ThemedText variant="caption" color="#D1FAE5" style={{ marginTop: 2 }}>
              {puInfo?.code ?? 'PU Code Verified'} · {puInfo?.lgaName ?? 'Ikeja'}, {puInfo?.stateName ?? 'Lagos'}
            </ThemedText>
          </View>

          <View style={[styles.statusPill, { backgroundColor: isVerified ? 'rgba(16, 185, 129, 0.25)' : 'rgba(245, 158, 11, 0.25)' }]}>
            <Ionicons
              name={isVerified ? 'shield-checkmark' : 'time-outline'}
              size={14}
              color={isVerified ? '#34D399' : '#FBBF24'}
            />
            <ThemedText
              variant="label"
              color={isVerified ? '#34D399' : '#FBBF24'}
              fontFamily="bold"
              style={{ marginLeft: 4 }}
            >
              {result.status}
            </ThemedText>
          </View>
        </View>

        {/* Audit Metadata Strip */}
        <View style={styles.auditStrip}>
          <View style={styles.auditItem}>
            <ThemedText variant="label" color="#A3E6C2">ACCREDITED VOTERS</ThemedText>
            <ThemedText variant="title" color="#FFFFFF" fontFamily="bold">
              {result.totalAccreditedVoters.toLocaleString()}
            </ThemedText>
          </View>
          <View style={styles.auditDivider} />
          <View style={styles.auditItem}>
            <ThemedText variant="label" color="#A3E6C2">BALLOTS CAST</ThemedText>
            <ThemedText variant="title" color="#FFFFFF" fontFamily="bold">
              {result.totalVotesCast.toLocaleString()}
            </ThemedText>
          </View>
          <View style={styles.auditDivider} />
          <View style={styles.auditItem}>
            <ThemedText variant="label" color="#A3E6C2">TURNOUT</ThemedText>
            <ThemedText variant="title" color="#FFFFFF" fontFamily="bold">
              {turnoutPct}%
            </ThemedText>
          </View>
        </View>
      </LinearGradient>

      {/* 2. Comprehensive Candidate Scorecard (Audio Part 3) */}
      <Card style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <View>
            <ThemedText variant="title" color="text" fontFamily="bold">
              Candidate Returns ({candidateRows.length})
            </ThemedText>
            <ThemedText variant="caption" color="textSecondary">
              Complete candidate ranking with percentage and absolute votes
            </ThemedText>
          </View>
        </View>

        <View style={{ gap: spacing.sm, marginTop: spacing.sm }}>
          {candidateRows.map((c, idx) => {
            const isWinner = idx === 0;
            const partyColors: Record<string, string> = {
              APC: '#0D6338',
              PDP: '#DC2626',
              LP: '#16A34A',
              NNPP: '#2563EB',
            };
            const partyColor = partyColors[c.partyAcronym] ?? colors.primary;

            return (
              <View
                key={c.id}
                style={[
                  styles.candidateRow,
                  { borderColor: isWinner ? colors.primary : colors.border },
                ]}
              >
                <View style={styles.candHeader}>
                  <View style={styles.candMeta}>
                    <View style={[styles.candRankBadge, { backgroundColor: isWinner ? colors.primary : colors.borderSubtle }]}>
                      <ThemedText
                        variant="caption"
                        color={isWinner ? '#FFFFFF' : 'textSecondary'}
                        fontFamily="bold"
                      >
                        #{idx + 1}
                      </ThemedText>
                    </View>
                    <View style={{ marginLeft: spacing.xs, flex: 1 }}>
                      <ThemedText variant="body" color="text" fontFamily="bold">
                        {c.name}
                      </ThemedText>
                      <View style={styles.partyRow}>
                        <View style={[styles.partyPill, { backgroundColor: partyColor + '18' }]}>
                          <ThemedText variant="label" style={{ color: partyColor }} fontFamily="bold">
                            {c.partyAcronym}
                          </ThemedText>
                        </View>
                        {c.candidateNumber ? (
                          <ThemedText variant="label" color="textMuted" style={{ marginLeft: 6 }}>
                            Candidate #{c.candidateNumber}
                          </ThemedText>
                        ) : null}
                      </View>
                    </View>
                  </View>

                  <View style={{ alignItems: 'flex-end' }}>
                    <ThemedText variant="title" color="text" fontFamily="bold">
                      {c.votes.toLocaleString()}
                    </ThemedText>
                    <ThemedText variant="caption" color="primary" fontFamily="bold">
                      {c.pct.toFixed(1)}% of total
                    </ThemedText>
                  </View>
                </View>

                {/* Progress share bar */}
                <View style={[styles.progressBarTrack, { backgroundColor: colors.borderSubtle }]}>
                  <View
                    style={[
                      styles.progressBarFill,
                      { width: `${Math.min(c.pct, 100)}%`, backgroundColor: partyColor },
                    ]}
                  />
                </View>

                {/* INEC Comparison row if available */}
                {c.inecVotes !== undefined && (
                  <View style={styles.inecComparisonRow}>
                    <ThemedText variant="label" color="textMuted">
                      INEC Official: {c.inecVotes.toLocaleString()} votes
                    </ThemedText>
                    <View style={styles.matchPill}>
                      <Ionicons
                        name={c.inecVotes === c.votes ? 'checkmark-circle' : 'alert-circle'}
                        size={12}
                        color={c.inecVotes === c.votes ? colors.success : colors.warning}
                      />
                      <ThemedText
                        variant="label"
                        style={{
                          marginLeft: 4,
                          color: c.inecVotes === c.votes ? colors.success : colors.warning,
                        }}
                      >
                        {c.inecVotes === c.votes ? 'Matched' : 'Discrepancy'}
                      </ThemedText>
                    </View>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </Card>

      {/* 3. Verification & Chain of Custody */}
      <Card style={styles.sectionCard}>
        <ThemedText variant="title" color="text" fontFamily="bold">
          Chain of Custody & Audit
        </ThemedText>

        <View style={styles.custodyList}>
          <View style={styles.custodyRow}>
            <Ionicons name="time-outline" size={16} color={colors.primary} />
            <ThemedText variant="caption" color="textSecondary" style={{ marginLeft: 6, flex: 1 }}>
              Submitted: {new Date(result.submittedAt).toLocaleTimeString()} · {new Date(result.submittedAt).toLocaleDateString()}
            </ThemedText>
          </View>
          <View style={styles.custodyRow}>
            <Ionicons name="person-outline" size={16} color={colors.primary} />
            <ThemedText variant="caption" color="textSecondary" style={{ marginLeft: 6, flex: 1 }}>
              Recorded By: Field Agent ({result.submittedBy})
            </ThemedText>
          </View>
          {result.latitude && result.longitude ? (
            <View style={styles.custodyRow}>
              <Ionicons name="location-outline" size={16} color={colors.primary} />
              <ThemedText variant="caption" color="textSecondary" style={{ marginLeft: 6, flex: 1 }}>
                GPS Coordinates: {result.latitude.toFixed(5)}, {result.longitude.toFixed(5)}
              </ThemedText>
            </View>
          ) : null}
          <View style={styles.custodyRow}>
            <Ionicons name="close-circle-outline" size={16} color={colors.critical} />
            <ThemedText variant="caption" color="textSecondary" style={{ marginLeft: 6, flex: 1 }}>
              Rejected / Spoiled Ballots: {result.rejectedVotes} votes
            </ThemedText>
          </View>
        </View>
      </Card>

      {/* 4. Action Buttons */}
      <View style={{ gap: spacing.sm, marginTop: spacing.xs }}>
        <Button
          label="View Collation Summary"
          variant="primary"
          leftIcon="bar-chart-outline"
          onPress={() => router.push(ROUTES.RESULT_COLLATION)}
        />
        <Button
          label="File Incident at this PU"
          variant="outline"
          leftIcon="warning-outline"
          onPress={() => router.push({ pathname: ROUTES.INCIDENT_REPORT, params: { puId: result.pollingUnitId } })}
        />
      </View>
    </ScreenView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  heroCard: {
    padding: spacing.md,
    borderRadius: radius.lg,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  auditStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.15)',
  },
  auditItem: {
    flex: 1,
  },
  auditDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginHorizontal: spacing.xs,
  },
  sectionCard: {
    padding: spacing.md,
    borderRadius: radius.lg,
    ...shadows.sm,
  },
  sectionHeader: {
    marginBottom: spacing.xs,
  },
  candidateRow: {
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  candHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  candMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.sm,
  },
  candRankBadge: {
    width: 26,
    height: 26,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  partyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  partyPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  progressBarTrack: {
    height: 6,
    borderRadius: 3,
    marginTop: spacing.xs,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  inecComparisonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.04)',
  },
  matchPill: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  custodyList: {
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  custodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
