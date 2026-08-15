import React, { useState } from "react";
import { ScrollView, Text, View, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/types";
import { colors } from "@/theme/colors";

type Props = NativeStackScreenProps<RootStackParamList, "VaccinationCenter">;

const UPCOMING = [
  {
    name: "Influenza Vaccine",
    due: "Due in 3 days",
    doctor: "Dr. Sarah Wilson",
    location: "City Medical Center",
    bg: colors.primaryContainer,
    glow: "rgba(37,99,235,0.4)",
  },
  {
    name: "Hepatitis B Booster",
    due: "Due Oct 28",
    doctor: "Dr. James Carter",
    location: "Health Plus Clinic",
    bg: "#7c3aed",
    glow: "rgba(124,58,237,0.4)",
  },
];

const COMPLETED = [
  { name: "COVID-19 Vaccine", date: "Jan 15, 2026", doses: "2/2 Doses", color: "#4ade80" },
  { name: "Hepatitis A", date: "Mar 10, 2026", doses: "1/1 Dose", color: "#4ade80" },
  { name: "Tetanus Booster", date: "Jun 22, 2025", doses: "1/1 Dose", color: "#4ade80" },
];

const FAMILY = [
  { name: "Sarah", role: "Spouse", count: 3, pending: 1 },
  { name: "Tommy", role: "Child", count: 5, pending: 0 },
];

const NAV = [
  { icon: "home-outline", label: "Home", route: "HomeDashboard", active: false, sos: false },
  { icon: "grid-outline", label: "Categories", route: "MedicalRecords", active: false, sos: false },
  { icon: "alert-circle", label: "SOS", route: "EmergencyAssistance", active: false, sos: true },
  { icon: "people-outline", label: "Together", route: "FamilyDashboard", active: false, sos: false },
  { icon: "person-outline", label: "Profile", route: "Profile", active: false, sos: false },
];

const MONTH_TABS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function VaccinationCenterScreen({ navigation }: Props) {
  const [activeMonth, setActiveMonth] = useState(9); // October

  return (
    <View style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} style={s.iconBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.text.secondary} />
        </Pressable>
        <Text style={s.headerTitle}>Vaccination</Text>
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
          colors={["#0d9488", "#0891b2", "#1d4ed8"]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={s.hero}
        >
          <View style={s.heroTopRow}>
            <View style={s.heroTag}>
              <Ionicons name="shield-checkmark" size={14} color="#99f6e4" />
              <Text style={s.heroTagText}>VACCINATION CENTER</Text>
            </View>
            <View style={s.heroCompletedBadge}>
              <Text style={s.heroCompletedText}>5 of 7 Complete</Text>
            </View>
          </View>
          <Text style={s.heroTitle}>Immunisation{"\n"}Records</Text>
          <Text style={s.heroSub}>Track and manage your complete vaccination history with automated reminders.</Text>
          <View style={s.heroStats}>
            <View style={s.heroStat}>
              <Text style={s.heroStatValue}>5</Text>
              <Text style={s.heroStatLabel}>Completed</Text>
            </View>
            <View style={s.heroStatDivider} />
            <View style={s.heroStat}>
              <Text style={s.heroStatValue}>2</Text>
              <Text style={s.heroStatLabel}>Pending</Text>
            </View>
            <View style={s.heroStatDivider} />
            <View style={s.heroStat}>
              <Text style={s.heroStatValue}>71%</Text>
              <Text style={s.heroStatLabel}>Coverage</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Upcoming Vaccines */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Upcoming Vaccines</Text>
          <Pressable><Text style={s.seeAll}>View All</Text></Pressable>
        </View>
        <View style={s.upcomingList}>
          {UPCOMING.map((u) => (
            <View key={u.name} style={[s.upcomingCard, { backgroundColor: u.bg, shadowColor: u.glow }]}>
              <View style={s.upcomingRow}>
                <View style={s.vacIcon}>
                  <Ionicons name="shield-checkmark" size={22} color="white" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.upcomingName}>{u.name}</Text>
                  <Text style={s.upcomingDue}>{u.due}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.6)" />
              </View>
              <View style={s.upcomingDivider} />
              <View style={s.upcomingDetails}>
                <View style={s.upcomingDetail}>
                  <Ionicons name="person-outline" size={14} color="rgba(255,255,255,0.7)" />
                  <Text style={s.upcomingDetailText}>{u.doctor}</Text>
                </View>
                <View style={s.upcomingDetail}>
                  <Ionicons name="location-outline" size={14} color="rgba(255,255,255,0.7)" />
                  <Text style={s.upcomingDetailText}>{u.location}</Text>
                </View>
              </View>
              <View style={s.upcomingActions}>
                <Pressable style={s.scheduleBtn}>
                  <Text style={s.scheduleBtnText}>Schedule Now</Text>
                </Pressable>
                <Pressable style={s.setReminderBtn}>
                  <Ionicons name="notifications-outline" size={14} color={colors.text.secondary} />
                  <Text style={s.setReminderText}>Set Reminder</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>

        {/* Vaccination Calendar */}
        <Text style={s.sectionTitle}>Vaccination Calendar</Text>
        <View style={s.calendarCard}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.monthsRow}>
            {MONTH_TABS.map((m, i) => (
              <Pressable
                key={m}
                onPress={() => setActiveMonth(i)}
                style={[s.monthTab, activeMonth === i && s.monthTabActive]}
              >
                <Text style={[s.monthTabText, activeMonth === i && s.monthTabTextActive]}>{m}</Text>
              </Pressable>
            ))}
          </ScrollView>
          <View style={s.calendarBody}>
            <View style={s.calendarRow}>
              {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                <Text key={i} style={s.calDayHeader}>{d}</Text>
              ))}
            </View>
            {[[1,2,3,4,5,6,7],[8,9,10,11,12,13,14],[15,16,17,18,19,20,21],[22,23,24,25,26,27,28]].map((week, wi) => (
              <View key={wi} style={s.calendarRow}>
                {week.map((day) => (
                  <View
                    key={day}
                    style={[
                      s.calDay,
                      day === 25 && s.calDayHighlight,
                      day === 28 && s.calDayPurple,
                    ]}
                  >
                    <Text style={[
                      s.calDayText,
                      (day === 25 || day === 28) && s.calDayTextActive
                    ]}>{day}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        </View>

        {/* Two-col: Completed + Family */}
        <View style={s.twoCol}>
          {/* Completed Vaccines */}
          <View style={{ flex: 1 }}>
            <Text style={s.sectionTitle}>Completed</Text>
            <View style={s.completedList}>
              {COMPLETED.map((c) => (
                <View key={c.name} style={s.completedCard}>
                  <View style={[s.completedDot, { backgroundColor: c.color }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={s.completedName}>{c.name}</Text>
                    <Text style={s.completedDate}>{c.date}</Text>
                    <Text style={s.completedDoses}>{c.doses}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Family Members */}
          <View style={{ flex: 1 }}>
            <Text style={s.sectionTitle}>Family</Text>
            <View style={s.familyList}>
              {FAMILY.map((f) => (
                <Pressable
                  key={f.name}
                  onPress={() => navigation.navigate("FamilyDashboard")}
                  style={s.familyCard}
                >
                  <View style={s.familyAvatar}>
                    <Text style={s.familyAvatarText}>{f.name[0]}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.familyName}>{f.name}</Text>
                    <Text style={s.familyRole}>{f.role}</Text>
                  </View>
                  <View style={[s.familyPending, f.pending > 0 && s.familyPendingAlert]}>
                    <Text style={s.familyPendingText}>{f.count} vaccines</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        </View>

        {/* Reminder CTA */}
        <Pressable
          onPress={() => navigation.navigate("SmartReminders")}
          style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
        >
          <LinearGradient
            colors={["#0d9488", "#0891b2"]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={s.ctaBtn}
          >
            <Ionicons name="notifications-outline" size={22} color="white" />
            <Text style={s.ctaText}>Set Vaccination Reminder</Text>
            <Ionicons name="arrow-forward" size={20} color="white" />
          </LinearGradient>
        </Pressable>

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
  headerRight: { flexDirection: "row", gap: 4 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface.containerHigh, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: colors.glass.border },
  scroll: { paddingHorizontal: 16 },
  hero: { borderRadius: 32, padding: 24, marginBottom: 24, overflow: "hidden", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  heroTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  heroTag: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(0,0,0,0.25)", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, borderWidth: 1, borderColor: "rgba(255,255,255,0.15)" },
  heroTagText: { fontSize: 10, fontWeight: "700", color: "#99f6e4", letterSpacing: 0.5 },
  heroCompletedBadge: { backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, borderWidth: 1, borderColor: "rgba(255,255,255,0.2)" },
  heroCompletedText: { fontSize: 11, color: "white", fontWeight: "600" },
  heroTitle: { fontSize: 40, fontWeight: "700", color: "white", lineHeight: 48, marginBottom: 10 },
  heroSub: { fontSize: 14, color: "rgba(255,255,255,0.8)", marginBottom: 20, lineHeight: 22 },
  heroStats: { flexDirection: "row", backgroundColor: "rgba(0,0,0,0.2)", borderRadius: 20, padding: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", justifyContent: "space-around" },
  heroStat: { alignItems: "center" },
  heroStatValue: { fontSize: 22, fontWeight: "700", color: "white" },
  heroStatLabel: { fontSize: 11, color: "rgba(255,255,255,0.7)", marginTop: 2 },
  heroStatDivider: { width: 1, backgroundColor: "rgba(255,255,255,0.2)" },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  sectionTitle: { fontSize: 20, fontWeight: "700", color: colors.text.primary, marginBottom: 14 },
  seeAll: { fontSize: 13, color: colors.primary },
  upcomingList: { gap: 12, marginBottom: 24 },
  upcomingCard: { borderRadius: 28, padding: 20, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 1, shadowRadius: 20, elevation: 5 },
  upcomingRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  vacIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: "rgba(255,255,255,0.2)", justifyContent: "center", alignItems: "center" },
  upcomingName: { fontSize: 18, fontWeight: "700", color: "white" },
  upcomingDue: { fontSize: 13, color: "rgba(255,255,255,0.8)", marginTop: 2 },
  upcomingDivider: { height: 1, backgroundColor: "rgba(255,255,255,0.15)", marginVertical: 14 },
  upcomingDetails: { gap: 8, marginBottom: 14 },
  upcomingDetail: { flexDirection: "row", alignItems: "center", gap: 8 },
  upcomingDetailText: { fontSize: 13, color: "rgba(255,255,255,0.7)" },
  upcomingActions: { flexDirection: "row", gap: 10 },
  scheduleBtn: { flex: 1, backgroundColor: "white", borderRadius: 16, paddingVertical: 12, alignItems: "center" },
  scheduleBtnText: { fontSize: 14, fontWeight: "700", color: colors.primaryContainer },
  setReminderBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: "rgba(0,0,0,0.2)", borderRadius: 16, paddingVertical: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.15)" },
  setReminderText: { fontSize: 13, color: colors.text.secondary },
  calendarCard: { backgroundColor: colors.surface.containerHighest, borderRadius: 30, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: colors.glass.border },
  monthsRow: { marginBottom: 16 },
  monthTab: { backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, marginRight: 8 },
  monthTabActive: { backgroundColor: colors.primary },
  monthTabText: { fontSize: 12, color: colors.text.secondary },
  monthTabTextActive: { color: colors.onPrimary, fontWeight: "700" },
  calendarBody: { gap: 4 },
  calendarRow: { flexDirection: "row", justifyContent: "space-around" },
  calDayHeader: { width: 36, textAlign: "center", fontSize: 12, color: colors.text.muted, fontWeight: "600", marginBottom: 4 },
  calDay: { width: 36, height: 36, borderRadius: 18, justifyContent: "center", alignItems: "center" },
  calDayHighlight: { backgroundColor: colors.primary },
  calDayPurple: { backgroundColor: colors.tertiaryContainer },
  calDayText: { fontSize: 13, color: colors.text.secondary },
  calDayTextActive: { color: "white", fontWeight: "700" },
  twoCol: { flexDirection: "row", gap: 12, marginBottom: 20 },
  completedList: { gap: 8 },
  completedCard: { backgroundColor: colors.surface.containerHighest, borderRadius: 20, padding: 14, flexDirection: "row", alignItems: "flex-start", gap: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  completedDot: { width: 10, height: 10, borderRadius: 5, marginTop: 4 },
  completedName: { fontSize: 13, fontWeight: "700", color: colors.text.primary },
  completedDate: { fontSize: 11, color: colors.text.secondary, marginTop: 2 },
  completedDoses: { fontSize: 11, color: "#4ade80", marginTop: 2 },
  familyList: { gap: 8 },
  familyCard: { backgroundColor: colors.surface.containerHighest, borderRadius: 20, padding: 14, flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  familyAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary, justifyContent: "center", alignItems: "center" },
  familyAvatarText: { fontSize: 16, fontWeight: "700", color: colors.onPrimary },
  familyName: { fontSize: 14, fontWeight: "700", color: colors.text.primary },
  familyRole: { fontSize: 11, color: colors.text.secondary },
  familyPending: { backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4 },
  familyPendingAlert: { backgroundColor: "rgba(255,180,171,0.1)" },
  familyPendingText: { fontSize: 10, color: colors.text.secondary },
  ctaBtn: { borderRadius: 32, paddingVertical: 18, paddingHorizontal: 24, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 12 },
  ctaText: { fontSize: 17, fontWeight: "700", color: "white", flex: 1, textAlign: "center" },
  navBar: { position: "absolute", bottom: 0, left: 0, right: 0, height: 72, backgroundColor: colors.surface.container, borderTopWidth: 1, borderTopColor: colors.glass.border, flexDirection: "row", justifyContent: "space-around", alignItems: "center", paddingHorizontal: 8 },
  navBtn: { flex: 1, alignItems: "center", justifyContent: "center", gap: 4, paddingVertical: 8 },
  navLabel: { fontSize: 10, color: colors.text.secondary, fontWeight: "500" },
  navLabelActive: { color: colors.primary, fontWeight: "700" },
  sosBtn: { width: 56, height: 56, borderRadius: 28, backgroundColor: "#E62E2E", justifyContent: "center", alignItems: "center", marginBottom: 12, shadowColor: "#E62E2E", shadowOpacity: 0.5, shadowRadius: 12, elevation: 8 },
});
