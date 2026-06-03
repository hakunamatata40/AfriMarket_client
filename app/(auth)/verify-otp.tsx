import AfriButton from '@/components/ui/AfriButton';
import { Colors } from '@/constants/colors';
import { API } from '@/constants/api';
import { apiPost } from '@/services/api';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
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

const OTP_LENGTH = 6;

export default function VerifyOtpScreen() {
  const { phone, maskedEmail } = useLocalSearchParams<{ phone: string; maskedEmail: string }>();
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60);
  const [resending, setResending] = useState(false);
  const inputs = useRef<(TextInput | null)[]>([]);

  // Cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(() => setResendCooldown((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  function handleDigitChange(val: string, idx: number) {
    // Allow paste of full 6-digit code
    if (val.length === OTP_LENGTH && /^\d{6}$/.test(val)) {
      const arr = val.split('');
      setDigits(arr);
      inputs.current[OTP_LENGTH - 1]?.focus();
      return;
    }
    const digit = val.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[idx] = digit;
    setDigits(next);
    if (digit && idx < OTP_LENGTH - 1) {
      inputs.current[idx + 1]?.focus();
    }
  }

  function handleKeyPress(key: string, idx: number) {
    if (key === 'Backspace' && !digits[idx] && idx > 0) {
      inputs.current[idx - 1]?.focus();
      const next = [...digits];
      next[idx - 1] = '';
      setDigits(next);
    }
  }

  async function handleVerify() {
    const otp = digits.join('');
    if (otp.length < OTP_LENGTH) {
      Alert.alert('Code incomplet', `Veuillez saisir les ${OTP_LENGTH} chiffres.`);
      return;
    }
    setLoading(true);
    try {
      await apiPost(API.VERIFY_OTP, { phone, otp }, false);
      // Navigate to reset password, carrying phone + otp
      router.push({
        pathname: '/(auth)/reset-password' as any,
        params: { phone, otp },
      });
    } catch (e: any) {
      Alert.alert('Code invalide', e.message ?? 'Code incorrect ou expiré.');
      setDigits(Array(OTP_LENGTH).fill(''));
      inputs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (resendCooldown > 0 || resending) return;
    setResending(true);
    try {
      await apiPost(API.FORGOT_PASSWORD, { phone }, false);
      setResendCooldown(60);
      setDigits(Array(OTP_LENGTH).fill(''));
      inputs.current[0]?.focus();
      Alert.alert('Code renvoyé', `Un nouveau code a été envoyé à ${maskedEmail}.`);
    } catch (e: any) {
      Alert.alert('Erreur', e.message ?? 'Impossible de renvoyer le code.');
    } finally {
      setResending(false);
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
              <Text style={styles.icon}>✉️</Text>
            </View>

            <Text style={styles.title}>Vérification email</Text>
            <Text style={styles.subtitle}>
              Un code à 6 chiffres a été envoyé à{'\n'}
              <Text style={styles.email}>{maskedEmail || 'votre adresse email'}</Text>
            </Text>

            {/* OTP boxes */}
            <View style={styles.otpRow}>
              {digits.map((d, i) => (
                <TextInput
                  key={i}
                  ref={(r) => { inputs.current[i] = r; }}
                  style={[styles.otpBox, d ? styles.otpBoxFilled : null]}
                  value={d}
                  onChangeText={(v) => handleDigitChange(v, i)}
                  onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, i)}
                  keyboardType="number-pad"
                  maxLength={OTP_LENGTH} // allow paste
                  selectTextOnFocus
                  textAlign="center"
                />
              ))}
            </View>

            <AfriButton
              label="Valider le code →"
              onPress={handleVerify}
              loading={loading}
              size="lg"
              style={{ marginTop: 8 }}
            />

            {/* Resend */}
            <View style={styles.resendRow}>
              <Text style={styles.resendText}>Vous n'avez pas reçu le code ?</Text>
              <TouchableOpacity onPress={handleResend} disabled={resendCooldown > 0 || resending}>
                <Text style={[styles.resendLink, resendCooldown > 0 && styles.resendDisabled]}>
                  {resendCooldown > 0
                    ? ` Renvoyer dans ${resendCooldown}s`
                    : resending ? ' Envoi...' : ' Renvoyer'}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={() => router.back()} style={styles.backRow}>
              <Text style={styles.backLink}>← Retour</Text>
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
  subtitle: { fontFamily: 'DMSans_400Regular', fontSize: 13, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  email: { fontFamily: 'DMSans_600SemiBold', color: Colors.orange },
  otpRow: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 24 },
  otpBox: {
    width: 46, height: 56, borderRadius: 12,
    borderWidth: 1.5, borderColor: Colors.border,
    backgroundColor: Colors.bg,
    fontFamily: 'Fraunces_700Bold', fontSize: 24, color: Colors.textPrimary,
  },
  otpBoxFilled: { borderColor: Colors.orange, backgroundColor: Colors.orange + '0F' },
  resendRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 16, flexWrap: 'wrap' },
  resendText: { fontFamily: 'DMSans_400Regular', fontSize: 13, color: Colors.textSecondary },
  resendLink: { fontFamily: 'DMSans_600SemiBold', fontSize: 13, color: Colors.orange },
  resendDisabled: { color: Colors.textDim },
  backRow: { alignItems: 'center', marginTop: 12 },
  backLink: { fontFamily: 'DMSans_400Regular', fontSize: 13, color: Colors.orange },
  footer: { fontFamily: 'DMSans_400Regular', fontSize: 11, color: Colors.textDim, textAlign: 'center' },
});
