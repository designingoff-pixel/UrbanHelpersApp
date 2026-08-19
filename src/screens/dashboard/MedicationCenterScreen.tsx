import React, { useEffect } from "react";
import { ScrollView, Text, View, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/types";
import { colors } from "@/theme/colors";
import {
  scheduleMedicineReminder,
  scheduleMissedMedicineAlert,
} from "@/services/notificationService";

type Props = NativeStackScreenProps<RootStackParamList, "MedicationCenter">;

const MEDS = [
  { time: "Morning · 08:00 AM", name: "Lisinopril", dose: "10mg · 1 Tablet", progress: 75, color: "#fbbf24", timeIcon: "sunny", hour: 8, minute: 0 },
  { time: "Afternoon · 01:00 PM", name: "Vitamin D3", dose: "5000 IU · 1 Capsule", progress: 0, color: "#f97316", timeIcon: "partly-sunny", hour: 13, minute: 0 },
  { time: "Night · 09:00 PM", name: "Melatonin", dose: "3mg · 1 Tablet", progress: 0, color: "#a855f7", timeIcon: "moon", hour: 21, minute: 0 },
];

export default function MedicationCenterScreen({ navigation }: Props) {

  // Schedule reminders for all meds when this screen mounts
  useEffect(() => {
    (async () => {
      for (const med of MEDS) {
        await scheduleMedicineReminder(med.name, med.dose, med.hour, med.minute);
      }
      console.log("[MedicationCenter] All medicine reminders scheduled");
    })();
  }, []);
  return (
    <View style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} style={s.iconBtn}>
          <Ionicons name="menu-outline" size={20} color={colors.text.secondary} />
        </Pressable>
        <Text style={s.pageTitle}>Medication</Text>
        <Pressable style={s.iconBtn}>
          <Ionicons name="notifications" size={20} color={colors.secondary} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {/* Hero */}
        <LinearGradient colors={["#04141340", "#04141399"]} style={s.hero}>
          <View style={s.heroBadge}>
            <Ionicons name="shield-checkmark" size={14} color={colors.secondary} />
            <Text style={s.heroBadgeText}>Health Assistant</Text>
          </View>
          <Text style={s.heroHeadline}>Medication{"\n"}<Text style={[s.heroHeadline, { color: colors.secondary }]}>Center</Text></Text>
          <Text style={s.heroSub}>Never miss another medicine. We'll track, remind, and manage your health seamlessly.</Text>
          <View style={s.heroBtns}>
            <Pressable onPress={() => navigation.navigate("MedicineAlarm")} style={s.heroBtnPrimary}>
              <Ionicons name="add" size={16} color={colors.onPrimary} />
              <Text style={s.heroBtnPrimaryText}>Add Medication</Text>
            </Pressable>
            <Pressable style={s.heroBtnGlass}>
              <Ionicons name="scan" size={16} color={colors.text.primary} />
              <Text style={s.heroBtnGlassText}>Scan Rx</Text>
            </Pressable>
          </View>
        </LinearGradient>

        {/* Today's Schedule */}
        <View style={s.scheduleHeader}>
          <Text style={s.sectionTitle}>Today's Schedule</Text>
          <Pressable onPress={() => navigation.navigate("MedicineHistory")}>
            <Text style={s.seeAll}>View All</Text>
          </Pressable>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.medsScroll}>
          {MEDS.map((m) => (
            <View key={m.name} style={[s.medCard, { borderColor: `${m.color}30` }]}>
              <View style={s.medCardTop}>
                <View style={[s.timePill, { backgroundColor: `${m.color}15`, borderColor: `${m.color}30` }]}>
                  <Ionicons name={m.timeIcon as any} size={12} color={m.color} />
                  <Text style={[s.timeText, { color: m.color }]}>{m.time}</Text>
                </View>
              </View>
              <Text style={s.medName}>{m.name}</Text>
              <Text style={s.medDose}>{m.dose}</Text>
              <View style={s.medFooter}>
                <View style={s.medRing}>
                  <Text style={[s.medRingText, { color: m.color }]}>{m.progress}%</Text>
                </View>
                {m.progress > 0 ? (
                  <Pressable
                    style={[s.medBtn, { borderColor: `${m.color}50` }]}
                    onPress={async () => {
                      // Schedule missed-medicine alert in 2 hrs if not confirmed
                      await scheduleMissedMedicineAlert(m.name, 120);
                      console.log(`[Medication] Mark taken: ${m.name}`);
                    }}
                  >
                    <Text style={[s.medBtnText, { color: m.color }]}>Mark Taken</Text>
                  </Pressable>
                ) : (
                  <Pressable
                    style={[s.medBtnFilled, { backgroundColor: m.color }]}
                    onPress={async () => {
                      // Schedule missed alert — user can dismiss/cancel if taken
                      await scheduleMissedMedicineAlert(m.name, 120);
                      console.log(`[Medication] Take now: ${m.name}`);
                    }}
                  >
                    <Text style={s.medBtnFilledText}>Take Now</Text>
                  </Pressable>
                )}
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Adherence */}
        <Text style={s.sectionTitle}>Adherence This Week</Text>
        <View style={s.adherenceCard}>
          <View style={s.adherenceRow}>
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d, i) => {
              const done = i < 4;
              return (
                <View key={d} style={s.adherenceDay}>
                  <View style={[s.adherenceDot, done ? s.adherenceDotDone : s.adherenceDotPending]}>
                    {done && <Ionicons name="checkmark" size={12} color="white" />}
                  </View>
                  <Text style={s.adherenceDayLabel}>{d}</Text>
                </View>
              );
            })}
          </View>
          <View style={s.adherenceStat}>
            <Text style={s.adherenceStatValue}>85%</Text>
            <Text style={s.adherenceStatLabel}>Overall Adherence</Text>
          </View>
        </View>

        {/* Quick Links */}
        <View style={s.quickLinks}>
          <Pressable onPress={() => navigation.navigate("MedicineAlarm")} style={s.quickLink}>
            <Ionicons name="alarm" size={20} color="#fbbf24" />
            <Text style={s.quickLinkLabel}>Set Alarm</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.text.secondary} />
          </Pressable>
          <Pressable onPress={() => navigation.navigate("MedicineHistory")} style={s.quickLink}>
            <Ionicons name="time" size={20} color={colors.primary} />
            <Text style={s.quickLinkLabel}>History</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.text.secondary} />
          </Pressable>
          <Pressable onPress={() => navigation.navigate("SmartReminders")} style={s.quickLink}>
            <Ionicons name="notifications" size={20} color={colors.secondary} />
            <Text style={s.quickLinkLabel}>Smart Reminders</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.text.secondary} />
          </Pressable>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#081826" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingTop: 52, paddingBottom: 16 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface.containerHigh, borderWidth: 1, borderColor: colors.glass.border, justifyContent: "center", alignItems: "center" },
  pageTitle: { fontSize: 20, fontWeight: "700", color: colors.secondary },
  scroll: { paddingHorizontal: 16 },
  hero: { borderRadius: 30, padding: 24, marginBottom: 20, minHeight: 280, borderWidth: 1, borderColor: colors.glass.border },
  heroBadge: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: colors.glass.background, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, alignSelf: "flex-start", borderWidth: 1, borderColor: `${colors.secondary}50`, marginBottom: 16 },
  heroBadgeText: { fontSize: 11, fontWeight: "700", color: colors.secondary, letterSpacing: 0.5 },
  heroHeadline: { fontSize: 40, fontWeight: "700", color: colors.text.primary, lineHeight: 48 },
  heroSub: { fontSize: 14, color: colors.text.secondary, marginTop: 12, marginBottom: 24, lineHeight: 22 },
  heroBtns: { flexDirection: "row", gap: 12 },
  heroBtnPrimary: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: colors.primary, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 16 },
  heroBtnPrimaryText: { color: colors.onPrimary, fontSize: 14, fontWeight: "700" },
  heroBtnGlass: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: colors.glass.background, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 16, borderWidth: 1, borderColor: colors.glass.border },
  heroBtnGlassText: { color: colors.text.primary, fontSize: 14, fontWeight: "500" },
  scheduleHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  sectionTitle: { fontSize: 20, fontWeight: "700", color: colors.text.primary },
  seeAll: { fontSize: 14, color: colors.secondary },
  medsScroll: { marginHorizontal: -16, paddingHorizontal: 16, marginBottom: 24 },
  medCard: { backgroundColor: "#18344F", borderRadius: 30, padding: 20, marginRight: 12, minWidth: 260, borderWidth: 1 },
  medCardTop: { marginBottom: 12 },
  timePill: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, alignSelf: "flex-start", borderWidth: 1 },
  timeText: { fontSize: 11, fontWeight: "700" },
  medName: { fontSize: 22, fontWeight: "700", color: colors.text.primary, marginBottom: 4 },
  medDose: { fontSize: 14, color: colors.text.secondary, marginBottom: 20 },
  medFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  medRing: { width: 48, height: 48, borderRadius: 24, borderWidth: 3, borderColor: colors.surface.containerHighest, justifyContent: "center", alignItems: "center" },
  medRingText: { fontSize: 11, fontWeight: "700" },
  medBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, borderWidth: 1 },
  medBtnText: { fontSize: 13, fontWeight: "600" },
  medBtnFilled: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
  medBtnFilledText: { fontSize: 13, fontWeight: "700", color: "white" },
  adherenceCard: { backgroundColor: colors.surface.container, borderRadius: 30, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: colors.glass.border },
  adherenceRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
  adherenceDay: { alignItems: "center", gap: 8 },
  adherenceDot: { width: 32, height: 32, borderRadius: 16, justifyContent: "center", alignItems: "center" },
  adherenceDotDone: { backgroundColor: colors.primary },
  adherenceDotPending: { backgroundColor: colors.surface.containerHighest },
  adherenceDayLabel: { fontSize: 11, color: colors.text.secondary, fontWeight: "600" },
  adherenceStat: { borderTopWidth: 1, borderTopColor: colors.glass.border, paddingTop: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  adherenceStatValue: { fontSize: 28, fontWeight: "700", color: colors.primary },
  adherenceStatLabel: { fontSize: 14, color: colors.text.secondary },
  quickLinks: { gap: 8 },
  quickLink: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: colors.surface.containerHigh, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.glass.border },
  quickLinkLabel: { flex: 1, fontSize: 14, fontWeight: "600", color: colors.text.primary },
});
