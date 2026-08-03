import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { ScreenView } from '@/core/components/ScreenView';
import { ThemedText, Card, EmptyState, Input } from '@/core/components';
import { mockApi } from '@/features/elections/service';
import { useResultsStore } from '@/features/auth/store';
import { ResultSubmission } from '@/features/auth/store';
import { spacing, shadows } from '@/constants/tokens';

export default function ResultSearchScreen() {
  const [results, setResults] = useState<ResultSubmission[]>([]);
  const [search, setSearch] = useState('');
  const { submissions } = useResultsStore();

  useEffect(() => {
    mockApi.getResults().then(setResults);
  }, []);

  const pool = results.length > 0 ? results : submissions;
  const filtered = search
    ? pool.filter((r) => r.pollingUnitName.toLowerCase().includes(search.toLowerCase()))
    : pool;

  return (
    <ScreenView scrollable keyboardShouldPersistTaps="handled">
      <View style={{ paddingBottom: spacing.xxl }}>
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
              <ThemedText variant="caption" color="textSecondary" style={{ marginTop: 4 }}>
                {result.totalVotesCast.toLocaleString()} votes · {result.status}
              </ThemedText>
              <ThemedText variant="caption" color="textMuted">
                {new Date(result.submittedAt).toLocaleString()}
              </ThemedText>
            </Card>
          ))
        )}
      </View>
    </ScreenView>
  );
}
