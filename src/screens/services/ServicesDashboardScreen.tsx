import React, { useEffect } from "react";
import {
  ScrollView, Text, View, Pressable, StyleSheet,
  TextInput, Dimensions, Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withTiming,
  FadeInDown, SlideInLeft, Easing,
} from "react-native-reanimated";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import { RootStackParamList } from "@/navigation/types";
import { colors } from "@/theme/colors";
import { SERVICE_CATEGORIES } from "./servicesData";
import { getCategoryImage } from "@/assets/serviceImages";

type Props = NativeStackScreenProps<RootStackParamList, "ServicesDashboard">;

const { width: W } = Dimensions.get("window");
const CARD_W = (W - 32 - 12) / 2;

const QUICK_ACTIONS = [
  { label: "Book Again",     icon: "time-outline" as const,      color: "#3b82f6" },
  { label: "Track Booking",  icon: "location-outline" as const,  color: "#10b981" },
  { label: "Offers",         icon: "pricetag-outline" as const,  color: "#f59e0b" },
  { label: "Emergency",      icon: "alert-circle-outline" as const, color: "#ef4444" },
];

const SERVICE_NAV = [
  { icon: "home-outline" as const,      route: "HomeDashboard" as const,      label: "Home" },
  { icon: "construct-outline" as const, route: "ServicesDashboard" as const,  label: "Services" },
  { icon: "calendar-outline" as const,  route: "ServicesDashboard" as const,  label: "Bookings" },
  { icon: "pricetag-outline" as const,  route: "ServicesDashboard" as const,  label: "Offers" },
  { icon: "person-outline" as const,    route: "Profile" as const,            label: "Profile" },
];

function PressCard({ onPress, style, children }: { onPress: () => void; style?: any; children: React.ReactNode }) {
  const scale = useSharedValue(1);
  const tap = Gesture.Tap()
    .maxDeltaX(6).maxDeltaY(6)
    .onBegin(() => { scale.value = withSpring(0.95, { damping: 18, stiffness: 380 }); })
    .onEnd(() => { scale.value = withSpring(1, { damping: 14, stiffness: 260 }); })
    .onTouchesCancelled(() => { scale.value = withTiming(1, { duration: 150 }); })
    .onFinalize((_e, success) => { if (!success) scale.value = withTiming(1, { duration: 150 }); });

  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <GestureDetector gesture={tap}>
      <Animated.View style={[style, animStyle]}>
        <Pressable onPress={onPress} style={{ flex: 1 }}>
          {children}
        </Pressable>
      </Animated.View>
    </GestureDetector>
  );
}

