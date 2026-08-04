import React from 'react';
import { StyleSheet, View, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ScreenView } from '@/core/components/ScreenView';
import { ThemedText, Card, Button } from '@/core/components';
import { useAuthStore } from '@/features/auth/store';
import { ROUTES } from '@/constants/routes';
import { spacing, radius, shadows, sizes, gradientPresets, border } from '@/constants/tokens';
import { useColorScheme } from '@/core/hooks/useColorScheme';
import { useElectionsQuery } from '@/features/elections/hooks';
import Colors from '@/constants/colors';
import { UserRole } from '@/types';

export default function ProfileTabScreen() {
  const { user, logout } = useAuthStore();
  const { data: elections = [] } = useElectionsQuery();
  const electionCount = elections.length;
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

  const roleLabels: Record<UserRole, string> = {
    SUPER_ADMIN: 'Super Administrator',
    ADMIN: 'Administrator',
    ELECTION_OFFICER: 'Election Officer',
    POLLING_AGENT: 'Polling Unit Agent',
    FIELD_AGENT: 'Field Agent',
  };

  const menuItems = [
    { label: 'Locations', icon: '📍', route: ROUTES.LOCATIONS },
    { label: 'Political Parties', icon: '👥', route: ROUTES.PARTIES },
    { label: 'Users', icon: '👤', route: ROUTES.USERS },
  ];

  return (
    <ScreenView scrollable keyboardShouldPersistTaps="handled">
      <View style={{ paddingBottom: spacing.xxl }}>
        <LinearGradient colors={[...gradientPresets.primary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
          <View style={[styles.avatar, shadows.lg]}>
            <LinearGradient colors={['rgba(255,255,255,0.25)', 'rgba(255,255,255,0.15)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.avatarBg}>
              <ThemedText variant="xxl" style={{ color: '#fff', fontWeight: '700' }}>
                {user?.name?.charAt(0)?.toUpperCase() ?? 'U'}
              </ThemedText>
            </LinearGradient>
          </View>
          <ThemedText variant="lg" style={{ color: '#fff', marginTop: spacing.sm, fontWeight: '700' }}>
            {user?.name ?? 'User'}
          </ThemedText>
          <ThemedText variant="caption" style={{ color: 'rgba(255,255,255,0.8)' }}>
            {user?.role ? roleLabels[user.role] : 'User'}
          </ThemedText>
          <ThemedText variant="caption" style={{ color: 'rgba(255,255,255,0.6)' }}>
            {user?.email}
          </ThemedText>
        </LinearGradient>

         <ThemedText variant="h3" style={{ marginHorizontal: spacing.md, marginTop: spacing.lg, marginBottom: spacing.sm }}>
           Management
         </ThemedText>
        {menuItems.map((item) => (
          <Card key={item.label} pressable onPress={() => router.push(item.route)} style={styles.menuItem}>
            <View style={styles.menuItemRow}>
              <ThemedText variant="body">{item.icon} {item.label}</ThemedText>
              <ThemedText variant="caption" color="textMuted">›</ThemedText>
            </View>
          </Card>
        ))}

         <ThemedText variant="h3" style={{ marginHorizontal: spacing.md, marginTop: spacing.lg, marginBottom: spacing.sm }}>
           Account
         </ThemedText>
        <Card style={[shadows.md]}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <ThemedText variant="xxl" style={{ fontWeight: '700', color: colors.primary }}>{electionCount}</ThemedText>
              <ThemedText variant="caption" color="textSecondary">Elections Configured</ThemedText>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <ThemedText variant="body" style={{ fontWeight: '600' }}>{user?.role ? roleLabels[user.role] : '—'}</ThemedText>
              <ThemedText variant="caption" color="textSecondary">Role</ThemedText>
            </View>
          </View>
        </Card>

        <Button label="Sign Out" variant="outline" onPress={() =>
          Alert.alert('Sign out', 'Are you sure you want to sign out?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Sign Out', style: 'destructive', onPress: logout },
          ])
        } style={{ marginHorizontal: spacing.md, marginTop: spacing.xl }} fullWidth />
      </View>
    </ScreenView>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  avatar: {
    width: sizes.avatar,
    height: sizes.avatar,
    borderRadius: sizes.avatar / 2,
    overflow: 'hidden',
  },
  avatarBg: {
    width: '100%',
    height: '100%',
    borderRadius: sizes.avatar / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItem: { marginHorizontal: spacing.md, marginVertical: spacing.xs },
  menuItemRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statsRow: { flexDirection: 'row', alignItems: 'center' },
  statItem: { flex: 1, paddingVertical: spacing.sm },
  statDivider: { width: border.thin, height: 40, marginHorizontal: spacing.md },
});
