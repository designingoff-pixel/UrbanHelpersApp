import React, { useState, useEffect } from "react";
import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/types";
import { useTheme } from "@/context/ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Props = NativeStackScreenProps<RootStackParamList, "OrderHistory">;
const { width: SW } = Dimensions.get("window");

const ORDER_HISTORY_KEY = "@urban_shop_order_history_v1";

export interface OrderRecord {
  id: string;
  items: { name: string; imageUrl?: string; quantity: number; price: number }[];
  totalCash: number;
  totalPoints: number;
  paymentMethod: "cash" | "points";
  status: "delivered" | "processing" | "shipped" | "cancelled";
  createdAt: string;
  pointsEarned?: number;
}

const STATUS_META: Record<string, { color: string; icon: string; label: string }> = {
  delivered:  { color: "#10b981", icon: "checkmark-circle",  label: "Delivered"  },
  processing: { color: "#f59e0b", icon: "time",              label: "Processing" },
  shipped:    { color: "#6366f1", icon: "airplane",          label: "Shipped"    },
  cancelled:  { color: "#e11d48", icon: "close-circle",      label: "Cancelled"  },
};

// Seed demo orders if none exist
const DEMO_ORDERS: OrderRecord[] = [
  {
    id: "ord-001",
    items: [
      { name: "Smart Body Composition Scale", imageUrl: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=200&q=80", quantity: 1, price: 2999 },
    ],
    totalCash: 2999,
    totalPoints: 2800,
    paymentMethod: "cash",
    status: "delivered",
    createdAt: "Sep 10, 2026",
    pointsEarned: 150,
  },
  {
    id: "ord-002",
    items: [
      { name: "Herbal Detox & Cleanse Pack", imageUrl: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=200&q=80", quantity: 2, price: 1299 },
    ],
    totalCash: 2598,
    totalPoints: 2400,
    paymentMethod: "points",
    status: "shipped",
    createdAt: "Sep 14, 2026",
  },
  {
    id: "ord-003",
    items: [
      { name: "Orthopedic Yoga & Pilates Mat", imageUrl: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=200&q=80", quantity: 1, price: 1499 },
      { name: "Sonic Smart Electric Toothbrush", imageUrl: "https://images.unsplash.com/photo-1559591937-e1032c5453e0?w=200&q=80", quantity: 1, price: 1899 },
    ],
    totalCash: 3398,
    totalPoints: 3150,
    paymentMethod: "cash",
    status: "processing",
    createdAt: "Sep 16, 2026",
    pointsEarned: 170,
  },
];

export default function OrderHistoryScreen({ navigation }: Props) {
  const { isDark } = useTheme();
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [filter, setFilter] = useState<"all" | "delivered" | "processing" | "shipped" | "cancelled">("all");

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const raw = await AsyncStorage.getItem(ORDER_HISTORY_KEY);
      if (raw) {
        const parsed: OrderRecord[] = JSON.parse(raw);
        if (parsed.length > 0) { setOrders(parsed); return; }
      }
    } catch (_) {}
    // Seed demo
    await AsyncStorage.setItem(ORDER_HISTORY_KEY, JSON.stringify(DEMO_ORDERS));
    setOrders(DEMO_ORDERS);
  };

  const c = {
    bg: isDark ? "#0c111d" : "#f4f8f5",
    card: isDark ? "#1e293b" : "#ffffff",
    border: isDark ? "#334155" : "#e2e8f0",
    text: isDark ? "#f8fafc" : "#0f172a",
    sub: isDark ? "#94a3b8" : "#64748b",
  };

  const filters: typeof filter[] = ["all", "processing", "shipped", "delivered", "cancelled"];
  const displayed = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <View style={[styles.root, { backgroundColor: c.bg }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* Header */}
      <LinearGradient colors={["#0f5132", "#059669"]} style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color="#ffffff" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>My Orders</Text>
          <Text style={styles.headerSub}>{orders.length} total orders</Text>
        </View>
        <View style={[styles.orderIcon, { backgroundColor: "rgba(255,255,255,0.15)" }]}>
          <Ionicons name="bag-handle" size={22} color="#ffffff" />
        </View>
      </LinearGradient>

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContent}
      >
        {filters.map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => setFilter(f)}
            style={[
              styles.filterChip,
              filter === f
                ? { backgroundColor: "#0f5132" }
                : { backgroundColor: c.card, borderColor: c.border, borderWidth: 1 },
            ]}
          >
            <Text style={[styles.filterLabel, { color: filter === f ? "#ffffff" : c.sub }]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>
        {displayed.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="bag-outline" size={52} color="#94a3b8" />
            <Text style={[styles.emptyTitle, { color: c.text }]}>No Orders Yet</Text>
            <Text style={[styles.emptySub, { color: c.sub }]}>
              Your Urban Shop orders will appear here.
            </Text>
            <TouchableOpacity
              style={styles.shopNowBtn}
              onPress={() => navigation.navigate("Shop")}
            >
              <Text style={styles.shopNowText}>Shop Now</Text>
            </TouchableOpacity>
          </View>
        ) : (
          displayed.map((order) => {
            const meta = STATUS_META[order.status];
            return (
              <View key={order.id} style={[styles.orderCard, { backgroundColor: c.card, borderColor: c.border }]}>
                {/* Order header */}
                <View style={styles.orderTopRow}>
                  <View>
                    <Text style={[styles.orderId, { color: c.sub }]}>Order #{order.id.replace("ord-", "")}</Text>
                    <Text style={[styles.orderDate, { color: c.text }]}>{order.createdAt}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: meta.color + "22" }]}>
                    <Ionicons name={meta.icon as any} size={12} color={meta.color} />
                    <Text style={[styles.statusText, { color: meta.color }]}>{meta.label}</Text>
                  </View>
                </View>

                {/* Items */}
                {order.items.map((item, idx) => (
                  <View key={idx} style={[styles.itemRow, { borderTopColor: c.border }]}>
                    {item.imageUrl ? (
                      <Image source={{ uri: item.imageUrl }} style={styles.itemThumb} />
                    ) : (
                      <View style={[styles.itemThumb, { backgroundColor: c.border }]} />
                    )}
                    <View style={styles.itemInfo}>
                      <Text style={[styles.itemName, { color: c.text }]} numberOfLines={1}>{item.name}</Text>
                      <Text style={[styles.itemQty, { color: c.sub }]}>Qty: {item.quantity} × ₹{item.price.toLocaleString()}</Text>
                    </View>
                    <Text style={[styles.itemTotal, { color: c.text }]}>₹{(item.quantity * item.price).toLocaleString()}</Text>
                  </View>
                ))}

                {/* Footer */}
                <View style={[styles.orderFooter, { borderTopColor: c.border }]}>
                  <View>
                    <Text style={[styles.footerLabel, { color: c.sub }]}>
                      Paid with {order.paymentMethod === "points" ? "Urban Points" : "Cash / UPI"}
                    </Text>
                    {order.pointsEarned && (
                      <Text style={styles.pointsEarned}>+{order.pointsEarned} pts earned 🌟</Text>
                    )}
                  </View>
                  <Text style={[styles.totalAmount, { color: c.text }]}>
                    {order.paymentMethod === "points"
                      ? `${order.totalPoints.toLocaleString()} pts`
                      : `₹${order.totalCash.toLocaleString()}`}
                  </Text>
                </View>

                {/* Reorder button */}
                {order.status === "delivered" && (
                  <TouchableOpacity
                    style={styles.reorderBtn}
                    onPress={() => navigation.navigate("Shop")}
                  >
                    <Ionicons name="refresh" size={14} color="#059669" />
                    <Text style={styles.reorderText}>Reorder</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 52,
    paddingBottom: 18,
    paddingHorizontal: 16,
    gap: 12,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center", justifyContent: "center",
  },
  headerTitle: { color: "#ffffff", fontSize: 20, fontWeight: "900" },
  headerSub: { color: "rgba(255,255,255,0.7)", fontSize: 12, marginTop: 1 },
  orderIcon: { marginLeft: "auto", width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  filterScroll: { maxHeight: 52 },
  filterContent: { paddingHorizontal: 14, paddingVertical: 10, gap: 8 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  filterLabel: { fontSize: 12, fontWeight: "700" },
  body: { padding: 14, gap: 14 },
  emptyBox: { alignItems: "center", paddingTop: 60, gap: 8 },
  emptyTitle: { fontSize: 18, fontWeight: "800", marginTop: 8 },
  emptySub: { fontSize: 13, textAlign: "center", paddingHorizontal: 30 },
  shopNowBtn: { marginTop: 12, backgroundColor: "#0f5132", paddingHorizontal: 28, paddingVertical: 12, borderRadius: 20 },
  shopNowText: { color: "#ffffff", fontWeight: "800", fontSize: 14 },
  orderCard: { borderRadius: 18, borderWidth: 1, overflow: "hidden" },
  orderTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", padding: 14 },
  orderId: { fontSize: 11, fontWeight: "600", marginBottom: 2 },
  orderDate: { fontSize: 14, fontWeight: "700" },
  statusBadge: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  statusText: { fontSize: 11, fontWeight: "800" },
  itemRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingVertical: 10, borderTopWidth: 1 },
  itemThumb: { width: 44, height: 44, borderRadius: 10 },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 13, fontWeight: "700" },
  itemQty: { fontSize: 11, marginTop: 2 },
  itemTotal: { fontSize: 13, fontWeight: "800" },
  orderFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 14, borderTopWidth: 1 },
  footerLabel: { fontSize: 11 },
  pointsEarned: { fontSize: 12, fontWeight: "700", color: "#d97706", marginTop: 2 },
  totalAmount: { fontSize: 16, fontWeight: "900" },
  reorderBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
    paddingVertical: 10, marginHorizontal: 14, marginBottom: 14,
    borderRadius: 12, borderWidth: 1.5, borderColor: "#059669",
  },
  reorderText: { color: "#059669", fontWeight: "700", fontSize: 13 },
});
