import AfriButton from '@/components/ui/AfriButton';
import { Colors } from '@/constants/colors';
import { DEMO_OFFERS, fetchOffer, joinOffer, Offer } from '@/services/offers.service';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  PanResponder,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200';

export default function JoinOrderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const [offer, setOffer] = useState<Offer | null>(null);
  const [quantity, setQuantity] = useState(2);
  const [selectedRelay, setSelectedRelay] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [swipeProgress, setSwipeProgress] = useState(0);
  const swipeX = useRef(new Animated.Value(0)).current;
  const [trackWidth, setTrackWidth] = useState(280);
  const handleConfirmRef = useRef<() => void>(() => {});

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchOffer(id);
        setOffer(data);
        if (data.relays.length > 0) setSelectedRelay(data.relays[0].id);
        setQuantity(data.minQtyPerBuyer);
      } catch {
        const demo = DEMO_OFFERS.find(o => o.id === id) ?? DEMO_OFFERS[0];
        setOffer(demo);
        if (demo.relays.length > 0) setSelectedRelay(demo.relays[0].id);
        setQuantity(demo.minQtyPerBuyer);
      }
    }
    load();
  }, [id]);

  const trackWidthRef = useRef(280);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gs) => {
        const maxX = trackWidthRef.current - 52;
        const x = Math.max(0, Math.min(gs.dx, maxX));
        swipeX.setValue(x);
        setSwipeProgress(x / maxX);
      },
      onPanResponderRelease: (_, gs) => {
        const maxX = trackWidthRef.current - 52;
        const threshold = maxX * 0.75;
        if (gs.dx >= threshold) {
          Animated.timing(swipeX, { toValue: maxX, duration: 200, useNativeDriver: false }).start();
          handleConfirmRef.current();
        } else {
          Animated.spring(swipeX, { toValue: 0, useNativeDriver: false }).start();
          setSwipeProgress(0);
        }
      },
    })
  ).current;

  useEffect(() => {
    handleConfirmRef.current = handleConfirm;
  });

  async function handleConfirm() {
    if (!offer || !selectedRelay) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setLoading(true);
    try {
      await joinOffer(offer.id, { quantity, relayId: selectedRelay });
      Alert.alert(
        'Commande enregistrée ! 🎉',
        `Votre commande de ${quantity} ${offer.unit} a été enregistrée. Vous serez notifié quand le seuil sera atteint.`,
        [{ text: 'OK', onPress: () => router.replace('/(tabs)/orders') }]
      );
    } catch (e: any) {
      // Reset swipe
      Animated.spring(swipeX, { toValue: 0, useNativeDriver: false }).start();
      setSwipeProgress(0);
      Alert.alert('Erreur', e.message ?? 'Impossible de rejoindre cette commande.');
    } finally {
      setLoading(false);
    }
  }

  if (!offer) return null;

  const totalPrice = quantity * offer.pricePerUnit;
  const canDecrease = quantity > offer.minQtyPerBuyer;
  const canIncrease = quantity < offer.availableQty - offer.currentQty;

  return (
    <View style={styles.overlay}>
      <TouchableOpacity style={styles.backdrop} onPress={() => router.back()} />

      <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
        {/* Drag handle */}
        <View style={styles.dragHandle} />

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Product header */}
          <View style={styles.productRow}>
            <Image
              source={{ uri: offer.photos[0] || PLACEHOLDER }}
              style={styles.thumb}
              contentFit="cover"
            />
            <View style={styles.productInfo}>
              <Text style={styles.productTitle} numberOfLines={2}>{offer.title}</Text>
              <Text style={styles.productProducer}>{offer.producerName}</Text>
              <Text style={styles.productZone}>📍 {offer.zoneName}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Quantity stepper */}
          <View style={styles.stepperSection}>
            <Text style={styles.stepperLabel}>Quantité (min. {offer.minQtyPerBuyer} {offer.unit})</Text>
            <View style={styles.stepper}>
              <TouchableOpacity
                onPress={() => {
                  if (canDecrease) {
                    Haptics.selectionAsync();
                    setQuantity(q => q - 1);
                  }
                }}
                style={[styles.stepBtn, !canDecrease && styles.stepBtnDisabled]}
                disabled={!canDecrease}
              >
                <Text style={styles.stepBtnText}>−</Text>
              </TouchableOpacity>

              <View style={styles.stepValue}>
                <Text style={styles.stepNumber}>{quantity}</Text>
                <Text style={styles.stepUnit}>{offer.unit}</Text>
              </View>

              <TouchableOpacity
                onPress={() => {
                  if (canIncrease) {
                    Haptics.selectionAsync();
                    setQuantity(q => q + 1);
                  }
                }}
                style={[styles.stepBtn, !canIncrease && styles.stepBtnDisabled]}
                disabled={!canIncrease}
              >
                <Text style={styles.stepBtnText}>+</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.priceBox}>
              <Text style={styles.priceLabel}>Total à payer</Text>
              <Text style={styles.priceValue}>{totalPrice.toLocaleString()} FCFA</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Relay selection */}
          <View style={styles.relaySection}>
            <Text style={styles.sectionLabel}>Point de retrait</Text>
            {offer.relays.map((relay) => (
              <TouchableOpacity
                key={relay.id}
                onPress={() => setSelectedRelay(relay.id)}
                style={[
                  styles.relayCard,
                  selectedRelay === relay.id && styles.relayCardActive,
                ]}
              >
                <View style={styles.relayRadio}>
                  {selectedRelay === relay.id && <View style={styles.relayRadioDot} />}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.relayName, selectedRelay === relay.id && { color: Colors.orange }]}>
                    {relay.name}
                  </Text>
                  <Text style={styles.relayAddr}>{relay.address}</Text>
                </View>
                {relay.distance && (
                  <Text style={styles.relayDist}>{relay.distance} km</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.divider} />

          {/* Paiement info */}
          <View style={styles.momoInfo}>
            <Text style={{ fontSize: 24 }}>📱</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.momoTitle}>Paiement via MoMo</Text>
              <Text style={styles.momoBody}>
                Vous serez redirigé vers MTN ou Orange Money pour confirmer le paiement. Les fonds sont sécurisés en escrow.
              </Text>
            </View>
          </View>

          {/* Swipe to confirm */}
          <View style={styles.swipeContainer}>
            <Animated.View
              style={[
                styles.swipeTrack,
                {
                  backgroundColor: swipeProgress > 0.5
                    ? Colors.green + '30'
                    : Colors.orange + '20',
                },
              ]}
              onLayout={(e) => {
                const w = e.nativeEvent.layout.width;
                trackWidthRef.current = w;
                setTrackWidth(w);
              }}
            >
              <Text style={styles.swipeHint}>
                {swipeProgress > 0.7 ? 'Relâchez pour confirmer ✓' : 'Glissez pour payer →'}
              </Text>
              <Animated.View
                style={[styles.swipeHandle, { left: swipeX }]}
                {...panResponder.panHandlers}
              >
                <Text style={{ fontSize: 20 }}>{loading ? '⏳' : '💳'}</Text>
              </Animated.View>
            </Animated.View>
          </View>

          <Text style={styles.securityNote}>
            🔒 Vos fonds sont sécurisés. Aucun débit avant confirmation du producteur.
          </Text>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(28,18,8,0.5)',
  },
  sheet: {
    backgroundColor: Colors.bg,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '90%',
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  dragHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginBottom: 20,
  },
  productRow: { flexDirection: 'row', gap: 14, marginBottom: 16 },
  thumb: { width: 70, height: 70, borderRadius: 14 },
  productInfo: { flex: 1, gap: 3 },
  productTitle: { fontFamily: 'Fraunces_600SemiBold', fontSize: 16, color: Colors.textPrimary, lineHeight: 21 },
  productProducer: { fontFamily: 'DMSans_400Regular', fontSize: 12, color: Colors.textSecondary },
  productZone: { fontFamily: 'DMSans_400Regular', fontSize: 11, color: Colors.green },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 16 },
  stepperSection: { gap: 12 },
  stepperLabel: { fontFamily: 'DMSans_600SemiBold', fontSize: 12, textTransform: 'uppercase', color: Colors.textSecondary },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 20, alignSelf: 'center' },
  stepBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.orange,
    alignItems: 'center', justifyContent: 'center',
  },
  stepBtnDisabled: { backgroundColor: Colors.shimmer1 },
  stepBtnText: { fontSize: 22, color: '#fff', lineHeight: 28 },
  stepValue: { alignItems: 'center', minWidth: 80 },
  stepNumber: { fontFamily: 'Fraunces_700Bold', fontSize: 36, color: Colors.textPrimary },
  stepUnit: { fontFamily: 'DMSans_400Regular', fontSize: 13, color: Colors.textSecondary, marginTop: -4 },
  priceBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.orange + '12',
    borderRadius: 12,
    padding: 14,
  },
  priceLabel: { fontFamily: 'DMSans_400Regular', fontSize: 14, color: Colors.textSecondary },
  priceValue: { fontFamily: 'Fraunces_700Bold_Italic', fontSize: 24, color: Colors.orange },
  relaySection: { gap: 10 },
  sectionLabel: { fontFamily: 'DMSans_600SemiBold', fontSize: 12, textTransform: 'uppercase', color: Colors.textSecondary },
  relayCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.bgLight,
  },
  relayCardActive: { borderColor: Colors.orange, backgroundColor: Colors.orange + '08' },
  relayRadio: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 2, borderColor: Colors.orange,
    alignItems: 'center', justifyContent: 'center',
  },
  relayRadioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.orange },
  relayName: { fontFamily: 'DMSans_600SemiBold', fontSize: 13, color: Colors.textPrimary },
  relayAddr: { fontFamily: 'DMSans_400Regular', fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  relayDist: { fontFamily: 'DMSans_600SemiBold', fontSize: 12, color: Colors.green },
  momoInfo: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: Colors.bgLight,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  momoTitle: { fontFamily: 'DMSans_600SemiBold', fontSize: 13, color: Colors.textPrimary, marginBottom: 4 },
  momoBody: { fontFamily: 'DMSans_400Regular', fontSize: 12, color: Colors.textSecondary, lineHeight: 17 },
  swipeContainer: { marginVertical: 16 },
  swipeTrack: {
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  swipeHint: { fontFamily: 'DMSans_600SemiBold', fontSize: 14, color: Colors.textSecondary },
  swipeHandle: {
    position: 'absolute',
    left: 4,
    width: 52, height: 52,
    borderRadius: 26,
    backgroundColor: Colors.orange,
    alignItems: 'center', justifyContent: 'center',
    elevation: 4,
    shadowColor: Colors.orange,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  securityNote: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 11,
    color: Colors.textDim,
    textAlign: 'center',
    marginBottom: 8,
  },
});
