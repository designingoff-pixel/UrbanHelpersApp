import React, { useState, useEffect, useRef } from "react";
import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Dimensions,
  Alert,
  StatusBar,
  Image,
  Modal,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/types";
import SamsungBottomNav from "@/components/SamsungBottomNav";
import { useTheme } from "@/context/ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  ShopCategory,
  ShopProduct,
  CartItem,
  subscribeToShopProducts,
  DEFAULT_SHOP_PRODUCTS,
  addProductToFirestore,
  getSavedCart,
  saveUserCart,
} from "@/services/shopService";
import { OrderRecord } from "./OrderHistoryScreen";

type Props = NativeStackScreenProps<RootStackParamList, "Shop">;

const { width: SW } = Dimensions.get("window");
const CARD_W = (SW - 32 - 12) / 2;
const WISHLIST_KEY = "@urban_shop_wishlist_v1";
const ORDER_HISTORY_KEY = "@urban_shop_order_history_v1";

const CATEGORIES: { label: ShopCategory; icon: string }[] = [
  { label: "All", icon: "leaf" },
  { label: "Health", icon: "heart" },
  { label: "Fitness", icon: "barbell" },
  { label: "Wellness", icon: "flower" },
  { label: "Tools", icon: "construct" },
  { label: "More", icon: "grid" },
];

const FLASH_DEALS: { productId: string; discount: number }[] = [
  { productId: "prod-scale-1", discount: 18 },
  { productId: "prod-detox-3", discount: 25 },
  { productId: "prod-mat-5", discount: 20 },
];

