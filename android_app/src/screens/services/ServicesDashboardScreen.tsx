import React, { useEffect, useState, useMemo } from "react";
import {
  ScrollView,
  Text,
  View,
  Pressable,
  StyleSheet,
  TextInput,
  Dimensions,
  StatusBar,
  Modal,
  Alert,
  Image,
  BackHandler,
} from "react-native";
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  FadeInDown,
  Easing,
} from "react-native-reanimated";
import { RootStackParamList } from "@/navigation/types";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import SamsungBottomNav from "@/components/SamsungBottomNav";
import { SERVICE_LOCAL_IMAGES } from "@/assets/serviceImages";
import { SERVICE_CATEGORIES } from "./servicesData";

type Props = NativeStackScreenProps<RootStackParamList, "ServicesDashboard">;

const { width: W } = Dimensions.get("window");
const CARD_W = (W - 32 - 12) / 2;

// Filter chips in Explore view
const EXPLORE_CHIPS = [
  { id: "all", label: "All", icon: "apps-outline" as const },
  { id: "home", label: "Home", icon: "home-outline" as const },
  { id: "health", label: "Health", icon: "heart-outline" as const },
  { id: "services", label: "Services", icon: "construct-outline" as const },
  { id: "more", label: "More", icon: "ellipsis-horizontal" as const },
];

