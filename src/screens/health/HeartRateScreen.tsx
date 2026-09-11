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

type Props = NativeStackScreenProps<RootStackParamList, "HeartRate">;

const { width: SW } = Dimensions.get("window");

export default function HeartRateScreen({ navigation }: Props) {
  const [activeTab, setActiveTab] = useState<"Hours" | "Days" | "Weeks" | "Months">("Hours");
  const [showTrackModal, setShowTrackModal] = useState(false);
  const [selectedPeriodOffset, setSelectedPeriodOffset] = useState(0);

  // Anatomical Heart SVG Graphic
  const renderHeartIllustration = () => (
    <Svg width={110} height={110} viewBox="0 0 100 100">
      <Defs>
        <SvgLinearGradient id="heartGrad" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#ff4b6e" />
          <Stop offset="50%" stopColor="#f43f5e" />
          <Stop offset="100%" stopColor="#9333ea" />
        </SvgLinearGradient>
        <SvgLinearGradient id="aortaGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#38bdf8" />
          <Stop offset="100%" stopColor="#2563eb" />
        </SvgLinearGradient>
      </Defs>
      {/* Vena Cava & Pulmonary Artery */}
      <Path
        d="M38 18 C38 10, 48 10, 48 20 L48 28 L38 28 Z"
        fill="url(#aortaGrad)"
        opacity={0.9}
      />
      {/* Aorta Arch */}
      <Path
        d="M45 16 C45 6, 62 6, 62 20 L62 30 L50 30 Z"
        fill="#ff5c7c"
      />
      {/* Three branching arteries */}
      <Rect x="49" y="8" width="3" height="7" rx="1.5" fill="#ffa4b6" />
      <Rect x="54" y="9" width="3" height="6" rx="1.5" fill="#ffa4b6" />
      <Rect x="59" y="11" width="3" height="5" rx="1.5" fill="#ffa4b6" />
      {/* Main Cardiac Muscle */}
      <Path
        d="M50 30 C30 22, 18 36, 22 54 C26 72, 42 86, 50 94 C58 86, 74 72, 78 54 C82 36, 70 22, 50 30 Z"
        fill="url(#heartGrad)"
      />
      {/* Coronary blood vessel lines */}
      <Path
        d="M48 36 Q44 50 48 64 Q52 74 50 88"
        stroke="#fda4af"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        opacity={0.8}
      />
      <Path
        d="M45 50 Q36 56 32 64"
        stroke="#38bdf8"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
        opacity={0.9}
      />
      <Path
        d="M48 60 Q56 66 64 70"
        stroke="#fda4af"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
        opacity={0.8}
      />
      {/* Subtle pulse glow ring */}
      <Circle cx="50" cy="54" r="38" stroke="rgba(244,63,94,0.2)" strokeWidth="1.5" fill="none" />
    </Svg>
  );

  // Interactive Chart Renderer with 200, 150, 100, 50 gridlines
  const renderChart = () => {
    const chartHeight = 180;
    const chartWidth = SW - 64;
    const yLines = [
      { val: 200, y: 15 },
      { val: 150, y: 55 },
      { val: 100, y: 95 },
      { val: 50, y: 135 },
    ];

    return (
      <View style={s.chartCard}>
        <View style={s.chartHeaderRow}>
          <Text style={s.chartRangeText}>Range: 58 - 116 bpm</Text>
          <Pressable
            onPress={() => Alert.alert("Zoom", "Heart rate chart zoom & detail mode")}
            style={s.zoomBtn}
          >
            <Ionicons name="search" size={16} color="#9ca3af" />
          </Pressable>
        </View>

        <Svg width={chartWidth} height={chartHeight}>
          {/* Y Gridlines and labels */}
          {yLines.map((line) => (
            <G key={line.val}>
              <Text
                style={{
                  position: "absolute",
                  left: 0,
                  top: line.y - 8,
                  fontSize: 11,
                  color: "#6b7280",
                }}
              >
                {line.val}
              </Text>
              <Line
                x1={34}
                y1={line.y}
                x2={chartWidth}
                y2={line.y}
                stroke="#1f2937"
                strokeWidth={1}
                strokeDasharray="4 4"
              />
            </G>
          ))}

          {/* Sample Heart Rate Range bars / curve */}
          {/* Shaded baseline band for healthy resting zone (60 - 100 bpm) */}
          <Rect
            x={34}
            y={95}
            width={chartWidth - 34}
            height={40}
            fill="rgba(244,63,94,0.06)"
          />

          {/* Data points and connectors */}
          <Path
            d={`M 50 125 C 80 115, 110 130, 140 105 C 170 85, 200 95, 230 80 C 260 90, 290 100, 320 85`}
            stroke="#f43f5e"
            strokeWidth={2.5}
            fill="none"
          />

          {/* Hourly vertical bars */}
          {[
            { x: 50, y1: 118, y2: 132 },
            { x: 90, y1: 108, y2: 128 },
            { x: 130, y1: 98, y2: 116 },
            { x: 170, y1: 82, y2: 106 },
            { x: 210, y1: 75, y2: 100 },
            { x: 250, y1: 70, y2: 95 },
            { x: 290, y1: 80, y2: 105 },
            { x: 320, y1: 78, y2: 94 },
          ].map((bar, idx) => (
            <G key={idx}>
              <Line
                x1={bar.x}
                y1={bar.y1}
                x2={bar.x}
                y2={bar.y2}
                stroke="#fb7185"
                strokeWidth={5}
                strokeLinecap="round"
                opacity={0.7}
              />
              <Circle cx={bar.x} cy={(bar.y1 + bar.y2) / 2} r={2.5} fill="#ffffff" />
            </G>
          ))}

          {/* Y-axis text labels rendered in SVG */}
          {yLines.map((line) => (
            <Line
              key={`dot-${line.val}`}
              x1={30}
              y1={line.y}
              x2={34}
              y2={line.y}
              stroke="#4b5563"
              strokeWidth={1.5}
            />
          ))}
        </Svg>

        {/* X-axis labels */}
        <View style={s.xAxisRow}>
          <Text style={s.xLabel}>12 AM</Text>
          <Text style={s.xLabel}>6 AM</Text>
          <Text style={s.xLabel}>12 PM</Text>
          <Text style={s.xLabel}>6 PM</Text>
          <Text style={s.xLabel}>Now</Text>
        </View>
      </View>
    );
  };

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
        <Text style={s.headerTitle}>Heart rate</Text>
        <View style={s.headerRight}>
          <Pressable
            onPress={() => Alert.alert("History", "Viewing detailed heart rate history")}
            style={s.headerIconBtn}
            accessibilityLabel="Trends"
          >
            <View style={s.barChartIcon}>
              <View style={[s.barChartCol, { height: 10 }]} />
              <View style={[s.barChartCol, { height: 18 }]} />
              <View style={[s.barChartCol, { height: 14 }]} />
            </View>
          </Pressable>
          <Pressable
            onPress={() => Alert.alert("Options", "Heart rate settings")}
            style={s.headerIconBtn}
            accessibilityLabel="Options"
          >
            <Ionicons name="ellipsis-vertical" size={20} color="#ffffff" />
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Segmented Period Tabs: [Hours] [Days] [Weeks] [Months] */}
        <View style={s.periodTabsWrap}>
          {(["Hours", "Days", "Weeks", "Months"] as const).map((tab) => (
            <Pressable
              key={tab}
              style={[s.periodTab, activeTab === tab && s.periodTabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                style={[s.periodTabText, activeTab === tab && s.periodTabTextActive]}
              >
                {tab}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Date Selector < Today > */}
        <View style={s.dateNavRow}>
          <Pressable
            onPress={() => setSelectedPeriodOffset((prev) => prev - 1)}
            style={s.dateArrowBtn}
          >
            <Ionicons name="chevron-back" size={18} color="#9ca3af" />
          </Pressable>
          <View style={s.datePill}>
            <Text style={s.datePillText}>
              {selectedPeriodOffset === 0
                ? "Today"
                : selectedPeriodOffset === -1
                ? "Yesterday"
                : `${Math.abs(selectedPeriodOffset)} periods ago`}
            </Text>
          </View>
          <Pressable
            onPress={() => setSelectedPeriodOffset((prev) => Math.min(0, prev + 1))}
            style={[s.dateArrowBtn, selectedPeriodOffset === 0 && s.dateArrowDisabled]}
            disabled={selectedPeriodOffset === 0}
          >
            <Ionicons
              name="chevron-forward"
              size={18}
              color={selectedPeriodOffset === 0 ? "#374151" : "#9ca3af"}
            />
          </Pressable>
        </View>

        {/* Big Heart Rate Stat with Anatomical Heart Artwork */}
        <Animated.View entering={FadeInDown.duration(400)} style={s.statHeroCard}>
          <View style={s.statHeroLeft}>
            <View style={s.bpmRow}>
              <Text style={s.heroValue}>72</Text>
              <Text style={s.heroUnit}>bpm</Text>
            </View>
            <Text style={s.heroSub}>Latest measurement</Text>
            <View style={s.restingPill}>
              <Ionicons name="heart" size={14} color="#f43f5e" />
              <Text style={s.restingPillText}>Resting: 64 bpm</Text>
            </View>
          </View>
          <View style={s.statHeroRight}>{renderHeartIllustration()}</View>
        </Animated.View>

        {/* SVG Chart with 200, 150, 100, 50 */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          {renderChart()}
        </Animated.View>

        {/* Resting Heart Rate Card */}
        <Animated.View entering={FadeInDown.delay(150).duration(400)} style={s.card}>
          <View style={s.cardHeaderRow}>
            <Text style={s.cardTitle}>Resting heart rate</Text>
            <Ionicons name="information-circle-outline" size={18} color="#6b7280" />
          </View>
          <Text style={s.restingBigVal}>64 bpm</Text>
          <Text style={s.restingDesc}>
            Your resting heart rate is the number of times your heart beats per minute while you are at rest and calm.
          </Text>
        </Animated.View>

        {/* Track Your Heart Rate Info Card */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <Pressable
            style={s.card}
            onPress={() => setShowTrackModal(true)}
          >
            <View style={s.trackCardRow}>
              <View style={s.trackCardIconWrap}>
                <Ionicons name="watch-outline" size={24} color="#f43f5e" />
              </View>
              <View style={s.trackCardContent}>
                <Text style={s.trackCardTitle}>Track your heart rate</Text>
                <Text style={s.trackCardSubtitle}>
                  Measure frequently to monitor resting heart rate trends, workout recovery, and general cardiovascular fitness.
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#6b7280" />
            </View>
          </Pressable>
        </Animated.View>

        {/* Other Data From This Period */}
        <Animated.View entering={FadeInDown.delay(250).duration(400)} style={s.sectionWrap}>
          <Text style={s.sectionHeader}>Other data from this period</Text>

          {/* Stress card */}
          <Pressable
            style={s.relatedCard}
            onPress={() => navigation.navigate("Stress" as any)}
          >
            <View style={s.relatedLeft}>
              <View style={[s.relatedIconWrap, { backgroundColor: "rgba(59,130,246,0.15)" }]}>
                <Ionicons name="pulse" size={20} color="#3b82f6" />
              </View>
              <View>
                <Text style={s.relatedTitle}>Stress</Text>
                <Text style={s.relatedSubtitle}>Low to Moderate</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#6b7280" />
          </Pressable>

          {/* Sleep card */}
          <Pressable
            style={s.relatedCard}
            onPress={() => navigation.navigate("SleepDashboard" as any)}
          >
            <View style={s.relatedLeft}>
              <View style={[s.relatedIconWrap, { backgroundColor: "rgba(168,85,247,0.15)" }]}>
                <Ionicons name="moon" size={20} color="#a855f7" />
              </View>
              <View>
                <Text style={s.relatedTitle}>Sleep</Text>
                <Text style={s.relatedSubtitle}>7 hrs 42 mins</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#6b7280" />
          </Pressable>

          {/* Energy Score card */}
          <Pressable
            style={s.relatedCard}
            onPress={() => navigation.navigate("EnergyScore" as any)}
          >
            <View style={s.relatedLeft}>
              <View style={[s.relatedIconWrap, { backgroundColor: "rgba(34,197,94,0.15)" }]}>
                <Ionicons name="battery-charging" size={20} color="#22c55e" />
              </View>
              <View>
                <Text style={s.relatedTitle}>Energy score</Text>
                <Text style={s.relatedSubtitle}>84 · Excellent</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#6b7280" />
          </Pressable>
        </Animated.View>
      </ScrollView>

      {/* Track Your Heart Rate Modal (Samsung Health exact reference) */}
      <Modal
        visible={showTrackModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowTrackModal(false)}
      >
        <View style={s.modalRoot}>
          <View style={s.modalHeader}>
            <Pressable
              onPress={() => setShowTrackModal(false)}
              style={s.modalBackBtn}
            >
              <Ionicons name="chevron-back" size={24} color="#ffffff" />
            </Pressable>
            <Text style={s.modalTitle}>Track your heart rate</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView contentContainerStyle={s.modalContent}>
            {/* Wristwatch Graphic */}
            <View style={s.modalGraphicWrap}>
              <Svg width={180} height={140} viewBox="0 0 160 120">
                <Defs>
                  <SvgLinearGradient id="strapGrad" x1="0" y1="0" x2="1" y2="1">
                    <Stop offset="0%" stopColor="#374151" />
                    <Stop offset="100%" stopColor="#111827" />
                  </SvgLinearGradient>
                  <SvgLinearGradient id="glowG" x1="0" y1="0" x2="1" y2="1">
                    <Stop offset="0%" stopColor="#f43f5e" />
                    <Stop offset="100%" stopColor="#e11d48" />
                  </SvgLinearGradient>
                </Defs>
                {/* Watch Strap */}
                <Rect x="55" y="10" width="50" height="100" rx="10" fill="url(#strapGrad)" />
                {/* Watch Body */}
                <Circle cx="80" cy="60" r="42" fill="#1f2937" stroke="#4b5563" strokeWidth="3" />
                <Circle cx="80" cy="60" r="34" fill="#030712" />
                {/* Heart Rate on Display */}
                <Path
                  d="M70 60 Q75 52 80 60 Q85 68 90 60"
                  stroke="url(#glowG)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  fill="none"
                />
                <Circle cx="80" cy="60" r="3" fill="#f43f5e" />
                {/* Pulsing rings */}
                <Circle cx="80" cy="60" r="52" stroke="rgba(244,63,94,0.25)" strokeWidth="2" fill="none" />
                <Circle cx="80" cy="60" r="62" stroke="rgba(244,63,94,0.1)" strokeWidth="1" fill="none" />
              </Svg>
            </View>

            <View style={s.modalCard}>
              <View style={s.modalStepRow}>
                <View style={s.modalStepDot} />
                <Text style={s.modalStepText}>
                  Wear your Galaxy Watch or smart band securely on your wrist, positioned just above the wrist bone.
                </Text>
              </View>

              <View style={s.modalStepRow}>
                <View style={s.modalStepDot} />
                <Text style={s.modalStepText}>
                  Stay seated comfortably and remain still while taking continuous or spot heart rate measurements.
                </Text>
              </View>

              <View style={s.modalStepRow}>
                <View style={s.modalStepDot} />
                <Text style={s.modalStepText}>
                  Cold skin, loose fitting, vigorous motion, or excessive tattoo pigment under the sensor may reduce measurement accuracy.
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Bottom Done Button */}
          <View style={s.modalBottom}>
            <Pressable
              style={s.doneBtn}
              onPress={() => setShowTrackModal(false)}
            >
              <Text style={s.doneBtnText}>Done</Text>
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
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerIconBtn: {
    padding: 6,
    borderRadius: 20,
  },
  barChartIcon: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 2.5,
    paddingHorizontal: 4,
    height: 20,
    justifyContent: "center",
  },
  barChartCol: {
    width: 3.5,
    backgroundColor: "#ffffff",
    borderRadius: 1.5,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  periodTabsWrap: {
    flexDirection: "row",
    backgroundColor: "#18181b",
    borderRadius: 24,
    padding: 4,
    marginVertical: 12,
  },
  periodTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 20,
  },
  periodTabActive: {
    backgroundColor: "#27272a",
  },
  periodTabText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#9ca3af",
  },
  periodTabTextActive: {
    color: "#ffffff",
    fontWeight: "700",
  },
  dateNavRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    marginBottom: 16,
  },
  dateArrowBtn: {
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
  statHeroCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#18181b",
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  statHeroLeft: {
    flex: 1,
  },
  bpmRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
  },
  heroValue: {
    fontSize: 44,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: -1,
  },
  heroUnit: {
    fontSize: 18,
    fontWeight: "600",
    color: "#f43f5e",
  },
  heroSub: {
    fontSize: 13,
    color: "#9ca3af",
    marginTop: 2,
    marginBottom: 10,
  },
  restingPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(244,63,94,0.12)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  restingPillText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fda4af",
  },
  statHeroRight: {
    alignItems: "center",
    justifyContent: "center",
  },
  chartCard: {
    backgroundColor: "#18181b",
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  chartHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  chartRangeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#e5e7eb",
  },
  zoomBtn: {
    padding: 6,
    borderRadius: 14,
    backgroundColor: "#27272a",
  },
  xAxisRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    paddingHorizontal: 30,
  },
  xLabel: {
    fontSize: 11,
    color: "#6b7280",
  },
  card: {
    backgroundColor: "#18181b",
    borderRadius: 24,
    padding: 18,
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
  },
  restingBigVal: {
    fontSize: 28,
    fontWeight: "800",
    color: "#f43f5e",
    marginBottom: 6,
  },
  restingDesc: {
    fontSize: 13,
    color: "#9ca3af",
    lineHeight: 18,
  },
  trackCardRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  trackCardIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(244,63,94,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  trackCardContent: {
    flex: 1,
  },
  trackCardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 3,
  },
  trackCardSubtitle: {
    fontSize: 12,
    color: "#9ca3af",
    lineHeight: 17,
  },
  sectionWrap: {
    marginTop: 4,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 12,
  },
  relatedCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#18181b",
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  relatedLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  relatedIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  relatedTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#ffffff",
  },
  relatedSubtitle: {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 2,
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
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ffffff",
  },
  modalContent: {
    padding: 20,
    alignItems: "center",
  },
  modalGraphicWrap: {
    marginVertical: 24,
    alignItems: "center",
  },
  modalCard: {
    backgroundColor: "#18181b",
    borderRadius: 20,
    padding: 20,
    width: "100%",
    gap: 18,
  },
  modalStepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  modalStepDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#f43f5e",
    marginTop: 7,
  },
  modalStepText: {
    flex: 1,
    fontSize: 14,
    color: "#d1d5db",
    lineHeight: 20,
  },
  modalBottom: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#1f2937",
  },
  doneBtn: {
    backgroundColor: "#f43f5e",
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: "center",
  },
  doneBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
  },
});
