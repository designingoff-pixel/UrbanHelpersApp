import React, { useState, useEffect, useRef } from "react";
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
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import MapView, { Marker, PROVIDER_GOOGLE, Region } from "react-native-maps";
import * as Location from "expo-location";
import { RootStackParamList } from "@/navigation/types";
import { SERVICE_CATEGORIES, SubService } from "./servicesData";
import { useAuth } from "@/context/AuthContext";
import { auth, db } from "@/services/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Props = NativeStackScreenProps<RootStackParamList, "ServiceDetail">;
const { width } = Dimensions.get("window");

export default function ServiceDetailScreen({ navigation, route }: Props) {
  const { categoryId, subServiceId } = route.params;
  const { user } = useAuth();
  const activeUser = auth.currentUser || user;

  const category =
    SERVICE_CATEGORIES.find((c) => c.id === categoryId) || SERVICE_CATEGORIES[0];
  const selectedSub: SubService =
    category.subServices.find((s) => s.id === subServiceId) ||
    category.subServices[0] || {
      id: "cl-restroom",
      name: "Restroom Cleaning",
      price: "₹399",
      duration: "60 min",
      description: "Tile scrub, commode, basin and mirror sanitisation.",
    };

  // User input states
  const [contactNumber, setContactNumber] = useState(
    activeUser?.phoneNumber || ""
  );
  const [isEditingPhone, setIsEditingPhone] = useState(false);

  const [serviceAddress, setServiceAddress] = useState(
    "142, Orchid Greens, 2nd Cross, Sector 4, Bangalore"
  );
  const [addressCoords, setAddressCoords] = useState<{ latitude: number; longitude: number }>({
    latitude: 12.9141,
    longitude: 77.6411,
  });

  const [bookingDate, setBookingDate] = useState("Thu, Oct 8, 2026");
  const [bookingTime, setBookingTime] = useState("10:00 AM");

  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);

  const [loading, setLoading] = useState(false);

  // Map Picker Modal States
  const [mapModalVisible, setMapModalVisible] = useState(false);
  const [mapLoading, setMapLoading] = useState(false);
  const [mapRegion, setMapRegion] = useState<Region>({
    latitude: 12.9141,
    longitude: 77.6411,
    latitudeDelta: 0.008,
    longitudeDelta: 0.008,
  });
  const [draggedAddress, setDraggedAddress] = useState(serviceAddress);
  const mapRef = useRef<MapView>(null);

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
              setDraggedAddress(p.address);
            }
          }
          const snap = await getDoc(doc(db, "users", uid));
          if (snap.exists()) {
            const d = snap.data();
            if (d.phone || d.mobile || d.phoneNumber) {
              setContactNumber(d.phone || d.mobile || d.phoneNumber);
            }
            if (d.address || d.deliveryAddress) {
              setServiceAddress(d.address || d.deliveryAddress);
              setDraggedAddress(d.address || d.deliveryAddress);
            }
          }
        }
      } catch (_) {}
    })();
  }, [activeUser?.uid]);

  // Open Map and fetch user's live GPS automatically
  const handleOpenMapPicker = async () => {
    setMapModalVisible(true);
    setMapLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Location Permission",
          "Please enable location access to automatically find your doorstep."
        );
        setMapLoading(false);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const newRegion: Region = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.006,
        longitudeDelta: 0.006,
      };

      setMapRegion(newRegion);
      mapRef.current?.animateToRegion(newRegion, 800);

      // Reverse geocode to get formatted address text
      const reverse = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });

      if (reverse && reverse.length > 0) {
        const place = reverse[0];
        const formatted = [
          place.name || place.street,
          place.district || place.subregion,
          place.city,
          place.postalCode,
        ]
          .filter(Boolean)
          .join(", ");

        const finalAddr = formatted || `${loc.coords.latitude.toFixed(4)}, ${loc.coords.longitude.toFixed(4)}`;
        setDraggedAddress(finalAddr);
        setAddressCoords({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
      }
    } catch (err) {
      console.warn("Location fetch error:", err);
    } finally {
      setMapLoading(false);
    }
  };

  // Reverse geocode on region change complete
  const handleRegionChangeComplete = async (region: Region) => {
    setMapRegion(region);
    try {
      const reverse = await Location.reverseGeocodeAsync({
        latitude: region.latitude,
        longitude: region.longitude,
      });
      if (reverse && reverse.length > 0) {
        const place = reverse[0];
        const formatted = [
          place.name || place.street,
          place.district || place.subregion,
          place.city,
          place.postalCode,
        ]
          .filter(Boolean)
          .join(", ");

        if (formatted) {
          setDraggedAddress(formatted);
          setAddressCoords({ latitude: region.latitude, longitude: region.longitude });
        }
      }
    } catch (_) {}
  };

  const handleConfirmMapLocation = () => {
    if (draggedAddress) {
      setServiceAddress(draggedAddress);
    }
    setMapModalVisible(false);
  };

  // Calculate pricing
  const basePriceNum = parseInt(selectedSub.price.replace(/[^\d]/g, ""), 10) || 399;
  const originalPrice = basePriceNum >= 500 ? basePriceNum + 300 : 699;
  const finalPrice = Math.max(99, basePriceNum - couponDiscount);

  const handleApplyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) {
      Alert.alert("Coupon Code", "Please enter a valid discount code.");
      return;
    }
    if (code === "URBAN50" || code === "SAVE50" || code === "CLEAN50") {
      setCouponDiscount(50);
      setCouponApplied(true);
      Alert.alert("Coupon Applied! 🎉", "₹50 discount applied to your order.");
    } else if (code === "URBAN100" || code === "WELCOME100") {
      setCouponDiscount(100);
      setCouponApplied(true);
      Alert.alert("Coupon Applied! 🎉", "₹100 discount applied to your order.");
    } else {
      Alert.alert("Invalid Coupon", "This coupon code is expired or invalid.");
    }
  };

  const handleConfirmBooking = async () => {
    if (!contactNumber.trim()) {
      Alert.alert("Phone Required", "Please enter your contact number for booking confirmation.");
      return;
    }
    if (!serviceAddress.trim()) {
      Alert.alert("Address Required", "Please select or type the service address.");
      return;
    }

    setLoading(true);
    try {
      const bookingId = "AP4" + Math.random().toString(36).substring(2, 7).toUpperCase();
      const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
      const uid = activeUser?.uid || `guest_${Date.now()}`;
      const custName = activeUser?.displayName || (activeUser?.email ? activeUser.email.split("@")[0] : "Customer");
      const scheduledDateTimeStr = `${bookingDate} at ${bookingTime}`;

      const bookingPayload = {
        id: bookingId,
        bookingId,
        customerId: uid,
        customerName: custName,
        customerPhone: contactNumber.trim(),
        customerEmail: activeUser?.email || "",
        address: serviceAddress.trim(),
        customerLat: addressCoords.latitude,
        customerLng: addressCoords.longitude,
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
        vendorName: null,
        vendorPhone: null,
        vendorImage: null,
        scheduledAt: scheduledDateTimeStr,
        bookingDate,
        bookingTime,
        duration: selectedSub.duration || "60 min",
        createdAt: new Date().toISOString(),
      };

      // Write booking to Firestore
      try {
        await setDoc(doc(db, "bookings", bookingId), bookingPayload);
      } catch (err) {
        console.warn("Firestore booking write warning:", err);
      }

      // Save to local cache
      try {
        const localKey = `@customer_bookings_${uid}`;
        const prev = await AsyncStorage.getItem(localKey);
        const list = prev ? JSON.parse(prev) : [];
        list.unshift(bookingPayload);
        await AsyncStorage.setItem(localKey, JSON.stringify(list));
      } catch (_) {}

      // Navigate to confirmation screen
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

  return (
    <View style={styles.root}>
      {/* ── Top Header matching Screenshot ────────────────────────────── */}
      <SafeAreaView edges={["top"]} style={styles.headerSafeArea}>
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBackBtn}>
            <Ionicons name="arrow-back" size={22} color="#0F172A" />
          </TouchableOpacity>

          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerTitleText}>{selectedSub.name}</Text>
            <Text style={styles.headerSubtitleText}>Clean  •  Fresh  •  Hygienic</Text>
          </View>

          <View style={styles.headerLeafTag}>
            <Text style={styles.leafTagIcon}>🌿</Text>
            <Text style={styles.leafTagText}>A healthier space{"\n"}for you</Text>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── 1. Hero Promo Card (Beautiful rendered banner tailored for any service) ── */}
        <View style={styles.heroBannerCard}>
          <LinearGradient
            colors={["#E0F2FE", "#F0FDFA", "#E6FFFA"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroBannerGradient}
          >
            <View style={styles.heroBannerTextCol}>
              <Text style={styles.heroSmallTag}>PROFESSIONAL {category.name.toUpperCase()} SERVICE</Text>
              <Text style={styles.heroMainHeading}>
                Sparkling {selectedSub.name.split(" ")[0]},{"\n"}Happier Spaces
              </Text>
              <Text style={styles.heroSubText}>
                We take care of your space so you can focus on what matters.
              </Text>

              {/* 3 Value Inset Badges */}
              <View style={styles.heroBadgesRow}>
                <View style={styles.heroBadgeItem}>
                  <Ionicons name="shield-checkmark" size={12} color="#0D9488" />
                  <Text style={styles.heroBadgeText}>Hygienic</Text>
                </View>
                <View style={styles.heroBadgeItem}>
                  <Ionicons name="leaf" size={12} color="#0D9488" />
                  <Text style={styles.heroBadgeText}>Eco-Friendly</Text>
                </View>
                <View style={styles.heroBadgeItem}>
                  <Ionicons name="star" size={12} color="#0D9488" />
                  <Text style={styles.heroBadgeText}>Trusted Staff</Text>
                </View>
              </View>
            </View>

            <View style={styles.heroBannerIconCol}>
              <View style={styles.heroIconBubble}>
                <Ionicons name={category.icon as any || "sparkles"} size={36} color="#0D9488" />
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* ── 2. Service Summary Card (Matching Design) ───────────────── */}
        <View style={styles.serviceSummaryCard}>
          <View style={styles.serviceSummaryLeft}>
            <View style={styles.mintIconBox}>
              <Ionicons name="sparkles" size={24} color="#0D9488" />
            </View>
            <View style={styles.serviceSummaryTextCol}>
              <Text style={styles.serviceSummaryTitle}>{selectedSub.name}</Text>
              <Text style={styles.serviceSummaryDesc} numberOfLines={2}>
                {selectedSub.description}
              </Text>
            </View>
          </View>

          <View style={styles.leafDividerImgWrap}>
            <Text style={{ fontSize: 24 }}>🌿</Text>
          </View>

          <View style={styles.serviceSummaryPriceCol}>
            <Text style={styles.startsFromSmall}>Starts from</Text>
            <View style={styles.priceWithSlashedRow}>
              <Text style={styles.priceGreenMain}>₹{basePriceNum}</Text>
              <Text style={styles.priceSlashedSmall}>₹{originalPrice}</Text>
            </View>
            <View style={styles.durationPill}>
              <Ionicons name="time-outline" size={13} color="#475569" />
              <Text style={styles.durationPillText}>{selectedSub.duration}</Text>
            </View>
          </View>
        </View>

        {/* ── 3. Service Address & Map Selector Card ──────────────────── */}
        <View style={styles.serviceAddressCard}>
          <View style={styles.addressCardHeader}>
            <View style={styles.greenPinCircle}>
              <Ionicons name="location" size={18} color="#0D9488" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.addressCardTitle}>Service Address</Text>
              <Text style={styles.addressCardSub}>Select your location on map</Text>
            </View>
          </View>

          {/* Interactive Map Graphic Card */}
          <View style={styles.mapGraphicCard}>
            <LinearGradient
              colors={["#EFF6FF", "#ECFDF5", "#F0FDFA"]}
              style={StyleSheet.absoluteFill}
            />

            {/* Subtle Grid / Street Vector Lines */}
            <View style={styles.vectorMapLines}>
              <View style={styles.mapRoad1} />
              <View style={styles.mapRoad2} />
              <View style={styles.mapRoad3} />
            </View>

            {/* Centered Map Pin */}
            <View style={styles.mapCenterPin}>
              <Ionicons name="location" size={32} color="#0F766E" />
            </View>

            {/* Clickable Select on Map Button */}
            <TouchableOpacity
              style={styles.selectOnMapFloatingBtn}
              onPress={handleOpenMapPicker}
              activeOpacity={0.88}
            >
              <Ionicons name="map-outline" size={16} color="#0F172A" style={{ marginRight: 6 }} />
              <Text style={styles.selectOnMapText}>Select on Map</Text>
              <Ionicons name="chevron-forward" size={14} color="#0F172A" style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          </View>

          {/* Selected Address Displayed Directly Below the Map */}
          <View style={styles.selectedAddressBelowMap}>
            <Ionicons name="navigate-circle-outline" size={18} color="#0D9488" style={{ marginTop: 2 }} />
            <Text style={styles.selectedAddressBelowText} numberOfLines={2}>
              {serviceAddress}
            </Text>
            <TouchableOpacity onPress={handleOpenMapPicker}>
              <Text style={styles.changeAddressLink}>Change</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── 4. Two Side-by-Side Cards: Contact Number & Schedule Slot ── */}
        <View style={styles.twoColsRow}>
          {/* Card 1: Contact Number */}
          <View style={styles.contactCard}>
            <View style={styles.cardHeaderSmall}>
              <View style={styles.bluePhoneCircle}>
                <Ionicons name="call" size={16} color="#0284C7" />
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.smallCardTitle}>Contact Number</Text>
                <Text style={styles.smallCardSub}>We will contact you</Text>
              </View>
            </View>

            {isEditingPhone ? (
              <TextInput
                value={contactNumber}
                onChangeText={setContactNumber}
                onBlur={() => setIsEditingPhone(false)}
                keyboardType="phone-pad"
                placeholder="Enter mobile"
                style={styles.phoneInputActive}
                autoFocus
              />
            ) : (
              <TouchableOpacity
                style={styles.whiteInputPill}
                onPress={() => setIsEditingPhone(true)}
              >
                <Ionicons name="call-outline" size={15} color="#0F172A" style={{ marginRight: 8 }} />
                <Text style={styles.phoneTextMain} numberOfLines={1}>
                  {contactNumber || "Add phone number"}
                </Text>
                <Ionicons name="pencil" size={14} color="#64748B" style={{ marginLeft: "auto" }} />
              </TouchableOpacity>
            )}
          </View>

          {/* Card 2: Schedule Slot */}
          <View style={styles.scheduleCard}>
            <View style={styles.cardHeaderSmall}>
              <View style={styles.purpleCalCircle}>
                <Ionicons name="calendar" size={16} color="#7C3AED" />
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.smallCardTitle}>Schedule Slot</Text>
                <Text style={styles.smallCardSub}>Preferred arrival</Text>
              </View>
            </View>

            {/* Date Pill */}
            <TouchableOpacity
              style={styles.whiteInputPill}
              onPress={() => {
                Alert.alert("Select Date", "Choose arrival day:", [
                  { text: "Today", onPress: () => setBookingDate("Thu, Oct 8, 2026") },
                  { text: "Tomorrow", onPress: () => setBookingDate("Fri, Oct 9, 2026") },
                  { text: "Saturday", onPress: () => setBookingDate("Sat, Oct 10, 2026") },
                ]);
              }}
            >
              <Ionicons name="calendar-outline" size={15} color="#64748B" style={{ marginRight: 6 }} />
              <Text style={styles.schedulePillText} numberOfLines={1}>{bookingDate}</Text>
              <Ionicons name="chevron-forward" size={14} color="#94A3B8" style={{ marginLeft: "auto" }} />
            </TouchableOpacity>

            {/* Time Pill */}
            <TouchableOpacity
              style={[styles.whiteInputPill, { marginTop: 6 }]}
              onPress={() => {
                Alert.alert("Select Time Slot", "Choose preferred arrival time:", [
                  { text: "09:00 AM", onPress: () => setBookingTime("09:00 AM") },
                  { text: "10:00 AM", onPress: () => setBookingTime("10:00 AM") },
                  { text: "02:00 PM", onPress: () => setBookingTime("02:00 PM") },
                  { text: "05:00 PM", onPress: () => setBookingTime("05:00 PM") },
                ]);
              }}
            >
              <Ionicons name="time-outline" size={15} color="#64748B" style={{ marginRight: 6 }} />
              <Text style={styles.schedulePillText} numberOfLines={1}>{bookingTime}</Text>
              <Ionicons name="chevron-forward" size={14} color="#94A3B8" style={{ marginLeft: "auto" }} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── 5. Have a Coupon Code? Card ─────────────────────────────── */}
        <View style={styles.couponCard}>
          <View style={styles.couponHeaderRow}>
            <View style={styles.peachGiftCircle}>
              <Ionicons name="gift" size={16} color="#EA580C" />
            </View>
            <View style={{ marginLeft: 8 }}>
              <Text style={styles.couponCardTitle}>Have a Coupon Code?</Text>
              <Text style={styles.couponCardSub}>Apply URBAN50 for ₹50 off</Text>
            </View>
          </View>

          <View style={styles.couponInputRow}>
            <TextInput
              value={couponCode}
              onChangeText={setCouponCode}
              placeholder="e.g. URBAN50"
              placeholderTextColor="#94A3B8"
              autoCapitalize="characters"
              style={styles.couponTextInput}
            />
            <TouchableOpacity
              style={[styles.couponApplyBtn, couponApplied && { backgroundColor: "#059669" }]}
              onPress={handleApplyCoupon}
              activeOpacity={0.85}
            >
              <Text style={styles.couponApplyBtnText}>{couponApplied ? "APPLIED" : "APPLY"}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ── 6. Bottom Sticky Checkout Bar ────────────────────────────── */}
      <View style={styles.bottomStickyBar}>
        <View style={styles.bottomPriceWrap}>
          <Text style={styles.totalAmountLabel}>Total Amount</Text>
          <View style={styles.totalPriceRow}>
            <Text style={styles.totalPriceGreen}>₹{finalPrice}</Text>
            <Text style={styles.totalPriceSlashed}>₹{originalPrice}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.confirmBookingMainBtn}
          onPress={handleConfirmBooking}
          disabled={loading}
          activeOpacity={0.88}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.confirmBookingMainBtnText}>Confirm Booking</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={{ marginLeft: 8 }} />
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* ── 7. Full-Screen Interactive Google Map Modal ──────────────── */}
      <Modal visible={mapModalVisible} animationType="slide">
        <SafeAreaView style={styles.mapModalRoot} edges={["top", "bottom"]}>
          {/* Modal Header */}
          <View style={styles.mapModalHeader}>
            <TouchableOpacity onPress={() => setMapModalVisible(false)} style={styles.mapCloseBtn}>
              <Ionicons name="close" size={24} color="#0F172A" />
            </TouchableOpacity>
            <Text style={styles.mapModalHeaderTitle}>Select Delivery Doorstep</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Interactive Google Map */}
          <View style={styles.mapViewContainer}>
            <MapView
              ref={mapRef}
              style={styles.fullMapView}
              provider={PROVIDER_GOOGLE}
              initialRegion={mapRegion}
              onRegionChangeComplete={handleRegionChangeComplete}
              showsUserLocation={true}
              showsMyLocationButton={false}
            />

            {/* Fixed Center Pin */}
            <View style={styles.fixedCenterPinWrap} pointerEvents="none">
              <View style={styles.pinBubble}>
                <Text style={styles.pinBubbleText}>Service Location</Text>
              </View>
              <Ionicons name="location" size={42} color="#0F766E" style={{ marginTop: -4 }} />
              <View style={styles.pinShadowDot} />
            </View>

            {/* GPS Recenter Floating Button */}
            <TouchableOpacity
              style={styles.gpsRecenterBtn}
              onPress={handleOpenMapPicker}
            >
              <Ionicons name="locate" size={22} color="#0F766E" />
            </TouchableOpacity>
          </View>

          {/* Bottom Selected Location Card */}
          <View style={styles.mapBottomCard}>
            <View style={styles.mapAddressInfoRow}>
              <Ionicons name="location-outline" size={24} color="#0F766E" style={{ marginTop: 2 }} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.mapSelectedTitle}>Selected Doorstep</Text>
                <Text style={styles.mapSelectedAddress} numberOfLines={2}>
                  {draggedAddress}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.useThisLocationBtn}
              onPress={handleConfirmMapLocation}
            >
              <Text style={styles.useThisLocationText}>Confirm Location</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  headerSafeArea: {
    backgroundColor: "#FFFFFF",
  },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 4 : 8,
    paddingBottom: 10,
    backgroundColor: "#FFFFFF",
  },
  headerBackBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitleWrap: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitleText: {
    fontSize: 20,
    fontWeight: "900",
    color: "#0F172A",
  },
  headerSubtitleText: {
    fontSize: 12,
    color: "#0D9488",
    fontWeight: "600",
    marginTop: 1,
  },
  headerLeafTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  leafTagIcon: {
    fontSize: 14,
  },
  leafTagText: {
    fontSize: 10,
    color: "#475569",
    fontWeight: "600",
    lineHeight: 12,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },

  // 1. Hero Promo Banner
  heroBannerCard: {
    width: "100%",
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  heroBannerGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  heroBannerTextCol: {
    flex: 1,
    paddingRight: 8,
  },
  heroSmallTag: {
    fontSize: 9.5,
    fontWeight: "800",
    color: "#0D9488",
    letterSpacing: 0.8,
    marginBottom: 3,
  },
  heroMainHeading: {
    fontSize: 17,
    fontWeight: "900",
    color: "#0F172A",
    lineHeight: 22,
    marginBottom: 4,
  },
  heroSubText: {
    fontSize: 11,
    color: "#64748B",
    lineHeight: 15,
    marginBottom: 10,
  },
  heroBadgesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  heroBadgeItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#CCFBF1",
  },
  heroBadgeText: {
    fontSize: 9.5,
    fontWeight: "700",
    color: "#0F766E",
  },
  heroBannerIconCol: {
    justifyContent: "center",
    alignItems: "center",
  },
  heroIconBubble: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#CCFBF1",
    justifyContent: "center",
    alignItems: "center",
  },

  // 2. Service Summary Card
  serviceSummaryCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDFA",
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: "#CCFBF1",
    marginBottom: 12,
  },
  serviceSummaryLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  mintIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#CCFBF1",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  serviceSummaryTextCol: {
    flex: 1,
    paddingRight: 4,
  },
  serviceSummaryTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 2,
  },
  serviceSummaryDesc: {
    fontSize: 11,
    color: "#64748B",
    lineHeight: 15,
  },
  leafDividerImgWrap: {
    marginHorizontal: 4,
  },
  serviceSummaryPriceCol: {
    alignItems: "flex-end",
  },
  startsFromSmall: {
    fontSize: 10,
    color: "#94A3B8",
    fontWeight: "600",
  },
  priceWithSlashedRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
    marginVertical: 1,
  },
  priceGreenMain: {
    fontSize: 18,
    fontWeight: "900",
    color: "#0F766E",
  },
  priceSlashedSmall: {
    fontSize: 12,
    color: "#94A3B8",
    textDecorationLine: "line-through",
  },
  durationPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  durationPillText: {
    fontSize: 10.5,
    fontWeight: "700",
    color: "#0F172A",
  },

  // 3. Service Address Card
  serviceAddressCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    marginBottom: 12,
    elevation: 1,
  },
  addressCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  greenPinCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#CCFBF1",
    justifyContent: "center",
    alignItems: "center",
  },
  addressCardTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
  },
  addressCardSub: {
    fontSize: 11.5,
    color: "#64748B",
    marginTop: 1,
  },
  mapGraphicCard: {
    width: "100%",
    height: 125,
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  vectorMapLines: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.35,
  },
  mapRoad1: {
    position: "absolute",
    top: 30,
    left: -20,
    right: -20,
    height: 12,
    backgroundColor: "#CBD5E1",
    transform: [{ rotate: "-15deg" }],
  },
  mapRoad2: {
    position: "absolute",
    bottom: 25,
    left: -20,
    right: -20,
    height: 10,
    backgroundColor: "#CBD5E1",
    transform: [{ rotate: "10deg" }],
  },
  mapRoad3: {
    position: "absolute",
    left: "40%",
    top: -20,
    bottom: -20,
    width: 10,
    backgroundColor: "#CBD5E1",
  },
  mapCenterPin: {
    position: "absolute",
    top: 20,
    alignSelf: "center",
  },
  selectOnMapFloatingBtn: {
    position: "absolute",
    bottom: 12,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  selectOnMapText: {
    fontSize: 12.5,
    fontWeight: "800",
    color: "#0F172A",
  },
  selectedAddressBelowMap: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 10,
    marginTop: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  selectedAddressBelowText: {
    flex: 1,
    fontSize: 12,
    color: "#1E293B",
    fontWeight: "600",
    lineHeight: 17,
  },
  changeAddressLink: {
    fontSize: 12,
    fontWeight: "800",
    color: "#0D9488",
    marginLeft: 4,
  },

  // 4. Two Column Cards
  twoColsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },
  contactCard: {
    flex: 1,
    backgroundColor: "#F0F9FF",
    borderRadius: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E0F2FE",
  },
  scheduleCard: {
    flex: 1,
    backgroundColor: "#FAF5FF",
    borderRadius: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: "#F3E8FF",
  },
  cardHeaderSmall: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  bluePhoneCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E0F2FE",
    justifyContent: "center",
    alignItems: "center",
  },
  purpleCalCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F3E8FF",
    justifyContent: "center",
    alignItems: "center",
  },
  smallCardTitle: {
    fontSize: 12.5,
    fontWeight: "800",
    color: "#0F172A",
  },
  smallCardSub: {
    fontSize: 10,
    color: "#64748B",
  },
  whiteInputPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    height: 38,
    borderRadius: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  phoneTextMain: {
    fontSize: 12.5,
    fontWeight: "800",
    color: "#0F172A",
    flex: 1,
  },
  phoneInputActive: {
    backgroundColor: "#FFFFFF",
    height: 38,
    borderRadius: 12,
    paddingHorizontal: 10,
    fontSize: 12.5,
    fontWeight: "800",
    color: "#0F172A",
    borderWidth: 1.5,
    borderColor: "#0284C7",
  },
  schedulePillText: {
    fontSize: 11.5,
    fontWeight: "700",
    color: "#0F172A",
    flex: 1,
  },

  // 5. Coupon Card
  couponCard: {
    backgroundColor: "#FFF7ED",
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: "#FFEDD5",
    marginBottom: 12,
  },
  couponHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  peachGiftCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#FFEDD5",
    justifyContent: "center",
    alignItems: "center",
  },
  couponCardTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0F172A",
  },
  couponCardSub: {
    fontSize: 10.5,
    color: "#64748B",
  },
  couponInputRow: {
    flexDirection: "row",
    gap: 8,
  },
  couponTextInput: {
    flex: 1,
    height: 42,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FED7AA",
    paddingHorizontal: 12,
    fontSize: 13,
    fontWeight: "800",
    color: "#0F172A",
  },
  couponApplyBtn: {
    backgroundColor: "#FDBA74",
    paddingHorizontal: 18,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  couponApplyBtnText: {
    fontSize: 12,
    fontWeight: "900",
    color: "#FFFFFF",
  },

  // 6. Bottom Checkout Bar
  bottomStickyBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 34 : 16,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  bottomPriceWrap: {
    flex: 1,
  },
  totalAmountLabel: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "600",
  },
  totalPriceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
  },
  totalPriceGreen: {
    fontSize: 22,
    fontWeight: "900",
    color: "#0F766E",
  },
  totalPriceSlashed: {
    fontSize: 13,
    color: "#94A3B8",
    textDecorationLine: "line-through",
  },
  confirmBookingMainBtn: {
    backgroundColor: "#0F766E",
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: 24,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#0F766E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmBookingMainBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },

  // 7. Full Map Modal
  mapModalRoot: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  mapModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  mapCloseBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  mapModalHeaderTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },
  mapViewContainer: {
    flex: 1,
    position: "relative",
  },
  fullMapView: {
    width: "100%",
    height: "100%",
  },
  fixedCenterPinWrap: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -48,
    marginTop: -54,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  pinBubble: {
    backgroundColor: "#0F172A",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pinBubbleText: {
    color: "#FFFFFF",
    fontSize: 10.5,
    fontWeight: "700",
  },
  pinShadowDot: {
    width: 10,
    height: 4,
    borderRadius: 5,
    backgroundColor: "rgba(0,0,0,0.3)",
    marginTop: -2,
  },
  gpsRecenterBtn: {
    position: "absolute",
    bottom: 16,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  mapBottomCard: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
  },
  mapAddressInfoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  mapSelectedTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748B",
    textTransform: "uppercase",
  },
  mapSelectedAddress: {
    fontSize: 14.5,
    fontWeight: "800",
    color: "#0F172A",
    marginTop: 2,
    lineHeight: 20,
  },
  useThisLocationBtn: {
    backgroundColor: "#0F766E",
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0F766E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  useThisLocationText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },
});
