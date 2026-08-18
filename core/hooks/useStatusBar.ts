import { useEffect } from 'react';
import { Platform } from 'react-native';
import { AppState } from 'react-native';
import { useColorScheme as _useRNColorScheme } from 'react-native';
import { setStatusBarStyle, setStatusBarHidden, setStatusBarTranslucent } from 'expo-status-bar';

type StatusBarConfig = {
  barStyle?: 'light' | 'dark' | 'auto';
  hidden?: boolean;
  translucent?: boolean;
};

export function useStatusBar(config: StatusBarConfig) {
  const { barStyle = 'auto', hidden = false, translucent = false } = config;
  const scheme = _useRNColorScheme() ?? 'light';
  useEffect(() => {
    const resolvedStyle = barStyle === 'auto' ? (scheme === 'dark' ? 'light' : 'dark') : barStyle;
    setStatusBarStyle(resolvedStyle);
    setStatusBarHidden(hidden);
    if (Platform.OS === 'android') {
      setStatusBarTranslucent(translucent);
    }

    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        setStatusBarStyle(resolvedStyle);
        setStatusBarHidden(hidden);
        if (Platform.OS === 'android') {
          setStatusBarTranslucent(translucent);
        }
      }
    });

    return () => {
      subscription.remove();
    };
  }, [barStyle, hidden, translucent, scheme]);
}
