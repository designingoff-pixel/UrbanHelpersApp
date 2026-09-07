import React, { useState } from "react";
import {
  ScrollView,
  Text,
  View,
  Pressable,
  StyleSheet,
  Dimensions,
  StatusBar,
  Switch,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import Animated, {
  FadeInDown,
  FadeIn,
} from "react-native-reanimated";
import { RootStackParamList } from "@/navigation/types";
import SamsungBottomNav from "@/components/SamsungBottomNav";

type Props = NativeStackScreenProps<RootStackParamList, "SleepDashboard">;

const { width: SW } = Dimensions.get("window");

// ─── Top Category Chips ────────────────────────────────────────────────────────
const CATEGORIES = ["Activity", "Sleep", "Vitals", "Food", "Together"];

// ─── 7-Day sleep data ──────────────────────────────────────────────────────────
const WEEK_DATA = [
  { day: "Mon", hours: 6.5, score: 72 },
  { day: "Tue", hours: 7.2, score: 80 },
  { day: "Wed", hours: 5.8, score: 65 },
  { day: "Thu", hours: 8.1, score: 88 },
  { day: "Fri", hours: 7.5, score: 83 },
  { day: "Sat", hours: 8.5, score: 91 },
  { day: "Sun", hours: 7.7, score: 85, today: true },
];

// ─── Sleep stage bars ──────────────────────────────────────────────────────────
const STAGE_BARS: { h: number; c: string }[] = [
  { h: 90, c: "#facc15" }, { h: 55, c: "#c084fc" }, { h: 28, c: "#818cf8" },
  { h: 72, c: "#a78bfa" }, { h: 22, c: "#818cf8" }, { h: 100, c: "#facc15" },
  { h: 68, c: "#a78bfa" }, { h: 38, c: "#c084fc" }, { h: 18, c: "#818cf8" },
  { h: 58, c: "#a78bfa" }, { h: 95, c: "#facc15" }, { h: 32, c: "#c084fc" },
  { h: 48, c: "#a78bfa" }, { h: 15, c: "#818cf8" }, { h: 78, c: "#a78bfa" },
  { h: 88, c: "#facc15" },
];

// ─── Wind Down items ────────────────────────────────────────────────────────────
const WIND_DOWN = [
  { label: "Meditation", icon: "body" as const, bg: "#064e3b", route: "MeditationDashboard" },
  { label: "Music", icon: "musical-notes" as const, bg: "#1e3a8a" },
  { label: "Breathing", icon: "aperture" as const, bg: "#7c2d12" },
  { label: "Stories", icon: "book" as const, bg: "#4a1942" },
];

// ─── Smart Insights ─────────────────────────────────────────────────────────────
const INSIGHTS = [
  { icon: "alarm" as const, text: "Smart Alarm: Best wake-up window is 6:45–7:15 AM for optimal energy.", bg: "#1e1060" },
  { icon: "moon" as const, text: "Wind Down: Start relaxing at 10:30 PM to improve sleep onset.", bg: "#2d1060" },
  { icon: "trending-up" as const, text: "Your deep sleep increased by 12% compared to last week.", bg: "#0a2c1a" },
];

export default function SleepDashboardScreen({ navigation }: Props) {
  const [alarmOn, setAlarmOn] = useState(true);

  const navigateCategory = (cat: string) => {
    if (cat === "Activity") navigation.navigate("FitnessDashboard");
    else if (cat === "Sleep") { /* already here */ }
    else if (cat === "Vitals") navigation.navigate("VitalsScreen" as any);
    else if (cat === "Food") navigation.navigate("NutritionDashboard");
    else if (cat === "Together") navigation.navigate("FamilyDashboard");
  };

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* ── Top ambient glow ── */}
      <LinearGradient
        colors={["rgba(109,40,217,0.35)", "rgba(45,18,100,0.18)", "transparent"]}
        style={s.topGlow}
        pointerEvents="none"
      />

      {/* ── Header ── */}
      <Animated.View entering={FadeIn.duration(400)} style={s.header}>
        <Pressable onPress={() => navigation.goBack()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={22} color="rgba(255,255,255,0.85)" />
        </Pressable>
        <Text style={s.pageTitle}>Sleep</Text>
        <Pressable onPress={() => navigation.navigate("Profile")} style={s.avatarBtn}>
          <LinearGradient colors={["#7c3aed", "#6d28d9"]} style={s.avatarInner}>
            <Ionicons name="person" size={14} color="white" />
          </LinearGradient>
        </Pressable>
      </Animated.View>

      {/* ── Top Category Chips ── */}
      <Animated.View entering={FadeIn.delay(80).duration(380)} style={s.chipsWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.chipsContent}
        >
          {CATEGORIES.map((cat) => {
            const active = cat === "Sleep";
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

      {/* ── Main Scroll Content ── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
      >
        {/* 1. Tonight banner */}
        <Animated.View entering={FadeInDown.delay(0).duration(380).springify()}>
          <LinearGradient
            colors={["#13084a", "#1a0f6b", "#2a1a9e"]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={s.heroBanner}
          >
            {/* Stars */}
            <Text style={s.star1}>✦</Text>
            <Text style={s.star2}>✦</Text>
            <Text style={s.star3}>·</Text>
            <Text style={s.star4}>✦</Text>
            <Text style={s.star5}>·</Text>

            <View style={s.bannerRow}>
              <View style={s.bannerLeft}>
                <Text style={s.bannerLabel}>Last night</Text>
                <Text style={s.bannerDuration}>7h 42m</Text>
                <View style={s.bannerMetaRow}>
                  <View style={s.bannerMeta}>
                    <Ionicons name="bed" size={12} color="#a78bfa" />
                    <Text style={s.bannerMetaText}>11:08 PM</Text>
                  </View>
                  <View style={s.bannerMeta}>
                    <Ionicons name="sunny" size={12} color="#fbbf24" />
                    <Text style={s.bannerMetaText}>6:50 AM</Text>
                  </View>
                </View>
              </View>

              {/* Score Ring */}
              <View style={s.ringWrap}>
                <View style={s.ringOuter}>
                  <View style={s.ringInner}>
                    <Text style={s.ringNum}>85</Text>
                    <Text style={s.ringLabel}>score</Text>
                  </View>
                </View>
                <Text style={s.ringQuality}>Excellent</Text>
              </View>
            </View>

            {/* Stage legend strip */}
            <View style={s.stageLegendRow}>
              {[["#facc15", "Awake"], ["#c084fc", "REM"], ["#a78bfa", "Light"], ["#818cf8", "Deep"]].map(([c, l]) => (
                <View key={l} style={s.stageLegendItem}>
                  <View style={[s.stageLegendDot, { backgroundColor: c }]} />
                  <Text style={s.stageLegendText}>{l}</Text>
                </View>
              ))}
            </View>
          </LinearGradient>
        </Animated.View>

        {/* 2. Sleep Stages chart */}
        <Animated.View entering={FadeInDown.delay(60).duration(380).springify()}>
          <View style={s.card}>
            <Text style={s.cardTitle}>Sleep stages</Text>
            <Text style={s.cardSub}>Detailed cycles from last night</Text>
            <View style={s.stagesChart}>
              {STAGE_BARS.map((b, i) => (
                <View key={i} style={s.stageBarTrack}>
                  <View style={[s.stageBarFill, { height: `${b.h}%` as any, backgroundColor: b.c }]} />
                </View>
              ))}
            </View>
            <View style={s.chartAxisRow}>
              <Text style={s.axisLabel}>11:00 PM</Text>
              <Text style={s.axisLabel}>3:00 AM</Text>
              <Text style={s.axisLabel}>6:45 AM</Text>
            </View>
            {/* Totals row */}
            <View style={s.stageTotalsRow}>
              {[
                { c: "#facc15", label: "Awake", val: "22m" },
                { c: "#c084fc", label: "REM", val: "1h 28m" },
                { c: "#a78bfa", label: "Light", val: "3h 12m" },
                { c: "#818cf8", label: "Deep", val: "2h 40m" },
              ].map((st) => (
                <View key={st.label} style={s.stageTotalItem}>
                  <View style={[s.stageTotalDot, { backgroundColor: st.c }]} />
                  <Text style={s.stageTotalLabel}>{st.label}</Text>
                  <Text style={s.stageTotalVal}>{st.val}</Text>
                </View>
              ))}
            </View>
          </View>
        </Animated.View>

        {/* 3. 7-Day History */}
        <Animated.View entering={FadeInDown.delay(120).duration(380).springify()}>
          <View style={s.card}>
            <Text style={s.cardTitle}>Sleep history</Text>
            <Text style={s.cardSub}>Last 7 nights • Average 7h 34m</Text>
            <View style={s.histRow}>
              {WEEK_DATA.map((d) => (
                <View key={d.day} style={s.histCol}>
                  <Text style={[s.histScore, d.today && { color: "#a78bfa" }]}>{d.score}</Text>
                  <View style={s.histBarTrack}>
                    <LinearGradient
                      colors={d.today ? ["#7c3aed", "#a78bfa"] : ["#4c1d95", "#6d28d9"]}
                      style={[s.histBarFill, { height: `${(d.hours / 9) * 100}%` as any }]}
                    />
                  </View>
                  <Text style={s.histHours}>{d.hours}h</Text>
                  <Text style={[s.histDay, d.today && { color: "#a78bfa", fontWeight: "700" }]}>{d.day}</Text>
                </View>
              ))}
            </View>
          </View>
        </Animated.View>

        {/* 4. Smart Insights */}
        <Animated.View entering={FadeInDown.delay(180).duration(380).springify()}>
          <Text style={s.sectionTitle}>Sleep insights</Text>
          <View style={s.insightsWrap}>
            {INSIGHTS.map((ins, i) => (
              <View key={i} style={[s.insightRow, { backgroundColor: ins.bg }]}>
                <View style={s.insightIcon}>
                  <Ionicons name={ins.icon} size={20} color="white" />
                </View>
                <Text style={s.insightText}>{ins.text}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* 5. Wind Down */}
        <Animated.View entering={FadeInDown.delay(240).duration(380).springify()}>
          <Text style={s.sectionTitle}>Wind down</Text>
          <View style={s.windGrid}>
            {WIND_DOWN.map((w) => (
              <Pressable
                key={w.label}
                style={[s.windCard, { backgroundColor: w.bg }]}
                onPress={() => w.route ? navigation.navigate(w.route as any) : Alert.alert(w.label)}
              >
                <View style={s.windIcon}>
                  <Ionicons name={w.icon} size={24} color="white" />
                </View>
                <Text style={s.windLabel}>{w.label}</Text>
              </Pressable>
            ))}
          </View>
        </Animated.View>

        {/* 6. Smart Alarm */}
        <Animated.View entering={FadeInDown.delay(300).duration(380).springify()}>
          <Text style={s.sectionTitle}>Smart alarm</Text>
          <View style={s.alarmCard}>
            <View style={s.alarmLeft}>
              <View style={s.alarmIconBox}>
                <Ionicons name="alarm" size={22} color="#a78bfa" />
              </View>
              <View>
                <Text style={s.alarmTime}>07:15 <Text style={s.alarmAmPm}>AM</Text></Text>
                <View style={s.alarmMetaRow}>
                  <Ionicons name="sparkles" size={11} color="#a78bfa" />
                  <Text style={s.alarmMetaText}>Smart Alarm · Tomorrow</Text>
                </View>
                <Text style={s.alarmDesc}>Wakes you in lightest sleep phase ±30 min</Text>
              </View>
            </View>
            <Switch
              value={alarmOn}
              onValueChange={setAlarmOn}
              trackColor={{ false: "rgba(255,255,255,0.1)", true: "#7c3aed" }}
              thumbColor={alarmOn ? "#e9d5ff" : "rgba(255,255,255,0.5)"}
            />
          </View>

          {/* Set new alarm */}
          <Pressable
            style={s.setAlarmBtn}
            onPress={() => Alert.alert("Set Alarm", "Alarm configuration coming soon.")}
          >
            <Ionicons name="add-circle-outline" size={18} color="#a78bfa" />
            <Text style={s.setAlarmText}>Set a new alarm</Text>
          </Pressable>
        </Animated.View>

        {/* 7. Sleep tips */}
        <Animated.View entering={FadeInDown.delay(360).duration(380).springify()}>
          <Text style={s.sectionTitle}>Sleep tips</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.tipsScroll}>
            {[
              { icon: "cafe" as const, title: "Avoid caffeine", desc: "No caffeine after 2 PM for better sleep onset.", c: "#431a00" },
              { icon: "phone-portrait-outline" as const, title: "Blue light", desc: "Reduce screen time 1 hour before bed.", c: "#0f172a" },
              { icon: "thermometer-outline" as const, title: "Cool room", desc: "Keep bedroom at 65–68°F for optimal rest.", c: "#042f2e" },
              { icon: "time-outline" as const, title: "Consistent schedule", desc: "Sleep and wake at the same times daily.", c: "#1c1060" },
            ].map((tip, i) => (
              <View key={i} style={[s.tipCard, { backgroundColor: tip.c }]}>
                <View style={s.tipIconBox}>
                  <Ionicons name={tip.icon} size={22} color="white" />
                </View>
                <Text style={s.tipTitle}>{tip.title}</Text>
                <Text style={s.tipDesc}>{tip.desc}</Text>
              </View>
            ))}
          </ScrollView>
        </Animated.View>

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* ── Bottom Nav ── */}
      <SamsungBottomNav activeRoute="HomeDashboard" />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#09061e" },

  topGlow: {
    position: "absolute", top: 0, left: 0, right: 0, height: 200,
  },

  // Header
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

  // Category Chips
  chipsWrap: { paddingBottom: 4 },
  chipsContent: { paddingHorizontal: 16, gap: 8, flexDirection: "row" },
  chip: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  chipActive: {
    backgroundColor: "rgba(124,58,237,0.25)",
    borderColor: "#7c3aed",
  },
  chipText: { fontSize: 13.5, fontWeight: "600", color: "rgba(255,255,255,0.55)" },
  chipTextActive: { color: "#e9d5ff", fontWeight: "700" },

  scroll: { paddingHorizontal: 16, paddingTop: 12 },

  // ─── Hero Banner ──────────────────────────────────────────────
  heroBanner: {
    borderRadius: 28, padding: 22, marginBottom: 14,
    borderWidth: 1, borderColor: "rgba(124,58,237,0.25)",
    overflow: "hidden",
  },
  star1: { position: "absolute", top: 14, right: 24, color: "#a78bfa", fontSize: 12 },
  star2: { position: "absolute", top: 30, right: 50, color: "#a78bfa", fontSize: 8 },
  star3: { position: "absolute", top: 20, right: 38, color: "#c4b5fd", fontSize: 18 },
  star4: { position: "absolute", top: 60, left: 20, color: "#a78bfa", fontSize: 9 },
  star5: { position: "absolute", top: 12, left: 55, color: "#c4b5fd", fontSize: 16 },

  bannerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 18 },
  bannerLeft: {},
  bannerLabel: { fontSize: 12, color: "#c4b5fd", fontWeight: "600", marginBottom: 4, letterSpacing: 0.5 },
  bannerDuration: { fontSize: 44, fontWeight: "800", color: "white", lineHeight: 52 },
  bannerMetaRow: { flexDirection: "row", gap: 14, marginTop: 6 },
  bannerMeta: { flexDirection: "row", alignItems: "center", gap: 5 },
  bannerMetaText: { fontSize: 12.5, color: "rgba(255,255,255,0.65)" },

  ringWrap: { alignItems: "center" },
  ringOuter: {
    width: 96, height: 96, borderRadius: 48,
    borderWidth: 5, borderColor: "#7c3aed",
    backgroundColor: "rgba(124,58,237,0.15)",
    justifyContent: "center", alignItems: "center",
  },
  ringInner: { alignItems: "center" },
  ringNum: { fontSize: 30, fontWeight: "800", color: "#e9d5ff" },
  ringLabel: { fontSize: 10, color: "#a78bfa", fontWeight: "600", letterSpacing: 0.5 },
  ringQuality: { fontSize: 11.5, color: "#c4b5fd", fontWeight: "700", marginTop: 6 },

  stageLegendRow: { flexDirection: "row", gap: 14, flexWrap: "wrap" },
  stageLegendItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  stageLegendDot: { width: 8, height: 8, borderRadius: 4 },
  stageLegendText: { fontSize: 11, color: "rgba(255,255,255,0.6)" },

  // ─── Generic Card ─────────────────────────────────────────────
  card: {
    backgroundColor: "#120f30", borderRadius: 24, padding: 20,
    marginBottom: 14, borderWidth: 1, borderColor: "rgba(124,58,237,0.18)",
  },
  cardTitle: { fontSize: 16, fontWeight: "700", color: "white", marginBottom: 3 },
  cardSub: { fontSize: 11.5, color: "rgba(255,255,255,0.45)", marginBottom: 16 },

  // ─── Sleep Stages ────────────────────────────────────────────
  stagesChart: {
    flexDirection: "row", alignItems: "flex-end", height: 90,
    gap: 3, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.06)",
    paddingBottom: 4, marginBottom: 8,
  },
  stageBarTrack: { flex: 1, height: "100%", justifyContent: "flex-end" },
  stageBarFill: { borderRadius: 3 },
  chartAxisRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
  axisLabel: { fontSize: 10, color: "rgba(255,255,255,0.35)" },
  stageTotalsRow: {
    flexDirection: "row", gap: 8, borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.07)", paddingTop: 12, flexWrap: "wrap",
  },
  stageTotalItem: { alignItems: "center", gap: 4, minWidth: "22%" },
  stageTotalDot: { width: 10, height: 10, borderRadius: 5 },
  stageTotalLabel: { fontSize: 10, color: "rgba(255,255,255,0.5)" },
  stageTotalVal: { fontSize: 13, fontWeight: "700", color: "white" },

  // ─── 7-Day History ────────────────────────────────────────────
  histRow: { flexDirection: "row", alignItems: "flex-end", gap: 4 },
  histCol: { flex: 1, alignItems: "center", gap: 4 },
  histScore: { fontSize: 10, fontWeight: "700", color: "rgba(255,255,255,0.45)" },
  histBarTrack: {
    width: "100%", height: 80, borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.05)",
    justifyContent: "flex-end", overflow: "hidden",
  },
  histBarFill: { borderRadius: 8 },
  histHours: { fontSize: 9, color: "rgba(255,255,255,0.4)" },
  histDay: { fontSize: 10.5, color: "rgba(255,255,255,0.5)", fontWeight: "500" },

  // ─── Insights ─────────────────────────────────────────────────
  sectionTitle: { fontSize: 20, fontWeight: "700", color: "white", marginBottom: 12 },
  insightsWrap: { gap: 8, marginBottom: 22 },
  insightRow: {
    flexDirection: "row", alignItems: "center", gap: 14,
    borderRadius: 18, padding: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.06)",
  },
  insightIcon: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.12)",
    justifyContent: "center", alignItems: "center",
  },
  insightText: { flex: 1, fontSize: 13, color: "rgba(255,255,255,0.85)", lineHeight: 19 },

  // ─── Wind Down ────────────────────────────────────────────────
  windGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 22 },
  windCard: {
    width: (SW - 32 - 10) / 2, borderRadius: 20, padding: 18,
    alignItems: "center", gap: 10, borderWidth: 1, borderColor: "rgba(255,255,255,0.07)",
  },
  windIcon: {
    width: 50, height: 50, borderRadius: 25,
    backgroundColor: "rgba(255,255,255,0.12)",
    justifyContent: "center", alignItems: "center",
  },
  windLabel: { fontSize: 14, color: "white", fontWeight: "600" },

  // ─── Smart Alarm ──────────────────────────────────────────────
  alarmCard: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    backgroundColor: "#120f30", borderRadius: 22, padding: 20,
    borderWidth: 1, borderColor: "rgba(124,58,237,0.2)", marginBottom: 10,
  },
  alarmLeft: { flexDirection: "row", alignItems: "center", gap: 14, flex: 1 },
  alarmIconBox: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: "rgba(124,58,237,0.18)",
    justifyContent: "center", alignItems: "center",
    borderWidth: 1, borderColor: "rgba(124,58,237,0.3)",
  },
  alarmTime: { fontSize: 30, fontWeight: "800", color: "white" },
  alarmAmPm: { fontSize: 14, color: "rgba(255,255,255,0.5)" },
  alarmMetaRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 3 },
  alarmMetaText: { fontSize: 12, color: "rgba(255,255,255,0.55)" },
  alarmDesc: { fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 3 },

  setAlarmBtn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    justifyContent: "center", paddingVertical: 12,
    backgroundColor: "rgba(124,58,237,0.1)",
    borderRadius: 16, borderWidth: 1, borderColor: "rgba(124,58,237,0.2)",
    marginBottom: 22,
  },
  setAlarmText: { fontSize: 14, fontWeight: "600", color: "#a78bfa" },

  // ─── Sleep Tips carousel ──────────────────────────────────────
  tipsScroll: { marginHorizontal: -16, marginBottom: 8 },
  tipCard: {
    width: SW * 0.6, borderRadius: 20, padding: 18, marginLeft: 16,
    gap: 10, borderWidth: 1, borderColor: "rgba(255,255,255,0.07)",
  },
  tipIconBox: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.12)",
    justifyContent: "center", alignItems: "center",
  },
  tipTitle: { fontSize: 15, fontWeight: "700", color: "white" },
  tipDesc: { fontSize: 12.5, color: "rgba(255,255,255,0.65)", lineHeight: 18 },
});
