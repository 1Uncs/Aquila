import React, { useState, useMemo } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenView } from '@/core/components/ScreenView';
import { ThemedText, Card, EmptyState, Button, SkeletonCard } from '@/core/components';
import { useAuthStore } from '@/features/auth/store';
import { ROUTES } from '@/constants/routes';
import { spacing, radius, shadows, sizes, gradientPresets, border } from '@/constants/tokens';
import { useColorScheme } from '@/core/hooks/useColorScheme';
import { useStatusBar } from '@/core/hooks/useStatusBar';
import { useElectionsQuery, useIncidentsQuery, useCandidatesQuery, useResultsQuery, usePollingUnitsQuery } from '@/features/elections/hooks';
import { useRefreshControl, useHaptics, useForegroundRefresh } from '@/core/hooks';
import Colors from '@/constants/colors';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Candidate, ResultSubmission } from '@/features/auth/store';

function GradientIcon({ name, gradient }: { name: string; gradient: readonly [string, string] }) {
  return (
    <View style={[styles.gradientIconWrap, { borderRadius: radius.md }]}>
      <LinearGradient colors={[...gradient]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.gradientIconBg}>
        <ThemedText variant="xl" style={{ color: '#fff', fontWeight: '700' }}>{name}</ThemedText>
      </LinearGradient>
    </View>
  );
}

type StatCardProps = {
  icon: string;
  label: string;
  value: string;
  gradient: readonly [string, string];
  colors: typeof Colors.light;
};

function StatCard({ icon, label, value, gradient, colors }: StatCardProps) {
  const { impact } = useHaptics();

  return (
    <Card
      pressable
      style={[styles.statCard, shadows.md]}
      onPress={() => impact(Haptics.ImpactFeedbackStyle.Light)}
      accessibilityLabel={`${label}: ${value}`}
    >
      <GradientIcon name={icon} gradient={gradient} />
      <ThemedText variant="xxl" style={{ marginTop: spacing.sm, fontWeight: '700', color: colors.primary }} minFontSize={28} maxFontSize={44}>
        {value}
      </ThemedText>
      <ThemedText variant="caption" color="textSecondary" style={{ marginTop: spacing.xs }}>
        {label}
      </ThemedText>
    </Card>
  );
}

const severityColors: Record<string, string> = {
  LOW: 'success',
  MEDIUM: 'warning',
  HIGH: 'error',
  CRITICAL: 'critical',
};

function QuickActions({ colors, electionId }: { colors: typeof Colors.light; electionId?: string }) {
  return (
    <View>
      <ThemedText variant="h3" style={{ marginBottom: spacing.sm }} minFontSize={16} maxFontSize={22}>
        Quick Actions
      </ThemedText>
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        <Card pressable style={styles.quickActionCard} onPress={() => router.push({ pathname: ROUTES.ELECTION_DETAIL, params: { id: electionId ?? 'e1' } })}>
          <View style={[styles.quickActionIcon, { backgroundColor: colors.primary + '12' }]}>
            <Ionicons name="document-text-outline" size={22} color={colors.primary} />
          </View>
          <View style={{ marginTop: spacing.sm }}>
            <ThemedText variant="label" style={{ color: colors.primary, fontWeight: '700' }}>View Election</ThemedText>
            <ThemedText variant="caption" color="textSecondary">Details & results</ThemedText>
          </View>
        </Card>
        <Card pressable style={styles.quickActionCard} onPress={() => router.push(ROUTES.INCIDENT_REPORT)}>
          <View style={[styles.quickActionIcon, { backgroundColor: colors.accent + '12' }]}>
            <Ionicons name="warning-outline" size={22} color={colors.accent} />
          </View>
          <View style={{ marginTop: spacing.sm }}>
            <ThemedText variant="label" style={{ color: colors.accent, fontWeight: '700' }}>Report Issue</ThemedText>
            <ThemedText variant="caption" color="textSecondary">File an incident</ThemedText>
          </View>
        </Card>
      </View>
    </View>
  );
}

