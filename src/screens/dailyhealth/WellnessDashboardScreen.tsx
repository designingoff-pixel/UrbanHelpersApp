import React from "react";
import { ScrollView, Text, View, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/types";
import { colors } from "@/theme/colors";

type Props = NativeStackScreenProps<RootStackParamList, "WellnessDashboard">;

const FEATURE_CARDS = [
  {
    label: "ENERGY",
    icon: "flash",
    value: "94",
    unit: "%",
    color: colors.secondary,
    bg: colors.glass.background,
    progress: 94,
  },
  {
    label: "STRESS",
    icon: "heart",
    value: "Low",
    unit: "",
    sub: "Resting HR: 62 bpm",
    color: colors.primary,
    bg: colors.glass.background,
    progress: null,
  },
  {
    label: "RECOVERY STATE",
    icon: "moon",
    value: "Ready",
    unit: "",
    sub: "7h 42m Deep Sleep recorded.",
    color: colors.tertiary,
    bg: colors.glass.background,
    progress: null,
    wide: true,
  },
];

const ACTIVITIES = [
  {
    title: "Deep Urban Calm",
    sub: "A 10-minute guided breathing exercise to lower heart rate amid city noise.",
    duration: "10 min",
    tag: "Focus",
    tagColor: colors.secondary,
    icon: "water",
    route: "MeditationDashboard",
  },
  {
    title: "Neural Reset Soundscape",
    sub: "Binaural beats designed to ease transitions between high-stress tasks.",
    duration: "25 min",
    tag: "Recovery",
    tagColor: colors.tertiary,
    icon: "musical-notes",
    route: "SleepDashboard",
  },
];

// Per PROJECT_DOCUMENTATION.md:
// Coaching → AICoach | Nutrition → NutritionDashboard | Health (active)
const NAV = [
  { icon: "heart", label: "Health", route: "HealthDashboard", active: true },
  { icon: "headset-outline", label: "Coaching", route: "AICoach" },
  { icon: "add-circle-outline", label: "Log", route: "AdvancedNutritionDashboard" },
  { icon: "restaurant-outline", label: "Nutrition", route: "NutritionDashboard" },
  { icon: "person-outline", label: "Profile", route: "Profile" },
];

export default function WellnessDashboardScreen({ navigation }: Props) {
  return (
    <View style={s.root}>
      {/* Header */}
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
        <View style={s.hero}>
          <LinearGradient
            colors={["#00b894", "#0984e3"]}
            start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
            style={StyleSheet.absoluteFill}
          />
          {/* Dark overlay */}
          <LinearGradient
            colors={["rgba(4,20,35,0.6)", "rgba(4,20,35,0.1)", "rgba(4,20,35,0.7)"]}
            start={{ x: 0, y: 1 }} end={{ x: 0, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={s.heroLiveBadge}>
            <View style={s.liveDot} />
            <Text style={s.liveBadgeText}>LIVE VITALS</Text>
          </View>
          <Text style={s.heroTitle}>Neural Sync{"\n"}Optimal</Text>
          <Text style={s.heroSub}>
            Your cognitive load and physical recovery are perfectly balanced for today's urban challenges.
          </Text>
        </View>

        {/* Feature Cards */}
        <View style={s.cardsGrid}>
          {/* Energy */}
          <View style={s.featureCard}>
            <View style={s.featureTop}>
              <Text style={s.featureLabel}>ENERGY</Text>
              <Ionicons name="flash" size={20} color={colors.secondary} />
            </View>
            <Text style={s.featureValue}>94<Text style={s.featureUnit}>%</Text></Text>
            <View style={s.progressBg}>
              <LinearGradient
                colors={[colors.secondaryContainer, colors.secondary]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={[s.progressFill, { width: "94%" }]}
              />
            </View>
          </View>

          {/* Stress */}
          <View style={s.featureCard}>
            <View style={s.featureTop}>
              <Text style={s.featureLabel}>STRESS</Text>
              <View style={s.heartWrap}>
                <Ionicons name="heart" size={14} color={colors.primary} />
              </View>
            </View>
            <Text style={s.featureValue}>Low</Text>
            <Text style={s.featureSub}>Resting HR: 62 bpm</Text>
          </View>

          {/* Recovery — wide */}
          <View style={[s.featureCard, s.featureCardWide]}>
            <View style={s.featureTop}>
              <Text style={s.featureLabel}>RECOVERY STATE</Text>
              <Ionicons name="moon" size={20} color={colors.tertiary} />
            </View>
            <View style={s.recoveryRow}>
              <View>
                <Text style={s.featureValue}>Ready</Text>
                <Text style={s.featureSub}>7h 42m Deep Sleep recorded.</Text>
              </View>
              {/* Mini bars */}
              <View style={s.miniBars}>
                {[6, 10, 4, 8, 12].map((h, i) => (
                  <View
                    key={i}
                    style={[
                      s.miniBar,
                      { height: h, backgroundColor: i >= 3 ? colors.tertiary : colors.tertiaryFixed },
                    ]}
                  />
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Recommended For You */}
        <View style={s.recHeader}>
          <Text style={s.sectionTitle}>Recommended for You</Text>
          <View style={s.aiBadge}>
            <Text style={s.aiBadgeText}>AI Generated</Text>
          </View>
        </View>

        <View style={s.activitiesList}>
          {ACTIVITIES.map((a) => (
            <Pressable
              key={a.title}
              onPress={() => navigation.navigate(a.route as any)}
              style={({ pressed }) => [s.activityCard, { opacity: pressed ? 0.85 : 1 }]}
            >
              <View style={s.activityThumb}>
                <LinearGradient
                  colors={["#0f2027", "#203a43"]}
                  style={StyleSheet.absoluteFill}
                />
                <Ionicons name={a.icon as any} size={32} color="rgba(255,255,255,0.4)" />
                <View style={s.playOverlay}>
                  <Ionicons name="play" size={22} color="white" />
                </View>
              </View>
              <View style={s.activityInfo}>
                <Text style={s.activityTitle}>{a.title}</Text>
                <Text style={s.activitySub} numberOfLines={2}>{a.sub}</Text>
                <View style={s.activityMeta}>
                  <Text style={[s.activityDuration, { color: a.tagColor }]}>{a.duration}</Text>
                  <View style={s.activityDot} />
                  <Text style={s.activityTag}>{a.tag}</Text>
                </View>
              </View>
            </Pressable>
          ))}
        </View>

        {/* Quick Links */}
        <Text style={s.sectionTitle}>Quick Access</Text>
        <View style={s.quickGrid}>
          {[
            { label: "Hydration", icon: "water", route: "HydrationDashboard", color: "#4facfe" },
            { label: "Sleep", icon: "moon", route: "SleepDashboard", color: "#4338ca" },
            { label: "Nutrition", icon: "nutrition", route: "NutritionDashboard", color: "#ea580c" },
            { label: "AI Coach", icon: "sparkles", route: "AICoach", color: "#8343f4" },
          ].map((q) => (
            <Pressable
              key={q.label}
              onPress={() => navigation.navigate(q.route as any)}
              style={({ pressed }) => [s.quickCard, { backgroundColor: `${q.color}22`, opacity: pressed ? 0.8 : 1 }]}
            >
              <Ionicons name={q.icon as any} size={26} color={q.color} />
              <Text style={[s.quickLabel, { color: q.color }]}>{q.label}</Text>
            </Pressable>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Nav */}
      <View style={s.navBar}>
        {NAV.map((n) => (
          <Pressable
            key={n.label}
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
  root: { flex: 1, backgroundColor: "#081826" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: 52, paddingBottom: 12 },
  headerTitle: { fontSize: 20, fontWeight: "700", color: colors.primary },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.07)", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  scroll: { paddingHorizontal: 16 },
  hero: { borderRadius: 32, minHeight: 360, marginBottom: 20, overflow: "hidden", justifyContent: "flex-end", padding: 24, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  heroLiveBadge: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "rgba(17,33,48,0.6)", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, alignSelf: "flex-start", marginBottom: 20, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.secondary },
  liveBadgeText: { fontSize: 10, fontWeight: "700", color: colors.secondary, letterSpacing: 1 },
  heroTitle: { fontSize: 48, fontWeight: "700", color: "white", lineHeight: 56, marginBottom: 12 },
  heroSub: { fontSize: 16, color: "rgba(255,255,255,0.8)", lineHeight: 24 },
  cardsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 24 },
  featureCard: { width: "47%", backgroundColor: "rgba(24,52,79,0.7)", borderRadius: 30, padding: 18, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", minHeight: 160, justifyContent: "space-between" },
  featureCardWide: { width: "100%" },
  featureTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 },
  featureLabel: { fontSize: 10, fontWeight: "700", color: colors.text.secondary, letterSpacing: 0.5 },
  featureValue: { fontSize: 36, fontWeight: "700", color: "white" },
  featureUnit: { fontSize: 18, fontWeight: "400", color: colors.text.secondary },
  featureSub: { fontSize: 12, color: colors.primary, marginTop: 4 },
  progressBg: { height: 6, backgroundColor: colors.surface.containerHighest, borderRadius: 3, overflow: "hidden", marginTop: 12 },
  progressFill: { height: 6, borderRadius: 3 },
  heartWrap: { width: 32, height: 32, borderRadius: 16, backgroundColor: "rgba(180,197,255,0.15)", justifyContent: "center", alignItems: "center" },
  recoveryRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  miniBars: { flexDirection: "row", alignItems: "flex-end", gap: 4 },
  miniBar: { width: 8, borderRadius: 4 },
  recHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  sectionTitle: { fontSize: 20, fontWeight: "700", color: colors.text.primary, marginBottom: 14 },
  aiBadge: { backgroundColor: "rgba(180,197,255,0.1)", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4, borderWidth: 1, borderColor: "rgba(180,197,255,0.2)" },
  aiBadgeText: { fontSize: 11, color: colors.primary },
  activitiesList: { gap: 12, marginBottom: 24 },
  activityCard: { backgroundColor: "rgba(24,52,79,0.7)", borderRadius: 24, padding: 14, flexDirection: "row", gap: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  activityThumb: { width: 80, height: 80, borderRadius: 16, overflow: "hidden", justifyContent: "center", alignItems: "center" },
  playOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.3)", justifyContent: "center", alignItems: "center" },
  activityInfo: { flex: 1 },
  activityTitle: { fontSize: 16, fontWeight: "700", color: "white", marginBottom: 4 },
  activitySub: { fontSize: 13, color: colors.text.secondary, lineHeight: 18, marginBottom: 8 },
  activityMeta: { flexDirection: "row", alignItems: "center", gap: 6 },
  activityDuration: { fontSize: 12, fontWeight: "700" },
  activityDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.2)" },
  activityTag: { fontSize: 12, color: colors.text.secondary },
  quickGrid: { flexDirection: "row", gap: 12, marginBottom: 8 },
  quickCard: { flex: 1, borderRadius: 20, padding: 14, alignItems: "center", gap: 8, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  quickLabel: { fontSize: 11, fontWeight: "700" },
  navBar: { position: "absolute", bottom: 0, left: 0, right: 0, height: 72, backgroundColor: colors.surface.container, borderTopWidth: 1, borderTopColor: colors.glass.border, flexDirection: "row", justifyContent: "space-around", alignItems: "center", paddingHorizontal: 8 },
  navBtn: { flex: 1, alignItems: "center", justifyContent: "center", gap: 4, paddingVertical: 8 },
  navLabel: { fontSize: 10, color: colors.text.secondary, fontWeight: "500" },
  navLabelActive: { color: colors.primary, fontWeight: "700" },
});
