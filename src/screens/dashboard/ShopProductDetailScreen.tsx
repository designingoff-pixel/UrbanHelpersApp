import React, { useState, useEffect } from "react";
import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  StatusBar,
  Image,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/types";
import { useTheme } from "@/context/ThemeContext";
import {
  ShopProduct,
  CartItem,
  DEFAULT_SHOP_PRODUCTS,
  subscribeToShopProducts,
  getSavedCart,
  saveUserCart,
} from "@/services/shopService";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Props = NativeStackScreenProps<RootStackParamList, "ShopProductDetail">;
const { width: SW } = Dimensions.get("window");
const WISHLIST_KEY = "@urban_shop_wishlist_v1";

const MOCK_REVIEWS = [
  { id: "r1", name: "Priya S.", rating: 5, text: "Absolutely love this! Syncs perfectly with the app.", date: "Sep 12, 2026" },
  { id: "r2", name: "Arjun M.", rating: 5, text: "Great quality. Exactly as described. Fast delivery!", date: "Sep 8, 2026" },
  { id: "r3", name: "Neha K.", rating: 4, text: "Works well but setup took a few minutes. Overall very satisfied.", date: "Aug 29, 2026" },
];

function StarRow({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <View style={{ flexDirection: "row", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Ionicons key={i} name={i <= Math.round(rating) ? "star" : "star-outline"} size={size} color="#f59e0b" />
      ))}
    </View>
  );
}

