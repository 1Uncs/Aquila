import React, { useState } from 'react';
import { Platform, KeyboardAvoidingView, ScrollView, View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText, Input, Button, Card } from '@/core/components';
import { spacing, radius, shadows, opacities } from '@/constants/tokens';
import { useLoginMutation } from '@/features/auth/hooks';
import { useColorScheme } from '@/core/hooks/useColorScheme';
import { useStatusBar } from '@/core/hooks/useStatusBar';
import Colors from '@/constants/colors';
import { gradientPresets } from '@/constants/tokens';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  useStatusBar({ barStyle: scheme === 'dark' ? 'light' : 'dark', hidden: false, translucent: false });

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const loginMutation = useLoginMutation();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password');
      return;
    }
    setError('');
    try {
      await loginMutation.mutateAsync({ email: email.trim(), password });
    } catch {
      setError('Invalid credentials. Please try again.');
    }
  };

  const launchDemo = async (role: 'agent' | 'polling' | 'officer') => {
    setError('');
    try {
      let demoEmail: string;
      switch (role) {
        case 'agent': demoEmail = 'agent@aquila.ng'; break;
        case 'polling': demoEmail = 'polling@aquila.ng'; break;
        case 'officer': demoEmail = 'officer@aquila.ng'; break;
      }
      await loginMutation.mutateAsync({ email: demoEmail, password: 'demo' });
    } catch {
      setError('Demo login failed. Please try again.');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <LinearGradient
        colors={[...gradientPresets.primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1 }}
      >
        <KeyboardAvoidingView
          enabled={Platform.OS === 'ios'}
          behavior="padding"
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={{
              paddingTop: insets.top + spacing.xxl,
              paddingBottom: Math.max(insets.bottom, spacing.md) + spacing.xxl,
              paddingHorizontal: spacing.md,
            }}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}
          >
            <View style={{ alignItems: 'center', marginBottom: spacing.xxl }}>
              <View style={[styles.logoWrap, { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: radius.xl, ...shadows.lg }]}>
                <Ionicons name="shield-checkmark" size={48} color={colors.accent} />
              </View>
              <ThemedText variant="xxl" color="#ffffff" fontFamily="bold" style={{ letterSpacing: 1.5, marginTop: spacing.md }}>
                Aquila
              </ThemedText>
              <ThemedText variant="body" color="#ffffff" style={{ opacity: opacities.muted + 0.15, textAlign: 'center', marginTop: spacing.xs }}>
                Trusted Election Intelligence
              </ThemedText>
            </View>

            <Card style={[shadows.lg, { padding: spacing.lg, backgroundColor: colors.surface }]}>
              <ThemedText variant="h3" style={{ marginBottom: spacing.lg, textAlign: 'center' }}>
                Sign In
              </ThemedText>

              <Input
                label="Email"
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                leftIcon="mail-outline"
                containerStyle={{ marginBottom: spacing.md }}
              />

              <Input
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                secureToggle
                visible={showPassword}
                onToggleSecure={() => setShowPassword((prev) => !prev)}
                leftIcon="lock-closed-outline"
              />

              {error ? (
                <ThemedText variant="caption" color="error" style={{ marginBottom: spacing.md, marginTop: spacing.sm }}>
                  {error}
                </ThemedText>
              ) : null}

              <Button
                label="Sign In"
                onPress={handleLogin}
                loading={loginMutation.isPending}
                fullWidth
                leftIcon="log-in-outline"
                style={{ marginTop: spacing.md }}
                size="lg"
              />

              <View style={{ marginTop: spacing.lg, marginBottom: spacing.sm }}>
                <ThemedText variant="caption" color="textMuted" style={{ textAlign: 'center', marginBottom: spacing.sm }}>
                  Quick demo access
                </ThemedText>
                <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                  <Button label="Agent" variant="outline" onPress={() => launchDemo('agent')} loading={loginMutation.isPending} style={{ flex: 1 }} size="sm" />
                  <Button label="PU Agent" variant="outline" onPress={() => launchDemo('polling')} loading={loginMutation.isPending} style={{ flex: 1 }} size="sm" />
                  <Button label="Officer" variant="outline" onPress={() => launchDemo('officer')} loading={loginMutation.isPending} style={{ flex: 1 }} size="sm" />
                </View>
              </View>
            </Card>

            <ThemedText
              variant="caption"
              color="#ffffff"
              style={{ textAlign: 'center', marginTop: spacing.lg, opacity: opacities.muted + 0.1 }}
            >
              Or enter any email/password manually
            </ThemedText>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  logoWrap: {
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
