import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ScreenView } from '@/core/components/ScreenView';
import { ThemedText, Card, EmptyState } from '@/core/components';
import { Ionicons } from '@expo/vector-icons';
import { useStatesQuery } from '@/features/elections/hooks';
import { spacing, radius, shadows, border } from '@/constants/tokens';
import { useColorScheme } from '@/core/hooks/useColorScheme';
import Colors from '@/constants/colors';

export default function LocationsScreen() {
  const { data: states = [] } = useStatesQuery();
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

  return (
    <ScreenView scrollable keyboardShouldPersistTaps="handled">
      <View style={{ paddingBottom: spacing.xxl }}>
        <ThemedText variant="h2" style={{ marginHorizontal: 16, marginTop: spacing.md, marginBottom: spacing.sm }}>
          Electoral Geography
        </ThemedText>
        <ThemedText variant="body" color="textSecondary" style={{ marginHorizontal: 16, marginBottom: spacing.lg }}>
          Manage electoral locations across Nigeria
        </ThemedText>

        {states.length === 0 ? (
          <EmptyState icon="location-outline" title="Loading..." subtitle="Fetching electoral geography" />
        ) : (
          <Card style={shadows.md}>
            <ThemedText variant="h3" style={{ marginBottom: spacing.md }}>
              States & FCT ({states.length})
            </ThemedText>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
              {states.map((state) => (
                <View
                  key={state.id}
                  style={[styles.stateChip, { backgroundColor: colors.primary + '15', borderColor: colors.primary + '40' }]}
                >
                  <ThemedText variant="caption" style={{ color: colors.primary, fontWeight: '600' }}>
                    {state.name}
                  </ThemedText>
                </View>
              ))}
            </View>
          </Card>
        )}

        <ThemedText variant="h3" style={{ marginHorizontal: 16, marginTop: spacing.xl, marginBottom: spacing.sm }}>
          Sub-Units
        </ThemedText>
        <Card pressable style={shadows.sm}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
            <Ionicons name="map-outline" size={22} color={colors.primary} />
            <View>
              <ThemedText variant="body" style={{ fontWeight: '600' }}>LGAs / Area Councils</ThemedText>
              <ThemedText variant="caption" color="textSecondary">Local Government Areas</ThemedText>
            </View>
          </View>
        </Card>
        <Card pressable style={shadows.sm}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
            <Ionicons name="git-branch-outline" size={22} color={colors.primary} />
            <View>
              <ThemedText variant="body" style={{ fontWeight: '600' }}>Wards</ThemedText>
              <ThemedText variant="caption" color="textSecondary">Electoral Wards</ThemedText>
            </View>
          </View>
        </Card>
        <Card pressable style={shadows.sm}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
            <Ionicons name="business-outline" size={22} color={colors.primary} />
            <View>
              <ThemedText variant="body" style={{ fontWeight: '600' }}>Polling Units</ThemedText>
              <ThemedText variant="caption" color="textSecondary">Polling Unit registry</ThemedText>
            </View>
          </View>
        </Card>
        <Card pressable style={shadows.sm}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
            <Ionicons name="map" size={22} color={colors.primary} />
            <View>
              <ThemedText variant="body" style={{ fontWeight: '600' }}>Senatorial Districts</ThemedText>
              <ThemedText variant="caption" color="textSecondary">Senatorial Areas</ThemedText>
            </View>
          </View>
        </Card>
        <Card pressable style={shadows.sm}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
            <Ionicons name="people-outline" size={22} color={colors.primary} />
            <View>
              <ThemedText variant="body" style={{ fontWeight: '600' }}>Constituencies</ThemedText>
              <ThemedText variant="caption" color="textSecondary">Federal & State Constituencies</ThemedText>
            </View>
          </View>
        </Card>
      </View>
    </ScreenView>
  );
}

const styles = StyleSheet.create({
  stateChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: border.thin,
  },
});
