import React from "react";
import { ScrollView, Text, View, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/types";
import { colors } from "@/theme/colors";

type Props = NativeStackScreenProps<RootStackParamList, "FamilyDashboard">;

const MEMBERS = [
  { name: "Mother", status: "Stable", score: 98, color: "#34d399", barColor: "#34d399", width: "98%" },
  { name: "Father", status: "Stable", score: 85, color: colors.primary, barColor: colors.primary, width: "85%" },
  { name: "Child", status: "Active", score: 99, color: "#fbbf24", barColor: "#fbbf24", width: "99%" },
];

const HEALTH_TILES = [
  { icon: "heart", label: "Heart", sub: "72 BPM • Normal", bg: "rgba(239,68,68,0.8)" },
  { icon: "medical", label: "Medication", sub: "2 Due Today", bg: "rgba(16,185,129,0.8)" },
  { icon: "moon", label: "Sleep", sub: "7h 20m • Good", bg: "rgba(131,67,244,0.8)" },
  { icon: "flash", label: "Activity", sub: "8,400 steps", bg: "rgba(245,158,11,0.8)" },
];

const NAV = [
  { icon: "home-outline", route: "HomeDashboard" },
  { icon: "heart-outline", route: "HealthDashboard" },
  { icon: "compass-outline", route: "Discover" },
  { icon: "barbell-outline", route: "FitnessDashboard" },
  { icon: "person-outline", route: "Profile" },
];

export default function FamilyDashboardScreen({ navigation }: Props) {
  return (
    <View style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.pageTitle}>Family</Text>
        <Pressable style={s.iconBtn}>
          <Ionicons name="notifications-outline" size={20} color={colors.text.secondary} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {/* Hero */}
        <LinearGradient colors={["#FF8C00", "#FF1493"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.hero}>
          <View>
            <Text style={s.heroTitle}>Your Family's Health</Text>
            <Text style={s.heroSub}>Monitor everyone in one place.</Text>
            <Pressable style={s.heroBtn}>
              <Text style={s.heroBtnText}>Manage Family</Text>
            </Pressable>
          </View>
          <View style={s.heroIllustration}>
            <Ionicons name="people" size={80} color="rgba(255,255,255,0.3)" />
          </View>
        </LinearGradient>

        {/* Members */}
        <Text style={s.sectionTitle}>Members</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.memberScroll}>
          {MEMBERS.map((m) => (
            <View key={m.name} style={[s.memberCard, { borderColor: `${m.color}50`, backgroundColor: `${m.color}20` }]}>
              <View style={[s.memberAvatar, { borderColor: m.color }]}>
                <Ionicons name="person" size={32} color={m.color} />
              </View>
              <Text style={s.memberName}>{m.name}</Text>
              <Text style={[s.memberStatus, { color: m.color }]}>{m.status}</Text>
              <View style={s.memberBar}>
                <View style={[s.memberBarFill, { width: m.width as any, backgroundColor: m.barColor }]} />
              </View>
              <Text style={[s.memberScore, { color: m.color }]}>{m.score}% Health Score</Text>
            </View>
          ))}
        </ScrollView>

        {/* Health Overview */}
        <Text style={s.sectionTitle}>Health Overview</Text>
        <View style={s.tileGrid}>
          {HEALTH_TILES.map((t) => (
            <View key={t.label} style={[s.tile, { backgroundColor: t.bg }]}>
              <Ionicons name={t.icon as any} size={32} color="white" />
              <Text style={s.tileLabel}>{t.label}</Text>
              <Text style={s.tileSub}>{t.sub}</Text>
            </View>
          ))}
          {/* Appointment tile — spans 2 */}
          <Pressable onPress={() => navigation.navigate("DoctorAdvice")} style={s.apptTile}>
            <View style={s.apptTop}>
              <Ionicons name="calendar" size={32} color={colors.primaryFixed} />
              <Text style={s.apptDir}>Get Directions</Text>
            </View>
            <Text style={s.apptTitle}>Appointments</Text>
            <Text style={s.apptSub}>Dr. Smith • Cardiology</Text>
            <Text style={s.apptTime}>Tomorrow, 10:30 AM</Text>
          </Pressable>
        </View>

        {/* Quick Links */}
        <Text style={s.sectionTitle}>Quick Links</Text>
        <View style={s.quickLinks}>
          {[
            { label: "Medical Records", icon: "document-text", route: "MedicalRecords" },
            { label: "Medication", icon: "medical", route: "MedicationCenter" },
            { label: "Emergency", icon: "alert-circle", route: "EmergencyAssistance" },
          ].map((q) => (
            <Pressable key={q.label} onPress={() => navigation.navigate(q.route as any)} style={s.quickLink}>
              <Ionicons name={q.icon as any} size={20} color={colors.primary} />
              <Text style={s.quickLinkLabel}>{q.label}</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.text.secondary} />
            </Pressable>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Nav */}
      <View style={s.navBar}>
        {NAV.map((n) => (
          <Pressable key={n.route} onPress={() => navigation.navigate(n.route as any)} style={s.navBtn}>
            <Ionicons name={n.icon as any} size={22} color={colors.text.secondary} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface.dim },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingTop: 52, paddingBottom: 12 },
  pageTitle: { fontSize: 28, fontWeight: "700", color: colors.text.primary },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface.containerHigh, borderWidth: 1, borderColor: colors.glass.border, justifyContent: "center", alignItems: "center" },
  scroll: { paddingHorizontal: 16 },
  hero: { borderRadius: 30, padding: 24, marginBottom: 20, flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.15)" },
  heroTitle: { fontSize: 24, fontWeight: "700", color: "white", marginBottom: 8 },
  heroSub: { fontSize: 14, color: "rgba(255,255,255,0.9)", marginBottom: 16 },
  heroBtn: { backgroundColor: "rgba(255,255,255,0.2)", borderWidth: 1, borderColor: "rgba(255,255,255,0.3)", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 16, alignSelf: "flex-start" },
  heroBtnText: { color: "white", fontSize: 14, fontWeight: "700" },
  heroIllustration: { opacity: 0.6 },
  sectionTitle: { fontSize: 20, fontWeight: "700", color: colors.text.primary, marginBottom: 12 },
  memberScroll: { marginBottom: 20, marginHorizontal: -16 },
  memberCard: { marginLeft: 16, borderRadius: 30, padding: 20, minWidth: 200, alignItems: "center", borderWidth: 1, marginRight: 4 },
  memberAvatar: { width: 80, height: 80, borderRadius: 40, borderWidth: 2, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(255,255,255,0.1)", marginBottom: 12 },
  memberName: { fontSize: 18, fontWeight: "700", color: "white", marginBottom: 4 },
  memberStatus: { fontSize: 14, fontWeight: "500", marginBottom: 12 },
  memberBar: { width: "100%", height: 8, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 4, overflow: "hidden", marginBottom: 8 },
  memberBarFill: { height: "100%", borderRadius: 4 },
  memberScore: { fontSize: 12, fontWeight: "600" },
  tileGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 20 },
  tile: { width: "47%", borderRadius: 24, padding: 16, gap: 6, borderWidth: 1, borderColor: "rgba(255,255,255,0.2)", aspectRatio: 1 },
  tileLabel: { fontSize: 14, fontWeight: "700", color: "white" },
  tileSub: { fontSize: 12, color: "rgba(255,255,255,0.8)" },
  apptTile: { width: "100%", borderRadius: 24, padding: 16, backgroundColor: "rgba(245,158,11,0.9)", borderWidth: 1, borderColor: "rgba(255,255,255,0.2)" },
  apptTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  apptDir: { fontSize: 11, fontWeight: "700", color: colors.primaryFixed },
  apptTitle: { fontSize: 18, fontWeight: "700", color: colors.primaryFixed },
  apptSub: { fontSize: 14, color: "rgba(0,23,75,0.8)" },
  apptTime: { fontSize: 12, fontWeight: "700", color: colors.primaryFixed, marginTop: 4 },
  quickLinks: { gap: 8, marginBottom: 8 },
  quickLink: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: colors.surface.containerHigh, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.glass.border },
  quickLinkLabel: { flex: 1, fontSize: 14, fontWeight: "600", color: colors.text.primary },
  navBar: { position: "absolute", bottom: 0, left: 0, right: 0, flexDirection: "row", justifyContent: "space-around", alignItems: "center", height: 80, marginHorizontal: 16, marginBottom: 16, backgroundColor: colors.glass.background, borderRadius: 32, borderWidth: 1, borderColor: colors.glass.border },
  navBtn: { width: 48, height: 48, borderRadius: 24, justifyContent: "center", alignItems: "center" },
});
