import { Colors } from '@/constants/colors';
import { CATEGORY_LABELS, Offer } from '@/services/offers.service';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React, { useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';
import ProgressBar from './ProgressBar';

interface Props {
  offer: Offer;
  index?: number;
}

const PLACEHOLDER = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400';

function StarRating({ value }: { value: number }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Text key={i} style={{ fontSize: 9, color: i <= Math.round(value) ? Colors.orange : Colors.shimmer1 }}>
          ★
        </Text>
      ))}
      <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 10, color: Colors.textDim, marginLeft: 2 }}>
        {value.toFixed(1)}
      </Text>
    </View>
  );
}

export default function OfferCard({ offer, index = 0 }: Props) {
  const scale = useRef(new Animated.Value(1)).current;
  const rotation = index % 2 === 0 ? '-0.4deg' : '0.3deg';
  const isThreshold = offer.status === 'THRESHOLD_REACHED';

  function handlePressIn() {
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 40 }).start();
  }
  function handlePressOut() {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20 }).start();
  }

  return (
    <TouchableWithoutFeedback
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={() => router.push(`/offer/${offer.id}`)}
    >
      <Animated.View
        style={[
          styles.card,
          { transform: [{ scale }, { rotate: rotation }] },
        ]}
      >
        <View style={styles.inner}>
          {/* Photo */}
          <View style={styles.photoWrap}>
            <Image
              source={{ uri: offer.photos[0] || PLACEHOLDER }}
              style={styles.photo}
              contentFit="cover"
              transition={300}
            />
            {isThreshold && (
              <View style={styles.thresholdBadge}>
                <Text style={styles.thresholdText}>SEUIL ✓</Text>
              </View>
            )}
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.producerName} numberOfLines={1}>
              {offer.producerName}
              {offer.producerVerified && ' ✓'}
            </Text>
            <StarRating value={offer.producerRating} />

            <Text style={styles.title} numberOfLines={2}>
              {offer.title}
            </Text>

            <Text style={styles.price}>
              {offer.pricePerUnit.toLocaleString()} FCFA
              <Text style={styles.unit}> / {offer.unit}</Text>
            </Text>

            <View style={styles.zonePill}>
              <Text style={styles.zoneText}>📍 {offer.zoneName}</Text>
            </View>

            <View style={{ marginTop: 8 }}>
              <ProgressBar
                current={offer.currentQty}
                threshold={offer.minThreshold}
                unit={offer.unit}
                height={6}
              />
            </View>
          </View>
        </View>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    marginHorizontal: 16,
    marginBottom: 4,
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 4,
  },
  inner: {
    flexDirection: 'row',
    padding: 12,
    gap: 12,
  },
  photoWrap: {
    width: 110,
    height: 130,
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  thresholdBadge: {
    position: 'absolute',
    bottom: 6,
    left: 4,
    backgroundColor: Colors.green,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  thresholdText: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 9,
    color: '#fff',
    letterSpacing: 0.5,
  },
  content: {
    flex: 1,
    gap: 3,
  },
  producerName: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 11,
    color: Colors.textSecondary,
  },
  title: {
    fontFamily: 'Fraunces_600SemiBold',
    fontSize: 15,
    color: Colors.textPrimary,
    lineHeight: 20,
    marginTop: 2,
  },
  price: {
    fontFamily: 'Fraunces_700Bold',
    fontSize: 18,
    color: Colors.orange,
    fontStyle: 'italic',
  },
  unit: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    color: Colors.textSecondary,
    fontStyle: 'normal',
  },
  zonePill: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: Colors.green,
    borderRadius: 100,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  zoneText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 10,
    color: Colors.green,
  },
});
