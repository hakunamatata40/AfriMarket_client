import { Colors } from '@/constants/colors';
import {
  Conversation,
  Message,
  fetchConversation,
  sendMessage,
} from '@/services/messages.service';
import { useAuthStore } from '@/store/auth.store';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/* ───────── helpers ───────── */

function timeLabel(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const sameDay =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();
  if (sameDay) {
    return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) +
    ' ' +
    d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

function Avatar({ name, size = 36 }: { name: string; size?: number }) {
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[styles.avatarLetter, { fontSize: size * 0.42 }]}>
        {name?.[0]?.toUpperCase() ?? '?'}
      </Text>
    </View>
  );
}

/* ───────── bubble ───────── */

function MessageBubble({ msg, isMine }: { msg: Message; isMine: boolean }) {
  return (
    <View style={[styles.bubbleRow, isMine && styles.bubbleRowMine]}>
      {!isMine && <Avatar name={msg.senderName} size={32} />}
      <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleOther]}>
        {!isMine && (
          <Text style={styles.bubbleSender}>{msg.senderName}</Text>
        )}
        <Text style={[styles.bubbleText, isMine && styles.bubbleTextMine]}>
          {msg.content}
        </Text>
        <View style={styles.bubbleMeta}>
          <Text style={[styles.bubbleTime, isMine && styles.bubbleTimeMine]}>
            {timeLabel(msg.sentAt)}
          </Text>
          {isMine && (
            <Text style={[styles.bubbleRead, msg.read && styles.bubbleReadSeen]}>
              {msg.read ? '✓✓' : '✓'}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

/* ───────── date separator ───────── */

function DateSep({ label }: { label: string }) {
  return (
    <View style={styles.dateSep}>
      <View style={styles.dateSepLine} />
      <Text style={styles.dateSepText}>{label}</Text>
      <View style={styles.dateSepLine} />
    </View>
  );
}

type ListItem =
  | { type: 'date'; key: string; label: string }
  | { type: 'msg'; key: string; msg: Message };

function buildItems(messages: Message[]): ListItem[] {
  const items: ListItem[] = [];
  let lastDate = '';
  for (const msg of messages) {
    const d = new Date(msg.sentAt);
    const dateKey = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    if (dateKey !== lastDate) {
      lastDate = dateKey;
      const now = new Date();
      const isToday =
        d.getDate() === now.getDate() &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear();
      items.push({
        type: 'date',
        key: `date-${dateKey}`,
        label: isToday
          ? "Aujourd'hui"
          : d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }),
      });
    }
    items.push({ type: 'msg', key: `msg-${msg.id}`, msg });
  }
  return items;
}

/* ───────── main screen ───────── */

