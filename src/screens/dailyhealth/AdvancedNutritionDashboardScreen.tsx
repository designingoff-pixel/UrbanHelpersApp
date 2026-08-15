import React, { useState } from "react";
import { ScrollView, Text, View, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/types";
import { colors } from "@/theme/colors";

type Props = NativeStackScreenProps<RootStackParamList, "AdvancedNutritionDashboard">;

const MEALS = [
  { name: "Oatmeal Bowl", time: "8:00 AM", kcal: 380, protein: 12, carbs: 68, fat: 8, icon: "sunny", color: "#f59e0b" },
  { name: "Grilled Chicken Salad", time: "1:00 PM", kcal: 520, protein: 42, carbs: 28, fat: 18, icon: "restaurant", color: "#10b981" },
  { name: "Banana & Almonds", time: "4:30 PM", kcal: 210, protein: 6, carbs: 32, fat: 9, icon: "nutrition", color: "#8b5cf6" },
  { name: "Salmon & Veggies", time: "7:30 PM", kcal: 640, protein: 48, carbs: 34, fat: 24, icon: "moon", color: "#2563eb" },
];

const MACROS = [
  { label: "Protein", consumed: 108, target: 150, color: "#10b981", unit: "g" },
  { label: "Carbs", consumed: 162, target: 200, color: "#f59e0b", unit: "g" },
  { label: "Fat", consumed: 59, target: 65, color: "#e11d48", unit: "g" },
  { label: "Fibre", consumed: 18, target: 30, color: "#8b5cf6", unit: "g" },
];

const NUTRIENTS = [
  { name: "Vitamin D", value: 85, color: "#f59e0b" },
  { name: "Iron", value: 62, color: "#e11d48" },
  { name: "Calcium", value: 74, color: "#2563eb" },
  { name: "Omega-3", value: 90, color: "#10b981" },
  { name: "Magnesium", value: 55, color: "#8b5cf6" },
];

const FILTER_TABS = ["All", "Breakfast", "Lunch", "Snack", "Dinner"];

// Per docs: AdvancedNutrition bottom nav is unlabelled — using sensible wellness nav
const NAV = [
  { icon: "home-outline", label: "Home", route: "HomeDashboard" },
  { icon: "heart-outline", label: "Health", route: "HealthDashboard" },
  { icon: "add-circle", label: "Log", route: "AdvancedNutritionDashboard", active: true },
  { icon: "restaurant-outline", label: "Nutrition", route: "NutritionDashboard" },
  { icon: "person-outline", label: "Profile", route: "Profile" },
];

export default function AdvancedNutritionDashboardScreen({ navigation }: Props) {
  const [activeFilter, setActiveFilter] = useState(0);

  const totalKcal = MEALS.reduce((s, m) => s + m.kcal, 0);
  const kcalGoal = 2200;
  const kcalPct = totalKcal / kcalGoal;
  const remaining = kcalGoal - totalKcal;

  return (
    <View style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} style={s.iconBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.text.secondary} />
        </Pressable>
        <Text style={s.headerTitle}>Nutrition</Text>
        <View style={s.headerRight}>
          <Pressable style={s.iconBtn}>
            <Ionicons name="search-outline" size={22} color={colors.text.secondary} />
          </Pressable>
          <Pressable style={s.iconBtn}>
            <Ionicons name="add" size={22} color={colors.text.secondary} />
          </Pressable>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {/* Hero */}
        <LinearGradient
          colors={["#ea580c", "#d97706", "#92400e"]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={s.hero}
        >
          <View style={s.heroLeft}>
            <View style={s.heroBadge}>
              <Ionicons name="nutrition" size={14} color="white" />
              <Text style={s.heroBadgeText}>ADVANCED NUTRITION</Text>
            </View>
            <Text style={s.heroTitle}>Today's{"\n"}Nutrition</Text>
            <Text style={s.heroSub}>Detailed breakdown of your daily intake.</Text>
          </View>
          {/* Calorie ring */}
          <View style={s.heroRing}>
            <View style={s.heroRingOuter}>
              <View style={s.heroRingInner}>
                <Text style={s.ringValue}>{totalKcal}</Text>
                <Text style={s.ringLabel}>kcal</Text>
                <Text style={s.ringGoal}>of {kcalGoal}</Text>
              </View>
            </View>
            <Text style={s.ringRemaining}>{remaining} left</Text>
          </View>
        </LinearGradient>

        {/* Quick Stats */}
        <View style={s.statsRow}>
          {[
            { label: "Burned", value: "480", icon: "flame", color: "#ef4444" },
            { label: "Net", value: String(totalKcal - 480), icon: "trending-up", color: "#10b981" },
            { label: "Water", value: "1.8L", icon: "water", color: "#2563eb" },
            { label: "Meals", value: "4", icon: "restaurant", color: "#f59e0b" },
          ].map((st) => (
            <View key={st.label} style={s.statCard}>
              <View style={[s.statIcon, { backgroundColor: `${st.color}22` }]}>
                <Ionicons name={st.icon as any} size={16} color={st.color} />
              </View>
              <Text style={s.statValue}>{st.value}</Text>
              <Text style={s.statLabel}>{st.label}</Text>
            </View>
          ))}
        </View>

        {/* Macronutrients */}
        <Text style={s.sectionTitle}>Macronutrients</Text>
        <View style={s.macrosCard}>
          <View style={s.macrosBars}>
            {MACROS.map((m) => (
              <View key={m.label} style={s.macroItem}>
                <View style={s.macroBarVert}>
                  <LinearGradient
                    colors={[m.color, `${m.color}88`]}
                    start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
                    style={[s.macroBarVertFill, { height: `${(m.consumed / m.target) * 100}%` as any }]}
                  />
                </View>
                <Text style={[s.macroValue, { color: m.color }]}>{m.consumed}{m.unit}</Text>
                <Text style={s.macroLabel}>{m.label}</Text>
              </View>
            ))}
          </View>
          <View style={s.macrosLegend}>
            {MACROS.map((m) => (
              <View key={m.label} style={s.legendRow}>
                <View style={[s.legendDot, { backgroundColor: m.color }]} />
                <Text style={s.legendLabel}>{m.label}</Text>
                <View style={s.legendBarBg}>
                  <View style={[s.legendBarFill, { width: `${(m.consumed / m.target) * 100}%`, backgroundColor: m.color }]} />
                </View>
                <Text style={s.legendPct}>{Math.round((m.consumed / m.target) * 100)}%</Text>
              </View>
            ))}
          </View>
        </View>

        {/* AI Nutritionist */}
        <View style={s.aiCard}>
          <View style={s.aiHeader}>
            <Ionicons name="sparkles" size={18} color={colors.tertiary} />
            <Text style={s.aiTitle}>AI Nutritionist</Text>
          </View>
          <Text style={s.aiText}>
            Great protein intake today! You're slightly low on fibre — consider adding leafy greens or legumes to your next meal.
          </Text>
          <View style={s.aiActions}>
            <Pressable
              onPress={() => navigation.navigate("AICoach")}
              style={s.aiBtn}
            >
              <Text style={s.aiBtnText}>Get Full Analysis</Text>
              <Ionicons name="arrow-forward" size={14} color={colors.primary} />
            </Pressable>
            <Pressable style={s.aiSuggestBtn}>
              <Ionicons name="restaurant-outline" size={16} color={colors.text.secondary} />
              <Text style={s.aiSuggestText}>Suggest Meal</Text>
            </Pressable>
          </View>
        </View>

        {/* Nutrient Completeness */}
        <Text style={s.sectionTitle}>Nutrient Completeness</Text>
        <View style={s.nutrientsCard}>
          {NUTRIENTS.map((n) => (
            <View key={n.name} style={s.nutrientRow}>
              <Text style={s.nutrientName}>{n.name}</Text>
              <View style={s.nutrientBarBg}>
                <LinearGradient
                  colors={[n.color, `${n.color}99`]}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={[s.nutrientBarFill, { width: `${n.value}%` }]}
                />
              </View>
              <Text style={[s.nutrientPct, { color: n.color }]}>{n.value}%</Text>
            </View>
          ))}
        </View>

        {/* Meal Filter + Log */}
        <View style={s.mealHeader}>
          <Text style={s.sectionTitle}>Meal Log</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={s.filterRow}>
              {FILTER_TABS.map((t, i) => (
                <Pressable
                  key={t}
                  onPress={() => setActiveFilter(i)}
                  style={[s.filterTab, activeFilter === i && s.filterTabActive]}
                >
                  <Text style={[s.filterTabText, activeFilter === i && s.filterTabTextActive]}>{t}</Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>
        <View style={s.mealsList}>
          {MEALS.map((m) => (
            <View key={m.name} style={s.mealCard}>
              <View style={[s.mealIcon, { backgroundColor: `${m.color}22` }]}>
                <Ionicons name={m.icon as any} size={22} color={m.color} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={s.mealTopRow}>
                  <Text style={s.mealName}>{m.name}</Text>
                  <Text style={[s.mealKcal, { color: m.color }]}>{m.kcal} kcal</Text>
                </View>
                <Text style={s.mealTime}>{m.time}</Text>
                <View style={s.mealMacros}>
                  <Text style={s.mealMacroItem}>P: {m.protein}g</Text>
                  <Text style={s.mealMacroItem}>C: {m.carbs}g</Text>
                  <Text style={s.mealMacroItem}>F: {m.fat}g</Text>
                </View>
              </View>
              <Pressable style={s.mealEditBtn}>
                <Ionicons name="create-outline" size={18} color={colors.text.secondary} />
              </Pressable>
            </View>
          ))}
        </View>

        {/* Log Meal CTA */}
        <Pressable style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}>
          <LinearGradient
            colors={["#ea580c", "#d97706"]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={s.ctaBtn}
          >
            <Ionicons name="add-circle-outline" size={22} color="white" />
            <Text style={s.ctaText}>Log Another Meal</Text>
            <Ionicons name="arrow-forward" size={20} color="white" />
          </LinearGradient>
        </Pressable>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Nav */}
      <View style={s.navBar}>
        {NAV.map((n) => (
          <Pressable
            key={n.label}
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
  headerTitle: { fontSize: 22, fontWeight: "700", color: "#ea580c" },
  headerRight: { flexDirection: "row", gap: 4 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface.containerHigh, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: colors.glass.border },
  scroll: { paddingHorizontal: 16 },
  hero: { borderRadius: 32, padding: 24, marginBottom: 20, flexDirection: "row", alignItems: "center", minHeight: 220, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  heroLeft: { flex: 1 },
  heroBadge: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(0,0,0,0.2)", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, alignSelf: "flex-start", marginBottom: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.15)" },
  heroBadgeText: { fontSize: 10, fontWeight: "700", color: "rgba(255,255,255,0.9)", letterSpacing: 0.5 },
  heroTitle: { fontSize: 32, fontWeight: "700", color: "white", lineHeight: 40, marginBottom: 8 },
  heroSub: { fontSize: 14, color: "rgba(255,255,255,0.8)" },
  heroRing: { alignItems: "center", gap: 8 },
  heroRingOuter: { width: 110, height: 110, borderRadius: 55, borderWidth: 6, borderColor: "rgba(255,255,255,0.4)", justifyContent: "center", alignItems: "center" },
  heroRingInner: { width: 88, height: 88, borderRadius: 44, backgroundColor: "rgba(0,0,0,0.2)", justifyContent: "center", alignItems: "center" },
  ringValue: { fontSize: 24, fontWeight: "700", color: "white" },
  ringLabel: { fontSize: 12, color: "rgba(255,255,255,0.8)" },
  ringGoal: { fontSize: 10, color: "rgba(255,255,255,0.6)" },
  ringRemaining: { fontSize: 11, color: "rgba(255,255,255,0.8)", fontWeight: "600" },
  statsRow: { flexDirection: "row", gap: 8, marginBottom: 24 },
  statCard: { flex: 1, backgroundColor: colors.surface.containerHigh, borderRadius: 18, padding: 12, alignItems: "center", gap: 4, borderWidth: 1, borderColor: colors.glass.border },
  statIcon: { width: 32, height: 32, borderRadius: 16, justifyContent: "center", alignItems: "center" },
  statValue: { fontSize: 15, fontWeight: "700", color: colors.text.primary },
  statLabel: { fontSize: 9, color: colors.text.secondary, textAlign: "center" },
  sectionTitle: { fontSize: 20, fontWeight: "700", color: colors.text.primary, marginBottom: 14 },
  macrosCard: { backgroundColor: colors.surface.containerHigh, borderRadius: 30, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: colors.glass.border },
  macrosBars: { flexDirection: "row", justifyContent: "space-around", height: 120, alignItems: "flex-end", marginBottom: 20 },
  macroItem: { alignItems: "center", gap: 6, flex: 1 },
  macroBarVert: { width: 28, height: 100, backgroundColor: colors.surface.containerHighest, borderRadius: 14, overflow: "hidden", justifyContent: "flex-end" },
  macroBarVertFill: { width: "100%", borderRadius: 14 },
  macroValue: { fontSize: 13, fontWeight: "700" },
  macroLabel: { fontSize: 10, color: colors.text.secondary },
  macrosLegend: { gap: 10 },
  legendRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendLabel: { width: 52, fontSize: 12, color: colors.text.secondary },
  legendBarBg: { flex: 1, height: 6, backgroundColor: colors.surface.containerHighest, borderRadius: 3, overflow: "hidden" },
  legendBarFill: { height: 6, borderRadius: 3 },
  legendPct: { width: 36, fontSize: 12, fontWeight: "700", color: colors.text.primary, textAlign: "right" },
  aiCard: { backgroundColor: colors.glass.background, borderRadius: 30, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: colors.glass.border },
  aiHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
  aiTitle: { fontSize: 18, fontWeight: "700", color: colors.text.primary },
  aiText: { fontSize: 14, color: colors.text.secondary, lineHeight: 22, marginBottom: 14 },
  aiActions: { flexDirection: "row", gap: 10 },
  aiBtn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(180,197,255,0.1)", borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, borderWidth: 1, borderColor: "rgba(180,197,255,0.2)" },
  aiBtnText: { fontSize: 13, color: colors.primary, fontWeight: "600" },
  aiSuggestBtn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: colors.surface.containerHighest, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10 },
  aiSuggestText: { fontSize: 13, color: colors.text.secondary },
  nutrientsCard: { backgroundColor: colors.surface.containerHigh, borderRadius: 30, padding: 20, marginBottom: 20, gap: 12, borderWidth: 1, borderColor: colors.glass.border },
  nutrientRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  nutrientName: { width: 80, fontSize: 13, color: colors.text.secondary, fontWeight: "500" },
  nutrientBarBg: { flex: 1, height: 8, backgroundColor: colors.surface.containerHighest, borderRadius: 4, overflow: "hidden" },
  nutrientBarFill: { height: 8, borderRadius: 4 },
  nutrientPct: { width: 36, fontSize: 12, fontWeight: "700", textAlign: "right" },
  mealHeader: { marginBottom: 14 },
  filterRow: { flexDirection: "row", gap: 8, marginTop: 8 },
  filterTab: { backgroundColor: colors.surface.containerHighest, paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20 },
  filterTabActive: { backgroundColor: "#ea580c" },
  filterTabText: { fontSize: 12, color: colors.text.secondary },
  filterTabTextActive: { color: "white", fontWeight: "700" },
  mealsList: { gap: 10, marginBottom: 16 },
  mealCard: { flexDirection: "row", alignItems: "center", backgroundColor: colors.surface.containerHigh, borderRadius: 22, padding: 14, gap: 12, borderWidth: 1, borderColor: colors.glass.border },
  mealIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: "center", alignItems: "center" },
  mealTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  mealName: { fontSize: 15, fontWeight: "700", color: colors.text.primary },
  mealKcal: { fontSize: 14, fontWeight: "700" },
  mealTime: { fontSize: 12, color: colors.text.secondary, marginTop: 2 },
  mealMacros: { flexDirection: "row", gap: 10, marginTop: 4 },
  mealMacroItem: { fontSize: 11, color: colors.text.muted, fontWeight: "500" },
  mealEditBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surface.containerHighest, justifyContent: "center", alignItems: "center" },
  ctaBtn: { borderRadius: 32, paddingVertical: 18, paddingHorizontal: 24, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 12 },
  ctaText: { fontSize: 16, fontWeight: "700", color: "white", flex: 1, textAlign: "center" },
  navBar: { position: "absolute", bottom: 0, left: 0, right: 0, height: 72, backgroundColor: colors.surface.container, borderTopWidth: 1, borderTopColor: colors.glass.border, flexDirection: "row", justifyContent: "space-around", alignItems: "center", paddingHorizontal: 8 },
  navBtn: { flex: 1, alignItems: "center", justifyContent: "center", gap: 4, paddingVertical: 8 },
  navLabel: { fontSize: 10, color: colors.text.secondary, fontWeight: "500" },
  navLabelActive: { color: colors.primary, fontWeight: "700" },
});
