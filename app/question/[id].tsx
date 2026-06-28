// Question detail: full question + media, all answers, and an answer composer
// shown only to mentors.
import { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useFocusEffect } from 'expo-router';
import Avatar from '@/components/Avatar';
import Badge from '@/components/Badge';
import Button from '@/components/Button';
import MediaPlayer from '@/components/MediaPlayer';
import MediaPicker from '@/components/MediaPicker';
import AnswerCard from '@/components/AnswerCard';
import EmptyState from '@/components/EmptyState';
import { getQuestion } from '@/services/questions';
import { listAnswers, createAnswer, upvoteAnswer } from '@/services/answers';
import { useAuth } from '@/context/AuthContext';
import type { Question, Answer, MediaType } from '@/types';
import type { LocalFile } from '@/services/storage';
import { colors, spacing, radius, font } from '@/constants/theme';

export default function QuestionDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile } = useAuth();
  const [question, setQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);

  const [body, setBody] = useState('');
  const [mediaType, setMediaType] = useState<MediaType>('text');
  const [media, setMedia] = useState<LocalFile | undefined>();
  const [posting, setPosting] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const [q, a] = await Promise.all([getQuestion(id), listAnswers(id)]);
      setQuestion(q);
      setAnswers(a);
    } catch (e) {
      console.warn('[Mentora] detail load error', e);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  async function submitAnswer() {
    if (!profile || !question) return;
    if (!body.trim() && mediaType === 'text') {
      Alert.alert('Write an answer', 'Add some text or attach media.');
      return;
    }
    if (mediaType !== 'text' && !media) {
      Alert.alert('Attach media', `Record or choose a ${mediaType} clip.`);
      return;
    }
    try {
      setPosting(true);
      await createAnswer({ question, mentor: profile, body: body.trim(), mediaType, media });
      setBody('');
      setMedia(undefined);
      setMediaType('text');
      await load();
    } catch (e: any) {
      Alert.alert('Could not post', e?.message ?? 'Try again.');
    } finally {
      setPosting(false);
    }
  }

  async function handleUpvote(answer: Answer) {
    try {
      const updated = await upvoteAnswer(answer);
      setAnswers((prev) => prev.map((a) => (a.$id === updated.$id ? updated : a)).sort((x, y) => y.upvotes - x.upvotes));
    } catch (e) {
      console.warn('[Mentora] upvote error', e);
    }
  }

  if (loading) {
    return (
      <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>
    );
  }
  if (!question) {
    return <EmptyState icon="alert-circle-outline" title="Question not found" />;
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.qHeader}>
          <Avatar name={question.authorName} size={36} />
          <View style={{ flex: 1 }}>
            <Text style={styles.author}>{question.authorName}</Text>
            <Text style={styles.time}>{new Date(question.$createdAt).toLocaleString()}</Text>
          </View>
          <Badge
            label={question.status === 'answered' ? 'Answered' : 'Open'}
            tone={question.status === 'answered' ? 'success' : 'accent'}
          />
        </View>

        <Text style={styles.title}>{question.title}</Text>
        {!!question.body && <Text style={styles.body}>{question.body}</Text>}
        <MediaPlayer type={question.mediaType} url={question.mediaUrl} />
        <View style={{ marginTop: spacing.md }}>
          <Badge label={question.topic} tone="primary" />
        </View>

        <Text style={styles.section}>
          {answers.length} {answers.length === 1 ? 'Answer' : 'Answers'}
        </Text>

        {answers.map((a) => (
          <AnswerCard key={a.$id} answer={a} onUpvote={() => handleUpvote(a)} />
        ))}
        {answers.length === 0 && (
          <Text style={styles.noAnswers}>No answers yet. A mentor will respond soon.</Text>
        )}

        {profile?.isMentor ? (
          <View style={styles.composer}>
            <Text style={styles.composerTitle}>Write an answer</Text>
            <TextInput
              style={styles.input}
              value={body}
              onChangeText={setBody}
              placeholder="Share your guidance…"
              placeholderTextColor={colors.textMuted}
              multiline
            />
            <View style={{ marginTop: spacing.sm }}>
              <MediaPicker mediaType={mediaType} onChangeType={setMediaType} onPick={setMedia} />
            </View>
            <Button label="Post answer" onPress={submitAnswer} loading={posting} style={{ marginTop: spacing.md }} />
          </View>
        ) : (
          <View style={styles.mentorHint}>
            <Text style={styles.mentorHintText}>
              Turn on “Become a mentor” in your Profile to answer questions.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  container: { padding: spacing.lg, paddingBottom: spacing.xxl },
  qHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  author: { fontWeight: '700', color: colors.text, fontSize: font.small },
  time: { color: colors.textMuted, fontSize: font.tiny },
  title: { fontSize: font.h2, fontWeight: '800', color: colors.text, marginTop: spacing.md },
  body: { fontSize: font.body, color: colors.text, marginTop: spacing.sm, lineHeight: 22 },
  section: { fontSize: font.h3, fontWeight: '800', color: colors.text, marginTop: spacing.xl, marginBottom: spacing.md },
  noAnswers: { color: colors.textMuted, fontSize: font.body, fontStyle: 'italic' },
  composer: {
    marginTop: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  composerTitle: { fontSize: font.body, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    minHeight: 90,
    textAlignVertical: 'top',
    fontSize: font.body,
    color: colors.text,
  },
  mentorHint: { marginTop: spacing.xl, padding: spacing.lg, backgroundColor: colors.primaryLight, borderRadius: radius.md },
  mentorHintText: { color: colors.primaryDark, fontSize: font.small, textAlign: 'center', fontWeight: '600' },
});
