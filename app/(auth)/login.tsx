import AfriButton from '@/components/ui/AfriButton';
import { Colors } from '@/constants/colors';
import { login } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function LoginScreen() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const setUser = useAuthStore((s) => s.setUser);

  async function handleLogin() {
    if (!phone.trim() || !password.trim()) {
      Alert.alert('Champs requis', 'Veuillez renseigner votre numéro et mot de passe.');
      return;
    }
    setLoading(true);
    try {
      const res = await login(phone.trim(), password);
      setUser(res.user);
      router.replace('/(tabs)');
    } catch (e: any) {
      Alert.alert('Connexion échouée', e.message ?? 'Erreur inattendue');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.logo}>AfriMarket</Text>
          <View style={styles.taglineRow}>
            <View style={styles.dot} />
            <Text style={styles.tagline}>Marché vivant, livraison groupée</Text>
          </View>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <View style={styles.orangeTop} />
          <View style={styles.inner}>
            <Text style={styles.title}>Bon retour 👋</Text>
            <Text style={styles.subtitle}>Connectez-vous à votre compte consommateur</Text>

            <View style={styles.field}>
              <Text style={styles.label}>Numéro de téléphone</Text>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="+237 6XX XXX XXX"
                placeholderTextColor={Colors.textDim}
                keyboardType="phone-pad"
                autoComplete="tel"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Mot de passe</Text>
              <View style={styles.pwdRow}>
                <TextInput
                  style={[styles.input, { flex: 1, borderWidth: 0 }]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor={Colors.textDim}
                  secureTextEntry={!showPwd}
                />
                <TouchableOpacity onPress={() => setShowPwd(!showPwd)} style={styles.eyeBtn}>
                  <Text style={{ fontSize: 16 }}>{showPwd ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => router.push('/(auth)/forgot-password' as any)}
              style={styles.forgotRow}
            >
              <Text style={styles.forgotLink}>Mot de passe oublié ?</Text>
            </TouchableOpacity>

            <AfriButton
              label="Se connecter"
              onPress={handleLogin}
              loading={loading}
              size="lg"
              style={{ marginTop: 4 }}
            />

            <View style={styles.divider}>
              <View style={styles.line} />
              <Text style={styles.orText}>ou</Text>
              <View style={styles.line} />
            </View>

            <TouchableOpacity onPress={() => router.push('/(auth)/register')} style={styles.linkRow}>
              <Text style={styles.link}>
                Pas encore de compte ?{' '}
                <Text style={{ color: Colors.orange, fontFamily: 'DMSans_600SemiBold' }}>
                  Créer un compte
                </Text>
              </Text>
            </TouchableOpacity>

            <View style={styles.demoBox}>
              <Text style={styles.demoText}>Demo : +237677000001 / Test@2026</Text>
            </View>
          </View>
        </View>

        <Text style={styles.footer}>AfriMarket v1.0 · Yaoundé, Cameroun 🇨🇲</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  hero: { alignItems: 'center', marginBottom: 32 },
  logo: {
    fontFamily: 'Fraunces_700Bold_Italic',
    fontSize: 42,
    color: Colors.orange,
    letterSpacing: 0.5,
  },
  taglineRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.green },
  tagline: { fontFamily: 'DMSans_400Regular', fontSize: 13, color: Colors.textSecondary },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 4,
    marginBottom: 24,
  },
  orangeTop: { height: 4, backgroundColor: Colors.orange },
  inner: { padding: 24, gap: 4 },
  title: {
    fontFamily: 'Fraunces_700Bold',
    fontSize: 26,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  field: { marginBottom: 14 },
  label: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 10,
    letterSpacing: 0.1,
    textTransform: 'uppercase',
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.bg,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 14,
    fontFamily: 'DMSans_400Regular',
    fontSize: 15,
    color: Colors.textPrimary,
  },
  pwdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bg,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
  },
  eyeBtn: { padding: 14 },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 16,
  },
  line: { flex: 1, height: 1, backgroundColor: Colors.border },
  orText: { fontFamily: 'DMSans_400Regular', fontSize: 12, color: Colors.textDim },
  forgotRow: { alignItems: 'flex-end', marginBottom: 4 },
  forgotLink: { fontFamily: 'DMSans_400Regular', fontSize: 13, color: Colors.orange },
  linkRow: { alignItems: 'center' },
  link: { fontFamily: 'DMSans_400Regular', fontSize: 13, color: Colors.textSecondary },
  demoBox: {
    marginTop: 16,
    backgroundColor: Colors.bgLight,
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  demoText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 11,
    color: Colors.textDim,
    textAlign: 'center',
  },
  footer: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 11,
    color: Colors.textDim,
    textAlign: 'center',
  },
});
