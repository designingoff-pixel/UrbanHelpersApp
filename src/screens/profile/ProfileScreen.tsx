import React, { useEffect } from "react";
import {
  ScrollView, Text, View, Pressable, StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring,
  FadeInDown, SlideInLeft,
} from "react-native-reanimated";
import { RootStackParamList } from "@/navigation/types";
import { colors } from "@/theme/colors";

type Props = NativeStackScreenProps<RootStackParamList, "Profile">;

// ── Quick-stat cards — 2×2 ────────────────────────────────────────────────────
const STAT_CARDS = [
  { label: "Health Score",       value: "82%",  icon: "heart",         gradient: ["#4a1532", "#2a0c1c"] as string[], accent: colors.error },
  { label: "Steps This Week",    value: "4,820",icon: "walk",          gradient: ["#02332c", "#011a16"] as string[], accent: colors.secondary },
  { label: "Active Bookings",    value: "2",    icon: "home",          gradient: ["#002a5c", "#00152e"] as string[], accent: colors.primary },
  { label: "Coins",              value: "250",  icon: "star",          gradient: ["#4d2a00", "#261500"] as string[], accent: "#ffb74d" },
];

// ── Hero progress bars ────────────────────────────────────────────────────────
const HERO_STATS = [
  { label: "HEALTH",   value: "82%", icon: "heart",   iconColor: colors.error,     pct: 82 },
  { label: "FITNESS",  value: "74%", icon: "walk",    iconColor: colors.secondary, pct: 74 },
  { label: "SERVICES", value: "3 Active", icon: "home", iconColor: colors.primary, pct: 60 },
];

// ── Menu items ────────────────────────────────────────────────────────────────
const MENU_ITEMS = [
  { icon: "person-outline" as const,           label: "Personal Information", sub: "Edit your details",      color: colors.primary },
  { icon: "location-outline" as const,         label: "My Addresses",         sub: "Saved locations",        color: colors.secondary },
  { icon: "shield-checkmark-outline" as const, label: "Privacy & Security",   sub: "Manage your data",       color: colors.tertiary },
  { icon: "notifications-outline" as const,    label: "Notifications",        sub: "Alerts & reminders",     color: "#fbbc04", nav: "Notifications" as keyof RootStackParamList },
  { icon: "help-circle-outline" as const,      label: "Help & Support",       sub: "FAQs & contact us",      color: "#38bdf8" },
  { icon: "information-circle-outline" as const, label: "About",              sub: "Version 2.0.0",          color: colors.text.muted },
];

