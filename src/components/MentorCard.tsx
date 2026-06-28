import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Avatar from './Avatar';
import Badge from './Badge';
import { colors, radius, spacing, font } from '@/constants/theme';
import type { UserProfile } from '@/types';

export default function MentorCard({ mentor }: { mentor: UserProfile }) {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Avatar name={mentor.name} uri={mentor.avatarUrl} size={48} />
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{mentor.name}</Text>
          {!!mentor.bio && (
            <Text style={styles.bio} numberOfLines={2}>{mentor.bio}</Text>
          )}
        </View>
        <View style={styles.statusWrap}>
          <View
            style={[
              styles.dot,
              { backgroundColor: mentor.isAvailable ? colors.online : colors.offline },
            ]}
          />
          <Text style={styles.statusText}>
            {mentor.isAvailable ? 'Available' : 'Away'}
          </Text>
        </View>
      </View>
      {mentor.expertise.length > 0 && (
        <View style={styles.tags}>
          {mentor.expertise.slice(0, 4).map((e) => (
            <Badge key={e} label={e} tone="primary" />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  name: { fontSize: font.h3, fontWeight: '700', color: colors.text },
  bio: { fontSize: font.small, color: colors.textMuted, marginTop: 2 },
  statusWrap: { alignItems: 'center', gap: 2 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  statusText: { fontSize: font.tiny, color: colors.textMuted, fontWeight: '600' },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.md },
});
