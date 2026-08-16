import React from "react";
import {
  ScrollView, Text, View, Pressable, StyleSheet, Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import Animated, { FadeInDown } from "react-native-reanimated";
import { RootStackParamList } from "@/navigation/types";
import { colors } from "@/theme/colors";
import { AnimatedCard } from "@/components/AnimatedCard";

type Props = NativeStackScreenProps<RootStackParamList, "Discover">;

const { width: W } = Dimensions.get("window");
const CARD_W = (W - 32 - 12) / 2; // 2-col grid, 16px side padding, 12px gap

// ── Categories — horizontal 2×2 grid ─────────────────────────────────────────
const CATEGORIES = [
  { icon: "heart",        label: "Health",     sub: "24 services",  gradient: ["#be185d", "#8b5cf6"] as string[], route: "HealthDashboard" },
  { icon: "flash",        label: "Fitness",    sub: "6 workouts",   gradient: ["#1e3a8a", "#38bdf8"] as string[], route: "FitnessDashboard" },
  { icon: "alert-circle", label: "Emergency",  sub: "URGENT",       gradient: ["#7f1d1d", "#ef4444"] as string[], route: "EmergencyAssistance" },
  { icon: "happy",        label: "Wellness",   sub: "Mind & Body",  gradient: ["#065f46", "#14b8a6"] as string[], route: "WellnessDashboard" },
  { icon: "moon",         label: "Sleep",      sub: "Track rest",   gradient: ["#4338ca", "#8b5cf6"] as string[], route: "SleepDashboard" },
  { icon: "nutrition",    label: "Nutrition",  sub: "Eat better",   gradient: ["#92400e", "#f59e0b"] as string[], route: "NutritionDashboard" },
];

const ARTICLES = [
  { tag: "NUTRITION",   title: "The Future of Personalized Nutrition and Wellness", read: "5 min read", gradient: ["#1e3a8a", "#4338ca"] as string[] },
  { tag: "SMART HOME",  title: "Integrating Health Tech into Your Living Space",     read: "8 min read", gradient: ["#134e4a", "#0d9488"] as string[] },
];

const EXPLORE_MORE = [
  { label: "AI Coach",        icon: "sparkles",      route: "AICoach",           color: "#8343f4" },
  { label: "Medication",      icon: "medical",       route: "MedicationCenter",  color: "#059669" },
  { label: "Family",          icon: "people",        route: "FamilyDashboard",   color: "#d97706" },
  { label: "Medical Records", icon: "document-text", route: "MedicalRecords",    color: "#1e3a8a" },
  { label: "Hydration",       icon: "water",         route: "HydrationDashboard",color: "#0284c7" },
  { label: "Steps",           icon: "walk",          route: "DailyStepsDashboard",color: "#6d28d9" },
];

const NAV_TABS = [
  { icon: "home-outline" as const,   route: "HomeDashboard" as const,    label: "Home" },
  { icon: "heart-outline" as const,  route: "HealthDashboard" as const,  label: "Health" },
  { icon: "compass" as const,        route: "Discover" as const,         label: "Discover" },
  { icon: "barbell-outline" as const,route: "FitnessDashboard" as const, label: "Fitness" },
  { icon: "person-outline" as const, route: "Profile" as const,          label: "Profile" },
];

export default function DiscoverScreen({ navigation }: Props) {
  return (
    <View style={s.root}>

      {/* ── Header ──────────────────────────────────────────── */}
      <View style={s.header}>
        <View>
          <Text style={s.pageTitle}>Discover</Text>
          <Text style={s.pageSub}>Explore new ways to improve your health.</Text>
        </View>
        <Pressable
          style={s.iconBtn}
          onPress={() => navigation.navigate("Notifications" as any)}
        >
          <Ionicons name="notifications-outline" size={20} color={colors.text.secondary} />
          <View style={s.notifDot} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* ── Hero Card ────────────────────────────────────── */}
        <Animated.View entering={FadeInDown.duration(400).springify()}>
          <LinearGradient
            colors={["#04b4a2", "#005048", "#041423"]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={s.hero}
          >
            <View style={s.heroTag}>
              <Text style={s.heroTagText}>FEATURED FOR YOU</Text>
            </View>
            <Text style={s.heroTitle}>Complete Family Wellness</Text>
            <Text style={s.heroSub}>
              Manage health, home care, emergency services and daily routines in one place.
            </Text>
            <Pressable
              style={s.heroBtn}
              onPress={() => navigation.navigate("HomeDashboard")}
            >
              <Text style={s.heroBtnText}>Explore Now</Text>
              <Ionicons name="arrow-forward" size={14} color={colors.onPrimary} />
            </Pressable>
          </LinearGradient>
        </Animated.View>

        {/* ── Popular Categories — 2-col grid ─────────────── */}
        <Text style={s.sectionTitle}>Popular Categories</Text>
        <View style={s.categoryGrid}>
          {CATEGORIES.map((c, i) => (
            <AnimatedCard
              key={c.label}
              onPress={() => navigation.navigate(c.route as any)}
              style={s.categoryOuter}
            >
              <Animated.View entering={FadeInDown.delay(i * 60).duration(350).springify()}>
                <LinearGradient
                  colors={c.gradient}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={s.categoryCard}
                >
                  <View style={s.catIconWrap}>
                    <Ionicons name={c.icon as any} size={26} color="white" />
                  </View>
                  <View style={s.catTextWrap}>
                    <Text style={s.categoryLabel}>{c.label}</Text>
                    {c.sub === "URGENT" ? (
                      <View style={s.urgentBadge}>
                        <Text style={s.urgentText}>URGENT</Text>
                      </View>
                    ) : (
                      <Text style={s.categorySub}>{c.sub}</Text>
                    )}
                  </View>
                  <Ionicons name="arrow-forward" size={16} color="rgba(255,255,255,0.5)" />
                </LinearGradient>
              </Animated.View>
            </AnimatedCard>
          ))}
        </View>

        {/* ── Articles ─────────────────────────────────────── */}
        <Text style={s.sectionTitle}>Read & Inspire</Text>
        {ARTICLES.map((a, i) => (
          <Animated.View
            key={a.title}
            entering={FadeInDown.delay(i * 80).duration(400).springify()}
          >
            <View style={s.articleCard}>
              <LinearGradient colors={a.gradient} style={s.articleThumb}>
                <Ionicons name="document-text" size={32} color="rgba(255,255,255,0.4)" />
              </LinearGradient>
              <View style={s.articleBody}>
                <View style={s.articleTag}>
                  <Text style={s.articleTagText}>{a.tag}</Text>
                </View>
                <Text style={s.articleTitle}>{a.title}</Text>
                <View style={s.articleFooter}>
                  <Ionicons name="time-outline" size={13} color={colors.text.muted} />
                  <Text style={s.articleRead}>{a.read}</Text>
                  <View style={{ flex: 1 }} />
                  <Ionicons name="bookmark-outline" size={18} color={colors.text.secondary} />
                </View>
              </View>
            </View>
          </Animated.View>
        ))}

        {/* ── Explore More ─────────────────────────────────── */}
        <Text style={s.sectionTitle}>Explore More</Text>
        <View style={s.exploreGrid}>
          {EXPLORE_MORE.map((e, i) => (
            <AnimatedCard
              key={e.label}
              onPress={() => navigation.navigate(e.route as any)}
              style={s.exploreOuter}
            >
              <Animated.View
                entering={FadeInDown.delay(i * 50).duration(350).springify()}
                style={[s.exploreCard, { backgroundColor: e.color }]}
              >
                <View style={s.exploreIconWrap}>
                  <Ionicons name={e.icon as any} size={22} color="white" />
                </View>
                <Text style={s.exploreLabel}>{e.label}</Text>
              </Animated.View>
            </AnimatedCard>
          ))}
        </View>

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* ── Bottom Nav ──────────────────────────────────────── */}
      <View style={s.navBar}>
        {NAV_TABS.map((n) => {
          const isActive = n.route === "Discover";
          return (
            <Pressable
              key={n.route}
              onPress={() => n.route !== "Discover" && navigation.navigate(n.route as any)}
              style={s.navBtn}
            >
              <Ionicons
                name={n.icon}
                size={22}
                color={isActive ? colors.primary : colors.text.secondary}
              />
              <Text style={[s.navLabel, isActive && s.navLabelActive]}>{n.label}</Text>
            </Pressable>
          );
        })}
      </View>

    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface.dim },

  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start",
    paddingHorizontal: 16, paddingTop: 52, paddingBottom: 12,
  },
  pageTitle: { fontSize: 28, fontWeight: "700", color: colors.text.primary },
  pageSub: { fontSize: 14, color: colors.text.secondary, marginTop: 4 },
  iconBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.surface.containerHigh,
    borderWidth: 1, borderColor: colors.glass.border,
    justifyContent: "center", alignItems: "center",
  },
  notifDot: {
    position: "absolute", top: 9, right: 9,
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: colors.error,
    borderWidth: 1, borderColor: colors.surface.containerHigh,
  },

  scroll: { paddingHorizontal: 16, paddingTop: 4 },

  // Hero
  hero: {
    borderRadius: 28, padding: 24,
    marginBottom: 24, minHeight: 240,
    justifyContent: "flex-end",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
  },
  heroTag: {
    backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 4,
    alignSelf: "flex-start", marginBottom: 12,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.18)",
  },
  heroTagText: { fontSize: 11, fontWeight: "700", color: colors.secondaryFixed },
  heroTitle: { fontSize: 26, fontWeight: "700", color: "white", marginBottom: 8, lineHeight: 34 },
  heroSub: { fontSize: 14, color: "rgba(255,255,255,0.75)", marginBottom: 20, lineHeight: 20 },
  heroBtn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: colors.primary,
    paddingHorizontal: 20, paddingVertical: 12,
    borderRadius: 20, alignSelf: "flex-start",
  },
  heroBtnText: { color: colors.onPrimary, fontSize: 14, fontWeight: "700" },

  sectionTitle: { fontSize: 20, fontWeight: "700", color: colors.text.primary, marginBottom: 12 },

  // Category cards — 2-col, horizontal layout (icon + text + arrow in a row)
  categoryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 24 },
  categoryOuter: { width: CARD_W },
  categoryCard: {
    borderRadius: 20, padding: 16,
    flexDirection: "row", alignItems: "center",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.12)",
    minHeight: 72,
    gap: 10,
  },
  catIconWrap: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center", alignItems: "center",
    flexShrink: 0,
  },
  catTextWrap: { flex: 1 },
  categoryLabel: { fontSize: 13, fontWeight: "700", color: "white" },
  categorySub: { fontSize: 11, color: "rgba(255,255,255,0.65)", marginTop: 2 },
  urgentBadge: {
    backgroundColor: colors.error, borderRadius: 4,
    paddingHorizontal: 5, paddingVertical: 2,
    alignSelf: "flex-start", marginTop: 3,
  },
  urgentText: { fontSize: 9, fontWeight: "700", color: "white" },

  // Articles
  articleCard: {
    backgroundColor: colors.surface.container,
    borderRadius: 24, overflow: "hidden",
    marginBottom: 14, borderWidth: 1, borderColor: colors.glass.border,
    flexDirection: "row", alignItems: "stretch",
  },
  articleThumb: {
    width: 90, justifyContent: "center", alignItems: "center",
  },
  articleBody: { flex: 1, padding: 16 },
  articleTag: {
    backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 3, alignSelf: "flex-start",
    marginBottom: 8,
  },
  articleTagText: { fontSize: 10, fontWeight: "700", color: colors.secondary },
  articleTitle: { fontSize: 14, fontWeight: "600", color: colors.text.primary, lineHeight: 20 },
  articleFooter: { flexDirection: "row", alignItems: "center", marginTop: 10, gap: 4 },
  articleRead: { fontSize: 12, color: colors.text.muted },

  // Explore more — 3-col
  exploreGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 8 },
  exploreOuter: { width: (W - 32 - 24) / 3 },
  exploreCard: {
    borderRadius: 20, padding: 14, alignItems: "center",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.15)",
  },
  exploreIconWrap: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center", alignItems: "center",
    marginBottom: 8,
  },
  exploreLabel: { fontSize: 11, color: "white", fontWeight: "600", textAlign: "center" },

  // Bottom nav
  navBar: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    flexDirection: "row",
    height: 72, marginHorizontal: 12, marginBottom: 12,
    backgroundColor: "rgba(10,22,36,0.97)",
    borderRadius: 28, borderWidth: 1, borderColor: colors.glass.border,
    elevation: 16, alignItems: "center",
  },
  navBtn: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 8 },
  navLabel: { fontSize: 10, color: colors.text.secondary, marginTop: 3, fontWeight: "500" },
  navLabelActive: { color: colors.primary, fontWeight: "700" },
});