export default function ProfileScreen({ navigation }: Props) {
  // Avatar glow pulse
  const glow = useSharedValue(0.4);
  useEffect(() => {
    const animate = () => {
      glow.value = withSpring(0.7, { damping: 6, stiffness: 40 }, () => {
        glow.value = withSpring(0.4, { damping: 6, stiffness: 40 }, animate);
      });
    };
    animate();
  }, []);
  const glowStyle = useAnimatedStyle(() => ({
    shadowOpacity: glow.value,
    shadowRadius: 20,
    shadowColor: colors.tertiaryContainer,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
  }));

  return (
    <View style={s.root}>

      {/* ── Header ──────────────────────────────────────────── */}
      <Animated.View entering={FadeInDown.duration(350)} style={s.header}>
        <Pressable onPress={() => navigation.goBack()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.text.secondary} />
        </Pressable>
        <Text style={s.headerTitle}>Profile</Text>
        <Pressable style={s.settingsBtn}>
          <Ionicons name="settings-outline" size={20} color={colors.text.secondary} />
        </Pressable>
      </Animated.View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* ── Avatar + Name ───────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(80).duration(400).springify()} style={s.avatarSection}>
          <Animated.View style={[s.avatarRing, glowStyle]}>
            <LinearGradient colors={["#8343f4", "#2563eb"]} style={s.avatarCircle}>
              <Text style={s.avatarInitials}>AJ</Text>
            </LinearGradient>
          </Animated.View>
          <View style={s.avatarInfo}>
            <Text style={s.name}>Alex Johnson</Text>
            <View style={s.emailRow}>
              <Ionicons name="mail-outline" size={14} color={colors.text.secondary} />
              <Text style={s.email}>alex@email.com</Text>
            </View>
            <View style={s.locationRow}>
              <Ionicons name="location-outline" size={14} color={colors.primary} />
              <Text style={s.location}>Chennai</Text>
            </View>
          </View>
          <Pressable style={s.editBtn}>
            <Text style={s.editBtnText}>Edit</Text>
          </Pressable>
        </Animated.View>

        {/* ── Hero Summary Card ────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(140).duration(420).springify()}>
          <LinearGradient
            colors={["rgba(131,67,244,0.8)", "#4a1c82"]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={s.heroCard}
          >
            <View style={s.heroBlob} pointerEvents="none" />
            <Text style={s.heroGreeting}>Good to see you, Alex 👋</Text>
            <Text style={s.heroSub}>Your Urban Helpers journey</Text>
            <View style={s.heroStats}>
              {HERO_STATS.map((stat) => (
                <View key={stat.label} style={s.heroStatItem}>
                  <View style={[s.heroStatIcon, { backgroundColor: stat.iconColor + "22" }]}>
                    <Ionicons name={stat.icon as any} size={18} color={stat.iconColor} />
                  </View>
                  <Text style={s.heroStatLabel}>{stat.label}</Text>
                  <Text style={s.heroStatValue}>{stat.value}</Text>
                </View>
              ))}
            </View>
          </LinearGradient>
        </Animated.View>

        {/* ── 2×2 Stat Grid ───────────────────────────────── */}
        <View style={s.statGrid}>
          {STAT_CARDS.map((c, i) => (
            <Animated.View
              key={c.label}
              entering={FadeInDown.delay(200 + i * 60).duration(380).springify()}
            >
              <LinearGradient colors={c.gradient} style={s.statCard}>
                <View style={[s.statIconWrap, { backgroundColor: c.accent + "22" }]}>
                  <Ionicons name={c.icon as any} size={20} color={c.accent} />
                </View>
                <Text style={s.statValue}>{c.value}</Text>
                <Text style={[s.statLabel, { color: c.accent + "bb" }]}>{c.label}</Text>
              </LinearGradient>
            </Animated.View>
          ))}
        </View>

        {/* ── Coins Banner ─────────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(440).duration(400).springify()}>
          <LinearGradient
            colors={["#d97706", "#f59e0b"]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={s.coinsBanner}
          >
            <View style={s.coinsLeft}>
              <View style={s.coinsIconWrap}>
                <Ionicons name="star" size={28} color="white" />
              </View>
              <View>
                <Text style={s.coinsCaption}>AVAILABLE BALANCE</Text>
                <Text style={s.coinsValue}>250</Text>
              </View>
            </View>
            <View style={s.coinsRight}>
              <Text style={s.coinsDesc}>Earn coins through fitness and activities.</Text>
              <Pressable style={s.earnBtn}>
                <Text style={s.earnBtnText}>Earn More</Text>
              </Pressable>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* ── My Account Menu ──────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(500).duration(400).springify()}>
          <View style={s.menuCard}>
            <Text style={s.menuSectionTitle}>My Account</Text>
            {MENU_ITEMS.map((item, i) => (
              <Pressable
                key={item.label}
                onPress={() => item.nav && navigation.navigate(item.nav as any)}
                style={({ pressed }) => [
                  s.menuRow,
                  i < MENU_ITEMS.length - 1 && s.menuRowBorder,
                  { opacity: pressed ? 0.7 : 1 },
                ]}
              >
                <View style={[s.menuIcon, { backgroundColor: item.color + "18" }]}>
                  <Ionicons name={item.icon} size={20} color={item.color} />
                </View>
                <View style={s.menuText}>
                  <Text style={s.menuLabel}>{item.label}</Text>
                  <Text style={s.menuSub}>{item.sub}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.text.muted} />
              </Pressable>
            ))}
          </View>
        </Animated.View>

        {/* ── Support Banner ───────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(560).duration(400).springify()}>
          <LinearGradient
            colors={["#0284c7", "#1e3a8a"]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={s.supportCard}
          >
            <View style={s.supportLeft}>
              <View style={s.supportIcon}>
                <Ionicons name="headset" size={22} color="white" />
              </View>
              <View>
                <Text style={s.supportTitle}>Need Help?</Text>
                <Text style={s.supportSub}>Your Urban Helper is always here.</Text>
              </View>
            </View>
            <Pressable style={s.supportBtn}>
              <Text style={s.supportBtnText}>Get Support</Text>
            </Pressable>
          </LinearGradient>
        </Animated.View>

        {/* ── Sign Out ─────────────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(600).duration(380).springify()}>
          <Pressable
            onPress={() => navigation.navigate("Welcome")}
            style={({ pressed }) => [s.signOutBtn, { opacity: pressed ? 0.7 : 1 }]}
          >
            <Ionicons name="log-out-outline" size={20} color={colors.error} />
            <Text style={s.signOutText}>Sign Out</Text>
          </Pressable>
        </Animated.View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ── Bottom Nav (Home + Services) ──────────────────── */}
      <View style={s.bottomBar}>
        <Pressable
          onPress={() => navigation.navigate("HomeDashboard")}
          style={s.bottomBarBtn}
        >
          <Ionicons name="home-outline" size={22} color={colors.text.secondary} />
          <Text style={s.bottomBarLabel}>Home</Text>
        </Pressable>
        <Pressable
          onPress={() => navigation.navigate("ServicesDashboard")}
          style={s.bottomBarBtn}
        >
          <Ionicons name="construct-outline" size={22} color={colors.text.secondary} />
          <Text style={s.bottomBarLabel}>Services</Text>
        </Pressable>
        <Pressable
          onPress={() => navigation.navigate("HealthDashboard")}
          style={s.bottomBarBtn}
        >
          <Ionicons name="heart-outline" size={22} color={colors.text.secondary} />
          <Text style={s.bottomBarLabel}>Health</Text>
        </Pressable>
        <Pressable
          onPress={() => navigation.navigate("FitnessDashboard")}
          style={s.bottomBarBtn}
        >
          <Ionicons name="barbell-outline" size={22} color={colors.text.secondary} />
          <Text style={s.bottomBarLabel}>Fitness</Text>
        </Pressable>
        <View style={s.bottomBarBtn}>
          <Ionicons name="person" size={22} color={colors.primary} />
          <Text style={[s.bottomBarLabel, { color: colors.primary }]}>Profile</Text>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface.dim },

  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 16, paddingTop: 52, paddingBottom: 12,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.surface.containerHigh,
    borderWidth: 1, borderColor: colors.glass.border,
    justifyContent: "center", alignItems: "center",
  },
  headerTitle: { fontSize: 20, fontWeight: "700", color: colors.text.primary },
  settingsBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.surface.containerHigh,
    borderWidth: 1, borderColor: colors.glass.border,
    justifyContent: "center", alignItems: "center",
  },

  scroll: { paddingHorizontal: 16, paddingTop: 4 },

  // Avatar
  avatarSection: {
    flexDirection: "row", alignItems: "center", gap: 16, marginBottom: 20,
  },
  avatarRing: {
    borderRadius: 44, borderWidth: 2, borderColor: colors.tertiaryContainer,
  },
  avatarCircle: {
    width: 80, height: 80, borderRadius: 40,
    justifyContent: "center", alignItems: "center",
  },
  avatarInitials: { fontSize: 28, fontWeight: "700", color: "white" },
  avatarInfo: { flex: 1 },
  name: { fontSize: 20, fontWeight: "700", color: colors.text.primary },
  emailRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 4 },
  email: { fontSize: 13, color: colors.text.secondary },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 3 },
  location: { fontSize: 13, color: colors.primary },
  editBtn: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 20, borderWidth: 1, borderColor: colors.glass.border,
    backgroundColor: colors.surface.containerHigh,
  },
  editBtnText: { fontSize: 12, fontWeight: "600", color: colors.primary },

  // Hero card
  heroCard: {
    borderRadius: 28, padding: 22, marginBottom: 16,
    borderWidth: 1, borderColor: "rgba(210,187,255,0.2)",
    overflow: "hidden",
  },
  heroBlob: {
    position: "absolute", top: -40, right: -40,
    width: 160, height: 160, borderRadius: 80,
    backgroundColor: "rgba(210,187,255,0.08)",
  },
  heroGreeting: { fontSize: 20, fontWeight: "700", color: "white", marginBottom: 4 },
  heroSub: { fontSize: 13, color: "rgba(210,187,255,0.8)", marginBottom: 16 },
  heroStats: { flexDirection: "row", gap: 10 },
  heroStatItem: {
    flex: 1, alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.2)", borderRadius: 16,
    padding: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)",
  },
  heroStatIcon: {
    width: 36, height: 36, borderRadius: 18,
    justifyContent: "center", alignItems: "center",
    marginBottom: 6,
  },
  heroStatLabel: { fontSize: 9, fontWeight: "800", color: "rgba(255,255,255,0.6)", letterSpacing: 0.8 },
  heroStatValue: { fontSize: 16, fontWeight: "700", color: "white", marginTop: 2 },

  // Stat grid
  statGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 16 },
  statCard: {
    width: "47.5%",
    borderRadius: 24, padding: 18,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
    minHeight: 130,
    justifyContent: "space-between",
  },
  statIconWrap: {
    width: 40, height: 40, borderRadius: 20,
    justifyContent: "center", alignItems: "center",
  },
  statValue: { fontSize: 26, fontWeight: "700", color: "white" },
  statLabel: { fontSize: 10, fontWeight: "700", letterSpacing: 0.8, textTransform: "uppercase" },

  // Coins banner
  coinsBanner: {
    borderRadius: 24, padding: 20, marginBottom: 16,
    flexDirection: "row", alignItems: "center",
    borderWidth: 1, borderColor: "rgba(252,211,77,0.3)",
    gap: 16, overflow: "hidden",
  },
  coinsLeft: { flexDirection: "row", alignItems: "center", gap: 14 },
  coinsIconWrap: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center", alignItems: "center",
  },
  coinsCaption: { fontSize: 10, fontWeight: "700", color: "rgba(255,255,255,0.7)", letterSpacing: 1 },
  coinsValue: { fontSize: 36, fontWeight: "700", color: "white", lineHeight: 40 },
  coinsRight: { flex: 1, alignItems: "flex-end", gap: 8 },
  coinsDesc: { fontSize: 12, color: "rgba(255,255,255,0.85)", textAlign: "right", lineHeight: 17 },
  earnBtn: {
    backgroundColor: "white", borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 8,
  },
  earnBtnText: { fontSize: 13, fontWeight: "700", color: "#d97706" },

  // Menu
  menuCard: {
    backgroundColor: colors.surface.container, borderRadius: 24, marginBottom: 16,
    borderWidth: 1, borderColor: colors.glass.border, overflow: "hidden",
  },
  menuSectionTitle: {
    fontSize: 16, fontWeight: "700", color: colors.text.primary,
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: colors.glass.borderSubtle,
  },
  menuRow: {
    flexDirection: "row", alignItems: "center",
    paddingVertical: 13, paddingHorizontal: 20, gap: 14,
  },
  menuRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.glass.borderSubtle },
  menuIcon: {
    width: 38, height: 38, borderRadius: 19,
    justifyContent: "center", alignItems: "center",
  },
  menuText: { flex: 1 },
  menuLabel: { fontSize: 15, fontWeight: "600", color: colors.text.primary },
  menuSub: { fontSize: 12, color: colors.text.secondary, marginTop: 1 },

  // Support
  supportCard: {
    borderRadius: 24, padding: 18, marginBottom: 16,
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", gap: 12,
    borderWidth: 1, borderColor: "rgba(56,189,248,0.2)",
  },
  supportLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  supportIcon: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center", alignItems: "center",
  },
  supportTitle: { fontSize: 16, fontWeight: "700", color: "white" },
  supportSub: { fontSize: 12, color: "rgba(255,255,255,0.75)", marginTop: 2 },
  supportBtn: {
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 9,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.2)",
  },
  supportBtnText: { fontSize: 13, fontWeight: "700", color: "white" },

  // Sign out
  signOutBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: "rgba(255,180,171,0.08)", borderRadius: 20, padding: 16,
    borderWidth: 1, borderColor: "rgba(255,180,171,0.2)",
  },
  signOutText: { fontSize: 15, fontWeight: "600", color: colors.error },

  // Bottom nav bar
  bottomBar: {
    flexDirection: "row",
    height: 72,
    marginHorizontal: 12,
    marginBottom: 12,
    backgroundColor: "rgba(10,22,36,0.97)",
    borderRadius: 28,
    borderWidth: 1,
    borderColor: colors.glass.border,
    elevation: 16,
    alignItems: "center",
  },
  bottomBarBtn: {
    flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 8,
  },
  bottomBarLabel: {
    fontSize: 10, color: colors.text.secondary, marginTop: 3, fontWeight: "500",
  },
});
