import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { ScreenView } from '@/core/components/ScreenView';
import { ThemedText, Card, EmptyState, Button, ScreenHeader } from '@/core/components';
import { ROUTES } from '@/constants/routes';
import { spacing, shadows, radius, border } from '@/constants/tokens';
import { useColorScheme } from '@/core/hooks/useColorScheme';
import { useStatusBar } from '@/core/hooks/useStatusBar';
import { useElectionDetailQuery, useCandidatesQuery } from '@/features/elections/hooks';
import Colors from '@/constants/colors';
import { useForegroundRefresh } from '@/core/hooks';
import * as Haptics from 'expo-haptics';

export default function ElectionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: election, isLoading: electionLoading } = useElectionDetailQuery(id);
  const { data: candidates = [], isLoading: candidatesLoading } = useCandidatesQuery(id);
  const [loading, setLoading] = useState(true);
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  useStatusBar({ barStyle: scheme === 'dark' ? 'light' : 'dark' });
  useForegroundRefresh([['elections', 'detail', id], ['elections', 'candidates', id]], 5 * 60 * 1000);

  useEffect(() => {
    if (!electionLoading && !candidatesLoading) {
      setLoading(false);
    }
  }, [electionLoading, candidatesLoading]);

  if (loading && !election) {
    return (
      <ScreenView scrollable={false}>
        <View style={styles.centerContainer}>
          <ThemedText variant="body" color="textSecondary">Loading contest details...</ThemedText>
        </View>
      </ScreenView>
    );
  }

  if (!election) {
    return (
      <ScreenView scrollable={false}>
        <EmptyState
          icon="alert-circle-outline"
          title="Election Not Found"
          subtitle="The requested election contest could not be found."
          actionLabel="Back"
          onAction={() => router.back()}
        />
      </ScreenView>
    );
  }

  return (
    <ScreenView
      scrollable={false}
      noScrollPadding
      header={
        <ScreenHeader
          title="Election Details"
          subtitle={election.position}
          showBack
        />
      }
    >
      <View style={styles.container}>
        <FlatList
          data={candidates}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={{ height: spacing.xs }} />}
          ListHeaderComponent={
            <View style={{ marginBottom: spacing.sm }}>
              <LinearGradient
                colors={['#0D6338', '#0A4A2A']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.headerCard, shadows.md]}
              >
                <ThemedText variant="label" color="#A3E6C2" fontFamily="bold">
                  ELECTORAL CONTEST
                </ThemedText>
                <ThemedText variant="h2" color="#FFFFFF" fontFamily="bold" style={{ marginTop: 2 }}>
                  {election.position}
                </ThemedText>
                <ThemedText variant="caption" color="#D1FAE5" style={{ marginTop: 2 }}>
                  {election.electoralArea} · {election.electoralAreaType}
                </ThemedText>
                <View style={styles.dateTag}>
                  <ThemedText variant="label" color="#FFFFFF" fontFamily="bold">
                    Election Date: {election.electionDate} · Status: {election.status}
                  </ThemedText>
                </View>
              </LinearGradient>

              <View style={styles.candidatesHeaderRow}>
                <ThemedText variant="title" color="text" fontFamily="bold">
                  Contesting Candidates ({candidates.length})
                </ThemedText>
              </View>
            </View>
          }
          renderItem={({ item: c, index }) => (
            <Card style={styles.candCard}>
              <View style={styles.candRow}>
                <View style={[styles.avatarBox, { backgroundColor: colors.primary + '18' }]}>
                  <ThemedText variant="title" color="primary" fontFamily="bold">
                    #{index + 1}
                  </ThemedText>
                </View>
                <View style={{ flex: 1, marginLeft: spacing.sm }}>
                  <ThemedText variant="body" color="text" fontFamily="bold">
                    {c.fullName}
                  </ThemedText>
                  <ThemedText variant="caption" color="textSecondary">
                    {c.partyName} ({c.partyAcronym})
                  </ThemedText>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: colors.successSubtle }]}>
                  <ThemedText variant="label" color="success" fontFamily="bold">
                    {c.status}
                  </ThemedText>
                </View>
              </View>
            </Card>
          )}
          ListFooterComponent={
            <View style={styles.footerActions}>
              <Button
                label="Submit Result for Contest"
                variant="primary"
                leftIcon="add-circle-outline"
                onPress={() => router.push({ pathname: ROUTES.RESULT_SUBMIT, params: { electionId: id } })}
              />
              <Button
                label="Report Incident in Jurisdiction"
                variant="outline"
                leftIcon="warning-outline"
                onPress={() => router.push({ pathname: ROUTES.INCIDENT_REPORT, params: { electionId: id } })}
              />
            </View>
          }
        />
      </View>
    </ScreenView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl,
  },
  headerCard: {
    padding: spacing.md,
    borderRadius: radius.lg,
  },
  dateTag: {
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.15)',
  },
  candidatesHeaderRow: {
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  candCard: {
    padding: spacing.sm,
    borderRadius: radius.md,
    ...shadows.sm,
  },
  candRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarBox: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  footerActions: {
    gap: spacing.sm,
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
});
