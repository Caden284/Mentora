// Lightweight audio/video player for question + answer media, built on expo-av.
import React, { useRef, useState } from 'react';
import { View, Pressable, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Audio, Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, font } from '@/constants/theme';
import type { MediaType } from '@/types';

export default function MediaPlayer({
  type,
  url,
}: {
  type: MediaType;
  url?: string;
}) {
  if (!url || type === 'text') return null;
  if (type === 'video') return <VideoPlayer url={url} />;
  return <AudioPlayer url={url} />;
}

function VideoPlayer({ url }: { url: string }) {
  return (
    <Video
      style={styles.video}
      source={{ uri: url }}
      useNativeControls
      resizeMode={ResizeMode.CONTAIN}
    />
  );
}

function AudioPlayer({ url }: { url: string }) {
  const sound = useRef<Audio.Sound | null>(null);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    try {
      if (!sound.current) {
        setLoading(true);
        await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
        const { sound: s } = await Audio.Sound.createAsync(
          { uri: url },
          { shouldPlay: true },
        );
        sound.current = s;
        s.setOnPlaybackStatusUpdate((st: AVPlaybackStatus) => {
          if (st.isLoaded && st.didJustFinish) {
            setPlaying(false);
            s.setPositionAsync(0);
          }
        });
        setLoading(false);
        setPlaying(true);
        return;
      }
      const status = await sound.current.getStatusAsync();
      if (status.isLoaded && status.isPlaying) {
        await sound.current.pauseAsync();
        setPlaying(false);
      } else {
        await sound.current.playAsync();
        setPlaying(true);
      }
    } catch (e) {
      setLoading(false);
      console.warn('[Mentora] audio playback error', e);
    }
  }

  return (
    <Pressable style={styles.audio} onPress={toggle}>
      {loading ? (
        <ActivityIndicator color={colors.primary} />
      ) : (
        <Ionicons
          name={playing ? 'pause-circle' : 'play-circle'}
          size={34}
          color={colors.primary}
        />
      )}
      <Text style={styles.audioLabel}>
        {playing ? 'Playing audio…' : 'Play audio response'}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  video: {
    width: '100%',
    height: 200,
    borderRadius: radius.md,
    backgroundColor: '#000',
    marginTop: spacing.sm,
  },
  audio: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primaryLight,
    padding: spacing.md,
    borderRadius: radius.md,
    marginTop: spacing.sm,
  },
  audioLabel: { color: colors.primaryDark, fontWeight: '600', fontSize: font.body },
});
