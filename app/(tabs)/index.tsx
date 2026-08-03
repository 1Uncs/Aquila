import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, View, Keyboard } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { ScreenView } from '@/core/components/ScreenView';
import { ThemedText, Card, Button, EmptyState } from '@/core/components';
import { Ionicons } from '@expo/vector-icons';
import { mockApi } from '@/features/elections/service';
import { useElectionsStore, useAuthStore } from '@/features/auth/store';
import { ROUTES } from '@/constants/routes';
import { spacing, radius, shadows } from '@/constants/tokens';
import { useColorScheme } from '@/core/hooks/useColorScheme';
import Colors from '@/constants/colors';
import { router } from 'expo-router';

type StatCardProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  color: string;
};

function StatCard({ icon, label, value, color }: StatCardProps) {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  return (
    <Card style={[styles.statCard, shadows.md]}>
      <Ionicons name={icon} size={28} color={color} />
      <ThemedText variant="xxl" style={{ marginTop: spacing.sm, fontWeight: '700' }}>
        {value}
      </ThemedText>
      <ThemedText variant="caption" color="textSecondary">
        {label}
      </ThemedText>
    </Card>
  );
}

export default function DashboardScreen() {
  const [loading, setLoading] = useState(true);
  const [elections, setElections] = useState<any[]>([]);
  const [recentIncidents, setRecentIncidents] = useState<any[]>([]);
  const { user } = useAuthStore();
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

  useEffect(() => {
    (async () => {
      try {
        const [e, i] = await Promise.all([mockApi.getElections(), mockApi.getIncidents()]);
        setElections(e);
        setRecentIncidents(i.slice(0, 3));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const activeElections = elections.filter((e) => e.status === 'ACTIVE' || e.status === 'SCHEDULED').length;
  const totalReportingPUs = 1874;
  const totalPUs = 2500;
  const reportingPct = Math.round((totalReportingPUs / totalPUs) * 100);

  useFocusEffect(() => {
    return () => Keyboard.dismiss();
  });

  return (
    <ScreenView scrollable keyboardShouldPersistTaps="handled">
      <View style={{ paddingBottom: spacing.xxl }}>
        <ThemedText variant="xl" style={{ marginHorizontal: 16, marginTop: spacing.md }}>
          Welcome back, {user?.name ?? 'User'}
        </ThemedText>
        <ThemedText
          variant="body"
          color="textSecondary"
          style={{ marginHorizontal: 16, marginBottom: spacing.lg }}
        >
          Election Intelligence Dashboard
        </ThemedText>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: spacing.md }} keyboardShouldPersistTaps="handled">
          <StatCard icon="file-tray-full" label="Total Elections" value={String(elections.length)} color={colors.primary} />
          <StatCard icon="checkmark-circle" label="Active Elections" value={String(activeElections)} color={colors.success} />
          <StatCard icon="alert-circle" label="Open Incidents" value={String(recentIncidents.length)} color={colors.warning} />
        </ScrollView>

        <ThemedText variant="h3" style={{ marginHorizontal: 16, marginTop: spacing.xl, marginBottom: spacing.sm }}>
          Reporting Progress
        </ThemedText>
        <Card>
          <ThemedText variant="body" style={{ marginBottom: spacing.xs }}>
            {totalReportingPUs.toLocaleString()} / {totalPUs.toLocaleString()} Polling Units
          </ThemedText>
          <ThemedText variant="caption" color="textSecondary">
            {reportingPct}% Reporting
          </ThemedText>
          <CardProgressBar progress={reportingPct} />
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
            <Card key={election.id} pressable onPress={() => router.push({ pathname: ROUTES.ELECTION_DETAIL, params: { id: election.id } } as any)}>
              <ThemedText variant="body" style={{ fontWeight: '600' }}>
                {election.position} - {election.electoralArea}
              </ThemedText>
              <ThemedText variant="caption" color="textSecondary" style={{ marginTop: 2 }}>
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
          recentIncidents.map((incident) => (
            <Card key={incident.id}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                <View style={[styles.severityDot, { backgroundColor: incident.severity === 'HIGH' || incident.severity === 'CRITICAL' ? colors.error : colors.warning }]} />
                <View style={{ flex: 1 }}>
                  <ThemedText variant="body" style={{ fontWeight: '600' }}>
                    {incident.category.replace(/_/g, ' ')}
                  </ThemedText>
                  <ThemedText variant="caption" color="textSecondary">
                    {incident.electoralArea} · {new Date(incident.reportedAt).toLocaleDateString()}
                  </ThemedText>
                </View>
                <ThemedText variant="caption" color="textSecondary">
                  {incident.severity}
                </ThemedText>
              </View>
            </Card>
          ))
        )}
      </View>
    </ScreenView>
  );
}

function CardProgressBar({ progress }: { progress: number }) {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  return (
    <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
      <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: colors.primary }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  statCard: {
    width: 160,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: '#fff',
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    marginTop: spacing.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  severityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
