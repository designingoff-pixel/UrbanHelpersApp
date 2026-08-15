import React, { useState } from "react";
import { ScrollView, Text, View, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/types";
import { colors } from "@/theme/colors";

type Props = NativeStackScreenProps<RootStackParamList, "MedicineAlarm">;

const MEDICINES = [
  { name: "Amoxicillin", dose: "500mg", instruction: "After Food", time: "14:00", timeLeft: "In 2h", icon: "medical", color: colors.secondaryContainer },
  { name: "Vitamin D3", dose: "1000 IU", instruction: "With Food", time: "20:00", timeLeft: "Tonight", icon: "sunny", color: colors.primaryContainer },
];

const SLOTS = [
  { label: "Morning", icon: "sunny", status: "Completed", active: false },
  { label: "Afternoon", icon: "partly-sunny", status: "Next (14:00)", active: true },
  { label: "Night", icon: "moon", status: "1 Pending", active: false },
];

const NAV = [
  { icon: "heart", label: "Health", route: "HealthDashboard", active: true },
  { icon: "time-outline", label: "History", route: "MedicineHistory" },
  { icon: "alarm", label: "Alarm", route: "MedicineAlarm" },
  { icon: "notifications-outline", label: "Reminders", route: "SmartReminders" },
  { icon: "person-outline", label: "Profile", route: "Profile" },
];

export default function MedicineAlarmScreen({ navigation }: Props) {
  return (
    <View style={s.root}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Medicine Alarm</Text>
        <Pressable style={s.iconBtn}>
          <Ionicons name="notifications-outline" size={22} color={colors.text.secondary} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {/* Hero */}
        <LinearGradient
          colors={["#2ECC71", "#27AE60", "#16A085"]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={s.hero}
        >
          <View style={s.heroTag}>
            <Ionicons name="medical" size={14} color="white" />
            <Text style={s.heroTagText}>ACTIVE TRACKING</Text>
          </View>
          <Text style={s.heroTitle}>Medicine Alarm</Text>
          <Text style={s.heroSub}>Never miss your medicines again.</Text>
          <View style={s.heroStats}>
            <View style={s.heroStat}>
              <Text style={s.heroStatVal}>02</Text>
              <Text style={s.heroStatLbl}>Pending Today</Text>
            </View>
            <View style={s.heroStatDiv} />
            <View style={s.heroStat}>
              <Text style={s.heroStatVal}>100%</Text>
              <Text style={s.heroStatLbl}>Adherence Rate</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Today's Medicines */}
        <View style={s.sectionHeader}>
          <View>
            <Text style={s.sectionTitle}>Today's Medicines</Text>
            <Text style={s.sectionSub}>2 doses remaining</Text>
          </View>
          <Pressable style={s.addBtn}>
            <Ionicons name="add" size={16} color={colors.onSecondary} />
            <Text style={s.addBtnText}>Add New</Text>
          </Pressable>
        </View>
        <View style={s.medGrid}>
          {MEDICINES.map((m) => (
            <View key={m.name} style={[s.medCard, { backgroundColor: m.color }]}>
              <View style={s.medTop}>
                <View style={s.medIcon}>
                  <Ionicons name={m.icon as any} size={22} color="white" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.medName}>{m.name}</Text>
                  <Text style={s.medDose}>{m.dose} · {m.instruction}</Text>
                </View>
                <View style={s.medTimeWrap}>
                  <Text style={s.medTime}>{m.time}</Text>
                  <View style={s.medTimeLeft}>
                    <Ionicons name="timer-outline" size={12} color={colors.secondary} />
                    <Text style={s.medTimeLeftText}>{m.timeLeft}</Text>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* AI Insight */}
        <View style={s.aiCard}>
          <View style={s.aiHeader}>
            <Ionicons name="sparkles" size={18} color={colors.tertiary} />
            <Text style={s.aiTitle}>AI Insights</Text>
          </View>
          <Text style={s.aiHeadline}>Optimal Timing</Text>
          <Text style={s.aiText}>
            Based on your sleep patterns, we suggest moving your Vitamin D intake to mornings for better absorption and sleep quality.
          </Text>
          <Pressable
            style={s.aiReviewBtn}
            onPress={() => navigation.navigate("SmartReminders")}
          >
            <Text style={s.aiReviewText}>Review Schedule</Text>
          </Pressable>
        </View>

        {/* Reminder Slots */}
        <Text style={s.sectionTitle}>Upcoming Reminders</Text>
        <View style={s.slotsGrid}>
          {SLOTS.map((sl) => (
            <View key={sl.label} style={[s.slotCard, sl.active && s.slotCardActive]}>
              <Ionicons name={sl.icon as any} size={28} color={sl.active ? colors.secondary : colors.text.muted} />
              <Text style={[s.slotLabel, sl.active && s.slotLabelActive]}>{sl.label}</Text>
              <Text style={[s.slotStatus, sl.active && s.slotStatusActive]}>{sl.status}</Text>
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
  headerTitle: { fontSize: 22, fontWeight: "700", color: colors.primary },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface.containerHigh, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: colors.glass.border },
  scroll: { paddingHorizontal: 16 },
  hero: { borderRadius: 32, padding: 24, marginBottom: 24, minHeight: 200 },
  heroTag: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(0,0,0,0.2)", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, alignSelf: "flex-start", marginBottom: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.2)" },
  heroTagText: { fontSize: 10, fontWeight: "700", color: "white", letterSpacing: 0.5 },
  heroTitle: { fontSize: 40, fontWeight: "700", color: "white", marginBottom: 4 },
  heroSub: { fontSize: 16, color: "rgba(255,255,255,0.9)", marginBottom: 20 },
  heroStats: { flexDirection: "row", backgroundColor: "rgba(0,0,0,0.2)", borderRadius: 20, padding: 16, gap: 24, alignSelf: "flex-start", borderWidth: 1, borderColor: "rgba(255,255,255,0.15)" },
  heroStat: { alignItems: "center" },
  heroStatVal: { fontSize: 24, fontWeight: "700", color: "white" },
  heroStatLbl: { fontSize: 11, color: "rgba(255,255,255,0.75)" },
  heroStatDiv: { width: 1, backgroundColor: "rgba(255,255,255,0.25)" },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 },
  sectionTitle: { fontSize: 20, fontWeight: "700", color: colors.text.primary, marginBottom: 14 },
  sectionSub: { fontSize: 13, color: colors.text.secondary, marginTop: 2 },
  addBtn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: colors.secondary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  addBtnText: { fontSize: 13, fontWeight: "700", color: colors.onSecondary },
  medGrid: { gap: 12, marginBottom: 20 },
  medCard: { borderRadius: 24, padding: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.15)" },
  medTop: { flexDirection: "row", alignItems: "center", gap: 14 },
  medIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: "rgba(255,255,255,0.2)", justifyContent: "center", alignItems: "center" },
  medName: { fontSize: 16, fontWeight: "700", color: colors.text.primary },
  medDose: { fontSize: 12, color: colors.text.secondary, marginTop: 2 },
  medTimeWrap: { alignItems: "flex-end" },
  medTime: { fontSize: 16, fontWeight: "700", color: colors.text.primary },
  medTimeLeft: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  medTimeLeftText: { fontSize: 12, color: colors.secondary, fontWeight: "700" },
  aiCard: { backgroundColor: "#18344F", borderRadius: 30, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: colors.glass.border },
  aiHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  aiTitle: { fontSize: 12, fontWeight: "700", color: colors.tertiary, letterSpacing: 0.5 },
  aiHeadline: { fontSize: 20, fontWeight: "700", color: colors.text.primary, marginBottom: 8 },
  aiText: { fontSize: 14, color: colors.text.secondary, lineHeight: 22, marginBottom: 16 },
  aiReviewBtn: { backgroundColor: colors.surface.containerHighest, borderRadius: 16, padding: 14, alignItems: "center", borderWidth: 1, borderColor: colors.glass.border },
  aiReviewText: { fontSize: 15, fontWeight: "700", color: colors.text.primary },
  slotsGrid: { flexDirection: "row", gap: 12, marginBottom: 8 },
  slotCard: { flex: 1, backgroundColor: colors.surface.containerHigh, borderRadius: 24, padding: 16, alignItems: "center", gap: 6, borderWidth: 1, borderColor: colors.glass.border, opacity: 0.5 },
  slotCardActive: { backgroundColor: "rgba(79,219,200,0.1)", borderColor: "rgba(79,219,200,0.4)", opacity: 1, shadowColor: "rgba(79,219,200,0.3)", shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 20, elevation: 4 },
  slotLabel: { fontSize: 14, fontWeight: "700", color: colors.text.secondary },
  slotLabelActive: { color: colors.text.primary },
  slotStatus: { fontSize: 11, color: colors.text.muted, textAlign: "center" },
  slotStatusActive: { color: colors.secondary, fontWeight: "700" },
  navBar: { position: "absolute", bottom: 0, left: 0, right: 0, height: 72, backgroundColor: colors.surface.container, borderTopWidth: 1, borderTopColor: colors.glass.border, flexDirection: "row", justifyContent: "space-around", alignItems: "center", paddingHorizontal: 8 },
  navBtn: { flex: 1, alignItems: "center", justifyContent: "center", gap: 4, paddingVertical: 8 },
  navLabel: { fontSize: 10, color: colors.text.secondary, fontWeight: "500" },
  navLabelActive: { color: colors.primary, fontWeight: "700" },
});
