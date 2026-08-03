import { useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { Keyboard } from 'react-native';

export function useDismissKeyboardOnBlur() {
  const dismiss = useCallback(() => {
    Keyboard.dismiss();
  }, []);

  useFocusEffect(dismiss);
}
