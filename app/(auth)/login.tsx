import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { ScreenView } from '@/core/components/ScreenView';
import { ThemedText, Input, Button } from '@/core/components';
import { useDismissKeyboardOnBlur } from '@/core/hooks';
import { spacing } from '@/constants/tokens';
import { login } from '@/features/auth/service';

export default function LoginScreen() {
  useDismissKeyboardOnBlur();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

  return (
    <ScreenView>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1, justifyContent: 'center' }}
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

        <ThemedText variant="h3" style={{ marginBottom: spacing.lg, marginHorizontal: 16 }}>
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
          secureTextEntry
          leftIcon="lock-closed-outline"
        />

        {error ? (
          <ThemedText variant="caption" color="error" style={{ marginHorizontal: 16, marginBottom: spacing.md }}>
            {error}
          </ThemedText>
        ) : null}

        <Button label="Sign In" onPress={handleLogin} loading={loading} fullWidth style={{ marginHorizontal: 16 }} />

        <ThemedText
          variant="caption"
          color="textMuted"
          style={{ textAlign: 'center', marginTop: spacing.lg }}
        >
          Demo: use admin@aquila.ng or any email
        </ThemedText>
      </KeyboardAvoidingView>
    </ScreenView>
  );
}
