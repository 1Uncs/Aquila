export const STORAGE_KEYS = {
  AUTH_TOKEN: '@aquila/auth_token',
  USER: '@aquila/user',
  ONBOARDED: '@aquila/onboarded',
  ELECTIONS_CACHE: '@aquila/elections_cache',
  RESULTS_CACHE: '@aquila/results_cache',
  INCIDENTS_CACHE: '@aquila/incidents_cache',
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
