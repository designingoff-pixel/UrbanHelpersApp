import React, { useState } from "react";
import { ScrollView, Text, View, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/types";
import { colors } from "@/theme/colors";

type Props = NativeStackScreenProps<RootStackParamList, "PersonalHygiene">;

const HYGIENE_CARDS = [
  { title: "Brush Teeth", sub: "2 minutes twice a day", icon: "medical", tag: "Morning / Night", bg: ["#4361EE", "#3A0CA3"] as (string[]) },
  { title: "Hand Wash", sub: "Regular hand hygiene prevents the spread of germs.", icon: "water", bg: ["#4CC9F0", "#4895EF"] as (string[]) },
];

const ROUTINE_TASKS = [
  { label: "Morning Shower", icon: "water", done: true },
  { label: "Skincare Routine", icon: "happy", done: false },
  { label: "Use Sanitizer", icon: "shield-checkmark", done: true },
  { label: "Hair Care", icon: "cut", done: false },
];

const NAV = [
  { icon: "heart", label: "Health", route: "HealthDashboard", active: true },
  { icon: "time-outline", label: "History", route: "MedicineHistory" },
  { icon: "alarm-outline", label: "Alarm", route: "MedicineAlarm" },
  { icon: "notifications-outline", label: "Reminders", route: "SmartReminders" },
  { icon: "person-outline", label: "Profile", route: "Profile" },
];

export default function PersonalHygieneScreen({ navigation }: Props) {
  const [tasks, setTasks] = useState(ROUTINE_TASKS);
  const doneCount = tasks.filter((t) => t.done).length;
  const score = Math.round((doneCount / tasks.length) * 100);

  const toggleTask = (i: number) => {
    setTasks((prev) => prev.map((t, idx) => idx === i ? { ...t, done: !t.done } : t));
  };

  return (
    <View style={s.root}>
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
          colors={["#4CC9F0", "#4895EF", "#4361EE"]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={s.hero}
        >
          <View style={s.heroTag}>
            <Ionicons name="water-outline" size={14} color="white" />
            <Text style={s.heroTagText}>DAILY WELLNESS</Text>
          </View>
          <Text style={s.heroTitle}>Personal Hygiene</Text>
          <Text style={s.heroSub}>Maintain healthy daily habits.</Text>
        </LinearGradient>

        {/* Hygiene Cards */}
        <View style={s.hygienePair}>
          {HYGIENE_CARDS.map((c) => (
            <LinearGradient
              key={c.title}
              colors={c.bg}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={s.hygieneCard}
            >
              <View style={s.hygieneIconWrap}>
                <Ionicons name={c.icon as any} size={26} color="white" />
              </View>
              {c.tag && (
                <View style={s.hygieneTag}><Text style={s.hygieneTagText}>{c.tag}</Text></View>
              )}
              <Text style={s.hygieneTitle}>{c.title}</Text>
              <Text style={s.hygieneSub}>{c.sub}</Text>
            </LinearGradient>
          ))}
        </View>

        {/* Daily Routine Tracker + Hygiene Score */}
        <View style={s.twoCol}>
          {/* Tracker */}
          <View style={s.trackerCard}>
            <View style={s.trackerHeader}>
              <Text style={s.cardTitle}>Daily Routine</Text>
              <Ionicons name="checkmark-done-outline" size={20} color={colors.text.secondary} />
            </View>
            {tasks.map((t, i) => (
              <Pressable
                key={t.label}
                onPress={() => toggleTask(i)}
                style={s.taskRow}
              >
                <View style={s.taskIcon}>
                  <Ionicons name={t.icon as any} size={18} color="white" />
                </View>
                <Text style={s.taskLabel}>{t.label}</Text>
                <View style={[s.taskCheck, t.done && s.taskCheckDone]}>
                  {t.done && <View style={s.taskCheckDot} />}
                </View>
              </Pressable>
            ))}
          </View>

          {/* Score */}
          <View style={s.scoreCard}>
            <Text style={s.cardTitle}>Weekly Score</Text>
            <View style={s.scoreRing}>
              <Text style={s.scoreValue}>{score}</Text>
              <Text style={s.scoreMax}>/ 100</Text>
            </View>
            <Text style={s.scoreSub}>
              {score >= 75 ? "Great job! Keep it up." : "Stay consistent!"}
            </Text>
          </View>
        </View>

        {/* Tips */}
        <Text style={s.sectionTitle}>Hygiene Tips</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.tipsRow} contentContainerStyle={{ gap: 12, paddingRight: 16 }}>
          {[
            { tag: "HYDRATION", tip: "Drink water before meals", sub: "Aids digestion and helps control portion sizes.", bg: ["#fa709a", "#fee140"] as (string[]) },
            { tag: "SLEEP", tip: "7-8 hours is optimal", sub: "Quality sleep repairs the body and mind.", bg: ["#FF6B6B", "#FF8E53"] as (string[]) },
            { tag: "MOVEMENT", tip: "Take short walks", sub: "Break up sedentary time every hour.", bg: ["#43e97b", "#38f9d7"] as (string[]) },
          ].map((tip) => (
            <LinearGradient key={tip.tip} colors={tip.bg} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.tipCard}>
              <View style={s.tipTag}><Text style={s.tipTagText}>{tip.tag}</Text></View>
              <Text style={s.tipTitle}>{tip.tip}</Text>
              <Text style={s.tipSub}>{tip.sub}</Text>
            </LinearGradient>
          ))}
        </ScrollView>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Nav */}
      <View style={s.navBar}>
        {NAV.map((n) => (
          <Pressable key={n.label} onPress={() => navigation.navigate(n.route as any)} style={s.navBtn}>
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
  hero: { borderRadius: 32, padding: 28, marginBottom: 20, minHeight: 200 },
  heroTag: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, alignSelf: "flex-start", marginBottom: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.3)" },
  heroTagText: { fontSize: 10, fontWeight: "700", color: "white", letterSpacing: 0.5 },
  heroTitle: { fontSize: 40, fontWeight: "700", color: "white", marginBottom: 8 },
  heroSub: { fontSize: 18, color: "rgba(255,255,255,0.9)" },
  hygienePair: { flexDirection: "row", gap: 12, marginBottom: 20 },
  hygieneCard: { flex: 1, borderRadius: 28, padding: 18, minHeight: 180, justifyContent: "flex-end", borderWidth: 1, borderColor: "rgba(255,255,255,0.15)" },
  hygieneIconWrap: { width: 52, height: 52, borderRadius: 26, backgroundColor: "rgba(255,255,255,0.2)", justifyContent: "center", alignItems: "center", marginBottom: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.3)" },
  hygieneTag: { backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, alignSelf: "flex-start", marginBottom: 8 },
  hygieneTagText: { fontSize: 10, fontWeight: "700", color: "white" },
  hygieneTitle: { fontSize: 18, fontWeight: "700", color: "white", marginBottom: 4 },
  hygieneSub: { fontSize: 12, color: "rgba(255,255,255,0.8)" },
  twoCol: { flexDirection: "row", gap: 12, marginBottom: 20 },
  trackerCard: { flex: 1.2, backgroundColor: "#4361EE", borderRadius: 30, padding: 16 },
  cardTitle: { fontSize: 16, fontWeight: "700", color: "white", marginBottom: 14 },
  trackerHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  taskRow: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 16, padding: 10, marginBottom: 8, borderWidth: 1, borderColor: "rgba(255,255,255,0.2)" },
  taskIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.2)", justifyContent: "center", alignItems: "center" },
  taskLabel: { flex: 1, fontSize: 14, color: "white" },
  taskCheck: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: "rgba(255,255,255,0.5)", justifyContent: "center", alignItems: "center" },
  taskCheckDone: { borderColor: "white" },
  taskCheckDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "white" },
  scoreCard: { flex: 1, backgroundColor: "#3A0CA3", borderRadius: 30, padding: 16, alignItems: "center", justifyContent: "center" },
  scoreRing: { width: 110, height: 110, borderRadius: 55, borderWidth: 8, borderColor: "#4CC9F0", justifyContent: "center", alignItems: "center", marginBottom: 12, shadowColor: "#4CC9F0", shadowOpacity: 0.4, shadowRadius: 12, elevation: 5 },
  scoreValue: { fontSize: 32, fontWeight: "700", color: "white" },
  scoreMax: { fontSize: 12, color: "rgba(255,255,255,0.7)" },
  scoreSub: { fontSize: 12, color: "rgba(255,255,255,0.8)", textAlign: "center" },
  sectionTitle: { fontSize: 20, fontWeight: "700", color: colors.text.primary, marginBottom: 14 },
  tipsRow: { marginHorizontal: -16, paddingLeft: 16, marginBottom: 8 },
  tipCard: { width: 240, borderRadius: 28, padding: 20, minHeight: 160 },
  tipTag: { backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4, alignSelf: "flex-start", marginBottom: 12 },
  tipTagText: { fontSize: 10, fontWeight: "700", color: "white", letterSpacing: 0.5 },
  tipTitle: { fontSize: 18, fontWeight: "700", color: "white", marginBottom: 6 },
  tipSub: { fontSize: 13, color: "rgba(255,255,255,0.85)", lineHeight: 20 },
  navBar: { position: "absolute", bottom: 0, left: 0, right: 0, height: 72, backgroundColor: colors.surface.container, borderTopWidth: 1, borderTopColor: colors.glass.border, flexDirection: "row", justifyContent: "space-around", alignItems: "center", paddingHorizontal: 8 },
  navBtn: { flex: 1, alignItems: "center", justifyContent: "center", gap: 4, paddingVertical: 8 },
  navLabel: { fontSize: 10, color: colors.text.secondary, fontWeight: "500" },
  navLabelActive: { color: colors.primary, fontWeight: "700" },
});
