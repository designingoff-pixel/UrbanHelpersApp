import React from "react";
import {
  ScrollView, Text, View, Pressable, StyleSheet, Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/types";
import { colors } from "@/theme/colors";

type Props = NativeStackScreenProps<RootStackParamList, "Discover">;

const { width: SCREEN_W } = Dimensions.get("window");
// 16px padding each side, 12px gap between 2 columns
const CARD_W = (SCREEN_W - 32 - 12) / 2;

const CATEGORIES: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  sub: string;
  gradient: string[];
  route: keyof RootStackParamList;
}[] = [
  { icon: "heart",        label: "Health",    sub: "24 services",  gradient: ["#ec4899", "#8b5cf6"], route: "HealthDashboard" },
  { icon: "home",         label: "Home Care", sub: "Home services", gradient: ["#f97316", "#fbbf24"], route: "MedicationCenter" },
  { icon: "alert-circle", label: "Emergency", sub: "URGENT",        gradient: ["#ef4444", "#f97316"], route: "EmergencyAssistance" },
  { icon: "happy",        label: "Wellness",  sub: "Mind & Body",   gradient: ["#14b8a6", "#06b6d4"], route: "WellnessDashboard" },
];

const ARTICLES = [
  { tag: "NUTRITION",   title: "The Future of Personalized Nutrition and Wellness",  read: "5 min read" },
  { tag: "SMART HOME",  title: "Integrating Health Tech into Your Living Space",      read: "8 min read" },
];

const EXPLORE_MORE: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: keyof RootStackParamList;
  color: string;
}[] = [
  { label: "Sleep",      icon: "moon",          route: "SleepDashboard",      color: "#4338ca" },
  { label: "Fitness",    icon: "barbell",        route: "FitnessDashboard",    color: "#1e3a8a" },
  { label: "Nutrition",  icon: "nutrition",      route: "NutritionDashboard",  color: "#ea580c" },
  { label: "Family",     icon: "people",         route: "FamilyDashboard",     color: "#d97706" },
  { label: "Medication", icon: "medical",        route: "MedicationCenter",    color: "#059669" },
  { label: "AI Coach",   icon: "sparkles",       route: "AICoach",             color: "#8343f4" },
];

const NAV_TABS: {
  icon: keyof typeof Ionicons.glyphMap;
  route: keyof RootStackParamList;
  label: string;
  active?: boolean;
}[] = [
  { icon: "home-outline",    route: "HomeDashboard",   label: "Home" },
  { icon: "heart-outline",   route: "HealthDashboard", label: "Health" },
  { icon: "compass",         route: "Discover",        label: "Discover", active: true },
  { icon: "barbell-outline", route: "FitnessDashboard",label: "Fitness" },
  { icon: "person-outline",  route: "Profile",         label: "Profile" },
];

