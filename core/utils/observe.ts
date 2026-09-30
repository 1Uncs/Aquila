import React from 'react';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import type { ObserveConfig, ObserveModule } from 'expo-observe';

export const isExpoGo =
  Constants.appOwnership === 'expo' ||
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

let observeModule: typeof import('expo-observe') | null = null;

if (!isExpoGo) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- dynamic require to avoid missing native module crash in Expo Go
    observeModule = require('expo-observe');
  } catch {
    observeModule = null;
  }
}

export const isObserveEnabled = !!observeModule;

const NativeObserveRoot = observeModule?.ObserveRoot;

const FallbackObserveRoot = ({ children }: { children: React.ReactNode }) =>
  React.createElement(React.Fragment, null, children);

FallbackObserveRoot.wrap = function wrap<P extends Record<string, unknown>>(
  Component: React.ComponentType<P>
): React.ComponentType<P> {
  const Wrapped = (props: P) => React.createElement(Component, props);
  Wrapped.displayName = `ObserveRoot(${Component.displayName || Component.name || 'Component'})`;
  return Wrapped;
};

/**
 * Root wrapper measuring Time to First Render (TTR).
 * Transparent passthrough in Expo Go.
 */
export const ObserveRoot: typeof import('expo-observe').ObserveRoot =
  (NativeObserveRoot as typeof import('expo-observe').ObserveRoot) ??
  FallbackObserveRoot;

/**
 * Configure EAS Observe at module scope.
 * Safe no-op in Expo Go.
 */
export function configureObserve(config?: ObserveConfig): void {
  if (observeModule?.Observe) {
    try {
      observeModule.Observe.configure(
        config ?? {
          integrations: {
            'expo-router': {
              filteredParams: ['token', 'password', 'email', 'code', 'userId', 'nin', 'phone'],
            },
          },
        }
      );
    } catch {
      // safe fallback
    }
  }
}

/**
 * Report a handled error to EAS Observe.
 * Safe no-op in Expo Go.
 */
export function reportObserveError(error: unknown): void {
  if (observeModule?.Observe) {
    try {
      observeModule.Observe.reportError(error);
    } catch {
      // Never throw from reportObserveError
    }
  }
}

const noopMarkInteractive = () => {};
const noopObserveResult = { markInteractive: noopMarkInteractive };
const nativeUseObserve = observeModule?.useObserve;
const useNativeObserveHook = nativeUseObserve ?? (() => noopObserveResult);

/**
 * Hook to mark screen interactive time.
 * Resolves to no-op in Expo Go.
 */
export function useObserve(): { markInteractive: () => void } {
  return useNativeObserveHook();
}

export const Observe: Pick<ObserveModule, 'configure' | 'reportError'> = {
  configure: configureObserve as unknown as ObserveModule['configure'],
  reportError: reportObserveError,
};
