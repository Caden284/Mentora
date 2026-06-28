// Ask a question: title, body, topic, and optional audio/video media.
import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Button from '@/components/Button';
import MediaPicker from '@/components/MediaPicker';
import { createQuestion } from '@/services/questions';
import { useAuth } from '@/context/AuthContext';
import { TOPICS } from '@/constants/topics';
import type { MediaType } from '@/types';
import type { LocalFile } from '@/services/storage';
import { colors, spacing, radius, font } from '@/constants/theme';

export default function Ask() {
  const router = useRouter();
  const { profile } = useAuth();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [topic, setTopic] = useState<string>(TOPICS[0]);
  const [mediaType, setMediaType] = useState<MediaType>('text');
  const [media, setMedia] = useState<LocalFile | undefined>();
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!profile) return;
    if (!title.trim()) {
      Alert.alert('Add a title', 'Give your question a short, clear title.');
      return;
    }
    if (mediaType !== 'text' && !media) {
      Alert.alert('Attach media', `Record or choose a ${mediaType} clip, or switch to Text.`);
      return;
    }
    try {
      setLoading(true);
      const q = await createQuestion({
        author: profile,
        title: title.trim(),
        body: body.trim(),
        topic,
        mediaType,
        media,
      });
      setTitle('');
      setBody('');
      setMedia(undefined);
      setMediaType('text');
      router.push(`/question/${q.$id}`);
    } catch (e: any) {
      Alert.alert('Could not post', e?.message ?? 'Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>Ask a question</Text>
        <Text style={styles.sub}>A mentor will answer when they're free.</Text>

        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="e.g. How do I prepare for a PM interview?"
          placeholderTextColor={colors.textMuted}
        />

        <Text style={styles.label}>Details (optional)</Text>
        <TextInput
          style={[styles.input, styles.textarea]}
          value={body}
          onChangeText={setBody}
          placeholder="Add any context that helps a mentor answer well."
          placeholderTextColor={colors.textMuted}
          multiline
        />

        <Text style={styles.label}>Topic</Text>
        <View style={styles.topics}>
          {TOPICS.map((t) => (
            <Pressable
              key={t}
              onPress={() => setTopic(t)}
              style={[styles.topic, topic === t && styles.topicActive]}
            >
              <Text style={[styles.topicText, topic === t && styles.topicTextActive]}>{t}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Format</Text>
        <MediaPicker mediaType={mediaType} onChangeType={setMediaType} onPick={setMedia} />

        <Button label="Post question" onPress={submit} loading={loading} style={{ marginTop: spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing.lg, paddingBottom: spacing.xxl },
  heading: { fontSize: font.h1, fontWeight: '800', color: colors.text },
  sub: { fontSize: font.body, color: colors.textMuted, marginBottom: spacing.md },
  label: { fontSize: font.small, fontWeight: '700', color: colors.text, marginTop: spacing.lg, marginBottom: spacing.xs },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: font.body,
    color: colors.text,
  },
  textarea: { minHeight: 100, textAlignVertical: 'top' },
  topics: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  topic: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.pill, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  topicActive: { backgroundColor: colors.primaryLight, borderColor: colors.primary },
  topicText: { color: colors.textMuted, fontWeight: '600', fontSize: font.small },
  topicTextActive: { color: colors.primaryDark },
});
