import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { ScreenView } from '@/core/components/ScreenView';
import { ThemedText, Card, EmptyState, Input } from '@/core/components';
import { mockApi } from '@/features/elections/service';
import { useResultsStore } from '@/features/auth/store';
import { ResultSubmission } from '@/features/auth/store';
import { spacing, radius, shadows } from '@/constants/tokens';
import { useColorScheme } from '@/core/hooks/useColorScheme';
import Colors from '@/constants/colors';

export default function ResultSearchScreen() {
  const [results, setResults] = useState<ResultSubmission[]>([]);
  const [search, setSearch] = useState('');
  const { submissions } = useResultsStore();
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

  useEffect(() => {
    mockApi.getResults().then(setResults);
  }, []);

  const pool = results.length > 0 ? results : submissions;
  const filtered = search
    ? pool.filter((r) => r.pollingUnitName.toLowerCase().includes(search.toLowerCase()))
    : pool;

  return (
    <ScreenView>
      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xxl }}>
        <ThemedText variant="h2" style={{ marginHorizontal: 16, marginTop: spacing.md, marginBottom: spacing.lg }}>
          Search Results
        </ThemedText>

        <Input
          label="Search by Polling Unit"
          placeholder="Type to search..."
          value={search}
          onChangeText={setSearch}
          leftIcon="search"
          style={{ marginHorizontal: 16 }}
        />

        {filtered.length === 0 ? (
          <EmptyState icon="search-outline" title="No Results" subtitle="No matching results found" />
        ) : (
          filtered.map((result) => (
            <Card key={result.id} style={shadows.sm}>
              <ThemedText variant="body" style={{ fontWeight: '600' }}>
                {result.pollingUnitName}
              </ThemedText>
              <ThemedText variant="caption" color="textSecondary" style={{ marginTop: 2 }}>
                {result.totalVotesCast.toLocaleString()} votes · {result.status}
              </ThemedText>
              <ThemedText variant="caption" color="textMuted">
                {new Date(result.submittedAt).toLocaleString()}
              </ThemedText>
            </Card>
          ))
        )}
      </ScrollView>
    </ScreenView>
  );
}
