import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors, Fonts } from '../constants/Colors';

interface MetricCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  accentColor?: string;
  iconName?: keyof typeof Feather.glyphMap;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subValue,
  accentColor = Colors.primary,
  iconName,
}) => {
  return (
    <View style={styles.card}>
      <View style={[styles.indicatorBar, { backgroundColor: accentColor }]} />
      <View style={styles.headerRow}>
        <Text style={styles.label}>{label}</Text>
        {iconName && <Feather name={iconName} size={14} color={Colors.textMuted} />}
      </View>
      <Text style={styles.value}>{value}</Text>
      {subValue && <Text style={styles.subValue}>{subValue}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.bgSurface,
    borderColor: Colors.borderSubtle,
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    position: 'relative',
    overflow: 'hidden',
    flex: 1,
    marginHorizontal: 4,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  indicatorBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: 10,
    fontFamily: Fonts.bold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 22,
    fontFamily: Fonts.extraBold,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  subValue: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: Colors.textMuted,
    marginTop: 4,
  },
});