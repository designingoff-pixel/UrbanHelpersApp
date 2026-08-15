import React, { useState } from "react";
import { ScrollView, Text, View, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/types";
import { colors } from "@/theme/colors";

type Props = NativeStackScreenProps<RootStackParamList, "HydrationDashboard">;

const QUICK_ADD = [
  { label: "250ml", icon: "water-outline", color: colors.secondary },
  { label: "500ml", icon: "water", color: colors.primary },
  { label: "750ml", icon: "cafe-outline", color: colors.tertiary },
  { label: "1000ml", icon: "beaker-outline", color: "#38bdf8" },
];

const TIMELINE = [
  { time: "8:00 AM", amount: "250ml", icon: "sunny" },
  { time: "10:30 AM", amount: "500ml", icon: "water" },
  { time: "1:00 PM", amount: "250ml", icon: "restaurant" },
  { time: "3:00 PM", amount: "recommended", icon: "notifications", pending: true },
];

const WEEK = [40, 65, 50, 80, 55, 90, 48];
const WEEK_DAYS = ["M", "T", "W", "T", "F", "S", "S"];

// Navigation per PROJECT_DOCUMENTATION.md:
// Health | Coaching(AICoach) | Nutrition(NutritionDashboard) | Log | Profile
const NAV = [
  { icon: "heart", label: "Health", route: "HealthDashboard", active: true },
  { icon: "headset-outline", label: "Coaching", route: "AICoach" },
  { icon: "add-circle-outline", label: "Log", route: "HydrationDashboard" },
  { icon: "restaurant-outline", label: "Nutrition", route: "NutritionDashboard" },
  { icon: "person-outline", label: "Profile", route: "Profile" },
];

export default function HydrationDashboardScreen({ navigation }: Props) {
  const [intake, setIntake] = useState(1200); // ml
  const goal = 2500;
  const pct = intake / goal;
  const liters = (intake / 1000).toFixed(1);

  return (
    <View style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} style={s.iconBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.text.secondary} />
        </Pressable>
        <Text style={s.headerTitle}>Urban Helpers</Text>
        <Pressable style={s.iconBtn}>
          <Ionicons name="settings-outline" size={22} color={colors.text.secondary} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {/* Hero */}
        <LinearGradient
          colors={["#4facfe", "#2196f3", "#0d47a1"]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={s.hero}
        >
          <View style={s.heroContent}>
            <Text style={s.heroTitle}>Hydration{"\n"}Dashboard</Text>
            <Text style={s.heroSub}>Stay refreshed, stay active.</Text>
          </View>
          {/* Water level fill */}
          <View style={s.waterFill} />
          <View style={s.heroStats}>
            <View style={s.heroStat}>
              <Text style={s.heroStatVal}>{liters}L</Text>
              <Text style={s.heroStatLbl}>consumed</Text>
            </View>
            <View style={s.heroStatDiv} />
            <View style={s.heroStat}>
              <Text style={s.heroStatVal}>{((goal - intake) / 1000).toFixed(1)}L</Text>
              <Text style={s.heroStatLbl}>remaining</Text>
            </View>
            <View style={s.heroStatDiv} />
            <View style={s.heroStat}>
              <Text style={s.heroStatVal}>{Math.round(pct * 100)}%</Text>
              <Text style={s.heroStatLbl}>of goal</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Today's Intake + Quick Add */}
        <View style={s.twoCol}>
          {/* Intake Ring */}
          <View style={s.intakeCard}>
            <Text style={s.cardTitle}>Today's Intake</Text>
            <View style={s.intakeRing}>
              <View style={s.intakeRingInner}>
                <Text style={s.intakeValue}>{liters}</Text>
                <Text style={s.intakeUnit}>L</Text>
                <Text style={s.intakeGoal}>of {(goal / 1000).toFixed(1)}L</Text>
              </View>
            </View>
            {/* Water wave bar */}
            <View style={s.waveBg}>
              <LinearGradient
                colors={["#4facfe", "#2196f3"]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={[s.waveFill, { width: `${pct * 100}%` as any }]}
              />
            </View>
          </View>

          {/* Quick Add */}
          <View style={s.quickCard}>
            <View style={s.quickHeader}>
              <Text style={s.cardTitle}>Quick Add</Text>
              <Ionicons name="add-circle-outline" size={20} color={colors.text.secondary} />
            </View>
            <View style={s.quickGrid}>
              {QUICK_ADD.map((q) => (
                <Pressable
                  key={q.label}
                  onPress={() => setIntake(Math.min(intake + parseInt(q.label), goal))}
                  style={({ pressed }) => [s.quickBtn, { opacity: pressed ? 0.75 : 1 }]}
                >
                  <Ionicons name={q.icon as any} size={22} color={q.color} />
                  <Text style={s.quickBtnText}>{q.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>

        {/* AI Hydration Insights */}
        <View style={s.aiCard}>
          <View style={s.aiHeader}>
            <Ionicons name="sparkles" size={18} color={colors.secondary} />
            <Text style={s.aiTitle}>Hydration AI</Text>
          </View>
          <View style={s.aiInsight}>
            <Text style={s.aiText}>
              You usually drink water around this time. Grab a glass to keep your energy up!
            </Text>
          </View>
          <View style={s.aiNextRow}>
            <Text style={s.aiNextLabel}>Recommended next intake:</Text>
            <Text style={s.aiNextTime}>3:00 PM</Text>
          </View>
        </View>

        {/* Timeline */}
        <View style={s.timelineCard}>
          <View style={s.timelineHeader}>
            <Text style={s.cardTitle}>Timeline</Text>
            <Text style={s.timelineToday}>Today</Text>
          </View>
          {TIMELINE.map((t, i) => (
            <View key={i} style={[s.timelineRow, i < TIMELINE.length - 1 && s.timelineRowBorder]}>
              <View style={[s.timelineDot, t.pending && s.timelineDotPending]} />
              <View style={s.timelineLeft}>
                <Text style={[s.timelineTime, t.pending && s.timelineTimePending]}>{t.time}</Text>
              </View>
              <View style={s.timelineRight}>
                <Ionicons name={t.icon as any} size={16} color={t.pending ? colors.text.muted : colors.secondary} />
                <Text style={[s.timelineAmount, t.pending && s.timelineAmountPending]}>{t.amount}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Weekly Chart */}
        <Text style={s.sectionTitle}>Weekly Intake</Text>
        <View style={s.weekCard}>
          <View style={s.barChart}>
            {WEEK.map((h, i) => (
              <View key={i} style={s.barWrap}>
                <LinearGradient
                  colors={i === 5 ? ["#4facfe", "#2196f3"] : ["rgba(79,172,254,0.3)", "rgba(33,150,243,0.3)"]}
                  style={[s.bar, { height: (h / 100) * 80 }]}
                />
                <Text style={s.barDay}>{WEEK_DAYS[i]}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Nav */}
      <View style={s.navBar}>
        {NAV.map((n) => (
          <Pressable
            key={n.label}
            onPress={() => navigation.navigate(n.route as any)}
            style={s.navBtn}
          >
            <Ionicons name={n.icon as any} size={22} color={n.active ? colors.primary : colors.text.secondary} />
            <Text style={[s.navLabel, n.active && s.navLabelActive]}>{n.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface.dim },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: 52, paddingBottom: 12 },
  headerTitle: { fontSize: 20, fontWeight: "700", color: colors.primary },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface.containerHigh, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: colors.glass.border },
  scroll: { paddingHorizontal: 16 },
  hero: { borderRadius: 32, minHeight: 220, marginBottom: 20, overflow: "hidden", justifyContent: "flex-end", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  heroContent: { padding: 24, paddingBottom: 8 },
  heroTitle: { fontSize: 36, fontWeight: "700", color: "white", lineHeight: 44 },
  heroSub: { fontSize: 16, color: "rgba(255,255,255,0.85)", marginTop: 4, marginBottom: 16 },
  waterFill: { position: "absolute", bottom: 0, left: 0, right: 0, height: "48%", backgroundColor: "rgba(255,255,255,0.12)", borderTopLeftRadius: 40, borderTopRightRadius: 40 },
  heroStats: { flexDirection: "row", backgroundColor: "rgba(0,0,0,0.2)", marginHorizontal: 16, marginBottom: 16, borderRadius: 20, padding: 14, justifyContent: "space-around", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", zIndex: 2 },
  heroStat: { alignItems: "center" },
  heroStatVal: { fontSize: 22, fontWeight: "700", color: "white" },
  heroStatLbl: { fontSize: 11, color: "rgba(255,255,255,0.7)" },
  heroStatDiv: { width: 1, backgroundColor: "rgba(255,255,255,0.2)" },
  twoCol: { flexDirection: "row", gap: 12, marginBottom: 16 },
  intakeCard: { flex: 1, backgroundColor: "#18344F", borderRadius: 30, padding: 16, borderWidth: 1, borderColor: colors.glass.border, alignItems: "center" },
  cardTitle: { fontSize: 18, fontWeight: "700", color: colors.primary, marginBottom: 12, alignSelf: "flex-start" },
  intakeRing: { width: 110, height: 110, borderRadius: 55, borderWidth: 8, borderColor: "#4facfe", justifyContent: "center", alignItems: "center", marginBottom: 12 },
  intakeRingInner: { alignItems: "center" },
  intakeValue: { fontSize: 28, fontWeight: "700", color: "white" },
  intakeUnit: { fontSize: 14, color: colors.text.secondary },
  intakeGoal: { fontSize: 10, color: colors.text.secondary },
  waveBg: { width: "100%", height: 8, backgroundColor: colors.surface.containerHighest, borderRadius: 4, overflow: "hidden" },
  waveFill: { height: 8, borderRadius: 4 },
  quickCard: { flex: 1, backgroundColor: "#18344F", borderRadius: 30, padding: 16, borderWidth: 1, borderColor: colors.glass.border },
  quickHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  quickGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  quickBtn: { width: "47%", backgroundColor: colors.surface.containerHighest, borderRadius: 14, padding: 12, alignItems: "center", gap: 6, borderWidth: 1, borderColor: colors.glass.border },
  quickBtnText: { fontSize: 13, fontWeight: "700", color: colors.text.primary },
  aiCard: { backgroundColor: colors.glass.background, borderRadius: 30, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: colors.glass.border },
  aiHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  aiTitle: { fontSize: 18, fontWeight: "700", color: colors.primary },
  aiInsight: { backgroundColor: colors.surface.containerLow, borderRadius: 16, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: colors.glass.borderSubtle },
  aiText: { fontSize: 14, color: colors.text.primary, lineHeight: 22 },
  aiNextRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: colors.surface.containerLow, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: colors.glass.borderSubtle },
  aiNextLabel: { fontSize: 14, color: colors.text.secondary },
  aiNextTime: { fontSize: 16, fontWeight: "700", color: colors.secondary },
  timelineCard: { backgroundColor: "#18344F", borderRadius: 30, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: colors.glass.border },
  timelineHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  timelineToday: { fontSize: 12, color: colors.text.secondary },
  timelineRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12 },
  timelineRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.glass.borderSubtle },
  timelineDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.secondary },
  timelineDotPending: { backgroundColor: colors.text.muted, borderWidth: 1, borderColor: colors.text.subtle },
  timelineLeft: { flex: 1 },
  timelineTime: { fontSize: 13, color: colors.text.primary, fontWeight: "600" },
  timelineTimePending: { color: colors.text.muted },
  timelineRight: { flexDirection: "row", alignItems: "center", gap: 6 },
  timelineAmount: { fontSize: 13, color: colors.secondary, fontWeight: "700" },
  timelineAmountPending: { color: colors.text.muted, fontWeight: "400" },
  sectionTitle: { fontSize: 20, fontWeight: "700", color: colors.text.primary, marginBottom: 12 },
  weekCard: { backgroundColor: "#18344F", borderRadius: 28, padding: 16, marginBottom: 8, borderWidth: 1, borderColor: colors.glass.border },
  barChart: { flexDirection: "row", alignItems: "flex-end", height: 100, gap: 8 },
  barWrap: { flex: 1, alignItems: "center", gap: 6 },
  bar: { width: "100%", borderRadius: 6, minHeight: 4 },
  barDay: { fontSize: 10, color: colors.text.secondary },
  navBar: { position: "absolute", bottom: 0, left: 0, right: 0, height: 72, backgroundColor: colors.surface.container, borderTopWidth: 1, borderTopColor: colors.glass.border, flexDirection: "row", justifyContent: "space-around", alignItems: "center", paddingHorizontal: 8 },
  navBtn: { flex: 1, alignItems: "center", justifyContent: "center", gap: 4, paddingVertical: 8 },
  navLabel: { fontSize: 10, color: colors.text.secondary, fontWeight: "500" },
  navLabelActive: { color: colors.primary, fontWeight: "700" },
});
