import AfriButton from '@/components/ui/AfriButton';
import { Colors } from '@/constants/colors';
import { logout } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';
import { router } from 'expo-router';
import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const MENU_ITEMS = [
  { emoji: '📦', label: 'Mes commandes', route: '/(tabs)/orders' },
  { emoji: '🔔', label: 'Notifications', route: '/(tabs)/notifications' },
  { emoji: '⭐', label: 'Mes avis donnés', route: null },
  { emoji: '🏪', label: 'Points relais proches', route: null },
  { emoji: '⚙️', label: 'Paramètres', route: null },
  { emoji: '❓', label: 'Aide & Support', route: null },
];

function StatBox({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const reset = useAuthStore((s) => s.reset);

  async function handleLogout() {
    Alert.alert('Déconnexion', 'Voulez-vous vraiment vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Déconnecter',
        style: 'destructive',
        onPress: async () => {
          await logout();
          reset();
          router.replace('/(auth)/login');
        },
      },
    ]);
  }

  const firstLetter = user?.fullName?.[0]?.toUpperCase() ?? '?';

  return (
    <ScrollView
      style={[styles.root, { paddingTop: insets.top }]}
      contentContainerStyle={{ paddingBottom: 120 }}
    >
      {/* Hero header */}
      <View style={styles.heroSection}>
        <View style={styles.waveBg} />
        <View style={styles.avatarRing}>
          <View style={styles.avatar}>
            <Text style={styles.avatarLetter}>{firstLetter}</Text>
          </View>
        </View>
        <Text style={styles.name}>{user?.fullName ?? 'Utilisateur'}</Text>
        {user?.ratingAvg ? (
          <Text style={styles.rating}>⭐ {user.ratingAvg.toFixed(1)} ({user.ratingCount ?? 0} avis)</Text>
        ) : null}
        <View style={styles.statusPill}>
          <View style={[styles.statusDot, { backgroundColor: Colors.green }]} />
          <Text style={styles.statusText}>Compte actif</Text>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <StatBox value="4" label="commandes" />
        <View style={styles.statDivider} />
        <StatBox value="30 250" label="FCFA économisés" />
        <View style={styles.statDivider} />
        <StatBox value="3" label="producteurs" />
      </View>

      {/* Info card */}
      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Téléphone</Text>
          <Text style={styles.infoValue}>{user?.phone ?? '—'}</Text>
        </View>
        <View style={[styles.infoRow, { borderTopWidth: 1, borderTopColor: Colors.border }]}>
          <Text style={styles.infoLabel}>Zone préférée</Text>
          <Text style={styles.infoValue}>{user?.arrondissement ?? 'Non définie'}</Text>
        </View>
        <View style={[styles.infoRow, { borderTopWidth: 1, borderTopColor: Colors.border }]}>
          <Text style={styles.infoLabel}>Membre depuis</Text>
          <Text style={styles.infoValue}>
            {user?.createdAt
              ? new Date(user.createdAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
              : '—'}
          </Text>
        </View>
      </View>

      {/* Menu */}
      <View style={styles.menuCard}>
        {MENU_ITEMS.map((item, i) => (
          <TouchableOpacity
            key={item.label}
            style={[
              styles.menuItem,
              i < MENU_ITEMS.length - 1 && { borderBottomWidth: 1, borderBottomColor: Colors.border },
            ]}
            onPress={() => {
              if (item.route) router.push(item.route as any);
            }}
            activeOpacity={0.7}
          >
            <View style={styles.menuLeft}>
              <Text style={{ fontSize: 20 }}>{item.emoji}</Text>
              <Text style={styles.menuLabel}>{item.label}</Text>
            </View>
            <Text style={{ color: Colors.textDim, fontSize: 16 }}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout */}
      <View style={{ paddingHorizontal: 20, marginTop: 8 }}>
        <AfriButton
          label="Se déconnecter"
          onPress={handleLogout}
          variant="outline"
          style={{ borderColor: Colors.red }}
        />
      </View>

      <Text style={styles.footer}>AfriMarket v1.0 · Yaoundé, Cameroun 🇨🇲</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  heroSection: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 32,
    position: 'relative',
    overflow: 'hidden',
  },
  waveBg: {
    position: 'absolute',
    top: 0, left: -40, right: -40,
    height: 140,
    backgroundColor: Colors.orange + '12',
    borderBottomLeftRadius: 80,
    borderBottomRightRadius: 80,
  },
  avatarRing: {
    width: 108,
    height: 108,
    borderRadius: 54,
    backgroundColor: Colors.orange,
    padding: 3,
    marginBottom: 12,
  },
  avatar: {
    flex: 1,
    borderRadius: 50,
    backgroundColor: Colors.bgDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    fontFamily: 'Fraunces_700Bold',
    fontSize: 40,
    color: Colors.orange,
  },
  name: {
    fontFamily: 'Fraunces_700Bold',
    fontSize: 24,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  rating: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.greenLight,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 100,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontFamily: 'DMSans_600SemiBold', fontSize: 11, color: Colors.green },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
  },
  statBox: { flex: 1, alignItems: 'center' },
  statValue: { fontFamily: 'Fraunces_700Bold', fontSize: 18, color: Colors.orange },
  statLabel: { fontFamily: 'DMSans_400Regular', fontSize: 11, color: Colors.textSecondary, marginTop: 2, textAlign: 'center' },
  statDivider: { width: 1, backgroundColor: Colors.border },
  infoCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: Colors.card,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  infoLabel: { fontFamily: 'DMSans_400Regular', fontSize: 13, color: Colors.textSecondary },
  infoValue: { fontFamily: 'DMSans_600SemiBold', fontSize: 13, color: Colors.textPrimary },
  menuCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: Colors.card,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  menuLabel: { fontFamily: 'DMSans_400Regular', fontSize: 15, color: Colors.textPrimary },
  footer: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 11,
    color: Colors.textDim,
    textAlign: 'center',
    marginTop: 16,
  },
});
