import AfriButton from '@/components/ui/AfriButton';
import ProgressBar from '@/components/ui/ProgressBar';
import { Colors } from '@/constants/colors';
import { CATEGORY_LABELS, DEMO_OFFERS, fetchOffer, Offer } from '@/services/offers.service';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const PLACEHOLDER = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600';

function PhotoCarousel({ photos }: { photos: string[] }) {
  const [active, setActive] = useState(0);
  const imgs = photos.length > 0 ? photos : [PLACEHOLDER];

  return (
    <View>
      <FlatList
        data={imgs}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          setActive(Math.round(e.nativeEvent.contentOffset.x / width));
        }}
        renderItem={({ item }) => (
          <Image source={{ uri: item }} style={{ width, height: 280 }} contentFit="cover" />
        )}
        keyExtractor={(_, i) => String(i)}
      />
      {/* Dots */}
      <View style={styles.carouselDots}>
        {imgs.map((_, i) => (
          <View
            key={i}
            style={[styles.carouselDot, i === active && styles.carouselDotActive]}
          />
        ))}
      </View>
    </View>
  );
}

function formatDate(dateStr?: string) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

function timeLeft(expiresAt: string) {
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return 'Expirée';
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  return `${days}j ${hours}h`;
}

export default function OfferDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const [offer, setOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchOffer(id);
        setOffer(data);
      } catch {
        const demo = DEMO_OFFERS.find(o => o.id === id) ?? DEMO_OFFERS[0];
        setOffer(demo);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  // Sticky header opacity
  const headerBg = scrollY.interpolate({
    inputRange: [200, 260],
    outputRange: ['rgba(247,242,234,0)', 'rgba(247,242,234,0.98)'],
    extrapolate: 'clamp',
  });

  if (!offer) return null;

  const isActive = offer.status === 'ACTIVE';
  const isThreshold = offer.status === 'THRESHOLD_REACHED';

  return (
    <View style={styles.root}>
      {/* Sticky Header */}
      <Animated.View style={[styles.stickyHeader, { backgroundColor: headerBg, paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.stickyTitle} numberOfLines={1}>{offer.title}</Text>
        <View style={{ width: 40 }} />
      </Animated.View>

      <Animated.ScrollView
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: false,
        })}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Photos carousel */}
        <PhotoCarousel photos={offer.photos} />

        {/* Content */}
        <View style={styles.content}>
          {/* Category & title */}
          <View style={styles.catRow}>
            <View style={styles.catPill}>
              <Text style={styles.catText}>{CATEGORY_LABELS[offer.category]}</Text>
            </View>
            {offer.producerVerified && (
              <View style={styles.verifiedPill}>
                <Text style={styles.verifiedText}>✓ Producteur vérifié</Text>
              </View>
            )}
          </View>

          <Text style={styles.title}>{offer.title}</Text>

          <Text style={styles.price}>
            {offer.pricePerUnit.toLocaleString()} FCFA
            <Text style={styles.priceUnit}> / {offer.unit}</Text>
          </Text>

          {/* Producer */}
          <View style={styles.producerCard}>
            <View style={styles.producerAvatar}>
              <Text style={{ fontSize: 22 }}>👨‍🌾</Text>
            </View>
            <View style={styles.producerInfo}>
              <Text style={styles.producerName}>{offer.producerName}</Text>
              <View style={styles.starsRow}>
                {[1,2,3,4,5].map(i => (
                  <Text key={i} style={{ fontSize: 12, color: i <= Math.round(offer.producerRating) ? Colors.orange : Colors.shimmer1 }}>★</Text>
                ))}
                <Text style={styles.ratingText}> {offer.producerRating.toFixed(1)} ({offer.producerRatingCount} avis)</Text>
              </View>
            </View>
            <View style={{ justifyContent: 'center' }}>
              <Text style={styles.zoneTag}>📍 {offer.zoneName}</Text>
            </View>
          </View>

          {/* Groupage hero card */}
          <View style={styles.groupageCard}>
            <Text style={styles.groupageTitle}>Commande groupée en cours</Text>
            <View style={styles.bigNumbers}>
              <Text style={styles.bigCurrent}>{offer.currentQty}</Text>
              <Text style={styles.bigSlash}> / </Text>
              <Text style={styles.bigThreshold}>{offer.minThreshold} {offer.unit}</Text>
            </View>
            <ProgressBar
              current={offer.currentQty}
              threshold={offer.minThreshold}
              unit={offer.unit}
              height={14}
              showNumbers={false}
            />
            <View style={styles.groupageFooter}>
              <Text style={styles.expiryText}>⏱ Expire dans {timeLeft(offer.expiresAt)}</Text>
              <Text style={styles.participantsText}>👥 {offer.participantsCount} acheteurs</Text>
            </View>
          </View>

          {/* Description */}
          {offer.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>À propos de cette offre</Text>
              <Text style={styles.description}>{offer.description}</Text>
            </View>
          )}

          {/* Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Détails</Text>
            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Quantité dispo.</Text>
                <Text style={styles.detailValue}>{offer.availableQty} {offer.unit}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Min. par acheteur</Text>
                <Text style={styles.detailValue}>{offer.minQtyPerBuyer} {offer.unit}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Livraison prévue</Text>
                <Text style={styles.detailValue}>{formatDate(offer.deliveryDate)}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Expire le</Text>
                <Text style={styles.detailValue}>{formatDate(offer.expiresAt)}</Text>
              </View>
            </View>
          </View>

          {/* Relays */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Points de retrait disponibles</Text>
            {offer.relays.map((relay) => (
              <View key={relay.id} style={styles.relayItem}>
                <View style={styles.relayIcon}>
                  <Text style={{ fontSize: 18 }}>🏪</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.relayName}>{relay.name}</Text>
                  <Text style={styles.relayAddress}>{relay.address}</Text>
                </View>
                {relay.distance && (
                  <Text style={styles.relayDistance}>{relay.distance} km</Text>
                )}
              </View>
            ))}
          </View>
        </View>
      </Animated.ScrollView>

      {/* CTA */}
      <View style={[styles.ctaBar, { paddingBottom: insets.bottom + 12 }]}>
        {isActive && (
          <AfriButton
            label="Rejoindre cette commande →"
            onPress={() => router.push(`/join/${offer.id}`)}
            size="lg"
            style={{ flex: 1 }}
          />
        )}
        {isThreshold && (
          <View style={styles.thresholdBar}>
            <Text style={styles.thresholdMsg}>🎉 Seuil atteint — commandes clôturées</Text>
          </View>
        )}
        {!isActive && !isThreshold && (
          <View style={styles.inactiveBar}>
            <Text style={styles.inactiveMsg}>Cette offre n'accepte plus de commandes</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  stickyHeader: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    zIndex: 100,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 12,
  },
  backBtn: {
    width: 40, height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  backIcon: { fontSize: 18, color: Colors.textPrimary },
  stickyTitle: {
    flex: 1,
    fontFamily: 'Fraunces_600SemiBold',
    fontSize: 15,
    color: Colors.textPrimary,
  },
  carouselDots: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 5,
  },
  carouselDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.5)' },
  carouselDotActive: { width: 16, backgroundColor: '#fff' },
  content: { padding: 20, gap: 0 },
  catRow: { flexDirection: 'row', gap: 8, marginBottom: 10, marginTop: 4 },
  catPill: {
    backgroundColor: Colors.orange + '18',
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 100,
  },
  catText: { fontFamily: 'DMSans_600SemiBold', fontSize: 11, color: Colors.orange, textTransform: 'uppercase' },
  verifiedPill: {
    backgroundColor: Colors.greenLight,
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 100,
  },
  verifiedText: { fontFamily: 'DMSans_600SemiBold', fontSize: 11, color: Colors.green },
  title: { fontFamily: 'Fraunces_700Bold', fontSize: 22, color: Colors.textPrimary, lineHeight: 28, marginBottom: 8 },
  price: { fontFamily: 'Fraunces_700Bold_Italic', fontSize: 28, color: Colors.orange, marginBottom: 16 },
  priceUnit: { fontFamily: 'DMSans_400Regular', fontSize: 14, color: Colors.textSecondary, fontStyle: 'normal' },
  producerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgLight,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  producerAvatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: Colors.shimmer1,
    alignItems: 'center', justifyContent: 'center',
  },
  producerInfo: { flex: 1, gap: 3 },
  producerName: { fontFamily: 'DMSans_600SemiBold', fontSize: 14, color: Colors.textPrimary },
  starsRow: { flexDirection: 'row', alignItems: 'center' },
  ratingText: { fontFamily: 'DMSans_400Regular', fontSize: 11, color: Colors.textSecondary },
  zoneTag: { fontFamily: 'DMSans_400Regular', fontSize: 11, color: Colors.green },
  groupageCard: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    elevation: 4,
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 16,
    gap: 12,
  },
  groupageTitle: { fontFamily: 'DMSans_600SemiBold', fontSize: 12, textTransform: 'uppercase', color: Colors.textSecondary, letterSpacing: 0.08 },
  bigNumbers: { flexDirection: 'row', alignItems: 'baseline' },
  bigCurrent: { fontFamily: 'Fraunces_700Bold', fontSize: 36, color: Colors.orange },
  bigSlash: { fontFamily: 'DMSans_400Regular', fontSize: 20, color: Colors.textDim },
  bigThreshold: { fontFamily: 'DMSans_400Regular', fontSize: 18, color: Colors.textSecondary },
  groupageFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  expiryText: { fontFamily: 'DMSans_400Regular', fontSize: 12, color: Colors.textSecondary },
  participantsText: { fontFamily: 'DMSans_400Regular', fontSize: 12, color: Colors.textSecondary },
  section: { marginBottom: 20 },
  sectionTitle: { fontFamily: 'DMSans_600SemiBold', fontSize: 13, textTransform: 'uppercase', color: Colors.textSecondary, letterSpacing: 0.08, marginBottom: 10 },
  description: { fontFamily: 'DMSans_400Regular', fontSize: 14, color: Colors.textSecondary, lineHeight: 22 },
  detailsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  detailItem: {
    width: '47%',
    backgroundColor: Colors.bgLight,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  detailLabel: { fontFamily: 'DMSans_400Regular', fontSize: 11, color: Colors.textDim, marginBottom: 4 },
  detailValue: { fontFamily: 'DMSans_600SemiBold', fontSize: 14, color: Colors.textPrimary },
  relayItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.bgLight,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  relayIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: Colors.shimmer1, alignItems: 'center', justifyContent: 'center' },
  relayName: { fontFamily: 'DMSans_600SemiBold', fontSize: 13, color: Colors.textPrimary },
  relayAddress: { fontFamily: 'DMSans_400Regular', fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  relayDistance: { fontFamily: 'DMSans_600SemiBold', fontSize: 12, color: Colors.green },
  ctaBar: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(247,242,234,0.97)',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  thresholdBar: {
    backgroundColor: Colors.greenLight,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  thresholdMsg: { fontFamily: 'DMSans_600SemiBold', fontSize: 14, color: Colors.green },
  inactiveBar: {
    backgroundColor: Colors.shimmer1,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  inactiveMsg: { fontFamily: 'DMSans_400Regular', fontSize: 14, color: Colors.textDim },
});
