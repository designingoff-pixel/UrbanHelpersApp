import React, { useState, useEffect } from "react";
import {
  ScrollView,
  Text,
  View,
  Pressable,
  StyleSheet,
  Dimensions,
  Image,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/types";
import { SERVICE_CATEGORIES, SubService } from "./servicesData";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { auth, db } from "@/services/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Props = NativeStackScreenProps<RootStackParamList, "ServiceDetail">;
const { width } = Dimensions.get("window");

export default function ServiceDetailScreen({ navigation, route }: Props) {
  const { categoryId, subServiceId } = route.params;
  const { user } = useAuth();
  const { isDark, colors } = useTheme();
  const activeUser = auth.currentUser || user;

  const category =
    SERVICE_CATEGORIES.find((c) => c.id === categoryId) || SERVICE_CATEGORIES[0];
  const selectedSub =
    category.subServices.find((s) => s.id === subServiceId) ||
    category.subServices[0] || {
      id: "cl-general",
      name: "Standard Package",
      price: "₹600",
      duration: "5 hrs",
      description: "Professional cleaning for a healthier, safer and fresher home.",
    };

  // User input states
  const [contactNumber, setContactNumber] = useState(
    activeUser?.phoneNumber || "9923658705"
  );
  const [isEditingPhone, setIsEditingPhone] = useState(false);

  const [serviceAddress, setServiceAddress] = useState(
    "CVFF+5H9, Morur, Tamil Nadu"
  );
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [customAddressInput, setCustomAddressInput] = useState(serviceAddress);

  const [bookingDate, setBookingDate] = useState("Thu, Oct 8, 2026");
  const [bookingTime, setBookingTime] = useState("10:00 AM");

  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);

  const [loading, setLoading] = useState(false);

  // Load user profile details on mount
  useEffect(() => {
    (async () => {
      try {
        const uid = activeUser?.uid;
        if (uid) {
          const raw = await AsyncStorage.getItem(`@customer_profile_${uid}`);
          if (raw) {
            const p = JSON.parse(raw);
            if (p.phone && p.phone.trim()) setContactNumber(p.phone);
            if (p.address && p.address.trim()) {
              setServiceAddress(p.address);
              setCustomAddressInput(p.address);
            }
          }
          const snap = await getDoc(doc(db, "users", uid));
          if (snap.exists()) {
            const d = snap.data();
            if (d.phone || d.mobile) setContactNumber(d.phone || d.mobile);
            if (d.address || d.deliveryAddress) {
              setServiceAddress(d.address || d.deliveryAddress);
              setCustomAddressInput(d.address || d.deliveryAddress);
            }
          }
        }
      } catch (_) {}
    })();
  }, [activeUser?.uid]);

  // Calculate pricing
  const basePriceNum = parseInt(selectedSub.price.replace(/[^\d]/g, ""), 10) || 600;
  const originalPrice = basePriceNum + 300;
  const finalPrice = Math.max(99, basePriceNum - couponDiscount);

  const handleApplyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) {
      Alert.alert("Coupon Code", "Please enter a valid discount code.");
      return;
    }
    if (code === "URBAN100" || code === "WELCOME100" || code === "CLEAN100") {
      setCouponDiscount(100);
      setCouponApplied(true);
      Alert.alert("Coupon Applied! 🎉", "₹100 discount applied to your order.");
    } else if (code === "URBAN50" || code === "SAVE50") {
      setCouponDiscount(50);
      setCouponApplied(true);
      Alert.alert("Coupon Applied! 🎉", "₹50 discount applied to your order.");
    } else {
      Alert.alert("Invalid Coupon", "This coupon code is expired or invalid.");
    }
  };

  const handleSaveCustomAddress = () => {
    if (customAddressInput.trim()) {
      setServiceAddress(customAddressInput.trim());
    }
    setShowLocationModal(false);
  };

  const handleConfirmBooking = async () => {
    if (!contactNumber.trim()) {
      Alert.alert("Phone Required", "Please enter a contact number for confirmation.");
      return;
    }
    if (!serviceAddress.trim()) {
      Alert.alert("Address Required", "Please specify the service address.");
      return;
    }

    setLoading(true);
    try {
      const bookingId = "AP4" + Math.random().toString(36).substring(2, 7).toUpperCase();
      const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
      const uid = activeUser?.uid || `guest_${Date.now()}`;
      const custName = activeUser?.displayName || "Customer";
      const scheduledDateTimeStr = `${bookingDate} at ${bookingTime}`;

      const bookingPayload = {
        id: bookingId,
        bookingId,
        customerId: uid,
        customerName: custName,
        customerPhone: contactNumber.trim(),
        customerEmail: activeUser?.email || "",
        address: serviceAddress.trim(),
        serviceCategory: category.name,
        serviceId: category.id,
        subServiceId: selectedSub.id,
        subServiceName: selectedSub.name,
        price: finalPrice,
        priceLabel: `₹${finalPrice}`,
        originalPrice: `₹${originalPrice}`,
        otp: otpCode,
        status: "requested",
        vendorId: null,
        vendorName: "Pending Assignment",
        vendorPhone: "+91 98765 43210",
        scheduledAt: scheduledDateTimeStr,
        bookingDate,
        bookingTime,
        duration: selectedSub.duration || "5 hrs",
        createdAt: new Date().toISOString(),
      };

      // 1. Write booking to Firestore
      try {
        await setDoc(doc(db, "bookings", bookingId), bookingPayload);
      } catch (err) {
        console.warn("Firestore booking write warning:", err);
      }

      // 2. Save booking to local cache
      try {
        const localKey = `@customer_bookings_${uid}`;
        const prev = await AsyncStorage.getItem(localKey);
        const list = prev ? JSON.parse(prev) : [];
        list.unshift(bookingPayload);
        await AsyncStorage.setItem(localKey, JSON.stringify(list));
      } catch (_) {}

      // 3. Navigate to BookingConfirmedScreen with all required params
      navigation.navigate("BookingConfirmed", {
        bookingId,
        otp: otpCode,
        categoryId: category.id,
        subServiceId: selectedSub.id,
        scheduledDate: scheduledDateTimeStr,
        booking: bookingPayload,
      } as any);
    } catch (e: any) {
      Alert.alert("Booking Error", e.message || "Failed to confirm booking. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const bgStyle = { backgroundColor: isDark ? "#081826" : "#F4F6F9" };
  const cardBgStyle = {
    backgroundColor: isDark ? "#0D2135" : "#FFFFFF",
    borderColor: isDark ? "rgba(0,188,212,0.2)" : "#E2E8F0",
  };
  const textPrimary = { color: isDark ? "#FFFFFF" : "#0F172A" };
  const textSecondary = { color: isDark ? "#94A3B8" : "#64748B" };

  return (
    <View style={[styles.root, bgStyle]}>
      {/* ── Top Header Bar ────────────────────────────────────────────── */}
      <SafeAreaView edges={["top"]} style={[styles.headerSafe, { backgroundColor: isDark ? "#051320" : "#0F766E" }]}>
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBackBtn}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerBarTitle}>{selectedSub.name}</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.headerHeroWrap}>
          <Image
            source={require("../../../assets/book_service_header.png")}
            style={styles.headerHeroImg}
            resizeMode="contain"
          />
        </View>
      </SafeAreaView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── Service Summary Card (Matching Design 3) ────────────────── */}
        <View style={[styles.serviceHeroCard, cardBgStyle]}>
          <View style={styles.serviceHeroTop}>
            <View style={styles.serviceIconContainer}>
              <View style={[styles.serviceIconCircle, { backgroundColor: isDark ? "rgba(0,188,212,0.15)" : "#E0F2FE" }]}>
                <Ionicons name={category.icon as any || "home"} size={28} color={isDark ? "#00BCD4" : "#0284C7"} />
              </View>
              <View style={styles.heroPopularBadge}>
                <Ionicons name="star" size={10} color="#92400E" />
                <Text style={styles.heroPopularBadgeText}>Most Popular</Text>
              </View>
            </View>

            <View style={styles.serviceHeroInfo}>
              <Text style={[styles.serviceHeroTitle, textPrimary]}>{selectedSub.name}</Text>
              <Text style={[styles.serviceHeroDesc, textSecondary]}>{selectedSub.description}</Text>

              {/* 3 Badges */}
              <View style={styles.heroBadgesRow}>
                <View style={styles.heroBadgeItem}>
                  <Ionicons name="shield-checkmark-outline" size={12} color="#059669" />
                  <Text style={styles.heroBadgeText}>Trusted Staff</Text>
                </View>
                <View style={styles.heroBadgeItem}>
                  <Ionicons name="leaf-outline" size={12} color="#059669" />
                  <Text style={styles.heroBadgeText}>Eco-Friendly</Text>
                </View>
                <View style={styles.heroBadgeItem}>
                  <Ionicons name="star-outline" size={12} color="#059669" />
                  <Text style={styles.heroBadgeText}>100% Satisfaction</Text>
                </View>
              </View>
            </View>

            {/* Right: Price & Duration */}
            <View style={styles.serviceHeroPriceCol}>
              <Text style={styles.startsFromLabel}>Starts from</Text>
              <View style={styles.priceWithArrow}>
                <Text style={[styles.heroPriceMain, { color: isDark ? "#00BCD4" : "#0F766E" }]}>₹{basePriceNum}</Text>
                <Text style={styles.heroPriceSlashed}>₹{originalPrice}</Text>
              </View>
              <View style={[styles.durationTag, { backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "#F1F5F9" }]}>
                <Ionicons name="time-outline" size={12} color={isDark ? "#94A3B8" : "#64748B"} />
                <Text style={[styles.durationTagText, textSecondary]}>{selectedSub.duration}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── Quick Service Banner ────────────────────────────────────── */}
        <View style={styles.quickServiceHeaderRow}>
          <View style={styles.quickServiceTitleWrap}>
            <View style={styles.lightningIconWrap}>
              <Ionicons name="flash" size={16} color="#059669" />
            </View>
            <View>
              <Text style={[styles.quickServiceTitle, textPrimary]}>Quick Service</Text>
              <Text style={[styles.quickServiceSub, textSecondary]}>Book in just a few taps</Text>
            </View>
          </View>
          <Text style={styles.quickServiceDoodle}>Your clean is our priority 🌿</Text>
        </View>

        {/* ── Location Map Selection Card (Correctly Aligned Address) ───── */}
        <View style={[styles.locationSelectionCard, cardBgStyle]}>
          <View style={styles.locationCardLeft}>
            <View style={[styles.locationPinIconWrap, { backgroundColor: isDark ? "rgba(0,188,212,0.15)" : "#E0F2FE" }]}>
              <Ionicons name="location" size={20} color={isDark ? "#00BCD4" : "#0284C7"} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.locationCardTitle, textPrimary]}>Service Address</Text>
              {/* Formatted address placed directly under title */}
              <Text style={[styles.currentAddressText, { color: isDark ? "#E2E8F0" : "#1E293B" }]} numberOfLines={2}>
                {serviceAddress}
              </Text>
              <Text style={[styles.locationCardSub, textSecondary]}>
                We will send the professional to this doorstep
              </Text>
              <TouchableOpacity
                style={[styles.selectMapBtn, { backgroundColor: isDark ? "rgba(0,188,212,0.1)" : "#F0FDF4", borderColor: isDark ? "rgba(0,188,212,0.3)" : "#BBF7D0" }]}
                onPress={() => setShowLocationModal(true)}
              >
                <Ionicons name="map-outline" size={16} color={isDark ? "#00BCD4" : "#059669"} style={{ marginRight: 6 }} />
                <Text style={[styles.selectMapBtnText, { color: isDark ? "#00BCD4" : "#059669" }]}>Change / Select on Map</Text>
                <Ionicons name="chevron-forward" size={14} color={isDark ? "#00BCD4" : "#059669"} style={{ marginLeft: 4 }} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.mapGraphicPreviewWrap}>
            <Image
              source={require("../../../assets/service_map_preview.png")}
              style={styles.mapGraphicPreview}
              resizeMode="cover"
            />
          </View>
        </View>

        {/* ── Two Columns: Contact Number + Select Date & Time ────────── */}
        <View style={styles.twoColRow}>
          {/* Contact Number Card */}
          <View style={[styles.halfCard, cardBgStyle]}>
            <View style={styles.cardHeaderRow}>
              <View style={[styles.roundIconWrap, { backgroundColor: isDark ? "rgba(34,197,94,0.15)" : "#DCFCE7" }]}>
                <Ionicons name="call" size={16} color="#15803D" />
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={[styles.halfCardTitle, textPrimary]}>Contact Number</Text>
                <Text style={[styles.halfCardSub, textSecondary]}>We will contact you</Text>
              </View>
            </View>

            {isEditingPhone ? (
              <TextInput
                value={contactNumber}
                onChangeText={setContactNumber}
                onBlur={() => setIsEditingPhone(false)}
                keyboardType="phone-pad"
                style={[styles.phoneInputField, { color: isDark ? "#fff" : "#000", backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "#F8FAFC" }]}
                autoFocus
              />
            ) : (
              <TouchableOpacity
                style={[styles.phonePillBtn, { backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "#F8FAFC", borderColor: isDark ? "rgba(255,255,255,0.1)" : "#E2E8F0" }]}
                onPress={() => setIsEditingPhone(true)}
              >
                <Ionicons name="call-outline" size={14} color={isDark ? "#00BCD4" : "#0F172A"} style={{ marginRight: 6 }} />
                <Text style={[styles.phonePillText, textPrimary]}>{contactNumber}</Text>
                <Ionicons name="pencil-outline" size={14} color={textSecondary.color} style={{ marginLeft: "auto" }} />
              </TouchableOpacity>
            )}
          </View>

          {/* Date & Time Card */}
          <View style={[styles.halfCard, cardBgStyle]}>
            <View style={styles.cardHeaderRow}>
              <View style={[styles.roundIconWrap, { backgroundColor: isDark ? "rgba(168,85,247,0.15)" : "#EDE9FE" }]}>
                <Ionicons name="calendar" size={16} color="#7C3AED" />
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={[styles.halfCardTitle, textPrimary]}>Schedule Slot</Text>
                <Text style={[styles.halfCardSub, textSecondary]}>Preferred arrival</Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.scheduleRowBtn, { backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "#F8FAFC", borderColor: isDark ? "rgba(255,255,255,0.1)" : "#E2E8F0" }]}
              onPress={() => {
                Alert.alert("Select Date", "Choose service appointment day:", [
                  { text: "Today", onPress: () => setBookingDate("Today") },
                  { text: "Tomorrow", onPress: () => setBookingDate("Tomorrow") },
                  { text: "Saturday", onPress: () => setBookingDate("Saturday") },
                  { text: "Sunday", onPress: () => setBookingDate("Sunday") },
                ]);
              }}
            >
              <Ionicons name="calendar-outline" size={14} color={isDark ? "#00BCD4" : "#64748B"} style={{ marginRight: 6 }} />
              <Text style={[styles.scheduleRowText, textPrimary]} numberOfLines={1}>{bookingDate}</Text>
              <Ionicons name="chevron-forward" size={14} color={textSecondary.color} style={{ marginLeft: "auto" }} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.scheduleRowBtn, { marginTop: 6, backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "#F8FAFC", borderColor: isDark ? "rgba(255,255,255,0.1)" : "#E2E8F0" }]}
              onPress={() => {
                Alert.alert("Select Time Slot", "Choose preferred arrival time:", [
                  { text: "09:00 AM - 11:00 AM", onPress: () => setBookingTime("10:00 AM") },
                  { text: "02:00 PM - 04:00 PM", onPress: () => setBookingTime("03:00 PM") },
                  { text: "05:00 PM - 07:00 PM", onPress: () => setBookingTime("06:00 PM") },
                ]);
              }}
            >
              <Ionicons name="time-outline" size={14} color={isDark ? "#00BCD4" : "#64748B"} style={{ marginRight: 6 }} />
              <Text style={[styles.scheduleRowText, textPrimary]} numberOfLines={1}>{bookingTime}</Text>
              <Ionicons name="chevron-forward" size={14} color={textSecondary.color} style={{ marginLeft: "auto" }} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Coupon Code Card ────────────────────────────────────────── */}
        <View style={[styles.couponCard, cardBgStyle]}>
          <View style={styles.couponLeft}>
            <View style={[styles.couponIconCircle, { backgroundColor: isDark ? "rgba(124,58,237,0.18)" : "#EDE9FE" }]}>
              <Ionicons name="pricetag" size={18} color="#7C3AED" />
            </View>
            <View style={{ marginLeft: 10 }}>
              <Text style={[styles.couponTitle, textPrimary]}>Have a Coupon Code?</Text>
              <Text style={[styles.couponSub, textSecondary]}>Apply URBAN50 for ₹50 off</Text>
            </View>
          </View>

          <View style={styles.couponInputWrap}>
            <TextInput
              value={couponCode}
              onChangeText={setCouponCode}
              placeholder="e.g. URBAN50"
              placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
              autoCapitalize="characters"
              style={[styles.couponInputField, { color: isDark ? "#fff" : "#000", backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "#F8FAFC", borderColor: isDark ? "rgba(255,255,255,0.12)" : "#E2E8F0" }]}
            />
            <TouchableOpacity
              style={[styles.couponApplyBtn, couponApplied && { backgroundColor: "#059669" }]}
              onPress={handleApplyCoupon}
            >
              <Text style={styles.couponApplyText}>{couponApplied ? "APPLIED" : "APPLY"}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* ── Sticky Bottom Checkout Bar ───────────────────────────────── */}
      <View style={[styles.bottomBar, { backgroundColor: isDark ? "rgba(8,24,38,0.96)" : "#FFFFFF", borderTopColor: isDark ? "rgba(255,255,255,0.08)" : "#E2E8F0" }]}>
        <View style={styles.bottomPriceCol}>
          <Text style={styles.totalPriceLabel}>Total Amount</Text>
          <View style={styles.bottomPriceRow}>
            <Text style={[styles.bottomPriceMain, { color: isDark ? "#00BCD4" : "#0F766E" }]}>₹{finalPrice}</Text>
            <Text style={styles.bottomPriceOrig}>₹{originalPrice}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.confirmBookingBtn}
          onPress={handleConfirmBooking}
          disabled={loading}
          activeOpacity={0.88}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.confirmBtnText}>Confirm Booking</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={{ marginLeft: 6 }} />
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* ── Interactive Location Picker Modal ────────────────────────── */}
      <Modal visible={showLocationModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDark ? "#0D2135" : "#FFFFFF" }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, textPrimary]}>Select Service Address</Text>
              <TouchableOpacity onPress={() => setShowLocationModal(false)}>
                <Ionicons name="close" size={24} color={textPrimary.color} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalSub, textSecondary]}>
              Type your full address or select from quick saved locations:
            </Text>

            <TextInput
              value={customAddressInput}
              onChangeText={setCustomAddressInput}
              placeholder="House/Flat No, Street, Landmark, City..."
              placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
              style={[styles.modalInput, { color: isDark ? "#fff" : "#000", backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "#F8FAFC", borderColor: isDark ? "rgba(255,255,255,0.12)" : "#E2E8F0" }]}
              multiline
              numberOfLines={3}
            />

            {/* Quick Presets */}
            <View style={styles.presetsRow}>
              <TouchableOpacity
                style={[styles.presetChip, { backgroundColor: isDark ? "rgba(0,188,212,0.12)" : "#E0F2FE" }]}
                onPress={() => setCustomAddressInput("142, Orchid Greens, 2nd Cross, HSR Layout, Sector 4")}
              >
                <Ionicons name="home-outline" size={14} color={isDark ? "#00BCD4" : "#0284C7"} />
                <Text style={[styles.presetChipText, { color: isDark ? "#00BCD4" : "#0284C7" }]}>Home (HSR Layout)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.presetChip, { backgroundColor: isDark ? "rgba(16,185,129,0.12)" : "#DCFCE7" }]}
                onPress={() => setCustomAddressInput("CVFF+5H9, Morur, Tamil Nadu")}
              >
                <Ionicons name="navigate-outline" size={14} color="#059669" />
                <Text style={[styles.presetChipText, { color: "#059669" }]}>Current GPS Location</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.modalSaveBtn}
              onPress={handleSaveCustomAddress}
            >
              <Text style={styles.modalSaveBtnText}>Save Address & Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  headerSafe: {
    paddingBottom: 4,
  },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 8 : 12,
    paddingBottom: 6,
  },
  headerBackBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerBarTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  headerHeroWrap: {
    width: "100%",
    height: 90,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  headerHeroImg: {
    width: "100%",
    height: "100%",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },

  // Service Hero Card
  serviceHeroCard: {
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  serviceHeroTop: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  serviceIconContainer: {
    alignItems: "center",
    marginRight: 12,
  },
  serviceIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  heroPopularBadge: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  heroPopularBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#92400E",
  },
  serviceHeroInfo: {
    flex: 1,
    paddingRight: 6,
  },
  serviceHeroTitle: {
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 2,
  },
  serviceHeroDesc: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 8,
  },
  heroBadgesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  heroBadgeItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  heroBadgeText: {
    fontSize: 9.5,
    fontWeight: "700",
    color: "#166534",
  },
  serviceHeroPriceCol: {
    alignItems: "flex-end",
  },
  startsFromLabel: {
    fontSize: 10,
    color: "#94A3B8",
    fontWeight: "600",
  },
  priceWithArrow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginVertical: 2,
  },
  heroPriceMain: {
    fontSize: 17,
    fontWeight: "900",
  },
  heroPriceSlashed: {
    fontSize: 12,
    color: "#94A3B8",
    textDecorationLine: "line-through",
  },
  durationTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    marginTop: 2,
  },
  durationTagText: {
    fontSize: 10.5,
    fontWeight: "600",
  },

  // Quick Service Header
  quickServiceHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    marginTop: 4,
  },
  quickServiceTitleWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  lightningIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#DCFCE7",
    justifyContent: "center",
    alignItems: "center",
  },
  quickServiceTitle: {
    fontSize: 15,
    fontWeight: "800",
  },
  quickServiceSub: {
    fontSize: 11,
  },
  quickServiceDoodle: {
    fontSize: 11,
    color: "#059669",
    fontWeight: "600",
  },

  // Location Card
  locationSelectionCard: {
    flexDirection: "row",
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    marginBottom: 14,
    alignItems: "center",
    gap: 10,
  },
  locationCardLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  locationPinIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },
  locationCardTitle: {
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 2,
  },
  currentAddressText: {
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
    marginBottom: 2,
  },
  locationCardSub: {
    fontSize: 11,
    marginBottom: 8,
  },
  selectMapBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  selectMapBtnText: {
    fontSize: 11.5,
    fontWeight: "700",
  },
  mapGraphicPreviewWrap: {
    width: 80,
    height: 80,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(0,188,212,0.25)",
  },
  mapGraphicPreview: {
    width: "100%",
    height: "100%",
  },

  // Two columns
  twoColRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },
  halfCard: {
    flex: 1,
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  roundIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  halfCardTitle: {
    fontSize: 12.5,
    fontWeight: "800",
  },
  halfCardSub: {
    fontSize: 10,
  },
  phoneInputField: {
    height: 38,
    borderRadius: 10,
    paddingHorizontal: 10,
    fontSize: 13,
    fontWeight: "700",
  },
  phonePillBtn: {
    flexDirection: "row",
    alignItems: "center",
    height: 38,
    borderRadius: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
  },
  phonePillText: {
    fontSize: 12.5,
    fontWeight: "700",
  },
  scheduleRowBtn: {
    flexDirection: "row",
    alignItems: "center",
    height: 36,
    borderRadius: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
  },
  scheduleRowText: {
    fontSize: 11.5,
    fontWeight: "700",
    flex: 1,
  },

  // Coupon Card
  couponCard: {
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    marginBottom: 14,
  },
  couponLeft: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  couponIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  couponTitle: {
    fontSize: 13.5,
    fontWeight: "800",
  },
  couponSub: {
    fontSize: 11,
  },
  couponInputWrap: {
    flexDirection: "row",
    gap: 8,
  },
  couponInputField: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 13,
    fontWeight: "700",
  },
  couponApplyBtn: {
    backgroundColor: "#7C3AED",
    borderRadius: 12,
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  couponApplyText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },

  // Bottom Checkout Bar
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
    borderTopWidth: 1,
    elevation: 10,
  },
  bottomPriceCol: {
    flex: 1,
  },
  totalPriceLabel: {
    fontSize: 11,
    color: "#94A3B8",
    fontWeight: "600",
  },
  bottomPriceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
  },
  bottomPriceMain: {
    fontSize: 22,
    fontWeight: "900",
  },
  bottomPriceOrig: {
    fontSize: 13,
    color: "#94A3B8",
    textDecorationLine: "line-through",
  },
  confirmBookingBtn: {
    backgroundColor: "#0056D2",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 22,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#0056D2",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: Platform.OS === "ios" ? 38 : 24,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "800",
  },
  modalSub: {
    fontSize: 12,
    marginBottom: 14,
  },
  modalInput: {
    height: 80,
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    fontSize: 13.5,
    textAlignVertical: "top",
    marginBottom: 14,
  },
  presetsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 18,
  },
  presetChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  presetChipText: {
    fontSize: 12,
    fontWeight: "700",
  },
  modalSaveBtn: {
    backgroundColor: "#0056D2",
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  modalSaveBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
});
