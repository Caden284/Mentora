import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/Button';
import { colors, spacing, radius, font } from '@/constants/theme';

export default function SignUp() {
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handle() {
    if (!name || !email || !password) {
      Alert.alert('Missing info', 'Fill in all fields.');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Weak password', 'Use at least 8 characters.');
      return;
    }
    try {
      setLoading(true);
      await signUp(email.trim(), password, name.trim());
    } catch (e: any) {
      Alert.alert('Sign up failed', e?.message ?? 'Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <Text style={styles.logo}>Create account</Text>
        <View style={styles.form}>
          <Text style={styles.label}>Name</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Jordan Lee" placeholderTextColor={colors.textMuted} />
          <Text style={styles.label}>Email</Text>
          <TextInput style={styles.input} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="you@example.com" placeholderTextColor={colors.textMuted} />
          <Text style={styles.label}>Password</Text>
          <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry placeholder="At least 8 characters" placeholderTextColor={colors.textMuted} />
          <Button label="Sign up" onPress={handle} loading={loading} style={{ marginTop: spacing.lg }} />
        </View>
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Link href="/(auth)/sign-in" asChild>
            <Pressable><Text style={styles.link}>Sign in</Text></Pressable>
          </Link>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, padding: spacing.xl, justifyContent: 'center' },
  logo: { fontSize: 30, fontWeight: '800', color: colors.text, textAlign: 'center' },
  form: { marginTop: spacing.xl },
  label: { fontSize: font.small, fontWeight: '600', color: colors.text, marginBottom: spacing.xs, marginTop: spacing.md },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    height: 48,
    fontSize: font.body,
    color: colors.text,
  },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.xl },
  footerText: { color: colors.textMuted, fontSize: font.body },
  link: { color: colors.primary, fontWeight: '700', fontSize: font.body },
});
