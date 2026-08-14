import React from "react";
import { ScrollView, Text, View, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/types";
import { colors } from "@/theme/colors";

type Props = NativeStackScreenProps<RootStackParamList, "Discover">;

const CATEGORIES = [
  { icon: "heart", label: "Health", sub: "24 services", gradient: ["#ec4899", "#8b5cf6"] as (string[]), route: "HealthDashboard" },
  { icon: "home", label: "Home Care", sub: "", gradient: ["#f97316", "#fbbf24"] as (string[]), route: "HomeDashboard" },
  { icon: "alert-circle", label: "Emergency", sub: "URGENT", gradient: ["#ef4444", "#f97316"] as (string[]), route: "EmergencyAssistance" },
  { icon: "happy", label: "Wellness", sub: "Mind & Body", gradient: ["#14b8a6", "#06b6d4"] as (string[]), route: "WellnessDashboard" },
];

const ARTICLES = [
  { tag: "NUTRITION", title: "The Future of Personalized Nutrition and Wellness", read: "5 min read" },
  { tag: "SMART HOME", title: "Integrating Health Tech into Your Living Space", read: "8 min read" },
];

const NAV = [
  { icon: "home-outline", route: "HomeDashboard" },
  { icon: "heart-outline", route: "HealthDashboard" },
  { icon: "compass", route: "Discover", active: true },
  { icon: "barbell-outline", route: "FitnessDashboard" },
  { icon: "person-outline", route: "Profile" },
];

export default function DiscoverScreen({ navigation }: Props) {
  return (
    <View style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.pageTitle}>Discover</Text>
          <Text style={s.pageSub}>Explore new ways to improve your health.</Text>
        </View>
        <Pressable style={s.iconBtn}>
          <Ionicons name="notifications-outline" size={20} color={colors.text.secondary} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {/* Hero */}
        <LinearGradient colors={["#04b4a2", "#005048", "#041423"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.hero}>
          <View style={s.heroTag}>
            <Text style={s.heroTagText}>FEATURED FOR YOU</Text>
          </View>
          <Text style={s.heroTitle}>Complete Family Wellness</Text>
          <Text style={s.heroSub}>Manage health, home care, emergency services and daily routines in one place.</Text>
          <Pressable style={s.heroBtn}>
            <Text style={s.heroBtnText}>Explore Now</Text>
          </Pressable>
        </LinearGradient>

        {/* Categories */}
        <Text style={s.sectionTitle}>Popular Categories</Text>
        <View style={s.categoryGrid}>
          {CATEGORIES.map((c) => (
            <Pressable
              key={c.label}
              onPress={() => navigation.navigate(c.route as any)}
              style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] }]}
            >
              <LinearGradient colors={c.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.categoryCard}>
                <Ionicons name={c.icon as any} size={32} color="white" />
                <View>
                  <Text style={s.categoryLabel}>{c.label}</Text>
                  {c.sub ? (
                    c.sub === "URGENT" ? (
                      <View style={s.urgentBadge}><Text style={s.urgentText}>{c.sub}</Text></View>
                    ) : (
                      <Text style={s.categorySub}>{c.sub}</Text>
                    )
                  ) : null}
                </View>
              </LinearGradient>
            </Pressable>
          ))}
        </View>

        {/* Articles */}
        <Text style={s.sectionTitle}>Read & Inspire</Text>
        {ARTICLES.map((a) => (
          <View key={a.title} style={s.articleCard}>
            <View style={s.articleThumb}>
              <LinearGradient colors={["#1e3a8a", "#4338ca"]} style={s.articleThumbGrad}>
                <Ionicons name="document-text" size={32} color="rgba(255,255,255,0.5)" />
              </LinearGradient>
              <View style={s.articleTag}>
                <Text style={s.articleTagText}>{a.tag}</Text>
              </View>
            </View>
            <Text style={s.articleTitle}>{a.title}</Text>
            <View style={s.articleFooter}>
              <Text style={s.articleRead}>{a.read}</Text>
              <Ionicons name="bookmark-outline" size={18} color={colors.text.secondary} />
            </View>
          </View>
        ))}

        {/* Module-level links */}
        <Text style={s.sectionTitle}>Explore More</Text>
        <View style={s.exploreGrid}>
          {[
            { label: "Sleep", icon: "moon", route: "SleepDashboard", color: "#4338ca" },
            { label: "Fitness", icon: "barbell", route: "FitnessDashboard", color: "#1e3a8a" },
            { label: "Nutrition", icon: "nutrition", route: "NutritionDashboard", color: "#ea580c" },
            { label: "Family", icon: "people", route: "FamilyDashboard", color: "#d97706" },
            { label: "Medication", icon: "medical", route: "MedicationCenter", color: "#059669" },
            { label: "AI Coach", icon: "sparkles", route: "AICoach", color: "#8343f4" },
          ].map((e) => (
            <Pressable key={e.label} onPress={() => navigation.navigate(e.route as any)} style={[s.exploreCard, { backgroundColor: e.color }]}>
              <Ionicons name={e.icon as any} size={24} color="white" />
              <Text style={s.exploreLabel}>{e.label}</Text>
            </Pressable>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Nav */}
      <View style={s.navBar}>
        {NAV.map((n) => (
          <Pressable key={n.route} onPress={() => navigation.navigate(n.route as any)} style={[s.navBtn, n.active && s.navBtnActive]}>
            <Ionicons name={n.icon as any} size={22} color={n.active ? colors.onPrimary : colors.text.secondary} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface.dim },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", paddingHorizontal: 16, paddingTop: 52, paddingBottom: 12 },
  pageTitle: { fontSize: 28, fontWeight: "700", color: colors.text.primary },
  pageSub: { fontSize: 14, color: colors.text.secondary, marginTop: 4 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface.containerHigh, borderWidth: 1, borderColor: colors.glass.border, justifyContent: "center", alignItems: "center" },
  scroll: { paddingHorizontal: 16 },
  hero: { borderRadius: 36, padding: 24, marginBottom: 24, minHeight: 240, justifyContent: "flex-end", borderWidth: 1, borderColor: colors.glass.border },
  heroTag: { backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4, alignSelf: "flex-start", marginBottom: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.2)" },
  heroTagText: { fontSize: 11, fontWeight: "700", color: colors.secondaryFixed },
  heroTitle: { fontSize: 28, fontWeight: "700", color: "white", marginBottom: 8, lineHeight: 36 },
  heroSub: { fontSize: 14, color: "rgba(255,255,255,0.8)", marginBottom: 20 },
  heroBtn: { backgroundColor: colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 20, alignSelf: "flex-start" },
  heroBtnText: { color: colors.onPrimary, fontSize: 14, fontWeight: "700" },
  sectionTitle: { fontSize: 20, fontWeight: "700", color: colors.text.primary, marginBottom: 12 },
  categoryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 24 },
  categoryCard: { width: "47.5%", borderRadius: 30, padding: 20, minHeight: 160, justifyContent: "space-between", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  categoryLabel: { fontSize: 14, fontWeight: "700", color: "white", marginTop: 4 },
  categorySub: { fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 2 },
  urgentBadge: { backgroundColor: colors.error, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2, alignSelf: "flex-start", marginTop: 4 },
  urgentText: { fontSize: 10, fontWeight: "700", color: "white" },
  articleCard: { backgroundColor: colors.surface.containerHigh, borderRadius: 30, overflow: "hidden", marginBottom: 16, borderWidth: 1, borderColor: colors.glass.border },
  articleThumb: { height: 160, position: "relative" },
  articleThumbGrad: { flex: 1, justifyContent: "center", alignItems: "center" },
  articleTag: { position: "absolute", top: 12, left: 12, backgroundColor: "rgba(0,0,0,0.5)", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4, borderWidth: 1, borderColor: colors.glass.border },
  articleTagText: { fontSize: 11, fontWeight: "700", color: colors.secondary },
  articleTitle: { fontSize: 16, fontWeight: "700", color: colors.text.primary, padding: 16, lineHeight: 24 },
  articleFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingBottom: 16 },
  articleRead: { fontSize: 12, color: colors.text.secondary },
  exploreGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 8 },
  exploreCard: { width: "30%", borderRadius: 20, padding: 16, alignItems: "center", gap: 8, borderWidth: 1, borderColor: "rgba(255,255,255,0.15)" },
  exploreLabel: { fontSize: 11, color: "white", fontWeight: "600" },
  navBar: { position: "absolute", bottom: 0, left: 0, right: 0, flexDirection: "row", justifyContent: "space-around", alignItems: "center", height: 80, marginHorizontal: 16, marginBottom: 16, backgroundColor: colors.glass.background, borderRadius: 32, borderWidth: 1, borderColor: colors.glass.border },
  navBtn: { width: 48, height: 48, borderRadius: 24, justifyContent: "center", alignItems: "center" },
  navBtnActive: { backgroundColor: colors.primary },
});
