import React, { useEffect, useState } from "react";
import { ScrollView, Text, View, Pressable, StyleSheet, Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import Animated, {
  useSharedValue, useAnimatedStyle,
  withTiming, withRepeat, withSequence,
  FadeInDown, Easing,
} from "react-native-reanimated";
import { RootStackParamList } from "@/navigation/types";
import { colors } from "@/theme/colors";
import { db } from "@/services/firebase";
import { doc, onSnapshot } from "firebase/firestore";

type Props = NativeStackScreenProps<RootStackParamList, "ServiceInProgress">;

// ── Service-aware checklist (mirrors vendor app logic) ───────────────────────
function getDynamicChecklist(serviceName: string): { label: string; icon: string }[] {
  const text = serviceName.toLowerCase();

  if (text.includes("clean") || text.includes("maid") || text.includes("housekeep")) {
    return [
      { label: "Inspect rooms, surfaces & high-touch areas", icon: "search-outline" },
      { label: "Dusting, vacuuming & deep scrubbing of floors", icon: "brush-outline" },
      { label: "Kitchen counter, sink & appliance degreasing", icon: "flame-outline" },
      { label: "Bathroom sanitation & tile descaling", icon: "water-outline" },
      { label: "Before & After service proof photos", icon: "camera-outline" },
      { label: "Final walkthrough & customer satisfaction review", icon: "checkmark-done-outline" },
    ];
  }
  if (text.includes("ac") || text.includes("air conditioner") || text.includes("cool")) {
    return [
      { label: "Inspect indoor/outdoor units & power diagnostics", icon: "hardware-chip-outline" },
      { label: "Deep jet cleaning of filters & condenser coils", icon: "construct-outline" },
      { label: "Check refrigerant gas pressure & leak detection", icon: "thermometer-outline" },
      { label: "Measure air output temperature & voltage test", icon: "flash-outline" },
      { label: "Before & After service proof photos", icon: "camera-outline" },
      { label: "Complete test run & handover to customer", icon: "checkmark-done-outline" },
    ];
  }
  if (text.includes("ro") || text.includes("water") || text.includes("purif")) {
    return [
      { label: "Test raw inlet TDS and check water pressure", icon: "analytics-outline" },
      { label: "Inspect pre-filter, sediment & carbon cartridges", icon: "filter-outline" },
      { label: "Check RO membrane rejection rate & pump PSI", icon: "water-outline" },
      { label: "Sanitize storage tank & test output purity", icon: "shield-checkmark-outline" },
      { label: "Before & After service proof photos", icon: "camera-outline" },
      { label: "Handover verified pure water sample", icon: "checkmark-done-outline" },
    ];
  }
  if (text.includes("pest") || text.includes("cockroach") || text.includes("termite")) {
    return [
      { label: "Identify infestation hotspots & entry gaps", icon: "search-outline" },
      { label: "Chemical dilution & safety preparation", icon: "flask-outline" },
      { label: "Gel baiting & crack-and-crevice perimeter spray", icon: "information-circle-outline" },
      { label: "Safety briefing on ventilation to customer", icon: "megaphone-outline" },
      { label: "Before & After treatment photos", icon: "camera-outline" },
    ];
  }
  if (text.includes("plumb") || text.includes("pipe") || text.includes("drain") || text.includes("tap")) {
    return [
      { label: "Inspect pipeline joints, valves & pressure test", icon: "analytics-outline" },
      { label: "Isolate main water line & disassemble fittings", icon: "construct-outline" },
      { label: "Replace worn washers, seals, cartridges or pipes", icon: "build-outline" },
      { label: "Re-pressurize system & verify zero leaks", icon: "checkmark-circle-outline" },
      { label: "Before & After repair photos", icon: "camera-outline" },
    ];
  }
  return [
    { label: "Initial pre-service inspection & safety audit", icon: "search-outline" },
    { label: "Execute core service procedures with calibrated tools", icon: "construct-outline" },
    { label: "Inspect and verify operational quality", icon: "eye-outline" },
    { label: "Before & After work verification photos", icon: "camera-outline" },
    { label: "Customer demonstration & clean site handover", icon: "checkmark-done-outline" },
  ];
}

export default function ServiceInProgressScreen({ route, navigation }: Props) {
  // Accept serviceName and bookingId from navigation params
  const serviceName: string = (route?.params as any)?.serviceName ?? "Home Cleaning";
  const bookingId: string | undefined = (route?.params as any)?.bookingId;
  const checklist = getDynamicChecklist(serviceName);

  // Live vendor checklist progress from Firestore
  const [vendorDoneCount, setVendorDoneCount] = useState(0);
  const [liveChecklistDone, setLiveChecklistDone] = useState<string[]>([]);

  useEffect(() => {
    if (!bookingId) {
      // Fallback demo animation if no bookingId
      const timer = setTimeout(() => setVendorDoneCount(2), 1200);
      return () => clearTimeout(timer);
    }

    // Real-time subscription to booking document
    const unsub = onSnapshot(doc(db, "bookings", bookingId), (snap) => {
      if (!snap.exists()) return;
      const data = snap.data();
      const done: string[] = data?.checklistDone || [];
      setLiveChecklistDone(done);
      setVendorDoneCount(done.length);
    });

    return () => unsub();
  }, [bookingId]);

  const totalCount = checklist.length;
  const progressPct = totalCount > 0 ? Math.round((vendorDoneCount / totalCount) * 100) : 0;

  // Pulsing active task dot
  const pulse = useSharedValue(1);
  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(withTiming(1.4, { duration: 700 }), withTiming(1, { duration: 700 })),
      -1, false
    );
  }, []);
  const pulseStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));

  return (
    <View style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} style={s.iconBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.text.secondary} />
        </Pressable>
        <Text style={s.headerTitle}>Service In Progress</Text>
        <Pressable style={s.iconBtn}>
          <Ionicons name="help-circle-outline" size={20} color={colors.text.secondary} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* ── Hero with progress ──────────────────────────── */}
        <Animated.View entering={FadeInDown.duration(380)}>
          <LinearGradient colors={["#14b8a6", "#06b6d4", "#0ea5e9"]} style={s.hero}>
            <View style={s.heroTop}>
              <View style={{ flex: 1, marginRight: 12 }}>
                <Text style={s.heroTitle}>{serviceName}</Text>
                <Text style={s.heroSub}>Service is underway — quality in progress</Text>
              </View>
              <View style={s.etaBadge}>
                <Ionicons name="time-outline" size={14} color="white" />
                <Text style={s.etaText}>{vendorDoneCount}/{totalCount} Done</Text>
              </View>
            </View>

            {/* Progress Ring */}
            <View style={s.ringWrap}>
              <View style={s.ringOuter}>
                <View style={s.ringInner}>
                  <LinearGradient colors={["#0ea5e9", "#14b8a6"]} style={s.ringCenter}>
                    <Text style={s.ringPct}>{progressPct}%</Text>
                    <Text style={s.ringLabel}>Completed</Text>
                  </LinearGradient>
                </View>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* ── Service Quality Checklist (Customer View) ──── */}
        <Animated.View entering={FadeInDown.delay(100).duration(380)} style={s.checkCard}>
          <View style={s.sectionHeaderRow}>
            <Ionicons name="checkbox-outline" size={18} color="#14b8a6" />
            <Text style={s.sectionTitle}>
              Service Quality Checklist ({vendorDoneCount}/{totalCount})
            </Text>
          </View>
          <Text style={s.sectionSubtitle}>
            Our technician verifies each step — your quality guarantee
          </Text>

          <View style={s.checklistWrap}>
            {checklist.map((item, i) => {
              const isDone = i < vendorDoneCount;
              const isActive = i === vendorDoneCount;
              const isPending = i > vendorDoneCount;
              return (
                <Animated.View
                  key={i}
                  entering={FadeInDown.delay(120 + i * 60).duration(350)}
                  style={[
                    s.checkItem,
                    isDone && s.checkItemDone,
                    isActive && s.checkItemActive,
                    isPending && s.checkItemPending,
                  ]}
                >
                  {/* Status icon */}
                  <View style={[
                    s.checkIcon,
                    isDone && s.checkIconDone,
                    isActive && s.checkIconActive,
                  ]}>
                    {isDone ? (
                      <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                    ) : isActive ? (
                      <Animated.View style={pulseStyle}>
                        <Ionicons name="ellipsis-horizontal" size={14} color="#0ea5e9" />
                      </Animated.View>
                    ) : (
                      <Ionicons name="ellipse-outline" size={14} color={colors.text.muted} />
                    )}
                  </View>

                  {/* Label */}
                  <View style={s.checkContent}>
                    <Text style={[
                      s.checkLabel,
                      isDone && s.checkLabelDone,
                      isActive && s.checkLabelActive,
                    ]}>
                      {item.label}
                    </Text>
                    <Text style={[
                      s.checkStatus,
                      isDone && s.checkStatusDone,
                      isActive && s.checkStatusActive,
                    ]}>
                      {isDone
                        ? "✓ Verified by technician"
                        : isActive
                        ? "In progress..."
                        : "Pending"}
                    </Text>
                  </View>

                  {/* Right badge */}
                  {isDone && (
                    <View style={s.doneBadge}>
                      <Text style={s.doneBadgeText}>Done</Text>
                    </View>
                  )}
                  {isActive && (
                    <View style={s.activeBadge}>
                      <Text style={s.activeBadgeText}>Active</Text>
                    </View>
                  )}
                </Animated.View>
              );
            })}
          </View>
        </Animated.View>

        {/* ── Professional Card ─────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(200).duration(380)} style={s.proCard}>
          <Text style={s.sectionTitle}>Your Professional</Text>
          <View style={s.proRow}>
            <View style={s.proAvatarWrap}>
              <LinearGradient colors={["#2563eb", "#8343f4"]} style={s.proAvatar}>
                <Text style={s.proAvatarText}>RK</Text>
              </LinearGradient>
              <View style={s.proOnline} />
            </View>
            <View style={s.proInfo}>
              <View style={s.proNameRow}>
                <Text style={s.proName}>Rajesh K.</Text>
                <Ionicons name="checkmark-circle" size={16} color="#3b82f6" />
              </View>
              <View style={s.proMeta}>
                <Ionicons name="star" size={13} color="#fbbf24" />
                <Text style={s.proRating}>4.9</Text>
                <Text style={s.proExp}> · 8 yrs exp</Text>
              </View>
            </View>
            <View style={s.proActions}>
              <Pressable style={[s.proActionBtn, s.proActionBtnPrimary]} onPress={() => Linking.openURL('tel:9876543210')}>
                <Ionicons name="call" size={18} color="white" />
              </Pressable>
            </View>
          </View>
        </Animated.View>

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* ── Bottom CTA ──────────────────────────────────── */}
      <View style={s.cta}>
        <Pressable
          style={s.ctaBtn}
          onPress={() => navigation.navigate("ServiceCompleted", {})}
        >
          <Text style={s.ctaBtnText}>Track Progress</Text>
          <Ionicons name="arrow-forward" size={18} color="white" />
        </Pressable>
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
  headerTitle: { fontSize: 18, fontWeight: "700", color: colors.text.primary },
  iconBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface.containerHigh,
    borderWidth: 1, borderColor: colors.glass.border, justifyContent: "center", alignItems: "center",
  },
  scroll: { paddingHorizontal: 16 },

  // Hero
  hero: { borderRadius: 28, padding: 24, marginBottom: 16, overflow: "hidden" },
  heroTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 },
  heroTitle: { fontSize: 20, fontWeight: "700", color: "white" },
  heroSub: { fontSize: 12, color: "rgba(255,255,255,0.75)", marginTop: 4 },
  etaBadge: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 7,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.2)",
  },
  etaText: { fontSize: 12, fontWeight: "600", color: "white" },

  // Ring
  ringWrap: { alignItems: "center", marginVertical: 8 },
  ringOuter: {
    width: 160, height: 160, borderRadius: 80,
    borderWidth: 10, borderColor: "rgba(255,255,255,0.2)",
    justifyContent: "center", alignItems: "center",
    borderTopColor: "rgba(255,255,255,0.9)",
    borderRightColor: "rgba(255,255,255,0.9)",
  },
  ringInner: { width: 120, height: 120, borderRadius: 60, overflow: "hidden" },
  ringCenter: { flex: 1, justifyContent: "center", alignItems: "center" },
  ringPct: { fontSize: 30, fontWeight: "700", color: "white" },
  ringLabel: { fontSize: 12, color: "rgba(255,255,255,0.8)" },

  // Checklist Card
  checkCard: {
    backgroundColor: colors.surface.container, borderRadius: 24, padding: 20,
    marginBottom: 14, borderWidth: 1, borderColor: colors.glass.border,
  },
  sectionHeaderRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: colors.text.primary },
  sectionSubtitle: { fontSize: 12, color: colors.text.muted, marginBottom: 16, lineHeight: 17 },
  checklistWrap: { gap: 10 },
  checkItem: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: colors.surface.containerHigh,
    borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: colors.glass.border,
  },
  checkItemDone: {
    backgroundColor: "rgba(20,184,166,0.08)",
    borderColor: "rgba(20,184,166,0.3)",
  },
  checkItemActive: {
    backgroundColor: "rgba(14,165,233,0.08)",
    borderColor: "rgba(14,165,233,0.35)",
  },
  checkItemPending: { opacity: 0.4 },
  checkIcon: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: colors.surface.containerHighest,
    justifyContent: "center", alignItems: "center",
    borderWidth: 1.5, borderColor: colors.glass.border,
    flexShrink: 0,
  },
  checkIconDone: { backgroundColor: "#14b8a6", borderColor: "#14b8a6" },
  checkIconActive: { backgroundColor: "rgba(14,165,233,0.15)", borderColor: "#0ea5e9" },
  checkContent: { flex: 1 },
  checkLabel: { fontSize: 13, fontWeight: "500", color: colors.text.primary, lineHeight: 18 },
  checkLabelDone: { color: "#14b8a6", fontWeight: "600" },
  checkLabelActive: { color: "#0ea5e9", fontWeight: "600" },
  checkStatus: { fontSize: 11, color: colors.text.muted, marginTop: 2 },
  checkStatusDone: { color: "#14b8a6" },
  checkStatusActive: { color: "#0ea5e9" },
  doneBadge: {
    backgroundColor: "rgba(20,184,166,0.15)", borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  doneBadgeText: { fontSize: 10, fontWeight: "700", color: "#14b8a6" },
  activeBadge: {
    backgroundColor: "rgba(14,165,233,0.15)", borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  activeBadgeText: { fontSize: 10, fontWeight: "700", color: "#0ea5e9" },

  // Pro card
  proCard: {
    backgroundColor: colors.surface.container, borderRadius: 24, padding: 20,
    marginBottom: 14, borderWidth: 1, borderColor: colors.glass.border,
  },
  proRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  proAvatarWrap: { position: "relative" },
  proAvatar: { width: 56, height: 56, borderRadius: 28, justifyContent: "center", alignItems: "center" },
  proAvatarText: { fontSize: 20, fontWeight: "700", color: "white" },
  proOnline: {
    position: "absolute", bottom: 2, right: 2,
    width: 14, height: 14, borderRadius: 7,
    backgroundColor: "#22c55e", borderWidth: 2, borderColor: colors.surface.container,
  },
  proInfo: { flex: 1 },
  proNameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  proName: { fontSize: 16, fontWeight: "700", color: colors.text.primary },
  proMeta: { flexDirection: "row", alignItems: "center", marginTop: 3 },
  proRating: { fontSize: 13, color: "#fbbf24", fontWeight: "600", marginLeft: 3 },
  proExp: { fontSize: 13, color: colors.text.secondary },
  proActions: { flexDirection: "row", gap: 10 },
  proActionBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: colors.surface.containerHigh, borderWidth: 1, borderColor: colors.glass.border,
    justifyContent: "center", alignItems: "center",
  },
  proActionBtnPrimary: { backgroundColor: "#2563eb", borderColor: "transparent" },

  // CTA
  cta: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    paddingHorizontal: 16, paddingBottom: 28, paddingTop: 12,
    backgroundColor: "rgba(4,20,35,0.97)",
    borderTopWidth: 1, borderTopColor: colors.glass.border,
  },
  ctaBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
    backgroundColor: "#0ea5e9", borderRadius: 22, paddingVertical: 16,
  },
  ctaBtnText: { fontSize: 15, fontWeight: "700", color: "white" },
});
