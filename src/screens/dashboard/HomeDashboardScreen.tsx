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
  { name: "Home", icon: "home", active: true },
  { name: "Health", icon: "heart-outline", active: false },
  { name: "Fitness", icon: "barbell-outline", active: false },
  { name: "Home Care", icon: "briefcase-outline", active: false },
  { name: "Family", icon: "people-outline", active: false },
];

const FEATURE_CARDS = [
  { id: "energy",     title: "Energy Score",    subtitle: "Understand how your day is shaping up.", gradient: ["#1e3a8a", "#38bdf8"] as (string[]), icon: "flash",        route: "FitnessDashboard",       wide: true,  height: 100 },
  { id: "heart",      title: "Heart Health",     subtitle: "View your heart insights.",              gradient: ["#be185d", "#7e22ce"] as (string[]), icon: "heart",        route: "HealthDashboard",        wide: false, height: 160 },
  { id: "sleep",      title: "Sleep",            subtitle: "Track your sleep quality.",              gradient: ["#4338ca", "#8b5cf6"] as (string[]), icon: "moon",         route: "SleepDashboard",         wide: false, height: 160 },
  { id: "nutrition",  title: "Nutrition",        subtitle: "Build healthier eating habits.",         gradient: ["#ea580c", "#d97706"] as (string[]), icon: "nutrition",    route: "NutritionDashboard",     wide: true,  height: 100 },
  { id: "family",     title: "Family Care",      subtitle: "Stay connected with loved ones.",        gradient: ["#d97706", "#f59e0b"] as (string[]), icon: "people",       route: "FamilyDashboard",        wide: true,  height: 140 },
  { id: "medication", title: "Medication",       subtitle: "Manage your meds.",                      gradient: ["#059669", "#10b981"] as (string[]), icon: "medical",      route: "MedicationCenter",       wide: false, height: 120 },
  { id: "emergency",  title: "Emergency SOS",   subtitle: "1-Tap Alert",                            gradient: ["#b91c1c", "#ef4444"] as (string[]), icon: "alert-circle", route: "EmergencyAssistance",    wide: false, height: 120 },
  { id: "aicoach",    title: "AI Coach",         subtitle: "Personalized health tips.",              gradient: ["#2563eb", "#8343f4"] as (string[]), icon: "sparkles",     route: "AICoach",                wide: true,  height: 100 },
  { id: "medical",    title: "Medical Records",  subtitle: "Your health vault.",                     gradient: ["#1e3a8a", "#4c1d95"] as (string[]), icon: "document-text", route: "MedicalRecords",        wide: false, height: 120 },
  { id: "discover",   title: "Discover",         subtitle: "Explore wellness content.",              gradient: ["#0d9488", "#14b8a6"] as (string[]), icon: "compass",      route: "Discover",               wide: false, height: 120 },
];

const NAV = [
  { icon: "home",            route: "HomeDashboard",   label: "Home",    active: true },
  { icon: "heart-outline",   route: "HealthDashboard", label: "Health" },
  { icon: "compass-outline", route: "Discover",        label: "Discover" },
  { icon: "barbell-outline", route: "FitnessDashboard",label: "Fitness" },
  { icon: "person-outline",  route: "Profile",         label: "Profile" },
];

