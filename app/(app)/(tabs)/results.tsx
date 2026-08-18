import React, { useCallback } from 'react';
import { StyleSheet, ScrollView, View, Platform, Alert, LayoutAnimation } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { LinearGradient } from 'expo-linear-gradient';
import { ActionSheetIOS } from 'react-native';
import { router } from 'expo-router';
import { ScreenView } from '@/core/components/ScreenView';
import { ThemedText, FlashListItem, EmptyState, Button, Card, SkeletonCard } from '@/core/components';
import { ROUTES } from '@/constants/routes';
import { spacing, radius, shadows, sizes, gradientPresets } from '@/constants/tokens';
import { useColorScheme } from '@/core/hooks/useColorScheme';
import { useStatusBar } from '@/core/hooks/useStatusBar';
import { useResultsQuery } from '@/features/elections/hooks';
import * as Haptics from 'expo-haptics';
import { useRefreshControl, useForegroundRefresh, useHaptics } from '@/core/hooks';
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

export default function ResultsScreen() {
  const { data: results = [], isLoading: loading, refetch: refetchResults } = useResultsQuery();
  const { refreshControl } = useRefreshControl(loading, refetchResults);
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  useStatusBar({ barStyle: scheme === 'dark' ? 'light' : 'dark' });
  useForegroundRefresh([['results', 'list']], 5 * 60 * 1000);

  const openMoreActions = useCallback(() => {
    const canUseActionSheet = Platform.OS === 'ios' && !!ActionSheetIOS;
    if (canUseActionSheet) {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Collation', 'Report Incident', 'Cancel'],
          cancelButtonIndex: 2,
        },
        (buttonIndex) => {
          if (buttonIndex === 0) router.push(ROUTES.RESULT_COLLATION);
          else if (buttonIndex === 1) router.push(ROUTES.INCIDENT_REPORT);
        }
      );
    } else {
      Alert.alert('More Actions', undefined, [
        { text: 'Collation', onPress: () => router.push(ROUTES.RESULT_COLLATION) },
        { text: 'Report Incident', onPress: () => router.push(ROUTES.INCIDENT_REPORT) },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  }, []);

  const totalVotes = results.reduce((sum, r) => sum + r.totalVotesCast, 0);

  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

  return (
    <ScreenView scrollable keyboardShouldPersistTaps="handled" refreshControl={refreshControl}>
      <FlashList
        data={results}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm }}>
              <View style={[styles.sectionIndicator, { backgroundColor: colors.primary }]} />
              <ThemedText variant="xl" style={{ flex: 1 }} minFontSize={20} maxFontSize={28}>Live Results</ThemedText>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.md, marginBottom: spacing.lg }} keyboardShouldPersistTaps="handled">
              <StatCard icon="📋" label="Reports" value={String(results.length)} gradient={gradientPresets.primary} colors={colors} />
              <StatCard icon="👥" label="Total Votes" value={totalVotes.toLocaleString()} gradient={gradientPresets.success} colors={colors} />
              <StatCard icon="✓" label="Published" value={String(results.filter((r) => r.status === 'PUBLISHED').length)} gradient={gradientPresets.accent} colors={colors} />
            </ScrollView>

            <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg }}>
              <Button label="Drafts" variant="outline" size="sm" onPress={() => router.push(ROUTES.RESULT_DRAFTS as any)} style={styles.actionBtn} />
              <Button label="Search" variant="primary" size="sm" onPress={() => router.push(ROUTES.RESULT_SEARCH)} style={styles.actionBtn} />
              <Button label="More" variant="ghost" size="sm" onPress={openMoreActions} style={styles.actionBtn} leftIcon="ellipsis-horizontal" />
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm }}>
              <View style={[styles.sectionIndicator, { backgroundColor: colors.accent }]} />
              <ThemedText variant="h3" style={{ flex: 1 }} minFontSize={16} maxFontSize={22}>Recent Results</ThemedText>
            </View>
            {loading ? (
              <View style={{ gap: spacing.md, paddingBottom: spacing.md }}>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </View>
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
        contentContainerStyle={{ paddingBottom: spacing.xxl }}
      />
    </ScreenView>
  );
}

const styles = StyleSheet.create({
  statCard: { width: sizes.statCard, padding: spacing.lg, borderRadius: radius.lg },
  gradientIconWrap: { overflow: 'hidden', alignSelf: 'flex-start' },
  gradientIconBg: { width: 48, height: 48, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  actionBtn: { flex: 1 },
  progressTrack: { height: spacing.sm, borderRadius: radius.sm, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: radius.sm },
  sectionIndicator: { width: 4, height: 16, borderRadius: radius.full },
});
