import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { ScreenView } from '@/core/components/ScreenView';
import { ThemedText, FlashListItem, EmptyState, Input } from '@/core/components';
import { useIncidentsStore } from '@/features/auth/store';
import { spacing, radius } from '@/constants/tokens';
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
    <ScreenView scrollable keyboardShouldPersistTaps="handled">
      <FlashList
        data={filtered}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View>
            <ThemedText variant="h2" style={{ marginBottom: spacing.lg }}>
              Search Incidents
            </ThemedText>

            <Input
              label="Search"
              placeholder="Search by category or area..."
              value={search}
              onChangeText={setSearch}
              leftIcon="search"
              containerStyle={{ marginBottom: spacing.lg }}
            />

            {filtered.length === 0 ? (
              <EmptyState icon="search-outline" title="No Incidents" subtitle="No incidents match your search" />
            ) : null}
          </View>
        }
        renderItem={({ item: incident }) => {
          const sevColors: Record<string, string> = { LOW: colors.success, MEDIUM: colors.accent, HIGH: colors.error, CRITICAL: colors.error };
          const sevColor = sevColors[incident.severity] ?? colors.textMuted;
          return (
            <FlashListItem id={incident.id}>
              <View style={styles.incidentRow}>
                <View style={[styles.severityDot, { backgroundColor: sevColor }]} />
                <View style={{ flex: 1 }}>
                  <ThemedText variant="body" style={{ fontWeight: '600' }}>
                    {incident.category.replace(/_/g, ' ')}
                  </ThemedText>
                  <ThemedText variant="caption" color="textSecondary" style={{ marginTop: spacing.xs }}>
                    {incident.electoralArea}
                  </ThemedText>
                  <ThemedText variant="caption" color="textMuted">
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
  incidentRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  severityDot: { width: spacing.sm, height: spacing.sm, borderRadius: radius.full },
});
