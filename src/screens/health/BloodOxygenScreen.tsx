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
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import Animated, { FadeInDown } from "react-native-reanimated";
import { RootStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "BloodOxygen">;

const { width: SW } = Dimensions.get("window");

export default function BloodOxygenScreen({ navigation }: Props) {
  const [activeTab, setActiveTab] = useState<"Hours" | "Days" | "Weeks" | "Months">("Hours");
  const [showTrackModal, setShowTrackModal] = useState(false);
  const [selectedPeriodOffset, setSelectedPeriodOffset] = useState(0);

  // Blood Oxygen Cellular Artwork
  const renderBloodIllustration = () => (
    <Svg width={110} height={110} viewBox="0 0 100 100">
      <Defs>
        <SvgLinearGradient id="o2Grad" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#38bdf8" />
          <Stop offset="50%" stopColor="#0284c7" />
          <Stop offset="100%" stopColor="#0369a1" />
        </SvgLinearGradient>
        <SvgLinearGradient id="rbcGrad" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#f43f5e" />
          <Stop offset="100%" stopColor="#be123c" />
        </SvgLinearGradient>
      </Defs>

      {/* Red Blood Cells (Biconcave disks) */}
      <Circle cx="64" cy="40" r="24" fill="url(#rbcGrad)" opacity={0.85} />
      <Circle cx="64" cy="40" r="14" fill="#9f1239" opacity={0.6} />

      <Circle cx="36" cy="62" r="26" fill="url(#rbcGrad)" />
      <Circle cx="36" cy="62" r="15" fill="#881337" opacity={0.7} />

      {/* Oxygen Molecule clusters (O2 spheres in cyan/blue) */}
      <Circle cx="50" cy="48" r="12" fill="url(#o2Grad)" />
      <Circle cx="46" cy="44" r="4" fill="#bae6fd" opacity={0.8} />

      <Circle cx="68" cy="68" r="10" fill="url(#o2Grad)" />
      <Circle cx="65" cy="66" r="3" fill="#bae6fd" opacity={0.8} />

      {/* Small floating bubble particles */}
      <Circle cx="24" cy="30" r="5" fill="#38bdf8" opacity={0.7} />
      <Circle cx="78" cy="26" r="4" fill="#38bdf8" opacity={0.6} />
      <Circle cx="84" cy="54" r="3" fill="#7dd3fc" opacity={0.8} />

      {/* Subtle orbital ring */}
      <Circle cx="50" cy="50" r="44" stroke="rgba(56,189,248,0.25)" strokeWidth="1.5" strokeDasharray="3 4" fill="none" />
    </Svg>
  );

  // SVG Chart with 100 and 90 Gridlines (Matching Screenshot 10)
  const renderChart = () => {
    const chartHeight = 170;
    const chartWidth = SW - 64;
    const yLines = [
      { val: 100, y: 25 },
      { val: 90, y: 110 },
    ];

    return (
      <View style={s.chartCard}>
        <View style={s.chartHeaderRow}>
          <Text style={s.chartRangeText}>Range: 95 - 99 %</Text>
          <Pressable
            onPress={() => Alert.alert("Zoom", "Blood oxygen zoom mode")}
            style={s.zoomBtn}
          >
            <Ionicons name="search" size={16} color="#9ca3af" />
          </Pressable>
        </View>

        <Svg width={chartWidth} height={chartHeight}>
          {/* Normal Optimal Zone (95% to 100%) */}
          <Rect
            x={34}
            y={25}
            width={chartWidth - 34}
            height={50}
            fill="rgba(56,189,248,0.08)"
          />

          {/* Y Gridlines and labels */}
          {yLines.map((line) => (
            <G key={line.val}>
              <Text
                style={{
                  position: "absolute",
                  left: 2,
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

          {/* Normal baseline dotted mark at 95% */}
          <Line
            x1={34}
            y1={70}
            x2={chartWidth}
            y2={70}
            stroke="#0ea5e9"
            strokeWidth={1}
            strokeDasharray="2 3"
            opacity={0.4}
          />

          {/* Blood oxygen continuous line & vertical bars */}
          <Path
            d="M 50 40 C 90 35, 130 50, 170 38 C 210 32, 250 44, 290 36 C 310 35, 330 38, 340 36"
            stroke="#0ea5e9"
            strokeWidth={2.5}
            fill="none"
          />

          {[
            { x: 60, y1: 35, y2: 50 },
            { x: 110, y1: 32, y2: 45 },
            { x: 160, y1: 38, y2: 55 },
            { x: 210, y1: 30, y2: 42 },
            { x: 260, y1: 35, y2: 50 },
            { x: 310, y1: 32, y2: 46 },
          ].map((bar, idx) => (
            <G key={idx}>
              <Line
                x1={bar.x}
                y1={bar.y1}
                x2={bar.x}
                y2={bar.y2}
                stroke="#38bdf8"
                strokeWidth={4}
                strokeLinecap="round"
                opacity={0.7}
              />
              <Circle cx={bar.x} cy={bar.y1} r={2.5} fill="#ffffff" />
            </G>
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
        <Text style={s.headerTitle}>Blood oxygen</Text>
        <View style={s.headerRight}>
          <Pressable
            onPress={() => Alert.alert("Trends", "Detailed SpO2 trends")}
            style={s.headerIconBtn}
          >
            <View style={s.barChartIcon}>
              <View style={[s.barChartCol, { height: 10 }]} />
              <View style={[s.barChartCol, { height: 18 }]} />
              <View style={[s.barChartCol, { height: 14 }]} />
            </View>
          </Pressable>
          <Pressable
            onPress={() => Alert.alert("Options", "Blood oxygen settings")}
            style={s.headerIconBtn}
          >
            <Ionicons name="ellipsis-vertical" size={20} color="#ffffff" />
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Period Tabs: Hours, Days, Weeks, Months */}
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

        {/* Date Navigator */}
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

        {/* Big Hero Card */}
        <Animated.View entering={FadeInDown.duration(400)} style={s.statHeroCard}>
          <View style={s.statHeroLeft}>
            <View style={s.o2Row}>
              <Text style={s.heroValue}>98</Text>
              <Text style={s.heroUnit}>%</Text>
            </View>
            <Text style={s.heroSub}>Optimal saturation</Text>
            <View style={s.statusPill}>
              <Ionicons name="checkmark-circle" size={14} color="#38bdf8" />
              <Text style={s.statusPillText}>Normal (95% - 100%)</Text>
            </View>
          </View>
          <View style={s.statHeroRight}>{renderBloodIllustration()}</View>
        </Animated.View>

        {/* SVG Chart with 100 & 90 Gridlines */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          {renderChart()}
        </Animated.View>

        {/* Sleep & Day Metrics Card */}
        <Animated.View entering={FadeInDown.delay(150).duration(400)} style={s.card}>
          <Text style={s.cardTitle}>Daily breakdown</Text>
          <View style={s.breakdownRow}>
            <View style={s.breakdownItem}>
              <Text style={s.breakdownVal}>94 %</Text>
              <Text style={s.breakdownLabel}>Lowest during sleep</Text>
            </View>
            <View style={s.divider} />
            <View style={s.breakdownItem}>
              <Text style={s.breakdownVal}>98 %</Text>
              <Text style={s.breakdownLabel}>Daily average</Text>
            </View>
          </View>
        </Animated.View>

        {/* Track Your Blood Oxygen Card -> Modal (Screenshot 3) */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <Pressable
            style={s.card}
            onPress={() => setShowTrackModal(true)}
          >
            <View style={s.trackCardRow}>
              <View style={s.trackCardIconWrap}>
                <Ionicons name="water-outline" size={24} color="#38bdf8" />
              </View>
              <View style={s.trackCardContent}>
                <Text style={s.trackCardTitle}>Track your blood oxygen</Text>
                <Text style={s.trackCardSubtitle}>
                  Learn how optical sensors on your watch measure oxygen saturation in your bloodstream during sleep and rest.
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#6b7280" />
            </View>
          </Pressable>
        </Animated.View>

        {/* Other Data From This Period */}
        <Animated.View entering={FadeInDown.delay(250).duration(400)} style={s.sectionWrap}>
          <Text style={s.sectionHeader}>Other data from this period</Text>

          {/* Sleep */}
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
                <Text style={s.relatedSubtitle}>7 hrs 42 mins · Stage tracking</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#6b7280" />
          </Pressable>

          {/* Snoring */}
          <Pressable
            style={s.relatedCard}
            onPress={() => Alert.alert("Snoring", "No snoring detected overnight")}
          >
            <View style={s.relatedLeft}>
              <View style={[s.relatedIconWrap, { backgroundColor: "rgba(234,179,8,0.15)" }]}>
                <Ionicons name="volume-medium" size={20} color="#eab308" />
              </View>
              <View>
                <Text style={s.relatedTitle}>Snoring</Text>
                <Text style={s.relatedSubtitle}>0 mins recorded</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#6b7280" />
          </Pressable>

          {/* Heart Rate */}
          <Pressable
            style={s.relatedCard}
            onPress={() => navigation.navigate("HeartRate" as any)}
          >
            <View style={s.relatedLeft}>
              <View style={[s.relatedIconWrap, { backgroundColor: "rgba(244,63,94,0.15)" }]}>
                <Ionicons name="heart" size={20} color="#f43f5e" />
              </View>
              <View>
                <Text style={s.relatedTitle}>Heart rate</Text>
                <Text style={s.relatedSubtitle}>72 bpm</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#6b7280" />
          </Pressable>
        </Animated.View>
      </ScrollView>

      {/* Track Blood Oxygen Modal (Screenshot 3 Reference) */}
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
            <Text style={s.modalTitle}>Track your blood oxygen</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView contentContainerStyle={s.modalContent}>
            {/* SpO2 Sensor Graphic */}
            <View style={s.modalGraphicWrap}>
              <Svg width={180} height={140} viewBox="0 0 160 120">
                <Defs>
                  <SvgLinearGradient id="sensorGrad" x1="0" y1="0" x2="1" y2="1">
                    <Stop offset="0%" stopColor="#0284c7" />
                    <Stop offset="100%" stopColor="#0f172a" />
                  </SvgLinearGradient>
                </Defs>
                {/* Arm / Wrist Outline */}
                <Path
                  d="M20 75 Q80 70 140 75 L140 100 L20 100 Z"
                  fill="#334155"
                  opacity={0.4}
                />
                {/* Smartwatch base */}
                <Rect x="50" y="30" width="60" height="35" rx="8" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
                {/* Optical sensor light beam */}
                <Path
                  d="M70 65 L65 85 L95 85 L90 65 Z"
                  fill="rgba(56,189,248,0.3)"
                />
                <Circle cx="80" cy="65" r="4" fill="#38bdf8" />
                <Circle cx="80" cy="85" r="6" fill="#f43f5e" />
                <Circle cx="80" cy="85" r="14" stroke="rgba(244,63,94,0.4)" strokeWidth="1.5" fill="none" />
              </Svg>
            </View>

            <View style={s.modalCard}>
              <View style={s.modalStepRow}>
                <View style={s.modalStepDot} />
                <Text style={s.modalStepText}>
                  Ensure your watch sits comfortably above your wrist bone with a snug fit during sleep or manual check.
                </Text>
              </View>

              <View style={s.modalStepRow}>
                <View style={s.modalStepDot} />
                <Text style={s.modalStepText}>
                  Rest your forearm flat on a table or mattress and refrain from moving or talking during the reading.
                </Text>
              </View>

              <View style={s.modalStepRow}>
                <View style={s.modalStepDot} />
                <Text style={s.modalStepText}>
                  Normal oxygen saturation levels typically range between 95% and 100%. Low ambient temperature or low blood circulation may impact readings.
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
  o2Row: {
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
    fontSize: 22,
    fontWeight: "700",
    color: "#38bdf8",
  },
  heroSub: {
    fontSize: 13,
    color: "#9ca3af",
    marginTop: 2,
    marginBottom: 10,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(56,189,248,0.12)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#7dd3fc",
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
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 14,
  },
  breakdownRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  breakdownItem: {
    flex: 1,
    alignItems: "center",
  },
  divider: {
    width: 1,
    height: 36,
    backgroundColor: "#27272a",
  },
  breakdownVal: {
    fontSize: 22,
    fontWeight: "700",
    color: "#38bdf8",
    marginBottom: 4,
  },
  breakdownLabel: {
    fontSize: 12,
    color: "#9ca3af",
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
    backgroundColor: "rgba(56,189,248,0.12)",
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
    backgroundColor: "#38bdf8",
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
    backgroundColor: "#0284c7",
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
