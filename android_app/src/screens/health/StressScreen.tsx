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
} from "react-native";
import Svg, { Circle, Path, Rect, Line, G } from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import Animated, { FadeInDown } from "react-native-reanimated";
import { RootStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "Stress">;

const { width: SW } = Dimensions.get("window");

export default function StressScreen({ navigation }: Props) {
  const [selectedDayOffset, setSelectedDayOffset] = useState(0);

  const dayLabel =
    selectedDayOffset === 0
      ? "Today"
      : selectedDayOffset === -1
      ? "Yesterday"
      : `${Math.abs(selectedDayOffset)} days ago`;

  // 4-segment stress gauge (Screenshots 11 & 12)
  const renderStressGauge = () => {
    const totalWidth = SW - 64;
    const gap = 6;
    const segWidth = (totalWidth - gap * 3) / 4;
    const colors = ["#0091ff", "#22c55e", "#facc15", "#f97316"];

    return (
      <View style={s.gaugeWrap}>
        <View style={s.gaugeRow}>
          {colors.map((c, i) => (
            <View
              key={i}
              style={[
                s.gaugeSeg,
                { width: segWidth, backgroundColor: c, opacity: i === 0 ? 1 : 0.4 },
              ]}
            />
          ))}
        </View>
        <View style={s.gaugeLabelsRow}>
          <Text style={s.gaugeLabel}>Relaxed</Text>
          <Text style={s.gaugeLabel}>High</Text>
        </View>
      </View>
    );
  };

  // Smartwatch graphic for "Track your stress"
  const renderWatchGraphic = () => (
    <Svg width={70} height={70} viewBox="0 0 80 80">
      {/* Strap */}
      <Rect x="26" y="2" width="28" height="76" rx="8" fill="#334155" />
      {/* Watch bezel */}
      <Circle cx="40" cy="40" r="30" fill="#1e293b" stroke="#475569" strokeWidth="2.5" />
      <Circle cx="40" cy="40" r="23" fill="#020617" />
      {/* Stress circular arc */}
      <Circle cx="40" cy="40" r="17" stroke="#22c55e" strokeWidth="4" fill="none" />
      <Circle cx="40" cy="40" r="17" stroke="#0091ff" strokeWidth="4" strokeDasharray="30 80" fill="none" />
      {/* Sitting person icon in center */}
      <Circle cx="40" cy="35" r="2.5" fill="#38bdf8" />
      <Path d="M35 44 C35 40, 45 40, 45 44 Z" fill="#38bdf8" />
    </Svg>
  );

  // Dandelion graphic for "Mindfulness" card
  const renderDandelionGraphic = () => (
    <Svg width={70} height={70} viewBox="0 0 70 70">
      <Rect width="70" height="70" rx="16" fill="#38bdf8" />
      <Circle cx="35" cy="35" r="7" fill="#facc15" />
      <Line x1="35" y1="42" x2="33" y2="64" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" />
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
        <Line
          key={deg}
          x1={35 + 7 * Math.cos((deg * Math.PI) / 180)}
          y1={35 + 7 * Math.sin((deg * Math.PI) / 180)}
          x2={35 + 17 * Math.cos((deg * Math.PI) / 180)}
          y2={35 + 17 * Math.sin((deg * Math.PI) / 180)}
          stroke="#ffffff"
          strokeWidth="1.5"
          opacity={0.85}
        />
      ))}
      <Circle cx="52" cy="22" r="2.5" fill="#ffffff" opacity={0.8} />
      <Circle cx="56" cy="32" r="2" fill="#ffffff" opacity={0.7} />
    </Svg>
  );

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      {/* Header (Screenshot 12) */}
      <View style={s.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={s.headerBtn}
          accessibilityLabel="Back"
        >
          <Ionicons name="chevron-back" size={26} color="#ffffff" />
        </Pressable>
        <Text style={s.headerTitle}>Stress</Text>
        <View style={s.headerRight}>
          <Pressable
            onPress={() => Alert.alert("Trends", "Stress analytics & trends")}
            style={s.headerIconBtn}
          >
            <View style={s.barChartIcon}>
              <View style={[s.barChartCol, { height: 10 }]} />
              <View style={[s.barChartCol, { height: 18 }]} />
              <View style={[s.barChartCol, { height: 14 }]} />
            </View>
          </Pressable>
          <Pressable
            onPress={() => Alert.alert("Options", "Stress settings")}
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

        {/* Hero Card with 4-Segment Gauge (Screenshot 11 & 12) */}
        <Animated.View entering={FadeInDown.duration(400)} style={s.card}>
          <View style={s.cardHeaderRow}>
            <Text style={s.heroScoreText}>--</Text>
            <Pressable
              onPress={() =>
                Alert.alert(
                  "Stress Measurement",
                  "Stress is estimated by heart rate variability (HRV) measured continuously via PPG sensors."
                )
              }
            >
              <Ionicons name="information-circle-outline" size={22} color="#9ca3af" />
            </Pressable>
          </View>

          {renderStressGauge()}

          <Text style={s.cardDesc}>
            Keep track of stress to see your ups and downs and find ways to stay balanced.
          </Text>
        </Animated.View>

        {/* Stress Over Last 7 Days Card (Screenshot 11 & 12) */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={s.card}>
          <View style={s.cardTitleRow}>
            <Text style={s.cardTitle}>Stress over last 7 days</Text>
            <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
          </View>

          <View style={s.chartArea}>
            {/* Y-axis level labels */}
            <View style={s.chartYCol}>
              <Text style={[s.yLabel, { color: "#f97316" }]}>High</Text>
              <Text style={[s.yLabel, { color: "#facc15" }]}>Moderate</Text>
              <Text style={[s.yLabel, { color: "#22c55e" }]}>Low</Text>
              <Text style={[s.yLabel, { color: "#38bdf8" }]}>Relaxed</Text>
            </View>

            {/* Weekly Timeline Dates */}
            <View style={s.datesRow}>
              {["5", "6", "7", "8", "9", "10", "11"].map((d) => (
                <Text key={d} style={s.dateNumText}>
                  {d}
                </Text>
              ))}
            </View>
          </View>
        </Animated.View>

        {/* Track Your Stress Card (Screenshot 11) */}
        <Animated.View entering={FadeInDown.delay(150).duration(400)}>
          <Pressable
            style={s.featureCard}
            onPress={() =>
              Alert.alert(
                "Track Your Stress",
                "Wear your Galaxy Watch throughout the day to automatically assess stress levels and receive calming prompts when tension rises."
              )
            }
          >
            <View style={s.featureLeft}>
              <Text style={s.featureTitle}>Track your stress</Text>
              <Text style={s.featureSub}>
                Find watches you can use to track your stress level on Samsung.com.
              </Text>
            </View>
            <View style={s.featureRight}>
              {renderWatchGraphic()}
            </View>
          </Pressable>
        </Animated.View>

        {/* Mindfulness Card -> Navigates to MindfulnessScreen (Screenshot 11) */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <Pressable
            style={s.featureCard}
            onPress={() => navigation.navigate("Mindfulness" as any)}
          >
            <View style={s.featureLeft}>
              <Text style={s.featureTitle}>Mindfulness</Text>
              <Text style={s.featureSub}>
                Practise habits that can help reduce stress.
              </Text>
            </View>
            <View style={s.featureRight}>
              {renderDandelionGraphic()}
            </View>
          </Pressable>
        </Animated.View>
      </ScrollView>
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
    paddingHorizontal: 20,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#27272a",
  },
  datePillText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
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
  },
  heroScoreText: {
    fontSize: 32,
    fontWeight: "800",
    color: "#ffffff",
    marginBottom: 16,
  },
  gaugeWrap: {
    marginBottom: 16,
  },
  gaugeRow: {
    flexDirection: "row",
    gap: 6,
    height: 14,
  },
  gaugeSeg: {
    height: 14,
    borderRadius: 7,
  },
  gaugeLabelsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  gaugeLabel: {
    fontSize: 12,
    color: "#9ca3af",
  },
  cardDesc: {
    fontSize: 13,
    color: "#9ca3af",
    lineHeight: 18,
  },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
  },
  chartArea: {
    minHeight: 110,
    justifyContent: "space-between",
  },
  chartYCol: {
    alignItems: "flex-end",
    gap: 6,
  },
  yLabel: {
    fontSize: 11,
    fontWeight: "600",
  },
  datesRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)",
    paddingTop: 10,
    marginTop: 14,
  },
  dateNumText: {
    fontSize: 12,
    color: "#9ca3af",
  },
  featureCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#18181b",
    borderRadius: 24,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  featureLeft: {
    flex: 1,
    paddingRight: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 4,
  },
  featureSub: {
    fontSize: 13,
    color: "#9ca3af",
    lineHeight: 18,
  },
  featureRight: {
    alignItems: "center",
    justifyContent: "center",
  },
});
