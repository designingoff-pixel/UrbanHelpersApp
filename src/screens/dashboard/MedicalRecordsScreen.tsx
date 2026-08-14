import React from "react";
import { ScrollView, Text, View, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/types";
import { colors } from "@/theme/colors";

type Props = NativeStackScreenProps<RootStackParamList, "MedicalRecords">;

const QUICK_ACCESS = [
  { icon: "flask", label: "Lab Reports", route: "LabReportsHub", gradient: ["#f43f5e", "#881337"] as (string[]) },
  { icon: "water-outline", label: "Blood Test", route: "BloodTestReports", gradient: ["#f59e0b", "#78350f"] as (string[]) },
  { icon: "shield-checkmark", label: "Vaccinations", route: "VaccinationCenter", gradient: ["#10b981", "#064e3b"] as (string[]) },
  { icon: "receipt", label: "Prescription", route: "PrescriptionManagement", gradient: ["#8b5cf6", "#312e81"] as (string[]) },
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

        {/* Quick Access */}
        <Text style={s.sectionTitle}>Quick Access</Text>
        <View style={s.quickGrid}>
          {QUICK_ACCESS.map((q) => (
            <Pressable key={q.label} onPress={() => navigation.navigate(q.route as any)}>
              <LinearGradient colors={q.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.quickCard}>
                <View style={s.quickIcon}>
                  <Ionicons name={q.icon as any} size={24} color="white" />
                </View>
                <Text style={s.quickLabel}>{q.label}</Text>
              </LinearGradient>
            </Pressable>
          ))}
        </View>

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
          { title: "Complete Blood Count", date: "Aug 10, 2026", type: "Lab Report", icon: "flask" },
          { title: "Chest X-Ray Report", date: "Aug 5, 2026", type: "Imaging", icon: "body" },
          { title: "Cardiology Consultation", date: "Jul 28, 2026", type: "Doctor Visit", icon: "heart" },
        ].map((r) => (
          <View key={r.title} style={s.recordRow}>
            <View style={s.recordIcon}>
              <Ionicons name={r.icon as any} size={20} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.recordTitle}>{r.title}</Text>
              <Text style={s.recordMeta}>{r.type} • {r.date}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.text.secondary} />
          </View>
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
  quickGrid: { flexDirection: "row", gap: 12, marginBottom: 24, flexWrap: "wrap" },
  quickCard: { width: 80, borderRadius: 16, padding: 12, alignItems: "center", gap: 8 },
  quickIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: "rgba(255,255,255,0.2)", justifyContent: "center", alignItems: "center" },
  quickLabel: { fontSize: 11, color: "white", fontWeight: "600", textAlign: "center" },
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
