import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

let mmkvInstance: { getString: (key: string) => string | undefined; set: (key: string, value: string | number | boolean) => void; remove: (key: string) => boolean } | null = null;
let mmkvAvailable = false;

try {
  if (Platform.OS !== 'web') {
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- dynamic require to avoid NitroModules crash in Expo Go; caught by try/catch below
    mmkvInstance = require('react-native-mmkv').createMMKV();
    mmkvAvailable = true;
  }
} catch {
  mmkvAvailable = false;
}

let secureStoreAvailable = false;
let secureStoreModule: { getItemAsync: (key: string) => Promise<string | null>; setItemAsync: (key: string, value: string) => Promise<void>; deleteItemAsync: (key: string) => Promise<void> } | null = null;

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports -- dynamic require to avoid NitroModules crash in Expo Go; caught by try/catch below
  secureStoreModule = require('expo-secure-store');
  secureStoreAvailable = true;
} catch {
  secureStoreAvailable = false;
}

const asyncStorage = {
  getString: async (key: string) => (await AsyncStorage.getItem(key)) ?? undefined,
  set: async (key: string, value: string | number | boolean) =>
    AsyncStorage.setItem(key, String(value)),
  remove: async (key: string) => AsyncStorage.removeItem(key),
};

const memoryStore = new Map<string, string>();

function createSecureStoreStorage() {
  if (!secureStoreAvailable || !secureStoreModule) return null;
  return {
    getItem: (key: string) => secureStoreModule!.getItemAsync(key).then((v) => (v ?? null)),
    setItem: (key: string, value: string) => secureStoreModule!.setItemAsync(key, value),
    removeItem: (key: string) => secureStoreModule!.deleteItemAsync(key),
  };
}

function createAsyncStorageStorage() {
  return {
    getItem: (key: string) => asyncStorage.getString(key).then((v) => (v ?? null)),
    setItem: (key: string, value: string) => asyncStorage.set(key, value),
    removeItem: (key: string) => asyncStorage.remove(key),
  };
}

function createMemoryStorage() {
  return {
    getItem: (key: string) => Promise.resolve(memoryStore.get(key) ?? null),
    setItem: (key: string, value: string) => Promise.resolve(memoryStore.set(key, value)),
    removeItem: (key: string) => Promise.resolve(memoryStore.delete(key)),
  };
}

export function createMMKVStorage() {
  if (mmkvAvailable && mmkvInstance) {
    const instance = mmkvInstance;
    return {
      getItem: (key: string) => Promise.resolve(instance.getString(key) ?? null),
      setItem: (_key: string, value: string) => Promise.resolve(instance.set(_key, value)),
      removeItem: (_key: string) => Promise.resolve(instance.remove(_key)),
    } as any;
  }

  const asyncStorageStorage = createAsyncStorageStorage();
  if (asyncStorageStorage) return asyncStorageStorage as any;

  const secureStoreStorage = createSecureStoreStorage();
  if (secureStoreStorage) return secureStoreStorage as any;

  return createMemoryStorage() as any;
}
