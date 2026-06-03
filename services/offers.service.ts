import { API } from '@/constants/api';
import { apiGet, apiPost } from './api';

export type OfferCategory = 'VEGETABLES' | 'FRUITS' | 'TUBERS' | 'CEREALS' | 'LIVESTOCK' | 'OTHER';
export type OfferStatus = 'ACTIVE' | 'THRESHOLD_REACHED' | 'DELIVERING' | 'COMPLETED' | 'EXPIRED' | 'CANCELLED';

export interface Relay {
  id: string;
  name: string;
  address: string;
  zoneName: string;
  distance?: number;
}

// Maps exactly to ConsumerOfferDto from backend
export interface Offer {
  id: string;
  title: string;
  description?: string;
  category: OfferCategory;
  categoryLabel?: string;
  pricePerUnit: number;
  unit: string;          // display label (e.g. "kg", "litre")
  availableQty: number;
  minThreshold: number;
  currentQty: number;
  minQtyPerBuyer: number;
  progressPercent: number;
  status: OfferStatus;
  producerName: string;
  producerId?: number;
  producerAvatar?: string;
  producerRating: number;
  producerRatingCount: number;
  producerVerified: boolean;
  zoneName: string;
  photos: string[];
  relays: Relay[];
  expiresAt: string;
  deliveryDate?: string;
  participantsCount: number;
}

// Raw shape from backend ConsumerOfferDto (numbers come as BigDecimal → JSON number)
interface RawOffer {
  id: number;
  title: string;
  description?: string;
  category: string;
  categoryLabel?: string;
  pricePerUnit: number;
  unit: string;
  unitLabel?: string;
  availableQty: number;
  minThreshold: number;
  currentQty: number;
  minQtyPerBuyer: number;
  progressPercent: number;
  status: string;
  producerName: string;
  producerId?: number;
  producerAvatar?: string;
  producerRating: number;
  producerRatingCount: number;
  producerVerified: boolean;
  zoneName?: string;
  photos: string[];
  deliveryDate?: string;
  expiresAt?: string;
  participantsCount: number;
}

interface RawRelay {
  id: string;
  name: string;
  address: string;
  zoneName?: string;
  distance?: number;
}

function mapOffer(raw: RawOffer, relays: Relay[] = []): Offer {
  return {
    id: String(raw.id),
    title: raw.title,
    description: raw.description,
    category: (raw.category as OfferCategory) ?? 'OTHER',
    categoryLabel: raw.categoryLabel,
    pricePerUnit: Number(raw.pricePerUnit),
    unit: raw.unitLabel ?? raw.unit ?? 'kg',
    availableQty: Number(raw.availableQty),
    minThreshold: Number(raw.minThreshold),
    currentQty: Number(raw.currentQty ?? 0),
    minQtyPerBuyer: Number(raw.minQtyPerBuyer),
    progressPercent: raw.progressPercent ?? 0,
    status: (raw.status as OfferStatus) ?? 'ACTIVE',
    producerName: raw.producerName ?? '—',
    producerId: raw.producerId,
    producerAvatar: raw.producerAvatar,
    producerRating: raw.producerRating ?? 0,
    producerRatingCount: raw.producerRatingCount ?? 0,
    producerVerified: raw.producerVerified ?? false,
    zoneName: raw.zoneName ?? 'Yaoundé',
    photos: (() => {
      const BASE_URL = API.OFFERS.split('/api')[0];
      return (raw.photos ?? []).map(p =>
        p.startsWith('http') ? p : `${BASE_URL}${p}`
      );
    })(),
    relays,
    expiresAt: raw.expiresAt ?? new Date(Date.now() + 7 * 86400_000).toISOString(),
    deliveryDate: raw.deliveryDate,
    participantsCount: raw.participantsCount ?? 0,
  };
}

function mapRelay(raw: RawRelay): Relay {
  return {
    id: String(raw.id),
    name: raw.name ?? '',
    address: raw.address ?? '',
    zoneName: raw.zoneName ?? '',
    distance: raw.distance,
  };
}

export interface OffersParams {
  category?: OfferCategory;
  zone?: string;
  search?: string;
}

export async function fetchOffers(params?: OffersParams): Promise<Offer[]> {
  const query = new URLSearchParams();
  if (params?.category) query.set('category', params.category);
  if (params?.search) query.set('search', params.search);
  const url = `${API.OFFERS}?${query.toString()}`;
  const raw = await apiGet<RawOffer[]>(url);
  return raw.map(o => mapOffer(o));
}

export async function fetchOffer(id: string): Promise<Offer> {
  // Returns { offer: ConsumerOfferDto, relays: RelayDto[] }
  const raw = await apiGet<{ offer: RawOffer; relays: RawRelay[] }>(API.OFFER(id));
  const relays = (raw.relays ?? []).map(mapRelay);
  return mapOffer(raw.offer, relays);
}

export async function joinOffer(
  offerId: string,
  data: { quantity: number; relayId: string }
): Promise<{ orderId: string; totalPrice: number }> {
  const res = await apiPost<{ orderId: number; totalPrice: number }>(
    API.JOIN_OFFER(offerId),
    { quantity: data.quantity, relayId: data.relayId }
  );
  return { orderId: String(res.orderId), totalPrice: Number(res.totalPrice) };
}

// ─── Demo data (fallback when backend is offline) ─────────────────────────────

