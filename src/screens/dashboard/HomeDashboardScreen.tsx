import React, { useState, useEffect, useRef, useCallback } from "react";
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
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  FadeInDown,
  FadeIn,
  Easing,
} from "react-native-reanimated";
import { RootStackParamList } from "@/navigation/types";
import { colors } from "@/theme/colors";
import SamsungBottomNav from "@/components/SamsungBottomNav";
import { useAuth } from "@/context/AuthContext";

type Props = NativeStackScreenProps<RootStackParamList, "HomeDashboard">;

const { width: SW } = Dimensions.get("window");

// ─── Quick-action pills (top icon bar) ────────────────────────────────────────
const PILLS: { icon: keyof typeof Ionicons.glyphMap; route: keyof RootStackParamList }[] = [
  { icon: "grid",              route: "HomeDashboard" },
  { icon: "walk-outline",      route: "FitnessDashboard" },
  { icon: "moon-outline",      route: "SleepDashboard" },
  { icon: "heart-outline",     route: "HealthDashboard" },
  { icon: "body-outline",      route: "MeditationDashboard" },
  { icon: "restaurant-outline",route: "NutritionDashboard" },
];

// ─── Hero promo slides ─────────────────────────────────────────────────────────
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
      entering={FadeInDown.delay(index * 70).duration(380).springify().damping(18)}
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

