import React, { useEffect } from "react";
import { ScrollView, Text, View, Pressable, StyleSheet } from "react-native";
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

type Props = NativeStackScreenProps<RootStackParamList, "ServiceInProgress">;

const TASKS = [
  { label: "Living Room", icon: "home-outline" as const, status: "Completed", done: true },
  { label: "Bedroom",     icon: "bed-outline" as const,  status: "Completed", done: true },
  { label: "Kitchen",     icon: "flame-outline" as const,status: "In Progress...", active: true },
  { label: "Bathroom",    icon: "water-outline" as const,status: "Pending", pending: true },
];

export default function ServiceInProgressScreen({ navigation }: Props) {
  // Animated progress ring — strokes from 283 (0%) toward 99 (65%)
  const progress = useSharedValue(283);
  useEffect(() => {
    progress.value = withTiming(99, { duration: 1800, easing: Easing.out(Easing.cubic) });
  }, []);

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

        {/* ── Hero with progress ring ───────────────────────── */}
        <Animated.View entering={FadeInDown.duration(380)}>
          <LinearGradient colors={["#14b8a6", "#06b6d4", "#0ea5e9"]} style={s.hero}>
            <View style={s.heroTop}>
              <View>
                <Text style={s.heroTitle}>Cleaning Started</Text>
                <Text style={s.heroSub}>Deep Home Cleaning</Text>
              </View>
              <View style={s.etaBadge}>
                <Ionicons name="time-outline" size={14} color="white" />
                <Text style={s.etaText}>ETA 1hr 20m</Text>
              </View>
            </View>

            {/* Progress Ring (SVG-like using View) */}
            <View style={s.ringWrap}>
              <View style={s.ringOuter}>
                <View style={s.ringInner}>
                  <LinearGradient colors={["#0ea5e9", "#14b8a6"]} style={s.ringCenter}>
                    <Text style={s.ringPct}>65%</Text>
                    <Text style={s.ringLabel}>Completed</Text>
                  </LinearGradient>
                </View>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* ── Task Timeline ─────────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(100).duration(380)} style={s.timelineCard}>
          <Text style={s.sectionTitle}>Current Progress</Text>
          {TASKS.map((task, i) => (
            <View key={task.label} style={[s.taskRow, i < TASKS.length - 1 && { marginBottom: 16 }]}>
              {/* Timeline line */}
              {i < TASKS.length - 1 && (
                <View style={[s.taskLine, task.done && s.taskLineDone]} />
              )}

              {/* Dot */}
              {task.active ? (
                <View style={s.activeDotWrap}>
                  <Animated.View style={[s.activeDotRing, pulseStyle]} />
                  <View style={s.activeDot} />
                </View>
              ) : (
                <View style={[s.taskDot, task.done && s.taskDotDone, task.pending && s.taskDotPending]}>
                  {task.done && <Ionicons name="checkmark" size={13} color="white" />}
                </View>
              )}

              {/* Card */}
              <View style={[
                s.taskCard,
                task.active && s.taskCardActive,
                task.pending && s.taskCardPending,
              ]}>
                <View style={[s.taskIconWrap, task.done && s.taskIconDone, task.active && s.taskIconActive]}>
                  <Ionicons name={task.icon} size={20} color={task.done ? "#14b8a6" : task.active ? "#0ea5e9" : colors.text.muted} />
                </View>
                <View>
                  <Text style={[s.taskLabel, task.active && s.taskLabelActive]}>{task.label}</Text>
                  <Text style={[s.taskStatus, task.active && s.taskStatusActive, task.done && s.taskStatusDone]}>
                    {task.status}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </Animated.View>

        {/* ── Professional Card ────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(180).duration(380)} style={s.proCard}>
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
              <Pressable style={[s.proActionBtn, s.proActionBtnPrimary]}>
                <Ionicons name="call" size={18} color="white" />
              </Pressable>
              <Pressable style={s.proActionBtn}>
                <Ionicons name="chatbubble-outline" size={18} color={colors.text.secondary} />
              </Pressable>
            </View>
          </View>
        </Animated.View>

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* ── Bottom CTA ───────────────────────────────────────── */}
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
  heroTitle: { fontSize: 22, fontWeight: "700", color: "white" },
  heroSub: { fontSize: 13, color: "rgba(255,255,255,0.75)", marginTop: 4 },
  etaBadge: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 7,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.2)",
  },
  etaText: { fontSize: 12, fontWeight: "600", color: "white" },

  // Ring (using nested Views as circle border)
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

  // Timeline
  timelineCard: {
    backgroundColor: colors.surface.container, borderRadius: 24, padding: 20,
    marginBottom: 14, borderWidth: 1, borderColor: colors.glass.border,
  },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: colors.text.primary, marginBottom: 16 },
  taskRow: { flexDirection: "row", alignItems: "flex-start", gap: 12, paddingLeft: 4, minHeight: 60 },
  taskLine: {
    position: "absolute", left: 15, top: 28, width: 2, height: 32,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  taskLineDone: { backgroundColor: "#14b8a6" },
  activeDotWrap: { width: 24, height: 24, justifyContent: "center", alignItems: "center", flexShrink: 0, marginTop: 2 },
  activeDotRing: { position: "absolute", width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: "#0ea5e9" },
  activeDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: "#0ea5e9" },
  taskDot: {
    width: 24, height: 24, borderRadius: 12, flexShrink: 0, marginTop: 2,
    backgroundColor: colors.surface.containerHighest,
    borderWidth: 2, borderColor: "rgba(255,255,255,0.15)",
    justifyContent: "center", alignItems: "center",
  },
  taskDotDone: { backgroundColor: "#14b8a6", borderColor: "#14b8a6" },
  taskDotPending: { opacity: 0.4 },
  taskCard: {
    flex: 1, flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: colors.surface.containerHigh, borderRadius: 18, padding: 14,
    borderWidth: 1, borderColor: colors.glass.border,
  },
  taskCardActive: { backgroundColor: "rgba(14,165,233,0.1)", borderColor: "rgba(14,165,233,0.3)" },
  taskCardPending: { opacity: 0.45 },
  taskIconWrap: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.surface.containerHighest,
    justifyContent: "center", alignItems: "center",
  },
  taskIconDone: { backgroundColor: "rgba(20,184,166,0.15)" },
  taskIconActive: { backgroundColor: "rgba(14,165,233,0.15)" },
  taskLabel: { fontSize: 14, fontWeight: "600", color: colors.text.primary },
  taskLabelActive: { color: "#0ea5e9" },
  taskStatus: { fontSize: 12, color: colors.text.muted, marginTop: 2 },
  taskStatusActive: { color: "#0ea5e9" },
  taskStatusDone: { color: "#14b8a6" },

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
