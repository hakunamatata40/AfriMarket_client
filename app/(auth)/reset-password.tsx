import AfriButton from '@/components/ui/AfriButton';
import { Colors } from '@/constants/colors';
import { API } from '@/constants/api';
import { apiPost } from '@/services/api';
import { router, useLocalSearchParams } from 'expo-router';
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

function StrengthBar({ password }: { password: string }) {
  const len = password.length;
  const hasUpper = /[A-Z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSpecial = /[^a-zA-Z0-9]/.test(password);
  const score = (len >= 6 ? 1 : 0) + (len >= 10 ? 1 : 0) + (hasUpper ? 1 : 0) + (hasDigit ? 1 : 0) + (hasSpecial ? 1 : 0);
  const labels = ['', 'Trop court', 'Faible', 'Moyen', 'Fort', 'Très fort'];
  const colors = ['', Colors.red, Colors.red, Colors.amber, Colors.green, Colors.green];

  if (!password) return null;
  return (
    <View style={{ marginTop: 6, gap: 4 }}>
      <View style={{ flexDirection: 'row', gap: 4 }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <View
            key={i}
            style={{
              flex: 1, height: 4, borderRadius: 2,
              backgroundColor: i <= score ? colors[score] : Colors.shimmer1,
            }}
          />
        ))}
      </View>
      <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 11, color: colors[score] }}>
        {labels[score]}
      </Text>
    </View>
  );
}

export default function ResetPasswordScreen() {
  const { phone, otp } = useLocalSearchParams<{ phone: string; otp: string }>();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleReset() {
    if (password.length < 6) {
      Alert.alert('Mot de passe trop court', 'Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    if (password !== confirm) {
      Alert.alert('Mots de passe différents', 'Les deux mots de passe ne correspondent pas.');
      return;
    }
    setLoading(true);
    try {
      await apiPost(API.RESET_PASSWORD, { phone, otp, newPassword: password }, false);
      Alert.alert(
        '✅ Mot de passe réinitialisé',
        'Votre mot de passe a été modifié avec succès. Vous pouvez vous connecter.',
        [{ text: 'Se connecter', onPress: () => router.replace('/(auth)/login') }]
      );
    } catch (e: any) {
      Alert.alert('Erreur', e.message ?? 'Session expirée. Recommencez depuis le début.');
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
        </View>

        {/* Card */}
        <View style={styles.card}>
          <View style={styles.orangeTop} />
          <View style={styles.inner}>

            <View style={styles.iconWrap}>
              <Text style={styles.icon}>🔒</Text>
            </View>

            <Text style={styles.title}>Nouveau mot de passe</Text>
            <Text style={styles.subtitle}>
              Choisissez un mot de passe sécurisé d'au moins 6 caractères.
            </Text>

            {/* Nouveau mot de passe */}
            <View style={styles.field}>
              <Text style={styles.label}>Nouveau mot de passe</Text>
              <View style={styles.pwdRow}>
                <TextInput
                  style={[styles.input, { flex: 1, borderWidth: 0 }]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor={Colors.textDim}
                  secureTextEntry={!showPwd}
                  autoFocus
                />
                <TouchableOpacity onPress={() => setShowPwd(!showPwd)} style={styles.eyeBtn}>
                  <Text style={{ fontSize: 16 }}>{showPwd ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              </View>
              <StrengthBar password={password} />
            </View>

            {/* Confirmation */}
            <View style={styles.field}>
              <Text style={styles.label}>Confirmer le mot de passe</Text>
              <View style={[
                styles.pwdRow,
                confirm.length > 0 && password !== confirm && styles.pwdRowError,
              ]}>
                <TextInput
                  style={[styles.input, { flex: 1, borderWidth: 0 }]}
                  value={confirm}
                  onChangeText={setConfirm}
                  placeholder="••••••••"
                  placeholderTextColor={Colors.textDim}
                  secureTextEntry={!showConfirm}
                />
                <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} style={styles.eyeBtn}>
                  <Text style={{ fontSize: 16 }}>{showConfirm ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              </View>
              {confirm.length > 0 && password !== confirm && (
                <Text style={styles.errorText}>Les mots de passe ne correspondent pas</Text>
              )}
              {confirm.length > 0 && password === confirm && (
                <Text style={styles.okText}>✓ Les mots de passe correspondent</Text>
              )}
            </View>

            <AfriButton
              label="Réinitialiser le mot de passe →"
              onPress={handleReset}
              loading={loading}
              size="lg"
              style={{ marginTop: 8 }}
            />

            <TouchableOpacity onPress={() => router.replace('/(auth)/login')} style={styles.backRow}>
              <Text style={styles.backLink}>← Retour à la connexion</Text>
            </TouchableOpacity>
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
  logo: { fontFamily: 'Fraunces_700Bold_Italic', fontSize: 42, color: Colors.orange, letterSpacing: 0.5 },
  card: {
    backgroundColor: Colors.card, borderRadius: 24, overflow: 'hidden',
    borderWidth: 1, borderColor: Colors.border,
    shadowColor: Colors.cardShadow, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1, shadowRadius: 16, elevation: 4, marginBottom: 24,
  },
  orangeTop: { height: 4, backgroundColor: Colors.orange },
  inner: { padding: 24, gap: 4 },
  iconWrap: { alignItems: 'center', marginBottom: 8 },
  icon: { fontSize: 40 },
  title: { fontFamily: 'Fraunces_700Bold', fontSize: 24, color: Colors.textPrimary, textAlign: 'center', marginBottom: 8 },
  subtitle: { fontFamily: 'DMSans_400Regular', fontSize: 13, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  field: { marginBottom: 14 },
  label: {
    fontFamily: 'DMSans_600SemiBold', fontSize: 10, letterSpacing: 0.1,
    textTransform: 'uppercase', color: Colors.textSecondary, marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.bg, borderWidth: 1, borderColor: Colors.border,
    borderRadius: 12, padding: 14,
    fontFamily: 'DMSans_400Regular', fontSize: 15, color: Colors.textPrimary,
  },
  pwdRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.bg, borderWidth: 1, borderColor: Colors.border, borderRadius: 12,
  },
  pwdRowError: { borderColor: Colors.red },
  eyeBtn: { padding: 14 },
  errorText: { fontFamily: 'DMSans_400Regular', fontSize: 11, color: Colors.red, marginTop: 4 },
  okText: { fontFamily: 'DMSans_400Regular', fontSize: 11, color: Colors.green, marginTop: 4 },
  backRow: { alignItems: 'center', marginTop: 16 },
  backLink: { fontFamily: 'DMSans_400Regular', fontSize: 13, color: Colors.orange },
  footer: { fontFamily: 'DMSans_400Regular', fontSize: 11, color: Colors.textDim, textAlign: 'center' },
});
