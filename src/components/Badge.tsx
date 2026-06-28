import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, font } from '@/constants/theme';

export default function Badge({
  label,
  tone = 'neutral',
}: {
  label: string;
  tone?: 'neutral' | 'primary' | 'success' | 'accent';
}) {
  return (
    <View style={[styles.base, styles[tone]]}>
      <Text style={[styles.text, tone !== 'neutral' && styles.textStrong]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
  neutral: { backgroundColor: colors.border },
  primary: { backgroundColor: colors.primaryLight },
  success: { backgroundColor: '#D8F1E2' },
  accent: { backgroundColor: '#FBE6D2' },
  text: { fontSize: font.tiny, color: colors.textMuted, fontWeight: '600' },
  textStrong: { color: colors.text },
});
