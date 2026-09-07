import React, { useState, useEffect } from "react";
import {
  ScrollView,
  Text,
  View,
  Pressable,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/types";
import {
  MealItem,
  MealType,
  addMeal,
  getMeals,
  deleteMeal,
  getDailyNutritionTotals,
} from "@/services/healthLogService";

type Props = NativeStackScreenProps<RootStackParamList, "NutritionDashboard">;

const MEAL_TYPES: { type: MealType; label: string; icon: keyof typeof Ionicons.glyphMap; color: string }[] = [
  { type: "breakfast", label: "Breakfast", icon: "sunny", color: "#f59e0b" },
  { type: "lunch", label: "Lunch", icon: "restaurant", color: "#10b981" },
  { type: "dinner", label: "Dinner", icon: "moon", color: "#6366f1" },
  { type: "snack", label: "Snacks", icon: "cafe", color: "#ec4899" },
];

const PRESET_FOODS: { name: string; grams: number; calories: number; protein: number; carbs: number; fat: number; type: MealType }[] = [
  { name: "Oatmeal with Almonds", grams: 180, calories: 280, protein: 10, carbs: 42, fat: 8, type: "breakfast" },
  { name: "Boiled Eggs (2)", grams: 100, calories: 140, protein: 12, carbs: 1, fat: 10, type: "breakfast" },
  { name: "Brown Rice & Grilled Chicken", grams: 250, calories: 420, protein: 35, carbs: 45, fat: 9, type: "lunch" },
  { name: "Paneer Dal & Roti", grams: 220, calories: 380, protein: 18, carbs: 48, fat: 12, type: "lunch" },
  { name: "Mixed Green Salad", grams: 150, calories: 120, protein: 4, carbs: 12, fat: 6, type: "dinner" },
  { name: "Grilled Salmon & Quinoa", grams: 240, calories: 450, protein: 34, carbs: 32, fat: 16, type: "dinner" },
  { name: "Fresh Apple", grams: 150, calories: 95, protein: 0.5, carbs: 25, fat: 0.3, type: "snack" },
  { name: "Greek Yogurt & Berries", grams: 170, calories: 150, protein: 15, carbs: 18, fat: 2, type: "snack" },
];

export default function NutritionDashboardScreen({ navigation }: Props) {
  const [meals, setMeals] = useState<MealItem[]>([]);
  const [totals, setTotals] = useState<{
    totalCalories: number;
    totalProtein: number;
    totalCarbs: number;
    totalFat: number;
    byCategory: Record<MealType, { count: number; calories: number }>;
  }>({
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFat: 0,
    byCategory: {
      breakfast: { count: 0, calories: 0 },
      lunch: { count: 0, calories: 0 },
      dinner: { count: 0, calories: 0 },
      snack: { count: 0, calories: 0 },
    },
  });

  const [modalVisible, setModalVisible] = useState(false);
  const [mealType, setMealType] = useState<MealType>("breakfast");
  const [foodName, setFoodName] = useState("");
  const [grams, setGrams] = useState("150");
  const [calories, setCalories] = useState("250");
  const [protein, setProtein] = useState("10");
  const [carbs, setCarbs] = useState("30");
  const [fat, setFat] = useState("5");

  const CALORIE_BUDGET = 2000;

  const loadData = async () => {
    const list = await getMeals();
    const tot = await getDailyNutritionTotals();
    setMeals(list);
    setTotals(tot);
  };

  useEffect(() => {
    loadData();
  }, []);

  const openLogModalFor = (type: MealType) => {
    setMealType(type);
    setFoodName("");
    setGrams("150");
    setCalories("250");
    setProtein("10");
    setCarbs("30");
    setFat("5");
    setModalVisible(true);
  };

  const handleSaveMeal = async () => {
    if (!foodName.trim()) {
      Alert.alert("Missing Name", "Please enter what you ate.");
      return;
    }

    const cals = parseInt(calories, 10) || 0;
    const g = parseInt(grams, 10) || 0;
    const p = parseFloat(protein) || 0;
    const c = parseFloat(carbs) || 0;
    const f = parseFloat(fat) || 0;

    await addMeal({
      mealType,
      name: foodName.trim(),
      grams: g,
      calories: cals,
      protein: p,
      carbs: c,
      fat: f,
    });

    setModalVisible(false);
    await loadData();
  };

  const handleQuickAdd = async (preset: (typeof PRESET_FOODS)[0]) => {
    await addMeal({
      mealType: preset.type,
      name: preset.name,
      grams: preset.grams,
      calories: preset.calories,
      protein: preset.protein,
      carbs: preset.carbs,
      fat: preset.fat,
    });
    await loadData();
  };

  const handleDeleteMeal = async (id: string, name: string) => {
    Alert.alert("Delete Food", `Remove "${name}" from today's log?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          await deleteMeal(id);
          await loadData();
        },
      },
    ]);
  };

  const calPercent = Math.min(100, Math.round((totals.totalCalories / CALORIE_BUDGET) * 100));

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Header */}
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} style={s.iconBtn}>
          <Ionicons name="chevron-back" size={22} color="rgba(255,255,255,0.85)" />
        </Pressable>
        <Text style={s.pageTitle}>Food & Nutrition</Text>
        <Pressable onPress={() => openLogModalFor("breakfast")} style={s.iconBtn}>
          <Ionicons name="add" size={24} color="#f97316" />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {/* Calorie Card */}
        <LinearGradient
          colors={["#e05c00", "#ea580c", "#f97316"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.heroCard}
        >
          <View style={s.heroTop}>
            <View>
              <Text style={s.heroSubtitle}>CALORIES TODAY</Text>
              <Text style={s.heroCalories}>
                {totals.totalCalories.toLocaleString()}{" "}
                <Text style={s.heroCalorieGoal}>/ {CALORIE_BUDGET.toLocaleString()} kcal</Text>
              </Text>
            </View>
            <View style={s.calPercentCircle}>
              <Text style={s.calPercentText}>{calPercent}%</Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={s.progressBarTrack}>
            <View style={[s.progressBarFill, { width: `${calPercent}%` }]} />
          </View>

          {/* Macros Live */}
          <View style={s.macroRow}>
            <View style={s.macroCol}>
              <Text style={s.macroVal}>{Math.round(totals.totalCarbs)}g</Text>
              <Text style={s.macroLabel}>Carbs</Text>
            </View>
            <View style={s.macroDivider} />
            <View style={s.macroCol}>
              <Text style={s.macroVal}>{Math.round(totals.totalProtein)}g</Text>
              <Text style={s.macroLabel}>Protein</Text>
            </View>
            <View style={s.macroDivider} />
            <View style={s.macroCol}>
              <Text style={s.macroVal}>{Math.round(totals.totalFat)}g</Text>
              <Text style={s.macroLabel}>Fat</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Quick Add Presets */}
        <View style={s.presetHeader}>
          <Text style={s.sectionTitle}>Quick 1-Tap Add</Text>
          <Text style={s.presetSub}>Common healthy foods</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.presetScroll}>
          {PRESET_FOODS.map((item, idx) => (
            <Pressable key={idx} style={s.presetChip} onPress={() => handleQuickAdd(item)}>
              <Ionicons name="add-circle" size={16} color="#f97316" />
              <View>
                <Text style={s.presetChipName}>{item.name}</Text>
                <Text style={s.presetChipMeta}>
                  {item.grams}g · {item.calories} kcal
                </Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>

        {/* Meal Categories */}
        <Text style={[s.sectionTitle, { marginTop: 22, marginBottom: 12 }]}>Today's Meals</Text>

        {MEAL_TYPES.map((typeObj) => {
          const typeMeals = meals.filter((m) => m.mealType === typeObj.type);
          const typeCalories = totals.byCategory[typeObj.type]?.calories || 0;

          return (
            <View key={typeObj.type} style={s.mealGroupCard}>
              <View style={s.mealGroupHeader}>
                <View style={s.mealGroupTitleWrap}>
                  <View style={[s.mealTypeIconWrap, { backgroundColor: `${typeObj.color}20` }]}>
                    <Ionicons name={typeObj.icon} size={18} color={typeObj.color} />
                  </View>
                  <View>
                    <Text style={s.mealGroupTitle}>{typeObj.label}</Text>
                    <Text style={s.mealGroupCount}>
                      {typeMeals.length === 0 ? "No foods logged" : `${typeMeals.length} item(s)`}
                    </Text>
                  </View>
                </View>

                <View style={s.mealGroupRight}>
                  {typeCalories > 0 && <Text style={s.mealGroupKcal}>{typeCalories} kcal</Text>}
                  <Pressable
                    style={s.addMealBtn}
                    onPress={() => openLogModalFor(typeObj.type)}
                  >
                    <Ionicons name="add" size={20} color="#ffffff" />
                  </Pressable>
                </View>
              </View>

              {/* Logged Foods List */}
              {typeMeals.length > 0 ? (
                <View style={s.foodItemsList}>
                  {typeMeals.map((food) => (
                    <View key={food.id} style={s.foodRow}>
                      <View style={s.foodRowLeft}>
                        <Text style={s.foodRowName}>{food.name}</Text>
                        <Text style={s.foodRowMeta}>
                          {food.grams}g · P: {food.protein ?? 0}g · C: {food.carbs ?? 0}g · F: {food.fat ?? 0}g
                        </Text>
                      </View>
                      <View style={s.foodRowRight}>
                        <Text style={s.foodRowKcal}>{food.calories} kcal</Text>
                        <Pressable
                          onPress={() => handleDeleteMeal(food.id, food.name)}
                          style={s.foodDeleteBtn}
                        >
                          <Ionicons name="close-circle-outline" size={18} color="rgba(255,255,255,0.4)" />
                        </Pressable>
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <Pressable
                  style={s.emptyPrompt}
                  onPress={() => openLogModalFor(typeObj.type)}
                >
                  <Ionicons name="add-circle-outline" size={18} color="rgba(255,255,255,0.4)" />
                  <Text style={s.emptyPromptText}>Tap to log {typeObj.label.toLowerCase()}</Text>
                </Pressable>
              )}
            </View>
          );
        })}

        <View style={{ height: 60 }} />
      </ScrollView>

      {/* ── Log Food Modal ────────────────────────────────────────── */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Log Food</Text>
              <Pressable onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="rgba(255,255,255,0.7)" />
              </Pressable>
            </View>

            {/* Meal Type Picker */}
            <Text style={s.inputLabel}>Meal Type</Text>
            <View style={s.mealTypeRow}>
              {MEAL_TYPES.map((t) => (
                <Pressable
                  key={t.type}
                  onPress={() => setMealType(t.type)}
                  style={[s.typeTab, mealType === t.type && s.typeTabActive]}
                >
                  <Text style={[s.typeTabText, mealType === t.type && s.typeTabTextActive]}>
                    {t.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Food Name */}
            <Text style={s.inputLabel}>Food / Meal Name</Text>
            <TextInput
              style={s.input}
              placeholder="e.g. Grilled Chicken, Oats, Dal Roti"
              placeholderTextColor="rgba(255,255,255,0.3)"
              value={foodName}
              onChangeText={setFoodName}
            />

            {/* Grams & Calories */}
            <View style={s.inputRow}>
              <View style={{ flex: 1 }}>
                <Text style={s.inputLabel}>Portion (Grams)</Text>
                <TextInput
                  style={s.input}
                  placeholder="150"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  keyboardType="numeric"
                  value={grams}
                  onChangeText={setGrams}
                />
              </View>
              <View style={{ width: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={s.inputLabel}>Calories (kcal)</Text>
                <TextInput
                  style={s.input}
                  placeholder="250"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  keyboardType="numeric"
                  value={calories}
                  onChangeText={setCalories}
                />
              </View>
            </View>

            {/* Macros Row */}
            <View style={s.inputRow}>
              <View style={{ flex: 1 }}>
                <Text style={s.inputLabel}>Protein (g)</Text>
                <TextInput
                  style={s.input}
                  placeholder="10"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  keyboardType="numeric"
                  value={protein}
                  onChangeText={setProtein}
                />
              </View>
              <View style={{ width: 8 }} />
              <View style={{ flex: 1 }}>
                <Text style={s.inputLabel}>Carbs (g)</Text>
                <TextInput
                  style={s.input}
                  placeholder="30"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  keyboardType="numeric"
                  value={carbs}
                  onChangeText={setCarbs}
                />
              </View>
              <View style={{ width: 8 }} />
              <View style={{ flex: 1 }}>
                <Text style={s.inputLabel}>Fat (g)</Text>
                <TextInput
                  style={s.input}
                  placeholder="5"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  keyboardType="numeric"
                  value={fat}
                  onChangeText={setFat}
                />
              </View>
            </View>

            <Pressable style={s.saveMealBtn} onPress={handleSaveMeal}>
              <Text style={s.saveMealBtnText}>Save to Log</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0c0e12" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 52,
    paddingBottom: 14,
  },
  pageTitle: { fontSize: 22, fontWeight: "700", color: "#ffffff" },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.08)",
    justifyContent: "center",
    alignItems: "center",
  },
  scroll: { paddingHorizontal: 16, paddingTop: 6 },

  // Hero Card
  heroCard: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
  },
  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  heroSubtitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "rgba(255,255,255,0.8)",
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  heroCalories: {
    fontSize: 28,
    fontWeight: "800",
    color: "#ffffff",
  },
  heroCalorieGoal: {
    fontSize: 14,
    fontWeight: "500",
    color: "rgba(255,255,255,0.8)",
  },
  calPercentCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.4)",
  },
  calPercentText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#ffffff",
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: "rgba(0,0,0,0.25)",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 18,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 4,
  },
  macroRow: {
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.18)",
    borderRadius: 16,
    paddingVertical: 10,
    alignItems: "center",
  },
  macroCol: {
    flex: 1,
    alignItems: "center",
  },
  macroVal: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
  },
  macroLabel: {
    fontSize: 11,
    color: "rgba(255,255,255,0.75)",
    marginTop: 2,
  },
  macroDivider: {
    width: 1,
    height: 24,
    backgroundColor: "rgba(255,255,255,0.2)",
  },

  // Presets
  presetHeader: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ffffff",
  },
  presetSub: {
    fontSize: 12,
    color: "rgba(255,255,255,0.5)",
    marginTop: 2,
  },
  presetScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  presetChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#181a20",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  presetChipName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#ffffff",
  },
  presetChipMeta: {
    fontSize: 11,
    color: "rgba(255,255,255,0.5)",
    marginTop: 1,
  },

  // Meal Groups
  mealGroupCard: {
    backgroundColor: "#181a20",
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  mealGroupHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  mealGroupTitleWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  mealTypeIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
  },
  mealGroupTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
  },
  mealGroupCount: {
    fontSize: 12,
    color: "rgba(255,255,255,0.5)",
    marginTop: 1,
  },
  mealGroupRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  mealGroupKcal: {
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
  },
  addMealBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
  emptyPrompt: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    marginTop: 10,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 12,
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  emptyPromptText: {
    fontSize: 13,
    color: "rgba(255,255,255,0.5)",
  },
  foodItemsList: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
    paddingTop: 8,
    gap: 8,
  },
  foodRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  foodRowLeft: {
    flex: 1,
  },
  foodRowName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ffffff",
  },
  foodRowMeta: {
    fontSize: 11,
    color: "rgba(255,255,255,0.5)",
    marginTop: 2,
  },
  foodRowRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  foodRowKcal: {
    fontSize: 13,
    fontWeight: "700",
    color: "#f97316",
  },
  foodDeleteBtn: {
    padding: 2,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#181a20",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    maxHeight: "88%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#ffffff",
  },
  mealTypeRow: {
    flexDirection: "row",
    backgroundColor: "#22252e",
    borderRadius: 14,
    padding: 4,
    marginBottom: 12,
  },
  typeTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: "center",
  },
  typeTabActive: {
    backgroundColor: "#f97316",
  },
  typeTabText: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(255,255,255,0.6)",
  },
  typeTabTextActive: {
    color: "#ffffff",
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(255,255,255,0.6)",
    marginBottom: 6,
    marginTop: 8,
  },
  input: {
    backgroundColor: "#22252e",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#ffffff",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  inputRow: {
    flexDirection: "row",
  },
  saveMealBtn: {
    backgroundColor: "#f97316",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 22,
    marginBottom: 10,
  },
  saveMealBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#ffffff",
  },
});
