import React, { useEffect } from "react";
import {
  ScrollView, Text, View, Pressable, StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withDelay,
  FadeInDown, FadeIn, SlideInRight,
} from "react-native-reanimated";
import { RootStackParamList } from "@/navigation/types";
import { colors } from "@/theme/colors";

type Props = NativeStackScreenProps<RootStackParamList, "Notifications">;

// ── Data from design ───────────────────────────────────────────────────────────
const NEW_NOTIFICATIONS = [
  {
    id: "health",
    title: "Daily Health Check",
    body: "Your daily health check is ready. Take a moment to review your progress.",
    time: "10 min ago",
    isNew: true,
    iconName: "heart" as const,
    gradientBg: ["#3b2a5c", "#241a38"] as string[],
    iconGradient: ["#d2bbff", "#8343f4"] as string[],
    accentColor: "#d2bbff",
    accentBg: "rgba(131,67,244,0.3)",
    route: "HealthDashboard" as keyof RootStackParamList,
  },
  {
    id: "service",
    title: "Home Cleaning Confirmed",
    body: "Your cleaning service is confirmed for today at 4:30 PM.",
    time: "1 hr ago",
    isNew: false,
    badge: "Arriving soon",
    iconName: "home" as const,
    gradientBg: ["#1e3a5f", "#12233b"] as string[],
    iconGradient: ["#b4c5ff", "#2563eb"] as string[],
    accentColor: "#b4c5ff",
    accentBg: "rgba(37,99,235,0.3)",
    route: "HomeDashboard" as keyof RootStackParamList,
  },
  {
    id: "fitness",
    title: "Great Progress! 🎉",
    body: "You completed 82% of your weekly activity goal.",
    time: "2 hrs ago",
    progress: 82,
    iconName: "walk" as const,
    gradientBg: ["#1a4a44", "#102d29"] as string[],
    iconGradient: ["#71f8e4", "#04b4a2"] as string[],
    accentColor: "#71f8e4",
    accentBg: "rgba(4,180,162,0.3)",
    route: "FitnessDashboard" as keyof RootStackParamList,
  },
  {
    id: "safety",
    title: "Safety Check",
    body: "Your emergency contacts are ready. Review them anytime.",
    time: "4 hrs ago",
    iconName: "shield-checkmark" as const,
    gradientBg: ["#4a1c1c", "#2c1010"] as string[],
    iconGradient: ["#ffb4ab", "#e33527"] as string[],
    accentColor: "#ffb4ab",
    accentBg: "rgba(147,0,10,0.5)",
    route: "EmergencyAssistance" as keyof RootStackParamList,
  },
];

const EARLIER_NOTIFICATIONS = [
  {
    id: "payment",
    title: "Payment Successful",
    body: "Your recent service payment was completed successfully.",
    time: "Yesterday",
    iconName: "card" as const,
    iconGradient: ["#8343f4", "#5a00c6"] as string[],
    accentColor: "#d2bbff",
  },
  {
    id: "reminder",
    title: "Don't Forget",
    body: "Your scheduled reminder is coming up at 7:00 PM.",
    time: "Yesterday",
    iconName: "alarm" as const,
    iconGradient: ["#fbbc04", "#e37400"] as string[],
    accentColor: "#fbbc04",
  },
];

const CATEGORY_DOTS = [
  { gradient: ["#d2bbff", "#8343f4"] as string[] },
  { gradient: ["#b4c5ff", "#2563eb"] as string[] },
  { gradient: ["#71f8e4", "#04b4a2"] as string[] },
  { gradient: ["#ffb4ab", "#93000a"] as string[] },
];

