import React, { useState, useEffect, useRef } from "react";
import {
  ScrollView,
  Text,
  View,
  Pressable,
  StyleSheet,
  Dimensions,
  StatusBar,
  Alert,
  Modal,
} from "react-native";
import Svg, { Circle, Path, Rect, Line, G } from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { RootStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "BreathingExercises">;

const { width: SW } = Dimensions.get("window");

interface ExercisePattern {
  id: string;
  name: string;
  ratio: string;
  purpose: string;
  duration: string;
  inhale: number;
  hold1: number;
  exhale: number;
  hold2: number;
}

const EXERCISES: ExercisePattern[] = [
  {
    id: "box",
    name: "Box",
    ratio: "4-4-4-4",
    purpose: "Relaxation",
    duration: "5 mins",
    inhale: 4,
    hold1: 4,
    exhale: 4,
    hold2: 4,
  },
  {
    id: "long_exhale",
    name: "Long ex...",
    ratio: "4-7-8",
    purpose: "Sleep",
    duration: "5 mins",
    inhale: 4,
    hold1: 7,
    exhale: 8,
    hold2: 0,
  },
  {
    id: "equal",
    name: "Equal",
    ratio: "5-0-5",
    purpose: "Focus",
    duration: "5 mins",
    inhale: 5,
    hold1: 0,
    exhale: 5,
    hold2: 0,
  },
  {
    id: "custom",
    name: "Custom",
    ratio: "Set your own pattern.",
    purpose: "",
    duration: "5 mins",
    inhale: 4,
    hold1: 4,
    exhale: 4,
    hold2: 0,
  },
];

export default function BreathingExercisesScreen({ navigation }: Props) {
  const [activeSession, setActiveSession] = useState<ExercisePattern | null>(null);
  const [phase, setPhase] = useState<"Inhale" | "Hold" | "Exhale">("Inhale");
  const [countdown, setCountdown] = useState(4);
  const [isPlaying, setIsPlaying] = useState(false);

  // Animated breath circle scale
  const scale = useSharedValue(1);

  // Four-petal flower geometric graphic for Box breathing
  const renderBoxGraphic = () => (
    <Svg width={46} height={46} viewBox="0 0 50 50">
      <Circle cx="17" cy="17" r="11" fill="#c084fc" opacity={0.6} />
      <Circle cx="33" cy="17" r="11" fill="#c084fc" opacity={0.6} />
      <Circle cx="17" cy="33" r="11" fill="#c084fc" opacity={0.6} />
      <Circle cx="33" cy="33" r="11" fill="#c084fc" opacity={0.6} />
    </Svg>
  );

  // Overlapping soft bubbles for Long exhale
  const renderBubblesGraphic = () => (
    <Svg width={46} height={46} viewBox="0 0 50 50">
      <Circle cx="20" cy="24" r="14" fill="#a78bfa" opacity={0.55} />
      <Circle cx="32" cy="20" r="13" fill="#c4b5fd" opacity={0.7} />
      <Circle cx="14" cy="32" r="7" fill="#818cf8" opacity={0.45} />
    </Svg>
  );

  // Overlapping dual circle lens for Equal
  const renderEqualGraphic = () => (
    <Svg width={46} height={46} viewBox="0 0 50 50">
      <Circle cx="20" cy="25" r="15" fill="#818cf8" opacity={0.5} />
      <Circle cx="30" cy="25" r="15" fill="#a5b4fc" opacity={0.65} />
    </Svg>
  );

  // Dandelion seeds blowing graphic
  const renderDandelionGraphic = () => (
    <Svg width={64} height={64} viewBox="0 0 60 60">
      <Circle cx="30" cy="30" r="8" fill="#facc15" />
      <Line x1="30" y1="38" x2="28" y2="58" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" />
      {/* Radiating umbrella bristles */}
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
        <Line
          key={deg}
          x1={30 + 8 * Math.cos((deg * Math.PI) / 180)}
          y1={30 + 8 * Math.sin((deg * Math.PI) / 180)}
          x2={30 + 19 * Math.cos((deg * Math.PI) / 180)}
          y2={30 + 19 * Math.sin((deg * Math.PI) / 180)}
          stroke="#ffffff"
          strokeWidth="1.5"
          opacity={0.85}
        />
      ))}
      <Circle cx="48" cy="18" r="3" fill="#ffffff" opacity={0.8} />
      <Circle cx="52" cy="28" r="2.5" fill="#ffffff" opacity={0.7} />
    </Svg>
  );

  // Animated style for breathing circle
  const animatedCircleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // Handle breathing sequence cycle
  useEffect(() => {
    if (!activeSession || !isPlaying) return;

    let timer: NodeJS.Timeout;
    const runCycle = () => {
      // Inhale
      setPhase("Inhale");
      scale.value = withTiming(1.4, {
        duration: activeSession.inhale * 1000,
        easing: Easing.inOut(Easing.ease),
      });

      timer = setTimeout(() => {
        // Hold
        if (activeSession.hold1 > 0) {
          setPhase("Hold");
          timer = setTimeout(() => {
            // Exhale
            setPhase("Exhale");
            scale.value = withTiming(1, {
              duration: activeSession.exhale * 1000,
              easing: Easing.inOut(Easing.ease),
            });
            timer = setTimeout(runCycle, activeSession.exhale * 1000);
          }, activeSession.hold1 * 1000);
        } else {
          // Exhale directly
          setPhase("Exhale");
          scale.value = withTiming(1, {
            duration: activeSession.exhale * 1000,
            easing: Easing.inOut(Easing.ease),
          });
          timer = setTimeout(runCycle, activeSession.exhale * 1000);
        }
      }, activeSession.inhale * 1000);
    };

    runCycle();

    return () => clearTimeout(timer);
  }, [activeSession, isPlaying]);

  const startBreathing = (ex: ExercisePattern) => {
    setActiveSession(ex);
    setIsPlaying(true);
    setPhase("Inhale");
  };

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0d0f26" />

      {/* Header */}
      <View style={s.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={s.headerBtn}
          accessibilityLabel="Back"
        >
          <Ionicons name="chevron-back" size={26} color="#ffffff" />
        </Pressable>
        <Text style={s.headerTitle}>Breathing exercises</Text>
        <Pressable
          onPress={() =>
            Alert.alert(
              "Breathing Guidance",
              "Controlled conscious breathing activates parasympathetic tone, reducing heart rate variability stress."
            )
          }
          style={s.headerBtn}
        >
          <Ionicons name="information-circle-outline" size={24} color="#ffffff" />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={s.scrollContent}>
        <Text style={s.screenTitle}>
          Choose a breathing exercise to practise.
        </Text>

        {/* 2x2 Exercise Grid (Screenshots 9 & 10) */}
        <View style={s.grid}>
          {EXERCISES.map((ex) => (
            <Pressable
              key={ex.id}
              style={s.gridCard}
              onPress={() => startBreathing(ex)}
            >
              <View style={s.cardTopRow}>
                <View style={s.cardTextWrap}>
                  <Text style={s.cardTitle}>{ex.name}</Text>
                  <Text style={s.cardRatio}>{ex.ratio}</Text>
                  {ex.purpose ? (
                    <Text style={s.cardPurpose}>{ex.purpose}</Text>
                  ) : null}
                </View>

                {/* Graphic */}
                <View style={s.cardGraphic}>
                  {ex.id === "box" && renderBoxGraphic()}
                  {ex.id === "long_exhale" && renderBubblesGraphic()}
                  {ex.id === "equal" && renderEqualGraphic()}
                </View>
              </View>

              <View style={s.cardBottomRow}>
                <Text style={s.cardDuration}>{ex.duration}</Text>
                <Pressable
                  onPress={() =>
                    Alert.alert("Settings", `Adjust durations for ${ex.name}`)
                  }
                  style={s.gearBtn}
                >
                  <Ionicons name="settings-outline" size={18} color="#94a3b8" />
                </Pressable>
              </View>
            </Pressable>
          ))}
        </View>

        {/* "Before you get started" Card (Screenshots 9 & 10) */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={s.infoCard}>
          <View style={s.infoLeft}>
            <Text style={s.infoTitle}>Before you get started</Text>
            <Text style={s.infoDesc}>
              Learn how each breathing exercise works and get tips to help you practise.
            </Text>
          </View>
          <View style={s.infoRight}>
            <View style={s.dandelionWrap}>
              {renderDandelionGraphic()}
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Guided Breathing Session Modal */}
      <Modal
        visible={activeSession !== null}
        animationType="fade"
        presentationStyle="overFullScreen"
        onRequestClose={() => {
          setActiveSession(null);
          setIsPlaying(false);
        }}
      >
        <View style={s.sessionModalRoot}>
          {/* Top Bar */}
          <View style={s.sessionHeader}>
            <Pressable
              onPress={() => {
                setActiveSession(null);
                setIsPlaying(false);
              }}
              style={s.sessionCloseBtn}
            >
              <Ionicons name="close" size={26} color="#ffffff" />
            </Pressable>
            <Text style={s.sessionTitle}>{activeSession?.name}</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Center Breathing Visualizer */}
          <View style={s.visualizerWrap}>
            <Animated.View style={[s.pulsingBreathCircle, animatedCircleStyle]}>
              <View style={s.innerGlowCircle} />
            </Animated.View>
            <Text style={s.phaseText}>{phase}</Text>
            <Text style={s.patternRatioText}>{activeSession?.ratio}</Text>
          </View>

          {/* Bottom Controls */}
          <View style={s.sessionControls}>
            <Pressable
              style={s.controlBtn}
              onPress={() => setIsPlaying(!isPlaying)}
            >
              <Ionicons
                name={isPlaying ? "pause" : "play"}
                size={28}
                color="#ffffff"
              />
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0d0f26",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 12,
    backgroundColor: "#0d0f26",
  },
  headerBtn: {
    padding: 6,
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#ffffff",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    paddingTop: 8,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 20,
    lineHeight: 30,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 20,
  },
  gridCard: {
    width: (SW - 44) / 2,
    backgroundColor: "#1e224d",
    borderRadius: 22,
    padding: 16,
    justifyContent: "space-between",
    minHeight: 140,
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  cardTextWrap: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 3,
  },
  cardRatio: {
    fontSize: 13,
    color: "#cbd5e1",
    marginBottom: 2,
  },
  cardPurpose: {
    fontSize: 12,
    color: "#94a3b8",
  },
  cardGraphic: {
    width: 46,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
  },
  cardBottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 18,
  },
  cardDuration: {
    fontSize: 12,
    color: "#cbd5e1",
    fontWeight: "500",
  },
  gearBtn: {
    padding: 4,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#161938",
    borderRadius: 24,
    padding: 18,
  },
  infoLeft: {
    flex: 1,
    paddingRight: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 4,
  },
  infoDesc: {
    fontSize: 13,
    color: "#94a3b8",
    lineHeight: 18,
  },
  infoRight: {
    alignItems: "center",
    justifyContent: "center",
  },
  dandelionWrap: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: "#38bdf8",
    alignItems: "center",
    justifyContent: "center",
  },
  sessionModalRoot: {
    flex: 1,
    backgroundColor: "#0a0c1e",
    justifyContent: "space-between",
    paddingVertical: 40,
  },
  sessionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  sessionCloseBtn: {
    padding: 8,
  },
  sessionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ffffff",
  },
  visualizerWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  pulsingBreathCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(129,140,248,0.25)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 36,
  },
  innerGlowCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#6366f1",
  },
  phaseText: {
    fontSize: 32,
    fontWeight: "800",
    color: "#ffffff",
    marginBottom: 8,
  },
  patternRatioText: {
    fontSize: 15,
    color: "#94a3b8",
  },
  sessionControls: {
    alignItems: "center",
    paddingBottom: 20,
  },
  controlBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#6366f1",
    alignItems: "center",
    justifyContent: "center",
  },
});
