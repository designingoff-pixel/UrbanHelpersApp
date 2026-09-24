import React from "react";
import { ScrollView, Text, View, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/types";
import { colors } from "@/theme/colors";

type Props = NativeStackScreenProps<RootStackParamList, "LabReportsHub">;

const CATEGORIES = [
  { label: "Blood", icon: "water", bg: colors.error },
  { label: "Urine", icon: "flask", bg: colors.secondary },
  { label: "ECG", icon: "pulse", bg: colors.tertiary },
  { label: "MRI", icon: "scan", bg: colors.primary },
  { label: "X-Ray", icon: "radio-button-on", bg: "#04b4a2" },
  { label: "CT Scan", icon: "layers", bg: "#0053db" },
];

const REPORTS = [
  { name: "CBC Analysis", date: "Oct 24, 2026 • City Hospital", icon: "document" },
  { name: "Chest X-Ray", date: "Sep 12, 2026 • Metro Diagnostics", icon: "image" },
  { name: "Lipid Profile", date: "Aug 30, 2026 • City Lab", icon: "flask" },
];

const AI_MARKERS = [
  { label: "Vitamin D", value: "24 ng/mL ↓", alert: true },
  { label: "Cholesterol", value: "185 mg/dL ✓", alert: false },
];

const NAV = [
  { icon: "home-outline", label: "Home", route: "HomeDashboard" },
  { icon: "grid-outline", label: "Categories", route: "MedicalRecords", active: true },
  { icon: "alert-circle", label: "SOS", route: "EmergencyAssistance", sos: true },
  { icon: "heart-outline", label: "Health", route: "HealthDashboard" },
  { icon: "person-outline", label: "Profile", route: "Profile" },
];

export default function LabReportsHubScreen({ navigation }: Props) {
  return (
    <View style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} style={s.iconBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.text.secondary} />
        </Pressable>
        <Text style={s.headerTitle}>Lab Reports</Text>
        <View style={s.headerRight}>
          <Pressable style={s.iconBtn}>
            <Ionicons name="search-outline" size={22} color={colors.text.secondary} />
          </Pressable>
          <Pressable style={s.iconBtn}>
            <Ionicons name="filter-outline" size={22} color={colors.text.secondary} />
          </Pressable>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {/* Hero */}
        <LinearGradient
          colors={["#3f008e", "#5a00c6", "#003ea8"]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={s.hero}
        >
          <Text style={s.heroTitle}>Medical Reports</Text>
          <Text style={s.heroSub}>All diagnostic reports stored securely.</Text>
        </LinearGradient>

        {/* Categories */}
        <Text style={s.sectionTitle}>Categories</Text>
        <View style={s.catGrid}>
          {CATEGORIES.map((c) => (
            <Pressable
              key={c.label}
              style={({ pressed }) => [s.catCard, { opacity: pressed ? 0.8 : 1 }]}
            >
              <View style={[s.catIcon, { backgroundColor: c.bg }]}>
                <Ionicons name={c.icon as any} size={22} color="white" />
              </View>
              <Text style={s.catLabel}>{c.label}</Text>
            </Pressable>
          ))}
        </View>

        {/* AI Insights */}
        <Text style={s.sectionTitle}>AI Insights</Text>
        <View style={s.aiCard}>
          <View style={s.aiHeader}>
            <Ionicons name="sparkles" size={18} color={colors.tertiary} />
            <Text style={s.aiTitle}>Latest Blood Panel</Text>
          </View>
          <Text style={s.aiSub}>
            Your recent panel shows overall stable markers. However, Vitamin D levels remain slightly below optimal range.
          </Text>
          <View style={s.aiMarkers}>
            {AI_MARKERS.map((m) => (
              <View key={m.label} style={s.aiRow}>
                <Text style={s.aiMarkerLabel}>{m.label}</Text>
                <Text style={[s.aiMarkerValue, { color: m.alert ? colors.error : colors.secondary }]}>
                  {m.value}
                </Text>
              </View>
            ))}
          </View>
          <View style={s.discussBox}>
            <Ionicons name="chatbubble-outline" size={14} color={colors.primary} />
            <Text style={s.discussTitle}> Discuss with Doctor</Text>
          </View>
          <View style={s.discussList}>
            <Text style={s.discussItem}>• Options for Vitamin D supplementation.</Text>
            <Text style={s.discussItem}>• Impact of recent dietary changes.</Text>
          </View>
        </View>

        {/* Recent Reports */}
        <Text style={s.sectionTitle}>Recent Reports</Text>
        <View style={s.reportList}>
          {REPORTS.map((r) => (
            <View key={r.name} style={s.reportCard}>
              <View style={s.reportIcon}>
                <Ionicons name={r.icon as any} size={24} color={colors.primary} />
              </View>
              <View style={s.reportInfo}>
                <Text style={s.reportName}>{r.name}</Text>
                <Text style={s.reportDate}>{r.date}</Text>
              </View>
              <View style={s.reportActions}>
                <Pressable style={s.actionBtn}>
                  <Ionicons name="download-outline" size={18} color={colors.primary} />
                </Pressable>
                <Pressable style={s.actionBtn}>
                  <Ionicons name="share-outline" size={18} color={colors.primary} />
                </Pressable>
              </View>
            </View>
          ))}
        </View>

        {/* Storage & Security */}
        <View style={s.bottomRow}>
          <View style={s.storageCard}>
            <View style={s.storageHeader}>
              <Ionicons name="cloud-outline" size={20} color={colors.secondary} />
              <Text style={s.storageTitle}>Cloud Storage</Text>
            </View>
            <Text style={s.storageSub}>Your data is synced across secure networks.</Text>
          </View>
          <View style={s.securityCard}>
            <View style={s.storageHeader}>
              <Ionicons name="shield-checkmark-outline" size={20} color={colors.primary} />
              <Text style={s.storageTitle}>Security</Text>
            </View>
            <Text style={s.storageSub}>End-to-end encrypted.</Text>
            <View style={s.secRow}>
              <Ionicons name="lock-closed" size={14} color={colors.secondary} />
              <Text style={s.secText}>256-bit Encryption</Text>
            </View>
            <View style={s.secRow}>
              <Ionicons name="finger-print" size={14} color={colors.tertiary} />
              <Text style={s.secText}>Biometric Required</Text>
            </View>
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
  headerTitle: { fontSize: 22, fontWeight: "700", color: colors.primary },
  headerRight: { flexDirection: "row", gap: 4 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface.containerHigh, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: colors.glass.border },
  scroll: { paddingHorizontal: 16 },
  hero: { borderRadius: 30, padding: 28, marginBottom: 24, minHeight: 160, justifyContent: "flex-end" },
  heroTitle: { fontSize: 36, fontWeight: "700", color: "white", marginBottom: 8 },
  heroSub: { fontSize: 16, color: "rgba(238,239,255,0.8)" },
  sectionTitle: { fontSize: 22, fontWeight: "700", color: colors.text.primary, marginBottom: 14 },
  catGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 24 },
  catCard: { width: "30%", backgroundColor: colors.surface.containerHigh, borderRadius: 20, padding: 16, alignItems: "center", gap: 8, borderWidth: 1, borderColor: colors.glass.border },
  catIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: "center", alignItems: "center" },
  catLabel: { fontSize: 12, color: "white", fontWeight: "600" },
  aiCard: { backgroundColor: colors.glass.background, borderRadius: 30, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: colors.glass.border },
  aiHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
  aiTitle: { fontSize: 16, fontWeight: "700", color: colors.tertiary },
  aiSub: { fontSize: 13, color: colors.text.secondary, marginBottom: 14, lineHeight: 20 },
  aiMarkers: { gap: 8, marginBottom: 14 },
  aiRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: colors.surface.containerHighest, borderRadius: 12, padding: 10 },
  aiMarkerLabel: { fontSize: 13, color: colors.text.secondary },
  aiMarkerValue: { fontSize: 13, fontWeight: "700" },
  discussBox: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  discussTitle: { fontSize: 14, fontWeight: "700", color: colors.primary },
  discussList: { gap: 4 },
  discussItem: { fontSize: 12, color: colors.text.secondary },
  reportList: { gap: 12, marginBottom: 20 },
  reportCard: { backgroundColor: colors.surface.containerHighest, borderRadius: 20, padding: 16, flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "rgba(180,197,255,0.2)" },
  reportIcon: { width: 56, height: 56, backgroundColor: "rgba(180,197,255,0.1)", borderRadius: 14, justifyContent: "center", alignItems: "center", marginRight: 14 },
  reportInfo: { flex: 1 },
  reportName: { fontSize: 15, fontWeight: "700", color: "white" },
  reportDate: { fontSize: 12, color: colors.text.secondary, marginTop: 3 },
  reportActions: { flexDirection: "row", gap: 8 },
  actionBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface.container, justifyContent: "center", alignItems: "center" },
  bottomRow: { flexDirection: "row", gap: 12, marginBottom: 8 },
  storageCard: { flex: 1, backgroundColor: "#18344F", borderRadius: 30, padding: 16, borderWidth: 1, borderColor: colors.glass.border },
  securityCard: { flex: 1, backgroundColor: colors.glass.background, borderRadius: 30, padding: 16, borderWidth: 1, borderColor: colors.glass.border },
  storageHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  storageTitle: { fontSize: 16, fontWeight: "700", color: colors.text.primary },
  storageSub: { fontSize: 12, color: colors.text.secondary, marginBottom: 10 },
  secRow: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 10, padding: 8, marginBottom: 6 },
  secText: { fontSize: 12, color: colors.text.primary },
  navBar: { position: "absolute", bottom: 0, left: 0, right: 0, height: 72, backgroundColor: colors.surface.container, borderTopWidth: 1, borderTopColor: colors.glass.border, flexDirection: "row", justifyContent: "space-around", alignItems: "center", paddingHorizontal: 8 },
  navBtn: { flex: 1, alignItems: "center", justifyContent: "center", gap: 4, paddingVertical: 8 },
  navLabel: { fontSize: 10, color: colors.text.secondary, fontWeight: "500" },
  navLabelActive: { color: colors.primary, fontWeight: "700" },
  sosBtn: { width: 56, height: 56, borderRadius: 28, backgroundColor: "#E62E2E", justifyContent: "center", alignItems: "center", marginBottom: 12, shadowColor: "#E62E2E", shadowOpacity: 0.5, shadowRadius: 12, elevation: 8 },
});
