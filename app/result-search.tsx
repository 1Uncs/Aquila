import React, { useState } from 'react';
import { StyleSheet, View, Platform, KeyboardAvoidingView } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { ScreenView } from '@/core/components/ScreenView';
import { ThemedText, FlashListItem, EmptyState, Input } from '@/core/components';
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
    <ScreenView scrollable keyboardShouldPersistTaps="handled">
      <FlashList
        data={filtered}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View>
            <ThemedText variant="h2" style={{ marginBottom: spacing.lg }}>
              Search Results
            </ThemedText>

            <Input
              label="Search by Polling Unit"
              placeholder="Type to search..."
              value={search}
              onChangeText={setSearch}
              leftIcon="search"
              containerStyle={{ marginBottom: spacing.lg }}
            />

            {filtered.length === 0 ? (
              <EmptyState icon="search-outline" title="No Results" subtitle="No matching results found" />
            ) : null}
          </View>
        }
        renderItem={({ item: result }) => (
          <FlashListItem id={result.id}>
            <View style={styles.resultRow}>
              <View style={{ flex: 1 }}>
                <ThemedText variant="body" style={{ fontWeight: '600' }}>
                  {result.pollingUnitName}
                </ThemedText>
                <ThemedText variant="caption" color="textSecondary" style={{ marginTop: spacing.xs }}>
                  {result.totalVotesCast.toLocaleString()} votes · {result.status}
                </ThemedText>
                <ThemedText variant="caption" color="textMuted">
                  {new Date(result.submittedAt).toLocaleString()}
                </ThemedText>
              </View>
              <View style={[styles.statusDot, { backgroundColor: colors.success }]} />
            </View>
          </FlashListItem>
        )}
        contentContainerStyle={{ paddingHorizontal: spacing.md, paddingBottom: spacing.xxl }}
      />
    </ScreenView>
  );
}

const styles = StyleSheet.create({
  resultRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  statusDot: { width: spacing.sm, height: spacing.sm, borderRadius: radius.full },
});
