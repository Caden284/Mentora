import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Avatar from './Avatar';
import MediaPlayer from './MediaPlayer';
import { colors, radius, spacing, font } from '@/constants/theme';
import type { Answer } from '@/types';

export default function AnswerCard({
  answer,
  onUpvote,
}: {
  answer: Answer;
  onUpvote: () => void;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Avatar name={answer.mentorName} size={32} />
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{answer.mentorName}</Text>
          <Text style={styles.time}>{new Date(answer.$createdAt).toLocaleDateString()}</Text>
        </View>
        <Pressable style={styles.upvote} onPress={onUpvote}>
          <Ionicons name="arrow-up-circle-outline" size={18} color={colors.primary} />
          <Text style={styles.upvoteText}>{answer.upvotes}</Text>
        </Pressable>
      </View>
      {!!answer.body && <Text style={styles.body}>{answer.body}</Text>}
      <MediaPlayer type={answer.mediaType} url={answer.mediaUrl} />
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
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  name: { fontWeight: '700', color: colors.text, fontSize: font.small },
  time: { color: colors.textMuted, fontSize: font.tiny },
  upvote: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  upvoteText: { color: colors.primary, fontWeight: '700', fontSize: font.small },
  body: { color: colors.text, fontSize: font.body, marginTop: spacing.sm, lineHeight: 21 },
});
