import React, { useState } from "react";
import {
  ScrollView,
  Text,
  View,
  Pressable,
  StyleSheet,
  TextInput,
  Dimensions,
  Alert,
  StatusBar,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/types";
import SamsungBottomNav from "@/components/SamsungBottomNav";

type Props = NativeStackScreenProps<RootStackParamList, "Shop">;

const { width: SW } = Dimensions.get("window");
const CARD_W = (SW - 32 - 12) / 2;

type ShopCategory =
  | "All"
  | "Wearables"
  | "Health Devices"
  | "Nutrition & Detox"
  | "Fitness Gear"
  | "Hygiene";

const CATEGORIES: ShopCategory[] = [
  "All",
  "Wearables",
  "Health Devices",
  "Nutrition & Detox",
  "Fitness Gear",
  "Hygiene",
];

interface Product {
  id: string;
  name: string;
  category: ShopCategory;
  price: number;
  pointsPrice: number;
  rating: number;
  reviewsCount: number;
  badge?: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  iconColor: string;
  gradient: [string, string];
  features: string;
}

const PRODUCTS: Product[] = [
  {
    id: "prod-1",
    name: "Galaxy Watch Ultra 2",
    category: "Wearables",
    price: 39999,
    pointsPrice: 38000,
    rating: 4.9,
    reviewsCount: 342,
    badge: "15% OFF",
    icon: "watch",
    iconColor: "#60a5fa",
    gradient: ["#1e293b", "#0f172a"],
    features: "Energy Score, ECG, Dual-GPS & Cardio Load",
  },
  {
    id: "prod-2",
    name: "Galaxy Watch9 Pro",
    category: "Wearables",
    price: 26999,
    pointsPrice: 25000,
    rating: 4.8,
    reviewsCount: 219,
    badge: "BESTSELLER",
    icon: "watch-vibrate",
    iconColor: "#a855f7",
    gradient: ["#2e1065", "#1e1b4b"],
    features: "BIA Body Composition & Advanced Sleep Coaching",
  },
  {
    id: "prod-3",
    name: "Smart Body Composition Scale",
    category: "Health Devices",
    price: 2999,
    pointsPrice: 2800,
    rating: 4.7,
    reviewsCount: 184,
    badge: "SYNC COMPATIBLE",
    icon: "scale-bathroom",
    iconColor: "#34d399",
    gradient: ["#064e3b", "#022c22"],
    features: "Auto-syncs Weight, BMI, Body Fat & Skeletal Muscle",
  },
  {
    id: "prod-4",
    name: "Wireless Bluetooth BP Monitor",
    category: "Health Devices",
    price: 3499,
    pointsPrice: 3200,
    rating: 4.9,
    reviewsCount: 147,
    badge: "CLINICAL GRADE",
    icon: "heart-pulse",
    iconColor: "#f43f5e",
    gradient: ["#4c0519", "#290310"],
    features: "One-tap sync to Vitals Dashboard & Health log",
  },
  {
    id: "prod-5",
    name: "Herbal Detox & Cleanse Pack",
    category: "Nutrition & Detox",
    price: 1299,
    pointsPrice: 1200,
    rating: 4.6,
    reviewsCount: 95,
    icon: "leaf",
    iconColor: "#10b981",
    gradient: ["#064e3b", "#14532d"],
    features: "14-Day digestive cleanse & antioxidant immunity blend",
  },
  {
    id: "prod-6",
    name: "Sonic Smart Electric Toothbrush",
    category: "Hygiene",
    price: 1899,
    pointsPrice: 1750,
    rating: 4.8,
    reviewsCount: 310,
    badge: "POPULAR",
    icon: "toothbrush-paste",
    iconColor: "#38bdf8",
    gradient: ["#0c4a6e", "#082f49"],
    features: "40,000 VPM acoustic cleaning & 2-min reminder timer",
  },
  {
    id: "prod-7",
    name: "Orthopedic Yoga & Pilates Mat",
    category: "Fitness Gear",
    price: 1499,
    pointsPrice: 1400,
    rating: 4.9,
    reviewsCount: 420,
    icon: "yoga",
    iconColor: "#fbbf24",
    gradient: ["#451a03", "#291002"],
    features: "High-density 8mm cushioning with alignment guide",
  },
  {
    id: "prod-8",
    name: "Adjustable Quick-Select Dumbbells",
    category: "Fitness Gear",
    price: 7999,
    pointsPrice: 7500,
    rating: 4.9,
    reviewsCount: 168,
    badge: "PRO FITNESS",
    icon: "dumbbell",
    iconColor: "#f97316",
    gradient: ["#431407", "#270b04"],
    features: "2.5kg to 24kg dial mechanism for home workouts",
  },
];

export default function ShopScreen({ navigation }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<ShopCategory>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [userPoints, setUserPoints] = useState(1250); // Rewarded points from health activity

  const filteredProducts = PRODUCTS.filter((p) => {
    const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.features.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleBuyWithCash = (product: Product) => {
    Alert.alert(
      "Order Confirmation",
      `Proceed to checkout for ${product.name} (₹${product.price.toLocaleString()})?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: () => {
            const earnedPoints = Math.round(product.price * 0.05);
            setUserPoints((prev) => prev + earnedPoints);
            Alert.alert(
              "Order Placed!",
              `Thank you for your purchase. You also earned ${earnedPoints} reward points!`
            );
          },
        },
      ]
    );
  };

  const handleRedeemWithPoints = (product: Product) => {
    if (userPoints < product.pointsPrice) {
      Alert.alert(
        "Insufficient Points",
        `You have ${userPoints} points. You need ${product.pointsPrice} points to redeem this item.\n\nEarn more points through daily steps, workouts, and logging meals!`
      );
      return;
    }

    Alert.alert(
      "Redeem with Points",
      `Redeem ${product.name} using ${product.pointsPrice} reward points? (Zero cash required)`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Redeem Now",
          onPress: () => {
            setUserPoints((prev) => prev - product.pointsPrice);
            Alert.alert("Redeemed!", `Your item has been ordered using reward points.`);
          },
        },
      ]
    );
  };

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0c0e12" />

      {/* Top App Bar */}
      <View style={s.header}>
        <View>
          <Text style={s.headerSubtitle}>HEALTH & WELLNESS STORE</Text>
          <Text style={s.headerTitle}>Urban Shop</Text>
        </View>

        {/* User Points Badge */}
        <View style={s.pointsPill}>
          <Ionicons name="sparkles" size={14} color="#f59e0b" />
          <Text style={s.pointsText}>{userPoints.toLocaleString()} pts</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scrollContent}
      >
        {/* Search Bar */}
        <View style={s.searchBarWrap}>
          <Ionicons name="search" size={18} color="rgba(255,255,255,0.4)" style={s.searchIcon} />
          <TextInput
            style={s.searchInput}
            placeholder="Search Galaxy Watch, BP monitors, supplements..."
            placeholderTextColor="rgba(255,255,255,0.3)"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery("")} style={s.clearBtn}>
              <Ionicons name="close-circle" size={18} color="rgba(255,255,255,0.4)" />
            </Pressable>
          )}
        </View>

        {/* Hero Promo Banner */}
        <LinearGradient
          colors={["#1e3a8a", "#2563eb", "#0d9488"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.heroBanner}
        >
          <View style={s.heroContent}>
            <View style={s.heroBadge}>
              <Text style={s.heroBadgeText}>SAMSUNG GALAXY HEALTH</Text>
            </View>
            <Text style={s.heroTitle}>Track Energy Score & Cardio Load</Text>
            <Text style={s.heroSub}>
              Get 15% off Galaxy Watch Ultra 2 & Watch 9. Full sync with your daily health log.
            </Text>
          </View>
          <View style={s.heroIconWrap}>
            <MaterialCommunityIcons name="watch-vibrate" size={54} color="#ffffff" />
          </View>
        </LinearGradient>

        {/* Points Rewards Info Card */}
        <View style={s.pointsBanner}>
          <View style={s.pointsBannerIcon}>
            <Ionicons name="gift" size={22} color="#f59e0b" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.pointsBannerTitle}>Buy with Reward Points</Text>
            <Text style={s.pointsBannerSub}>
              Earn points with 10k daily steps, sleep goals, and profile milestones. Redeem for products anytime!
            </Text>
          </View>
        </View>

        {/* Category Horizontal Scroll */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.catScroll}
        >
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <Pressable
                key={cat}
                onPress={() => setSelectedCategory(cat)}
                style={[s.catChip, isSelected && s.catChipActive]}
              >
                <Text style={[s.catChipText, isSelected && s.catChipTextActive]}>
                  {cat}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Products Grid */}
        <View style={s.grid}>
          {filteredProducts.map((p) => (
            <View key={p.id} style={s.card}>
              <LinearGradient
                colors={p.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={s.cardThumb}
              >
                {p.badge && (
                  <View style={s.badgeWrap}>
                    <Text style={s.badgeText}>{p.badge}</Text>
                  </View>
                )}
                <MaterialCommunityIcons name={p.icon} size={48} color={p.iconColor} />
              </LinearGradient>

              <View style={s.cardBody}>
                <View style={s.ratingRow}>
                  <Ionicons name="star" size={12} color="#f59e0b" />
                  <Text style={s.ratingText}>
                    {p.rating} <Text style={s.reviewsText}>({p.reviewsCount})</Text>
                  </Text>
                </View>

                <Text style={s.productName} numberOfLines={2}>
                  {p.name}
                </Text>
                <Text style={s.productFeatures} numberOfLines={2}>
                  {p.features}
                </Text>

                <View style={s.priceRow}>
                  <Text style={s.priceText}>₹{p.price.toLocaleString()}</Text>
                  <Text style={s.orText}>or</Text>
                  <View style={s.pointsTag}>
                    <Ionicons name="sparkles" size={10} color="#f59e0b" />
                    <Text style={s.pointsPriceText}>{p.pointsPrice.toLocaleString()} pts</Text>
                  </View>
                </View>

                {/* Actions */}
                <View style={s.actionRow}>
                  <Pressable
                    style={s.buyCashBtn}
                    onPress={() => handleBuyWithCash(p)}
                  >
                    <Text style={s.buyCashBtnText}>Buy Now</Text>
                  </Pressable>
                  <Pressable
                    style={s.redeemPointsBtn}
                    onPress={() => handleRedeemWithPoints(p)}
                  >
                    <Ionicons name="sparkles" size={12} color="#f59e0b" />
                  </Pressable>
                </View>
              </View>
            </View>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Persistent Bottom Navigation with Shop active */}
      <SamsungBottomNav activeRoute="Shop" />
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0c0e12",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 52,
    paddingBottom: 12,
  },
  headerSubtitle: {
    fontSize: 10,
    fontWeight: "700",
    color: "rgba(255,255,255,0.5)",
    letterSpacing: 0.8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#ffffff",
  },
  pointsPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(245, 158, 11, 0.15)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.3)",
  },
  pointsText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#fbbf24",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },

  // Search Bar
  searchBarWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1c2128",
    borderRadius: 16,
    paddingHorizontal: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: "#ffffff",
  },
  clearBtn: {
    padding: 4,
  },

  // Hero Banner
  heroBanner: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 24,
    padding: 20,
    marginBottom: 14,
  },
  heroContent: {
    flex: 1,
  },
  heroBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginBottom: 8,
  },
  heroBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#ffffff",
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#ffffff",
    marginBottom: 6,
    lineHeight: 22,
  },
  heroSub: {
    fontSize: 12,
    color: "rgba(255,255,255,0.85)",
    lineHeight: 16,
  },
  heroIconWrap: {
    marginLeft: 12,
  },

  // Points Banner
  pointsBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(245, 158, 11, 0.1)",
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.2)",
    gap: 12,
  },
  pointsBannerIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(245, 158, 11, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  pointsBannerTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#fbbf24",
    marginBottom: 2,
  },
  pointsBannerSub: {
    fontSize: 11,
    color: "rgba(255,255,255,0.7)",
    lineHeight: 15,
  },

  // Categories
  catScroll: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 18,
  },
  catChip: {
    backgroundColor: "#1c2128",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  catChipActive: {
    backgroundColor: "#2563eb",
    borderColor: "#60a5fa",
  },
  catChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(255,255,255,0.6)",
  },
  catChipTextActive: {
    color: "#ffffff",
    fontWeight: "700",
  },

  // Grid
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  card: {
    width: CARD_W,
    backgroundColor: "#161922",
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  cardThumb: {
    height: 120,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  badgeWrap: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "rgba(244, 63, 94, 0.9)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: 0.4,
  },
  cardBody: {
    padding: 12,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#ffffff",
  },
  reviewsText: {
    color: "rgba(255,255,255,0.4)",
    fontWeight: "400",
  },
  productName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 4,
    height: 36,
  },
  productFeatures: {
    fontSize: 10,
    color: "rgba(255,255,255,0.5)",
    marginBottom: 8,
    height: 28,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flexWrap: "wrap",
    marginBottom: 10,
  },
  priceText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#ffffff",
  },
  orText: {
    fontSize: 10,
    color: "rgba(255,255,255,0.4)",
  },
  pointsTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "rgba(245, 158, 11, 0.12)",
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 6,
  },
  pointsPriceText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#fbbf24",
  },
  actionRow: {
    flexDirection: "row",
    gap: 6,
  },
  buyCashBtn: {
    flex: 1,
    backgroundColor: "#2563eb",
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: "center",
  },
  buyCashBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#ffffff",
  },
  redeemPointsBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "rgba(245, 158, 11, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.4)",
  },
});
