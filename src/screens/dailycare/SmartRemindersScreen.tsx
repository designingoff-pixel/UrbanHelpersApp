import React from "react";
import { ScrollView, Text, View, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/types";
import { colors } from "@/theme/colors";

type Props = NativeStackScreenProps<RootStackParamList, "SmartReminders">;

const REMINDER_CARDS = [
  {
    title: "Medicine",
    sub: "Next dose in 2 hours",
    icon: "notifications",
    tags: ["Vitamin D", "Omega 3"],
    bg: ["#2563eb", "#1e3a8a"] as (string[]),
  },
  {
    title: "Appointments",
    sub: "Dr. Smith - 3:00 PM",
    icon: "calendar",
    extra: "Today · Clinic Visit",
    bg: [colors.tertiaryContainer, "#5a00c6"] as (string[]),
  },
  {
    title: "Health Checkup",
    sub: "Overdue by 5 days",
    icon: "pulse",
    alert: true,
    bg: ["#b91c1c", "#7f1d1d"] as (string[]),
  },
];

const NAV = [
  { icon: "heart", label: "Health", route: "HealthDashboard", active: true },
  { icon: "time-outline", label: "History", route: "MedicineHistory" },
  { icon: "alarm-outline", label: "Alarm", route: "MedicineAlarm" },
  { icon: "notifications", label: "Reminders", route: "SmartReminders" },
  { icon: "person-outline", label: "Profile", route: "Profile" },
];

export default function SmartRemindersScreen({ navigation }: Props) {
  return (
    <View style={s.root}>
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} style={s.iconBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.text.secondary} />
        </Pressable>
        <Text style={s.headerTitle}>Smart Reminders</Text>
        <Pressable style={s.iconBtn}>
          <Ionicons name="settings-outline" size={22} color={colors.text.secondary} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {/* Hero */}
        <LinearGradient
          colors={["#F9C74F", "#F8961E", "#F3722C"]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={s.hero}
        >
          <Text style={s.heroTitle}>Reminders</Text>
          <Text style={s.heroSub}>Manage every important reminder.</Text>
        </LinearGradient>

        {/* Reminder Cards */}
        <View style={s.cardsGrid}>
          {REMINDER_CARDS.map((c) => (
            <LinearGradient
              key={c.title}
              colors={c.bg}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={s.reminderCard}
            >
              <View style={s.reminderTop}>
                <View>
                  <Text style={s.reminderTitle}>{c.title}</Text>
                  <Text style={s.reminderSub}>{c.sub}</Text>
                </View>
                <View style={s.reminderIconWrap}>
                  <Ionicons name={c.icon as any} size={24} color="white" />
                </View>
              </View>
              {c.tags && (
                <View style={s.tagRow}>
                  {c.tags.map((t) => (
                    <View key={t} style={s.tag}><Text style={s.tagText}>{t}</Text></View>
                  ))}
                </View>
              )}
              {c.extra && (
                <View style={s.extraBox}>
                  <Text style={s.extraText}>{c.extra}</Text>
                </View>
              )}
              {c.alert && (
                <Pressable
                  style={s.alertBtn}
                  onPress={() => navigation.navigate("HealthDashboard")}
                >
                  <Text style={s.alertBtnText}>Schedule Now</Text>
                </Pressable>
              )}
            </LinearGradient>
          ))}

          {/* Add Custom */}
          <Pressable style={s.addCard}>
            <View style={s.addIcon}>
              <Ionicons name="add" size={32} color={colors.secondary} />
            </View>
            <Text style={s.addTitle}>Custom Reminders</Text>
            <Text style={s.addSub}>Create a new task</Text>
          </Pressable>
        </View>

        {/* Upcoming List */}
        <Text style={s.sectionTitle}>Upcoming</Text>
        <View style={s.upcomingList}>
          {[
            { time: "2:00 PM", label: "Amoxicillin 500mg", icon: "medical", color: colors.secondary },
            { time: "3:00 PM", label: "Dr. Smith Appointment", icon: "person", color: colors.primary },
            { time: "8:00 PM", label: "Vitamin D3 1000 IU", icon: "sunny", color: "#f59e0b" },
          ].map((u) => (
            <View key={u.label} style={s.upcomingRow}>
              <View style={[s.upcomingIcon, { backgroundColor: `${u.color}22` }]}>
                <Ionicons name={u.icon as any} size={20} color={u.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.upcomingLabel}>{u.label}</Text>
                <Text style={s.upcomingTime}>{u.time}</Text>
              </View>
              <Pressable style={s.upcomingEdit}>
                <Ionicons name="pencil-outline" size={16} color={colors.text.secondary} />
              </Pressable>
            </View>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Nav */}
      <View style={s.navBar}>
        {NAV.map((n) => (
          <Pressable key={n.label} onPress={() => navigation.navigate(n.route as any)} style={s.navBtn}>
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
  headerTitle: { fontSize: 22, fontWeight: "700", color: colors.text.primary },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface.containerHigh, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: colors.glass.border },
  scroll: { paddingHorizontal: 16 },
  hero: { borderRadius: 32, padding: 28, marginBottom: 24, minHeight: 160 },
  heroTitle: { fontSize: 40, fontWeight: "700", color: "#002a78" },
  heroSub: { fontSize: 18, color: "#003ea8", marginTop: 4 },
  cardsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 24 },
  reminderCard: { width: "47%", borderRadius: 28, padding: 18, gap: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.15)", minHeight: 160 },
  reminderTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  reminderTitle: { fontSize: 18, fontWeight: "700", color: "white", marginBottom: 4 },
  reminderSub: { fontSize: 12, color: "rgba(255,255,255,0.8)" },
  reminderIconWrap: { width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.2)", justifyContent: "center", alignItems: "center" },
  tagRow: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
  tag: { backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  tagText: { fontSize: 11, color: "white", fontWeight: "600" },
  extraBox: { backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 12, padding: 8 },
  extraText: { fontSize: 12, color: "white" },
  alertBtn: { backgroundColor: "white", borderRadius: 14, padding: 10, alignItems: "center" },
  alertBtnText: { fontSize: 13, fontWeight: "700", color: "#b91c1c" },
  addCard: { width: "47%", backgroundColor: colors.surface.containerHighest, borderRadius: 28, padding: 18, alignItems: "center", justifyContent: "center", minHeight: 160, borderWidth: 1, borderColor: colors.glass.border },
  addIcon: { width: 56, height: 56, borderRadius: 28, backgroundColor: "rgba(79,219,200,0.15)", justifyContent: "center", alignItems: "center", marginBottom: 8 },
  addTitle: { fontSize: 16, fontWeight: "700", color: colors.text.primary, textAlign: "center" },
  addSub: { fontSize: 12, color: colors.text.secondary, textAlign: "center", marginTop: 4 },
  sectionTitle: { fontSize: 20, fontWeight: "700", color: colors.text.primary, marginBottom: 14 },
  upcomingList: { gap: 10, marginBottom: 8 },
  upcomingRow: { flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: colors.surface.containerHigh, borderRadius: 20, padding: 14, borderWidth: 1, borderColor: colors.glass.border },
  upcomingIcon: { width: 44, height: 44, borderRadius: 22, justifyContent: "center", alignItems: "center" },
  upcomingLabel: { fontSize: 15, fontWeight: "700", color: colors.text.primary },
  upcomingTime: { fontSize: 12, color: colors.text.secondary, marginTop: 2 },
  upcomingEdit: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surface.containerHighest, justifyContent: "center", alignItems: "center" },
  navBar: { position: "absolute", bottom: 0, left: 0, right: 0, height: 72, backgroundColor: colors.surface.container, borderTopWidth: 1, borderTopColor: colors.glass.border, flexDirection: "row", justifyContent: "space-around", alignItems: "center", paddingHorizontal: 8 },
  navBtn: { flex: 1, alignItems: "center", justifyContent: "center", gap: 4, paddingVertical: 8 },
  navLabel: { fontSize: 10, color: colors.text.secondary, fontWeight: "500" },
  navLabelActive: { color: colors.primary, fontWeight: "700" },
});
