import React, { useState, useEffect, useRef } from 'react';
import { ScrollView, View, Platform, KeyboardAvoidingView, Alert, StyleSheet } from 'react-native';
import { useAudioRecorder, useAudioRecorderState, AudioModule, RecordingPresets, setAudioModeAsync } from 'expo-audio';
import * as ImagePicker from 'expo-image-picker';
import { ScreenView } from '@/core/components/ScreenView';
import { ThemedText, Input, Button, Card } from '@/core/components';
import { IncidentReport } from '@/features/auth/store';
import { useIncidentsStore, useAuthStore } from '@/features/auth/store';
import { router, useLocalSearchParams } from 'expo-router';
import { spacing, shadows, radius } from '@/constants/tokens';
import { IncidentCategory, IncidentSeverity } from '@/types';
import { useColorScheme } from '@/core/hooks/useColorScheme';
import { useStatusBar } from '@/core/hooks/useStatusBar';
import { ROUTES } from '@/constants/routes';
import Colors from '@/constants/colors';
import { FEATURES } from '@/constants/features';
import { LinearGradient } from 'expo-linear-gradient';

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
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [audioChunks, setAudioChunks] = useState<{ uri: string; durationSec: number; chunkIndex: number; latitude: number; longitude: number }[]>([]);
  const chunkIndexRef = useRef(0);
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder, 500);
  const isRecording = recorderState.isRecording;
  const recordingDuration = Math.round((recorderState.durationMillis ?? 0) / 1000);
  const CHUNK_SECONDS = 120;
  const MAX_CHUNKS = 5;
  const { addIncident } = useIncidentsStore();
  const { user } = useAuthStore();
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  useStatusBar({ barStyle: scheme === 'dark' ? 'light' : 'dark' });

  const isRecordingRef = useRef(false);
  isRecordingRef.current = isRecording;

  useEffect(() => {
    return () => {
      if (isRecordingRef.current) {
        isRecordingRef.current = false;
        try {
          audioRecorder.stop().catch(() => {});
        } catch {}
        setAudioModeAsync({ allowsRecording: false, allowsBackgroundRecording: false }).catch(() => {});
      }
    };
  }, [audioRecorder]);

  useEffect(() => {
    if (!FEATURES.ENABLE_STEALTH_RECORDING) return;
    if (!isRecording) return;
    if (recordingDuration < CHUNK_SECONDS) return;
    if (chunkIndexRef.current >= MAX_CHUNKS) return;
    (async () => {
      try {
        await audioRecorder.stop();
        const uri = audioRecorder.uri;
        await setAudioModeAsync({ allowsRecording: false, allowsBackgroundRecording: false }).catch(() => {});
        if (uri) {
          const chunk = {
            uri,
            durationSec: CHUNK_SECONDS,
            chunkIndex: chunkIndexRef.current,
            latitude: 6.5 + Math.random() * 2,
            longitude: 3.3 + Math.random() * 2,
          };
          chunkIndexRef.current += 1;
          setAudioChunks((prev) => [...prev, chunk]);
          setMediaUris((prev) => [...prev, uri]);
        }
        if (chunkIndexRef.current < MAX_CHUNKS) {
          await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true, allowsBackgroundRecording: true });
          await audioRecorder.prepareToRecordAsync();
          audioRecorder.record();
        }
      } catch (e) {
        console.error('Chunk finalization failed', e);
      }
    })();
  }, [recordingDuration, isRecording, audioRecorder]);

  const requestPermission = async (type: 'camera' | 'mediaLibrary') => {
    try {
      if (Platform.OS !== 'web') {
        if (type === 'camera') {
          const { status } = await ImagePicker.requestCameraPermissionsAsync();
          if (status !== 'granted') {
            Alert.alert('Permission needed', 'Camera permission is required to take photos or videos.');
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
    } catch (e) {
      console.error('Permission request failed:', e);
      Alert.alert('Error', 'Failed to request permission.');
      return false;
    }
  };

  const confirmStealthRecording = () =>
    new Promise<boolean>((resolve) => {
      Alert.alert(
        'Audio evidence — confirm',
        'You are about to record audio evidence. Only record in line with local law and INEC guidelines. Audio will be stored as evidence attached to this incident with timestamps and location. Continue?',
        [
          { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
          { text: 'Continue', style: 'default', onPress: () => resolve(true) },
        ]
      );
    });

  const startRecording = async () => {
    if (FEATURES.ENABLE_STEALTH_RECORDING) {
      const ok = await confirmStealthRecording();
      if (!ok) return;
    }
    try {
      const permission = await AudioModule.requestRecordingPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission needed', 'Microphone permission is required to record audio.');
        return;
      }
      if (Platform.OS === 'android') {
        try {
          await AudioModule.requestNotificationPermissionsAsync();
        } catch {
          // optional permission, ignore
        }
      }
      await setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: true,
        allowsBackgroundRecording: true,
      });
      chunkIndexRef.current = 0;
      setAudioChunks([]);
      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
      isRecordingRef.current = true;
      setRecordingUri(null);
    } catch (error) {
      isRecordingRef.current = false;
      console.error('Failed to start recording:', error);
      Alert.alert('Error', 'Failed to start audio recording.');
      try {
        await setAudioModeAsync({ allowsRecording: false, allowsBackgroundRecording: false });
      } catch {
        // ignore cleanup failure
      }
    }
  };

  const stopRecording = async () => {
    try {
      isRecordingRef.current = false;
      await audioRecorder.stop();
      const uri = audioRecorder.uri;
      await setAudioModeAsync({ allowsRecording: false, allowsBackgroundRecording: false });
      if (uri) {
        setRecordingUri(uri);
        const chunk = {
          uri,
          durationSec: recordingDuration % CHUNK_SECONDS || recordingDuration,
          chunkIndex: chunkIndexRef.current,
          latitude: 6.5 + Math.random() * 2,
          longitude: 3.3 + Math.random() * 2,
        };
        setAudioChunks((prev) => [...prev, chunk]);
        setMediaUris((prev) => [...prev, uri]);
      }
    } catch (error) {
      console.error('Failed to stop recording:', error);
      await setAudioModeAsync({ allowsRecording: false, allowsBackgroundRecording: false }).catch(() => {});
      Alert.alert('Error', 'Failed to stop audio recording.');
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleTakePhoto = async () => {
    const ok = await requestPermission('camera');
    if (!ok) return;
    try {
      const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
      if (!result.canceled) {
        setMediaUris((prev) => [...prev, ...result.assets.map((a) => a.uri)]);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo.');
    }
  };

  const handleRecordVideo = async () => {
    const ok = await requestPermission('camera');
    if (!ok) return;
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['videos'],
        videoMaxDuration: 60,
        quality: 0.8,
      });
      if (!result.canceled) {
        setMediaUris((prev) => [...prev, ...result.assets.map((a) => a.uri)]);
      }
    } catch (error) {
      console.error('Error recording video:', error);
      Alert.alert('Error', 'Failed to record video.');
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

  if (user?.role === 'ELECTION_OFFICER') {
    return (
      <ScreenView>
        <View style={{ padding: spacing.lg, alignItems: 'center', marginTop: spacing.xxl }}>
          <Card style={{ padding: spacing.xl, width: '100%', alignItems: 'center' }}>
            <ThemedText variant="h3" style={{ textAlign: 'center', marginBottom: spacing.md, color: colors.critical }}>
              Supervisory Access Restricted
            </ThemedText>
            <ThemedText variant="body" color="textSecondary" style={{ textAlign: 'center', marginBottom: spacing.lg }}>
              As an Election Officer (Situation Room Director), your mandate focuses on incident monitoring, triage, and task-force dispatches. Incident reporting in the field is reserved for Polling Unit Agents and Observers.
            </ThemedText>
            <Button
              label="Go to Incident Triage Center"
              variant="primary"
              onPress={() => router.replace('/(app)/(tabs)/incidents' as any)}
            />
          </Card>
        </View>
      </ScreenView>
    );
  }

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
          automaticallyAdjustKeyboardInsets={true}
          contentContainerStyle={{ paddingBottom: spacing.xxl }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.lg }}>
            <View style={[styles.titleIndicator, { backgroundColor: colors.critical }]} />
            <ThemedText variant="h2" style={{ flex: 1 }}>Report Incident</ThemedText>
          </View>

          <Input
            label="Electoral Area"
            placeholder="e.g. Ikeja LGA"
            value={electoralArea}
            onChangeText={setElectoralArea}
            leftIcon="location-outline"
          />

          <ThemedText variant="label" style={{ marginBottom: spacing.xs, marginTop: spacing.md }}>
            Tie to Polling Unit (optional)
          </ThemedText>
          {selectedPuId ? (
            <Card style={[shadows.sm, { marginBottom: spacing.md }]}>
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
              onPress={() => router.push({ pathname: ROUTES.PU_PICKER, params: { mode: 'incident', ...(electionId ? { electionId } : {}) } })}
              style={{ marginBottom: spacing.md }}
              leftIcon="location-outline"
            />
          )}

          <ThemedText variant="label" style={{ marginBottom: spacing.sm }}>
            Category
          </ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm, marginBottom: spacing.lg }} keyboardShouldPersistTaps="handled">
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

          <ThemedText variant="label" style={{ marginBottom: spacing.sm }}>
            Severity
          </ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm, marginBottom: spacing.lg }} keyboardShouldPersistTaps="handled">
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

          <ThemedText variant="label" style={{ marginTop: spacing.lg, marginBottom: spacing.sm }}>
            Attach Media
          </ThemedText>

          <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md, flexWrap: 'wrap', alignItems: 'center' }}>
            <Button label="Live Photo" variant="outline" size="sm" onPress={handleTakePhoto} leftIcon="camera" style={{ minWidth: 100 }} />
            <Button label="Live Video" variant="outline" size="sm" onPress={handleRecordVideo} leftIcon="videocam" style={{ minWidth: 100 }} />
          </View>

          <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md, flexWrap: 'wrap', alignItems: 'center' }}>
            <Button
              label={isRecording ? 'Stop Recording' : 'Record Memo'}
              variant={isRecording ? 'primary' : 'outline'}
              size="sm"
              onPress={isRecording ? stopRecording : startRecording}
              leftIcon={isRecording ? 'stop-circle' : 'mic'}
               style={{ minWidth: 120 }}
            />
            {isRecording ? (
              <ThemedText variant="caption" color="error" style={{ minWidth: 60, textAlign: 'center' }}>
                {formatDuration(recordingDuration)}
                {FEATURES.ENABLE_STEALTH_RECORDING && audioChunks.length > 0 ? ` · ${audioChunks.length} chunk${audioChunks.length !== 1 ? 's' : ''} saved` : ''}
              </ThemedText>
            ) : recordingUri ? (
              <ThemedText variant="caption" color="success" style={{ alignSelf: 'center' }}>
                Recording saved{audioChunks.length > 1 ? ` (${audioChunks.length} chunks)` : ''}
              </ThemedText>
            ) : audioChunks.length > 0 ? (
              <ThemedText variant="caption" color="success" style={{ alignSelf: 'center' }}>
                {audioChunks.length} chunk{audioChunks.length !== 1 ? 's' : ''} · {audioChunks.reduce((s, c) => s + c.durationSec, 0)}s total
              </ThemedText>
            ) : null}
          </View>
          {FEATURES.ENABLE_STEALTH_RECORDING && (
            <Card style={[{ backgroundColor: colors.warningSubtle, borderColor: colors.warning + '30', borderWidth: 1, marginBottom: spacing.md }]}>
              <ThemedText variant="caption" style={{ color: colors.textSecondary }}>
                Background audio enabled (app.json enableBackgroundRecording). Keep app foregrounded; audio continues with screen on but dims. Each 2-min chunk is geotagged — review device lock-screen behavior on your target devices before field use.
              </ThemedText>
            </Card>
          )}
          {audioChunks.length > 0 && (
            <View style={{ marginBottom: spacing.md, gap: spacing.xs }}>
              {audioChunks.map((ch) => (
                <View key={ch.uri} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.border + '60', padding: spacing.xs, borderRadius: radius.sm }}>
                  <ThemedText variant="caption" style={{ fontWeight: '600' }}>
                    Chunk {ch.chunkIndex + 1} · {formatDuration(ch.durationSec)}
                  </ThemedText>
                  <ThemedText variant="caption" color="textMuted">
                    {ch.latitude.toFixed(3)}, {ch.longitude.toFixed(3)}
                  </ThemedText>
                </View>
              ))}
            </View>
          )}

          {mediaUris.length > 0 && (
            <View style={{ marginBottom: spacing.md }}>
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

          <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg }}>
            <Button label="Cancel" variant="outline" onPress={() => router.back()} fullWidth />
            <Button label="Submit" onPress={handleSubmit} loading={submitting} fullWidth />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenView>
  );
}

const styles = StyleSheet.create({
  titleIndicator: { width: 4, height: 20, borderRadius: radius.full },
});
