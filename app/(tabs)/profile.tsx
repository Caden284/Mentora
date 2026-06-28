// Profile: avatar, become-a-mentor, availability toggle, expertise, bio, sign out.
import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TextInput,
  Pressable,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Avatar from '@/components/Avatar';
import Button from '@/components/Button';
import Badge from '@/components/Badge';
import { useAuth } from '@/context/AuthContext';
import { updateProfile } from '@/services/auth';
import { TOPICS } from '@/constants/topics';
import { colors, spacing, radius, font } from '@/constants/theme';

export default function Profile() {
  const { profile, signOut, setProfile, refresh } = useAuth();
  const [bio, setBio] = useState(profile?.bio ?? '');
  const [expertise, setExpertise] = useState<string[]>(profile?.expertise ?? []);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setBio(profile?.bio ?? '');
    setExpertise(profile?.expertise ?? []);
  }, [profile?.$id]);

  if (!profile) return null;

  async function patch(data: Parameters<typeof updateProfile>[1]) {
    const updated = await updateProfile(profile!.$id, data);
    setProfile(updated);
  }

  async function toggleMentor(value: boolean) {
    try {
      await patch({ isMentor: value, isAvailable: value ? profile!.isAvailable : false });
    } catch (e: any) {
      Alert.alert('Update failed', e?.message ?? 'Try again.');
    }
  }

  async function toggleAvailable(value: boolean) {
    try {
      await patch({ isAvailable: value });
    } catch (e: any) {
      Alert.alert('Update failed', e?.message ?? 'Try again.');
    }
  }

  function toggleExpertise(tag: string) {
    setExpertise((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  }

  async function saveDetails() {
    try {
      setSaving(true);
      await patch({ bio: bio.trim(), expertise });
      Alert.alert('Saved', 'Your mentor profile is up to date.');
    } catch (e: any) {
      Alert.alert('Save failed', e?.message ?? 'Try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.head}>
          <Avatar name={profile.name} uri={profile.avatarUrl} size={72} />
          <Text style={styles.name}>{profile.name}</Text>
          <Text style={styles.email}>{profile.email}</Text>
          {profile.isMentor && (
            <Badge label={profile.isAvailable ? 'Mentor · Available' : 'Mentor · Away'} tone={profile.isAvailable ? 'success' : 'neutral'} />
          )}
        </View>

        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>Become a mentor</Text>
              <Text style={styles.rowSub}>Answer questions and appear in the directory.</Text>
            </View>
            <Switch
              value={profile.isMentor}
              onValueChange={toggleMentor}
              trackColor={{ true: colors.primary, false: colors.border }}
              thumbColor={colors.white}
            />
          </View>

          {profile.isMentor && (
            <View style={[styles.rowBetween, styles.rowDivider]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>Available to answer</Text>
                <Text style={styles.rowSub}>Toggle off when you're busy.</Text>
              </View>
              <Switch
                value={profile.isAvailable}
                onValueChange={toggleAvailable}
                trackColor={{ true: colors.online, false: colors.border }}
                thumbColor={colors.white}
              />
            </View>
          )}
        </View>

        {profile.isMentor && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Your expertise</Text>
            <View style={styles.tags}>
              {TOPICS.map((t) => (
                <Pressable
                  key={t}
                  onPress={() => toggleExpertise(t)}
                  style={[styles.tag, expertise.includes(t) && styles.tagActive]}
                >
                  <Text style={[styles.tagText, expertise.includes(t) && styles.tagTextActive]}>{t}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={[styles.sectionTitle, { marginTop: spacing.lg }]}>Short bio</Text>
            <TextInput
              style={styles.bio}
              value={bio}
              onChangeText={setBio}
              placeholder="Tell mentees what you can help with."
              placeholderTextColor={colors.textMuted}
              multiline
            />
            <Button label="Save details" onPress={saveDetails} loading={saving} style={{ marginTop: spacing.md }} />
          </View>
        )}

        <Button label="Sign out" variant="outline" onPress={signOut} style={{ marginTop: spacing.lg }} />
        <Pressable onPress={refresh} style={{ marginTop: spacing.md, alignItems: 'center' }}>
          <Text style={styles.refresh}>Refresh profile</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing.lg, paddingBottom: spacing.xxl },
  head: { alignItems: 'center', gap: spacing.xs, marginBottom: spacing.lg },
  name: { fontSize: font.h2, fontWeight: '800', color: colors.text, marginTop: spacing.sm },
  email: { fontSize: font.small, color: colors.textMuted },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  rowBetween: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  rowDivider: { borderTopWidth: 1, borderTopColor: colors.border, marginTop: spacing.md, paddingTop: spacing.md },
  rowTitle: { fontSize: font.body, fontWeight: '700', color: colors.text },
  rowSub: { fontSize: font.small, color: colors.textMuted, marginTop: 2 },
  sectionTitle: { fontSize: font.body, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  tag: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.pill, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border },
  tagActive: { backgroundColor: colors.primaryLight, borderColor: colors.primary },
  tagText: { color: colors.textMuted, fontWeight: '600', fontSize: font.small },
  tagTextActive: { color: colors.primaryDark },
  bio: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    minHeight: 80,
    textAlignVertical: 'top',
    fontSize: font.body,
    color: colors.text,
  },
  refresh: { color: colors.primary, fontWeight: '600', fontSize: font.small },
});
