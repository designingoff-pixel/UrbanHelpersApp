import React, { useState } from "react";
import {
  ScrollView,
  Text,
  View,
  Pressable,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/types";
import { colors } from "@/theme/colors";

type Props = NativeStackScreenProps<RootStackParamList, "HomeDashboard">;

const PILLS = [
  { name: "Home",      icon: "home-outline" as const,      active: true },
  { name: "Health",    icon: "heart-outline" as const,     active: false },
  { name: "Fitness",   icon: "barbell-outline" as const,   active: false },
  { name: "Home Care", icon: "briefcase-outline" as const, active: false },
  { name: "Family",    icon: "people-outline" as const,    active: false },
];

// wide: true  → full-width horizontal card (icon left, text right)
// wide: false → half-width vertical card   (icon top, text bottom)
const FEATURE_CARDS = [
  { id: "energy",    title: "Energy Score",   subtitle: "Understand how your day is shaping up.", gradient: ["#1e3a8a", "#2563eb", "#38bdf8"] as string[], icon: "flash",         route: "FitnessDashboard",    wide: true,  height: 110 },
  { id: "heart",     title: "Heart Health",   subtitle: "View your heart insights.",              gradient: ["#be185d", "#7e22ce"] as string[],            icon: "heart",         route: "HealthDashboard",     wide: false, height: 170 },
  { id: "sleep",     title: "Sleep",          subtitle: "Track your sleep quality.",              gradient: ["#4338ca", "#8b5cf6"] as string[],            icon: "moon",          route: "SleepDashboard",      wide: false, height: 170 },
  { id: "nutrition", title: "Nutrition",      subtitle: "Build healthier eating habits.",         gradient: ["#ea580c", "#d97706"] as string[],            icon: "nutrition",     route: "NutritionDashboard",  wide: true,  height: 110 },
  { id: "family",    title: "Family Care",    subtitle: "Stay connected with loved ones.",        gradient: ["#92400e", "#d97706", "#f59e0b"] as string[], icon: "people",        route: "FamilyDashboard",     wide: true,  height: 130 },
  { id: "medication",title: "Medication",     subtitle: "Manage your meds.",                      gradient: ["#065f46", "#059669"] as string[],            icon: "medical",       route: "MedicationCenter",    wide: false, height: 150 },
  { id: "emergency", title: "Emergency SOS", subtitle: "1-Tap Alert",                            gradient: ["#7f1d1d", "#b91c1c"] as string[],            icon: "alert-circle",  route: "EmergencyAssistance", wide: false, height: 150 },
  { id: "aicoach",   title: "AI Coach",       subtitle: "Personalized health guidance.",          gradient: ["#1d4ed8", "#6d28d9", "#8343f4"] as string[], icon: "sparkles",      route: "AICoach",             wide: true,  height: 110 },
  { id: "medical",   title: "Medical Records",subtitle: "Your health vault.",                     gradient: ["#1e3a8a", "#4c1d95"] as string[],            icon: "document-text", route: "MedicalRecords",      wide: false, height: 150 },
  { id: "discover",  title: "Discover",       subtitle: "Explore wellness content.",              gradient: ["#134e4a", "#0d9488"] as string[],            icon: "compass",       route: "Discover",            wide: false, height: 150 },
];

const NAV = [
  { icon: "home" as const,           route: "HomeDashboard",    label: "Home" },
  { icon: "heart-outline" as const,  route: "HealthDashboard",  label: "Health" },
  { icon: "compass-outline" as const,route: "Discover",         label: "Discover" },
  { icon: "barbell-outline" as const,route: "FitnessDashboard", label: "Fitness" },
  { icon: "person-outline" as const, route: "Profile",          label: "Profile" },
];

export default function HomeDashboardScreen({ navigation }: Props) {
  const [activeNav, setActiveNav] = useState("HomeDashboard");

  const handleNav = (route: string) => {
    setActiveNav(route);
    navigation.navigate(route as any);
  };

  return (
    <View style={s.root}>

      {/* ── Top App Bar ─────────────────────────────────── */}
      <View style={s.topBar}>
        <View style={s.topBarLeft}>
          <Text style={s.appTitle}>Urban Helpers</Text>
          <View style={s.subtitleRow}>
            <View style={s.avatar}>
              <Ionicons name="person" size={12} color={colors.text.secondary} />
            </View>
            <Text style={s.greeting}>Good Morning, Alex 👋</Text>
          </View>
          <Text style={s.tagline}>Your companion for healthier living.</Text>
        </View>
        <View style={s.topBarRight}>
          <Pressable style={s.iconBtn}>
            <Ionicons name="notifications-outline" size={20} color={colors.text.secondary} />
            <View style={s.notifBadge} />
          </Pressable>
          <Pressable style={s.iconBtn}>
            <Ionicons name="ellipsis-vertical" size={20} color={colors.text.secondary} />
          </Pressable>
        </View>
      </View>

      {/* ── Category Pills ──────────────────────────────── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.pillsContent}
        style={s.pillsScroll}
      >
        {PILLS.map((p) => (
          <Pressable key={p.name} style={[s.pill, p.active && s.pillActive]}>
            <Ionicons
              name={p.icon}
              size={13}
              color={p.active ? colors.primary : colors.text.secondary}
            />
            <Text style={[s.pillText, p.active && s.pillTextActive]}>
              {p.name}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* ── Main Scrollable Content ─────────────────────── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
      >
        {/* Hero */}
        <LinearGradient
          colors={[colors.gradients.hero[0], colors.gradients.hero[1], colors.gradients.hero[2]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.hero}
        >
          <Text style={s.heroTitle}>Take care of your family's wellbeing</Text>
          <Text style={s.heroSub}>
            Manage health, appointments, reminders, and home services in one place.
          </Text>
          <View style={s.heroCTA}>
            <View style={s.dotsRow}>
              <View style={s.dotActive} />
              <View style={s.dot} />
              <View style={s.dot} />
            </View>
            <Pressable
              onPress={() => navigation.navigate("Discover")}
              style={s.exploreBtn}
            >
              <Text style={s.exploreBtnText}>Explore</Text>
              <Ionicons name="arrow-forward" size={13} color="white" />
            </Pressable>
          </View>
        </LinearGradient>

        {/* ── Feature Cards Grid ─────────────────────────── */}
        <View style={s.cardGrid}>

          {/* Energy Score — wide */}
          <CardWide card={FEATURE_CARDS[0]} onPress={(r) => navigation.navigate(r as any)} />

          {/* Heart Health + Sleep — 2-col */}
          <View style={s.row2}>
            <CardHalf card={FEATURE_CARDS[1]} onPress={(r) => navigation.navigate(r as any)} />
            <CardHalf card={FEATURE_CARDS[2]} onPress={(r) => navigation.navigate(r as any)} />
          </View>

          {/* Nutrition — wide */}
          <CardWide card={FEATURE_CARDS[3]} onPress={(r) => navigation.navigate(r as any)} />

          {/* Family Care — wide */}
          <CardWide card={FEATURE_CARDS[4]} onPress={(r) => navigation.navigate(r as any)} />

          {/* Medication + Emergency — 2-col */}
          <View style={s.row2}>
            <CardHalf card={FEATURE_CARDS[5]} onPress={(r) => navigation.navigate(r as any)} />
            <CardHalf card={FEATURE_CARDS[6]} onPress={(r) => navigation.navigate(r as any)} />
          </View>

          {/* AI Coach — wide */}
          <CardWide card={FEATURE_CARDS[7]} onPress={(r) => navigation.navigate(r as any)} />

          {/* Medical Records + Discover — 2-col */}
          <View style={s.row2}>
            <CardHalf card={FEATURE_CARDS[8]} onPress={(r) => navigation.navigate(r as any)} />
            <CardHalf card={FEATURE_CARDS[9]} onPress={(r) => navigation.navigate(r as any)} />
          </View>

        </View>

        {/* Spacer so last card clears the bottom nav */}
        <View style={{ height: 110 }} />
      </ScrollView>

      {/* ── Bottom Nav ──────────────────────────────────── */}
      <View style={s.navBar}>
        {NAV.map((n) => (
          <Pressable
            key={n.route}
            onPress={() => handleNav(n.route)}
            style={s.navBtn}
          >
            <Ionicons
              name={n.icon}
              size={22}
              color={activeNav === n.route ? colors.primary : colors.text.secondary}
            />
            <Text style={[s.navLabel, activeNav === n.route && s.navLabelActive]}>
              {n.label}
            </Text>
          </Pressable>
        ))}
      </View>

    </View>
  );
}

// ─── Wide card — horizontal: icon left, text right ──
interface CardProps {
  card: typeof FEATURE_CARDS[0];
  onPress: (route: string) => void;
}

function CardWide({ card, onPress }: CardProps) {
  return (
    <Pressable
      onPress={() => onPress(card.route)}
      style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
    >
      <LinearGradient
        colors={card.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[s.wideCard, { height: card.height }]}
      >
        <View style={s.wideIconWrap}>
          <Ionicons name={card.icon as any} size={28} color="white" />
        </View>
        <View style={s.wideTextWrap}>
          <Text style={s.wideTitle}>{card.title}</Text>
          <Text style={s.wideSub}>{card.subtitle}</Text>
        </View>
        <View style={s.wideArrow}>
          <Ionicons name="arrow-forward" size={18} color="rgba(255,255,255,0.6)" />
        </View>
      </LinearGradient>
    </Pressable>
  );
}

// ─── Half card — vertical: icon top, text bottom ────
function CardHalf({ card, onPress }: CardProps) {
  return (
    <Pressable
      onPress={() => onPress(card.route)}
      style={({ pressed }) => [s.halfOuter, { opacity: pressed ? 0.85 : 1 }]}
    >
      <LinearGradient
        colors={card.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[s.halfCard, { height: card.height }]}
      >
        <View style={s.halfIconWrap}>
          <Ionicons name={card.icon as any} size={24} color="white" />
        </View>
        <View style={s.halfTextWrap}>
          <Text style={s.halfTitle}>{card.title}</Text>
          <Text style={s.halfSub} numberOfLines={2}>{card.subtitle}</Text>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

// ─── Styles ─────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface.dim },

  // Top Bar
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 16,
    paddingTop: 52,
    paddingBottom: 8,
  },
  topBarLeft: { flex: 1, marginRight: 12 },
  appTitle: { fontSize: 28, fontWeight: "700", color: colors.text.primary, lineHeight: 34 },
  subtitleRow: { flexDirection: "row", alignItems: "center", marginTop: 6 },
  avatar: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: colors.surface.containerHigh,
    justifyContent: "center", alignItems: "center",
    borderWidth: 1, borderColor: colors.glass.border,
    marginRight: 8,
  },
  greeting: { fontSize: 14, fontWeight: "600", color: colors.text.primary },
  tagline: { fontSize: 12, color: colors.text.secondary, marginTop: 4 },
  topBarRight: { flexDirection: "row", gap: 8, paddingTop: 4 },
  iconBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.surface.containerHigh,
    borderWidth: 1, borderColor: colors.glass.border,
    justifyContent: "center", alignItems: "center",
  },
  notifBadge: {
    position: "absolute", top: 8, right: 8,
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: colors.error,
    borderWidth: 1, borderColor: colors.surface.containerHigh,
  },

  // Category Pills
  pillsScroll: { flexGrow: 0, marginBottom: 4 },
  pillsContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  pill: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surface.containerHigh,
    borderWidth: 1, borderColor: colors.glass.border,
    marginRight: 8,
  },
  pillActive: { backgroundColor: "rgba(180,197,255,0.12)", borderColor: colors.primary },
  pillText: { fontSize: 12, fontWeight: "600", color: colors.text.secondary, marginLeft: 5 },
  pillTextActive: { color: colors.primary },

  // Main scroll
  scroll: { paddingHorizontal: 16, paddingTop: 4 },

  // Hero
  hero: {
    borderRadius: 28, padding: 24,
    marginTop: 8, marginBottom: 16,
    minHeight: 200,
    justifyContent: "space-between",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.1)",
  },
  heroTitle: { fontSize: 22, fontWeight: "700", color: "white", lineHeight: 30, marginBottom: 8 },
  heroSub: { fontSize: 13, color: "rgba(255,255,255,0.75)", lineHeight: 19 },
  heroCTA: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    marginTop: 20,
  },
  dotsRow: { flexDirection: "row", alignItems: "center" },
  dotActive: { width: 20, height: 4, borderRadius: 2, backgroundColor: "white", marginRight: 4 },
  dot: { width: 6, height: 4, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.4)", marginRight: 4 },
  exploreBtn: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.25)",
    paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 20,
  },
  exploreBtnText: { color: "white", fontSize: 13, fontWeight: "600", marginRight: 6 },

  // Card grid
  cardGrid: { gap: 12 },
  row2: { flexDirection: "row", gap: 12 },

  // Wide card
  wideCard: {
    borderRadius: 24, paddingHorizontal: 20, paddingVertical: 0,
    flexDirection: "row", alignItems: "center",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.15)",
    overflow: "hidden",
  },
  wideIconWrap: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center", alignItems: "center",
    marginRight: 16, flexShrink: 0,
  },
  wideTextWrap: { flex: 1 },
  wideTitle: { fontSize: 16, fontWeight: "700", color: "white", marginBottom: 4 },
  wideSub: { fontSize: 12, color: "rgba(255,255,255,0.75)", lineHeight: 17 },
  wideArrow: { paddingLeft: 8, flexShrink: 0 },

  // Half card
  halfOuter: { flex: 1 },
  halfCard: {
    borderRadius: 24, padding: 18,
    justifyContent: "space-between",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.15)",
    overflow: "hidden",
  },
  halfIconWrap: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center", alignItems: "center",
  },
  halfTextWrap: { marginTop: 12 },
  halfTitle: { fontSize: 15, fontWeight: "700", color: "white", marginBottom: 4 },
  halfSub: { fontSize: 11, color: "rgba(255,255,255,0.75)", lineHeight: 16 },

  // Bottom Nav
  navBar: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    flexDirection: "row", justifyContent: "space-around", alignItems: "center",
    height: 72, marginHorizontal: 12, marginBottom: 12,
    backgroundColor: "rgba(10,22,36,0.96)",
    borderRadius: 28,
    borderWidth: 1, borderColor: colors.glass.border,
    elevation: 16,
  },
  navBtn: {
    flex: 1, alignItems: "center", justifyContent: "center",
    paddingVertical: 8,
  },
  navLabel: { fontSize: 10, color: colors.text.secondary, marginTop: 3, fontWeight: "500" },
  navLabelActive: { color: colors.primary, fontWeight: "700" },
});
