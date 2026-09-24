import React, { useState } from "react";
import { ScrollView, Text, View, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/types";
import { colors } from "@/theme/colors";

type Props = NativeStackScreenProps<RootStackParamList, "HealthDataAnalytics">;

const VITALS = [
  { label: "Heart Rate", value: "72", unit: "bpm", icon: "heart", bg: "#93000a" },
  { label: "Blood Pressure", value: "120/80", unit: "", icon: "pulse", bg: "#5a00c6" },
  { label: "SpO2", value: "98", unit: "%", icon: "water", bg: "#005048" },
  { label: "Sleep", value: "7h 20m", unit: "", icon: "moon", bg: "#00174b" },
];

const WEEK_HEIGHTS = [40, 60, 80, 50, 90, 70, 85];
const WEEK_DAYS = ["M", "T", "W", "T", "F", "S", "S"];

const NAV = [
  { icon: "home-outline", label: "Home", route: "HomeDashboard" },
  { icon: "grid-outline", label: "Categories", route: "MedicalRecords" },
  { icon: "alert-circle", label: "SOS", route: "EmergencyAssistance", sos: true },
  { icon: "heart", label: "Health", route: "HealthDashboard", active: true },
  { icon: "person-outline", label: "Profile", route: "Profile" },
];

export default function HealthDataAnalyticsScreen({ navigation }: Props) {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <View style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} style={s.iconBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.text.secondary} />
        </Pressable>
        <Text style={s.headerTitle}>Health Data</Text>
        <View style={s.headerRight}>
          <Pressable style={s.iconBtn}>
            <Ionicons name="notifications-outline" size={22} color={colors.text.secondary} />
          </Pressable>
          <Pressable onPress={() => navigation.navigate("Profile")} style={s.iconBtn}>
            <Ionicons name="person-outline" size={22} color={colors.text.secondary} />
          </Pressable>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {/* Hero */}
        <LinearGradient
          colors={["#2563eb", "#04b4a2", "#8343f4"]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={s.heroBorder}
        >
          <View style={s.heroInner}>
            <Text style={s.heroTitle}>Health Overview</Text>
            <Text style={s.heroSub}>
              Your complete health insights in one place. Monitor your vitals, track your progress, and optimise your well-being with precision analytics.
            </Text>
            <Pressable
              style={s.heroBtn}
              onPress={() => navigation.navigate("LabReportsHub")}
            >
              <Text style={s.heroBtnText}>View Detailed Report</Text>
            </Pressable>
          </View>
        </LinearGradient>

        {/* Health Summary */}
        <Text style={s.sectionTitle}>Health Summary</Text>
        <View style={s.vitalsGrid}>
          {VITALS.map((v) => (
            <View key={v.label} style={[s.vitalCard, { backgroundColor: v.bg }]}>
              <View style={s.vitalIconWrap}>
                <Ionicons name={v.icon as any} size={22} color="white" />
              </View>
              <Text style={s.vitalLabel}>{v.label}</Text>
              <Text style={s.vitalValue}>
                {v.value}
                {v.unit ? <Text style={s.vitalUnit}> {v.unit}</Text> : null}
              </Text>
            </View>
          ))}
        </View>

        {/* Weekly Trends + Health Score */}
        <View style={s.row2}>
          {/* Trends */}
          <View style={s.glassCard}>
            <Text style={s.cardTitle}>Weekly Trends</Text>
            <View style={s.barChart}>
              {WEEK_HEIGHTS.map((h, i) => (
                <View key={i} style={s.barWrap}>
                  <LinearGradient
                    colors={["#2563eb", "#04b4a2", "#8343f4"]}
                    style={[s.bar, { height: h }]}
                  />
                  <Text style={s.barDay}>{WEEK_DAYS[i]}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Health Score */}
          <View style={s.scoreCard}>
            <Text style={s.cardTitle}>Health Score</Text>
            <View style={s.scoreRing}>
              <View style={s.scoreInner}>
                <Text style={s.scoreValue}>85</Text>
                <Text style={s.scoreLabel}>Excellent</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Access */}
        <Text style={s.sectionTitle}>Quick Access</Text>
        <View style={s.quickGrid}>
          {[
            { label: "Lab Reports", icon: "flask", route: "LabReportsHub", color: "#8343f4" },
            { label: "Blood Test", icon: "water", route: "BloodTestReports", color: "#b91c1c" },
            { label: "Doctor Advice", icon: "medical", route: "DoctorAdvice", color: "#0d9488" },
            { label: "Prescription", icon: "receipt", route: "PrescriptionManagement", color: "#2563eb" },
            { label: "Vaccination", icon: "shield-checkmark", route: "VaccinationCenter", color: "#d97706" },
            { label: "Medical Records", icon: "document-text", route: "MedicalRecords", color: "#059669" },
          ].map((q) => (
            <Pressable
              key={q.label}
              onPress={() => navigation.navigate(q.route as any)}
              style={({ pressed }) => [s.quickCard, { backgroundColor: q.color, opacity: pressed ? 0.8 : 1 }]}
            >
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
          n.sos ? (
            <Pressable
              key={n.route}
              onPress={() => navigation.navigate(n.route as any)}
              style={s.sosBtn}
            >
              <Ionicons name="alert-circle" size={28} color="white" />
            </Pressable>
          ) : (
            <Pressable
              key={n.route}
              onPress={() => navigation.navigate(n.route as any)}
              style={[s.navBtn, n.active && s.navBtnActive]}
            >
              <Ionicons name={n.icon as any} size={22} color={n.active ? colors.primary : colors.text.secondary} />
              <Text style={[s.navLabel, n.active && s.navLabelActive]}>{n.label}</Text>
            </Pressable>
          )
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface.dim },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: 52, paddingBottom: 12 },
  headerTitle: { fontSize: 22, fontWeight: "700", color: colors.primary },
  headerRight: { flexDirection: "row", gap: 4 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface.containerHigh, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: colors.glass.border },
  scroll: { paddingHorizontal: 16 },
  heroBorder: { borderRadius: 32, padding: 2, marginBottom: 24 },
  heroInner: { backgroundColor: colors.surface.containerHigh, borderRadius: 30, padding: 24 },
  heroTitle: { fontSize: 32, fontWeight: "700", color: colors.text.primary, marginBottom: 12 },
  heroSub: { fontSize: 16, color: colors.text.secondary, marginBottom: 20, lineHeight: 24 },
  heroBtn: { backgroundColor: colors.primary, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 16, alignSelf: "flex-start" },
  heroBtnText: { color: colors.onPrimary, fontSize: 15, fontWeight: "700" },
  sectionTitle: { fontSize: 22, fontWeight: "700", color: colors.text.primary, marginBottom: 14 },
  vitalsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 20 },
  vitalCard: { width: "47%", borderRadius: 30, padding: 20, gap: 8, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  vitalIconWrap: { width: 48, height: 48, borderRadius: 24, backgroundColor: "rgba(255,255,255,0.2)", justifyContent: "center", alignItems: "center" },
  vitalLabel: { fontSize: 13, color: "rgba(255,255,255,0.8)", fontWeight: "500" },
  vitalValue: { fontSize: 26, fontWeight: "700", color: "white" },
  vitalUnit: { fontSize: 14, fontWeight: "400" },
  row2: { flexDirection: "row", gap: 12, marginBottom: 24 },
  glassCard: { flex: 1, backgroundColor: colors.glass.background, borderRadius: 30, padding: 16, borderWidth: 1, borderColor: colors.glass.border },
  scoreCard: { flex: 1, backgroundColor: "#18344F", borderRadius: 30, padding: 16, borderWidth: 1, borderColor: colors.glass.border, alignItems: "center" },
  cardTitle: { fontSize: 16, fontWeight: "700", color: colors.text.primary, marginBottom: 16 },
  barChart: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", height: 100, gap: 4 },
  barWrap: { flex: 1, alignItems: "center", gap: 6 },
  bar: { width: "100%", borderRadius: 8 },
  barDay: { fontSize: 10, color: colors.text.secondary, fontWeight: "600" },
  scoreRing: { width: 100, height: 100, borderRadius: 50, borderWidth: 8, borderColor: colors.primary, justifyContent: "center", alignItems: "center", marginTop: 8 },
  scoreInner: { alignItems: "center" },
  scoreValue: { fontSize: 28, fontWeight: "700", color: colors.primary },
  scoreLabel: { fontSize: 11, color: colors.text.secondary },
  quickGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 8 },
  quickCard: { width: "30%", borderRadius: 20, padding: 16, alignItems: "center", gap: 8, borderWidth: 1, borderColor: "rgba(255,255,255,0.15)" },
  quickLabel: { fontSize: 11, color: "white", fontWeight: "600", textAlign: "center" },
  navBar: { position: "absolute", bottom: 0, left: 0, right: 0, height: 72, backgroundColor: colors.surface.container, borderTopWidth: 1, borderTopColor: colors.glass.border, flexDirection: "row", justifyContent: "space-around", alignItems: "center", paddingHorizontal: 8 },
  navBtn: { flex: 1, alignItems: "center", justifyContent: "center", gap: 4, paddingVertical: 8 },
  navBtnActive: {},
  navLabel: { fontSize: 10, color: colors.text.secondary, fontWeight: "500" },
  navLabelActive: { color: colors.primary, fontWeight: "700" },
  sosBtn: { width: 56, height: 56, borderRadius: 28, backgroundColor: "#E62E2E", justifyContent: "center", alignItems: "center", marginBottom: 12, shadowColor: "#E62E2E", shadowOpacity: 0.5, shadowRadius: 12, elevation: 8 },
});
