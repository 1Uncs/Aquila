import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, Feather } from '@expo/vector-icons';
// import { Colors, Fonts } from '../constants/Colors';
import { Colors, Fonts } from '../constants/Colors';
import { UserRole } from '../types/election';
import { useAuth } from '../context/AuthContext';

const ROLES: { label: string; value: UserRole; desc: string; icon: keyof typeof Feather.glyphMap }[] = [
  { label: 'Polling Unit Agent', value: 'POLLING_UNIT_AGENT', desc: 'Submit results for 1 assigned PU', icon: 'check-square' },
  { label: 'Field Agent', value: 'FIELD_AGENT', desc: 'Monitor & submit across multiple PUs', icon: 'map-pin' },
  { label: 'Election Officer', value: 'ELECTION_OFFICER', desc: 'View regional collation & monitor feeds', icon: 'bar-chart-2' },
  { label: 'Super Administrator', value: 'SUPER_ADMIN', desc: 'Full system configuration & override', icon: 'sliders' },
];

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('agent@aquila.ng');
  const [password, setPassword] = useState('••••••••••••');
  const [selectedRole, setSelectedRole] = useState<UserRole>('POLLING_UNIT_AGENT');

  const handleLogin = () => {
    login(selectedRole, email);
    router.replace('/dashboard');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Top Header Bar */}
        <View style={styles.topHeader}>
          <View style={styles.coatOfArmsBadge}>
            <Ionicons name="shield-checkmark" size={14} color={Colors.primary} />
            <Text style={styles.badgeText}>OFFICIAL PORTAL</Text>
          </View>
        </View>

        {/* Brand Header */}
        <View style={styles.brandContainer}>
          <Text style={styles.title}>AQUILA</Text>
          <Text style={styles.subtitle}>REAL-TIME ELECTION INTELLIGENCE & MONITORING PLATFORM</Text>
        </View>

        {/* Credentials Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>AGENT & OFFICER AUTHENTICATION</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>OFFICIAL EMAIL / AGENT ID</Text>
            <View style={styles.inputWrapper}>
              <Feather name="mail" size={16} color={Colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter credentials"
                placeholderTextColor={Colors.textMuted}
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>PASSWORD</Text>
            <View style={styles.inputWrapper}>
              <Feather name="lock" size={16} color={Colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholder="Enter password"
                placeholderTextColor={Colors.textMuted}
              />
            </View>
          </View>

          {/* Role Selection */}
          <Text style={[styles.label, { marginTop: 14 }]}>SELECT OPERATIONAL ROLE</Text>
          {ROLES.map((r) => (
            <TouchableOpacity
              key={r.value}
              style={[
                styles.roleOption,
                selectedRole === r.value && styles.roleOptionSelected,
              ]}
              onPress={() => setSelectedRole(r.value)}
              activeOpacity={0.8}
            >
              <View style={styles.radioContainer}>
                <View
                  style={[
                    styles.radioOuter,
                    selectedRole === r.value && styles.radioOuterSelected,
                  ]}
                >
                  {selectedRole === r.value && <View style={styles.radioInner} />}
                </View>
                <Feather
                  name={r.icon}
                  size={16}
                  color={selectedRole === r.value ? Colors.primary : Colors.textMuted}
                  style={{ marginRight: 10 }}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.roleLabel}>{r.label}</Text>
                  <Text style={styles.roleDesc}>{r.desc}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}

          <TouchableOpacity style={styles.submitBtn} onPress={handleLogin} activeOpacity={0.85}>
            <Text style={styles.submitBtnText}>INITIALIZE SESSION</Text>
            <Feather name="arrow-right" size={16} color="#FFFFFF" style={{ marginLeft: 6 }} />
          </TouchableOpacity>
        </View>

        <Text style={styles.footerNote}>
          Independent election observation platform. All log activities, GPS location submissions, and result entries are audit-logged in real time.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgPrimary,
  },
  scrollContent: {
    padding: 20,
    justifyContent: 'center',
  },
  topHeader: {
    alignItems: 'center',
    marginBottom: 12,
  },
  coatOfArmsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    borderColor: '#86EFAC',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 6,
  },
  badgeText: {
    color: Colors.primary,
    fontSize: 10,
    fontFamily: Fonts.bold,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontFamily: Fonts.extraBold,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 10,
    fontFamily: Fonts.semiBold,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 10,
    lineHeight: 14,
  },
  card: {
    backgroundColor: Colors.bgSurface,
    borderColor: Colors.borderSubtle,
    borderWidth: 1,
    borderRadius: 10,
    padding: 20,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: Fonts.bold,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 10,
    fontFamily: Fonts.semiBold,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgInput,
    borderColor: Colors.borderSubtle,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    color: Colors.textPrimary,
    fontSize: 14,
    fontFamily: Fonts.regular,
  },
  roleOption: {
    backgroundColor: '#FAFAFA',
    borderColor: Colors.borderSubtle,
    borderWidth: 1,
    borderRadius: 6,
    padding: 12,
    marginBottom: 8,
  },
  roleOptionSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primarySurface,
  },
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: Colors.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  radioOuterSelected: {
    borderColor: Colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  roleLabel: {
    fontSize: 13,
    fontFamily: Fonts.bold,
    color: Colors.textPrimary,
  },
  roleDesc: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  submitBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontFamily: Fonts.bold,
    fontSize: 13,
  },
  footerNote: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 16,
  },
});