// Searchable knowledge base over the Q&A corpus.
import { useEffect, useState, useCallback } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import QuestionCard from '@/components/QuestionCard';
import EmptyState from '@/components/EmptyState';
import { searchKnowledgeBase } from '@/services/questions';
import type { Question } from '@/types';
import { colors, spacing, radius, font } from '@/constants/theme';

export default function Search() {
  const router = useRouter();
  const [term, setTerm] = useState('');
  const [results, setResults] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);

  const run = useCallback(async (q: string) => {
    try {
      setLoading(true);
      setResults(await searchKnowledgeBase(q));
    } catch (e) {
      console.warn('[Mentora] search error', e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce typing so we don't hammer the API.
  useEffect(() => {
    const t = setTimeout(() => run(term), 350);
    return () => clearTimeout(t);
  }, [term, run]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.heading}>Knowledge base</Text>
        <Text style={styles.sub}>Search answered questions from the community.</Text>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            value={term}
            onChangeText={setTerm}
            placeholder="Search e.g. 'resume', 'react state'…"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
            returnKeyType="search"
          />
        </View>
      </View>

      <FlatList
        data={results}
        keyExtractor={(q) => q.$id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <QuestionCard question={item} onPress={() => router.push(`/question/${item.$id}`)} />
        )}
        ListEmptyComponent={
          !loading ? (
            <EmptyState
              icon="search-outline"
              title={term ? 'No matches' : 'Start typing to search'}
              subtitle={term ? 'Try a different keyword.' : 'Answered questions appear here as a growing library.'}
            />
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  heading: { fontSize: font.h1, fontWeight: '800', color: colors.text },
  sub: { fontSize: font.body, color: colors.textMuted, marginTop: 2, marginBottom: spacing.md },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    height: 48,
  },
  searchInput: { flex: 1, fontSize: font.body, color: colors.text },
  list: { padding: spacing.lg, flexGrow: 1 },
});
