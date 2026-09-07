import React, { useState, useEffect, useRef } from "react";
import {
  ScrollView,
  Text,
  View,
  Pressable,
  StyleSheet,
  Dimensions,
  FlatList,
  ViewToken,
  StatusBar,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  FadeInDown,
  FadeIn,
  Easing,
} from "react-native-reanimated";
import { RootStackParamList } from "@/navigation/types";
import SamsungBottomNav from "@/components/SamsungBottomNav";
import { useAuth } from "@/context/AuthContext";
import {
  getDailyNutritionTotals,
  getMedications,
  getDailyActivityTotals,
  getTodayKey,
  MedicationItem,
} from "@/services/healthLogService";

type Props = NativeStackScreenProps<RootStackParamList, "HomeDashboard">;

const { width: SW } = Dimensions.get("window");

// ─── Quick-action pills (top icon bar) ────────────────────────────────────────
interface PillItem {
  icon: string;
  lib: "Ionicons" | "MaterialIcons";
  name: string;
}

const PILLS: PillItem[] = [
  { icon: "apps", lib: "Ionicons", name: "Overview" },
  { icon: "directions-run", lib: "MaterialIcons", name: "Activity" },
  { icon: "bedtime", lib: "MaterialIcons", name: "Sleep" },
  { icon: "favorite", lib: "MaterialIcons", name: "Vitals" },
  { icon: "self-improvement", lib: "MaterialIcons", name: "Mindfulness" },
  { icon: "restaurant", lib: "MaterialIcons", name: "Nutrition" },
];

// ─── Hero promo slides (Overview tab) ─────────────────────────────────────────
const HERO_SLIDES = [
  {
    id: "1",
    title: "Introducing Fitness Index\n& Daily Cardio Load",
    sub: "Get 15% off on Galaxy Watch9 & Watch Ultra2.",
    gradient: ["#1a1a2a", "#232336", "#2a2a40"] as string[],
  },
  {
    id: "2",
    title: "Track your health with AI precision",
    sub: "Real-time vitals, sleep analysis, and personalised coaching in your pocket.",
    gradient: ["#0f2027", "#203a43", "#2c5364"] as string[],
  },
  {
    id: "3",
    title: "Stay fit. Stay strong. Every day.",
    sub: "Yoga, gym, steps, calories — all your fitness goals in one beautiful dashboard.",
    gradient: ["#0d1b2a", "#1b4332", "#2d6a4f"] as string[],
  },
];

// ─── Animated press-scale card ─────────────────────────────────────────────────
interface PressCardProps {
  onPress: () => void;
  style?: any;
  children: React.ReactNode;
  index?: number;
}
function PressCard({ onPress, style, children, index = 0 }: PressCardProps) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Animated.View
      entering={FadeInDown.delay(index * 60).duration(380).springify().damping(18)}
      style={[style, animStyle]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={() => { scale.value = withSpring(0.96, { damping: 15, stiffness: 350 }); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 12, stiffness: 280 }); }}
        android_ripple={null}
        style={{ flex: 1 }}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

// ─── Small circular quick-action button (2×2 grid inside the Food row) ────────
function QuickCircle({ icon, label, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={sq.circleWrap}>
      <View style={sq.circle}>
        <Ionicons name={icon} size={20} color="rgba(255,255,255,0.8)" />
      </View>
    </Pressable>
  );
}
const sq = StyleSheet.create({
  circleWrap: { alignItems: "center", justifyContent: "center" },
  circle: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.12)",
    justifyContent: "center", alignItems: "center",
  },
});

