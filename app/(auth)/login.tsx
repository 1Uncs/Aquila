import React, { useState } from 'react';
import { Platform, KeyboardAvoidingView, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText, Input, Button } from '@/core/components';
import { spacing } from '@/constants/tokens';
import { login } from '@/features/auth/service';
import { useColorScheme } from '@/core/hooks/useColorScheme';
import Colors from '@/constants/colors';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await login(email.trim(), password);
    } catch {
      setError('Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const launchDemo = async (role: 'admin' | 'agent') => {
    setLoading(true);
    setError('');
    try {
      const demoEmail = role === 'admin' ? 'admin@aquila.ng' : 'agent@aquila.ng';
      await login(demoEmail, 'demo');
    } catch {
      setError('Demo login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
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
          <ThemedText variant="xxl" style={{ textAlign: 'center', marginBottom: spacing.sm }}>
            Aquila
          </ThemedText>
          <ThemedText
            variant="caption"
            color="textSecondary"
            style={{ textAlign: 'center', marginBottom: spacing.xxl }}
          >
            Trusted Election Intelligence
          </ThemedText>

          <ThemedText variant="h3" style={{ marginBottom: spacing.lg }}>
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
            <ThemedText variant="caption" color="error" style={{ marginBottom: spacing.md }}>
              {error}
            </ThemedText>
          ) : null}

          <Button label="Sign In" onPress={handleLogin} loading={loading} fullWidth style={{ marginBottom: spacing.md }} />

          <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md }}>
            <Button
              label="Admin Demo"
              variant="outline"
              onPress={() => launchDemo('admin')}
              loading={loading}
              style={{ flex: 1 }}
            />
            <Button
              label="Agent Demo"
              variant="ghost"
              onPress={() => launchDemo('agent')}
              loading={loading}
              style={{ flex: 1 }}
            />
          </View>

          <ThemedText
            variant="caption"
            color="textMuted"
            style={{ textAlign: 'center', marginTop: spacing.lg }}
          >
            Or enter any email/password manually
          </ThemedText>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}