import React, { useState } from 'react';
import { View, Platform, KeyboardAvoidingView, ScrollView } from 'react-native';
import { ScreenView } from '@/core/components/ScreenView';
import { ThemedText, Button, Input } from '@/core/components';
import { useResultsStore } from '@/features/auth/store';
import { router, useLocalSearchParams } from 'expo-router';
import { spacing } from '@/constants/tokens';
import { useCandidatesQuery, usePollingUnitsQuery } from '@/features/elections/hooks';

export default function SubmitResultScreen() {
  const { electionId } = useLocalSearchParams<{ electionId: string }>();
  const { data: candidates = [], isLoading: candidatesLoading } = useCandidatesQuery(electionId ?? '');
  const { data: pollingUnits = [] } = usePollingUnitsQuery();
  const [selectedPU, setSelectedPU] = useState('');
  const [votes, setVotes] = useState<Record<string, string>>({});
  const [rejected, setRejected] = useState('');
  const [accredited, setAccredited] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { addSubmission } = useResultsStore();

  const handleSubmit = async () => {
    if (!selectedPU) return;
    setSubmitting(true);
    const votesObj: Record<string, number> = {};
    candidates.forEach((c) => {
      const v = parseInt(votes[c.id] ?? '0', 10);
      votesObj[c.id] = isNaN(v) ? 0 : v;
    });
    const submission = {
      id: `r-${Date.now()}`,
      electionId: electionId ?? 'e1',
      pollingUnitId: selectedPU,
      pollingUnitName: pollingUnits.find((p) => p.id === selectedPU)?.name ?? 'Unknown PU',
      candidateVotes: votesObj,
      rejectedVotes: parseInt(rejected ?? '0', 10) || 0,
      totalAccreditedVoters: parseInt(accredited ?? '0', 10) || 0,
      totalVotesCast: Object.values(votesObj).reduce((a, b) => a + b, 0) + (parseInt(rejected ?? '0', 10) || 0),
      status: 'SUBMITTED' as const,
      submittedAt: new Date().toISOString(),
      submittedBy: 'current-user',
    };
    addSubmission(submission);
    setSubmitting(false);
    router.back();
  };

  if (candidatesLoading) {
    return (
      <ScreenView>
        <ThemedText variant="body" color="textSecondary" style={{ textAlign: 'center', marginTop: spacing.xxl }}>
          Loading...
        </ThemedText>
      </ScreenView>
    );
  }

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
              Submit Result
            </ThemedText>

        <Input
          label="Polling Unit"
          placeholder="Select Polling Unit"
          value={selectedPU}
          onChangeText={setSelectedPU}
          leftIcon="location"
        />

        <ThemedText variant="h3" style={{ marginHorizontal: spacing.md, marginTop: spacing.lg, marginBottom: spacing.sm }}>
          Candidate Votes
        </ThemedText>
        {candidates.map((c) => (
          <View key={c.id} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm, gap: spacing.md, paddingHorizontal: spacing.md }}>
            <View style={{ flex: 1 }}>
              <ThemedText variant="body">{c.fullName}</ThemedText>
              <ThemedText variant="caption" color="textSecondary">{c.partyAcronym}</ThemedText>
            </View>
            <Input
              placeholder="Votes"
              value={votes[c.id] ?? ''}
              onChangeText={(text) => setVotes({ ...votes, [c.id]: text })}
              keyboardType="numeric"
              style={{ width: 80, marginBottom: 0, marginHorizontal: 0 }}
              containerStyle={{ marginBottom: 0 }}
            />
          </View>
        ))}

        <Input
          label="Rejected Votes"
          value={rejected}
          onChangeText={setRejected}
          keyboardType="numeric"
          leftIcon="close-circle-outline"
        />

        <Input
          label="Total Accredited Voters"
          value={accredited}
          onChangeText={setAccredited}
          keyboardType="numeric"
          leftIcon="people-outline"
        />

        <View style={{ flexDirection: 'row', gap: spacing.md, marginHorizontal: spacing.md, marginTop: spacing.lg }}>
          <Button label="Save Draft" variant="outline" onPress={() => router.back()} fullWidth />
          <Button label="Publish" onPress={handleSubmit} loading={submitting} fullWidth />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  </ScreenView>
  );
}
