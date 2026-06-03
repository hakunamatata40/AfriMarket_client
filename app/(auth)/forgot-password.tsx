import AfriButton from '@/components/ui/AfriButton';
import { Colors } from '@/constants/colors';
import { API } from '@/constants/api';
import { apiPost } from '@/services/api';
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

export default function ForgotPasswordScreen() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSend() {
    if (!phone.trim()) {
      Alert.alert('Champ requis', 'Veuillez saisir votre numéro de téléphone.');
      return;
    }
    setLoading(true);
    try {
      const res = await apiPost<{ message: string; maskedEmail?: string; code?: string }>(
        API.FORGOT_PASSWORD,
        { phone: phone.trim() },
        false
      );
      if (res.code === 'NO_EMAIL') {
        Alert.alert(
          'Aucun email associé',
          'Votre compte n\'a pas d\'adresse email enregistrée. Contactez le support AfriMarket.'
        );
        return;
      }
      // Navigate to OTP verification, passing phone + masked email
      router.push({
        pathname: '/(auth)/verify-otp' as any,
        params: { phone: phone.trim(), maskedEmail: res.maskedEmail ?? '' },
      });
    } catch (e: any) {
      Alert.alert('Erreur', e.message ?? 'Impossible d\'envoyer le code. Réessayez.');
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

            <View style={styles.iconWrap}>
              <Text style={styles.icon}>🔑</Text>
            </View>

            <Text style={styles.title}>Mot de passe oublié</Text>
            <Text style={styles.subtitle}>
              Entrez votre numéro de téléphone. Nous enverrons un code de vérification
              à l'adresse email associée à votre compte.
            </Text>

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
                autoFocus
              />
            </View>

            <AfriButton
              label="Envoyer le code →"
              onPress={handleSend}
              loading={loading}
              size="lg"
              style={{ marginTop: 8 }}
            />

            <TouchableOpacity onPress={() => router.back()} style={styles.backRow}>
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
  backRow: { alignItems: 'center', marginTop: 16 },
  backLink: { fontFamily: 'DMSans_400Regular', fontSize: 13, color: Colors.orange },
  footer: { fontFamily: 'DMSans_400Regular', fontSize: 11, color: Colors.textDim, textAlign: 'center' },
});
