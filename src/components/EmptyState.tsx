import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, font } from '@/constants/theme';

export default function EmptyState({
  icon = 'sparkles-outline',
  title,
  subtitle,
}: {
  icon?: any;
  title: string;
  subtitle?: string;
}) {
  return (
    <View style={styles.wrap}>
      <Ionicons name={icon} size={40} color={colors.offline} />
      <Text style={styles.title}>{title}</Text>
      {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', padding: spacing.xxl, gap: spacing.sm },
  title: { fontSize: font.h3, fontWeight: '700', color: colors.text, marginTop: spacing.sm },
  subtitle: { fontSize: font.body, color: colors.textMuted, textAlign: 'center' },
});
