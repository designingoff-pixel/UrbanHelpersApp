import React from "react";
import { ScrollView, Text, View, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/types";
import { colors } from "@/theme/colors";

type Props = NativeStackScreenProps<RootStackParamList, "MedicineHistory">;

const COMPLETED = [
  { name: "Amoxicillin", dose: "500mg · 8:00 AM", done: true },
  { name: "Vitamin D3", dose: "2000 IU · 12:30 PM", done: true },
];

const TIMELINE = [
  { name: "Ibuprofen", date: "Yesterday, 9:00 PM", icon: "medical", recent: true },
  { name: "Amoxicillin", date: "Yesterday, 8:00 AM", icon: "medical", recent: false },
  { name: "Lab Test", date: "Oct 24, 10:00 AM", icon: "flask", recent: false },
  { name: "Vitamin D3", date: "Oct 23, 8:00 PM", icon: "sunny", recent: false },
];

const WEEK_HEIGHTS = [80, 90, 100, 70, 85, 95, 50];
const WEEK_DAYS = ["M", "T", "W", "T", "F", "S", "S"];

const NAV = [
  { icon: "heart", label: "Health", route: "HealthDashboard", active: true },
  { icon: "time", label: "History", route: "MedicineHistory" },
  { icon: "alarm-outline", label: "Alarm", route: "MedicineAlarm" },
  { icon: "notifications-outline", label: "Reminders", route: "SmartReminders" },
  { icon: "person-outline", label: "Profile", route: "Profile" },
];

export default function MedicineHistoryScreen({ navigation }: Props) {
  return (
    <View style={s.root}>
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} style={s.iconBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.text.secondary} />
        </Pressable>
        <Text style={s.headerTitle}>Medicine History</Text>
        <Pressable style={s.iconBtn}>
          <Ionicons name="search-outline" size={22} color={colors.text.secondary} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {/* Hero */}
        <LinearGradient
          colors={["#00B894", "#00CEC9", "#0984E3"]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={s.hero}
        >
          <Text style={s.heroTitle}>Medicine History</Text>
          <Text style={s.heroSub}>Track every medicine you've taken.</Text>
        </LinearGradient>

        {/* Two col: Today's Status + Completed */}
        <View style={s.twoCol}>
          {/* Progress Ring */}
          <View style={s.statusCard}>
            <Text style={s.cardTitle}>Today's Status</Text>
            <View style={s.ring}>
              <View style={s.ringInner}>
                <Text style={s.ringValue}>75%</Text>
              </View>
            </View>
            <Text style={s.ringCaption}>3 of 4 doses taken</Text>
            <Pressable style={s.logBtn} onPress={() => navigation.navigate("MedicineAlarm")}>
              <Text style={s.logBtnText}>Log Dose</Text>
            </Pressable>
          </View>

          {/* Completed */}
          <View style={s.completedCard}>
            <View style={s.completedHeader}>
              <Text style={s.cardTitle}>Completed Today</Text>
              <View style={s.awesomeBadge}><Text style={s.awesomeBadgeText}>AWESOME</Text></View>
            </View>
            {COMPLETED.map((c) => (
              <View key={c.name} style={s.completedRow}>
                <View style={s.completedCheck}>
                  <Ionicons name="checkmark-circle" size={20} color={colors.secondary} />
                </View>
                <View>
                  <Text style={s.completedName}>{c.name}</Text>
                  <Text style={s.completedDose}>{c.dose}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Two col: Timeline + Monthly Adherence */}
        <View style={s.twoCol}>
          {/* Timeline */}
          <View style={s.timelineCard}>
            <Text style={s.cardTitle}>Timeline</Text>
            {TIMELINE.map((t, i) => (
              <View key={i} style={s.timelineRow}>
                <View style={[s.timelineDot, t.recent && s.timelineDotRecent]}>
                  <Ionicons name={t.icon as any} size={14} color={t.recent ? colors.onPrimary : colors.text.muted} />
                </View>
                {i < TIMELINE.length - 1 && <View style={s.timelineLine} />}
                <View style={s.timelineText}>
                  <Text style={s.timelineName}>{t.name}</Text>
                  <Text style={s.timelineDate}>{t.date}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Monthly Adherence */}
          <View style={s.adherenceCard}>
            <View style={s.adherenceHeader}>
              <View>
                <Text style={s.cardTitle}>Monthly Adherence</Text>
                <Text style={s.adherenceMonth}>October 2026</Text>
              </View>
              <Text style={s.adherencePct}>92%</Text>
            </View>
            <View style={s.barChart}>
              {WEEK_HEIGHTS.map((h, i) => (
                <View key={i} style={s.barWrap}>
                  <LinearGradient
                    colors={i === 2 ? [colors.secondaryContainer, colors.secondary] : [colors.primaryContainer, colors.primary]}
                    style={[s.bar, { height: (h / 100) * 80 }]}
                  />
                  <Text style={s.barDay}>{WEEK_DAYS[i]}</Text>
                </View>
              ))}
            </View>
          </View>
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
  headerTitle: { fontSize: 22, fontWeight: "700", color: colors.primary },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface.containerHigh, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: colors.glass.border },
  scroll: { paddingHorizontal: 16 },
  hero: { borderRadius: 32, padding: 28, marginBottom: 20, minHeight: 160 },
  heroTitle: { fontSize: 36, fontWeight: "700", color: "white", marginBottom: 6 },
  heroSub: { fontSize: 16, color: "rgba(255,255,255,0.9)" },
  twoCol: { flexDirection: "row", gap: 12, marginBottom: 16 },
  statusCard: { flex: 1, backgroundColor: "#18344F", borderRadius: 30, padding: 16, alignItems: "center", borderWidth: 1, borderColor: colors.glass.border },
  cardTitle: { fontSize: 16, fontWeight: "700", color: colors.text.primary, marginBottom: 14, alignSelf: "flex-start" },
  ring: { width: 100, height: 100, borderRadius: 50, backgroundColor: "transparent", borderWidth: 10, borderColor: colors.secondary, justifyContent: "center", alignItems: "center", marginBottom: 8 },
  ringInner: { alignItems: "center" },
  ringValue: { fontSize: 22, fontWeight: "700", color: colors.text.primary },
  ringCaption: { fontSize: 12, color: colors.text.secondary, textAlign: "center", marginBottom: 12 },
  logBtn: { width: "100%", backgroundColor: colors.primaryContainer, borderRadius: 20, padding: 10, alignItems: "center" },
  logBtnText: { fontSize: 14, fontWeight: "700", color: colors.onPrimaryContainer },
  completedCard: { flex: 1, backgroundColor: "#18344F", borderRadius: 30, padding: 16, borderWidth: 1, borderColor: colors.glass.border },
  completedHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  awesomeBadge: { backgroundColor: colors.secondaryContainer, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  awesomeBadgeText: { fontSize: 9, fontWeight: "700", color: colors.onSecondaryFixed, letterSpacing: 0.5 },
  completedRow: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: colors.surface.containerHighest, borderRadius: 16, padding: 10, marginBottom: 8 },
  completedCheck: { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(79,219,200,0.15)", justifyContent: "center", alignItems: "center" },
  completedName: { fontSize: 14, fontWeight: "700", color: colors.text.primary },
  completedDose: { fontSize: 11, color: colors.text.secondary, marginTop: 2 },
  timelineCard: { flex: 1, backgroundColor: "#18344F", borderRadius: 30, padding: 16, borderWidth: 1, borderColor: colors.glass.border },
  timelineRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 12 },
  timelineDot: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.surface.containerHighest, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: colors.glass.border },
  timelineDotRecent: { backgroundColor: colors.primaryContainer, borderColor: colors.primary, shadowColor: colors.primary, shadowOpacity: 0.4, shadowRadius: 8, elevation: 4 },
  timelineLine: { position: "absolute", left: 15, top: 32, width: 2, height: 12, backgroundColor: colors.glass.border },
  timelineText: {},
  timelineName: { fontSize: 14, fontWeight: "700", color: colors.text.primary },
  timelineDate: { fontSize: 11, color: colors.text.secondary, marginTop: 2 },
  adherenceCard: { flex: 1, backgroundColor: "#18344F", borderRadius: 30, padding: 16, borderWidth: 1, borderColor: colors.glass.border },
  adherenceHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
  adherenceMonth: { fontSize: 12, color: colors.text.secondary, marginTop: 2 },
  adherencePct: { fontSize: 28, fontWeight: "700", color: colors.secondary },
  barChart: { flexDirection: "row", alignItems: "flex-end", height: 90, gap: 6 },
  barWrap: { flex: 1, alignItems: "center", gap: 4 },
  bar: { width: "100%", borderRadius: 4, minHeight: 4 },
  barDay: { fontSize: 9, color: colors.text.secondary },
  navBar: { position: "absolute", bottom: 0, left: 0, right: 0, height: 72, backgroundColor: colors.surface.container, borderTopWidth: 1, borderTopColor: colors.glass.border, flexDirection: "row", justifyContent: "space-around", alignItems: "center", paddingHorizontal: 8 },
  navBtn: { flex: 1, alignItems: "center", justifyContent: "center", gap: 4, paddingVertical: 8 },
  navLabel: { fontSize: 10, color: colors.text.secondary, fontWeight: "500" },
  navLabelActive: { color: colors.primary, fontWeight: "700" },
});
