import { API } from '@/constants/api';
import { apiGet, apiPost } from './api';

export interface Message {
  id: string;
  conversationId: string;
  senderId: number;
  senderName: string;
  senderAvatar?: string;
  content: string;
  sentAt: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  consumerId: number;
  consumerName: string;
  consumerAvatar?: string;
  producerId: number;
  producerName: string;
  producerAvatar?: string;
  offerId?: number;
  offerTitle?: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
  createdAt: string;
  messages?: Message[];
}

interface RawConv {
  id: number;
  consumerId: number;
  consumerName: string;
  consumerAvatar?: string;
  producerId: number;
  producerName: string;
  producerAvatar?: string;
  offerId?: number;
  offerTitle?: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
  createdAt: string;
  messages?: RawMsg[];
}

interface RawMsg {
  id: number;
  conversationId: number;
  senderId: number;
  senderName: string;
  senderAvatar?: string;
  content: string;
  sentAt: string;
  read: boolean;
}

function mapMsg(r: RawMsg): Message {
  return {
    id: String(r.id),
    conversationId: String(r.conversationId),
    senderId: r.senderId,
    senderName: r.senderName ?? '—',
    senderAvatar: r.senderAvatar,
    content: r.content,
    sentAt: r.sentAt,
    read: r.read,
  };
}

function mapConv(r: RawConv): Conversation {
  return {
    id: String(r.id),
    consumerId: r.consumerId,
    consumerName: r.consumerName ?? '—',
    consumerAvatar: r.consumerAvatar,
    producerId: r.producerId,
    producerName: r.producerName ?? '—',
    producerAvatar: r.producerAvatar,
    offerId: r.offerId,
    offerTitle: r.offerTitle,
    lastMessage: r.lastMessage,
    lastMessageAt: r.lastMessageAt,
    unreadCount: r.unreadCount ?? 0,
    createdAt: r.createdAt,
    messages: r.messages?.map(mapMsg),
  };
}

export async function fetchConversations(): Promise<Conversation[]> {
  const raw = await apiGet<RawConv[]>(API.CONVERSATIONS);
  return raw.map(mapConv);
}

export async function startConversation(
  producerId: number,
  offerId?: number
): Promise<Conversation> {
  const raw = await apiPost<RawConv>(API.START_CONVERSATION, { producerId, offerId });
  return mapConv(raw);
}

export async function fetchConversation(id: string): Promise<Conversation> {
  const raw = await apiGet<RawConv>(API.CONVERSATION(id));
  return mapConv(raw);
}

export async function sendMessage(conversationId: string, content: string): Promise<Message> {
  const raw = await apiPost<RawMsg>(API.SEND_MESSAGE(conversationId), { content });
  return mapMsg(raw);
}
