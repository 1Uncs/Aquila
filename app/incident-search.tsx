import React, { useState } from 'react';
import { Platform, KeyboardAvoidingView, ScrollView } from 'react-native';
import { ScreenView } from '@/core/components/ScreenView';
import { ThemedText, Card, EmptyState, Input } from '@/core/components';
import { useIncidentsStore } from '@/features/auth/store';
import { spacing, shadows } from '@/constants/tokens';
import { useIncidentsQuery } from '@/features/elections/hooks';

export default function IncidentSearchScreen() {
  const { data: incidents = [] } = useIncidentsQuery();
  const [search, setSearch] = useState('');
  const { incidents: storeIncidents } = useIncidentsStore();

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
            <ThemedText variant="h2" style={{ marginHorizontal: 16, marginTop: spacing.md, marginBottom: spacing.lg }}>
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
          filtered.map((incident) => (
            <Card key={incident.id} style={shadows.sm}>
              <ThemedText variant="body" style={{ fontWeight: '600' }}>
                {incident.category.replace(/_/g, ' ')}
              </ThemedText>
              <ThemedText variant="caption" color="textSecondary" style={{ marginTop: 4 }}>
                {incident.electoralArea}
              </ThemedText>
              <ThemedText variant="caption" color="textMuted">
                {new Date(incident.reportedAt).toLocaleString()} · {incident.status}
              </ThemedText>
            </Card>
          ))
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  </ScreenView>
  );
}
