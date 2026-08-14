import React from "react";
import { ScrollView, Text, View, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/types";
import { colors } from "@/theme/colors";

type Props = NativeStackScreenProps<RootStackParamList, "HealthDashboard">;

const VITALS = [
  { label: "HEART RATE", value: "72", unit: "BPM", status: "Normal", gradient: ["#be185d", "#7e22ce"] as (string[]), icon: "heart" },
  { label: "OXYGEN", value: "98%", unit: "", status: "Healthy", gradient: ["#0284c7", "#0d9488"] as (string[]), icon: "water" },
  { label: "PRESSURE", value: "120/80", unit: "", status: "Normal", gradient: ["#1e3a8a", "#4338ca"] as (string[]), icon: "pulse" },
];

const NAV = [
  { icon: "home-outline", route: "HomeDashboard", label: "Home" },
  { icon: "heart", route: "HealthDashboard", label: "Health", active: true },
  { icon: "compass-outline", route: "Discover", label: "Discover" },
  { icon: "barbell-outline", route: "FitnessDashboard", label: "Fitness" },
  { icon: "person-outline", route: "Profile", label: "Profile" },
];

export default function HealthDashboardScreen({ navigation }: Props) {
  return (
    <View style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={22} color={colors.text.secondary} />
        </Pressable>
        <View style={s.headerTitle}>
          <Text style={s.title}>Health</Text>
          <Text style={s.caption}>Everything about your wellness.</Text>
        </View>
        <Pressable style={s.iconBtn}>
          <Ionicons name="notifications-outline" size={20} color={colors.text.secondary} />
          <View style={s.badge} />
        </Pressable>
      </View>

      {/* Tabs */}
      <View style={s.tabRow}>
        {["Overview", "Vitals", "Medication", "Reports"].map((t, i) => (
          <Pressable key={t} style={[s.tab, i === 0 && s.tabActive]}>
            <Text style={[s.tabText, i === 0 && s.tabTextActive]}>{t}</Text>
          </Pressable>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {/* Hero */}
        <LinearGradient colors={["#0C4A6E", "#4C1D95"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.hero}>
          <Text style={s.heroTitle}>Your Health Journey</Text>
          <Text style={s.heroSub}>Track every important aspect of your health in one place.</Text>
          <Pressable style={s.heroBtn}>
            <Text style={s.heroBtnText}>View Summary</Text>
            <Ionicons name="arrow-forward" size={14} color="white" />
          </Pressable>
        </LinearGradient>

        {/* Today's Vitals */}
        <Text style={s.sectionTitle}>Today's Vitals</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.vitalsRow}>
          {VITALS.map((v) => (
            <LinearGradient key={v.label} colors={v.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.vitalCard}>
              <View style={s.vitalTop}>
                <View style={s.vitalIconWrap}>
                  <Ionicons name={v.icon as any} size={16} color="white" />
                </View>
                <Text style={s.vitalLabel}>{v.label}</Text>
              </View>
              <Text style={s.vitalValue}>{v.value} <Text style={s.vitalUnit}>{v.unit}</Text></Text>
              <View style={s.vitalStatus}>
                <View style={s.statusDot} />
                <Text style={s.statusText}>{v.status}</Text>
              </View>
            </LinearGradient>
          ))}
        </ScrollView>

        {/* Daily Wellness Grid */}
        <Text style={s.sectionTitle}>Daily Wellness</Text>
        <View style={s.wellnessGrid}>
          <Pressable onPress={() => navigation.navigate("HydrationDashboard")} style={[s.wellnessCard, { borderColor: "rgba(79,219,200,0.3)" }]}>
            <Ionicons name="water" size={22} color={colors.secondary} />
            <Text style={s.wellnessLabel}>HYDRATION</Text>
            <Text style={s.wellnessValue}>2.1 L</Text>
            <View style={s.progressBar}><View style={[s.progressFill, { width: "70%", backgroundColor: colors.secondary }]} /></View>
          </Pressable>
          <Pressable onPress={() => navigation.navigate("SleepDashboard")} style={[s.wellnessCard, { borderColor: "rgba(210,187,255,0.3)" }]}>
            <Ionicons name="moon" size={22} color={colors.tertiary} />
            <Text style={s.wellnessLabel}>SLEEP</Text>
            <Text style={s.wellnessValue}>7h 45m</Text>
            <Text style={[s.statusText, { color: colors.tertiary, marginTop: 4 }]}>Excellent</Text>
          </Pressable>
        </View>

        {/* AI Coach Banner */}
        <Pressable onPress={() => navigation.navigate("AICoach")}>
          <LinearGradient colors={["rgba(37,99,235,0.2)", "rgba(131,67,244,0.2)"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.aiBanner}>
            <View style={{ flex: 1 }}>
              <View style={s.aiRow}>
                <Ionicons name="sparkles" size={18} color={colors.tertiaryFixed} />
                <Text style={s.aiBannerTitle}>AI Health Coach</Text>
              </View>
              <Text style={s.aiBannerSub}>Receive personalized health suggestions based on your recent vitals.</Text>
            </View>
            <View style={s.aiOrb}>
              <Ionicons name="logo-electron" size={30} color={colors.tertiary} />
            </View>
          </LinearGradient>
        </Pressable>

        {/* Quick Actions */}
        <Text style={s.sectionTitle}>Quick Access</Text>
        <View style={s.quickGrid}>
          {[
            { icon: "flask", label: "Lab Reports", route: "LabReportsHub", color: "#f43f5e" },
            { icon: "water-outline", label: "Blood Test", route: "BloodTestReports", color: "#f59e0b" },
            { icon: "shield-checkmark", label: "Vaccination", route: "VaccinationCenter", color: "#10b981" },
            { icon: "receipt", label: "Prescription", route: "PrescriptionManagement", color: "#8b5cf6" },
          ].map((q) => (
            <Pressable key={q.label} onPress={() => navigation.navigate(q.route as any)} style={[s.quickCard, { backgroundColor: q.color }]}>
              <Ionicons name={q.icon as any} size={26} color="white" />
              <Text style={s.quickLabel}>{q.label}</Text>
            </Pressable>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Nav */}
      <View style={s.navBar}>
        {NAV.map((n) => (
          <Pressable key={n.route} onPress={() => navigation.navigate(n.route as any)} style={[s.navBtn, n.active && s.navBtnActive]}>
            <Ionicons name={n.icon as any} size={22} color={n.active ? colors.onPrimary : colors.text.secondary} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface.dim },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingTop: 52, paddingBottom: 12, gap: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface.containerHigh, borderWidth: 1, borderColor: colors.glass.border, justifyContent: "center", alignItems: "center" },
  headerTitle: { flex: 1 },
  title: { fontSize: 24, fontWeight: "700", color: colors.primary },
  caption: { fontSize: 12, color: colors.text.secondary, marginTop: 2 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface.containerHigh, borderWidth: 1, borderColor: colors.glass.border, justifyContent: "center", alignItems: "center" },
  badge: { position: "absolute", top: 8, right: 8, width: 8, height: 8, borderRadius: 4, backgroundColor: colors.error },
  tabRow: { flexDirection: "row", marginHorizontal: 16, marginBottom: 16, backgroundColor: colors.glass.background, borderRadius: 30, borderWidth: 1, borderColor: colors.glass.border, padding: 4 },
  tab: { flex: 1, paddingVertical: 8, borderRadius: 20, alignItems: "center" },
  tabActive: { backgroundColor: "rgba(180,197,255,0.15)" },
  tabText: { fontSize: 12, fontWeight: "500", color: colors.text.secondary },
  tabTextActive: { color: colors.primary, fontWeight: "700" },
  scroll: { paddingHorizontal: 16 },
  hero: { borderRadius: 30, padding: 24, marginBottom: 20, minHeight: 200, justifyContent: "flex-end", borderWidth: 1, borderColor: colors.glass.border },
  heroTitle: { fontSize: 28, fontWeight: "700", color: "white", marginBottom: 8 },
  heroSub: { fontSize: 14, color: "rgba(255,255,255,0.8)", marginBottom: 24 },
  heroBtn: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "rgba(255,255,255,0.1)", borderWidth: 1, borderColor: "rgba(255,255,255,0.2)", paddingHorizontal: 20, paddingVertical: 12, borderRadius: 20, alignSelf: "flex-start" },
  heroBtnText: { color: "white", fontSize: 14, fontWeight: "700" },
  sectionTitle: { fontSize: 20, fontWeight: "700", color: colors.text.primary, marginBottom: 12 },
  vitalsRow: { marginBottom: 20, marginHorizontal: -16, paddingHorizontal: 16 },
  vitalCard: { borderRadius: 30, padding: 20, marginRight: 12, minWidth: 160, justifyContent: "space-between", minHeight: 140 },
  vitalTop: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 20 },
  vitalIconWrap: { width: 32, height: 32, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.2)", justifyContent: "center", alignItems: "center" },
  vitalLabel: { fontSize: 11, fontWeight: "700", color: "rgba(255,255,255,0.8)", letterSpacing: 0.5 },
  vitalValue: { fontSize: 24, fontWeight: "700", color: "white" },
  vitalUnit: { fontSize: 14, fontWeight: "400" },
  vitalStatus: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 8 },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#4ade80" },
  statusText: { fontSize: 12, color: "rgba(255,255,255,0.8)" },
  wellnessGrid: { flexDirection: "row", gap: 12, marginBottom: 16 },
  wellnessCard: { flex: 1, backgroundColor: colors.surface.containerHigh, borderRadius: 30, padding: 20, borderWidth: 1 },
  wellnessLabel: { fontSize: 11, fontWeight: "700", color: colors.text.secondary, letterSpacing: 0.5, marginTop: 8 },
  wellnessValue: { fontSize: 24, fontWeight: "700", color: colors.text.primary, marginTop: 4 },
  progressBar: { height: 6, backgroundColor: colors.surface.containerHighest, borderRadius: 3, marginTop: 12, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 3 },
  aiBanner: { borderRadius: 30, padding: 20, marginBottom: 20, flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "rgba(131,67,244,0.3)" },
  aiRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  aiBannerTitle: { fontSize: 14, fontWeight: "700", color: colors.tertiaryFixed },
  aiBannerSub: { fontSize: 12, color: colors.text.secondary, lineHeight: 18 },
  aiOrb: { width: 64, height: 64, borderRadius: 32, backgroundColor: "rgba(131,67,244,0.2)", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "rgba(131,67,244,0.3)" },
  quickGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 8 },
  quickCard: { width: "47%", borderRadius: 16, padding: 16, alignItems: "center", gap: 8, borderWidth: 1, borderColor: "rgba(255,255,255,0.2)" },
  quickLabel: { fontSize: 12, color: "white", fontWeight: "600" },
  navBar: { position: "absolute", bottom: 0, left: 0, right: 0, flexDirection: "row", justifyContent: "space-around", alignItems: "center", height: 80, marginHorizontal: 16, marginBottom: 16, backgroundColor: colors.glass.background, borderRadius: 32, borderWidth: 1, borderColor: colors.glass.border },
  navBtn: { width: 48, height: 48, borderRadius: 24, justifyContent: "center", alignItems: "center" },
  navBtnActive: { backgroundColor: colors.primary },
});
