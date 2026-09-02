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
  withSequence,
  interpolate,
  FadeInDown,
  FadeIn,
  SlideInLeft,
  Easing,
} from "react-native-reanimated";
import { RootStackParamList } from "@/navigation/types";
import { colors } from "@/theme/colors";
import SamsungBottomNav from "@/components/SamsungBottomNav";

type Props = NativeStackScreenProps<RootStackParamList, "HomeDashboard">;

const { width: SCREEN_W } = Dimensions.get("window");
const NAV_TAB_W = (SCREEN_W - 32) / 4; // 4 tabs

// ─── Category pills — each navigates to a screen ──────────────────────────────
const PILLS: { name: string; icon: keyof typeof Ionicons.glyphMap; route: keyof RootStackParamList }[] = [
  { name: "Home",      icon: "grid-outline",      route: "HomeDashboard" },
  { name: "Activity",  icon: "walk-outline",      route: "FitnessDashboard" },
  { name: "Sleep",     icon: "moon-outline",      route: "SleepDashboard" },
  { name: "Heart",     icon: "heart-outline",     route: "HealthDashboard" },
  { name: "Meditation",icon: "body-outline",      route: "MeditationDashboard" },
  { name: "Nutrition", icon: "restaurant-outline",route: "NutritionDashboard" },
];

// ─── Hero carousel slides ──────────────────────────────────────────────────────
const HERO_SLIDES = [
  {
    id: "1",
    title: "Take care of your family's wellbeing",
    sub: "Manage health, appointments, reminders, and home services in one place.",
    gradient: ["#0f2027", "#203a43", "#2c5364"] as string[],
    btnLabel: "Explore",
    route: "Discover" as keyof RootStackParamList,
  },
  {
    id: "2",
    title: "Track your health with AI precision",
    sub: "Real-time vitals, sleep analysis, and personalised coaching in your pocket.",
    gradient: ["#1a1a2e", "#16213e", "#0f3460"] as string[],
    btnLabel: "View Health",
    route: "HealthDashboard" as keyof RootStackParamList,
  },
  {
    id: "3",
    title: "Stay fit. Stay strong. Every day.",
    sub: "Yoga, gym, steps, calories — all your fitness goals in one beautiful dashboard.",
    gradient: ["#0d1b2a", "#1b4332", "#2d6a4f"] as string[],
    btnLabel: "Start Fitness",
    route: "FitnessDashboard" as keyof RootStackParamList,
  },
];

// ─── Feature cards ─────────────────────────────────────────────────────────────
const FEATURE_CARDS = [
  { id: "energy",    title: "Energy Score",    subtitle: "Understand how your day is shaping up.", gradient: ["#1e3a8a", "#2563eb", "#38bdf8"] as string[], icon: "flash",         route: "FitnessDashboard",    wide: true,  height: 110 },
  { id: "heart",     title: "Heart Health",    subtitle: "View your heart insights.",              gradient: ["#be185d", "#7e22ce"] as string[],            icon: "heart",         route: "HealthDashboard",     wide: false, height: 170 },
  { id: "sleep",     title: "Sleep",           subtitle: "Track your sleep quality.",              gradient: ["#4338ca", "#8b5cf6"] as string[],            icon: "moon",          route: "SleepDashboard",      wide: false, height: 170 },
  { id: "nutrition", title: "Nutrition",       subtitle: "Build healthier eating habits.",         gradient: ["#ea580c", "#d97706"] as string[],            icon: "nutrition",     route: "NutritionDashboard",  wide: true,  height: 110 },
  { id: "family",    title: "Family Care",     subtitle: "Stay connected with loved ones.",        gradient: ["#92400e", "#d97706", "#f59e0b"] as string[], icon: "people",        route: "FamilyDashboard",     wide: true,  height: 130 },
  { id: "medication",title: "Medication",      subtitle: "Manage your meds.",                      gradient: ["#065f46", "#059669"] as string[],            icon: "medical",       route: "MedicationCenter",    wide: false, height: 150 },
  { id: "emergency", title: "Emergency SOS",  subtitle: "1-Tap Alert",                            gradient: ["#7f1d1d", "#b91c1c"] as string[],            icon: "alert-circle",  route: "EmergencyAssistance", wide: false, height: 150 },
  { id: "aicoach",   title: "AI Coach",        subtitle: "Personalized health guidance.",          gradient: ["#1d4ed8", "#6d28d9", "#8343f4"] as string[], icon: "sparkles",      route: "AICoach",             wide: true,  height: 110 },
  { id: "medical",   title: "Medical Records", subtitle: "Your health vault.",                     gradient: ["#1e3a8a", "#4c1d95"] as string[],            icon: "document-text", route: "MedicalRecords",      wide: false, height: 150 },
  { id: "discover",  title: "Discover",        subtitle: "Explore wellness content.",              gradient: ["#134e4a", "#0d9488"] as string[],            icon: "compass",       route: "Discover",            wide: false, height: 150 },
];