// ─── Main screen ───────────────────────────────────────────────────────────────
export default function HomeDashboardScreen({ navigation }: Props) {
  const { user } = useAuth();
  const [activePill, setActivePill] = useState(0);
  const [heroIndex, setHeroIndex] = useState(0);
  const [syncDismissed, setSyncDismissed] = useState(false);
  const heroRef = useRef<FlatList>(null);

  // Get first name from Firebase user
  const firstName = user?.displayName?.split(" ")[0] ?? "You";

  // Hero auto-scroll
  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIndex((prev) => {
        const next = (prev + 1) % HERO_SLIDES.length;
        heroRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, 4500);
    return () => clearInterval(timer);
  }, []);

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

  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const CARD_HALF = (SW - 32 - 10) / 2; // 16px side pad each, 10px gap

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* ── Subtle warm amber glow at top (matching Samsung Health header glow) ── */}
      <LinearGradient
        colors={["rgba(120, 80, 10, 0.28)", "rgba(50, 40, 15, 0.12)", "transparent"]}
        style={s.topAmbientGlow}
        pointerEvents="none"
      />

      {/* ── Top App Bar ─────────────────────────────────────── */}
      <Animated.View style={[s.topBar, headerStyle]}>
        <Text style={s.appTitle}>Urban Health</Text>
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

      {/* ── Quick-action pills (Samsung Health icon bar) ─────── */}
      <Animated.View entering={FadeIn.delay(150).duration(400)}>
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
                onPress={() => {
                  setActivePill(i);
                  if (i !== 0) navigation.navigate(p.route as any);
                }}
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

      {/* ── Main Scroll ──────────────────────────────────────── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
      >

        {/* ── 1. Hero Promo Carousel ───────────────────────── */}
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
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={s.heroSlide}
                >
                  <View style={s.heroInner}>
                    <Text style={s.heroTitle}>{item.title}</Text>
                    <Text style={s.heroSub}>{item.sub}</Text>
                    {/* Dot pagination */}
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

        {/* ── 2. Sync Alert Banner ─────────────────────────── */}
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

        {/* ── 3. Energy Score — full-width blue card ───────── */}
        <PressCard index={1} onPress={() => navigation.navigate("FitnessDashboard")}>
          <LinearGradient
            colors={["#2a3fc7", "#3f51e8", "#4d6af5"]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={s.energyCard}
          >
            {/* Decorative glow blob */}
            <View style={s.energyBlob} />
            <View style={s.energyTextWrap}>
              <Text style={s.energyLabel}>Energy score</Text>
              <Text style={s.energyDesc}>
                Learn how tracking your energy score can help you plan your day based on what's best for your body.
              </Text>
            </View>
            {/* Flame icon cluster */}
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

        {/* ── 4. Daily Activity + Sleep — 2-col ───────────── */}
        <View style={[s.row2, { marginTop: 10 }]}>
          {/* Daily Activity */}
          <PressCard index={2} onPress={() => navigation.navigate("FitnessDashboard")} style={s.halfOuter}>
            <View style={[s.halfCard, { backgroundColor: "#1c1c28" }]}>
              <Text style={s.halfTitle}>Daily activity</Text>
              {/* Concentric heart rings */}
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
              {/* Stars */}
              <Text style={s.sleepStar1}>✦</Text>
              <Text style={s.sleepStar2}>✦</Text>
              <Text style={s.sleepStar3}>·</Text>
              <Ionicons name="moon" size={52} color="#7b5fcc" style={s.sleepMoon} />
              <Text style={s.halfTitle}>Sleep</Text>
              <Text style={s.halfSub}>Track your sleep</Text>
            </LinearGradient>
          </PressCard>
        </View>

        {/* ── 5. Food + Quick-Action 2×2 grid ─────────────── */}
        <View style={[s.row2, { marginTop: 10 }]}>
          {/* Food */}
          <PressCard index={4} onPress={() => navigation.navigate("NutritionDashboard")} style={s.halfOuter}>
            <LinearGradient
              colors={["#e05c00", "#f57c00", "#ff9800"]}
              start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
              style={s.halfCard}
            >
              {/* Orange slice decoration */}
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

        {/* ── 6. Heart Health — full-width purple card ──────── */}
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
            {/* Heart icon with rings */}
            <View style={s.heartIconWrap}>
              <View style={s.heartRingLg}>
                <View style={s.heartRingMd}>
                  <Ionicons name="heart" size={26} color="#ff4a8d" />
                </View>
              </View>
            </View>
          </LinearGradient>
        </PressCard>

        {/* ── 7. Cycle Tracking — full-width pink card ──────── */}
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
            {/* Flower blob decoration */}
            <View style={s.flowerWrap}>
              <Ionicons name="rose" size={56} color="rgba(255,100,200,0.9)" />
            </View>
          </LinearGradient>
        </PressCard>

        {/* ── 8. Medications + Health Records ─────────────── */}
        <View style={[s.row2, { marginTop: 10 }]}>
          {/* Medications */}
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

          {/* Health Records */}
          <PressCard index={8} onPress={() => navigation.navigate("MedicalRecords")} style={s.halfOuter}>
            <View style={[s.halfCard, { backgroundColor: "#252535" }]}>
              {/* Molecule decoration */}
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

        {/* ── 9. Hearing + Steps ───────────────────────────── */}
        <View style={[s.row2, { marginTop: 10 }]}>
          {/* Hearing */}
          <PressCard index={9} onPress={() => navigation.navigate("WellnessDashboard")} style={s.halfOuter}>
            <LinearGradient
              colors={["#795548", "#8d6e63", "#a1887f"]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={s.halfCard}
            >
              {/* Sound-wave decoration */}
              <View style={s.soundWaveWrap}>
                <Ionicons name="volume-high-outline" size={40} color="rgba(255,255,255,0.15)" />
              </View>
              <Text style={s.halfTitle}>Hearing</Text>
              <Text style={s.halfSub}>
                Track sound exposure to help protect your hearing.
              </Text>
            </LinearGradient>
          </PressCard>

          {/* Steps */}
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

        {/* ── 10. Vitals + Daily Cardio Load ───────────────── */}
        <View style={[s.row2, { marginTop: 10 }]}>
          {/* Vitals */}
          <PressCard index={11} onPress={() => navigation.navigate("VitalsScreen")} style={s.halfOuter}>
            <LinearGradient
              colors={["#006064", "#00838f", "#00acc1"]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={s.halfCard}
            >
              {/* Radar/scanner decoration */}
              <View style={s.radarWrap}>
                <Ionicons name="radio-outline" size={50} color="rgba(255,255,255,0.12)" />
              </View>
              <Text style={s.halfTitle}>Vitals</Text>
              <Text style={s.halfSub}>Learn how vitals tracking works.</Text>
            </LinearGradient>
          </PressCard>

          {/* Daily Cardio Load */}
          <PressCard index={12} onPress={() => navigation.navigate("FitnessDashboard")} style={s.halfOuter}>
            <LinearGradient
              colors={["#0d47a1", "#1565c0", "#1976d2"]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={s.halfCard}
            >
              {/* Speedometer decoration */}
              <View style={s.speedoWrap}>
                <Ionicons name="speedometer-outline" size={50} color="rgba(255,255,255,0.15)" />
              </View>
              <Text style={s.halfTitle}>Daily cardio load</Text>
              <Text style={s.halfSub}>Find your daily training sweet spot.</Text>
            </LinearGradient>
          </PressCard>
        </View>

        {/* ── Urban Helpers Services CTA ───────────────────── */}
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

        {/* ── Edit home button (from Screenshot 4) ──────────── */}
        <View style={s.editHomeWrap}>
          <Pressable style={s.editHomeBtn} onPress={() => {}}>
            <Text style={s.editHomeText}>Edit home</Text>
          </Pressable>
        </View>

        {/* Bottom nav clearance */}
        <View style={{ height: 110 }} />
      </ScrollView>

      {/* ── Samsung-style Bottom Nav ─────────────────────────── */}
      <SamsungBottomNav activeRoute="HomeDashboard" />
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const CARD_HALF = (SW - 32 - 10) / 2;

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0c0e12" },


  // ── Top Bar
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

  // ── Pills
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
  pillBgActive: { backgroundColor: "rgba(255,255,255,0.18)" },

  // ── Scroll container
  scroll: { paddingHorizontal: 16, paddingTop: 4 },

  // ── Hero carousel
  heroWrap: { marginBottom: 12, borderRadius: 22, overflow: "hidden" },
  heroSlide: {
    width: SW - 32,
    minHeight: 160,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    overflow: "hidden",
  },
  heroInner: { padding: 22, flex: 1 },
  heroTitle: { fontSize: 20, fontWeight: "700", color: "white", lineHeight: 28, marginBottom: 8 },
  heroSub: { fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 18, marginBottom: 18 },
  dotsRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  dot: {
    width: 18, height: 5, borderRadius: 2.5,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  dotActive: { width: 28, backgroundColor: "white" },

  // ── Alert / sync banner
  alertBanner: {
    backgroundColor: "#1c1f2b",
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
  },
  alertText: { fontSize: 13.5, color: "rgba(255,255,255,0.85)", lineHeight: 20, marginBottom: 14 },
  alertBtns: { flexDirection: "row", justifyContent: "flex-end", gap: 20 },
  alertBtnPlain: { fontSize: 14, fontWeight: "600", color: "rgba(255,255,255,0.6)" },
  alertBtnBold: { fontSize: 14, fontWeight: "700", color: "#ffffff" },

  // ── Energy Score card
  energyCard: {
    borderRadius: 22,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    minHeight: 140,
    marginBottom: 0,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  energyBlob: {
    position: "absolute", right: -20, top: -30,
    width: 160, height: 160, borderRadius: 80,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  energyTextWrap: { flex: 1, marginRight: 12 },
  energyLabel: { fontSize: 14, color: "rgba(255,255,255,0.75)", marginBottom: 8 },
  energyDesc: { fontSize: 13.5, color: "white", lineHeight: 20 },
  energyIconWrap: {
    width: 80, height: 80,
    justifyContent: "center", alignItems: "center",
  },
  flameOuter: { position: "absolute" },
  flameSpark1: { position: "absolute", top: 4, right: 6 },
  flameSpark2: { position: "absolute", top: 14, right: 2 },

  // ── 2-col grid
  row2: { flexDirection: "row", gap: 10 },
  halfOuter: { flex: 1 },
  halfCard: {
    borderRadius: 22,
    padding: 16,
    height: CARD_HALF,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
  },
  halfTitle: { fontSize: 14, fontWeight: "700", color: "white", marginBottom: 4, zIndex: 1 },
  halfSub: { fontSize: 11.5, color: "rgba(255,255,255,0.65)", lineHeight: 16, zIndex: 1 },

  // Daily Activity
  heartRingWrap: { flex: 1, justifyContent: "center", alignItems: "center" },
  ring: {
    borderRadius: 100, borderWidth: 5,
    justifyContent: "center", alignItems: "center",
  },

  // Sleep
  sleepStar1: { position: "absolute", top: 16, right: 16, color: "#9d8fdd", fontSize: 10 },
  sleepStar2: { position: "absolute", top: 28, right: 30, color: "#9d8fdd", fontSize: 8 },
  sleepStar3: { position: "absolute", top: 20, right: 44, color: "#9d8fdd", fontSize: 16 },
  sleepMoon: { position: "absolute", bottom: 16, right: 10, opacity: 0.85 },

  // Food
  orangeDecor: { position: "absolute", bottom: -10, right: -10, opacity: 0.9 },

  // Quick actions 2×2
  quickGrid: {
    backgroundColor: "#1c1c28",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    padding: 12,
  },
  quickRow: { flexDirection: "row", gap: 10 },

  // Wide cards (Heart, Cycle)
  wideCard: {
    borderRadius: 22,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    minHeight: 130,
    marginTop: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  wideBlob: {
    position: "absolute", right: -20, top: -30,
    width: 160, height: 160, borderRadius: 80,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  wideTextWrap: { flex: 1, marginRight: 12 },
  wideLabel: { fontSize: 13.5, color: "rgba(255,255,255,0.75)", marginBottom: 8 },
  wideDesc: { fontSize: 13.5, color: "white", lineHeight: 20 },

  // Heart Health icon
  heartIconWrap: { width: 70, height: 70, justifyContent: "center", alignItems: "center" },
  heartRingLg: {
    width: 68, height: 68, borderRadius: 34,
    borderWidth: 2.5, borderColor: "rgba(255,74,141,0.4)",
    justifyContent: "center", alignItems: "center",
  },
  heartRingMd: {
    width: 50, height: 50, borderRadius: 25,
    backgroundColor: "rgba(255,74,141,0.15)",
    justifyContent: "center", alignItems: "center",
  },

  // Cycle tracking flower
  flowerWrap: {
    width: 70, height: 70,
    justifyContent: "center", alignItems: "center",
  },

  // Medications
  pillIconBox: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: "rgba(156,142,245,0.15)",
    justifyContent: "center", alignItems: "center",
    marginBottom: 10,
  },
  medTime: { fontSize: 22, fontWeight: "700", color: "white", marginTop: 4 },
  medName: { fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 2 },

  // Health Records
  moleculeWrap: { position: "absolute", bottom: 10, right: 10 },

  // Hearing
  soundWaveWrap: { position: "absolute", right: -4, bottom: 10 },

  // Steps
  stepsNumber: { fontSize: 36, fontWeight: "700", color: "white", lineHeight: 44 },
  stepsGoal: { fontSize: 11, color: "rgba(255,255,255,0.45)", marginBottom: 10 },
  stepsBarBg: {
    height: 5, borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.1)",
    marginTop: "auto",
  },
  stepsBarFill: {
    height: 5, borderRadius: 3,
    backgroundColor: "#ffffff",
  },

  // Vitals
  radarWrap: { position: "absolute", right: -4, bottom: 8 },

  // Cardio load
  speedoWrap: { position: "absolute", right: -4, bottom: 8 },

  // Services CTA
  servicesBtn: {
    borderRadius: 24, paddingVertical: 18, paddingHorizontal: 20,
    flexDirection: "row", alignItems: "center",
    marginTop: 10, overflow: "hidden",
    borderWidth: 1, borderColor: "rgba(0,188,212,0.4)",
    elevation: 10,
    shadowColor: "#00bcd4",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
  },
  servicesBtnBlob: {
    position: "absolute", top: -30, right: -30,
    width: 130, height: 130, borderRadius: 65,
    backgroundColor: "rgba(255,255,255,0.07)",
  },
  servicesBtnIconWrap: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center", alignItems: "center",
    marginRight: 14, flexShrink: 0,
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

  // Top Ambient Glow
  topAmbientGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 180,
  },

  // Edit Home Button
  editHomeWrap: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    marginBottom: 10,
  },
  editHomeBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  editHomeText: {
    fontSize: 13,
    fontWeight: "600",
    color: "rgba(255,255,255,0.75)",
  },
});
