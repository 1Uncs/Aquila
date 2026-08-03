export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/(tabs)/index',
  ELECTIONS: '/(tabs)/elections',
  ELECTION_DETAIL: '/election-detail',
  ELECTION_NEW: '/election-new',
  CANDIDATES: '/election-candidates',
  RESULTS: '/(tabs)/results',
  RESULT_SUBMIT: '/result-submit',
  RESULT_COLLATION: '/result-collation',
  RESULT_SEARCH: '/result-search',
  INCIDENTS: '/(tabs)/incidents',
  INCIDENT_REPORT: '/incident-report',
  INCIDENT_SEARCH: '/incident-search',
  INCIDENT_DETAIL: '/incident-detail',
  PROFILE: '/(tabs)/profile',
  LOCATIONS: '/locations',
  PARTIES: '/parties',
  USERS: '/users',
} as const;

export type RouteName = (typeof ROUTES)[keyof typeof ROUTES];
