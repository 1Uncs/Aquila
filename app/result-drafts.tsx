import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ScreenView } from '@/core/components/ScreenView';
import { ThemedText, Card, EmptyState, Button } from '@/core/components';
import { ROUTES } from '@/constants/routes';
import { spacing, radius, shadows, gradientPresets } from '@/constants/tokens';
import { useColorScheme } from '@/core/hooks/useColorScheme';
import { useDraftsQuery } from '@/features/elections/hooks';
import { useResultsStore } from '@/features/auth/store';
import Colors from '@/constants/colors';

export default function ResultDraftsScreen() {
  const { data: _apiDrafts = [], isLoading: apiLoading } = useDraftsQuery();
  const { submissions: storeSubmissions } = useResultsStore();
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

  const drafts = storeSubmissions.filter((s) => s.status === 'DRAFT');

  return (
    <ScreenView scrollable keyboardShouldPersistTaps="handled">
      <View style={{ paddingBottom: spacing.xxl }}>
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
        ) : (
          drafts.map((draft) => (
            <Card key={draft.id} style={[shadows.sm, { marginBottom: spacing.sm }]}>
              <ThemedText variant="body" style={{ fontWeight: '600' }}>
                {draft.pollingUnitName}
              </ThemedText>
              <ThemedText variant="caption" color="textSecondary" style={{ marginTop: 4 }}>
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
              <ThemedText variant="caption" color="textMuted" style={{ marginTop: 4 }}>
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
                    const store = useResultsStore.getState();
                    store.submissions = store.submissions.filter((s) => s.id !== draft.id);
                    router.reload();
                  }}
                  style={{ flex: 1 }}
                />
              </View>
            </Card>
          ))
        )}
      </View>
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
