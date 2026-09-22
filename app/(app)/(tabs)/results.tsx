import React, { useState, useMemo, useCallback } from 'react';
import { StyleSheet, View, Pressable, FlatList } from 'react-native';
import { router } from 'expo-router';
import { ScreenView } from '@/core/components/ScreenView';
import { ThemedText, Card, EmptyState, Button } from '@/core/components';
import { ROUTES } from '@/constants/routes';
import { spacing, radius, shadows, border } from '@/constants/tokens';
import { useColorScheme } from '@/core/hooks/useColorScheme';
import { useStatusBar } from '@/core/hooks/useStatusBar';
import { useResultsQuery, useCandidatesQuery } from '@/features/elections/hooks';
import { useRefreshControl, useForegroundRefresh, useHaptics } from '@/core/hooks';
import Colors from '@/constants/colors';
import { useResultsStore, useAuthStore, ResultSubmission } from '@/features/auth/store';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

export default function ResultsScreen() {
  const { user } = useAuthStore();
  const { data: apiResults = [], isLoading: loading, refetch: refetchResults } = useResultsQuery();
  const { submissions } = useResultsStore();
  const { data: candidates = [] } = useCandidatesQuery('e1');
  const { refreshControl } = useRefreshControl(loading, refetchResults);
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  useStatusBar({ barStyle: scheme === 'dark' ? 'light' : 'dark' });
  useForegroundRefresh([['results', 'list']], 5 * 60 * 1000);
  const { impact } = useHaptics();

  // Active tab: 'published' vs 'drafts' (Audio Part 3)
  const [activeTab, setActiveTab] = useState<'published' | 'drafts'>('published');

  // Combined published results (API + local published)
  const publishedResults = useMemo(() => {
    const localPublished = submissions.filter((s) => s.status === 'PUBLISHED');
    const ids = new Set(localPublished.map((s) => s.id));
    const remoteUnique = apiResults.filter((r) => !ids.has(r.id));
    return [...localPublished, ...remoteUnique];
  }, [submissions, apiResults]);

  // Local draft submissions awaiting publication
  const draftResults = useMemo(() => {
    return submissions.filter((s) => s.status === 'DRAFT');
  }, [submissions]);

  const activeList = activeTab === 'published' ? publishedResults : draftResults;

  const totalVotes = publishedResults.reduce((sum, r) => sum + (r.totalVotesCast || 0), 0);

  const candMap = useMemo(() => {
    const m = new Map<string, (typeof candidates)[0]>();
    candidates.forEach((c) => m.set(c.id, c));
    return m;
  }, [candidates]);

  const renderResultItem = useCallback(({ item }: { item: ResultSubmission }) => {
    const isPublished = item.status === 'PUBLISHED';
    const totalCast = item.totalVotesCast || 1;

    // Find leading candidate in this PU
    let topCandId = '';
    let topCandVotes = 0;
    Object.entries(item.candidateVotes || {}).forEach(([cId, v]) => {
      const val = typeof v === 'number' ? v : 0;
      if (val > topCandVotes) {
        topCandVotes = val;
        topCandId = cId;
      }
    });

    const leadCand = candMap.get(topCandId);
    const leadPct = ((topCandVotes / totalCast) * 100).toFixed(1);

    return (
      <Card
        pressable
        style={styles.itemCard}
        onPress={() => {
          impact(Haptics.ImpactFeedbackStyle.Light);
          if (isPublished) {
            router.push({ pathname: ROUTES.RESULT_DETAIL, params: { id: item.id } });
          } else {
            router.push(ROUTES.RESULT_DRAFTS);
          }
        }}
      >
        <View style={styles.itemHeader}>
          <View style={{ flex: 1 }}>
            <ThemedText variant="body" color="text" fontFamily="bold">
              {item.pollingUnitName}
            </ThemedText>
            <ThemedText variant="caption" color="textSecondary">
              {isPublished ? 'Official Return' : 'Draft Return'} · {new Date(item.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </ThemedText>
          </View>

          <View
            style={[
              styles.statusChip,
              {
                backgroundColor: isPublished ? colors.successSubtle : colors.warningSubtle,
                borderColor: isPublished ? colors.success : colors.warning,
              },
            ]}
          >
            <Ionicons
              name={isPublished ? 'checkmark-circle' : 'time-outline'}
              size={12}
              color={isPublished ? colors.success : colors.warning}
            />
            <ThemedText
              variant="label"
              fontFamily="bold"
              style={{
                marginLeft: 4,
                color: isPublished ? colors.success : colors.warning,
              }}
            >
              {item.status}
            </ThemedText>
          </View>
        </View>

        {/* Leading Candidate Strip */}
        <View style={[styles.leadStrip, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
          <View style={{ flex: 1 }}>
            <ThemedText variant="label" color="textMuted">LEADING CANDIDATE</ThemedText>
            <ThemedText variant="body" color="text" fontFamily="bold">
              {leadCand?.fullName ?? (topCandId ? `Candidate ${topCandId}` : 'Awaiting breakdown')}
            </ThemedText>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <ThemedText variant="title" color="primary" fontFamily="bold">
              {topCandVotes.toLocaleString()}
            </ThemedText>
            <ThemedText variant="label" color="textSecondary">
              {leadPct}% of cast ballots
            </ThemedText>
          </View>
        </View>

        {/* Bottom Turnout bar */}
        <View style={styles.itemFooter}>
          <ThemedText variant="caption" color="textSecondary">
            Accredited: {item.totalAccreditedVoters.toLocaleString()} · Ballots: {item.totalVotesCast.toLocaleString()}
          </ThemedText>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <ThemedText variant="caption" color="primary" fontFamily="bold">
              {isPublished ? 'View Details' : 'Continue Draft'}
            </ThemedText>
            <Ionicons name="chevron-forward" size={14} color={colors.primary} />
          </View>
        </View>
      </Card>
    );
  }, [candMap, colors, impact]);

  return (
    <ScreenView scrollable={false} noScrollPadding>
      <View style={styles.container}>
        {/* Top Control Bar with "+ Record New Result" Button (Audio Part 3) */}
        <View style={styles.topControlBar}>
          <View style={{ flex: 1 }}>
            <ThemedText variant="title" color="text" fontFamily="bold">
              Election Results
            </ThemedText>
            <ThemedText variant="caption" color="textSecondary">
              Total {totalVotes.toLocaleString()} votes across {publishedResults.length} PUs
            </ThemedText>
          </View>

          {user?.role === 'ELECTION_OFFICER' ? (
            <Button
              label="Collation"
              variant="outline"
              size="sm"
              leftIcon="bar-chart-outline"
              onPress={() => {
                impact(Haptics.ImpactFeedbackStyle.Medium);
                router.push(ROUTES.RESULT_COLLATION);
              }}
            />
          ) : (
            <Button
              label="+ Record Result"
              variant="primary"
              size="sm"
              onPress={() => {
                impact(Haptics.ImpactFeedbackStyle.Medium);
                router.push(ROUTES.RESULT_SUBMIT);
              }}
            />
          )}
        </View>

        {/* Tab Switcher: Published Results vs Drafts (Audio Part 3) */}
        <View style={[styles.tabBar, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
          <Pressable
            onPress={() => {
              impact(Haptics.ImpactFeedbackStyle.Light);
              setActiveTab('published');
            }}
            style={[
              styles.tabBtn,
              activeTab === 'published' && [styles.activeTabBtn, { backgroundColor: colors.primary }],
            ]}
          >
            <ThemedText
              variant="caption"
              color={activeTab === 'published' ? '#FFFFFF' : 'textSecondary'}
              fontFamily={activeTab === 'published' ? 'bold' : 'medium'}
            >
              Published ({publishedResults.length})
            </ThemedText>
          </Pressable>

          <Pressable
            onPress={() => {
              impact(Haptics.ImpactFeedbackStyle.Light);
              setActiveTab('drafts');
            }}
            style={[
              styles.tabBtn,
              activeTab === 'drafts' && [styles.activeTabBtn, { backgroundColor: colors.primary }],
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <ThemedText
                variant="caption"
                color={activeTab === 'drafts' ? '#FFFFFF' : 'textSecondary'}
                fontFamily={activeTab === 'drafts' ? 'bold' : 'medium'}
              >
                Drafts ({draftResults.length})
              </ThemedText>
              {draftResults.length > 0 && (
                <View style={[styles.tabBadge, { backgroundColor: colors.warning }]}>
                  <ThemedText variant="label" color="#FFFFFF" fontFamily="bold" style={{ fontSize: 9 }}>
                    {draftResults.length}
                  </ThemedText>
                </View>
              )}
            </View>
          </Pressable>
        </View>

        {/* Native FlatList */}
        <FlatList
          data={activeList}
          keyExtractor={(item) => item.id}
          renderItem={renderResultItem}
          refreshControl={refreshControl}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
          ListEmptyComponent={
            <EmptyState
              icon={activeTab === 'published' ? 'document-text-outline' : 'save-outline'}
              title={activeTab === 'published' ? 'No Results Published Yet' : 'No Drafts Saved'}
              subtitle={
                activeTab === 'published'
                  ? 'Polling unit ballot returns will appear here once submitted and verified.'
                  : 'You have no incomplete drafts. Tap "+ Record Result" to begin a new submission.'
              }
              actionLabel="+ Record Result"
              onAction={() => router.push(ROUTES.RESULT_SUBMIT)}
            />
          }
        />
      </View>
    </ScreenView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topControlBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: spacing.md,
    marginVertical: spacing.xs,
    padding: 4,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
  },
  activeTabBtn: {
    ...shadows.sm,
  },
  tabBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radius.full,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
    paddingBottom: 110,
  },
  itemCard: {
    padding: spacing.md,
    borderRadius: radius.lg,
    ...shadows.sm,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  leadStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    marginTop: spacing.xs,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
    paddingTop: spacing.xs,
  },
});
