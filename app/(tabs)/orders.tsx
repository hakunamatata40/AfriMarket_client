import OrderCard from '@/components/ui/OrderCard';
import { Colors } from '@/constants/colors';
import { confirmReceipt, DEMO_ORDERS, fetchMyOrders, Order, OrderStatus } from '@/services/orders.service';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const FILTERS: { label: string; value: OrderStatus | 'ALL' }[] = [
  { label: 'Toutes',    value: 'ALL' },
  { label: 'En cours',  value: 'PAID' },
  { label: 'Au relais', value: 'AT_RELAY' },
  { label: 'Terminées', value: 'COMPLETED' },
];

export default function OrdersScreen() {
  const insets = useSafeAreaInsets();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<OrderStatus | 'ALL'>('ALL');

  const load = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);
    try {
      const data = await fetchMyOrders();
      setOrders(data);
    } catch {
      setOrders(DEMO_ORDERS);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleConfirm(orderId: string) {
    Alert.alert(
      'Confirmer la réception',
      'Vous confirmez avoir bien reçu votre commande ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer ✓',
          onPress: async () => {
            try {
              await confirmReceipt(orderId);
              setOrders(prev => prev.map(o =>
                o.id === orderId ? { ...o, status: 'COMPLETED' } : o
              ));
            } catch {
              Alert.alert('Erreur', 'Impossible de confirmer. Réessayez.');
            }
          },
        },
      ]
    );
  }

  const filtered = orders.filter(o =>
    activeFilter === 'ALL' ? true :
    activeFilter === 'PAID'
      ? ['PENDING', 'PAID', 'CONFIRMED', 'DELIVERING'].includes(o.status)
      : o.status === activeFilter
  );

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Mes commandes</Text>
        <Text style={styles.subtitle}>{orders.length} commande{orders.length !== 1 ? 's' : ''} au total</Text>
      </View>

      {/* Filter tabs */}
      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.value}
            onPress={() => setActiveFilter(f.value)}
            style={[styles.filterTab, activeFilter === f.value && styles.filterTabActive]}
          >
            <Text style={[styles.filterText, activeFilter === f.value && styles.filterTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Timeline */}
      <FlatList
        data={filtered}
        keyExtractor={(o) => o.id}
        renderItem={({ item }) => (
          <OrderCard order={item} onConfirm={handleConfirm} />
        )}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => load(true)}
            tintColor={Colors.orange}
            colors={[Colors.orange]}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={{ fontSize: 52, marginBottom: 16 }}>📦</Text>
            <Text style={styles.emptyTitle}>Aucune commande</Text>
            <Text style={styles.emptyBody}>
              Vos commandes apparaîtront ici après avoir rejoint une offre groupée.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 },
  title: { fontFamily: 'Fraunces_700Bold', fontSize: 28, color: Colors.textPrimary },
  subtitle: { fontFamily: 'DMSans_400Regular', fontSize: 13, color: Colors.textSecondary, marginTop: 4 },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 8,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 100,
    backgroundColor: Colors.bgLight,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterTabActive: { backgroundColor: Colors.orange, borderColor: Colors.orange },
  filterText: { fontFamily: 'DMSans_400Regular', fontSize: 12, color: Colors.textSecondary },
  filterTextActive: { color: '#fff', fontFamily: 'DMSans_600SemiBold' },
  empty: { alignItems: 'center', paddingTop: 80, paddingHorizontal: 40 },
  emptyTitle: { fontFamily: 'Fraunces_600SemiBold', fontSize: 20, color: Colors.textPrimary, marginBottom: 8 },
  emptyBody: { fontFamily: 'DMSans_400Regular', fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20 },
});
