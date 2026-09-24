import React, { useState } from "react";
import { ScrollView, Text, View, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/types";
import { colors } from "@/theme/colors";

type Props = NativeStackScreenProps<RootStackParamList, "BloodTestReports">;

const UPCOMING = [
  {
    title: "Complete Blood Count",
    sub: "Fasting required",
    time: "08:00 AM - Home Visit",
    badge: "TOMORROW",
    badgeColor: "#ca8a04",
    bg: colors.primaryContainer,
    glow: "rgba(37,99,235,0.4)",
    icon: "water",
    iconColor: colors.secondary,
  },
  {
    title: "Thyroid Profile",
    sub: "TSH, T3, T4",
    time: "City Lab Central",
    badge: "OCT 15",
    badgeColor: "#434655",
    bg: colors.tertiaryContainer,
    glow: "rgba(131,67,244,0.4)",
    icon: "save",
    iconColor: colors.tertiary,
  },
];

const WEEK_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
const WEEK_HEIGHTS = [40, 55, 50, 75, 65, 85];

const PREV_REPORTS = [
  { title: "Lipid Profile", date: "Sep 10", status: "Normal", statusColor: "#4ade80", bg: colors.secondaryContainer },
  { title: "Vitamin D", date: "Aug 05", status: "Borderline Low", statusColor: "#78350f", bg: "#fbbf24" },
];

const NAV = [
  { icon: "home-outline", label: "Home", route: "HomeDashboard" },
  { icon: "heart", label: "Health", route: "HealthDashboard", active: true },
  { icon: "alert-circle", label: "SOS", route: "EmergencyAssistance", sos: true },
  { icon: "people-outline", label: "Together", route: "FamilyDashboard" },
  { icon: "person-outline", label: "Profile", route: "Profile" },
];

const TREND_TABS = ["HGB", "Sugar", "Cholesterol"];

export default function BloodTestReportsScreen({ navigation }: Props) {
  const [activeTab, setActiveTab] = useState(1);

  return (
    <View style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} style={s.iconBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.text.secondary} />
        </Pressable>
        <Text style={s.headerTitle}>Blood Test</Text>
        <Pressable style={s.iconBtn}>
          <Ionicons name="search-outline" size={22} color={colors.text.secondary} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {/* Hero */}
        <LinearGradient
          colors={["#991b1b", "#be123c", "#6b21a8"]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={s.hero}
        >
          <View style={s.heroTag}>
            <Ionicons name="flask" size={14} color="#fca5a5" />
            <Text style={s.heroTagText}>HEALTH TRACKING</Text>
          </View>
          <Text style={s.heroTitle}>Blood Test Reports</Text>
          <Text style={s.heroSub}>Track and understand your blood health with detailed analytics and AI insights.</Text>
        </LinearGradient>

        {/* Upcoming Tests */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Upcoming Tests</Text>
          <Pressable><Text style={s.seeAll}>View All</Text></Pressable>
        </View>
        <View style={s.upcomingGrid}>
          {UPCOMING.map((u) => (
            <Pressable
              key={u.title}
              style={({ pressed }) => [s.upcomingCard, { backgroundColor: u.bg, shadowColor: u.glow, opacity: pressed ? 0.85 : 1 }]}
            >
              <View style={s.upcomingTop}>
                <View style={s.upcomingIconWrap}>
                  <Ionicons name={u.icon as any} size={20} color={u.iconColor} />
                </View>
                <View style={[s.badge, { backgroundColor: `${u.badgeColor}33` }]}>
                  <Text style={[s.badgeText, { color: u.badgeColor === "#434655" ? colors.text.secondary : "#fde047" }]}>
                    {u.badge}
                  </Text>
                </View>
              </View>
              <Text style={s.upcomingTitle}>{u.title}</Text>
              <Text style={s.upcomingSub}>{u.sub}</Text>
              <View style={s.upcomingFooter}>
                <Text style={s.upcomingTime}>{u.time}</Text>
                <Ionicons name="arrow-forward" size={18} color={colors.primary} />
              </View>
            </Pressable>
          ))}
        </View>

        {/* Health Trends Graph */}
        <View style={s.trendsCard}>
          <View style={s.trendsHeader}>
            <Text style={s.sectionTitle}>Health Trends</Text>
            <View style={s.tabRow}>
              {TREND_TABS.map((t, i) => (
                <Pressable
                  key={t}
                  onPress={() => setActiveTab(i)}
                  style={[s.trendTab, activeTab === i && s.trendTabActive]}
                >
                  <Text style={[s.trendTabText, activeTab === i && s.trendTabTextActive]}>{t}</Text>
                </Pressable>
              ))}
            </View>
          </View>
          <View style={s.barChart}>
            {WEEK_HEIGHTS.map((h, i) => (
              <View key={i} style={s.barWrap}>
                <Text style={s.barMonthAbove}>{WEEK_MONTHS[i]}</Text>
                <View
                  style={[
                    s.bar,
                    { height: h },
                    i === 5 && s.barActive,
                  ]}
                />
              </View>
            ))}
            <View style={s.targetLine} />
          </View>
        </View>

        {/* AI Insights */}
        <View style={s.aiCard}>
          <View style={s.aiHeader}>
            <Ionicons name="sparkles" size={18} color={colors.tertiary} />
            <Text style={s.aiTitle}>AI Insights</Text>
          </View>
          <Text style={s.aiText}>
            Your latest reports indicate slightly elevated sugar levels. We suggest a consultation to review dietary adjustments.
          </Text>
          <Pressable style={s.aiBtn}>
            <Text style={s.aiBtnText}>Read Full Analysis</Text>
          </Pressable>
        </View>

        {/* Previous Reports */}
        <Text style={s.sectionTitle}>Previous Reports</Text>
        <View style={s.prevList}>
          {PREV_REPORTS.map((r) => (
            <View key={r.title} style={[s.prevCard, { backgroundColor: r.bg }]}>
              <View style={s.prevLeft}>
                <View style={[s.prevDot, { backgroundColor: r.statusColor }]} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={s.prevRow}>
                  <Text style={s.prevTitle}>{r.title}</Text>
                  <Text style={s.prevDate}>{r.date}</Text>
                </View>
                <Text style={[s.prevStatus, { color: r.statusColor }]}>{r.status}</Text>
              </View>
              <View style={s.prevActions}>
                <Pressable style={s.prevBtn}>
                  <Ionicons name="download-outline" size={16} color={colors.text.primary} />
                </Pressable>
                <Pressable style={s.prevBtn}>
                  <Ionicons name="share-outline" size={16} color={colors.text.primary} />
                </Pressable>
              </View>
            </View>
          ))}
        </View>
        <Pressable style={s.historyBtn}>
          <Text style={s.historyBtnText}>View History</Text>
        </Pressable>

        {/* Book Lab Test + Map */}
        <View style={s.bottomGrid}>
          <LinearGradient
            colors={[colors.primaryContainer, "#1e3a8a"]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={s.bookCard}
          >
            <Text style={s.bookTitle}>Need a New Test?</Text>
            <Text style={s.bookSub}>Book a home sample collection or visit a nearby certified laboratory.</Text>
            <Pressable style={s.bookBtn}>
              <Text style={s.bookBtnText}>Book Lab Test</Text>
              <Ionicons name="arrow-forward" size={16} color={colors.primaryContainer} />
            </Pressable>
          </LinearGradient>
          <View style={s.mapCard}>
            <View style={s.mapTag}>
              <Ionicons name="location" size={14} color={colors.secondary} />
              <Text style={s.mapTagText}>Nearby Labs</Text>
            </View>
            <View style={s.mapPlaceholder}>
              <Ionicons name="map" size={48} color={colors.text.muted} />
              <Text style={s.mapText}>Map View</Text>
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
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface.containerHigh, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: colors.glass.border },
  scroll: { paddingHorizontal: 16 },
  hero: { borderRadius: 30, padding: 28, marginBottom: 24, minHeight: 220, justifyContent: "flex-end" },
  heroTag: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(0,0,0,0.3)", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, alignSelf: "flex-start", marginBottom: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  heroTagText: { fontSize: 11, fontWeight: "700", color: "#fca5a5", letterSpacing: 0.5 },
  heroTitle: { fontSize: 36, fontWeight: "700", color: "white", marginBottom: 10 },
  heroSub: { fontSize: 15, color: "#fecaca", lineHeight: 24 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  sectionTitle: { fontSize: 20, fontWeight: "700", color: colors.text.primary, marginBottom: 0 },
  seeAll: { fontSize: 13, color: colors.primary },
  upcomingGrid: { flexDirection: "row", gap: 12, marginBottom: 20 },
  upcomingCard: { flex: 1, borderRadius: 24, padding: 16, gap: 8, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 20, elevation: 5 },
  upcomingTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  upcomingIconWrap: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surface.containerHigh, justifyContent: "center", alignItems: "center" },
  badge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { fontSize: 10, fontWeight: "700" },
  upcomingTitle: { fontSize: 16, fontWeight: "700", color: colors.text.primary },
  upcomingSub: { fontSize: 12, color: colors.text.secondary },
  upcomingFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.1)", paddingTop: 10, marginTop: 4 },
  upcomingTime: { fontSize: 12, color: colors.text.secondary },
  trendsCard: { backgroundColor: "#18344F", borderRadius: 30, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: colors.glass.border },
  trendsHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  tabRow: { flexDirection: "row", gap: 6 },
  trendTab: { backgroundColor: colors.surface.container, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  trendTabActive: { backgroundColor: "rgba(180,197,255,0.2)", borderWidth: 1, borderColor: "rgba(180,197,255,0.3)" },
  trendTabText: { fontSize: 11, color: colors.text.secondary },
  trendTabTextActive: { color: colors.primary, fontWeight: "600" },
  barChart: { flexDirection: "row", alignItems: "flex-end", height: 120, gap: 6, position: "relative" },
  barWrap: { flex: 1, alignItems: "center", gap: 6 },
  barMonthAbove: { fontSize: 9, color: colors.text.secondary, position: "absolute", top: -18 },
  bar: { width: "100%", backgroundColor: "rgba(79,219,200,0.3)", borderRadius: 4 },
  barActive: { backgroundColor: colors.primary, shadowColor: colors.primary, shadowOpacity: 0.5, shadowRadius: 10, elevation: 5 },
  targetLine: { position: "absolute", left: 0, right: 0, top: "35%", borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.15)", borderStyle: "dashed" },
  aiCard: { backgroundColor: colors.glass.background, borderRadius: 30, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: colors.glass.border, position: "relative", overflow: "hidden" },
  aiHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
  aiTitle: { fontSize: 16, fontWeight: "700", color: colors.text.primary },
  aiText: { fontSize: 13, color: colors.text.secondary, lineHeight: 20, marginBottom: 14 },
  aiBtn: { backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 16, paddingHorizontal: 16, paddingVertical: 8, alignSelf: "flex-start", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  aiBtnText: { fontSize: 13, color: "white", fontWeight: "600" },
  prevList: { gap: 12, marginBottom: 12 },
  prevCard: { borderRadius: 20, padding: 14, flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.2)" },
  prevLeft: { alignItems: "center", paddingTop: 2 },
  prevDot: { width: 10, height: 10, borderRadius: 5 },
  prevRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  prevTitle: { fontSize: 14, fontWeight: "700", color: colors.text.primary },
  prevDate: { fontSize: 12, color: colors.text.secondary },
  prevStatus: { fontSize: 12, fontWeight: "600", marginTop: 3 },
  prevActions: { flexDirection: "row", gap: 6 },
  prevBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.surface.containerHighest, justifyContent: "center", alignItems: "center" },
  historyBtn: { borderWidth: 1, borderColor: colors.glass.border, borderRadius: 16, padding: 14, alignItems: "center", marginBottom: 20 },
  historyBtnText: { fontSize: 14, color: colors.text.secondary },
  bottomGrid: { flexDirection: "row", gap: 12, marginBottom: 8 },
  bookCard: { flex: 1, borderRadius: 30, padding: 20, justifyContent: "flex-end", minHeight: 200 },
  bookTitle: { fontSize: 24, fontWeight: "700", color: "white", marginBottom: 8 },
  bookSub: { fontSize: 13, color: "rgba(219,225,255,0.8)", marginBottom: 16, lineHeight: 20 },
  bookBtn: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "white", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14, alignSelf: "flex-start" },
  bookBtnText: { fontSize: 14, fontWeight: "700", color: colors.primaryContainer },
  mapCard: { flex: 1, backgroundColor: "#18344F", borderRadius: 30, padding: 12, borderWidth: 1, borderColor: colors.glass.border, minHeight: 200, overflow: "hidden" },
  mapTag: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(0,0,0,0.5)", borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6, alignSelf: "flex-start", borderWidth: 1, borderColor: colors.glass.border, marginBottom: 12 },
  mapTagText: { fontSize: 12, fontWeight: "700", color: "white" },
  mapPlaceholder: { flex: 1, justifyContent: "center", alignItems: "center", gap: 8 },
  mapText: { fontSize: 12, color: colors.text.muted },
  navBar: { position: "absolute", bottom: 0, left: 0, right: 0, height: 72, backgroundColor: colors.surface.container, borderTopWidth: 1, borderTopColor: colors.glass.border, flexDirection: "row", justifyContent: "space-around", alignItems: "center", paddingHorizontal: 8 },
  navBtn: { flex: 1, alignItems: "center", justifyContent: "center", gap: 4, paddingVertical: 8 },
  navLabel: { fontSize: 10, color: colors.text.secondary, fontWeight: "500" },
  navLabelActive: { color: colors.primary, fontWeight: "700" },
  sosBtn: { width: 56, height: 56, borderRadius: 28, backgroundColor: "#E62E2E", justifyContent: "center", alignItems: "center", marginBottom: 12, shadowColor: "#E62E2E", shadowOpacity: 0.5, shadowRadius: 12, elevation: 8 },
});
