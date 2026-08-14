import React from "react";
import { ScrollView, Text, View, Pressable, StyleSheet, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/types";
import { colors } from "@/theme/colors";

type Props = NativeStackScreenProps<RootStackParamList, "AICoach">;

const DAILY_FOCUS = [
  { label: "Hydration", tip: "Drink 500ml now", icon: "water", color: "#3b82f6", bg: "#0A254040", border: "#3b82f620" },
  { label: "Exercise", tip: "15min Yoga suggested", icon: "body", color: "#10b981", bg: "#0B2C2440", border: "#10b98120" },
  { label: "Nutrition", tip: "Healthy dinner ideas", icon: "restaurant", color: "#f97316", bg: "#3D1A0D40", border: "#f9731620" },
  { label: "Medication", tip: "Lisinopril due in 1hr", icon: "medical", color: "#a855f7", bg: "#2D164D40", border: "#a855f720" },
];

export default function AICoachScreen({ navigation }: Props) {
  return (
    <View style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.pageTitle}>AI Coach</Text>
        <Pressable onPress={() => navigation.goBack()} style={s.iconBtn}>
          <Ionicons name="settings-outline" size={20} color={colors.primary} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {/* Hero */}
        <View style={s.hero}>
          <LinearGradient colors={["rgba(37,99,235,0.4)", "rgba(131,67,244,0.4)"]} style={StyleSheet.absoluteFillObject} />
          <View style={s.heroText}>
            <Text style={s.heroTitle}>AI Assistant</Text>
            <View style={s.heroBadge}>
              <View style={s.pulsingDot} />
              <Text style={s.heroBadgeText}>Active & Ready to Help</Text>
            </View>
          </View>
          <View style={s.heroOrb}>
            <Ionicons name="logo-electron" size={80} color={colors.primary} />
          </View>
        </View>

        {/* Coach Message */}
        <View style={s.messageCard}>
          <View style={s.msgAvatar}>
            <Ionicons name="happy" size={16} color={colors.onPrimary} />
          </View>
          <Text style={s.msgText}>
            "Good morning! You're 2,000 steps ahead of yesterday. I recommend focusing on hydration today."
          </Text>
        </View>

        {/* Voice Input */}
        <View style={s.voiceSection}>
          <Pressable
            onPress={() => Alert.alert("Voice Assistant", "Voice input activated. Speak your question...")}
            style={s.voiceBtn}
          >
            <Ionicons name="mic" size={40} color={colors.onPrimary} />
          </Pressable>
          <Text style={s.voiceHint}>TAP TO SPEAK</Text>
        </View>

        {/* Daily Focus */}
        <Text style={s.sectionTitle}>Daily Focus</Text>
        <View style={s.focusGrid}>
          {DAILY_FOCUS.map((f) => (
            <View key={f.label} style={[s.focusCard, { backgroundColor: f.bg, borderColor: f.border }]}>
              <View style={[s.focusIcon, { backgroundColor: `${f.color}30` }]}>
                <Ionicons name={f.icon as any} size={20} color={f.color} />
              </View>
              <View>
                <Text style={[s.focusLabel, { color: f.color.replace("ff", "cc") }]}>{f.label}</Text>
                <Text style={s.focusTip}>{f.tip}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Health Insights */}
        <Text style={s.sectionTitle}>Today's Insights</Text>
        <View style={s.insightsCard}>
          {[
            { title: "Sleep Quality", value: "Excellent (7h 42m)", icon: "moon", color: colors.tertiary },
            { title: "Heart Rate", value: "Normal (72 BPM)", icon: "heart", color: "#f43f5e" },
            { title: "Steps", value: "8,400 / 10,000", icon: "walk", color: colors.secondary },
            { title: "Calories", value: "540 / 750 kcal", icon: "flame", color: "#f97316" },
          ].map((item, i) => (
            <View key={item.title} style={[s.insightRow, i < 3 && s.insightRowBorder]}>
              <View style={[s.insightIcon, { backgroundColor: `${item.color}20` }]}>
                <Ionicons name={item.icon as any} size={18} color={item.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.insightTitle}>{item.title}</Text>
                <Text style={[s.insightValue, { color: item.color }]}>{item.value}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Navigation Links */}
        <View style={s.navLinks}>
          <Pressable onPress={() => navigation.navigate("HealthDashboard")} style={s.navLink}>
            <Ionicons name="heart" size={18} color={colors.primary} />
            <Text style={s.navLinkText}>View Health Dashboard</Text>
            <Ionicons name="arrow-forward" size={14} color={colors.text.secondary} />
          </Pressable>
          <Pressable onPress={() => navigation.navigate("MedicationCenter")} style={s.navLink}>
            <Ionicons name="medical" size={18} color={colors.secondary} />
            <Text style={s.navLinkText}>Medication Center</Text>
            <Ionicons name="arrow-forward" size={14} color={colors.text.secondary} />
          </Pressable>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#071827" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingTop: 52, paddingBottom: 16 },
  pageTitle: { fontSize: 28, fontWeight: "700", color: colors.primary },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface.containerHigh, borderWidth: 1, borderColor: colors.glass.border, justifyContent: "center", alignItems: "center" },
  scroll: { paddingHorizontal: 16 },
  hero: { backgroundColor: "#18344F", borderRadius: 30, padding: 32, marginBottom: 20, flexDirection: "row", alignItems: "center", gap: 20, borderWidth: 1, borderColor: colors.glass.border, overflow: "hidden" },
  heroText: { flex: 1 },
  heroTitle: { fontSize: 40, fontWeight: "700", color: colors.primaryFixed, marginBottom: 12 },
  heroBadge: { flexDirection: "row", alignItems: "center", gap: 8 },
  pulsingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.secondary },
  heroBadgeText: { fontSize: 14, color: colors.primaryFixedDim },
  heroOrb: { width: 120, height: 120, borderRadius: 60, backgroundColor: "rgba(180,197,255,0.1)", justifyContent: "center", alignItems: "center", borderWidth: 2, borderColor: "rgba(180,197,255,0.3)" },
  messageCard: { position: "relative", backgroundColor: "rgba(24,52,79,0.5)", borderRadius: 30, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: colors.glass.border },
  msgAvatar: { position: "absolute", top: -12, left: -12, width: 32, height: 32, borderRadius: 16, backgroundColor: colors.primary, justifyContent: "center", alignItems: "center" },
  msgText: { fontSize: 16, color: colors.text.primary, lineHeight: 26, fontStyle: "italic", marginLeft: 8 },
  voiceSection: { alignItems: "center", paddingVertical: 32, marginBottom: 20 },
  voiceBtn: { width: 96, height: 96, borderRadius: 48, backgroundColor: colors.primary, justifyContent: "center", alignItems: "center", shadowColor: colors.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 25, elevation: 10 },
  voiceHint: { fontSize: 11, fontWeight: "700", color: colors.text.secondary, letterSpacing: 1.5, marginTop: 16 },
  sectionTitle: { fontSize: 20, fontWeight: "700", color: colors.primary, marginBottom: 12 },
  focusGrid: { gap: 12, marginBottom: 24 },
  focusCard: { flexDirection: "row", alignItems: "center", gap: 16, borderRadius: 20, padding: 16, borderWidth: 1 },
  focusIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: "center", alignItems: "center" },
  focusLabel: { fontSize: 12, fontWeight: "500", marginBottom: 4 },
  focusTip: { fontSize: 16, fontWeight: "700", color: "white" },
  insightsCard: { backgroundColor: colors.surface.container, borderRadius: 30, marginBottom: 20, borderWidth: 1, borderColor: colors.glass.border, overflow: "hidden" },
  insightRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16 },
  insightRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.glass.border },
  insightIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: "center", alignItems: "center" },
  insightTitle: { fontSize: 12, color: colors.text.secondary },
  insightValue: { fontSize: 14, fontWeight: "700", marginTop: 2 },
  navLinks: { gap: 8 },
  navLink: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: colors.surface.containerHigh, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.glass.border },
  navLinkText: { flex: 1, fontSize: 14, fontWeight: "600", color: colors.text.primary },
});
