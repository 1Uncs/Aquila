import React, { useState } from 'react';
import { Platform, KeyboardAvoidingView, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText, Input, Button } from '@/core/components';
import { spacing, radius, shadows, opacities } from '@/constants/tokens';
import { login } from '@/features/auth/service';
import { useColorScheme } from '@/core/hooks/useColorScheme';
import Colors from '@/constants/colors';
import { gradientPresets } from '@/constants/tokens';

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
          <LinearGradient
            colors={gradientPresets.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              borderRadius: radius.xl,
              paddingVertical: spacing.xxl,
              paddingHorizontal: spacing.lg,
              alignItems: 'center',
              marginBottom: spacing.xxl,
              ...shadows.md,
            }}
          >
            <View style={{ alignItems: 'center', gap: spacing.sm }}>
              <Ionicons name="shield-checkmark" size={56} color="#f59e0b" />
              <ThemedText variant="xxl" color="#ffffff" fontFamily="bold" style={{ letterSpacing: 1 }}>
                Aquila
              </ThemedText>
              <ThemedText variant="caption" color="#ffffff" style={{ opacity: opacities.subtle + 0.6, textAlign: 'center' }}>
                Trusted Election Intelligence
              </ThemedText>
            </View>
          </LinearGradient>

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

          <Button
            label="Sign In"
            onPress={handleLogin}
            loading={loading}
            fullWidth
            leftIcon="log-in-outline"
            style={{ marginBottom: spacing.md }}
          />

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
