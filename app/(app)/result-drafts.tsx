import React from 'react';
import { StyleSheet, View, Alert, Pressable } from 'react-native';
import { router } from 'expo-router';
import { ScreenView } from '@/core/components/ScreenView';
import { ThemedText, EmptyState, Button, Card, ScreenHeader } from '@/core/components';
import { ROUTES } from '@/constants/routes';
import { spacing, radius, shadows, border } from '@/constants/tokens';
import { useColorScheme } from '@/core/hooks/useColorScheme';
import { useStatusBar } from '@/core/hooks/useStatusBar';
import Colors from '@/constants/colors';
import { useResultsStore } from '@/features/auth/store';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

export default function ResultDraftsScreen() {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  useStatusBar({ barStyle: scheme === 'dark' ? 'light' : 'dark' });

  const { submissions, updateSubmission, removeSubmission } = useResultsStore();

  // Active drafts from persistent store (Audio Part 3)
  const drafts = submissions.filter((s) => s.status === 'DRAFT');

  const handleContinue = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({ pathname: ROUTES.RESULT_SUBMIT, params: { draftId: id } });
  };

  const handlePublishNow = (id: string, puName: string) => {
    Alert.alert(
      'Publish Result',
      `Confirm publishing verified return for ${puName}? This will commit to the live collation stream.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Publish',
          style: 'default',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            updateSubmission(id, { status: 'PUBLISHED', submittedAt: new Date().toISOString() });
            Alert.alert('Published', 'Result successfully published to live collation stream.');
          },
        },
      ]
    );
  };

  const handleDiscard = (id: string, puName: string) => {
    Alert.alert('Discard Draft', `Are you sure you want to discard the draft for ${puName}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Discard',
        style: 'destructive',
        onPress: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          removeSubmission(id);
        },
      },
    ]);
  };

  return (
    <ScreenView
      scrollable
      header={
        <ScreenHeader
          title="Drafts Queue"
          subtitle={`${drafts.length} unpublished ballot return${drafts.length === 1 ? '' : 's'}`}
          showBack
        />
      }
      contentContainerStyle={styles.scrollContent}
    >

      {drafts.length === 0 ? (
        <EmptyState
          icon="document-outline"
          title="No Drafts in Queue"
          subtitle="All entered results have either been published or none have been saved yet."
          actionLabel="+ Record New Result"
          onAction={() => router.push(ROUTES.RESULT_SUBMIT)}
        />
      ) : (
        <View style={{ gap: spacing.md }}>
          {drafts.map((draft) => {
            const totalCast = draft.totalVotesCast || 0;
            const candCount = Object.keys(draft.candidateVotes || {}).length;

            return (
              <Card key={draft.id} style={styles.draftCard}>
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <ThemedText variant="body" color="text" fontFamily="bold">
                      {draft.pollingUnitName}
                    </ThemedText>
                    <ThemedText variant="caption" color="textSecondary">
                      PU ID: {draft.pollingUnitId} · Saved {new Date(draft.submittedAt).toLocaleTimeString()}
                    </ThemedText>
                  </View>
                  <View style={[styles.draftBadge, { backgroundColor: colors.warningSubtle }]}>
                    <ThemedText variant="label" color="warning" fontFamily="bold">
                      DRAFT
                    </ThemedText>
                  </View>
                </View>

                {/* Progress metadata */}
                <View style={[styles.statsStrip, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
                  <View style={styles.statCol}>
                    <ThemedText variant="label" color="textMuted">RECORDED BALLOTS</ThemedText>
                    <ThemedText variant="body" color="text" fontFamily="bold">
                      {totalCast.toLocaleString()} votes
                    </ThemedText>
                  </View>
                  <View style={styles.statCol}>
                    <ThemedText variant="label" color="textMuted">CANDIDATES ENTERED</ThemedText>
                    <ThemedText variant="body" color="text" fontFamily="bold">
                      {candCount} recorded
                    </ThemedText>
                  </View>
                </View>

                {/* Actions Row */}
                <View style={styles.actionsRow}>
                  <Button
                    label="Discard"
                    variant="outline"
                    size="sm"
                    leftIcon="trash-outline"
                    onPress={() => handleDiscard(draft.id, draft.pollingUnitName)}
                    style={{ flex: 1 }}
                  />
                  <Button
                    label="Resume"
                    variant="outline"
                    size="sm"
                    leftIcon="create-outline"
                    onPress={() => handleContinue(draft.id)}
                    style={{ flex: 1 }}
                  />
                  <Button
                    label="Publish"
                    variant="primary"
                    size="sm"
                    leftIcon="cloud-upload-outline"
                    onPress={() => handlePublishNow(draft.id, draft.pollingUnitName)}
                    style={{ flex: 1.2 }}
                  />
                </View>
              </Card>
            );
          })}
        </View>
      )}
    </ScreenView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  headerCard: {
    padding: spacing.md,
    borderRadius: radius.lg,
    ...shadows.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  draftCard: {
    padding: spacing.md,
    borderRadius: radius.lg,
    ...shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  draftBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  statsStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    marginVertical: spacing.sm,
  },
  statCol: {
    flex: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
});
