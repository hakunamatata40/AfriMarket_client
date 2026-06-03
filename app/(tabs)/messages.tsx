import { Colors } from '@/constants/colors';
import { Conversation, fetchConversations } from '@/services/messages.service';
import { useAuthStore } from '@/store/auth.store';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function timeAgo(dateStr?: string) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'À l\'instant';
  if (mins < 60) return `${mins}min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}j`;
}

function Avatar({ name, avatar, size = 48 }: { name: string; avatar?: string; size?: number }) {
  const letter = name?.[0]?.toUpperCase() ?? '?';
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[styles.avatarLetter, { fontSize: size * 0.42 }]}>{letter}</Text>
    </View>
  );
}

export default function MessagesScreen() {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const [convs, setConvs] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);
    try {
      const data = await fetchConversations();
      setConvs(data);
    } catch {
      setConvs([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const totalUnread = convs.reduce((s, c) => s + c.unreadCount, 0);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>
            Messages
            {totalUnread > 0 && <Text style={styles.badge}> {totalUnread}</Text>}
          </Text>
          <Text style={styles.subtitle}>Vos conversations avec les producteurs</Text>
        </View>
      </View>

      <FlatList
        data={convs}
        keyExtractor={(c) => c.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => load(true)}
            tintColor={Colors.orange}
            colors={[Colors.orange]}
          />
        }
        renderItem={({ item }) => {
          const isConsumer = user?.id === item.consumerId;
          const otherName = isConsumer ? item.producerName : item.consumerName;
          const otherAvatar = isConsumer ? item.producerAvatar : item.consumerAvatar;
          const hasUnread = item.unreadCount > 0;

          return (
            <TouchableOpacity
              style={[styles.convItem, hasUnread && styles.convItemUnread]}
              onPress={() => router.push(`/conversation/${item.id}` as any)}
              activeOpacity={0.7}
            >
              <Avatar name={otherName} avatar={otherAvatar} size={52} />

              <View style={styles.convContent}>
                <View style={styles.convRow}>
                  <Text style={[styles.convName, hasUnread && styles.convNameBold]} numberOfLines={1}>
                    {otherName}
                  </Text>
                  <Text style={styles.convTime}>{timeAgo(item.lastMessageAt)}</Text>
                </View>

                {item.offerTitle && (
                  <Text style={styles.offerTag} numberOfLines={1}>
                    🌿 {item.offerTitle}
                  </Text>
                )}

                <View style={styles.convRow}>
                  <Text style={[styles.lastMsg, hasUnread && styles.lastMsgBold]} numberOfLines={1}>
                    {item.lastMessage ?? 'Aucun message'}
                  </Text>
                  {hasUnread && (
                    <View style={styles.unreadBadge}>
                      <Text style={styles.unreadText}>{item.unreadCount}</Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
        ItemSeparatorComponent={() => (
          <View style={{ height: 1, backgroundColor: Colors.border, marginLeft: 72 }} />
        )}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <Text style={{ fontSize: 56, marginBottom: 16 }}>💬</Text>
              <Text style={styles.emptyTitle}>Aucun message</Text>
              <Text style={styles.emptyBody}>
                Démarrez une conversation depuis le détail d'une offre en appuyant sur "Contacter le producteur".
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 },
  title: { fontFamily: 'Fraunces_700Bold', fontSize: 28, color: Colors.textPrimary },
  badge: { fontFamily: 'DMSans_700Bold', fontSize: 22, color: Colors.orange },
  subtitle: { fontFamily: 'DMSans_400Regular', fontSize: 13, color: Colors.textSecondary, marginTop: 4 },
  convItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 12,
    backgroundColor: Colors.bg,
  },
  convItemUnread: { backgroundColor: Colors.bgLight },
  avatar: {
    backgroundColor: Colors.orange + '25',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarLetter: { fontFamily: 'Fraunces_700Bold', color: Colors.orange },
  convContent: { flex: 1, gap: 2 },
  convRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  convName: { fontFamily: 'DMSans_400Regular', fontSize: 15, color: Colors.textPrimary, flex: 1 },
  convNameBold: { fontFamily: 'DMSans_600SemiBold' },
  convTime: { fontFamily: 'DMSans_400Regular', fontSize: 11, color: Colors.textDim, flexShrink: 0 },
  offerTag: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 11,
    color: Colors.green,
  },
  lastMsg: { fontFamily: 'DMSans_400Regular', fontSize: 13, color: Colors.textSecondary, flex: 1 },
  lastMsgBold: { fontFamily: 'DMSans_600SemiBold', color: Colors.textPrimary },
  unreadBadge: {
    backgroundColor: Colors.orange,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  unreadText: { fontFamily: 'DMSans_600SemiBold', fontSize: 11, color: '#fff' },
  empty: { alignItems: 'center', paddingTop: 80, paddingHorizontal: 40 },
  emptyTitle: { fontFamily: 'Fraunces_600SemiBold', fontSize: 20, color: Colors.textPrimary, marginBottom: 8 },
  emptyBody: { fontFamily: 'DMSans_400Regular', fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20 },
});