export default function ShopProductDetailScreen({ navigation, route }: Props) {
  const { isDark } = useTheme();
  const { productId } = route.params;

  const [product, setProduct] = useState<ShopProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlisted, setWishlisted] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedTab, setSelectedTab] = useState<"about" | "reviews">("about");

  useEffect(() => {
    const found = DEFAULT_SHOP_PRODUCTS.find((p) => p.id === productId);
    if (found) {
      setProduct(found);
      setLoading(false);
    } else {
      const unsub = subscribeToShopProducts((list) => {
        const p = list.find((x) => x.id === productId);
        if (p) setProduct(p);
        setLoading(false);
      });
      return () => { if (typeof unsub === "function") unsub(); };
    }
  }, [productId]);

  useEffect(() => {
    getSavedCart().then(setCart);
    AsyncStorage.getItem(WISHLIST_KEY).then((raw) => {
      if (raw) {
        const ids: string[] = JSON.parse(raw);
        setWishlisted(ids.includes(productId));
      }
    });
  }, []);

  const toggleWishlist = async () => {
    const raw = await AsyncStorage.getItem(WISHLIST_KEY);
    let ids: string[] = raw ? JSON.parse(raw) : [];
    if (wishlisted) {
      ids = ids.filter((id) => id !== productId);
    } else {
      ids = [...ids, productId];
    }
    await AsyncStorage.setItem(WISHLIST_KEY, JSON.stringify(ids));
    setWishlisted(!wishlisted);
  };

  const handleAddToCart = () => {
    if (!product) return;
    const existingIndex = cart.findIndex((item) => item.product.id === product.id);
    let updated: CartItem[];
    if (existingIndex > -1) {
      updated = [...cart];
      updated[existingIndex].quantity += quantity;
    } else {
      updated = [...cart, { product, quantity }];
    }
    setCart(updated);
    saveUserCart(updated);
    Alert.alert(
      "Added to Cart! 🛒",
      `${product.name} (×${quantity}) added.`,
      [
        { text: "Keep Shopping", style: "cancel" },
        { text: "Go to Cart", onPress: () => navigation.navigate("Shop") },
      ]
    );
  };

  const c = {
    bg: isDark ? "#0c111d" : "#f4f8f5",
    card: isDark ? "#1e293b" : "#ffffff",
    border: isDark ? "#334155" : "#e2e8f0",
    text: isDark ? "#f8fafc" : "#0f172a",
    sub: isDark ? "#94a3b8" : "#64748b",
  };

  if (loading || !product) {
    return (
      <View style={[styles.root, { backgroundColor: c.bg, alignItems: "center", justifyContent: "center" }]}>
        <ActivityIndicator size="large" color="#059669" />
      </View>
    );
  }

  const btnColor = product.btnColor || "#0f5132";
  const bagColor = product.bgGradient?.[0] || "#f0fdf4";

  return (
    <View style={[styles.root, { backgroundColor: c.bg }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* Hero */}
      <View style={[styles.heroBox, { backgroundColor: bagColor }]}>
        <Image source={{ uri: product.imageUrl }} style={styles.heroImg} resizeMode="cover" />
        <LinearGradient colors={["transparent", "rgba(0,0,0,0.20)"]} style={StyleSheet.absoluteFillObject} />

        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: isDark ? "rgba(30,41,59,0.9)" : "rgba(255,255,255,0.94)" }]}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={20} color={c.text} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.wishFloatBtn, { backgroundColor: isDark ? "rgba(30,41,59,0.9)" : "rgba(255,255,255,0.94)" }]}
          onPress={toggleWishlist}
        >
          <Ionicons name={wishlisted ? "heart" : "heart-outline"} size={20} color={wishlisted ? "#e11d48" : c.sub} />
        </TouchableOpacity>

        {product.badge && (
          <View style={[styles.heroBadge, { backgroundColor: product.badgeColor || "#0f5132" }]}>
            <Text style={styles.heroBadgeText}>{product.badge}</Text>
          </View>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>

        {/* Title card */}
        <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
          <Text style={[styles.title, { color: c.text }]}>{product.name}</Text>
          <Text style={[styles.subtitle, { color: c.sub }]}>{product.subtitle}</Text>

          <View style={styles.ratingRow}>
            <StarRow rating={product.rating} size={16} />
            <Text style={[styles.ratingNum, { color: c.text }]}>{product.rating.toFixed(1)}</Text>
            <Text style={[styles.reviewsLabel, { color: c.sub }]}>({product.reviewsCount} reviews)</Text>
          </View>

          <View style={styles.priceRow}>
            <View>
              <Text style={[styles.price, { color: c.text }]}>₹{product.price.toLocaleString()}</Text>
              <Text style={[styles.taxNote, { color: c.sub }]}>Inclusive of all taxes</Text>
            </View>
            <View style={styles.ptsBadge}>
              <Ionicons name="star" size={13} color="#d97706" />
              <Text style={styles.ptsText}>{product.pointsPrice.toLocaleString()} pts</Text>
            </View>
          </View>

          <View style={styles.stockRow}>
            <View style={[styles.stockDot, { backgroundColor: product.inStock ? "#10b981" : "#e11d48" }]} />
            <Text style={[styles.stockLabel, { color: product.inStock ? "#10b981" : "#e11d48" }]}>
              {product.inStock ? "In Stock · Ships within 24 hrs" : "Out of Stock"}
            </Text>
          </View>
        </View>

        {/* Quantity */}
        <View style={[styles.card, styles.qtyCard, { backgroundColor: c.card, borderColor: c.border }]}>
          <Text style={[styles.qtyLabel, { color: c.sub }]}>Quantity</Text>
          <View style={styles.qtyControls}>
            <TouchableOpacity
              onPress={() => setQuantity(Math.max(1, quantity - 1))}
              style={[styles.qtyBtn, { backgroundColor: isDark ? "#334155" : "#f1f5f9" }]}
            >
              <Ionicons name="remove" size={18} color={c.text} />
            </TouchableOpacity>
            <Text style={[styles.qtyNum, { color: c.text }]}>{quantity}</Text>
            <TouchableOpacity
              onPress={() => setQuantity(quantity + 1)}
              style={[styles.qtyBtn, { backgroundColor: btnColor }]}
            >
              <Ionicons name="add" size={18} color="#ffffff" />
            </TouchableOpacity>
          </View>
          <Text style={[styles.totalText, { color: c.sub }]}>
            Total: <Text style={{ color: c.text, fontWeight: "800" }}>₹{(product.price * quantity).toLocaleString()}</Text>
          </Text>
        </View>

        {/* Tabs */}
        <View style={[styles.tabBar, { backgroundColor: c.card, borderColor: c.border }]}>
          {(["about", "reviews"] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setSelectedTab(tab)}
              style={[styles.tabItem, selectedTab === tab && { borderBottomColor: btnColor, borderBottomWidth: 2.5 }]}
            >
              <Text style={[styles.tabLabel, { color: selectedTab === tab ? btnColor : c.sub }]}>
                {tab === "about" ? "About" : `Reviews (${product.reviewsCount})`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {selectedTab === "about" ? (
          <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
            <Text style={[styles.sectionTitle, { color: c.text }]}>Product Details</Text>
            <Text style={[styles.aboutText, { color: c.sub }]}>
              {`${product.name} is a premium ${product.category.toLowerCase()} product from Urban Shop.\n\n${product.subtitle}.\n\nEarn Urban Points on every purchase and redeem them for free products — making healthy living more affordable.`}
            </Text>
            {product.hasBluetooth && (
              <View style={styles.featureRow}>
                <Ionicons name="bluetooth" size={15} color="#0284c7" />
                <Text style={[styles.featureText, { color: c.text }]}>Bluetooth Sync Compatible</Text>
              </View>
            )}
            {[
              { icon: "shield-checkmark", color: "#10b981", label: "30-Day Return Policy" },
              { icon: "car", color: "#6366f1", label: "Free Delivery above ₹999" },
              { icon: "star", color: "#f59e0b", label: `Earn ${Math.round(product.price * 0.05)} Urban Points on purchase` },
              { icon: "lock-closed", color: "#0f5132", label: "Secure Payment & Data Privacy" },
            ].map((f, i) => (
              <View key={i} style={[styles.featureRow, { borderTopColor: c.border }]}>
                <Ionicons name={f.icon as any} size={15} color={f.color} />
                <Text style={[styles.featureText, { color: c.text }]}>{f.label}</Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border, padding: 0, overflow: "hidden" }]}>
            {MOCK_REVIEWS.map((rev, i) => (
              <View key={rev.id} style={[styles.reviewRow, { borderBottomColor: c.border, borderBottomWidth: i < MOCK_REVIEWS.length - 1 ? 1 : 0 }]}>
                <View style={styles.revHeader}>
                  <View style={[styles.avatar, { backgroundColor: btnColor }]}>
                    <Text style={styles.avatarLetter}>{rev.name.charAt(0)}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.revName, { color: c.text }]}>{rev.name}</Text>
                    <Text style={[styles.revDate, { color: c.sub }]}>{rev.date}</Text>
                  </View>
                  <StarRow rating={rev.rating} size={12} />
                </View>
                <Text style={[styles.revText, { color: c.sub }]}>{rev.text}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom CTA */}
      <View style={[styles.bottomBar, { backgroundColor: c.card, borderTopColor: c.border }]}>
        <TouchableOpacity
          style={[styles.heartCTA, { borderColor: isDark ? "#334155" : "#e2e8f0" }]}
          onPress={toggleWishlist}
        >
          <Ionicons name={wishlisted ? "heart" : "heart-outline"} size={22} color={wishlisted ? "#e11d48" : c.sub} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.cartCTA, { backgroundColor: product.inStock ? btnColor : "#94a3b8" }]}
          onPress={handleAddToCart}
          disabled={!product.inStock}
        >
          <Ionicons name="cart" size={18} color="#ffffff" />
          <Text style={styles.cartCTAText}>
            {product.inStock ? `Add to Cart — ₹${(product.price * quantity).toLocaleString()}` : "Out of Stock"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  heroBox: { height: 280, position: "relative" },
  heroImg: { width: "100%", height: "100%" },
  backBtn: {
    position: "absolute", top: 52, left: 16,
    width: 38, height: 38, borderRadius: 19,
    alignItems: "center", justifyContent: "center",
    shadowColor: "#000", shadowOpacity: 0.12, shadowRadius: 6, elevation: 4,
  },
  wishFloatBtn: {
    position: "absolute", top: 52, right: 16,
    width: 38, height: 38, borderRadius: 19,
    alignItems: "center", justifyContent: "center",
    shadowColor: "#000", shadowOpacity: 0.12, shadowRadius: 6, elevation: 4,
  },
  heroBadge: {
    position: "absolute", bottom: 16, left: 16,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8,
  },
  heroBadgeText: { color: "#ffffff", fontSize: 10, fontWeight: "900", letterSpacing: 0.5 },
  body: { padding: 14, gap: 12 },
  card: { borderRadius: 18, borderWidth: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: "900", letterSpacing: -0.3, marginBottom: 4 },
  subtitle: { fontSize: 13, lineHeight: 18, marginBottom: 10 },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 12 },
  ratingNum: { fontSize: 13, fontWeight: "800" },
  reviewsLabel: { fontSize: 12 },
  priceRow: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 10 },
  price: { fontSize: 26, fontWeight: "900", letterSpacing: -0.5 },
  taxNote: { fontSize: 11, marginTop: 1 },
  ptsBadge: { flexDirection: "row", alignItems: "center", backgroundColor: "#fef3c7", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, gap: 4 },
  ptsText: { fontSize: 12, fontWeight: "800", color: "#b45309" },
  stockRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  stockDot: { width: 8, height: 8, borderRadius: 4 },
  stockLabel: { fontSize: 12, fontWeight: "600" },
  qtyCard: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  qtyLabel: { fontSize: 13, fontWeight: "600" },
  qtyControls: { flexDirection: "row", alignItems: "center", gap: 10 },
  qtyBtn: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  qtyNum: { fontSize: 18, fontWeight: "900", minWidth: 28, textAlign: "center" },
  totalText: { fontSize: 12 },
  tabBar: { flexDirection: "row", borderRadius: 18, borderWidth: 1, overflow: "hidden" },
  tabItem: { flex: 1, paddingVertical: 13, alignItems: "center" },
  tabLabel: { fontSize: 13, fontWeight: "700" },
  sectionTitle: { fontSize: 15, fontWeight: "800", marginBottom: 8 },
  aboutText: { fontSize: 13, lineHeight: 20, marginBottom: 10 },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 7, borderTopWidth: 1 },
  featureText: { fontSize: 13, fontWeight: "600" },
  reviewRow: { padding: 14 },
  revHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 },
  avatar: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  avatarLetter: { color: "#ffffff", fontSize: 14, fontWeight: "800" },
  revName: { fontSize: 13, fontWeight: "700" },
  revDate: { fontSize: 11, marginTop: 1 },
  revText: { fontSize: 13, lineHeight: 18 },
  bottomBar: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    flexDirection: "row", alignItems: "center", gap: 10,
    padding: 14, paddingBottom: 28, borderTopWidth: 1,
    shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 10, elevation: 10,
  },
  heartCTA: { width: 48, height: 48, borderRadius: 24, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
  cartCTA: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, borderRadius: 20 },
  cartCTAText: { color: "#ffffff", fontSize: 14, fontWeight: "800" },
});
