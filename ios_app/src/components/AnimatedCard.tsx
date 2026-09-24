/**
 * AnimatedCard — press-scale card, scroll-safe.
 * Uses Pressable (not GestureDetector) so React Native's scroll conflict
 * detection handles the distinction between tap and scroll automatically.
 * No runOnJS needed — onPress is called directly from JS thread.
 */
import React from "react";
import { Pressable, StyleProp, ViewStyle } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

interface AnimatedCardProps {
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

const SPRING_IN  = { damping: 18, stiffness: 380, mass: 0.5 };
const SPRING_OUT = { damping: 14, stiffness: 260, mass: 0.5 };

export function AnimatedCard({ onPress, style, children }: AnimatedCardProps) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[style, animStyle]}>
      <Pressable
        onPress={onPress}
        onPressIn={() => { scale.value = withSpring(0.95, SPRING_IN); }}
        onPressOut={() => { scale.value = withSpring(1, SPRING_OUT); }}
        android_ripple={null}
        style={{ flex: 1 }}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}
