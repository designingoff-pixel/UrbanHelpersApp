import React, { useEffect, useState, useMemo } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  View,
  Pressable,
  StyleSheet,
  TextInput,
  Modal,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import Animated, { FadeInDown } from "react-native-reanimated";
import { RootStackParamList } from "@/navigation/types";
import { colors } from "@/theme/colors";
import { useAuth } from "@/context/AuthContext";
import { Booking, BookingStatus, subscribeToUserBookings } from "@/services/bookingService";
import { SERVICE_CATEGORIES } from "./servicesData";

type Props = NativeStackScreenProps<RootStackParamList, "MyBookings">;

const { width } = Dimensions.get("window");
const DEFAULT_GRADIENT: [string, string] = ["#00bcd4", "#0097a7"];

function categoryFor(booking: Booking) {
  return SERVICE_CATEGORIES.find((c) => c.name === booking.serviceCategory);
}

function formatScheduledAt(iso: string): string {
  const date = new Date(iso);
  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const isTomorrow = date.toDateString() === tomorrow.toDateString();

  if (isToday) return "Today";
  if (isTomorrow) return "Tomorrow";
  return date.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" });
}

const STATUS_COLORS: Record<BookingStatus, string> = {
  requested: "#f59e0b",
  assigned: "#38bdf8",
  accepted: "#38bdf8",
  en_route: "#38bdf8",
  arrived: "#f59e0b",
  in_progress: "#22c55e",
  completed: "#6366f1",
  cancelled: "#ef4444",
};

