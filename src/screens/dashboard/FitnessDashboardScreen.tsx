import React, { useEffect } from "react";
import { ScrollView, Text, View, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/types";
import { colors } from "@/theme/colors";
import SamsungBottomNav from "@/components/SamsungBottomNav";
import {
  scheduleInactivityAlert,
  sendStepGoalNotification,
} from "@/services/notificationService";

type Props = NativeStackScreenProps<RootStackParamList, "FitnessDashboard">;

const MODULES = [
  { label: "Steps", value: "8,400", icon: "walk", color: "#1e3a8a", route: "DailyStepsDashboard" },
  { label: "Calories", value: "540 kcal", icon: "flame", color: "#ea580c", route: "CaloriesDashboard" },
  { label: "Yoga", value: "20 min", icon: "body", color: "#059669", route: "YogaDashboard" },
  { label: "Gym", value: "45 min", icon: "barbell", color: "#be185d", route: "GymDashboard" },
  { label: "Meditation", value: "10 min", icon: "headset", color: "#4338ca", route: "MeditationDashboard" },
  { label: "Physio", value: "Session", icon: "accessibility", color: "#0d9488", route: "PhysiotherapyDashboard" },
];

// No NAV needed here anymore

// Current step data (in production comes from health sensors)
const CURRENT_STEPS = 8400;
const STEP_GOAL = 10000;

export default function FitnessDashboardScreen({ navigation }: Props) {

  useEffect(() => {
    // Schedule inactivity alert (fires if no activity for 60 mins)
    scheduleInactivityAlert(60);

    // Send step goal progress notification based on current steps
    sendStepGoalNotification(CURRENT_STEPS, STEP_GOAL);
  }, []);
  return (
    <View style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.pageTitle}>Fitness</Text>
          <Text style={s.pageSub}>Track your progress and stay active.</Text>
        </View>
        <Pressable style={s.iconBtn}>
          <Ionicons name="notifications-outline" size={20} color={colors.text.secondary} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {/* Hero */}
        <LinearGradient colors={["#10243B", "#04b4a240", "#2563eb60"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.hero}>
          <View style={s.heroTag}><Text style={s.heroTagText}>TODAY'S FOCUS</Text></View>
          <Text style={s.heroTitle}>Today's Fitness Goal</Text>
          <Text style={s.heroSub}>Keep moving toward a healthier lifestyle.</Text>
          <Pressable onPress={() => navigation.navigate("YogaDashboard")} style={s.heroBtn}>
            <Text style={s.heroBtnText}>Start Workout</Text>
            <Ionicons name="arrow-forward" size={16} color={colors.onPrimary} />
          </Pressable>
        </LinearGradient>

        {/* Progress Ring */}
        <View style={s.progressSection}>
          <View style={s.ringCard}>
            <View style={s.ring}>
              <Text style={s.ringValue}>72%</Text>
              <Text style={s.ringLabel}>Goal</Text>
            </View>
            <View style={s.ringStats}>
              <Text style={s.ringStatLabel}>Steps Today</Text>
              <Text style={s.ringStatValue}>8,400 / 10,000</Text>
              <View style={s.progressBar}>
                <View style={[s.progressFill, { width: "84%" }]} />
              </View>
              <Text style={[s.ringStatLabel, { marginTop: 12 }]}>Calories Burned</Text>
              <Text style={s.ringStatValue}>540 / 750 kcal</Text>
              <View style={s.progressBar}>
                <View style={[s.progressFill, { width: "72%", backgroundColor: "#ea580c" }]} />
              </View>
            </View>
          </View>
        </View>

        {/* Module Grid */}
        <Text style={s.sectionTitle}>Your Modules</Text>
        <View style={s.moduleGrid}>
          {MODULES.map((m) => (
            <Pressable key={m.label} onPress={() => navigation.navigate(m.route as any)} style={[s.moduleCard, { backgroundColor: m.color }]}>
              <Ionicons name={m.icon as any} size={28} color="white" />
              <Text style={s.moduleLabel}>{m.label}</Text>
              <Text style={s.moduleValue}>{m.value}</Text>
            </Pressable>
          ))}
        </View>

        {/* Weekly Summary */}
        <Text style={s.sectionTitle}>Weekly Activity</Text>
        <View style={s.weekCard}>
          <View style={s.weekBars}>
            {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => {
              const heights = [60, 85, 40, 95, 70, 50, 30];
              const isToday = i === 4;
              return (
                <View key={i} style={s.weekBarWrap}>
                  <View style={[s.weekBar, { height: heights[i], backgroundColor: isToday ? colors.primary : colors.surface.containerHighest }]}>
                    {isToday && <View style={s.weekBarGlow} />}
                  </View>
                  <Text style={[s.weekBarLabel, isToday && { color: colors.primary }]}>{d}</Text>
                </View>
              );
            })}
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Nav */}
      <SamsungBottomNav activeRoute="FitnessDashboard" />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#071827" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", paddingHorizontal: 16, paddingTop: 52, paddingBottom: 12 },
  pageTitle: { fontSize: 28, fontWeight: "700", color: colors.text.primary },
  pageSub: { fontSize: 14, color: colors.text.secondary, marginTop: 4 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface.containerHigh, borderWidth: 1, borderColor: colors.glass.border, justifyContent: "center", alignItems: "center" },
  scroll: { paddingHorizontal: 16 },
  hero: { borderRadius: 30, padding: 24, marginBottom: 20, minHeight: 220, borderWidth: 1, borderColor: colors.glass.border },
  heroTag: { backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4, alignSelf: "flex-start", marginBottom: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.2)" },
  heroTagText: { fontSize: 11, fontWeight: "700", color: "white" },
  heroTitle: { fontSize: 28, fontWeight: "700", color: "white", marginBottom: 8 },
  heroSub: { fontSize: 14, color: "rgba(255,255,255,0.8)", marginBottom: 20 },
  heroBtn: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: colors.primary, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 16, alignSelf: "flex-start" },
  heroBtnText: { color: colors.onPrimary, fontSize: 14, fontWeight: "700" },
  progressSection: { marginBottom: 20 },
  ringCard: { backgroundColor: colors.surface.container, borderRadius: 30, padding: 20, flexDirection: "row", gap: 16, borderWidth: 1, borderColor: colors.glass.border },
  ring: { width: 100, height: 100, borderRadius: 50, borderWidth: 8, borderColor: colors.primary, justifyContent: "center", alignItems: "center" },
  ringValue: { fontSize: 22, fontWeight: "700", color: colors.primary },
  ringLabel: { fontSize: 12, color: colors.text.secondary },
  ringStats: { flex: 1, justifyContent: "center" },
  ringStatLabel: { fontSize: 12, color: colors.text.secondary },
  ringStatValue: { fontSize: 14, fontWeight: "600", color: colors.text.primary, marginTop: 2, marginBottom: 6 },
  progressBar: { height: 6, backgroundColor: colors.surface.containerHighest, borderRadius: 3, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 3, backgroundColor: colors.primary },
  sectionTitle: { fontSize: 20, fontWeight: "700", color: colors.text.primary, marginBottom: 12 },
  moduleGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 24 },
  moduleCard: { width: "47%", borderRadius: 24, padding: 20, gap: 6, borderWidth: 1, borderColor: "rgba(255,255,255,0.15)" },
  moduleLabel: { fontSize: 14, fontWeight: "700", color: "white" },
  moduleValue: { fontSize: 12, color: "rgba(255,255,255,0.7)" },
  weekCard: { backgroundColor: colors.surface.container, borderRadius: 30, padding: 20, marginBottom: 8, borderWidth: 1, borderColor: colors.glass.border },
  weekBars: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", height: 120 },
  weekBarWrap: { alignItems: "center", gap: 8 },
  weekBar: { width: 28, borderRadius: 8, position: "relative", overflow: "hidden" },
  weekBarGlow: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(180,197,255,0.3)" },
  weekBarLabel: { fontSize: 12, color: colors.text.secondary, fontWeight: "600" },
});
