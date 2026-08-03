import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ScreenView } from '@/core/components/ScreenView';
import { ThemedText, Card, Button, EmptyState } from '@/core/components';
import { Ionicons } from '@expo/vector-icons';
import { mockApi } from '@/features/elections/service';
import { ROUTES } from '@/constants/routes';
import { spacing, shadows, radius } from '@/constants/tokens';
import { useColorScheme } from '@/core/hooks/useColorScheme';
import Colors from '@/constants/colors';

export default function ElectionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [election, setElection] = useState<any>(null);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

  useEffect(() => {
    (async () => {
      try {
        const allElections = await mockApi.getElections();
        const e = allElections.find((el) => el.id === id);
        setElection(e);
        if (e) {
          const c = await mockApi.getCandidates(e.id);
          setCandidates(c);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <ScreenView>
        <ThemedText variant="body" color="textSecondary" style={{ textAlign: 'center', marginTop: spacing.xxl }}>
          Loading...
        </ThemedText>
      </ScreenView>
    );
  }

  if (!election) {
    return (
      <ScreenView>
        <EmptyState icon="alert-circle-outline" title="Not Found" subtitle="Election not found" />
      </ScreenView>
    );
  }

  return (
    <ScreenView scrollable keyboardShouldPersistTaps="handled">
      <View style={{ paddingBottom: spacing.xxl }}>
        <Card style={[styles.headerCard, shadows.lg, { backgroundColor: colors.primary }]}>
          <ThemedText variant="xxl" style={{ color: '#fff', fontWeight: '700', marginBottom: spacing.xs }}>
            {election.position}
          </ThemedText>
          <ThemedText variant="body" style={{ color: 'rgba(255,255,255,0.9)' }}>
            {election.electoralArea}
          </ThemedText>
          <ThemedText variant="caption" style={{ color: 'rgba(255,255,255,0.7)', marginTop: spacing.sm }}>
            {election.electionDate} · {election.electoralAreaType}
          </ThemedText>
        </Card>

        <ThemedText variant="h3" style={{ marginHorizontal: 16, marginTop: spacing.lg, marginBottom: spacing.sm }}>
          Candidates ({candidates.length})
        </ThemedText>
        {candidates.length === 0 ? (
          <EmptyState icon="people-outline" title="No Candidates" subtitle="No candidates added yet" />
        ) : (
          candidates.map((c) => (
            <Card key={c.id} style={[shadows.sm]}>
              <View style={styles.row}>
                <View style={[styles.avatar, { backgroundColor: colors.primary + '20' }]}>
                  <Ionicons name="person" size={24} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <ThemedText variant="body" style={{ fontWeight: '600' }}>{c.fullName}</ThemedText>
                  <ThemedText variant="caption" color="textSecondary">
                    {c.partyName} ({c.partyAcronym})
                  </ThemedText>
                </View>
                <ThemedText variant="caption" color={c.status === 'ACTIVE' ? 'success' : 'textMuted'}>
                  {c.status}
                </ThemedText>
              </View>
            </Card>
          ))
        )}

        <View style={{ flexDirection: 'row', gap: spacing.md, marginHorizontal: 16, marginTop: spacing.lg }}>
          <Button
            label="Submit Result"
            onPress={() => router.push({ pathname: ROUTES.RESULT_SUBMIT, params: { electionId: id } } as any)}
            style={{ flex: 1 }}
          />
          <Button
            label="Report Incident"
            variant="outline"
            onPress={() => router.push({ pathname: ROUTES.INCIDENT_REPORT, params: { electionId: id } } as any)}
            style={{ flex: 1 }}
          />
        </View>
      </View>
    </ScreenView>
  );
}

const styles = StyleSheet.create({
  headerCard: { marginHorizontal: 16, marginVertical: 16, borderRadius: radius.lg },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
});
