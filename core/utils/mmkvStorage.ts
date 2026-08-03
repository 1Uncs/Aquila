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

const asyncStorage = {
  getString: async (key: string) => (await AsyncStorage.getItem(key)) ?? undefined,
  set: async (key: string, value: string | number | boolean) =>
    AsyncStorage.setItem(key, String(value)),
  remove: async (key: string) => AsyncStorage.removeItem(key),
};

function createFallbackStorage() {
  return {
    getItem: (key: string) => asyncStorage.getString(key).then((v) => (v ?? null)),
    setItem: (key: string, value: string) => asyncStorage.set(key, value),
    removeItem: (key: string) => asyncStorage.remove(key),
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
  return createFallbackStorage() as any;
}
