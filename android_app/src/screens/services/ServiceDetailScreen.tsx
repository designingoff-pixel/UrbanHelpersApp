/**
 * ServiceDetailScreen — booking flow
 * Package display → Address (Home/Office/Add New with Map & Autocomplete) → Date/Time picker → Confirm button
 */
import React, { useState, useRef, useEffect } from "react";
import {
  ActivityIndicator, Alert,
  ScrollView, Text, View, Pressable, StyleSheet,
  TextInput, Dimensions, Image, Modal, FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as Location from "expo-location";
import MapView, { Marker, Region, PROVIDER_GOOGLE } from "react-native-maps";
import DateTimePicker from "@react-native-community/datetimepicker";
import { RootStackParamList } from "@/navigation/types";
import { colors } from "@/theme/colors";
import { useServiceCategories } from "@/services/firestoreServices";
import { SERVICE_CATEGORIES } from "./servicesData";
import { getSubServiceImageSource } from "@/assets/serviceImages";
import { useAuth } from "@/context/AuthContext";
import { createBooking } from "@/services/bookingService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/services/firebase";
import {
  getSavedAddresses, saveAddress, SavedAddress
} from "@/services/addressStorage";
import {
  searchAddressSuggestions, reverseGeocodeLocation, GeocodedLocation
} from "@/services/geocodingService";
import { getStoredCoupon, setStoredCoupon, validateCoupon } from "@/services/offersService";

function parsePrice(priceLabel: string): number {
  const digits = priceLabel.replace(/[^0-9]/g, "");
  return digits ? parseInt(digits, 10) : 0;
}

function formatPriceDisplay(price: string): string {
  if (!price) return "₹299";
  if (price.startsWith("₹") || price.toLowerCase().includes("quote")) return price;
  return `₹${price}`;
}

type Props = NativeStackScreenProps<RootStackParamList, "ServiceDetail">;

export default function ServiceDetailScreen({ navigation, route }: Props) {
  const { categoryId, subServiceId } = route.params;
  const { user } = useAuth();
  const { categories } = useServiceCategories();

  // Look up category and sub-service dynamically from live Firestore catalog first, fallback to static
  const liveCategory = categories.find((c) => c.id === categoryId);
  const staticCategory = SERVICE_CATEGORIES.find((c) => c.id === categoryId);
  const category = liveCategory || staticCategory;

  const liveSub = liveCategory?.subServices.find((s) => s.id === subServiceId);
  const staticSub = staticCategory?.subServices.find((s) => s.id === subServiceId);
  const sub = liveSub || staticSub;

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState(() => {
    const d = new Date();
    d.setHours(10, 0, 0, 0);
    return d;
  });
  const [showTimePicker, setShowTimePicker] = useState(false);

  // ── Coupon State ──────────────────────────────────────────────────────────
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponMessage, setCouponMessage] = useState("");
  const [couponError, setCouponError] = useState(false);

  useEffect(() => {
    (async () => {
      if (!user) return;
      const stored = await getStoredCoupon();
      if (stored) {
        handleApplyCoupon(stored, true);
      }
    })();
  }, [user?.uid, category?.id]); // Re-validate if user or category changes

  const numericPrice = parsePrice(sub?.price || "0");
  const finalPrice = Math.max(0, numericPrice - discountAmount);
  const displayPrice = finalPrice > 0 ? `₹${finalPrice}` : "Free";

  const handleApplyCoupon = async (code: string, isAutoApply: boolean = false) => {
    if (!code) return;
    if (!user) {
      setCouponError(true);
      setCouponMessage("Please log in to apply coupons.");
      return;
    }
    const result = await validateCoupon(code, category?.id, numericPrice, user.uid);
    if (result.valid) {
      setAppliedCoupon(result.offer?.code || code);
      setDiscountAmount(result.discountAmount);
      setCouponError(false);
      setCouponMessage(`Code ${result.offer?.code || code} applied!`);
      await setStoredCoupon(result.offer?.code || code);
      setCouponInput("");
    } else {
      if (!isAutoApply) {
        setAppliedCoupon(null);
        setDiscountAmount(0);
        setCouponError(true);
        setCouponMessage(result.message || "Invalid coupon");
      } else {
        await setStoredCoupon(null);
      }
    }
  };

  const handleRemoveCoupon = async () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setCouponMessage("");
    setCouponError(false);
    await setStoredCoupon(null);
  };

  // ── Address State ──────────────────────────────────────────────────────────
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("addr-home");
  const [addressText, setAddressText] = useState("");
  const [flatNo, setFlatNo] = useState("");
  const [landmark, setLandmark] = useState("");
  const [customerLat, setCustomerLat] = useState<number | undefined>();
  const [customerLng, setCustomerLng] = useState<number | undefined>();
  const [customerPhone, setCustomerPhone] = useState(user?.phoneNumber || "");
  const [submitting, setSubmitting] = useState(false);
  const [phoneErrorMsg, setPhoneErrorMsg] = useState("");
  const [locationErrorMsg, setLocationErrorMsg] = useState("");

  useEffect(() => {
    if (addressText.trim() && customerLat && customerLng) {
      setLocationErrorMsg("");
    }
  }, [addressText, customerLat, customerLng]);

  // ── Autocomplete / Suggestions State ───────────────────────────────────────
  const [suggestions, setSuggestions] = useState<GeocodedLocation[]>([]);
  const [searchingAddress, setSearchingAddress] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Add New Address Modal ──────────────────────────────────────────────────
  const [showAddModal, setShowAddModal] = useState(false);
  const [newLabel, setNewLabel] = useState<"Home" | "Office" | "Other">("Home");
  const [newAddressText, setNewAddressText] = useState("");
  const [newFlatNo, setNewFlatNo] = useState("");
  const [newLandmark, setNewLandmark] = useState("");
  const [newLat, setNewLat] = useState<number | undefined>();
  const [newLng, setNewLng] = useState<number | undefined>();

  // ── Map Location Picker Modal ──────────────────────────────────────────────
  const [showMapModal, setShowMapModal] = useState(false);
  const [isNewAddressMap, setIsNewAddressMap] = useState(false);
  const mapRef = useRef<MapView>(null);
  const reverseGeocodeRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [mapRegion, setMapRegion] = useState<Region>({
    latitude: 11.0168,
    longitude: 76.9558,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  });
  const [pinCoords, setPinCoords] = useState<{ lat: number; lng: number } | null>(null);

  const handleMapRegionChangeComplete = (r: Region, details?: any) => {
    setPinCoords({ lat: r.latitude, lng: r.longitude });
    
    if (details?.isGesture) {
      if (reverseGeocodeRef.current) clearTimeout(reverseGeocodeRef.current);
      reverseGeocodeRef.current = setTimeout(async () => {
        try {
          setSearchingAddress(true);
          const addrStr = await reverseGeocodeLocation(r.latitude, r.longitude);
          setAddressText(addrStr);
        } catch (e) {
        } finally {
          setSearchingAddress(false);
        }
      }, 600);
    }
  };

  // Load saved addresses and profile contact number on mount
  useEffect(() => {
    (async () => {
      // 1. Load user profile phone number as default
      try {
        const rawProfile = await AsyncStorage.getItem("@urban_health_user_profile_v2");
        if (rawProfile) {
          const parsed = JSON.parse(rawProfile);
          if (parsed.phone) {
            setCustomerPhone(parsed.phone);
          }
        }
        if (user?.uid) {
          const uSnap = await getDoc(doc(db, "users", user.uid));
          if (uSnap.exists()) {
            const uData = uSnap.data();
            const phone = uData.phone || uData.mobile || user.phoneNumber;
            if (phone) {
              setCustomerPhone(phone);
            }
          }
        }
      } catch (err) {
        console.warn("[ServiceDetailScreen] Error loading profile phone:", err);
      }

      // 2. Load saved addresses or auto-detect GPS
      const addrs = await getSavedAddresses();
      setSavedAddresses(addrs);
      if (addrs.length > 0) {
        const initial = addrs.find((a) => a.isDefault) || addrs[0];
        setSelectedAddressId(initial.id);
        setAddressText(initial.addressText);
        setFlatNo(initial.flatNo || "");
        setLandmark(initial.landmark || "");
        if (initial.lat && initial.lng) {
          setCustomerLat(initial.lat);
          setCustomerLng(initial.lng);
          setMapRegion({
            latitude: initial.lat,
            longitude: initial.lng,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          });
          setPinCoords({ lat: initial.lat, lng: initial.lng });
          return;
        }
      }

      // Auto-detect current device GPS location if no saved address or coords
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          const loc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          if (loc) {
            const lat = loc.coords.latitude;
            const lng = loc.coords.longitude;
            setCustomerLat(lat);
            setCustomerLng(lng);
            setMapRegion({
              latitude: lat,
              longitude: lng,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
            });
            setPinCoords({ lat, lng });

            // Reverse geocode using high accuracy reverseGeocodeLocation
            const detectedAddr = await reverseGeocodeLocation(lat, lng);
            if (detectedAddr) {
              setAddressText(detectedAddr);
            }
          }
        }
      } catch (e) {
        console.warn("GPS Auto-detect error:", e);
      }
    })();
  }, [user]);

  const handlePickCurrentLocation = async () => {
    try {
      setSearchingAddress(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission required", "Please allow location access to auto-detect your address.");
        setSearchingAddress(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      if (loc) {
        const lat = loc.coords.latitude;
        const lng = loc.coords.longitude;
        setCustomerLat(lat);
        setCustomerLng(lng);
        setMapRegion({
          latitude: lat,
          longitude: lng,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        });
        setPinCoords({ lat, lng });
        mapRef.current?.animateToRegion({
          latitude: lat,
          longitude: lng,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }, 500);
        const detectedAddr = await reverseGeocodeLocation(lat, lng);
        if (detectedAddr) {
          setAddressText(detectedAddr);
        }
      }
    } catch (e) {
      Alert.alert("Location Error", "Could not detect location. Please type your address.");
    } finally {
      setSearchingAddress(false);
    }
  };

  // ── Address Autocomplete Debounce ─────────────────────────────────────────
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const query = addressText.trim();
    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const abortCtrl = new AbortController();
    debounceRef.current = setTimeout(async () => {
      setSearchingAddress(true);
      try {
        const results = await searchAddressSuggestions(query, abortCtrl.signal);
        setSuggestions(results);
        setShowSuggestions(results.length > 0);
      } catch (err: any) {
        if (err?.name === "AbortError") return;
      } finally {
        setSearchingAddress(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      abortCtrl.abort();
    };
  }, [addressText]);

  // Handle suggestion pick
  const handleSelectSuggestion = (item: GeocodedLocation) => {
    if (reverseGeocodeRef.current) clearTimeout(reverseGeocodeRef.current);
    setAddressText(item.label);
    setCustomerLat(item.lat);
    setCustomerLng(item.lng);
    setPinCoords({ lat: item.lat, lng: item.lng });
    setMapRegion({
      latitude: item.lat,
      longitude: item.lng,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    });
    mapRef.current?.animateToRegion({
      latitude: item.lat,
      longitude: item.lng,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    }, 500);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  // Switch address card (Home / Office / etc.)
  const handleSelectAddressCard = (addr: SavedAddress) => {
    setSelectedAddressId(addr.id);
    setAddressText(addr.addressText);
    setFlatNo(addr.flatNo || "");
    setLandmark(addr.landmark || "");
    setCustomerLat(addr.lat);
    setCustomerLng(addr.lng);
    if (addr.lat && addr.lng) {
      setPinCoords({ lat: addr.lat, lng: addr.lng });
      setMapRegion({
        latitude: addr.lat,
        longitude: addr.lng,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      });
    }
    setShowSuggestions(false);
  };

  // Open Map Picker
  const handleOpenMap = async (forNewModal = false) => {
    setIsNewAddressMap(forNewModal);
    
    let targetLat = customerLat || 13.0827;
    let targetLng = customerLng || 80.2707;
    
    if (forNewModal) {
      targetLat = newLat || targetLat;
      targetLng = newLng || targetLng;
      setAddressText(newAddressText || addressText);
    }

    let fetchedCurrent = false;

    if (!targetLat || !targetLng || (!customerLat && !forNewModal)) {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          const loc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          targetLat = loc.coords.latitude;
          targetLng = loc.coords.longitude;
          fetchedCurrent = true;
        }
      } catch (e) {
        console.warn("Location fetch error:", e);
      }
    }

    setMapRegion({
      latitude: targetLat,
      longitude: targetLng,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    });
    setPinCoords({ lat: targetLat, lng: targetLng });
    setShowMapModal(true);

    if (fetchedCurrent) {
      const addrStr = await reverseGeocodeLocation(targetLat, targetLng);
      setAddressText(addrStr);
    }
  };

  // Confirm Map Location
  const handleConfirmLocation = async () => {
    if (pinCoords) {
      let finalAddress = addressText;
      if (!finalAddress || finalAddress.match(/^[0-9.-]+, [0-9.-]+$/)) {
        try {
          finalAddress = await reverseGeocodeLocation(pinCoords.lat, pinCoords.lng);
        } catch (_) {}
      }

      if (isNewAddressMap) {
        setNewAddressText(finalAddress);
        setNewLat(pinCoords.lat);
        setNewLng(pinCoords.lng);
      } else {
        setAddressText(finalAddress);
        setCustomerLat(pinCoords.lat);
        setCustomerLng(pinCoords.lng);
      }
    }
    setShowMapModal(false);
    setShowSuggestions(false);
  };

  // Save New Address from Modal
  const handleSaveNewAddress = async () => {
    if (!newAddressText.trim()) {
      Alert.alert("Address required", "Please enter the address or pick on map.");
      return;
    }

    const newAddr: SavedAddress = {
      id: `addr-${Date.now()}`,
      label: newLabel,
      addressText: newAddressText.trim(),
      flatNo: newFlatNo.trim(),
      landmark: newLandmark.trim(),
      lat: newLat || customerLat || 13.0827,
      lng: newLng || customerLng || 80.2707,
    };

    const updated = await saveAddress(newAddr);
    setSavedAddresses(updated);
    setSelectedAddressId(newAddr.id);
    setAddressText(newAddr.addressText);
    setFlatNo(newAddr.flatNo || "");
    setLandmark(newAddr.landmark || "");
    setCustomerLat(newAddr.lat);
    setCustomerLng(newAddr.lng);

    // Reset and close
    setNewAddressText("");
    setNewFlatNo("");
    setNewLandmark("");
    setShowAddModal(false);
    Alert.alert("Address Saved", "Your new service address has been saved and selected.");
  };

  if (!category || !sub) {
    return (
      <View style={[s.root, { justifyContent: "center", alignItems: "center" }]}>
        <Text style={{ color: "white", fontSize: 16 }}>Service not found.</Text>
      </View>
    );
  }

  // Prices are calculated at the top of the component based on coupons
  // ── Confirm Booking ───────────────────────────────────────────────────────
  const handleConfirmBooking = async () => {
    if (!user) {
      Alert.alert("Sign in required", "Please sign in to book a service.", [
        { text: "Sign In", onPress: () => navigation.navigate("SignIn") },
        { text: "Cancel", style: "cancel" },
      ]);
      return;
    }

    let isValid = true;
    
    // Validate phone number
    if (!customerPhone.trim() || customerPhone.replace(/[^0-9]/g, "").length < 10) {
      setPhoneErrorMsg("Please enter your contact number.");
      isValid = false;
    } else {
      setPhoneErrorMsg("");
    }

    // Validate location
    if (!addressText.trim() || !customerLat || !customerLng) {
      setLocationErrorMsg("Please select your service location.");
      isValid = false;
    } else {
      setLocationErrorMsg("");
    }

    if (!isValid) return;

    setSubmitting(true);
    try {
      let finalLat = customerLat;
      let finalLng = customerLng;

      if (!finalLat || !finalLng) {
        try {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status === "granted") {
            const loc = await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.Balanced,
            });
            if (loc) {
              finalLat = loc.coords.latitude;
              finalLng = loc.coords.longitude;
            }
          }
        } catch (_) {}
      }

      const scheduledDateTime = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
        selectedTime.getHours(),
        selectedTime.getMinutes(),
        0, 0
      );

      const fullAddress = addressText.trim();

      const { bookingId, otp } = await createBooking({
        customerId: user.uid,
        customerName: user.displayName ?? "Urban Helpers Customer",
        customerPhone: customerPhone.trim(),
        serviceCategory: category.name,
        subServiceName: sub.name,
        address: fullAddress,
        scheduledAt: scheduledDateTime.toISOString(),
        price: finalPrice,
        priceLabel: displayPrice,
        originalPrice: numericPrice,
        discountAmount,
        couponCode: appliedCoupon || null,
        customerLat: finalLat,
        customerLng: finalLng,
      });

      navigation.navigate("BookingConfirmed", {
        bookingId,
        otp,
        categoryId: category.id,
        subServiceId: sub.id,
        scheduledDate: selectedDate.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
      });
    } catch (err) {
      Alert.alert("Booking failed", "Something went wrong while confirming your booking. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={s.root}>
      {/* ── Top Bar ──────────────────────────────────────────── */}
      <View style={s.topBar}>
        <Pressable onPress={() => navigation.goBack()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.text.secondary} />
        </Pressable>
        <View>
          <Text style={s.topTitle}>Book Service</Text>
          <Text style={s.topSub}>Complete your booking</Text>
        </View>
        <Pressable style={s.iconBtn} onPress={() => navigation.navigate("Notifications")}>
          <Ionicons name="notifications-outline" size={20} color={colors.text.secondary} />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Hero Service Image ─────────────────────────────── */}
        <Animated.View entering={FadeInDown.duration(300)} style={s.heroImageWrap}>
          <Image
            source={getSubServiceImageSource(sub.id, category.id, sub?.imageUrl)}
            style={s.heroImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={["rgba(8,24,38,0)", "rgba(8,24,38,0.85)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={s.heroImageGradient}
          />
          <View style={[s.heroImagePill, { backgroundColor: category.gradient[0] + "ee" }]}>
            <Ionicons name={category.icon as any} size={14} color="white" />
            <Text style={s.heroImagePillText}>{category.name}</Text>
          </View>
        </Animated.View>

        {/* ── Selected Service Card with Matching Price ────────── */}
        <Animated.View entering={FadeInDown.duration(350)}>
          <LinearGradient
            colors={category.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={s.serviceCard}
          >
            <View style={s.serviceCardBadge}>
              <Text style={s.serviceCardBadgeText}>
                {sub.popular ? "⭐ POPULAR CHOICE" : "SELECTED SERVICE"}
              </Text>
            </View>
            <View style={s.serviceCardContent}>
              <View style={s.serviceIconWrap}>
                <Ionicons name={category.icon as any} size={32} color="white" />
              </View>
              <View style={s.serviceInfo}>
                <Text style={s.serviceName}>{sub.name}</Text>
                <Text style={s.serviceCat}>{category.name}</Text>
                <Text style={s.serviceDesc} numberOfLines={2}>
                  {sub.description}
                </Text>
                <View style={s.serviceMeta}>
                  <View style={s.metaChip}>
                    <Ionicons name="time-outline" size={13} color="rgba(255,255,255,0.8)" />
                    <Text style={s.metaChipText}>{sub.duration}</Text>
                  </View>
                  <View style={[s.metaChip, { backgroundColor: "rgba(255,255,255,0.25)" }]}>
                    <Text style={[s.metaChipText, { fontSize: 15, fontWeight: "800" }]}>
                      {displayPrice}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* ── Contact Info ───────────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(100).duration(380)}>
          <View style={s.section}>
            <Text style={s.sectionTitle}>Contact Number</Text>
            <View style={s.inputWithIconWrap}>
              <Ionicons name="call-outline" size={18} color={category.accent} style={s.inputIcon} />
              <TextInput
                style={s.inputInner}
                placeholder="10-digit mobile number for vendor contact"
                placeholderTextColor={colors.text.muted}
                value={customerPhone}
                onChangeText={(text) => {
                  setCustomerPhone(text);
                  if (text.trim().length >= 10) setPhoneErrorMsg("");
                }}
                keyboardType="phone-pad"
                maxLength={13}
              />
            </View>
            {phoneErrorMsg ? (
              <Text style={{ color: "#ef4444", fontSize: 13, marginTop: 8 }}>
                ⚠ {phoneErrorMsg}
              </Text>
            ) : null}
          </View>
        </Animated.View>

        {/* ── Service Address Section (2 Options Only: Current Location & Type Address) ── */}
        <Animated.View entering={FadeInDown.delay(130).duration(380)}>
          <View style={s.section}>
            <Text style={s.sectionTitle}>Service Address</Text>

            {/* Select Location button — opens interactive map */}
            <Pressable
              style={s.currentLocationBtn}
              onPress={() => handleOpenMap(false)}
            >
              <Ionicons name="map" size={17} color="#10b981" />
              <Text style={s.currentLocationBtnText}>Select Location on Map</Text>
              <Ionicons name="chevron-forward" size={15} color="#10b981" style={{ marginLeft: "auto" }} />
            </Pressable>

            {/* Selected address preview */}
            {addressText.trim().length > 0 && (
              <View style={[s.addressInputWrap, { marginTop: 8, marginBottom: 8 }]}>
                <Ionicons name="location" size={16} color="#10b981" style={{ marginRight: 8 }} />
                <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: 13, flex: 1 }} numberOfLines={2}>
                  {addressText}
                </Text>
              </View>
            )}

            {/* Search bar — live autocomplete as user types */}
            <View style={[s.addressInputWrap, { marginTop: 0, marginBottom: 0, backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 0 }]}>
              <Ionicons name="search-outline" size={16} color="rgba(255,255,255,0.5)" style={{ marginRight: 8 }} />
              <TextInput
                style={[s.addressInput, s.addressInputWithIcon, { marginBottom: 0, flex: 1, paddingVertical: 10 }]}
                placeholder="Search address..."
                placeholderTextColor={colors.text.muted}
                value={addressText}
                onChangeText={(text) => {
                  setAddressText(text);
                }}
                returnKeyType="search"
              />
              {searchingAddress && <ActivityIndicator size="small" color="#10b981" />}
            </View>

            {locationErrorMsg ? (
              <Text style={{ color: "#ef4444", fontSize: 13, marginTop: 8 }}>
                ⚠ {locationErrorMsg}
              </Text>
            ) : null}

            {/* Live Autocomplete Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <View style={s.suggestionsContainer}>
                {suggestions.map((item, idx) => (
                  <Pressable
                    key={`${item.label}-${idx}`}
                    onPress={() => handleSelectSuggestion(item)}
                    style={({ pressed }) => [
                      s.suggestionRow,
                      pressed && s.suggestionRowPressed,
                    ]}
                  >
                    <Ionicons name="location-outline" size={18} color={category.accent} style={s.suggestionIcon} />
                    <View style={{ flex: 1 }}>
                      <Text style={s.suggestionText} numberOfLines={2}>
                        {item.label}
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        </Animated.View>

        {/* ── Schedule Date & Time ────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(160).duration(380)}>
          <View style={s.section}>
            <Text style={s.sectionTitle}>Select Date & Time</Text>
            <Pressable style={s.datePickerBtn} onPress={() => setShowPicker(true)}>
              <Ionicons name="calendar-outline" size={18} color={category.accent} />
              <Text style={s.datePickerText}>
                {selectedDate.toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </Text>
              <Ionicons name="chevron-forward" size={16} color={colors.text.muted} style={{ marginLeft: "auto" }} />
            </Pressable>

            {showPicker && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="default"
                minimumDate={new Date()}
                onChange={(event, date) => {
                  setShowPicker(false);
                  if (date) setSelectedDate(date);
                }}
              />
            )}

            {/* Custom Time Picker */}
            <Pressable
              style={[s.datePickerBtn, { marginTop: 10 }]}
              onPress={() => setShowTimePicker(true)}
            >
              <Ionicons name="time-outline" size={18} color={category.accent} />
              <Text style={s.datePickerText}>
                {selectedTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })}
              </Text>
              <Ionicons name="chevron-forward" size={16} color={colors.text.muted} style={{ marginLeft: "auto" }} />
            </Pressable>

            {showTimePicker && (
              <DateTimePicker
                value={selectedTime}
                mode="time"
                display="default"
                onChange={(event, time) => {
                  setShowTimePicker(false);
                  if (time) setSelectedTime(time);
                }}
              />
            )}
          </View>
        </Animated.View>

        {/* ── Coupon Section ────────────────────────────── */}
      <Animated.View entering={FadeInDown.delay(180).duration(380)}>
        <View style={s.section}>
          <Text style={s.sectionTitle}>Coupon / Promo Code</Text>
          {appliedCoupon ? (
            <View style={s.appliedCouponCard}>
              <View style={s.appliedCouponInfo}>
                <Ionicons name="pricetag" size={18} color="#10b981" />
                <Text style={s.appliedCouponText}>{appliedCoupon} ✓ Applied</Text>
              </View>
              <Pressable onPress={handleRemoveCoupon}>
                <Text style={s.removeCouponText}>Remove</Text>
              </Pressable>
            </View>
          ) : (
            <View style={s.couponInputRow}>
              <TextInput
                style={[s.plainInput, { flex: 1, marginBottom: 0 }]}
                placeholder="Enter coupon code"
                placeholderTextColor={colors.text.muted}
                value={couponInput}
                onChangeText={(text) => {
                  setCouponInput(text);
                  setCouponMessage("");
                }}
                autoCapitalize="characters"
              />
              <Pressable
                style={[s.applyCouponBtn, { backgroundColor: category.accent }]}
                onPress={() => handleApplyCoupon(couponInput)}
                disabled={!couponInput.trim()}
              >
                <Text style={s.applyCouponBtnText}>Apply</Text>
              </Pressable>
            </View>
          )}
          {couponMessage ? (
            <Text style={[s.couponMessage, couponError ? { color: "#ef4444" } : { color: "#10b981" }]}>
              {couponMessage}
            </Text>
          ) : null}
        </View>
      </Animated.View>

      <View style={{ height: 110 }} />
      </ScrollView>

      {/* ── Fixed Bottom CTA ──────────────────────────────────── */}
      <View style={s.bottomCta}>
        <View style={s.ctaPriceCol}>
          <Text style={s.ctaPriceLabel}>Total Amount</Text>
          {discountAmount > 0 && (
             <Text style={s.originalPriceStrikethrough}>₹{numericPrice}</Text>
          )}
          <Text style={[s.ctaPriceValue, { color: category.accent }]}>{displayPrice}</Text>
        </View>
        <Pressable
          style={[s.confirmBtn, { backgroundColor: category.accent }, submitting && { opacity: 0.7 }]}
          onPress={handleConfirmBooking}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Text style={s.confirmBtnText}>Confirm Booking</Text>
              <Ionicons name="arrow-forward" size={18} color="white" />
            </>
          )}
        </Pressable>
      </View>

      {/* ── Modal: Add New Address ────────────────────────────── */}
      <Modal visible={showAddModal} transparent animationType="slide">
        <View style={s.modalBackdrop}>
          <View style={s.modalContainer}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Add New Service Address</Text>
              <Pressable onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color="white" />
              </Pressable>
            </View>

            {/* Address Label selector */}
            <Text style={s.modalFieldLabel}>Address Type</Text>
            <View style={s.labelChipsRow}>
              {(["Home", "Office", "Other"] as const).map((l) => (
                <Pressable
                  key={l}
                  onPress={() => setNewLabel(l)}
                  style={[s.labelChip, newLabel === l && [s.labelChipActive, { borderColor: category.accent }]]}
                >
                  <Ionicons
                    name={l === "Home" ? "home-outline" : l === "Office" ? "briefcase-outline" : "location-outline"}
                    size={14}
                    color={newLabel === l ? category.accent : colors.text.secondary}
                  />
                  <Text style={[s.labelChipText, newLabel === l && { color: category.accent }]}>{l}</Text>
                </Pressable>
              ))}
            </View>

            <Pressable style={s.mapBtnModal} onPress={() => handleOpenMap(true)}>
              <Ionicons name="navigate" size={15} color="white" />
              <Text style={s.mapBtnText}>Pick on Map</Text>
            </Pressable>

            <TextInput
              style={[s.plainInput, { marginBottom: 10 }]}
              placeholder="Street Address, Area, City"
              placeholderTextColor={colors.text.muted}
              value={newAddressText}
              onChangeText={setNewAddressText}
            />

            <View style={s.flatLandmarkRow}>
              <TextInput
                style={[s.plainInput, { flex: 1 }]}
                placeholder="House / Flat No."
                placeholderTextColor={colors.text.muted}
                value={newFlatNo}
                onChangeText={setNewFlatNo}
              />
              <TextInput
                style={[s.plainInput, { flex: 1.2 }]}
                placeholder="Landmark"
                placeholderTextColor={colors.text.muted}
                value={newLandmark}
                onChangeText={setNewLandmark}
              />
            </View>

            <Pressable style={[s.modalSaveBtn, { backgroundColor: category.accent }]} onPress={handleSaveNewAddress}>
              <Text style={s.modalSaveBtnText}>Save Address</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Modal: Map Location Picker */}
      <Modal visible={showMapModal} transparent animationType="fade">
        <View style={s.mapModalRoot}>
          {showMapModal && (
            <MapView
              ref={mapRef}
              style={s.mapModalView}
              provider={PROVIDER_GOOGLE}
              initialRegion={mapRegion}
              showsUserLocation={true}
              onRegionChangeComplete={handleMapRegionChangeComplete}
            >
              {pinCoords && (
                <Marker
                  coordinate={{ latitude: pinCoords.lat, longitude: pinCoords.lng }}
                  title="Service Location"
                  draggable
                  pinColor="red"
                  onDragEnd={(e) => {
                    const newLat = e.nativeEvent.coordinate.latitude;
                    const newLng = e.nativeEvent.coordinate.longitude;
                    setPinCoords({ lat: newLat, lng: newLng });
                    if (reverseGeocodeRef.current) clearTimeout(reverseGeocodeRef.current);
                    reverseGeocodeRef.current = setTimeout(async () => {
                      try {
                        setSearchingAddress(true);
                        const addrStr = await reverseGeocodeLocation(newLat, newLng);
                        setAddressText(addrStr);
                      } catch (err) {}
                      finally { setSearchingAddress(false); }
                    }, 200);
                  }}
                />
              )}
            </MapView>
          )}

          {/* Map Header with back + inline search bar */}
          <View style={s.mapModalHeader}>
            <Pressable onPress={() => setShowMapModal(false)} style={s.mapModalBackBtn}>
              <Ionicons name="arrow-back" size={22} color="white" />
            </Pressable>
            <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.75)", borderRadius: 12, flexDirection: "row", alignItems: "center", paddingHorizontal: 10, height: 42, borderWidth: 1, borderColor: "rgba(255,255,255,0.18)" }}>
              <Ionicons name="search-outline" size={16} color="rgba(255,255,255,0.6)" />
              <TextInput
                style={{ flex: 1, color: "white", fontSize: 14, marginLeft: 8 }}
                placeholder="Search location..."
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={addressText}
                onChangeText={(text) => setAddressText(text)}
                returnKeyType="search"
              />
              {searchingAddress && <ActivityIndicator size="small" color="#10b981" />}
            </View>
          </View>

          {/* In-map suggestion list */}
          {showSuggestions && suggestions.length > 0 && (
            <View style={{ position: "absolute", top: 110, left: 12, right: 12, backgroundColor: "rgba(10,20,35,0.97)", borderRadius: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.15)", overflow: "hidden", zIndex: 100 }}>
              {suggestions.map((item, idx) => (
                <Pressable
                  key={`mapsug-${idx}`}
                  onPress={() => {
                    handleSelectSuggestion(item);
                  }}
                  style={({ pressed }) => [{ flexDirection: "row", alignItems: "center", padding: 12, gap: 10, borderBottomWidth: idx < suggestions.length - 1 ? 1 : 0, borderBottomColor: "rgba(255,255,255,0.08)", backgroundColor: pressed ? "rgba(255,255,255,0.08)" : "transparent" }]}
                >
                  <Ionicons name="location-outline" size={16} color="#10b981" />
                  <Text style={{ color: "rgba(255,255,255,0.9)", fontSize: 13, flex: 1 }} numberOfLines={2}>{item.label}</Text>
                </Pressable>
              ))}
            </View>
          )}

          {/* Map Confirm Button */}
          <View style={s.mapModalBottom}>
            <Text style={s.mapModalHint}>Drag the red pin to your exact doorstep</Text>
            <Pressable style={[s.mapModalConfirmBtn, { backgroundColor: category.accent }]} onPress={handleConfirmLocation}>
              <Text style={s.mapModalConfirmText}>Confirm Location</Text>
            </Pressable>
          </View>
        </View>

      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#081826" },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 52,
    paddingBottom: 14,
    backgroundColor: "#081826",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.08)",
    justifyContent: "center",
    alignItems: "center",
  },
  topTitle: { fontSize: 18, fontWeight: "700", color: "white" },
  topSub: { fontSize: 12, color: colors.text.muted },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.08)",
    justifyContent: "center",
    alignItems: "center",
  },

  scroll: { paddingHorizontal: 16, paddingTop: 16 },

  heroImageWrap: {
    height: 140,
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: 14,
    position: "relative",
  },
  heroImage: { width: "100%", height: "100%" },
  heroImageGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  heroImagePill: {
    position: "absolute",
    bottom: 12,
    left: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
  },
  heroImagePillText: { fontSize: 12, fontWeight: "700", color: "white" },

  serviceCard: {
    borderRadius: 24,
    padding: 18,
    marginBottom: 16,
    overflow: "hidden",
  },
  serviceCardBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(0,0,0,0.25)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginBottom: 10,
  },
  serviceCardBadgeText: { fontSize: 10, fontWeight: "800", color: "white", letterSpacing: 0.5 },
  serviceCardContent: { flexDirection: "row", gap: 14, alignItems: "center" },
  serviceIconWrap: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  serviceInfo: { flex: 1 },
  serviceName: { fontSize: 17, fontWeight: "800", color: "white" },
  serviceCat: { fontSize: 12, color: "rgba(255,255,255,0.8)", marginBottom: 4 },
  serviceDesc: { fontSize: 12, color: "rgba(255,255,255,0.85)", lineHeight: 16 },
  serviceMeta: { flexDirection: "row", gap: 10, marginTop: 8 },
  metaChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(0,0,0,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  metaChipText: { fontSize: 12, fontWeight: "700", color: "white" },

  section: {
    backgroundColor: colors.surface.container,
    borderRadius: 22,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: "white", marginBottom: 10 },
  addAddressHeaderBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  addAddressHeaderText: { fontSize: 12, fontWeight: "700" },

  inputWithIconWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 14,
  },
  inputIcon: { marginRight: 10 },
  inputInner: {
    flex: 1,
    height: 48,
    color: "white",
    fontSize: 14,
  },

  // Address Cards Scroll
  addressCardsScroll: { gap: 10, paddingBottom: 12 },
  addressCard: {
    width: 160,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  addressCardActive: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1.5,
  },
  addressCardHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6 },
  addressCardLabel: { fontSize: 13, fontWeight: "700", color: colors.text.secondary },
  addressCardText: { fontSize: 11, color: colors.text.muted, lineHeight: 15 },

  addNewCard: {
    justifyContent: "center",
    alignItems: "center",
    borderStyle: "dashed",
    borderColor: "rgba(255,255,255,0.25)",
  },
  addNewCardText: { fontSize: 12, fontWeight: "700", marginTop: 4 },

  currentLocationBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "rgba(16,185,129,0.12)",
    borderWidth: 1.5,
    borderColor: "#10b981",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginBottom: 4,
  },
  currentLocationBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#10b981",
  },

  mapBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 14,
    paddingVertical: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  mapBtnText: { fontSize: 13, fontWeight: "700", color: "white" },

  addressInputWrap: { position: "relative", marginBottom: 10, flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 16, paddingHorizontal: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  addressInput: {
    backgroundColor: "transparent",
    borderRadius: 16,
    paddingHorizontal: 2,
    paddingVertical: 12,
    color: "white",
    fontSize: 13,
    flex: 1,
  },
  addressInputWithIcon: { paddingRight: 40 },
  addressInputStatusIcon: { position: "absolute", right: 14, top: 14 },
  plainInput: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "white",
    fontSize: 13,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },

  suggestionsContainer: {
    backgroundColor: "#0d2136",
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    overflow: "hidden",
  },
  suggestionRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  suggestionRowPressed: { backgroundColor: "rgba(255,255,255,0.1)" },
  suggestionIcon: { marginRight: 10 },
  suggestionText: { fontSize: 13, color: "white" },

  flatLandmarkRow: { flexDirection: "row", gap: 10 },

  datePickerBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    marginBottom: 12,
  },
  datePickerText: { fontSize: 14, fontWeight: "600", color: "white" },

  timeSlotsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  timeSlotChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  timeSlotActive: { backgroundColor: "rgba(255,255,255,0.12)", borderWidth: 1.5 },
  timeSlotText: { fontSize: 12, fontWeight: "600", color: colors.text.muted },

  bottomCta: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 16,
    paddingBottom: 28,
    backgroundColor: "rgba(8,24,38,0.96)",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)",
  },
  ctaPriceCol: {},
  ctaPriceLabel: { fontSize: 11, color: colors.text.muted },
  ctaPriceValue: { fontSize: 22, fontWeight: "800" },
  confirmBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 18,
  },
  confirmBtnText: { fontSize: 15, fontWeight: "700", color: "white" },

  // Add New Address Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#0b2034",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    paddingBottom: 36,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: { fontSize: 17, fontWeight: "700", color: "white" },
  modalFieldLabel: { fontSize: 12, fontWeight: "600", color: colors.text.muted, marginBottom: 8 },
  labelChipsRow: { flexDirection: "row", gap: 10, marginBottom: 14 },
  labelChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  labelChipActive: { backgroundColor: "rgba(255,255,255,0.15)", borderWidth: 1.5 },
  labelChipText: { fontSize: 12, fontWeight: "600", color: colors.text.secondary },
  mapBtnModal: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    paddingVertical: 9,
    marginBottom: 12,
  },
  modalSaveBtn: {
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 16,
  },
  modalSaveBtnText: { fontSize: 15, fontWeight: "700", color: "white" },

  // Map Modal
  mapModalRoot: { flex: 1, backgroundColor: "#081826" },
  mapModalView: { flex: 1 },
  mapModalHeader: {
    position: "absolute",
    top: 50,
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "rgba(8,24,38,0.85)",
    padding: 10,
    borderRadius: 20,
  },
  mapModalBackBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  mapModalTitle: { fontSize: 16, fontWeight: "700", color: "white" },
  mapModalBottom: {
    position: "absolute",
    bottom: 30,
    left: 16,
    right: 16,
    backgroundColor: "rgba(8,24,38,0.9)",
    padding: 16,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  mapModalHint: { fontSize: 12, color: colors.text.muted, textAlign: "center", marginBottom: 12 },
  mapModalConfirmBtn: { borderRadius: 16, paddingVertical: 14, alignItems: "center" },
  mapModalConfirmText: { fontSize: 15, fontWeight: "700", color: "white" },

  // Coupon Section Styles
  couponInputRow: {
    flexDirection: "row",
    gap: 12,
  },
  applyCouponBtn: {
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    height: 52,
  },
  applyCouponBtnText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 14,
  },
  appliedCouponCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.3)",
    padding: 14,
    borderRadius: 12,
  },
  appliedCouponInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  appliedCouponText: {
    color: "#10b981",
    fontWeight: "700",
    fontSize: 14,
  },
  removeCouponText: {
    color: colors.text.muted,
    fontSize: 13,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  couponMessage: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: "500",
  },
  originalPriceStrikethrough: {
    color: colors.text.muted,
    textDecorationLine: "line-through",
    fontSize: 13,
    marginBottom: 2,
  },
});
