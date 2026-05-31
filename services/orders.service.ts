import { API } from '@/constants/api';
import { apiGet, apiPost } from './api';

// Exact enum values from backend OrderStatus
export type OrderStatus =
  | 'PENDING'      // Just created, not yet paid
  | 'PAID'         // Payment captured in escrow
  | 'CONFIRMED'    // Offer threshold reached
  | 'DELIVERING'   // Producer confirmed dispatch
  | 'AT_RELAY'     // Available at relay point
  | 'COMPLETED'    // Buyer confirmed receipt
  | 'CANCELLED'
  | 'REFUNDED'
  | 'DISPUTED';

// Maps exactly to ConsumerOrderDto from backend
export interface Order {
  id: string;
  offerId: string;
  offerTitle: string;
  offerPhoto?: string;
  producerName: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  totalPrice: number;
  status: OrderStatus;
  relayName: string;
  relayAddress?: string;
  deliveryDate?: string;
  createdAt: string;
  updatedAt: string;
}

// Raw shape from backend (BigDecimal → number in JSON, Long → number)
interface RawOrder {
  id: number;
  offerId: number;
  offerTitle?: string;
  offerPhoto?: string;
  producerName?: string;
  quantity: number;
  unit?: string;
  pricePerUnit?: number;
  totalPrice: number;
  status: string;
  relayName?: string;
  relayAddress?: string;
  deliveryDate?: string;
  createdAt: string;
  updatedAt?: string;
}

function mapOrder(raw: RawOrder): Order {
  return {
    id: String(raw.id),
    offerId: String(raw.offerId ?? ''),
    offerTitle: raw.offerTitle ?? 'Commande',
    offerPhoto: raw.offerPhoto,
    producerName: raw.producerName ?? '—',
    quantity: Number(raw.quantity ?? 0),
    unit: raw.unit ?? 'kg',
    pricePerUnit: Number(raw.pricePerUnit ?? 0),
    totalPrice: Number(raw.totalPrice ?? 0),
    status: (raw.status as OrderStatus) ?? 'PAID',
    relayName: raw.relayName ?? '—',
    relayAddress: raw.relayAddress,
    deliveryDate: raw.deliveryDate,
    createdAt: raw.createdAt ?? new Date().toISOString(),
    updatedAt: raw.updatedAt ?? raw.createdAt ?? new Date().toISOString(),
  };
}

export async function fetchMyOrders(): Promise<Order[]> {
  const raw = await apiGet<RawOrder[]>(API.MY_ORDERS);
  return raw.map(mapOrder);
}

export async function confirmReceipt(orderId: string): Promise<void> {
  await apiPost(API.CONFIRM_RECEIPT(orderId), {});
}

export async function openDispute(orderId: string, reason: string): Promise<void> {
  await apiPost(API.OPEN_DISPUTE(orderId), { reason });
}

// ─── Status display config ────────────────────────────────────────────────────

export const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; lineColor: string }> = {
  PENDING:    { label: 'En attente du paiement', color: '#9CA3AF', lineColor: '#9CA3AF' },
  PAID:       { label: 'En attente du seuil',    color: '#F59E0B', lineColor: '#F59E0B' },
  CONFIRMED:  { label: 'Seuil atteint ! 🎉',     color: '#E8641A', lineColor: '#E8641A' },
  DELIVERING: { label: 'En route',               color: '#3B82F6', lineColor: '#3B82F6' },
  AT_RELAY:   { label: 'Disponible au relais',   color: '#8B5CF6', lineColor: '#8B5CF6' },
  COMPLETED:  { label: 'Livraison confirmée ✓',  color: '#4A7C3F', lineColor: '#4A7C3F' },
  CANCELLED:  { label: 'Annulée',                color: '#9CA3AF', lineColor: '#9CA3AF' },
  REFUNDED:   { label: 'Remboursée',             color: '#9CA3AF', lineColor: '#9CA3AF' },
  DISPUTED:   { label: 'Litige ouvert',          color: '#DC2626', lineColor: '#DC2626' },
};

// ─── Demo data (fallback) ─────────────────────────────────────────────────────

export const DEMO_ORDERS: Order[] = [
  {
    id: 'o1',
    offerId: '1',
    offerTitle: 'Tomates cerises Mbalmayo',
    offerPhoto: 'https://images.unsplash.com/photo-1546470427-e5380b0dfb06?w=300',
    producerName: 'Jean-Paul Mvondo',
    quantity: 5,
    unit: 'kg',
    pricePerUnit: 1200,
    totalPrice: 6000,
    status: 'PAID',
    relayName: 'Boutique Mama Christine',
    relayAddress: 'Rue de Nlongkak, Yaoundé 4',
    createdAt: new Date(Date.now() - 2 * 3600_000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 3600_000).toISOString(),
  },
  {
    id: 'o2',
    offerId: '2',
    offerTitle: 'Plantains mûrs Obala',
    offerPhoto: 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=300',
    producerName: 'Marie-Claire Biloa',
    quantity: 10,
    unit: 'kg',
    pricePerUnit: 800,
    totalPrice: 8000,
    status: 'CONFIRMED',
    relayName: 'Épicerie du Marché',
    relayAddress: 'Marché Mvog-Ada, Yaoundé 3',
    createdAt: new Date(Date.now() - 24 * 3600_000).toISOString(),
    updatedAt: new Date(Date.now() - 3600_000).toISOString(),
  },
  {
    id: 'o3',
    offerId: '4',
    offerTitle: 'Maïs jaune Mbalmayo',
    offerPhoto: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=300',
    producerName: 'Samuel Nkodo',
    quantity: 25,
    unit: 'kg',
    pricePerUnit: 350,
    totalPrice: 8750,
    status: 'AT_RELAY',
    relayName: 'Boutique Carrefour Bastos',
    relayAddress: 'Bastos, Yaoundé 2',
    deliveryDate: new Date(Date.now() - 6 * 3600_000).toISOString(),
    createdAt: new Date(Date.now() - 5 * 86400_000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 3600_000).toISOString(),
  },
  {
    id: 'o4',
    offerId: '3',
    offerTitle: 'Ignames blanches Ebolowa',
    offerPhoto: 'https://images.unsplash.com/photo-1573246123716-6b1782bfc499?w=300',
    producerName: 'Pierre Atanga',
    quantity: 15,
    unit: 'kg',
    pricePerUnit: 500,
    totalPrice: 7500,
    status: 'COMPLETED',
    relayName: 'Centre Communautaire Mfoundi',
    relayAddress: 'Mfoundi, Yaoundé 5',
    deliveryDate: new Date(Date.now() - 3 * 86400_000).toISOString(),
    createdAt: new Date(Date.now() - 10 * 86400_000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 86400_000).toISOString(),
  },
];