const STATUS_LABELS: Record<BookingStatus, string> = {
  requested: "Requested",
  assigned: "Assigned",
  accepted: "Accepted",
  en_route: "En route",
  arrived: "Arrived",
  in_progress: "In progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

export default function MyBookingsScreen({ navigation }: Props) {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<"All" | "Active" | "Completed" | "Cancelled">("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInvoiceBooking, setSelectedInvoiceBooking] = useState<Booking | null>(null);

  useEffect(() => {
    if (!user) {
      setBookings([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsubscribe = subscribeToUserBookings(user.uid, (result) => {
      setBookings(result);
      setLoading(false);
    });
    return unsubscribe;
  }, [user]);

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      // Status filtering
      if (activeFilter === "Active") {
        if (b.status === "completed" || b.status === "cancelled") return false;
      } else if (activeFilter === "Completed") {
        if (b.status !== "completed") return false;
      } else if (activeFilter === "Cancelled") {
        if (b.status !== "cancelled") return false;
      }

      // Search query filtering (Invoice ID, Category, SubService, Vendor)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const invoiceId = `inv-${b.id.slice(-8)}`.toLowerCase();
        const cat = (b.serviceCategory || "").toLowerCase();
        const sub = (b.subServiceName || "").toLowerCase();
        const vendor = (b.vendorName || "").toLowerCase();
        return invoiceId.includes(q) || cat.includes(q) || sub.includes(q) || vendor.includes(q);
      }
      return true;
    });
  }, [bookings, activeFilter, searchQuery]);

  return (
    <View style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.text.primary} />
        </Pressable>
        <Text style={s.headerTitle}>My Bookings & Invoices</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Universal Search Bar */}
      <View style={s.searchWrap}>
        <Ionicons name="search-outline" size={18} color="rgba(255,255,255,0.4)" style={{ marginRight: 8 }} />
        <TextInput
          style={s.searchInput}
          placeholder="Search by invoice ID, service name..."
          placeholderTextColor="rgba(255,255,255,0.4)"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={18} color="rgba(255,255,255,0.5)" />
          </Pressable>
        )}
      </View>

      {/* Filter Tabs */}
      <Animated.View entering={FadeInDown.duration(300)} style={s.filterTabs}>
        {(["All", "Active", "Completed", "Cancelled"] as const).map((tab) => (
          <Pressable
            key={tab}
            onPress={() => setActiveFilter(tab)}
            style={[s.filterTab, activeFilter === tab && s.filterTabActive]}
          >
            <Text style={[s.filterTabText, activeFilter === tab && s.filterTabTextActive]}>{tab}</Text>
          </Pressable>
        ))}
      </Animated.View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {!user && (
          <View style={s.emptyHint}>
            <Ionicons name="log-in-outline" size={40} color="rgba(255,255,255,0.2)" />
            <Text style={s.emptyHintText}>Sign in to see your bookings</Text>
            <Pressable onPress={() => navigation.navigate("SignIn")} style={s.signInBtn}>
              <Text style={s.signInBtnText}>Sign In</Text>
            </Pressable>
          </View>
        )}

        {user && loading && (
          <View style={s.emptyHint}>
            <ActivityIndicator color="#00bcd4" />
          </View>
        )}

        {user && !loading && filteredBookings.map((booking, i) => {
          const category = categoryFor(booking);
          const gradient = category?.gradient ?? DEFAULT_GRADIENT;
          const invoiceId = `INV-${booking.id.slice(-8).toUpperCase()}`;

          return (
            <Animated.View key={booking.id} entering={FadeInDown.delay(i * 50).duration(300)}>
              <View style={s.bookingCard}>
                {/* Left gradient accent */}
                <LinearGradient
                  colors={gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={s.accentBar}
                />

                <View style={s.bookingBody}>
                  {/* Top row */}
                  <View style={s.bookingTop}>
                    <View style={[s.serviceIconWrap, { backgroundColor: gradient[0] + "22" }]}>
                      <Ionicons name={(category?.icon as any) ?? "sparkles"} size={22} color={gradient[0]} />
                    </View>
                    <View style={s.bookingInfo}>
                      <Text style={s.serviceName}>{booking.serviceCategory}</Text>
                      <Text style={s.subServiceName}>{booking.subServiceName}</Text>
                    </View>
                    <View style={[s.statusBadge, { backgroundColor: STATUS_COLORS[booking.status] + "22" }]}>
                      <View style={[s.statusDot, { backgroundColor: STATUS_COLORS[booking.status] }]} />
                      <Text style={[s.statusText, { color: STATUS_COLORS[booking.status] }]}>
                        {STATUS_LABELS[booking.status]}
                      </Text>
                    </View>
                  </View>

                  {/* Divider */}
                  <View style={s.divider} />

                  {/* Bottom row */}
                  <View style={s.bookingBottom}>
                    <View style={s.metaItem}>
                      <Ionicons name="person-outline" size={13} color={colors.text.secondary} />
                      <Text style={s.metaText}>{booking.vendorName}</Text>
                    </View>
                    <View style={s.metaItem}>
                      <Ionicons name="calendar-outline" size={13} color={colors.text.secondary} />
                      <Text style={s.metaText}>{formatScheduledAt(booking.scheduledAt)}</Text>
                    </View>
                    <Text style={s.priceText}>{booking.priceLabel}</Text>
                  </View>

                  {/* Active Booking OTP Display */}
                  {booking.status !== "completed" && booking.status !== "cancelled" && booking.otp && (
                    <View style={s.otpWrap}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                        <Ionicons name="keypad-outline" size={14} color="#00bcd4" />
                        <Text style={{ fontSize: 12, color: "#80deea", fontWeight: "600" }}>OTP for Vendor</Text>
                      </View>
                      <Text style={{ fontSize: 15, fontWeight: "700", color: "#00e5ff", letterSpacing: 1.5 }}>
                        {booking.otp}
                      </Text>
                    </View>
                  )}

                  {/* Footer with Invoice ID & View Bill CTA */}
                  <View style={s.footerRow}>
                    <View style={s.invoiceBadge}>
                      <Ionicons name="receipt-outline" size={12} color="#00bcd4" />
                      <Text style={s.invoiceText}>{invoiceId}</Text>
                    </View>
                    <Pressable
                      style={s.billBtn}
                      onPress={() => setSelectedInvoiceBooking(booking)}
                    >
                      <Ionicons name="document-text-outline" size={13} color="#ffffff" />
                      <Text style={s.billBtnText}>View Bill</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            </Animated.View>
          );
        })}

        {user && !loading && filteredBookings.length === 0 && (
          <Animated.View entering={FadeInDown.delay(200).duration(300)} style={s.emptyHint}>
            <Ionicons name="calendar-outline" size={40} color="rgba(255,255,255,0.15)" />
            <Text style={s.emptyHintText}>No bookings match your filter or search</Text>
          </Animated.View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Itemized Bill / Invoice Modal */}
      <Modal
        visible={!!selectedInvoiceBooking}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setSelectedInvoiceBooking(null)}
      >
        <View style={s.modalOverlay}>
          <View style={s.invoiceCard}>
            <View style={s.invoiceHeader}>
              <View>
                <Text style={s.invoiceBrand}>URBAN HELPERS INVOICE</Text>
                <Text style={s.invoiceRef}>
                  INV-#{selectedInvoiceBooking?.id.slice(-8).toUpperCase()}
                </Text>
              </View>
              <Pressable onPress={() => setSelectedInvoiceBooking(null)} style={s.modalCloseBtn}>
                <Ionicons name="close" size={20} color="#64748b" />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 380 }}>
              <View style={s.invoiceMeta}>
                <Text style={s.metaLine}><Text style={s.metaBold}>Service: </Text>{selectedInvoiceBooking?.serviceCategory} - {selectedInvoiceBooking?.subServiceName}</Text>
                <Text style={s.metaLine}><Text style={s.metaBold}>Date: </Text>{selectedInvoiceBooking ? formatScheduledAt(selectedInvoiceBooking.scheduledAt) : ""}</Text>
                <Text style={s.metaLine}><Text style={s.metaBold}>Status: </Text>{selectedInvoiceBooking?.status.toUpperCase()}</Text>
                <Text style={s.metaLine}><Text style={s.metaBold}>Service Partner: </Text>{selectedInvoiceBooking?.vendorName || "Verified Professional"}</Text>
              </View>

              <View style={s.itemizedTable}>
                <View style={s.tableHeader}>
                  <Text style={s.tableHeadTitle}>Description</Text>
                  <Text style={s.tableHeadAmount}>Amount</Text>
                </View>
                <View style={s.tableRow}>
                  <Text style={s.tableItemTitle}>{selectedInvoiceBooking?.subServiceName || "Service"}</Text>
                  <Text style={s.tableItemPrice}>{selectedInvoiceBooking?.priceLabel || "₹499"}</Text>
                </View>
                <View style={s.tableRow}>
                  <Text style={s.tableItemTitle}>Safety & Platform Fee</Text>
                  <Text style={s.tableItemPrice}>₹29</Text>
                </View>
                <View style={s.tableRow}>
                  <Text style={s.tableItemTitle}>Taxes & GST (18%)</Text>
                  <Text style={s.tableItemPrice}>₹45</Text>
                </View>
                <View style={[s.tableRow, s.tableTotalRow]}>
                  <Text style={s.totalTitle}>Total Paid</Text>
                  <Text style={s.totalAmount}>{selectedInvoiceBooking?.priceLabel || "₹573"}</Text>
                </View>
              </View>

              <View style={s.paymentSuccessRow}>
                <Ionicons name="checkmark-circle" size={18} color="#10b981" />
                <Text style={s.paymentSuccessText}>Verified & Paid Online via UPI/Card</Text>
              </View>
            </ScrollView>

            <Pressable
              style={s.invoiceDoneBtn}
              onPress={() => setSelectedInvoiceBooking(null)}
            >
              <Text style={s.invoiceDoneText}>Close Invoice</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#081826" },
  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 16, paddingTop: 52, paddingBottom: 10,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.1)",
    justifyContent: "center", alignItems: "center",
  },
  headerTitle: { fontSize: 19, fontWeight: "700", color: colors.text.primary },
  searchWrap: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    marginHorizontal: 16, paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)",
    marginBottom: 12,
  },
  searchInput: { flex: 1, fontSize: 13, color: "#ffffff" },
  filterTabs: {
    flexDirection: "row", gap: 8, paddingHorizontal: 16, marginBottom: 16,
  },
  filterTab: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
  },
  filterTabActive: {
    backgroundColor: "#00bcd4",
    borderColor: "#00bcd4",
  },
  filterTabText: { fontSize: 12, fontWeight: "600", color: colors.text.secondary },
  filterTabTextActive: { color: "white" },
  scroll: { paddingHorizontal: 16 },
  bookingCard: {
    flexDirection: "row", marginBottom: 14,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 18, overflow: "hidden",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
  },
  accentBar: { width: 5 },
  bookingBody: { flex: 1, padding: 14 },
  bookingTop: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  serviceIconWrap: {
    width: 44, height: 44, borderRadius: 22,
    justifyContent: "center", alignItems: "center",
  },
  bookingInfo: { flex: 1 },
  serviceName: { fontSize: 15, fontWeight: "700", color: colors.text.primary },
  subServiceName: { fontSize: 12, color: colors.text.secondary, marginTop: 2 },
  statusBadge: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: "700" },
  divider: { height: 1, backgroundColor: "rgba(255,255,255,0.07)", marginBottom: 12 },
  bookingBottom: { flexDirection: "row", alignItems: "center", gap: 12 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: 11, color: colors.text.secondary },
  priceText: { marginLeft: "auto", fontSize: 15, fontWeight: "700", color: "#00bcd4" },
  otpWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(0, 188, 212, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(0, 188, 212, 0.3)",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 10,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
  },
  invoiceBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  invoiceText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#00bcd4",
    letterSpacing: 0.5,
  },
  billBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0, 188, 212, 0.2)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  billBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#00bcd4",
  },
  emptyHint: { alignItems: "center", gap: 8, marginTop: 16, paddingVertical: 24 },
  emptyHintText: { fontSize: 13, color: "rgba(255,255,255,0.4)", textAlign: "center", paddingHorizontal: 24 },
  signInBtn: {
    marginTop: 8, paddingHorizontal: 20, paddingVertical: 10,
    borderRadius: 20, backgroundColor: "#00bcd4",
  },
  signInBtnText: { fontSize: 13, fontWeight: "700", color: "white" },

  // Invoice Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  invoiceCard: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 20,
    elevation: 8,
  },
  invoiceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingBottom: 12,
    marginBottom: 12,
  },
  invoiceBrand: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0f172a",
    letterSpacing: 0.5,
  },
  invoiceRef: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },
  modalCloseBtn: {
    padding: 4,
  },
  invoiceMeta: {
    backgroundColor: "#f8fafc",
    padding: 12,
    borderRadius: 10,
    marginBottom: 14,
    gap: 4,
  },
  metaLine: {
    fontSize: 12,
    color: "#334155",
  },
  metaBold: {
    fontWeight: "700",
    color: "#0f172a",
  },
  itemizedTable: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 14,
  },
  tableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  tableHeadTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#475569",
  },
  tableHeadAmount: {
    fontSize: 12,
    fontWeight: "700",
    color: "#475569",
  },
  tableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  tableItemTitle: {
    fontSize: 12,
    color: "#334155",
  },
  tableItemPrice: {
    fontSize: 12,
    fontWeight: "600",
    color: "#0f172a",
  },
  tableTotalRow: {
    backgroundColor: "#f8fafc",
    borderTopWidth: 1.5,
    borderTopColor: "#cbd5e1",
  },
  totalTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0f172a",
  },
  totalAmount: {
    fontSize: 14,
    fontWeight: "800",
    color: "#059669",
  },
  paymentSuccessRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginBottom: 16,
  },
  paymentSuccessText: {
    fontSize: 12,
    color: "#059669",
    fontWeight: "600",
  },
  invoiceDoneBtn: {
    backgroundColor: "#081826",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  invoiceDoneText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
});
