import React from "react";
import { ScrollView, Text, View, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/types";
import { colors } from "@/theme/colors";

type Props = NativeStackScreenProps<RootStackParamList, "HealthPrecautions">;

const PRECAUTION_CARDS = [
  { title: "COVID Safety", sub: "Local guidelines & prevention.", icon: "shield-checkmark", bg: ["#118AB2", "#0B5D7A"] as (string[]) },
  { title: "Air Pollution", sub: "AQI: 42", badge: "Good", badgeColor: "#4ade80", icon: "partly-sunny", bg: ["#1B9AAA", "#116B77"] as (string[]) },
  { title: "Seasonal Care", sub: "Hydration and heatstroke tips.", icon: "thermometer", bg: ["#06D6A0", "#049670"] as (string[]) },
  { title: "Emergency Contacts", sub: "Quick dial local authorities.", icon: "call", alert: true, bg: ["#FF6B6B", "#C92A2A"] as (string[]) },
];

const NAV = [
  { icon: "heart", label: "Health", route: "HealthDashboard", active: true },
  { icon: "time-outline", label: "History", route: "MedicineHistory" },
  { icon: "alarm-outline", label: "Alarm", route: "MedicineAlarm" },
  { icon: "notifications-outline", label: "Reminders", route: "SmartReminders" },
  { icon: "person-outline", label: "Profile", route: "Profile" },
];

export default function HealthPrecautionsScreen({ navigation }: Props) {
  return (
    <View style={s.root}>
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} style={s.iconBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.text.secondary} />
        </Pressable>
        <Text style={s.headerTitle}>Urban Helpers</Text>
        <Pressable style={s.iconBtn}>
          <Ionicons name="settings-outline" size={22} color={colors.text.secondary} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {/* Hero */}
        <LinearGradient
          colors={["#06D6A0", "#1B9AAA", "#118AB2"]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={s.hero}
        >
          <View style={s.heroTag}>
            <Ionicons name="shield-checkmark" size={14} color="white" />
            <Text style={s.heroTagText}>ACTIVE PROTECTION</Text>
          </View>
          <Text style={s.heroTitle}>Health Precautions</Text>
          <Text style={s.heroSub}>Stay protected every day.</Text>
          <Pressable style={s.heroBtn}>
            <Text style={s.heroBtnText}>View Details</Text>
          </Pressable>
        </LinearGradient>

        {/* Cards Grid */}
        <View style={s.cardsGrid}>
          {PRECAUTION_CARDS.map((c) => (
            <LinearGradient
              key={c.title}
              colors={c.bg}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={s.precautionCard}
            >
              <View style={s.precautionIconWrap}>
                <Ionicons name={c.icon as any} size={28} color="white" />
              </View>
              <View style={s.precautionContent}>
                <Text style={s.precautionTitle}>{c.title}</Text>
                <View style={s.precautionSubRow}>
                  <Text style={s.precautionSub}>{c.sub}</Text>
                  {c.badge && (
                    <View style={[s.precautionBadge, { backgroundColor: `${c.badgeColor}33` }]}>
                      <Text style={[s.precautionBadgeText, { color: c.badgeColor }]}>{c.badge}</Text>
                    </View>
                  )}
                </View>
              </View>
              {c.alert && (
                <Pressable
                  onPress={() => navigation.navigate("EmergencyAssistance")}
                  style={s.callBtn}
                >
                  <Text style={s.callBtnText}>Call Now</Text>
                </Pressable>
              )}
            </LinearGradient>
          ))}
        </View>

        {/* Tips List */}
        <Text style={s.sectionTitle}>Daily Precautions</Text>
        <View style={s.tipsList}>
          {[
            { icon: "water-outline", label: "Wash hands regularly", color: "#4CC9F0" },
            { icon: "shield-outline", label: "Wear mask in crowded areas", color: "#06D6A0" },
            { icon: "thermometer-outline", label: "Check temperature daily", color: "#F59E0B" },
            { icon: "nutrition-outline", label: "Eat vitamin-rich food", color: "#10B981" },
          ].map((t) => (
            <View key={t.label} style={s.tipRow}>
              <View style={[s.tipIcon, { backgroundColor: `${t.color}22` }]}>
                <Ionicons name={t.icon as any} size={20} color={t.color} />
              </View>
              <Text style={s.tipLabel}>{t.label}</Text>
              <Ionicons name="checkmark-circle-outline" size={20} color={colors.secondary} />
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
  headerTitle: { fontSize: 20, fontWeight: "700", color: colors.primary },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface.containerHigh, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: colors.glass.border },
  scroll: { paddingHorizontal: 16 },
  hero: { borderRadius: 32, padding: 28, marginBottom: 24, minHeight: 260, justifyContent: "flex-end" },
  heroTag: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, alignSelf: "flex-start", marginBottom: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.3)" },
  heroTagText: { fontSize: 10, fontWeight: "700", color: "white", letterSpacing: 0.5 },
  heroTitle: { fontSize: 40, fontWeight: "700", color: "white", marginBottom: 8 },
  heroSub: { fontSize: 18, color: "rgba(255,255,255,0.9)", marginBottom: 20 },
  heroBtn: { backgroundColor: "white", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 16, alignSelf: "flex-start" },
  heroBtnText: { fontSize: 15, fontWeight: "700", color: "#1B9AAA" },
  cardsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 24 },
  precautionCard: { width: "47%", borderRadius: 28, padding: 18, minHeight: 180, justifyContent: "space-between", borderWidth: 1, borderColor: "rgba(255,255,255,0.15)" },
  precautionIconWrap: { width: 56, height: 56, borderRadius: 28, backgroundColor: "rgba(255,255,255,0.2)", justifyContent: "center", alignItems: "center", marginBottom: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.3)" },
  precautionContent: { flex: 1 },
  precautionTitle: { fontSize: 18, fontWeight: "700", color: "white", marginBottom: 6 },
  precautionSubRow: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  precautionSub: { fontSize: 13, color: "rgba(255,255,255,0.8)" },
  precautionBadge: { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  precautionBadgeText: { fontSize: 11, fontWeight: "700" },
  callBtn: { backgroundColor: "white", borderRadius: 12, padding: 10, alignItems: "center", marginTop: 12 },
  callBtnText: { fontSize: 14, fontWeight: "700", color: "#C92A2A" },
  sectionTitle: { fontSize: 20, fontWeight: "700", color: colors.text.primary, marginBottom: 14 },
  tipsList: { gap: 10, marginBottom: 8 },
  tipRow: { flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: colors.surface.containerHigh, borderRadius: 20, padding: 14, borderWidth: 1, borderColor: colors.glass.border },
  tipIcon: { width: 44, height: 44, borderRadius: 22, justifyContent: "center", alignItems: "center" },
  tipLabel: { flex: 1, fontSize: 15, color: colors.text.primary, fontWeight: "500" },
  navBar: { position: "absolute", bottom: 0, left: 0, right: 0, height: 72, backgroundColor: colors.surface.container, borderTopWidth: 1, borderTopColor: colors.glass.border, flexDirection: "row", justifyContent: "space-around", alignItems: "center", paddingHorizontal: 8 },
  navBtn: { flex: 1, alignItems: "center", justifyContent: "center", gap: 4, paddingVertical: 8 },
  navLabel: { fontSize: 10, color: colors.text.secondary, fontWeight: "500" },
  navLabelActive: { color: colors.primary, fontWeight: "700" },
});
