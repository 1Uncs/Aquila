import React, { useState } from 'react';
import { Platform, KeyboardAvoidingView, ScrollView } from 'react-native';
import { ScreenView } from '@/core/components/ScreenView';
import { ThemedText, Card, EmptyState, Input } from '@/core/components';
import { spacing, shadows } from '@/constants/tokens';
import { useResultsQuery } from '@/features/elections/hooks';

export default function ResultSearchScreen() {
  const { data: results = [] } = useResultsQuery();
  const [search, setSearch] = useState('');

  const filtered = search
    ? results.filter((r) => r.pollingUnitName.toLowerCase().includes(search.toLowerCase()))
    : results;

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
              Search Results
            </ThemedText>

        <Input
          label="Search by Polling Unit"
          placeholder="Type to search..."
          value={search}
          onChangeText={setSearch}
          leftIcon="search"
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
      </ScrollView>
    </KeyboardAvoidingView>
  </ScreenView>
  );
}
