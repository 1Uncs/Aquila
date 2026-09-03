import { useEffect } from 'react';
import { AppState } from 'react-native';
import { useColorScheme as _useRNColorScheme } from 'react-native';
import { setStatusBarStyle, setStatusBarHidden } from 'expo-status-bar';

type StatusBarConfig = {
  barStyle?: 'light' | 'dark' | 'auto';
  hidden?: boolean;
};

export function useStatusBar(config: StatusBarConfig) {
  const { barStyle = 'auto', hidden = false } = config;
  const scheme = _useRNColorScheme() ?? 'light';
  useEffect(() => {
    const resolvedStyle = barStyle === 'auto' ? (scheme === 'dark' ? 'light' : 'dark') : barStyle;
    setStatusBarStyle(resolvedStyle);
    setStatusBarHidden(hidden);

    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        setStatusBarStyle(resolvedStyle);
        setStatusBarHidden(hidden);
      }
    });

    return () => {
      subscription.remove();
    };
  }, [barStyle, hidden, scheme]);
}
