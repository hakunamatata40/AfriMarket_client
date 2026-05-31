import { Colors } from '@/constants/colors';
import { Order, STATUS_CONFIG } from '@/services/orders.service';
import { Image } from 'expo-image';
import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200';

interface Props {
  order: Order;
  onConfirm?: (id: string) => void;
}

export default function OrderCard({ order, onConfirm }: Props) {
  const config = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.PAID;
  const showConfirm = order.status === 'AT_RELAY';

  function handleDispute() {
    Alert.alert(
      'Ouvrir un litige',
      'Quel est le problème ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Produit non conforme', onPress: () => {} },
        { text: 'Quantité incorrecte',  onPress: () => {} },
      ]
    );
  }

  return (
    <View style={styles.container}>
      {/* Timeline line */}
      <View style={[styles.line, { backgroundColor: config.lineColor }]} />

      <View style={styles.card}>
        {/* Header */}
        <View style={styles.header}>
          <Image
            source={{ uri: order.offerPhoto || PLACEHOLDER }}
            style={styles.thumb}
            contentFit="cover"
          />
          <View style={styles.headerText}>
            <Text style={styles.title} numberOfLines={2}>{order.offerTitle}</Text>
            <Text style={styles.producer}>{order.producerName}</Text>
          </View>
        </View>

        {/* Details */}
        <View style={styles.details}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Quantité</Text>
            <Text style={styles.detailValue}>{order.quantity} {order.unit}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Total payé</Text>
            <Text style={[styles.detailValue, { color: Colors.orange, fontFamily: 'Fraunces_700Bold' }]}>
              {order.totalPrice.toLocaleString()} FCFA
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Point relais</Text>
            <Text style={styles.detailValue} numberOfLines={1}>{order.relayName}</Text>
          </View>
          {order.relayAddress && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Adresse</Text>
              <Text style={[styles.detailValue, { fontSize: 11 }]} numberOfLines={1}>{order.relayAddress}</Text>
            </View>
          )}
        </View>

        {/* Status chip */}
        <View style={[styles.statusChip, { backgroundColor: config.color + '20', borderColor: config.color + '40' }]}>
          <View style={[styles.statusDot, { backgroundColor: config.color }]} />
          <Text style={[styles.statusLabel, { color: config.color }]}>{config.label}</Text>
        </View>

        {/* Confirm button */}
        {showConfirm && onConfirm && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.confirmBtn}
              onPress={() => onConfirm(order.id)}
              activeOpacity={0.8}
            >
              <Text style={styles.confirmBtnText}>Confirmer la réception ✓</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDispute}>
              <Text style={styles.disputeLink}>Signaler un problème</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 12,
    gap: 12,
  },
  line: {
    width: 3,
    borderRadius: 3,
    minHeight: 120,
  },
  card: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 14,
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
    gap: 10,
  },
  header: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  thumb: { width: 52, height: 52, borderRadius: 10 },
  headerText: { flex: 1 },
  title: { fontFamily: 'Fraunces_600SemiBold', fontSize: 14, color: Colors.textPrimary, lineHeight: 18 },
  producer: { fontFamily: 'DMSans_400Regular', fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  details: { gap: 4 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between' },
  detailLabel: { fontFamily: 'DMSans_400Regular', fontSize: 12, color: Colors.textSecondary },
  detailValue: { fontFamily: 'DMSans_600SemiBold', fontSize: 12, color: Colors.textPrimary, flexShrink: 1, textAlign: 'right', marginLeft: 8 },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
    borderWidth: 1,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusLabel: { fontFamily: 'DMSans_600SemiBold', fontSize: 11 },
  actions: { gap: 8, marginTop: 4 },
  confirmBtn: {
    backgroundColor: Colors.orange,
    borderRadius: 100,
    paddingVertical: 10,
    alignItems: 'center',
  },
  confirmBtnText: { fontFamily: 'Fraunces_600SemiBold', fontSize: 14, color: '#fff' },
  disputeLink: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    color: Colors.textDim,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});
