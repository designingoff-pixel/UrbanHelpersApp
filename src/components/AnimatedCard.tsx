/**
 * AnimatedCard
 * A drop-in Pressable replacement that plays a Samsung Health-style
 * spring scale-down on press and spring scale-up on release.
 * Works on both wide and half cards.
 */
import React from "react";
import { StyleProp, ViewStyle } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from "react-native-reanimated";
import {
  GestureDetector,
  Gesture,
} from "react-native-gesture-handler";

interface AnimatedCardProps {
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

const SPRING_CONFIG = {
  damping: 15,
  stiffness: 300,
  mass: 0.6,
};

export function AnimatedCard({ onPress, style, children }: AnimatedCardProps) {
  const scale = useSharedValue(1);

  const tap = Gesture.Tap()
    .onBegin(() => {
      scale.value = withSpring(0.94, SPRING_CONFIG);
    })
    .onFinalize(() => {
      scale.value = withSpring(1, SPRING_CONFIG);
      runOnJS(onPress)();
    });

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <GestureDetector gesture={tap}>
      <Animated.View style={[style, animStyle]}>
        {children}
      </Animated.View>
    </GestureDetector>
  );
}
