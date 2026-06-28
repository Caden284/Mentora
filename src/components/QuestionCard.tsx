import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Avatar from './Avatar';
import Badge from './Badge';
import MediaTag from './MediaTag';
import { colors, radius, spacing, font } from '@/constants/theme';
import type { Question } from '@/types';

export default function QuestionCard({
  question,
  onPress,
}: {
  question: Question;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <Avatar name={question.authorName} size={36} />
        <View style={{ flex: 1 }}>
          <Text style={styles.author}>{question.authorName}</Text>
          <Text style={styles.time}>
            {new Date(question.$createdAt).toLocaleDateString()}
          </Text>
        </View>
        <Badge
          label={question.status === 'answered' ? 'Answered' : 'Open'}
          tone={question.status === 'answered' ? 'success' : 'accent'}
        />
      </View>

      <Text style={styles.title}>{question.title}</Text>
      {!!question.body && (
        <Text style={styles.body} numberOfLines={2}>
          {question.body}
        </Text>
      )}

      <View style={styles.footer}>
        <Badge label={question.topic} tone="primary" />
        <MediaTag type={question.mediaType} />
        <View style={styles.answers}>
          <Ionicons name="chatbubble-ellipses-outline" size={14} color={colors.textMuted} />
          <Text style={styles.answersText}>{question.answerCount}</Text>
        </View>
      </View>
    </Pressable>
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
  author: { fontWeight: '600', color: colors.text, fontSize: font.small },
  time: { color: colors.textMuted, fontSize: font.tiny },
  title: {
    fontSize: font.h3,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.md,
  },
  body: { color: colors.textMuted, fontSize: font.body, marginTop: spacing.xs },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  answers: { flexDirection: 'row', alignItems: 'center', gap: 4, marginLeft: 'auto' },
  answersText: { color: colors.textMuted, fontSize: font.small, fontWeight: '600' },
});