function WinnerCard({ candidates, results, colors }: { candidates: Candidate[]; results: ResultSubmission[]; colors: typeof Colors.light }) {
  if (!candidates || candidates.length === 0 || results.length === 0) return null;

  const totalByCandidate: Record<string, number> = {};
  results.forEach((r) => {
    Object.entries(r.candidateVotes).forEach(([candId, votes]) => {
      totalByCandidate[candId] = (totalByCandidate[candId] || 0) + (votes as number);
    });
  });

  const ranked = [...candidates]
    .map((c) => ({ ...c, total: totalByCandidate[c.id] || 0 }))
    .sort((a, b) => b.total - a.total);

  const winner = ranked[0];
  if (!winner || winner.total === 0) return null;

  return (
    <Card style={shadows.md}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md }}>
        <View style={[styles.sectionIndicator, { backgroundColor: colors.accent }]} />
        <ThemedText variant="h3" style={{ flex: 1 }}>Leading Candidate</ThemedText>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
        <LinearGradient colors={gradientPresets.accent} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.winnerBadge, { borderRadius: radius.lg }]}>
          <ThemedText variant="xxl" style={{ color: '#fff', fontWeight: '700' }}>
            {winner.partyAcronym.charAt(0)}
          </ThemedText>
        </LinearGradient>
        <View style={{ flex: 1 }}>
          <ThemedText variant="body" style={{ fontWeight: '700' }}>{winner.fullName}</ThemedText>
          <ThemedText variant="caption" color="textSecondary">
            {winner.partyName} ({winner.partyAcronym})
          </ThemedText>
          <ThemedText variant="caption" color="textMuted">
            {winner.total.toLocaleString()} votes across {results.length} PU{results.length !== 1 ? 's' : ''}
          </ThemedText>
        </View>
      </View>

      {ranked.slice(1).map((c) => (
        <View key={c.id} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.sm, paddingTop: spacing.sm, borderTopWidth: border.thin, borderTopColor: colors.border }}>
          <ThemedText variant="body" style={{ flex: 1 }}>{c.fullName}</ThemedText>
          <ThemedText variant="caption" color="textSecondary">{c.partyAcronym}</ThemedText>
          <ThemedText variant="caption" color="textMuted">{c.total.toLocaleString()}</ThemedText>
        </View>
      ))}
    </Card>
  );
}

function WatchCandidateCard({ candidates, colors }: { candidates: Candidate[]; colors: typeof Colors.light }) {
  const { user, setWatchCandidate } = useAuthStore();
  const [expanded, setExpanded] = useState(false);
  const watchId = user?.watchCandidateId;

  if (!candidates || candidates.length === 0) return null;
  const watched = candidates.find((c) => c.id === watchId);

  if (!expanded && !watched) {
    return (
      <Card pressable style={shadows.sm} onPress={() => setExpanded(true)}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <View style={[styles.puIcon, { backgroundColor: colors.primary + '12' }]}>
            <Ionicons name="eye-outline" size={22} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <ThemedText variant="body" style={{ fontWeight: '600' }}>Watch a Candidate</ThemedText>
            <ThemedText variant="caption" color="textSecondary">Track your preferred candidate</ThemedText>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} style={{ marginLeft: 'auto' }} />
        </View>
      </Card>
    );
  }

  return (
    <Card style={shadows.sm}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: expanded ? spacing.md : 0 }}>
        <View style={[styles.puIcon, { backgroundColor: colors.primary + '12' }]}>
          <Ionicons name={watched ? 'eye' : 'eye-outline'} size={22} color={colors.primary} />
        </View>
        <ThemedText variant="body" style={{ fontWeight: '600', flex: 1 }}>
          {watched ? `Watching: ${watched.fullName}` : 'Watch a Candidate'}
        </ThemedText>
        <Button
          label={expanded ? 'Done' : 'Change'}
          size="sm"
          variant="ghost"
          onPress={() => {
            if (expanded && watched) {
              setWatchCandidate(undefined);
              setExpanded(false);
            } else {
              setExpanded(true);
            }
          }}
        />
      </View>

      {expanded && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          {candidates.map((c) => (
            <Button
              key={c.id}
              label={`${c.partyAcronym}: ${c.fullName.split(' ')[0]}`}
              size="sm"
              variant={watchId === c.id ? 'primary' : 'outline'}
              onPress={() => setWatchCandidate(c.id)}
            />
          ))}
        </View>
      )}
    </Card>
  );
}

