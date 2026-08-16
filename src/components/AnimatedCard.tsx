/**
 * AnimatedCard — Samsung Health-style press-scale card
 *
 * Scroll-safe: the tap gesture is cancelled if the finger moves more than
 * 6 px in any direction, so scrolling past a card never accidentally opens it.
 * The scale animation still gives immediate tactile feedback on intentional taps.
 */
import React from "react";
import { StyleProp, ViewStyle } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { GestureDetector, Gesture } from "react-native-gesture-handler";

interface AnimatedCardProps {
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

const SPRING_IN  = { damping: 18, stiffness: 380, mass: 0.5 };
const SPRING_OUT = { damping: 14, stiffness: 260, mass: 0.5 };

// Maximum finger travel (px) before the gesture is treated as a scroll, not a tap
const MAX_TRAVEL = 6;

export function AnimatedCard({ onPress, style, children }: AnimatedCardProps) {
  const scale = useSharedValue(1);

  const tap = Gesture.Tap()
    // Cancel the tap if the finger moves — this prevents accidental opens during scroll
    .maxDeltaX(MAX_TRAVEL)
    .maxDeltaY(MAX_TRAVEL)
    // Press down: spring scale immediately for tactile feel
    .onBegin(() => {
      scale.value = withSpring(0.95, SPRING_IN);
    })
    // Released without moving → successful tap
    .onEnd(() => {
      scale.value = withSpring(1, SPRING_OUT);
      runOnJS(onPress)();
    })
    // Cancelled (e.g. scroll started) → silently reset scale
    .onTouchesCancelled(() => {
      scale.value = withTiming(1, { duration: 150 });
    })
    .onFinalize((_e, success) => {
      if (!success) {
        // Gesture was cancelled (scroll won), reset scale without firing onPress
        scale.value = withTiming(1, { duration: 150 });
      }
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
