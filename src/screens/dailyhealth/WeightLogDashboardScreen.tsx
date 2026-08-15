import React, { useState } from "react";
import { ScrollView, Text, View, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/types";
import { colors } from "@/theme/colors";

type Props = NativeStackScreenProps<RootStackParamList, "WeightLogDashboard">;

const WEEK_WEIGHTS = [74.2, 73.8, 73.5, 73.1, 72.8, 72.5, 72.5];
const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const LOG_ENTRIES = [
  { date: "Oct 14", weight: "72.5 kg", change: "-0.3 kg", up: false },
  { date: "Oct 13", weight: "72.8 kg", change: "-0.3 kg", up: false },
  { date: "Oct 12", weight: "73.1 kg", change: "-0.4 kg", up: false },
  { date: "Oct 11", weight: "73.5 kg", change: "+0.1 kg", up: true },
];

// Per docs: Weight Log nav is unlabelled/unwired — use generic wellness nav
const NAV = [
  { icon: "heart", label: "Health", route: "HealthDashboard", active: true },
  { icon: "headset-outline", label: "Coaching", route: "AICoach" },
  { icon: "add-circle-outline", label: "Log", route: "AdvancedNutritionDashboard" },
  { icon: "restaurant-outline", label: "Nutrition", route: "NutritionDashboard" },
  { icon: "person-outline", label: "Profile", route: "Profile" },
];

export default function WeightLogDashboardScreen({ navigation }: Props) {
  const [showLog, setShowLog] = useState(false);

  const MIN_W = Math.min(...WEEK_WEIGHTS);
  const MAX_W = Math.max(...WEEK_WEIGHTS);
  const RANGE = MAX_W - MIN_W || 1;

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
          colors={["#06d6a0", "#00cec9", "#0984e3"]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={s.hero}
        >
          <View style={s.heroContent}>
            <Text style={s.heroTitle}>Weight Log{"\n"}Dashboard</Text>
            <Text style={s.heroSub}>Track your progress, monitor your metrics, and stay on top of your health goals.</Text>
            <Pressable style={s.heroBtn} onPress={() => setShowLog(true)}>
              <Text style={s.heroBtnText}>Log New Entry</Text>
            </Pressable>
          </View>
        </LinearGradient>

        {/* Metrics Grid */}
        <View style={s.metricsGrid}>
          {/* Current Weight */}
          <View style={s.metricCard}>
            <View style={s.metricHeader}>
              <Ionicons name="scale-outline" size={18} color={colors.secondaryFixed} />
              <Text style={s.metricLbl}>Current Weight</Text>
            </View>
            <Text style={s.metricValue}>72.5 <Text style={s.metricUnit}>kg</Text></Text>
            <View style={s.metricChange}>
              <Ionicons name="arrow-down" size={12} color={colors.secondary} />
              <Text style={[s.metricChangeTxt, { color: colors.secondary }]}>1.2 kg this week</Text>
            </View>
          </View>

          {/* BMI */}
          <View style={s.metricCard}>
            <View style={s.metricHeader}>
              <Ionicons name="body" size={18} color={colors.primary} />
              <Text style={s.metricLbl}>BMI Index</Text>
            </View>
            <Text style={s.metricValue}>23.1</Text>
            <View style={s.bmiBadge}>
              <Text style={s.bmiBadgeText}>Normal Weight</Text>
            </View>
          </View>

          {/* Goal Ring */}
          <View style={[s.metricCard, s.metricCardWide]}>
            <Text style={s.metricLbl}>Goal Progress</Text>
            <View style={s.goalRow}>
              <View style={s.goalRing}>
                <View style={s.goalRingInner}>
                  <Text style={s.goalRingValue}>75%</Text>
                  <Text style={s.goalRingLbl}>to Goal</Text>
                </View>
              </View>
              <View style={s.goalDetails}>
                <View style={s.goalDetailRow}>
                  <Text style={s.goalDetailLbl}>Start</Text>
                  <Text style={s.goalDetailVal}>78 kg</Text>
                </View>
                <View style={s.goalDetailRow}>
                  <Text style={s.goalDetailLbl}>Current</Text>
                  <Text style={s.goalDetailVal}>72.5 kg</Text>
                </View>
                <View style={s.goalDetailRow}>
                  <Text style={s.goalDetailLbl}>Target</Text>
                  <Text style={s.goalDetailVal}>70 kg</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Body Composition */}
          <View style={[s.metricCard, s.metricCardWide]}>
            <Text style={s.metricLbl}>Body Composition</Text>
            <View style={s.compRow}>
              <Ionicons name="fitness" size={14} color={colors.tertiary} />
              <Text style={s.compLabel}>Muscle Mass</Text>
              <Text style={s.compPct}>55%</Text>
            </View>
            <View style={s.compBarBg}>
              <View style={[s.compBarFill, { width: "55%", backgroundColor: colors.tertiary }]} />
            </View>
            <View style={[s.compRow, { marginTop: 10 }]}>
              <Ionicons name="water" size={14} color={colors.error} />
              <Text style={s.compLabel}>Body Fat</Text>
              <Text style={s.compPct}>18%</Text>
            </View>
            <View style={s.compBarBg}>
              <View style={[s.compBarFill, { width: "18%", backgroundColor: colors.error }]} />
            </View>
          </View>
        </View>

        {/* Weekly Trend Chart */}
        <Text style={s.sectionTitle}>Weekly Trend</Text>
        <View style={s.chartCard}>
          <View style={s.lineChart}>
            {WEEK_WEIGHTS.map((w, i) => {
              const barH = ((w - MIN_W) / RANGE) * 80 + 20;
              return (
                <View key={i} style={s.lineBarWrap}>
                  <Text style={s.lineBarVal}>{w}</Text>
                  <LinearGradient
                    colors={i === WEEK_WEIGHTS.length - 1 ? ["#06d6a0", "#00cec9"] : ["rgba(6,214,160,0.3)", "rgba(0,206,201,0.3)"]}
                    style={[s.lineBar, { height: barH }]}
                  />
                  <Text style={s.lineBarDay}>{WEEK_DAYS[i].slice(0, 1)}</Text>
                </View>
              );
            })}
          </View>
          <View style={s.chartTarget}>
            <View style={s.chartTargetLine} />
            <Text style={s.chartTargetText}>Target: 70 kg</Text>
          </View>
        </View>

        {/* Log History */}
        <Text style={s.sectionTitle}>Log History</Text>
        <View style={s.logCard}>
          {LOG_ENTRIES.map((e, i) => (
            <View key={i} style={[s.logRow, i < LOG_ENTRIES.length - 1 && s.logRowBorder]}>
              <View style={s.logDate}>
                <Text style={s.logDateText}>{e.date}</Text>
              </View>
              <Text style={s.logWeight}>{e.weight}</Text>
              <View style={[s.logChange, { backgroundColor: e.up ? "rgba(255,180,171,0.15)" : "rgba(79,219,200,0.15)" }]}>
                <Ionicons name={e.up ? "arrow-up" : "arrow-down"} size={12} color={e.up ? colors.error : colors.secondary} />
                <Text style={[s.logChangeTxt, { color: e.up ? colors.error : colors.secondary }]}>{e.change}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* CTA */}
        <Pressable
          onPress={() => navigation.navigate("HealthDashboard")}
          style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
        >
          <LinearGradient
            colors={["#06d6a0", "#0984e3"]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={s.ctaBtn}
          >
            <Ionicons name="add-circle-outline" size={22} color="white" />
            <Text style={s.ctaText}>Log Today's Weight</Text>
            <Ionicons name="arrow-forward" size={20} color="white" />
          </LinearGradient>
        </Pressable>

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
  hero: { borderRadius: 32, padding: 28, marginBottom: 20, minHeight: 240, justifyContent: "flex-end" },
  heroContent: {},
  heroTitle: { fontSize: 36, fontWeight: "700", color: "#002a78", lineHeight: 44, marginBottom: 8 },
  heroSub: { fontSize: 15, color: "#003ea8", marginBottom: 20, lineHeight: 22 },
  heroBtn: { backgroundColor: "#002a78", paddingHorizontal: 24, paddingVertical: 14, borderRadius: 30, alignSelf: "flex-start" },
  heroBtnText: { color: "#eeefff", fontSize: 15, fontWeight: "700" },
  metricsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 24 },
  metricCard: { width: "47%", backgroundColor: "#18344F", borderRadius: 28, padding: 18, borderWidth: 1, borderColor: colors.glass.border },
  metricCardWide: { width: "100%" },
  metricHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
  metricLbl: { fontSize: 13, color: colors.text.secondary, fontWeight: "500" },
  metricValue: { fontSize: 32, fontWeight: "700", color: colors.text.primary },
  metricUnit: { fontSize: 16, fontWeight: "400", color: colors.text.secondary },
  metricChange: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 6 },
  metricChangeTxt: { fontSize: 12, fontWeight: "600" },
  bmiBadge: { marginTop: 8, backgroundColor: "rgba(79,219,200,0.15)", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4, alignSelf: "flex-start", borderWidth: 1, borderColor: "rgba(79,219,200,0.3)" },
  bmiBadgeText: { fontSize: 12, color: colors.secondary, fontWeight: "700" },
  goalRow: { flexDirection: "row", alignItems: "center", gap: 20, marginTop: 12 },
  goalRing: { width: 100, height: 100, borderRadius: 50, borderWidth: 8, borderColor: "#06d6a0", justifyContent: "center", alignItems: "center", shadowColor: "#06d6a0", shadowOpacity: 0.4, shadowRadius: 10, elevation: 4 },
  goalRingInner: { alignItems: "center" },
  goalRingValue: { fontSize: 24, fontWeight: "700", color: colors.text.primary },
  goalRingLbl: { fontSize: 11, color: colors.text.secondary },
  goalDetails: { flex: 1, gap: 8 },
  goalDetailRow: { flexDirection: "row", justifyContent: "space-between" },
  goalDetailLbl: { fontSize: 13, color: colors.text.secondary },
  goalDetailVal: { fontSize: 13, fontWeight: "700", color: colors.text.primary },
  compRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  compLabel: { flex: 1, fontSize: 13, color: colors.text.secondary },
  compPct: { fontSize: 14, fontWeight: "700", color: colors.text.primary },
  compBarBg: { height: 8, backgroundColor: colors.surface.containerHighest, borderRadius: 4, overflow: "hidden", marginBottom: 4 },
  compBarFill: { height: 8, borderRadius: 4 },
  sectionTitle: { fontSize: 20, fontWeight: "700", color: colors.text.primary, marginBottom: 12 },
  chartCard: { backgroundColor: "#18344F", borderRadius: 28, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: colors.glass.border },
  lineChart: { flexDirection: "row", alignItems: "flex-end", height: 120, gap: 8, marginBottom: 12 },
  lineBarWrap: { flex: 1, alignItems: "center", gap: 4 },
  lineBarVal: { fontSize: 8, color: colors.text.secondary },
  lineBar: { width: "100%", borderRadius: 6, minHeight: 4 },
  lineBarDay: { fontSize: 10, color: colors.text.secondary },
  chartTarget: { flexDirection: "row", alignItems: "center", gap: 8, borderTopWidth: 1, borderTopColor: "rgba(6,214,160,0.3)", borderStyle: "dashed", paddingTop: 8 },
  chartTargetLine: { flex: 1, height: 1, backgroundColor: "rgba(6,214,160,0.4)" },
  chartTargetText: { fontSize: 11, color: "#06d6a0" },
  logCard: { backgroundColor: "#18344F", borderRadius: 28, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: colors.glass.border },
  logRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12 },
  logRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.glass.borderSubtle },
  logDate: { flex: 1 },
  logDateText: { fontSize: 14, color: colors.text.secondary },
  logWeight: { fontSize: 16, fontWeight: "700", color: colors.text.primary },
  logChange: { flexDirection: "row", alignItems: "center", gap: 4, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  logChangeTxt: { fontSize: 12, fontWeight: "700" },
  ctaBtn: { borderRadius: 32, paddingVertical: 18, paddingHorizontal: 24, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 12 },
  ctaText: { fontSize: 16, fontWeight: "700", color: "white", flex: 1, textAlign: "center" },
  navBar: { position: "absolute", bottom: 0, left: 0, right: 0, height: 72, backgroundColor: colors.surface.container, borderTopWidth: 1, borderTopColor: colors.glass.border, flexDirection: "row", justifyContent: "space-around", alignItems: "center", paddingHorizontal: 8 },
  navBtn: { flex: 1, alignItems: "center", justifyContent: "center", gap: 4, paddingVertical: 8 },
  navLabel: { fontSize: 10, color: colors.text.secondary, fontWeight: "500" },
  navLabelActive: { color: colors.primary, fontWeight: "700" },
});
