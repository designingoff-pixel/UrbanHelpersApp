import React from "react";
import { ScrollView, Text, View, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/types";
import { colors } from "@/theme/colors";

type Props = NativeStackScreenProps<RootStackParamList, "MedicalRecords">;

const QUICK_ACCESS = [
  { icon: "analytics", label: "Health Data", route: "HealthDataAnalytics", gradient: ["#2563eb", "#0d9488"] as (string[]) },
  { icon: "flask", label: "Lab Reports", route: "LabReportsHub", gradient: ["#f43f5e", "#881337"] as (string[]) },
  { icon: "medical", label: "Doctor Advice", route: "DoctorAdvice", gradient: ["#059669", "#0f766e"] as (string[]) },
  { icon: "water-outline", label: "Blood Test", route: "BloodTestReports", gradient: ["#b91c1c", "#6b21a8"] as (string[]) },
  { icon: "receipt", label: "Prescription", route: "PrescriptionManagement", gradient: ["#7c3aed", "#4338ca"] as (string[]) },
  { icon: "shield-checkmark", label: "Vaccination", route: "VaccinationCenter", gradient: ["#0d9488", "#0891b2"] as (string[]) },
];

const SUMMARY = [
  { icon: "heart", label: "Blood Group", value: "O+", gradient: ["#f43f5e", "#881337"] as (string[]) },
  { icon: "barbell", label: "BMI", value: "22.4 Normal", gradient: ["#f59e0b", "#78350f"] as (string[]) },
  { icon: "resize", label: "Height", value: "178 cm", gradient: ["#10b981", "#064e3b"] as (string[]) },
  { icon: "speedometer", label: "Weight", value: "70 kg", gradient: ["#2563eb", "#1e3a8a"] as (string[]) },
];

export default function MedicalRecordsScreen({ navigation }: Props) {
  return (
    <View style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.text.secondary} />
        </Pressable>
        <Text style={s.pageTitle}>Health Records</Text>
        <Pressable style={s.iconBtn}>
          <Ionicons name="search-outline" size={20} color={colors.text.secondary} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {/* Hero */}
        <LinearGradient colors={["#1e3a8a", "#4c1d95"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.hero}>
          <View style={s.heroContent}>
            <Text style={s.heroTitle}>Your Complete Medical History</Text>
            <Text style={s.heroSub}>Securely store all your reports and prescriptions.</Text>
            <Pressable style={s.heroBtn}>
              <Ionicons name="cloud-upload" size={16} color={colors.onPrimary} />
              <Text style={s.heroBtnText}>Upload Report</Text>
            </Pressable>
          </View>
          <View style={s.heroDecor}>
            <Ionicons name="folder-open" size={80} color="rgba(180,197,255,0.2)" />
          </View>
        </LinearGradient>

        {/* Quick Access — horizontal scroll strip */}
        <Text style={s.sectionTitle}>Quick Access</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={s.quickScroll}
          contentContainerStyle={s.quickScrollContent}
        >
          {QUICK_ACCESS.map((q) => (
            <Pressable
              key={q.label}
              onPress={() => navigation.navigate(q.route as any)}
              style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
            >
              <LinearGradient
                colors={q.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={s.quickCard}
              >
                <View style={s.quickIconWrap}>
                  <Ionicons name={q.icon as any} size={26} color="white" />
                </View>
                <Text style={s.quickLabel}>{q.label}</Text>
                <Ionicons name="arrow-forward-circle" size={18} color="rgba(255,255,255,0.6)" style={s.quickArrow} />
              </LinearGradient>
            </Pressable>
          ))}
        </ScrollView>

        {/* Health Summary */}
        <Text style={s.sectionTitle}>Health Summary</Text>
        <View style={s.glassCard}>
          <View style={s.summaryGrid}>
            {SUMMARY.map((item) => (
              <LinearGradient key={item.label} colors={item.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.summaryTile}>
                <View style={s.summaryIcon}>
                  <Ionicons name={item.icon as any} size={20} color="white" />
                </View>
                <Text style={s.summaryLabel}>{item.label}</Text>
                <Text style={s.summaryValue}>{item.value}</Text>
              </LinearGradient>
            ))}
          </View>
        </View>

        {/* Recent Records */}
        <Text style={s.sectionTitle}>Recent Records</Text>
        {[
          { title: "Complete Blood Count", date: "Aug 10, 2026", type: "Lab Report", icon: "flask", route: "BloodTestReports" },
          { title: "Chest X-Ray Report", date: "Aug 5, 2026", type: "Imaging", icon: "body", route: "HealthDataAnalytics" },
          { title: "Cardiology Consultation", date: "Jul 28, 2026", type: "Doctor Visit", icon: "heart", route: "DoctorAdvice" },
        ].map((r) => (
          <Pressable
            key={r.title}
            onPress={() => navigation.navigate(r.route as any)}
            style={({ pressed }) => [s.recordRow, { opacity: pressed ? 0.8 : 1 }]}
          >
            <View style={s.recordIcon}>
              <Ionicons name={r.icon as any} size={20} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.recordTitle}>{r.title}</Text>
              <Text style={s.recordMeta}>{r.type} • {r.date}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.text.secondary} />
          </Pressable>
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface.dim },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingTop: 52, paddingBottom: 16 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface.containerHigh, borderWidth: 1, borderColor: colors.glass.border, justifyContent: "center", alignItems: "center" },
  pageTitle: { fontSize: 20, fontWeight: "700", color: colors.text.primary },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface.containerHigh, borderWidth: 1, borderColor: colors.glass.border, justifyContent: "center", alignItems: "center" },
  scroll: { paddingHorizontal: 16 },
  hero: { borderRadius: 30, padding: 24, marginBottom: 20, minHeight: 200, flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderWidth: 1, borderColor: colors.glass.border },
  heroContent: { flex: 1 },
  heroTitle: { fontSize: 22, fontWeight: "700", color: "white", marginBottom: 8, lineHeight: 30 },
  heroSub: { fontSize: 13, color: "rgba(255,255,255,0.8)", marginBottom: 20 },
  heroBtn: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: colors.primary, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 20, alignSelf: "flex-start" },
  heroBtnText: { color: colors.onPrimary, fontSize: 14, fontWeight: "700" },
  heroDecor: { marginLeft: 12 },
  sectionTitle: { fontSize: 20, fontWeight: "700", color: colors.text.primary, marginBottom: 12 },
  quickScroll: { marginBottom: 24, marginHorizontal: -16 },
  quickScrollContent: { paddingHorizontal: 16, gap: 12 },
  quickCard: { width: 130, borderRadius: 24, padding: 18, gap: 10, justifyContent: "space-between", minHeight: 140, borderWidth: 1, borderColor: "rgba(255,255,255,0.15)" },
  quickIconWrap: { width: 52, height: 52, borderRadius: 26, backgroundColor: "rgba(255,255,255,0.2)", justifyContent: "center", alignItems: "center" },
  quickLabel: { fontSize: 14, color: "white", fontWeight: "700" },
  quickArrow: { alignSelf: "flex-end" },
  glassCard: { backgroundColor: colors.surface.container, borderRadius: 30, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: colors.glass.border },
  summaryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  summaryTile: { width: "47%", borderRadius: 16, padding: 16, gap: 4, borderWidth: 1, borderColor: "rgba(255,255,255,0.2)" },
  summaryIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.2)", justifyContent: "center", alignItems: "center", marginBottom: 8 },
  summaryLabel: { fontSize: 11, color: "rgba(255,255,255,0.8)", fontWeight: "700", letterSpacing: 0.3 },
  summaryValue: { fontSize: 20, fontWeight: "700", color: "white" },
  recordRow: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: colors.surface.containerHigh, borderRadius: 16, padding: 16, marginBottom: 8, borderWidth: 1, borderColor: colors.glass.border },
  recordIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(180,197,255,0.1)", justifyContent: "center", alignItems: "center" },
  recordTitle: { fontSize: 14, fontWeight: "600", color: colors.text.primary },
  recordMeta: { fontSize: 12, color: colors.text.secondary, marginTop: 2 },
});
