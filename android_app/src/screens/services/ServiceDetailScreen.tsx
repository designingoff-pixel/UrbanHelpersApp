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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/types";
import { SERVICE_CATEGORIES, SubService } from "./servicesData";
import { useAuth } from "@/context/AuthContext";
import { auth, db } from "@/services/firebase";
import { collection, doc, getDoc, setDoc } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Props = NativeStackScreenProps<RootStackParamList, "ServiceDetail">;
const { width } = Dimensions.get("window");

const SUB_FILTERS = [
  { id: "all", label: "All", icon: "home" },
  { id: "bathroom", label: "Bathroom", icon: "water" },
  { id: "kitchen", label: "Kitchen", icon: "restaurant" },
  { id: "windows", label: "Windows", icon: "grid" },
  { id: "deep", label: "Deep Clean", icon: "sparkles" },
];

export default function ServiceDetailScreen({ navigation, route }: Props) {
  const { categoryId, subServiceId } = route.params;
  const { user } = useAuth();
  const activeUser = auth.currentUser || user;

  const category = SERVICE_CATEGORIES.find((c) => c.id === categoryId) || SERVICE_CATEGORIES[0];
  const initialSub =
    category.subServices.find((s) => s.id === subServiceId) ||
    category.subServices[0] || {
      id: "cl-general",
      name: "Standard Package",
      price: "₹600",
      duration: "5 hrs",
      description: "Professional cleaning for a healthier, safer and fresher home.",
    };

  const [selectedSub, setSelectedSub] = useState<SubService>(initialSub);
  const [activeFilter, setActiveFilter] = useState("all");

  // User input states
  const [contactNumber, setContactNumber] = useState(
    activeUser?.phoneNumber || "9923658705"
  );
  const [isEditingPhone, setIsEditingPhone] = useState(false);

  const [serviceAddress, setServiceAddress] = useState(
    "CVFF+5H9, Morur, Tamil Nadu"
  );
  const [isEditingAddress, setIsEditingAddress] = useState(false);

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
            if (p.address && p.address.trim()) setServiceAddress(p.address);
          }
          const snap = await getDoc(doc(db, "users", uid));
          if (snap.exists()) {
            const d = snap.data();
            if (d.phone || d.mobile) setContactNumber(d.phone || d.mobile);
            if (d.address || d.deliveryAddress) setServiceAddress(d.address || d.deliveryAddress);
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
        scheduledAt: `${bookingDate} at ${bookingTime}`,
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

      // 3. Navigate directly to BookingConfirmedScreen
      navigation.navigate("BookingConfirmed", {
        bookingId,
        booking: bookingPayload,
      } as any);
    } catch (e: any) {
      Alert.alert("Booking Error", e.message || "Failed to confirm booking. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      {/* ── Top Dark Gradient Header ──────────────────────────────────── */}
      <SafeAreaView edges={["top"]} style={styles.headerSafe}>
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBackBtn}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
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
        <View style={styles.serviceHeroCard}>
          <View style={styles.serviceHeroTop}>
            <View style={styles.serviceIconContainer}>
              <View style={styles.serviceIconCircle}>
                <Ionicons name="home" size={28} color="#0056D2" />
              </View>
              <View style={styles.heroPopularBadge}>
                <Ionicons name="star" size={10} color="#92400E" />
                <Text style={styles.heroPopularBadgeText}>Most Popular</Text>
              </View>
            </View>

            <View style={styles.serviceHeroInfo}>
              <Text style={styles.serviceHeroTitle}>{selectedSub.name}</Text>
              <Text style={styles.serviceHeroDesc}>{selectedSub.description}</Text>

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

            {/* Right: Starts from Price & Duration */}
            <View style={styles.serviceHeroPriceCol}>
              <Text style={styles.startsFromLabel}>Starts from</Text>
              <View style={styles.priceWithArrow}>
                <Text style={styles.heroPriceMain}>₹{basePriceNum}</Text>
                <Text style={styles.heroPriceSlashed}>₹{originalPrice}</Text>
                <Ionicons name="chevron-forward" size={16} color="#0F766E" />
              </View>
              <View style={styles.durationTag}>
                <Ionicons name="time-outline" size={12} color="#64748B" />
                <Text style={styles.durationTagText}>{selectedSub.duration}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── Sub-Category Pills ──────────────────────────────────────── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pillsRow}
        >
          {SUB_FILTERS.map((f) => {
            const isActive = activeFilter === f.id;
            return (
              <TouchableOpacity
                key={f.id}
                onPress={() => {
                  setActiveFilter(f.id);
                  if (f.id === "all") setSelectedSub(category.subServices[0] || initialSub);
                  else if (f.id === "bathroom")
                    setSelectedSub(
                      category.subServices.find((s) => s.id.includes("restroom")) || initialSub
                    );
                  else if (f.id === "kitchen")
                    setSelectedSub(
                      category.subServices.find((s) => s.id.includes("kitchen")) || initialSub
                    );
                  else if (f.id === "windows")
                    setSelectedSub(
                      category.subServices.find((s) => s.id.includes("window")) || initialSub
                    );
                  else if (f.id === "deep")
                    setSelectedSub(
                      category.subServices.find((s) => s.id.includes("full") || s.id.includes("tank")) ||
                        initialSub
                    );
                }}
                style={[styles.pillBtn, isActive && styles.pillBtnActive]}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={f.icon as any}
                  size={15}
                  color={isActive ? "#FFFFFF" : "#0F766E"}
                  style={{ marginRight: 6 }}
                />
                <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ── Quick Service Header ────────────────────────────────────── */}
        <View style={styles.quickServiceHeaderRow}>
          <View style={styles.quickServiceTitleWrap}>
            <View style={styles.lightningIconWrap}>
              <Ionicons name="flash" size={16} color="#059669" />
            </View>
            <View>
              <Text style={styles.quickServiceTitle}>Quick Service</Text>
              <Text style={styles.quickServiceSub}>Book in just a few taps</Text>
            </View>
          </View>
          <Text style={styles.quickServiceDoodle}>Your clean is our priority 🌿</Text>
        </View>

        {/* ── Location Map Selection Card ─────────────────────────────── */}
        <View style={styles.locationSelectionCard}>
          <View style={styles.locationCardLeft}>
            <View style={styles.locationPinIconWrap}>
              <Ionicons name="location" size={20} color="#0056D2" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.locationCardTitle}>Service Address</Text>
              <Text style={styles.locationCardSub}>
                Select the location where you want the service
              </Text>
              <TouchableOpacity
                style={styles.selectMapBtn}
                onPress={() => setIsEditingAddress(true)}
              >
                <Ionicons name="map-outline" size={16} color="#0056D2" style={{ marginRight: 6 }} />
                <Text style={styles.selectMapBtnText}>Select Location on Map</Text>
                <Ionicons name="chevron-forward" size={14} color="#0056D2" style={{ marginLeft: 4 }} />
              </TouchableOpacity>
            </View>
          </View>

          <Image
            source={require("../../../assets/service_map_preview.png")}
            style={styles.mapGraphicPreview}
            resizeMode="contain"
          />
        </View>

        {/* ── Two Columns: Contact Number + Select Date & Time ────────── */}
        <View style={styles.twoColRow}>
          {/* Contact Number Card */}
          <View style={styles.halfCard}>
            <View style={styles.cardHeaderRow}>
              <View style={[styles.roundIconWrap, { backgroundColor: "#DCFCE7" }]}>
                <Ionicons name="call" size={16} color="#15803D" />
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.halfCardTitle}>Contact Number</Text>
                <Text style={styles.halfCardSub}>We will contact you</Text>
              </View>
            </View>

            {isEditingPhone ? (
              <TextInput
                value={contactNumber}
                onChangeText={setContactNumber}
                onBlur={() => setIsEditingPhone(false)}
                keyboardType="phone-pad"
                style={styles.phoneInputField}
                autoFocus
              />
            ) : (
              <TouchableOpacity
                style={styles.phonePillBtn}
                onPress={() => setIsEditingPhone(true)}
              >
                <Ionicons name="call-outline" size={14} color="#0F172A" style={{ marginRight: 6 }} />
                <Text style={styles.phonePillText}>{contactNumber}</Text>
                <Ionicons name="pencil-outline" size={14} color="#64748B" style={{ marginLeft: "auto" }} />
              </TouchableOpacity>
            )}
          </View>

          {/* Date & Time Card */}
          <View style={styles.halfCard}>
            <View style={styles.cardHeaderRow}>
              <View style={[styles.roundIconWrap, { backgroundColor: "#EDE9FE" }]}>
                <Ionicons name="calendar" size={16} color="#7C3AED" />
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.halfCardTitle}>Select Date & Time</Text>
                <Text style={styles.halfCardSub}>Preferred schedule</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.scheduleRowBtn}
              onPress={() => {
                Alert.alert("Select Date", "Choose service appointment day:", [
                  { text: "Today (Oct 8)", onPress: () => setBookingDate("Thu, Oct 8, 2026") },
                  { text: "Tomorrow (Oct 9)", onPress: () => setBookingDate("Fri, Oct 9, 2026") },
                  { text: "Saturday (Oct 10)", onPress: () => setBookingDate("Sat, Oct 10, 2026") },
                ]);
              }}
            >
              <Ionicons name="calendar-outline" size={14} color="#64748B" style={{ marginRight: 6 }} />
              <Text style={styles.scheduleRowText}>{bookingDate}</Text>
              <Ionicons name="chevron-forward" size={14} color="#94A3B8" style={{ marginLeft: "auto" }} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.scheduleRowBtn, { marginTop: 6 }]}
              onPress={() => {
                Alert.alert("Select Time Slot", "Choose preferred arrival time:", [
                  { text: "09:00 AM - 11:00 AM", onPress: () => setBookingTime("10:00 AM") },
                  { text: "02:00 PM - 04:00 PM", onPress: () => setBookingTime("03:00 PM") },
                  { text: "05:00 PM - 07:00 PM", onPress: () => setBookingTime("06:00 PM") },
                ]);
              }}
            >
              <Ionicons name="time-outline" size={14} color="#64748B" style={{ marginRight: 6 }} />
              <Text style={styles.scheduleRowText}>{bookingTime}</Text>
              <Ionicons name="chevron-forward" size={14} color="#94A3B8" style={{ marginLeft: "auto" }} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Coupon Code Card ────────────────────────────────────────── */}
        <View style={styles.couponCard}>
          <View style={styles.couponLeft}>
            <View style={styles.couponIconCircle}>
              <Ionicons name="pricetag" size={18} color="#7C3AED" />
            </View>
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.couponTitle}>Have a Coupon Code?</Text>
              <Text style={styles.couponSub}>Apply and get exclusive discounts</Text>
            </View>
          </View>

          <View style={styles.couponInputWrap}>
            <TextInput
              value={couponCode}
              onChangeText={setCouponCode}
              placeholder="Enter coupon code"
              placeholderTextColor="#94A3B8"
              autoCapitalize="characters"
              style={styles.couponInput}
              editable={!couponApplied}
            />
            <TouchableOpacity
              style={[styles.couponApplyBtn, couponApplied && styles.couponAppliedBtn]}
              onPress={handleApplyCoupon}
              disabled={couponApplied}
            >
              <Text style={styles.couponApplyText}>{couponApplied ? "Applied" : "Apply"}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Selected Address Preview ────────────────────────────────── */}
        <View style={styles.addressPreviewCard}>
          <Ionicons name="location" size={20} color="#0056D2" style={{ marginRight: 10 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.addressPreviewLabel}>Service Address</Text>
            {isEditingAddress ? (
              <TextInput
                value={serviceAddress}
                onChangeText={setServiceAddress}
                onBlur={() => setIsEditingAddress(false)}
                style={styles.addressInputField}
                autoFocus
              />
            ) : (
              <Text style={styles.addressPreviewText} numberOfLines={2}>
                {serviceAddress}
              </Text>
            )}
          </View>
          <TouchableOpacity onPress={() => setIsEditingAddress(!isEditingAddress)}>
            <Ionicons name="pencil-outline" size={18} color="#64748B" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ── Sticky Bottom Checkout Bar ───────────────────────────────── */}
      <SafeAreaView edges={["bottom"]} style={styles.bottomBarSafe}>
        <View style={styles.bottomBarContainer}>
          <View style={styles.bottomPriceCol}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <Text style={styles.bottomPriceLabel}>Total Amount</Text>
              <Ionicons name="information-circle-outline" size={14} color="#94A3B8" />
            </View>
            <Text style={styles.bottomPriceAmount}>₹{finalPrice}</Text>
          </View>

          <View style={styles.bottomSecurityCol}>
            <Ionicons name="shield-checkmark" size={16} color="#059669" />
            <Text style={styles.bottomSecurityText}>Secure & Safe{"\n"}Payment</Text>
          </View>

          <TouchableOpacity
            style={styles.confirmBtn}
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
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F1F5F9",
  },
  headerSafe: {
    backgroundColor: "#0B2238",
  },
  headerBar: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  headerBackBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
  },
  headerHeroWrap: {
    width: "100%",
    height: 120,
    justifyContent: "center",
    alignItems: "center",
  },
  headerHeroImg: {
    width: "98%",
    height: "100%",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 110,
  },
  serviceHeroCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  serviceHeroTop: {
    flexDirection: "row",
    alignItems: "center",
  },
  serviceIconContainer: {
    alignItems: "center",
    marginRight: 12,
  },
  serviceIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },
  heroPopularBadge: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    marginTop: 4,
  },
  heroPopularBadgeText: {
    fontSize: 7.5,
    fontWeight: "800",
    color: "#92400E",
  },
  serviceHeroInfo: {
    flex: 1,
  },
  serviceHeroTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 2,
  },
  serviceHeroDesc: {
    fontSize: 11,
    color: "#64748B",
    lineHeight: 15,
    marginBottom: 6,
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
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
  },
  heroBadgeText: {
    fontSize: 9.5,
    fontWeight: "700",
    color: "#059669",
  },
  serviceHeroPriceCol: {
    alignItems: "flex-end",
    marginLeft: 8,
  },
  startsFromLabel: {
    fontSize: 10.5,
    color: "#64748B",
    fontWeight: "600",
  },
  priceWithArrow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginVertical: 2,
  },
  heroPriceMain: {
    fontSize: 16,
    fontWeight: "900",
    color: "#0F766E",
  },
  heroPriceSlashed: {
    fontSize: 11.5,
    color: "#94A3B8",
    textDecorationLine: "line-through",
  },
  durationTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  durationTagText: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "600",
  },
  pillsRow: {
    gap: 8,
    marginBottom: 16,
  },
  pillBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  pillBtnActive: {
    backgroundColor: "#0F766E",
    borderColor: "#0F766E",
  },
  pillText: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#0F766E",
  },
  pillTextActive: {
    color: "#FFFFFF",
  },
  quickServiceHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  quickServiceTitleWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  lightningIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#DCFCE7",
    justifyContent: "center",
    alignItems: "center",
  },
  quickServiceTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
  },
  quickServiceSub: {
    fontSize: 11,
    color: "#64748B",
  },
  quickServiceDoodle: {
    fontSize: 11,
    fontStyle: "italic",
    color: "#059669",
    fontWeight: "600",
  },
  locationSelectionCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    marginBottom: 14,
  },
  locationCardLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  locationPinIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  locationCardTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
  },
  locationCardSub: {
    fontSize: 11,
    color: "#64748B",
    marginVertical: 4,
  },
  selectMapBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginTop: 4,
  },
  selectMapBtnText: {
    fontSize: 11.5,
    fontWeight: "700",
    color: "#0056D2",
  },
  mapGraphicPreview: {
    width: 110,
    height: 75,
    marginLeft: 8,
  },
  twoColRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },
  halfCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  roundIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  halfCardTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#0F172A",
  },
  halfCardSub: {
    fontSize: 9.5,
    color: "#64748B",
  },
  phonePillBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  phonePillText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0F172A",
  },
  phoneInputField: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0F172A",
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#0056D2",
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  scheduleRowBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  scheduleRowText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#0F172A",
  },
  couponCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 14,
  },
  couponLeft: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  couponIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: "#F3E8FF",
    justifyContent: "center",
    alignItems: "center",
  },
  couponTitle: {
    fontSize: 13.5,
    fontWeight: "800",
    color: "#0F172A",
  },
  couponSub: {
    fontSize: 11,
    color: "#64748B",
  },
  couponInputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  couponInput: {
    flex: 1,
    height: 40,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 12,
    fontSize: 12.5,
    color: "#0F172A",
  },
  couponApplyBtn: {
    backgroundColor: "#0F766E",
    paddingHorizontal: 16,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  couponAppliedBtn: {
    backgroundColor: "#059669",
  },
  couponApplyText: {
    color: "#FFFFFF",
    fontSize: 12.5,
    fontWeight: "700",
  },
  addressPreviewCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  addressPreviewLabel: {
    fontSize: 10.5,
    fontWeight: "700",
    color: "#64748B",
    textTransform: "uppercase",
  },
  addressPreviewText: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#0F172A",
    marginTop: 2,
  },
  addressInputField: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#0F172A",
    borderBottomWidth: 1,
    borderBottomColor: "#0056D2",
    paddingVertical: 2,
  },
  bottomBarSafe: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#0B2238",
  },
  bottomBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  bottomPriceCol: {
    justifyContent: "center",
  },
  bottomPriceLabel: {
    fontSize: 11,
    color: "#94A3B8",
    fontWeight: "600",
  },
  bottomPriceAmount: {
    fontSize: 20,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  bottomSecurityCol: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  bottomSecurityText: {
    fontSize: 10,
    color: "#94A3B8",
    fontWeight: "600",
    lineHeight: 13,
  },
  confirmBtn: {
    backgroundColor: "#10B981",
    paddingHorizontal: 18,
    height: 46,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmBtnText: {
    color: "#0F172A",
    fontSize: 14.5,
    fontWeight: "900",
  },
});
