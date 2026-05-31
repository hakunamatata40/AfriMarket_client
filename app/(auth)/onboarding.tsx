import AfriButton from '@/components/ui/AfriButton';
import { Colors } from '@/constants/colors';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewToken,
} from 'react-native';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    emoji: '🧑‍🌾',
    bg: '#FFF3E0',
    accent: Colors.orange,
    title: 'Du producteur\nà votre table',
    body: 'AfriMarket connecte directement les agriculteurs de Mbalmayo, Obala et Ebolowa avec les ménages de Yaoundé. Zéro intermédiaire.',
  },
  {
    id: '2',
    emoji: '🤝',
    bg: '#E8F5E4',
    accent: Colors.green,
    title: 'La force\ndu groupage',
    body: 'Rejoignez vos voisins pour commander ensemble. Quand le seuil est atteint, la livraison se déclenche — et vous économisez jusqu\'à 40%.',
  },
  {
    id: '3',
    emoji: '📦',
    bg: '#FFF9C4',
    accent: '#C9A820',
    title: 'Retirez près\nde chez vous',
    body: 'Récupérez votre commande dans un point relais de quartier. Votre producteur est notifié, vous aussi. Tout est tracé.',
  },
];

export default function OnboardingScreen() {
  const [current, setCurrent] = useState(0);
  const flatRef = useRef<FlatList>(null);
  const bounceAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.spring(bounceAnim, { toValue: -8, useNativeDriver: true, speed: 3, bounciness: 12 }),
        Animated.spring(bounceAnim, { toValue: 0, useNativeDriver: true, speed: 3 }),
      ])
    ).start();
  }, []);

  const onViewable = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems[0]) setCurrent(viewableItems[0].index ?? 0);
  }).current;

  function next() {
    if (current < SLIDES.length - 1) {
      flatRef.current?.scrollToIndex({ index: current + 1 });
    } else {
      router.replace('/(auth)/login');
    }
  }

  const slide = SLIDES[current];

  return (
    <View style={styles.root}>
      <FlatList
        ref={flatRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewable}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width, backgroundColor: item.bg }]}>
            {/* Illustration area */}
            <View style={[styles.illustrationArea, { backgroundColor: item.bg }]}>
              <Animated.Text style={[styles.bigEmoji, { transform: [{ translateY: bounceAnim }] }]}>
                {item.emoji}
              </Animated.Text>
              {/* Decorative circles */}
              <View style={[styles.circle1, { backgroundColor: item.accent + '20' }]} />
              <View style={[styles.circle2, { backgroundColor: item.accent + '10' }]} />
            </View>

            {/* Content */}
            <View style={styles.content}>
              <Text style={[styles.title, { color: Colors.textPrimary }]}>{item.title}</Text>
              <Text style={styles.body}>{item.body}</Text>
            </View>
          </View>
        )}
        keyExtractor={(i) => i.id}
      />

      {/* Controls overlay */}
      <View style={styles.controls}>
        {/* Dots */}
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === current
                  ? { width: 20, backgroundColor: slide.accent }
                  : { width: 8, backgroundColor: slide.accent + '40' },
              ]}
            />
          ))}
        </View>

        <AfriButton
          label={current < SLIDES.length - 1 ? 'Suivant →' : 'Commencer'}
          onPress={next}
          size="lg"
          style={{ marginHorizontal: 24 }}
        />

        <TouchableOpacity onPress={() => router.replace('/(auth)/login')} style={{ padding: 12 }}>
          <Text style={styles.skip}>Passer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  slide: { flex: 1, height },
  illustrationArea: {
    height: height * 0.5,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  bigEmoji: { fontSize: 120 },
  circle1: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    top: -50,
    right: -60,
  },
  circle2: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    bottom: -40,
    left: -40,
  },
  content: {
    flex: 1,
    backgroundColor: Colors.bg,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 28,
    paddingTop: 32,
    marginTop: -24,
  },
  title: {
    fontFamily: 'Fraunces_700Bold',
    fontSize: 36,
    lineHeight: 42,
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  body: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 15,
    lineHeight: 22,
    color: Colors.textSecondary,
  },
  controls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.bg,
    paddingBottom: 32,
    paddingTop: 16,
    gap: 8,
  },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginBottom: 8 },
  dot: { height: 8, borderRadius: 4 },
  skip: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: Colors.textDim,
    textAlign: 'center',
  },
});
