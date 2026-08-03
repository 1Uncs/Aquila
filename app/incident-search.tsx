import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { ScreenView } from '@/core/components/ScreenView';
import { ThemedText, Card, EmptyState, Input } from '@/core/components';
import { mockApi } from '@/features/elections/service';
import { IncidentReport } from '@/features/auth/store';
import { useIncidentsStore } from '@/features/auth/store';
import { spacing, shadows } from '@/constants/tokens';
import { useColorScheme } from '@/core/hooks/useColorScheme';
import Colors from '@/constants/colors';

export default function IncidentSearchScreen() {
  const [incidents, setIncidents] = useState<IncidentReport[]>([]);
  const [search, setSearch] = useState('');
  const { incidents: storeIncidents } = useIncidentsStore();
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

  useEffect(() => {
    mockApi.getIncidents().then(setIncidents);
  }, []);

  const pool = incidents.length > 0 ? incidents : storeIncidents;
  const filtered = search
    ? pool.filter((i) => i.category.replace(/_/g, ' ').toLowerCase().includes(search.toLowerCase()) || i.electoralArea.toLowerCase().includes(search.toLowerCase()))
    : pool;

  return (
    <ScreenView>
      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xxl }}>
        <ThemedText variant="h2" style={{ marginHorizontal: 16, marginTop: spacing.md, marginBottom: spacing.lg }}>
          Search Incidents
        </ThemedText>

        <Input
          label="Search"
          placeholder="Search by category or area..."
          value={search}
          onChangeText={setSearch}
          leftIcon="search"
          style={{ marginHorizontal: 16 }}
        />

        {filtered.length === 0 ? (
          <EmptyState icon="search-outline" title="No Incidents" subtitle="No incidents match your search" />
        ) : (
          filtered.map((incident) => (
            <Card key={incident.id} style={shadows.sm}>
              <ThemedText variant="body" style={{ fontWeight: '600' }}>
                {incident.category.replace(/_/g, ' ')}
              </ThemedText>
              <ThemedText variant="caption" color="textSecondary" style={{ marginTop: 2 }}>
                {incident.electoralArea}
              </ThemedText>
              <ThemedText variant="caption" color="textMuted">
                {new Date(incident.reportedAt).toLocaleString()} · {incident.status}
              </ThemedText>
            </Card>
          ))
        )}
      </ScrollView>
    </ScreenView>
  );
}
