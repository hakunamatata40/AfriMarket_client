import { Colors } from '@/constants/colors';
import * as Haptics from 'expo-haptics';
import React, { useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableWithoutFeedback } from 'react-native';

interface Props {
  label: string;
  emoji: string;
  active: boolean;
  onPress: () => void;
}

export default function CategoryPill({ label, emoji, active, onPress }: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  function handlePress() {
    Haptics.selectionAsync();
    Animated.sequence([
      Animated.spring(scale, { toValue: 0.9, useNativeDriver: true, speed: 50 }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20 }),
    ]).start();
    onPress();
  }

  return (
    <TouchableWithoutFeedback onPress={handlePress}>
      <Animated.View
        style={[
          styles.pill,
          active ? styles.pillActive : styles.pillInactive,
          { transform: [{ scale }] },
        ]}
      >
        <Text style={styles.emoji}>{emoji}</Text>
        <Text style={[styles.label, active ? styles.labelActive : styles.labelInactive]}>
          {label}
        </Text>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 100,
    borderWidth: 1,
  },
  pillActive: {
    backgroundColor: Colors.orange,
    borderColor: Colors.orange,
  },
  pillInactive: {
    backgroundColor: Colors.bgLight,
    borderColor: Colors.border,
  },
  emoji: { fontSize: 14 },
  label: { fontFamily: 'DMSans_600SemiBold', fontSize: 12, letterSpacing: 0.08 },
  labelActive: { color: '#fff' },
  labelInactive: { color: Colors.textSecondary },
});
