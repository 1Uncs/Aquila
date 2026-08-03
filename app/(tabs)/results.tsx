import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, Pressable, PressableStateCallbackType, View } from 'react-native';
import { ScreenView } from '@/core/components/ScreenView';
import { ThemedText, Card, EmptyState } from '@/core/components';
import { Ionicons } from '@expo/vector-icons';
import { mockApi } from '@/features/elections/service';
import { useResultsStore } from '@/features/auth/store';
import { ROUTES } from '@/constants/routes';
import { router } from 'expo-router';
import { spacing, radius, shadows } from '@/constants/tokens';
import { useColorScheme } from '@/core/hooks/useColorScheme';
import Colors from '@/constants/colors';
import { ResultSubmission } from '@/features/auth/store';

export default function ResultsScreen() {
  const [results, setResults] = useState<ResultSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const { setSubmissions } = useResultsStore();
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

  useEffect(() => {
    (async () => {
      try {
        const data = await mockApi.getResults();
        setResults(data);
        setSubmissions(data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const totalVotes = results.reduce((sum, r) => sum + r.totalVotesCast, 0);

  return (
    <ScreenView>
      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xxl }}>
        <ThemedText variant="xl" style={{ marginHorizontal: 16, marginTop: spacing.md, marginBottom: spacing.sm }}>
          Live Results
        </ThemedText>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: spacing.md, marginBottom: spacing.lg }}>
          <Card style={[styles.statCard, shadows.md]}>
            <Ionicons name="document-text-outline" size={24} color={colors.primary} />
            <ThemedText variant="xxl" style={{ marginTop: spacing.xs, fontWeight: '700' }}>
              {results.length}
            </ThemedText>
            <ThemedText variant="caption" color="textSecondary">
              Reports
            </ThemedText>
          </Card>
          <Card style={[styles.statCard, shadows.md]}>
            <Ionicons name="people-outline" size={24} color={colors.success} />
            <ThemedText variant="xxl" style={{ marginTop: spacing.xs, fontWeight: '700' }}>
              {totalVotes.toLocaleString()}
            </ThemedText>
            <ThemedText variant="caption" color="textSecondary">
              Total Votes
            </ThemedText>
          </Card>
          <Card style={[styles.statCard, shadows.md]}>
            <Ionicons name="checkmark-done-outline" size={24} color={colors.warning} />
            <ThemedText variant="xxl" style={{ marginTop: spacing.xs, fontWeight: '700' }}>
              {results.filter((r) => r.status === 'PUBLISHED').length}
            </ThemedText>
            <ThemedText variant="caption" color="textSecondary">
              Published
            </ThemedText>
          </Card>
        </ScrollView>

        <View style={{ flexDirection: 'row', gap: spacing.sm, marginHorizontal: 16, marginBottom: spacing.lg }}>
          <Pressable
            onPress={() => router.push(ROUTES.RESULT_SEARCH as any)}
            style={[styles.actionBtn, { backgroundColor: colors.primary }]}
          >
            <Ionicons name="search-outline" size={18} color="#fff" />
            <ThemedText variant="label" style={{ color: '#fff', marginLeft: 4 }}>Search</ThemedText>
          </Pressable>
          <Pressable
            onPress={() => router.push(ROUTES.RESULT_COLLATION as any)}
            style={[styles.actionBtn, { backgroundColor: colors.secondary }]}
          >
            <Ionicons name="bar-chart-outline" size={18} color="#fff" />
            <ThemedText variant="label" style={{ color: '#fff', marginLeft: 4 }}>Collation</ThemedText>
          </Pressable>
        </View>

        <ThemedText variant="h3" style={{ marginHorizontal: 16, marginBottom: spacing.sm }}>
          Recent Results
        </ThemedText>
        {loading ? (
          <ThemedText variant="body" color="textSecondary" style={{ textAlign: 'center', marginTop: spacing.xxl }}>
            Loading results...
          </ThemedText>
        ) : results.length === 0 ? (
          <EmptyState icon="analytics-outline" title="No Results" subtitle="No results submitted yet" />
        ) : (
          results.map((result) => {
            const winner = Object.entries(result.candidateVotes).sort((a, b) => b[1] - a[1])[0];
            return (
              <Card key={result.id}>
                <ThemedText variant="body" style={{ fontWeight: '600' }}>
                  {result.pollingUnitName}
                </ThemedText>
                <ThemedText variant="caption" color="textSecondary">
                  {result.totalVotesCast.toLocaleString()} votes · {result.status}
                </ThemedText>
                <View style={[styles.progressTrack, { backgroundColor: colors.border, marginTop: spacing.sm }]}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${Math.min((result.totalVotesCast / 800) * 100, 100)}%`, backgroundColor: colors.success },
                    ]}
                  />
                </View>
              </Card>
            );
          })
        )}
      </ScrollView>
    </ScreenView>
  );
}

const styles = StyleSheet.create({
  statCard: { width: 130, padding: spacing.md, borderRadius: radius.lg, backgroundColor: '#fff' },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.md,
  },
  progressTrack: { height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
});
