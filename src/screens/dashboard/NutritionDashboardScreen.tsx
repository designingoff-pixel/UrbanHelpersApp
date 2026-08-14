import React from "react";
import { ScrollView, Text, View, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/types";
import { colors } from "@/theme/colors";

type Props = NativeStackScreenProps<RootStackParamList, "NutritionDashboard">;

const MEALS = [
  { label: "Breakfast", kcal: "350 kcal", protein: 15, carbs: 45, fat: 12, progress: 40, barColor: colors.primary, bg: "#1e293b" },
  { label: "Lunch", kcal: "650 kcal", protein: 45, carbs: 30, fat: 25, progress: 70, barColor: colors.secondary, bg: "#064e3b" },
  { label: "Dinner", kcal: "-- kcal", protein: 0, carbs: 0, fat: 0, progress: 0, barColor: colors.surface.containerHighest, bg: "#0f172a" },
  { label: "Snacks", kcal: "450 kcal", protein: 10, carbs: 50, fat: 15, progress: 30, barColor: colors.tertiary, bg: "#4c1d95" },
];

export default function NutritionDashboardScreen({ navigation }: Props) {
  return (
    <View style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} style={s.iconBtn}>
          <Ionicons name="menu-outline" size={20} color={colors.text.secondary} />
        </Pressable>
        <Text style={s.pageTitle}>Nutrition</Text>
        <Pressable style={s.iconBtn}>
          <Ionicons name="search-outline" size={20} color={colors.primary} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {/* Hero */}
        <LinearGradient colors={["#FF8C00", "#E65100"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.hero}>
          <View style={s.heroContent}>
            <Text style={s.heroTitle}>Eat Better Every Day</Text>
            <Text style={s.heroSub}>Track your meals, discover healthy recipes, and achieve your wellness goals.</Text>
            <Pressable onPress={() => navigation.navigate("AdvancedNutritionDashboard")} style={s.heroBtn}>
              <Ionicons name="add" size={16} color="white" />
              <Text style={s.heroBtnText}>Log Meal</Text>
            </Pressable>
          </View>
        </LinearGradient>

        {/* Calorie Summary */}
        <View style={s.calorieSummary}>
          <View style={s.calorieCard}>
            <Text style={s.calorieLabel}>Today's Calories</Text>
            <Text style={s.calorieValue}>1,450 <Text style={s.calorieSeparator}>/ 2,200</Text></Text>
            <View style={s.progressBar}>
              <View style={[s.progressFill, { width: "65%" }]} />
            </View>
          </View>
          <View style={s.macroCard}>
            <Text style={s.macroTitle}>Macros</Text>
            {[
              { label: "Protein", value: 70, max: 150, color: colors.primary },
              { label: "Carbs", value: 125, max: 250, color: colors.secondary },
              { label: "Fat", value: 52, max: 75, color: "#f97316" },
            ].map((m) => (
              <View key={m.label} style={s.macroRow}>
                <Text style={s.macroLabel}>{m.label}</Text>
                <View style={s.macroBar}>
                  <View style={[s.macroBarFill, { width: `${(m.value / m.max) * 100}%`, backgroundColor: m.color }]} />
                </View>
                <Text style={[s.macroVal, { color: m.color }]}>{m.value}g</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Today's Meals */}
        <View style={s.mealsHeader}>
          <Text style={s.sectionTitle}>Today's Meals</Text>
          <Text style={s.kcalTotal}>1,450 / 2,200 kcal</Text>
        </View>
        <View style={s.mealsGrid}>
          {MEALS.map((m) => (
            <View key={m.label} style={[s.mealCard, { backgroundColor: m.bg }]}>
              <View style={s.mealThumb}>
                <Ionicons name="restaurant" size={28} color="rgba(255,255,255,0.3)" />
              </View>
              <View style={s.mealInfo}>
                <View style={s.mealTitleRow}>
                  <Text style={s.mealLabel}>{m.label}</Text>
                  <Text style={s.mealKcal}>{m.kcal}</Text>
                </View>
                {m.progress > 0 ? (
                  <>
                    <View style={s.mealBar}>
                      <View style={[s.mealBarFill, { width: `${m.progress}%`, backgroundColor: m.barColor }]} />
                    </View>
                    <View style={s.macrosRow}>
                      <Text style={s.macroMini}>P: {m.protein}g</Text>
                      <Text style={s.macroMini}>C: {m.carbs}g</Text>
                      <Text style={s.macroMini}>F: {m.fat}g</Text>
                    </View>
                  </>
                ) : (
                  <Text style={s.logPrompt}>Tap to log meal</Text>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Hydration Tracker */}
        <Text style={s.sectionTitle}>Hydration</Text>
        <Pressable onPress={() => navigation.navigate("HydrationDashboard")}>
          <LinearGradient colors={["#1e3a8a", "#0c1d2c"]} style={s.hydrationCard}>
            <View style={s.hydrationInfo}>
              <Text style={s.hydrationValue}>1.5 / 2.5 <Text style={s.hydrationUnit}>Liters</Text></Text>
              <View style={s.hydrationBar}>
                <View style={[s.hydrationBarFill, { width: "60%" }]} />
              </View>
              <Text style={s.hydrationPercent}>60% of daily goal</Text>
            </View>
            <View style={s.hydrationIcon}>
              <Ionicons name="water" size={48} color={colors.secondary} />
            </View>
          </LinearGradient>
        </Pressable>

        {/* Advanced Nutrition Link */}
        <Pressable onPress={() => navigation.navigate("AdvancedNutritionDashboard")} style={s.advancedLink}>
          <Ionicons name="analytics" size={20} color={colors.tertiary} />
          <Text style={s.advancedLinkText}>View Advanced Nutrition Breakdown</Text>
          <Ionicons name="arrow-forward" size={16} color={colors.text.secondary} />
        </Pressable>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#071827" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingTop: 52, paddingBottom: 16 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface.containerHigh, borderWidth: 1, borderColor: colors.glass.border, justifyContent: "center", alignItems: "center" },
  pageTitle: { fontSize: 20, fontWeight: "700", color: colors.text.primary },
  scroll: { paddingHorizontal: 16 },
  hero: { borderRadius: 30, padding: 24, marginBottom: 20, minHeight: 200, justifyContent: "flex-end", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  heroContent: {},
  heroTitle: { fontSize: 28, fontWeight: "700", color: "white", marginBottom: 8 },
  heroSub: { fontSize: 14, color: "rgba(255,255,255,0.9)", marginBottom: 20 },
  heroBtn: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: colors.surface.dim, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 30, alignSelf: "flex-start" },
  heroBtnText: { color: colors.primary, fontSize: 14, fontWeight: "700" },
  calorieSummary: { flexDirection: "row", gap: 12, marginBottom: 20 },
  calorieCard: { flex: 1, backgroundColor: colors.surface.container, borderRadius: 24, padding: 16, borderWidth: 1, borderColor: colors.glass.border },
  calorieLabel: { fontSize: 12, color: colors.text.secondary, marginBottom: 8 },
  calorieValue: { fontSize: 22, fontWeight: "700", color: colors.text.primary, marginBottom: 12 },
  calorieSeparator: { fontSize: 16, color: colors.text.secondary, fontWeight: "400" },
  progressBar: { height: 6, backgroundColor: colors.surface.containerHighest, borderRadius: 3, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 3, backgroundColor: colors.primary },
  macroCard: { flex: 1, backgroundColor: colors.surface.container, borderRadius: 24, padding: 16, borderWidth: 1, borderColor: colors.glass.border },
  macroTitle: { fontSize: 14, fontWeight: "700", color: colors.text.primary, marginBottom: 12 },
  macroRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
  macroLabel: { fontSize: 11, color: colors.text.secondary, width: 44 },
  macroBar: { flex: 1, height: 6, backgroundColor: colors.surface.containerHighest, borderRadius: 3, overflow: "hidden" },
  macroBarFill: { height: "100%", borderRadius: 3 },
  macroVal: { fontSize: 11, fontWeight: "700", width: 32, textAlign: "right" },
  mealsHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  sectionTitle: { fontSize: 20, fontWeight: "700", color: colors.text.primary, marginBottom: 12 },
  kcalTotal: { fontSize: 14, color: colors.primary, fontWeight: "600" },
  mealsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 20 },
  mealCard: { width: "47%", borderRadius: 20, padding: 12, flexDirection: "column", borderWidth: 1, borderColor: "rgba(255,255,255,0.05)" },
  mealThumb: { width: 56, height: 56, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.1)", justifyContent: "center", alignItems: "center", marginBottom: 10 },
  mealInfo: { flex: 1 },
  mealTitleRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  mealLabel: { fontSize: 16, fontWeight: "700", color: colors.text.primary },
  mealKcal: { fontSize: 12, color: colors.text.secondary },
  mealBar: { height: 6, backgroundColor: colors.surface.containerHighest, borderRadius: 3, overflow: "hidden", marginBottom: 6 },
  mealBarFill: { height: "100%", borderRadius: 3 },
  macrosRow: { flexDirection: "row", justifyContent: "space-between" },
  macroMini: { fontSize: 10, color: colors.text.secondary },
  logPrompt: { fontSize: 12, color: colors.text.secondary, fontStyle: "italic" },
  hydrationCard: { borderRadius: 30, padding: 24, marginBottom: 20, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  hydrationInfo: { flex: 1 },
  hydrationValue: { fontSize: 24, fontWeight: "700", color: colors.text.primary, marginBottom: 12 },
  hydrationUnit: { fontSize: 16, color: colors.text.secondary, fontWeight: "400" },
  hydrationBar: { height: 6, backgroundColor: colors.surface.containerHighest, borderRadius: 3, overflow: "hidden", marginBottom: 8, width: "80%" },
  hydrationBarFill: { height: "100%", borderRadius: 3, backgroundColor: colors.secondary },
  hydrationPercent: { fontSize: 12, color: colors.secondary },
  hydrationIcon: { opacity: 0.8 },
  advancedLink: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: colors.surface.containerHigh, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.glass.border },
  advancedLinkText: { flex: 1, fontSize: 14, fontWeight: "600", color: colors.text.primary },
});
