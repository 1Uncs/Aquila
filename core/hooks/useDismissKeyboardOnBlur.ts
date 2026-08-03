import { useCallback } from 'react';
import { Keyboard } from 'react-native';
import { useFocusEffect } from 'expo-router';

export function useDismissKeyboardOnBlur() {
  useFocusEffect(
    useCallback(() => {
      return () => Keyboard.dismiss();
    }, [])
  );
}
