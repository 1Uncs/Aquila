import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import { ScreenView } from '@/core/components/ScreenView';
import { ThemedText, FlashListItem, EmptyState, Button } from '@/core/components';
import { useIncidentsStore } from '@/features/auth/store';
import { ROUTES } from '@/constants/routes';
import { spacing, radius } from '@/constants/tokens';
import { useColorScheme } from '@/core/hooks/useColorScheme';
import { useIncidentsQuery } from '@/features/elections/hooks';
import Colors from '@/constants/colors';
import { IncidentSeverity } from '@/types';

const SEVERITY_FILTERS = ['ALL', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;

const SEVERITY_COLORS: Record<IncidentSeverity, string> = {
  LOW: 'success',
  MEDIUM: 'warning',
  HIGH: 'error',
  CRITICAL: 'critical',
};

export default function IncidentsScreen() {
  const { data: incidents = [], isLoading: loading } = useIncidentsQuery();
  const { setIncidents: storeSetIncidents } = useIncidentsStore();
  const [filter, setFilter] = useState<IncidentSeverity | 'ALL'>('ALL');
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

  useEffect(() => {
    storeSetIncidents(incidents);
  }, [incidents, storeSetIncidents]);

  const filtered = filter === 'ALL' ? incidents : incidents.filter((i) => i.severity === filter);

  return (
    <ScreenView scrollable keyboardShouldPersistTaps="handled">
      <FlashList
        data={filtered}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View>
            <ThemedText variant="xl" style={{ marginHorizontal: spacing.md, marginTop: spacing.md, marginBottom: spacing.sm }}>
              Incidents
            </ThemedText>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow} keyboardShouldPersistTaps="handled">
              {SEVERITY_FILTERS.map((f) => (
                <Button
                  key={f}
                  label={f === 'ALL' ? 'All' : f}
                  size="sm"
                  variant={filter === f ? 'primary' : 'outline'}
                  onPress={() => setFilter(f)}
                  style={styles.chip}
                />
              ))}
            </ScrollView>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: spacing.sm, gap: spacing.sm, marginBottom: spacing.lg }} keyboardShouldPersistTaps="handled">
              <Button label="Report" variant="primary" size="sm" onPress={() => router.push(ROUTES.INCIDENT_REPORT)} style={{ minWidth: 80 }} />
              <Button label="Search" variant="outline" size="sm" onPress={() => router.push(ROUTES.INCIDENT_SEARCH)} style={{ minWidth: 80 }} />
            </ScrollView>

            {loading ? (
              <ThemedText variant="body" color="textSecondary" style={{ textAlign: 'center', marginTop: spacing.xxl }}>
                Loading incidents...
              </ThemedText>
            ) : filtered.length === 0 ? (
              <EmptyState icon="shield-checkmark-outline" title="No Incidents" subtitle="All quiet — no incidents reported" />
            ) : null}
          </View>
        }
        renderItem={({ item: incident }) => {
          const sevColorKey = SEVERITY_COLORS[incident.severity] || 'textSecondary';
          const sevColor = colors[sevColorKey as keyof typeof Colors.light] as string;
          return (
            <FlashListItem id={incident.id}>
              <View style={styles.row}>
                <View style={[styles.severityDot, { backgroundColor: sevColor }]} />
                <View style={styles.incidentInfo}>
                  <ThemedText variant="body" style={{ fontWeight: '600' }}>
                    {incident.category.replace(/_/g, ' ')}
                  </ThemedText>
                  <ThemedText variant="caption" color="textSecondary" style={{ marginTop: spacing.xs }}>
                    {incident.electoralArea}
                  </ThemedText>
                  <ThemedText variant="caption" color="textMuted" numberOfLines={2}>
                    {incident.description.length > 80 ? incident.description.slice(0, 80) + '...' : incident.description}
                  </ThemedText>
                  <ThemedText variant="caption" color="textMuted" style={{ marginTop: spacing.xs }}>
                    {new Date(incident.reportedAt).toLocaleString()} · {incident.status}
                  </ThemedText>
                </View>
              </View>
            </FlashListItem>
          );
        }}
        contentContainerStyle={{ paddingHorizontal: spacing.md, paddingBottom: spacing.xxl }}
      />
    </ScreenView>
  );
}

const styles = StyleSheet.create({
  chipRow: { paddingHorizontal: spacing.md, gap: spacing.sm, marginBottom: spacing.lg },
  chip: { marginRight: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  incidentInfo: { flex: 1 },
  severityDot: { width: spacing.sm, height: spacing.sm, borderRadius: radius.sm, marginTop: spacing.xs },
});
