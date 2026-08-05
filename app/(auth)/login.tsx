import React, { useState } from 'react';
import { Platform, KeyboardAvoidingView, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText, Input, Button } from '@/core/components';
import { spacing, radius, shadows, opacities } from '@/constants/tokens';
import { useLoginMutation } from '@/features/auth/hooks';
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
            loading={loginMutation.isPending}
            fullWidth
            leftIcon="log-in-outline"
            style={{ marginBottom: spacing.md }}
          />

          <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md, flexWrap: 'wrap', alignItems: 'center' }}>
            <Button label="Field Agent" variant="ghost" onPress={() => launchDemo('agent')} loading={loginMutation.isPending} style={{ minWidth: 80 }} />
            <Button label="PU Agent" variant="outline" onPress={() => launchDemo('polling')} loading={loginMutation.isPending} style={{ minWidth: 80 }} />
            <Button label="Election Officer" variant="ghost" onPress={() => launchDemo('officer')} loading={loginMutation.isPending} style={{ minWidth: 80 }} />
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
