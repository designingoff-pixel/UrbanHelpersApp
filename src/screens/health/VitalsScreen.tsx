import React, { useState } from "react";
import {
  ScrollView,
  Text,
  View,
  Pressable,
  StyleSheet,
  Dimensions,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import Animated, {
  FadeInDown,
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { RootStackParamList } from "@/navigation/types";
import SamsungBottomNav from "@/components/SamsungBottomNav";

// Temporary type until VitalsScreen is fully typed in RootStackParamList
type Props = any;

const { width: SW } = Dimensions.get("window");

// ─── Top Category Chips ──────────────────────────────────────────────────────
const CATEGORIES = ["Activity", "Sleep", "Vitals", "Food", "Together"];

// ─── Vital metrics ────────────────────────────────────────────────────────────
const VITALS = [
  {
    id: "hr",
    title: "Heart Rate",
    value: "72",
    unit: "bpm",
    range: "60–100",
    status: "Normal",
    statusOk: true,
    icon: "heart" as const,
    color: "#ef4444",
    gradColors: ["#3b0000", "#7f1d1d", "#991b1b"] as string[],
    history: [68, 72, 75, 70, 72, 74, 72],
    desc: "Your resting heart rate is within healthy range.",
  },
  {
    id: "hrv",
    title: "HRV",
    value: "45",
    unit: "ms",
    range: "40–80",
    status: "Good",
    statusOk: true,
    icon: "pulse" as const,
    color: "#a855f7",
    gradColors: ["#1e0040", "#4a1c80", "#5b21b6"] as string[],
    history: [40, 44, 48, 43, 46, 45, 45],
    desc: "Heart rate variability indicates good recovery.",
  },
  {
    id: "spo2",
    title: "Blood Oxygen",
    value: "98",
    unit: "%",
    range: "95–100",
    status: "Normal",
    statusOk: true,
    icon: "water" as const,
    color: "#0ea5e9",
    gradColors: ["#062030", "#0c4a6e", "#0369a1"] as string[],
    history: [97, 98, 99, 98, 97, 98, 98],
    desc: "SpO₂ levels are excellent. Keep it up.",
  },
  {
    id: "resp",
    title: "Respiratory Rate",
    value: "14",
    unit: "rpm",
    range: "12–20",
    status: "Normal",
    statusOk: true,
    icon: "aperture" as const,
    color: "#10b981",
    gradColors: ["#012416", "#064e3b", "#065f46"] as string[],
    history: [13, 14, 15, 14, 14, 13, 14],
    desc: "Breathing rate is steady and relaxed.",
  },
  {
    id: "stress",
    title: "Stress",
    value: "28",
    unit: "",
    range: "< 40 = Low",
    status: "Low",
    statusOk: true,
    icon: "body" as const,
    color: "#f59e0b",
    gradColors: ["#2c1500", "#78350f", "#92400e"] as string[],
    history: [35, 42, 30, 28, 32, 25, 28],
    desc: "Stress levels are manageable. Great job staying calm.",
  },
  {
    id: "skin",
    title: "Skin Temperature",
    value: "36.4",
    unit: "°C",
    range: "35.5–37.5",
    status: "Normal",
    statusOk: true,
    icon: "thermometer" as const,
    color: "#f97316",
    gradColors: ["#1c0a00", "#7c2d12", "#9a3412"] as string[],
    history: [36.2, 36.4, 36.5, 36.3, 36.4, 36.5, 36.4],
    desc: "Skin temperature is within healthy range.",
  },
];

// ─── Animated press card ───────────────────────────────────────────────────────
function PressCard({ onPress, style, children, index = 0 }: {
  onPress: () => void; style?: any; children: React.ReactNode; index?: number;
}) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Animated.View
      entering={FadeInDown.delay(index * 60).duration(350).springify().damping(18)}
      style={[style, animStyle]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={() => { scale.value = withSpring(0.97, { damping: 15, stiffness: 350 }); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 12, stiffness: 280 }); }}
        android_ripple={null}
        style={{ flex: 1 }}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

// ─── Mini sparkline bar chart ─────────────────────────────────────────────────
function MiniBarChart({ data, color }: { data: number[]; color: string }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  return (
    <View style={mc.wrap}>
      {data.map((v, i) => (
        <View key={i} style={mc.barTrack}>
          <View style={[mc.bar, {
            height: `${Math.max(15, ((v - min) / range) * 100)}%` as any,
            backgroundColor: i === data.length - 1 ? color : `${color}55`,
          }]} />
        </View>
      ))}
    </View>
  );
}
const mc = StyleSheet.create({
  wrap: { flexDirection: "row", alignItems: "flex-end", height: 36, gap: 3, flex: 1 },
  barTrack: { flex: 1, height: "100%", justifyContent: "flex-end" },
  bar: { borderRadius: 3 },
});

export default function VitalsScreen({ navigation }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const navigateCategory = (cat: string) => {
    if (cat === "Activity") navigation.navigate("FitnessDashboard");
    else if (cat === "Sleep") navigation.navigate("SleepDashboard");
    else if (cat === "Vitals") { /* already here */ }
    else if (cat === "Food") navigation.navigate("NutritionDashboard");
    else if (cat === "Together") navigation.navigate("FamilyDashboard");
  };

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* ── Top ambient glow ── */}
      <LinearGradient
        colors={["rgba(6,80,100,0.40)", "rgba(2,40,60,0.20)", "transparent"]}
        style={s.topGlow}
        pointerEvents="none"
      />

      {/* ── Header ── */}
      <Animated.View entering={FadeIn.duration(400)} style={s.header}>
        <Pressable onPress={() => navigation.goBack()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={22} color="rgba(255,255,255,0.85)" />
        </Pressable>
        <Text style={s.pageTitle}>Vitals</Text>
        <Pressable onPress={() => navigation.navigate("Profile")} style={s.avatarBtn}>
          <LinearGradient colors={["#0ea5e9", "#0369a1"]} style={s.avatarInner}>
            <Ionicons name="person" size={14} color="white" />
          </LinearGradient>
        </Pressable>
      </Animated.View>

      {/* ── Category Chips ── */}
      <Animated.View entering={FadeIn.delay(80).duration(380)} style={s.chipsWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chipsContent}>
          {CATEGORIES.map((cat) => {
            const active = cat === "Vitals";
            return (
              <Pressable
                key={cat}
                onPress={() => navigateCategory(cat)}
                style={[s.chip, active && s.chipActive]}
              >
                <Text style={[s.chipText, active && s.chipTextActive]}>{cat}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </Animated.View>

      {/* ── Main Scroll ── */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* Summary Hero */}
        <Animated.View entering={FadeInDown.delay(0).duration(380).springify()}>
          <LinearGradient
            colors={["#011f2e", "#023548", "#04526e"]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={s.heroBanner}
          >
            {/* Decorative radar rings */}
            <View style={s.radarOuter} pointerEvents="none">
              <View style={s.radarMid}>
                <View style={s.radarInner} />
              </View>
            </View>

            <View style={s.heroContent}>
              <View>
                <Text style={s.heroLabel}>Your vitals today</Text>
                <Text style={s.heroTitle}>All Normal</Text>
                <Text style={s.heroSub}>6 metrics · Last updated just now</Text>
              </View>
              <View style={s.heroScoreCircle}>
                <Ionicons name="checkmark-circle" size={18} color="#34d399" />
                <Text style={s.heroScoreText}>Healthy</Text>
              </View>
            </View>

            {/* Quick metric strip */}
            <View style={s.heroStrip}>
              {[
                { label: "HR", val: "72", unit: "bpm", color: "#ef4444" },
                { label: "HRV", val: "45", unit: "ms", color: "#a855f7" },
                { label: "SpO₂", val: "98", unit: "%", color: "#0ea5e9" },
                { label: "Resp", val: "14", unit: "rpm", color: "#10b981" },
              ].map((m, i) => (
                <View key={i} style={s.heroMetric}>
                  <Text style={[s.heroMetricVal, { color: m.color }]}>{m.val}</Text>
                  <Text style={s.heroMetricUnit}>{m.unit}</Text>
                  <Text style={s.heroMetricLabel}>{m.label}</Text>
                </View>
              ))}
            </View>
          </LinearGradient>
        </Animated.View>

        {/* ─── Vitals Cards ─────────────────────────────────── */}
        <Text style={s.sectionTitle}>Detailed metrics</Text>

        {VITALS.map((vital, i) => {
          const isExpanded = expanded === vital.id;
          return (
            <PressCard
              key={vital.id}
              index={i}
              onPress={() => setExpanded(isExpanded ? null : vital.id)}
            >
              <LinearGradient
                colors={vital.gradColors as any}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={s.vitalCard}
              >
                {/* Row: Icon | Info | Value | Chart */}
                <View style={s.vitalRow}>
                  <View style={[s.vitalIconBox, { backgroundColor: `${vital.color}22`, borderColor: `${vital.color}44` }]}>
                    <Ionicons name={vital.icon} size={22} color={vital.color} />
                  </View>

                  <View style={s.vitalInfo}>
                    <Text style={s.vitalTitle}>{vital.title}</Text>
                    <View style={[s.statusBadge, { backgroundColor: vital.statusOk ? "rgba(52,211,153,0.15)" : "rgba(239,68,68,0.15)" }]}>
                      <View style={[s.statusDot, { backgroundColor: vital.statusOk ? "#34d399" : "#ef4444" }]} />
                      <Text style={[s.statusText, { color: vital.statusOk ? "#34d399" : "#ef4444" }]}>{vital.status}</Text>
                    </View>
                  </View>

                  <View style={s.vitalRight}>
                    <Text style={[s.vitalValue, { color: vital.color }]}>{vital.value}</Text>
                    <Text style={s.vitalUnit}>{vital.unit}</Text>
                  </View>

                  <View style={s.miniChartWrap}>
                    <MiniBarChart data={vital.history} color={vital.color} />
                    <Text style={s.rangeText}>{vital.range}</Text>
                  </View>
                </View>

                {/* Expanded detail */}
                {isExpanded && (
                  <Animated.View entering={FadeInDown.duration(250)} style={s.vitalExpanded}>
                    <View style={s.expandDivider} />
                    <Text style={s.vitalDesc}>{vital.desc}</Text>
                    <View style={s.expandedChartWrap}>
                      <Text style={s.expandedChartLabel}>7-day trend</Text>
                      <View style={s.expandedBars}>
                        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, di) => {
                          const v = vital.history[di];
                          const min = Math.min(...vital.history);
                          const max = Math.max(...vital.history);
                          const pct = max === min ? 60 : Math.max(20, ((v - min) / (max - min)) * 100);
                          const isToday = di === 6;
                          return (
                            <View key={day} style={s.expandedBarCol}>
                              <Text style={[s.expandedBarVal, { color: isToday ? vital.color : "rgba(255,255,255,0.5)" }]}>
                                {typeof v === "number" && v % 1 !== 0 ? v.toFixed(1) : v}
                              </Text>
                              <View style={s.expandedBarTrack}>
                                <View style={[
                                  s.expandedBarFill,
                                  { height: `${pct}%` as any, backgroundColor: isToday ? vital.color : `${vital.color}66` }
                                ]} />
                              </View>
                              <Text style={[s.expandedBarDay, isToday && { color: vital.color, fontWeight: "700" }]}>{day}</Text>
                            </View>
                          );
                        })}
                      </View>
                    </View>
                    <Pressable
                      style={[s.detailBtn, { borderColor: `${vital.color}44` }]}
                      onPress={() => navigation.navigate("HealthDashboard")}
                    >
                      <Text style={[s.detailBtnText, { color: vital.color }]}>View full history</Text>
                      <Ionicons name="arrow-forward" size={14} color={vital.color} />
                    </Pressable>
                  </Animated.View>
                )}

                {/* Expand chevron */}
                <View style={s.chevronWrap}>
                  <Ionicons
                    name={isExpanded ? "chevron-up" : "chevron-down"}
                    size={16}
                    color="rgba(255,255,255,0.35)"
                  />
                </View>
              </LinearGradient>
            </PressCard>
          );
        })}

        {/* Measure Now CTA */}
        <Animated.View entering={FadeInDown.delay(400).duration(380)}>
          <LinearGradient
            colors={["#0ea5e9", "#0284c7", "#0369a1"]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={s.measureBtn}
          >
            <View style={s.measureBtnBlob} />
            <Ionicons name="radio-outline" size={26} color="white" />
            <View style={{ flex: 1 }}>
              <Text style={s.measureBtnTitle}>Measure vitals now</Text>
              <Text style={s.measureBtnSub}>Use your device sensors for a fresh reading</Text>
            </View>
            <Ionicons name="arrow-forward-circle" size={28} color="rgba(255,255,255,0.8)" />
          </LinearGradient>
        </Animated.View>

        {/* Samsung Health Info Banner */}
        <Animated.View entering={FadeInDown.delay(460).duration(380)}>
          <View style={s.infoCard}>
            <Ionicons name="information-circle" size={20} color="#0ea5e9" />
            <Text style={s.infoText}>
              Vitals are tracked continuously when wearing a compatible device. Tap any metric to see your 7-day trend.
            </Text>
          </View>
        </Animated.View>

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* Bottom Nav */}
      <SamsungBottomNav activeRoute="HomeDashboard" />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#04111c" },

  topGlow: {
    position: "absolute", top: 0, left: 0, right: 0, height: 200,
  },

  // ─── Header ──────────────────────────────────────────────────
  header: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 16, paddingTop: 52, paddingBottom: 12,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.07)",
    justifyContent: "center", alignItems: "center", marginRight: 10,
  },
  pageTitle: { flex: 1, fontSize: 24, fontWeight: "800", color: "white" },
  avatarBtn: { width: 36, height: 36, borderRadius: 18, overflow: "hidden" },
  avatarInner: { flex: 1, justifyContent: "center", alignItems: "center" },

  // ─── Category Chips ───────────────────────────────────────────
  chipsWrap: { paddingBottom: 4 },
  chipsContent: { paddingHorizontal: 16, gap: 8, flexDirection: "row" },
  chip: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  chipActive: {
    backgroundColor: "rgba(14,165,233,0.22)",
    borderColor: "#0ea5e9",
  },
  chipText: { fontSize: 13.5, fontWeight: "600", color: "rgba(255,255,255,0.55)" },
  chipTextActive: { color: "#bae6fd", fontWeight: "700" },

  scroll: { paddingHorizontal: 16, paddingTop: 12 },

  // ─── Hero Banner ─────────────────────────────────────────────
  heroBanner: {
    borderRadius: 28, padding: 22, marginBottom: 20,
    borderWidth: 1, borderColor: "rgba(14,165,233,0.25)",
    overflow: "hidden",
  },
  radarOuter: {
    position: "absolute", right: -30, top: -30,
    width: 160, height: 160, borderRadius: 80,
    borderWidth: 1, borderColor: "rgba(14,165,233,0.1)",
    justifyContent: "center", alignItems: "center",
  },
  radarMid: {
    width: 120, height: 120, borderRadius: 60,
    borderWidth: 1, borderColor: "rgba(14,165,233,0.1)",
    justifyContent: "center", alignItems: "center",
  },
  radarInner: {
    width: 80, height: 80, borderRadius: 40,
    borderWidth: 1, borderColor: "rgba(14,165,233,0.15)",
    backgroundColor: "rgba(14,165,233,0.05)",
  },
  heroContent: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 },
  heroLabel: { fontSize: 12, color: "#7dd3fc", fontWeight: "600", marginBottom: 4, letterSpacing: 0.5 },
  heroTitle: { fontSize: 32, fontWeight: "800", color: "white" },
  heroSub: { fontSize: 11.5, color: "rgba(255,255,255,0.45)", marginTop: 4 },
  heroScoreCircle: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: "rgba(52,211,153,0.12)",
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12,
    borderWidth: 1, borderColor: "rgba(52,211,153,0.25)",
  },
  heroScoreText: { fontSize: 12, fontWeight: "700", color: "#34d399" },
  heroStrip: {
    flexDirection: "row", borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.07)",
    paddingTop: 14, justifyContent: "space-around",
  },
  heroMetric: { alignItems: "center" },
  heroMetricVal: { fontSize: 22, fontWeight: "800" },
  heroMetricUnit: { fontSize: 10, color: "rgba(255,255,255,0.45)", marginTop: 1 },
  heroMetricLabel: { fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 2 },

  // ─── Section Title ────────────────────────────────────────────
  sectionTitle: { fontSize: 20, fontWeight: "700", color: "white", marginBottom: 12 },

  // ─── Vital Card ───────────────────────────────────────────────
  vitalCard: {
    borderRadius: 24, padding: 18, marginBottom: 10,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.07)",
    overflow: "hidden",
  },
  vitalRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  vitalIconBox: {
    width: 44, height: 44, borderRadius: 22,
    justifyContent: "center", alignItems: "center",
    borderWidth: 1,
  },
  vitalInfo: { flex: 1 },
  vitalTitle: { fontSize: 14, fontWeight: "700", color: "white", marginBottom: 5 },
  statusBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, alignSelf: "flex-start",
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: "700" },
  vitalRight: { alignItems: "flex-end" },
  vitalValue: { fontSize: 28, fontWeight: "800", lineHeight: 32 },
  vitalUnit: { fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 2 },
  miniChartWrap: { width: 70, alignItems: "stretch", gap: 4 },
  rangeText: { fontSize: 9, color: "rgba(255,255,255,0.35)", textAlign: "center" },
  chevronWrap: { alignItems: "center", marginTop: 6 },

  // ─── Expanded detail ─────────────────────────────────────────
  vitalExpanded: { marginTop: 8 },
  expandDivider: { height: 1, backgroundColor: "rgba(255,255,255,0.07)", marginBottom: 12 },
  vitalDesc: { fontSize: 13, color: "rgba(255,255,255,0.65)", lineHeight: 19, marginBottom: 14 },
  expandedChartWrap: { marginBottom: 14 },
  expandedChartLabel: { fontSize: 11.5, color: "rgba(255,255,255,0.45)", marginBottom: 8 },
  expandedBars: { flexDirection: "row", alignItems: "flex-end", height: 70, gap: 4 },
  expandedBarCol: { flex: 1, alignItems: "center", gap: 4 },
  expandedBarVal: { fontSize: 9.5, fontWeight: "700" },
  expandedBarTrack: {
    width: "100%", height: 50, borderRadius: 6,
    backgroundColor: "rgba(255,255,255,0.06)",
    justifyContent: "flex-end", overflow: "hidden",
  },
  expandedBarFill: { borderRadius: 6 },
  expandedBarDay: { fontSize: 9.5, color: "rgba(255,255,255,0.4)", fontWeight: "500" },
  detailBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 6, paddingVertical: 10, borderRadius: 14,
    borderWidth: 1, backgroundColor: "rgba(255,255,255,0.04)",
  },
  detailBtnText: { fontSize: 13, fontWeight: "700" },

  // ─── Measure Now ─────────────────────────────────────────────
  measureBtn: {
    borderRadius: 22, paddingVertical: 18, paddingHorizontal: 20,
    flexDirection: "row", alignItems: "center", gap: 14,
    marginBottom: 12, overflow: "hidden",
    borderWidth: 1, borderColor: "rgba(14,165,233,0.4)",
    elevation: 10, shadowColor: "#0ea5e9",
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 14,
  },
  measureBtnBlob: {
    position: "absolute", right: -30, top: -30,
    width: 130, height: 130, borderRadius: 65,
    backgroundColor: "rgba(255,255,255,0.07)",
  },
  measureBtnTitle: { fontSize: 16, fontWeight: "700", color: "white" },
  measureBtnSub: { fontSize: 11.5, color: "rgba(255,255,255,0.65)", marginTop: 2 },

  // ─── Info Banner ─────────────────────────────────────────────
  infoCard: {
    flexDirection: "row", gap: 10, alignItems: "flex-start",
    backgroundColor: "rgba(14,165,233,0.08)",
    borderRadius: 16, padding: 14, marginBottom: 8,
    borderWidth: 1, borderColor: "rgba(14,165,233,0.15)",
  },
  infoText: { flex: 1, fontSize: 12.5, color: "rgba(255,255,255,0.6)", lineHeight: 18 },
});
