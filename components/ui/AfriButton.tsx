import { Colors } from '@/constants/colors';
import * as Haptics from 'expo-haptics';
import React, { useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  StyleProp,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  ViewStyle,
} from 'react-native';

interface Props {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  style?: StyleProp<ViewStyle>;
}

export default function AfriButton({
  label,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  size = 'md',
  style,
}: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  function handlePressIn() {
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 40 }).start();
  }
  function handlePressOut() {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20 }).start();
  }
  function handlePress() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  }

  const heights: Record<string, number> = { sm: 40, md: 48, lg: 56 };
  const fontSizes: Record<string, number> = { sm: 14, md: 15, lg: 17 };

  const bgColor =
    variant === 'primary' ? Colors.orange :
    variant === 'outline' ? 'transparent' : 'transparent';
  const textColor =
    variant === 'primary' ? '#fff' : Colors.orange;
  const borderColor = variant === 'outline' ? Colors.orange : 'transparent';

  return (
    <TouchableWithoutFeedback
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={disabled || loading}
    >
      <Animated.View
        style={[
          styles.btn,
          {
            height: heights[size],
            backgroundColor: disabled ? Colors.shimmer1 : bgColor,
            borderColor,
            borderWidth: variant === 'outline' ? 1.5 : 0,
            opacity: disabled ? 0.6 : 1,
            transform: [{ scale }],
          },
          style,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={variant === 'primary' ? '#fff' : Colors.orange} size="small" />
        ) : (
          <Text style={[styles.label, { fontSize: fontSizes[size], color: textColor }]}>
            {label}
          </Text>
        )}
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  label: {
    fontFamily: 'Fraunces_600SemiBold',
    letterSpacing: 0.2,
  },
});
