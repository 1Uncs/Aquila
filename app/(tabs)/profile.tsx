import React, { useEffect, useState } from 'react';
import { StyleSheet, Pressable, PressableStateCallbackType, View } from 'react-native';
import { ScreenView } from '@/core/components/ScreenView';
import { useDismissKeyboardOnBlur } from '@/core/hooks';
import { ThemedText, Card, Button } from '@/core/components';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/features/auth/store';
import { mockApi } from '@/features/elections/service';
import { ROUTES } from '@/constants/routes';
import { router } from 'expo-router';
import { spacing, radius } from '@/constants/tokens';
import { useColorScheme } from '@/core/hooks/useColorScheme';
import Colors from '@/constants/colors';
import { UserRole } from '@/types';

export default function ProfileTabScreen() {
  const { user, logout } = useAuthStore();
  const [electionCount, setElectionCount] = useState(0);
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

  useEffect(() => {
    mockApi.getElections().then((e) => setElectionCount(e.length));
  }, []);

  const roleLabels: Record<UserRole, string> = {
    SUPER_ADMIN: 'Super Administrator',
    ADMIN: 'Administrator',
    ELECTION_OFFICER: 'Election Officer',
    POLLING_AGENT: 'Polling Unit Agent',
    FIELD_AGENT: 'Field Agent',
  };

  const menuItems = [
    { label: 'Locations', icon: 'location-outline', route: ROUTES.LOCATIONS },
    { label: 'Political Parties', icon: 'people-outline', route: ROUTES.PARTIES },
    { label: 'Users', icon: 'person-add-outline', route: ROUTES.USERS },
  ];

  useDismissKeyboardOnBlur();

  return (
    <ScreenView scrollable keyboardShouldPersistTaps="handled">
      <View style={{ paddingBottom: spacing.xxl }}>
        <View style={[styles.header, { backgroundColor: colors.primary }]}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={40} color="#fff" />
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
        </View>

        <ThemedText variant="h3" style={{ marginHorizontal: 16, marginTop: spacing.lg, marginBottom: spacing.sm }}>
          Management
        </ThemedText>
        {menuItems.map((item) => (
          <Pressable
            key={item.label}
            onPress={() => router.push(item.route as any)}
            style={({ pressed }: PressableStateCallbackType) => [
              styles.menuItem,
              { backgroundColor: colors.card, borderColor: colors.border },
              pressed && { opacity: 0.7 },
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
              <Ionicons name={item.icon as any} size={22} color={colors.primary} />
              <ThemedText variant="body">{item.label}</ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </Pressable>
        ))}

        <ThemedText variant="h3" style={{ marginHorizontal: 16, marginTop: spacing.lg, marginBottom: spacing.sm }}>
          Account
        </ThemedText>
        <Card>
          <View style={styles.row}>
            <View>
              <ThemedText variant="caption" color="textSecondary">Elections Configured</ThemedText>
              <ThemedText variant="lg" style={{ fontWeight: '700' }}>{electionCount}</ThemedText>
            </View>
            <View>
              <ThemedText variant="caption" color="textSecondary">Role</ThemedText>
              <ThemedText variant="body" style={{ fontWeight: '600' }}>
                {user?.role ? roleLabels[user.role] : '—'}
              </ThemedText>
            </View>
          </View>
        </Card>

        <Button
          label="Sign Out"
          variant="outline"
          onPress={logout}
          style={{ marginHorizontal: 16, marginTop: spacing.xl }}
          fullWidth
        />
      </View>
    </ScreenView>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: radius.md,
    borderWidth: 1,
  },
});
