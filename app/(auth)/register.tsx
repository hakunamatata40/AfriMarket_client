import AfriButton from '@/components/ui/AfriButton';
import { Colors } from '@/constants/colors';
import { register } from '@/services/auth.service';
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

const ARRONDISSEMENTS = [
  'Yaoundé 1', 'Yaoundé 2', 'Yaoundé 3',
  'Yaoundé 4', 'Yaoundé 5', 'Yaoundé 6', 'Yaoundé 7',
];

export default function RegisterScreen() {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [arrondissement, setArrondissement] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const setUser = useAuthStore((s) => s.setUser);

  async function handleRegister() {
    if (!fullName.trim() || !phone.trim() || !password.trim()) {
      Alert.alert('Champs requis', 'Veuillez remplir tous les champs obligatoires.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Mot de passe trop court', 'Au moins 6 caractères requis.');
      return;
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      Alert.alert('Email invalide', 'Veuillez saisir une adresse email valide.');
      return;
    }
    setLoading(true);
    try {
      const res = await register({
        fullName: fullName.trim(),
        phone: phone.trim(),
        password,
        email: email.trim() || undefined,
        arrondissement,
      });
      setUser(res.user);
      router.replace('/(tabs)');
    } catch (e: any) {
      Alert.alert('Inscription échouée', e.message ?? 'Erreur inattendue');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        {/* Back */}
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>← Retour</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Créer un compte</Text>
        <Text style={styles.subtitle}>
          Rejoignez les centaines de familles qui achètent directement aux producteurs.
        </Text>

        <View style={styles.card}>
          <View style={styles.orangeTop} />
          <View style={styles.inner}>
            {/* Nom */}
            <View style={styles.field}>
              <Text style={styles.label}>Prénom & Nom *</Text>
              <TextInput
                style={styles.input}
                value={fullName}
                onChangeText={setFullName}
                placeholder="Marie Nguema"
                placeholderTextColor={Colors.textDim}
                autoComplete="name"
              />
            </View>

            {/* Téléphone */}
            <View style={styles.field}>
              <Text style={styles.label}>Numéro de téléphone *</Text>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="+237 6XX XXX XXX"
                placeholderTextColor={Colors.textDim}
                keyboardType="phone-pad"
              />
            </View>

            {/* Email */}
            <View style={styles.field}>
              <Text style={styles.label}>Adresse email <Text style={styles.optional}>(optionnel)</Text></Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="marie@example.com"
                placeholderTextColor={Colors.textDim}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
              <Text style={styles.fieldHint}>
                💡 Nécessaire pour réinitialiser votre mot de passe
              </Text>
            </View>

            {/* Mot de passe */}
            <View style={styles.field}>
              <Text style={styles.label}>Mot de passe *</Text>
              <View style={styles.pwdRow}>
                <TextInput
                  style={[styles.input, { flex: 1, borderWidth: 0 }]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="6 caractères minimum"
                  placeholderTextColor={Colors.textDim}
                  secureTextEntry={!showPwd}
                />
                <TouchableOpacity onPress={() => setShowPwd(!showPwd)} style={{ padding: 14 }}>
                  <Text>{showPwd ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Arrondissement */}
            <View style={styles.field}>
              <Text style={styles.label}>Arrondissement préféré</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 4 }}>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {ARRONDISSEMENTS.map((a) => (
                    <TouchableOpacity
                      key={a}
                      onPress={() => setArrondissement(a)}
                      style={[
                        styles.arrPill,
                        arrondissement === a && styles.arrPillActive,
                      ]}
                    >
                      <Text style={[
                        styles.arrPillText,
                        arrondissement === a && styles.arrPillTextActive,
                      ]}>{a}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            <AfriButton
              label="Créer mon compte"
              onPress={handleRegister}
              loading={loading}
              size="lg"
              style={{ marginTop: 16 }}
            />

            <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16, alignItems: 'center' }}>
              <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 13, color: Colors.textSecondary }}>
                Déjà un compte ?{' '}
                <Text style={{ color: Colors.orange, fontFamily: 'DMSans_600SemiBold' }}>Se connecter</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flexGrow: 1, padding: 24 },
  back: { marginBottom: 16 },
  backText: { fontFamily: 'DMSans_400Regular', fontSize: 14, color: Colors.textSecondary },
  title: { fontFamily: 'Fraunces_700Bold', fontSize: 30, color: Colors.textPrimary, marginBottom: 8 },
  subtitle: { fontFamily: 'DMSans_400Regular', fontSize: 14, color: Colors.textSecondary, marginBottom: 24, lineHeight: 20 },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    elevation: 4,
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 16,
  },
  orangeTop: { height: 4, backgroundColor: Colors.orange },
  inner: { padding: 24, gap: 4 },
  field: { marginBottom: 16 },
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
  arrPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgLight,
  },
  arrPillActive: { backgroundColor: Colors.orange, borderColor: Colors.orange },
  arrPillText: { fontFamily: 'DMSans_400Regular', fontSize: 12, color: Colors.textSecondary },
  arrPillTextActive: { color: '#fff', fontFamily: 'DMSans_600SemiBold' },
  optional: { fontFamily: 'DMSans_400Regular', fontSize: 10, color: Colors.textDim, textTransform: 'none' },
  fieldHint: { fontFamily: 'DMSans_400Regular', fontSize: 11, color: Colors.textDim, marginTop: 6 },
});
