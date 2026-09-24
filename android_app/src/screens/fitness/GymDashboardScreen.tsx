import React, { useState } from "react";
import { ScrollView, Text, View, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/types";
import { colors } from "@/theme/colors";

type Props = NativeStackScreenProps<RootStackParamList, "GymDashboard">;

const WORKOUTS = [
  { name: "Push Day", sub: "Chest · Triceps · Shoulders", sets: 5, reps: "8–12", icon: "barbell", bg: "#be185d" },
  { name: "Pull Day", sub: "Back · Biceps", sets: 4, reps: "10–15", icon: "fitness", bg: "#1d4ed8" },
  { name: "Leg Day", sub: "Quads · Hamstrings · Glutes", sets: 5, reps: "12–15", icon: "walk", bg: "#0f766e" },
];

const MUSCLES = [
  { label: "Chest", pct: 75, color: "#e11d48" },
  { label: "Back", pct: 60, color: "#2563eb" },
  { label: "Shoulders", pct: 50, color: "#7c3aed" },
  { label: "Arms", pct: 85, color: "#f59e0b" },
  { label: "Legs", pct: 40, color: "#0d9488" },
];

const EXERCISES = [
  { name: "Bench Press", sets: "4 × 10", weight: "80 kg", done: true },
  { name: "Incline Dumbbell", sets: "3 × 12", weight: "24 kg", done: true },
  { name: "Cable Flyes", sets: "3 × 15", weight: "15 kg", done: false },
  { name: "Tricep Pushdown", sets: "3 × 12", weight: "20 kg", done: false },
];

const NAV = [
  { icon: "home-outline", label: "Home", route: "HomeDashboard" },
  { icon: "heart-outline", label: "Health", route: "HealthDashboard" },
  { icon: "barbell", label: "Fitness", route: "FitnessDashboard", active: true },
  { icon: "person-outline", label: "Profile", route: "Profile" },
];

export default function GymDashboardScreen({ navigation }: Props) {
  const [activeWorkout, setActiveWorkout] = useState(0);

  return (
    <View style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} style={s.iconBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.text.secondary} />
        </Pressable>
        <Text style={s.headerTitle}>Gym</Text>
        <Pressable style={s.iconBtn}>
          <Ionicons name="options-outline" size={22} color={colors.text.secondary} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {/* Hero */}
        <LinearGradient
          colors={["#0f0f1a", "#1e1b4b", "#312e81"]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={s.hero}
        >
          <View style={s.heroBadge}>
            <Ionicons name="flash" size={14} color="#f59e0b" />
            <Text style={s.heroBadgeText}>ACTIVE SESSION</Text>
          </View>
          <Text style={s.heroTitle}>Push Day</Text>
          <Text style={s.heroSub}>Chest · Triceps · Shoulders</Text>
          <View style={s.heroStats}>
            <View style={s.heroStat}>
              <Text style={s.heroStatVal}>45</Text>
              <Text style={s.heroStatLbl}>min</Text>
            </View>
            <View style={s.heroStatDiv} />
            <View style={s.heroStat}>
              <Text style={s.heroStatVal}>320</Text>
              <Text style={s.heroStatLbl}>kcal</Text>
            </View>
            <View style={s.heroStatDiv} />
            <View style={s.heroStat}>
              <Text style={s.heroStatVal}>2/4</Text>
              <Text style={s.heroStatLbl}>done</Text>
            </View>
          </View>
          <Pressable
            onPress={() => navigation.navigate("FitnessDashboard")}
            style={s.heroBtn}
          >
            <Ionicons name="play" size={18} color={colors.onPrimary} />
            <Text style={s.heroBtnText}>Resume Session</Text>
          </Pressable>
        </LinearGradient>

        {/* Workout Plans */}
        <Text style={s.sectionTitle}>Workout Plans</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.plansRow} contentContainerStyle={{ gap: 12, paddingRight: 16 }}>
          {WORKOUTS.map((w, i) => (
            <Pressable
              key={w.name}
              onPress={() => setActiveWorkout(i)}
              style={[s.planCard, { backgroundColor: w.bg }, activeWorkout === i && s.planCardActive]}
            >
              <View style={s.planIcon}>
                <Ionicons name={w.icon as any} size={28} color="white" />
              </View>
              <Text style={s.planName}>{w.name}</Text>
              <Text style={s.planSub}>{w.sub}</Text>
              <View style={s.planMeta}>
                <Text style={s.planMetaText}>{w.sets} sets · {w.reps} reps</Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>

        {/* Muscle Groups */}
        <Text style={s.sectionTitle}>Muscle Focus</Text>
        <View style={s.muscleCard}>
          {MUSCLES.map((m) => (
            <View key={m.label} style={s.muscleRow}>
              <Text style={s.muscleLabel}>{m.label}</Text>
              <View style={s.muscleBarBg}>
                <LinearGradient
                  colors={[m.color, `${m.color}99`]}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={[s.muscleBarFill, { width: `${m.pct}%` }]}
                />
              </View>
              <Text style={[s.musclePct, { color: m.color }]}>{m.pct}%</Text>
            </View>
          ))}
        </View>

        {/* Exercise List */}
        <Text style={s.sectionTitle}>Today's Exercises</Text>
        <View style={s.exerciseList}>
          {EXERCISES.map((e) => (
            <View key={e.name} style={[s.exerciseRow, e.done && s.exerciseRowDone]}>
              <View style={[s.exerciseCheck, e.done && s.exerciseCheckDone]}>
                {e.done && <Ionicons name="checkmark" size={16} color="white" />}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.exerciseName, e.done && s.exerciseNameDone]}>{e.name}</Text>
                <Text style={s.exerciseMeta}>{e.sets} · {e.weight}</Text>
              </View>
              <Pressable style={s.exerciseBtn}>
                <Ionicons name="information-circle-outline" size={20} color={colors.text.secondary} />
              </Pressable>
            </View>
          ))}
        </View>

        {/* PB / Personal Best */}
        <LinearGradient
          colors={["#be185d", "#7c3aed"]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={s.pbCard}
        >
          <Ionicons name="trophy" size={32} color="#fbbf24" />
          <View style={{ flex: 1, marginLeft: 16 }}>
            <Text style={s.pbTitle}>New Personal Best!</Text>
            <Text style={s.pbSub}>Bench Press — 82.5 kg lifted today</Text>
          </View>
          <Ionicons name="share-outline" size={22} color="white" />
        </LinearGradient>

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
  root: { flex: 1, backgroundColor: "#0a0a12" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: 52, paddingBottom: 12 },
  headerTitle: { fontSize: 22, fontWeight: "700", color: colors.text.primary },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.07)", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  scroll: { paddingHorizontal: 16 },
  hero: { borderRadius: 32, padding: 24, marginBottom: 24, minHeight: 240, justifyContent: "flex-end", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  heroBadge: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(245,158,11,0.15)", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, alignSelf: "flex-start", marginBottom: 14, borderWidth: 1, borderColor: "rgba(245,158,11,0.3)" },
  heroBadgeText: { fontSize: 10, fontWeight: "700", color: "#f59e0b", letterSpacing: 0.5 },
  heroTitle: { fontSize: 40, fontWeight: "700", color: "white", marginBottom: 4 },
  heroSub: { fontSize: 15, color: "rgba(255,255,255,0.7)", marginBottom: 20 },
  heroStats: { flexDirection: "row", backgroundColor: "rgba(0,0,0,0.3)", borderRadius: 20, padding: 14, justifyContent: "space-around", marginBottom: 20, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  heroStat: { alignItems: "center" },
  heroStatVal: { fontSize: 22, fontWeight: "700", color: "white" },
  heroStatLbl: { fontSize: 11, color: "rgba(255,255,255,0.6)" },
  heroStatDiv: { width: 1, backgroundColor: "rgba(255,255,255,0.15)" },
  heroBtn: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: colors.primary, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 20, alignSelf: "flex-start" },
  heroBtnText: { fontSize: 15, fontWeight: "700", color: colors.onPrimary },
  sectionTitle: { fontSize: 22, fontWeight: "700", color: colors.text.primary, marginBottom: 14 },
  plansRow: { marginHorizontal: -16, paddingLeft: 16, marginBottom: 24 },
  planCard: { width: 180, borderRadius: 28, padding: 20, borderWidth: 1, borderColor: "rgba(255,255,255,0.15)" },
  planCardActive: { borderColor: "white", borderWidth: 2 },
  planIcon: { width: 52, height: 52, borderRadius: 26, backgroundColor: "rgba(255,255,255,0.2)", justifyContent: "center", alignItems: "center", marginBottom: 12 },
  planName: { fontSize: 18, fontWeight: "700", color: "white", marginBottom: 4 },
  planSub: { fontSize: 12, color: "rgba(255,255,255,0.7)", marginBottom: 12 },
  planMeta: { backgroundColor: "rgba(0,0,0,0.2)", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5, alignSelf: "flex-start" },
  planMetaText: { fontSize: 11, color: "rgba(255,255,255,0.8)" },
  muscleCard: { backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 28, padding: 20, marginBottom: 24, gap: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  muscleRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  muscleLabel: { width: 72, fontSize: 13, color: colors.text.secondary, fontWeight: "600" },
  muscleBarBg: { flex: 1, height: 8, backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 4, overflow: "hidden" },
  muscleBarFill: { height: 8, borderRadius: 4 },
  musclePct: { width: 36, fontSize: 13, fontWeight: "700", textAlign: "right" },
  exerciseList: { gap: 10, marginBottom: 20 },
  exerciseRow: { flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 20, padding: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  exerciseRowDone: { opacity: 0.6 },
  exerciseCheck: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: colors.text.muted, justifyContent: "center", alignItems: "center" },
  exerciseCheckDone: { backgroundColor: "#10b981", borderColor: "#10b981" },
  exerciseName: { fontSize: 15, fontWeight: "700", color: colors.text.primary },
  exerciseNameDone: { textDecorationLine: "line-through", color: colors.text.muted },
  exerciseMeta: { fontSize: 12, color: colors.text.secondary, marginTop: 2 },
  exerciseBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.06)", justifyContent: "center", alignItems: "center" },
  pbCard: { borderRadius: 28, padding: 20, flexDirection: "row", alignItems: "center", marginBottom: 8 },
  pbTitle: { fontSize: 16, fontWeight: "700", color: "white" },
  pbSub: { fontSize: 13, color: "rgba(255,255,255,0.8)", marginTop: 4 },
  navBar: { position: "absolute", bottom: 0, left: 0, right: 0, height: 72, backgroundColor: "#0d0d1a", borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.08)", flexDirection: "row", justifyContent: "space-around", alignItems: "center", paddingHorizontal: 8 },
  navBtn: { flex: 1, alignItems: "center", justifyContent: "center", gap: 4, paddingVertical: 8 },
  navLabel: { fontSize: 10, color: colors.text.secondary, fontWeight: "500" },
  navLabelActive: { color: colors.primary, fontWeight: "700" },
});
