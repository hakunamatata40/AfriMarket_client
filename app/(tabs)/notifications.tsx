import { Colors } from '@/constants/colors';
import React, { useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Notif {
  id: string;
  emoji: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
  type: 'threshold' | 'delivery' | 'relay' | 'promo' | 'system';
}

const DEMO_NOTIFS: Notif[] = [
  {
    id: 'n1',
    emoji: '🎉',
    title: 'Seuil atteint !',
    body: 'La commande groupée "Plantains mûrs Obala" a atteint son seuil. Votre commande est confirmée !',
    time: 'il y a 2h',
    read: false,
    type: 'threshold',
  },
  {
    id: 'n2',
    emoji: '📦',
    title: 'Commande disponible',
    body: 'Votre commande de Maïs jaune est disponible chez Boutique Carrefour Bastos. Retirez-la avant le 3 juin.',
    time: 'il y a 6h',
    read: false,
    type: 'relay',
  },
  {
    id: 'n3',
    emoji: '🚚',
    title: 'En route !',
    body: 'Jean-Paul Mvondo a confirmé l\'envoi de vos Tomates cerises. Livraison prévue demain.',
    time: 'hier',
    read: true,
    type: 'delivery',
  },
  {
    id: 'n4',
    emoji: '⭐',
    title: 'Notez votre producteur',
    body: 'Comment s\'est passée votre commande de Ignames blanches ? Partagez votre avis.',
    time: 'il y a 3j',
    read: true,
    type: 'system',
  },
  {
    id: 'n5',
    emoji: '🌿',
    title: 'Nouvelle offre disponible',
    body: 'Une nouvelle offre de légumes frais est disponible dans votre zone Yaoundé 4.',
    time: 'il y a 4j',
    read: true,
    type: 'promo',
  },
];

const TYPE_COLORS: Record<Notif['type'], string> = {
  threshold: Colors.green,
  delivery: Colors.blue,
  relay: Colors.purple,
  promo: Colors.orange,
  system: Colors.textSecondary,
};

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const [notifs, setNotifs] = useState<Notif[]>(DEMO_NOTIFS);

  function markAllRead() {
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  }

  function markRead(id: string) {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }

  const unreadCount = notifs.filter(n => !n.read).length;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>
            Notifications
            {unreadCount > 0 && (
              <Text style={styles.badge}> {unreadCount}</Text>
            )}
          </Text>
          <Text style={styles.subtitle}>Restez informé de vos commandes</Text>
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllRead} style={styles.markAllBtn}>
            <Text style={styles.markAllText}>Tout lire</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={notifs}
        keyExtractor={(n) => n.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => markRead(item.id)}
            activeOpacity={0.8}
          >
            <View style={[styles.notifCard, !item.read && styles.notifCardUnread]}>
              {/* Left dot */}
              {!item.read && (
                <View style={[styles.unreadDot, { backgroundColor: TYPE_COLORS[item.type] }]} />
              )}
              <View style={[styles.emojiBox, { backgroundColor: TYPE_COLORS[item.type] + '18' }]}>
                <Text style={{ fontSize: 22 }}>{item.emoji}</Text>
              </View>
              <View style={styles.notifContent}>
                <View style={styles.notifRow}>
                  <Text style={[styles.notifTitle, !item.read && styles.notifTitleUnread]}>
                    {item.title}
                  </Text>
                  <Text style={styles.notifTime}>{item.time}</Text>
                </View>
                <Text style={styles.notifBody} numberOfLines={2}>{item.body}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingBottom: 100, paddingTop: 8 }}
        ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: Colors.border, marginLeft: 72 }} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={{ fontSize: 52, marginBottom: 16 }}>🔕</Text>
            <Text style={styles.emptyTitle}>Aucune notification</Text>
            <Text style={styles.emptyBody}>Vous serez alerté dès qu'une de vos commandes évolue.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  title: { fontFamily: 'Fraunces_700Bold', fontSize: 28, color: Colors.textPrimary },
  badge: { fontFamily: 'DMSans_700Bold', fontSize: 20, color: Colors.orange },
  subtitle: { fontFamily: 'DMSans_400Regular', fontSize: 13, color: Colors.textSecondary, marginTop: 4 },
  markAllBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: Colors.orange,
    marginTop: 4,
  },
  markAllText: { fontFamily: 'DMSans_600SemiBold', fontSize: 12, color: Colors.orange },
  notifCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 12,
    backgroundColor: Colors.bg,
  },
  notifCardUnread: { backgroundColor: Colors.bgLight },
  unreadDot: {
    position: 'absolute',
    left: 8,
    top: 20,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  emojiBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  notifContent: { flex: 1, gap: 4 },
  notifRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  notifTitle: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: Colors.textSecondary,
    flex: 1,
  },
  notifTitleUnread: {
    fontFamily: 'DMSans_600SemiBold',
    color: Colors.textPrimary,
  },
  notifTime: { fontFamily: 'DMSans_400Regular', fontSize: 11, color: Colors.textDim, flexShrink: 0 },
  notifBody: { fontFamily: 'DMSans_400Regular', fontSize: 13, color: Colors.textSecondary, lineHeight: 18 },
  empty: { alignItems: 'center', paddingTop: 80, paddingHorizontal: 40 },
  emptyTitle: { fontFamily: 'Fraunces_600SemiBold', fontSize: 20, color: Colors.textPrimary, marginBottom: 8 },
  emptyBody: { fontFamily: 'DMSans_400Regular', fontSize: 14, color: Colors.textSecondary, textAlign: 'center' },
});
