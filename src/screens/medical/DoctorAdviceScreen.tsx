import React from "react";
import { ScrollView, Text, View, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/types";
import { colors } from "@/theme/colors";

type Props = NativeStackScreenProps<RootStackParamList, "DoctorAdvice">;

const TODAY_ADVICE = [
  { icon: "water", label: "Stay Hydrated", sub: "Drink 8 glasses of water", bg: "#0891b2" },
  { icon: "medical", label: "Take Medicines", sub: "After lunch", bg: "#e11d48" },
  { icon: "walk", label: "Morning Walk", sub: "30 minutes minimum", bg: "#7c3aed" },
  { icon: "leaf", label: "Reduce Stress", sub: "15 mins mindfulness", bg: "#059669" },
];

const TIMELINE = [
  { icon: "checkmark", label: "Appointment", sub: "Oct 12, 10:00 AM", done: true },
  { icon: "stethoscope", label: "Diagnosis", sub: "Reviewing symptoms", done: true },
  { icon: "medical", label: "Prescription", sub: "Pending generation", done: false },
  { icon: "heart", label: "Follow-up", sub: "To be scheduled", done: false },
];

const NAV = [
  { icon: "home-outline", label: "Home", route: "HomeDashboard" },
  { icon: "heart", label: "Health", route: "HealthDashboard", active: true },
  { icon: "people-outline", label: "Together", route: "FamilyDashboard" },
  { icon: "person-outline", label: "Profile", route: "Profile" },
];

export default function DoctorAdviceScreen({ navigation }: Props) {
  return (
    <View style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} style={s.iconBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.text.secondary} />
        </Pressable>
        <Text style={s.headerTitle}>Doctor Advice</Text>
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
        <View style={s.heroCard}>
          <LinearGradient
            colors={["#10b981", "#059669", "#0f766e"]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={s.heroTag}>
            <Ionicons name="shield-checkmark" size={14} color={colors.primaryFixed} />
            <Text style={s.heroTagText}>Personal Medical Guidance</Text>
          </View>
          <Text style={s.heroTitle}>Receive recommendations from your healthcare professionals</Text>
          <Pressable style={s.heroBtn} onPress={() => navigation.navigate("MedicalRecords")}>
            <Ionicons name="calendar-outline" size={18} color={colors.onPrimary} />
            <Text style={s.heroBtnText}>View Consultation</Text>
          </Pressable>
        </View>

        {/* Doctor Notes */}
        <View style={s.notesCard}>
          <View style={s.notesHeader}>
            <Ionicons name="receipt-outline" size={20} color="white" />
            <Text style={s.notesTitle}>Doctor Notes</Text>
          </View>
          <View style={s.noteRow}>
            <Ionicons name="information-circle" size={20} color="rgba(255,255,255,0.8)" style={{ marginTop: 2 }} />
            <Text style={s.noteText}>
              Patient showing signs of mild dehydration and elevated stress levels. Recommended increasing daily water intake and incorporating 15 minutes of mindfulness practice. Blood pressure is normal.
            </Text>
          </View>
          <View style={s.noteRow}>
            <Ionicons name="warning" size={20} color="rgba(255,255,255,0.8)" style={{ marginTop: 2 }} />
            <Text style={s.noteText}>
              Follow up in two weeks if sleep quality does not improve with suggested evening routine adjustments.
            </Text>
          </View>
        </View>

        {/* Two-col: Today's Advice + Timeline */}
        <View style={s.twoCol}>
          {/* Today's Advice */}
          <View style={{ flex: 1 }}>
            <Text style={s.sectionTitle}>Today's Advice</Text>
            <View style={s.adviceList}>
              {TODAY_ADVICE.map((a) => (
                <Pressable
                  key={a.label}
                  style={({ pressed }) => [s.adviceCard, { backgroundColor: a.bg, opacity: pressed ? 0.85 : 1 }]}
                >
                  <View style={s.adviceIcon}>
                    <Ionicons name={a.icon as any} size={22} color="white" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.adviceLabel}>{a.label}</Text>
                    <Text style={s.adviceSub}>{a.sub}</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Timeline */}
          <View style={{ flex: 1 }}>
            <Text style={s.sectionTitle}>Timeline</Text>
            <View style={s.timelineCard}>
              {TIMELINE.map((t, i) => (
                <View key={t.label} style={[s.timelineRow, i < TIMELINE.length - 1 && s.timelineRowBorder]}>
                  <View style={[s.timelineIcon, t.done ? s.timelineIconDone : s.timelineIconPending]}>
                    <Ionicons name={t.icon as any} size={16} color={t.done ? "#0f766e" : "rgba(255,255,255,0.5)"} />
                  </View>
                  <View>
                    <Text style={[s.timelineLabel, !t.done && s.timelineLabelMuted]}>{t.label}</Text>
                    <Text style={s.timelineSub}>{t.sub}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Book Follow-up CTA */}
        <Pressable
          onPress={() => navigation.navigate("MedicalRecords")}
          style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
        >
          <LinearGradient
            colors={[colors.primary, colors.tertiaryContainer]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={s.ctaBtn}
          >
            <Text style={s.ctaText}>Book Follow-up Appointment</Text>
            <Ionicons name="arrow-forward" size={20} color="white" />
          </LinearGradient>
        </Pressable>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Nav */}
      <View style={s.navBar}>
        {NAV.map((n) => (
          <Pressable
            key={n.route}
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
  headerTitle: { fontSize: 22, fontWeight: "700", color: colors.primary },
  headerRight: { flexDirection: "row", gap: 4 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface.containerHigh, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: colors.glass.border },
  scroll: { paddingHorizontal: 16 },
  heroCard: { borderRadius: 32, padding: 24, marginBottom: 16, minHeight: 220, overflow: "hidden", justifyContent: "flex-end", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  heroTag: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, alignSelf: "flex-start", marginBottom: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.2)" },
  heroTagText: { fontSize: 11, fontWeight: "700", color: colors.primaryFixed },
  heroTitle: { fontSize: 22, fontWeight: "700", color: "white", marginBottom: 20, lineHeight: 32 },
  heroBtn: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: colors.primary, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 16, alignSelf: "flex-start" },
  heroBtnText: { color: colors.onPrimary, fontSize: 15, fontWeight: "700" },
  notesCard: { backgroundColor: "#0f766e", borderRadius: 28, padding: 20, marginBottom: 20, gap: 12 },
  notesHeader: { flexDirection: "row", alignItems: "center", gap: 10, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.2)", paddingBottom: 12, marginBottom: 4 },
  notesTitle: { fontSize: 18, fontWeight: "700", color: "white" },
  noteRow: { flexDirection: "row", gap: 12 },
  noteText: { flex: 1, fontSize: 14, color: "rgba(255,255,255,0.9)", lineHeight: 22 },
  twoCol: { flexDirection: "row", gap: 12, marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: colors.text.primary, marginBottom: 12 },
  adviceList: { gap: 10 },
  adviceCard: { flexDirection: "row", alignItems: "center", borderRadius: 24, padding: 14, gap: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.15)" },
  adviceIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.2)", justifyContent: "center", alignItems: "center" },
  adviceLabel: { fontSize: 14, fontWeight: "700", color: "white" },
  adviceSub: { fontSize: 12, color: "rgba(255,255,255,0.8)", marginTop: 2 },
  timelineCard: { backgroundColor: "#0f766e", borderRadius: 24, padding: 16, gap: 4 },
  timelineRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12 },
  timelineRowBorder: { borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.15)" },
  timelineIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: "center", alignItems: "center" },
  timelineIconDone: { backgroundColor: "white" },
  timelineIconPending: { backgroundColor: "rgba(255,255,255,0.1)", borderWidth: 1, borderColor: "rgba(255,255,255,0.5)" },
  timelineLabel: { fontSize: 14, fontWeight: "700", color: "white" },
  timelineLabelMuted: { color: "rgba(255,255,255,0.5)" },
  timelineSub: { fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 2 },
  ctaBtn: { borderRadius: 32, paddingVertical: 18, paddingHorizontal: 24, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 12 },
  ctaText: { fontSize: 18, fontWeight: "700", color: "white" },
  navBar: { position: "absolute", bottom: 0, left: 0, right: 0, height: 72, backgroundColor: colors.surface.container, borderTopWidth: 1, borderTopColor: colors.glass.border, flexDirection: "row", justifyContent: "space-around", alignItems: "center", paddingHorizontal: 8 },
  navBtn: { flex: 1, alignItems: "center", justifyContent: "center", gap: 4, paddingVertical: 8 },
  navLabel: { fontSize: 10, color: colors.text.secondary, fontWeight: "500" },
  navLabelActive: { color: colors.primary, fontWeight: "700" },
});
