import React, { useState } from 'react';
import { StyleSheet, View, Platform, KeyboardAvoidingView, ScrollView } from 'react-native';
import { ScreenView } from '@/core/components/ScreenView';
import { ThemedText, Card, EmptyState, Input } from '@/core/components';
import { spacing, shadows, radius } from '@/constants/tokens';
import { useColorScheme } from '@/core/hooks/useColorScheme';
import { useResultsQuery } from '@/features/elections/hooks';
import Colors from '@/constants/colors';

export default function ResultSearchScreen() {
  const { data: results = [] } = useResultsQuery();
  const [search, setSearch] = useState('');
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

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
            <ThemedText variant="h2" style={{ marginBottom: spacing.lg }}>
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
              <View style={styles.resultRow}>
                <View style={{ flex: 1 }}>
                  <ThemedText variant="body" style={{ fontWeight: '600' }}>
                    {result.pollingUnitName}
                  </ThemedText>
                  <ThemedText variant="caption" color="textSecondary" style={{ marginTop: 2 }}>
                    {result.totalVotesCast.toLocaleString()} votes · {result.status}
                  </ThemedText>
                  <ThemedText variant="caption" color="textMuted">
                    {new Date(result.submittedAt).toLocaleString()}
                  </ThemedText>
                </View>
                <View style={[styles.statusDot, { backgroundColor: colors.success }]} />
              </View>
            </Card>
          ))
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  </ScreenView>
  );
}

const styles = StyleSheet.create({
  resultRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  statusDot: { width: spacing.sm, height: spacing.sm, borderRadius: radius.full },
});
