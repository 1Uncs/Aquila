import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = '@aquila/auth_token';

export async function setTokenAsync(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function getTokenAsync(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function deleteTokenAsync(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}
