import React, { useState } from "react";
import { ScrollView, Text, View, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/types";
import { colors } from "@/theme/colors";

type Props = NativeStackScreenProps<RootStackParamList, "PhysiotherapyDashboard">;

const EXERCISES = [
  { name: "Knee Flexion", reps: "3 × 15", icon: "accessibility", color: "#2563eb", done: true },
  { name: "Hip Abduction", reps: "3 × 12", icon: "body", color: "#10b981", done: true },
  { name: "Calf Raises", reps: "4 × 20", icon: "walk", color: "#7c3aed", done: false },
  { name: "Balance Board", reps: "5 min", icon: "fitness", color: "#f59e0b", done: false },
];

const PROGRESS = [
  { label: "Mobility", value: 72, color: "#2563eb" },
  { label: "Strength", value: 58, color: "#10b981" },
  { label: "Balance", value: 85, color: "#f59e0b" },
  { label: "Flexibility", value: 64, color: "#e11d48" },
];

const APPOINTMENTS = [
  { doctor: "Dr. Priya Sharma", role: "Senior Physiotherapist", date: "Oct 18", time: "10:30 AM", location: "City Rehab Center" },
  { doctor: "Dr. Arun Mehta", role: "Sports Therapist", date: "Oct 25", time: "2:00 PM", location: "Metro Physiotherapy" },
];

const NAV = [
  { icon: "home-outline", label: "Home", route: "HomeDashboard", active: false },
  { icon: "pulse-outline", label: "Activity", route: "FitnessDashboard", active: true },
  { icon: "person-outline", label: "Profile", route: "Profile", active: false },
];

export default function PhysiotherapyDashboardScreen({ navigation }: Props) {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <View style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} style={s.iconBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.text.secondary} />
        </Pressable>
        <Text style={s.headerTitle}>Physiotherapy</Text>
        <Pressable style={s.iconBtn}>
          <Ionicons name="calendar-outline" size={22} color={colors.text.secondary} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {/* Hero */}
        <LinearGradient
          colors={["#0c4a6e", "#0369a1", "#0e7490"]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={s.hero}
        >
          <View style={s.heroTag}>
            <Ionicons name="shield-checkmark" size={14} color="#7dd3fc" />
            <Text style={s.heroTagText}>RECOVERY PROGRAM</Text>
          </View>
          <Text style={s.heroTitle}>Your Recovery{"\n"}Journey</Text>
          <Text style={s.heroSub}>Personalised rehab exercises guided by your physiotherapist.</Text>
          <View style={s.heroProgress}>
            <View style={s.heroProgressLeft}>
              <Text style={s.heroProgressLabel}>Overall Progress</Text>
              <Text style={s.heroProgressValue}>68%</Text>
            </View>
            <View style={s.heroProgressBarWrap}>
              <View style={s.heroProgressBarBg}>
                <View style={[s.heroProgressBarFill, { width: "68%" }]} />
              </View>
              <Text style={s.heroProgressSub}>Week 6 of 12</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Quick Stats */}
        <View style={s.statsRow}>
          {[
            { icon: "checkmark-circle", label: "Exercises Done", value: "2/4", color: "#10b981" },
            { icon: "time", label: "Session Time", value: "28 min", color: "#2563eb" },
            { icon: "trending-up", label: "Pain Level", value: "2/10", color: "#f59e0b" },
          ].map((st) => (
            <View key={st.label} style={s.statCard}>
              <View style={[s.statIcon, { backgroundColor: `${st.color}22` }]}>
                <Ionicons name={st.icon as any} size={20} color={st.color} />
              </View>
              <Text style={s.statValue}>{st.value}</Text>
              <Text style={s.statLabel}>{st.label}</Text>
            </View>
          ))}
        </View>

        {/* Today's Exercises */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Today's Exercises</Text>
          <View style={s.tabRow}>
            {["All", "Done", "Pending"].map((t, i) => (
              <Pressable
                key={t}
                onPress={() => setActiveTab(i)}
                style={[s.tab, activeTab === i && s.tabActive]}
              >
                <Text style={[s.tabText, activeTab === i && s.tabTextActive]}>{t}</Text>
              </Pressable>
            ))}
          </View>
        </View>
        <View style={s.exerciseList}>
          {EXERCISES.filter(e => activeTab === 0 || (activeTab === 1 && e.done) || (activeTab === 2 && !e.done)).map((e) => (
            <View key={e.name} style={[s.exerciseRow, e.done && s.exerciseRowDone]}>
              <View style={[s.exerciseIcon, { backgroundColor: `${e.color}22` }]}>
                <Ionicons name={e.icon as any} size={22} color={e.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.exerciseName, e.done && s.exerciseNameDone]}>{e.name}</Text>
                <Text style={s.exerciseReps}>{e.reps}</Text>
              </View>
              <View style={[s.exerciseStatus, e.done ? s.exerciseStatusDone : s.exerciseStatusPending]}>
                <Ionicons
                  name={e.done ? "checkmark" : "play"}
                  size={16}
                  color={e.done ? "#10b981" : colors.primary}
                />
              </View>
            </View>
          ))}
        </View>

        {/* Recovery Metrics */}
        <Text style={s.sectionTitle}>Recovery Metrics</Text>
        <View style={s.metricsCard}>
          {PROGRESS.map((p) => (
            <View key={p.label} style={s.metricRow}>
              <Text style={s.metricLabel}>{p.label}</Text>
              <View style={s.metricBarBg}>
                <LinearGradient
                  colors={[p.color, `${p.color}88`]}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={[s.metricBarFill, { width: `${p.value}%` }]}
                />
              </View>
              <Text style={[s.metricPct, { color: p.color }]}>{p.value}%</Text>
            </View>
          ))}
        </View>

        {/* Appointments */}
        <Text style={s.sectionTitle}>Upcoming Appointments</Text>
        <View style={s.appointmentList}>
          {APPOINTMENTS.map((a, i) => (
            <LinearGradient
              key={a.doctor}
              colors={i === 0 ? ["#0c4a6e", "#0369a1"] : ["#1e1b4b", "#3730a3"]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={s.appointmentCard}
            >
              <View style={s.appointmentTop}>
                <View style={s.doctorAvatar}>
                  <Text style={s.doctorAvatarText}>{a.doctor.split(" ")[1][0]}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.doctorName}>{a.doctor}</Text>
                  <Text style={s.doctorRole}>{a.role}</Text>
                </View>
                <View style={s.dateBadge}>
                  <Text style={s.dateBadgeText}>{a.date}</Text>
                </View>
              </View>
              <View style={s.appointmentDetails}>
                <View style={s.appointmentDetail}>
                  <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.7)" />
                  <Text style={s.appointmentDetailText}>{a.time}</Text>
                </View>
                <View style={s.appointmentDetail}>
                  <Ionicons name="location-outline" size={14} color="rgba(255,255,255,0.7)" />
                  <Text style={s.appointmentDetailText}>{a.location}</Text>
                </View>
              </View>
              <View style={s.appointmentActions}>
                <Pressable style={s.confirmBtn}>
                  <Text style={s.confirmBtnText}>Confirm</Text>
                </Pressable>
                <Pressable style={s.rescheduleBtn}>
                  <Text style={s.rescheduleBtnText}>Reschedule</Text>
                </Pressable>
              </View>
            </LinearGradient>
          ))}
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
  headerTitle: { fontSize: 22, fontWeight: "700", color: "#38bdf8" },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface.containerHigh, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: colors.glass.border },
  scroll: { paddingHorizontal: 16 },
  hero: { borderRadius: 32, padding: 24, marginBottom: 20, minHeight: 260, justifyContent: "flex-end", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", overflow: "hidden" },
  heroTag: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(0,0,0,0.3)", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, alignSelf: "flex-start", marginBottom: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  heroTagText: { fontSize: 10, fontWeight: "700", color: "#7dd3fc", letterSpacing: 0.5 },
  heroTitle: { fontSize: 36, fontWeight: "700", color: "white", lineHeight: 44, marginBottom: 8 },
  heroSub: { fontSize: 14, color: "rgba(255,255,255,0.8)", marginBottom: 20, lineHeight: 22 },
  heroProgress: { backgroundColor: "rgba(0,0,0,0.25)", borderRadius: 20, padding: 16, flexDirection: "row", gap: 16, alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  heroProgressLeft: {},
  heroProgressLabel: { fontSize: 11, color: "rgba(255,255,255,0.7)", marginBottom: 4 },
  heroProgressValue: { fontSize: 28, fontWeight: "700", color: "white" },
  heroProgressBarWrap: { flex: 1 },
  heroProgressBarBg: { height: 8, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 4, overflow: "hidden", marginBottom: 6 },
  heroProgressBarFill: { height: 8, backgroundColor: "#38bdf8", borderRadius: 4 },
  heroProgressSub: { fontSize: 11, color: "rgba(255,255,255,0.7)" },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 24 },
  statCard: { flex: 1, backgroundColor: colors.surface.containerHigh, borderRadius: 20, padding: 14, alignItems: "center", gap: 6, borderWidth: 1, borderColor: colors.glass.border },
  statIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: "center", alignItems: "center" },
  statValue: { fontSize: 16, fontWeight: "700", color: colors.text.primary },
  statLabel: { fontSize: 10, color: colors.text.secondary, textAlign: "center" },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  sectionTitle: { fontSize: 20, fontWeight: "700", color: colors.text.primary, marginBottom: 14 },
  tabRow: { flexDirection: "row", gap: 6 },
  tab: { backgroundColor: colors.surface.containerHighest, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  tabActive: { backgroundColor: colors.primary },
  tabText: { fontSize: 11, color: colors.text.secondary },
  tabTextActive: { color: colors.onPrimary, fontWeight: "700" },
  exerciseList: { gap: 10, marginBottom: 24 },
  exerciseRow: { flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: colors.surface.containerHigh, borderRadius: 20, padding: 14, borderWidth: 1, borderColor: colors.glass.border },
  exerciseRowDone: { opacity: 0.65 },
  exerciseIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: "center", alignItems: "center" },
  exerciseName: { fontSize: 15, fontWeight: "700", color: colors.text.primary },
  exerciseNameDone: { textDecorationLine: "line-through", color: colors.text.muted },
  exerciseReps: { fontSize: 12, color: colors.text.secondary, marginTop: 2 },
  exerciseStatus: { width: 36, height: 36, borderRadius: 18, justifyContent: "center", alignItems: "center" },
  exerciseStatusDone: { backgroundColor: "rgba(16,185,129,0.15)" },
  exerciseStatusPending: { backgroundColor: "rgba(180,197,255,0.1)" },
  metricsCard: { backgroundColor: colors.surface.containerHigh, borderRadius: 28, padding: 20, marginBottom: 24, gap: 14, borderWidth: 1, borderColor: colors.glass.border },
  metricRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  metricLabel: { width: 80, fontSize: 13, color: colors.text.secondary, fontWeight: "600" },
  metricBarBg: { flex: 1, height: 8, backgroundColor: colors.surface.containerHighest, borderRadius: 4, overflow: "hidden" },
  metricBarFill: { height: 8, borderRadius: 4 },
  metricPct: { width: 36, fontSize: 13, fontWeight: "700", textAlign: "right" },
  appointmentList: { gap: 14, marginBottom: 8 },
  appointmentCard: { borderRadius: 28, padding: 20, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  appointmentTop: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 14 },
  doctorAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: "rgba(255,255,255,0.2)", justifyContent: "center", alignItems: "center" },
  doctorAvatarText: { fontSize: 20, fontWeight: "700", color: "white" },
  doctorName: { fontSize: 16, fontWeight: "700", color: "white" },
  doctorRole: { fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 2 },
  dateBadge: { backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 16, paddingHorizontal: 12, paddingVertical: 5 },
  dateBadgeText: { fontSize: 12, color: "white", fontWeight: "700" },
  appointmentDetails: { gap: 6, marginBottom: 14 },
  appointmentDetail: { flexDirection: "row", alignItems: "center", gap: 8 },
  appointmentDetailText: { fontSize: 13, color: "rgba(255,255,255,0.75)" },
  appointmentActions: { flexDirection: "row", gap: 12 },
  confirmBtn: { flex: 1, backgroundColor: "white", borderRadius: 16, paddingVertical: 12, alignItems: "center" },
  confirmBtnText: { fontSize: 14, fontWeight: "700", color: "#0369a1" },
  rescheduleBtn: { flex: 1, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 16, paddingVertical: 12, alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.15)" },
  rescheduleBtnText: { fontSize: 14, color: "white", fontWeight: "600" },
  navBar: { position: "absolute", bottom: 0, left: 0, right: 0, height: 72, backgroundColor: colors.surface.container, borderTopWidth: 1, borderTopColor: colors.glass.border, flexDirection: "row", justifyContent: "space-around", alignItems: "center", paddingHorizontal: 8 },
  navBtn: { flex: 1, alignItems: "center", justifyContent: "center", gap: 4, paddingVertical: 8 },
  navLabel: { fontSize: 10, color: colors.text.secondary, fontWeight: "500" },
  navLabelActive: { color: colors.primary, fontWeight: "700" },
});
