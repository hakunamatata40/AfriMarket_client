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
import { useAuthStore } from '@/store/auth.store';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ALL_CATEGORIES: OfferCategory[] = [
  'VEGETABLES', 'FRUITS', 'TUBERS', 'CEREALS', 'LIVESTOCK',
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeCategory, setActiveCategory] = useState<OfferCategory | null>(null);
  const [search, setSearch] = useState('');

  // FAB pulse animation
  const fabPulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(fabPulse, { toValue: 1.15, duration: 1000, useNativeDriver: true }),
        Animated.timing(fabPulse, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const loadOffers = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);
    try {
      const data = await fetchOffers({ category: activeCategory ?? undefined, search });
      setOffers(data);
    } catch {
      // Fallback to demo data
      setOffers(DEMO_OFFERS.filter(o =>
        (!activeCategory || o.category === activeCategory) &&
        (!search || o.title.toLowerCase().includes(search.toLowerCase()))
      ));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeCategory, search]);

  useEffect(() => { loadOffers(); }, [loadOffers]);

  const firstName = user?.fullName?.split(' ')[0] ?? 'vous';

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>Bonjour, {firstName} 👋</Text>
          <View style={styles.locationPill}>
            <Text style={styles.locationText}>📍 {user?.arrondissement ?? 'Yaoundé'}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.searchIcon} onPress={() => {}}>
          <Text style={{ fontSize: 20 }}>🔍</Text>
        </TouchableOpacity>
      </View>

      {/* Search bar */}
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Rechercher tomates, plantains…"
          placeholderTextColor={Colors.textDim}
          returnKeyType="search"
          onSubmitEditing={() => loadOffers()}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')} style={styles.clearBtn}>
            <Text style={{ color: Colors.textDim }}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesRow}
      >
        <CategoryPill
          label="Tout"
          emoji="🛒"
          active={activeCategory === null}
          onPress={() => setActiveCategory(null)}
        />
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

      {/* Section title */}
      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>OFFRES ACTIVES PRÈS DE CHEZ VOUS</Text>
        <Text style={styles.sectionCount}>{offers.length} offre{offers.length !== 1 ? 's' : ''}</Text>
      </View>

      {/* Offers list */}
      {loading ? (
        <FlatList
          data={[1, 2, 3]}
          keyExtractor={(i) => String(i)}
          renderItem={() => <View style={{ marginBottom: 16 }}><SkeletonCard /></View>}
          contentContainerStyle={{ paddingBottom: 120 }}
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
          contentContainerStyle={{ paddingBottom: 120, paddingTop: 8 }}
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
              <Text style={styles.emptyEmoji}>🌿</Text>
              <Text style={styles.emptyTitle}>Aucune offre disponible</Text>
              <Text style={styles.emptyBody}>
                Aucune offre ne correspond à votre recherche. Réessayez avec d'autres filtres.
              </Text>
            </View>
          }
        />
      )}

      {/* FAB */}
      <Animated.View style={[styles.fab, { transform: [{ scale: fabPulse }] }]}>
        <TouchableOpacity
          style={styles.fabBtn}
          onPress={() => router.push('/(tabs)/discover')}
          activeOpacity={0.9}
        >
          <Text style={{ fontSize: 22 }}>🔍</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
    paddingTop: 8,
  },
  headerLeft: { gap: 4 },
  greeting: {
    fontFamily: 'Fraunces_400Regular_Italic',
    fontSize: 26,
    color: Colors.textPrimary,
  },
  locationPill: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.bgLight,
    borderRadius: 100,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  locationText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 11,
    color: Colors.textSecondary,
  },
  searchIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.orange + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 16,
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
  clearBtn: { padding: 4 },
  categoriesRow: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 8,
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 10,
    letterSpacing: 0.08,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
  },
  sectionCount: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    color: Colors.textDim,
  },
  empty: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 40 },
  emptyEmoji: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontFamily: 'Fraunces_600SemiBold', fontSize: 20, color: Colors.textPrimary, marginBottom: 8 },
  emptyBody: { fontFamily: 'DMSans_400Regular', fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20 },
  fab: {
    position: 'absolute',
    bottom: 90,
    right: 20,
  },
  fabBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.orange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
});
