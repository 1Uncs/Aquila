import React, { useState } from 'react';
import { StyleSheet, View, Platform, KeyboardAvoidingView, ScrollView } from 'react-native';
import { ScreenView } from '@/core/components/ScreenView';
import { ThemedText, Card, EmptyState, Input } from '@/core/components';
import { useIncidentsStore } from '@/features/auth/store';
import { spacing, shadows, radius } from '@/constants/tokens';
import { useColorScheme } from '@/core/hooks/useColorScheme';
import { useIncidentsQuery } from '@/features/elections/hooks';
import Colors from '@/constants/colors';

export default function IncidentSearchScreen() {
  const { data: incidents = [] } = useIncidentsQuery();
  const [search, setSearch] = useState('');
  const { incidents: storeIncidents } = useIncidentsStore();
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

  const pool = incidents.length > 0 ? incidents : storeIncidents;
  const filtered = search
    ? pool.filter((i) => i.category.replace(/_/g, ' ').toLowerCase().includes(search.toLowerCase()) || i.electoralArea.toLowerCase().includes(search.toLowerCase()))
    : pool;

  return (
    <ScreenView>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        enabled={Platform.OS === 'ios'}
        style={{ flex: 1 }}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={{ paddingBottom: spacing.xxl }}
        >
            <ThemedText variant="h2" style={{ marginBottom: spacing.lg }}>
              Search Incidents
            </ThemedText>

        <Input
          label="Search"
          placeholder="Search by category or area..."
          value={search}
          onChangeText={setSearch}
          leftIcon="search"
        />

        {filtered.length === 0 ? (
          <EmptyState icon="search-outline" title="No Incidents" subtitle="No incidents match your search" />
        ) : (
          filtered.map((incident) => {
            const sevColors: Record<string, string> = { LOW: colors.success, MEDIUM: colors.accent, HIGH: colors.error, CRITICAL: colors.error };
            const sevColor = sevColors[incident.severity] ?? colors.textMuted;
            return (
              <Card key={incident.id} style={shadows.sm}>
                <View style={styles.incidentRow}>
                  <View style={[styles.severityDot, { backgroundColor: sevColor }]} />
                  <View style={{ flex: 1 }}>
                    <ThemedText variant="body" style={{ fontWeight: '600' }}>
                      {incident.category.replace(/_/g, ' ')}
                    </ThemedText>
                    <ThemedText variant="caption" color="textSecondary" style={{ marginTop: 2 }}>
                      {incident.electoralArea}
                    </ThemedText>
                    <ThemedText variant="caption" color="textMuted">
                      {new Date(incident.reportedAt).toLocaleString()} · {incident.status}
                    </ThemedText>
                  </View>
                </View>
              </Card>
            );
          })
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  </ScreenView>
  );
}

const styles = StyleSheet.create({
  incidentRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  severityDot: { width: spacing.sm, height: spacing.sm, borderRadius: radius.full },
});
