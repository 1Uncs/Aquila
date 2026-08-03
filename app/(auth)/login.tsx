import React, { useState } from 'react';
import { Keyboard, TouchableWithoutFeedback, Platform, KeyboardAvoidingView, ScrollView, View } from 'react-native';
import { ScreenView } from '@/core/components/ScreenView';
import { ThemedText, Input, Button } from '@/core/components';
import { spacing } from '@/constants/tokens';
import { login } from '@/features/auth/service';

export default function LoginScreen() {
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
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScreenView>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          enabled={Platform.OS === 'ios'}
          style={{ flex: 1, justifyContent: 'center' }}
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            contentInsetAdjustmentBehavior="automatic"
            contentContainerStyle={{ paddingBottom: spacing.xxl, justifyContent: 'center', flexGrow: 1 }}
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
          secureTextEntry={!showPassword}
          secureToggle
          secureVisible={showPassword}
          onToggleSecure={() => setShowPassword((prev) => !prev)}
          leftIcon="lock-closed-outline"
        />

        {error ? (
          <ThemedText variant="caption" color="error" style={{ marginHorizontal: 16, marginBottom: spacing.md }}>
            {error}
          </ThemedText>
        ) : null}

        <Button label="Sign In" onPress={handleLogin} loading={loading} fullWidth style={{ marginHorizontal: 16 }} />

        <View style={{ flexDirection: 'row', gap: spacing.sm, marginHorizontal: 16, marginTop: spacing.md }}>
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
  </ScreenView>
</TouchableWithoutFeedback>
  );
}
