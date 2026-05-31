import { Colors } from '@/constants/colors';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

export default function SkeletonCard() {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 800, useNativeDriver: false }),
        Animated.timing(shimmer, { toValue: 0, duration: 800, useNativeDriver: false }),
      ])
    ).start();
  }, []);

  const bg = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [Colors.shimmer1, Colors.shimmer2],
  });

  return (
    <View style={styles.card}>
      <View style={styles.inner}>
        <Animated.View style={[styles.photo, { backgroundColor: bg }]} />
        <View style={styles.content}>
          <Animated.View style={[styles.line, { width: '60%', backgroundColor: bg }]} />
          <Animated.View style={[styles.line, { width: '90%', height: 14, marginTop: 6, backgroundColor: bg }]} />
          <Animated.View style={[styles.line, { width: '80%', height: 14, backgroundColor: bg }]} />
          <Animated.View style={[styles.line, { width: '40%', height: 20, marginTop: 4, backgroundColor: bg }]} />
          <Animated.View style={[styles.line, { width: '50%', height: 8, marginTop: 12, borderRadius: 4, backgroundColor: bg }]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    marginHorizontal: 16,
    marginBottom: 4,
    elevation: 2,
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
  },
  inner: { flexDirection: 'row', padding: 12, gap: 12 },
  photo: { width: 110, height: 130, borderRadius: 14 },
  content: { flex: 1, gap: 6 },
  line: { height: 10, borderRadius: 6 },
});