// Calculate time left for flash sale (resets every 4 hours)
function getFlashTimeLeft(): { h: number; m: number; s: number } {
  const now = new Date();
  const msPerBlock = 4 * 60 * 60 * 1000;
  const remainder = now.getTime() % msPerBlock;
  const left = msPerBlock - remainder;
  const s = Math.floor(left / 1000);
  return { h: Math.floor(s / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
}

function pad(n: number) { return String(n).padStart(2, "0"); }

export default function ShopScreen({ navigation }: Props) {
  const { isDark } = useTheme();

  const [products, setProducts] = useState<ShopProduct[]>(DEFAULT_SHOP_PRODUCTS);
  const [selectedCategory, setSelectedCategory] = useState<ShopCategory>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [userPoints, setUserPoints] = useState(1250);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [cartModalVisible, setCartModalVisible] = useState(false);
  const [adminModalVisible, setAdminModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<"shop" | "wishlist">("shop");

  // Flash deal timer
  const [timeLeft, setTimeLeft] = useState(getFlashTimeLeft());
  useEffect(() => {
    const id = setInterval(() => setTimeLeft(getFlashTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);

  // Admin form state
  const [newProdName, setNewProdName] = useState("");
  const [newProdCategory, setNewProdCategory] = useState<ShopCategory>("Health");
  const [newProdPrice, setNewProdPrice] = useState("");
  const [newProdPoints, setNewProdPoints] = useState("");
  const [newProdSubtitle, setNewProdSubtitle] = useState("");
  const [newProdBadge, setNewProdBadge] = useState("NEW ARRIVAL");
  const [newProdImageUrl, setNewProdImageUrl] = useState("");
  const [addingProduct, setAddingProduct] = useState(false);

  useEffect(() => {
    const unsub = subscribeToShopProducts((list) => {
      if (list && list.length > 0) setProducts(list);
    });
    getSavedCart().then((saved) => { if (saved && saved.length > 0) setCart(saved); });
    AsyncStorage.getItem(WISHLIST_KEY).then((raw) => {
      if (raw) setWishlistIds(JSON.parse(raw));
    });
    return () => { if (typeof unsub === "function") unsub(); };
  }, []);

  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const toggleWishlist = async (productId: string) => {
    let ids = [...wishlistIds];
    if (ids.includes(productId)) {
      ids = ids.filter((id) => id !== productId);
    } else {
      ids = [...ids, productId];
    }
    setWishlistIds(ids);
    await AsyncStorage.setItem(WISHLIST_KEY, JSON.stringify(ids));
  };

  const handleAddToCart = (product: ShopProduct) => {
    const existingIndex = cart.findIndex((item) => item.product.id === product.id);
    let updated: CartItem[];
    if (existingIndex > -1) {
      updated = [...cart];
      updated[existingIndex].quantity += 1;
    } else {
      updated = [...cart, { product, quantity: 1 }];
    }
    setCart(updated);
    saveUserCart(updated);
    Alert.alert("Added! 🛒", `${product.name} added to cart.`);
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    let updated = cart
      .map((item) => item.product.id === productId ? { ...item, quantity: item.quantity + delta } : item)
      .filter((item) => item.quantity > 0);
    setCart(updated);
    saveUserCart(updated);
  };

  const cartTotalCash = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const cartTotalPoints = cart.reduce((acc, item) => acc + item.product.pointsPrice * item.quantity, 0);

  const saveOrder = async (method: "cash" | "points") => {
    const newOrder: OrderRecord = {
      id: `ord-${Date.now()}`,
      items: cart.map((c) => ({
        name: c.product.name,
        imageUrl: c.product.imageUrl,
        quantity: c.quantity,
        price: c.product.price,
      })),
      totalCash: cartTotalCash,
      totalPoints: cartTotalPoints,
      paymentMethod: method,
      status: "processing",
      createdAt: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
      pointsEarned: method === "cash" ? Math.round(cartTotalCash * 0.05) : 0,
    };
    const raw = await AsyncStorage.getItem(ORDER_HISTORY_KEY);
    const existing: OrderRecord[] = raw ? JSON.parse(raw) : [];
    await AsyncStorage.setItem(ORDER_HISTORY_KEY, JSON.stringify([newOrder, ...existing]));
  };

  const handleCheckoutCash = () => {
    if (cart.length === 0) return;
    Alert.alert(
      "Confirm Order",
      `Checkout ₹${cartTotalCash.toLocaleString()} for ${totalCartCount} item(s)?\nDelivery: Home\nPayment: Cash / UPI on delivery.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Place Order",
          onPress: async () => {
            const earned = Math.round(cartTotalCash * 0.05);
            await saveOrder("cash");
            setUserPoints((prev) => prev + earned);
            setCart([]); saveUserCart([]); setCartModalVisible(false);
            Alert.alert("Order Placed! 🎉", `Delivery in 2 business days.\nYou earned +${earned} Urban Points!`);
          },
        },
      ]
    );
  };

  const handleCheckoutPoints = () => {
    if (cart.length === 0) return;
    if (userPoints < cartTotalPoints) {
      Alert.alert("Insufficient Points", `You have ${userPoints.toLocaleString()} pts, need ${cartTotalPoints.toLocaleString()} pts.\nEarn more by logging steps, workouts & vitals!`);
      return;
    }
    Alert.alert(
      "Redeem with Points",
      `Use ${cartTotalPoints.toLocaleString()} points for ${totalCartCount} item(s)?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Redeem",
          onPress: async () => {
            await saveOrder("points");
            setUserPoints((prev) => prev - cartTotalPoints);
            setCart([]); saveUserCart([]); setCartModalVisible(false);
            Alert.alert("Redeemed! 🎁", "Products ordered with reward points.");
          },
        },
      ]
    );
  };

  const handleCreateProductAdmin = async () => {
    if (!newProdName.trim() || !newProdPrice.trim()) {
      Alert.alert("Required", "Please enter product name and price.");
      return;
    }
    setAddingProduct(true);
    try {
      const priceNum = parseFloat(newProdPrice) || 999;
      const ptsNum = parseFloat(newProdPoints) || Math.round(priceNum * 0.9);
      await addProductToFirestore({
        name: newProdName.trim(),
        subtitle: newProdSubtitle.trim() || "Premium health & wellness product",
        category: newProdCategory,
        price: priceNum, pointsPrice: ptsNum,
        rating: 4.9, reviewsCount: 1,
        badge: newProdBadge.trim() || undefined,
        badgeColor: "#0f5132", btnColor: "#0f5132",
        imageUrl: newProdImageUrl.trim() || "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&q=80",
        bgGradient: ["#ebf7ee", "#d8f3e0"], inStock: true,
      });
      setNewProdName(""); setNewProdSubtitle(""); setNewProdPrice("");
      setNewProdPoints(""); setNewProdImageUrl(""); setAdminModalVisible(false);
      Alert.alert("Published!", "Product added to Firestore & synced to web + app.");
    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed to add product");
    } finally {
      setAddingProduct(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchCat = selectedCategory === "All" || p.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchSearch = !searchQuery.trim() ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.subtitle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const flashDeals = products.filter((p) => FLASH_DEALS.some((f) => f.productId === p.id));
  const wishlistProducts = products.filter((p) => wishlistIds.includes(p.id));

  const c = {
    bg: isDark ? "#0c111d" : "#f4f8f5",
    card: isDark ? "#1e293b" : "#ffffff",
    border: isDark ? "#334155" : "#e2e8f0",
    text: isDark ? "#f8fafc" : "#0f172a",
    sub: isDark ? "#94a3b8" : "#64748b",
  };

  return (
    <View style={[styles.root, { backgroundColor: c.bg }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* ── Header ── */}
      <View style={[styles.topHeader, { backgroundColor: c.bg }]}>
        <View style={styles.headerLeftRow}>
          <LinearGradient colors={["#10b981", "#059669"]} style={styles.logoBadge}>
            <Ionicons name="leaf" size={20} color="#ffffff" />
          </LinearGradient>
          <View>
            <Text style={styles.headerBrand}>Urban Helpers</Text>
            <Text style={[styles.headerTitle, { color: c.text }]}>Urban Shop</Text>
            <Text style={styles.headerTag}>Better Health • Smarter Living</Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          {/* Orders */}
          <TouchableOpacity
            style={[styles.iconBtn, { backgroundColor: c.card, borderColor: c.border }]}
            onPress={() => navigation.navigate("OrderHistory")}
          >
            <Ionicons name="bag-handle-outline" size={18} color="#0f5132" />
          </TouchableOpacity>

          {/* Points pill */}
          <TouchableOpacity
            style={[styles.pointsPill, { backgroundColor: c.card, borderColor: c.border }]}
            onPress={() => navigation.navigate("Points")}
          >
            <View style={styles.goldDot}>
              <Ionicons name="star" size={10} color="#ffffff" />
            </View>
            <Text style={[styles.pillText, { color: c.text }]}>{userPoints.toLocaleString()}</Text>
            <Ionicons name="chevron-forward" size={11} color="#94a3b8" />
          </TouchableOpacity>

          {/* Cart */}
          <TouchableOpacity style={styles.cartBtn} onPress={() => setCartModalVisible(true)}>
            <Ionicons name="cart-outline" size={20} color="#0f5132" />
            {totalCartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{totalCartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Search ── */}
      <View style={styles.searchWrap}>
        <View style={[styles.searchBox, { backgroundColor: c.card, borderColor: c.border }]}>
          <Ionicons name="search" size={17} color="#64748b" style={{ marginRight: 7 }} />
          <TextInput
            style={[styles.searchInput, { color: c.text }]}
            placeholder="Search products..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={16} color="#94a3b8" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Shop / Wishlist Toggle ── */}
      <View style={[styles.tabToggle, { backgroundColor: c.card, borderColor: c.border }]}>
        {(["shop", "wishlist"] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[styles.toggleTab, activeTab === tab && styles.toggleTabActive]}
          >
            <Ionicons
              name={tab === "shop" ? "storefront" : "heart"}
              size={14}
              color={activeTab === tab ? "#ffffff" : c.sub}
            />
            <Text style={[styles.toggleLabel, { color: activeTab === tab ? "#ffffff" : c.sub }]}>
              {tab === "shop" ? "Shop" : `Wishlist${wishlistIds.length > 0 ? ` (${wishlistIds.length})` : ""}`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>

        {activeTab === "wishlist" ? (
          <>
            {wishlistProducts.length === 0 ? (
              <View style={styles.emptyBox}>
                <Ionicons name="heart-outline" size={52} color="#94a3b8" />
                <Text style={[styles.emptyTitle, { color: c.text }]}>No Favourites Yet</Text>
                <Text style={[styles.emptySub, { color: c.sub }]}>Tap the heart on any product to save it here.</Text>
              </View>
            ) : (
              <View style={styles.grid}>
                {wishlistProducts.map((item) => renderProductCard(item, c, isDark, cart, wishlistIds, handleAddToCart, toggleWishlist, (id) => navigation.navigate("ShopProductDetail", { productId: id })))}
              </View>
            )}
          </>
        ) : (
          <>
            {/* ── Flash Deals Banner ── */}
            {FLASH_DEALS.length > 0 && !searchQuery && (
              <View style={[styles.flashSection, { backgroundColor: c.card, borderColor: c.border }]}>
                <View style={styles.flashHeader}>
                  <View style={styles.flashTitleRow}>
                    <Ionicons name="flash" size={16} color="#e11d48" />
                    <Text style={styles.flashTitle}>Flash Deals</Text>
                  </View>
                  <View style={styles.timerRow}>
                    {[pad(timeLeft.h), pad(timeLeft.m), pad(timeLeft.s)].map((v, i) => (
                      <React.Fragment key={i}>
                        <View style={styles.timerChip}>
                          <Text style={styles.timerNum}>{v}</Text>
                        </View>
                        {i < 2 && <Text style={styles.timerColon}>:</Text>}
                      </React.Fragment>
                    ))}
                  </View>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.flashScroll}>
                  {FLASH_DEALS.map((fd) => {
                    const p = products.find((x) => x.id === fd.productId);
                    if (!p) return null;
                    const salePrice = Math.round(p.price * (1 - fd.discount / 100));
                    return (
                      <TouchableOpacity
                        key={p.id}
                        style={[styles.flashCard, { backgroundColor: c.bg, borderColor: c.border }]}
                        onPress={() => navigation.navigate("ShopProductDetail", { productId: p.id })}
                        activeOpacity={0.88}
                      >
                        <View style={styles.discountBadge}>
                          <Text style={styles.discountText}>-{fd.discount}%</Text>
                        </View>
                        <Image source={{ uri: p.imageUrl }} style={styles.flashImg} resizeMode="cover" />
                        <Text style={[styles.flashName, { color: c.text }]} numberOfLines={1}>{p.name}</Text>
                        <View style={styles.flashPriceRow}>
                          <Text style={[styles.flashSalePrice, { color: c.text }]}>₹{salePrice.toLocaleString()}</Text>
                          <Text style={styles.flashOldPrice}>₹{p.price.toLocaleString()}</Text>
                        </View>
                        <TouchableOpacity
                          style={[styles.flashAddBtn, { backgroundColor: p.btnColor || "#0f5132" }]}
                          onPress={() => handleAddToCart(p)}
                        >
                          <Text style={styles.flashAddBtnText}>Add</Text>
                        </TouchableOpacity>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            {/* ── Category Chips ── */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catScroll}>
              {CATEGORIES.map((cat) => {
                const active = selectedCategory === cat.label;
                return (
                  <TouchableOpacity
                    key={cat.label}
                    onPress={() => setSelectedCategory(cat.label)}
                    style={[
                      styles.catChip,
                      active
                        ? { backgroundColor: "#0f5132" }
                        : { backgroundColor: c.card, borderColor: c.border, borderWidth: 1 },
                    ]}
                  >
                    <Ionicons name={cat.icon as any} size={13} color={active ? "#ffffff" : (isDark ? "#94a3b8" : "#0f5132")} style={{ marginRight: 4 }} />
                    <Text style={[styles.catLabel, { color: active ? "#ffffff" : (isDark ? "#cbd5e1" : "#334155") }]}>
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* ── Admin bar ── */}
            <View style={styles.adminBar}>
              <Text style={[styles.countText, { color: c.sub }]}>{filteredProducts.length} products</Text>
              <TouchableOpacity style={styles.adminBtn} onPress={() => setAdminModalVisible(true)}>
                <Ionicons name="add-circle" size={14} color="#059669" />
                <Text style={styles.adminBtnText}>+ Add (Admin)</Text>
              </TouchableOpacity>
            </View>

            {/* ── Products Grid ── */}
            <View style={styles.grid}>
              {filteredProducts.map((item) =>
                renderProductCard(item, c, isDark, cart, wishlistIds, handleAddToCart, toggleWishlist, (id) => navigation.navigate("ShopProductDetail", { productId: id }))
              )}
            </View>

            {filteredProducts.length === 0 && (
              <View style={styles.emptyBox}>
                <Ionicons name="search-outline" size={48} color="#94a3b8" />
                <Text style={[styles.emptyTitle, { color: c.text }]}>No Products Found</Text>
                <Text style={[styles.emptySub, { color: c.sub }]}>Try a different search or category.</Text>
              </View>
            )}
          </>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ── Cart Modal ── */}
      <Modal visible={cartModalVisible} transparent animationType="slide" onRequestClose={() => setCartModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => setCartModalVisible(false)} />
          <View style={[styles.cartSheet, { backgroundColor: c.card }]}>
            <View style={styles.sheetHandle} />
            <View style={styles.cartSheetHead}>
              <Text style={[styles.cartSheetTitle, { color: c.text }]}>Cart ({totalCartCount})</Text>
              <TouchableOpacity onPress={() => setCartModalVisible(false)}>
                <Ionicons name="close-circle" size={24} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 280 }} showsVerticalScrollIndicator={false}>
              {cart.length === 0 ? (
                <View style={styles.emptyCartBox}>
                  <Ionicons name="cart-outline" size={40} color="#94a3b8" />
                  <Text style={[styles.emptyCartText, { color: c.sub }]}>Your cart is empty</Text>
                </View>
              ) : cart.map((item) => (
                <View key={item.product.id} style={[styles.cartRow, { borderBottomColor: c.border }]}>
                  <Image source={{ uri: item.product.imageUrl }} style={styles.cartThumb} />
                  <View style={styles.cartItemInfo}>
                    <Text style={[styles.cartItemName, { color: c.text }]} numberOfLines={1}>{item.product.name}</Text>
                    <Text style={styles.cartItemPrice}>₹{item.product.price.toLocaleString()} · {item.product.pointsPrice} pts</Text>
                  </View>
                  <View style={styles.qtyControls}>
                    <TouchableOpacity onPress={() => handleUpdateQuantity(item.product.id, -1)} style={[styles.qtyBtn, { backgroundColor: isDark ? "#334155" : "#e2e8f0" }]}>
                      <Ionicons name="remove" size={13} color={c.text} />
                    </TouchableOpacity>
                    <Text style={[styles.qtyNum, { color: c.text }]}>{item.quantity}</Text>
                    <TouchableOpacity onPress={() => handleUpdateQuantity(item.product.id, 1)} style={[styles.qtyBtn, { backgroundColor: isDark ? "#334155" : "#e2e8f0" }]}>
                      <Ionicons name="add" size={13} color={c.text} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>

            {cart.length > 0 && (
              <View style={[styles.checkoutBox, { borderTopColor: c.border }]}>
                <View style={styles.totalSummaryRow}>
                  <Text style={[styles.totalLabel, { color: c.sub }]}>Total:</Text>
                  <Text style={[styles.totalValue, { color: c.text }]}>₹{cartTotalCash.toLocaleString()} or {cartTotalPoints.toLocaleString()} pts</Text>
                </View>
                <View style={styles.checkoutBtns}>
                  <TouchableOpacity style={styles.pointsPayBtn} onPress={handleCheckoutPoints}>
                    <Ionicons name="sparkles" size={15} color="#d97706" />
                    <Text style={styles.pointsPayText}>Pay with Points</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.cashPayBtn} onPress={handleCheckoutCash}>
                    <Ionicons name="checkmark-circle" size={15} color="#ffffff" />
                    <Text style={styles.cashPayText}>Buy (₹{cartTotalCash.toLocaleString()})</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  style={styles.viewOrdersLink}
                  onPress={() => { setCartModalVisible(false); navigation.navigate("OrderHistory"); }}
                >
                  <Ionicons name="bag-handle-outline" size={13} color="#059669" />
                  <Text style={styles.viewOrdersText}>View Order History</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* ── Admin Modal ── */}
      <Modal visible={adminModalVisible} transparent animationType="slide" onRequestClose={() => setAdminModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => setAdminModalVisible(false)} />
          <View style={[styles.adminSheet, { backgroundColor: c.card }]}>
            <View style={styles.sheetHandle} />
            <Text style={[styles.adminModalTitle, { color: c.text }]}>Add Product (Admin)</Text>
            <Text style={[styles.adminModalSub, { color: c.sub }]}>Saved to Firestore · Syncs to Web & App instantly</Text>
            <ScrollView style={{ marginBottom: 10 }} showsVerticalScrollIndicator={false}>
              {[
                { label: "Product Name *", value: newProdName, setter: setNewProdName, placeholder: "e.g. Smart ECG Band" },
                { label: "Subtitle", value: newProdSubtitle, setter: setNewProdSubtitle, placeholder: "e.g. AI-powered cardiac analysis" },
                { label: "Image URL (https://...)", value: newProdImageUrl, setter: setNewProdImageUrl, placeholder: "https://images.unsplash.com/..." },
                { label: "Badge Tag", value: newProdBadge, setter: setNewProdBadge, placeholder: "POPULAR" },
              ].map((f) => (
                <View key={f.label}>
                  <Text style={[styles.formLabel, { color: c.sub }]}>{f.label}</Text>
                  <TextInput
                    style={[styles.formInput, { backgroundColor: isDark ? "#0f172a" : "#f8fafc", borderColor: c.border, color: c.text }]}
                    placeholder={f.placeholder} placeholderTextColor="#94a3b8"
                    value={f.value} onChangeText={f.setter}
                  />
                </View>
              ))}
              <View style={{ flexDirection: "row", gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.formLabel, { color: c.sub }]}>Price (₹) *</Text>
                  <TextInput
                    style={[styles.formInput, { backgroundColor: isDark ? "#0f172a" : "#f8fafc", borderColor: c.border, color: c.text }]}
                    placeholder="2499" placeholderTextColor="#94a3b8" keyboardType="numeric"
                    value={newProdPrice} onChangeText={setNewProdPrice}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.formLabel, { color: c.sub }]}>Points Price</Text>
                  <TextInput
                    style={[styles.formInput, { backgroundColor: isDark ? "#0f172a" : "#f8fafc", borderColor: c.border, color: c.text }]}
                    placeholder="2200" placeholderTextColor="#94a3b8" keyboardType="numeric"
                    value={newProdPoints} onChangeText={setNewProdPoints}
                  />
                </View>
              </View>
              <TouchableOpacity style={styles.adminSubmitBtn} onPress={handleCreateProductAdmin} disabled={addingProduct}>
                {addingProduct ? <ActivityIndicator color="#ffffff" /> : (
                  <>
                    <Ionicons name="cloud-upload" size={17} color="#ffffff" />
                    <Text style={styles.adminSubmitText}>Publish to Cloud Store</Text>
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <SamsungBottomNav activeRoute="Shop" />
    </View>
  );
}

// ─── Extracted product card render function ──────────────────────────────────
function renderProductCard(
  item: ShopProduct,
  c: { bg: string; card: string; border: string; text: string; sub: string },
  isDark: boolean,
  cart: CartItem[],
  wishlistIds: string[],
  onAddToCart: (p: ShopProduct) => void,
  onToggleWishlist: (id: string) => void,
  onPress: (id: string) => void,
) {
  const btnColor = item.btnColor || "#0f5132";
  const bagColor = item.bgGradient ? item.bgGradient[0] : "#f0fdf4";
  const inWishlist = wishlistIds.includes(item.id);

  return (
    <TouchableOpacity
      key={item.id}
      style={[styles.productCard, { backgroundColor: c.card, borderColor: c.border }]}
      onPress={() => onPress(item.id)}
      activeOpacity={0.92}
    >
      <View style={[styles.cardImgBox, { backgroundColor: bagColor }]}>
        {item.badge && (
          <View style={[styles.cardBadge, { backgroundColor: item.badgeColor || "#0f5132" }]}>
            <Text style={styles.cardBadgeText}>{item.badge}</Text>
          </View>
        )}
        {item.hasBluetooth && (
          <View style={styles.btBadge}>
            <Ionicons name="bluetooth" size={12} color="#ffffff" />
          </View>
        )}
        {/* Wishlist toggle */}
        <TouchableOpacity
          style={styles.wishIcon}
          onPress={(e) => { e.stopPropagation(); onToggleWishlist(item.id); }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name={inWishlist ? "heart" : "heart-outline"} size={16} color={inWishlist ? "#e11d48" : "#94a3b8"} />
        </TouchableOpacity>
        <Image source={{ uri: item.imageUrl }} style={styles.productImg} resizeMode="cover" />
      </View>

      <View style={styles.cardInfo}>
        <Text style={[styles.prodTitle, { color: c.text }]} numberOfLines={2}>{item.name}</Text>
        <Text style={[styles.prodSub, { color: c.sub }]} numberOfLines={2}>{item.subtitle}</Text>

        <View style={styles.ratingRow}>
          <Ionicons name="star" size={11} color="#f59e0b" />
          <Text style={styles.ratingScore}>{item.rating.toFixed(1)}</Text>
          <Text style={[styles.ratingCount, { color: c.sub }]}>({item.reviewsCount})</Text>
        </View>

        <View style={styles.priceRow}>
          <Text style={[styles.cashPrice, { color: c.text }]}>₹{item.price.toLocaleString()}</Text>
          <View style={styles.ptsPill}>
            <Ionicons name="star" size={9} color="#d97706" />
            <Text style={styles.ptsLabel}>{item.pointsPrice.toLocaleString()} pts</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: btnColor }]}
          onPress={(e) => { e.stopPropagation(); onAddToCart(item); }}
          activeOpacity={0.85}
        >
          <Ionicons name="cart" size={13} color="#ffffff" />
          <Text style={styles.addBtnText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topHeader: {
    paddingTop: 48, paddingHorizontal: 16, paddingBottom: 10,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
  },
  headerLeftRow: { flexDirection: "row", alignItems: "center", flex: 1, gap: 10 },
  logoBadge: {
    width: 38, height: 38, borderRadius: 12,
    alignItems: "center", justifyContent: "center",
    shadowColor: "#059669", shadowOpacity: 0.25, shadowRadius: 5, elevation: 2,
  },
  headerBrand: { fontSize: 11, fontWeight: "700", color: "#059669" },
  headerTitle: { fontSize: 21, fontWeight: "900", letterSpacing: -0.5, marginTop: -2 },
  headerTag: { fontSize: 10, color: "#64748b", marginTop: 1 },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 7 },
  iconBtn: {
    width: 36, height: 36, borderRadius: 18, borderWidth: 1,
    alignItems: "center", justifyContent: "center",
    shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  pointsPill: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 9, paddingVertical: 5, borderRadius: 18, borderWidth: 1,
    shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  goldDot: { width: 16, height: 16, borderRadius: 8, backgroundColor: "#f59e0b", alignItems: "center", justifyContent: "center" },
  pillText: { fontSize: 11, fontWeight: "800" },
  cartBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: "#ffffff", borderWidth: 1.5, borderColor: "#d1fae5",
    alignItems: "center", justifyContent: "center",
    shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  cartBadge: {
    position: "absolute", top: -4, right: -4,
    backgroundColor: "#e11d48", minWidth: 17, height: 17, borderRadius: 9,
    alignItems: "center", justifyContent: "center", paddingHorizontal: 3,
    borderWidth: 1.5, borderColor: "#ffffff",
  },
  cartBadgeText: { color: "#ffffff", fontSize: 9, fontWeight: "800" },
  searchWrap: { paddingHorizontal: 16, marginTop: 4, marginBottom: 10 },
  searchBox: {
    flexDirection: "row", alignItems: "center",
    height: 44, borderRadius: 22, borderWidth: 1,
    paddingHorizontal: 14, shadowColor: "#000", shadowOpacity: 0.03, shadowRadius: 6, elevation: 1,
  },
  searchInput: { flex: 1, fontSize: 13, fontWeight: "500" },
  tabToggle: {
    flexDirection: "row", marginHorizontal: 16, marginBottom: 12,
    borderRadius: 22, borderWidth: 1, overflow: "hidden", padding: 3,
  },
  toggleTab: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, paddingVertical: 8, borderRadius: 18 },
  toggleTabActive: { backgroundColor: "#0f5132" },
  toggleLabel: { fontSize: 13, fontWeight: "700" },
  scrollBody: { paddingHorizontal: 16 },
  flashSection: { borderRadius: 18, borderWidth: 1, padding: 14, marginBottom: 14 },
  flashHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  flashTitleRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  flashTitle: { fontSize: 15, fontWeight: "900", color: "#e11d48" },
  timerRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  timerChip: { backgroundColor: "#0f172a", paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 },
  timerNum: { color: "#ffffff", fontSize: 13, fontWeight: "900", fontVariant: ["tabular-nums"] },
  timerColon: { color: "#e11d48", fontWeight: "900", fontSize: 14 },
  flashScroll: { gap: 10 },
  flashCard: {
    width: 140, borderRadius: 14, borderWidth: 1,
    padding: 10, position: "relative", overflow: "hidden",
  },
  discountBadge: {
    position: "absolute", top: 8, left: 8, zIndex: 2,
    backgroundColor: "#e11d48", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6,
  },
  discountText: { color: "#ffffff", fontSize: 10, fontWeight: "900" },
  flashImg: { width: "100%", height: 90, borderRadius: 10, marginBottom: 6 },
  flashName: { fontSize: 11, fontWeight: "700", marginBottom: 4 },
  flashPriceRow: { flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 6 },
  flashSalePrice: { fontSize: 13, fontWeight: "900" },
  flashOldPrice: { fontSize: 10, color: "#94a3b8", textDecorationLine: "line-through" },
  flashAddBtn: { borderRadius: 8, paddingVertical: 5, alignItems: "center" },
  flashAddBtnText: { color: "#ffffff", fontSize: 11, fontWeight: "800" },
  catScroll: { gap: 8, paddingBottom: 12 },
  catChip: { flexDirection: "row", alignItems: "center", paddingHorizontal: 13, paddingVertical: 7, borderRadius: 20 },
  catLabel: { fontSize: 12, fontWeight: "700" },
  adminBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  countText: { fontSize: 12, fontWeight: "600" },
  adminBtn: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(16,185,129,0.12)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  adminBtnText: { fontSize: 11, fontWeight: "700", color: "#059669" },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  productCard: { width: CARD_W, borderRadius: 18, borderWidth: 1, marginBottom: 14, overflow: "hidden", shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  cardImgBox: { height: 126, width: "100%", position: "relative", alignItems: "center", justifyContent: "center", overflow: "hidden" },
  cardBadge: { position: "absolute", top: 8, left: 8, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6, zIndex: 2 },
  cardBadgeText: { color: "#ffffff", fontSize: 8, fontWeight: "900", letterSpacing: 0.3 },
  btBadge: { position: "absolute", top: 8, right: 32, width: 20, height: 20, borderRadius: 10, backgroundColor: "#0284c7", alignItems: "center", justifyContent: "center", zIndex: 2 },
  wishIcon: { position: "absolute", top: 8, right: 8, zIndex: 3, padding: 2 },
  productImg: { width: "100%", height: "100%" },
  cardInfo: { padding: 10 },
  prodTitle: { fontSize: 13, fontWeight: "800", lineHeight: 17, minHeight: 34 },
  prodSub: { fontSize: 10.5, lineHeight: 14, marginTop: 3, minHeight: 28 },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 3, marginTop: 5 },
  ratingScore: { fontSize: 11, fontWeight: "800", color: "#0f172a" },
  ratingCount: { fontSize: 10 },
  priceRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 7, marginBottom: 7 },
  cashPrice: { fontSize: 15, fontWeight: "900" },
  ptsPill: { flexDirection: "row", alignItems: "center", backgroundColor: "#fef3c7", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10, gap: 3 },
  ptsLabel: { fontSize: 9.5, fontWeight: "800", color: "#b45309" },
  addBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, paddingVertical: 8, borderRadius: 20 },
  addBtnText: { color: "#ffffff", fontSize: 11.5, fontWeight: "800" },
  emptyBox: { alignItems: "center", paddingVertical: 50, gap: 8 },
  emptyTitle: { fontSize: 17, fontWeight: "800", marginTop: 8 },
  emptySub: { fontSize: 13, textAlign: "center", paddingHorizontal: 30, lineHeight: 19 },
  modalOverlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.5)" },
  cartSheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 18, maxHeight: "80%" },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: "#cbd5e1", alignSelf: "center", marginBottom: 14 },
  cartSheetHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  cartSheetTitle: { fontSize: 18, fontWeight: "800" },
  cartRow: { flexDirection: "row", alignItems: "center", paddingVertical: 10, borderBottomWidth: 1, gap: 10 },
  cartThumb: { width: 44, height: 44, borderRadius: 10, backgroundColor: "#f1f5f9" },
  cartItemInfo: { flex: 1 },
  cartItemName: { fontSize: 13, fontWeight: "700" },
  cartItemPrice: { fontSize: 11, color: "#059669", fontWeight: "600", marginTop: 2 },
  qtyControls: { flexDirection: "row", alignItems: "center", gap: 8 },
  qtyBtn: { width: 26, height: 26, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  qtyNum: { fontSize: 13, fontWeight: "800" },
  emptyCartBox: { alignItems: "center", paddingVertical: 30 },
  emptyCartText: { fontSize: 13, marginTop: 8 },
  checkoutBox: { marginTop: 14, paddingTop: 12, borderTopWidth: 1 },
  totalSummaryRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  totalLabel: { fontSize: 13, fontWeight: "600" },
  totalValue: { fontSize: 14, fontWeight: "800" },
  checkoutBtns: { flexDirection: "row", gap: 10 },
  pointsPayBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#fef3c7", borderWidth: 1, borderColor: "#fde68a", paddingVertical: 12, borderRadius: 14, gap: 5 },
  pointsPayText: { fontSize: 12, fontWeight: "800", color: "#b45309" },
  cashPayBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#0f5132", paddingVertical: 12, borderRadius: 14, gap: 5 },
  cashPayText: { fontSize: 12, fontWeight: "800", color: "#ffffff" },
  viewOrdersLink: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, marginTop: 12 },
  viewOrdersText: { fontSize: 12, fontWeight: "700", color: "#059669" },
  adminSheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 18, maxHeight: "86%" },
  adminModalTitle: { fontSize: 18, fontWeight: "800", marginBottom: 2 },
  adminModalSub: { fontSize: 12, marginBottom: 14 },
  formLabel: { fontSize: 12, fontWeight: "700", marginBottom: 4, marginTop: 8 },
  formInput: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 9, fontSize: 13, fontWeight: "500" },
  adminSubmitBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#059669", paddingVertical: 13, borderRadius: 14, marginTop: 18, marginBottom: 20, gap: 6 },
  adminSubmitText: { color: "#ffffff", fontSize: 14, fontWeight: "800" },
});
