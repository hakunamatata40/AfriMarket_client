import { Colors } from '@/constants/colors';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

interface Props {
  current: number;
  threshold: number;
  unit: string;
  height?: number;
  showNumbers?: boolean;
}

export default function ProgressBar({ current, threshold, unit, height = 8, showNumbers = true }: Props) {
  const progress = Math.min(current / threshold, 1);
  const animWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animWidth, {
      toValue: progress,
      duration: 1200,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const isComplete = progress >= 1;
  const remaining = Math.max(threshold - current, 0);

  return (
    <View>
      {showNumbers && (
        <View style={styles.row}>
          <Text style={styles.numbers}>
            <Text style={[styles.current, isComplete && styles.currentComplete]}>
              {current} {unit}
            </Text>
            {' / '}
            <Text style={styles.threshold}>{threshold} {unit}</Text>
          </Text>
          {!isComplete && (
            <Text style={styles.remaining}>encore {remaining} {unit}</Text>
          )}
          {isComplete && (
            <Text style={[styles.remaining, { color: Colors.green, fontFamily: 'DMSans_600SemiBold' }]}>
              ✓ Seuil atteint !
            </Text>
          )}
        </View>
      )}
      <View style={[styles.track, { height }]}>
        <Animated.View
          style={[
            styles.fill,
            {
              height,
              width: animWidth.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
              backgroundColor: isComplete ? Colors.green : Colors.orange,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  numbers: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    color: Colors.textSecondary,
  },
  current: {
    fontFamily: 'DMSans_600SemiBold',
    color: Colors.orange,
  },
  currentComplete: {
    color: Colors.green,
  },
  threshold: {
    color: Colors.textSecondary,
  },
  remaining: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 11,
    color: Colors.textDim,
  },
  track: {
    backgroundColor: Colors.shimmer1,
    borderRadius: 100,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: 100,
  },
});
