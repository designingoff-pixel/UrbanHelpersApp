import React, { useState, useEffect } from "react";
import {
  ScrollView,
  Text,
  View,
  Pressable,
  StyleSheet,
  Modal,
  TextInput,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/types";
import {
  getMeals,
  addMeal,
  deleteMeal,
  getDailyNutritionTotals,
  MealItem,
  MealType,
} from "@/services/healthLogService";

type Props = NativeStackScreenProps<RootStackParamList, "NutritionDashboard">;

const { width: SW } = Dimensions.get("window");

// Standard Food Database for realistic search & logging
interface FoodDefinition {
  id: string;
  name: string;
  brand?: string;
  calories: number;
  unit: string;
  grams: number;
  carbs: number;
  fat: number;
  protein: number;
  satFat: number;
  cholesterol: number;
  sodium: number;
  fibre: number;
  sugars: number;
  vitaminA: number;
  vitaminC: number;
  calcium: number;
  iron: number;
  potassium: number;
}

const FOOD_DATABASE: FoodDefinition[] = [
  {
    id: "idli_std",
    name: "Idli",
    calories: 40,
    unit: "piece (30 g)",
    grams: 30,
    carbs: 7.8,
    fat: 0.1,
    protein: 1.9,
    satFat: 0,
    cholesterol: 0,
    sodium: 207,
    fibre: 1.5,
    sugars: 0.2,
    vitaminA: 0,
    vitaminC: 0.3,
    calcium: 7.8,
    iron: 0.98,
    potassium: 63,
  },
  {
    id: "idli_mccain",
    name: "Idli (McCain)",
    calories: 500,
    unit: "serving (180 g)",
    grams: 180,
    carbs: 94.0,
    fat: 2.5,
    protein: 14.0,
    satFat: 0.5,
    cholesterol: 0,
    sodium: 480,
    fibre: 4.2,
    sugars: 1.0,
    vitaminA: 0,
    vitaminC: 0,
    calcium: 20,
    iron: 2.1,
    potassium: 150,
  },
  {
    id: "idli_mtr_rice",
    name: "Rice Idli (MTR)",
    calories: 340,
    unit: "serving (100 g)",
    grams: 100,
    carbs: 68.0,
    fat: 1.8,
    protein: 11.2,
    satFat: 0.3,
    cholesterol: 0,
    sodium: 410,
    fibre: 3.5,
    sugars: 0.8,
    vitaminA: 0,
    vitaminC: 0.5,
    calcium: 15,
    iron: 1.8,
    potassium: 120,
  },
  {
    id: "idli_mtr_oats",
    name: "Oats Idli (MTR)",
    calories: 395,
    unit: "serving (100 g)",
    grams: 100,
    carbs: 64.0,
    fat: 7.5,
    protein: 13.5,
    satFat: 1.2,
    cholesterol: 0,
    sodium: 520,
    fibre: 6.8,
    sugars: 1.2,
    vitaminA: 20,
    vitaminC: 1.0,
    calcium: 45,
    iron: 2.8,
    potassium: 210,
  },
  {
    id: "idli_batter_mtr",
    name: "Idli Batter (MTR)",
    calories: 127,
    unit: "serving (100 g)",
    grams: 100,
    carbs: 26.0,
    fat: 0.4,
    protein: 4.2,
    satFat: 0.1,
    cholesterol: 0,
    sodium: 190,
    fibre: 1.2,
    sugars: 0.3,
    vitaminA: 0,
    vitaminC: 0.2,
    calcium: 8,
    iron: 0.9,
    potassium: 75,
  },
  {
    id: "idli_rava_mtr",
    name: "Rava Idli (MTR)",
    calories: 388,
    unit: "serving (100 g)",
    grams: 100,
    carbs: 67.0,
    fat: 8.2,
    protein: 10.4,
    satFat: 2.1,
    cholesterol: 5,
    sodium: 490,
    fibre: 3.1,
    sugars: 1.4,
    vitaminA: 15,
    vitaminC: 0.4,
    calcium: 32,
    iron: 2.2,
    potassium: 140,
  },
  {
    id: "idli_homemade",
    name: "Rice Idli (Hommade)",
    calories: 62,
    unit: "serving (50 g)",
    grams: 50,
    carbs: 13.0,
    fat: 0.2,
    protein: 2.4,
    satFat: 0,
    cholesterol: 0,
    sodium: 110,
    fibre: 0.9,
    sugars: 0.2,
    vitaminA: 0,
    vitaminC: 0.1,
    calcium: 6,
    iron: 0.7,
    potassium: 45,
  },
  {
    id: "biryani_chicken",
    name: "Chicken Biryani",
    calories: 348,
    unit: "plate (250 g)",
    grams: 250,
    carbs: 42.0,
    fat: 12.0,
    protein: 18.0,
    satFat: 3.5,
    cholesterol: 45,
    sodium: 680,
    fibre: 2.2,
    sugars: 1.8,
    vitaminA: 60,
    vitaminC: 4.2,
    calcium: 35,
    iron: 2.5,
    potassium: 280,
  },
  {
    id: "chapati_std",
    name: "Chapati",
    calories: 68,
    unit: "piece (40 g)",
    grams: 40,
    carbs: 14.2,
    fat: 0.4,
    protein: 2.6,
    satFat: 0.1,
    cholesterol: 0,
    sodium: 85,
    fibre: 2.1,
    sugars: 0.4,
    vitaminA: 0,
    vitaminC: 0,
    calcium: 12,
    iron: 1.1,
    potassium: 82,
  },
];

// Meal Categories exactly matching Samsung Health Food page
const MEAL_CATEGORIES: { key: MealType; title: string; defaultKcal: number }[] = [
  { key: "breakfast", title: "Breakfast", defaultKcal: 40 },
  { key: "lunch", title: "Lunch", defaultKcal: 348 },
  { key: "dinner", title: "Dinner", defaultKcal: 68 },
  { key: "snack", title: "Morning snack", defaultKcal: 0 },
  { key: "snack", title: "Afternoon snack", defaultKcal: 0 },
  { key: "snack", title: "Evening snack", defaultKcal: 0 },
];

export default function NutritionDashboardScreen({ navigation }: Props) {
  // Navigation day
  const [selectedDayOffset, setSelectedDayOffset] = useState(0); // 0 = Today, -1 = Thu 10 Sept, etc.

  // Real logged meals & metrics from healthLogService
  const [meals, setMeals] = useState<MealItem[]>([]);
  const [nutritionTotals, setNutritionTotals] = useState({
    totalCalories: 456,
    totalCarbs: 68.8,
    totalFat: 10.5,
    totalProtein: 20.1,
  });

  // Modal states for full logging flow
  const [activeMealCategory, setActiveMealCategory] = useState<{ title: string; key: MealType }>({
    title: "Breakfast",
    key: "breakfast",
  });
  const [showMealChooser, setShowMealChooser] = useState(false);
  const [activeChooserTab, setActiveChooserTab] = useState<"Favourites" | "My foods" | "My meals">("Favourites");

  // Search modal state
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFood, setSelectedFood] = useState<FoodDefinition | null>(null);

  // Portion size modal state
  const [showPortionModal, setShowPortionModal] = useState(false);
  const [portionRatio, setPortionRatio] = useState(1.0);
  const [isFavorite, setIsFavorite] = useState(false);

  // Meal review modal state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [stagedFoods, setStagedFoods] = useState<
    { food: FoodDefinition; quantity: number }[]
  >([]);

  const loadData = async () => {
    try {
      const storedMeals = await getMeals();
      const totals = await getDailyNutritionTotals();
      setMeals(storedMeals);

      if (totals.totalCalories > 0) {
        setNutritionTotals({
          totalCalories: totals.totalCalories,
          totalCarbs: Math.round(totals.totalCarbs * 10) / 10,
          totalFat: Math.round(totals.totalFat * 10) / 10,
          totalProtein: Math.round(totals.totalProtein * 10) / 10,
        });
      }
    } catch (e) {
      console.log("Error loading nutrition totals:", e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Open logging flow for a given meal category
  const startLoggingForMeal = (category: { title: string; key: MealType }) => {
    setActiveMealCategory(category);
    setShowMealChooser(true);
  };

  // Select food from search -> opens Portion size modal
  const handleSelectFood = (food: FoodDefinition) => {
    setSelectedFood(food);
    setPortionRatio(1.0);
    setShowSearchModal(false);
    setShowPortionModal(true);
  };

  // Save portion size -> stages food into review screen
  const handleSavePortion = () => {
    if (!selectedFood) return;
    setStagedFoods([{ food: selectedFood, quantity: portionRatio }]);
    setShowPortionModal(false);
    setShowMealChooser(false);
    setShowReviewModal(true);
  };

  // Done in review screen -> commits to healthLogService
  const handleDoneLogging = async () => {
    try {
      for (const item of stagedFoods) {
        const food = item.food;
        const mult = item.quantity;
        await addMeal({
          mealType: activeMealCategory.key,
          name: food.name,
          grams: Math.round(food.grams * mult),
          calories: Math.round(food.calories * mult),
          protein: Math.round(food.protein * mult * 10) / 10,
          carbs: Math.round(food.carbs * mult * 10) / 10,
          fat: Math.round(food.fat * mult * 10) / 10,
        });
      }
      await loadData();
      setShowReviewModal(false);
    } catch (err) {
      console.log("Error adding meal:", err);
      setShowReviewModal(false);
    }
  };

  // Calculate current dynamic macro percentages
  const totalMacrosWeight =
    nutritionTotals.totalCarbs + nutritionTotals.totalFat + nutritionTotals.totalProtein || 1;
  const carbPct = Math.round((nutritionTotals.totalCarbs / totalMacrosWeight) * 100);
  const fatPct = Math.round((nutritionTotals.totalFat / totalMacrosWeight) * 100);
  const proteinPct = Math.max(100 - carbPct - fatPct, 0);

  // Filter food search
  const filteredFoods = FOOD_DATABASE.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={s.root}>
      {/* Top Header */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <Pressable onPress={() => navigation.goBack()} style={s.backBtn}>
            <Ionicons name="chevron-back" size={24} color="#ffffff" />
          </Pressable>
          <Text style={s.headerTitle}>Food</Text>
        </View>
        <View style={s.headerRight}>
          <Pressable style={s.iconBtn}>
            <Ionicons name="bar-chart-outline" size={22} color="#ffffff" />
          </Pressable>
          <Pressable style={s.iconBtn}>
            <Ionicons name="ellipsis-vertical" size={20} color="#ffffff" />
          </Pressable>
        </View>
      </View>

      {/* Date Switcher */}
      <View style={s.dateSwitcherRow}>
        <Pressable
          style={s.arrowBtn}
          onPress={() => setSelectedDayOffset((v) => v - 1)}
        >
          <Ionicons name="chevron-back" size={18} color="rgba(255,255,255,0.7)" />
        </Pressable>
        <View style={s.datePill}>
          <Text style={s.datePillText}>
            {selectedDayOffset === 0
              ? "Today"
              : selectedDayOffset === -1
              ? "Thu, 10 Sept"
              : "Past Date"}
          </Text>
        </View>
        <Pressable
          style={s.arrowBtn}
          onPress={() => setSelectedDayOffset((v) => Math.min(v + 1, 0))}
        >
          <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.7)" />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {/* 1. Calorie Summary Card (Screenshot 1 & 11) */}
        <View style={s.calorieCard}>
          <View style={s.calTopRow}>
            <View>
              <Text style={s.calBigNumber}>{nutritionTotals.totalCalories}</Text>
              <Text style={s.calUnit}>kcal</Text>
            </View>

            <View style={s.calTargetsCol}>
              <View style={s.targetRow}>
                <Ionicons name="disc-outline" size={18} color="rgba(255,255,255,0.85)" />
                <Text style={s.targetText}>1,633 kcal</Text>
              </View>
              <View style={s.targetRow}>
                <Ionicons name="ellipse-outline" size={18} color="rgba(255,255,255,0.7)" />
                <Text style={s.targetText}>1,469 - 1,796</Text>
              </View>
            </View>
          </View>

          {/* Horizontal Progress Gauge Bar (0 to 2,122) */}
          <View style={s.gaugeWrap}>
            <View style={s.gaugeTrack}>
              {/* Green current intake fill */}
              <View
                style={[
                  s.gaugeFillGreen,
                  { width: `${Math.min((nutritionTotals.totalCalories / 2122) * 100, 100)}%` },
                ]}
              />
              {/* Hatched target range (1469 to 1796) */}
              <View style={s.targetHatchRange} />
              {/* Target pointer icon */}
              <View style={s.targetMarkerIcon}>
                <Ionicons name="disc-outline" size={14} color="#ffffff" />
              </View>
            </View>
            <View style={s.gaugeLabels}>
              <Text style={s.gaugeLabelText}>0</Text>
              <Text style={s.gaugeLabelText}>2,122</Text>
            </View>
          </View>
        </View>

        {/* 2. Nutrition Info Card (Carb, Fat, Protein + Actual vs Recommended) */}
        <View style={s.nutriInfoCard}>
          <View style={s.nutriHeaderRow}>
            <Text style={s.nutriTitle}>Nutrition info</Text>
            <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.7)" />
          </View>

          {/* 3 Rounded Nutrient Boxes */}
          <View style={s.macroBoxesRow}>
            <View style={s.macroBox}>
              <Text style={s.macroBoxTitle}>Carb</Text>
              <Text style={s.macroBoxVal}>
                {nutritionTotals.totalCarbs}
                <Text style={s.macroBoxUnit}> g</Text>
              </Text>
            </View>
            <View style={s.macroBox}>
              <Text style={s.macroBoxTitle}>Fat</Text>
              <Text style={s.macroBoxVal}>
                {nutritionTotals.totalFat}
                <Text style={s.macroBoxUnit}> g</Text>
              </Text>
            </View>
            <View style={s.macroBox}>
              <Text style={s.macroBoxTitle}>Protein</Text>
              <Text style={s.macroBoxVal}>
                {nutritionTotals.totalProtein}
                <Text style={s.macroBoxUnit}> g</Text>
              </Text>
            </View>
          </View>

          {/* Actual Macro Ratio Bar */}
          <Text style={s.ratioLabel}>Actual</Text>
          <View style={s.ratioLabelsRow}>
            <Text style={s.ratioNum}>{carbPct}%</Text>
            <Text style={s.ratioNum}>{fatPct}%</Text>
            <Text style={s.ratioNum}>{proteinPct}%</Text>
          </View>
          <View style={s.ratioBarWrap}>
            <View style={[s.barCarb, { flex: carbPct || 61 }]} />
            <View style={[s.barFat, { flex: fatPct || 21 }]} />
            <View style={[s.barProtein, { flex: proteinPct || 18 }]} />
          </View>

          {/* Recommended Macro Ratio Bar */}
          <View style={[s.ratioLabelsRow, { marginTop: 14 }]}>
            <Text style={s.ratioNumMuted}>55%</Text>
            <Text style={s.ratioNumMuted}>25%</Text>
            <Text style={s.ratioNumMuted}>20%</Text>
          </View>
          <Text style={s.recommendedLabel}>Recommended</Text>
        </View>

        {/* 3. Log Meal Card (6 Meal Categories) */}
        <View style={s.logMealCard}>
          <Text style={s.logMealCardTitle}>Log meal</Text>

          {MEAL_CATEGORIES.map((cat, idx) => {
            // Find logged items matching this category
            const loggedForMeal = meals.filter((m) => m.mealType === cat.key);
            const mealCalories = loggedForMeal.length > 0
              ? loggedForMeal.reduce((sum, item) => sum + item.calories, 0)
              : (selectedDayOffset === 0 && cat.defaultKcal > 0 ? cat.defaultKcal : 0);

            const loggedFoodNames = loggedForMeal.length > 0
              ? loggedForMeal.map((m) => m.name).join(", ")
              : (cat.title === "Breakfast" && mealCalories === 40 ? "Idli" : cat.title === "Lunch" && mealCalories === 348 ? "Chicken Biryani" : cat.title === "Dinner" && mealCalories === 68 ? "Chapati" : "");

            return (
              <View key={`${cat.title}-${idx}`}>
                <Pressable
                  style={s.mealItemRow}
                  onPress={() => startLoggingForMeal(cat)}
                >
                  {/* Left Kcal circular badge */}
                  <View style={s.mealKcalBadge}>
                    <Text style={s.mealKcalVal}>{mealCalories}</Text>
                    <Text style={s.mealKcalUnit}>kcal</Text>
                  </View>

                  {/* Meal Title & logged foods subtitle */}
                  <View style={s.mealInfoWrap}>
                    <Text style={s.mealName}>{cat.title}</Text>
                    {loggedFoodNames.length > 0 && (
                      <Text style={s.mealSubFoods} numberOfLines={1}>
                        {loggedFoodNames}
                      </Text>
                    )}
                  </View>

                  {/* Divider line before plus */}
                  <View style={s.mealDividerV} />

                  {/* Plus button */}
                  <Pressable
                    style={s.mealPlusBtn}
                    onPress={() => startLoggingForMeal(cat)}
                  >
                    <Ionicons name="add" size={24} color="rgba(255,255,255,0.9)" />
                  </Pressable>
                </Pressable>
                {idx < MEAL_CATEGORIES.length - 1 && <View style={s.mealRowDivider} />}
              </View>
            );
          })}
        </View>

        {/* 4. Calorie intake over last 7 days */}
        <View style={s.trendCard}>
          <View style={s.trendHeaderRow}>
            <Text style={s.trendTitle}>Calorie intake over last 7 days</Text>
            <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.7)" />
          </View>

          <View style={s.trendBody}>
            {/* Dotted target line */}
            <View style={s.dottedLine} />
            <View style={s.avgBadge}>
              <Text style={s.avgBadgeText}>Avg.{"\n"}1,633</Text>
            </View>

            {/* Timeline */}
            <View style={s.timelineRow}>
              {[
                { day: "5", isSun: false, isToday: false },
                { day: "6", isSun: true, isToday: false },
                { day: "7", isSun: false, isToday: false },
                { day: "8", isSun: false, isToday: false },
                { day: "9", isSun: false, isToday: false },
                { day: "10", isSun: false, isToday: false },
                { day: "11", isSun: false, isToday: true },
              ].map((item, i) => (
                <View key={i} style={s.dayCol}>
                  <View style={s.dotSlot}>
                    {item.isToday && <View style={s.greenDot} />}
                  </View>
                  <Text
                    style={[
                      s.dayLabel,
                      item.isSun && { color: "#ef4444" },
                      item.isToday && { color: "#ffffff", fontWeight: "700" },
                    ]}
                  >
                    {item.day}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>

      {/* ─────────────────────────────────────────────────────────────
          FLOW MODAL 1: Meal Chooser Screen (Search vs Add calories)
          ───────────────────────────────────────────────────────────── */}
      <Modal visible={showMealChooser} animationType="slide">
        <View style={s.subScreenRoot}>
          {/* Sub-screen header */}
          <View style={s.header}>
            <View style={s.headerLeft}>
              <Pressable onPress={() => setShowMealChooser(false)} style={s.backBtn}>
                <Ionicons name="chevron-back" size={24} color="#ffffff" />
              </Pressable>
              <Text style={s.headerTitle}>{activeMealCategory.title}</Text>
            </View>
            <Pressable style={s.iconBtn}>
              <Ionicons name="ellipsis-vertical" size={20} color="#ffffff" />
            </Pressable>
          </View>

          {/* Action Chooser Card */}
          <View style={s.chooserCard}>
            <Text style={s.chooserCardAdvice}>
              Choose how you want to log this meal.
            </Text>
            <View style={s.chooserBtnRow}>
              <Pressable
                style={s.actionBigBtn}
                onPress={() => setShowSearchModal(true)}
              >
                <Ionicons name="search" size={24} color="#ffffff" />
                <Text style={s.actionBigText}>Search</Text>
              </Pressable>

              <Pressable
                style={s.actionBigBtn}
                onPress={() => setShowSearchModal(true)}
              >
                <Ionicons name="flame" size={24} color="#ffffff" />
                <Text style={s.actionBigText}>Add calories</Text>
              </Pressable>
            </View>
          </View>

          {/* Chooser Tabs: Favourites | My foods | My meals */}
          <View style={s.chooserTabRow}>
            {(["Favourites", "My foods", "My meals"] as const).map((tab) => (
              <Pressable
                key={tab}
                onPress={() => setActiveChooserTab(tab)}
                style={[
                  s.chooserTabPill,
                  activeChooserTab === tab && s.chooserTabPillActive,
                ]}
              >
                <Text
                  style={[
                    s.chooserTabText,
                    activeChooserTab === tab && s.chooserTabTextActive,
                  ]}
                >
                  {tab}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Tab Content Empty / Quick Add */}
          <View style={s.tabEmptyWrap}>
            {activeChooserTab === "Favourites" && (
              <Text style={s.emptyStateText}>No favourite foods</Text>
            )}

            {activeChooserTab === "My foods" && (
              <View style={s.myFoodsEmptyWrap}>
                <Text style={s.myFoodsTitle}>
                  Log meals faster by adding foods that you eat often.
                </Text>
                <Pressable
                  style={s.addFoodPillBtn}
                  onPress={() => setShowSearchModal(true)}
                >
                  <Text style={s.addFoodPillText}>Add food</Text>
                </Pressable>
              </View>
            )}

            {activeChooserTab === "My meals" && (
              <Text style={s.emptyStateText}>No custom meals saved yet.</Text>
            )}
          </View>
        </View>
      </Modal>

      {/* ─────────────────────────────────────────────────────────────
          FLOW MODAL 2: Food Search Screen
          ───────────────────────────────────────────────────────────── */}
      <Modal visible={showSearchModal} animationType="fade">
        <View style={s.subScreenRoot}>
          <View style={s.header}>
            <View style={s.headerLeft}>
              <Pressable onPress={() => setShowSearchModal(false)} style={s.backBtn}>
                <Ionicons name="chevron-back" size={24} color="#ffffff" />
              </Pressable>
              <Text style={s.headerTitle}>{activeMealCategory.title}</Text>
            </View>
            <Pressable style={s.iconBtn}>
              <Ionicons name="ellipsis-vertical" size={20} color="#ffffff" />
            </Pressable>
          </View>

          {/* Filters Card */}
          <View style={s.filtersCard}>
            <Text style={s.filtersHeading}>Filters</Text>
            <View style={s.filterChipsRow}>
              <View style={s.filterChip}><Text style={s.filterChipText}>Recently added</Text></View>
              <View style={s.filterChip}><Text style={s.filterChipText}>Frequently added</Text></View>
            </View>
            <View style={s.filterChipsRow}>
              <View style={s.filterChip}><Text style={s.filterChipText}>Favourites</Text></View>
              <View style={s.filterChip}><Text style={s.filterChipText}>My foods</Text></View>
              <View style={s.filterChip}><Text style={s.filterChipText}>My meals</Text></View>
            </View>
          </View>

          {/* Search results list */}
          <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}>
            {filteredFoods.map((food) => (
              <Pressable
                key={food.id}
                style={s.foodSearchRow}
                onPress={() => handleSelectFood(food)}
              >
                <View style={s.foodRadioCircle} />
                <View style={s.foodTextWrap}>
                  <Text style={s.foodSearchName}>{food.name}</Text>
                  <Text style={s.foodSearchSub}>
                    {food.calories} kcal, {food.unit}
                  </Text>
                </View>
              </Pressable>
            ))}
          </ScrollView>

          {/* Bottom Floating Search Bar */}
          <View style={s.floatingSearchBox}>
            <TextInput
              style={s.floatingSearchInput}
              placeholder="Search for food"
              placeholderTextColor="rgba(255,255,255,0.4)"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery("")}>
                <Ionicons name="close-circle" size={18} color="rgba(255,255,255,0.6)" />
              </Pressable>
            )}
            <Ionicons name="mic" size={20} color="rgba(255,255,255,0.7)" />
          </View>
        </View>
      </Modal>

      {/* ─────────────────────────────────────────────────────────────
          FLOW MODAL 3: Set Portion Size & Full Nutrition Facts Table
          ───────────────────────────────────────────────────────────── */}
      <Modal visible={showPortionModal} animationType="slide">
        <View style={s.subScreenRoot}>
          {/* Header */}
          <View style={s.header}>
            <View style={s.headerLeft}>
              <Pressable onPress={() => setShowPortionModal(false)} style={s.backBtn}>
                <Ionicons name="chevron-back" size={24} color="#ffffff" />
              </Pressable>
              <Text style={s.headerTitle}>Set portion size</Text>
            </View>
          </View>

          <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 110 }}>
            {selectedFood && (
              <>
                {/* 1. Portion Adjustment Card */}
                <View style={s.portionCard}>
                  <View style={s.portionCardTop}>
                    <View>
                      <Text style={s.portionFoodName}>{selectedFood.name}</Text>
                      <Text style={s.portionFoodKcal}>
                        {Math.round(selectedFood.calories * portionRatio)} kcal
                      </Text>
                    </View>
                    <Pressable onPress={() => setIsFavorite(!isFavorite)}>
                      <Ionicons
                        name={isFavorite ? "star" : "star-outline"}
                        size={24}
                        color={isFavorite ? "#f59e0b" : "rgba(255,255,255,0.5)"}
                      />
                    </Pressable>
                  </View>

                  {/* Bubble & Slider */}
                  <View style={s.sliderBubbleWrap}>
                    <View style={s.bubblePill}>
                      <Text style={s.bubbleText}>{portionRatio}</Text>
                    </View>
                  </View>

                  {/* Visual Step Slider */}
                  <View style={s.sliderRow}>
                    {[0.5, 1.0, 1.5, 2.0].map((step) => (
                      <Pressable
                        key={step}
                        onPress={() => setPortionRatio(step)}
                        style={s.stepWrap}
                      >
                        <View
                          style={[
                            s.stepDot,
                            portionRatio === step && s.stepDotActive,
                          ]}
                        />
                        <Text
                          style={[
                            s.stepText,
                            portionRatio === step && s.stepTextActive,
                          ]}
                        >
                          {step.toFixed(1)}
                        </Text>
                      </Pressable>
                    ))}
                  </View>

                  {/* Unit dropdown row */}
                  <View style={s.unitDropdownRow}>
                    <Text style={s.unitDropdownText}>{selectedFood.unit}</Text>
                    <Ionicons name="caret-down" size={14} color="rgba(255,255,255,0.7)" />
                  </View>

                  <Text style={s.portionSubText}>Select unit and set intake amount.</Text>
                </View>

                {/* 2. Macronutrients & Official Nutrition Facts Table */}
                <View style={s.macroDetailCard}>
                  <Text style={s.macroDetailTitle}>Macronutrients</Text>

                  {/* Legend: ● Carb  ● Fat  ● Protein */}
                  <View style={s.macroLegendRow}>
                    <View style={s.legendItem}>
                      <View style={[s.legendDot, { backgroundColor: "#06b6d4" }]} />
                      <Text style={s.legendText}>Carb</Text>
                    </View>
                    <View style={s.legendItem}>
                      <View style={[s.legendDot, { backgroundColor: "#f59e0b" }]} />
                      <Text style={s.legendText}>Fat</Text>
                    </View>
                    <View style={s.legendItem}>
                      <View style={[s.legendDot, { backgroundColor: "#eab308" }]} />
                      <Text style={s.legendText}>Protein</Text>
                    </View>
                  </View>

                  {/* Segmented Bar */}
                  <View style={s.portionBarWrap}>
                    <View style={[s.portionBarCarb, { flex: 79 }]} />
                    <View style={[s.portionBarFat, { flex: 2 }]} />
                    <View style={[s.portionBarProtein, { flex: 19 }]} />
                  </View>
                  <View style={s.portionBarPercents}>
                    <Text style={s.portionPercentText}>79%</Text>
                    <Text style={s.portionPercentText}>2% 19%</Text>
                  </View>

                  {/* Official Nutrition Facts Table */}
                  <View style={s.factsTable}>
                    <View style={s.factRowBorder}>
                      <Text style={s.factBold}>Serving size</Text>
                      <Text style={s.factBold}>{portionRatio} {selectedFood.unit}</Text>
                    </View>
                    <View style={s.factRowBorderThick}>
                      <Text style={s.factHeader}>Amount per serving</Text>
                    </View>
                    <View style={s.factRowCalories}>
                      <Text style={s.factCalTitle}>Calories</Text>
                      <Text style={s.factCalVal}>
                        {Math.round(selectedFood.calories * portionRatio)}
                      </Text>
                    </View>
                    <View style={s.factRowRight}>
                      <Text style={s.factDailyValHeader}>% Daily Values*</Text>
                    </View>

                    {/* Table items */}
                    <View style={s.factRow}>
                      <Text style={s.factBold}>Total fat <Text style={s.factNormal}>{(selectedFood.fat * portionRatio).toFixed(1)} g</Text></Text>
                      <Text style={s.factBold}>0 %</Text>
                    </View>
                    <View style={s.factSubRow}>
                      <Text style={s.factNormal}>Saturated Fat {(selectedFood.satFat * portionRatio).toFixed(1)} g</Text>
                      <Text style={s.factBold}>0 %</Text>
                    </View>
                    <View style={s.factRow}>
                      <Text style={s.factBold}>Cholesterol <Text style={s.factNormal}>{(selectedFood.cholesterol * portionRatio).toFixed(0)} mg</Text></Text>
                      <Text style={s.factBold}>0 %</Text>
                    </View>
                    <View style={s.factRow}>
                      <Text style={s.factBold}>Sodium <Text style={s.factNormal}>{Math.round(selectedFood.sodium * portionRatio)} mg</Text></Text>
                      <Text style={s.factBold}>9 %</Text>
                    </View>
                    <View style={s.factRow}>
                      <Text style={s.factBold}>Total carbohydrate <Text style={s.factNormal}>{(selectedFood.carbs * portionRatio).toFixed(1)} g</Text></Text>
                      <Text style={s.factBold}>3 %</Text>
                    </View>
                    <View style={s.factSubRow}>
                      <Text style={s.factNormal}>Dietary Fibre {(selectedFood.fibre * portionRatio).toFixed(1)} g</Text>
                      <Text style={s.factBold}>5 %</Text>
                    </View>
                    <View style={s.factSubRow}>
                      <Text style={s.factNormal}>Total sugars {(selectedFood.sugars * portionRatio).toFixed(1)} g</Text>
                      <Text style={s.factNormal}></Text>
                    </View>
                    <View style={s.factRowBorderThickTop}>
                      <Text style={s.factBold}>Protein <Text style={s.factNormal}>{(selectedFood.protein * portionRatio).toFixed(1)} g</Text></Text>
                      <Text style={s.factBold}></Text>
                    </View>

                    {/* Vitamins */}
                    <View style={s.factRow}>
                      <Text style={s.factNormal}>Vitamin A {selectedFood.vitaminA} mcg</Text>
                      <Text style={s.factBold}>0 %</Text>
                    </View>
                    <View style={s.factRow}>
                      <Text style={s.factNormal}>Vitamin C {selectedFood.vitaminC} mg</Text>
                      <Text style={s.factBold}>0 %</Text>
                    </View>
                    <View style={s.factRow}>
                      <Text style={s.factNormal}>Calcium {selectedFood.calcium} mg</Text>
                      <Text style={s.factBold}>1 %</Text>
                    </View>
                    <View style={s.factRow}>
                      <Text style={s.factNormal}>Iron {selectedFood.iron} mg</Text>
                      <Text style={s.factBold}>5 %</Text>
                    </View>
                    <View style={s.factRow}>
                      <Text style={s.factNormal}>Potassium {selectedFood.potassium} mg</Text>
                      <Text style={s.factBold}>1 %</Text>
                    </View>

                    <Text style={s.factFootnote}>
                      * Percent Daily Values are based on a 2000 kcal diet. Your daily values may be higher or lower depending on your calorie needs.
                    </Text>
                  </View>
                </View>
              </>
            )}
          </ScrollView>

          {/* Floating Cancel / Save Buttons */}
          <View style={s.portionFloatBtnWrap}>
            <View style={s.portionFloatBtnPill}>
              <Pressable style={s.portionHalfBtn} onPress={() => setShowPortionModal(false)}>
                <Text style={s.portionBtnText}>Cancel</Text>
              </Pressable>
              <View style={s.portionBtnDiv} />
              <Pressable style={s.portionHalfBtn} onPress={handleSavePortion}>
                <Text style={[s.portionBtnText, { fontWeight: "700" }]}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* ─────────────────────────────────────────────────────────────
          FLOW MODAL 4: Log Meal Review & Save Screen
          ───────────────────────────────────────────────────────────── */}
      <Modal visible={showReviewModal} animationType="slide">
        <View style={s.subScreenRoot}>
          {/* Header */}
          <View style={s.header}>
            <View style={s.headerLeft}>
              <Pressable onPress={() => setShowReviewModal(false)} style={s.backBtn}>
                <Ionicons name="chevron-back" size={24} color="#ffffff" />
              </Pressable>
              <Text style={s.headerTitle}>Log meal</Text>
            </View>
          </View>

          <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}>
            {/* Meal Selector Dropdown */}
            <View style={s.reviewMealSelectRow}>
              <Text style={s.reviewMealTitle}>{activeMealCategory.title}</Text>
              <Ionicons name="caret-down" size={16} color="rgba(255,255,255,0.7)" />
            </View>

            {/* Time Pill */}
            <View style={s.reviewTimePill}>
              <Text style={s.reviewTimeText}>8:00 am</Text>
            </View>

            {/* Total Calories Banner Card */}
            <View style={s.reviewTotalCard}>
              <View style={{ flex: 1 }}>
                <Text style={s.reviewTotalKcal}>
                  Total calories:{" "}
                  {stagedFoods.reduce(
                    (sum, item) => sum + Math.round(item.food.calories * item.quantity),
                    0
                  )}{" "}
                  kcal
                </Text>
                <Text style={s.reviewTotalMacros}>
                  Carb{" "}
                  {stagedFoods.reduce(
                    (sum, item) => sum + Math.round(item.food.carbs * item.quantity * 10) / 10,
                    0
                  )}{" "}
                  g, Fat{" "}
                  {stagedFoods.reduce(
                    (sum, item) => sum + Math.round(item.food.fat * item.quantity * 10) / 10,
                    0
                  )}{" "}
                  g, Protein{" "}
                  {stagedFoods.reduce(
                    (sum, item) =>
                      sum + Math.round(item.food.protein * item.quantity * 10) / 10,
                    0
                  )}{" "}
                  g
                </Text>
              </View>
              <Ionicons name="camera-outline" size={26} color="rgba(255,255,255,0.85)" />
            </View>

            {/* Foods list */}
            <Text style={s.reviewSectionTitle}>Foods</Text>
            <View style={s.reviewFoodsCard}>
              {stagedFoods.map((item, idx) => (
                <View key={item.food.id} style={s.stagedFoodRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.stagedFoodName}>{item.food.name}</Text>
                    <Text style={s.stagedFoodSub}>
                      {Math.round(item.food.calories * item.quantity)} kcal, {item.quantity}{" "}
                      {item.food.unit}
                    </Text>
                  </View>

                  {/* Minus & Plus Buttons */}
                  <View style={s.stepperRow}>
                    <Pressable
                      style={s.stepperBtn}
                      onPress={() => {
                        const newQ = item.quantity - 0.5;
                        if (newQ <= 0) {
                          setStagedFoods((prev) => prev.filter((_, i) => i !== idx));
                        } else {
                          setStagedFoods((prev) =>
                            prev.map((it, i) => (i === idx ? { ...it, quantity: newQ } : it))
                          );
                        }
                      }}
                    >
                      <Ionicons name="remove" size={16} color="#ffffff" />
                    </Pressable>
                    <Pressable
                      style={s.stepperBtn}
                      onPress={() => {
                        setStagedFoods((prev) =>
                          prev.map((it, i) =>
                            i === idx ? { ...it, quantity: it.quantity + 0.5 } : it
                          )
                        );
                      }}
                    >
                      <Ionicons name="add" size={16} color="#ffffff" />
                    </Pressable>
                  </View>
                </View>
              ))}

              <View style={s.stagedActionDivider} />

              <Pressable
                style={s.stagedActionRow}
                onPress={() => setShowSearchModal(true)}
              >
                <Text style={s.stagedActionText}>Add food</Text>
                <Ionicons name="add" size={20} color="rgba(255,255,255,0.7)" />
              </Pressable>

              <View style={s.stagedActionDivider} />

              <Pressable
                style={s.stagedActionRow}
                onPress={() => setShowSearchModal(true)}
              >
                <Text style={s.stagedActionText}>Add calories</Text>
                <Ionicons name="add" size={20} color="rgba(255,255,255,0.7)" />
              </Pressable>
            </View>

            {/* Save as custom meal */}
            <Pressable style={s.customMealBtn}>
              <Text style={s.customMealText}>Save as custom meal</Text>
            </Pressable>
          </ScrollView>

          {/* Floating Done Button */}
          <View style={s.doneBtnWrap}>
            <Pressable style={s.donePillBtn} onPress={handleDoneLogging}>
              <Text style={s.donePillText}>Done</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#000000" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 52,
    paddingBottom: 14,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#ffffff" },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 14 },
  iconBtn: { padding: 4 },

  dateSwitcherRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    marginBottom: 16,
  },
  arrowBtn: { padding: 8 },
  datePill: {
    backgroundColor: "#1e1e24",
    paddingHorizontal: 36,
    paddingVertical: 10,
    borderRadius: 22,
  },
  datePillText: { color: "#ffffff", fontWeight: "600", fontSize: 15 },

  scroll: { paddingHorizontal: 16 },

  // 1. Calorie Summary Card
  calorieCard: {
    backgroundColor: "#161822",
    borderRadius: 28,
    padding: 22,
    marginBottom: 16,
  },
  calTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 26,
  },
  calBigNumber: { fontSize: 48, fontWeight: "700", color: "#ffffff", lineHeight: 52 },
  calUnit: { fontSize: 16, color: "rgba(255,255,255,0.7)", fontWeight: "500", marginTop: 4 },
  calTargetsCol: { alignItems: "flex-end", gap: 8 },
  targetRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  targetText: { fontSize: 13.5, color: "rgba(255,255,255,0.8)", fontWeight: "500" },

  gaugeWrap: { gap: 8 },
  gaugeTrack: {
    height: 12,
    borderRadius: 6,
    backgroundColor: "rgba(255,255,255,0.14)",
    position: "relative",
    overflow: "hidden",
  },
  gaugeFillGreen: {
    height: 12,
    borderRadius: 6,
    backgroundColor: "#22c55e",
  },
  targetHatchRange: {
    position: "absolute",
    left: "69%",
    width: "15%",
    top: 0,
    bottom: 0,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  targetMarkerIcon: {
    position: "absolute",
    left: "76%",
    top: -1,
  },
  gaugeLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  gaugeLabelText: { fontSize: 11.5, color: "rgba(255,255,255,0.45)" },

  // 2. Nutrition Info Card
  nutriInfoCard: {
    backgroundColor: "#161822",
    borderRadius: 28,
    padding: 22,
    marginBottom: 16,
  },
  nutriHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  nutriTitle: { fontSize: 16, fontWeight: "700", color: "#ffffff" },
  macroBoxesRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
  macroBox: {
    flex: 1,
    backgroundColor: "#1c1f2b",
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  macroBoxTitle: { fontSize: 12.5, color: "#c084fc", fontWeight: "600", marginBottom: 6 },
  macroBoxVal: { fontSize: 18, fontWeight: "700", color: "#ffffff" },
  macroBoxUnit: { fontSize: 12, color: "rgba(255,255,255,0.5)", fontWeight: "400" },

  ratioLabel: { fontSize: 12.5, color: "rgba(255,255,255,0.7)", fontWeight: "600", marginBottom: 6 },
  ratioLabelsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 4,
    marginBottom: 6,
  },
  ratioNum: { fontSize: 12.5, fontWeight: "600", color: "#ffffff" },
  ratioNumMuted: { fontSize: 12, color: "rgba(255,255,255,0.45)" },
  ratioBarWrap: {
    flexDirection: "row",
    height: 14,
    borderRadius: 7,
    overflow: "hidden",
    gap: 3,
  },
  barCarb: { backgroundColor: "#c084fc", borderRadius: 7 },
  barFat: { backgroundColor: "#fb7185", borderRadius: 7 },
  barProtein: { backgroundColor: "#facc15", borderRadius: 7 },
  recommendedLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.45)",
    marginTop: 6,
    fontWeight: "500",
  },

  // 3. Log Meal Card (6 Meals)
  logMealCard: {
    backgroundColor: "#161822",
    borderRadius: 28,
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 16,
  },
  logMealCardTitle: {
    fontSize: 16.5,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 14,
  },
  mealItemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 14,
  },
  mealKcalBadge: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "rgba(255,255,255,0.08)",
    justifyContent: "center",
    alignItems: "center",
  },
  mealKcalVal: { fontSize: 13, fontWeight: "700", color: "#ffffff" },
  mealKcalUnit: { fontSize: 9.5, color: "rgba(255,255,255,0.6)" },
  mealInfoWrap: { flex: 1 },
  mealName: { fontSize: 15.5, fontWeight: "600", color: "#ffffff" },
  mealSubFoods: { fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 2 },
  mealDividerV: { width: 1, height: 28, backgroundColor: "rgba(255,255,255,0.08)" },
  mealPlusBtn: { padding: 4 },
  mealRowDivider: { height: 1, backgroundColor: "rgba(255,255,255,0.05)" },

  // 4. Trend Card
  trendCard: {
    backgroundColor: "#161822",
    borderRadius: 28,
    padding: 20,
    marginBottom: 16,
  },
  trendHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 28,
  },
  trendTitle: { fontSize: 16, fontWeight: "700", color: "#ffffff" },
  trendBody: { position: "relative", minHeight: 90 },
  dottedLine: {
    position: "absolute",
    top: 24,
    left: 0,
    right: 52,
    height: 1,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    borderStyle: "dotted",
  },
  avgBadge: {
    position: "absolute",
    right: 0,
    top: 10,
    backgroundColor: "#20212c",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  avgBadgeText: { fontSize: 10, color: "#ffffff", fontWeight: "600", textAlign: "center" },
  timelineRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 22,
    paddingRight: 55,
  },
  dayCol: { alignItems: "center", gap: 8 },
  dotSlot: { height: 16, justifyContent: "center", alignItems: "center" },
  greenDot: { width: 10, height: 14, borderRadius: 5, backgroundColor: "#22c55e" },
  dayLabel: { fontSize: 12, color: "rgba(255,255,255,0.45)" },

  // ─────────────────────────────────────────────────────────────
  // SUB-SCREENS & MODALS STYLING
  // ─────────────────────────────────────────────────────────────
  subScreenRoot: { flex: 1, backgroundColor: "#000000" },

  chooserCard: {
    backgroundColor: "#161822",
    borderRadius: 28,
    padding: 22,
    marginHorizontal: 16,
    marginBottom: 20,
  },
  chooserCardAdvice: {
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
    textAlign: "center",
    marginBottom: 20,
  },
  chooserBtnRow: { flexDirection: "row", justifyContent: "space-around" },
  actionBigBtn: { alignItems: "center", gap: 8 },
  actionBigText: { fontSize: 13, color: "#ffffff", fontWeight: "600" },

  chooserTabRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 40,
  },
  chooserTabPill: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "transparent",
  },
  chooserTabPillActive: { backgroundColor: "#2c2d38" },
  chooserTabText: { fontSize: 14, color: "rgba(255,255,255,0.5)", fontWeight: "600" },
  chooserTabTextActive: { color: "#ffffff" },

  tabEmptyWrap: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 },
  emptyStateText: { fontSize: 16, color: "rgba(255,255,255,0.7)", textAlign: "center" },
  myFoodsEmptyWrap: { alignItems: "center", gap: 24 },
  myFoodsTitle: { fontSize: 16, color: "#ffffff", textAlign: "center", lineHeight: 24 },
  addFoodPillBtn: {
    backgroundColor: "#2c2d38",
    paddingHorizontal: 36,
    paddingVertical: 14,
    borderRadius: 24,
  },
  addFoodPillText: { fontSize: 15, fontWeight: "600", color: "#ffffff" },

  // Filters
  filtersCard: {
    backgroundColor: "#161822",
    borderRadius: 28,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  filtersHeading: { fontSize: 13.5, color: "rgba(255,255,255,0.6)", marginBottom: 12 },
  filterChipsRow: { flexDirection: "row", gap: 8, marginBottom: 8 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  filterChipText: { fontSize: 12.5, color: "#ffffff", fontWeight: "500" },

  foodSearchRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
    gap: 14,
  },
  foodRadioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.4)",
  },
  foodTextWrap: { flex: 1 },
  foodSearchName: { fontSize: 15.5, fontWeight: "600", color: "#ffffff" },
  foodSearchSub: { fontSize: 12.5, color: "rgba(255,255,255,0.45)", marginTop: 2 },

  floatingSearchBox: {
    position: "absolute",
    bottom: 24,
    left: 16,
    right: 16,
    backgroundColor: "#1e202c",
    borderRadius: 28,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 12,
    gap: 12,
  },
  floatingSearchInput: { flex: 1, fontSize: 15, color: "#ffffff" },

  // Portion Sizing
  portionCard: {
    backgroundColor: "#161822",
    borderRadius: 28,
    padding: 22,
    marginBottom: 16,
  },
  portionCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  portionFoodName: { fontSize: 18, fontWeight: "700", color: "#ffffff" },
  portionFoodKcal: { fontSize: 14, color: "rgba(255,255,255,0.6)", marginTop: 4 },

  sliderBubbleWrap: { alignItems: "center", marginBottom: 12 },
  bubblePill: {
    backgroundColor: "#2a2d3b",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
  },
  bubbleText: { color: "#ffffff", fontSize: 16, fontWeight: "700" },

  sliderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  stepWrap: { alignItems: "center", gap: 6 },
  stepDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.3)" },
  stepDotActive: { backgroundColor: "#ffffff", width: 8, height: 8, borderRadius: 4 },
  stepText: { fontSize: 12, color: "rgba(255,255,255,0.4)" },
  stepTextActive: { color: "#ffffff", fontWeight: "700" },

  unitDropdownRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginBottom: 14,
  },
  unitDropdownText: { fontSize: 17, fontWeight: "700", color: "#ffffff" },
  portionSubText: { fontSize: 12, color: "rgba(255,255,255,0.45)", textAlign: "center" },

  macroDetailCard: {
    backgroundColor: "#161822",
    borderRadius: 28,
    padding: 22,
    marginBottom: 20,
  },
  macroDetailTitle: { fontSize: 16, fontWeight: "700", color: "#ffffff", marginBottom: 14 },
  macroLegendRow: { flexDirection: "row", gap: 16, marginBottom: 12 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 12.5, color: "rgba(255,255,255,0.7)" },

  portionBarWrap: { flexDirection: "row", height: 10, borderRadius: 5, overflow: "hidden", gap: 2 },
  portionBarCarb: { backgroundColor: "#06b6d4" },
  portionBarFat: { backgroundColor: "#f59e0b" },
  portionBarProtein: { backgroundColor: "#eab308" },
  portionBarPercents: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
    marginBottom: 20,
  },
  portionPercentText: { fontSize: 12, color: "rgba(255,255,255,0.5)" },

  // Facts Table
  factsTable: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    padding: 14,
    borderRadius: 8,
  },
  factRowBorder: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.2)",
  },
  factRowBorderThick: { paddingVertical: 4 },
  factHeader: { fontSize: 11, color: "rgba(255,255,255,0.8)" },
  factRowCalories: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    paddingBottom: 6,
    borderBottomWidth: 4,
    borderBottomColor: "rgba(255,255,255,0.8)",
  },
  factCalTitle: { fontSize: 18, fontWeight: "800", color: "#ffffff" },
  factCalVal: { fontSize: 20, fontWeight: "800", color: "#ffffff" },
  factRowRight: { alignItems: "flex-end", paddingVertical: 4 },
  factDailyValHeader: { fontSize: 10.5, fontWeight: "700", color: "#ffffff" },

  factRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  factSubRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
    paddingLeft: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  factRowBorderThickTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
    borderTopWidth: 3,
    borderTopColor: "rgba(255,255,255,0.5)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  factBold: { fontSize: 12, fontWeight: "700", color: "#ffffff" },
  factNormal: { fontSize: 12, fontWeight: "400", color: "rgba(255,255,255,0.85)" },
  factFootnote: {
    fontSize: 10,
    color: "rgba(255,255,255,0.5)",
    lineHeight: 14,
    marginTop: 10,
  },

  portionFloatBtnWrap: {
    position: "absolute",
    bottom: 24,
    left: 40,
    right: 40,
    alignItems: "center",
  },
  portionFloatBtnPill: {
    flexDirection: "row",
    backgroundColor: "#20212c",
    borderRadius: 24,
    overflow: "hidden",
    width: "100%",
  },
  portionHalfBtn: { flex: 1, paddingVertical: 14, alignItems: "center" },
  portionBtnDiv: { width: 1, backgroundColor: "rgba(255,255,255,0.1)" },
  portionBtnText: { color: "#ffffff", fontSize: 15 },

  // Review Screen
  reviewMealSelectRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 10,
    marginBottom: 16,
  },
  reviewMealTitle: { fontSize: 20, fontWeight: "700", color: "#ffffff" },
  reviewTimePill: {
    backgroundColor: "#1e1f2b",
    alignSelf: "center",
    paddingHorizontal: 26,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 20,
  },
  reviewTimeText: { color: "#ffffff", fontSize: 14, fontWeight: "600" },
  reviewTotalCard: {
    backgroundColor: "#161822",
    borderRadius: 24,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  reviewTotalKcal: { fontSize: 15, fontWeight: "700", color: "#ffffff", marginBottom: 4 },
  reviewTotalMacros: { fontSize: 12, color: "rgba(255,255,255,0.55)" },

  reviewSectionTitle: { fontSize: 13, color: "rgba(255,255,255,0.7)", marginBottom: 10 },
  reviewFoodsCard: {
    backgroundColor: "#161822",
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginBottom: 20,
  },
  stagedFoodRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  stagedFoodName: { fontSize: 15, fontWeight: "700", color: "#ffffff" },
  stagedFoodSub: { fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 2 },
  stepperRow: { flexDirection: "row", gap: 8 },
  stepperBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  stagedActionDivider: { height: 1, backgroundColor: "rgba(255,255,255,0.06)" },
  stagedActionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
  },
  stagedActionText: { fontSize: 14.5, fontWeight: "600", color: "#ffffff" },

  customMealBtn: {
    backgroundColor: "#161822",
    borderRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  customMealText: { color: "#ffffff", fontSize: 14, fontWeight: "600" },

  doneBtnWrap: {
    position: "absolute",
    bottom: 24,
    left: 16,
    right: 16,
    alignItems: "center",
  },
  donePillBtn: {
    backgroundColor: "#2c2d38",
    paddingVertical: 14,
    paddingHorizontal: 50,
    borderRadius: 26,
    minWidth: 160,
    alignItems: "center",
  },
  donePillText: { fontSize: 15, fontWeight: "700", color: "#ffffff" },
});
