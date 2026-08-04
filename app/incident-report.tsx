import React, { useState } from 'react';
import { ScrollView, View, Platform, KeyboardAvoidingView, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ScreenView } from '@/core/components/ScreenView';
import { ThemedText, Input, Button, Card } from '@/core/components';
import { IncidentReport } from '@/features/auth/store';
import { useIncidentsStore, useAuthStore } from '@/features/auth/store';
import { router, useLocalSearchParams } from 'expo-router';
import { spacing, shadows } from '@/constants/tokens';
import { IncidentCategory, IncidentSeverity } from '@/types';

const CATEGORIES = [
  'VIOLENCE', 'BALLOT_SNATCHING', 'VOTE_BUYING', 'VOTER_INTIMIDATION',
  'BVAS_FAILURE', 'SECURITY_INCIDENT', 'PROTEST', 'OTHER',
] as IncidentCategory[];

const SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as IncidentSeverity[];

export default function ReportIncidentScreen() {
  const { electionId, pollingUnitId: preselectedPuId, pollingUnitName: preselectedPuName } = useLocalSearchParams<{ electionId?: string; pollingUnitId?: string; pollingUnitName?: string }>();
  const [category, setCategory] = useState<IncidentCategory>('OTHER');
  const [severity, setSeverity] = useState<IncidentSeverity>('MEDIUM');
  const [description, setDescription] = useState('');
  const [electoralArea, setElectoralArea] = useState('');
  const [selectedPuId, setSelectedPuId] = useState(preselectedPuId ?? '');
  const [selectedPuName, setSelectedPuName] = useState(preselectedPuName ?? '');
  const [mediaUris, setMediaUris] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const { addIncident } = useIncidentsStore();
  const { user } = useAuthStore();

  const requestPermission = async (type: 'camera' | 'microphone' | 'mediaLibrary') => {
    if (Platform.OS !== 'web') {
      if (type === 'camera') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission needed', 'Camera permission is required to take photos or videos.');
          return false;
        }
      }
      if (type === 'microphone') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission needed', 'Microphone permission is required for media capture.');
          return false;
        }
      }
      if (type === 'mediaLibrary') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission needed', 'Media library permission is required to attach files.');
          return false;
        }
      }
    }
    return true;
  };

  const handleAddPhoto = async () => {
    const ok = await requestPermission('camera');
    if (!ok) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsMultipleSelection: true,
    });
    if (!result.canceled) {
      setMediaUris((prev) => [...prev, ...result.assets.map((a) => a.uri)]);
    }
  };

  const handleTakePhoto = async () => {
    const ok = await requestPermission('camera');
    if (!ok) return;
    const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (!result.canceled) {
      setMediaUris((prev) => [...prev, ...result.assets.map((a) => a.uri)]);
    }
  };

  const handleRecordVideo = async () => {
    const ok = await requestPermission('camera');
    if (!ok) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['videos'],
      videoMaxDuration: 60,
      quality: 0.8,
    });
    if (!result.canceled) {
      setMediaUris((prev) => [...prev, ...result.assets.map((a) => a.uri)]);
    }
  };

  const handleAttachAudio = async () => {
    const ok = await requestPermission('mediaLibrary');
    if (!ok) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['audio' as any],
    });
    if (!result.canceled) {
      setMediaUris((prev) => [...prev, ...result.assets.map((a) => a.uri)]);
    }
  };

  const handleRemoveMedia = (uri: string) => {
    setMediaUris((prev) => prev.filter((u) => u !== uri));
  };

  const handleSubmit = async () => {
    if (!description.trim() || !electoralArea.trim()) return;
    setSubmitting(true);
    const incident: IncidentReport = {
      id: `i-${Date.now()}`,
      electionId: electionId ?? 'e1',
      pollingUnitId: selectedPuId || undefined,
      electoralArea,
      category,
      severity,
      status: 'SUBMITTED',
      description,
      latitude: 6.5 + Math.random() * 2,
      longitude: 3.3 + Math.random() * 2,
      mediaUrls: mediaUris,
      reportedBy: user?.id ?? 'current-user',
      reportedAt: new Date().toISOString(),
    };
    addIncident(incident);
    setSubmitting(false);
    router.back();
  };

  return (
    <ScreenView>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        enabled={Platform.OS === 'ios'}
        style={{ flex: 1 }}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={{ paddingBottom: spacing.xxl }}
        >
          <ThemedText variant="h2" style={{ marginBottom: spacing.lg }}>
            Report Incident
          </ThemedText>

          <Input
            label="Electoral Area"
            placeholder="e.g. Ikeja LGA"
            value={electoralArea}
            onChangeText={setElectoralArea}
            leftIcon="location-outline"
          />

          <ThemedText variant="label" style={{ marginHorizontal: spacing.md, marginBottom: spacing.xs }}>
            Tie to Polling Unit (optional)
          </ThemedText>
          {selectedPuId ? (
            <Card style={[shadows.sm, { marginHorizontal: spacing.md, marginBottom: spacing.md, padding: spacing.md }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                <ThemedText variant="body" style={{ fontWeight: '600', flex: 1 }}>{selectedPuName}</ThemedText>
                <Button label="Remove" size="sm" variant="ghost" onPress={() => { setSelectedPuId(''); setSelectedPuName(''); }} />
              </View>
            </Card>
          ) : (
            <Button
              label="Select Polling Unit"
              variant="outline"
              size="sm"
              onPress={() => router.push({ pathname: '/pu-picker' as any, params: { mode: 'incident', ...(electionId ? { electionId } : {}) } })}
              style={{ marginHorizontal: spacing.md, marginBottom: spacing.md }}
              leftIcon="location-outline"
            />
          )}

          <ThemedText variant="label" style={{ marginHorizontal: spacing.md, marginBottom: spacing.sm }}>
            Category
          </ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: spacing.md, gap: spacing.sm, marginBottom: spacing.lg }} keyboardShouldPersistTaps="handled">
            {CATEGORIES.map((cat) => (
              <Button
                key={cat}
                label={cat.replace(/_/g, ' ')}
                variant={category === cat ? 'primary' : 'outline'}
                size="sm"
                onPress={() => setCategory(cat)}
              />
            ))}
          </ScrollView>

          <ThemedText variant="label" style={{ marginHorizontal: spacing.md, marginBottom: spacing.sm }}>
            Severity
          </ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: spacing.md, gap: spacing.sm, marginBottom: spacing.lg }} keyboardShouldPersistTaps="handled">
            {SEVERITIES.map((sev) => (
              <Button
                key={sev}
                label={sev}
                variant={severity === sev ? 'primary' : 'outline'}
                size="sm"
                onPress={() => setSeverity(sev)}
              />
            ))}
          </ScrollView>

          <Input
            label="Description"
            placeholder="Describe the incident..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            containerStyle={{ minHeight: 120 }}
          />

          <ThemedText variant="label" style={{ marginHorizontal: spacing.md, marginTop: spacing.lg, marginBottom: spacing.sm }}>
            Attach Media
          </ThemedText>

          <View style={{ flexDirection: 'row', gap: spacing.sm, marginHorizontal: spacing.md, marginBottom: spacing.md }}>
            <Button label="Photo" variant="outline" size="sm" onPress={handleTakePhoto} leftIcon="camera" style={{ flex: 1 }} />
            <Button label="Gallery" variant="outline" size="sm" onPress={handleAddPhoto} leftIcon="image" style={{ flex: 1 }} />
            <Button label="Video" variant="outline" size="sm" onPress={handleRecordVideo} leftIcon="videocam" style={{ flex: 1 }} />
            <Button label="Audio" variant="outline" size="sm" onPress={handleAttachAudio} leftIcon="mic" style={{ flex: 1 }} />
          </View>

          {mediaUris.length > 0 && (
            <View style={{ marginHorizontal: spacing.md, marginBottom: spacing.md }}>
              <ThemedText variant="caption" color="textSecondary" style={{ marginBottom: spacing.xs }}>
                {mediaUris.length} file{mediaUris.length !== 1 ? 's' : ''} attached
              </ThemedText>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
                {mediaUris.map((uri, idx) => (
                  <View key={uri} style={{ backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 8, padding: spacing.xs, paddingHorizontal: spacing.sm, flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                    <ThemedText variant="caption" color="textSecondary" numberOfLines={1} style={{ maxWidth: 120 }}>
                      {uri.split('/').pop() ?? `file-${idx}`}
                    </ThemedText>
                    <Button label="✕" size="sm" variant="ghost" onPress={() => handleRemoveMedia(uri)} />
                  </View>
                ))}
              </View>
            </View>
          )}

          <View style={{ flexDirection: 'row', gap: spacing.md, marginHorizontal: spacing.md, marginTop: spacing.lg }}>
            <Button label="Cancel" variant="outline" onPress={() => router.back()} fullWidth />
            <Button label="Submit" onPress={handleSubmit} loading={submitting} fullWidth />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenView>
  );
}
