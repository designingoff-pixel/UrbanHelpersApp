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
import {
  Booking,
  BookingStatus,
  CancellationReason,
  CANCELLATION_REASONS,
  cancelBooking,
  subscribeToUserBookings,
} from "@/services/bookingService";
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

/** Statuses for which the customer is allowed to request cancellation. */
const CANCELLABLE_STATUSES = new Set<BookingStatus>([
  "requested",
  "assigned",
  "accepted",
]);

function isCancellable(status: BookingStatus): boolean {
  return CANCELLABLE_STATUSES.has(status);
}

export default function MyBookingsScreen({ navigation }: Props) {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<"All" | "Active" | "Completed" | "Cancelled">("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("All");
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedInvoiceBooking, setSelectedInvoiceBooking] = useState<Booking | null>(null);

  // ── Cancellation state ────────────────────────────────────────────────────
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);
  const [cancelReason, setCancelReason] = useState<CancellationReason>("Changed my mind");
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const openCancelModal = (booking: Booking) => {
    setCancelTarget(booking);
    setCancelReason("Changed my mind");
    setCancelError(null);
  };

  const closeCancelModal = () => {
    if (cancelLoading) return; // prevent closing while request is in-flight
    setCancelTarget(null);
    setCancelError(null);
  };

  /** Translates technical Firebase/Firestore error messages into user-facing text. */
  const friendlyError = (err: any): string => {
    const raw: string = err?.message ?? "";
    // Log the actual error for debugging without exposing it to the user.
    console.error("[cancelBooking] error:", raw);
    if (
      raw.includes("Missing or insufficient permissions") ||
      raw.includes("permission-denied") ||
      raw.includes("PERMISSION_DENIED")
    ) {
      return "Unable to cancel this booking. Please try again.";
    }
    if (raw.includes("not found") || raw.includes("NOT_FOUND")) {
      return "Booking not found. It may have already been removed.";
    }
    if (raw.includes("already been cancelled") || raw.includes("already cancelled")) {
      return "This booking has already been cancelled.";
    }
    if (raw.includes("cannot be cancelled") || raw.includes("completed")) {
      return "This booking can no longer be cancelled.";
    }
    if (raw.includes("not authorised") || raw.includes("not authorized")) {
      return "You are not authorised to cancel this booking.";
    }
    if (raw.includes("network") || raw.includes("unavailable") || raw.includes("offline")) {
      return "Network error. Please check your connection and try again.";
    }
    // Return descriptive messages from our own business-logic checks as-is.
    if (raw.length > 0) return raw;
    return "Unable to cancel this booking. Please try again.";
  };

  const confirmCancellation = async () => {
    if (!cancelTarget || !user) return;
    setCancelLoading(true);
    setCancelError(null);
    try {
      await cancelBooking(cancelTarget.id, user.uid, cancelReason);
      // The live onSnapshot subscription will automatically refresh the list.
      setCancelTarget(null);
      // Show success toast.
      setSuccessToast("Booking cancelled successfully.");
      setTimeout(() => setSuccessToast(null), 3500);
    } catch (err: any) {
      setCancelError(friendlyError(err));
    } finally {
      setCancelLoading(false);
    }
  };

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

      // Category filter modal
      if (selectedCategoryFilter !== "All" && b.serviceCategory !== selectedCategoryFilter) {
        return false;
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
  }, [bookings, activeFilter, selectedCategoryFilter, searchQuery]);

  return (
    <View style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.text.primary} />
        </Pressable>
        <Text style={s.headerTitle}>My Bookings & Invoices</Text>
        <Pressable style={s.filterTopBtn} onPress={() => setFilterModalVisible(true)}>
          <Ionicons
            name="options-outline"
            size={20}
            color={selectedCategoryFilter !== "All" ? "#00bcd4" : colors.text.secondary}
          />
          {selectedCategoryFilter !== "All" && <View style={s.filterActiveDot} />}
        </Pressable>
      </View>

      {/* Universal Search Bar with Working Filter Button */}
      <View style={s.searchRow}>
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

        <Pressable
          style={[s.filterIconBtn, selectedCategoryFilter !== "All" && s.filterIconBtnActive]}
          onPress={() => setFilterModalVisible(true)}
        >
          <Ionicons
            name="funnel"
            size={16}
            color={selectedCategoryFilter !== "All" ? "#ffffff" : "rgba(255,255,255,0.7)"}
          />
        </Pressable>
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

                  {/* Footer with Invoice ID, Cancel & View Bill CTA */}
                  <View style={s.footerRow}>
                    <View style={s.invoiceBadge}>
                      <Ionicons name="receipt-outline" size={12} color="#00bcd4" />
                      <Text style={s.invoiceText}>{invoiceId}</Text>
                    </View>
                    <View style={s.footerActions}>
                      {isCancellable(booking.status) && (
                        <Pressable
                          style={s.cancelBtn}
                          onPress={() => openCancelModal(booking)}
                        >
                          <Ionicons name="close-circle-outline" size={13} color="#ef4444" />
                          <Text style={s.cancelBtnText}>Cancel</Text>
                        </Pressable>
                      )}
                      {booking.status === "completed" && !booking.rated && (
                        <Pressable
                          style={[s.billBtn, { backgroundColor: "rgba(245,158,11,0.18)", borderColor: "#f59e0b", borderWidth: 1 }]}
                          onPress={() =>
                            navigation.navigate("RatingFeedback", {
                              bookingId: booking.id,
                              vendorName: booking.vendorName,
                              serviceCategory: booking.serviceCategory,
                            })
                          }
                        >
                          <Ionicons name="star" size={13} color="#f59e0b" />
                          <Text style={[s.billBtnText, { color: "#f59e0b" }]}>Rate</Text>
                        </Pressable>
                      )}
                      <Pressable
                        style={s.billBtn}
                        onPress={() =>
                          navigation.navigate("ServiceCompleted", {
                            bookingId: booking.id,
                          })
                        }
                      >
                        <Ionicons name="document-text-outline" size={13} color="#ffffff" />
                        <Text style={s.billBtnText}>View Bill</Text>
                      </Pressable>
                    </View>
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

      {/* ── Success Toast ──────────────────────────────────────────────────── */}
      {successToast && (
        <Animated.View
          entering={FadeInDown.duration(250)}
          style={s.successToast}
        >
          <Ionicons name="checkmark-circle" size={18} color="#4ade80" />
          <Text style={s.successToastText}>{successToast}</Text>
        </Animated.View>
      )}

      {/* ── Cancel Booking Confirmation Modal ──────────────────────────────── */}
      <Modal
        visible={!!cancelTarget}
        transparent={true}
        animationType="slide"
        onRequestClose={closeCancelModal}
      >
        <View style={s.modalOverlay}>
          <View style={s.cancelModalCard}>
            {/* Header */}
            <View style={s.cancelModalHeader}>
              <View style={s.cancelModalIconWrap}>
                <Ionicons name="alert-circle-outline" size={26} color="#ef4444" />
              </View>
              <Text style={s.cancelModalTitle}>Cancel Booking?</Text>
              <Text style={s.cancelModalSub}>
                Are you sure you want to cancel this booking?
              </Text>
            </View>

            {/* Booking summary */}
            {cancelTarget && (
              <View style={s.cancelBookingSummary}>
                <Text style={s.cancelBookingService}>
                  {cancelTarget.serviceCategory}
                </Text>
                <Text style={s.cancelBookingSubService}>
                  {cancelTarget.subServiceName}
                </Text>
                <Text style={s.cancelBookingInvoice}>
                  {`INV-${cancelTarget.id.slice(-8).toUpperCase()}`}
                </Text>
              </View>
            )}

            {/* Cancellation reason picker */}
            <Text style={s.cancelReasonLabel}>Reason for cancellation</Text>
            {CANCELLATION_REASONS.map((r) => (
              <Pressable
                key={r}
                style={[
                  s.cancelReasonOption,
                  cancelReason === r && s.cancelReasonOptionActive,
                ]}
                onPress={() => setCancelReason(r)}
              >
                <View style={[
                  s.cancelReasonRadio,
                  cancelReason === r && s.cancelReasonRadioActive,
                ]}>
                  {cancelReason === r && <View style={s.cancelReasonRadioDot} />}
                </View>
                <Text style={[
                  s.cancelReasonText,
                  cancelReason === r && s.cancelReasonTextActive,
                ]}>{r}</Text>
              </Pressable>
            ))}

            {/* Error message */}
            {cancelError && (
              <View style={s.cancelErrorBanner}>
                <Ionicons name="warning-outline" size={14} color="#fca5a5" />
                <Text style={s.cancelErrorText}>{cancelError}</Text>
              </View>
            )}

            {/* Action buttons */}
            <View style={s.cancelActionRow}>
              <Pressable
                style={[s.keepBtn, cancelLoading && { opacity: 0.5 }]}
                onPress={closeCancelModal}
                disabled={cancelLoading}
              >
                <Text style={s.keepBtnText}>Keep Booking</Text>
              </Pressable>
              <Pressable
                style={[s.confirmCancelBtn, cancelLoading && { opacity: 0.7 }]}
                onPress={confirmCancellation}
                disabled={cancelLoading}
              >
                {cancelLoading ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={s.confirmCancelBtnText}>Cancel Booking</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Category Filter Modal */}
      <Modal
        visible={filterModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <Pressable style={s.modalOverlay} onPress={() => setFilterModalVisible(false)}>
          <Pressable style={s.filterModalCard} onPress={(e) => e.stopPropagation()}>
            <View style={s.filterModalHeader}>
              <Text style={s.filterModalTitle}>Filter by Service</Text>
              <Pressable onPress={() => setFilterModalVisible(false)}>
                <Ionicons name="close" size={22} color="#64748b" />
              </Pressable>
            </View>

            <ScrollView style={{ maxHeight: 300 }}>
              <Pressable
                style={[s.filterCatOption, selectedCategoryFilter === "All" && s.filterCatOptionActive]}
                onPress={() => {
                  setSelectedCategoryFilter("All");
                  setFilterModalVisible(false);
                }}
              >
                <Text style={[s.filterCatText, selectedCategoryFilter === "All" && s.filterCatTextActive]}>
                  All Services
                </Text>
                {selectedCategoryFilter === "All" && <Ionicons name="checkmark" size={18} color="#00bcd4" />}
              </Pressable>

              {SERVICE_CATEGORIES.map((cat) => (
                <Pressable
                  key={cat.id}
                  style={[s.filterCatOption, selectedCategoryFilter === cat.name && s.filterCatOptionActive]}
                  onPress={() => {
                    setSelectedCategoryFilter(cat.name);
                    setFilterModalVisible(false);
                  }}
                >
                  <Text style={[s.filterCatText, selectedCategoryFilter === cat.name && s.filterCatTextActive]}>
                    {cat.name}
                  </Text>
                  {selectedCategoryFilter === cat.name && <Ionicons name="checkmark" size={18} color="#00bcd4" />}
                </Pressable>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

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
  filterTopBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.1)",
    justifyContent: "center", alignItems: "center",
    position: "relative",
  },
  filterActiveDot: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#00bcd4",
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    gap: 8,
    marginBottom: 12,
  },
  searchWrap: {
    flex: 1,
    flexDirection: "row", alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)",
  },
  searchInput: { flex: 1, fontSize: 13, color: "#ffffff" },
  filterIconBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  filterIconBtnActive: {
    backgroundColor: "#00bcd4",
    borderColor: "#00bcd4",
  },
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
    flexShrink: 1,
  },
  invoiceText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#00bcd4",
    letterSpacing: 0.5,
  },
  footerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  cancelBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
  },
  cancelBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#ef4444",
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

  // ── Cancel Booking Modal ────────────────────────────────────────────────
  cancelModalCard: {
    width: "100%",
    backgroundColor: "#0f1e2e",
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.25)",
    elevation: 12,
  },
  cancelModalHeader: {
    alignItems: "center",
    marginBottom: 16,
  },
  cancelModalIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(239,68,68,0.12)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  cancelModalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#ffffff",
    marginBottom: 4,
  },
  cancelModalSub: {
    fontSize: 13,
    color: "rgba(255,255,255,0.55)",
    textAlign: "center",
    lineHeight: 18,
  },
  cancelBookingSummary: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    gap: 2,
  },
  cancelBookingService: {
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
  },
  cancelBookingSubService: {
    fontSize: 12,
    color: "rgba(255,255,255,0.55)",
  },
  cancelBookingInvoice: {
    fontSize: 11,
    color: "#00bcd4",
    fontWeight: "600",
    marginTop: 4,
  },
  cancelReasonLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "rgba(255,255,255,0.6)",
    letterSpacing: 0.5,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  cancelReasonOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 4,
  },
  cancelReasonOptionActive: {
    backgroundColor: "rgba(239,68,68,0.08)",
  },
  cancelReasonRadio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.25)",
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  cancelReasonRadioActive: {
    borderColor: "#ef4444",
  },
  cancelReasonRadioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ef4444",
  },
  cancelReasonText: {
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
  },
  cancelReasonTextActive: {
    color: "#ffffff",
    fontWeight: "600",
  },
  cancelErrorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(239,68,68,0.12)",
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.3)",
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
  },
  cancelErrorText: {
    fontSize: 12,
    color: "#fca5a5",
    flex: 1,
    lineHeight: 16,
  },
  cancelActionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
  },
  keepBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
  },
  keepBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "rgba(255,255,255,0.8)",
  },
  confirmCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#dc2626",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
  },
  confirmCancelBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#ffffff",
  },
  successToast: {
    position: "absolute",
    bottom: 30,
    left: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#0e2d1c",
    borderWidth: 1,
    borderColor: "rgba(74, 222, 128, 0.35)",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    elevation: 12,
    zIndex: 999,
  },
  successToastText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#4ade80",
    flex: 1,
  },
  emptyHint: { alignItems: "center", gap: 8, marginTop: 16, paddingVertical: 24 },
  emptyHintText: { fontSize: 13, color: "rgba(255,255,255,0.4)", textAlign: "center", paddingHorizontal: 24 },
  signInBtn: {
    marginTop: 8, paddingHorizontal: 20, paddingVertical: 10,
    borderRadius: 20, backgroundColor: "#00bcd4",
  },
  signInBtnText: { fontSize: 13, fontWeight: "700", color: "white" },

  // Filter Modal
  filterModalCard: {
    width: "100%",
    maxWidth: 320,
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 20,
  },
  filterModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingBottom: 10,
  },
  filterModalTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0f172a",
  },
  filterCatOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  filterCatOptionActive: {
    backgroundColor: "#f0fdf4",
  },
  filterCatText: {
    fontSize: 14,
    color: "#334155",
    fontWeight: "600",
  },
  filterCatTextActive: {
    color: "#00bcd4",
    fontWeight: "700",
  },

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
