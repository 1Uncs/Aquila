export const ROUTES = {
  LOGIN: '/(auth)/login',
  DASHBOARD: '/(app)/(tabs)/index',
  ELECTIONS: '/(app)/(tabs)/elections',
  ELECTION_DETAIL: '/(app)/election-detail',
  RESULTS: '/(app)/(tabs)/results',
  RESULT_SUBMIT: '/(app)/result-submit',
  RESULT_COLLATION: '/(app)/result-collation',
  RESULT_SEARCH: '/(app)/result-search',
  RESULT_DRAFTS: '/(app)/result-drafts',
  INCIDENTS: '/(app)/(tabs)/incidents',
  INCIDENT_REPORT: '/(app)/incident-report',
  INCIDENT_SEARCH: '/(app)/incident-search',
  PROFILE: '/(app)/(tabs)/profile',
  LOCATIONS: '/(app)/locations',
  PARTIES: '/(app)/parties',
  PU_PICKER: '/(app)/pu-picker',
} as const;

export type RouteName = (typeof ROUTES)[keyof typeof ROUTES];
