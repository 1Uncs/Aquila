import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColorScheme } from '@/core/hooks/useColorScheme';
import Colors from '@/constants/colors';
import { spacing, radius, border } from '@/constants/tokens';

type ToastMessage = {
  id: string;
  text: string;
  type: 'info' | 'error' | 'success';
};

type ToastContextValue = {
  showToast: (text: string, type?: 'info' | 'error' | 'success') => void;
};

export const ToastContext = React.createContext<ToastContextValue>({
  showToast: () => {},
});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

  const showToast = useCallback((text: string, type: 'info' | 'error' | 'success' = 'info') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <View style={styles.container} pointerEvents="box-none">
        {toasts.map((toast) => (
          <View
            key={toast.id}
            style={[
              styles.toast,
              { backgroundColor: colors.card, borderColor: colors.border },
              toast.type === 'error' && { borderColor: colors.error },
              toast.type === 'success' && { borderColor: colors.success },
            ]}
          >
            <Text style={[styles.text, { color: colors.text }]}>{toast.text}</Text>
          </View>
        ))}
      </View>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return React.useContext(ToastContext);
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    right: spacing.md,
    zIndex: 9999,
  },
  toast: {
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: border.thin,
    marginBottom: spacing.sm,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
  },
});
