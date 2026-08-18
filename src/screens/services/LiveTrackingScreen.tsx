import React, { useEffect } from "react";
import { ScrollView, Text, View, Pressable, StyleSheet, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import Animated, {
  useSharedValue, useAnimatedStyle,
  withRepeat, withSequence, withTiming,
  FadeInDown,
} from "react-native-reanimated";
import { RootStackParamList } from "@/navigation/types";
import { colors } from "@/theme/colors";

type Props = NativeStackScreenProps<RootStackParamList, "LiveTracking">;
const { width: W } = Dimensions.get("window");

const STEPS = [
  { label: "Booking Confirmed", time: "09:00 AM", done: true },
  { label: "Professional Assigned", time: "09:15 AM", done: true },
  { label: "On The Way", time: "ETA 15 Mins", done: false, active: true },
  { label: "Arriving", time: "", done: false },
  { label: "Service Started", time: "", done: false },
];

export default function LiveTrackingScreen({ navigation }: Props) {
  // Pulsing ETA dot
  const pulse = useSharedValue(1);
  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.3, { duration: 800 }),
        withTiming(1, { duration: 800 })
      ), -1, false
    );
  }, []);
  const pulseStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));

  // Ping ring on active step
  const ring = useSharedValue(0.8);
  useEffect(() => {
    ring.value = withRepeat(
      withSequence(withTiming(1.4, { duration: 900 }), withTiming(0.8, { duration: 900 })),
      -1, false
    );
  }, []);
  const ringStyle = useAnimatedStyle(() => ({ transform: [{ scale: ring.value }], opacity: 2 - ring.value }));

  return (
    <View style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} style={s.iconBtn}>
          <Ionicons name="arrow-back" size={22} color="white" />
        </Pressable>
        <Text style={s.headerTitle}>Live Tracking</Text>
        <View style={s.headerRight}>
          <Pressable style={s.iconBtn} onPress={() => navigation.navigate("Notifications")}>
            <Ionicons name="notifications-outline" size={20} color="white" />
          </Pressable>
          <Pressable style={s.iconBtn}>
            <Ionicons name="help-circle-outline" size={20} color="white" />
          </Pressable>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* ── ETA Hero ─────────────────────────────────────── */}
        <Animated.View entering={FadeInDown.duration(380)}>
          <LinearGradient colors={["#15803d", "#22c55e"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.hero}>
            <View style={s.heroBlobTL} />
            <View style={s.heroBlobBR} />
            <View style={s.heroLeft}>
              <View style={s.liveBadge}>
                <Animated.View style={[s.liveDot, pulseStyle]} />
                <Text style={s.liveBadgeText}>LIVE UPDATE</Text>
              </View>
              <Text style={s.heroTitle}>Professional{"\n"}On The Way</Text>
              <View style={s.etaRow}>
                <Text style={s.etaNumber}>15</Text>
                <Text style={s.etaUnit}>Minutes ETA</Text>
              </View>
              <Text style={s.bookingId}>ID: UH-2026-45893</Text>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* ── Map Placeholder ──────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(80).duration(380)} style={s.mapCard}>
          <LinearGradient colors={["#0f2a3a", "#1a3550"]} style={s.mapGrad}>
            {/* Fake route line */}
            <View style={s.routeLine} />
            {/* Destination pin */}
            <View style={[s.mapPin, { top: "45%", right: "22%" }]}>
              <View style={s.mapPinHome}>
                <Ionicons name="home" size={16} color="white" />
              </View>
            </View>
            {/* Pro marker with pulse ring */}
            <View style={[s.mapMarkerWrap, { top: "60%", left: "32%" }]}>
              <Animated.View style={[s.mapPingRing, ringStyle]} />
              <View style={s.etaBubble}>
                <Text style={s.etaBubbleText}>15 Min</Text>
              </View>
              <View style={s.mapPinPro}>
                <Ionicons name="car" size={16} color="white" />
              </View>
            </View>
            <Text style={s.mapLabel}>Sunny Enclave, Chennai</Text>
          </LinearGradient>
        </Animated.View>

        {/* ── Professional Card ────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(140).duration(380)}>
          <LinearGradient colors={["#1e3a8a", "#0f172a"]} style={s.proCard}>
            <View style={s.proLeft}>
              <View style={s.proAvatarWrap}>
                <LinearGradient colors={["#2563eb", "#8343f4"]} style={s.proAvatar}>
                  <Text style={s.proAvatarText}>RK</Text>
                </LinearGradient>
                <View style={s.proVerified}>
                  <Ionicons name="checkmark-circle" size={16} color="#22c55e" />
                </View>
              </View>
              <View>
                <Text style={s.proName}>Rajesh K.</Text>
                <View style={s.proMeta}>
                  <Ionicons name="star" size={14} color="#fbbf24" />
                  <Text style={s.proRating}>4.9</Text>
                  <Text style={s.proExp}> · 8 yrs exp</Text>
                </View>
              </View>
            </View>
            <View style={s.proActions}>
              {[
                { icon: "call" as const },
                { icon: "chatbubble-outline" as const },
                { icon: "share-outline" as const },
              ].map((a) => (
                <Pressable key={a.icon} style={s.proActionBtn}>
                  <Ionicons name={a.icon} size={20} color="white" />
                </Pressable>
              ))}
            </View>
          </LinearGradient>
        </Animated.View>

        {/* ── Status Timeline ──────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(200).duration(380)} style={s.timelineCard}>
          <Text style={s.timelineTitle}>Status</Text>
          {STEPS.map((step, i) => (
            <View key={step.label} style={s.stepRow}>
              {/* Connector line */}
              {i < STEPS.length - 1 && (
                <View style={[s.stepLine, step.done && s.stepLineDone]} />
              )}
              {/* Dot */}
              {step.active ? (
                <View style={s.stepDotActiveWrap}>
                  <Animated.View style={[s.stepDotRing, ringStyle]} />
                  <View style={s.stepDotActive} />
                </View>
              ) : (
                <View style={[s.stepDot, step.done && s.stepDotDone]}>
                  {step.done && <Ionicons name="checkmark" size={12} color="white" />}
                </View>
              )}
              {/* Text */}
              <View style={s.stepText}>
                <Text style={[s.stepLabel, step.active && s.stepLabelActive, !step.done && !step.active && s.stepLabelPending]}>
                  {step.label}
                </Text>
                {step.time ? (
                  <Text style={[s.stepTime, step.active && s.stepTimeActive]}>{step.time}</Text>
                ) : null}
              </View>
            </View>
          ))}
        </Animated.View>

        {/* ── Booking + Payment Info ───────────────────────── */}
        <Animated.View entering={FadeInDown.delay(260).duration(380)} style={s.infoRow}>
          <LinearGradient colors={["#4338ca", "#312e81"]} style={s.infoCard}>
            <View style={s.infoIconRow}>
              <Ionicons name="sparkles" size={18} color="white" />
              <Text style={s.infoCardTitle}>Booking Info</Text>
            </View>
            <Text style={s.infoValue}>Premium Home Cleaning</Text>
            <Text style={s.infoSub}>Today, 10:00 AM</Text>
            <Text style={[s.infoSub, { marginTop: 8 }]}>Villa 12, Sunny Enclave</Text>
          </LinearGradient>
          <LinearGradient colors={["#047857", "#064e3b"]} style={s.infoCard}>
            <View style={s.infoIconRow}>
              <Ionicons name="card" size={18} color="white" />
              <Text style={s.infoCardTitle}>Payment</Text>
            </View>
            <Text style={s.infoSub}>Total Paid</Text>
            <Text style={s.infoPrice}>₹1,499</Text>
            <Pressable style={s.invoiceBtn}>
              <Text style={s.invoiceBtnText}>View Invoice</Text>
            </Pressable>
          </LinearGradient>
        </Animated.View>

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* ── Bottom CTA ───────────────────────────────────────── */}
      <View style={s.cta}>
        <Pressable style={s.ctaBtn} onPress={() => navigation.navigate("ServiceInProgress", {})}>
          <Ionicons name="call" size={20} color="white" />
          <Text style={s.ctaBtnText}>Contact Professional</Text>
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#081826" },
  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 16, paddingTop: 52, paddingBottom: 12,
  },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "white" },
  headerRight: { flexDirection: "row", gap: 8 },
  iconBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.12)",
    justifyContent: "center", alignItems: "center",
  },
  scroll: { paddingHorizontal: 16 },

  // Hero
  hero: { borderRadius: 28, padding: 24, marginBottom: 14, minHeight: 180, overflow: "hidden" },
  heroBlobTL: { position: "absolute", top: -40, left: -40, width: 160, height: 160, borderRadius: 80, backgroundColor: "rgba(255,255,255,0.08)" },
  heroBlobBR: { position: "absolute", bottom: -50, right: -30, width: 200, height: 200, borderRadius: 100, backgroundColor: "rgba(0,0,0,0.1)" },
  heroLeft: { zIndex: 1 },
  liveBadge: {
    flexDirection: "row", alignItems: "center", gap: 7,
    backgroundColor: "rgba(0,0,0,0.25)", borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 6, alignSelf: "flex-start",
    marginBottom: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.2)",
  },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "white" },
  liveBadgeText: { fontSize: 11, fontWeight: "800", color: "white", letterSpacing: 1 },
  heroTitle: { fontSize: 28, fontWeight: "700", color: "white", lineHeight: 36, marginBottom: 12 },
  etaRow: { flexDirection: "row", alignItems: "baseline", gap: 8, marginBottom: 8 },
  etaNumber: { fontSize: 52, fontWeight: "700", color: "white", lineHeight: 56 },
  etaUnit: { fontSize: 18, color: "rgba(255,255,255,0.85)" },
  bookingId: { fontSize: 12, color: "rgba(255,255,255,0.6)" },

  // Map
  mapCard: { borderRadius: 24, overflow: "hidden", marginBottom: 14, height: 220 },
  mapGrad: { flex: 1, position: "relative", justifyContent: "flex-end" },
  routeLine: {
    position: "absolute", top: "40%", left: "28%", right: "28%",
    height: 3, backgroundColor: "#22c55e", borderRadius: 2,
    transform: [{ rotate: "-20deg" }],
  },
  mapPin: { position: "absolute" },
  mapPinHome: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "#2563eb", justifyContent: "center", alignItems: "center",
    borderWidth: 2, borderColor: "white",
  },
  mapMarkerWrap: { position: "absolute", alignItems: "center" },
  mapPingRing: {
    position: "absolute",
    width: 48, height: 48, borderRadius: 24,
    borderWidth: 2, borderColor: "#22c55e",
  },
  etaBubble: {
    backgroundColor: "white", borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4,
    marginBottom: 4,
  },
  etaBubbleText: { fontSize: 11, fontWeight: "700", color: "#15803d" },
  mapPinPro: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "#22c55e", justifyContent: "center", alignItems: "center",
    borderWidth: 2, borderColor: "white",
  },
  mapLabel: { padding: 12, fontSize: 12, color: "rgba(255,255,255,0.6)" },

  // Pro card
  proCard: {
    borderRadius: 24, padding: 18, marginBottom: 14,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
  },
  proLeft: { flexDirection: "row", alignItems: "center", gap: 14 },
  proAvatarWrap: { position: "relative" },
  proAvatar: { width: 56, height: 56, borderRadius: 28, justifyContent: "center", alignItems: "center" },
  proAvatarText: { fontSize: 20, fontWeight: "700", color: "white" },
  proVerified: { position: "absolute", bottom: 0, right: -2 },
  proName: { fontSize: 16, fontWeight: "700", color: "white" },
  proMeta: { flexDirection: "row", alignItems: "center", marginTop: 3 },
  proRating: { fontSize: 13, color: "#fbbf24", fontWeight: "600", marginLeft: 3 },
  proExp: { fontSize: 13, color: "rgba(255,255,255,0.55)" },
  proActions: { flexDirection: "row", gap: 10 },
  proActionBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center", alignItems: "center",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.15)",
  },

  // Timeline
  timelineCard: {
    backgroundColor: colors.surface.container, borderRadius: 24, padding: 20,
    marginBottom: 14, borderWidth: 1, borderColor: colors.glass.border,
  },
  timelineTitle: { fontSize: 16, fontWeight: "700", color: "white", marginBottom: 20 },
  stepRow: { flexDirection: "row", alignItems: "flex-start", gap: 14, paddingLeft: 8, minHeight: 52 },
  stepLine: {
    position: "absolute", left: 19, top: 26, width: 2, height: 34,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  stepLineDone: { backgroundColor: "#22c55e" },
  stepDot: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: colors.surface.containerHighest,
    borderWidth: 2, borderColor: "rgba(255,255,255,0.2)",
    justifyContent: "center", alignItems: "center", flexShrink: 0,
  },
  stepDotDone: { backgroundColor: "#22c55e", borderColor: "#22c55e" },
  stepDotActiveWrap: { width: 24, height: 24, justifyContent: "center", alignItems: "center", flexShrink: 0 },
  stepDotRing: {
    position: "absolute", width: 24, height: 24, borderRadius: 12,
    borderWidth: 2, borderColor: "#3b82f6",
  },
  stepDotActive: { width: 14, height: 14, borderRadius: 7, backgroundColor: "#3b82f6" },
  stepText: { flex: 1, paddingTop: 2 },
  stepLabel: { fontSize: 14, fontWeight: "600", color: colors.text.secondary },
  stepLabelActive: { color: "#3b82f6", fontWeight: "700" },
  stepLabelPending: { opacity: 0.4 },
  stepTime: { fontSize: 12, color: colors.text.muted, marginTop: 2 },
  stepTimeActive: { color: "#3b82f6" },

  // Info row
  infoRow: { flexDirection: "row", gap: 12, marginBottom: 8 },
  infoCard: {
    flex: 1, borderRadius: 24, padding: 18,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
  },
  infoIconRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 14 },
  infoCardTitle: { fontSize: 14, fontWeight: "700", color: "white" },
  infoValue: { fontSize: 14, fontWeight: "700", color: "white", marginBottom: 4 },
  infoSub: { fontSize: 12, color: "rgba(255,255,255,0.6)" },
  infoPrice: { fontSize: 28, fontWeight: "700", color: "white", marginTop: 4, marginBottom: 12 },
  invoiceBtn: {
    backgroundColor: "rgba(255,255,255,0.12)", borderRadius: 14, padding: 10,
    alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.2)",
  },
  invoiceBtnText: { fontSize: 12, fontWeight: "700", color: "white" },

  // CTA
  cta: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    paddingHorizontal: 16, paddingBottom: 28, paddingTop: 12,
    backgroundColor: "rgba(8,24,38,0.95)",
    borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.08)",
  },
  ctaBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
    backgroundColor: "#2563eb", borderRadius: 22, paddingVertical: 16,
  },
  ctaBtnText: { fontSize: 15, fontWeight: "700", color: "white" },
});
