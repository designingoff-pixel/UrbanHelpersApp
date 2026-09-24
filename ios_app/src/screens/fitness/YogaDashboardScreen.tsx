import React from "react";
import { ScrollView, Text, View, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/types";
import { colors } from "@/theme/colors";

type Props = NativeStackScreenProps<RootStackParamList, "YogaDashboard">;

const CATEGORIES = [
  { label: "Beginner", sub: "Foundation", icon: "body", bg: colors.secondaryContainer },
  { label: "Intermediate", sub: "Strength", icon: "fitness", bg: colors.tertiaryContainer },
  { label: "Advanced", sub: "Challenge", icon: "flash", bg: "#e11d48" },
];

const POSES = [
  { name: "Tree Pose", sanskrit: "Vrksasana", bg: "#0c4a6e" },
  { name: "Lotus", sanskrit: "Padmasana", bg: "#4c1d95" },
  { name: "Warrior", sanskrit: "Virabhadrasana", bg: "#9f1239" },
  { name: "Child's Pose", sanskrit: "Balasana", bg: "#065f46" },
];

const NAV = [
  { icon: "home-outline", label: "Home", route: "HomeDashboard" },
  { icon: "heart-outline", label: "Health", route: "HealthDashboard" },
  { icon: "compass-outline", label: "Discover", route: "Discover" },
  { icon: "barbell", label: "Fitness", route: "FitnessDashboard", active: true },
  { icon: "person-outline", label: "Profile", route: "Profile" },
];

export default function YogaDashboardScreen({ navigation }: Props) {
  return (
    <View style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} style={s.iconBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.text.secondary} />
        </Pressable>
        <Text style={s.headerTitle}>Urban Helpers</Text>
        <Pressable style={s.iconBtn}>
          <Ionicons name="notifications-outline" size={22} color={colors.text.secondary} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {/* Hero */}
        <LinearGradient
          colors={["#6a4c93", "#c77dff", "#4338ca"]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={s.hero}
        >
          <View style={s.heroOverlay}>
            <Text style={s.heroTitle}>Yoga</Text>
            <Text style={s.heroSub}>Relax your body and mind.</Text>
          </View>
        </LinearGradient>

        {/* Today's Session */}
        <View style={s.sessionCard}>
          <View style={s.sessionLeft}>
            <View style={s.sessionBadge}>
              <Text style={s.sessionBadgeText}>Today's Session</Text>
            </View>
            <Text style={s.sessionTitle}>Morning Flow</Text>
            <View style={s.sessionMeta}>
              <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.8)" />
              <Text style={s.sessionMetaText}>30 min</Text>
              <Ionicons name="flame-outline" size={14} color="rgba(255,255,255,0.8)" style={{ marginLeft: 8 }} />
              <Text style={s.sessionMetaText}>150 kcal</Text>
            </View>
          </View>
          <Pressable
            onPress={() => navigation.navigate("FitnessDashboard")}
            style={s.playBtn}
          >
            <Ionicons name="play" size={28} color={colors.primaryContainer} />
          </Pressable>
        </View>

        {/* Categories */}
        <Text style={s.sectionTitle}>Categories</Text>
        <View style={s.catGrid}>
          {CATEGORIES.map((c) => (
            <Pressable
              key={c.label}
              style={({ pressed }) => [s.catCard, { backgroundColor: c.bg, opacity: pressed ? 0.85 : 1 }]}
            >
              <View style={s.catIconWrap}>
                <Ionicons name={c.icon as any} size={28} color="white" />
              </View>
              <Text style={s.catLabel}>{c.label}</Text>
              <Text style={s.catSub}>{c.sub}</Text>
            </Pressable>
          ))}
        </View>

        {/* Popular Poses */}
        <Text style={s.sectionTitle}>Popular Poses</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.posesRow} contentContainerStyle={{ gap: 12, paddingRight: 16 }}>
          {POSES.map((p) => (
            <Pressable key={p.name} style={[s.poseCard, { backgroundColor: p.bg }]}>
              <View style={s.poseImg}>
                <Ionicons name="body" size={36} color="rgba(255,255,255,0.5)" />
              </View>
              <Text style={s.poseName}>{p.name}</Text>
              <Text style={s.poseSanskrit}>{p.sanskrit}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Two-col: Breathe + Progress */}
        <View style={s.twoCol}>
          {/* Breathe */}
          <View style={s.breatheCard}>
            <Text style={s.breatheTitle}>Breathe</Text>
            <Text style={s.breatheSub}>Follow the circle</Text>
            <View style={s.breatheRing}>
              <View style={s.breatheInner}>
                <Ionicons name="leaf" size={28} color={colors.primaryContainer} />
              </View>
            </View>
            <Text style={s.breatheTap}>Tap to start</Text>
          </View>

          {/* Stats */}
          <View style={s.statsCol}>
            <View style={s.statCard}>
              <View style={s.statRow}>
                <Ionicons name="time-outline" size={16} color="white" />
                <Text style={s.statLabel}>Minutes</Text>
              </View>
              <Text style={s.statValue}>120</Text>
              <Text style={s.statSub}>+15 today</Text>
            </View>
            <View style={[s.statCard, { backgroundColor: colors.secondaryContainer }]}>
              <View style={s.statRow}>
                <Ionicons name="checkmark-circle-outline" size={16} color="white" />
                <Text style={s.statLabel}>Sessions</Text>
              </View>
              <Text style={s.statValue}>24</Text>
              <Text style={s.statSub}>This month</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Nav */}
      <View style={s.navBar}>
        {NAV.map((n) => (
          <Pressable
            key={n.route}
            onPress={() => navigation.navigate(n.route as any)}
            style={s.navBtn}
          >
            <Ionicons name={n.icon as any} size={22} color={n.active ? colors.primary : colors.text.secondary} />
            <Text style={[s.navLabel, n.active && s.navLabelActive]}>{n.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface.dim },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: 52, paddingBottom: 12 },
  headerTitle: { fontSize: 20, fontWeight: "700", color: colors.primary },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface.containerHigh, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: colors.glass.border },
  scroll: { paddingHorizontal: 16 },
  hero: { borderRadius: 32, minHeight: 220, justifyContent: "flex-end", marginBottom: 16, overflow: "hidden" },
  heroOverlay: { padding: 24, backgroundColor: "rgba(4,20,35,0.35)" },
  heroTitle: { fontSize: 48, fontWeight: "700", color: "white", letterSpacing: -1 },
  heroSub: { fontSize: 18, color: "rgba(255,255,255,0.85)", marginTop: 4 },
  sessionCard: { backgroundColor: colors.primaryContainer, borderRadius: 32, padding: 24, flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24, shadowColor: "rgba(37,99,235,0.4)", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 1, shadowRadius: 20, elevation: 6 },
  sessionLeft: { flex: 1 },
  sessionBadge: { backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4, alignSelf: "flex-start", marginBottom: 10 },
  sessionBadgeText: { fontSize: 11, fontWeight: "700", color: "white", letterSpacing: 0.5 },
  sessionTitle: { fontSize: 24, fontWeight: "700", color: "white", marginBottom: 8 },
  sessionMeta: { flexDirection: "row", alignItems: "center", gap: 4 },
  sessionMetaText: { fontSize: 13, color: "rgba(255,255,255,0.85)", marginRight: 4 },
  playBtn: { width: 64, height: 64, borderRadius: 32, backgroundColor: "white", justifyContent: "center", alignItems: "center", shadowColor: "rgba(255,255,255,0.4)", shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 20, elevation: 5 },
  sectionTitle: { fontSize: 22, fontWeight: "700", color: colors.text.primary, marginBottom: 14 },
  catGrid: { flexDirection: "row", gap: 12, marginBottom: 24 },
  catCard: { flex: 1, borderRadius: 24, padding: 16, alignItems: "center", gap: 8, borderWidth: 1, borderColor: "rgba(255,255,255,0.15)" },
  catIconWrap: { width: 52, height: 52, borderRadius: 26, backgroundColor: "rgba(255,255,255,0.2)", justifyContent: "center", alignItems: "center" },
  catLabel: { fontSize: 14, fontWeight: "700", color: "white" },
  catSub: { fontSize: 11, color: "rgba(255,255,255,0.75)" },
  posesRow: { marginHorizontal: -16, paddingLeft: 16, marginBottom: 24 },
  poseCard: { width: 160, borderRadius: 24, padding: 14 },
  poseImg: { width: "100%", height: 110, borderRadius: 16, backgroundColor: "rgba(0,0,0,0.2)", justifyContent: "center", alignItems: "center", marginBottom: 10 },
  poseName: { fontSize: 15, fontWeight: "700", color: "white" },
  poseSanskrit: { fontSize: 12, color: "rgba(255,255,255,0.65)", marginTop: 2 },
  twoCol: { flexDirection: "row", gap: 12, marginBottom: 8 },
  breatheCard: { flex: 1, backgroundColor: colors.primaryContainer, borderRadius: 32, padding: 20, alignItems: "center", minHeight: 220, shadowColor: "rgba(37,99,235,0.4)", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 1, shadowRadius: 20, elevation: 5 },
  breatheTitle: { fontSize: 18, fontWeight: "700", color: "white", alignSelf: "flex-start" },
  breatheSub: { fontSize: 12, color: "rgba(255,255,255,0.75)", alignSelf: "flex-start", marginBottom: 16 },
  breatheRing: { width: 100, height: 100, borderRadius: 50, backgroundColor: "white", justifyContent: "center", alignItems: "center", shadowColor: "rgba(255,255,255,0.6)", shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 20, elevation: 5 },
  breatheInner: { width: 80, height: 80, borderRadius: 40, backgroundColor: "rgba(37,99,235,0.15)", justifyContent: "center", alignItems: "center" },
  breatheTap: { fontSize: 12, color: "rgba(255,255,255,0.75)", marginTop: 12 },
  statsCol: { flex: 1, gap: 12 },
  statCard: { flex: 1, backgroundColor: colors.tertiaryContainer, borderRadius: 24, padding: 16, justifyContent: "space-between", shadowColor: "rgba(131,67,244,0.4)", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 1, shadowRadius: 15, elevation: 4 },
  statRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  statLabel: { fontSize: 11, fontWeight: "700", color: "rgba(255,255,255,0.9)" },
  statValue: { fontSize: 28, fontWeight: "700", color: "white" },
  statSub: { fontSize: 11, color: "rgba(255,255,255,0.65)" },
  navBar: { position: "absolute", bottom: 0, left: 0, right: 0, height: 72, backgroundColor: colors.surface.container, borderTopWidth: 1, borderTopColor: colors.glass.border, flexDirection: "row", justifyContent: "space-around", alignItems: "center", paddingHorizontal: 8 },
  navBtn: { flex: 1, alignItems: "center", justifyContent: "center", gap: 4, paddingVertical: 8 },
  navLabel: { fontSize: 10, color: colors.text.secondary, fontWeight: "500" },
  navLabelActive: { color: colors.primary, fontWeight: "700" },
});
