import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, Pressable, PressableStateCallbackType, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ScreenView } from '@/core/components/ScreenView';
import { ThemedText, Card, EmptyState } from '@/core/components';
import { useIncidentsStore } from '@/features/auth/store';
import { ROUTES } from '@/constants/routes';
import { spacing, radius, border } from '@/constants/tokens';
import { useColorScheme } from '@/core/hooks/useColorScheme';
import { useIncidentsQuery } from '@/features/elections/hooks';
import Colors from '@/constants/colors';
import { IncidentSeverity } from '@/types';

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

  const severityColors: Record<IncidentSeverity, string> = {
    LOW: colors.success,
    MEDIUM: colors.warning,
    HIGH: colors.error,
    CRITICAL: colors.critical,
  };

  return (
    <ScreenView scrollable keyboardShouldPersistTaps="handled">
      <View style={{ paddingBottom: spacing.xxl }}>
        <ThemedText variant="xl" style={{ marginHorizontal: 16, marginTop: spacing.md, marginBottom: spacing.sm }}>
          Incidents
        </ThemedText>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: spacing.sm, marginBottom: spacing.lg }} keyboardShouldPersistTaps="handled">
          {(['ALL', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const).map((f) => (
            <Pressable
              key={f}
              onPress={() => setFilter(f)}
              style={({ pressed }: PressableStateCallbackType) => [
                styles.filterChip,
                {
                  backgroundColor: filter === f ? colors.primary : colors.card,
                  borderColor: filter === f ? colors.primary : colors.border,
                },
                pressed && { opacity: 0.7 },
              ]}
            >
              <ThemedText
                variant="label"
                style={{ color: filter === f ? '#fff' : colors.text }}
              >
                {f === 'ALL' ? 'All' : f}
              </ThemedText>
            </Pressable>
          ))}
        </ScrollView>

        <View style={{ flexDirection: 'row', gap: spacing.sm, marginHorizontal: 16, marginBottom: spacing.lg }}>
          <Pressable
            onPress={() => router.push(ROUTES.INCIDENT_REPORT)}
            style={[styles.actionBtn, { backgroundColor: colors.accent }]}
          >
            <Ionicons name="add-outline" size={18} color="#fff" />
            <ThemedText variant="label" style={{ color: '#fff', marginLeft: 4 }}>Report</ThemedText>
          </Pressable>
          <Pressable
            onPress={() => router.push(ROUTES.INCIDENT_SEARCH)}
            style={[styles.actionBtn, { backgroundColor: colors.secondary }]}
          >
            <Ionicons name="search-outline" size={18} color="#fff" />
            <ThemedText variant="label" style={{ color: '#fff', marginLeft: 4 }}>Search</ThemedText>
          </Pressable>
        </View>

        {loading ? (
          <ThemedText variant="body" color="textSecondary" style={{ textAlign: 'center', marginTop: spacing.xxl }}>
            Loading incidents...
          </ThemedText>
        ) : filtered.length === 0 ? (
          <EmptyState icon="shield-checkmark-outline" title="No Incidents" subtitle="All quiet — no incidents reported" />
        ) : (
          filtered.map((incident) => (
            <Card key={incident.id}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm }}>
                <View style={[styles.severityDot, { backgroundColor: severityColors[incident.severity] }]} />
                <View style={{ flex: 1 }}>
                  <ThemedText variant="body" style={{ fontWeight: '600' }}>
                    {incident.category.replace(/_/g, ' ')}
                  </ThemedText>
                  <ThemedText variant="caption" color="textSecondary" style={{ marginTop: 4 }}>
                    {incident.electoralArea}
                  </ThemedText>
                  <ThemedText variant="caption" color="textMuted">
                    {incident.description.slice(0, 80)}{incident.description.length > 80 ? '...' : ''}
                  </ThemedText>
                  <ThemedText variant="caption" color="textMuted" style={{ marginTop: 4 }}>
                    {new Date(incident.reportedAt).toLocaleString()} · {incident.status}
                  </ThemedText>
                </View>
              </View>
            </Card>
          ))
        )}
      </View>
    </ScreenView>
  );
}

const styles = StyleSheet.create({
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: border.thin,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.md,
  },
  severityDot: {
    width: spacing.sm,
    height: spacing.sm,
    borderRadius: radius.sm,
  },
});
