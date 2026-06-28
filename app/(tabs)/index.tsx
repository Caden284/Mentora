// Home feed: a scrollable list of recent questions with a topic filter.
import { useCallback, useState } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import QuestionCard from '@/components/QuestionCard';
import EmptyState from '@/components/EmptyState';
import { listQuestions } from '@/services/questions';
import { TOPIC_FILTERS } from '@/constants/topics';
import { useAuth } from '@/context/AuthContext';
import type { Question } from '@/types';
import { colors, spacing, radius, font } from '@/constants/theme';

export default function Feed() {
  const router = useRouter();
  const { profile } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filter, setFilter] = useState<string>('All');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (topic: string) => {
    try {
      const data = await listQuestions(topic);
      setQuestions(data);
    } catch (e) {
      console.warn('[Mentora] feed load error', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load(filter);
    }, [filter, load]),
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.hi}>Hi {profile?.name?.split(' ')[0] ?? 'there'} 👋</Text>
          <Text style={styles.subtitle}>What can the community help with today?</Text>
        </View>
      </View>

      <View>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={TOPIC_FILTERS}
          keyExtractor={(t) => t}
          contentContainerStyle={styles.filters}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => setFilter(item)}
              style={[styles.chip, filter === item && styles.chipActive]}
            >
              <Text style={[styles.chipText, filter === item && styles.chipTextActive]}>{item}</Text>
            </Pressable>
          )}
        />
      </View>

      <FlatList
        data={questions}
        keyExtractor={(q) => q.$id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={() => load(filter)} tintColor={colors.primary} />}
        renderItem={({ item }) => (
          <QuestionCard question={item} onPress={() => router.push(`/question/${item.$id}`)} />
        )}
        ListEmptyComponent={
          !loading ? (
            <EmptyState
              icon="chatbubbles-outline"
              title="No questions yet"
              subtitle="Be the first to ask the community a question."
            />
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.md },
  hi: { fontSize: font.h1, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: font.body, color: colors.textMuted, marginTop: 2 },
  filters: { paddingHorizontal: spacing.lg, gap: spacing.sm, paddingBottom: spacing.md },
  chip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, backgroundColor: colors.surface, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.textMuted, fontWeight: '600', fontSize: font.small },
  chipTextActive: { color: colors.white },
  list: { padding: spacing.lg, paddingTop: 0, flexGrow: 1 },
});
