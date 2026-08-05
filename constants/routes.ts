export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/(tabs)/index',
  ELECTIONS: '/(tabs)/elections',
  ELECTION_DETAIL: '/election-detail',
  RESULTS: '/(tabs)/results',
  RESULT_SUBMIT: '/result-submit',
  RESULT_COLLATION: '/result-collation',
  RESULT_SEARCH: '/result-search',
  RESULT_DRAFTS: '/result-drafts',
  INCIDENTS: '/(tabs)/incidents',
  INCIDENT_REPORT: '/incident-report',
  INCIDENT_SEARCH: '/incident-search',
  PROFILE: '/(tabs)/profile',
  LOCATIONS: '/locations',
  PARTIES: '/parties',
  PU_PICKER: '/pu-picker',
} as const;

export type RouteName = (typeof ROUTES)[keyof typeof ROUTES];