export const CATEGORY_LABELS: Record<OfferCategory, string> = {
  VEGETABLES: 'Légumes',
  FRUITS: 'Fruits',
  TUBERS: 'Tubercules',
  CEREALS: 'Céréales',
  LIVESTOCK: 'Élevage',
  OTHER: 'Autre',
};

export const CATEGORY_EMOJIS: Record<OfferCategory, string> = {
  VEGETABLES: '🥬',
  FRUITS: '🍊',
  TUBERS: '🥔',
  CEREALS: '🌾',
  LIVESTOCK: '🐄',
  OTHER: '🛒',
};

export const DEMO_OFFERS: Offer[] = [
  {
    id: '1',
    title: 'Tomates cerises Mbalmayo — récolte fraîche',
    description: 'Tomates cerises cultivées sans pesticides à Mbalmayo. Récoltées le matin même.',
    category: 'VEGETABLES',
    pricePerUnit: 1200,
    unit: 'kg',
    availableQty: 100,
    minThreshold: 50,
    currentQty: 34,
    minQtyPerBuyer: 2,
    progressPercent: 68,
    status: 'ACTIVE',
    producerName: 'Jean-Paul Mvondo',
    producerRating: 4.8,
    producerRatingCount: 47,
    producerVerified: true,
    zoneName: 'Yaoundé 4',
    photos: ['https://images.unsplash.com/photo-1546470427-e5380b0dfb06?w=600'],
    relays: [
      { id: 'r1', name: 'Boutique Mama Christine', address: 'Rue de Nlongkak, Yaoundé 4', zoneName: 'Yaoundé 4', distance: 0.8 },
      { id: 'r2', name: 'Pharmacie Sainte-Marie', address: 'Carrefour Biyem-Assi', zoneName: 'Yaoundé 6', distance: 2.1 },
    ],
    expiresAt: new Date(Date.now() + 3 * 86400_000).toISOString(),
    deliveryDate: new Date(Date.now() + 5 * 86400_000).toISOString(),
    participantsCount: 12,
  },
  {
    id: '2',
    title: 'Plantains mûrs Obala — variété Batard',
    description: 'Plantains Batard de qualité supérieure, cueillis à maturité optimale.',
    category: 'FRUITS',
    pricePerUnit: 800,
    unit: 'kg',
    availableQty: 200,
    minThreshold: 80,
    currentQty: 80,
    minQtyPerBuyer: 5,
    progressPercent: 100,
    status: 'THRESHOLD_REACHED',
    producerName: 'Marie-Claire Biloa',
    producerRating: 4.6,
    producerRatingCount: 23,
    producerVerified: true,
    zoneName: 'Yaoundé 3',
    photos: ['https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=600'],
    relays: [
      { id: 'r3', name: 'Épicerie du Marché', address: 'Marché Mvog-Ada, Yaoundé 3', zoneName: 'Yaoundé 3', distance: 1.2 },
    ],
    expiresAt: new Date(Date.now() + 86400_000).toISOString(),
    deliveryDate: new Date(Date.now() + 2 * 86400_000).toISOString(),
    participantsCount: 18,
  },
  {
    id: '3',
    title: 'Ignames blanches Ebolowa — calibre A',
    description: 'Ignames blanches calibre A, idéales pour le pilé. Production familiale.',
    category: 'TUBERS',
    pricePerUnit: 500,
    unit: 'kg',
    availableQty: 300,
    minThreshold: 100,
    currentQty: 45,
    minQtyPerBuyer: 10,
    progressPercent: 45,
    status: 'ACTIVE',
    producerName: 'Pierre Atanga',
    producerRating: 4.4,
    producerRatingCount: 31,
    producerVerified: false,
    zoneName: 'Yaoundé 5',
    photos: ['https://images.unsplash.com/photo-1573246123716-6b1782bfc499?w=600'],
    relays: [
      { id: 'r4', name: 'Centre Communautaire Mfoundi', address: 'Mfoundi, Yaoundé 5', zoneName: 'Yaoundé 5', distance: 0.5 },
    ],
    expiresAt: new Date(Date.now() + 6 * 86400_000).toISOString(),
    deliveryDate: new Date(Date.now() + 8 * 86400_000).toISOString(),
    participantsCount: 7,
  },
  {
    id: '4',
    title: 'Maïs jaune Mbalmayo — sac 25 kg',
    description: 'Maïs hybride à haut rendement, séché naturellement. Certifié sans OGM.',
    category: 'CEREALS',
    pricePerUnit: 350,
    unit: 'kg',
    availableQty: 500,
    minThreshold: 150,
    currentQty: 95,
    minQtyPerBuyer: 5,
    progressPercent: 63,
    status: 'ACTIVE',
    producerName: 'Samuel Nkodo',
    producerRating: 4.9,
    producerRatingCount: 82,
    producerVerified: true,
    zoneName: 'Yaoundé 2',
    photos: ['https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=600'],
    relays: [
      { id: 'r5', name: 'Boutique Carrefour Bastos', address: 'Bastos, Yaoundé 2', zoneName: 'Yaoundé 2', distance: 1.8 },
    ],
    expiresAt: new Date(Date.now() + 7 * 86400_000).toISOString(),
    deliveryDate: new Date(Date.now() + 10 * 86400_000).toISOString(),
    participantsCount: 22,
  },
];
