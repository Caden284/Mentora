import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, font } from '@/constants/theme';
import type { MediaType } from '@/types';

const map = {
  text: { icon: 'document-text-outline', label: 'Text' },
  audio: { icon: 'mic-outline', label: 'Audio' },
  video: { icon: 'videocam-outline', label: 'Video' },
} as const;

export default function MediaTag({ type }: { type: MediaType }) {
  if (type === 'text') return null;
  const m = map[type];
  return (
    <View style={styles.base}>
      <Ionicons name={m.icon as any} size={12} color={colors.primaryDark} />
      <Text style={styles.text}>{m.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  text: { fontSize: font.tiny, color: colors.primaryDark, fontWeight: '600' },
});
