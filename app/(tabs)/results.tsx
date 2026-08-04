import React from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ScreenView } from '@/core/components/ScreenView';
import { ThemedText, FlashListItem, EmptyState, Button, Card } from '@/core/components';
import { ROUTES } from '@/constants/routes';
import { spacing, radius, shadows, sizes, gradientPresets } from '@/constants/tokens';
import { useColorScheme } from '@/core/hooks/useColorScheme';
import { useResultsQuery } from '@/features/elections/hooks';
import Colors from '@/constants/colors';

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
};

function StatCard({ icon, label, value, gradient }: StatCardProps) {
  return (
    <Card style={[styles.statCard, shadows.md]}>
      <GradientIcon name={icon} gradient={gradient} />
      <ThemedText variant="xxl" style={{ marginTop: spacing.sm, fontWeight: '700' }}>
        {value}
      </ThemedText>
      <ThemedText variant="caption" color="textSecondary">
        {label}
      </ThemedText>
    </Card>
  );
}

export default function ResultsScreen() {
  const { data: results = [], isLoading: loading } = useResultsQuery();
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

  const totalVotes = results.reduce((sum, r) => sum + r.totalVotesCast, 0);

  return (
    <ScreenView scrollable keyboardShouldPersistTaps="handled">
      <FlashList
        data={results}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View>
            <ThemedText variant="xl" style={{ marginHorizontal: spacing.md, marginTop: spacing.md, marginBottom: spacing.sm }}>
              Live Results
            </ThemedText>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: spacing.md, gap: spacing.md, marginBottom: spacing.lg }} keyboardShouldPersistTaps="handled">
              <StatCard icon="📋" label="Reports" value={String(results.length)} gradient={gradientPresets.primary} />
              <StatCard icon="👥" label="Total Votes" value={totalVotes.toLocaleString()} gradient={gradientPresets.success} />
              <StatCard icon="✓" label="Published" value={String(results.filter((r) => r.status === 'PUBLISHED').length)} gradient={gradientPresets.accent} />
            </ScrollView>

            <View style={{ flexDirection: 'row', gap: spacing.sm, marginHorizontal: spacing.md, marginBottom: spacing.lg }}>
              <Button label="Drafts" variant="outline" size="sm" onPress={() => router.push(ROUTES.RESULT_DRAFTS as any)} style={styles.actionBtn} />
              <Button label="Search" variant="primary" size="sm" onPress={() => router.push(ROUTES.RESULT_SEARCH)} style={styles.actionBtn} />
              <Button label="Collation" variant="outline" size="sm" onPress={() => router.push(ROUTES.RESULT_COLLATION)} style={styles.actionBtn} />
              <Button label="Incident" variant="outline" size="sm" onPress={() => router.push(ROUTES.INCIDENT_REPORT)} style={styles.actionBtn} />
            </View>

            <ThemedText variant="h3" style={{ marginHorizontal: spacing.md, marginBottom: spacing.sm }}>
              Recent Results
            </ThemedText>
            {loading ? (
              <ThemedText variant="body" color="textSecondary" style={{ textAlign: 'center', marginTop: spacing.xxl }}>
                Loading results...
              </ThemedText>
            ) : results.length === 0 ? (
              <EmptyState icon="analytics-outline" title="No Results" subtitle="No results submitted yet" />
            ) : null}
          </View>
        }
        renderItem={({ item: result }) => (
          <FlashListItem id={result.id}>
            <ThemedText variant="body" style={{ fontWeight: '600' }}>
              {result.pollingUnitName}
            </ThemedText>
            <ThemedText variant="caption" color="textSecondary" style={{ marginTop: spacing.xs }}>
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
          </FlashListItem>
        )}
        contentContainerStyle={{ paddingHorizontal: spacing.md, paddingBottom: spacing.xxl }}
      />
    </ScreenView>
  );
}

const styles = StyleSheet.create({
  statCard: { width: sizes.statCard, padding: spacing.md, borderRadius: radius.lg },
  gradientIconWrap: { overflow: 'hidden', alignSelf: 'flex-start' },
  gradientIconBg: { width: 48, height: 48, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  actionBtn: { flex: 1 },
  progressTrack: { height: spacing.sm, borderRadius: radius.sm, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: radius.sm },
});
