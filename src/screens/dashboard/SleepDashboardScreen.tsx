import React from "react";
import { ScrollView, Text, View, Pressable, StyleSheet, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/types";
import { colors } from "@/theme/colors";

type Props = NativeStackScreenProps<RootStackParamList, "SleepDashboard">;

const SLEEP_STAGES = [
  { label: "Awake", color: "#facc15", heights: [100, 0, 0, 0, 100, 0, 0] },
];

const STAGE_BARS = [
  { h: "100%", color: "#facc15" },
  { h: "50%",  color: "#c084fc" },
  { h: "25%",  color: "#818cf8" },
  { h: "75%",  color: "#a78bfa" },
  { h: "25%",  color: "#818cf8" },
  { h: "100%", color: "#facc15" },
  { h: "75%",  color: "#a78bfa" },
];

const WIND_DOWN = [
  { label: "Meditation", icon: "body", bg: "#064e3b", route: "MeditationDashboard" },
  { label: "Music", icon: "musical-notes", bg: "#1e3a8a" },
  { label: "Stories", icon: "book", bg: "#7f1d1d" },
  { label: "Breathing", icon: "aperture", bg: "#7c2d12" },
];

export default function SleepDashboardScreen({ navigation }: Props) {
  return (
    <View style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <Ionicons name="moon" size={22} color={colors.primary} />
        <Text style={s.pageTitle}>Sleep Dashboard</Text>
        <View style={s.avatar}>
          <Ionicons name="person" size={16} color={colors.text.secondary} />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {/* Hero */}
        <LinearGradient colors={["rgba(131,67,244,0.3)", "rgba(37,99,235,0.1)"]} style={s.hero}>
          <Text style={s.heroTitle}>Sleep Better Tonight</Text>
          <Text style={s.heroSub}>Your personal sleep sanctuary is ready. Relax, unwind, and let's get you ready for a restful night.</Text>
        </LinearGradient>

        {/* Score + Timeline Row */}
        <View style={s.scoreRow}>
          {/* Sleep Score */}
          <View style={s.scoreCard}>
            <Text style={s.scoreCardTitle}>Sleep Score</Text>
            <View style={s.ringWrap}>
              <View style={s.ring}>
                <Text style={s.ringScore}>85</Text>
                <Text style={s.ringQuality}>Excellent</Text>
              </View>
            </View>
            <View style={s.scoreBottom}>
              <View>
                <Text style={s.scoreMetaLabel}>Hours Slept</Text>
                <Text style={s.scoreMetaValue}>7h 42m</Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={s.scoreMetaLabel}>Quality</Text>
                <Text style={[s.scoreMetaValue, { color: colors.secondary }]}>Excellent</Text>
              </View>
            </View>
          </View>

          {/* Sleep Stages */}
          <View style={s.stagesCard}>
            <Text style={s.stagesTitle}>Sleep Stages</Text>
            <Text style={s.stagesSub}>Detailed cycles from last night.</Text>
            <View style={s.chart}>
              {STAGE_BARS.map((b, i) => (
                <View key={i} style={[s.bar, { backgroundColor: b.color, height: `${parseInt(b.h)}%` as any }]} />
              ))}
            </View>
            <View style={s.chartAxis}>
              <Text style={s.axisLabel}>11:00 PM</Text>
              <Text style={s.axisLabel}>3:00 AM</Text>
              <Text style={s.axisLabel}>6:45 AM</Text>
            </View>
            <View style={s.legend}>
              {[["#facc15","Awake"],["#c084fc","REM"],["#a78bfa","Light"],["#818cf8","Deep"]].map(([c,l]) => (
                <View key={l} style={s.legendItem}>
                  <View style={[s.legendDot, { backgroundColor: c }]} />
                  <Text style={s.legendText}>{l}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Wind Down */}
        <Text style={s.sectionTitle}>Wind Down</Text>
        <View style={s.windGrid}>
          {WIND_DOWN.map((w) => (
            <Pressable
              key={w.label}
              onPress={() => w.route ? navigation.navigate(w.route as any) : Alert.alert(w.label, `Opening ${w.label}...`)}
              style={[s.windCard, { backgroundColor: w.bg }]}
            >
              <View style={s.windIcon}>
                <Ionicons name={w.icon as any} size={24} color="white" />
              </View>
              <Text style={s.windLabel}>{w.label}</Text>
            </Pressable>
          ))}
        </View>

        {/* Smart Insights */}
        <Text style={s.sectionTitle}>Smart Insights</Text>
        <View style={s.insightsBox}>
          {[
            { icon: "alarm", label: "Smart Alarm: Wake up at 7:15 AM for optimal energy.", bg: "#312e81" },
            { icon: "moon", label: "Wind Down: Start meditation at 10:30 PM.", bg: "#4c1d95" },
          ].map((tip) => (
            <View key={tip.icon} style={[s.tipRow, { backgroundColor: tip.bg }]}>
              <View style={s.tipIcon}>
                <Ionicons name={tip.icon as any} size={20} color="white" />
              </View>
              <Text style={s.tipText}>{tip.label}</Text>
            </View>
          ))}
        </View>

        {/* Alarm */}
        <View style={s.alarmCard}>
          <View>
            <Text style={s.alarmTime}>07:15 <Text style={s.alarmAmPm}>AM</Text></Text>
            <View style={s.alarmMeta}>
              <Ionicons name="sparkles" size={12} color={colors.primary} />
              <Text style={s.alarmMetaText}>Smart Alarm • Tomorrow</Text>
            </View>
          </View>
          <View style={s.toggleWrap}>
            <View style={s.toggleTrack}>
              <View style={s.toggleThumb} />
            </View>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface.dim },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingTop: 52, paddingBottom: 16, gap: 12 },
  pageTitle: { flex: 1, fontSize: 20, fontWeight: "700", color: colors.primary },
  avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.surface.containerHighest, borderWidth: 1, borderColor: colors.glass.border, justifyContent: "center", alignItems: "center" },
  scroll: { paddingHorizontal: 16 },
  hero: { borderRadius: 30, padding: 24, marginBottom: 20, minHeight: 200, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: colors.glass.border },
  heroTitle: { fontSize: 28, fontWeight: "700", color: colors.onPrimaryContainer, textAlign: "center", marginBottom: 12 },
  heroSub: { fontSize: 14, color: colors.text.secondary, textAlign: "center", lineHeight: 22 },
  scoreRow: { flexDirection: "row", gap: 12, marginBottom: 20 },
  scoreCard: { flex: 1, backgroundColor: "#18344F", borderRadius: 30, padding: 16, borderWidth: 1, borderColor: colors.glass.border, alignItems: "center" },
  scoreCardTitle: { fontSize: 16, fontWeight: "700", color: colors.text.primary, alignSelf: "flex-start", marginBottom: 16 },
  ringWrap: { width: 120, height: 120, marginBottom: 16 },
  ring: { width: 120, height: 120, borderRadius: 60, borderWidth: 8, borderColor: colors.primary, justifyContent: "center", alignItems: "center" },
  ringScore: { fontSize: 32, fontWeight: "700", color: colors.primary },
  ringQuality: { fontSize: 11, fontWeight: "700", color: colors.text.secondary, letterSpacing: 1 },
  scoreBottom: { flexDirection: "row", justifyContent: "space-between", width: "100%", borderTopWidth: 1, borderTopColor: colors.glass.border, paddingTop: 12 },
  scoreMetaLabel: { fontSize: 11, color: colors.text.secondary },
  scoreMetaValue: { fontSize: 16, fontWeight: "600", color: colors.text.primary, marginTop: 4 },
  stagesCard: { flex: 1.3, backgroundColor: "#18344F", borderRadius: 30, padding: 16, borderWidth: 1, borderColor: colors.glass.border },
  stagesTitle: { fontSize: 16, fontWeight: "700", color: colors.text.primary, marginBottom: 4 },
  stagesSub: { fontSize: 11, color: colors.text.secondary, marginBottom: 12 },
  chart: { flexDirection: "row", alignItems: "flex-end", height: 80, gap: 4, borderBottomWidth: 1, borderBottomColor: colors.glass.border, paddingBottom: 4, marginBottom: 8 },
  bar: { flex: 1, borderRadius: 4, minHeight: 4 },
  chartAxis: { flexDirection: "row", justifyContent: "space-between" },
  axisLabel: { fontSize: 9, color: colors.text.secondary },
  legend: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 8 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 10, color: colors.text.secondary },
  sectionTitle: { fontSize: 20, fontWeight: "700", color: colors.text.primary, marginBottom: 12 },
  windGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 24 },
  windCard: { width: "47%", borderRadius: 16, padding: 16, alignItems: "center", gap: 8, borderWidth: 1, borderColor: "rgba(255,255,255,0.05)" },
  windIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: "rgba(255,255,255,0.1)", justifyContent: "center", alignItems: "center" },
  windLabel: { fontSize: 14, color: "white", fontWeight: "600" },
  insightsBox: { gap: 8, marginBottom: 20 },
  tipRow: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 16, padding: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.05)" },
  tipIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.1)", justifyContent: "center", alignItems: "center" },
  tipText: { flex: 1, fontSize: 13, color: "white", lineHeight: 20 },
  alarmCard: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: colors.surface.container, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: colors.glass.border, marginBottom: 8 },
  alarmTime: { fontSize: 32, fontWeight: "700", color: colors.text.primary },
  alarmAmPm: { fontSize: 16, color: colors.text.secondary },
  alarmMeta: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  alarmMetaText: { fontSize: 12, color: colors.text.secondary },
  toggleWrap: {},
  toggleTrack: { width: 48, height: 24, borderRadius: 12, backgroundColor: colors.primary, justifyContent: "center", paddingHorizontal: 2 },
  toggleThumb: { width: 20, height: 20, borderRadius: 10, backgroundColor: colors.primaryFixed, alignSelf: "flex-end" },
});
