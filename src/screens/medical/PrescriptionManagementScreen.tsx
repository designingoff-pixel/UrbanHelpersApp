import React, { useState } from "react";
import { ScrollView, Text, View, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/types";
import { colors } from "@/theme/colors";

type Props = NativeStackScreenProps<RootStackParamList, "PrescriptionManagement">;

const FILTER_TABS = ["Active", "Completed", "Upcoming", "Expired"];

const PRESCRIPTIONS = [
  {
    doctor: "Dr. Sarah Jenkins",
    hospital: "City General Hospital",
    badge: "ACTIVE",
    bg: "#4f46e5",
    glow: "rgba(79,70,229,0.3)",
    meds: [
      { name: "Amoxicillin 500mg", dose: "1-0-1" },
      { name: "Ibuprofen 400mg", dose: "0-1-0" },
    ],
    date: "Oct 12, 2023",
  },
  {
    doctor: "Dr. Michael Chen",
    hospital: "Metro Health Clinic",
    badge: "COMPLETED",
    bg: "#0d9488",
    glow: "rgba(13,148,136,0.3)",
    meds: [
      { name: "Lisinopril 10mg", dose: "1-0-0" },
    ],
    date: "Sep 05, 2023",
  },
];

const ACTIVE_REGIMEN = [
  { name: "Amoxicillin", schedule: [true, false, true], days: "5 Days" },
  { name: "Ibuprofen", schedule: [false, true, false], days: "3 Days" },
];

const NAV = [
  { icon: "home-outline", label: "Home", route: "HomeDashboard" },
  { icon: "grid-outline", label: "Categories", route: "MedicalRecords" },
  { icon: "alert-circle", label: "SOS", route: "EmergencyAssistance", sos: true },
  { icon: "people-outline", label: "Together", route: "FamilyDashboard", active: true },
  { icon: "person-outline", label: "Profile", route: "Profile" },
];

export default function PrescriptionManagementScreen({ navigation }: Props) {
  const [activeFilter, setActiveFilter] = useState(0);

  return (
    <View style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} style={s.iconBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.text.secondary} />
        </Pressable>
        <Text style={s.headerTitle}>Prescription</Text>
        <Pressable style={s.iconBtn}>
          <Ionicons name="search-outline" size={22} color={colors.text.secondary} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {/* Hero */}
        <LinearGradient
          colors={[colors.primaryContainer, colors.tertiaryContainer, "#3f008e"]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={s.hero}
        >
          <Text style={s.heroTitle}>Digital{"\n"}Prescriptions</Text>
          <Text style={s.heroSub}>Store, organise and access all your prescriptions securely in one place.</Text>
          <View style={s.heroButtons}>
            <Pressable style={s.heroBtnPrimary}>
              <Ionicons name="cloud-upload-outline" size={16} color={colors.onPrimary} />
              <Text style={s.heroBtnPrimaryText}>Upload Prescription</Text>
            </Pressable>
            <Pressable style={s.heroBtnSecondary}>
              <Ionicons name="scan-outline" size={16} color="white" />
              <Text style={s.heroBtnSecondaryText}>Scan</Text>
            </Pressable>
          </View>
        </LinearGradient>

        {/* Filter Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterRow}>
          {FILTER_TABS.map((t, i) => (
            <Pressable
              key={t}
              onPress={() => setActiveFilter(i)}
              style={[s.filterTab, activeFilter === i && s.filterTabActive]}
            >
              <Text style={[s.filterTabText, activeFilter === i && s.filterTabTextActive]}>{t}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Recent Prescriptions */}
        <Text style={s.sectionTitle}>Recent Prescriptions</Text>
        <View style={s.prescriptionList}>
          {PRESCRIPTIONS.map((p) => (
            <View key={p.doctor} style={[s.prescriptionCard, { backgroundColor: p.bg, shadowColor: p.glow }]}>
              <View style={s.prescriptionAccent} />
              <View style={s.prescriptionHeader}>
                <View>
                  <Text style={s.prescriptionDoctor}>{p.doctor}</Text>
                  <View style={s.prescriptionHospitalRow}>
                    <Ionicons name="business-outline" size={14} color="rgba(255,255,255,0.7)" />
                    <Text style={s.prescriptionHospital}>{p.hospital}</Text>
                  </View>
                </View>
                <View style={s.prescriptionBadge}>
                  <Text style={s.prescriptionBadgeText}>{p.badge}</Text>
                </View>
              </View>
              <View style={s.medsBox}>
                <Text style={s.medsBoxLabel}>Prescribed Medicines</Text>
                {p.meds.map((m) => (
                  <View key={m.name} style={s.medRow}>
                    <Text style={s.medName}>{m.name}</Text>
                    <Text style={s.medDose}>{m.dose}</Text>
                  </View>
                ))}
              </View>
              <View style={s.prescriptionFooter}>
                <Text style={s.prescriptionDate}>{p.date}</Text>
                <View style={s.prescriptionActions}>
                  <Pressable style={s.prescriptionActionBtn}>
                    <Ionicons name="share-outline" size={18} color="white" />
                  </Pressable>
                  <Pressable style={s.prescriptionActionBtn}>
                    <Ionicons name="download-outline" size={18} color="white" />
                    <Text style={s.downloadText}>PDF</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Right Panel Tools */}
        <View style={s.toolsRow}>
          {/* Smart Scan */}
          <View style={s.scanCard}>
            <View style={s.scanIcon}>
              <Ionicons name="scan-outline" size={32} color="white" />
            </View>
            <Text style={s.scanTitle}>Smart Scan</Text>
            <Text style={s.scanSub}>Extract text automatically</Text>
            <Pressable>
              <Text style={s.scanBtn}>Scan New Document</Text>
            </Pressable>
          </View>

          {/* Active Regimen */}
          <View style={s.regimenCard}>
            <View style={s.regimenHeader}>
              <Ionicons name="sparkles" size={18} color="white" />
              <Text style={s.regimenTitle}>Active Regimen</Text>
            </View>
            {ACTIVE_REGIMEN.map((r) => (
              <View key={r.name} style={s.regimenRow}>
                <Text style={s.regimenMed}>{r.name}</Text>
                <View style={s.scheduleRow}>
                  {r.schedule.map((active, i) => (
                    <View key={i} style={[s.scheduleCell, active && s.scheduleCellActive]}>
                      <Text style={[s.scheduleCellText, active && s.scheduleCellTextActive]}>
                        {["M", "A", "N"][i]}
                      </Text>
                    </View>
                  ))}
                </View>
                <View style={s.regimenDaysBadge}>
                  <Text style={s.regimenDaysText}>{r.days}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Cloud Backup */}
        <View style={s.backupCard}>
          <View style={s.backupLeft}>
            <View style={s.backupIcon}>
              <Ionicons name="cloud-outline" size={20} color="white" />
            </View>
            <View>
              <Text style={s.backupTitle}>Cloud Backup</Text>
              <Text style={s.backupSub}>Synced 2m ago</Text>
            </View>
          </View>
          <View style={s.toggleTrack}>
            <View style={s.toggleThumb} />
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Nav */}
      <View style={s.navBar}>
        {NAV.map((n) =>
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
              style={s.navBtn}
            >
              <Ionicons name={n.icon as any} size={22} color={n.active ? colors.primary : colors.text.secondary} />
              <Text style={[s.navLabel, n.active && s.navLabelActive]}>{n.label}</Text>
            </Pressable>
          )
        )}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface.dim },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: 52, paddingBottom: 12 },
  headerTitle: { fontSize: 22, fontWeight: "700", color: colors.text.primary },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface.containerHigh, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: colors.glass.border },
  scroll: { paddingHorizontal: 16 },
  hero: { borderRadius: 32, padding: 28, marginBottom: 16, minHeight: 260, justifyContent: "flex-end", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", overflow: "hidden" },
  heroTitle: { fontSize: 40, fontWeight: "700", color: "white", lineHeight: 48, marginBottom: 12 },
  heroSub: { fontSize: 15, color: "rgba(255,255,255,0.8)", marginBottom: 24, lineHeight: 22 },
  heroButtons: { flexDirection: "row", gap: 12 },
  heroBtnPrimary: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: colors.primary, paddingHorizontal: 18, paddingVertical: 12, borderRadius: 16 },
  heroBtnPrimaryText: { color: colors.onPrimary, fontSize: 14, fontWeight: "700" },
  heroBtnSecondary: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "rgba(255,255,255,0.1)", paddingHorizontal: 18, paddingVertical: 12, borderRadius: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.15)" },
  heroBtnSecondaryText: { color: "white", fontSize: 14, fontWeight: "700" },
  filterRow: { marginBottom: 20 },
  filterTab: { backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", paddingHorizontal: 20, paddingVertical: 8, borderRadius: 30, marginRight: 10 },
  filterTabActive: { backgroundColor: colors.primary },
  filterTabText: { fontSize: 13, color: colors.text.secondary, fontWeight: "500" },
  filterTabTextActive: { color: colors.onPrimary, fontWeight: "700" },
  sectionTitle: { fontSize: 20, fontWeight: "700", color: colors.text.primary, marginBottom: 14 },
  prescriptionList: { gap: 16, marginBottom: 20 },
  prescriptionCard: { borderRadius: 32, padding: 20, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 1, shadowRadius: 30, elevation: 8, position: "relative", overflow: "hidden" },
  prescriptionAccent: { position: "absolute", left: 0, top: 0, bottom: 0, width: 4, backgroundColor: "rgba(255,255,255,0.5)" },
  prescriptionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 },
  prescriptionDoctor: { fontSize: 22, fontWeight: "700", color: "white" },
  prescriptionHospitalRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  prescriptionHospital: { fontSize: 13, color: "rgba(255,255,255,0.7)" },
  prescriptionBadge: { backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 },
  prescriptionBadgeText: { fontSize: 10, fontWeight: "700", color: "white", letterSpacing: 0.5 },
  medsBox: { backgroundColor: "rgba(0,0,0,0.15)", borderRadius: 16, padding: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", marginBottom: 14 },
  medsBoxLabel: { fontSize: 11, color: "rgba(255,255,255,0.6)", marginBottom: 10 },
  medRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.1)" },
  medName: { fontSize: 14, fontWeight: "700", color: "white" },
  medDose: { fontSize: 14, color: "rgba(255,255,255,0.85)" },
  prescriptionFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  prescriptionDate: { fontSize: 12, color: "rgba(255,255,255,0.7)" },
  prescriptionActions: { flexDirection: "row", gap: 8 },
  prescriptionActionBtn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(0,0,0,0.15)", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8 },
  downloadText: { fontSize: 13, color: "white", fontWeight: "700" },
  toolsRow: { flexDirection: "row", gap: 12, marginBottom: 12 },
  scanCard: { flex: 1, backgroundColor: "#7c3aed", borderRadius: 32, padding: 20, alignItems: "center", justifyContent: "center", minHeight: 180, gap: 8 },
  scanIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: "rgba(255,255,255,0.2)", justifyContent: "center", alignItems: "center", marginBottom: 4 },
  scanTitle: { fontSize: 16, fontWeight: "700", color: "white" },
  scanSub: { fontSize: 12, color: "rgba(255,255,255,0.7)", textAlign: "center" },
  scanBtn: { fontSize: 13, color: "white", fontWeight: "700", marginTop: 8 },
  regimenCard: { flex: 1, backgroundColor: "#4338ca", borderRadius: 32, padding: 16, gap: 10 },
  regimenHeader: { flexDirection: "row", alignItems: "center", gap: 8, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.2)", paddingBottom: 10 },
  regimenTitle: { fontSize: 15, fontWeight: "700", color: "white" },
  regimenRow: { backgroundColor: "rgba(0,0,0,0.15)", borderRadius: 12, padding: 10, flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  regimenMed: { fontSize: 12, fontWeight: "700", color: "white", flex: 1 },
  scheduleRow: { flexDirection: "row", gap: 4 },
  scheduleCell: { width: 22, height: 22, borderRadius: 4, backgroundColor: "rgba(0,0,0,0.2)", justifyContent: "center", alignItems: "center" },
  scheduleCellActive: { backgroundColor: "rgba(255,255,255,0.3)" },
  scheduleCellText: { fontSize: 9, color: "rgba(255,255,255,0.5)", fontWeight: "700" },
  scheduleCellTextActive: { color: "white" },
  regimenDaysBadge: { backgroundColor: "rgba(0,0,0,0.2)", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  regimenDaysText: { fontSize: 10, color: "rgba(255,255,255,0.85)", fontWeight: "500" },
  backupCard: { backgroundColor: "#2563eb", borderRadius: 30, padding: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  backupLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  backupIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.2)", justifyContent: "center", alignItems: "center" },
  backupTitle: { fontSize: 14, fontWeight: "700", color: "white" },
  backupSub: { fontSize: 11, color: "rgba(255,255,255,0.7)", marginTop: 2 },
  toggleTrack: { width: 48, height: 26, borderRadius: 13, backgroundColor: "white", justifyContent: "center", paddingRight: 4, alignItems: "flex-end" },
  toggleThumb: { width: 18, height: 18, borderRadius: 9, backgroundColor: "#2563eb" },
  navBar: { position: "absolute", bottom: 0, left: 0, right: 0, height: 72, backgroundColor: colors.surface.container, borderTopWidth: 1, borderTopColor: colors.glass.border, flexDirection: "row", justifyContent: "space-around", alignItems: "center", paddingHorizontal: 8 },
  navBtn: { flex: 1, alignItems: "center", justifyContent: "center", gap: 4, paddingVertical: 8 },
  navLabel: { fontSize: 10, color: colors.text.secondary, fontWeight: "500" },
  navLabelActive: { color: colors.primary, fontWeight: "700" },
  sosBtn: { width: 56, height: 56, borderRadius: 28, backgroundColor: "#E62E2E", justifyContent: "center", alignItems: "center", marginBottom: 12, shadowColor: "#E62E2E", shadowOpacity: 0.5, shadowRadius: 12, elevation: 8 },
});
