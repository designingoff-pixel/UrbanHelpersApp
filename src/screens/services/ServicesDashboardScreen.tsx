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

  const headerOp = useSharedValue(0);
  const headerY = useSharedValue(-20);

  useEffect(() => {
    headerOp.value = withTiming(1, { duration: 420, easing: Easing.out(Easing.cubic) });
    headerY.value = withSpring(0, { damping: 18, stiffness: 200 });
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
          VIEW 1: MAIN HOME SERVICES (Matching Left Screenshot)
          ═════════════════════════════════════════════════════════════════════════ */}
      {activeView === "main" ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.scrollContent}
        >
          {/* ── 1. Top Location & Action Bar ──────────────────────────── */}
          <Animated.View style={[s.topBar, headerStyle]}>
            <Pressable style={s.locationPicker} onPress={() => setLocationModal(true)}>
              <View style={s.locationPinCircle}>
                <Ionicons name="location" size={16} color="#2563eb" />
              </View>
              <View>
                <View style={s.locationTitleRow}>
                  <Text style={[s.locationCity, { color: colors.text }]}>{locationName}</Text>
                  <Ionicons name="chevron-down" size={14} color={colors.textSecondary} />
                </View>
                <Text style={[s.locationSub, { color: colors.textMuted }]}>
                  Home Services • Health • More
                </Text>
              </View>
            </Pressable>

            <View style={s.topBarIcons}>
              {/* Notification bell */}
              <Pressable
                style={[s.iconBtn, { backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "#f1f5f9" }]}
                onPress={() => navigation.navigate("Notifications")}
              >
                <Ionicons name="notifications-outline" size={20} color={colors.text} />
                <View style={s.notifDot} />
              </Pressable>

              {/* Avatar circle */}
              <Pressable
                style={[s.avatarCircle, { borderColor: colors.primary }]}
                onPress={() => navigation.navigate("Profile")}
              >
                <LinearGradient colors={["#00c6aa", "#0f9b8e"]} style={s.avatarInner}>
                  <Text style={s.avatarInitial}>{firstName.charAt(0).toUpperCase()}</Text>
                </LinearGradient>
              </Pressable>
            </View>
          </Animated.View>

          {/* ── 2. Greeting Header ───────────────────────────────────── */}
          <View style={s.greetingSection}>
            <Text style={[s.greetingText, { color: colors.text }]}>Good Morning 👋</Text>
            <Text style={[s.greetingSubText, { color: colors.textSecondary }]}>
              Make your home, life and health easier today.
            </Text>
          </View>

          {/* ── 3. Search Bar with Mic ───────────────────────────────── */}
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
              placeholder="Search services, e.g. cleaning, RO, doctor..."
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

          {/* ── 4. Hero Banner ("A Cleaner Home, A Healthier You") ───── */}
          <View style={s.heroCardWrapper}>
            <LinearGradient
              colors={isDark ? ["#064e3b", "#065f46", "#047857"] : ["#ebfbee", "#d3f9d8", "#c3fae8"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={s.heroCard}
            >
              {/* Left Content */}
              <View style={s.heroLeftCol}>
                <View style={s.heroPill}>
                  <Ionicons name="sparkles" size={12} color="#f59e0b" />
                  <Text style={s.heroPillText}>Premium Care</Text>
                </View>

                <Text style={[s.heroHeading, { color: isDark ? "#ffffff" : "#134e4a" }]}>
                  A Cleaner Home,{"\n"}A Healthier You
                </Text>

                <Text style={[s.heroTagline, { color: isDark ? "rgba(255,255,255,0.85)" : "#2d3748" }]}>
                  Trusted professionals.{"\n"}Quality service. Guaranteed.
                </Text>

                <Pressable
                  style={s.heroBookBtn}
                  onPress={() => setActiveView("explore")}
                >
                  <Text style={s.heroBookText}>Book Now</Text>
                  <Ionicons name="arrow-forward" size={14} color="#ffffff" />
                </Pressable>
              </View>

              {/* Right Illustration: Cozy Sofa & Houseplant 3D graphic */}
              <View style={s.heroIllustrationWrap}>
                <View style={s.plantLeaf1} />
                <View style={s.plantLeaf2} />
                <View style={s.sofaBack}>
                  <View style={s.sofaCushionLeft} />
                  <View style={s.sofaCushionRight} />
                  <View style={s.sofaPillow} />
                </View>
                <View style={s.sofaBase} />
              </View>
            </LinearGradient>
          </View>

          {/* ── 5. Quick Actions Row (4 Circular Icon Cards) ─────────── */}
          <View style={s.quickActionsRow}>
            {/* My Bookings */}
            <Pressable
              style={s.quickActionCard}
              onPress={() => navigation.navigate("MyBookings")}
            >
              <View style={[s.quickActionCircle, { backgroundColor: "#e8f5e9" }]}>
                <Ionicons name="calendar" size={22} color="#10b981" />
              </View>
              <Text style={[s.quickActionTitle, { color: colors.text }]}>My Bookings</Text>
              <Text style={[s.quickActionSub, { color: colors.textMuted }]}>View & manage</Text>
            </Pressable>

            {/* Track */}
            <Pressable
              style={s.quickActionCard}
              onPress={() => navigation.navigate("LiveTracking")}
            >
              <View style={[s.quickActionCircle, { backgroundColor: "#f3e8ff" }]}>
                <Ionicons name="location" size={22} color="#8b5cf6" />
              </View>
              <Text style={[s.quickActionTitle, { color: colors.text }]}>Track</Text>
              <Text style={[s.quickActionSub, { color: colors.textMuted }]}>Live tracking</Text>
            </Pressable>

            {/* Offers */}
            <Pressable
              style={s.quickActionCard}
              onPress={() => navigation.navigate("Offers")}
            >
              <View style={[s.quickActionCircle, { backgroundColor: "#fef3c7" }]}>
                <Ionicons name="gift" size={22} color="#f59e0b" />
              </View>
              <Text style={[s.quickActionTitle, { color: colors.text }]}>Offers</Text>
              <Text style={[s.quickActionSub, { color: colors.textMuted }]}>Save more</Text>
            </Pressable>

            {/* Emergency */}
            <Pressable
              style={s.quickActionCard}
              onPress={() => navigation.navigate("EmergencyAssistance")}
            >
              <View style={[s.quickActionCircle, { backgroundColor: "#fee2e2" }]}>
                <Text style={s.emergencyText}>SOS</Text>
              </View>
              <Text style={[s.quickActionTitle, { color: colors.text }]}>Emergency</Text>
              <Text style={[s.quickActionSub, { color: colors.textMuted }]}>Get help</Text>
            </Pressable>
          </View>

          {/* ── 6. Popular Services Section Header ───────────────────── */}
          <View style={s.sectionHeader}>
            <Text style={[s.sectionTitle, { color: colors.text }]}>Popular Services</Text>
            <Pressable
              style={s.seeAllBtn}
              onPress={() => setActiveView("explore")}
            >
              <Text style={s.seeAllText}>See All</Text>
              <Ionicons name="arrow-forward" size={14} color="#059669" />
            </Pressable>
          </View>

          {/* ── 7. 2×2 Grid of Curved Illustrated Cards ──────────────── */}
          <View style={s.servicesGrid}>
            {/* 1. Home Cleaning */}
            <Pressable
              style={[s.serviceCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
              onPress={() => navigation.navigate("ServiceCategory", { categoryId: "cleaning" })}
            >
              <View style={s.cardWaveHeader}>
                <Image
                  source={SERVICE_LOCAL_IMAGES.cleaning}
                  style={s.cardImage}
                  resizeMode="cover"
                />
                <LinearGradient
                  colors={["transparent", "rgba(5,150,105,0.7)"]}
                  style={StyleSheet.absoluteFillObject}
                />
              </View>

              <View style={s.cardBody}>
                <View style={s.cardBadgeIcon}>
                  <Ionicons name="sparkles" size={17} color="#059669" />
                </View>
                <Text style={[s.cardServiceName, { color: colors.text }]}>Home Cleaning</Text>
                <Text style={[s.cardServiceTagline, { color: colors.textMuted }]}>
                  Spotless home,{"\n"}happy life
                </Text>
                <View style={[s.cardPillBtn, { backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "#f0fdf4" }]}>
                  <Text style={[s.cardPillBtnText, { color: "#059669" }]}>6 services</Text>
                  <Ionicons name="arrow-forward" size={12} color="#059669" />
                </View>
              </View>
            </Pressable>

            {/* 2. RO Service */}
            <Pressable
              style={[s.serviceCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
              onPress={() => navigation.navigate("ServiceCategory", { categoryId: "ro" })}
            >
              <View style={s.cardWaveHeader}>
                <Image
                  source={SERVICE_LOCAL_IMAGES.ro}
                  style={s.cardImage}
                  resizeMode="cover"
                />
                <LinearGradient
                  colors={["transparent", "rgba(2,132,199,0.7)"]}
                  style={StyleSheet.absoluteFillObject}
                />
              </View>

              <View style={s.cardBody}>
                <View style={s.cardBadgeIcon}>
                  <Ionicons name="water" size={17} color="#0284c7" />
                </View>
                <Text style={[s.cardServiceName, { color: colors.text }]}>RO Service</Text>
                <Text style={[s.cardServiceTagline, { color: colors.textMuted }]}>
                  Pure water,{"\n"}every drop
                </Text>
                <View style={[s.cardPillBtn, { backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "#f0f9ff" }]}>
                  <Text style={[s.cardPillBtnText, { color: "#0284c7" }]}>5 services</Text>
                  <Ionicons name="arrow-forward" size={12} color="#0284c7" />
                </View>
              </View>
            </Pressable>

            {/* 3. Pest Control */}
            <Pressable
              style={[s.serviceCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
              onPress={() => navigation.navigate("ServiceCategory", { categoryId: "pest" })}
            >
              <View style={s.cardWaveHeader}>
                <Image
                  source={SERVICE_LOCAL_IMAGES.pest}
                  style={s.cardImage}
                  resizeMode="cover"
                />
                <LinearGradient
                  colors={["transparent", "rgba(217,119,6,0.7)"]}
                  style={StyleSheet.absoluteFillObject}
                />
              </View>

              <View style={s.cardBody}>
                <View style={s.cardBadgeIcon}>
                  <Ionicons name="shield-checkmark" size={17} color="#d97706" />
                </View>
                <Text style={[s.cardServiceName, { color: colors.text }]}>Pest Control</Text>
                <Text style={[s.cardServiceTagline, { color: colors.textMuted }]}>
                  Your home,{"\n"}pest-free
                </Text>
                <View style={[s.cardPillBtn, { backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "#fffbeb" }]}>
                  <Text style={[s.cardPillBtnText, { color: "#d97706" }]}>5 services</Text>
                  <Ionicons name="arrow-forward" size={12} color="#d97706" />
                </View>
              </View>
            </Pressable>

            {/* 4. Pet Care */}
            <Pressable
              style={[s.serviceCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
              onPress={() => navigation.navigate("ServiceCategory", { categoryId: "pet" })}
            >
              <View style={s.cardWaveHeader}>
                <Image
                  source={SERVICE_LOCAL_IMAGES.pet}
                  style={s.cardImage}
                  resizeMode="cover"
                />
                <LinearGradient
                  colors={["transparent", "rgba(225,29,72,0.7)"]}
                  style={StyleSheet.absoluteFillObject}
                />
              </View>

              <View style={s.cardBody}>
                <View style={s.cardBadgeIcon}>
                  <Ionicons name="paw" size={17} color="#e11d48" />
                </View>
                <Text style={[s.cardServiceName, { color: colors.text }]}>Pet Care</Text>
                <Text style={[s.cardServiceTagline, { color: colors.textMuted }]}>
                  Love them{"\n"}the right way
                </Text>
                <View style={[s.cardPillBtn, { backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "#fff1f2" }]}>
                  <Text style={[s.cardPillBtnText, { color: "#e11d48" }]}>4 services</Text>
                  <Ionicons name="arrow-forward" size={12} color="#e11d48" />
                </View>
              </View>
            </Pressable>
          </View>

          {/* ── 8. Purple "Get Premium Benefits" Banner ─────────────── */}
          <LinearGradient
            colors={["#4338ca", "#5850ec", "#7c3aed"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={s.premiumBanner}
          >
            <View style={s.crownIconBadge}>
              <Ionicons name="ribbon" size={20} color="#fbbf24" />
            </View>
            <View style={s.premiumTextWrap}>
              <Text style={s.premiumTitle}>Get Premium Benefits</Text>
              <Text style={s.premiumSub}>Exclusive deals • Priority booking • More</Text>
            </View>
            <Pressable
              style={s.viewPlansBtn}
              onPress={() => Alert.alert("Premium Membership", "Priority technician dispatch & 20% discount on all home care!")}
            >
              <Text style={s.viewPlansText}>View Plans</Text>
              <Ionicons name="arrow-forward" size={12} color="#ffffff" />
            </Pressable>
          </LinearGradient>

          {/* ── 9. Trust Badges Row (4 Items) ────────────────────────── */}
          <View style={[s.trustBadgesRow, { borderColor: colors.cardBorder }]}>
            <View style={s.trustItem}>
              <Ionicons name="shield-checkmark-outline" size={20} color="#2563eb" />
              <Text style={[s.trustTitle, { color: colors.text }]}>Verified Pros</Text>
              <Text style={[s.trustSub, { color: colors.textMuted }]}>Background checked</Text>
            </View>
            <View style={s.trustItem}>
              <Ionicons name="flash-outline" size={20} color="#0284c7" />
              <Text style={[s.trustTitle, { color: colors.text }]}>Same-Day Fix</Text>
              <Text style={[s.trustSub, { color: colors.textMuted }]}>Fast & reliable</Text>
            </View>
            <View style={s.trustItem}>
              <Ionicons name="ribbon-outline" size={20} color="#059669" />
              <Text style={[s.trustTitle, { color: colors.text }]}>100% Guarantee</Text>
              <Text style={[s.trustSub, { color: colors.textMuted }]}>Your satisfaction</Text>
            </View>
            <View style={s.trustItem}>
              <Ionicons name="calendar-outline" size={20} color="#7c3aed" />
              <Text style={[s.trustTitle, { color: colors.text }]}>30-Day Warranty</Text>
              <Text style={[s.trustSub, { color: colors.textMuted }]}>Service assurance</Text>
            </View>
          </View>

          <View style={{ height: 110 }} />
        </ScrollView>
      ) : (
        /* ═════════════════════════════════════════════════════════════════════════
           VIEW 2: EXPLORE OUR SERVICES (Matching Right Screenshot)
           ═════════════════════════════════════════════════════════════════════════ */
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.scrollContent}
        >
          {/* ── 1. Curved Emerald Wave Header with 3D House ──────────── */}
          <LinearGradient
            colors={["#064e3b", "#065f46", "#047857"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={s.exploreWaveHeader}
          >
            {/* Back button */}
            <Pressable
              style={s.exploreBackBtn}
              onPress={() => setActiveView("main")}
            >
              <Ionicons name="arrow-back" size={22} color="#ffffff" />
            </Pressable>

            <View style={s.exploreHeaderContent}>
              <View style={s.exploreHeaderText}>
                <Text style={s.exploreTitle}>Explore Our{"\n"}Services</Text>
                <Text style={s.exploreSubtitle}>
                  Find the right service for your home, health and lifestyle.
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

          {/* ── 2. Search & Filter Bar ───────────────────────────────── */}
          <View style={s.exploreSearchRow}>
            <View
              style={[
                s.exploreSearchBox,
                {
                  backgroundColor: isDark ? "#161f2e" : "#ffffff",
                  borderColor: colors.cardBorder,
                },
              ]}
            >
              <Ionicons name="search-outline" size={19} color={colors.textMuted} />
              <TextInput
                style={[s.exploreSearchInput, { color: colors.text }]}
                placeholder="Search for services..."
                placeholderTextColor={colors.textMuted}
                value={searchText}
                onChangeText={setSearchText}
              />
            </View>
            <Pressable
              style={[
                s.exploreFilterBtn,
                {
                  backgroundColor: isDark ? "#161f2e" : "#ffffff",
                  borderColor: colors.cardBorder,
                },
              ]}
              onPress={() => Alert.alert("Filter Services", "Sort by: Price, Popularity, Ratings")}
            >
              <Ionicons name="options-outline" size={20} color={colors.text} />
            </Pressable>
          </View>

          {/* ── 3. Category Filter Chips ─────────────────────────────── */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.exploreChipsRow}
          >
            {EXPLORE_CHIPS.map((ch) => {
              const isActive = exploreFilter === ch.id;
              return (
                <Pressable
                  key={ch.id}
                  onPress={() => setExploreFilter(ch.id)}
                  style={[
                    s.exploreChip,
                    isActive
                      ? s.exploreChipActive
                      : {
                          backgroundColor: isDark ? "#161f2e" : "#ffffff",
                          borderColor: colors.cardBorder,
                        },
                  ]}
                >
                  <Ionicons
                    name={ch.icon}
                    size={15}
                    color={isActive ? "#ffffff" : colors.textSecondary}
                  />
                  <Text
                    style={[
                      s.exploreChipText,
                      { color: isActive ? "#ffffff" : colors.textSecondary },
                    ]}
                  >
                    {ch.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* ── 4. Service Categories 6-Card Grid ────────────────────── */}
          <View style={s.sectionHeader}>
            <Text style={[s.sectionTitle, { color: colors.text }]}>Service Categories</Text>
            <Pressable
              style={s.seeAllBtn}
              onPress={() => Alert.alert("All Categories", "Browse all 10 curated home care categories.")}
            >
              <Text style={s.seeAllText}>See All</Text>
              <Ionicons name="arrow-forward" size={14} color="#059669" />
            </Pressable>
          </View>

          <View style={s.exploreCatGrid}>
            {/* 1. Home Cleaning */}
            <Pressable
              style={[s.exploreCatCard, { backgroundColor: isDark ? "#161f2e" : "#ebfbee" }]}
              onPress={() => navigation.navigate("ServiceCategory", { categoryId: "cleaning" })}
            >
              <View style={s.exploreCatImageWrap}>
                <Image
                  source={SERVICE_LOCAL_IMAGES.cleaning}
                  style={s.exploreCatImage}
                  resizeMode="cover"
                />
              </View>
              <Text style={[s.exploreCatTitle, { color: colors.text }]}>Home Cleaning</Text>
              <Text style={[s.exploreCatSub, { color: colors.textMuted }]}>11 services</Text>
            </Pressable>

            {/* 2. RO Service */}
            <Pressable
              style={[s.exploreCatCard, { backgroundColor: isDark ? "#161f2e" : "#e0f2fe" }]}
              onPress={() => navigation.navigate("ServiceCategory", { categoryId: "ro" })}
            >
              <View style={s.exploreCatImageWrap}>
                <Image
                  source={SERVICE_LOCAL_IMAGES.ro}
                  style={s.exploreCatImage}
                  resizeMode="cover"
                />
              </View>
              <Text style={[s.exploreCatTitle, { color: colors.text }]}>RO Service</Text>
              <Text style={[s.exploreCatSub, { color: colors.textMuted }]}>7 services</Text>
            </Pressable>

            {/* 3. Pest Control */}
            <Pressable
              style={[s.exploreCatCard, { backgroundColor: isDark ? "#161f2e" : "#fef3c7" }]}
              onPress={() => navigation.navigate("ServiceCategory", { categoryId: "pest" })}
            >
              <View style={s.exploreCatImageWrap}>
                <Image
                  source={SERVICE_LOCAL_IMAGES.pest}
                  style={s.exploreCatImage}
                  resizeMode="cover"
                />
              </View>
              <Text style={[s.exploreCatTitle, { color: colors.text }]}>Pest Control</Text>
              <Text style={[s.exploreCatSub, { color: colors.textMuted }]}>6 services</Text>
            </Pressable>

            {/* 4. Pet Care */}
            <Pressable
              style={[s.exploreCatCard, { backgroundColor: isDark ? "#161f2e" : "#ffe4e6" }]}
              onPress={() => navigation.navigate("ServiceCategory", { categoryId: "pet" })}
            >
              <View style={s.exploreCatImageWrap}>
                <Image
                  source={SERVICE_LOCAL_IMAGES.pet}
                  style={s.exploreCatImage}
                  resizeMode="cover"
                />
              </View>
              <Text style={[s.exploreCatTitle, { color: colors.text }]}>Pet Care</Text>
              <Text style={[s.exploreCatSub, { color: colors.textMuted }]}>7 services</Text>
            </Pressable>

            {/* 5. Horticulture */}
            <Pressable
              style={[s.exploreCatCard, { backgroundColor: isDark ? "#161f2e" : "#ecfdf5" }]}
              onPress={() => navigation.navigate("ServiceCategory", { categoryId: "hort" })}
            >
              <View style={s.exploreCatImageWrap}>
                <Image
                  source={SERVICE_LOCAL_IMAGES.horticulture}
                  style={s.exploreCatImage}
                  resizeMode="cover"
                />
              </View>
              <Text style={[s.exploreCatTitle, { color: colors.text }]}>Horticulture</Text>
              <Text style={[s.exploreCatSub, { color: colors.textMuted }]}>7 services</Text>
            </Pressable>

            {/* 6. Appliance Cleaning */}
            <Pressable
              style={[s.exploreCatCard, { backgroundColor: isDark ? "#161f2e" : "#fff7ed" }]}
              onPress={() => navigation.navigate("ServiceCategory", { categoryId: "appliance" })}
            >
              <View style={s.exploreCatImageWrap}>
                <Image
                  source={SERVICE_LOCAL_IMAGES.appliances}
                  style={s.exploreCatImage}
                  resizeMode="cover"
                />
              </View>
              <Text style={[s.exploreCatTitle, { color: colors.text }]}>Appliances</Text>
              <Text style={[s.exploreCatSub, { color: colors.textMuted }]}>11 services</Text>
            </Pressable>

            {/* 7. Home Care */}
            <Pressable
              style={[s.exploreCatCard, { backgroundColor: isDark ? "#161f2e" : "#f0fdfa" }]}
              onPress={() => navigation.navigate("ServiceCategory", { categoryId: "homecare" })}
            >
              <View style={s.exploreCatImageWrap}>
                <Image
                  source={SERVICE_LOCAL_IMAGES.homecare}
                  style={s.exploreCatImage}
                  resizeMode="cover"
                />
              </View>
              <Text style={[s.exploreCatTitle, { color: colors.text }]}>Home Care</Text>
              <Text style={[s.exploreCatSub, { color: colors.textMuted }]}>4 services</Text>
            </Pressable>

            {/* 8. Emergency Assistance */}
            <Pressable
              style={[s.exploreCatCard, { backgroundColor: isDark ? "#161f2e" : "#fef2f2" }]}
              onPress={() => navigation.navigate("EmergencyAssistance")}
            >
              <View style={s.exploreCatImageWrap}>
                <Image
                  source={SERVICE_LOCAL_IMAGES.emergency}
                  style={s.exploreCatImage}
                  resizeMode="cover"
                />
              </View>
              <Text style={[s.exploreCatTitle, { color: colors.text }]}>Emergency</Text>
              <Text style={[s.exploreCatSub, { color: colors.textMuted }]}>5 services</Text>
            </Pressable>

            {/* 9. Insurance Services */}
            <Pressable
              style={[s.exploreCatCard, { backgroundColor: isDark ? "#161f2e" : "#eff6ff" }]}
              onPress={() => navigation.navigate("ServiceCategory", { categoryId: "insurance" })}
            >
              <View style={s.exploreCatImageWrap}>
                <Image
                  source={SERVICE_LOCAL_IMAGES.insurance}
                  style={s.exploreCatImage}
                  resizeMode="cover"
                />
              </View>
              <Text style={[s.exploreCatTitle, { color: colors.text }]}>Insurance</Text>
              <Text style={[s.exploreCatSub, { color: colors.textMuted }]}>4 services</Text>
            </Pressable>

            {/* 10. Delivery Services */}
            <Pressable
              style={[s.exploreCatCard, { backgroundColor: isDark ? "#161f2e" : "#f5f3ff" }]}
              onPress={() => navigation.navigate("ServiceCategory", { categoryId: "delivery" })}
            >
              <View style={[s.exploreCatImageWrap, { justifyContent: "center", alignItems: "center", backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "#ede9fe" }]}>
                <Ionicons name="bicycle" size={38} color="#7c3aed" />
              </View>
              <Text style={[s.exploreCatTitle, { color: colors.text }]}>Delivery</Text>
              <Text style={[s.exploreCatSub, { color: colors.textMuted }]}>6 services</Text>
            </Pressable>
          </View>

          {/* ── 5. More Services (Vertical List) ─────────────────────── */}
          <View style={s.sectionHeader}>
            <Text style={[s.sectionTitle, { color: colors.text }]}>More Services</Text>
          </View>

          <View style={[s.moreServicesList, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            {/* Electrical */}
            <Pressable
              style={[s.moreServiceRow, { borderBottomColor: colors.divider }]}
              onPress={() => navigation.navigate("ServiceCategory", { categoryId: "electrical" })}
            >
              <View style={[s.moreServiceIcon, { backgroundColor: "#fef3c7" }]}>
                <Ionicons name="flash" size={18} color="#f59e0b" />
              </View>
              <View style={s.moreServiceTextWrap}>
                <Text style={[s.moreServiceName, { color: colors.text }]}>Electrical</Text>
                <Text style={[s.moreServiceDesc, { color: colors.textMuted }]}>Repairs, fittings, installations</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </Pressable>

            {/* Plumbing */}
            <Pressable
              style={[s.moreServiceRow, { borderBottomColor: colors.divider }]}
              onPress={() => navigation.navigate("ServiceCategory", { categoryId: "plumbing" })}
            >
              <View style={[s.moreServiceIcon, { backgroundColor: "#e0f2fe" }]}>
                <Ionicons name="water" size={18} color="#0284c7" />
              </View>
              <View style={s.moreServiceTextWrap}>
                <Text style={[s.moreServiceName, { color: colors.text }]}>Plumbing</Text>
                <Text style={[s.moreServiceDesc, { color: colors.textMuted }]}>Leak repair, fittings, maintenance</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </Pressable>

            {/* Appliance Repair */}
            <Pressable
              style={[s.moreServiceRow, { borderBottomColor: colors.divider }]}
              onPress={() => navigation.navigate("ServiceCategory", { categoryId: "appliances" })}
            >
              <View style={s.moreServiceImageWrap}>
                <Image
                  source={SERVICE_LOCAL_IMAGES.appliances}
                  style={s.moreServiceImage}
                  resizeMode="cover"
                />
              </View>
              <View style={s.moreServiceTextWrap}>
                <Text style={[s.moreServiceName, { color: colors.text }]}>Appliance Cleaning</Text>
                <Text style={[s.moreServiceDesc, { color: colors.textMuted }]}>AC, fridge, washing machine & more</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </Pressable>

            {/* Carpentry */}
            <Pressable
              style={[s.moreServiceRow, { borderBottomColor: colors.divider }]}
              onPress={() => navigation.navigate("ServiceCategory", { categoryId: "carpentry" })}
            >
              <View style={[s.moreServiceIcon, { backgroundColor: "#dcfce7" }]}>
                <Ionicons name="hammer" size={18} color="#16a34a" />
              </View>
              <View style={s.moreServiceTextWrap}>
                <Text style={[s.moreServiceName, { color: colors.text }]}>Carpentry</Text>
                <Text style={[s.moreServiceDesc, { color: colors.textMuted }]}>Furniture, woodwork, repairs</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </Pressable>

            {/* Home Care */}
            <Pressable
              style={[s.moreServiceRow, { borderBottomColor: colors.divider }]}
              onPress={() => navigation.navigate("ServiceCategory", { categoryId: "home" })}
            >
              <View style={s.moreServiceImageWrap}>
                <Image
                  source={SERVICE_LOCAL_IMAGES.homecare}
                  style={s.moreServiceImage}
                  resizeMode="cover"
                />
              </View>
              <View style={s.moreServiceTextWrap}>
                <Text style={[s.moreServiceName, { color: colors.text }]}>Home Care</Text>
                <Text style={[s.moreServiceDesc, { color: colors.textMuted }]}>Elder care, patient care, assistance</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </Pressable>

            {/* Horticulture */}
            <Pressable
              style={[s.moreServiceRow, { borderBottomColor: colors.divider }]}
              onPress={() => navigation.navigate("ServiceCategory", { categoryId: "hort" })}
            >
              <View style={s.moreServiceImageWrap}>
                <Image
                  source={SERVICE_LOCAL_IMAGES.horticulture}
                  style={s.moreServiceImage}
                  resizeMode="cover"
                />
              </View>
              <View style={s.moreServiceTextWrap}>
                <Text style={[s.moreServiceName, { color: colors.text }]}>Horticulture</Text>
                <Text style={[s.moreServiceDesc, { color: colors.textMuted }]}>Terrace gardens, plants, plantation</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </Pressable>

            {/* Insurance */}
            <Pressable
              style={[s.moreServiceRow, { borderBottomColor: colors.divider }]}
              onPress={() => navigation.navigate("ServiceCategory", { categoryId: "insurance" })}
            >
              <View style={s.moreServiceImageWrap}>
                <Image
                  source={SERVICE_LOCAL_IMAGES.insurance}
                  style={s.moreServiceImage}
                  resizeMode="cover"
                />
              </View>
              <View style={s.moreServiceTextWrap}>
                <Text style={[s.moreServiceName, { color: colors.text }]}>Insurance</Text>
                <Text style={[s.moreServiceDesc, { color: colors.textMuted }]}>Health, life, vehicle & general</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </Pressable>

            {/* Other Services */}
            <Pressable
              style={s.moreServiceRow}
              onPress={() => Alert.alert("Other Services", "Gardening, painting, sanitation, and deep sanitation.")}
            >
              <View style={[s.moreServiceIcon, { backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "#f1f5f9" }]}>
                <Ionicons name="ellipsis-horizontal" size={18} color={colors.textSecondary} />
              </View>
              <View style={s.moreServiceTextWrap}>
                <Text style={[s.moreServiceName, { color: colors.text }]}>Other Services</Text>
                <Text style={[s.moreServiceDesc, { color: colors.textMuted }]}>And many more...</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </Pressable>
          </View>

          {/* ── 6. Bottom Blue Exclusive Offers Promo Card ───────────── */}
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
                <Ionicons name="arrow-forward" size={13} color="#1e3a8a" />
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

  // ── Top Bar (Main View) ──────────────────────────────────────────
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 8,
  },
  locationPicker: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  locationPinCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(37, 99, 235, 0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
  locationTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  locationCity: {
    fontSize: 16,
    fontWeight: "700",
  },
  locationSub: {
    fontSize: 11.5,
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

  // ── Greeting ───────────────────────────────────────────────────
  greetingSection: {
    paddingHorizontal: 16,
    marginTop: 10,
    marginBottom: 12,
  },
  greetingText: {
    fontSize: 27,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  greetingSubText: {
    fontSize: 14,
    marginTop: 3,
    lineHeight: 20,
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

  // 6-Card Category Grid
  exploreCatGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 24,
  },
  exploreCatCard: {
    width: (W - 32 - 12) / 2,
    borderRadius: 20,
    padding: 16,
    alignItems: "center",
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
    width: 72,
    height: 72,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 10,
  },
  exploreCatImage: {
    width: "100%",
    height: "100%",
  },
  exploreCatTitle: {
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 2,
  },
  exploreCatSub: {
    fontSize: 11.5,
    textAlign: "center",
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
