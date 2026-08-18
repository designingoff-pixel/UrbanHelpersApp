import React, { useEffect } from "react";
import { ScrollView, Text, View, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import Animated, {
  useSharedValue, useAnimatedStyle,
  withSpring, withDelay, withTiming,
  FadeInDown,
} from "react-native-reanimated";
import { RootStackParamList } from "@/navigation/types";
import { colors } from "@/theme/colors";

type Props = NativeStackScreenProps<RootStackParamList, "ServiceCompleted">;

const COMPLETED_TASKS = [
  { label: "Living Room", icon: "home-outline" as const },
  { label: "Kitchen",     icon: "flame-outline" as const },
  { label: "Bathroom",    icon: "water-outline" as const },
  { label: "Bedroom",     icon: "bed-outline" as const },
];

const DOWNLOADS = [
  { label: "Invoice",        sub: "PDF Document",  icon: "receipt-outline" as const,     color: "#3b82f6" },
  { label: "Service Report", sub: "Detailed View", icon: "document-text-outline" as const,color: "#8b5cf6" },
  { label: "Warranty",       sub: "7 Days Active", icon: "shield-checkmark-outline" as const, color: "#f97316" },
];

export default function ServiceCompletedScreen({ navigation }: Props) {
  const checkScale = useSharedValue(0);
  const checkOp = useSharedValue(0);
  useEffect(() => {
    checkOp.value = withTiming(1, { duration: 300 });
    checkScale.value = withSpring(1, { damping: 12, stiffness: 200 });
  }, []);
  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
    opacity: checkOp.value,
  }));

  return (
    <View style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} style={s.iconBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.text.secondary} />
        </Pressable>
        <Text style={s.headerTitle}>Completed</Text>
        <Pressable style={s.iconBtn}>
          <Ionicons name="ellipsis-vertical" size={20} color={colors.text.secondary} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* ── Success Hero ─────────────────────────────────── */}
        <Animated.View entering={FadeInDown.duration(380)}>
          <LinearGradient colors={["#22c55e", "#86efac"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.hero}>
            <View style={s.heroOverlay} />
            <View style={s.heroContent}>
              <Animated.View style={[s.checkWrap, checkStyle]}>
                <Ionicons name="checkmark-circle" size={64} color="white" />
              </Animated.View>
              <Text style={s.heroTitle}>Cleaning Completed Successfully</Text>
              <Text style={s.heroSub}>Your home is now professionally cleaned.</Text>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* ── Service Summary ──────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(80).duration(380)} style={s.summaryCard}>
          <Text style={s.sectionLabel}>SERVICE SUMMARY</Text>
          <View style={s.summaryGrid}>
            {[
              { label: "Package",       value: "Premium Cleaning",    icon: "sparkles-outline" as const,      color: "#2563eb" },
              { label: "Duration",      value: "5 Hours",             icon: "time-outline" as const,           color: "#059669" },
              { label: "Professional",  value: "Rajesh K. ✓",         icon: "person-outline" as const,         color: "#8343f4" },
              { label: "Date & Invoice",value: "Today · UH-2026",     icon: "receipt-outline" as const,        color: colors.text.muted },
            ].map((item) => (
              <View key={item.label} style={s.summaryItem}>
                <View style={[s.summaryIcon, { backgroundColor: item.color + "22" }]}>
                  <Ionicons name={item.icon} size={18} color={item.color} />
                </View>
                <View>
                  <Text style={s.summaryItemLabel}>{item.label}</Text>
                  <Text style={s.summaryItemValue}>{item.value}</Text>
                </View>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* ── Completed Tasks ──────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(140).duration(380)} style={s.tasksCard}>
          <Text style={s.sectionTitle}>What Was Completed</Text>
          <View style={s.tasksGrid}>
            {COMPLETED_TASKS.map((task) => (
              <View key={task.label} style={s.taskItem}>
                <Ionicons name={task.icon} size={28} color="#2563eb" />
                <Text style={s.taskName}>{task.label}</Text>
                <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
              </View>
            ))}
          </View>
        </Animated.View>

        {/* ── Downloads ────────────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(200).duration(380)}>
          {DOWNLOADS.map((d) => (
            <Pressable key={d.label} style={({ pressed }) => [s.downloadRow, { opacity: pressed ? 0.75 : 1 }]}>
              <View style={[s.downloadIcon, { backgroundColor: d.color + "22" }]}>
                <Ionicons name={d.icon} size={20} color={d.color} />
              </View>
              <View style={s.downloadText}>
                <Text style={s.downloadLabel}>{d.label}</Text>
                <Text style={s.downloadSub}>{d.sub}</Text>
              </View>
              <Ionicons name="download-outline" size={20} color={colors.text.muted} />
            </Pressable>
          ))}
        </Animated.View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ── Bottom CTA ───────────────────────────────────────── */}
      <View style={s.cta}>
        <Pressable
          style={s.ctaBtn}
          onPress={() => navigation.navigate("RatingFeedback", {})}
        >
          <Ionicons name="star" size={20} color="white" />
          <Text style={s.ctaBtnText}>Rate Your Experience</Text>
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
  hero: { borderRadius: 28, padding: 28, marginBottom: 16, overflow: "hidden" },
  heroOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(255,255,255,0.08)" },
  heroContent: { alignItems: "center" },
  checkWrap: { marginBottom: 16 },
  heroTitle: { fontSize: 22, fontWeight: "700", color: "white", textAlign: "center", marginBottom: 8, lineHeight: 30 },
  heroSub: { fontSize: 14, color: "rgba(255,255,255,0.85)", textAlign: "center" },

  // Summary
  summaryCard: {
    backgroundColor: colors.surface.container, borderRadius: 24, padding: 20,
    marginBottom: 14, borderWidth: 1, borderColor: colors.glass.border,
  },
  sectionLabel: {
    fontSize: 10, fontWeight: "800", color: colors.text.muted,
    letterSpacing: 1.2, marginBottom: 14,
  },
  summaryGrid: { gap: 10 },
  summaryItem: { flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: colors.surface.containerHigh, borderRadius: 16, padding: 12 },
  summaryIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: "center", alignItems: "center" },
  summaryItemLabel: { fontSize: 11, color: colors.text.muted, marginBottom: 2 },
  summaryItemValue: { fontSize: 14, fontWeight: "600", color: colors.text.primary },

  // Tasks
  tasksCard: {
    backgroundColor: colors.surface.container, borderRadius: 24, padding: 20,
    marginBottom: 14, borderWidth: 1, borderColor: colors.glass.border,
  },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: colors.text.primary, marginBottom: 14 },
  tasksGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  taskItem: {
    width: "47%", alignItems: "center", backgroundColor: colors.surface.containerHigh,
    borderRadius: 20, padding: 16, gap: 8,
    borderWidth: 1, borderColor: colors.glass.border,
  },
  taskName: { fontSize: 13, fontWeight: "600", color: colors.text.primary },

  // Downloads
  downloadRow: {
    flexDirection: "row", alignItems: "center", gap: 14,
    backgroundColor: colors.surface.container,
    borderRadius: 20, padding: 16, marginBottom: 10,
    borderWidth: 1, borderColor: colors.glass.border,
  },
  downloadIcon: { width: 44, height: 44, borderRadius: 22, justifyContent: "center", alignItems: "center" },
  downloadText: { flex: 1 },
  downloadLabel: { fontSize: 14, fontWeight: "600", color: colors.text.primary },
  downloadSub: { fontSize: 12, color: colors.text.secondary, marginTop: 2 },

  // CTA
  cta: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    paddingHorizontal: 16, paddingBottom: 28, paddingTop: 12,
    backgroundColor: "rgba(4,20,35,0.97)",
    borderTopWidth: 1, borderTopColor: colors.glass.border,
  },
  ctaBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
    backgroundColor: "#2563eb", borderRadius: 22, paddingVertical: 16,
  },
  ctaBtnText: { fontSize: 15, fontWeight: "700", color: "white" },
});