export default function HomeDashboardScreen({ navigation }: Props) {
  const [activeNav, setActiveNav] = useState("HomeDashboard");

  const handleNav = (route: string) => {
    setActiveNav(route);
    navigation.navigate(route as any);
  };

  // Separate wide cards from narrow cards for layout
  const wideCards  = FEATURE_CARDS.filter((c) => c.wide);
  const narrowCards = FEATURE_CARDS.filter((c) => !c.wide);

  return (
    <View style={s.root}>
      {/* ── Top App Bar ─────────────────────────────────── */}
      <View style={s.topBar}>
        <View style={s.topBarLeft}>
          <Text style={s.appTitle}>Urban Helpers</Text>
          <View style={s.subtitleRow}>
            <View style={s.avatar}><Ionicons name="person" size={12} color={colors.text.secondary} /></View>
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
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.pillsScroll} contentContainerStyle={s.pillsContent}>
        {PILLS.map((p) => (
          <Pressable key={p.name} style={[s.pill, p.active && s.pillActive]}>
            <Ionicons name={p.icon as any} size={14} color={p.active ? colors.primary : colors.text.secondary} />
            <Text style={[s.pillText, { color: p.active ? colors.primary : colors.text.secondary }]}>{p.name}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* ── Main Scrollable Content ─────────────────────── */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* Hero Card */}
        <LinearGradient
          colors={[colors.gradients.hero[0], colors.gradients.hero[1], colors.gradients.hero[2]]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={s.hero}
        >
          <Text style={s.heroTitle}>Take care of your family's wellbeing</Text>
          <Text style={s.heroSub}>Manage health, appointments, reminders, and home services in one place.</Text>
          <View style={s.heroCTA}>
            <View style={s.dotsRow}>
              <View style={s.dotActive} /><View style={s.dot} /><View style={s.dot} />
            </View>
            <Pressable onPress={() => navigation.navigate("Discover")} style={s.exploreBtn}>
              <Text style={s.exploreBtnText}>Explore</Text>
              <Ionicons name="arrow-forward" size={13} color="white" />
            </Pressable>
          </View>
        </LinearGradient>

        {/* ── Feature Cards Grid ────────────────────── */}
        {/* Wide (full-width) cards + 2-column narrow pairs */}
        <View style={s.cardGrid}>

          {/* Row: Energy Score (wide) */}
          <FeatureBtn card={FEATURE_CARDS[0]} onPress={(r) => navigation.navigate(r as any)} />

          {/* Row: Heart + Sleep (2-col) */}
          <View style={s.row2}>
            <FeatureBtn card={FEATURE_CARDS[1]} onPress={(r) => navigation.navigate(r as any)} half />
            <FeatureBtn card={FEATURE_CARDS[2]} onPress={(r) => navigation.navigate(r as any)} half />
          </View>

          {/* Row: Nutrition (wide) */}
          <FeatureBtn card={FEATURE_CARDS[3]} onPress={(r) => navigation.navigate(r as any)} />

          {/* Row: Family (wide) */}
          <FeatureBtn card={FEATURE_CARDS[4]} onPress={(r) => navigation.navigate(r as any)} />

          {/* Row: Medication + Emergency (2-col) */}
          <View style={s.row2}>
            <FeatureBtn card={FEATURE_CARDS[5]} onPress={(r) => navigation.navigate(r as any)} half />
            <FeatureBtn card={FEATURE_CARDS[6]} onPress={(r) => navigation.navigate(r as any)} half />
          </View>

          {/* Row: AI Coach (wide) */}
          <FeatureBtn card={FEATURE_CARDS[7]} onPress={(r) => navigation.navigate(r as any)} />

          {/* Row: Medical Records + Discover (2-col) */}
          <View style={s.row2}>
            <FeatureBtn card={FEATURE_CARDS[8]} onPress={(r) => navigation.navigate(r as any)} half />
            <FeatureBtn card={FEATURE_CARDS[9]} onPress={(r) => navigation.navigate(r as any)} half />
          </View>

        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ── FAB ─────────────────────────────────────────── */}
      <Pressable
        onPress={() => navigation.navigate("AICoach")}
        style={s.fab}
      >
        <Ionicons name="add" size={28} color="white" />
      </Pressable>

      {/* ── Bottom Nav ──────────────────────────────────── */}
      <View style={s.navBar}>
        {NAV.map((n) => (
          <Pressable key={n.route} onPress={() => handleNav(n.route)} style={s.navBtn}>
            <Ionicons name={n.icon as any} size={22} color={activeNav === n.route ? colors.primary : colors.text.secondary} />
            <Text style={[s.navLabel, activeNav === n.route && s.navLabelActive]}>{n.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

// ─── Reusable Feature Card Button ──────────────────
interface FeatureBtnProps {
  card: typeof FEATURE_CARDS[0];
  onPress: (route: string) => void;
  half?: boolean;
}
function FeatureBtn({ card, onPress, half }: FeatureBtnProps) {
  return (
    <Pressable
      onPress={() => onPress(card.route)}
      style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1, flex: half ? 1 : undefined }]}
    >
      <LinearGradient
        colors={card.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[s.featureCard, { height: card.height }]}
      >
        <View style={s.featureIconWrap}>
          <Ionicons name={card.icon as any} size={24} color="white" />
        </View>
        <View style={s.featureTextWrap}>
          <Text style={s.featureTitle}>{card.title}</Text>
          <Text style={s.featureSub}>{card.subtitle}</Text>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

// ─── Styles ─────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface.dim },

  // Top Bar
  topBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", paddingHorizontal: 16, paddingTop: 52, paddingBottom: 8 },
  topBarLeft: { flex: 1 },
  appTitle: { fontSize: 28, fontWeight: "700", color: colors.text.primary, lineHeight: 32 },
  subtitleRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 6 },
  avatar: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.surface.containerHigh, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: colors.glass.border },
  greeting: { fontSize: 14, fontWeight: "600", color: colors.text.primary },
  tagline: { fontSize: 12, color: colors.text.secondary, marginTop: 4 },
  topBarRight: { flexDirection: "row", gap: 8 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface.containerHigh, borderWidth: 1, borderColor: colors.glass.border, justifyContent: "center", alignItems: "center" },
  notifBadge: { position: "absolute", top: 8, right: 8, width: 10, height: 10, borderRadius: 5, backgroundColor: colors.error, borderWidth: 2, borderColor: colors.surface.containerHigh },

  // Pills
  pillsScroll: { maxHeight: 52 },
  pillsContent: { paddingHorizontal: 16, paddingVertical: 8, gap: 8 },
  pill: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.surface.containerHigh, borderWidth: 1, borderColor: colors.glass.border, gap: 6 },
  pillActive: { backgroundColor: "rgba(180,197,255,0.15)", borderColor: colors.primary },
  pillText: { fontSize: 12, fontWeight: "600" },

  // Scroll
  scroll: { paddingHorizontal: 16 },

  // Hero
  hero: { borderRadius: 36, padding: 24, marginTop: 12, marginBottom: 20, minHeight: 220, justifyContent: "space-between", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", elevation: 8 },
  heroTitle: { fontSize: 24, fontWeight: "700", color: "white", lineHeight: 32, marginBottom: 8 },
  heroSub: { fontSize: 12, color: "rgba(255,255,255,0.8)", lineHeight: 18 },
  heroCTA: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 20 },
  dotsRow: { flexDirection: "row", gap: 6 },
  dotActive: { width: 24, height: 4, borderRadius: 2, backgroundColor: "white" },
  dot: { width: 6, height: 4, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.4)" },
  exploreBtn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(255,255,255,0.15)", borderWidth: 1, borderColor: "rgba(255,255,255,0.2)", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  exploreBtnText: { color: "white", fontSize: 12, fontWeight: "600" },

  // Cards
  cardGrid: { gap: 12 },
  row2: { flexDirection: "row", gap: 12 },
  featureCard: { borderRadius: 30, padding: 20, justifyContent: "space-between", overflow: "hidden", borderWidth: 1, borderColor: "rgba(255,255,255,0.15)" },
  featureIconWrap: { width: 48, height: 48, borderRadius: 24, backgroundColor: "rgba(255,255,255,0.2)", justifyContent: "center", alignItems: "center" },
  featureTextWrap: { marginTop: "auto" as any },
  featureTitle: { fontSize: 16, fontWeight: "700", color: "white", marginBottom: 4 },
  featureSub: { fontSize: 12, color: "rgba(255,255,255,0.8)", lineHeight: 16 },

  // FAB
  fab: { position: "absolute", bottom: 112, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: colors.tertiaryContainer, justifyContent: "center", alignItems: "center", elevation: 10, shadowColor: colors.tertiary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 20 },

  // Bottom Nav
  navBar: { position: "absolute", bottom: 0, left: 0, right: 0, flexDirection: "row", justifyContent: "space-around", alignItems: "center", height: 80, marginHorizontal: 16, marginBottom: 16, backgroundColor: "rgba(17,33,48,0.9)", borderRadius: 32, borderWidth: 1, borderColor: colors.glass.border, elevation: 12 },
  navBtn: { width: 48, height: 48, borderRadius: 24, justifyContent: "center", alignItems: "center" },
  navBtnActive: { backgroundColor: colors.primary },
  navLabel: { fontSize: 10, color: colors.text.secondary, marginTop: 2, fontWeight: "500" },
  navLabelActive: { color: colors.primary, fontWeight: "700" },
});
