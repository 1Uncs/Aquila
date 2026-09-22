import React, { useState, useMemo, useEffect, useRef } from 'react';
import { View, StyleSheet, LayoutAnimation, Image, Pressable, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenView } from '@/core/components/ScreenView';
import { ThemedText, Card, EmptyState, Button, IncidentMarquee, SectionHeader } from '@/core/components';
import { EntranceView } from '@/core/components/EntranceView';
import { useAuthStore, useResultsStore, Candidate, ResultSubmission } from '@/features/auth/store';
import { ROUTES } from '@/constants/routes';
import { spacing, radius, shadows, border } from '@/constants/tokens';
import { useColorScheme } from '@/core/hooks/useColorScheme';
import { useStatusBar } from '@/core/hooks/useStatusBar';
import { useElectionsQuery, useIncidentsQuery, useCandidatesQuery, useResultsQuery, useAIProjectionQuery } from '@/features/elections/hooks';
import { useRefreshControl, useHaptics, useForegroundRefresh } from '@/core/hooks';
import Colors from '@/constants/colors';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

// 3 Assigned Polling Units for Field Agent Demo (Audio Part 3)
const ASSIGNED_DEMO_PUS = [
  {
    id: 'pu-s25-lga-1-1',
    code: 'PU 24/08/01/001',
    name: 'PU 001 · Alausa Secretariat',
    lga: 'Ikeja',
    state: 'Lagos',
    status: 'PUBLISHED' as const,
    votes: 578,
    accredited: 600,
  },
  {
    id: 'pu-s25-lga-1-2',
    code: 'PU 24/08/01/002',
    name: 'PU 002 · Ojodu Primary School',
    lga: 'Ikeja',
    state: 'Lagos',
    status: 'DRAFT' as const,
    votes: 275,
    accredited: 300,
  },
  {
    id: 'pu-s25-lga-1-3',
    code: 'PU 24/08/01/003',
    name: 'PU 003 · Oregun High School',
    lga: 'Ikeja',
    state: 'Lagos',
    status: 'PENDING' as const,
    votes: 0,
    accredited: 450,
  },
];

const PARTY_COLORS: Record<string, string> = {
  APC: '#0D6338',
  PDP: '#DC2626',
  LP: '#16A34A',
  NNPP: '#2563EB',
};