// ─── Main Screen Component ─────────────────────────────────────────────────────
export default function HomeDashboardScreen({ navigation }: Props) {
  const { user } = useAuth();
  const [activePill, setActivePill] = useState(0); // 0 = Overview, 1 = Activity, etc.
  const [heroIndex, setHeroIndex] = useState(0);
  const [syncDismissed, setSyncDismissed] = useState(false);
  const heroRef = useRef<FlatList>(null);

  // Real user health logging data
  const [nutritionTotals, setNutritionTotals] = useState({ totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0 });
  const [medications, setMedications] = useState<MedicationItem[]>([]);
  const [activityTotals, setActivityTotals] = useState({ totalMins: 0, totalCalories: 0 });

  const todayKey = getTodayKey();

  const loadHealthData = async () => {
    try {
      const [nutri, meds, acts] = await Promise.all([
        getDailyNutritionTotals(),
        getMedications(),
        getDailyActivityTotals(),
      ]);
      setNutritionTotals({
        totalCalories: nutri.totalCalories,
        totalProtein: nutri.totalProtein,
        totalCarbs: nutri.totalCarbs,
        totalFat: nutri.totalFat,
      });
      setMedications(meds);
      setActivityTotals({
        totalMins: acts.totalMins,
        totalCalories: acts.totalCalories,
      });
    } catch (e) {
      console.log("Error loading health logs for home:", e);
    }
  };

  useEffect(() => {
    loadHealthData();
  }, [activePill]);

  const firstName = user?.displayName?.split(" ")[0] ?? "You";

  // Hero auto-scroll (Overview tab)
  useEffect(() => {
    if (activePill !== 0) return;
    const timer = setInterval(() => {
      setHeroIndex((prev) => {
        const next = (prev + 1) % HERO_SLIDES.length;
        heroRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, 4500);
    return () => clearInterval(timer);
  }, [activePill]);

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0 && viewableItems[0].index != null) {
      setHeroIndex(viewableItems[0].index);
    }
  }).current;

  // Header entrance animation
  const headerOpacity = useSharedValue(0);
  const headerY = useSharedValue(-16);
  useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: 480, easing: Easing.out(Easing.cubic) });
    headerY.value = withSpring(0, { damping: 20, stiffness: 200 });
  }, []);
  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerY.value }],
  }));

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* ── Subtle warm amber glow at top (matching Samsung Health header glow) ── */}
      <LinearGradient
        colors={["rgba(120, 80, 10, 0.28)", "rgba(50, 40, 15, 0.12)", "transparent"]}
        style={s.topAmbientGlow}
        pointerEvents="none"
      />

      {/* ── Top App Bar (Persistent) ─────────────────────────── */}
      <Animated.View style={[s.topBar, headerStyle]}>
        <Text style={s.appTitle}>Samsung Health</Text>
        <View style={s.topBarRight}>
          {/* Avatar */}
          <Pressable onPress={() => navigation.navigate("Profile")} style={s.avatarBtn}>
            <LinearGradient colors={["#00c6aa", "#0f9b8e"]} style={s.avatarBtnInner}>
              <Text style={s.avatarInitials}>
                {firstName.charAt(0).toUpperCase()}
              </Text>
            </LinearGradient>
            <View style={s.avatarOnlineDot} />
          </Pressable>
          {/* 3-dot menu */}
          <Pressable onPress={() => navigation.navigate("Notifications")} style={s.menuBtn}>
            <Ionicons name="ellipsis-vertical" size={20} color="rgba(255,255,255,0.8)" />
            <View style={s.menuDotBadge} />
          </Pressable>
        </View>
      </Animated.View>

      {/* ── Quick-action Pills Bar (Persistent within Home) ──── */}
      <Animated.View entering={FadeIn.delay(120).duration(400)}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.pillsContent}
          style={s.pillsScroll}
          bounces={false}
        >
          {PILLS.map((p, i) => {
            const isActive = activePill === i;
            return (
              <Pressable
                key={i}
                onPress={() => setActivePill(i)}
                style={s.pillBtn}
              >
                <View style={[s.pillBg, isActive && s.pillBgActive]}>
                  {p.lib === "MaterialIcons" ? (
                    <MaterialIcons
                      name={p.icon as any}
                      size={22}
                      color={isActive ? "#FFFFFF" : "rgba(255,255,255,0.55)"}
                    />
                  ) : (
                    <Ionicons
                      name={p.icon as any}
                      size={22}
                      color={isActive ? "#FFFFFF" : "rgba(255,255,255,0.55)"}
                    />
                  )}
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      </Animated.View>

      {/* ── Main Scrollable Content Area ─────────────────────── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
        key={`tab-${activePill}`}
      >

        {/* ═══════════════════════════════════════════════════════════════
            TAB 1: ACTIVITY SUB-CATEGORY (When 2nd pill is selected)
            ═══════════════════════════════════════════════════════════════ */}
        {activePill === 1 && (
          <View style={s.activitySubView}>
            {/* Header: Title + Motivational Advice */}
            <Animated.View entering={FadeInDown.duration(350).springify()}>
              <Text style={s.subCategoryTitle}>Activity</Text>
              <Text style={s.subCategoryAdvice}>
                Afternoon exercise helps relieve stress and improves concentration. Try making a workout plan that works for you.
              </Text>
            </Animated.View>

            {/* 1. Daily activity card (with steps, mins, kcal and heart rings) */}
            <PressCard index={0} onPress={() => navigation.navigate("DailyStepsDashboard")}>
              <View style={s.actDailyCard}>
                <Text style={s.actDailyTitle}>Daily activity</Text>
                <View style={s.actDailyRow}>
                  {/* Stats list */}
                  <View style={s.actStatsList}>
                    {/* Steps */}
                    <View style={s.actStatItem}>
                      <View style={[s.actStatIconWrap, { backgroundColor: "#1aab3e" }]}>
                        <Ionicons name="footsteps" size={13} color="white" />
                      </View>
                      <Text style={s.actStatVal}>0 <Text style={s.actStatUnit}>steps</Text></Text>
                    </View>
                    {/* Minutes */}
                    <View style={s.actStatItem}>
                      <View style={[s.actStatIconWrap, { backgroundColor: "#00bcd4" }]}>
                        <Ionicons name="time" size={13} color="white" />
                      </View>
                      <Text style={s.actStatVal}>{activityTotals.totalMins} <Text style={s.actStatUnit}>mins</Text></Text>
                    </View>
                    {/* Calories */}
                    <View style={s.actStatItem}>
                      <View style={[s.actStatIconWrap, { backgroundColor: "#a855f7" }]}>
                        <Ionicons name="flame" size={13} color="white" />
                      </View>
                      <Text style={s.actStatVal}>{activityTotals.totalCalories} <Text style={s.actStatUnit}>kcal</Text></Text>
                    </View>
                  </View>

                  {/* Concentric Heart Activity Rings */}
                  <View style={s.actHeartWrap}>
                    <View style={[s.actHeartRing, { width: 96, height: 96, borderColor: "#1aab3e" }]}>
                      <View style={[s.actHeartRing, { width: 74, height: 74, borderColor: "#00bcd4" }]}>
                        <View style={[s.actHeartRing, { width: 52, height: 52, borderColor: "#a855f7" }]}>
                          <Ionicons name="heart" size={24} color="#1c1e28" />
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            </PressCard>

            {/* 2. Workouts this week (Emerald/Green Gradient Card) */}
            <PressCard index={1} onPress={() => navigation.navigate("FitnessDashboard")}>
              <LinearGradient
                colors={["#0b6b55", "#0d8a68", "#11a27b"]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={s.actGreenCard}
              >
                <View style={s.actWideTextWrap}>
                  <Text style={s.actCardLabel}>Workouts this week</Text>
                  <Text style={s.actCardDesc}>See your weekly workout totals.</Text>
                </View>
                {/* 3D Stopwatch Graphic */}
                <View style={s.stopwatchWrap}>
                  <View style={s.stopwatchRadarOuter}>
                    <View style={s.stopwatchRadarInner}>
                      <View style={s.stopwatchBody}>
                        <View style={s.stopwatchCrown} />
                        <View style={s.stopwatchDialCenter}>
                          <View style={s.stopwatchNeedle} />
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              </LinearGradient>
            </PressCard>

            {/* 3. Daily cardio load (Blue Gradient Card) */}
            <PressCard index={2} onPress={() => navigation.navigate("FitnessDashboard")}>
              <LinearGradient
                colors={["#1655b3", "#1b65d4", "#2076f0"]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={s.actBlueCard}
              >
                <View style={s.actWideTextWrap}>
                  <Text style={s.actCardLabel}>Daily cardio load</Text>
                  <Text style={s.actCardDesc}>
                    Track your daily activity to see when you've reached the sweet spot for training.
                  </Text>
                </View>
                {/* 3D Speedometer/Gauge Graphic */}
                <View style={s.speedoGaugeWrap}>
                  <View style={s.speedoGaugeOuter}>
                    <View style={s.speedoGaugeInner}>
                      <Ionicons name="speedometer" size={38} color="#90caf9" />
                    </View>
                  </View>
                </View>
              </LinearGradient>
            </PressCard>

            {/* 4. Fitness index (Jade Green Gradient Card) */}
            <PressCard index={3} onPress={() => navigation.navigate("FitnessDashboard")}>
              <LinearGradient
                colors={["#0d7a66", "#0f947b", "#14b897"]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={s.actJadeCard}
              >
                <View style={s.actWideTextWrap}>
                  <Text style={s.actCardLabel}>Fitness index</Text>
                  <Text style={s.actCardDesc}>
                    Track your fitness level and get content and targets based on your training focus.
                  </Text>
                </View>
                {/* 3D Pentagon Badge Graphic */}
                <View style={s.pentagonWrap}>
                  <View style={s.pentagonOuter}>
                    <View style={s.pentagonInner}>
                      <Ionicons name="shield-checkmark" size={34} color="#80cbc4" />
                    </View>
                  </View>
                </View>
              </LinearGradient>
            </PressCard>

            {/* 5. Steps (Full-width Dark Card with 7-Day Bar Chart) */}
            <PressCard index={4} onPress={() => navigation.navigate("DailyStepsDashboard")}>
              <View style={s.actStepsCard}>
                <Text style={s.actStepsTitle}>Steps</Text>
                <Text style={s.actStepsValue}>0</Text>
                <Text style={s.actStepsGoal}>6,000 steps</Text>

                {/* 7-day bar chart at right / bottom */}
                <View style={s.actBarChartRow}>
                  {[1, 2, 3, 4, 5, 6, 7].map((day) => {
                    const isToday = day === 6;
                    return (
                      <View key={day} style={s.actBarCol}>
                        <View style={s.actBarTrack}>
                          {isToday && <View style={s.actBarFillGreen} />}
                        </View>
                        <Text style={[s.actBarDayLabel, isToday && s.actBarDayToday]}>
                          {day}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            </PressCard>

            {/* 6. Running coach (Full-width Dark Card with Beta badge) */}
            <PressCard index={5} onPress={() => navigation.navigate("AICoach")}>
              <View style={s.actCoachCard}>
                <View style={s.actCoachHeader}>
                  <Text style={s.actCoachLabel}>Running coach</Text>
                  <View style={s.actBetaBadge}>
                    <Text style={s.actBetaText}>Beta</Text>
                  </View>
                </View>

                <View style={s.actCoachBody}>
                  {/* Track emblem graphic */}
                  <View style={s.actCoachIconCircle}>
                    <Ionicons name="trophy" size={24} color="#ff9800" />
                  </View>
                  <View style={s.actCoachTextWrap}>
                    <Text style={s.actCoachTitle}>Meet Running coach</Text>
                    <Text style={s.actCoachSub}>
                      Learn how our personalised training plan helps you reach your running goals.
                    </Text>
                  </View>
                </View>
              </View>
            </PressCard>

            {/* 7. Exercise shortcuts (Full-width Dark Card with 4 circular buttons) */}
            <View style={s.actExerciseCard}>
              <Text style={s.actExerciseTitle}>Exercise</Text>
              <View style={s.actExerciseGrid}>
                {/* Walking */}
                <Pressable
                  style={s.actExBtn}
                  onPress={() => navigation.navigate("DailyStepsDashboard")}
                >
                  <View style={[s.actExCircle, { backgroundColor: "#388e3c" }]}>
                    <Ionicons name="walk" size={26} color="white" />
                  </View>
                  <Text style={s.actExLabel}>Walking</Text>
                </Pressable>

                {/* Running */}
                <Pressable
                  style={s.actExBtn}
                  onPress={() => navigation.navigate("FitnessDashboard")}
                >
                  <View style={[s.actExCircle, { backgroundColor: "#689f38" }]}>
                    <Ionicons name="fitness" size={26} color="white" />
                  </View>
                  <Text style={s.actExLabel}>Running</Text>
                </Pressable>

                {/* Bike */}
                <Pressable
                  style={s.actExBtn}
                  onPress={() => navigation.navigate("FitnessDashboard")}
                >
                  <View style={[s.actExCircle, { backgroundColor: "#e57373" }]}>
                    <Ionicons name="bicycle" size={26} color="white" />
                  </View>
                  <Text style={s.actExLabel}>Bike</Text>
                </Pressable>

                {/* More */}
                <Pressable
                  style={s.actExBtn}
                  onPress={() => navigation.navigate("FitnessDashboard")}
                >
                  <View style={[s.actExCircle, { backgroundColor: "#374151" }]}>
                    <Ionicons name="list" size={24} color="white" />
                  </View>
                  <Text style={s.actExLabel}>More</Text>
                </Pressable>
              </View>
            </View>

            {/* Edit home */}
            <View style={s.editHomeWrap}>
              <Pressable style={s.editHomeBtn} onPress={() => {}}>
                <Text style={s.editHomeText}>Edit home</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            TAB 0: GENERAL OVERVIEW (Default Home Screen)
            ═══════════════════════════════════════════════════════════════ */}
        {activePill === 0 && (
          <View>
            {/* 1. Hero Promo Carousel */}
            <Animated.View entering={FadeInDown.delay(0).duration(400).springify()}>
              <View style={s.heroWrap}>
                <FlatList
                  ref={heroRef}
                  data={HERO_SLIDES}
                  keyExtractor={(item) => item.id}
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  onViewableItemsChanged={onViewableItemsChanged}
                  viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
                  renderItem={({ item }) => (
                    <LinearGradient
                      colors={item.gradient as any}
                      start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                      style={s.heroSlide}
                    >
                      <View style={s.heroInner}>
                        <Text style={s.heroTitle}>{item.title}</Text>
                        <Text style={s.heroSub}>{item.sub}</Text>
                        <View style={s.dotsRow}>
                          {HERO_SLIDES.map((_, idx) => (
                            <View key={idx} style={[s.dot, idx === heroIndex && s.dotActive]} />
                          ))}
                        </View>
                      </View>
                    </LinearGradient>
                  )}
                />
              </View>
            </Animated.View>

            {/* 2. Sync Alert Banner */}
            {!syncDismissed && (
              <Animated.View entering={FadeInDown.delay(80).duration(380).springify()}>
                <View style={s.alertBanner}>
                  <Text style={s.alertText}>
                    Your health data hasn't been synced in 3 days. To sync it now, connect to Wi-Fi or change your sync settings.
                  </Text>
                  <View style={s.alertBtns}>
                    <Pressable onPress={() => setSyncDismissed(true)}>
                      <Text style={s.alertBtnPlain}>Not now</Text>
                    </Pressable>
                    <Pressable onPress={() => setSyncDismissed(true)}>
                      <Text style={s.alertBtnBold}>Go to sync settings</Text>
                    </Pressable>
                  </View>
                </View>
              </Animated.View>
            )}

            {/* 3. Energy Score — full-width blue card */}
            <PressCard index={1} onPress={() => navigation.navigate("FitnessDashboard")}>
              <LinearGradient
                colors={["#2a3fc7", "#3f51e8", "#4d6af5"]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={s.energyCard}
              >
                <View style={s.energyBlob} />
                <View style={s.energyTextWrap}>
                  <Text style={s.energyLabel}>Energy score</Text>
                  <Text style={s.energyDesc}>
                    Learn how tracking your energy score can help you plan your day based on what's best for your body.
                  </Text>
                </View>
                <View style={s.energyIconWrap}>
                  <View style={s.flameOuter}>
                    <Ionicons name="flame" size={52} color="#ff9500" />
                  </View>
                  <View style={s.flameSpark1}>
                    <Ionicons name="sparkles" size={14} color="#60ccff" />
                  </View>
                  <View style={s.flameSpark2}>
                    <Ionicons name="water" size={12} color="#60ccff" />
                  </View>
                </View>
              </LinearGradient>
            </PressCard>

            {/* 4. Daily Activity + Sleep — 2-col */}
            <View style={[s.row2, { marginTop: 10 }]}>
              {/* Daily Activity */}
              <PressCard index={2} onPress={() => navigation.navigate("FitnessDashboard")} style={s.halfOuter}>
                <View style={[s.halfCard, { backgroundColor: "#1c1c28" }]}>
                  <Text style={s.halfTitle}>Daily activity</Text>
                  <View style={s.heartRingWrap}>
                    <View style={[s.ring, { width: 80, height: 80, borderColor: "#1aab3e" }]}>
                      <View style={[s.ring, { width: 62, height: 62, borderColor: "#b44aff" }]}>
                        <View style={[s.ring, { width: 44, height: 44, borderColor: "#1aab3e", borderWidth: 2 }]}>
                          <Ionicons name="heart" size={18} color="#333" />
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              </PressCard>

              {/* Sleep */}
              <PressCard index={3} onPress={() => navigation.navigate("SleepDashboard")} style={s.halfOuter}>
                <LinearGradient
                  colors={["#1e1060", "#2d1b7e", "#3a2a9e"]}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={s.halfCard}
                >
                  <Text style={s.sleepStar1}>✦</Text>
                  <Text style={s.sleepStar2}>✦</Text>
                  <Text style={s.sleepStar3}>·</Text>
                  <Ionicons name="moon" size={52} color="#7b5fcc" style={s.sleepMoon} />
                  <Text style={s.halfTitle}>Sleep</Text>
                  <Text style={s.halfSub}>Track your sleep</Text>
                </LinearGradient>
              </PressCard>
            </View>

            {/* 5. Food + Quick-Action 2×2 grid */}
            <View style={[s.row2, { marginTop: 10 }]}>
              {/* Food */}
              <PressCard index={4} onPress={() => navigation.navigate("NutritionDashboard")} style={s.halfOuter}>
                <LinearGradient
                  colors={["#e05c00", "#f57c00", "#ff9800"]}
                  start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
                  style={s.halfCard}
                >
                  <View style={s.orangeDecor}>
                    <Ionicons name="nutrition" size={62} color="rgba(255,200,100,0.35)" />
                  </View>
                  <Text style={s.halfTitle}>Food</Text>
                  <Text style={s.halfSub}>
                    {nutritionTotals.totalCalories > 0
                      ? `${nutritionTotals.totalCalories} kcal logged today`
                      : "Ready to log your first meal?"}
                  </Text>
                </LinearGradient>
              </PressCard>

              {/* 2×2 circle quick actions */}
              <View style={[s.halfOuter, s.quickGrid]}>
                <View style={s.quickRow}>
                  <QuickCircle icon="water-outline"  label="Water"   onPress={() => navigation.navigate("HydrationDashboard")} />
                  <QuickCircle icon="barbell-outline" label="Weight"  onPress={() => navigation.navigate("WeightLogDashboard")} />
                </View>
                <View style={s.quickRow}>
                  <QuickCircle icon="leaf-outline"   label="Meditate" onPress={() => navigation.navigate("MeditationDashboard")} />
                  <QuickCircle icon="list-outline"   label="More"     onPress={() => navigation.navigate("Discover")} />
                </View>
              </View>
            </View>

            {/* 6. Heart Health — full-width purple card */}
            <PressCard index={5} onPress={() => navigation.navigate("HealthDashboard")}>
              <LinearGradient
                colors={["#9c27b0", "#c22f93", "#d63384"]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={s.wideCard}
              >
                <View style={s.wideBlob} />
                <View style={s.wideTextWrap}>
                  <Text style={s.wideLabel}>Heart health</Text>
                  <Text style={s.wideDesc}>
                    See your heart health score plus key health insights in one place.
                  </Text>
                </View>
                <View style={s.heartIconWrap}>
                  <View style={s.heartRingLg}>
                    <View style={s.heartRingMd}>
                      <Ionicons name="heart" size={26} color="#ff4a8d" />
                    </View>
                  </View>
                </View>
              </LinearGradient>
            </PressCard>

            {/* 7. Cycle Tracking — full-width pink card */}
            <PressCard index={6} onPress={() => navigation.navigate("WellnessDashboard")}>
              <LinearGradient
                colors={["#e91e8c", "#ec407a", "#f06292"]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={s.wideCard}
              >
                <View style={s.wideTextWrap}>
                  <Text style={s.wideLabel}>Cycle tracking</Text>
                  <Text style={s.wideDesc}>
                    Track your cycle to see your body's patterns.
                  </Text>
                </View>
                <View style={s.flowerWrap}>
                  <Ionicons name="rose" size={56} color="rgba(255,100,200,0.9)" />
                </View>
              </LinearGradient>
            </PressCard>

            {/* 8. Medications + Health Records */}
            <View style={[s.row2, { marginTop: 10 }]}>
              <PressCard index={7} onPress={() => navigation.navigate("MedicationCenter")} style={s.halfOuter}>
                <View style={[s.halfCard, { backgroundColor: "#1c1c28" }]}>
                  <View style={s.pillIconBox}>
                    <Ionicons name="medical" size={28} color="#9c8ef5" />
                  </View>
                  <Text style={s.halfTitle}>Medications</Text>
                  <Text style={s.medTime}>
                    {medications.length > 0 ? medications[0].scheduleTime : "None scheduled"}
                  </Text>
                  <Text style={s.medName} numberOfLines={1}>
                    {medications.length > 0
                      ? `${medications[0].name} (${medications.filter((m) => m.takenDates && m.takenDates.includes(todayKey)).length}/${medications.length})`
                      : "Tap to add medicine"}
                  </Text>
                </View>
              </PressCard>

              <PressCard index={8} onPress={() => navigation.navigate("MedicalRecords")} style={s.halfOuter}>
                <View style={[s.halfCard, { backgroundColor: "#252535" }]}>
                  <View style={s.moleculeWrap}>
                    <Ionicons name="git-network-outline" size={46} color="rgba(150,160,200,0.3)" />
                  </View>
                  <Text style={[s.halfTitle, { color: "#b0b8d0" }]}>Health records</Text>
                  <Text style={[s.halfSub, { color: "#7a849a" }]}>
                    Access or upload your health records.
                  </Text>
                </View>
              </PressCard>
            </View>

            {/* 9. Hearing + Steps */}
            <View style={[s.row2, { marginTop: 10 }]}>
              <PressCard index={9} onPress={() => navigation.navigate("WellnessDashboard")} style={s.halfOuter}>
                <LinearGradient
                  colors={["#795548", "#8d6e63", "#a1887f"]}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={s.halfCard}
                >
                  <View style={s.soundWaveWrap}>
                    <Ionicons name="volume-high-outline" size={40} color="rgba(255,255,255,0.15)" />
                  </View>
                  <Text style={s.halfTitle}>Hearing</Text>
                  <Text style={s.halfSub}>
                    Track sound exposure to help protect your hearing.
                  </Text>
                </LinearGradient>
              </PressCard>

              <PressCard index={10} onPress={() => navigation.navigate("FitnessDashboard")} style={s.halfOuter}>
                <View style={[s.halfCard, { backgroundColor: "#1c1c28" }]}>
                  <Text style={s.halfTitle}>Steps</Text>
                  <Text style={s.stepsNumber}>0</Text>
                  <Text style={s.stepsGoal}>6,000 steps</Text>
                  <View style={s.stepsBarBg}>
                    <View style={[s.stepsBarFill, { width: "0%" }]} />
                  </View>
                </View>
              </PressCard>
            </View>

            {/* 10. Vitals + Daily Cardio Load */}
            <View style={[s.row2, { marginTop: 10 }]}>
              <PressCard index={11} onPress={() => navigation.navigate("VitalsScreen")} style={s.halfOuter}>
                <LinearGradient
                  colors={["#006064", "#00838f", "#00acc1"]}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={s.halfCard}
                >
                  <View style={s.radarWrap}>
                    <Ionicons name="radio-outline" size={50} color="rgba(255,255,255,0.12)" />
                  </View>
                  <Text style={s.halfTitle}>Vitals</Text>
                  <Text style={s.halfSub}>Learn how vitals tracking works.</Text>
                </LinearGradient>
              </PressCard>

              <PressCard index={12} onPress={() => navigation.navigate("FitnessDashboard")} style={s.halfOuter}>
                <LinearGradient
                  colors={["#0d47a1", "#1565c0", "#1976d2"]}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={s.halfCard}
                >
                  <View style={s.speedoWrap}>
                    <Ionicons name="speedometer-outline" size={50} color="rgba(255,255,255,0.15)" />
                  </View>
                  <Text style={s.halfTitle}>Daily cardio load</Text>
                  <Text style={s.halfSub}>Find your daily training sweet spot.</Text>
                </LinearGradient>
              </PressCard>
            </View>

            {/* Urban Helpers Services CTA */}
            <PressCard index={13} onPress={() => navigation.navigate("ServicesDashboard")}>
              <LinearGradient
                colors={["#007c8a", "#00bcd4", "#26c6da"]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={s.servicesBtn}
              >
                <View style={s.servicesBtnBlob} />
                <View style={s.servicesBtnIconWrap}>
                  <Ionicons name="construct" size={26} color="white" />
                </View>
                <View style={s.servicesBtnText}>
                  <View style={s.servicesBadge}>
                    <Text style={s.servicesBadgeTxt}>10 CATEGORIES</Text>
                  </View>
                  <Text style={s.servicesBtnTitle}>Urban Helpers Services</Text>
                  <Text style={s.servicesBtnSub}>RO · Pest · Cleaning · Care & more</Text>
                </View>
                <Ionicons name="arrow-forward-circle" size={32} color="rgba(255,255,255,0.85)" />
              </LinearGradient>
            </PressCard>

            {/* Edit home button */}
            <View style={s.editHomeWrap}>
              <Pressable style={s.editHomeBtn} onPress={() => {}}>
                <Text style={s.editHomeText}>Edit home</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            TAB 2: SLEEP SUB-CATEGORY
            ═══════════════════════════════════════════════════════════════ */}
        {activePill === 2 && (
          <View style={s.sleepSubView}>
            {/* Header */}
            <Animated.View entering={FadeInDown.duration(350).springify()}>
              <Text style={s.subCategoryTitle}>Sleep</Text>
              <Text style={s.subCategoryAdvice}>
                Good sleep is the foundation of health. Track your patterns and improve your rest.
              </Text>
            </Animated.View>

            {/* 1. Sleep Score + Duration — 2-col */}
            <PressCard index={0} onPress={() => navigation.navigate("SleepDashboard")}>
              <LinearGradient
                colors={["#13084a", "#1a0f6b", "#2a1a9e"]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={s.slScoreCard}
              >
                {/* Stars */}
                <Text style={s.slStar1}>✦</Text>
                <Text style={s.slStar2}>✦</Text>
                <Text style={s.slStar3}>·</Text>
                <Text style={s.slStar4}>✦</Text>

                <View style={s.slScoreRow}>
                  {/* Score Ring */}
                  <View style={s.slRingWrap}>
                    <View style={s.slRingOuter}>
                      <View style={s.slRingInner}>
                        <Text style={s.slRingNum}>85</Text>
                        <Text style={s.slRingLabel}>score</Text>
                      </View>
                    </View>
                    <Text style={s.slRingQuality}>Excellent</Text>
                  </View>

                  {/* Stats */}
                  <View style={s.slStatsList}>
                    <View style={s.slStatItem}>
                      <Ionicons name="moon" size={14} color="#a78bfa" />
                      <View>
                        <Text style={s.slStatVal}>7h 42m</Text>
                        <Text style={s.slStatLabel}>Duration</Text>
                      </View>
                    </View>
                    <View style={s.slStatItem}>
                      <Ionicons name="bed" size={14} color="#60a5fa" />
                      <View>
                        <Text style={s.slStatVal}>11:08 PM</Text>
                        <Text style={s.slStatLabel}>Bedtime</Text>
                      </View>
                    </View>
                    <View style={s.slStatItem}>
                      <Ionicons name="sunny" size={14} color="#fbbf24" />
                      <View>
                        <Text style={s.slStatVal}>6:50 AM</Text>
                        <Text style={s.slStatLabel}>Wake up</Text>
                      </View>
                    </View>
                  </View>
                </View>
              </LinearGradient>
            </PressCard>

            {/* 2. Sleep Stages bar chart */}
            <PressCard index={1} onPress={() => navigation.navigate("SleepDashboard")}>
              <View style={s.slStagesCard}>
                <Text style={s.slCardTitle}>Sleep stages</Text>
                <Text style={s.slCardSub}>Last night's cycles</Text>
                <View style={s.slBarsRow}>
                  {[
                    { h: 90, c: "#facc15" },
                    { h: 55, c: "#c084fc" },
                    { h: 30, c: "#818cf8" },
                    { h: 75, c: "#a78bfa" },
                    { h: 25, c: "#818cf8" },
                    { h: 95, c: "#facc15" },
                    { h: 70, c: "#a78bfa" },
                    { h: 40, c: "#c084fc" },
                    { h: 20, c: "#818cf8" },
                    { h: 60, c: "#a78bfa" },
                    { h: 100, c: "#facc15" },
                    { h: 35, c: "#c084fc" },
                  ].map((b, i) => (
                    <View key={i} style={s.slBarTrack}>
                      <View style={[s.slBarFill, { height: `${b.h}%` as any, backgroundColor: b.c }]} />
                    </View>
                  ))}
                </View>
                <View style={s.slAxisRow}>
                  <Text style={s.slAxisLabel}>11 PM</Text>
                  <Text style={s.slAxisLabel}>2 AM</Text>
                  <Text style={s.slAxisLabel}>7 AM</Text>
                </View>
                <View style={s.slLegendRow}>
                  {[["#facc15", "Awake"], ["#c084fc", "REM"], ["#a78bfa", "Light"], ["#818cf8", "Deep"]].map(([c, l]) => (
                    <View key={l} style={s.slLegendItem}>
                      <View style={[s.slLegendDot, { backgroundColor: c }]} />
                      <Text style={s.slLegendText}>{l}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </PressCard>

            {/* 3. 7-Day History */}
            <PressCard index={2} onPress={() => navigation.navigate("SleepDashboard")}>
              <View style={s.slHistoryCard}>
                <Text style={s.slCardTitle}>Sleep history</Text>
                <Text style={s.slCardSub}>Last 7 nights</Text>
                <View style={s.slHistRow}>
                  {[
                    { day: "Mon", h: 6.5, score: 72 },
                    { day: "Tue", h: 7.2, score: 80 },
                    { day: "Wed", h: 5.8, score: 65 },
                    { day: "Thu", h: 8.1, score: 88 },
                    { day: "Fri", h: 7.5, score: 83 },
                    { day: "Sat", h: 8.5, score: 91 },
                    { day: "Sun", h: 7.7, score: 85, today: true },
                  ].map((d) => (
                    <View key={d.day} style={s.slHistCol}>
                      <Text style={[s.slHistScore, d.today && { color: "#a78bfa" }]}>{d.score}</Text>
                      <View style={s.slHistBarTrack}>
                        <View style={[
                          s.slHistBarFill,
                          { height: `${(d.h / 9) * 100}%` as any },
                          d.today && { backgroundColor: "#a78bfa" }
                        ]} />
                      </View>
                      <Text style={[s.slHistDayLabel, d.today && { color: "#a78bfa", fontWeight: "700" }]}>{d.day}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </PressCard>

            {/* 4. Wind Down shortcuts (2×2 grid) */}
            <View style={s.slWindSection}>
              <Text style={s.slSectionHeading}>Wind down</Text>
              <View style={s.slWindGrid}>
                {[
                  { label: "Meditation", icon: "body" as const, bg: "#064e3b", route: "MeditationDashboard" },
                  { label: "Music", icon: "musical-notes" as const, bg: "#1e3a8a" },
                  { label: "Breathing", icon: "aperture" as const, bg: "#7c2d12" },
                  { label: "Sleep Alarm", icon: "alarm" as const, bg: "#312e81", route: "SleepDashboard" },
                ].map((w) => (
                  <Pressable
                    key={w.label}
                    style={[s.slWindCard, { backgroundColor: w.bg }]}
                    onPress={() => w.route ? navigation.navigate(w.route as any) : {}}
                  >
                    <View style={s.slWindIcon}>
                      <Ionicons name={w.icon} size={22} color="white" />
                    </View>
                    <Text style={s.slWindLabel}>{w.label}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* 5. Smart alarm card */}
            <PressCard index={4} onPress={() => navigation.navigate("SleepDashboard")}>
              <View style={s.slAlarmCard}>
                <View style={s.slAlarmLeft}>
                  <View style={s.slAlarmIconBox}>
                    <Ionicons name="alarm" size={22} color="#a78bfa" />
                  </View>
                  <View>
                    <Text style={s.slAlarmTime}>07:15 <Text style={s.slAlarmAmPm}>AM</Text></Text>
                    <View style={s.slAlarmMeta}>
                      <Ionicons name="sparkles" size={11} color="#a78bfa" />
                      <Text style={s.slAlarmMetaText}>Smart Alarm · Tomorrow</Text>
                    </View>
                  </View>
                </View>
                <View style={s.slToggleTrack}>
                  <View style={s.slToggleThumb} />
                </View>
              </View>
            </PressCard>

            {/* Edit home */}
            <View style={s.editHomeWrap}>
              <Pressable style={s.editHomeBtn} onPress={() => {}}>
                <Text style={s.editHomeText}>Edit home</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            TAB 3: VITALS (In-Page Sub-Category matching Samsung Health)
            ═══════════════════════════════════════════════════════════════ */}
        {activePill === 3 && (
          <View style={s.vitalsSubView}>
            {/* Header */}
            <Animated.View entering={FadeInDown.duration(350).springify()}>
              <Text style={s.subCategoryTitle}>Vitals</Text>
              <Text style={s.subCategoryAdvice}>
                Tracking your vitals on a regular basis helps you notice small changes in your health.
              </Text>
            </Animated.View>

            {/* 1. Heart health — purple gradient */}
            <PressCard index={0} onPress={() => navigation.navigate("HealthDashboard")}>
              <LinearGradient
                colors={["#8b48ad", "#a259c4", "#b368d4"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={s.vitalsCard}
              >
                <Text style={s.vitalsCardLabel}>Heart health</Text>
                
                {/* 3D Glowing Heart with Concentric Ripple Rings */}
                <View style={s.vtHeartHealthWrap}>
                  <View style={s.vtHeartRingOuter}>
                    <View style={s.vtHeartRingMid}>
                      <Ionicons name="heart" size={32} color="#ff69b4" />
                    </View>
                  </View>
                </View>

                <View style={{ flex: 1 }} />
                <Text style={s.vitalsCardDesc}>
                  See your heart health score plus key health insights in one place.
                </Text>
              </LinearGradient>
            </PressCard>

            {/* 2. Vitals (Radar Scan) — bright cyan/teal */}
            <PressCard index={1} onPress={() => navigation.navigate("VitalsScreen" as any)}>
              <LinearGradient
                colors={["#0086b5", "#009ecd", "#14b0df"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={s.vitalsCard}
              >
                <Text style={s.vitalsCardLabel}>Vitals</Text>

                {/* 3D Radar/Sonar Scan Graphic */}
                <View style={s.vtRadarWrap}>
                  <View style={s.vtRadarOuter}>
                    <View style={s.vtRadarSweep} />
                    <View style={s.vtRadarDot1} />
                    <View style={s.vtRadarDot2} />
                    <View style={s.vtRadarDot3} />
                    <View style={s.vtRadarDot4} />
                  </View>
                </View>

                <View style={{ flex: 1 }} />
                <Text style={s.vitalsCardDesc}>
                  Learn how tracking vitals during sleep can help you spot meaningful changes in your body.
                </Text>
              </LinearGradient>
            </PressCard>

            {/* 3. Heart rate — coral/crimson gradient */}
            <PressCard index={2} onPress={() => navigation.navigate("HealthDashboard")}>
              <LinearGradient
                colors={["#d13b55", "#e64a66", "#f45b77"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={s.vitalsCard}
              >
                <Text style={s.vitalsCardLabel}>Heart rate</Text>

                {/* 3D Heart with contour wave highlights */}
                <View style={s.vtHeartRateWrap}>
                  <View style={s.vtHeartRateWaveOuter}>
                    <View style={s.vtHeartRateWaveInner}>
                      <Ionicons name="heart" size={44} color="#ff1744" />
                    </View>
                  </View>
                </View>

                <View style={{ flex: 1 }} />
                <Text style={s.vitalsCardDesc}>Keep track of your heart rate.</Text>
              </LinearGradient>
            </PressCard>

            {/* 4. Blood oxygen — royal blue gradient */}
            <PressCard index={3} onPress={() => navigation.navigate("HealthDashboard")}>
              <LinearGradient
                colors={["#195fc7", "#236fe0", "#3884f2"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={s.vitalsCard}
              >
                <Text style={s.vitalsCardLabel}>Blood oxygen</Text>

                {/* 3D Oxygen molecules & cells */}
                <View style={s.vtOxygenWrap}>
                  <View style={s.vtOxygenDisc1}><View style={s.vtOxygenCore} /></View>
                  <View style={s.vtOxygenDisc2}><View style={s.vtOxygenCore} /></View>
                  <View style={s.vtOxygenDisc3}><View style={s.vtOxygenCore} /></View>
                </View>

                <View style={{ flex: 1 }} />
                <Text style={s.vitalsCardDesc}>Check to make sure you're getting enough oxygen.</Text>
              </LinearGradient>
            </PressCard>

            {/* 5. Blood pressure — rose/crimson gradient */}
            <PressCard index={4} onPress={() => navigation.navigate("HealthDashboard")}>
              <LinearGradient
                colors={["#c44662", "#d85572", "#e86582"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={s.vitalsCard}
              >
                <Text style={s.vitalsCardLabel}>Blood pressure</Text>

                {/* 3D Floating Blood Cells */}
                <View style={s.vtBpWrap}>
                  <View style={s.vtBpDisc1} />
                  <View style={s.vtBpDisc2} />
                  <View style={s.vtBpDisc3} />
                  <View style={s.vtBpDisc4} />
                </View>

                <View style={{ flex: 1 }} />
                <Text style={s.vitalsCardDesc}>Keep tracking your blood pressure to see how it changes.</Text>
              </LinearGradient>
            </PressCard>

            {/* 6. Vascular load — magenta gradient */}
            <PressCard index={5} onPress={() => navigation.navigate("HealthDashboard")}>
              <LinearGradient
                colors={["#b0356c", "#c4427c", "#d5508c"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={s.vitalsCard}
              >
                <Text style={s.vitalsCardLabel}>Vascular load</Text>

                {/* 3D Artery Tube & Beaker Badge */}
                <View style={s.vtVascWrap}>
                  <View style={s.vtVascTubeOuter}>
                    <View style={s.vtVascTubeInner} />
                    <View style={s.vtVascCell1} />
                    <View style={s.vtVascCell2} />
                  </View>
                  <View style={s.flaskBadge}>
                    <Ionicons name="flask" size={13} color="#ffffff" />
                  </View>
                </View>

                <View style={{ flex: 1 }} />
                <Text style={s.vitalsCardDesc}>
                  Learn how monitoring stress on your vascular system can help you adjust your habits for better health.
                </Text>
              </LinearGradient>
            </PressCard>

            <View style={s.editHomeWrap}>
              <Pressable style={s.editHomeBtn} onPress={() => {}}>
                <Text style={s.editHomeText}>Edit home</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            TAB 4: MINDFULNESS / MEDITATION
            ═══════════════════════════════════════════════════════════════ */}
        {activePill === 4 && (
          <View style={s.mindSubView}>
            {/* Header */}
            <Animated.View entering={FadeInDown.duration(350).springify()}>
              <Text style={s.subCategoryTitle}>Mindfulness</Text>
              <Text style={s.subCategoryAdvice}>
                Purposeful pauses are a great way to keep your energy going. How about a few gentle stretches right now?
              </Text>
            </Animated.View>

            {/* Mindfulness card with 3 sub-tiles */}
            <PressCard index={0} onPress={() => navigation.navigate("MeditationDashboard")}>
              <View style={s.mindMainCard}>
                <View style={s.mindMainHeader}>
                  <Text style={s.mindMainTitle}>Mindfulness</Text>
                  <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.6)" />
                </View>
                <View style={s.mindTilesRow}>
                  {/* 1. Mood check-in */}
                  <Pressable style={s.mindTile} onPress={() => navigation.navigate("WellnessDashboard")}>
                    <View style={s.moodGraphicBox}>
                      <View style={s.moodWave1} />
                      <View style={s.moodWave2} />
                      <View style={s.moodWave3} />
                    </View>
                    <Text style={s.mindTileLabel}>Mood{"\n"}check-in</Text>
                  </Pressable>

                  {/* 2. Breathing exercises */}
                  <Pressable style={s.mindTile} onPress={() => navigation.navigate("MeditationDashboard")}>
                    <View style={s.breathGraphicBox}>
                      <View style={s.breathOrb1} />
                      <View style={s.breathOrb2} />
                    </View>
                    <Text style={s.mindTileLabel}>Breathing{"\n"}exercises</Text>
                  </Pressable>

                  {/* 3. Meditation */}
                  <Pressable style={s.mindTile} onPress={() => navigation.navigate("MeditationDashboard")}>
                    <View style={s.zenGraphicBox}>
                      <View style={s.zenStone1} />
                      <View style={s.zenStone2} />
                      <View style={s.zenStone3} />
                    </View>
                    <Text style={s.mindTileLabel}>Meditation</Text>
                  </Pressable>
                </View>
              </View>
            </PressCard>

            {/* Stress card — ochre/yellow-amber */}
            <PressCard index={1} onPress={() => navigation.navigate("WellnessDashboard")}>
              <LinearGradient
                colors={["#9e6400", "#b87600", "#cb8600"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={s.stressCard}
              >
                <Text style={s.stressLabel}>Stress</Text>

                {/* 3D Spiral Spring Coil (Green -> Lime -> Yellow -> Orange) */}
                <View style={s.springWrap}>
                  <View style={[s.springRing, s.springRing1]} />
                  <View style={[s.springRing, s.springRing2]} />
                  <View style={[s.springRing, s.springRing3]} />
                  <View style={[s.springRing, s.springRing4]} />
                  <View style={[s.springRing, s.springRing5]} />
                </View>

                <View style={{ flex: 1 }} />
                <Text style={s.stressDesc}>Learn how to track your stress level.</Text>
              </LinearGradient>
            </PressCard>

            <View style={s.editHomeWrap}>
              <Pressable style={s.editHomeBtn} onPress={() => {}}>
                <Text style={s.editHomeText}>Edit home</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            TAB 5: NUTRITION
            ═══════════════════════════════════════════════════════════════ */}
        {activePill === 5 && (
          <View style={s.nutriSubView}>
            {/* Header */}
            <Animated.View entering={FadeInDown.duration(350).springify()}>
              <Text style={s.subCategoryTitle}>Nutrition</Text>
              <Text style={s.subCategoryAdvice}>
                Water helps your body refresh. Small habits like drinking water help promote good health.
              </Text>
            </Animated.View>

            {/* 1. Food — vibrant orange card with 3D orange slice */}
            <PressCard index={0} onPress={() => navigation.navigate("NutritionDashboard")}>
              <LinearGradient
                colors={["#cb4d11", "#dd5b1b", "#eb6724"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={s.nutriCard}
              >
                <Text style={s.nutriCardLabel}>Food</Text>
                
                {/* 3D Orange Slice */}
                <View style={s.orangeSliceWrap}>
                  <View style={s.orangeSlicePeel}>
                    <View style={s.orangeSlicePith}>
                      <View style={s.orangeSlicePulp}>
                        <View style={s.orangeSegment1} />
                        <View style={s.orangeSegment2} />
                        <View style={s.orangeSegment3} />
                        <View style={s.orangeCenterPip} />
                      </View>
                    </View>
                  </View>
                </View>

                <View style={{ flex: 1 }} />
                <Text style={s.nutriCardDesc}>
                  {nutritionTotals.totalCalories > 0
                    ? `${nutritionTotals.totalCalories} kcal logged today across meals.`
                    : "Ready to make logging meals a habit?"}
                </Text>
              </LinearGradient>
            </PressCard>

            {/* 2. Body composition — sky-blue card with 3D organic fluid/ring */}
            <PressCard index={1} onPress={() => navigation.navigate("WeightLogDashboard")}>
              <LinearGradient
                colors={["#007eb8", "#0091d6", "#0fa2e8"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={s.nutriCard}
              >
                <Text style={s.nutriCardLabel}>Body composition</Text>

                {/* 3D Fluid Blob & Handle */}
                <View style={s.bodyCompWrap}>
                  <View style={s.bodyCompBlob1} />
                  <View style={s.bodyCompBlob2} />
                  <View style={s.bodyCompHandle} />
                </View>

                <View style={{ flex: 1 }} />
                <Text style={s.nutriCardDesc}>Track your weight and body composition.</Text>
              </LinearGradient>
            </PressCard>

            {/* 3. Water — vivid cyan card with realistic 3D glass of water */}
            <PressCard index={2} onPress={() => navigation.navigate("HydrationDashboard")}>
              <LinearGradient
                colors={["#008bc7", "#009fe6", "#14adf2"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={s.nutriCard}
              >
                <Text style={s.nutriCardLabel}>Water</Text>

                {/* 3D Glass of Water */}
                <View style={s.waterGlassWrap}>
                  <View style={s.waterGlassBody}>
                    <View style={s.waterGlassRim} />
                    <View style={s.waterGlassSheen} />
                    <View style={s.waterGlassFill}>
                      <View style={s.waterSurface} />
                      <View style={s.waterBubble1} />
                      <View style={s.waterBubble2} />
                    </View>
                  </View>
                </View>

                <View style={{ flex: 1 }} />
                <Text style={s.nutriCardDesc}>Ready to make staying hydrated a habit?</Text>
              </LinearGradient>
            </PressCard>

            {/* 4. Blood glucose — terracotta card with 3D red blood cells and molecule */}
            <PressCard index={3} onPress={() => navigation.navigate("HealthDashboard")}>
              <LinearGradient
                colors={["#ba5132", "#ce5e3d", "#de6a46"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={s.nutriCard}
              >
                <Text style={s.nutriCardLabel}>Blood glucose</Text>

                {/* 3D Red Blood Cells + Glucose Molecule */}
                <View style={s.glucoseWrap}>
                  <View style={s.rbc1}>
                    <View style={s.rbcCenter} />
                  </View>
                  <View style={s.rbc2}>
                    <View style={s.rbcCenter} />
                  </View>
                  <View style={s.glucoseAtom1} />
                  <View style={s.glucoseAtom2} />
                  <View style={s.glucoseAtom3} />
                </View>

                <View style={{ flex: 1 }} />
                <Text style={s.nutriCardDesc}>Record your glucose levels to help you manage your blood sugar.</Text>
              </LinearGradient>
            </PressCard>

            {/* 5. Antioxidant index — purple card with chemistry flask badge & 3D cell */}
            <PressCard index={4} onPress={() => navigation.navigate("AdvancedNutritionDashboard")}>
              <LinearGradient
                colors={["#6f4ec2", "#815fd2", "#906ee0"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={s.nutriCard}
              >
                <Text style={s.nutriCardLabel}>Antioxidant index</Text>

                {/* 3D Cell Graphic + Flask Badge */}
                <View style={s.antioxWrap}>
                  <View style={s.antioxOuterCell}>
                    <View style={s.antioxMidCell}>
                      <View style={s.antioxInnerCell} />
                    </View>
                  </View>
                  <View style={s.antioxOuterCell2} />
                  <View style={s.flaskBadge}>
                    <Ionicons name="flask" size={13} color="#ffffff" />
                  </View>
                </View>

                <View style={{ flex: 1 }} />
                <Text style={s.nutriCardDesc}>Learn how this index helps you see if you're getting enough fruits and vegetables.</Text>
              </LinearGradient>
            </PressCard>

            {/* 6. AGEs index — golden/mustard card with 3D crispy golden cubes */}
            <PressCard index={5} onPress={() => navigation.navigate("AdvancedNutritionDashboard")}>
              <LinearGradient
                colors={["#ad801c", "#c29124", "#d3a12d"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={s.nutriCard}
              >
                <Text style={s.nutriCardLabel}>AGEs index</Text>

                {/* 3D Crispy Golden Cubes */}
                <View style={s.agesWrap}>
                  <View style={s.agesCube1}>
                    <View style={s.agesCubeTop} />
                    <View style={s.agesCubeFront} />
                  </View>
                  <View style={s.agesCube2}>
                    <View style={s.agesCubeTop} />
                    <View style={s.agesCubeFront} />
                  </View>
                  <View style={s.agesCube3}>
                    <View style={s.agesCubeTop} />
                    <View style={s.agesCubeFront} />
                  </View>
                </View>

                <View style={{ flex: 1 }} />
                <Text style={s.nutriCardDesc}>Learn how your AGEs index can give you a sense of your metabolic health.</Text>
              </LinearGradient>
            </PressCard>

            <View style={s.editHomeWrap}>
              <Pressable style={s.editHomeBtn} onPress={() => {}}>
                <Text style={s.editHomeText}>Edit home</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Bottom nav clearance */}
        <View style={{ height: 110 }} />
      </ScrollView>

      {/* ── Samsung-style Bottom Navigation (Persistent with Home Active) ── */}
      <SamsungBottomNav activeRoute="HomeDashboard" />
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const CARD_HALF = (SW - 32 - 10) / 2;

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0c0e12" },

  // Top Ambient Glow
  topAmbientGlow: {
    position: "absolute", top: 0, left: 0, right: 0, height: 180,
  },

  // Top Bar
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 52,
    paddingBottom: 10,
  },
  appTitle: { fontSize: 26, fontWeight: "700", color: "#ffffff" },
  topBarRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  avatarBtn: {
    width: 38, height: 38, borderRadius: 19,
    borderWidth: 2, borderColor: "#00c6aa", overflow: "visible",
  },
  avatarBtnInner: { flex: 1, borderRadius: 19, justifyContent: "center", alignItems: "center" },
  avatarInitials: { fontSize: 14, fontWeight: "700", color: "white" },
  avatarOnlineDot: {
    position: "absolute", bottom: -1, right: -1,
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: "#ff6a00",
    borderWidth: 1.5, borderColor: "#0d0d14",
  },
  menuBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.08)",
    justifyContent: "center", alignItems: "center",
  },
  menuDotBadge: {
    position: "absolute", top: 5, right: 5,
    width: 7, height: 7, borderRadius: 3.5,
    backgroundColor: "#ff6a00",
    borderWidth: 1, borderColor: "#0d0d14",
  },

  // Pills Bar
  pillsScroll: { marginHorizontal: 12, marginBottom: 10 },
  pillsContent: {
    paddingHorizontal: 4,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    backgroundColor: "rgba(255,255,255,0.055)",
    borderRadius: 50,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  pillBtn: { paddingHorizontal: 2 },
  pillBg: {
    width: 48, height: 48, borderRadius: 24,
    justifyContent: "center", alignItems: "center",
  },
  pillBgActive: { backgroundColor: "rgba(255,255,255,0.2)" },

  // Scroll Container
  scroll: { paddingHorizontal: 16, paddingTop: 4 },

  // ═════════════════════════════════════════════════════════════
  // ACTIVITY SUB-CATEGORY STYLES
  // ═════════════════════════════════════════════════════════════
  activitySubView: { gap: 12 },
  subCategoryTitle: {
    fontSize: 28, fontWeight: "700", color: "#ffffff", marginBottom: 6,
  },
  subCategoryAdvice: {
    fontSize: 13.5, color: "rgba(255,255,255,0.7)", lineHeight: 20, marginBottom: 8,
  },

  // 1. Daily Activity Card
  actDailyCard: {
    backgroundColor: "#1c1e28",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  actDailyTitle: {
    fontSize: 15, fontWeight: "600", color: "white", marginBottom: 16,
  },
  actDailyRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
  },
  actStatsList: { gap: 14 },
  actStatItem: { flexDirection: "row", alignItems: "center", gap: 10 },
  actStatIconWrap: {
    width: 26, height: 26, borderRadius: 13, justifyContent: "center", alignItems: "center",
  },
  actStatVal: { fontSize: 18, fontWeight: "700", color: "white" },
  actStatUnit: { fontSize: 13, fontWeight: "400", color: "rgba(255,255,255,0.55)" },
  actHeartWrap: {
    width: 100, height: 100, justifyContent: "center", alignItems: "center",
  },
  actHeartRing: {
    borderRadius: 100, borderWidth: 4.5, justifyContent: "center", alignItems: "center",
  },

  // 2. Workouts This Week (Green)
  actGreenCard: {
    borderRadius: 24, padding: 22, flexDirection: "row", alignItems: "center",
    minHeight: 140, overflow: "hidden", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)",
  },
  actWideTextWrap: { flex: 1, marginRight: 12 },
  actCardLabel: { fontSize: 14, color: "rgba(255,255,255,0.8)", marginBottom: 8 },
  actCardDesc: { fontSize: 13.5, color: "white", lineHeight: 20, fontWeight: "500" },

  // Stopwatch 3D graphic
  stopwatchWrap: { width: 80, height: 80, justifyContent: "center", alignItems: "center" },
  stopwatchRadarOuter: {
    width: 78, height: 78, borderRadius: 39, backgroundColor: "rgba(255,255,255,0.06)",
    justifyContent: "center", alignItems: "center",
  },
  stopwatchRadarInner: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: "rgba(255,255,255,0.08)",
    justifyContent: "center", alignItems: "center",
  },
  stopwatchBody: {
    width: 50, height: 50, borderRadius: 25, backgroundColor: "#2dd4bf",
    justifyContent: "center", alignItems: "center",
  },
  stopwatchCrown: {
    position: "absolute", top: -4, width: 8, height: 4, borderRadius: 2, backgroundColor: "#14b8a6",
  },
  stopwatchDialCenter: {
    width: 6, height: 6, borderRadius: 3, backgroundColor: "#042f2e", justifyContent: "center", alignItems: "center",
  },
  stopwatchNeedle: {
    position: "absolute", top: -14, width: 2.5, height: 16, backgroundColor: "#042f2e", borderRadius: 1.5,
  },

  // 3. Daily Cardio Load (Blue)
  actBlueCard: {
    borderRadius: 24, padding: 22, flexDirection: "row", alignItems: "center",
    minHeight: 140, overflow: "hidden", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)",
  },
  speedoGaugeWrap: { width: 80, height: 80, justifyContent: "center", alignItems: "center" },
  speedoGaugeOuter: {
    width: 78, height: 78, borderRadius: 39, backgroundColor: "rgba(255,255,255,0.06)",
    justifyContent: "center", alignItems: "center",
  },
  speedoGaugeInner: {
    width: 56, height: 56, borderRadius: 28, backgroundColor: "rgba(255,255,255,0.12)",
    justifyContent: "center", alignItems: "center",
  },

  // 4. Fitness Index (Jade)
  actJadeCard: {
    borderRadius: 24, padding: 22, flexDirection: "row", alignItems: "center",
    minHeight: 140, overflow: "hidden", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)",
  },
  pentagonWrap: { width: 80, height: 80, justifyContent: "center", alignItems: "center" },
  pentagonOuter: {
    width: 74, height: 74, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.08)",
    justifyContent: "center", alignItems: "center", transform: [{ rotate: "45deg" }],
  },
  pentagonInner: {
    width: 52, height: 52, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center", alignItems: "center", transform: [{ rotate: "-45deg" }],
  },

  // 5. Steps Card & 7-Day Chart
  actStepsCard: {
    backgroundColor: "#1c1e28", borderRadius: 24, padding: 20,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", minHeight: 150,
  },
  actStepsTitle: { fontSize: 15, fontWeight: "600", color: "white", marginBottom: 6 },
  actStepsValue: { fontSize: 38, fontWeight: "700", color: "white", lineHeight: 46 },
  actStepsGoal: { fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 16 },
  actBarChartRow: {
    flexDirection: "row", justifyContent: "flex-end", alignItems: "flex-end", gap: 14,
    marginTop: -40, alignSelf: "flex-end",
  },
  actBarCol: { alignItems: "center", gap: 6 },
  actBarTrack: {
    width: 14, height: 60, borderRadius: 7, backgroundColor: "rgba(255,255,255,0.05)",
    justifyContent: "flex-end",
  },
  actBarFillGreen: {
    width: 14, height: 52, borderRadius: 7, backgroundColor: "#22c55e",
  },
  actBarDayLabel: { fontSize: 11, color: "rgba(255,255,255,0.45)", fontWeight: "600" },
  actBarDayToday: { color: "#ef4444", fontWeight: "700" },

  // 6. Running Coach
  actCoachCard: {
    backgroundColor: "#1c1e28", borderRadius: 24, padding: 20,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
  },
  actCoachHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 14 },
  actCoachLabel: { fontSize: 15, fontWeight: "600", color: "white" },
  actBetaBadge: {
    backgroundColor: "rgba(255,255,255,0.12)", paddingHorizontal: 7, paddingVertical: 2,
    borderRadius: 8,
  },
  actBetaText: { fontSize: 10, fontWeight: "700", color: "rgba(255,255,255,0.65)" },
  actCoachBody: { flexDirection: "row", alignItems: "center", gap: 16 },
  actCoachIconCircle: {
    width: 58, height: 58, borderRadius: 29, backgroundColor: "rgba(255,152,0,0.15)",
    borderWidth: 1, borderColor: "rgba(255,152,0,0.3)",
    justifyContent: "center", alignItems: "center",
  },
  actCoachTextWrap: { flex: 1 },
  actCoachTitle: { fontSize: 16, fontWeight: "700", color: "white", marginBottom: 4 },
  actCoachSub: { fontSize: 12.5, color: "rgba(255,255,255,0.65)", lineHeight: 18 },

  // 7. Exercise Shortcuts
  actExerciseCard: {
    backgroundColor: "#1c1e28", borderRadius: 24, padding: 20,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
  },
  actExerciseTitle: { fontSize: 15, fontWeight: "600", color: "white", marginBottom: 18 },
  actExerciseGrid: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
  },
  actExBtn: { alignItems: "center", gap: 8 },
  actExCircle: {
    width: 60, height: 60, borderRadius: 30, justifyContent: "center", alignItems: "center",
    elevation: 4, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4,
  },
  actExLabel: { fontSize: 12, fontWeight: "600", color: "rgba(255,255,255,0.75)" },

  // Other sub-categories placeholder
  otherSubView: { paddingVertical: 20, alignItems: "center" },
  exploreModuleBtn: { marginTop: 20, width: "100%" },
  exploreModuleGrad: {
    paddingVertical: 14, paddingHorizontal: 20, borderRadius: 16,
    flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8,
  },
  exploreModuleText: { color: "white", fontWeight: "700", fontSize: 14 },

  // ═════════════════════════════════════════════════════════════
  // OVERVIEW TAB STYLES (Existing)
  // ═════════════════════════════════════════════════════════════
  heroWrap: { marginBottom: 12, borderRadius: 22, overflow: "hidden" },
  heroSlide: {
    width: SW - 32, minHeight: 160, borderRadius: 22,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", overflow: "hidden",
  },
  heroInner: { padding: 22, flex: 1 },
  heroTitle: { fontSize: 20, fontWeight: "700", color: "white", lineHeight: 28, marginBottom: 8 },
  heroSub: { fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 18, marginBottom: 18 },
  dotsRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  dot: { width: 18, height: 5, borderRadius: 2.5, backgroundColor: "rgba(255,255,255,0.3)" },
  dotActive: { width: 28, backgroundColor: "white" },

  alertBanner: {
    backgroundColor: "#1c1f2b", borderRadius: 18, padding: 18, marginBottom: 12,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.07)",
  },
  alertText: { fontSize: 13.5, color: "rgba(255,255,255,0.85)", lineHeight: 20, marginBottom: 14 },
  alertBtns: { flexDirection: "row", justifyContent: "flex-end", gap: 20 },
  alertBtnPlain: { fontSize: 14, fontWeight: "600", color: "rgba(255,255,255,0.6)" },
  alertBtnBold: { fontSize: 14, fontWeight: "700", color: "#ffffff" },

  energyCard: {
    borderRadius: 22, padding: 20, flexDirection: "row", alignItems: "center",
    minHeight: 140, overflow: "hidden", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)",
  },
  energyBlob: {
    position: "absolute", right: -20, top: -30, width: 160, height: 160, borderRadius: 80,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  energyTextWrap: { flex: 1, marginRight: 12 },
  energyLabel: { fontSize: 14, color: "rgba(255,255,255,0.75)", marginBottom: 8 },
  energyDesc: { fontSize: 13.5, color: "white", lineHeight: 20 },
  energyIconWrap: { width: 80, height: 80, justifyContent: "center", alignItems: "center" },
  flameOuter: { position: "absolute" },
  flameSpark1: { position: "absolute", top: 4, right: 6 },
  flameSpark2: { position: "absolute", top: 14, right: 2 },

  row2: { flexDirection: "row", gap: 10 },
  halfOuter: { flex: 1 },
  halfCard: {
    borderRadius: 22, padding: 16, height: CARD_HALF, overflow: "hidden",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.07)",
  },
  halfTitle: { fontSize: 14, fontWeight: "700", color: "white", marginBottom: 4, zIndex: 1 },
  halfSub: { fontSize: 11.5, color: "rgba(255,255,255,0.65)", lineHeight: 16, zIndex: 1 },

  heartRingWrap: { flex: 1, justifyContent: "center", alignItems: "center" },
  ring: { borderRadius: 100, borderWidth: 5, justifyContent: "center", alignItems: "center" },

  sleepStar1: { position: "absolute", top: 16, right: 16, color: "#9d8fdd", fontSize: 10 },
  sleepStar2: { position: "absolute", top: 28, right: 30, color: "#9d8fdd", fontSize: 8 },
  sleepStar3: { position: "absolute", top: 20, right: 44, color: "#9d8fdd", fontSize: 16 },
  sleepMoon: { position: "absolute", bottom: 16, right: 10, opacity: 0.85 },

  orangeDecor: { position: "absolute", bottom: -10, right: -10, opacity: 0.9 },
  quickGrid: {
    backgroundColor: "#1c1c28", borderRadius: 22, borderWidth: 1, borderColor: "rgba(255,255,255,0.07)",
    justifyContent: "center", alignItems: "center", gap: 10, padding: 12,
  },
  quickRow: { flexDirection: "row", gap: 10 },

  wideCard: {
    borderRadius: 22, padding: 20, flexDirection: "row", alignItems: "center",
    minHeight: 130, marginTop: 10, overflow: "hidden", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)",
  },
  wideBlob: {
    position: "absolute", right: -20, top: -30, width: 160, height: 160, borderRadius: 80,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  wideTextWrap: { flex: 1, marginRight: 12 },
  wideLabel: { fontSize: 13.5, color: "rgba(255,255,255,0.75)", marginBottom: 8 },
  wideDesc: { fontSize: 13.5, color: "white", lineHeight: 20 },

  heartIconWrap: { width: 70, height: 70, justifyContent: "center", alignItems: "center" },
  heartRingLg: {
    width: 68, height: 68, borderRadius: 34, borderWidth: 2.5, borderColor: "rgba(255,74,141,0.4)",
    justifyContent: "center", alignItems: "center",
  },
  heartRingMd: {
    width: 50, height: 50, borderRadius: 25, backgroundColor: "rgba(255,74,141,0.15)",
    justifyContent: "center", alignItems: "center",
  },

  flowerWrap: { width: 70, height: 70, justifyContent: "center", alignItems: "center" },

  pillIconBox: {
    width: 46, height: 46, borderRadius: 23, backgroundColor: "rgba(156,142,245,0.15)",
    justifyContent: "center", alignItems: "center", marginBottom: 10,
  },
  medTime: { fontSize: 22, fontWeight: "700", color: "white", marginTop: 4 },
  medName: { fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 2 },

  moleculeWrap: { position: "absolute", bottom: 10, right: 10 },
  soundWaveWrap: { position: "absolute", right: -4, bottom: 10 },

  stepsNumber: { fontSize: 36, fontWeight: "700", color: "white", lineHeight: 44 },
  stepsGoal: { fontSize: 11, color: "rgba(255,255,255,0.45)", marginBottom: 10 },
  stepsBarBg: { height: 5, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.1)", marginTop: "auto" },
  stepsBarFill: { height: 5, borderRadius: 3, backgroundColor: "#ffffff" },

  radarWrap: { position: "absolute", right: -4, bottom: 8 },
  speedoWrap: { position: "absolute", right: -4, bottom: 8 },

  servicesBtn: {
    borderRadius: 24, paddingVertical: 18, paddingHorizontal: 20,
    flexDirection: "row", alignItems: "center", marginTop: 10, overflow: "hidden",
    borderWidth: 1, borderColor: "rgba(0,188,212,0.4)", elevation: 10,
    shadowColor: "#00bcd4", shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.45, shadowRadius: 14,
  },
  servicesBtnBlob: {
    position: "absolute", top: -30, right: -30, width: 130, height: 130, borderRadius: 65,
    backgroundColor: "rgba(255,255,255,0.07)",
  },
  servicesBtnIconWrap: {
    width: 52, height: 52, borderRadius: 26, backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center", alignItems: "center", marginRight: 14, flexShrink: 0,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.25)",
  },
  servicesBtnText: { flex: 1 },
  servicesBadge: {
    backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 10,
    paddingHorizontal: 8, paddingVertical: 2, alignSelf: "flex-start",
    marginBottom: 5, borderWidth: 1, borderColor: "rgba(255,255,255,0.25)",
  },
  servicesBadgeTxt: { fontSize: 9, fontWeight: "800", color: "white", letterSpacing: 1.1 },
  servicesBtnTitle: { fontSize: 16, fontWeight: "700", color: "white", marginBottom: 2 },
  servicesBtnSub: { fontSize: 11.5, color: "rgba(255,255,255,0.7)" },

  // Edit Home Button
  editHomeWrap: { alignItems: "center", justifyContent: "center", marginTop: 20, marginBottom: 10 },
  editHomeBtn: {
    paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)",
  },
  editHomeText: { fontSize: 13, fontWeight: "600", color: "rgba(255,255,255,0.75)" },

  // ═════════════════════════════════════════════════════════════
  // SLEEP SUB-CATEGORY STYLES
  // ═════════════════════════════════════════════════════════════
  sleepSubView: { gap: 12 },

  // 1. Score Card (deep navy gradient)
  slScoreCard: {
    borderRadius: 24, padding: 22, overflow: "hidden",
    borderWidth: 1, borderColor: "rgba(167,139,250,0.2)",
  },
  slStar1: { position: "absolute", top: 14, left: 22, color: "#a78bfa", fontSize: 12 },
  slStar2: { position: "absolute", top: 30, left: 50, color: "#a78bfa", fontSize: 8 },
  slStar3: { position: "absolute", top: 20, left: 38, color: "#c4b5fd", fontSize: 18 },
  slStar4: { position: "absolute", top: 12, right: 20, color: "#a78bfa", fontSize: 9 },
  slScoreRow: { flexDirection: "row", alignItems: "center", gap: 24 },
  slRingWrap: { alignItems: "center" },
  slRingOuter: {
    width: 100, height: 100, borderRadius: 50,
    borderWidth: 6, borderColor: "#7c3aed",
    justifyContent: "center", alignItems: "center",
    backgroundColor: "rgba(124,58,237,0.12)",
  },
  slRingInner: { alignItems: "center" },
  slRingNum: { fontSize: 32, fontWeight: "800", color: "#e9d5ff" },
  slRingLabel: { fontSize: 10, color: "#a78bfa", fontWeight: "600", letterSpacing: 0.5 },
  slRingQuality: { fontSize: 12, color: "#c4b5fd", fontWeight: "700", marginTop: 8 },
  slStatsList: { flex: 1, gap: 16 },
  slStatItem: { flexDirection: "row", alignItems: "center", gap: 10 },
  slStatVal: { fontSize: 16, fontWeight: "700", color: "white" },
  slStatLabel: { fontSize: 10.5, color: "rgba(255,255,255,0.5)", marginTop: 1 },

  // 2. Sleep Stages Card
  slStagesCard: {
    backgroundColor: "#151222", borderRadius: 24, padding: 20,
    borderWidth: 1, borderColor: "rgba(167,139,250,0.15)",
  },
  slCardTitle: { fontSize: 15, fontWeight: "700", color: "white", marginBottom: 3 },
  slCardSub: { fontSize: 11.5, color: "rgba(255,255,255,0.45)", marginBottom: 14 },
  slBarsRow: {
    flexDirection: "row", alignItems: "flex-end", height: 80,
    gap: 3, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.07)",
    paddingBottom: 4, marginBottom: 8,
  },
  slBarTrack: { flex: 1, height: "100%", justifyContent: "flex-end" },
  slBarFill: { borderRadius: 3 },
  slAxisRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  slAxisLabel: { fontSize: 9.5, color: "rgba(255,255,255,0.4)" },
  slLegendRow: { flexDirection: "row", gap: 12, flexWrap: "wrap" },
  slLegendItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  slLegendDot: { width: 8, height: 8, borderRadius: 4 },
  slLegendText: { fontSize: 11, color: "rgba(255,255,255,0.6)" },

  // 3. 7-Day History
  slHistoryCard: {
    backgroundColor: "#151222", borderRadius: 24, padding: 20,
    borderWidth: 1, borderColor: "rgba(167,139,250,0.15)",
  },
  slHistRow: { flexDirection: "row", alignItems: "flex-end", gap: 4, marginTop: 4 },
  slHistCol: { flex: 1, alignItems: "center", gap: 6 },
  slHistScore: { fontSize: 10, fontWeight: "700", color: "rgba(255,255,255,0.5)" },
  slHistBarTrack: {
    width: "100%", height: 70, borderRadius: 6,
    backgroundColor: "rgba(255,255,255,0.05)",
    justifyContent: "flex-end",
  },
  slHistBarFill: { borderRadius: 6, backgroundColor: "#6d28d9" },
  slHistDayLabel: { fontSize: 10.5, color: "rgba(255,255,255,0.5)", fontWeight: "500" },

  // 4. Wind Down
  slWindSection: { marginTop: 4 },
  slSectionHeading: { fontSize: 18, fontWeight: "700", color: "white", marginBottom: 12 },
  slWindGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  slWindCard: {
    width: "47%", borderRadius: 18, padding: 16, alignItems: "center", gap: 10,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.07)",
  },
  slWindIcon: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: "rgba(255,255,255,0.12)",
    justifyContent: "center", alignItems: "center",
  },
  slWindLabel: { fontSize: 13, color: "white", fontWeight: "600" },

  // 5. Smart Alarm
  slAlarmCard: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    backgroundColor: "#151222", borderRadius: 22, padding: 20,
    borderWidth: 1, borderColor: "rgba(167,139,250,0.15)",
  },
  slAlarmLeft: { flexDirection: "row", alignItems: "center", gap: 14 },
  slAlarmIconBox: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: "rgba(167,139,250,0.15)",
    justifyContent: "center", alignItems: "center",
    borderWidth: 1, borderColor: "rgba(167,139,250,0.25)",
  },
  slAlarmTime: { fontSize: 28, fontWeight: "800", color: "white" },
  slAlarmAmPm: { fontSize: 14, color: "rgba(255,255,255,0.55)" },
  slAlarmMeta: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 3 },
  slAlarmMetaText: { fontSize: 11.5, color: "rgba(255,255,255,0.5)" },
  slToggleTrack: {
    width: 50, height: 26, borderRadius: 13,
    backgroundColor: "#7c3aed", justifyContent: "center", paddingHorizontal: 3,
  },
  slToggleThumb: {
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: "white", alignSelf: "flex-end",
  },

  // ═════════════════════════════════════════════════════════════
  // MINDFULNESS SUB-CATEGORY STYLES (TAB 4)
  // ═════════════════════════════════════════════════════════════
  mindSubView: { gap: 14 },
  mindMainCard: {
    backgroundColor: "#161821",
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  mindMainHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  mindMainTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
  },
  mindTilesRow: {
    flexDirection: "row",
    gap: 10,
  },
  mindTile: {
    flex: 1,
    backgroundColor: "#202430",
    borderRadius: 20,
    padding: 12,
    minHeight: 128,
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.04)",
  },
  mindTileLabel: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#ffffff",
    lineHeight: 17,
  },

  // Mood Graphic (3D Stepped Waves)
  moodGraphicBox: {
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
  },
  moodWave1: {
    width: 22,
    height: 9,
    borderRadius: 5,
    backgroundColor: "#f97316",
    shadowColor: "#ea580c",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 3,
  },
  moodWave2: {
    width: 34,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#ea580c",
    shadowColor: "#c2410c",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 4,
  },
  moodWave3: {
    width: 44,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#c2410c",
    shadowColor: "#9a3412",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.7,
    shadowRadius: 5,
    elevation: 5,
  },

  // Breathing Graphic (3D overlapping purple translucent spheres)
  breathGraphicBox: {
    width: 48,
    height: 48,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  breathOrb1: {
    position: "absolute",
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(168, 85, 247, 0.75)",
    left: 2,
    top: 4,
    borderWidth: 1,
    borderColor: "rgba(216, 180, 254, 0.6)",
  },
  breathOrb2: {
    position: "absolute",
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(126, 34, 206, 0.6)",
    right: 2,
    bottom: 4,
    borderWidth: 1,
    borderColor: "rgba(192, 132, 252, 0.5)",
  },

  // Zen Stones Graphic (Stacked Jade Green Pebbles)
  zenGraphicBox: {
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    gap: 3,
  },
  zenStone1: {
    width: 16,
    height: 9,
    borderRadius: 5,
    backgroundColor: "#6ee7b7",
  },
  zenStone2: {
    width: 28,
    height: 11,
    borderRadius: 6,
    backgroundColor: "#10b981",
  },
  zenStone3: {
    width: 42,
    height: 13,
    borderRadius: 7,
    backgroundColor: "#059669",
  },

  // Stress Card
  stressCard: {
    borderRadius: 24,
    padding: 22,
    minHeight: 180,
    overflow: "hidden",
    position: "relative",
  },
  stressLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
  },
  stressDesc: {
    fontSize: 14,
    fontWeight: "500",
    color: "rgba(255,255,255,0.92)",
    maxWidth: "72%",
    lineHeight: 20,
  },

  // 3D Spring Coil
  springWrap: {
    position: "absolute",
    top: 18,
    right: 18,
    width: 80,
    height: 120,
  },
  springRing: {
    position: "absolute",
    width: 52,
    height: 32,
    borderRadius: 16,
    borderWidth: 8,
  },
  springRing1: {
    top: 0,
    right: 12,
    borderColor: "#84cc16",
    transform: [{ rotate: "15deg" }],
  },
  springRing2: {
    top: 22,
    right: 6,
    borderColor: "#a3e635",
    transform: [{ rotate: "20deg" }],
  },
  springRing3: {
    top: 44,
    right: 16,
    borderColor: "#eab308",
    transform: [{ rotate: "25deg" }],
  },
  springRing4: {
    top: 66,
    right: 8,
    borderColor: "#f59e0b",
    transform: [{ rotate: "20deg" }],
  },
  springRing5: {
    top: 86,
    right: 0,
    borderColor: "#f97316",
    transform: [{ rotate: "15deg" }],
  },

  // ═════════════════════════════════════════════════════════════
  // NUTRITION SUB-CATEGORY STYLES (TAB 5)
  // ═════════════════════════════════════════════════════════════
  nutriSubView: { gap: 14 },
  nutriCard: {
    borderRadius: 24,
    padding: 22,
    minHeight: 160,
    overflow: "hidden",
    position: "relative",
  },
  nutriCardLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
  },
  nutriCardDesc: {
    fontSize: 14,
    fontWeight: "500",
    color: "rgba(255,255,255,0.92)",
    maxWidth: "72%",
    lineHeight: 20,
  },

  // 1. Food: 3D Orange Slice
  orangeSliceWrap: {
    position: "absolute",
    top: -10,
    right: -10,
    width: 130,
    height: 130,
    justifyContent: "center",
    alignItems: "center",
  },
  orangeSlicePeel: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#ea580c",
    borderWidth: 6,
    borderColor: "#ff8c38",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
  },
  orangeSlicePith: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: "#fff7ed",
    justifyContent: "center",
    alignItems: "center",
  },
  orangeSlicePulp: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#f97316",
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  orangeSegment1: {
    position: "absolute",
    width: 96,
    height: 2,
    backgroundColor: "rgba(255,255,255,0.6)",
  },
  orangeSegment2: {
    position: "absolute",
    width: 96,
    height: 2,
    backgroundColor: "rgba(255,255,255,0.6)",
    transform: [{ rotate: "60deg" }],
  },
  orangeSegment3: {
    position: "absolute",
    width: 96,
    height: 2,
    backgroundColor: "rgba(255,255,255,0.6)",
    transform: [{ rotate: "120deg" }],
  },
  orangeCenterPip: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#fff7ed",
  },

  // 2. Body Composition: Fluid 3D blob & scanner handle
  bodyCompWrap: {
    position: "absolute",
    top: 14,
    right: 14,
    width: 110,
    height: 100,
  },
  bodyCompBlob1: {
    position: "absolute",
    top: 6,
    right: 18,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#0284c7",
    opacity: 0.85,
    shadowColor: "#0369a1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  bodyCompBlob2: {
    position: "absolute",
    bottom: 8,
    right: 36,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#38bdf8",
    opacity: 0.9,
  },
  bodyCompHandle: {
    position: "absolute",
    top: 4,
    right: 0,
    width: 32,
    height: 70,
    borderRadius: 16,
    borderWidth: 6,
    borderColor: "rgba(255,255,255,0.85)",
    transform: [{ rotate: "-15deg" }],
  },

  // 3. Water Glass
  waterGlassWrap: {
    position: "absolute",
    top: 14,
    right: 24,
    width: 76,
    height: 100,
  },
  waterGlassBody: {
    width: 68,
    height: 94,
    borderRadius: 8,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.55)",
    backgroundColor: "rgba(255,255,255,0.08)",
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  waterGlassRim: {
    position: "absolute",
    top: 0,
    left: 4,
    right: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.8)",
  },
  waterGlassSheen: {
    position: "absolute",
    top: 6,
    left: 4,
    width: 5,
    height: 70,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  waterGlassFill: {
    width: "100%",
    height: 54,
    backgroundColor: "#0284c7",
    position: "relative",
  },
  waterSurface: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: "rgba(255,255,255,0.6)",
  },
  waterBubble1: {
    position: "absolute",
    bottom: 12,
    left: 16,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.5)",
  },
  waterBubble2: {
    position: "absolute",
    bottom: 24,
    right: 18,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.6)",
  },

  // 4. Blood Glucose
  glucoseWrap: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 100,
    height: 95,
  },
  rbc1: {
    position: "absolute",
    top: 6,
    right: 28,
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#dc2626",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#991b1b",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 6,
  },
  rbc2: {
    position: "absolute",
    bottom: 4,
    right: 0,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#b91c1c",
    justifyContent: "center",
    alignItems: "center",
  },
  rbcCenter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(127, 29, 29, 0.7)",
  },
  glucoseAtom1: {
    position: "absolute",
    top: 0,
    right: 18,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#fef08a",
    shadowColor: "#facc15",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
    elevation: 4,
  },
  glucoseAtom2: {
    position: "absolute",
    top: 36,
    left: 10,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#fef08a",
  },
  glucoseAtom3: {
    position: "absolute",
    top: 6,
    right: 68,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#fef08a",
  },

  // 5. Antioxidant Index
  antioxWrap: {
    position: "absolute",
    top: 14,
    right: 14,
    width: 100,
    height: 95,
  },
  antioxOuterCell: {
    position: "absolute",
    top: 4,
    right: 8,
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "rgba(192, 132, 252, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(233, 213, 255, 0.6)",
  },
  antioxMidCell: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#7e22ce",
    justifyContent: "center",
    alignItems: "center",
  },
  antioxInnerCell: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#3b0764",
  },
  antioxOuterCell2: {
    position: "absolute",
    top: 0,
    right: 48,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(168, 85, 247, 0.3)",
    borderWidth: 1,
    borderColor: "rgba(216, 180, 254, 0.4)",
  },
  flaskBadge: {
    position: "absolute",
    top: 24,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#f97316",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#ffffff",
    elevation: 5,
  },

  // 6. AGEs Index
  agesWrap: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 95,
    height: 95,
  },
  agesCube1: {
    position: "absolute",
    top: 4,
    right: 24,
    width: 38,
    height: 38,
    borderRadius: 6,
    backgroundColor: "#d97706",
    transform: [{ rotate: "18deg" }],
    shadowColor: "#78350f",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 4,
  },
  agesCube2: {
    position: "absolute",
    bottom: 8,
    right: 4,
    width: 34,
    height: 34,
    borderRadius: 6,
    backgroundColor: "#b45309",
    transform: [{ rotate: "-12deg" }],
  },
  agesCube3: {
    position: "absolute",
    top: 12,
    left: 4,
    width: 32,
    height: 32,
    borderRadius: 5,
    backgroundColor: "#92400e",
    transform: [{ rotate: "35deg" }],
  },
  agesCubeTop: {
    width: "100%",
    height: "50%",
    backgroundColor: "rgba(255,255,255,0.25)",
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  agesCubeFront: {
    width: "100%",
    height: "50%",
  },

  // ═════════════════════════════════════════════════════════════
  // VITALS SUB-CATEGORY STYLES (TAB 3)
  // ═════════════════════════════════════════════════════════════
  vitalsSubView: { gap: 14 },
  vitalsCard: {
    borderRadius: 24,
    padding: 22,
    minHeight: 160,
    overflow: "hidden",
    position: "relative",
  },
  vitalsCardLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
  },
  vitalsCardDesc: {
    fontSize: 14,
    fontWeight: "500",
    color: "rgba(255,255,255,0.92)",
    maxWidth: "72%",
    lineHeight: 20,
  },

  // 1. Heart Health Graphic (3D Glowing Heart + Ripple Rings)
  vtHeartHealthWrap: {
    position: "absolute",
    top: 14,
    right: 14,
    width: 100,
    height: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  vtHeartRingOuter: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "rgba(255, 105, 180, 0.15)",
    borderWidth: 2,
    borderColor: "rgba(255, 182, 193, 0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  vtHeartRingMid: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 105, 180, 0.35)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#ff1493",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 6,
  },

  // 2. Vitals Radar Graphic (Sonar Scanner)
  vtRadarWrap: {
    position: "absolute",
    top: 14,
    right: 18,
    width: 90,
    height: 90,
    justifyContent: "center",
    alignItems: "center",
  },
  vtRadarOuter: {
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.35)",
    backgroundColor: "rgba(20, 176, 223, 0.25)",
    overflow: "hidden",
    position: "relative",
  },
  vtRadarSweep: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 43,
    height: 43,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderTopRightRadius: 43,
  },
  vtRadarDot1: {
    position: "absolute",
    top: 24,
    left: 28,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#ffffff",
  },
  vtRadarDot2: {
    position: "absolute",
    top: 50,
    left: 40,
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#e0f7fa",
  },
  vtRadarDot3: {
    position: "absolute",
    top: 36,
    right: 20,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#ffffff",
  },
  vtRadarDot4: {
    position: "absolute",
    bottom: 18,
    left: 20,
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#b2ebf2",
  },

  // 3. Heart Rate Graphic
  vtHeartRateWrap: {
    position: "absolute",
    top: 12,
    right: 14,
    width: 100,
    height: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  vtHeartRateWaveOuter: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  vtHeartRateWaveInner: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(255, 23, 68, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#ff1744",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },

  // 4. Blood Oxygen Graphic (3D Disc molecules)
  vtOxygenWrap: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 100,
    height: 95,
  },
  vtOxygenDisc1: {
    position: "absolute",
    top: 4,
    right: 22,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#1e40af",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(147, 197, 253, 0.5)",
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 5,
  },
  vtOxygenDisc2: {
    position: "absolute",
    bottom: 8,
    right: 6,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#1d4ed8",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "rgba(191, 219, 254, 0.5)",
  },
  vtOxygenDisc3: {
    position: "absolute",
    top: 14,
    left: 8,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#2563eb",
    justifyContent: "center",
    alignItems: "center",
  },
  vtOxygenCore: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#ffffff",
    shadowColor: "#60a5fa",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 4,
  },

  // 5. Blood Pressure Graphic (3D floating RBCs)
  vtBpWrap: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 100,
    height: 95,
  },
  vtBpDisc1: {
    position: "absolute",
    top: 24,
    right: 18,
    width: 46,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f43f5e",
    transform: [{ rotate: "-20deg" }],
    shadowColor: "#be123c",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 4,
  },
  vtBpDisc2: {
    position: "absolute",
    bottom: 12,
    right: 38,
    width: 40,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#e11d48",
    transform: [{ rotate: "15deg" }],
  },
  vtBpDisc3: {
    position: "absolute",
    top: 8,
    right: 54,
    width: 32,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#fb7185",
    transform: [{ rotate: "35deg" }],
  },
  vtBpDisc4: {
    position: "absolute",
    bottom: 26,
    right: 6,
    width: 36,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#be123c",
    transform: [{ rotate: "-35deg" }],
  },

  // 6. Vascular Load Graphic (3D Tube + Flask)
  vtVascWrap: {
    position: "absolute",
    top: 14,
    right: 14,
    width: 95,
    height: 95,
  },
  vtVascTubeOuter: {
    position: "absolute",
    top: 6,
    right: 8,
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "#9d174d",
    borderWidth: 6,
    borderColor: "#f472b6",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#831843",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 5,
  },
  vtVascTubeInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#500724",
  },
  vtVascCell1: {
    position: "absolute",
    bottom: 4,
    left: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#f43f5e",
  },
  vtVascCell2: {
    position: "absolute",
    top: 6,
    right: 48,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#fb7185",
  },
});