export default function DiscoverScreen({ navigation }: Props) {
  return (
    <View style={s.root}>

      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.pageTitle}>Discover</Text>
          <Text style={s.pageSub}>Explore new ways to improve your health.</Text>
        </View>
        <Pressable style={s.iconBtn}>
          <Ionicons name="notifications-outline" size={20} color={colors.text.secondary} />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
      >
        {/* ── Hero ─────────────────────────────────────── */}
        <Animated.View entering={FadeInDown.duration(400).springify()}>
          <LinearGradient
            colors={["#04b4a2", "#005048", "#041423"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
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
              style={({ pressed }) => [s.heroBtn, { opacity: pressed ? 0.85 : 1 }]}
              onPress={() => navigation.navigate("HomeDashboard")}
            >
              <Text style={s.heroBtnText}>Explore Now</Text>
            </Pressable>
          </LinearGradient>
        </Animated.View>

        {/* ── Popular Categories — proper 2-col grid ────── */}
        <Text style={s.sectionTitle}>Popular Categories</Text>
        <View style={s.categoryGrid}>
          {CATEGORIES.map((c, i) => (
            <Animated.View
              key={c.label}
              entering={FadeInDown.delay(i * 80).duration(380).springify().damping(16)}
              style={s.categoryOuter}
            >
              <Pressable
                onPress={() => navigation.navigate(c.route as any)}
                style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
              >
                <LinearGradient
                  colors={c.gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={s.categoryCard}
                >
                  {/* Icon circle */}
                  <View style={s.catIconWrap}>
                    <Ionicons name={c.icon} size={28} color="white" />
                  </View>
                  {/* Text at bottom */}
                  <View>
                    <Text style={s.categoryLabel}>{c.label}</Text>
                    {c.sub === "URGENT" ? (
                      <View style={s.urgentBadge}>
                        <Text style={s.urgentText}>{c.sub}</Text>
                      </View>
                    ) : (
                      <Text style={s.categorySub}>{c.sub}</Text>
                    )}
                  </View>
                </LinearGradient>
              </Pressable>
            </Animated.View>
          ))}
        </View>

        {/* ── Articles ─────────────────────────────────── */}
        <Text style={s.sectionTitle}>Read & Inspire</Text>
        {ARTICLES.map((a, i) => (
          <Animated.View
            key={a.title}
            entering={FadeInDown.delay(i * 100).duration(380).springify()}
            style={s.articleCard}
          >
            <View style={s.articleThumb}>
              <LinearGradient
                colors={["#1e3a8a", "#4338ca"]}
                style={s.articleThumbGrad}
              >
                <Ionicons name="document-text" size={32} color="rgba(255,255,255,0.4)" />
              </LinearGradient>
              <View style={s.articleTag}>
                <Text style={s.articleTagText}>{a.tag}</Text>
              </View>
            </View>
            <Text style={s.articleTitle}>{a.title}</Text>
            <View style={s.articleFooter}>
              <Text style={s.articleRead}>{a.read}</Text>
              <Ionicons name="bookmark-outline" size={18} color={colors.text.secondary} />
            </View>
          </Animated.View>
        ))}

        {/* ── Explore More 3-col grid ───────────────────── */}
        <Text style={s.sectionTitle}>Explore More</Text>
        <View style={s.exploreGrid}>
          {EXPLORE_MORE.map((e, i) => (
            <Animated.View
              key={e.label}
              entering={FadeInDown.delay(i * 60).duration(340).springify()}
              style={s.exploreOuter}
            >
              <Pressable
                onPress={() => navigation.navigate(e.route as any)}
                style={({ pressed }) => [
                  s.exploreCard,
                  { backgroundColor: e.color, opacity: pressed ? 0.85 : 1 },
                ]}
              >
                <Ionicons name={e.icon} size={24} color="white" />
                <Text style={s.exploreLabel}>{e.label}</Text>
              </Pressable>
            </Animated.View>
          ))}
        </View>

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* ── Bottom Nav ───────────────────────────────────── */}
      <View style={s.navBar}>
        {NAV_TABS.map((n) => (
          <Pressable
            key={n.route}
            onPress={() => navigation.navigate(n.route as any)}
            style={s.navBtn}
          >
            <Ionicons
              name={n.icon}
              size={22}
              color={n.active ? colors.primary : colors.text.secondary}
            />
            <Text style={[s.navLabel, n.active && s.navLabelActive]}>
              {n.label}
            </Text>
          </Pressable>
        ))}
      </View>

    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface.dim },

  // Header
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

  scroll: { paddingHorizontal: 16 },

  // Hero
  hero: {
    borderRadius: 28, padding: 24, marginBottom: 28,
    minHeight: 240, justifyContent: "flex-end",
    borderWidth: 1, borderColor: colors.glass.border,
  },
  heroTag: {
    backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 4,
    alignSelf: "flex-start", marginBottom: 12,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.2)",
  },
  heroTagText: { fontSize: 11, fontWeight: "700", color: colors.secondaryFixed },
  heroTitle: { fontSize: 26, fontWeight: "700", color: "white", marginBottom: 8, lineHeight: 34 },
  heroSub: { fontSize: 14, color: "rgba(255,255,255,0.8)", marginBottom: 20, lineHeight: 20 },
  heroBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24, paddingVertical: 12,
    borderRadius: 20, alignSelf: "flex-start",
  },
  heroBtnText: { color: colors.onPrimary, fontSize: 14, fontWeight: "700" },

  // Section title
  sectionTitle: { fontSize: 20, fontWeight: "700", color: colors.text.primary, marginBottom: 14 },

  // Category grid — 2 columns, fixed width, horizontal text
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 28,
  },
  categoryOuter: { width: CARD_W },
  categoryCard: {
    width: CARD_W,
    height: 150,                  // fixed height — no vertical text spill
    borderRadius: 24,
    padding: 18,
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    overflow: "hidden",
  },
  catIconWrap: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center", alignItems: "center",
  },
  categoryLabel: {
    fontSize: 15, fontWeight: "700", color: "white",
    marginBottom: 2,
    flexWrap: "wrap",
  },
  categorySub: { fontSize: 12, color: "rgba(255,255,255,0.7)" },
  urgentBadge: {
    backgroundColor: colors.error, borderRadius: 6,
    paddingHorizontal: 6, paddingVertical: 2,
    alignSelf: "flex-start", marginTop: 4,
  },
  urgentText: { fontSize: 10, fontWeight: "700", color: "white" },

  // Articles
  articleCard: {
    backgroundColor: colors.surface.containerHigh,
    borderRadius: 24, overflow: "hidden",
    marginBottom: 16,
    borderWidth: 1, borderColor: colors.glass.border,
  },
  articleThumb: { height: 150, position: "relative" },
  articleThumbGrad: { flex: 1, justifyContent: "center", alignItems: "center" },
  articleTag: {
    position: "absolute", top: 12, left: 12,
    backgroundColor: "rgba(0,0,0,0.5)", borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 4,
    borderWidth: 1, borderColor: colors.glass.border,
  },
  articleTagText: { fontSize: 11, fontWeight: "700", color: colors.secondary },
  articleTitle: {
    fontSize: 16, fontWeight: "700", color: colors.text.primary,
    padding: 16, lineHeight: 24,
  },
  articleFooter: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 16, paddingBottom: 16,
  },
  articleRead: { fontSize: 12, color: colors.text.secondary },

  // Explore more 3-col
  exploreGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 8 },
  exploreOuter: { width: "30%" },
  exploreCard: {
    borderRadius: 20, paddingVertical: 18,
    alignItems: "center", gap: 8,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.15)",
  },
  exploreLabel: { fontSize: 11, color: "white", fontWeight: "600" },

  // Bottom nav
  navBar: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    flexDirection: "row", alignItems: "center",
    height: 72, marginHorizontal: 12, marginBottom: 12,
    backgroundColor: "rgba(10,22,36,0.97)",
    borderRadius: 28, borderWidth: 1, borderColor: colors.glass.border,
    elevation: 16,
  },
  navBtn: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 8 },
  navLabel: { fontSize: 10, color: colors.text.secondary, marginTop: 3, fontWeight: "500" },
  navLabelActive: { color: colors.primary, fontWeight: "700" },
});
