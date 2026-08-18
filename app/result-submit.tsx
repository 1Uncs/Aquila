import React, { useState, useEffect } from 'react';
import { View, Platform, KeyboardAvoidingView, ScrollView, StyleSheet } from 'react-native';
import { ScreenView } from '@/core/components/ScreenView';
import { ThemedText, Button, Input, Card } from '@/core/components';
import { useResultsStore, useAuthStore } from '@/features/auth/store';
import { router, useLocalSearchParams } from 'expo-router';
import { spacing, shadows, radius } from '@/constants/tokens';
import { useColorScheme } from '@/core/hooks/useColorScheme';
import { useStatusBar } from '@/core/hooks/useStatusBar';
import { useCandidatesQuery, usePollingUnitsQuery } from '@/features/elections/hooks';
import { ROUTES } from '@/constants/routes';
import Colors from '@/constants/colors';

type VoteInput = {
  inec: string;
  observed: string;
};

export default function SubmitResultScreen() {
  const scheme = useColorScheme() ?? 'light';
  const themeColors = Colors[scheme];
  useStatusBar({ barStyle: scheme === 'dark' ? 'light' : 'dark' });
  const { electionId, pollingUnitId: preselectedPuId, pollingUnitName: preselectedPuName } = useLocalSearchParams<{
    electionId?: string;
    pollingUnitId?: string;
    pollingUnitName?: string;
  }>();
  const resolvedElectionId = electionId ?? 'e1';
  const { data: candidates = [], isLoading: candidatesLoading } = useCandidatesQuery(resolvedElectionId);
  const { data: allPollingUnits = [] } = usePollingUnitsQuery();
  const { user } = useAuthStore();
  const [selectedPuId, setSelectedPuId] = useState(preselectedPuId ?? '');
  const [votes, setVotes] = useState<Record<string, VoteInput>>({});
  const [rejectedInec, setRejectedInec] = useState('');
  const [rejectedObs, setRejectedObs] = useState('');
  const [accredited, setAccredited] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { addSubmission } = useResultsStore();

  useEffect(() => {
    if (preselectedPuId) {
      setSelectedPuId(preselectedPuId);
    } else if (user?.role === 'POLLING_AGENT' && user.assignedLocations && user.assignedLocations.length > 0 && !selectedPuId) {
      setSelectedPuId(user.assignedLocations[0]!);
    }
  }, [preselectedPuId, user?.role, user?.assignedLocations, selectedPuId]);

  const isFieldAgent = user?.role === 'FIELD_AGENT';
  const showPuPicker = isFieldAgent && !preselectedPuId && !selectedPuId;

  const handleVoteChange = (candidateId: string, field: 'inec' | 'observed', value: string) => {
    setVotes((prev) => ({
      ...prev,
      [candidateId]: {
        ...(prev[candidateId] ?? { inec: '', observed: '' }),
        [field]: value,
      },
    }));
  };

  const computeTotal = () => {
    let total = 0;
    candidates.forEach((c) => {
      const observed = parseInt(votes[c.id]?.observed ?? '0', 10);
      if (!isNaN(observed)) total += observed;
    });
    total += parseInt(rejectedObs ?? '0', 10) || 0;
    return total;
  };

  const handleSaveDraft = async () => {
    if (!selectedPuId) return;
    setSubmitting(true);
    const candidateVotes: Record<string, number> = {};
    const candidateVotesInec: Record<string, number> = {};
    candidates.forEach((c) => {
      const vObs = parseInt(votes[c.id]?.observed ?? '0', 10);
      const vInec = parseInt(votes[c.id]?.inec ?? '0', 10);
      candidateVotes[c.id] = isNaN(vObs) ? 0 : vObs;
      candidateVotesInec[c.id] = isNaN(vInec) ? 0 : vInec;
    });
    const submission = {
      id: `draft-${Date.now()}`,
      electionId: electionId ?? 'e1',
      pollingUnitId: selectedPuId,
      pollingUnitName: allPollingUnits.find((p) => p.id === selectedPuId)?.name ?? preselectedPuName ?? 'Unknown PU',
      candidateVotes,
      candidateVotesInec,
      rejectedVotes: parseInt(rejectedObs ?? '0', 10) || 0,
      rejectedVotesInec: parseInt(rejectedInec ?? '0', 10) || 0,
      totalAccreditedVoters: parseInt(accredited ?? '0', 10) || 0,
      totalVotesCast: computeTotal(),
      status: 'DRAFT' as const,
      submittedAt: new Date().toISOString(),
      submittedBy: user?.id ?? 'current-user',
    };
    addSubmission(submission);
    setSubmitting(false);
    router.replace(ROUTES.RESULT_DRAFTS as any);
  };

  const handlePublish = async () => {
    if (!selectedPuId) return;
    setSubmitting(true);
    const candidateVotes: Record<string, number> = {};
    const candidateVotesInec: Record<string, number> = {};
    candidates.forEach((c) => {
      const vObs = parseInt(votes[c.id]?.observed ?? '0', 10);
      const vInec = parseInt(votes[c.id]?.inec ?? '0', 10);
      candidateVotes[c.id] = isNaN(vObs) ? 0 : vObs;
      candidateVotesInec[c.id] = isNaN(vInec) ? 0 : vInec;
    });
    const submission = {
      id: `r-${Date.now()}`,
      electionId: electionId ?? 'e1',
      pollingUnitId: selectedPuId,
      pollingUnitName: allPollingUnits.find((p) => p.id === selectedPuId)?.name ?? preselectedPuName ?? 'Unknown PU',
      candidateVotes,
      candidateVotesInec,
      rejectedVotes: parseInt(rejectedObs ?? '0', 10) || 0,
      rejectedVotesInec: parseInt(rejectedInec ?? '0', 10) || 0,
      totalAccreditedVoters: parseInt(accredited ?? '0', 10) || 0,
      totalVotesCast: computeTotal(),
      status: 'SUBMITTED' as const,
      submittedAt: new Date().toISOString(),
      submittedBy: user?.id ?? 'current-user',
    };
    addSubmission(submission);
    setSubmitting(false);
    router.back();
  };

  if (candidatesLoading) {
    return (
      <ScreenView skipAndroidTopPadding>
        <ThemedText variant="body" color="textSecondary" style={{ textAlign: 'center', marginTop: spacing.xxl }}>
          Loading...
        </ThemedText>
      </ScreenView>
    );
  }

  return (
    <ScreenView skipAndroidTopPadding>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        enabled={Platform.OS === 'ios'}
        style={{ flex: 1 }}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentInsetAdjustmentBehavior="automatic"
          automaticallyAdjustKeyboardInsets={true}
          contentContainerStyle={{ paddingBottom: spacing.xxl }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.lg }}>
            <View style={[styles.titleIndicator, { backgroundColor: themeColors.primary }]} />
            <ThemedText variant="h2" style={{ flex: 1 }}>Submit Result</ThemedText>
          </View>

          {showPuPicker ? (
            <Button
              label="Select Polling Unit"
              variant="outline"
              onPress={() => router.push({ pathname: '/pu-picker' as any, params: { mode: 'result', ...(electionId ? { electionId } : {}) } })}
              style={{ marginBottom: spacing.md }}
              leftIcon="location-outline"
            />
          ) : (
            <View style={{ marginBottom: spacing.md }}>
              <ThemedText variant="label" style={{ marginBottom: spacing.xs }}>Polling Unit</ThemedText>
              <Card style={[shadows.sm, { padding: spacing.md }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                  <ThemedText variant="body" style={{ fontWeight: '600', flex: 1 }}>
                    {allPollingUnits.find((p) => p.id === selectedPuId)?.name ?? preselectedPuName ?? 'Unknown PU'}
                  </ThemedText>
                  {isFieldAgent && (
                    <Button
                      label="Change"
                      size="sm"
                      variant="ghost"
                      onPress={() => router.push({ pathname: '/pu-picker' as any, params: { mode: 'result', ...(electionId ? { electionId } : {}) } })}
                    />
                  )}
                </View>
              </Card>
            </View>
          )}

          <ThemedText variant="h3" style={{ marginHorizontal: spacing.md, marginTop: spacing.lg, marginBottom: spacing.sm }}>
            Candidate Votes
          </ThemedText>

          <View style={{ flexDirection: 'row', marginHorizontal: spacing.md, marginBottom: spacing.sm, gap: spacing.sm }}>
            <ThemedText variant="caption" style={{ flex: 1, fontWeight: '600', color: themeColors.textSecondary }}>Candidate</ThemedText>
            <ThemedText variant="caption" style={{ width: 80, fontWeight: '600', color: themeColors.textSecondary, textAlign: 'center' }}>INEC</ThemedText>
            <ThemedText variant="caption" style={{ width: 80, fontWeight: '600', color: themeColors.primary, textAlign: 'center' }}>Observed</ThemedText>
          </View>

          {candidates.map((c) => {
            const current = votes[c.id] ?? { inec: '', observed: '' };
            return (
              <View key={c.id} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm, gap: spacing.sm, paddingHorizontal: spacing.md }}>
                <View style={{ flex: 1 }}>
                  <ThemedText variant="body" style={{ fontWeight: '600' }}>{c.fullName}</ThemedText>
                  <ThemedText variant="caption" color="textSecondary">{c.partyAcronym}</ThemedText>
                </View>
                <Input
                  placeholder="INEC"
                  value={current.inec}
                  onChangeText={(text) => handleVoteChange(c.id, 'inec', text)}
                  keyboardType="numeric"
                  style={{ width: 80, marginBottom: 0 }}
                  containerStyle={{ marginBottom: 0, marginHorizontal: 0 }}
                  editable={false}
                />
                <Input
                  placeholder="Observed"
                  value={current.observed}
                  onChangeText={(text) => handleVoteChange(c.id, 'observed', text)}
                  keyboardType="numeric"
                  style={{ width: 80, marginBottom: 0 }}
                  containerStyle={{ marginBottom: 0, marginHorizontal: 0 }}
                />
              </View>
            );
          })}

          <ThemedText variant="h3" style={{ marginHorizontal: spacing.md, marginTop: spacing.lg, marginBottom: spacing.sm }}>
            Other Counts
          </ThemedText>

          <View style={{ flexDirection: 'row', gap: spacing.md, marginHorizontal: spacing.md, marginBottom: spacing.sm }}>
            <View style={{ flex: 1 }}>
              <ThemedText variant="label" style={{ marginBottom: spacing.xs }}>Rejected (INEC)</ThemedText>
              <Input
                value={rejectedInec}
                onChangeText={setRejectedInec}
                keyboardType="numeric"
                leftIcon="close-circle-outline"
                editable={false}
              />
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText variant="label" style={{ marginBottom: spacing.xs }}>Rejected (Observed)</ThemedText>
              <Input
                value={rejectedObs}
                onChangeText={setRejectedObs}
                keyboardType="numeric"
                leftIcon="close-circle-outline"
              />
            </View>
          </View>

          <Input
            label="Total Accredited Voters"
            value={accredited}
            onChangeText={setAccredited}
            keyboardType="numeric"
            leftIcon="people-outline"
          />

          {computeTotal() > 0 && (
            <ThemedText variant="caption" color="textSecondary" style={{ marginHorizontal: spacing.md, marginBottom: spacing.sm }}>
              Total votes cast (observed): {computeTotal().toLocaleString()}
            </ThemedText>
          )}

            <View style={{ flexDirection: 'row', gap: spacing.md, marginHorizontal: spacing.md, marginTop: spacing.lg }}>
              <Button label="Save Draft" variant="outline" onPress={handleSaveDraft} loading={submitting} fullWidth />
              <Button label="Publish" onPress={handlePublish} loading={submitting} fullWidth />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </ScreenView>
    );
}

const styles = StyleSheet.create({
  titleIndicator: { width: 4, height: 20, borderRadius: radius.full },
});
