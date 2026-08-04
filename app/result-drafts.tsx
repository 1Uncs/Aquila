import React from 'react';
import { View, StyleSheet } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ScreenView } from '@/core/components/ScreenView';
import { ThemedText, FlashListItem, EmptyState, Button } from '@/core/components';
import { ROUTES } from '@/constants/routes';
import { spacing, radius, shadows, gradientPresets } from '@/constants/tokens';
import { useColorScheme } from '@/core/hooks/useColorScheme';
import { useDraftsQuery } from '@/features/elections/hooks';
import { useResultsStore } from '@/features/auth/store';
import Colors from '@/constants/colors';

export default function ResultDraftsScreen() {
  const { data: _apiDrafts = [], isLoading: apiLoading } = useDraftsQuery();
  const { removeSubmission } = useResultsStore();
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

  const drafts = useResultsStore.getState().submissions.filter((s) => s.status === 'DRAFT');

  return (
    <ScreenView scrollable keyboardShouldPersistTaps="handled" skipAndroidTopPadding>
      <FlashList
        data={drafts}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View>
            <LinearGradient colors={gradientPresets.accent} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.headerCard, shadows.md]}>
              <ThemedText variant="lg" style={{ color: '#fff', fontWeight: '700' }}>
                Draft Results
              </ThemedText>
              <ThemedText variant="caption" style={{ color: 'rgba(255,255,255,0.85)', marginTop: spacing.xs }}>
                {drafts.length} draft{drafts.length !== 1 ? 's' : ''} saved — resume or publish anytime
              </ThemedText>
            </LinearGradient>

            {apiLoading ? (
              <ThemedText variant="body" color="textSecondary" style={{ textAlign: 'center', marginTop: spacing.xxl }}>
                Loading drafts...
              </ThemedText>
            ) : drafts.length === 0 ? (
              <EmptyState
                icon="document-text-outline"
                title="No Drafts"
                subtitle="Results you save as draft will appear here"
              />
            ) : null}
          </View>
        }
        renderItem={({ item: draft }) => (
          <FlashListItem id={draft.id}>
            <ThemedText variant="body" style={{ fontWeight: '600' }}>
              {draft.pollingUnitName}
            </ThemedText>
            <ThemedText variant="caption" color="textSecondary" style={{ marginTop: spacing.xs }}>
              Election: {draft.electionId} · Saved {new Date(draft.submittedAt).toLocaleString()}
            </ThemedText>

            <View style={[styles.progressTrack, { backgroundColor: colors.border, marginTop: spacing.sm }]}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.min((Object.values(draft.candidateVotes).reduce((a, b) => a + b, 0) / 800) * 100, 100)}%`,
                    backgroundColor: colors.accent,
                  },
                ]}
              />
            </View>
            <ThemedText variant="caption" color="textMuted" style={{ marginTop: spacing.xs }}>
              {Object.values(draft.candidateVotes).reduce((a, b) => a + b, 0).toLocaleString()} votes entered
            </ThemedText>

            <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm }}>
              <Button
                label="Continue Editing"
                variant="primary"
                size="sm"
                onPress={() => router.replace({ pathname: ROUTES.RESULT_SUBMIT, params: { electionId: draft.electionId, pollingUnitId: draft.pollingUnitId, pollingUnitName: draft.pollingUnitName } })}
                style={{ flex: 1 }}
              />
              <Button
                label="Discard"
                variant="outline"
                size="sm"
                onPress={() => {
                  removeSubmission(draft.id);
                }}
                style={{ flex: 1 }}
              />
            </View>
          </FlashListItem>
        )}
        contentContainerStyle={{ paddingHorizontal: spacing.md, paddingBottom: spacing.xxl }}
      />
    </ScreenView>
  );
}

const styles = StyleSheet.create({
  headerCard: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  progressTrack: {
    height: spacing.sm,
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: radius.sm,
  },
});
