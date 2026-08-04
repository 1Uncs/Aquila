import React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenView } from '@/core/components/ScreenView';
import { ThemedText, Card, EmptyState } from '@/core/components';
import { useAuthStore } from '@/features/auth/store';
import { ROUTES } from '@/constants/routes';
import { spacing, radius, shadows, gradientPresets, sizes } from '@/constants/tokens';
import { useColorScheme } from '@/core/hooks/useColorScheme';
import { useElectionsQuery, useIncidentsQuery } from '@/features/elections/hooks';
import Colors from '@/constants/colors';
import { router } from 'expo-router';

function GradientIcon({ name, gradient }: { name: any; gradient: readonly [string, string] }) {
  return (
    <View style={[styles.gradientIconWrap, { borderRadius: radius.md }]}>
      <LinearGradient colors={[...gradient]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.gradientIconBg}>
        <ThemedText variant="xxl" style={{ color: '#fff', fontWeight: '700' }}>{name}</ThemedText>
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

const severityColors: Record<string, string> = {
  LOW: 'colors.success',
  MEDIUM: 'colors.warning',
  HIGH: 'colors.error',
  CRITICAL: 'colors.critical',
};

function QuickActions({ colors }: { colors: typeof Colors.light }) {
  return (
    <View>
      <ThemedText variant="h3" style={{ marginHorizontal: 16, marginTop: spacing.xl, marginBottom: spacing.sm }}>
        Quick Actions
      </ThemedText>
      <View style={{ flexDirection: 'row', gap: spacing.sm, marginHorizontal: 16 }}>
        <Card pressable style={styles.quickActionCard} onPress={() => router.push(ROUTES.ELECTION_DETAIL as any)}>
          <ThemedText variant="label" style={{ color: colors.primary, fontWeight: '600' }}>View Election</ThemedText>
          <ThemedText variant="caption" color="textSecondary">Details & results</ThemedText>
        </Card>
        <Card pressable style={styles.quickActionCard} onPress={() => router.push(ROUTES.INCIDENT_REPORT)}>
          <ThemedText variant="label" style={{ color: colors.accent, fontWeight: '600' }}>Report Issue</ThemedText>
          <ThemedText variant="caption" color="textSecondary">File an incident</ThemedText>
        </Card>
      </View>
    </View>
  );
}

export default function DashboardScreen() {
  const { data: elections = [], isLoading: electionsLoading } = useElectionsQuery();
  const { data: incidents = [], isLoading: incidentsLoading } = useIncidentsQuery();
  const { user } = useAuthStore();
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

  const loading = electionsLoading || incidentsLoading;
  const recentIncidents = incidents.slice(0, 3);

  const activeElections = elections.filter((e) => e.status === 'ACTIVE' || e.status === 'SCHEDULED').length;
  const totalReportingPUs = 1874;
  const totalPUs = 2500;
  const reportingPct = Math.round((totalReportingPUs / totalPUs) * 100);

  return (
    <ScreenView scrollable keyboardShouldPersistTaps="handled">
      <View style={{ paddingBottom: spacing.xxl }}>
        <View style={styles.welcomeWrap}>
          <LinearGradient colors={[...gradientPresets.primary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.welcomeGradient}>
            <ThemedText variant="xl" style={{ color: '#fff', fontWeight: '700', marginBottom: spacing.xs }}>
              Welcome back, {user?.name ?? 'User'}
            </ThemedText>
            <ThemedText variant="body" style={{ color: 'rgba(255,255,255,0.8)' }}>
              Election Intelligence Dashboard
            </ThemedText>
          </LinearGradient>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: spacing.md, marginTop: spacing.lg }} keyboardShouldPersistTaps="handled">
          <StatCard icon="🗳" label="Total Elections" value={String(elections.length)} gradient={gradientPresets.primary} />
          <StatCard icon="✓" label="Active Elections" value={String(activeElections)} gradient={gradientPresets.success} />
          <StatCard icon="⚠" label="Open Incidents" value={String(recentIncidents.length)} gradient={gradientPresets.accent} />
        </ScrollView>

        <ThemedText variant="h3" style={{ marginHorizontal: 16, marginTop: spacing.xl, marginBottom: spacing.sm }}>
          Reporting Progress
        </ThemedText>
        <Card style={[shadows.md]}>
          <ThemedText variant="body" style={{ marginBottom: spacing.xs }}>
            {totalReportingPUs.toLocaleString()} / {totalPUs.toLocaleString()} Polling Units
          </ThemedText>
          <ThemedText variant="caption" color="textSecondary">
            {reportingPct}% Reporting
          </ThemedText>
          <View style={[styles.progressTrack, { backgroundColor: colors.border, marginTop: spacing.sm }]}>
            <View style={[styles.progressFill, { width: `${reportingPct}%`, backgroundColor: colors.primary }]} />
          </View>
        </Card>

        <ThemedText variant="h3" style={{ marginHorizontal: 16, marginTop: spacing.xl, marginBottom: spacing.sm }}>
          Upcoming Elections
        </ThemedText>
        {loading ? (
          <ThemedText variant="body" color="textSecondary" style={{ textAlign: 'center', marginVertical: spacing.xl }}>
            Loading elections...
          </ThemedText>
        ) : elections.length === 0 ? (
          <EmptyState icon="calendar-outline" title="No Elections" subtitle="No elections configured yet" />
        ) : (
          elections.map((election) => (
            <Card key={election.id} pressable onPress={() => router.push({ pathname: ROUTES.ELECTION_DETAIL, params: { id: election.id } })}>
              <ThemedText variant="body" style={{ fontWeight: '600' }}>
                {election.position} - {election.electoralArea}
              </ThemedText>
              <ThemedText variant="caption" color="textSecondary" style={{ marginTop: 4 }}>
                {election.electionDate} · {election.status}
              </ThemedText>
            </Card>
          ))
        )}

        <ThemedText variant="h3" style={{ marginHorizontal: 16, marginTop: spacing.xl, marginBottom: spacing.sm }}>
          Recent Incidents
        </ThemedText>
        {recentIncidents.length === 0 ? (
          <EmptyState icon="shield-checkmark-outline" title="No Incidents" subtitle="All clear — no incidents reported" />
        ) : (
          recentIncidents.map((incident) => {
            const sevKey = incident.severity === 'CRITICAL' ? 'CRITICAL' : incident.severity;
            return (
              <Card key={incident.id}>
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

        <QuickActions colors={colors} />
      </View>
    </ScreenView>
  );
}

const styles = StyleSheet.create({
  welcomeWrap: { marginHorizontal: 16, marginTop: spacing.md, borderRadius: radius.lg, overflow: 'hidden' },
  welcomeGradient: { paddingVertical: spacing.lg, paddingHorizontal: spacing.lg },
  statCard: { width: sizes.statCard, padding: spacing.md, borderRadius: radius.lg },
  gradientIconWrap: { overflow: 'hidden' },
  gradientIconBg: { width: 48, height: 48, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  progressTrack: { height: spacing.sm, borderRadius: radius.sm, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: radius.sm },
  severityDot: { width: spacing.sm, height: spacing.sm, borderRadius: radius.sm },
  severityBadge: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.full },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  quickActionCard: { flex: 1 },
});
