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
import { Ionicons } from "@expo/vector-icons";
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

type Props = NativeStackScreenProps<RootStackParamList, "HomeDashboard">;

const { width: SW } = Dimensions.get("window");

// ─── Quick-action pills (top icon bar) ────────────────────────────────────────
const PILLS: { icon: keyof typeof Ionicons.glyphMap; name: string }[] = [
  { icon: "grid",               name: "Overview" },
  { icon: "walk-outline",       name: "Activity" },
  { icon: "moon-outline",       name: "Sleep" },
  { icon: "heart-outline",      name: "Heart" },
  { icon: "body-outline",       name: "Meditation" },
  { icon: "restaurant-outline", name: "Food" },
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
                  <Ionicons
                    name={p.icon}
                    size={22}
                    color={isActive ? "#FFFFFF" : "rgba(255,255,255,0.55)"}
                  />
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
                      <Text style={s.actStatVal}>0 <Text style={s.actStatUnit}>mins</Text></Text>
                    </View>
                    {/* Calories */}
                    <View style={s.actStatItem}>
                      <View style={[s.actStatIconWrap, { backgroundColor: "#a855f7" }]}>
                        <Ionicons name="flame" size={13} color="white" />
                      </View>
                      <Text style={s.actStatVal}>0 <Text style={s.actStatUnit}>kcal</Text></Text>
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
                  <Text style={s.halfSub}>Ready to log your first meal?</Text>
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
                  <Text style={s.medTime}>9:00 am</Text>
                  <Text style={s.medName}>Scheduled</Text>
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
            TABS 2–5: OTHER SUB-CATEGORIES (Sleep, Heart, Meditation, Food)
            ═══════════════════════════════════════════════════════════════ */}
        {activePill > 1 && (
          <View style={s.otherSubView}>
            <Text style={s.subCategoryTitle}>{PILLS[activePill].name}</Text>
            <Text style={s.subCategoryAdvice}>
              Track and optimize your {PILLS[activePill].name.toLowerCase()} health goals.
            </Text>
            <Pressable
              style={s.exploreModuleBtn}
              onPress={() => {
                if (activePill === 2) navigation.navigate("SleepDashboard");
                if (activePill === 3) navigation.navigate("HealthDashboard");
                if (activePill === 4) navigation.navigate("MeditationDashboard");
                if (activePill === 5) navigation.navigate("NutritionDashboard");
              }}
            >
              <LinearGradient colors={["#2563eb", "#3b82f6"]} style={s.exploreModuleGrad}>
                <Text style={s.exploreModuleText}>Open Full {PILLS[activePill].name} Dashboard</Text>
                <Ionicons name="arrow-forward" size={16} color="white" />
              </LinearGradient>
            </Pressable>
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
});
