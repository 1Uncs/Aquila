import React from 'react';
import { Text, View, StyleSheet } from 'react-native';

interface BadgeProps {
  label: string;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
}

export const Badge: React.FC<BadgeProps> = ({ label, variant = 'neutral' }) => {
  const getColors = () => {
    switch (variant) {
      case 'success':
        return { bg: '#DCFCE7', text: '#15803D', border: '#86EFAC' };
      case 'warning':
        return { bg: '#FEF3C7', text: '#B45309', border: '#FDE68A' };
      case 'danger':
        return { bg: '#FEE2E2', text: '#B91C1C', border: '#FCA5A5' };
      case 'info':
        return { bg: '#DBEAFE', text: '#1D4ED8', border: '#93C5FD' };
      default:
        return { bg: '#F1F5F9', text: '#475569', border: '#CBD5E1' };
    }
  };

  const styleColors = getColors();

  return (
    <View style={[styles.container, { backgroundColor: styleColors.bg, borderColor: styleColors.border }]}>
      <Text style={[styles.text, { color: styleColors.text }]}>{label.toUpperCase()}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});