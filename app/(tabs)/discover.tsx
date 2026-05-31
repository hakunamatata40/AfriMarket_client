import CategoryPill from '@/components/ui/CategoryPill';
import OfferCard from '@/components/ui/OfferCard';
import SkeletonCard from '@/components/ui/SkeletonCard';
import { Colors } from '@/constants/colors';
import {
  CATEGORY_EMOJIS,
  CATEGORY_LABELS,
  DEMO_OFFERS,
  fetchOffers,
  Offer,
  OfferCategory,
} from '@/services/offers.service';
import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ALL_CATEGORIES: OfferCategory[] = [
  'VEGETABLES', 'FRUITS', 'TUBERS', 'CEREALS', 'LIVESTOCK',
];

const ZONES = ['Yaoundé 1','Yaoundé 2','Yaoundé 3','Yaoundé 4','Yaoundé 5','Yaoundé 6','Yaoundé 7'];

export default function DiscoverScreen() {
  const insets = useSafeAreaInsets();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeCategory, setActiveCategory] = useState<OfferCategory | null>(null);
  const [activeZone, setActiveZone] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const loadOffers = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);
    try {
      const data = await fetchOffers({
        category: activeCategory ?? undefined,
        zone: activeZone ?? undefined,
        search,
      });
      setOffers(data);
    } catch {
      setOffers(DEMO_OFFERS.filter(o => {
        if (activeCategory && o.category !== activeCategory) return false;
        if (activeZone && !o.zoneName.includes(activeZone)) return false;
        if (search && !o.title.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
      }));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeCategory, activeZone, search]);

  useEffect(() => { loadOffers(); }, [loadOffers]);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Découvrir</Text>
        <Text style={styles.subtitle}>Toutes les offres disponibles à Yaoundé</Text>
      </View>

      {/* Search */}
      <View style={styles.searchBar}>
        <Text style={{ marginRight: 8 }}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Légumes, fruits, céréales…"
          placeholderTextColor={Colors.textDim}
          returnKeyType="search"
          onSubmitEditing={() => loadOffers()}
        />
      </View>

      {/* Category filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        <CategoryPill label="Tout" emoji="🛒" active={activeCategory === null} onPress={() => setActiveCategory(null)} />
        {ALL_CATEGORIES.map((cat) => (
          <CategoryPill
            key={cat}
            label={CATEGORY_LABELS[cat]}
            emoji={CATEGORY_EMOJIS[cat]}
            active={activeCategory === cat}
            onPress={() => setActiveCategory(activeCategory === cat ? null : cat)}
          />
        ))}
      </ScrollView>

      {/* Zone filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {ZONES.map((z) => (
          <View
            key={z}
            style={[
              styles.zonePill,
              activeZone === z && styles.zonePillActive,
            ]}
          >
            <Text
              style={[styles.zonePillText, activeZone === z && styles.zonePillTextActive]}
              onPress={() => setActiveZone(activeZone === z ? null : z)}
            >
              {z}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Results count */}
      <Text style={styles.resultCount}>
        {loading ? '…' : `${offers.length} offre${offers.length !== 1 ? 's' : ''} trouvée${offers.length !== 1 ? 's' : ''}`}
      </Text>

      {loading ? (
        <FlatList
          data={[1, 2, 3]}
          keyExtractor={(i) => String(i)}
          renderItem={() => <View style={{ marginBottom: 16 }}><SkeletonCard /></View>}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      ) : (
        <FlatList
          data={offers}
          keyExtractor={(o) => o.id}
          renderItem={({ item, index }) => (
            <View style={{ marginBottom: 16 }}>
              <OfferCard offer={item} index={index} />
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 100, paddingTop: 8 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadOffers(true)}
              tintColor={Colors.orange}
              colors={[Colors.orange]}
            />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={{ fontSize: 48, marginBottom: 16 }}>🔍</Text>
              <Text style={styles.emptyTitle}>Aucun résultat</Text>
              <Text style={styles.emptyBody}>Modifiez vos filtres ou revenez plus tard.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 },
  title: { fontFamily: 'Fraunces_700Bold', fontSize: 28, color: Colors.textPrimary },
  subtitle: { fontFamily: 'DMSans_400Regular', fontSize: 13, color: Colors.textSecondary, marginTop: 4 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: Colors.textPrimary,
  },
  filterRow: { paddingHorizontal: 20, paddingBottom: 10, gap: 8 },
  zonePill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgLight,
  },
  zonePillActive: { backgroundColor: Colors.green, borderColor: Colors.green },
  zonePillText: { fontFamily: 'DMSans_400Regular', fontSize: 11, color: Colors.textSecondary },
  zonePillTextActive: { color: '#fff', fontFamily: 'DMSans_600SemiBold' },
  resultCount: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    color: Colors.textDim,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  empty: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 40 },
  emptyTitle: { fontFamily: 'Fraunces_600SemiBold', fontSize: 20, color: Colors.textPrimary, marginBottom: 8 },
  emptyBody: { fontFamily: 'DMSans_400Regular', fontSize: 14, color: Colors.textSecondary, textAlign: 'center' },
});
