import React from 'react';
import { View, StyleSheet } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { ScreenView } from '@/core/components/ScreenView';
import { ThemedText, FlashListItem } from '@/core/components';
import { Ionicons } from '@expo/vector-icons';
import { spacing, radius, sizes, border } from '@/constants/tokens';

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
    <ScreenView scrollable keyboardShouldPersistTaps="handled" skipAndroidTopPadding>
      <FlashList
        data={ROLES}
        keyExtractor={(item) => item.role}
        ListHeaderComponent={
          <View>
            <ThemedText variant="h2" style={{ marginBottom: spacing.sm }}>
              User Roles
            </ThemedText>
            <ThemedText variant="body" color="textSecondary" style={{ marginBottom: spacing.lg }}>
              Aquila role definitions and permissions
            </ThemedText>
          </View>
        }
        renderItem={({ item: { role, label, icon, color } }) => (
          <FlashListItem id={role}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
              <View style={[styles.roleIcon, { backgroundColor: color + '20' }]}>
                <Ionicons name={icon} size={24} color={color} />
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText variant="body" style={{ fontWeight: '600' }}>{label}</ThemedText>
                <ThemedText variant="caption" color="textSecondary" style={{ marginTop: spacing.xs }}>
                  {role}
                </ThemedText>
              </View>
              <View style={[styles.roleBadge, { backgroundColor: color + '20', borderColor: color + '40' }]}>
                <ThemedText variant="caption" style={{ color, fontWeight: '600' }}>
                  {role.split('_')[0]}
                </ThemedText>
              </View>
            </View>
          </FlashListItem>
        )}
        contentContainerStyle={{ paddingHorizontal: spacing.md, paddingBottom: spacing.xxl }}
      />
    </ScreenView>
  );
}

const styles = StyleSheet.create({
  roleIcon: {
    width: sizes.icon,
    height: sizes.icon,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    borderWidth: border.thin,
  },
});