export default function NotificationsScreen({ navigation }: Props) {
  // Header bounce in
  const headerY = useSharedValue(-30);
  const headerOp = useSharedValue(0);
  useEffect(() => {
    headerY.value = withSpring(0, { damping: 16, stiffness: 200 });
    headerOp.value = withSpring(1, { damping: 20, stiffness: 180 });
  }, []);
  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOp.value,
    transform: [{ translateY: headerY.value }],
  }));

  return (
    <View style={s.root}>

      {/* ── Header ──────────────────────────────────────────── */}
      <Animated.View style={[s.header, headerStyle]}>
        <View style={s.headerLeft}>
          <Pressable onPress={() => navigation.goBack()} style={s.backBtn}>
            <Ionicons name="arrow-back" size={22} color={colors.text.secondary} />
          </Pressable>
          <View>
            <Text style={s.pageTitle}>Notifications</Text>
            <Text style={s.pageSub}>Everything important, in one place</Text>
          </View>
        </View>
        <View style={s.headerActions}>
          <Pressable style={s.iconBtn}>
            <Ionicons name="checkmark-done" size={20} color={colors.text.secondary} />
          </Pressable>
          <Pressable style={s.iconBtn}>
            <Ionicons name="settings-outline" size={20} color={colors.text.secondary} />
          </Pressable>
        </View>
      </Animated.View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* ── Summary card ────────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(100).duration(400).springify()}>
          <View style={s.summaryCard}>
            <View style={s.summaryLeft}>
              <LinearGradient colors={["#2563eb", "#0053db"]} style={s.summaryIconBg}>
                <Ionicons name="notifications" size={22} color="white" />
              </LinearGradient>
              <View>
                <Text style={s.summaryTitle}>4 New Updates</Text>
                <Text style={s.summarySub}>Across your categories</Text>
              </View>
            </View>
            <View style={s.dotsRow}>
              {CATEGORY_DOTS.map((d, i) => (
                <LinearGradient key={i} colors={d.gradient} style={s.dot} />
              ))}
            </View>
          </View>
        </Animated.View>

        {/* ── NEW section ──────────────────────────────────── */}
        <Text style={s.sectionLabel}>NEW</Text>
        {NEW_NOTIFICATIONS.map((n, i) => (
          <Animated.View
            key={n.id}
            entering={FadeInDown.delay(150 + i * 80).duration(420).springify()}
          >
            <Pressable
              onPress={() => navigation.navigate(n.route as any)}
              style={({ pressed }) => ({ opacity: pressed ? 0.88 : 1 })}
            >
              <LinearGradient colors={n.gradientBg} style={s.notifCard}>
                {/* Glow blob top-right */}
                <View
                  style={[s.glowBlob, { backgroundColor: n.accentColor + "1a" }]}
                  pointerEvents="none"
                />

                {/* Icon */}
                <LinearGradient colors={n.iconGradient} style={s.notifIcon}>
                  <Ionicons name={n.iconName} size={24} color="white" />
                </LinearGradient>

                {/* Content */}
                <View style={s.notifContent}>
                  <View style={s.notifTitleRow}>
                    <Text style={s.notifTitle}>{n.title}</Text>
                    <View style={[s.timeBadge, { backgroundColor: n.accentBg, borderColor: n.accentColor + "33" }]}>
                      <Text style={[s.timeText, { color: n.accentColor }]}>{n.time}</Text>
                    </View>
                  </View>
                  <Text style={[s.notifBody, { color: n.accentColor + "dd" }]}>{n.body}</Text>

                  {/* NEW pill */}
                  {n.isNew && (
                    <View style={[s.newPill, { borderColor: n.accentColor + "50" }]}>
                      <View style={[s.newDot, { backgroundColor: n.accentColor }]} />
                      <Text style={[s.newText, { color: n.accentColor }]}>NEW</Text>
                    </View>
                  )}

                  {/* Badge e.g. "Arriving soon" */}
                  {n.badge && (
                    <View style={s.badgeRow}>
                      <Ionicons name="time-outline" size={14} color={n.accentColor} />
                      <Text style={[s.badgeText, { color: n.accentColor }]}>{n.badge}</Text>
                    </View>
                  )}

                  {/* Progress bar */}
                  {n.progress !== undefined && (
                    <View style={s.progressTrack}>
                      <LinearGradient
                        colors={n.iconGradient}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                        style={[s.progressFill, { width: `${n.progress}%` }]}
                      />
                    </View>
                  )}
                </View>
              </LinearGradient>
            </Pressable>
          </Animated.View>
        ))}

        {/* ── EARLIER section ──────────────────────────────── */}
        <Text style={[s.sectionLabel, { marginTop: 20 }]}>EARLIER</Text>
        {EARLIER_NOTIFICATIONS.map((n, i) => (
          <Animated.View
            key={n.id}
            entering={FadeInDown.delay(500 + i * 70).duration(380).springify()}
          >
            <View style={s.earlierCard}>
              <LinearGradient colors={n.iconGradient} style={s.earlierIcon}>
                <Ionicons name={n.iconName} size={20} color="white" />
              </LinearGradient>
              <View style={s.earlierContent}>
                <View style={s.notifTitleRow}>
                  <Text style={s.earlierTitle}>{n.title}</Text>
                  <Text style={[s.timeText, { color: n.accentColor + "99" }]}>{n.time}</Text>
                </View>
                <Text style={[s.earlierBody, { color: n.accentColor + "88" }]} numberOfLines={1}>
                  {n.body}
                </Text>
              </View>
            </View>
          </Animated.View>
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>

    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface.dim },

  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start",
    paddingHorizontal: 16, paddingTop: 52, paddingBottom: 16,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.surface.containerHigh,
    borderWidth: 1, borderColor: colors.glass.border,
    justifyContent: "center", alignItems: "center",
  },
  pageTitle: { fontSize: 26, fontWeight: "700", color: colors.text.primary },
  pageSub: { fontSize: 13, color: colors.text.secondary, marginTop: 2 },
  headerActions: { flexDirection: "row", gap: 8, paddingTop: 4 },
  iconBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.surface.containerHigh,
    borderWidth: 1, borderColor: colors.glass.border,
    justifyContent: "center", alignItems: "center",
  },

  scroll: { paddingHorizontal: 16 },

  // Summary
  summaryCard: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    backgroundColor: colors.surface.containerHigh,
    borderRadius: 20, padding: 16, marginBottom: 20,
    borderWidth: 1, borderColor: colors.glass.border,
  },
  summaryLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  summaryIconBg: {
    width: 48, height: 48, borderRadius: 24,
    justifyContent: "center", alignItems: "center",
  },
  summaryTitle: { fontSize: 16, fontWeight: "700", color: colors.text.primary },
  summarySub: { fontSize: 12, color: colors.text.secondary, marginTop: 2 },
  dotsRow: { flexDirection: "row" },
  dot: {
    width: 28, height: 28, borderRadius: 14,
    marginLeft: -8,
    borderWidth: 2, borderColor: colors.surface.containerHigh,
  },

  // Section labels
  sectionLabel: {
    fontSize: 11, fontWeight: "800", letterSpacing: 1.2,
    color: colors.text.muted, marginBottom: 12, paddingHorizontal: 2,
  },

  // New notification cards
  notifCard: {
    borderRadius: 20, padding: 18, marginBottom: 12,
    flexDirection: "row", gap: 16,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
    overflow: "hidden",
  },
  glowBlob: {
    position: "absolute", top: -20, right: -20,
    width: 120, height: 120, borderRadius: 60,
  },
  notifIcon: {
    width: 52, height: 52, borderRadius: 16,
    justifyContent: "center", alignItems: "center",
    flexShrink: 0,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.2)",
  },
  notifContent: { flex: 1 },
  notifTitleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 6 },
  notifTitle: { fontSize: 15, fontWeight: "700", color: "white", flex: 1, lineHeight: 20 },
  timeBadge: {
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 20, borderWidth: 1, flexShrink: 0,
  },
  timeText: { fontSize: 11, fontWeight: "600" },
  notifBody: { fontSize: 13, lineHeight: 18 },
  newPill: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 20, borderWidth: 1,
    alignSelf: "flex-start", marginTop: 10,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  newDot: { width: 6, height: 6, borderRadius: 3 },
  newText: { fontSize: 10, fontWeight: "800", letterSpacing: 1 },
  badgeRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 8 },
  badgeText: { fontSize: 13, fontWeight: "700" },
  progressTrack: {
    height: 6, backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 3, overflow: "hidden", marginTop: 10,
  },
  progressFill: { height: "100%", borderRadius: 3 },

  // Earlier cards — compact
  earlierCard: {
    flexDirection: "row", alignItems: "center", gap: 14,
    backgroundColor: colors.surface.container,
    borderRadius: 18, padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: colors.glass.border,
  },
  earlierIcon: {
    width: 44, height: 44, borderRadius: 14,
    justifyContent: "center", alignItems: "center", flexShrink: 0,
  },
  earlierContent: { flex: 1 },
  earlierTitle: { fontSize: 14, fontWeight: "700", color: colors.text.primary, flex: 1 },
  earlierBody: { fontSize: 12, marginTop: 3 },
});
