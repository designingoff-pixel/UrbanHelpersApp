import React, { useState, useEffect, useCallback } from "react";
import { ScrollView, Text, View, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/types";
import { colors } from "@/theme/colors";
import { getMeals, getDailyNutritionTotals, MealItem } from "@/services/healthLogService";

type Props = NativeStackScreenProps<RootStackParamList, "CaloriesDashboard">;

const DEFAULT_GOAL = 2200;

const NAV = [
  { icon: "home-outline", label: "Home", route: "HomeDashboard" },
  { icon: "heart-outline", label: "Health", route: "HealthDashboard" },
  { icon: "barbell", label: "Fitness", route: "FitnessDashboard", active: true },
  { icon: "person-outline", label: "Profile", route: "Profile" },
];

const MEAL_ICONS: Record<string, { icon: string; color: string }> = {
  breakfast: { icon: "sunny", color: "#f59e0b" },
  lunch: { icon: "restaurant", color: "#10b981" },
  snack: { icon: "cafe", color: "#8b5cf6" },
  dinner: { icon: "moon", color: "#2563eb" },
};

export default function CaloriesDashboardScreen({ navigation }: Props) {
  const [meals, setMeals] = useState<MealItem[]>([]);
  const [totals, setTotals] = useState({
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFat: 0,
  });

  const loadData = useCallback(async () => {
    try {
      const [todayMeals, nutritionTotals] = await Promise.all([
        getMeals(),
        getDailyNutritionTotals(),
      ]);
      setMeals(todayMeals);
      setTotals({
        totalCalories: nutritionTotals.totalCalories,
        totalProtein: Math.round(nutritionTotals.totalProtein),
        totalCarbs: Math.round(nutritionTotals.totalCarbs),
        totalFat: Math.round(nutritionTotals.totalFat),
      });
    } catch (e) {
      console.warn("Could not load calories data:", e);
    }
  }, []);

  useEffect(() => {
    loadData();
    const unsubscribe = navigation.addListener("focus", loadData);
    return unsubscribe;
  }, [navigation, loadData]);

  const consumed = totals.totalCalories;
  const goal = DEFAULT_GOAL;
  const remaining = Math.max(goal - consumed, 0);
  const pct = Math.min(consumed / goal, 1);

  const macros = [
    { label: "Carbs", value: totals.totalCarbs, total: 250, color: "#f59e0b" },
    { label: "Protein", value: totals.totalProtein, total: 120, color: "#10b981" },
    { label: "Fat", value: totals.totalFat, total: 65, color: "#e11d48" },
  ];

  return (
    <View style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} style={s.iconBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.text.secondary} />
        </Pressable>
        <Text style={s.headerTitle}>Calories</Text>
        <Pressable style={s.iconBtn} onPress={() => navigation.navigate("NutritionDashboard")}>
          <Ionicons name="add" size={22} color={colors.text.secondary} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {/* Hero ring */}
        <LinearGradient
          colors={["#ea580c", "#d97706", "#b45309"]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={s.hero}
        >
          <View style={s.heroLeft}>
            <Text style={s.heroLabel}>Today's Calories</Text>
            <Text style={s.heroValue}>{consumed.toLocaleString()}</Text>
            <Text style={s.heroGoal}>of {goal} kcal goal</Text>
            <View style={s.heroProgressBg}>
              <View style={[s.heroProgressFill, { width: `${Math.round(pct * 100)}%` }]} />
            </View>
            <Text style={s.heroRemaining}>{remaining} kcal remaining</Text>
          </View>
          <View style={s.heroRight}>
            <View style={s.ringOuter}>
              <View style={s.ringInner}>
                <Text style={s.ringPct}>{Math.round(pct * 100)}%</Text>
                <Text style={s.ringLabel}>Done</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Quick Stats */}
        <View style={s.statsRow}>
          {[
            { label: "Burned", value: "520", icon: "flame", color: "#ef4444" },
            { label: "Net", value: String(Math.max(consumed - 520, 0)), icon: "trending-up", color: "#10b981" },
            { label: "Logged", value: `${meals.length} meals`, icon: "restaurant", color: "#2563eb" },
          ].map((st) => (
            <View key={st.label} style={s.statCard}>
              <View style={[s.statIcon, { backgroundColor: `${st.color}22` }]}>
                <Ionicons name={st.icon as any} size={18} color={st.color} />
              </View>
              <Text style={s.statValue}>{st.value}</Text>
              <Text style={s.statLabel}>{st.label}</Text>
            </View>
          ))}
        </View>

        {/* Macros */}
        <Text style={s.sectionTitle}>Macronutrients</Text>
        <View style={s.macrosCard}>
          {macros.map((m) => (
            <View key={m.label} style={s.macroRow}>
              <Text style={s.macroLabel}>{m.label}</Text>
              <View style={s.macroBarBg}>
                <View style={[s.macroBarFill, { width: `${Math.min((m.value / m.total) * 100, 100)}%`, backgroundColor: m.color }]} />
              </View>
              <Text style={s.macroVal}>{m.value}g</Text>
            </View>
          ))}
        </View>

        {/* Meals */}
        <Text style={s.sectionTitle}>Today's Logged Meals ({meals.length})</Text>
        <View style={s.mealsList}>
          {meals.length === 0 ? (
            <View style={{ padding: 20, alignItems: "center" }}>
              <Ionicons name="fast-food-outline" size={32} color={colors.text.secondary} />
              <Text style={{ color: "#9ca3af", marginTop: 8, fontSize: 13 }}>No meals logged yet today</Text>
            </View>
          ) : (
            meals.map((m) => {
              const meta = MEAL_ICONS[m.mealType] || { icon: "restaurant", color: "#10b981" };
              return (
                <View key={m.id} style={s.mealRow}>
                  <View style={[s.mealIcon, { backgroundColor: `${meta.color}22` }]}>
                    <Ionicons name={meta.icon as any} size={20} color={meta.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.mealName}>{m.name}</Text>
                    <Text style={s.mealTime}>{m.time} • {m.mealType.toUpperCase()}</Text>
                  </View>
                  <Text style={[s.mealKcal, { color: meta.color }]}>{m.calories} kcal</Text>
                </View>
              );
            })
          )}
        </View>

        {/* Log Meal CTA */}
        <Pressable
          onPress={() => navigation.navigate("NutritionDashboard")}
          style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
        >
          <LinearGradient
            colors={["#ea580c", "#d97706"]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={s.ctaBtn}
          >
            <Ionicons name="add-circle-outline" size={22} color="white" />
            <Text style={s.ctaText}>Log a Meal</Text>
            <Ionicons name="arrow-forward" size={20} color="white" />
          </LinearGradient>
        </Pressable>

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
  headerTitle: { fontSize: 22, fontWeight: "700", color: "#ea580c" },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface.containerHigh, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: colors.glass.border },
  scroll: { paddingHorizontal: 16 },
  hero: { borderRadius: 32, padding: 24, marginBottom: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: 200 },
  heroLeft: { flex: 1 },
  heroLabel: { fontSize: 13, color: "rgba(255,255,255,0.8)", fontWeight: "600", marginBottom: 4 },
  heroValue: { fontSize: 44, fontWeight: "700", color: "white" },
  heroGoal: { fontSize: 13, color: "rgba(255,255,255,0.7)", marginBottom: 12 },
  heroProgressBg: { height: 8, backgroundColor: "rgba(255,255,255,0.25)", borderRadius: 4, width: "90%", marginBottom: 8 },
  heroProgressFill: { height: 8, backgroundColor: "white", borderRadius: 4 },
  heroRemaining: { fontSize: 12, color: "rgba(255,255,255,0.75)" },
  heroRight: { marginLeft: 16 },
  ringOuter: { width: 90, height: 90, borderRadius: 45, backgroundColor: "rgba(255,255,255,0.25)", justifyContent: "center", alignItems: "center" },
  ringInner: { width: 70, height: 70, borderRadius: 35, backgroundColor: "rgba(0,0,0,0.2)", justifyContent: "center", alignItems: "center" },
  ringPct: { fontSize: 22, fontWeight: "700", color: "white" },
  ringLabel: { fontSize: 10, color: "rgba(255,255,255,0.7)" },
  statsRow: { flexDirection: "row", gap: 12, marginBottom: 24 },
  statCard: { flex: 1, backgroundColor: colors.surface.containerHigh, borderRadius: 20, padding: 14, alignItems: "center", gap: 6, borderWidth: 1, borderColor: colors.glass.border },
  statIcon: { width: 36, height: 36, borderRadius: 18, justifyContent: "center", alignItems: "center" },
  statValue: { fontSize: 18, fontWeight: "700", color: colors.text.primary },
  statLabel: { fontSize: 11, color: colors.text.secondary },
  sectionTitle: { fontSize: 22, fontWeight: "700", color: colors.text.primary, marginBottom: 14 },
  macrosCard: { backgroundColor: colors.surface.containerHigh, borderRadius: 28, padding: 20, marginBottom: 24, gap: 14, borderWidth: 1, borderColor: colors.glass.border },
  macroRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  macroLabel: { width: 56, fontSize: 13, color: colors.text.secondary, fontWeight: "600" },
  macroBarBg: { flex: 1, height: 8, backgroundColor: colors.surface.containerHighest, borderRadius: 4, overflow: "hidden" },
  macroBarFill: { height: 8, borderRadius: 4 },
  macroVal: { width: 40, fontSize: 13, color: colors.text.primary, fontWeight: "700", textAlign: "right" },
  chartCard: { backgroundColor: colors.surface.containerHigh, borderRadius: 28, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: colors.glass.border },
  barChart: { flexDirection: "row", alignItems: "flex-end", height: 130, gap: 8, marginBottom: 8 },
  barWrap: { flex: 1, alignItems: "center", gap: 6 },
  bar: { width: "100%", borderRadius: 6, minHeight: 4 },
  barDay: { fontSize: 11, color: colors.text.secondary, fontWeight: "600" },
  chartGoalLine: { borderTopWidth: 1, borderTopColor: "rgba(234,88,12,0.3)", borderStyle: "dashed", paddingTop: 8 },
  chartGoalText: { fontSize: 11, color: "rgba(234,88,12,0.8)" },
  mealsList: { gap: 10, marginBottom: 16 },
  mealRow: { flexDirection: "row", alignItems: "center", backgroundColor: colors.surface.containerHigh, borderRadius: 20, padding: 14, gap: 12, borderWidth: 1, borderColor: colors.glass.border },
  mealIcon: { width: 44, height: 44, borderRadius: 22, justifyContent: "center", alignItems: "center" },
  mealName: { fontSize: 15, fontWeight: "700", color: colors.text.primary },
  mealTime: { fontSize: 12, color: colors.text.secondary, marginTop: 2 },
  mealKcal: { fontSize: 15, fontWeight: "700" },
  mealEdit: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.surface.containerHighest, justifyContent: "center", alignItems: "center" },
  ctaBtn: { borderRadius: 32, paddingVertical: 18, paddingHorizontal: 24, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 12 },
  ctaText: { fontSize: 17, fontWeight: "700", color: "white", flex: 1, textAlign: "center" },
  navBar: { position: "absolute", bottom: 0, left: 0, right: 0, height: 72, backgroundColor: colors.surface.container, borderTopWidth: 1, borderTopColor: colors.glass.border, flexDirection: "row", justifyContent: "space-around", alignItems: "center", paddingHorizontal: 8 },
  navBtn: { flex: 1, alignItems: "center", justifyContent: "center", gap: 4, paddingVertical: 8 },
  navLabel: { fontSize: 10, color: colors.text.secondary, fontWeight: "500" },
  navLabelActive: { color: colors.primary, fontWeight: "700" },
});
