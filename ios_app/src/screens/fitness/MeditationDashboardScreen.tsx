import React, { useState } from "react";
import { ScrollView, Text, View, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/types";
import { colors } from "@/theme/colors";

type Props = NativeStackScreenProps<RootStackParamList, "MeditationDashboard">;

const SESSIONS = [
  { name: "Morning Calm", duration: "10 min", type: "Breathing", icon: "leaf", bg: "#0f766e" },
  { name: "Stress Relief", duration: "15 min", type: "Guided", icon: "cloud", bg: "#4338ca" },
  { name: "Sleep Prep", duration: "20 min", type: "Body Scan", icon: "moon", bg: "#1e3a8a" },
  { name: "Focus Flow", duration: "12 min", type: "Mindfulness", icon: "sparkles", bg: "#7c3aed" },
];

const MOODS = [
  { emoji: "😌", label: "Calm" },
  { emoji: "😊", label: "Happy" },
  { emoji: "😔", label: "Sad" },
  { emoji: "😤", label: "Stressed" },
  { emoji: "😴", label: "Tired" },
];

const WEEK_MINS = [8, 15, 10, 20, 12, 18, 15];
const WEEK_DAYS = ["M", "T", "W", "T", "F", "S", "S"];

const NAV = [
  { icon: "headset", label: "Coach", route: "AICoach", active: false },
  { icon: "heart-outline", label: "Health", route: "HealthDashboard", active: true },
  { icon: "trophy-outline", label: "Challenges", route: "FitnessDashboard", active: false },
  { icon: "ribbon-outline", label: "Badges", route: "FitnessDashboard", active: false },
];

export default function MeditationDashboardScreen({ navigation }: Props) {
  const [activeMood, setActiveMood] = useState(0);
  const [activeSession, setActiveSession] = useState<number | null>(null);

  return (
    <View style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} style={s.iconBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.text.secondary} />
        </Pressable>
        <Text style={s.headerTitle}>Meditation</Text>
        <Pressable style={s.iconBtn}>
          <Ionicons name="notifications-outline" size={22} color={colors.text.secondary} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {/* Hero */}
        <LinearGradient
          colors={["#1e1b4b", "#3730a3", "#6d28d9"]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={s.hero}
        >
          <View style={s.heroTop}>
            <View style={s.heroTag}>
              <Ionicons name="leaf" size={14} color="#a5f3fc" />
              <Text style={s.heroTagText}>DAILY PRACTICE</Text>
            </View>
          </View>
          <Text style={s.heroTitle}>Find Your{"\n"}Inner Peace</Text>
          <Text style={s.heroSub}>98 day streak · 42h total meditation</Text>

          {/* Breathe circle */}
          <View style={s.breatheCircleOuter}>
            <View style={s.breatheCircleMiddle}>
              <View style={s.breatheCircleInner}>
                <Ionicons name="leaf" size={32} color="white" />
                <Text style={s.breatheText}>Breathe</Text>
              </View>
            </View>
          </View>

          <Pressable style={s.startBtn} onPress={() => navigation.navigate("AICoach")}>
            <Text style={s.startBtnText}>Start Session</Text>
            <Ionicons name="play" size={18} color={colors.primaryContainer} />
          </Pressable>
        </LinearGradient>

        {/* Mood Check-in */}
        <View style={s.moodCard}>
          <Text style={s.moodTitle}>How are you feeling?</Text>
          <View style={s.moodRow}>
            {MOODS.map((m, i) => (
              <Pressable
                key={m.label}
                onPress={() => setActiveMood(i)}
                style={[s.moodBtn, activeMood === i && s.moodBtnActive]}
              >
                <Text style={s.moodEmoji}>{m.emoji}</Text>
                <Text style={[s.moodLabel, activeMood === i && s.moodLabelActive]}>{m.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Sessions */}
        <Text style={s.sectionTitle}>Meditation Sessions</Text>
        <View style={s.sessionsGrid}>
          {SESSIONS.map((session, i) => (
            <Pressable
              key={session.name}
              onPress={() => setActiveSession(i)}
              style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1, width: "48%" }]}
            >
              <LinearGradient
                colors={[session.bg, `${session.bg}cc`]}
                style={[s.sessionCard, activeSession === i && s.sessionCardActive]}
              >
                <View style={s.sessionIcon}>
                  <Ionicons name={session.icon as any} size={26} color="white" />
                </View>
                <Text style={s.sessionName}>{session.name}</Text>
                <Text style={s.sessionType}>{session.type}</Text>
                <View style={s.sessionMeta}>
                  <Ionicons name="time-outline" size={12} color="rgba(255,255,255,0.75)" />
                  <Text style={s.sessionDuration}>{session.duration}</Text>
                </View>
                <Pressable style={s.sessionPlay}>
                  <Ionicons name="play" size={16} color={session.bg} />
                </Pressable>
              </LinearGradient>
            </Pressable>
          ))}
        </View>

        {/* Weekly chart */}
        <Text style={s.sectionTitle}>Weekly Mindfulness</Text>
        <View style={s.weekCard}>
          <View style={s.barChart}>
            {WEEK_MINS.map((m, i) => (
              <View key={i} style={s.barWrap}>
                <Text style={s.barVal}>{m}m</Text>
                <LinearGradient
                  colors={i === 6 ? [colors.secondary, colors.primary] : ["rgba(79,219,200,0.3)", "rgba(180,197,255,0.3)"]}
                  style={[s.bar, { height: (m / 20) * 80 }]}
                />
                <Text style={s.barDay}>{WEEK_DAYS[i]}</Text>
              </View>
            ))}
          </View>
          <View style={s.weekStats}>
            <View style={s.weekStat}>
              <Text style={s.weekStatVal}>98 min</Text>
              <Text style={s.weekStatLbl}>This week</Text>
            </View>
            <View style={s.weekStat}>
              <Text style={s.weekStatVal}>+12%</Text>
              <Text style={s.weekStatLbl}>vs last week</Text>
            </View>
          </View>
        </View>

        {/* Go to AI Coach */}
        <Pressable
          onPress={() => navigation.navigate("AICoach")}
          style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
        >
          <LinearGradient
            colors={["#4338ca", "#7c3aed"]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={s.ctaBtn}
          >
            <Ionicons name="headset" size={22} color="white" />
            <Text style={s.ctaText}>Get AI Meditation Coach</Text>
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
  root: { flex: 1, backgroundColor: "#0c0c1a" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: 52, paddingBottom: 12 },
  headerTitle: { fontSize: 22, fontWeight: "700", color: "#a78bfa" },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.07)", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  scroll: { paddingHorizontal: 16 },
  hero: { borderRadius: 32, padding: 24, marginBottom: 20, minHeight: 360, overflow: "hidden", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  heroTop: { marginBottom: 16 },
  heroTag: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(0,0,0,0.3)", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, alignSelf: "flex-start", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  heroTagText: { fontSize: 10, fontWeight: "700", color: "#a5f3fc", letterSpacing: 0.5 },
  heroTitle: { fontSize: 40, fontWeight: "700", color: "white", lineHeight: 48, marginBottom: 8 },
  heroSub: { fontSize: 14, color: "rgba(255,255,255,0.75)", marginBottom: 32 },
  breatheCircleOuter: { width: 140, height: 140, borderRadius: 70, backgroundColor: "rgba(255,255,255,0.08)", justifyContent: "center", alignItems: "center", alignSelf: "center", marginBottom: 28 },
  breatheCircleMiddle: { width: 110, height: 110, borderRadius: 55, backgroundColor: "rgba(255,255,255,0.12)", justifyContent: "center", alignItems: "center" },
  breatheCircleInner: { width: 82, height: 82, borderRadius: 41, backgroundColor: "rgba(255,255,255,0.2)", justifyContent: "center", alignItems: "center", gap: 4 },
  breatheText: { fontSize: 12, color: "white", fontWeight: "600" },
  startBtn: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "white", paddingHorizontal: 28, paddingVertical: 14, borderRadius: 20, alignSelf: "center" },
  startBtnText: { fontSize: 16, fontWeight: "700", color: "#3730a3" },
  moodCard: { backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 28, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  moodTitle: { fontSize: 16, fontWeight: "700", color: colors.text.primary, marginBottom: 16 },
  moodRow: { flexDirection: "row", justifyContent: "space-between" },
  moodBtn: { alignItems: "center", gap: 6, paddingHorizontal: 8, paddingVertical: 10, borderRadius: 16 },
  moodBtnActive: { backgroundColor: "rgba(167,139,250,0.2)", borderWidth: 1, borderColor: "rgba(167,139,250,0.4)" },
  moodEmoji: { fontSize: 28 },
  moodLabel: { fontSize: 11, color: colors.text.secondary },
  moodLabelActive: { color: "#a78bfa", fontWeight: "700" },
  sectionTitle: { fontSize: 22, fontWeight: "700", color: colors.text.primary, marginBottom: 14 },
  sessionsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 24 },
  sessionCard: { borderRadius: 28, padding: 18, borderWidth: 1, borderColor: "rgba(255,255,255,0.15)", gap: 6 },
  sessionCardActive: { borderColor: "white", borderWidth: 2 },
  sessionIcon: { width: 52, height: 52, borderRadius: 26, backgroundColor: "rgba(255,255,255,0.2)", justifyContent: "center", alignItems: "center", marginBottom: 4 },
  sessionName: { fontSize: 16, fontWeight: "700", color: "white" },
  sessionType: { fontSize: 12, color: "rgba(255,255,255,0.7)" },
  sessionMeta: { flexDirection: "row", alignItems: "center", gap: 4 },
  sessionDuration: { fontSize: 12, color: "rgba(255,255,255,0.75)" },
  sessionPlay: { width: 32, height: 32, borderRadius: 16, backgroundColor: "white", justifyContent: "center", alignItems: "center", alignSelf: "flex-end", marginTop: 4 },
  weekCard: { backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 28, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  barChart: { flexDirection: "row", alignItems: "flex-end", height: 110, gap: 8, marginBottom: 16 },
  barWrap: { flex: 1, alignItems: "center", gap: 4 },
  barVal: { fontSize: 9, color: colors.text.secondary },
  bar: { width: "100%", borderRadius: 6, minHeight: 4 },
  barDay: { fontSize: 10, color: colors.text.secondary },
  weekStats: { flexDirection: "row", justifyContent: "space-around" },
  weekStat: { alignItems: "center" },
  weekStatVal: { fontSize: 20, fontWeight: "700", color: colors.text.primary },
  weekStatLbl: { fontSize: 11, color: colors.text.secondary, marginTop: 2 },
  ctaBtn: { borderRadius: 32, paddingVertical: 18, paddingHorizontal: 24, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 12 },
  ctaText: { fontSize: 16, fontWeight: "700", color: "white", flex: 1, textAlign: "center" },
  navBar: { position: "absolute", bottom: 0, left: 0, right: 0, height: 72, backgroundColor: "#0d0d1a", borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.08)", flexDirection: "row", justifyContent: "space-around", alignItems: "center", paddingHorizontal: 8 },
  navBtn: { flex: 1, alignItems: "center", justifyContent: "center", gap: 4, paddingVertical: 8 },
  navLabel: { fontSize: 10, color: colors.text.secondary, fontWeight: "500" },
  navLabelActive: { color: colors.primary, fontWeight: "700" },
});
