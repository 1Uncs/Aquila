import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ScreenView } from '@/core/components/ScreenView';
import { ThemedText, Card } from '@/core/components';
import { Ionicons } from '@expo/vector-icons';
import { spacing, shadows } from '@/constants/tokens';

type RoleDef = {
  role: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
};

const ROLES: RoleDef[] = [
  { role: 'SUPER_ADMIN', label: 'Super Administrator', icon: 'shield-checkmark', color: '#D50000' },
  { role: 'ADMIN', label: 'Administrator', icon: 'settings-outline', color: '#1565C0' },
  { role: 'ELECTION_OFFICER', label: 'Election Officer', icon: 'eye-outline', color: '#2E7D32' },
  { role: 'POLLING_AGENT', label: 'Polling Unit Agent', icon: 'send-outline', color: '#ED6C02' },
  { role: 'FIELD_AGENT', label: 'Field Agent', icon: 'walk-outline', color: '#6A1B9A' },
];

export default function UsersScreen() {
  return (
    <ScreenView scrollable keyboardShouldPersistTaps="handled">
      <View style={{ paddingBottom: spacing.xxl }}>
        <ThemedText variant="h2" style={{ marginHorizontal: 16, marginTop: spacing.md, marginBottom: spacing.sm }}>
          User Roles
        </ThemedText>
        <ThemedText variant="body" color="textSecondary" style={{ marginHorizontal: 16, marginBottom: spacing.lg }}>
          Aquila role definitions and permissions
        </ThemedText>

        {ROLES.map(({ role, label, icon, color }) => (
          <Card key={role} style={shadows.sm}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
              <View style={[styles.roleIcon, { backgroundColor: color + '20' }]}>
                <Ionicons name={icon} size={24} color={color} />
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText variant="body" style={{ fontWeight: '600' }}>{label}</ThemedText>
                <ThemedText variant="caption" color="textSecondary" style={{ marginTop: 4 }}>
                  {role}
                </ThemedText>
              </View>
            </View>
          </Card>
        ))}
      </View>
    </ScreenView>
  );
}

const styles = StyleSheet.create({
  roleIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