// ─── Animated press-scale card ─────────────────────────────────────────────────
interface PressCardProps {
  onPress: () => void;
  style?: any;
  children: React.ReactNode;
  index?: number; // for staggered entrance
}
function PressCard({ onPress, style, children, index = 0 }: PressCardProps) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 80).duration(400).springify().damping(18)}
      style={[style, animStyle]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={() => { scale.value = withSpring(0.95, { damping: 15, stiffness: 350 }); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 12, stiffness: 280 }); }}
        delayLongPress={500}
        android_ripple={null}
        style={{ flex: 1 }}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

// ─── Main screen ───────────────────────────────────────────────────────────────
export default function HomeDashboardScreen({ navigation }: Props) {
  const [activePill, setActivePill] = useState(0);
  const [heroIndex, setHeroIndex] = useState(0);

  // Hero auto-scroll
  const heroRef = useRef<FlatList>(null);
  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIndex((prev) => {
        const next = (prev + 1) % HERO_SLIDES.length;
        heroRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0 && viewableItems[0].index != null) {
      setHeroIndex(viewableItems[0].index);
    }
  }).current;

  // Header entrance
  const headerOpacity = useSharedValue(0);
  const headerY = useSharedValue(-20);
  useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) });
    headerY.value = withSpring(0, { damping: 18, stiffness: 200 });
  }, []);
  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerY.value }],
  }));

  return (
    <View style={s.root}>

      {/* ── Top App Bar ─────────────────────────────────────── */}
      <Animated.View style={[s.topBar, headerStyle]}>
        <View style={s.topBarLeft}>
          <Text style={s.appTitle}>Urban Helpers</Text>
          <View style={s.subtitleRow}>
            <View style={s.avatar}>
              <Ionicons name="person" size={12} color={colors.text.secondary} />
            </View>
            <Text style={s.greeting}>Good Morning, Alex 👋</Text>
          </View>
          <Text style={s.tagline}>Your companion for healthier living.</Text>
        </View>
        <View style={s.topBarRight}>
          <Pressable style={s.iconBtn} onPress={() => navigation.navigate("Notifications")}>
            <Ionicons name="notifications-outline" size={20} color={colors.text.secondary} />
            <View style={s.notifBadge} />
          </Pressable>
          <Pressable style={s.avatarBtn} onPress={() => navigation.navigate("Profile")}>
            <LinearGradient colors={["#8343f4", "#2563eb"]} style={s.avatarBtnInner}>
              <Text style={s.avatarBtnInitials}>AJ</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </Animated.View>

      {/* ── Samsung Health Style Top Nav Pills ── */}
      <Animated.View entering={SlideInLeft.delay(200).duration(400).springify()}>
        <View style={s.topNavContainer}>
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
                  key={p.name}
                  onPress={() => {
                    setActivePill(i);
                    if (i !== 0) navigation.navigate(p.route as any);
                  }}
                  style={s.pillIconContainer}
                >
                  <View style={[s.pillIconBg, isActive && s.pillIconBgActive]}>
                    <Ionicons
                      name={p.icon}
                      size={20}
                      color={isActive ? "#FFFFFF" : "rgba(255,255,255,0.7)"}
                    />
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </Animated.View>

      {/* ── Main Scrollable Content ──────────────────────────── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
      >

        {/* ── Animated Hero Carousel ─────────────────────────── */}
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
                colors={item.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={s.heroSlide}
              >
                <Text style={s.heroTitle}>{item.title}</Text>
                <Text style={s.heroSub}>{item.sub}</Text>
                <View style={s.heroCTA}>
                  {/* Dots */}
                  <View style={s.dotsRow}>
                    {HERO_SLIDES.map((_, idx) => (
                      <View
                        key={idx}
                        style={[s.dot, idx === heroIndex && s.dotActive]}
                      />
                    ))}
                  </View>
                  <Pressable
                    onPress={() => navigation.navigate(item.route as any)}
                    style={s.exploreBtn}
                  >
                    <Text style={s.exploreBtnText}>{item.btnLabel}</Text>
                    <Ionicons name="arrow-forward" size={13} color="white" />
                  </Pressable>
                </View>
              </LinearGradient>
            )}
          />
        </View>

        {/* ── Services Entry Button — unique, glowing teal ──── */}
        <Animated.View entering={FadeInDown.delay(120).duration(400).springify()}>
          <Pressable
            onPress={() => navigation.navigate("ServicesDashboard")}
            style={({ pressed }) => ({ opacity: pressed ? 0.88 : 1 })}
          >
            <LinearGradient
              colors={["#007c8a", "#00bcd4", "#26c6da"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={s.servicesBtn}
            >
              {/* Glow blob */}
              <View style={s.servicesBtnBlob} />
              {/* Left: icon in circle */}
              <View style={s.servicesBtnIconWrap}>
                <Ionicons name="construct" size={26} color="white" />
              </View>
              {/* Centre: text */}
              <View style={s.servicesBtnText}>
                <View style={s.servicesBtnBadge}>
                  <Text style={s.servicesBtnBadgeText}>10 CATEGORIES</Text>
                </View>
                <Text style={s.servicesBtnTitle}>Urban Helpers Services</Text>
                <Text style={s.servicesBtnSub}>RO · Pest · Cleaning · Care & more</Text>
              </View>
              {/* Right: arrow */}
              <View style={s.servicesBtnArrow}>
                <Ionicons name="arrow-forward-circle" size={32} color="rgba(255,255,255,0.85)" />
              </View>
            </LinearGradient>
          </Pressable>
        </Animated.View>

        {/* ── Feature Cards Grid ─────────────────────────────── */}
        <View style={s.cardGrid}>

          {/* Energy Score — wide, index 0 */}
          <PressCard index={0} onPress={() => navigation.navigate(FEATURE_CARDS[0].route as any)}>
            <LinearGradient colors={FEATURE_CARDS[0].gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[s.wideCard, { height: FEATURE_CARDS[0].height }]}>
              <View style={s.wideIconWrap}><Ionicons name={FEATURE_CARDS[0].icon as any} size={28} color="white" /></View>
              <View style={s.wideTextWrap}>
                <Text style={s.wideTitle}>{FEATURE_CARDS[0].title}</Text>
                <Text style={s.wideSub}>{FEATURE_CARDS[0].subtitle}</Text>
              </View>
              <Ionicons name="arrow-forward" size={18} color="rgba(255,255,255,0.6)" style={s.wideArrow} />
            </LinearGradient>
          </PressCard>

          {/* Heart + Sleep — 2-col, indices 1–2 */}
          <View style={s.row2}>
            <PressCard index={1} onPress={() => navigation.navigate(FEATURE_CARDS[1].route as any)} style={s.halfOuter}>
              <LinearGradient colors={FEATURE_CARDS[1].gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[s.halfCard, { height: FEATURE_CARDS[1].height }]}>
                <View style={s.halfIconWrap}><Ionicons name={FEATURE_CARDS[1].icon as any} size={24} color="white" /></View>
                <View style={s.halfTextWrap}>
                  <Text style={s.halfTitle}>{FEATURE_CARDS[1].title}</Text>
                  <Text style={s.halfSub} numberOfLines={2}>{FEATURE_CARDS[1].subtitle}</Text>
                </View>
              </LinearGradient>
            </PressCard>
            <PressCard index={2} onPress={() => navigation.navigate(FEATURE_CARDS[2].route as any)} style={s.halfOuter}>
              <LinearGradient colors={FEATURE_CARDS[2].gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[s.halfCard, { height: FEATURE_CARDS[2].height }]}>
                <View style={s.halfIconWrap}><Ionicons name={FEATURE_CARDS[2].icon as any} size={24} color="white" /></View>
                <View style={s.halfTextWrap}>
                  <Text style={s.halfTitle}>{FEATURE_CARDS[2].title}</Text>
                  <Text style={s.halfSub} numberOfLines={2}>{FEATURE_CARDS[2].subtitle}</Text>
                </View>
              </LinearGradient>
            </PressCard>
          </View>

          {/* Nutrition — wide, index 3 */}
          <PressCard index={3} onPress={() => navigation.navigate(FEATURE_CARDS[3].route as any)}>
            <LinearGradient colors={FEATURE_CARDS[3].gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[s.wideCard, { height: FEATURE_CARDS[3].height }]}>
              <View style={s.wideIconWrap}><Ionicons name={FEATURE_CARDS[3].icon as any} size={28} color="white" /></View>
              <View style={s.wideTextWrap}>
                <Text style={s.wideTitle}>{FEATURE_CARDS[3].title}</Text>
                <Text style={s.wideSub}>{FEATURE_CARDS[3].subtitle}</Text>
              </View>
              <Ionicons name="arrow-forward" size={18} color="rgba(255,255,255,0.6)" style={s.wideArrow} />
            </LinearGradient>
          </PressCard>

          {/* Family Care — wide, index 4 */}
          <PressCard index={4} onPress={() => navigation.navigate(FEATURE_CARDS[4].route as any)}>
            <LinearGradient colors={FEATURE_CARDS[4].gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[s.wideCard, { height: FEATURE_CARDS[4].height }]}>
              <View style={s.wideIconWrap}><Ionicons name={FEATURE_CARDS[4].icon as any} size={28} color="white" /></View>
              <View style={s.wideTextWrap}>
                <Text style={s.wideTitle}>{FEATURE_CARDS[4].title}</Text>
                <Text style={s.wideSub}>{FEATURE_CARDS[4].subtitle}</Text>
              </View>
              <Ionicons name="arrow-forward" size={18} color="rgba(255,255,255,0.6)" style={s.wideArrow} />
            </LinearGradient>
          </PressCard>

          {/* Medication + Emergency — 2-col, indices 5–6 */}
          <View style={s.row2}>
            <PressCard index={5} onPress={() => navigation.navigate(FEATURE_CARDS[5].route as any)} style={s.halfOuter}>
              <LinearGradient colors={FEATURE_CARDS[5].gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[s.halfCard, { height: FEATURE_CARDS[5].height }]}>
                <View style={s.halfIconWrap}><Ionicons name={FEATURE_CARDS[5].icon as any} size={24} color="white" /></View>
                <View style={s.halfTextWrap}>
                  <Text style={s.halfTitle}>{FEATURE_CARDS[5].title}</Text>
                  <Text style={s.halfSub} numberOfLines={2}>{FEATURE_CARDS[5].subtitle}</Text>
                </View>
              </LinearGradient>
            </PressCard>
            <PressCard index={6} onPress={() => navigation.navigate(FEATURE_CARDS[6].route as any)} style={s.halfOuter}>
              <LinearGradient colors={FEATURE_CARDS[6].gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[s.halfCard, { height: FEATURE_CARDS[6].height }]}>
                <View style={s.halfIconWrap}><Ionicons name={FEATURE_CARDS[6].icon as any} size={24} color="white" /></View>
                <View style={s.halfTextWrap}>
                  <Text style={s.halfTitle}>{FEATURE_CARDS[6].title}</Text>
                  <Text style={s.halfSub} numberOfLines={2}>{FEATURE_CARDS[6].subtitle}</Text>
                </View>
              </LinearGradient>
            </PressCard>
          </View>

          {/* AI Coach — wide, index 7 */}
          <PressCard index={7} onPress={() => navigation.navigate(FEATURE_CARDS[7].route as any)}>
            <LinearGradient colors={FEATURE_CARDS[7].gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[s.wideCard, { height: FEATURE_CARDS[7].height }]}>
              <View style={s.wideIconWrap}><Ionicons name={FEATURE_CARDS[7].icon as any} size={28} color="white" /></View>
              <View style={s.wideTextWrap}>
                <Text style={s.wideTitle}>{FEATURE_CARDS[7].title}</Text>
                <Text style={s.wideSub}>{FEATURE_CARDS[7].subtitle}</Text>
              </View>
              <Ionicons name="arrow-forward" size={18} color="rgba(255,255,255,0.6)" style={s.wideArrow} />
            </LinearGradient>
          </PressCard>

          {/* Medical Records + Discover — 2-col, indices 8–9 */}
          <View style={s.row2}>
            <PressCard index={8} onPress={() => navigation.navigate(FEATURE_CARDS[8].route as any)} style={s.halfOuter}>
              <LinearGradient colors={FEATURE_CARDS[8].gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[s.halfCard, { height: FEATURE_CARDS[8].height }]}>
                <View style={s.halfIconWrap}><Ionicons name={FEATURE_CARDS[8].icon as any} size={24} color="white" /></View>
                <View style={s.halfTextWrap}>
                  <Text style={s.halfTitle}>{FEATURE_CARDS[8].title}</Text>
                  <Text style={s.halfSub} numberOfLines={2}>{FEATURE_CARDS[8].subtitle}</Text>
                </View>
              </LinearGradient>
            </PressCard>
            <PressCard index={9} onPress={() => navigation.navigate(FEATURE_CARDS[9].route as any)} style={s.halfOuter}>
              <LinearGradient colors={FEATURE_CARDS[9].gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[s.halfCard, { height: FEATURE_CARDS[9].height }]}>
                <View style={s.halfIconWrap}><Ionicons name={FEATURE_CARDS[9].icon as any} size={24} color="white" /></View>
                <View style={s.halfTextWrap}>
                  <Text style={s.halfTitle}>{FEATURE_CARDS[9].title}</Text>
                  <Text style={s.halfSub} numberOfLines={2}>{FEATURE_CARDS[9].subtitle}</Text>
                </View>
              </LinearGradient>
            </PressCard>
          </View>

        </View>

        {/* Bottom nav clearance */}
        <View style={{ height: 110 }} />
      </ScrollView>

      {/* ── Animated Bottom Nav ──────────────────────────────── */}
      <SamsungBottomNav activeRoute="HomeDashboard" />

    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface.dim },

  // Top Bar
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 16,
    paddingTop: 52,
    paddingBottom: 8,
  },
  topBarLeft: { flex: 1, marginRight: 12 },
  appTitle: { fontSize: 28, fontWeight: "700", color: colors.text.primary, lineHeight: 34 },
  subtitleRow: { flexDirection: "row", alignItems: "center", marginTop: 6 },
  avatar: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: colors.surface.containerHigh,
    justifyContent: "center", alignItems: "center",
    borderWidth: 1, borderColor: colors.glass.border,
    marginRight: 8,
  },
  greeting: { fontSize: 14, fontWeight: "600", color: colors.text.primary },
  tagline: { fontSize: 12, color: colors.text.secondary, marginTop: 4 },
  topBarRight: { flexDirection: "row", gap: 8, paddingTop: 4 },
  iconBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.surface.containerHigh,
    borderWidth: 1, borderColor: colors.glass.border,
    justifyContent: "center", alignItems: "center",
  },
  notifBadge: {
    position: "absolute", top: 8, right: 8,
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: colors.error,
    borderWidth: 1, borderColor: colors.surface.containerHigh,
  },
  // Profile avatar button in top-right
  avatarBtn: {
    width: 40, height: 40, borderRadius: 20,
    borderWidth: 2, borderColor: "#8343f4",
    overflow: "hidden",
  },
  avatarBtnInner: {
    flex: 1, justifyContent: "center", alignItems: "center",
  },
  avatarBtnInitials: { fontSize: 14, fontWeight: "700", color: "white" },

  // Top Nav Pills Container (Samsung Style)
  topNavContainer: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    overflow: "hidden",
  },
  pillsScroll: { flexGrow: 0 },
  pillsContent: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minWidth: "100%",
  },
  pillIconContainer: {
    paddingHorizontal: 4,
  },
  pillIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  pillIconBgActive: {
    backgroundColor: "rgba(255,255,255,0.15)",
  },

  // Scroll
  scroll: { paddingHorizontal: 16, paddingTop: 4 },

  // Hero Carousel
  heroWrap: { marginTop: 8, marginBottom: 16, borderRadius: 28, overflow: "hidden" },
  heroSlide: {
    width: SCREEN_W - 32, // matches paddingHorizontal: 16 each side
    padding: 24,
    minHeight: 210,
    justifyContent: "space-between",
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  heroTitle: { fontSize: 22, fontWeight: "700", color: "white", lineHeight: 30, marginBottom: 8 },
  heroSub: { fontSize: 13, color: "rgba(255,255,255,0.75)", lineHeight: 19 },
  heroCTA: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
  },
  dotsRow: { flexDirection: "row", alignItems: "center" },
  dot: {
    width: 6, height: 4, borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.35)",
    marginRight: 5,
  },
  dotActive: {
    width: 22, height: 4, borderRadius: 2,
    backgroundColor: "white",
  },
  exploreBtn: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.25)",
    paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
  },
  exploreBtnText: { color: "white", fontSize: 13, fontWeight: "600" },

  // Services entry button — glowing teal, prominent
  servicesBtn: {
    borderRadius: 26, paddingVertical: 18, paddingHorizontal: 20,
    flexDirection: "row", alignItems: "center",
    marginBottom: 16, overflow: "hidden",
    borderWidth: 1, borderColor: "rgba(0,188,212,0.5)",
    // glow via elevation + shadow
    elevation: 12,
    shadowColor: "#00bcd4",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.55,
    shadowRadius: 18,
  },
  servicesBtnBlob: {
    position: "absolute", top: -30, right: -30,
    width: 140, height: 140, borderRadius: 70,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  servicesBtnIconWrap: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center", alignItems: "center",
    marginRight: 14, flexShrink: 0,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.3)",
  },
  servicesBtnText: { flex: 1 },
  servicesBtnBadge: {
    backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 10,
    paddingHorizontal: 8, paddingVertical: 3, alignSelf: "flex-start",
    marginBottom: 5, borderWidth: 1, borderColor: "rgba(255,255,255,0.3)",
  },
  servicesBtnBadgeText: { fontSize: 9, fontWeight: "800", color: "white", letterSpacing: 1.2 },
  servicesBtnTitle: { fontSize: 17, fontWeight: "700", color: "white", marginBottom: 3 },
  servicesBtnSub: { fontSize: 12, color: "rgba(255,255,255,0.75)" },
  servicesBtnArrow: { flexShrink: 0, paddingLeft: 8 },

  // Card grid
  cardGrid: { gap: 12 },
  row2: { flexDirection: "row", gap: 12 },

  // Wide card
  wideCard: {
    borderRadius: 24,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    overflow: "hidden",
  },
  wideIconWrap: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center", alignItems: "center",
    marginRight: 16, flexShrink: 0,
  },
  wideTextWrap: { flex: 1 },
  wideTitle: { fontSize: 16, fontWeight: "700", color: "white", marginBottom: 4 },
  wideSub: { fontSize: 12, color: "rgba(255,255,255,0.75)", lineHeight: 17 },
  wideArrow: { paddingLeft: 8, flexShrink: 0 },

  // Half card
  halfOuter: { flex: 1 },
  halfCard: {
    borderRadius: 24, padding: 18,
    justifyContent: "space-between",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.15)",
    overflow: "hidden",
  },
  halfIconWrap: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center", alignItems: "center",
  },
  halfTextWrap: { marginTop: 12 },
  halfTitle: { fontSize: 15, fontWeight: "700", color: "white", marginBottom: 4 },
  halfSub: { fontSize: 11, color: "rgba(255,255,255,0.75)", lineHeight: 16 },
});
