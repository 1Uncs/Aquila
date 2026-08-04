import { enableScreens } from 'react-native-screens';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Platform } from 'react-native';
import { InteractionManager } from 'react-native';
import { Stack, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/core/utils/queryClient';
import { AuthProvider, useAuthStore, useElectionsStore, useResultsStore, useIncidentsStore, useLocationsStore } from '@/features/auth/store';
import { ToastProvider } from '@/core/components/ToastProvider';
import { RootErrorBoundary } from '@/core/components/ErrorBoundary';
import { mockApi } from '@/features/elections/service';
import { ResultSubmission } from '@/features/auth/store';

enableScreens();

export const unstable_settings = {
  initialRouteName: 'login',
};

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <ToastProvider>
              <RootErrorBoundary>
                <RootLayoutNav />
              </RootErrorBoundary>
            </ToastProvider>
          </AuthProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function RootLayoutNav() {
  useEffect(() => {
    const handler = (event: { reason: unknown }) => {
      const reason = event.reason;
      const error = reason instanceof Error ? reason : new Error(String(reason));
      console.error('[UnhandledRejection]', error);
    };
    if (typeof globalThis !== 'undefined' && 'addEventListener' in globalThis) {
      (globalThis as unknown as { addEventListener: (type: string, fn: (e: { reason: unknown }) => void) => void }).addEventListener('unhandledrejection', handler);
    }
    return () => {
      if (typeof globalThis !== 'undefined' && 'removeEventListener' in globalThis) {
        (globalThis as unknown as { removeEventListener: (type: string, fn: (e: { reason: unknown }) => void) => void }).removeEventListener('unhandledrejection', handler);
      }
    };
  }, []);
  const router = useRouter();
  const segments = useSegments();
  const navigationState = useRootNavigationState();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [isNavigationReady, setIsNavigationReady] = useState(false);
  const lastTargetRef = useRef<string | null>(null);
  const seededRef = useRef(false);

  useEffect(() => {
    if (navigationState?.key) {
      setIsNavigationReady(true);
    }
  }, [navigationState?.key]);

  useEffect(() => {
    if (!isNavigationReady || !isAuthenticated || seededRef.current) return;
    seededRef.current = true;
    (async () => {
      const [cycles, elections, results, incidents, states, lgas, pus, parties, candidates] = await Promise.all([
        mockApi.getElectionCycles(),
        mockApi.getElections(),
        mockApi.getResults(),
        mockApi.getIncidents(),
        mockApi.getStates(),
        mockApi.getLgas(),
        mockApi.getPollingUnits(),
        mockApi.getParties(),
        mockApi.getCandidates('e1'),
      ]);
      useElectionsStore.getState().setCycles(cycles);
      useElectionsStore.getState().setElections(elections);
      useResultsStore.getState().setSubmissions(results);
      useIncidentsStore.getState().setIncidents(incidents);
      useLocationsStore.getState().setStates(states);
      useLocationsStore.getState().setLgas(lgas);
      useLocationsStore.getState().setPollingUnits(pus);
      queryClient.setQueryData(['elections', 'cycles'], cycles);
      queryClient.setQueryData(['elections', 'list'], elections);
      queryClient.setQueryData(['results', 'list'], results);
      queryClient.setQueryData(['incidents', 'list'], incidents);
      queryClient.setQueryData(['locations', 'states'], states);
      queryClient.setQueryData(['locations', 'lgas', undefined], lgas.slice(0, 20));
      queryClient.setQueryData(['locations', 'pollingUnits', undefined], pus.slice(0, 15));
      queryClient.setQueryData(['parties', 'list'], parties);
      queryClient.setQueryData(['elections', 'candidates', 'e1'], candidates);
      const extraResults: import('@/features/auth/store').ResultSubmission[] = [
        {
          id: 'r-search-1',
          electionId: 'e1',
          pollingUnitId: pus[2]?.id ?? 'pu-search-1',
          pollingUnitName: pus[2]?.name ?? 'PU Search Demo 1',
          candidateVotes: { cand1: 150, cand2: 200, cand3: 80, cand4: 30 },
          candidateVotesInec: { cand1: 148, cand2: 202, cand3: 79, cand4: 31 },
          rejectedVotes: 6,
          rejectedVotesInec: 6,
          totalAccreditedVoters: 480,
          totalVotesCast: 460,
          status: 'PUBLISHED',
          latitude: 6.55,
          longitude: 3.38,
          submittedAt: '2027-02-25T15:30:00Z',
          submittedBy: 'u-demo',
        },
        {
          id: 'r-search-2',
          electionId: 'e1',
          pollingUnitId: pus[3]?.id ?? 'pu-search-2',
          pollingUnitName: pus[3]?.name ?? 'PU Search Demo 2',
          candidateVotes: { cand1: 90, cand2: 110, cand3: 50, cand4: 20 },
          candidateVotesInec: { cand1: 91, cand2: 109, cand3: 51, cand4: 19 },
          rejectedVotes: 3,
          rejectedVotesInec: 3,
          totalAccreditedVoters: 280,
          totalVotesCast: 273,
          status: 'PUBLISHED',
          latitude: 6.58,
          longitude: 3.4,
          submittedAt: '2027-02-25T16:00:00Z',
          submittedBy: 'u-demo',
        },
      ];
      const allResults = [...results, ...extraResults];
      useResultsStore.getState().setSubmissions(allResults);
      queryClient.setQueryData(['results', 'list'], allResults);
      const extraIncidents: import('@/features/auth/store').IncidentReport[] = [
        {
          id: 'i-search-1',
          electionId: 'e1',
          electoralArea: 'Victoria Island',
          category: 'VOTE_BUYING',
          severity: 'MEDIUM',
          status: 'UNDER_REVIEW',
          description: 'Suspected vote buying near Victoria Island PU',
          latitude: 6.428,
          longitude: 3.421,
          mediaUrls: [],
          reportedBy: 'u-demo',
          reportedAt: '2027-02-25T13:00:00Z',
        },
        {
          id: 'i-search-2',
          electionId: 'e1',
          electoralArea: 'Lekki',
          category: 'BVAS_FAILURE',
          severity: 'HIGH',
          status: 'RESOLVED',
          description: 'BVAS device malfunction at 2 polling units in Lekki',
          latitude: 6.445,
          longitude: 3.45,
          mediaUrls: [],
          reportedBy: 'u-demo',
          reportedAt: '2027-02-25T11:00:00Z',
        },
        {
          id: 'i-search-3',
          electionId: 'e1',
          electoralArea: 'Ikeja',
          category: 'PROTEST',
          severity: 'LOW',
          status: 'SUBMITTED',
          description: 'Minor protest outside PU gate, resolved quickly',
          latitude: 6.605,
          longitude: 3.35,
          mediaUrls: [],
          reportedBy: 'u-demo',
          reportedAt: '2027-02-25T09:30:00Z',
        },
      ];
      const allIncidents = [...incidents, ...extraIncidents];
      useIncidentsStore.getState().setIncidents(allIncidents);
      queryClient.setQueryData(['incidents', 'list'], allIncidents);
      const demoDrafts: ResultSubmission[] = [
        {
          id: 'draft-demo-1',
          electionId: 'e1',
          pollingUnitId: pus[0]?.id ?? 'pu-unknown',
          pollingUnitName: pus[0]?.name ?? 'Unknown PU',
          candidateVotes: { cand1: 120, cand2: 95, cand3: 60 },
          candidateVotesInec: {},
          rejectedVotes: 5,
          rejectedVotesInec: 0,
          totalAccreditedVoters: 300,
          totalVotesCast: 275,
          status: 'DRAFT',
          submittedAt: new Date().toISOString(),
          submittedBy: 'current-user',
        },
        {
          id: 'draft-demo-2',
          electionId: 'e1',
          pollingUnitId: pus[1]?.id ?? 'pu-unknown',
          pollingUnitName: pus[1]?.name ?? 'Unknown PU',
          candidateVotes: { cand1: 0, cand2: 0, cand3: 0 },
          candidateVotesInec: {},
          rejectedVotes: 0,
          rejectedVotesInec: 0,
          totalAccreditedVoters: 0,
          totalVotesCast: 0,
          status: 'DRAFT',
          submittedAt: new Date(Date.now() - 86400000).toISOString(),
          submittedBy: 'current-user',
        },
      ];
      useResultsStore.getState().setSubmissions([...results, ...demoDrafts]);
    })();
  }, [isNavigationReady, isAuthenticated]);

  useEffect(() => {
    if (!isNavigationReady) return;
    const target = !isAuthenticated
      ? '/(auth)/login'
      : isAuthenticated && segments[0] === '(auth)'
        ? '/(tabs)'
        : null;
    if (!target || lastTargetRef.current === target) return;
    lastTargetRef.current = target;
    const task = InteractionManager.runAfterInteractions(() => {
      const inAuthGroup = segments[0] === '(auth)';
      if (!isAuthenticated && !inAuthGroup) {
        router.replace('/(auth)/login' as any);
      } else if (isAuthenticated && inAuthGroup) {
        router.replace('/(tabs)' as any);
      }
    });
    return () => task.cancel();
  }, [segments, isNavigationReady, isAuthenticated, router]);

  return (
    <Stack>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="election-detail" options={pushOptions('Election Details')} />
      <Stack.Screen name="result-submit" options={pushOptions('Submit Result')} />
      <Stack.Screen name="result-collation" options={pushOptions('Result Collation')} />
      <Stack.Screen name="result-search" options={pushOptions('Search Results')} />
      <Stack.Screen name="incident-report" options={pushOptions('Report Incident')} />
      <Stack.Screen name="incident-search" options={pushOptions('Search Incidents')} />
      <Stack.Screen name="result-drafts" options={pushOptions('Drafts')} />
      <Stack.Screen name="pu-picker" options={pushOptions('Select Polling Unit')} />
      <Stack.Screen name="locations" options={pushOptions('Locations')} />
      <Stack.Screen name="parties" options={pushOptions('Political Parties')} />
      <Stack.Screen name="users" options={pushOptions('User Management')} />
    </Stack>
  );
}

function pushOptions(title: string) {
  return {
    headerShown: true,
    title,
    headerBackTitle: 'Back',
    ...(Platform.OS === 'ios'
      ? {
          headerTransparent: true,
          headerShadowVisible: false,
          headerBackButtonDisplayMode: 'minimal' as const,
        }
      : {}),
  };
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
