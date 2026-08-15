import React from "react";
import { ScrollView, Text, View, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/types";
import { colors } from "@/theme/colors";

type Props = NativeStackScreenProps<RootStackParamList, "DailyStepsDashboard">;

const WEEK = [
  { day: "Mon", steps: 7200, active: false },
  { day: "Tue", steps: 9400, active: false },
  { day: "Wed", steps: 8100, active: false },
  { day: "Thu", steps: 11200, active: false },
  { day: "Fri", steps: 8400, active: true },
  { day: "Sat", steps: 6500, active: false },
  { day: "Sun", steps: 4300, active: false },
];
const MAX_STEPS = 12000;

const ACTIVITIES = [
  { icon: "walk", label: "Walking", value: "5.2 km", color: "#2563eb" },
  { icon: "bicycle", label: "Cycling", value: "3.8 km", color: "#10b981" },
  { icon: "fitness", label: "Running", value: "1.4 km", color: "#e11d48" },
];

const NAV = [
  { icon: "home-outline", label: "Home", route: "HomeDashboard" },
  { icon: "heart-outline", label: "Health", route: "HealthDashboard" },
  { icon: "compass-outline", label: "Discover", route: "Discover" },
  { icon: "barbell", label: "Fitness", route: "FitnessDashboard", active: true },
  { icon: "person-outline", label: "Profile", route: "Profile" },
];

export default function DailyStepsDashboardScreen({ navigation }: Props) {
  const todaySteps = 8400;
  const goal = 10000;
  const pct = todaySteps / goal;

  return (
    <View style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} style={s.iconBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.text.secondary} />
        </Pressable>
        <Text style={s.headerTitle}>Daily Steps</Text>
        <Pressable style={s.iconBtn}>
          <Ionicons name="share-outline" size={22} color={colors.text.secondary} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {/* Hero */}
        <LinearGradient
          colors={["#1e3a8a", "#2563eb", "#0d9488"]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={s.hero}
        >
          {/* Circle ring */}
          <View style={s.ringWrap}>
            <View style={s.ringOuter}>
              <View style={s.ringInner}>
                <Text style={s.stepsValue}>{todaySteps.toLocaleString()}</Text>
                <Text style={s.stepsLabel}>steps</Text>
                <Text style={s.stepsGoal}>Goal: {goal.toLocaleString()}</Text>
              </View>
            </View>
            {/* Progress arc indicator */}
            <View style={s.progressArc}>
              <View style={[s.progressFill, { width: `${pct * 100}%` }]} />
            </View>
          </View>
          <View style={s.heroStatsRow}>
            <View style={s.heroStat}>
              <Text style={s.heroStatVal}>5.2</Text>
              <Text style={s.heroStatLbl}>km</Text>
            </View>
            <View style={s.heroStatDiv} />
            <View style={s.heroStat}>
              <Text style={s.heroStatVal}>320</Text>
              <Text style={s.heroStatLbl}>kcal</Text>
            </View>
            <View style={s.heroStatDiv} />
            <View style={s.heroStat}>
              <Text style={s.heroStatVal}>42</Text>
              <Text style={s.heroStatLbl}>min</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Weekly Chart */}
        <Text style={s.sectionTitle}>Weekly Progress</Text>
        <View style={s.chartCard}>
          <View style={s.barChart}>
            {WEEK.map((w, i) => (
              <View key={i} style={s.barWrap}>
                <Text style={s.barVal}>{w.steps >= 1000 ? `${(w.steps / 1000).toFixed(1)}k` : w.steps}</Text>
                <LinearGradient
                  colors={w.active ? ["#2563eb", "#0d9488"] : ["rgba(37,99,235,0.3)", "rgba(13,148,136,0.3)"]}
                  style={[s.bar, { height: (w.steps / MAX_STEPS) * 110 }]}
                />
                <Text style={[s.barDay, w.active && s.barDayActive]}>{w.day}</Text>
              </View>
            ))}
          </View>
          <View style={s.goalLine}>
            <Text style={s.goalLineText}>Goal: {(goal / 1000).toFixed(0)}k steps</Text>
          </View>
        </View>

        {/* Today's Breakdown */}
        <Text style={s.sectionTitle}>Today's Activity</Text>
        <View style={s.activitiesGrid}>
          {ACTIVITIES.map((a) => (
            <View key={a.label} style={[s.actCard, { borderLeftColor: a.color, borderLeftWidth: 4 }]}>
              <View style={[s.actIcon, { backgroundColor: `${a.color}22` }]}>
                <Ionicons name={a.icon as any} size={22} color={a.color} />
              </View>
              <Text style={s.actValue}>{a.value}</Text>
              <Text style={s.actLabel}>{a.label}</Text>
            </View>
          ))}
        </View>

        {/* Achievement */}
        <View style={s.achieveCard}>
          <LinearGradient
            colors={["#1e3a8a", "#0d9488"]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={s.achieveLeft}>
            <View style={s.achieveBadge}>
              <Ionicons name="trophy" size={28} color="#f59e0b" />
            </View>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.achieveTitle}>84% of your goal!</Text>
            <Text style={s.achieveSub}>1,600 more steps to hit your target today.</Text>
          </View>
          <Pressable
            onPress={() => navigation.navigate("FitnessDashboard")}
            style={s.achieveBtn}
          >
            <Text style={s.achieveBtnText}>Push it!</Text>
          </Pressable>
        </View>

        {/* Leaderboard */}
        <Text style={s.sectionTitle}>Leaderboard</Text>
        <View style={s.leaderCard}>
          {[
            { rank: 1, name: "Alex M.", steps: "12,450", you: false },
            { rank: 2, name: "You", steps: "8,400", you: true },
            { rank: 3, name: "Jamie R.", steps: "7,980", you: false },
          ].map((l) => (
            <View key={l.rank} style={[s.leaderRow, l.you && s.leaderRowActive]}>
              <Text style={[s.leaderRank, l.rank === 1 && { color: "#f59e0b" }]}>#{l.rank}</Text>
              <View style={[s.leaderAvatar, l.you && s.leaderAvatarActive]}>
                <Text style={s.leaderAvatarText}>{l.name[0]}</Text>
              </View>
              <Text style={[s.leaderName, l.you && s.leaderNameActive]}>{l.name}</Text>
              <Text style={s.leaderSteps}>{l.steps}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Nav */}
      <View style={s.navBar}>
        {NAV.map((n) => (
          <Pressable
            key={n.route}
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
  headerTitle: { fontSize: 22, fontWeight: "700", color: colors.primary },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface.containerHigh, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: colors.glass.border },
  scroll: { paddingHorizontal: 16 },
  hero: { borderRadius: 32, padding: 24, marginBottom: 24, alignItems: "center", minHeight: 300 },
  ringWrap: { alignItems: "center", marginBottom: 24 },
  ringOuter: { width: 180, height: 180, borderRadius: 90, backgroundColor: "rgba(255,255,255,0.15)", justifyContent: "center", alignItems: "center", borderWidth: 4, borderColor: "rgba(255,255,255,0.3)" },
  ringInner: { width: 150, height: 150, borderRadius: 75, backgroundColor: "rgba(0,0,0,0.25)", justifyContent: "center", alignItems: "center" },
  stepsValue: { fontSize: 36, fontWeight: "700", color: "white" },
  stepsLabel: { fontSize: 14, color: "rgba(255,255,255,0.8)" },
  stepsGoal: { fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 4 },
  progressArc: { width: 180, height: 8, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 4, marginTop: 12, overflow: "hidden" },
  progressFill: { height: 8, backgroundColor: "white", borderRadius: 4 },
  heroStatsRow: { flexDirection: "row", backgroundColor: "rgba(0,0,0,0.2)", borderRadius: 20, paddingVertical: 14, paddingHorizontal: 24, justifyContent: "space-around", width: "100%", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  heroStat: { alignItems: "center" },
  heroStatVal: { fontSize: 22, fontWeight: "700", color: "white" },
  heroStatLbl: { fontSize: 11, color: "rgba(255,255,255,0.7)" },
  heroStatDiv: { width: 1, backgroundColor: "rgba(255,255,255,0.2)" },
  sectionTitle: { fontSize: 22, fontWeight: "700", color: colors.text.primary, marginBottom: 14 },
  chartCard: { backgroundColor: colors.surface.containerHigh, borderRadius: 28, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: colors.glass.border },
  barChart: { flexDirection: "row", alignItems: "flex-end", height: 140, gap: 6, marginBottom: 12 },
  barWrap: { flex: 1, alignItems: "center", gap: 4 },
  barVal: { fontSize: 9, color: colors.text.secondary, fontWeight: "600" },
  bar: { width: "100%", borderRadius: 6, minHeight: 4 },
  barDay: { fontSize: 10, color: colors.text.secondary },
  barDayActive: { color: colors.primary, fontWeight: "700" },
  goalLine: { borderTopWidth: 1, borderTopColor: "rgba(37,99,235,0.3)", borderStyle: "dashed", paddingTop: 8 },
  goalLineText: { fontSize: 11, color: colors.primary },
  activitiesGrid: { flexDirection: "row", gap: 12, marginBottom: 24 },
  actCard: { flex: 1, backgroundColor: colors.surface.containerHigh, borderRadius: 20, padding: 14, gap: 8, borderWidth: 1, borderColor: colors.glass.border },
  actIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: "center", alignItems: "center" },
  actValue: { fontSize: 18, fontWeight: "700", color: colors.text.primary },
  actLabel: { fontSize: 11, color: colors.text.secondary },
  achieveCard: { borderRadius: 28, padding: 20, flexDirection: "row", alignItems: "center", gap: 16, marginBottom: 24, overflow: "hidden", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  achieveLeft: {},
  achieveBadge: { width: 52, height: 52, borderRadius: 26, backgroundColor: "rgba(245,158,11,0.2)", justifyContent: "center", alignItems: "center" },
  achieveTitle: { fontSize: 16, fontWeight: "700", color: "white" },
  achieveSub: { fontSize: 12, color: "rgba(255,255,255,0.75)", marginTop: 4 },
  achieveBtn: { backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 16, paddingHorizontal: 16, paddingVertical: 8, borderWidth: 1, borderColor: "rgba(255,255,255,0.2)" },
  achieveBtnText: { fontSize: 13, fontWeight: "700", color: "white" },
  leaderCard: { backgroundColor: colors.surface.containerHigh, borderRadius: 28, padding: 20, gap: 4, marginBottom: 8, borderWidth: 1, borderColor: colors.glass.border },
  leaderRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10, borderRadius: 16, paddingHorizontal: 4 },
  leaderRowActive: { backgroundColor: "rgba(180,197,255,0.1)" },
  leaderRank: { fontSize: 14, fontWeight: "700", color: colors.text.secondary, width: 28 },
  leaderAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surface.containerHighest, justifyContent: "center", alignItems: "center" },
  leaderAvatarActive: { backgroundColor: colors.primary },
  leaderAvatarText: { fontSize: 14, fontWeight: "700", color: "white" },
  leaderName: { flex: 1, fontSize: 14, color: colors.text.secondary },
  leaderNameActive: { color: colors.primary, fontWeight: "700" },
  leaderSteps: { fontSize: 14, fontWeight: "700", color: colors.text.primary },
  navBar: { position: "absolute", bottom: 0, left: 0, right: 0, height: 72, backgroundColor: colors.surface.container, borderTopWidth: 1, borderTopColor: colors.glass.border, flexDirection: "row", justifyContent: "space-around", alignItems: "center", paddingHorizontal: 8 },
  navBtn: { flex: 1, alignItems: "center", justifyContent: "center", gap: 4, paddingVertical: 8 },
  navLabel: { fontSize: 10, color: colors.text.secondary, fontWeight: "500" },
  navLabelActive: { color: colors.primary, fontWeight: "700" },
});
