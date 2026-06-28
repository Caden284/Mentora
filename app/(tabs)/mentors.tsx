// Mentor directory with an "available only" toggle.
import { useCallback, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import MentorCard from '@/components/MentorCard';
import EmptyState from '@/components/EmptyState';
import { listMentors } from '@/services/mentors';
import type { UserProfile } from '@/types';
import { colors, spacing, font } from '@/constants/theme';

export default function Mentors() {
  const [mentors, setMentors] = useState<UserProfile[]>([]);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (onlyAvailable: boolean) => {
    try {
      setMentors(await listMentors(onlyAvailable));
    } catch (e) {
      console.warn('[Mentora] mentors load error', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load(availableOnly);
    }, [availableOnly, load]),
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.heading}>Mentors</Text>
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Available now</Text>
          <Switch
            value={availableOnly}
            onValueChange={setAvailableOnly}
            trackColor={{ true: colors.primary, false: colors.border }}
            thumbColor={colors.white}
          />
        </View>
      </View>

      <FlatList
        data={mentors}
        keyExtractor={(m) => m.$id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => <MentorCard mentor={item} />}
        ListEmptyComponent={
          !loading ? (
            <EmptyState
              icon="people-outline"
              title="No mentors yet"
              subtitle="Become a mentor from your Profile tab to appear here."
            />
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  heading: { fontSize: font.h1, fontWeight: '800', color: colors.text },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  toggleLabel: { fontSize: font.small, color: colors.textMuted, fontWeight: '600' },
  list: { padding: spacing.lg, paddingTop: 0, flexGrow: 1 },
});