export default function ConversationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);

  const [conv, setConv] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  const listRef = useRef<FlatList>(null);

  /* load conversation */
  const load = useCallback(async () => {
    try {
      const data = await fetchConversation(id);
      setConv(data);
    } catch {
      /* keep existing state on refresh error */
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  /* auto-scroll to bottom when messages change */
  useEffect(() => {
    if (conv?.messages?.length) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: false }), 80);
    }
  }, [conv?.messages?.length]);

  /* polling every 5 s while screen is mounted */
  useEffect(() => {
    const timer = setInterval(load, 5000);
    return () => clearInterval(timer);
  }, [load]);

  /* send */
  const handleSend = async () => {
    const content = text.trim();
    if (!content || sending) return;
    setSending(true);
    setText('');
    try {
      const newMsg = await sendMessage(id, content);
      setConv((prev) =>
        prev
          ? {
              ...prev,
              messages: [...(prev.messages ?? []), newMsg],
              lastMessage: newMsg.content,
              lastMessageAt: newMsg.sentAt,
            }
          : prev
      );
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 60);
    } catch {
      setText(content); // restore on error
    } finally {
      setSending(false);
    }
  };

  /* derived */
  const isConsumer = user?.id === conv?.consumerId;
  const otherName = conv
    ? isConsumer
      ? conv.producerName
      : conv.consumerName
    : '…';

  const items = buildItems(conv?.messages ?? []);

  /* ── render ── */
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <View style={[styles.root, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>

          <Avatar name={otherName} size={38} />

          <View style={styles.headerInfo}>
            <Text style={styles.headerName} numberOfLines={1}>
              {otherName}
            </Text>
            {conv?.offerTitle && (
              <Text style={styles.headerOffer} numberOfLines={1}>
                🌿 {conv.offerTitle}
              </Text>
            )}
          </View>
        </View>

        {/* Messages */}
        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator color={Colors.orange} size="large" />
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={items}
            keyExtractor={(item) => item.key}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => {
              if (item.type === 'date') {
                return <DateSep label={item.label} />;
              }
              const isMine = item.msg.senderId === user?.id;
              return <MessageBubble msg={item.msg} isMine={isMine} />;
            }}
            ListEmptyComponent={
              <View style={styles.emptyWrap}>
                <Text style={{ fontSize: 48, marginBottom: 12 }}>💬</Text>
                <Text style={styles.emptyTitle}>Aucun message</Text>
                <Text style={styles.emptyBody}>
                  Envoyez un premier message pour démarrer la conversation.
                </Text>
              </View>
            }
          />
        )}

        {/* Input bar */}
        <View style={[styles.inputBar, { paddingBottom: insets.bottom + 8 }]}>
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder="Votre message…"
            placeholderTextColor={Colors.textDim}
            multiline
            maxLength={1000}
            returnKeyType="default"
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!text.trim() || sending) && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!text.trim() || sending}
            activeOpacity={0.75}
          >
            {sending ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.sendIcon}>➤</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },

  /* header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.bgLight,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.shimmer1,
    alignItems: 'center', justifyContent: 'center',
  },
  backIcon: { fontSize: 18, color: Colors.textPrimary },
  avatar: {
    backgroundColor: Colors.orange + '25',
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  avatarLetter: { fontFamily: 'Fraunces_700Bold', color: Colors.orange },
  headerInfo: { flex: 1 },
  headerName: { fontFamily: 'DMSans_600SemiBold', fontSize: 15, color: Colors.textPrimary },
  headerOffer: { fontFamily: 'DMSans_400Regular', fontSize: 11, color: Colors.green, marginTop: 1 },

  /* list */
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  listContent: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8, flexGrow: 1 },

  /* date separator */
  dateSep: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginVertical: 16,
  },
  dateSepLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  dateSepText: {
    fontFamily: 'DMSans_400Regular', fontSize: 11,
    color: Colors.textDim, textTransform: 'capitalize',
  },

  /* bubbles */
  bubbleRow: {
    flexDirection: 'row', alignItems: 'flex-end',
    gap: 6, marginBottom: 6,
  },
  bubbleRowMine: { flexDirection: 'row-reverse' },
  bubble: {
    maxWidth: '78%', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 8,
  },
  bubbleMine: {
    backgroundColor: Colors.orange,
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: Colors.card,
    borderBottomLeftRadius: 4,
    borderWidth: 1, borderColor: Colors.border,
  },
  bubbleSender: {
    fontFamily: 'DMSans_600SemiBold', fontSize: 11,
    color: Colors.textSecondary, marginBottom: 2,
  },
  bubbleText: {
    fontFamily: 'DMSans_400Regular', fontSize: 14,
    color: Colors.textPrimary, lineHeight: 20,
  },
  bubbleTextMine: { color: '#fff' },
  bubbleMeta: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'flex-end', gap: 4, marginTop: 3,
  },
  bubbleTime: {
    fontFamily: 'DMSans_400Regular', fontSize: 10, color: Colors.textDim,
  },
  bubbleTimeMine: { color: 'rgba(255,255,255,0.7)' },
  bubbleRead: { fontFamily: 'DMSans_400Regular', fontSize: 11, color: 'rgba(255,255,255,0.5)' },
  bubbleReadSeen: { color: 'rgba(255,255,255,0.9)' },

  /* empty */
  emptyWrap: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingTop: 80, paddingHorizontal: 40,
  },
  emptyTitle: {
    fontFamily: 'Fraunces_600SemiBold', fontSize: 18,
    color: Colors.textPrimary, marginBottom: 8,
  },
  emptyBody: {
    fontFamily: 'DMSans_400Regular', fontSize: 13,
    color: Colors.textSecondary, textAlign: 'center', lineHeight: 20,
  },

  /* input bar */
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end',
    paddingHorizontal: 12, paddingTop: 10, gap: 8,
    borderTopWidth: 1, borderTopColor: Colors.border,
    backgroundColor: Colors.bgLight,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 22,
    borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: 16, paddingVertical: 10,
    fontFamily: 'DMSans_400Regular', fontSize: 14, color: Colors.textPrimary,
    maxHeight: 120,
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.orange,
    alignItems: 'center', justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: Colors.textDim },
  sendIcon: { color: '#fff', fontSize: 16, marginLeft: 2 },
});
