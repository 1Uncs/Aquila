import { useQuery } from '@tanstack/react-query';
import { mockApi } from '@/features/elections/service';

export function useElectionCyclesQuery() {
  return useQuery({
    queryKey: ['elections', 'cycles'],
    queryFn: () => mockApi.getElectionCycles(),
  });
}

export function useElectionsQuery() {
  return useQuery({
    queryKey: ['elections', 'list'],
    queryFn: () => mockApi.getElections(),
  });
}

export function useElectionDetailQuery(electionId: string) {
  return useQuery({
    queryKey: ['elections', 'detail', electionId],
    queryFn: () => mockApi.getElections().then((all) => all.find((e) => e.id === electionId)),
    enabled: !!electionId,
  });
}

export function useCandidatesQuery(electionId: string) {
  return useQuery({
    queryKey: ['elections', 'candidates', electionId],
    queryFn: () => mockApi.getCandidates(electionId),
    enabled: !!electionId,
  });
}

export function useResultsQuery() {
  return useQuery({
    queryKey: ['results', 'list'],
    queryFn: () => mockApi.getResults(),
  });
}

export function useIncidentsQuery() {
  return useQuery({
    queryKey: ['incidents', 'list'],
    queryFn: () => mockApi.getIncidents(),
  });
}

export function useStatesQuery() {
  return useQuery({
    queryKey: ['locations', 'states'],
    queryFn: mockApi.getStates,
  });
}

export function useLgasQuery(stateId?: string) {
  return useQuery({
    queryKey: ['locations', 'lgas', stateId],
    queryFn: () => mockApi.getLgas(stateId),
  });
}

export function usePollingUnitsQuery(lgaId?: string) {
  return useQuery({
    queryKey: ['locations', 'pollingUnits', lgaId],
    queryFn: () => mockApi.getPollingUnits(lgaId),
  });
}

export function usePartiesQuery() {
  return useQuery({
    queryKey: ['parties', 'list'],
    queryFn: mockApi.getParties,
  });
}