export default function DashboardScreen() {
  const { data: elections = [], isLoading: electionsLoading, refetch: refetchElections } = useElectionsQuery();
  const { data: incidents = [], isLoading: incidentsLoading, refetch: refetchIncidents } = useIncidentsQuery();
  const { data: candidates = [] } = useCandidatesQuery('e1');
  const { data: allResults = [], refetch: refetchResults } = useResultsQuery();
  const { user, setSelectedPollingUnit: _setSelectedPollingUnit } = useAuthStore();
  const selectedPollingUnitId = useAuthStore((s) => s.user?.selectedPollingUnitId);
  const selectedPollingUnitName = useAuthStore((s) => s.user?.selectedPollingUnitName);
  const { data: allPollingUnits = [] } = usePollingUnitsQuery();
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  useStatusBar({ barStyle: scheme === 'dark' ? 'light' : 'dark' });
  const { refreshControl } = useRefreshControl(
    electionsLoading || incidentsLoading,
    () => Promise.all([refetchElections(), refetchIncidents(), refetchResults()])
  );
  useForegroundRefresh([['elections', 'list'], ['incidents', 'list'], ['results', 'list']], 5 * 60 * 1000);

  const loading = electionsLoading || incidentsLoading;
  const recentIncidents = incidents.slice(0, 3);
  const totalReportingPUs = allResults.length;
  const totalPUs = 2500;
  const reportingPct = Math.min(Math.round((totalReportingPUs / totalPUs) * 100), 100);

  const isFieldAgent = user?.role === 'FIELD_AGENT';
  const isPollingAgent = user?.role === 'POLLING_AGENT';
  const isElectionOfficer = user?.role === 'ELECTION_OFFICER';

  const puDetails = useMemo(() => {
    if (!selectedPollingUnitId) return null;
    const puRecord = allPollingUnits.find((p) => p.id === selectedPollingUnitId);
    const puResult = allResults.find((r) => r.pollingUnitId === selectedPollingUnitId);
    const puIncidents = incidents.filter((i) => i.pollingUnitId === selectedPollingUnitId || (!i.pollingUnitId && i.electoralArea === (puRecord?.lgaName ?? '')));
    const totalVotes = puResult ? Object.values(puResult.candidateVotes).reduce((a: number, b: any) => a + b, 0) + puResult.rejectedVotes : 0;
    const ranked = candidates
      .map((c) => ({ ...c, votes: puResult ? (puResult.candidateVotes[c.id] as number) || 0 : 0 }))
      .sort((a, b) => b.votes - a.votes);
    const winner = ranked[0];
    return {
      name: selectedPollingUnitName ?? puRecord?.name ?? puResult?.pollingUnitName ?? 'Unknown',
      code: puRecord?.code ?? selectedPollingUnitId,
      ward: puRecord?.wardName,
      lga: puRecord?.lgaName,
      state: puRecord?.stateName,
      result: puResult,
      incidents: puIncidents,
      totalVotes,
      ranked,
      winner,
    };
  }, [selectedPollingUnitId, selectedPollingUnitName, allPollingUnits, allResults, incidents, candidates]);

  const handleSelectPu = () => {
    router.push('/pu-picker' as any);
  };

  return (
    <ScreenView scrollable keyboardShouldPersistTaps="handled" refreshControl={refreshControl}>
      <View style={{ paddingBottom: spacing.xxl, gap: spacing.screen.sectionGap }}>
        <View style={styles.welcomeWrap}>
          <LinearGradient colors={[...gradientPresets.primary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.welcomeGradient}>
            <ThemedText variant="xl" style={{ color: '#fff', fontWeight: '700', marginBottom: spacing.xs }} minFontSize={18} maxFontSize={26}>
              Welcome back, {user?.name ?? 'User'}
            </ThemedText>
            <ThemedText variant="body" style={{ color: 'rgba(255,255,255,0.8)' }}>
              {isElectionOfficer ? 'Election Officer Dashboard' : isFieldAgent ? 'Field Agent Dashboard' : 'Election Intelligence'}
            </ThemedText>
          </LinearGradient>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.md }} keyboardShouldPersistTaps="handled">
          <StatCard icon="🗳" label="Total Elections" value={String(elections.length)} gradient={gradientPresets.primary} colors={colors} />
          <StatCard icon="⚠" label="Open Incidents" value={String(recentIncidents.length)} gradient={gradientPresets.accent} colors={colors} />
        </ScrollView>

        {(isFieldAgent || isPollingAgent) && (
          <View>
            <ThemedText variant="label" style={{ marginBottom: spacing.xs }}>
              {isPollingAgent ? 'Your Polling Unit' : 'Your Polling Unit'}
            </ThemedText>
            {selectedPollingUnitId && puDetails ? (
              <Card style={shadows.md}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                  <View style={[styles.puIcon, { backgroundColor: colors.accent + '20' }]}>
                    <Ionicons name="location" size={20} color={colors.accent} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <ThemedText variant="body" style={{ fontWeight: '600' }}>{puDetails.name}</ThemedText>
                    <ThemedText variant="caption" color="textSecondary">
                      {puDetails.code} · {puDetails.lga} · {puDetails.state}
                    </ThemedText>
                  </View>
                  {isFieldAgent && (
                    <Button label="Change" size="sm" variant="ghost" onPress={handleSelectPu} />
                  )}
                </View>
              </Card>
            ) : (
              <>
                {isPollingAgent && user?.assignedLocations && user.assignedLocations.length > 0 && (
                  <Button
                    label={`Open Assigned Unit (${user.assignedLocations[0]})`}
                    onPress={() => {
                      const puId = user.assignedLocations![0];
                      useAuthStore.getState().setSelectedPollingUnit(puId, puId);
                    }}
                    leftIcon="location-outline"
                    fullWidth
                  />
                )}
                {isFieldAgent && (
                  <Button label="Select Polling Unit" onPress={handleSelectPu} leftIcon="location-outline" fullWidth />
                )}
              </>
            )}
          </View>
        )}

        {puDetails && (
          <View>
            <ThemedText variant="h3" style={{ marginBottom: spacing.sm }} minFontSize={16} maxFontSize={22}>{puDetails.name}</ThemedText>
            <Card style={[shadows.md, { marginBottom: spacing.md }]}>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.sm }}>
                <View style={{ backgroundColor: colors.accent + '18', paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.full }}>
                  <ThemedText variant="caption" style={{ color: colors.primary, fontWeight: '600' }}>{puDetails.code}</ThemedText>
                </View>
                {puDetails.ward && (
                  <View style={{ backgroundColor: colors.border, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.full }}>
                    <ThemedText variant="caption" color="textSecondary">Ward: {puDetails.ward}</ThemedText>
                  </View>
                )}
                {puDetails.lga && (
                  <View style={{ backgroundColor: colors.border, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.full }}>
                    <ThemedText variant="caption" color="textSecondary">LGA: {puDetails.lga}</ThemedText>
                  </View>
                )}
                {puDetails.state && (
                  <View style={{ backgroundColor: colors.border, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.full }}>
                    <ThemedText variant="caption" color="textSecondary">State: {puDetails.state}</ThemedText>
                  </View>
                )}
              </View>
              <Button label="Change Polling Unit" size="sm" variant="ghost" onPress={handleSelectPu} />
            </Card>

            {puDetails.result && (
              <Card style={[shadows.md, { marginBottom: spacing.md }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm }}>
                  <ThemedText variant="h3" style={{ marginBottom: 0 }} minFontSize={16} maxFontSize={22}>Results</ThemedText>
                  <View style={{ flexDirection: 'row', gap: spacing.sm, alignItems: 'center' }}>
                    <ThemedText variant="caption" color="textSecondary">{puDetails.totalVotes.toLocaleString()} votes</ThemedText>
                    <Button label="Add Incident" size="sm" variant="outline" onPress={() => router.push({ pathname: ROUTES.INCIDENT_REPORT, params: { pollingUnitId: selectedPollingUnitId, pollingUnitName: selectedPollingUnitName, electionId: 'e1' } } as any)} />
                  </View>
                </View>
                {puDetails.ranked.map((c) => {
                  const isWinner = puDetails.winner && c.id === puDetails.winner.id;
                  const isWatched = user?.watchCandidateId === c.id;
                  return (
                    <View key={c.id} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs, paddingVertical: spacing.xs, borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: isWinner ? colors.success + '12' : isWatched ? colors.accent + '12' : 'transparent', paddingHorizontal: isWinner || isWatched ? spacing.sm : 0, borderRadius: radius.sm }}>
                      <ThemedText variant="body" style={{ flex: 1, fontWeight: isWinner || isWatched ? '700' : '400' }}>{c.fullName}</ThemedText>
                      <ThemedText variant="caption" color="textSecondary">{c.partyAcronym}</ThemedText>
                      <ThemedText variant="body" style={{ fontWeight: '700', color: isWinner ? colors.success : undefined }}>{c.votes.toLocaleString()}</ThemedText>
                      {isWinner && <ThemedText variant="caption" style={{ color: colors.success, fontWeight: '700' }}>WINNER</ThemedText>}
                      {isWatched && !isWinner && <ThemedText variant="caption" style={{ color: colors.accent, fontWeight: '700' }}>WATCHING</ThemedText>}
                    </View>
                  );
                })}
              </Card>
            )}

            {puDetails.incidents.length > 0 && (
              <Card style={[shadows.md, { marginBottom: spacing.md }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md }}>
                  <View style={[styles.sectionIndicator, { backgroundColor: colors.critical }]} />
                  <ThemedText variant="h3" style={{ flex: 1 }} minFontSize={16} maxFontSize={22}>Incidents at this PU</ThemedText>
                </View>
                {puDetails.incidents.map((inc) => (
                  <View key={inc.id} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs }}>
                    <View style={[styles.severityDot, { backgroundColor: colors[severityColors[inc.severity] as keyof typeof Colors.light] as any }]} />
                    <View style={{ flex: 1 }}>
                      <ThemedText variant="body" style={{ fontWeight: '600' }}>{inc.category.replace(/_/g, ' ')}</ThemedText>
                      <ThemedText variant="caption" color="textSecondary">{new Date(inc.reportedAt).toLocaleDateString()}</ThemedText>
                    </View>
                    <View style={[styles.severityBadge, { backgroundColor: (colors[severityColors[inc.severity] as keyof typeof Colors.light] as any) + '20' }]}>
                      <ThemedText variant="caption" style={{ color: colors[severityColors[inc.severity] as keyof typeof Colors.light] as any, fontWeight: '600' }}>{inc.severity}</ThemedText>
                    </View>
                  </View>
                ))}
              </Card>
            )}
          </View>
        )}

        {!isFieldAgent && !isPollingAgent && (
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm }}>
              <View style={[styles.sectionIndicator, { backgroundColor: colors.primary }]} />
              <ThemedText variant="h3" style={{ flex: 1 }} minFontSize={16} maxFontSize={22}>Reporting Progress</ThemedText>
            </View>
            <Card style={[shadows.md]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm }}>
                <ThemedText variant="body" style={{ fontWeight: '500' }}>{totalReportingPUs.toLocaleString()} / {totalPUs.toLocaleString()} Polling Units</ThemedText>
                <ThemedText variant="caption" color="textSecondary" style={{ fontWeight: '600' }}>{reportingPct}%</ThemedText>
              </View>
              <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
                <View style={[styles.progressFill, { width: `${reportingPct}%`, backgroundColor: colors.primary }]} />
              </View>
            </Card>
          </View>
        )}

        <WinnerCard candidates={candidates} results={allResults} colors={colors} />

        <WatchCandidateCard candidates={candidates} colors={colors} />

        {isFieldAgent && (
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm }}>
              <View style={[styles.sectionIndicator, { backgroundColor: colors.primary }]} />
              <ThemedText variant="h3" style={{ flex: 1 }} minFontSize={16} maxFontSize={22}>Your Locations</ThemedText>
            </View>
            <ThemedText variant="body" color="textSecondary" style={{ marginBottom: spacing.md }}>
              Results aggregated across all your assigned polling units
            </ThemedText>
            {allResults.length === 0 ? (
              <EmptyState icon="location-outline" title="No Results" subtitle="No results for your assigned locations yet" />
            ) : (
              allResults.slice(0, 5).map((r) => (
                <Card key={r.id} style={[shadows.sm, { marginBottom: spacing.md }]}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View>
                      <ThemedText variant="body" style={{ fontWeight: '600' }}>{r.pollingUnitName}</ThemedText>
                      <ThemedText variant="caption" color="textSecondary">{r.totalVotesCast.toLocaleString()} votes</ThemedText>
                    </View>
                    <View style={[styles.statusDot, { backgroundColor: colors.success }]} />
                  </View>
                </Card>
              ))
            )}
          </View>
        )}

        <ThemedText variant="h3" style={{ marginBottom: spacing.sm }} minFontSize={16} maxFontSize={22}>
          Upcoming Elections
        </ThemedText>
        {loading ? (
          <View style={{ gap: spacing.md, paddingBottom: spacing.md }}>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </View>
        ) : elections.length === 0 ? (
          <EmptyState icon="calendar-outline" title="No Elections" subtitle="No elections configured yet" />
        ) : (
          <View style={{ gap: spacing.md }}>
            {elections.map((election) => (
              <Card key={election.id} pressable onPress={() => router.push({ pathname: ROUTES.ELECTION_DETAIL, params: { id: election.id } })} style={shadows.sm}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs }}>
                  <View style={[styles.electionIcon, { backgroundColor: colors.primary + '12' }]}>
                    <Ionicons name="calendar-outline" size={18} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <ThemedText variant="body" style={{ fontWeight: '600' }}>
                      {election.position} - {election.electoralArea}
                    </ThemedText>
                    <ThemedText variant="caption" color="textSecondary" style={{ marginTop: spacing.xs }}>
                      {election.electionDate} · {election.status}
                    </ThemedText>
                  </View>
                </View>
              </Card>
            ))}
          </View>
        )}

        <ThemedText variant="h3" style={{ marginBottom: spacing.sm }} minFontSize={16} maxFontSize={22}>
          Recent Incidents
        </ThemedText>
        {recentIncidents.length === 0 ? (
          <EmptyState icon="shield-checkmark-outline" title="No Incidents" subtitle="All clear — no incidents reported" />
        ) : (
          recentIncidents.map((incident) => {
            const sevKey = incident.severity === 'CRITICAL' ? 'CRITICAL' : incident.severity;
            return (
              <Card key={incident.id} style={[shadows.sm, { marginBottom: spacing.md }]}>
                <View style={styles.row}>
                  <View style={[styles.severityDot, { backgroundColor: colors[severityColors[sevKey] as keyof typeof Colors.light] as any }]} />
                  <View style={{ flex: 1 }}>
                    <ThemedText variant="body" style={{ fontWeight: '600' }}>
                      {incident.category.replace(/_/g, ' ')}
                    </ThemedText>
                    <ThemedText variant="caption" color="textSecondary">
                      {incident.electoralArea} · {new Date(incident.reportedAt).toLocaleDateString()}
                    </ThemedText>
                  </View>
                  <View style={[styles.severityBadge, { backgroundColor: (colors[severityColors[sevKey] as keyof typeof Colors.light] as any) + '20' }]}>
                    <ThemedText variant="caption" style={{ color: colors[severityColors[sevKey] as keyof typeof Colors.light] as any, fontWeight: '600' }}>
                      {incident.severity}
                    </ThemedText>
                  </View>
                </View>
              </Card>
            );
          })
        )}

        <QuickActions colors={colors} electionId={elections[0]?.id} />
      </View>
    </ScreenView>
  );
}

const styles = StyleSheet.create({
  welcomeWrap: { marginTop: spacing.md, borderRadius: radius.xl, overflow: 'hidden' },
  welcomeGradient: { paddingVertical: spacing.xxl, paddingHorizontal: spacing.lg },
  statCard: { width: sizes.statCard, padding: spacing.lg, borderRadius: radius.lg },
  gradientIconWrap: { overflow: 'hidden' },
  gradientIconBg: { width: 48, height: 48, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  progressTrack: { height: spacing.sm, borderRadius: radius.sm, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: radius.sm },
  severityDot: { width: spacing.sm, height: spacing.sm, borderRadius: radius.sm },
  severityBadge: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.full },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  quickActionCard: { flex: 1 },
  quickActionIcon: { width: 40, height: 40, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  puIcon: { width: 40, height: 40, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center' },
  winnerBadge: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  statusDot: { width: spacing.sm, height: spacing.sm, borderRadius: radius.full },
  sectionIndicator: { width: 4, height: 16, borderRadius: radius.full },
  electionIcon: { width: 36, height: 36, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
});
