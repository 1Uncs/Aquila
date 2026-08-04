import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { ScreenView } from '@/core/components/ScreenView';
import { ThemedText, Card, Button, EmptyState } from '@/core/components';
import { ROUTES } from '@/constants/routes';
import { spacing, shadows, radius, sizes, gradientPresets } from '@/constants/tokens';
import { useColorScheme } from '@/core/hooks/useColorScheme';
import { useElectionDetailQuery, useCandidatesQuery } from '@/features/elections/hooks';
import Colors from '@/constants/colors';

export default function ElectionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: election, isLoading: electionLoading } = useElectionDetailQuery(id);
  const { data: candidates = [], isLoading: candidatesLoading } = useCandidatesQuery(id);
  const [loading, setLoading] = useState(true);
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

  useEffect(() => {
    if (!electionLoading && !candidatesLoading) {
      setLoading(false);
    }
  }, [electionLoading, candidatesLoading]);

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
        <LinearGradient
          colors={gradientPresets.election}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.headerCard, shadows.lg]}
        >
          <ThemedText variant="xxl" style={{ color: '#fff', fontWeight: '700', marginBottom: spacing.xs }}>
            {election.position}
          </ThemedText>
          <ThemedText variant="body" style={{ color: 'rgba(255,255,255,0.95)' }}>
            {election.electoralArea}
          </ThemedText>
          <ThemedText variant="caption" style={{ color: 'rgba(255,255,255,0.7)', marginTop: spacing.sm }}>
            {election.electionDate} · {election.electoralAreaType}
          </ThemedText>
        </LinearGradient>

        <ThemedText variant="h3" style={{ marginHorizontal: 16, marginTop: spacing.lg, marginBottom: spacing.sm }}>
          Candidates ({candidates.length})
        </ThemedText>
        {candidates.length === 0 ? (
          <EmptyState icon="people-outline" title="No Candidates" subtitle="No candidates added yet" />
        ) : (
          candidates.map((c) => (
            <Card key={c.id} style={shadows.sm}>
              <View style={styles.row}>
                <View style={[styles.avatar, { backgroundColor: colors.accent }]}>
                  <Ionicons name="person" size={24} color="#fff" />
                </View>
                <View style={{ flex: 1 }}>
                  <ThemedText variant="body" style={{ fontWeight: '600' }}>{c.fullName}</ThemedText>
                  <ThemedText variant="caption" color="textSecondary">
                    {c.partyName} ({c.partyAcronym})
                  </ThemedText>
                </View>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: c.status === 'ACTIVE' ? colors.success + '20' : colors.border }
                ]}>
                  <ThemedText variant="caption" style={{ color: c.status === 'ACTIVE' ? colors.success : colors.textMuted, fontWeight: '600' }}>
                    {c.status}
                  </ThemedText>
                </View>
              </View>
            </Card>
          ))
        )}

        <View style={{ flexDirection: 'row', gap: spacing.md, marginHorizontal: spacing.md, marginTop: spacing.lg }}>
          <Button label="Submit Result" onPress={() => router.push({ pathname: ROUTES.RESULT_SUBMIT, params: { electionId: id } })} fullWidth />
          <Button label="Report Incident" variant="outline" onPress={() => router.push({ pathname: ROUTES.INCIDENT_REPORT, params: { electionId: id } })} fullWidth />
        </View>
      </View>
    </ScreenView>
  );
}

const styles = StyleSheet.create({
  headerCard: { marginHorizontal: spacing.md, marginVertical: spacing.md, borderRadius: radius.lg, padding: spacing.lg },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: { width: sizes.icon, height: sizes.icon, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center' },
  statusBadge: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.sm },
});
