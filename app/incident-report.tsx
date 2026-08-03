import React, { useState } from 'react';
import { ScrollView, View, Platform, KeyboardAvoidingView } from 'react-native';
import { ScreenView } from '@/core/components/ScreenView';
import { ThemedText, Input, Button } from '@/core/components';
import { IncidentReport } from '@/features/auth/store';
import { useIncidentsStore } from '@/features/auth/store';
import { router, useLocalSearchParams } from 'expo-router';
import { spacing } from '@/constants/tokens';
import { IncidentCategory, IncidentSeverity } from '@/types';

const CATEGORIES = [
  'VIOLENCE', 'BALLOT_SNATCHING', 'VOTE_BUYING', 'VOTER_INTIMIDATION',
  'BVAS_FAILURE', 'SECURITY_INCIDENT', 'PROTEST', 'OTHER',
] as IncidentCategory[];

const SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as IncidentSeverity[];

export default function ReportIncidentScreen() {
  const { electionId } = useLocalSearchParams<{ electionId?: string }>();
  const [category, setCategory] = useState<IncidentCategory>('OTHER');
  const [severity, setSeverity] = useState<IncidentSeverity>('MEDIUM');
  const [description, setDescription] = useState('');
  const [electoralArea, setElectoralArea] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { addIncident } = useIncidentsStore();

  const handleSubmit = async () => {
    if (!description.trim() || !electoralArea.trim()) return;
    setSubmitting(true);
    const incident: IncidentReport = {
      id: `i-${Date.now()}`,
      electionId: electionId ?? 'e1',
      electoralArea,
      category,
      severity,
      status: 'SUBMITTED',
      description,
      latitude: 6.5 + Math.random() * 2,
      longitude: 3.3 + Math.random() * 2,
      mediaUrls: [],
      reportedBy: 'current-user',
      reportedAt: new Date().toISOString(),
    };
    addIncident(incident);
    setSubmitting(false);
    router.back();
  };

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
              Report Incident
            </ThemedText>

        <Input
          label="Electoral Area"
          placeholder="e.g. Ikeja LGA"
          value={electoralArea}
          onChangeText={setElectoralArea}
          leftIcon="location-outline"
        />

        <ThemedText variant="label" style={{ marginHorizontal: 16, marginBottom: spacing.sm }}>
          Category
        </ThemedText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: spacing.sm, marginBottom: spacing.lg }} keyboardShouldPersistTaps="handled">
          {CATEGORIES.map((cat) => (
            <Button
              key={cat}
              label={cat.replace(/_/g, ' ')}
              variant={category === cat ? 'primary' : 'outline'}
              size="sm"
              onPress={() => setCategory(cat)}
            />
          ))}
        </ScrollView>

        <ThemedText variant="label" style={{ marginHorizontal: 16, marginBottom: spacing.sm }}>
          Severity
        </ThemedText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: spacing.sm, marginBottom: spacing.lg }} keyboardShouldPersistTaps="handled">
          {SEVERITIES.map((sev) => (
            <Button
              key={sev}
              label={sev}
              variant={severity === sev ? 'primary' : 'outline'}
              size="sm"
              onPress={() => setSeverity(sev)}
            />
          ))}
        </ScrollView>

        <Input
          label="Description"
          placeholder="Describe the incident..."
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          style={{ marginHorizontal: 16, minHeight: 100 }}
        />

        <View style={{ flexDirection: 'row', gap: spacing.md, marginHorizontal: 16, marginTop: spacing.lg }}>
          <Button label="Cancel" variant="outline" onPress={() => router.back()} style={{ flex: 1 }} />
          <Button label="Submit" onPress={handleSubmit} loading={submitting} style={{ flex: 1 }} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  </ScreenView>
  );
}
