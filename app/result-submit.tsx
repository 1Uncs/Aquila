import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { ScreenView } from '@/core/components/ScreenView';
import { ThemedText, Button, Input } from '@/core/components';
import { mockApi } from '@/features/elections/service';
import { useResultsStore } from '@/features/auth/store';
import { router, useLocalSearchParams } from 'expo-router';
import { spacing } from '@/constants/tokens';
import { Candidate, PollingUnit } from '@/features/auth/store';

export default function SubmitResultScreen() {
  const { electionId } = useLocalSearchParams<{ electionId: string }>();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [pollingUnits, setPollingUnits] = useState<PollingUnit[]>([]);
  const [selectedPU, setSelectedPU] = useState('');
  const [votes, setVotes] = useState<Record<string, string>>({});
  const [rejected, setRejected] = useState('');
  const [accredited, setAccredited] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { addSubmission } = useResultsStore();

  useEffect(() => {
    (async () => {
      try {
        const [c, p] = await Promise.all([
          electionId ? mockApi.getCandidates(electionId) : Promise.resolve([]),
          mockApi.getPollingUnits(),
        ]);
        setCandidates(c);
        setPollingUnits(p);
      } finally {
        setLoading(false);
      }
    })();
  }, [electionId]);

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

  if (loading) {
    return (
      <ScreenView>
        <ThemedText variant="body" color="textSecondary" style={{ textAlign: 'center', marginTop: spacing.xxl }}>
          Loading...
        </ThemedText>
      </ScreenView>
    );
  }

  return (
    <ScreenView scrollable keyboardShouldPersistTaps="handled">
      <View style={{ paddingBottom: spacing.xxl }}>
        <ThemedText variant="h2" style={{ marginHorizontal: 16, marginTop: spacing.md, marginBottom: spacing.lg }}>
          Submit Result
        </ThemedText>

        <Input
          label="Polling Unit"
          placeholder="Select Polling Unit"
          value={selectedPU}
          onChangeText={setSelectedPU}
          leftIcon="location"
        />

        <ThemedText variant="h3" style={{ marginHorizontal: 16, marginTop: spacing.lg, marginBottom: spacing.sm }}>
          Candidate Votes
        </ThemedText>
        {candidates.map((c) => (
          <View key={c.id} style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: spacing.sm, gap: spacing.md }}>
            <View style={{ flex: 1 }}>
              <ThemedText variant="body">{c.fullName}</ThemedText>
              <ThemedText variant="caption" color="textSecondary">{c.partyAcronym}</ThemedText>
            </View>
            <Input
              placeholder="Votes"
              value={votes[c.id] ?? ''}
              onChangeText={(text) => setVotes({ ...votes, [c.id]: text })}
              keyboardType="numeric"
              style={{ width: 80, marginBottom: 0 }}
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

        <View style={{ flexDirection: 'row', gap: spacing.md, marginHorizontal: 16, marginTop: spacing.lg }}>
          <Button
            label="Save Draft"
            variant="outline"
            onPress={() => router.back()}
            style={{ flex: 1 }}
          />
          <Button
            label="Publish"
            onPress={handleSubmit}
            loading={submitting}
            style={{ flex: 1 }}
          />
        </View>
      </View>
    </ScreenView>
  );
}
