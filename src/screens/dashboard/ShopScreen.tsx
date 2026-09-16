import React, { useState, useEffect } from "react";
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
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/types";
import SamsungBottomNav from "@/components/SamsungBottomNav";
import { useTheme } from "@/context/ThemeContext";
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

type Props = NativeStackScreenProps<RootStackParamList, "Shop">;

const { width: SW } = Dimensions.get("window");
const CARD_W = (SW - 32 - 12) / 2;

const CATEGORIES: { label: ShopCategory; icon: string }[] = [
  { label: "All", icon: "leaf" },
  { label: "Health", icon: "heart" },
  { label: "Fitness", icon: "barbell" },
  { label: "Wellness", icon: "flower" },
  { label: "Tools", icon: "construct" },
  { label: "More", icon: "grid" },
];

export default function ShopScreen({ navigation }: Props) {
  const { isDark } = useTheme();

  const [products, setProducts] = useState<ShopProduct[]>(DEFAULT_SHOP_PRODUCTS);
  const [selectedCategory, setSelectedCategory] = useState<ShopCategory>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [userPoints, setUserPoints] = useState(1250);
  const [cart, setCart] = useState<CartItem[]>([
    { product: DEFAULT_SHOP_PRODUCTS[0], quantity: 1 },
    { product: DEFAULT_SHOP_PRODUCTS[1], quantity: 1 },
    { product: DEFAULT_SHOP_PRODUCTS[2], quantity: 1 },
  ]);

  const [cartModalVisible, setCartModalVisible] = useState(false);
  const [adminModalVisible, setAdminModalVisible] = useState(false);

  // Admin New Product State
  const [newProdName, setNewProdName] = useState("");
  const [newProdCategory, setNewProdCategory] = useState<ShopCategory>("Health");
  const [newProdPrice, setNewProdPrice] = useState("");
  const [newProdPoints, setNewProdPoints] = useState("");
  const [newProdSubtitle, setNewProdSubtitle] = useState("");
  const [newProdBadge, setNewProdBadge] = useState("NEW ARRIVAL");
  const [newProdImageUrl, setNewProdImageUrl] = useState("");
  const [addingProduct, setAddingProduct] = useState(false);

  // Subscribe to real-time shop products from Firestore
  useEffect(() => {
    const unsubscribe = subscribeToShopProducts((updatedList) => {
      if (updatedList && updatedList.length > 0) {
        setProducts(updatedList);
      }
    });

    getSavedCart().then((saved) => {
      if (saved && saved.length > 0) {
        setCart(saved);
      }
    });

    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, []);

  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

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
    Alert.alert("Added to Cart", `${product.name} has been added to your cart!`);
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    let updated = cart
      .map((item) => {
        if (item.product.id === productId) {
          return { ...item, quantity: item.quantity + delta };
        }
        return item;
      })
      .filter((item) => item.quantity > 0);

    setCart(updated);
    saveUserCart(updated);
  };

  const cartTotalCash = cart.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );
  const cartTotalPoints = cart.reduce(
    (acc, item) => acc + item.product.pointsPrice * item.quantity,
    0
  );

  const handleCheckoutCash = () => {
    if (cart.length === 0) return;
    Alert.alert(
      "Confirm Order",
      `Proceed to checkout with ₹${cartTotalCash.toLocaleString()} for ${totalCartCount} item(s)?\n\nDelivery address: Home\nPayment: Cash / UPI on delivery.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Place Order",
          onPress: () => {
            const earned = Math.round(cartTotalCash * 0.05);
            setUserPoints((prev) => prev + earned);
            setCart([]);
            saveUserCart([]);
            setCartModalVisible(false);
            Alert.alert(
              "Order Placed Successfully! 🎉",
              `Your items will be delivered in 2 business days.\nYou earned +${earned} Urban Points for this order!`
            );
          },
        },
      ]
    );
  };

  const handleCheckoutPoints = () => {
    if (cart.length === 0) return;
    if (userPoints < cartTotalPoints) {
      Alert.alert(
        "Insufficient Points",
        `You have ${userPoints.toLocaleString()} pts. This cart requires ${cartTotalPoints.toLocaleString()} pts.\n\nEarn more points by logging steps, workouts, and vitals!`
      );
      return;
    }

    Alert.alert(
      "Redeem with Points",
      `Redeem ${totalCartCount} item(s) using ${cartTotalPoints.toLocaleString()} points? (₹0 Cash required)`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Redeem Now",
          onPress: () => {
            setUserPoints((prev) => prev - cartTotalPoints);
            setCart([]);
            saveUserCart([]);
            setCartModalVisible(false);
            Alert.alert("Items Redeemed! 🎁", "Your products have been ordered with reward points.");
          },
        },
      ]
    );
  };

  const handleCreateProductAdmin = async () => {
    if (!newProdName.trim() || !newProdPrice.trim()) {
      Alert.alert("Required Fields", "Please enter product name and price.");
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
        price: priceNum,
        pointsPrice: ptsNum,
        rating: 4.9,
        reviewsCount: 1,
        badge: newProdBadge.trim() || undefined,
        badgeColor: "#0f5132",
        btnColor: "#0f5132",
        imageUrl: newProdImageUrl.trim() || "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&q=80",
        bgGradient: ["#ebf7ee", "#d8f3e0"],
        inStock: true,
      });

      setNewProdName("");
      setNewProdSubtitle("");
      setNewProdPrice("");
      setNewProdPoints("");
      setNewProdImageUrl("");
      setAdminModalVisible(false);
      Alert.alert("Success", "New product added to Firestore! It will sync across all web and app users.");
    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed to add product");
    } finally {
      setAddingProduct(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      selectedCategory === "All" ||
      p.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      !searchQuery.trim() ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.subtitle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <View style={[styles.root, { backgroundColor: isDark ? "#0c111d" : "#f4f8f5" }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* ── Top Header matching Reference ── */}
      <View style={[styles.topHeader, { backgroundColor: isDark ? "#0c111d" : "#f4f8f5" }]}>
        <View style={styles.headerLeftRow}>
          <LinearGradient
            colors={["#10b981", "#059669"]}
            style={styles.logoBadge}
          >
            <Ionicons name="leaf" size={20} color="#ffffff" />
          </LinearGradient>

          <View style={styles.headerTitleCol}>
            <Text style={styles.headerBrandText}>Urban Helpers</Text>
            <Text style={[styles.headerMainTitle, { color: isDark ? "#ffffff" : "#0f172a" }]}>
              Urban Shop
            </Text>
            <Text style={styles.headerTagline}>
              Better Health • Smarter Living • More Value
            </Text>
          </View>
        </View>

        <View style={styles.headerRightRow}>
          {/* Points Pill */}
          <TouchableOpacity
            style={[
              styles.pointsPill,
              {
                backgroundColor: isDark ? "#1e293b" : "#ffffff",
                borderColor: isDark ? "#334155" : "#e2e8f0",
              },
            ]}
            onPress={() => navigation.navigate("Points")}
            activeOpacity={0.8}
          >
            <View style={styles.goldCoinIcon}>
              <Ionicons name="star" size={11} color="#ffffff" />
            </View>
            <Text style={[styles.pointsPillText, { color: isDark ? "#f8fafc" : "#0f172a" }]}>
              {userPoints.toLocaleString()} pts
            </Text>
            <Ionicons name="chevron-forward" size={12} color="#94a3b8" />
          </TouchableOpacity>

          {/* Cart Icon Button */}
          <TouchableOpacity
            style={styles.cartBtn}
            onPress={() => setCartModalVisible(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="cart-outline" size={20} color="#0f5132" />
            {totalCartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{totalCartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Search Bar ── */}
      <View style={styles.searchBarWrap}>
        <View
          style={[
            styles.searchContainer,
            {
              backgroundColor: isDark ? "#1e293b" : "#ffffff",
              borderColor: isDark ? "#334155" : "#e2e8f0",
            },
          ]}
        >
          <Ionicons name="search" size={18} color="#64748b" style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: isDark ? "#ffffff" : "#0f172a" }]}
            placeholder="Search products, offers, and more..."
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

      {/* ── Category Chips ── */}
      <View style={styles.categoriesContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScroll}
        >
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.label;
            return (
              <TouchableOpacity
                key={cat.label}
                onPress={() => setSelectedCategory(cat.label)}
                style={[
                  styles.categoryChip,
                  isSelected
                    ? styles.categoryChipActive
                    : [
                        styles.categoryChipInactive,
                        {
                          backgroundColor: isDark ? "#1e293b" : "#ffffff",
                          borderColor: isDark ? "#334155" : "#e2e8f0",
                        },
                      ],
                ]}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={cat.icon as any}
                  size={14}
                  color={isSelected ? "#ffffff" : (isDark ? "#94a3b8" : "#0f5132")}
                  style={{ marginRight: 5 }}
                />
                <Text
                  style={[
                    styles.categoryChipText,
                    isSelected
                      ? styles.categoryChipTextActive
                      : [
                          styles.categoryChipTextInactive,
                          { color: isDark ? "#cbd5e1" : "#334155" },
                        ],
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ── Products Grid ── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollGridContent}
      >
        {/* Admin Quick Action Banner */}
        <View style={styles.adminBarRow}>
          <Text style={[styles.productsCountText, { color: isDark ? "#94a3b8" : "#64748b" }]}>
            Showing {filteredProducts.length} health products
          </Text>
          <TouchableOpacity
            style={styles.adminAddBtn}
            onPress={() => setAdminModalVisible(true)}
          >
            <Ionicons name="add-circle" size={15} color="#059669" />
            <Text style={styles.adminAddBtnText}>+ Add Item (Admin)</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.gridContainer}>
          {filteredProducts.map((item) => {
            const btnColor = item.btnColor || "#0f5132";
            const badgeBg = item.badgeColor || "#0f5132";

            return (
              <View
                key={item.id}
                style={[
                  styles.productCard,
                  {
                    backgroundColor: isDark ? "#1e293b" : "#ffffff",
                    borderColor: isDark ? "#334155" : "#eef2f6",
                  },
                ]}
              >
                {/* Image & Badges Container */}
                <View
                  style={[
                    styles.cardImageContainer,
                    { backgroundColor: item.bgGradient ? item.bgGradient[0] : "#f1f5f9" },
                  ]}
                >
                  {item.badge && (
                    <View style={[styles.badgeTag, { backgroundColor: badgeBg }]}>
                      <Text style={styles.badgeTagText}>{item.badge}</Text>
                    </View>
                  )}

                  {item.hasBluetooth && (
                    <View style={styles.bluetoothBadge}>
                      <Ionicons name="bluetooth" size={13} color="#ffffff" />
                    </View>
                  )}

                  <Image
                    source={{ uri: item.imageUrl }}
                    style={styles.productImg}
                    resizeMode="cover"
                  />
                </View>

                {/* Card Info */}
                <View style={styles.cardInfo}>
                  <Text
                    style={[styles.productTitle, { color: isDark ? "#f8fafc" : "#0f172a" }]}
                    numberOfLines={2}
                  >
                    {item.name}
                  </Text>

                  <Text style={styles.productSubtitle} numberOfLines={2}>
                    {item.subtitle}
                  </Text>

                  {/* Rating */}
                  <View style={styles.ratingRow}>
                    <Ionicons name="star" size={12} color="#f59e0b" />
                    <Text style={styles.ratingScore}>{item.rating.toFixed(1)}</Text>
                    <Text style={styles.ratingReviews}>({item.reviewsCount})</Text>
                  </View>

                  {/* Price Row */}
                  <View style={styles.priceRow}>
                    <Text style={[styles.cashPrice, { color: isDark ? "#ffffff" : "#0f172a" }]}>
                      ₹{item.price.toLocaleString()}
                    </Text>

                    <View style={styles.pointsPriceTag}>
                      <Ionicons name="star" size={10} color="#d97706" />
                      <Text style={styles.pointsPriceText}>
                        {item.pointsPrice.toLocaleString()} pts
                      </Text>
                    </View>
                  </View>

                  {/* Add to Cart Button */}
                  <TouchableOpacity
                    style={[styles.addToCartBtn, { backgroundColor: btnColor }]}
                    onPress={() => handleAddToCart(item)}
                    activeOpacity={0.85}
                  >
                    <Ionicons name="cart" size={14} color="#ffffff" />
                    <Text style={styles.addToCartBtnText}>Add to Cart</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>

        {filteredProducts.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={48} color="#94a3b8" />
            <Text style={[styles.emptyStateTitle, { color: isDark ? "#ffffff" : "#0f172a" }]}>
              No products found
            </Text>
            <Text style={styles.emptyStateSub}>
              Try searching with a different term or change category filter.
            </Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ── Cart Sheet Modal ── */}
      <Modal
        visible={cartModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCartModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            onPress={() => setCartModalVisible(false)}
          />

          <View
            style={[
              styles.cartSheetContainer,
              { backgroundColor: isDark ? "#1e293b" : "#ffffff" },
            ]}
          >
            <View style={styles.modalHandle} />

            <View style={styles.cartSheetHeader}>
              <Text style={[styles.cartSheetTitle, { color: isDark ? "#ffffff" : "#0f172a" }]}>
                Shopping Cart ({totalCartCount})
              </Text>
              <TouchableOpacity onPress={() => setCartModalVisible(false)}>
                <Ionicons name="close-circle" size={24} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.cartItemsList} showsVerticalScrollIndicator={false}>
              {cart.map((item) => (
                <View
                  key={item.product.id}
                  style={[
                    styles.cartItemRow,
                    { borderBottomColor: isDark ? "#334155" : "#e2e8f0" },
                  ]}
                >
                  <Image source={{ uri: item.product.imageUrl }} style={styles.cartThumb} />

                  <View style={styles.cartItemInfo}>
                    <Text
                      style={[styles.cartItemName, { color: isDark ? "#ffffff" : "#0f172a" }]}
                      numberOfLines={1}
                    >
                      {item.product.name}
                    </Text>
                    <Text style={styles.cartItemPrice}>
                      ₹{item.product.price.toLocaleString()} • {item.product.pointsPrice} pts
                    </Text>
                  </View>

                  <View style={styles.quantityControls}>
                    <TouchableOpacity
                      onPress={() => handleUpdateQuantity(item.product.id, -1)}
                      style={[styles.qtyBtn, { backgroundColor: isDark ? "#334155" : "#e2e8f0" }]}
                    >
                      <Ionicons name="remove" size={14} color={isDark ? "#ffffff" : "#0f172a"} />
                    </TouchableOpacity>

                    <Text style={[styles.qtyText, { color: isDark ? "#ffffff" : "#0f172a" }]}>
                      {item.quantity}
                    </Text>

                    <TouchableOpacity
                      onPress={() => handleUpdateQuantity(item.product.id, 1)}
                      style={[styles.qtyBtn, { backgroundColor: isDark ? "#334155" : "#e2e8f0" }]}
                    >
                      <Ionicons name="add" size={14} color={isDark ? "#ffffff" : "#0f172a"} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

              {cart.length === 0 && (
                <View style={styles.emptyCartBox}>
                  <Ionicons name="cart-outline" size={40} color="#94a3b8" />
                  <Text style={[styles.emptyCartText, { color: isDark ? "#94a3b8" : "#64748b" }]}>
                    Your shopping cart is empty
                  </Text>
                </View>
              )}
            </ScrollView>

            {cart.length > 0 && (
              <View style={styles.cartCheckoutBox}>
                <View style={styles.cartSummaryRow}>
                  <Text style={[styles.summaryLabel, { color: isDark ? "#94a3b8" : "#64748b" }]}>
                    Total Value:
                  </Text>
                  <Text style={[styles.summaryValue, { color: isDark ? "#ffffff" : "#0f172a" }]}>
                    ₹{cartTotalCash.toLocaleString()} or {cartTotalPoints.toLocaleString()} pts
                  </Text>
                </View>

                <View style={styles.checkoutBtnsRow}>
                  <TouchableOpacity
                    style={styles.pointsCheckoutBtn}
                    onPress={handleCheckoutPoints}
                  >
                    <Ionicons name="sparkles" size={16} color="#d97706" />
                    <Text style={styles.pointsCheckoutBtnText}>Pay with Points</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.cashCheckoutBtn}
                    onPress={handleCheckoutCash}
                  >
                    <Ionicons name="checkmark-circle" size={16} color="#ffffff" />
                    <Text style={styles.cashCheckoutBtnText}>Buy (₹{cartTotalCash})</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* ── Admin Add Product Modal ── */}
      <Modal
        visible={adminModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setAdminModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            onPress={() => setAdminModalVisible(false)}
          />

          <View
            style={[
              styles.adminSheetContainer,
              { backgroundColor: isDark ? "#1e293b" : "#ffffff" },
            ]}
          >
            <View style={styles.modalHandle} />
            <Text style={[styles.adminModalTitle, { color: isDark ? "#ffffff" : "#0f172a" }]}>
              Add Product to Shop (Admin)
            </Text>
            <Text style={styles.adminModalSubtitle}>
              Items added here are saved to Firebase Firestore and sync instantly to Web & Mobile!
            </Text>

            <ScrollView style={styles.adminFormScroll} showsVerticalScrollIndicator={false}>
              <Text style={styles.formLabel}>Product Name *</Text>
              <TextInput
                style={[
                  styles.formInput,
                  {
                    backgroundColor: isDark ? "#0f172a" : "#f8fafc",
                    borderColor: isDark ? "#334155" : "#cbd5e1",
                    color: isDark ? "#ffffff" : "#0f172a",
                  },
                ]}
                placeholder="e.g. Smart ECG Heart Rate Band"
                placeholderTextColor="#94a3b8"
                value={newProdName}
                onChangeText={setNewProdName}
              />

              <Text style={styles.formLabel}>Subtitle / Highlights</Text>
              <TextInput
                style={[
                  styles.formInput,
                  {
                    backgroundColor: isDark ? "#0f172a" : "#f8fafc",
                    borderColor: isDark ? "#334155" : "#cbd5e1",
                    color: isDark ? "#ffffff" : "#0f172a",
                  },
                ]}
                placeholder="e.g. 24/7 Optical sensor with AI cardio analysis"
                placeholderTextColor="#94a3b8"
                value={newProdSubtitle}
                onChangeText={setNewProdSubtitle}
              />

              <View style={styles.formRow2}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.formLabel}>Price (₹) *</Text>
                  <TextInput
                    style={[
                      styles.formInput,
                      {
                        backgroundColor: isDark ? "#0f172a" : "#f8fafc",
                        borderColor: isDark ? "#334155" : "#cbd5e1",
                        color: isDark ? "#ffffff" : "#0f172a",
                      },
                    ]}
                    placeholder="2499"
                    placeholderTextColor="#94a3b8"
                    keyboardType="numeric"
                    value={newProdPrice}
                    onChangeText={setNewProdPrice}
                  />
                </View>

                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={styles.formLabel}>Points Price (pts)</Text>
                  <TextInput
                    style={[
                      styles.formInput,
                      {
                        backgroundColor: isDark ? "#0f172a" : "#f8fafc",
                        borderColor: isDark ? "#334155" : "#cbd5e1",
                        color: isDark ? "#ffffff" : "#0f172a",
                      },
                    ]}
                    placeholder="2200"
                    placeholderTextColor="#94a3b8"
                    keyboardType="numeric"
                    value={newProdPoints}
                    onChangeText={setNewProdPoints}
                  />
                </View>
              </View>

              <Text style={styles.formLabel}>Badge Tag</Text>
              <TextInput
                style={[
                  styles.formInput,
                  {
                    backgroundColor: isDark ? "#0f172a" : "#f8fafc",
                    borderColor: isDark ? "#334155" : "#cbd5e1",
                    color: isDark ? "#ffffff" : "#0f172a",
                  },
                ]}
                placeholder="e.g. CLINICAL GRADE, SYNC COMPATIBLE, POPULAR"
                placeholderTextColor="#94a3b8"
                value={newProdBadge}
                onChangeText={setNewProdBadge}
              />

              <Text style={styles.formLabel}>Image Web URL (HTTPS)</Text>
              <TextInput
                style={[
                  styles.formInput,
                  {
                    backgroundColor: isDark ? "#0f172a" : "#f8fafc",
                    borderColor: isDark ? "#334155" : "#cbd5e1",
                    color: isDark ? "#ffffff" : "#0f172a",
                  },
                ]}
                placeholder="https://images.unsplash.com/photo-..."
                placeholderTextColor="#94a3b8"
                value={newProdImageUrl}
                onChangeText={setNewProdImageUrl}
              />

              <TouchableOpacity
                style={styles.adminSubmitBtn}
                onPress={handleCreateProductAdmin}
                disabled={addingProduct}
              >
                {addingProduct ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <>
                    <Ionicons name="cloud-upload" size={18} color="#ffffff" />
                    <Text style={styles.adminSubmitBtnText}>Publish to Cloud Store</Text>
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── Persistent Bottom Nav ── */}
      <SamsungBottomNav activeRoute="Shop" />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  topHeader: {
    paddingTop: 48,
    paddingHorizontal: 16,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeftRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  logoBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    shadowColor: "#059669",
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 2,
  },
  headerTitleCol: {
    justifyContent: "center",
  },
  headerBrandText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#059669",
    letterSpacing: 0.3,
  },
  headerMainTitle: {
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: -0.5,
    marginTop: -2,
  },
  headerTagline: {
    fontSize: 10,
    fontWeight: "500",
    color: "#64748b",
    marginTop: 1,
  },
  headerRightRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  pointsPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    gap: 5,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  goldCoinIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#f59e0b",
    alignItems: "center",
    justifyContent: "center",
  },
  pointsPillText: {
    fontSize: 12,
    fontWeight: "800",
  },
  cartBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#ffffff",
    borderWidth: 1.5,
    borderColor: "#d1fae5",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cartBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#e11d48",
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: "#ffffff",
  },
  cartBadgeText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "800",
  },
  searchBarWrap: {
    paddingHorizontal: 16,
    marginTop: 6,
    marginBottom: 10,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 14,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    fontWeight: "500",
  },
  categoriesContainer: {
    marginBottom: 12,
  },
  categoriesScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  categoryChipActive: {
    backgroundColor: "#0f5132",
    shadowColor: "#0f5132",
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 2,
  },
  categoryChipInactive: {
    borderWidth: 1,
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: "700",
  },
  categoryChipTextActive: {
    color: "#ffffff",
  },
  categoryChipTextInactive: {},
  scrollGridContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  adminBarRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  productsCountText: {
    fontSize: 12,
    fontWeight: "600",
  },
  adminAddBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(16, 185, 129, 0.12)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  adminAddBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#059669",
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  productCard: {
    width: CARD_W,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 14,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardImageContainer: {
    height: 126,
    width: "100%",
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  productImg: {
    width: "100%",
    height: "100%",
  },
  badgeTag: {
    position: "absolute",
    top: 8,
    left: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    zIndex: 2,
  },
  badgeTagText: {
    color: "#ffffff",
    fontSize: 8.5,
    fontWeight: "900",
    letterSpacing: 0.4,
  },
  bluetoothBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#0284c7",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  cardInfo: {
    padding: 10,
  },
  productTitle: {
    fontSize: 13.5,
    fontWeight: "800",
    lineHeight: 17,
    minHeight: 34,
  },
  productSubtitle: {
    fontSize: 10.5,
    color: "#64748b",
    lineHeight: 14,
    marginTop: 3,
    minHeight: 28,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginTop: 6,
  },
  ratingScore: {
    fontSize: 11,
    fontWeight: "800",
    color: "#0f172a",
  },
  ratingReviews: {
    fontSize: 10,
    color: "#94a3b8",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
    marginBottom: 8,
  },
  cashPrice: {
    fontSize: 15,
    fontWeight: "900",
  },
  pointsPriceTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef3c7",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 3,
  },
  pointsPriceText: {
    fontSize: 9.5,
    fontWeight: "800",
    color: "#b45309",
  },
  addToCartBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addToCartBtnText: {
    color: "#ffffff",
    fontSize: 11.5,
    fontWeight: "800",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 12,
  },
  emptyStateSub: {
    fontSize: 13,
    color: "#94a3b8",
    textAlign: "center",
    marginTop: 4,
    paddingHorizontal: 30,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalBackdrop: {
    flex: 1,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#cbd5e1",
    alignSelf: "center",
    marginBottom: 14,
  },
  cartSheetContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 18,
    maxHeight: "80%",
  },
  cartSheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  cartSheetTitle: {
    fontSize: 18,
    fontWeight: "800",
  },
  cartItemsList: {
    maxHeight: 280,
  },
  cartItemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  cartThumb: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: "#f1f5f9",
  },
  cartItemInfo: {
    flex: 1,
    marginLeft: 10,
  },
  cartItemName: {
    fontSize: 13,
    fontWeight: "700",
  },
  cartItemPrice: {
    fontSize: 11,
    color: "#059669",
    fontWeight: "600",
    marginTop: 2,
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  qtyBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyText: {
    fontSize: 13,
    fontWeight: "800",
  },
  emptyCartBox: {
    alignItems: "center",
    paddingVertical: 30,
  },
  emptyCartText: {
    fontSize: 13,
    marginTop: 8,
  },
  cartCheckoutBox: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(100, 116, 139, 0.15)",
  },
  cartSummaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: "800",
  },
  checkoutBtnsRow: {
    flexDirection: "row",
    gap: 10,
  },
  pointsCheckoutBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fef3c7",
    borderWidth: 1,
    borderColor: "#fde68a",
    paddingVertical: 12,
    borderRadius: 14,
    gap: 6,
  },
  pointsCheckoutBtnText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#b45309",
  },
  cashCheckoutBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0f5132",
    paddingVertical: 12,
    borderRadius: 14,
    gap: 6,
  },
  cashCheckoutBtnText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#ffffff",
  },
  adminSheetContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 18,
    maxHeight: "85%",
  },
  adminModalTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 2,
  },
  adminModalSubtitle: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 14,
  },
  adminFormScroll: {
    marginBottom: 10,
  },
  formLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748b",
    marginBottom: 4,
    marginTop: 8,
  },
  formInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    fontWeight: "500",
  },
  formRow2: {
    flexDirection: "row",
    alignItems: "center",
  },
  adminSubmitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#059669",
    paddingVertical: 13,
    borderRadius: 14,
    marginTop: 18,
    marginBottom: 20,
    gap: 6,
  },
  adminSubmitBtnText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "800",
  },
});
