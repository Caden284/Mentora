// Lets a user attach audio or video to a question/answer using expo-image-picker
// (video) and a recorded audio clip via expo-av. Returns a LocalFile descriptor.
import React, { useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, font } from '@/constants/theme';
import type { MediaType } from '@/types';
import type { LocalFile } from '@/services/storage';

interface Props {
  mediaType: MediaType;
  onChangeType: (t: MediaType) => void;
  onPick: (file: LocalFile | undefined) => void;
}

export default function MediaPicker({ mediaType, onChangeType, onPick }: Props) {
  const [picked, setPicked] = useState<string | null>(null);
  const recording = useRef<Audio.Recording | null>(null);
  const [recordingNow, setRecordingNow] = useState(false);

  function selectType(t: MediaType) {
    setPicked(null);
    onPick(undefined);
    onChangeType(t);
  }

  async function pickVideo() {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['videos'],
      quality: 0.7,
    });
    if (!res.canceled) {
      const a = res.assets[0];
      setPicked(a.fileName ?? 'video.mp4');
      onPick({
        uri: a.uri,
        name: a.fileName ?? `video-${Date.now()}.mp4`,
        type: a.mimeType ?? 'video/mp4',
        size: a.fileSize ?? 0,
      });
    }
  }

  async function toggleRecording() {
    try {
      if (!recordingNow) {
        const perm = await Audio.requestPermissionsAsync();
        if (!perm.granted) return;
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });
        const { recording: rec } = await Audio.Recording.createAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY,
        );
        recording.current = rec;
        setRecordingNow(true);
      } else {
        const rec = recording.current!;
        await rec.stopAndUnloadAsync();
        const uri = rec.getURI()!;
        setRecordingNow(false);
        setPicked('recording.m4a');
        onPick({
          uri,
          name: `audio-${Date.now()}.m4a`,
          type: 'audio/m4a',
          size: 0,
        });
      }
    } catch (e) {
      console.warn('[Mentora] recording error', e);
      setRecordingNow(false);
    }
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.tabs}>
        {(['text', 'audio', 'video'] as MediaType[]).map((t) => (
          <Pressable
            key={t}
            onPress={() => selectType(t)}
            style={[styles.tab, mediaType === t && styles.tabActive]}
          >
            <Ionicons
              name={
                t === 'text'
                  ? 'document-text-outline'
                  : t === 'audio'
                  ? 'mic-outline'
                  : 'videocam-outline'
              }
              size={16}
              color={mediaType === t ? colors.white : colors.textMuted}
            />
            <Text style={[styles.tabText, mediaType === t && styles.tabTextActive]}>
              {t[0].toUpperCase() + t.slice(1)}
            </Text>
          </Pressable>
        ))}
      </View>

      {mediaType === 'video' && (
        <Pressable style={styles.action} onPress={pickVideo}>
          <Ionicons name="cloud-upload-outline" size={18} color={colors.primary} />
          <Text style={styles.actionText}>
            {picked ? `Attached: ${picked}` : 'Choose a video'}
          </Text>
        </Pressable>
      )}

      {mediaType === 'audio' && (
        <Pressable style={styles.action} onPress={toggleRecording}>
          <Ionicons
            name={recordingNow ? 'stop-circle' : 'mic'}
            size={18}
            color={recordingNow ? colors.danger : colors.primary}
          />
          <Text style={styles.actionText}>
            {recordingNow
              ? 'Recording… tap to stop'
              : picked
              ? 'Audio recorded — re-record?'
              : 'Tap to record audio'}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  tabs: { flexDirection: 'row', gap: spacing.sm },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
  },
  tabActive: { backgroundColor: colors.primary },
  tabText: { fontSize: font.small, color: colors.textMuted, fontWeight: '600' },
  tabTextActive: { color: colors.white },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    borderRadius: radius.md,
    padding: spacing.md,
  },
  actionText: { color: colors.primary, fontWeight: '600', fontSize: font.small },
});