export default function DashboardScreen() {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  useStatusBar({ barStyle: scheme === 'dark' ? 'light' : 'dark' });

  const { data: elections = [], isLoading: electionsLoading, refetch: refetchElections } = useElectionsQuery();
  const { data: incidents = [], isLoading: incidentsLoading, refetch: refetchIncidents } = useIncidentsQuery();
  const { data: candidates = [] } = useCandidatesQuery('e1');
  const { data: allResults = [], refetch: refetchResults } = useResultsQuery();
  const { user } = useAuthStore();
  const { submissions } = useResultsStore();
  const { impact } = useHaptics();

  // Active drafts count from persistent store (Audio Part 3)
  const draftSubmissions = useMemo(() => {
    return submissions.filter((s) => s.status === 'DRAFT');
  }, [submissions]);

  // AI Projection parameters (Audio Parts 6, 7, 8, 9)
  const [selectedCandidateId, setSelectedCandidateId] = useState('cand1');
  const [pastDataEnum, setPastDataEnum] = useState<0 | 1 | 2>(0);
  const [currentDataSwitch, setCurrentDataSwitch] = useState(true);

  const { data: projection } = useAIProjectionQuery({
    candidateId: selectedCandidateId,
    currentData: currentDataSwitch,
    pastData: pastDataEnum,
  });

  // Simulated Live Pulse (Audio Part 6: simulated live incoming data pulsing every 12s across all values)
  const [pulseBonusVotes, setPulseBonusVotes] = useState<Record<string, number>>({
    cand1: 0, // APC
    cand2: 0, // PDP
    cand3: 0, // LP
    cand4: 0, // NNPP
  });
  const [livePulsePUs, setLivePulsePUs] = useState(725);
  const [pulseActive, setPulseActive] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const timer = setInterval(() => {
      setPulseActive(true);
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.35, duration: 280, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
      ]).start();

      const incVotes = Math.floor(Math.random() * 55) + 30; // 30-85 new votes incoming
      const incPUs = Math.random() > 0.45 ? 1 : 0;

      // Proportional vote increment matching field returns
      const apcAdd = Math.round(incVotes * 0.38);
      const lpAdd = Math.round(incVotes * 0.34);
      const pdpAdd = Math.round(incVotes * 0.22);
      const nnppAdd = Math.max(0, incVotes - apcAdd - lpAdd - pdpAdd);

      setPulseBonusVotes((prev) => ({
        cand1: (prev.cand1 ?? 0) + apcAdd,
        cand2: (prev.cand2 ?? 0) + pdpAdd,
        cand3: (prev.cand3 ?? 0) + lpAdd,
        cand4: (prev.cand4 ?? 0) + nnppAdd,
      }));

      setLivePulsePUs((prev) => prev + incPUs);
      setTimeout(() => setPulseActive(false), 1200);
    }, 12000);
    return () => clearInterval(timer);
  }, [pulseAnim]);

  const { refreshControl } = useRefreshControl(
    electionsLoading || incidentsLoading,
    () => Promise.all([refetchElections(), refetchIncidents(), refetchResults()])
  );
  useForegroundRefresh([['elections', 'list'], ['incidents', 'list'], ['results', 'list']], 5 * 60 * 1000);

  const isFieldAgent = user?.role === 'FIELD_AGENT' || !user?.role;
  const isElectionOfficer = user?.role === 'ELECTION_OFFICER';

  // Candidate scores aggregation for snapshot performance (Audio Part 2 & 6: linked to live pulse)
  const candidateScores = useMemo(() => {
    const totals: Record<string, number> = {};
    allResults.forEach((r) => {
      Object.entries(r.candidateVotes).forEach(([candId, v]) => {
        const val = typeof v === 'number' ? v : 0;
        totals[candId] = (totals[candId] ?? 0) + val;
      });
    });

    const baseMap: Record<string, number> = {
      cand1: 6420, // APC
      cand3: 5890, // LP
      cand2: 3980, // PDP
      cand4: 1210, // NNPP
    };

    let grandTotal = 0;
    const list = candidates.map((c) => {
      const dbVotes = totals[c.id];
      const base = dbVotes !== undefined ? dbVotes : (baseMap[c.id] ?? 500);
      const votes = base + (pulseBonusVotes[c.id] ?? 0);
      grandTotal += votes;
      return { ...c, votes };
    });

    return list
      .map((c) => ({
        ...c,
        pct: grandTotal > 0 ? (c.votes / grandTotal) * 100 : 25,
      }))
      .sort((a, b) => b.votes - a.votes);
  }, [candidates, allResults, pulseBonusVotes]);

  const grandTotalVotes = useMemo(() => {
    return candidateScores.reduce((acc, c) => acc + c.votes, 0);
  }, [candidateScores]);

  // Audio Part 2: Show candidate agent is tied to first (default Peter Obi / LP if unspecified)
  const myCandidateId = user?.watchCandidateId ?? 'cand3';
  const winningCandidate = candidateScores[0];
  const myCandidate = candidateScores.find((c) => c.id === myCandidateId) ?? candidateScores[0];
  const myCandidateRank = candidateScores.findIndex((c) => c.id === myCandidate?.id) + 1;
  const otherCandidates = candidateScores.filter((c) => c.id !== myCandidate?.id).slice(0, 3);

  return (
    <ScreenView
      scrollable
      refreshControl={refreshControl}
      contentContainerStyle={styles.scrollContent}
    >
      {/* 1. Station Console Header */}
      <EntranceView delay={50}>
        <View style={[styles.consoleHeader, { borderColor: colors.border }]}>
          <View style={styles.consoleTopRow}>
            <View style={{ flex: 1 }}>
              <View style={styles.orgTagRow}>
                <View style={[styles.orgDot, { backgroundColor: colors.primary }]} />
                <ThemedText variant="label" color="primary" fontFamily="bold" numberOfLines={1}>
                  {user?.organizationName ?? 'AQUILA SITUATION ROOM'}
                </ThemedText>
              </View>
              <ThemedText variant="title" color="text" fontFamily="bold" style={{ marginTop: 2 }}>
                Presidential Collation
              </ThemedText>
            </View>

            {/* Live Pulse Indicator Badge */}
            <View style={[styles.pulseBadge, { backgroundColor: colors.primarySubtle, borderColor: colors.primary + '33' }]}>
              <Animated.View
                style={[
                  styles.pulseDot,
                  {
                    backgroundColor: colors.primary,
                    transform: [{ scale: pulseAnim }],
                  },
                ]}
              />
              <ThemedText variant="label" color="primary" fontFamily="bold">
                LIVE PULSE
              </ThemedText>
            </View>
          </View>

          {/* Real-time Ticker stats */}
          <View style={styles.tickerStatsRow}>
            <View style={styles.tickerStatItem}>
              <ThemedText variant="caption" color="textMuted">REPORTING PUS</ThemedText>
              <ThemedText variant="h3" color="text" fontFamily="bold">
                {livePulsePUs.toLocaleString()}
              </ThemedText>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.tickerStatItem}>
              <ThemedText variant="caption" color="textMuted">TOTAL VOTES TALLIED</ThemedText>
              <ThemedText variant="h3" color="primary" fontFamily="bold">
                {grandTotalVotes.toLocaleString()}
              </ThemedText>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.tickerStatItem}>
              <ThemedText variant="caption" color="textMuted">STATUS</ThemedText>
              <ThemedText variant="h3" color="warning" fontFamily="bold">
                ACTIVE
              </ThemedText>
            </View>
          </View>
        </View>
      </EntranceView>

      {/* 2. Drafts Alert Banner (Audio Part 3) */}
      {draftSubmissions.length > 0 && (
        <EntranceView delay={100}>
          <Pressable
            onPress={() => {
              impact(Haptics.ImpactFeedbackStyle.Medium);
              router.push(ROUTES.RESULT_DRAFTS);
            }}
          >
            <Card style={[styles.draftAlertCard, { backgroundColor: colors.warningSubtle, borderColor: colors.warning }]}>
              <View style={styles.draftAlertContent}>
                <View style={[styles.draftAlertIcon, { backgroundColor: colors.warning + '20' }]}>
                  <Ionicons name="document-text" size={20} color={colors.warning} />
                </View>
                <View style={{ flex: 1 }}>
                  <ThemedText variant="body" color="text" fontFamily="bold">
                    {draftSubmissions.length} Pending Result Draft{draftSubmissions.length > 1 ? 's' : ''}
                  </ThemedText>
                  <ThemedText variant="caption" color="textSecondary">
                    You have saved drafts awaiting review and final publication.
                  </ThemedText>
                </View>
                <View style={[styles.actionPill, { backgroundColor: colors.warning }]}>
                  <ThemedText variant="caption" color="#FFFFFF" fontFamily="bold">
                    Resume
                  </ThemedText>
                  <Ionicons name="chevron-forward" size={14} color="#FFFFFF" />
                </View>
              </View>
            </Card>
          </Pressable>
        </EntranceView>
      )}

      {/* 3. Candidate Snapshot Performance (Audio Part 2) */}
      <EntranceView delay={150}>
        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <View>
              <ThemedText variant="title" color="text" fontFamily="bold">
                Snapshot Performance
              </ThemedText>
              <ThemedText variant="caption" color="textSecondary">
                Live top candidates ranked by verified vote tally
              </ThemedText>
            </View>
            {winningCandidate && (
              <View style={[styles.winnerBadge, { backgroundColor: colors.primarySubtle }]}>
                <Ionicons name="trophy" size={12} color={colors.primary} />
                <ThemedText variant="label" color="primary" fontFamily="bold" style={{ marginLeft: 4 }}>
                  Leading
                </ThemedText>
              </View>
            )}
          </View>

          {/* Candidate score rows (Audio Part 2: Agent's affiliated candidate pinned at the top) */}
          <View style={{ gap: spacing.sm, marginTop: spacing.sm }}>
            {myCandidate && (
              <View style={[styles.candidateRowCard, { borderColor: colors.primary, borderWidth: 1.5 }]}>
                <View style={styles.candHeader}>
                  <View style={styles.candLeft}>
                    <View style={[styles.rankTag, { backgroundColor: colors.primary }]}>
                      <ThemedText variant="caption" color="#FFFFFF" fontFamily="bold">
                        #{myCandidateRank}
                      </ThemedText>
                    </View>
                    <View style={{ marginLeft: spacing.xs, flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <ThemedText variant="body" color="text" fontFamily="bold">
                          {myCandidate.fullName}
                        </ThemedText>
                        <View style={[styles.myCandidatePill, { backgroundColor: colors.primarySubtle }]}>
                          <ThemedText variant="label" color="primary" fontFamily="bold">
                            MY CANDIDATE
                          </ThemedText>
                        </View>
                      </View>
                      <View style={styles.partyBadgeRow}>
                        <View style={[styles.partyPill, { backgroundColor: (PARTY_COLORS[myCandidate.partyAcronym] ?? colors.primary) + '18' }]}>
                          <ThemedText variant="label" style={{ color: PARTY_COLORS[myCandidate.partyAcronym] ?? colors.primary }} fontFamily="bold">
                            {myCandidate.partyAcronym}
                          </ThemedText>
                        </View>
                        {myCandidate.candidateNumber ? (
                          <ThemedText variant="label" color="textMuted" style={{ marginLeft: 6 }}>
                            ID #{myCandidate.candidateNumber}
                          </ThemedText>
                        ) : null}
                      </View>
                    </View>
                  </View>

                  <View style={{ alignItems: 'flex-end' }}>
                    <ThemedText variant="title" color="text" fontFamily="bold">
                      {myCandidate.votes.toLocaleString()}
                    </ThemedText>
                    <ThemedText variant="caption" color="primary" fontFamily="bold">
                      {myCandidate.pct.toFixed(1)}%
                    </ThemedText>
                  </View>
                </View>

                {/* Progress bar */}
                <View style={[styles.progressBarTrack, { backgroundColor: colors.borderSubtle }]}>
                  <View
                    style={[
                      styles.progressBarFill,
                      {
                        width: `${Math.min(myCandidate.pct, 100)}%`,
                        backgroundColor: PARTY_COLORS[myCandidate.partyAcronym] ?? colors.primary,
                      },
                    ]}
                  />
                </View>
              </View>
            )}

            {/* Other Contesting Candidates */}
            {otherCandidates.map((cand) => {
              const rank = candidateScores.findIndex((c) => c.id === cand.id) + 1;
              const isWinner = rank === 1;
              const partyCol = PARTY_COLORS[cand.partyAcronym] ?? colors.primary;

              return (
                <View key={cand.id} style={[styles.candidateRowCard, { borderColor: isWinner ? colors.primary : colors.border }]}>
                  <View style={styles.candHeader}>
                    <View style={styles.candLeft}>
                      <View style={[styles.rankTag, { backgroundColor: isWinner ? colors.primary : colors.borderSubtle }]}>
                        <ThemedText variant="caption" color={isWinner ? '#FFFFFF' : 'textSecondary'} fontFamily="bold">
                          #{rank}
                        </ThemedText>
                      </View>
                      <View style={{ marginLeft: spacing.xs, flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                          <ThemedText variant="body" color="text" fontFamily="bold">
                            {cand.fullName}
                          </ThemedText>
                          {isWinner && (
                            <View style={[styles.winnerMiniPill, { backgroundColor: colors.primarySubtle }]}>
                              <Ionicons name="trophy" size={10} color={colors.primary} />
                              <ThemedText variant="label" color="primary" fontFamily="bold" style={{ marginLeft: 2, fontSize: 10 }}>
                                LEADING
                              </ThemedText>
                            </View>
                          )}
                        </View>
                        <View style={styles.partyBadgeRow}>
                          <View style={[styles.partyPill, { backgroundColor: partyCol + '18' }]}>
                            <ThemedText variant="label" style={{ color: partyCol }} fontFamily="bold">
                              {cand.partyAcronym}
                            </ThemedText>
                          </View>
                          {cand.candidateNumber ? (
                            <ThemedText variant="label" color="textMuted" style={{ marginLeft: 6 }}>
                              ID #{cand.candidateNumber}
                            </ThemedText>
                          ) : null}
                        </View>
                      </View>
                    </View>

                    <View style={{ alignItems: 'flex-end' }}>
                      <ThemedText variant="title" color="text" fontFamily="bold">
                        {cand.votes.toLocaleString()}
                      </ThemedText>
                      <ThemedText variant="caption" color="primary" fontFamily="bold">
                        {cand.pct.toFixed(1)}%
                      </ThemedText>
                    </View>
                  </View>

                  {/* Progress bar */}
                  <View style={[styles.progressBarTrack, { backgroundColor: colors.borderSubtle }]}>
                    <View style={[styles.progressBarFill, { width: `${Math.min(cand.pct, 100)}%`, backgroundColor: partyCol }]} />
                  </View>
                </View>
              );
            })}
          </View>
        </Card>
      </EntranceView>

      {/* 4. AI Election Projection Engine (Audio Parts 6, 7, 8, 9) */}
      <EntranceView delay={200}>
        <Card style={[styles.aiCard, { borderColor: colors.primary }]}>
          <View style={styles.aiHeaderRow}>
            <View style={styles.aiTitleBlock}>
              <View style={[styles.aiIconBadge, { backgroundColor: colors.primary }]}>
                <Ionicons name="sparkles" size={16} color="#FFFFFF" />
              </View>
              <View style={{ marginLeft: spacing.xs }}>
                <ThemedText variant="title" color="text" fontFamily="bold">
                  Aquila AI Projection
                </ThemedText>
                <ThemedText variant="label" color="primary" fontFamily="medium">
                  NEURAL ELECTION SIMULATION MODEL
                </ThemedText>
              </View>
            </View>

            {projection && (
              <View style={[styles.probBadge, { backgroundColor: colors.primarySubtle }]}>
                <ThemedText variant="caption" color="primary" fontFamily="bold">
                  {projection.winProbability}% Win Prob
                </ThemedText>
              </View>
            )}
          </View>

          {/* Candidate Switcher Chips */}
          <ThemedText variant="label" color="textSecondary" fontFamily="bold" style={{ marginTop: spacing.sm, marginBottom: 4 }}>
            SELECT CANDIDATE TO PROJECT
          </ThemedText>
          <View style={styles.candChipsRow}>
            {candidates.map((c) => {
              const active = selectedCandidateId === c.id;
              return (
                <Pressable
                  key={c.id}
                  onPress={() => {
                    impact(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedCandidateId(c.id);
                  }}
                  style={[
                    styles.candChip,
                    {
                      backgroundColor: active ? colors.primary : colors.surface,
                      borderColor: active ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <ThemedText
                    variant="caption"
                    color={active ? '#FFFFFF' : 'text'}
                    fontFamily={active ? 'bold' : 'regular'}
                  >
                    {c.shortName ?? c.fullName.split(' ')[0]} ({c.partyAcronym})
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>

          {/* Historical Baseline Dataset Tabs (Audio Part 9: 0: 2023, 1: 2019, 2: Combined) */}
          <ThemedText variant="label" color="textSecondary" fontFamily="bold" style={{ marginTop: spacing.sm, marginBottom: 4 }}>
            HISTORICAL BASELINE DATASET
          </ThemedText>
          <View style={styles.datasetTabs}>
            {[
              { enumVal: 0 as const, label: '2023 Election' },
              { enumVal: 1 as const, label: '2019 Election' },
              { enumVal: 2 as const, label: 'Combined 19+23' },
            ].map((tab) => {
              const active = pastDataEnum === tab.enumVal;
              return (
                <Pressable
                  key={tab.enumVal}
                  onPress={() => {
                    impact(Haptics.ImpactFeedbackStyle.Light);
                    setPastDataEnum(tab.enumVal);
                  }}
                  style={[
                    styles.datasetTab,
                    {
                      backgroundColor: active ? colors.primarySubtle : colors.surface,
                      borderColor: active ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <ThemedText
                    variant="caption"
                    color={active ? 'primary' : 'textSecondary'}
                    fontFamily={active ? 'bold' : 'regular'}
                  >
                    {tab.label}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>

          {/* AI Projection Output Metrics */}
          {projection && (
            <View style={[styles.aiMetricsBox, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
              <View style={styles.aiMetricRow}>
                <View style={{ flex: 1 }}>
                  <ThemedText variant="caption" color="textSecondary">PROJECTED SHARE</ThemedText>
                  <ThemedText variant="h2" color="primary" fontFamily="bold">
                    {projection.projectedVoteShare}%
                  </ThemedText>
                </View>
                <View style={{ flex: 1, alignItems: 'flex-end' }}>
                  <ThemedText variant="caption" color="textSecondary">HISTORICAL PARTY</ThemedText>
                  <ThemedText variant="body" color="text" fontFamily="bold">
                    {projection.historicalParty}
                  </ThemedText>
                </View>
              </View>

              <View style={[styles.insightBox, { backgroundColor: colors.primarySubtle + '40', borderColor: colors.primary + '25' }]}>
                <Ionicons name="analytics-outline" size={16} color={colors.primary} />
                <ThemedText variant="caption" color="text" style={{ flex: 1, marginLeft: 6 }}>
                  {projection.keyInsights[0]}
                </ThemedText>
              </View>

              {/* Mandatory AI Disclaimer (Audio Part 8) */}
              <View style={styles.disclaimerRow}>
                <Ionicons name="information-circle-outline" size={14} color={colors.textMuted} />
                <ThemedText variant="label" color="textMuted" style={{ flex: 1, marginLeft: 4 }}>
                  {projection.disclaimer}
                </ThemedText>
              </View>
            </View>
          )}
        </Card>
      </EntranceView>

      {/* 5. Assigned Polling Units (PRD: PU Agent = 1 PU, Field Agent = 3 PUs, Officer = Supervisory) */}
      <EntranceView delay={250}>
        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <View>
              <ThemedText variant="title" color="text" fontFamily="bold">
                {user?.role === 'POLLING_AGENT'
                  ? 'My Assigned Polling Unit'
                  : isElectionOfficer
                    ? 'Jurisdictional Polling Units'
                    : 'My Assigned Polling Units'}
              </ThemedText>
              <ThemedText variant="caption" color="textSecondary">
                {user?.role === 'POLLING_AGENT'
                  ? 'Polling Unit Agent assignment · 1 Polling Unit'
                  : isElectionOfficer
                    ? 'Election Officer supervisory overview · 3 Reporting Units'
                    : 'Field Agent jurisdiction · 3 Polling Units'}
              </ThemedText>
            </View>
            <Pressable
              onPress={() => {
                impact(Haptics.ImpactFeedbackStyle.Light);
                router.push(ROUTES.LOCATIONS);
              }}
            >
              <ThemedText variant="caption" color="primary" fontFamily="bold">
                View All
              </ThemedText>
            </Pressable>
          </View>

          <View style={{ gap: spacing.sm, marginTop: spacing.sm }}>
            {(user?.role === 'POLLING_AGENT' ? ASSIGNED_DEMO_PUS.slice(0, 1) : ASSIGNED_DEMO_PUS).map((pu) => {
              const isPub = pu.status === 'PUBLISHED';
              const isDraft = pu.status === 'DRAFT';

              return (
                <View key={pu.id} style={[styles.puCard, { borderColor: colors.border }]}>
                  <View style={styles.puTopRow}>
                    <View style={{ flex: 1 }}>
                      <ThemedText variant="body" color="text" fontFamily="bold">
                        {pu.name}
                      </ThemedText>
                      <ThemedText variant="caption" color="textSecondary">
                        {pu.code} · {pu.lga}, {pu.state}
                      </ThemedText>
                    </View>

                    <View
                      style={[
                        styles.puStatusBadge,
                        {
                          backgroundColor: isPub
                            ? colors.successSubtle
                            : isDraft
                              ? colors.warningSubtle
                              : colors.borderSubtle,
                        },
                      ]}
                    >
                      <Ionicons
                        name={isPub ? 'checkmark-circle' : isDraft ? 'time' : 'radio-button-off'}
                        size={12}
                        color={isPub ? colors.success : isDraft ? colors.warning : colors.textMuted}
                      />
                      <ThemedText
                        variant="label"
                        fontFamily="bold"
                        style={{
                          marginLeft: 4,
                          color: isPub ? colors.success : isDraft ? colors.warning : colors.textMuted,
                        }}
                      >
                        {pu.status}
                      </ThemedText>
                    </View>
                  </View>

                  <View style={styles.puBottomRow}>
                    <ThemedText variant="caption" color="textSecondary">
                      {isPub
                        ? `${pu.votes} Votes tallied (${pu.accredited} accredited)`
                        : isDraft
                          ? 'Draft saved in local store'
                          : 'Awaiting accredited ballot entry'}
                    </ThemedText>

                    <Pressable
                      onPress={() => {
                        impact(Haptics.ImpactFeedbackStyle.Medium);
                        if (isElectionOfficer) {
                          // Election officers can view results, not submit
                          router.push({ pathname: ROUTES.RESULT_DETAIL, params: { id: 'r1' } });
                        } else if (isPub) {
                          router.push({ pathname: ROUTES.RESULT_DETAIL, params: { id: 'r1' } });
                        } else if (isDraft) {
                          router.push(ROUTES.RESULT_DRAFTS);
                        } else {
                          router.push({ pathname: ROUTES.RESULT_SUBMIT, params: { puId: pu.id, puName: pu.name } });
                        }
                      }}
                      style={[
                        styles.puActionBtn,
                        { backgroundColor: isPub || isElectionOfficer ? colors.borderSubtle : colors.primary },
                      ]}
                    >
                      <ThemedText
                        variant="caption"
                        color={isPub || isElectionOfficer ? 'text' : '#FFFFFF'}
                        fontFamily="bold"
                      >
                        {isElectionOfficer ? 'View' : isPub ? 'View' : isDraft ? 'Resume' : 'Submit'}
                      </ThemedText>
                      <Ionicons
                        name="chevron-forward"
                        size={12}
                        color={isPub || isElectionOfficer ? colors.text : '#FFFFFF'}
                      />
                    </Pressable>
                  </View>
                </View>
              );
            })}
          </View>
        </Card>
      </EntranceView>

      {/* 6. Quick Actions Grid */}
      <EntranceView delay={300}>
        <View style={styles.quickGrid}>
          {isElectionOfficer ? (
            <Pressable
              onPress={() => {
                impact(Haptics.ImpactFeedbackStyle.Medium);
                router.push(ROUTES.RESULT_SEARCH);
              }}
              style={[styles.quickCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <View style={[styles.quickIconWrap, { backgroundColor: colors.primary + '18' }]}>
                <Ionicons name="search" size={22} color={colors.primary} />
              </View>
              <ThemedText variant="body" color="text" fontFamily="bold" style={{ marginTop: spacing.xs }}>
                Search Results
              </ThemedText>
              <ThemedText variant="caption" color="textSecondary">
                Audit returns
              </ThemedText>
            </Pressable>
          ) : (
            <Pressable
              onPress={() => {
                impact(Haptics.ImpactFeedbackStyle.Medium);
                router.push(ROUTES.RESULT_SUBMIT);
              }}
              style={[styles.quickCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <View style={[styles.quickIconWrap, { backgroundColor: colors.primary + '18' }]}>
                <Ionicons name="add-circle" size={22} color={colors.primary} />
              </View>
              <ThemedText variant="body" color="text" fontFamily="bold" style={{ marginTop: spacing.xs }}>
                Enter Results
              </ThemedText>
              <ThemedText variant="caption" color="textSecondary">
                PU ballot return
              </ThemedText>
            </Pressable>
          )}

          <Pressable
            onPress={() => {
              impact(Haptics.ImpactFeedbackStyle.Medium);
              router.push(ROUTES.INCIDENT_REPORT);
            }}
            style={[styles.quickCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <View style={[styles.quickIconWrap, { backgroundColor: colors.critical + '18' }]}>
              <Ionicons name="warning" size={22} color={colors.critical} />
            </View>
            <ThemedText variant="body" color="text" fontFamily="bold" style={{ marginTop: spacing.xs }}>
              Report Incident
            </ThemedText>
            <ThemedText variant="caption" color="textSecondary">
              Live covert filing
            </ThemedText>
          </Pressable>

          <Pressable
            onPress={() => {
              impact(Haptics.ImpactFeedbackStyle.Medium);
              router.push(ROUTES.RESULT_COLLATION);
            }}
            style={[styles.quickCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <View style={[styles.quickIconWrap, { backgroundColor: colors.accent + '18' }]}>
              <Ionicons name="bar-chart" size={22} color={colors.accentDark} />
            </View>
            <ThemedText variant="body" color="text" fontFamily="bold" style={{ marginTop: spacing.xs }}>
              Collation Room
            </ThemedText>
            <ThemedText variant="caption" color="textSecondary">
              Wards & LGA summary
            </ThemedText>
          </Pressable>

          <Pressable
            onPress={() => {
              impact(Haptics.ImpactFeedbackStyle.Medium);
              router.push(ROUTES.LOCATIONS);
            }}
            style={[styles.quickCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <View style={[styles.quickIconWrap, { backgroundColor: colors.primary + '18' }]}>
              <Ionicons name="map" size={22} color={colors.primary} />
            </View>
            <ThemedText variant="body" color="text" fontFamily="bold" style={{ marginTop: spacing.xs }}>
              Locations
            </ThemedText>
            <ThemedText variant="caption" color="textSecondary">
              Search hierarchy
            </ThemedText>
          </Pressable>
        </View>
      </EntranceView>

      {/* 7. Recent Incidents Marquee */}
      {incidents.length > 0 && (
        <EntranceView delay={350}>
          <Card style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <View>
                <ThemedText variant="title" color="text" fontFamily="bold">
                  Field Incident Stream
                </ThemedText>
                <ThemedText variant="caption" color="textSecondary">
                  {incidents.length} security & logistical issues logged
                </ThemedText>
              </View>
              <Pressable
                onPress={() => {
                  impact(Haptics.ImpactFeedbackStyle.Light);
                  router.push(ROUTES.INCIDENTS_TAB);
                }}
              >
                <ThemedText variant="caption" color="primary" fontFamily="bold">
                  View All
                </ThemedText>
              </Pressable>
            </View>
            <View style={{ marginTop: spacing.xs }}>
              <IncidentMarquee incidents={incidents} />
            </View>
          </Card>
        </EntranceView>
      )}
    </ScreenView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
    paddingBottom: 110,
    gap: spacing.md,
  },
  consoleHeader: {
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    backgroundColor: 'rgba(13, 99, 56, 0.04)',
    ...shadows.sm,
  },
  consoleTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orgTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  orgDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  pulseBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  tickerStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },
  tickerStatItem: {
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(0,0,0,0.08)',
    marginHorizontal: spacing.xs,
  },
  draftAlertCard: {
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    ...shadows.md,
  },
  draftAlertContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  draftAlertIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  actionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    gap: 4,
  },
  sectionCard: {
    padding: spacing.md,
    borderRadius: radius.lg,
    ...shadows.sm,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  winnerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  candidateRowCard: {
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  candHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  candLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rankTag: {
    width: 28,
    height: 28,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  partyBadgeRow: {
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
  aiCard: {
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    ...shadows.md,
  },
  aiHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  aiTitleBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
    marginRight: spacing.xs,
  },
  aiIconBadge: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  probBadge: {
    flexShrink: 0,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  candChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  candChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  datasetTabs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  datasetTab: {
    flex: 1,
    minWidth: 90,
    paddingVertical: 6,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  myCandidatePill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  winnerMiniPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  aiMetricsBox: {
    marginTop: spacing.md,
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  aiMetricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  insightBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    marginTop: spacing.xs,
  },
  disclaimerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  puCard: {
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  puTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  puStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  puBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  puActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
    gap: 2,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  quickCard: {
    width: '48%',
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    ...shadows.sm,
  },
  quickIconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