export default function ServicesDashboardScreen({ navigation }: Props) {
  const { user } = useAuth();
  const { theme, isDark, colors } = useTheme();

  // Active view: "main" (Left screenshot) or "explore" (Right screenshot)
  const [activeView, setActiveView] = useState<"main" | "explore">("main");
  const [exploreFilter, setExploreFilter] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [locationName, setLocationName] = useState("Coimbatore");
  const [locationModal, setLocationModal] = useState(false);
  const [sideMenuVisible, setSideMenuVisible] = useState(false);



  const getCategoryServiceCount = (catId: string) => {
    const found = SERVICE_CATEGORIES.find((c) => c.id === catId);
    return found ? `${found.subServices.length} services` : "Services";
  };

  const headerOp = useSharedValue(0);
  const headerY = useSharedValue(-20);

  useEffect(() => {
    headerOp.value = withTiming(1, { duration: 420, easing: Easing.out(Easing.cubic) });
    headerY.value = withSpring(0, { damping: 18, stiffness: 200 });
  }, [activeView]);

  useEffect(() => {
    if (activeView === "explore") {
      const sub = BackHandler.addEventListener("hardwareBackPress", () => {
        setActiveView("main");
        return true;
      });
      return () => sub.remove();
    }
  }, [activeView]);

  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOp.value,
    transform: [{ translateY: headerY.value }],
  }));

  const firstName = user?.displayName?.split(" ")[0] ?? "Friend";

  return (
    <View style={[s.root, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={activeView === "explore" ? "light-content" : (isDark ? "light-content" : "dark-content")}
        backgroundColor="transparent"
        translucent
      />

      {/* ═════════════════════════════════════════════════════════════════════════
          VIEW 1: MAIN HOME (Reference Screenshot Style)
          ═════════════════════════════════════════════════════════════════════════ */}
      {activeView === "main" ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.scrollContent}
          stickyHeaderIndices={[1]}
        >
          {/* ── 1. HERO HEADER — deep green gradient, full-width ──────── */}
          <LinearGradient
            colors={["#064e3b", "#065f46", "#047857"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={s.mainHeroHeader}
          >
            {/* Top Bar: Profile avatar on left, hamburger menu, brand, SOS and notifications on right */}
            <Animated.View style={[s.heroTopBar, headerStyle]}>
              <View style={s.heroTopBarLeft}>
                <Pressable
                  style={s.heroAvatarCircle}
                  onPress={() => navigation.navigate("Profile")}
                >
                  <LinearGradient colors={["#00c6aa", "#0f9b8e"]} style={s.avatarInner}>
                    <Text style={s.avatarInitial}>{firstName.charAt(0).toUpperCase()}</Text>
                  </LinearGradient>
                </Pressable>

                <Pressable
                  style={s.heroHamburgerBtn}
                  onPress={() => setSideMenuVisible(true)}
                >
                  <Ionicons name="menu" size={22} color="#ffffff" />
                </Pressable>

                <View>
                  <Text style={s.heroBrandTitle}>Urban Services</Text>
                  <Text style={s.heroBrandSub}>Home &amp; Living Solutions</Text>
                </View>
              </View>

              <View style={s.heroTopBarIcons}>
                <Pressable
                  style={s.heroSosBtn}
                  onPress={() => navigation.navigate("EmergencyAssistance")}
                >
                  <Ionicons name="warning" size={14} color="#ffffff" />
                  <Text style={s.heroSosBtnText}>SOS</Text>
                </Pressable>

                <Pressable
                  style={s.heroIconBtn}
                  onPress={() => navigation.navigate("Notifications")}
                >
                  <Ionicons name="notifications-outline" size={20} color="#ffffff" />
                  <View style={s.notifDot} />
                </Pressable>
              </View>
            </Animated.View>

            {/* Hero Heading + Illustration */}
            <View style={s.heroContentRow}>
              <View style={s.heroTextCol}>
                <Text style={s.heroMainTitle}>Make Your{"\n"}Home Better</Text>
                <Text style={s.heroMainSubtitle}>
                  Find the right service for your home, health and lifestyle.
                </Text>
                <Pressable style={s.heroExploreBtn} onPress={() => setActiveView("explore")}>
                  <Text style={s.heroExploreBtnText}>Explore Services</Text>
                  <Ionicons name="arrow-forward" size={13} color="#ffffff" />
                </Pressable>
              </View>

              {/* House illustration reused from explore view */}
              <View style={s.houseIllustration}>
                <View style={s.houseRoof} />
                <View style={s.houseWalls}>
                  <View style={s.houseDoor} />
                  <View style={s.houseWindow} />
                </View>
                <View style={s.houseChimney} />
                <View style={s.houseLawn} />
              </View>
            </View>
          </LinearGradient>

          {/* ── 2. STICKY HEADER (Search Bar + Submenu: Reminders, Points, Nearby Updates) ── */}
          <View style={[s.stickyHeaderWrap, { backgroundColor: colors.background }]}>
            {/* Search Bar */}
            <View
              style={[
                s.searchContainer,
                {
                  backgroundColor: isDark ? "#161f2e" : "#ffffff",
                  borderColor: colors.cardBorder,
                },
              ]}
            >
              <Ionicons name="search-outline" size={20} color={colors.textMuted} style={s.searchIcon} />
              <TextInput
                style={[s.searchInput, { color: colors.text }]}
                placeholder="Search services, e.g. cleaning, RO..."
                placeholderTextColor={colors.textMuted}
                value={searchText}
                onChangeText={setSearchText}
                returnKeyType="search"
              />
              <Pressable
                onPress={() => Alert.alert("Voice Search", "Listening for your voice request...")}
                style={s.micBtn}
              >
                <Ionicons name="mic-outline" size={20} color={colors.textSecondary} />
              </Pressable>
            </View>

            {/* Sticky Submenu: Reminders, Points, Nearby Updates */}
            <View style={s.submenuRow}>
              <Pressable
                style={[
                  s.submenuPill,
                  {
                    backgroundColor: isDark ? "#161f2e" : "#f0fdf4",
                    borderColor: isDark ? "#1f2937" : "#bbf7d0",
                  },
                ]}
                onPress={() => navigation.navigate("SmartReminders")}
              >
                <LinearGradient colors={["#059669", "#10b981"]} style={s.submenuIconWrap}>
                  <Ionicons name="alarm" size={12} color="#ffffff" />
                </LinearGradient>
                <Text style={[s.submenuPillText, { color: isDark ? "#ffffff" : "#065f46" }]}>Reminders</Text>
              </Pressable>

              <Pressable
                style={[
                  s.submenuPill,
                  {
                    backgroundColor: isDark ? "#161f2e" : "#fffbeb",
                    borderColor: isDark ? "#1f2937" : "#fde68a",
                  },
                ]}
                onPress={() => navigation.navigate("Points")}
              >
                <LinearGradient colors={["#d97706", "#f59e0b"]} style={s.submenuIconWrap}>
                  <Ionicons name="trophy" size={12} color="#ffffff" />
                </LinearGradient>
                <Text style={[s.submenuPillText, { color: isDark ? "#ffffff" : "#92400e" }]}>Points</Text>
              </Pressable>

              <Pressable
                style={[
                  s.submenuPill,
                  {
                    backgroundColor: isDark ? "#161f2e" : "#fef2f2",
                    borderColor: isDark ? "#1f2937" : "#fecaca",
                  },
                ]}
                onPress={() => navigation.navigate("NearbyUpdates")}
              >
                <LinearGradient colors={["#dc2626", "#ef4444"]} style={s.submenuIconWrap}>
                  <Ionicons name="radio" size={12} color="#ffffff" />
                </LinearGradient>
                <Text style={[s.submenuPillText, { color: isDark ? "#ffffff" : "#991b1b" }]}>Nearby Updates</Text>
              </Pressable>
            </View>
          </View>

          {/* ── 3. SERVICE CATEGORIES GRID ───────────────────────────── */}
          <View style={s.sectionHeader}>
            <Text style={[s.sectionTitle, { color: colors.text }]}>Service Categories</Text>
          </View>

          <View style={s.exploreCatGrid}>
            {/* 1. Home Cleaning */}
            <Pressable
              style={[s.exploreCatCard, { backgroundColor: isDark ? "#161f2e" : "#ffffff", borderColor: colors.cardBorder }]}
              onPress={() => navigation.navigate("ServiceCategory", { categoryId: "cleaning" })}
            >
              <View style={s.exploreCatImageWrap}>
                <Image source={SERVICE_LOCAL_IMAGES.cleaning} style={s.exploreCatImage} resizeMode="cover" />
              </View>
              <Text style={[s.exploreCatTitle, { color: colors.text }]} numberOfLines={1}>Home Cleaning</Text>
              <Text style={[s.exploreCatSub, { color: colors.textMuted }]}>{getCategoryServiceCount("cleaning")}</Text>
            </Pressable>

            {/* 2. RO Service */}
            <Pressable
              style={[s.exploreCatCard, { backgroundColor: isDark ? "#161f2e" : "#ffffff", borderColor: colors.cardBorder }]}
              onPress={() => navigation.navigate("ServiceCategory", { categoryId: "ro" })}
            >
              <View style={s.exploreCatImageWrap}>
                <Image source={SERVICE_LOCAL_IMAGES.ro} style={s.exploreCatImage} resizeMode="cover" />
              </View>
              <Text style={[s.exploreCatTitle, { color: colors.text }]} numberOfLines={1}>RO Service</Text>
              <Text style={[s.exploreCatSub, { color: colors.textMuted }]}>{getCategoryServiceCount("ro")}</Text>
            </Pressable>

            {/* 3. Pest Control */}
            <Pressable
              style={[s.exploreCatCard, { backgroundColor: isDark ? "#161f2e" : "#ffffff", borderColor: colors.cardBorder }]}
              onPress={() => navigation.navigate("ServiceCategory", { categoryId: "pest" })}
            >
              <View style={s.exploreCatImageWrap}>
                <Image source={SERVICE_LOCAL_IMAGES.pest} style={s.exploreCatImage} resizeMode="cover" />
              </View>
              <Text style={[s.exploreCatTitle, { color: colors.text }]} numberOfLines={1}>Pest Control</Text>
              <Text style={[s.exploreCatSub, { color: colors.textMuted }]}>{getCategoryServiceCount("pest")}</Text>
            </Pressable>

            {/* 4. Pet Care */}
            <Pressable
              style={[s.exploreCatCard, { backgroundColor: isDark ? "#161f2e" : "#ffffff", borderColor: colors.cardBorder }]}
              onPress={() => navigation.navigate("ServiceCategory", { categoryId: "pet" })}
            >
              <View style={s.exploreCatImageWrap}>
                <Image source={SERVICE_LOCAL_IMAGES.pet} style={s.exploreCatImage} resizeMode="cover" />
              </View>
              <Text style={[s.exploreCatTitle, { color: colors.text }]} numberOfLines={1}>Pet Care</Text>
              <Text style={[s.exploreCatSub, { color: colors.textMuted }]}>{getCategoryServiceCount("pet")}</Text>
            </Pressable>

            {/* 5. Horticulture */}
            <Pressable
              style={[s.exploreCatCard, { backgroundColor: isDark ? "#161f2e" : "#ffffff", borderColor: colors.cardBorder }]}
              onPress={() => navigation.navigate("ServiceCategory", { categoryId: "hort" })}
            >
              <View style={s.exploreCatImageWrap}>
                <Image source={SERVICE_LOCAL_IMAGES.horticulture} style={s.exploreCatImage} resizeMode="cover" />
              </View>
              <Text style={[s.exploreCatTitle, { color: colors.text }]} numberOfLines={1}>Horticulture</Text>
              <Text style={[s.exploreCatSub, { color: colors.textMuted }]}>{getCategoryServiceCount("hort")}</Text>
            </Pressable>

            {/* 6. Appliances */}
            <Pressable
              style={[s.exploreCatCard, { backgroundColor: isDark ? "#161f2e" : "#ffffff", borderColor: colors.cardBorder }]}
              onPress={() => navigation.navigate("ServiceCategory", { categoryId: "appliance" })}
            >
              <View style={s.exploreCatImageWrap}>
                <Image source={SERVICE_LOCAL_IMAGES.appliances} style={s.exploreCatImage} resizeMode="cover" />
              </View>
              <Text style={[s.exploreCatTitle, { color: colors.text }]} numberOfLines={1}>Appliances</Text>
              <Text style={[s.exploreCatSub, { color: colors.textMuted }]}>{getCategoryServiceCount("appliance")}</Text>
            </Pressable>

            {/* 7. Home Care */}
            <Pressable
              style={[s.exploreCatCard, { backgroundColor: isDark ? "#161f2e" : "#ffffff", borderColor: colors.cardBorder }]}
              onPress={() => navigation.navigate("ServiceCategory", { categoryId: "homecare" })}
            >
              <View style={s.exploreCatImageWrap}>
                <Image source={SERVICE_LOCAL_IMAGES.homecare} style={s.exploreCatImage} resizeMode="cover" />
              </View>
              <Text style={[s.exploreCatTitle, { color: colors.text }]} numberOfLines={1}>Home Care</Text>
              <Text style={[s.exploreCatSub, { color: colors.textMuted }]}>{getCategoryServiceCount("homecare")}</Text>
            </Pressable>

            {/* 8. Emergency */}
            <Pressable
              style={[s.exploreCatCard, { backgroundColor: isDark ? "#161f2e" : "#ffffff", borderColor: colors.cardBorder }]}
              onPress={() => navigation.navigate("EmergencyAssistance")}
            >
              <View style={s.exploreCatImageWrap}>
                <Image source={SERVICE_LOCAL_IMAGES.emergency} style={s.exploreCatImage} resizeMode="cover" />
              </View>
              <Text style={[s.exploreCatTitle, { color: colors.text }]} numberOfLines={1}>Emergency</Text>
              <Text style={[s.exploreCatSub, { color: colors.textMuted }]}>{getCategoryServiceCount("emergency")}</Text>
            </Pressable>

            {/* 9. Insurance */}
            <Pressable
              style={[s.exploreCatCard, { backgroundColor: isDark ? "#161f2e" : "#ffffff", borderColor: colors.cardBorder }]}
              onPress={() => navigation.navigate("ServiceCategory", { categoryId: "insurance" })}
            >
              <View style={s.exploreCatImageWrap}>
                <Image source={SERVICE_LOCAL_IMAGES.insurance} style={s.exploreCatImage} resizeMode="cover" />
              </View>
              <Text style={[s.exploreCatTitle, { color: colors.text }]} numberOfLines={1}>Insurance</Text>
              <Text style={[s.exploreCatSub, { color: colors.textMuted }]}>{getCategoryServiceCount("insurance")}</Text>
            </Pressable>

            {/* 10. Other Services */}
            <Pressable
              style={[s.exploreCatCard, { backgroundColor: isDark ? "#161f2e" : "#ffffff", borderColor: colors.cardBorder }]}
              onPress={() => navigation.navigate("ServiceCategory", { categoryId: "other" })}
            >
              <View style={s.exploreCatImageWrap}>
                <Image source={SERVICE_LOCAL_IMAGES.other} style={s.exploreCatImage} resizeMode="cover" />
              </View>
              <Text style={[s.exploreCatTitle, { color: colors.text }]} numberOfLines={1}>Other Services</Text>
              <Text style={[s.exploreCatSub, { color: colors.textMuted }]}>{getCategoryServiceCount("other")}</Text>
            </Pressable>
          </View>

          {/* See All Button below service categories */}
          <Pressable
            style={[
              s.seeAllBelowBtn,
              {
                backgroundColor: isDark ? "#161f2e" : "#ecfdf5",
                borderColor: isDark ? "#1f2937" : "#a7f3d0",
              },
            ]}
            onPress={() => setActiveView("explore")}
          >
            <Text style={[s.seeAllBelowText, { color: isDark ? "#34d399" : "#059669" }]}>View All Categories</Text>
            <Ionicons name="arrow-forward" size={15} color={isDark ? "#34d399" : "#059669"} />
          </Pressable>

          {/* ── 4. QUICK ACTIONS ROW ─────────────────────────────────── */}
          <View style={s.quickActionsRow}>
            <Pressable style={s.quickActionCard} onPress={() => navigation.navigate("MyBookings")}>
              <View style={[s.quickActionCircle, { backgroundColor: "rgba(16,185,129,0.15)" }]}>
                <Ionicons name="calendar" size={22} color="#10b981" />
              </View>
              <Text style={[s.quickActionTitle, { color: colors.text }]}>My Bookings</Text>
              <Text style={[s.quickActionSub, { color: colors.textMuted }]}>View &amp; manage</Text>
            </Pressable>
            <Pressable style={s.quickActionCard} onPress={() => navigation.navigate("LiveTracking")}>
              <View style={[s.quickActionCircle, { backgroundColor: "rgba(139,92,246,0.15)" }]}>
                <Ionicons name="location" size={22} color="#8b5cf6" />
              </View>
              <Text style={[s.quickActionTitle, { color: colors.text }]}>Track</Text>
              <Text style={[s.quickActionSub, { color: colors.textMuted }]}>Live tracking</Text>
            </Pressable>
            <Pressable style={s.quickActionCard} onPress={() => navigation.navigate("Offers")}>
              <View style={[s.quickActionCircle, { backgroundColor: "rgba(245,158,11,0.15)" }]}>
                <Ionicons name="gift" size={22} color="#f59e0b" />
              </View>
              <Text style={[s.quickActionTitle, { color: colors.text }]}>Offers</Text>
              <Text style={[s.quickActionSub, { color: colors.textMuted }]}>Save more</Text>
            </Pressable>
            <Pressable style={s.quickActionCard} onPress={() => navigation.navigate("EmergencyAssistance")}>
              <View style={[s.quickActionCircle, { backgroundColor: "rgba(239,68,68,0.15)" }]}>
                <Text style={s.emergencyText}>SOS</Text>
              </View>
              <Text style={[s.quickActionTitle, { color: colors.text }]}>Emergency</Text>
              <Text style={[s.quickActionSub, { color: colors.textMuted }]}>Get help</Text>
            </Pressable>
          </View>

          {/* ── 5. PROMOTIONAL OFFERS BANNER ─────────────────────────── */}
          <LinearGradient
            colors={["#1e3a8a", "#1d4ed8", "#2563eb"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={s.offersPromoCard}
          >
            <View style={s.offersPromoLeft}>
              <Text style={s.offersPromoTitle}>Save More with{"\n"}Exclusive Offers</Text>
              <Text style={s.offersPromoSub}>Get the best deals on your favourite services.</Text>
              <Pressable style={s.offersPromoBtn} onPress={() => navigation.navigate("Offers")}>
                <Text style={s.offersPromoBtnText}>View Offers</Text>
              </Pressable>
            </View>
            <View style={s.giftBoxWrap}>
              <View style={s.giftBoxRibbonH} />
              <View style={s.giftBoxRibbonV} />
              <View style={s.giftBoxBow} />
              <Ionicons name="sparkles" size={14} color="#fde047" style={s.giftSparkle1} />
              <Ionicons name="sparkles" size={10} color="#67e8f9" style={s.giftSparkle2} />
            </View>
          </LinearGradient>

          <View style={{ height: 110 }} />
        </ScrollView>
      ) : (
        /* ═════════════════════════════════════════════════════════════════════════
           VIEW 2: EXPLORE OUR SERVICES (Matching Right Screenshot)
           ═════════════════════════════════════════════════════════════════════════ */
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.scrollContent}
          stickyHeaderIndices={[1]}
        >
          {/* ── 1. Curved Emerald Wave Header with 3D House ──────────── */}
          <LinearGradient
            colors={["#064e3b", "#065f46", "#047857"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={s.exploreWaveHeader}
          >
            {/* Top Bar in Explore: Back button + Title + SOS Button */}
            <View style={s.exploreTopRow}>
              <Pressable
                style={s.exploreBackBtn}
                onPress={() => setActiveView("main")}
              >
                <Ionicons name="arrow-back" size={22} color="#ffffff" />
              </Pressable>

              <Text style={s.exploreTopTitle}>Explore Services</Text>

              <Pressable
                style={s.heroSosBtn}
                onPress={() => navigation.navigate("EmergencyAssistance")}
              >
                <Ionicons name="warning" size={14} color="#ffffff" />
                <Text style={s.heroSosBtnText}>SOS</Text>
              </Pressable>
            </View>

            <View style={s.exploreHeaderContent}>
              <View style={s.exploreHeaderText}>
                <Text style={s.exploreTitle}>All Service{"\n"}Categories</Text>
                <Text style={s.exploreSubtitle}>
                  Choose from our verified local services and lifestyle care.
                </Text>
              </View>

              {/* 3D House Graphic Illustration */}
              <View style={s.houseIllustration}>
                <View style={s.houseRoof} />
                <View style={s.houseWalls}>
                  <View style={s.houseDoor} />
                  <View style={s.houseWindow} />
                </View>
                <View style={s.houseChimney} />
                <View style={s.houseLawn} />
              </View>
            </View>
          </LinearGradient>

          {/* ── 2. STICKY HEADER (Search Bar + Submenu: Reminders, Points, Nearby Updates) ── */}
          <View style={[s.stickyHeaderWrap, { backgroundColor: colors.background }]}>
            {/* Search Bar */}
            <View
              style={[
                s.searchContainer,
                {
                  backgroundColor: isDark ? "#161f2e" : "#ffffff",
                  borderColor: colors.cardBorder,
                },
              ]}
            >
              <Ionicons name="search-outline" size={20} color={colors.textMuted} style={s.searchIcon} />
              <TextInput
                style={[s.searchInput, { color: colors.text }]}
                placeholder="Search services, e.g. cleaning, RO..."
                placeholderTextColor={colors.textMuted}
                value={searchText}
                onChangeText={setSearchText}
                returnKeyType="search"
              />
              <Pressable
                onPress={() => Alert.alert("Voice Search", "Listening for your voice request...")}
                style={s.micBtn}
              >
                <Ionicons name="mic-outline" size={20} color={colors.textSecondary} />
              </Pressable>
            </View>

            {/* Sticky Submenu: Reminders, Points, Nearby Updates */}
            <View style={s.submenuRow}>
              <Pressable
                style={[
                  s.submenuPill,
                  {
                    backgroundColor: isDark ? "#161f2e" : "#f0fdf4",
                    borderColor: isDark ? "#1f2937" : "#bbf7d0",
                  },
                ]}
                onPress={() => navigation.navigate("SmartReminders")}
              >
                <LinearGradient colors={["#059669", "#10b981"]} style={s.submenuIconWrap}>
                  <Ionicons name="alarm" size={12} color="#ffffff" />
                </LinearGradient>
                <Text style={[s.submenuPillText, { color: isDark ? "#ffffff" : "#065f46" }]}>Reminders</Text>
              </Pressable>

              <Pressable
                style={[
                  s.submenuPill,
                  {
                    backgroundColor: isDark ? "#161f2e" : "#fffbeb",
                    borderColor: isDark ? "#1f2937" : "#fde68a",
                  },
                ]}
                onPress={() => navigation.navigate("Points")}
              >
                <LinearGradient colors={["#d97706", "#f59e0b"]} style={s.submenuIconWrap}>
                  <Ionicons name="trophy" size={12} color="#ffffff" />
                </LinearGradient>
                <Text style={[s.submenuPillText, { color: isDark ? "#ffffff" : "#92400e" }]}>Points</Text>
              </Pressable>

              <Pressable
                style={[
                  s.submenuPill,
                  {
                    backgroundColor: isDark ? "#161f2e" : "#fef2f2",
                    borderColor: isDark ? "#1f2937" : "#fecaca",
                  },
                ]}
                onPress={() => navigation.navigate("NearbyUpdates")}
              >
                <LinearGradient colors={["#dc2626", "#ef4444"]} style={s.submenuIconWrap}>
                  <Ionicons name="radio" size={12} color="#ffffff" />
                </LinearGradient>
                <Text style={[s.submenuPillText, { color: isDark ? "#ffffff" : "#991b1b" }]}>Nearby Updates</Text>
              </Pressable>
            </View>
          </View>

          {/* ── 3. Service Categories 10-Card Grid ────────────────────── */}
          <View style={s.sectionHeader}>
            <Text style={[s.sectionTitle, { color: colors.text }]}>Service Categories</Text>
          </View>

          <View style={s.exploreCatGrid}>
            {/* 1. Home Cleaning */}
            <Pressable
              style={[s.exploreCatCard, { backgroundColor: isDark ? "#161f2e" : "#ffffff", borderColor: colors.cardBorder }]}
              onPress={() => navigation.navigate("ServiceCategory", { categoryId: "cleaning" })}
            >
              <View style={s.exploreCatImageWrap}>
                <Image
                  source={SERVICE_LOCAL_IMAGES.cleaning}
                  style={s.exploreCatImage}
                  resizeMode="cover"
                />
              </View>
              <Text style={[s.exploreCatTitle, { color: colors.text }]} numberOfLines={1}>Home Cleaning</Text>
              <Text style={[s.exploreCatSub, { color: colors.textMuted }]}>{getCategoryServiceCount("cleaning")}</Text>
            </Pressable>

            {/* 2. RO Service */}
            <Pressable
              style={[s.exploreCatCard, { backgroundColor: isDark ? "#161f2e" : "#ffffff", borderColor: colors.cardBorder }]}
              onPress={() => navigation.navigate("ServiceCategory", { categoryId: "ro" })}
            >
              <View style={s.exploreCatImageWrap}>
                <Image
                  source={SERVICE_LOCAL_IMAGES.ro}
                  style={s.exploreCatImage}
                  resizeMode="cover"
                />
              </View>
              <Text style={[s.exploreCatTitle, { color: colors.text }]} numberOfLines={1}>RO Service</Text>
              <Text style={[s.exploreCatSub, { color: colors.textMuted }]}>{getCategoryServiceCount("ro")}</Text>
            </Pressable>

            {/* 3. Pest Control */}
            <Pressable
              style={[s.exploreCatCard, { backgroundColor: isDark ? "#161f2e" : "#ffffff", borderColor: colors.cardBorder }]}
              onPress={() => navigation.navigate("ServiceCategory", { categoryId: "pest" })}
            >
              <View style={s.exploreCatImageWrap}>
                <Image
                  source={SERVICE_LOCAL_IMAGES.pest}
                  style={s.exploreCatImage}
                  resizeMode="cover"
                />
              </View>
              <Text style={[s.exploreCatTitle, { color: colors.text }]} numberOfLines={1}>Pest Control</Text>
              <Text style={[s.exploreCatSub, { color: colors.textMuted }]}>{getCategoryServiceCount("pest")}</Text>
            </Pressable>

            {/* 4. Pet Care */}
            <Pressable
              style={[s.exploreCatCard, { backgroundColor: isDark ? "#161f2e" : "#ffffff", borderColor: colors.cardBorder }]}
              onPress={() => navigation.navigate("ServiceCategory", { categoryId: "pet" })}
            >
              <View style={s.exploreCatImageWrap}>
                <Image
                  source={SERVICE_LOCAL_IMAGES.pet}
                  style={s.exploreCatImage}
                  resizeMode="cover"
                />
              </View>
              <Text style={[s.exploreCatTitle, { color: colors.text }]} numberOfLines={1}>Pet Care</Text>
              <Text style={[s.exploreCatSub, { color: colors.textMuted }]}>{getCategoryServiceCount("pet")}</Text>
            </Pressable>

            {/* 5. Horticulture */}
            <Pressable
              style={[s.exploreCatCard, { backgroundColor: isDark ? "#161f2e" : "#ffffff", borderColor: colors.cardBorder }]}
              onPress={() => navigation.navigate("ServiceCategory", { categoryId: "hort" })}
            >
              <View style={s.exploreCatImageWrap}>
                <Image
                  source={SERVICE_LOCAL_IMAGES.horticulture}
                  style={s.exploreCatImage}
                  resizeMode="cover"
                />
              </View>
              <Text style={[s.exploreCatTitle, { color: colors.text }]} numberOfLines={1}>Horticulture</Text>
              <Text style={[s.exploreCatSub, { color: colors.textMuted }]}>{getCategoryServiceCount("hort")}</Text>
            </Pressable>

            {/* 6. Appliance Cleaning */}
            <Pressable
              style={[s.exploreCatCard, { backgroundColor: isDark ? "#161f2e" : "#ffffff", borderColor: colors.cardBorder }]}
              onPress={() => navigation.navigate("ServiceCategory", { categoryId: "appliance" })}
            >
              <View style={s.exploreCatImageWrap}>
                <Image
                  source={SERVICE_LOCAL_IMAGES.appliances}
                  style={s.exploreCatImage}
                  resizeMode="cover"
                />
              </View>
              <Text style={[s.exploreCatTitle, { color: colors.text }]} numberOfLines={1}>Appliances</Text>
              <Text style={[s.exploreCatSub, { color: colors.textMuted }]}>{getCategoryServiceCount("appliance")}</Text>
            </Pressable>

            {/* 7. Home Care */}
            <Pressable
              style={[s.exploreCatCard, { backgroundColor: isDark ? "#161f2e" : "#ffffff", borderColor: colors.cardBorder }]}
              onPress={() => navigation.navigate("ServiceCategory", { categoryId: "homecare" })}
            >
              <View style={s.exploreCatImageWrap}>
                <Image
                  source={SERVICE_LOCAL_IMAGES.homecare}
                  style={s.exploreCatImage}
                  resizeMode="cover"
                />
              </View>
              <Text style={[s.exploreCatTitle, { color: colors.text }]} numberOfLines={1}>Home Care</Text>
              <Text style={[s.exploreCatSub, { color: colors.textMuted }]}>{getCategoryServiceCount("homecare")}</Text>
            </Pressable>

            {/* 8. Emergency Assistance */}
            <Pressable
              style={[s.exploreCatCard, { backgroundColor: isDark ? "#161f2e" : "#ffffff", borderColor: colors.cardBorder }]}
              onPress={() => navigation.navigate("EmergencyAssistance")}
            >
              <View style={s.exploreCatImageWrap}>
                <Image
                  source={SERVICE_LOCAL_IMAGES.emergency}
                  style={s.exploreCatImage}
                  resizeMode="cover"
                />
              </View>
              <Text style={[s.exploreCatTitle, { color: colors.text }]} numberOfLines={1}>Emergency</Text>
              <Text style={[s.exploreCatSub, { color: colors.textMuted }]}>{getCategoryServiceCount("emergency")}</Text>
            </Pressable>

            {/* 9. Insurance Services */}
            <Pressable
              style={[s.exploreCatCard, { backgroundColor: isDark ? "#161f2e" : "#ffffff", borderColor: colors.cardBorder }]}
              onPress={() => navigation.navigate("ServiceCategory", { categoryId: "insurance" })}
            >
              <View style={s.exploreCatImageWrap}>
                <Image
                  source={SERVICE_LOCAL_IMAGES.insurance}
                  style={s.exploreCatImage}
                  resizeMode="cover"
                />
              </View>
              <Text style={[s.exploreCatTitle, { color: colors.text }]} numberOfLines={1}>Insurance</Text>
              <Text style={[s.exploreCatSub, { color: colors.textMuted }]}>{getCategoryServiceCount("insurance")}</Text>
            </Pressable>

            {/* 10. Other Services */}
            <Pressable
              style={[s.exploreCatCard, { backgroundColor: isDark ? "#161f2e" : "#ffffff", borderColor: colors.cardBorder }]}
              onPress={() => navigation.navigate("ServiceCategory", { categoryId: "other" })}
            >
              <View style={s.exploreCatImageWrap}>
                <Image
                  source={SERVICE_LOCAL_IMAGES.other}
                  style={s.exploreCatImage}
                  resizeMode="cover"
                />
              </View>
              <Text style={[s.exploreCatTitle, { color: colors.text }]} numberOfLines={1}>Other Services</Text>
              <Text style={[s.exploreCatSub, { color: colors.textMuted }]}>{getCategoryServiceCount("other")}</Text>
            </Pressable>
          </View>

          {/* ── 4. Bottom Blue Exclusive Offers Promo Card ───────────── */}
          <LinearGradient
            colors={["#1e3a8a", "#1d4ed8", "#2563eb"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={s.offersPromoCard}
          >
            <View style={s.offersPromoLeft}>
              <Text style={s.offersPromoTitle}>Save More with{"\n"}Exclusive Offers</Text>
              <Text style={s.offersPromoSub}>Get the best deals on your favourite services.</Text>
              <Pressable
                style={s.offersPromoBtn}
                onPress={() => navigation.navigate("Offers")}
              >
                <Text style={s.offersPromoBtnText}>View Offers</Text>
                <Ionicons name="arrow-forward" size={13} color="#ffffff" />
              </Pressable>
            </View>

            {/* 3D Gift Box illustration */}
            <View style={s.giftBoxWrap}>
              <View style={s.giftBoxRibbonH} />
              <View style={s.giftBoxRibbonV} />
              <View style={s.giftBoxBow} />
              <Ionicons name="sparkles" size={14} color="#fde047" style={s.giftSparkle1} />
              <Ionicons name="sparkles" size={10} color="#67e8f9" style={s.giftSparkle2} />
            </View>
          </LinearGradient>

          <View style={{ height: 110 }} />
        </ScrollView>
      )}

      {/* ── Location Modal ───────────────────────────────────────── */}
      <Modal transparent visible={locationModal} animationType="fade" onRequestClose={() => setLocationModal(false)}>
        <Pressable style={s.modalBackdrop} onPress={() => setLocationModal(false)}>
          <View style={[s.modalCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Text style={[s.modalTitle, { color: colors.text }]}>Select Location</Text>
            {["Coimbatore", "Bangalore", "Chennai", "Hyderabad", "Mumbai"].map((city) => (
              <Pressable
                key={city}
                style={[s.cityOption, city === locationName && s.cityOptionActive]}
                onPress={() => {
                  setLocationName(city);
                  setLocationModal(false);
                }}
              >
                <Ionicons
                  name="location"
                  size={18}
                  color={city === locationName ? "#2563eb" : colors.textMuted}
                />
                <Text
                  style={[
                    s.cityOptionText,
                    { color: city === locationName ? "#2563eb" : colors.text },
                    city === locationName && { fontWeight: "700" },
                  ]}
                >
                  {city}
                </Text>
                {city === locationName && (
                  <Ionicons name="checkmark-circle" size={18} color="#2563eb" style={{ marginLeft: "auto" }} />
                )}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>

      {/* ── Side Menu Drawer Modal (3-Line Menu) ──────────────────── */}
      <Modal
        visible={sideMenuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSideMenuVisible(false)}
      >
        <Pressable style={s.drawerBackdrop} onPress={() => setSideMenuVisible(false)}>
          <Pressable style={[s.drawerCard, { backgroundColor: isDark ? "#0f172a" : "#ffffff" }]} onPress={(e) => e.stopPropagation()}>
            {/* Drawer Header */}
            <View style={[s.drawerHeader, { borderBottomColor: isDark ? "#1e293b" : "#f1f5f9" }]}>
              <View style={s.drawerAvatar}>
                <LinearGradient colors={["#00c6aa", "#0f9b8e"]} style={s.avatarInner}>
                  <Text style={s.avatarInitial}>{firstName.charAt(0).toUpperCase()}</Text>
                </LinearGradient>
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[s.drawerUserName, { color: colors.text }]}>{user?.displayName || "Urban User"}</Text>
                <Text style={[s.drawerUserEmail, { color: colors.textMuted }]}>{user?.email || "user@urbanhelpers.app"}</Text>
              </View>
              <Pressable onPress={() => setSideMenuVisible(false)} style={s.drawerCloseBtn}>
                <Ionicons name="close" size={20} color={colors.textSecondary} />
              </Pressable>
            </View>

            {/* Menu Items List */}
            <ScrollView showsVerticalScrollIndicator={false} style={s.drawerList}>
              {[
                { label: "My Bookings & Invoices", icon: "calendar-outline", color: "#10b981", route: "MyBookings" },
                { label: "Doctor Consultations", icon: "medkit-outline", color: "#00bcd4", route: "DoctorAdvice" },
                { label: "Family Safety & SOS Hub", icon: "shield-checkmark-outline", color: "#ef4444", route: "FamilyDashboard" },
                { label: "Urban Store & Gadgets", icon: "bag-handle-outline", color: "#8b5cf6", route: "Shop" },
                { label: "Points & Rewards", icon: "gift-outline", color: "#f59e0b", route: "Points" },
                { label: "App Settings", icon: "settings-outline", color: "#64748b", route: "Settings" },
                { label: "Help & Support", icon: "help-circle-outline", color: "#3b82f6", route: "Notifications" },
              ].map((item, idx) => (
                <Pressable
                  key={idx}
                  style={s.drawerItem}
                  onPress={() => {
                    setSideMenuVisible(false);
                    navigation.navigate(item.route as any);
                  }}
                >
                  <View style={[s.drawerIconCircle, { backgroundColor: item.color + "18" }]}>
                    <Ionicons name={item.icon as any} size={18} color={item.color} />
                  </View>
                  <Text style={[s.drawerItemText, { color: colors.text }]}>{item.label}</Text>
                  <Ionicons name="chevron-forward" size={16} color={colors.textMuted} style={{ marginLeft: "auto" }} />
                </Pressable>
              ))}
            </ScrollView>

            {/* Drawer Footer */}
            <View style={[s.drawerFooter, { borderTopColor: isDark ? "#1e293b" : "#f1f5f9" }]}>
              <Pressable
                style={s.drawerSignOutBtn}
                onPress={() => {
                  setSideMenuVisible(false);
                  navigation.navigate("Profile");
                }}
              >
                <Ionicons name="person-circle-outline" size={18} color="#00bcd4" />
                <Text style={s.drawerSignOutText}>My Profile</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ── Samsung Bottom Nav (Persistent) ──────────────────────── */}
      <SamsungBottomNav activeRoute="ServicesDashboard" />
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },

  // ── NEW MAIN HERO HEADER ─────────────────────────────────────────
  mainHeroHeader: {
    paddingTop: 48,
    paddingHorizontal: 16,
    paddingBottom: 28,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    marginBottom: 16,
    overflow: "hidden",
  },
  heroTopBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  heroTopBarLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  heroTopBarIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  heroSosBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#ef4444",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
  },
  heroSosBtnText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "800",
  },
  heroHamburgerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.18)",
    justifyContent: "center",
    alignItems: "center",
  },
  heroIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.18)",
    justifyContent: "center",
    alignItems: "center",
  },
  heroAvatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.5)",
    overflow: "hidden",
  },
  heroBrandTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: -0.3,
  },
  heroBrandSub: {
    fontSize: 11,
    color: "rgba(255,255,255,0.75)",
    marginTop: 1,
  },
  heroContentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  heroTextCol: {
    flex: 1,
    paddingRight: 10,
  },
  heroMainTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#ffffff",
    lineHeight: 33,
    marginBottom: 8,
  },
  heroMainSubtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.85)",
    lineHeight: 18,
    marginBottom: 16,
  },
  heroExploreBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    backgroundColor: "rgba(0,0,0,0.25)",
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  heroExploreBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#ffffff",
  },

  // ── Top Bar (Main View — kept for compatibility) ─────────────────
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 8,
  },
  topBarLeftRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  menuHamburgerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  brandCol: {
    justifyContent: "center",
  },
  brandTitleText: {
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  brandSubtitleText: {
    fontSize: 11,
    marginTop: 1,
  },
  topBarIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
  },
  notifDot: {
    position: "absolute",
    top: 6,
    right: 7,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#ef4444",
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    overflow: "hidden",
  },
  avatarInner: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitial: {
    fontSize: 15,
    fontWeight: "700",
    color: "#ffffff",
  },

  // ── Drawer Styles ─────────────────────────────────────────────
  drawerBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-start",
  },
  drawerCard: {
    width: "80%",
    maxWidth: 320,
    height: "100%",
    paddingTop: 50,
    paddingBottom: 20,
    elevation: 10,
  },
  drawerHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  drawerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: "hidden",
  },
  drawerUserName: {
    fontSize: 16,
    fontWeight: "800",
  },
  drawerUserEmail: {
    fontSize: 12,
    marginTop: 2,
  },
  drawerCloseBtn: {
    padding: 6,
  },
  drawerList: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  drawerItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginBottom: 4,
  },
  drawerIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  drawerItemText: {
    fontSize: 14,
    fontWeight: "600",
  },
  drawerFooter: {
    paddingHorizontal: 20,
    paddingTop: 14,
    borderTopWidth: 1,
  },
  drawerSignOutBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  drawerSignOutText: {
    color: "#00bcd4",
    fontSize: 14,
    fontWeight: "700",
  },


  // ── Search Bar ─────────────────────────────────────────────────
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    padding: 0,
  },
  micBtn: {
    padding: 4,
  },

  // ── Hero Banner ────────────────────────────────────────────────
  heroCardWrapper: {
    marginHorizontal: 16,
    marginBottom: 18,
  },
  heroCard: {
    borderRadius: 24,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    overflow: "hidden",
    minHeight: 160,
  },
  heroLeftCol: {
    flex: 1,
    zIndex: 2,
  },
  heroPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
    backgroundColor: "#134e4a",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 10,
  },
  heroPillText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#ffffff",
  },
  heroHeading: {
    fontSize: 18,
    fontWeight: "800",
    lineHeight: 23,
    marginBottom: 6,
  },
  heroTagline: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 14,
  },
  heroBookBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    backgroundColor: "#134e4a",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  heroBookText: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#ffffff",
  },

  // Hero 3D Sofa Mockup
  heroIllustrationWrap: {
    width: 100,
    height: 100,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  sofaBack: {
    width: 80,
    height: 48,
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#e2e8f0",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
  },
  sofaCushionLeft: {
    width: 28,
    height: 32,
    backgroundColor: "#0d9488",
    borderRadius: 8,
  },
  sofaCushionRight: {
    width: 28,
    height: 32,
    backgroundColor: "#14b8a6",
    borderRadius: 8,
  },
  sofaPillow: {
    position: "absolute",
    bottom: 2,
    right: 14,
    width: 18,
    height: 18,
    borderRadius: 4,
    backgroundColor: "#fbbf24",
    transform: [{ rotate: "15deg" }],
  },
  sofaBase: {
    width: 84,
    height: 12,
    backgroundColor: "#cbd5e1",
    borderRadius: 4,
    marginTop: -2,
  },
  plantLeaf1: {
    position: "absolute",
    top: 8,
    right: 4,
    width: 24,
    height: 38,
    borderRadius: 16,
    backgroundColor: "#10b981",
    transform: [{ rotate: "30deg" }],
  },
  plantLeaf2: {
    position: "absolute",
    top: 4,
    right: 22,
    width: 18,
    height: 32,
    borderRadius: 14,
    backgroundColor: "#059669",
    transform: [{ rotate: "-20deg" }],
  },

  // ── Quick Actions ──────────────────────────────────────────────
  quickActionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  quickActionCard: {
    flex: 1,
    alignItems: "center",
  },
  quickActionCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  quickActionTitle: {
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
  },
  quickActionSub: {
    fontSize: 10,
    marginTop: 1,
    textAlign: "center",
  },
  emergencyText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#ef4444",
  },

  // ── Section Header ─────────────────────────────────────────────
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
  },
  seeAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#059669",
  },

  // ── 2x2 Services Grid ──────────────────────────────────────────
  servicesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 20,
  },
  serviceCard: {
    width: CARD_W,
    borderRadius: 22,
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  cardWaveHeader: {
    height: 100,
    position: "relative",
    overflow: "hidden",
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  cleaningDecoCircle: {
    position: "absolute",
    top: -10,
    right: -10,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  cardSprayBottle: {
    position: "absolute",
    bottom: 6,
    right: 14,
    width: 24,
    height: 38,
    borderRadius: 6,
    backgroundColor: "#fef08a",
  },
  sprayNozzle: {
    position: "absolute",
    top: -6,
    left: -4,
    width: 14,
    height: 8,
    backgroundColor: "#3b82f6",
    borderRadius: 2,
  },
  sprayHandle: {
    position: "absolute",
    top: 4,
    right: -5,
    width: 8,
    height: 14,
    borderWidth: 2,
    borderColor: "#3b82f6",
    borderRadius: 3,
  },
  waterDecoCircle: {
    position: "absolute",
    top: -10,
    right: -10,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  waterGlass: {
    position: "absolute",
    bottom: 8,
    right: 16,
    width: 22,
    height: 32,
    backgroundColor: "#e0f2fe",
    borderWidth: 2,
    borderColor: "#ffffff",
    borderRadius: 4,
  },
  pestDecoCircle: {
    position: "absolute",
    top: -10,
    right: -10,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  pestBackpack: {
    position: "absolute",
    bottom: 6,
    right: 14,
    width: 24,
    height: 34,
    borderRadius: 6,
    backgroundColor: "#fed7aa",
  },
  petDecoCircle: {
    position: "absolute",
    top: -10,
    right: -10,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  petEars: {
    position: "absolute",
    bottom: 6,
    right: 14,
    width: 26,
    height: 28,
    borderRadius: 12,
    backgroundColor: "#fde047",
  },
  cardBadgeIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  cardBody: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 14,
  },
  cardServiceName: {
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 4,
  },
  cardServiceTagline: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 12,
  },
  cardPillBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },
  cardPillBtnText: {
    fontSize: 11.5,
    fontWeight: "700",
  },

  // ── Purple Premium Banner ──────────────────────────────────────
  premiumBanner: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    gap: 12,
  },
  crownIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  premiumTextWrap: {
    flex: 1,
  },
  premiumTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#ffffff",
  },
  premiumSub: {
    fontSize: 11.5,
    color: "rgba(255,255,255,0.8)",
    marginTop: 2,
  },
  viewPlansBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0,0,0,0.25)",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
  },
  viewPlansText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#ffffff",
  },

  // ── Trust Badges Row ───────────────────────────────────────────
  trustBadgesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    marginBottom: 10,
  },
  trustItem: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 2,
  },
  trustTitle: {
    fontSize: 11,
    fontWeight: "700",
    marginTop: 4,
    textAlign: "center",
  },
  trustSub: {
    fontSize: 9.5,
    marginTop: 1,
    textAlign: "center",
  },

  // ═════════════════════════════════════════════════════════════════
  // EXPLORE VIEW STYLES
  // ═════════════════════════════════════════════════════════════════
  exploreWaveHeader: {
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 28,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    marginBottom: 16,
  },
  exploreBackBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.18)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  exploreHeaderContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  exploreHeaderText: {
    flex: 1,
    paddingRight: 10,
  },
  exploreTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#ffffff",
    lineHeight: 30,
    marginBottom: 6,
  },
  exploreSubtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.85)",
    lineHeight: 18,
  },

  // 3D House Graphic
  houseIllustration: {
    width: 80,
    height: 80,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  houseRoof: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderLeftWidth: 32,
    borderRightWidth: 32,
    borderBottomWidth: 26,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "#1e3a8a",
  },
  houseWalls: {
    width: 52,
    height: 38,
    backgroundColor: "#ffffff",
    borderWidth: 2,
    borderColor: "#cbd5e1",
    borderRadius: 4,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    paddingBottom: 2,
  },
  houseDoor: {
    width: 12,
    height: 20,
    backgroundColor: "#3b82f6",
    borderRadius: 2,
  },
  houseWindow: {
    width: 12,
    height: 12,
    backgroundColor: "#67e8f9",
    borderRadius: 2,
    marginBottom: 8,
  },
  houseChimney: {
    position: "absolute",
    top: 14,
    right: 18,
    width: 8,
    height: 14,
    backgroundColor: "#dc2626",
    borderRadius: 2,
  },
  houseLawn: {
    width: 74,
    height: 8,
    backgroundColor: "#4ade80",
    borderRadius: 4,
    marginTop: -2,
  },

  // Explore Top Row
  exploreTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  exploreTopTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#ffffff",
  },

  // Sticky Header Wrap (Search + Submenu)
  stickyHeaderWrap: {
    paddingTop: 8,
    paddingBottom: 6,
    zIndex: 100,
  },
  submenuRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 8,
  },
  submenuPill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 14,
    borderWidth: 1,
  },
  submenuIconWrap: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
  },
  submenuPillText: {
    fontSize: 11.5,
    fontWeight: "700",
  },

  // Explore Search Row
  exploreSearchRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 14,
  },
  exploreSearchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
  },
  exploreSearchInput: {
    flex: 1,
    fontSize: 14,
    padding: 0,
  },
  exploreFilterBtn: {
    width: 44,
    height: 44,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  // Category Filter Chips
  exploreChipsRow: {
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 20,
  },
  exploreChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  exploreChipActive: {
    backgroundColor: "#064e3b",
    borderColor: "#064e3b",
  },
  exploreChipText: {
    fontSize: 13,
    fontWeight: "600",
  },

  // 10-Card Category Grid with full-width aligned image covers
  exploreCatGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 20,
  },
  exploreCatCard: {
    width: (W - 32 - 10) / 2,
    borderRadius: 18,
    padding: 10,
    alignItems: "center",
    borderWidth: 1,
    marginBottom: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  exploreCatIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  exploreCatImageWrap: {
    width: "100%",
    height: 98,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 8,
    backgroundColor: "rgba(0,0,0,0.03)",
  },
  exploreCatImage: {
    width: "100%",
    height: "100%",
  },
  exploreCatTitle: {
    fontSize: 13.5,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 2,
  },
  exploreCatSub: {
    fontSize: 11,
    textAlign: "center",
  },
  seeAllBelowBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  seeAllBelowText: {
    fontSize: 13.5,
    fontWeight: "700",
  },

  // More Services List
  moreServicesList: {
    marginHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 22,
  },
  moreServiceRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    gap: 12,
  },
  moreServiceIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  moreServiceTextWrap: {
    flex: 1,
  },
  moreServiceName: {
    fontSize: 14.5,
    fontWeight: "700",
  },
  moreServiceDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  moreServiceImageWrap: {
    width: 46,
    height: 46,
    borderRadius: 12,
    overflow: "hidden",
    flexShrink: 0,
  },
  moreServiceImage: {
    width: "100%",
    height: "100%",
  },

  // Offers Promo Card
  offersPromoCard: {
    marginHorizontal: 16,
    borderRadius: 24,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    overflow: "hidden",
  },
  offersPromoLeft: {
    flex: 1,
    paddingRight: 10,
  },
  offersPromoTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#ffffff",
    lineHeight: 22,
    marginBottom: 4,
  },
  offersPromoSub: {
    fontSize: 12,
    color: "rgba(255,255,255,0.85)",
    marginBottom: 12,
  },
  offersPromoBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
    backgroundColor: "#ffffff",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 14,
  },
  offersPromoBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1e3a8a",
  },

  // 3D Gift Box
  giftBoxWrap: {
    width: 60,
    height: 60,
    backgroundColor: "#9333ea",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#c084fc",
    justifyContent: "center",
    alignItems: "center",
  },
  giftBoxRibbonH: {
    position: "absolute",
    width: "100%",
    height: 10,
    backgroundColor: "#fbbf24",
  },
  giftBoxRibbonV: {
    position: "absolute",
    height: "100%",
    width: 10,
    backgroundColor: "#fbbf24",
  },
  giftBoxBow: {
    width: 18,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#fde047",
    marginTop: -8,
  },
  giftSparkle1: {
    position: "absolute",
    top: -6,
    right: -4,
  },
  giftSparkle2: {
    position: "absolute",
    bottom: -4,
    left: -4,
  },

  // Location Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalCard: {
    width: "100%",
    maxWidth: 340,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 16,
  },
  cityOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  cityOptionActive: {
    backgroundColor: "rgba(37, 99, 235, 0.1)",
  },
  cityOptionText: {
    fontSize: 15,
  },
});
