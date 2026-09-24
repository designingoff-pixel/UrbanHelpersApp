import React, { useState } from "react";
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
import Svg, {
  Circle,
  Path,
  Rect,
  Line,
  G,
  LinearGradient as SvgLinearGradient,
  Stop,
  Defs,
} from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import Animated, { FadeInDown } from "react-native-reanimated";
import { RootStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "VascularLoad">;

const { width: SW } = Dimensions.get("window");

export default function VascularLoadScreen({ navigation }: Props) {
  const [selectedDayOffset, setSelectedDayOffset] = useState(0);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [guideStep, setGuideStep] = useState<1 | 2>(1);

  const dayLabel =
    selectedDayOffset === 0
      ? "Today"
      : selectedDayOffset === -1
      ? "Yesterday"
      : `${Math.abs(selectedDayOffset)} days ago`;

  // 5-segment colored gauge renderer (Blue, Cyan, Green, Yellow, Orange)
  const renderGauge = () => {
    const gaugeWidth = SW - 64;
    const segmentGap = 6;
    const segWidth = (gaugeWidth - segmentGap * 4) / 5;
    const colors = ["#2563eb", "#06b6d4", "#22c55e", "#eab308", "#ea580c"];

    return (
      <View style={s.gaugeWrap}>
        <View style={s.gaugeSegmentsRow}>
          {colors.map((c, i) => (
            <View
              key={i}
              style={[
                s.gaugeSegment,
                {
                  width: segWidth,
                  backgroundColor: c,
                  opacity: i === 1 ? 1 : 0.45,
                },
              ]}
            />
          ))}
        </View>

        {/* Pointer Pin for active zone (Index 1 - Normal / Cyan) */}
        <View style={[s.pointerPinWrap, { left: segWidth * 1.5 + segmentGap }]}>
          <View style={s.pointerTriangle} />
          <Text style={s.pointerText}>Optimal</Text>
        </View>

        <View style={s.gaugeLabelsRow}>
          <Text style={s.gaugeMinMax}>Lower</Text>
          <Text style={s.gaugeMinMax}>Higher</Text>
        </View>
      </View>
    );
  };

  // Arterial Network Illustration
  const renderArteryIllustration = () => (
    <Svg width={140} height={120} viewBox="0 0 140 120">
      <Defs>
        <SvgLinearGradient id="arteryGrad" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#f43f5e" />
          <Stop offset="50%" stopColor="#8b5cf6" />
          <Stop offset="100%" stopColor="#3b82f6" />
        </SvgLinearGradient>
      </Defs>

      {/* Pulsing rings */}
      <Circle cx="70" cy="60" r="50" stroke="rgba(244,63,94,0.15)" strokeWidth="2" fill="none" />
      <Circle cx="70" cy="60" r="38" stroke="rgba(59,130,246,0.2)" strokeWidth="2" fill="none" />

      {/* Main vascular tree arch */}
      <Path
        d="M30 65 Q50 30 70 30 Q90 30 110 65"
        stroke="url(#arteryGrad)"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      />
      {/* Branching vessels */}
      <Path
        d="M50 45 Q40 65 35 85"
        stroke="#3b82f6"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d="M90 45 Q100 65 105 85"
        stroke="#f43f5e"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d="M70 30 L70 90"
        stroke="url(#arteryGrad)"
        strokeWidth="4"
        strokeLinecap="round"
      />

      {/* Pulse points */}
      <Circle cx="70" cy="30" r="4" fill="#ffffff" />
      <Circle cx="35" cy="85" r="3.5" fill="#38bdf8" />
      <Circle cx="105" cy="85" r="3.5" fill="#fb7185" />
      <Circle cx="70" cy="90" r="3.5" fill="#c084fc" />
    </Svg>
  );

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      {/* Top Header */}
      <View style={s.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={s.headerBtn}
          accessibilityLabel="Back"
        >
          <Ionicons name="chevron-back" size={26} color="#ffffff" />
        </Pressable>
        <Text style={s.headerTitle}>Vascular load</Text>
        <Pressable
          onPress={() => Alert.alert("Options", "Vascular load settings")}
          style={s.headerBtn}
          accessibilityLabel="Options"
        >
          <Ionicons name="ellipsis-vertical" size={20} color="#ffffff" />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Date Navigator: < [ Today ] > */}
        <View style={s.dateNavWrap}>
          <Pressable
            onPress={() => setSelectedDayOffset((prev) => prev - 1)}
            style={s.dateArrow}
          >
            <Ionicons name="chevron-back" size={18} color="#9ca3af" />
          </Pressable>
          <View style={s.datePill}>
            <Text style={s.datePillText}>{dayLabel}</Text>
          </View>
          <Pressable
            onPress={() => setSelectedDayOffset((prev) => Math.min(0, prev + 1))}
            style={[s.dateArrow, selectedDayOffset === 0 && s.dateArrowDisabled]}
            disabled={selectedDayOffset === 0}
          >
            <Ionicons
              name="chevron-forward"
              size={18}
              color={selectedDayOffset === 0 ? "#374151" : "#9ca3af"}
            />
          </Pressable>
        </View>

        {/* Hero Card with 5-segment colored gauge (Screenshot 7) */}
        <Animated.View entering={FadeInDown.duration(400)} style={s.card}>
          <Text style={s.heroScoreLabel}>Nocturnal Vascular Status</Text>
          <View style={s.scoreRow}>
            <Text style={s.scoreBigText}>Optimal</Text>
            <Ionicons name="shield-checkmark" size={22} color="#06b6d4" />
          </View>

          <Text style={s.heroSummary}>
            Vascular load estimates physical strain and arterial resistance on your vascular system during sleep.
          </Text>

          {/* 5-segment gauge */}
          {renderGauge()}
        </Animated.View>

        {/* What Is Vascular Load Card */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={s.card}>
          <View style={s.cardHeaderRow}>
            <Text style={s.cardTitle}>About vascular load</Text>
            <Ionicons name="heart-circle-outline" size={20} color="#06b6d4" />
          </View>
          <Text style={s.bodyText}>
            While you sleep, your heart and vascular system should typically relax, lowering arterial tension. High vascular load indicates that your arteries experienced elevated pressure or resistance during rest.
          </Text>
        </Animated.View>

        {/* Guide / Track Vascular Load Card (Opens Screenshot 8 & 9 Flow) */}
        <Animated.View entering={FadeInDown.delay(150).duration(400)}>
          <Pressable
            style={s.card}
            onPress={() => {
              setGuideStep(1);
              setShowGuideModal(true);
            }}
          >
            <View style={s.trackRow}>
              <View style={s.iconWrap}>
                <Ionicons name="pulse" size={24} color="#06b6d4" />
              </View>
              <View style={s.trackContent}>
                <Text style={s.trackTitle}>Track your vascular load</Text>
                <Text style={s.trackSub}>
                  Learn how overnight arterial pressure is measured and what you can do to keep it optimal.
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#6b7280" />
            </View>
          </Pressable>
        </Animated.View>

        {/* Factors Affecting Vascular Load */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)} style={s.card}>
          <Text style={s.cardTitle}>Factors that impact vascular load</Text>

          <View style={s.factorItem}>
            <View style={s.factorDot} />
            <View style={{ flex: 1 }}>
              <Text style={s.factorTitle}>Evening meals & alcohol</Text>
              <Text style={s.factorSub}>
                Digestion and alcohol increase night-time metabolic demands and vascular resistance.
              </Text>
            </View>
          </View>

          <View style={s.factorItem}>
            <View style={s.factorDot} />
            <View style={{ flex: 1 }}>
              <Text style={s.factorTitle}>Stress and sympathetic activation</Text>
              <Text style={s.factorSub}>
                Elevated cortisol and epinephrine cause peripheral vasoconstriction.
              </Text>
            </View>
          </View>

          <View style={s.factorItem}>
            <View style={s.factorDot} />
            <View style={{ flex: 1 }}>
              <Text style={s.factorTitle}>Sleep breathing stability</Text>
              <Text style={s.factorSub}>
                Respiratory pauses or intermittent hypoxia lead to surges in vascular resistance.
              </Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Guide Flow Modal (Screenshots 8 & 9 Reference) */}
      <Modal
        visible={showGuideModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowGuideModal(false)}
      >
        <View style={s.modalRoot}>
          {/* Header */}
          <View style={s.modalHeader}>
            <Pressable
              onPress={() => {
                if (guideStep === 2) {
                  setGuideStep(1);
                } else {
                  setShowGuideModal(false);
                }
              }}
              style={s.modalBackBtn}
            >
              <Ionicons name="chevron-back" size={24} color="#ffffff" />
            </Pressable>
            <Text style={s.modalHeaderTitle}>Vascular load</Text>
            <View style={{ width: 36 }} />
          </View>

          <ScrollView contentContainerStyle={s.modalScroll}>
            {guideStep === 1 ? (
              /* Step 1: Track stress on your vascular system (Screenshot 9) */
              <View style={s.stepWrap}>
                <View style={s.stepGraphicWrap}>
                  {renderArteryIllustration()}
                </View>

                <Text style={s.stepTitle}>
                  Track stress on your vascular system
                </Text>

                <Text style={s.stepDescription}>
                  Vascular load measures the strain on your cardiovascular arteries overnight to help you identify factors that impact your heart during sleep and recovery.
                </Text>

                <View style={s.stepCard}>
                  <View style={s.stepBenefitRow}>
                    <Ionicons name="shield-checkmark-outline" size={22} color="#06b6d4" />
                    <Text style={s.stepBenefitText}>
                      Early detection of arterial strain trends before clinical symptoms occur.
                    </Text>
                  </View>

                  <View style={s.stepBenefitRow}>
                    <Ionicons name="bar-chart-outline" size={22} color="#06b6d4" />
                    <Text style={s.stepBenefitText}>
                      Track how habits like late eating or intense evening workouts affect your nocturnal recovery.
                    </Text>
                  </View>
                </View>
              </View>
            ) : (
              /* Step 2: What you need to know about vascular load (Screenshot 8) */
              <View style={s.stepWrap}>
                <Text style={s.stepTitle}>
                  What you need to know about vascular load
                </Text>

                <View style={s.infoBlockList}>
                  <View style={s.infoBlock}>
                    <View style={s.infoIconWrap}>
                      <Ionicons name="watch-outline" size={24} color="#38bdf8" />
                    </View>
                    <View style={s.infoBlockContent}>
                      <Text style={s.infoBlockTitle}>Galaxy Watch requirement</Text>
                      <Text style={s.infoBlockText}>
                        Wear your watch securely through the night. The watch gathers continuous photoplethysmography (PPG) pulse wave data while you rest.
                      </Text>
                    </View>
                  </View>

                  <View style={s.infoBlock}>
                    <View style={s.infoIconWrap}>
                      <Ionicons name="moon-outline" size={24} color="#a855f7" />
                    </View>
                    <View style={s.infoBlockContent}>
                      <Text style={s.infoBlockTitle}>Overnight calculation</Text>
                      <Text style={s.infoBlockText}>
                        Vascular load is synthesized each morning by correlating pulse wave transit times, autonomic nervous tone, and sleep depth.
                      </Text>
                    </View>
                  </View>

                  <View style={s.infoBlock}>
                    <View style={s.infoIconWrap}>
                      <Ionicons name="fitness-outline" size={24} color="#22c55e" />
                    </View>
                    <View style={s.infoBlockContent}>
                      <Text style={s.infoBlockTitle}>Lifestyle actionable insights</Text>
                      <Text style={s.infoBlockText}>
                        Consistently elevated nocturnal vascular load suggests consulting a physician or modifying late-night habits to protect arterial flexibility.
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Bottom Action Button: Next vs Get Started */}
          <View style={s.modalBottom}>
            {guideStep === 1 ? (
              <Pressable
                style={s.guideBtn}
                onPress={() => setGuideStep(2)}
              >
                <Text style={s.guideBtnText}>Next</Text>
              </Pressable>
            ) : (
              <Pressable
                style={s.guideBtn}
                onPress={() => setShowGuideModal(false)}
              >
                <Text style={s.guideBtnText}>Get started</Text>
              </Pressable>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#000000",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 12,
    backgroundColor: "#000000",
  },
  headerBtn: {
    padding: 6,
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#ffffff",
    letterSpacing: 0.2,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  dateNavWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    marginVertical: 14,
  },
  dateArrow: {
    padding: 6,
  },
  dateArrowDisabled: {
    opacity: 0.3,
  },
  datePill: {
    backgroundColor: "#18181b",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#27272a",
  },
  datePillText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#e5e7eb",
  },
  card: {
    backgroundColor: "#18181b",
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 8,
  },
  heroScoreLabel: {
    fontSize: 13,
    color: "#9ca3af",
    marginBottom: 4,
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  scoreBigText: {
    fontSize: 34,
    fontWeight: "800",
    color: "#06b6d4",
  },
  heroSummary: {
    fontSize: 13,
    color: "#9ca3af",
    lineHeight: 18,
    marginBottom: 24,
  },
  gaugeWrap: {
    marginTop: 6,
    marginBottom: 10,
  },
  gaugeSegmentsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: 12,
  },
  gaugeSegment: {
    height: 12,
    borderRadius: 6,
  },
  pointerPinWrap: {
    position: "relative",
    alignItems: "center",
    marginTop: 6,
    marginBottom: 8,
  },
  pointerTriangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderBottomWidth: 6,
    borderStyle: "solid",
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "#06b6d4",
    transform: [{ rotate: "180deg" }],
  },
  pointerText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#06b6d4",
    marginTop: 2,
  },
  gaugeLabelsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  gaugeMinMax: {
    fontSize: 11,
    color: "#6b7280",
    fontWeight: "600",
  },
  bodyText: {
    fontSize: 13,
    color: "#9ca3af",
    lineHeight: 19,
  },
  trackRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(6,182,212,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  trackContent: {
    flex: 1,
  },
  trackTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 3,
  },
  trackSub: {
    fontSize: 12,
    color: "#9ca3af",
    lineHeight: 17,
  },
  factorItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginTop: 14,
  },
  factorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#06b6d4",
    marginTop: 6,
  },
  factorTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ffffff",
  },
  factorSub: {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 2,
    lineHeight: 16,
  },
  modalRoot: {
    flex: 1,
    backgroundColor: "#000000",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#1f2937",
  },
  modalBackBtn: {
    padding: 6,
  },
  modalHeaderTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ffffff",
  },
  modalScroll: {
    padding: 20,
  },
  stepWrap: {
    alignItems: "center",
  },
  stepGraphicWrap: {
    marginVertical: 20,
    alignItems: "center",
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 14,
  },
  stepDescription: {
    fontSize: 14,
    color: "#9ca3af",
    textAlign: "center",
    lineHeight: 21,
    marginBottom: 24,
  },
  stepCard: {
    backgroundColor: "#18181b",
    borderRadius: 20,
    padding: 20,
    width: "100%",
    gap: 18,
  },
  stepBenefitRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
  },
  stepBenefitText: {
    flex: 1,
    fontSize: 14,
    color: "#d1d5db",
    lineHeight: 20,
  },
  infoBlockList: {
    width: "100%",
    gap: 16,
    marginTop: 10,
  },
  infoBlock: {
    flexDirection: "row",
    backgroundColor: "#18181b",
    borderRadius: 20,
    padding: 16,
    gap: 14,
    alignItems: "flex-start",
  },
  infoIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#27272a",
    alignItems: "center",
    justifyContent: "center",
  },
  infoBlockContent: {
    flex: 1,
  },
  infoBlockTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 4,
  },
  infoBlockText: {
    fontSize: 13,
    color: "#9ca3af",
    lineHeight: 18,
  },
  modalBottom: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#1f2937",
  },
  guideBtn: {
    backgroundColor: "#06b6d4",
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: "center",
  },
  guideBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
  },
});