export default function ServicesDashboardScreen({ navigation }: Props) {
  const headerOp = useSharedValue(0);
  const headerY = useSharedValue(-24);
  useEffect(() => {
    headerOp.value = withTiming(1, { duration: 450, easing: Easing.out(Easing.cubic) });
    headerY.value = withSpring(0, { damping: 18, stiffness: 200 });
  }, []);
  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOp.value,
    transform: [{ translateY: headerY.value }],
  }));

  return (
    <View style={s.root}>

      {/* ── Header ─────────────────────────────────────────── */}
      <Animated.View style={[s.header, headerStyle]}>
        <View>
          <Text style={s.greeting}>Good Morning 👋</Text>
          <Text style={s.greetingSub}>Ready to book a service?</Text>
        </View>
        <View style={s.headerRight}>
          <Pressable
            style={s.iconBtn}
            onPress={() => navigation.navigate("Notifications")}
          >
            <Ionicons name="notifications-outline" size={20} color="white" />
            <View style={s.notifDot} />
          </Pressable>
          <Pressable
            style={s.avatarCircle}
            onPress={() => navigation.navigate("Profile")}
          >
            <Ionicons name="person" size={16} color="white" />
          </Pressable>
        </View>
      </Animated.View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* ── Search bar ─────────────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(80).duration(380).springify()} style={s.searchWrap}>
          <Ionicons name="search-outline" size={18} color="rgba(255,255,255,0.45)" style={s.searchIcon} />
          <TextInput
            style={s.searchInput}
            placeholder="Search for cleaning, repair, RO…"
            placeholderTextColor="rgba(255,255,255,0.35)"
          />
        </Animated.View>

        {/* ── Hero Banner ─────────────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(130).duration(420).springify()}>
          <LinearGradient
            colors={["#2563eb", "#60a5fa"]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={s.hero}
          >
            <View style={s.heroBlob1} />
            <View style={s.heroBlob2} />
            <View style={s.heroBadge}>
              <Text style={s.heroBadgeText}>PREMIUM CARE</Text>
            </View>
            <Text style={s.heroTitle}>Everything Your Home Needs</Text>
            <Text style={s.heroSub}>Expert professionals at your doorstep in 60 minutes.</Text>
            <View style={s.heroButtons}>
              <Pressable style={s.heroBookBtn}>
                <Text style={s.heroBookText}>Book Service</Text>
              </Pressable>
              <Pressable style={s.heroExploreBtn}>
                <Text style={s.heroExploreText}>Explore</Text>
              </Pressable>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* ── Quick Actions ───────────────────────────────────── */}
        <Animated.View entering={SlideInLeft.delay(180).duration(380).springify()} style={s.quickRow}>
          {QUICK_ACTIONS.map((q, i) => (
            <Pressable key={q.label} style={s.quickCard}>
              <View style={[s.quickIcon, { backgroundColor: q.color + "22" }]}>
                <Ionicons name={q.icon} size={22} color={q.color} />
              </View>
              <Text style={s.quickLabel}>{q.label}</Text>
            </Pressable>
          ))}
        </Animated.View>

        {/* ── All Services ────────────────────────────────────── */}
        <Text style={s.sectionTitle}>Our Services</Text>
        <View style={s.categoryGrid}>
          {SERVICE_CATEGORIES.map((cat, i) => (
            <Animated.View
              key={cat.id}
              entering={FadeInDown.delay(240 + i * 55).duration(380).springify()}
              style={s.categoryOuter}
            >
              <Pressable
                onPress={() => navigation.navigate("ServiceCategory", { categoryId: cat.id })}
                style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1, flex: 1 })}
              >
                <LinearGradient
                  colors={cat.gradient}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={s.categoryCard}
                >
                  {/* Category image on the right */}
                  <Image
                    source={{ uri: getCategoryImage(cat.id) }}
                    style={s.catImage}
                    resizeMode="cover"
                  />
                  {/* Dark overlay so text stays readable */}
                  <View style={s.catImageOverlay} />

                  <View style={s.catIconWrap}>
                    <Ionicons name={cat.icon as any} size={26} color="white" />
                  </View>
                  <View style={s.catInfo}>
                    <Text style={s.catName}>{cat.name}</Text>
                    <Text style={s.catTagline} numberOfLines={1}>{cat.tagline}</Text>
                  </View>
                  <View style={s.catSubCount}>
                    <Text style={s.catSubCountText}>{cat.subServices.length}</Text>
                    <Text style={s.catSubCountLabel}>services</Text>
                  </View>
                </LinearGradient>
              </Pressable>
            </Animated.View>
          ))}
        </View>

        {/* ── Trust strip ─────────────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(800).duration(380).springify()} style={s.trustStrip}>
          {[
            { icon: "shield-checkmark-outline" as const, label: "Verified Pros" },
            { icon: "flash-outline" as const,            label: "Same-Day Fix" },
            { icon: "thumbs-up-outline" as const,        label: "100% Guarantee" },
            { icon: "ribbon-outline" as const,           label: "30-Day Warranty" },
          ].map((t) => (
            <View key={t.label} style={s.trustItem}>
              <View style={s.trustIconWrap}>
                <Ionicons name={t.icon} size={20} color={colors.secondary} />
              </View>
              <Text style={s.trustLabel}>{t.label}</Text>
            </View>
          ))}
        </Animated.View>

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* ── Bottom Nav ──────────────────────────────────────────── */}
      <View style={s.navBar}>
        {SERVICE_NAV.map((n, i) => {
          const isActive = n.route === "ServicesDashboard" && i === 1;
          return (
            <Pressable
              key={n.label}
              onPress={() => {
                if (n.route !== "ServicesDashboard" || i !== 1) {
                  navigation.navigate(n.route as any);
                }
              }}
              style={s.navBtn}
            >
              <Ionicons
                name={n.icon}
                size={22}
                color={isActive ? "#00bcd4" : colors.text.secondary}
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
  root: { flex: 1, backgroundColor: "#081826" },

  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start",
    paddingHorizontal: 16, paddingTop: 52, paddingBottom: 12,
  },
  greeting: { fontSize: 22, fontWeight: "700", color: "white" },
  greetingSub: { fontSize: 13, color: "rgba(255,255,255,0.55)", marginTop: 3 },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 10, paddingTop: 4 },
  iconBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.12)",
    justifyContent: "center", alignItems: "center",
  },
  notifDot: {
    position: "absolute", top: 9, right: 9,
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: "#ef4444",
    borderWidth: 1, borderColor: "#081826",
  },
  avatarCircle: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "rgba(37,99,235,0.4)",
    borderWidth: 2, borderColor: "#60a5fa",
    justifyContent: "center", alignItems: "center",
  },

  scroll: { paddingHorizontal: 16 },

  // Search
  searchWrap: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 14, marginBottom: 16, height: 50,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, color: "white", fontSize: 14 },

  // Hero
  hero: {
    borderRadius: 28, padding: 24, marginBottom: 20,
    minHeight: 200, overflow: "hidden",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.15)",
  },
  heroBlob1: {
    position: "absolute", top: -40, left: -40,
    width: 180, height: 180, borderRadius: 90,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  heroBlob2: {
    position: "absolute", bottom: -50, right: -30,
    width: 220, height: 220, borderRadius: 110,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  heroBadge: {
    backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 4, alignSelf: "flex-start",
    marginBottom: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.25)",
  },
  heroBadgeText: { fontSize: 10, fontWeight: "800", color: "white", letterSpacing: 1.2 },
  heroTitle: { fontSize: 24, fontWeight: "700", color: "white", lineHeight: 32, marginBottom: 8 },
  heroSub: { fontSize: 13, color: "rgba(255,255,255,0.8)", lineHeight: 19, marginBottom: 20 },
  heroButtons: { flexDirection: "row", gap: 12 },
  heroBookBtn: {
    backgroundColor: "white", borderRadius: 20,
    paddingHorizontal: 20, paddingVertical: 11,
  },
  heroBookText: { fontSize: 13, fontWeight: "700", color: "#2563eb" },
  heroExploreBtn: {
    backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 20,
    paddingHorizontal: 20, paddingVertical: 11,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.25)",
  },
  heroExploreText: { fontSize: 13, fontWeight: "600", color: "white" },

  // Quick actions
  quickRow: { flexDirection: "row", gap: 10, marginBottom: 24 },
  quickCard: {
    flex: 1, alignItems: "center", justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 20,
    paddingVertical: 16, gap: 8,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
  },
  quickIcon: {
    width: 44, height: 44, borderRadius: 22,
    justifyContent: "center", alignItems: "center",
  },
  quickLabel: { fontSize: 11, fontWeight: "600", color: "rgba(255,255,255,0.8)", textAlign: "center" },

  sectionTitle: { fontSize: 20, fontWeight: "700", color: "white", marginBottom: 14 },

  // Category grid — 2-col, wide horizontal cards
  categoryGrid: { gap: 12, marginBottom: 24 },
  categoryOuter: {},
  categoryCard: {
    borderRadius: 22, padding: 16,
    flexDirection: "row", alignItems: "center",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.12)",
    minHeight: 88, gap: 14, overflow: "hidden",
    position: "relative",
  },
  catImage: {
    position: "absolute",
    top: 0, right: 0,
    width: 110, height: "100%",
    borderTopRightRadius: 22,
    borderBottomRightRadius: 22,
  },
  catImageOverlay: {
    position: "absolute",
    top: 0, right: 0,
    width: 110, height: "100%",
    backgroundColor: "rgba(0,0,0,0.38)",
    borderTopRightRadius: 22,
    borderBottomRightRadius: 22,
  },
  catIconWrap: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center", alignItems: "center", flexShrink: 0,
  },
  catInfo: { flex: 1 },
  catName: { fontSize: 15, fontWeight: "700", color: "white" },
  catTagline: { fontSize: 12, color: "rgba(255,255,255,0.65)", marginTop: 3 },
  catSubCount: { alignItems: "center", flexShrink: 0, marginRight: 4 },
  catSubCountText: { fontSize: 22, fontWeight: "700", color: "rgba(255,255,255,0.9)" },
  catSubCountLabel: { fontSize: 10, color: "rgba(255,255,255,0.55)", marginTop: 1 },

  // Trust strip
  trustStrip: {
    flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 8,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 20, padding: 16,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
  },
  trustItem: { width: "45%", flexDirection: "row", alignItems: "center", gap: 10 },
  trustIconWrap: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "rgba(79,219,200,0.12)",
    justifyContent: "center", alignItems: "center",
  },
  trustLabel: { fontSize: 12, fontWeight: "600", color: "rgba(255,255,255,0.75)" },

  // Bottom nav
  navBar: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    flexDirection: "row", height: 72,
    marginHorizontal: 12, marginBottom: 12,
    backgroundColor: "rgba(8,24,38,0.97)",
    borderRadius: 28, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)",
    elevation: 16, alignItems: "center",
  },
  navBtn: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 8 },
  navLabel: { fontSize: 10, color: colors.text.secondary, marginTop: 3, fontWeight: "500" },
  navLabelActive: { color: "#00bcd4", fontWeight: "700" },
});
