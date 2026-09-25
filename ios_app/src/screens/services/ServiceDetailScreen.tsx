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
import {
  getSavedAddresses, saveAddress, SavedAddress
} from "@/services/addressStorage";
import {
  searchAddressSuggestions, GeocodedLocation
} from "@/services/geocodingService";

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
  const [timeSlot, setTimeSlot] = useState("10:00 AM - 12:00 PM");

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
  const [mapRegion, setMapRegion] = useState<Region>({
    latitude: 11.0168,
    longitude: 76.9558,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [pinCoords, setPinCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Load saved addresses on mount or auto-detect current GPS location
  useEffect(() => {
    (async () => {
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

            // Reverse geocode to get current address text
            const geocode = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
            if (geocode && geocode.length > 0) {
              const place = geocode[0];
              const parts = [place.name, place.street, place.subregion, place.city, place.region].filter(Boolean);
              const detectedAddr = parts.join(", ");
              if (detectedAddr) {
                setAddressText(detectedAddr);
              }
            }
          }
        }
      } catch (e) {
        console.warn("GPS Auto-detect error:", e);
      }
    })();
  }, []);

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
    setAddressText(item.label);
    setCustomerLat(item.lat);
    setCustomerLng(item.lng);
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
    setShowSuggestions(false);
  };

  // Open Map Picker
  const handleOpenMap = async (forNewModal = false) => {
    setIsNewAddressMap(forNewModal);
    setShowMapModal(true);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        const lat = loc.coords.latitude;
        const lng = loc.coords.longitude;
        setMapRegion({
          latitude: lat,
          longitude: lng,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        });
        setPinCoords({ lat, lng });
      } else if (customerLat && customerLng) {
        setMapRegion({
          latitude: customerLat,
          longitude: customerLng,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        });
        setPinCoords({ lat: customerLat, lng: customerLng });
      }
    } catch (e) {
      console.warn("Location fetch error:", e);
    }
  };

  // Confirm Map Location
  const handleConfirmLocation = async () => {
    if (pinCoords) {
      try {
        const geocode = await Location.reverseGeocodeAsync({
          latitude: pinCoords.lat,
          longitude: pinCoords.lng,
        });
        let addrStr = `${pinCoords.lat.toFixed(4)}, ${pinCoords.lng.toFixed(4)}`;
        if (geocode && geocode.length > 0) {
          const place = geocode[0];
          addrStr = [place.name, place.street, place.subregion, place.city, place.region]
            .filter(Boolean)
            .join(", ");
        }

        if (isNewAddressMap) {
          setNewAddressText(addrStr);
          setNewLat(pinCoords.lat);
          setNewLng(pinCoords.lng);
        } else {
          setAddressText(addrStr);
          setCustomerLat(pinCoords.lat);
          setCustomerLng(pinCoords.lng);
        }
      } catch (_) {
        if (isNewAddressMap) {
          setNewLat(pinCoords.lat);
          setNewLng(pinCoords.lng);
        } else {
          setCustomerLat(pinCoords.lat);
          setCustomerLng(pinCoords.lng);
        }
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

  const displayPrice = formatPriceDisplay(sub.price);
  const numericPrice = parsePrice(sub.price);

  // ── Confirm Booking ───────────────────────────────────────────────────────
  const handleConfirmBooking = async () => {
    if (!user) {
      Alert.alert("Sign in required", "Please sign in to book a service.", [
        { text: "Sign In", onPress: () => navigation.navigate("SignIn") },
        { text: "Cancel", style: "cancel" },
      ]);
      return;
    }
    if (!customerPhone.trim() || customerPhone.length < 10) {
      Alert.alert("Phone number required", "Please enter a valid 10-digit mobile number.");
      return;
    }
    if (!addressText.trim()) {
      Alert.alert("Address required", "Please enter or select your service address.");
      return;
    }

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

      const fullAddress = [
        flatNo ? `Flat/Door: ${flatNo}` : "",
        addressText.trim(),
        landmark ? `Landmark: ${landmark}` : "",
      ]
        .filter(Boolean)
        .join(", ");

      const { bookingId, otp } = await createBooking({
        customerId: user.uid,
        customerName: user.displayName ?? "Urban Helpers Customer",
        customerPhone: customerPhone.trim(),
        serviceCategory: category.name,
        subServiceName: sub.name,
        address: fullAddress,
        scheduledAt: selectedDate.toISOString(),
        price: numericPrice,
        priceLabel: displayPrice,
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
                onChangeText={setCustomerPhone}
                keyboardType="phone-pad"
                maxLength={13}
              />
            </View>
          </View>
        </Animated.View>

        {/* ── Service Address Section with Home/Office/Add Cards ── */}
        <Animated.View entering={FadeInDown.delay(130).duration(380)}>
          <View style={s.section}>
            <View style={s.sectionHeaderRow}>
              <Text style={s.sectionTitle}>Service Address</Text>
              <Pressable onPress={() => setShowAddModal(true)} style={s.addAddressHeaderBtn}>
                <Ionicons name="add-circle" size={16} color={category.accent} />
                <Text style={[s.addAddressHeaderText, { color: category.accent }]}>+ Add New</Text>
              </Pressable>
            </View>

            {/* Saved Address Cards Grid */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.addressCardsScroll}>
              {savedAddresses.map((addr) => {
                const isSelected = selectedAddressId === addr.id;
                return (
                  <Pressable
                    key={addr.id}
                    onPress={() => handleSelectAddressCard(addr)}
                    style={[
                      s.addressCard,
                      isSelected && [s.addressCardActive, { borderColor: category.accent }],
                    ]}
                  >
                    <View style={s.addressCardHeader}>
                      <Ionicons
                        name={
                          addr.label === "Home"
                            ? "home"
                            : addr.label === "Office"
                            ? "briefcase"
                            : "location"
                        }
                        size={16}
                        color={isSelected ? category.accent : colors.text.secondary}
                      />
                      <Text style={[s.addressCardLabel, isSelected && { color: category.accent }]}>
                        {addr.label}
                      </Text>
                      {isSelected && (
                        <Ionicons name="checkmark-circle" size={16} color={category.accent} style={{ marginLeft: "auto" }} />
                      )}
                    </View>
                    <Text style={s.addressCardText} numberOfLines={2}>
                      {addr.addressText}
                    </Text>
                  </Pressable>
                );
              })}

              {/* + Add New Card */}
              <Pressable
                onPress={() => setShowAddModal(true)}
                style={[s.addressCard, s.addNewCard]}
              >
                <Ionicons name="add-circle-outline" size={24} color={category.accent} />
                <Text style={[s.addNewCardText, { color: category.accent }]}>Add Address</Text>
              </Pressable>
            </ScrollView>

            {/* Map auto-fill button */}
            <Pressable style={s.mapBtn} onPress={() => handleOpenMap(false)}>
              <Ionicons name="navigate" size={16} color="white" />
              <Text style={s.mapBtnText}>Locate on Map / Change Pin</Text>
            </Pressable>

            {/* Address input with live search */}
            <View style={s.addressInputWrap}>
              <TextInput
                style={[s.addressInput, s.addressInputWithIcon]}
                placeholder="Type location (e.g. Chennai, Chennimalai, Anna Nagar)"
                placeholderTextColor={colors.text.muted}
                value={addressText}
                onChangeText={(text) => {
                  setAddressText(text);
                  setSelectedAddressId("");
                }}
                returnKeyType="search"
              />
              {searchingAddress ? (
                <ActivityIndicator size="small" color="#60a5fa" style={s.addressInputStatusIcon} />
              ) : addressText.trim().length >= 2 ? (
                <Ionicons name="search-outline" size={18} color={colors.text.muted} style={s.addressInputStatusIcon} />
              ) : null}
            </View>

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

            {/* Flat / Door & Landmark Inputs */}
            <View style={s.flatLandmarkRow}>
              <TextInput
                style={[s.addressInput, { flex: 1 }]}
                placeholder="House / Flat No."
                placeholderTextColor={colors.text.muted}
                value={flatNo}
                onChangeText={setFlatNo}
              />
              <TextInput
                style={[s.addressInput, { flex: 1.2 }]}
                placeholder="Landmark (Optional)"
                placeholderTextColor={colors.text.muted}
                value={landmark}
                onChangeText={setLandmark}
              />
            </View>
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

            {/* Time Slot Selector */}
            <View style={s.timeSlotsRow}>
              {["09:00 AM - 11:00 AM", "11:00 AM - 01:00 PM", "02:00 PM - 04:00 PM", "04:00 PM - 06:00 PM"].map((slot) => {
                const isSelected = timeSlot === slot;
                return (
                  <Pressable
                    key={slot}
                    onPress={() => setTimeSlot(slot)}
                    style={[
                      s.timeSlotChip,
                      isSelected && [s.timeSlotActive, { borderColor: category.accent }],
                    ]}
                  >
                    <Ionicons
                      name="time-outline"
                      size={12}
                      color={isSelected ? category.accent : colors.text.muted}
                    />
                    <Text style={[s.timeSlotText, isSelected && { color: category.accent }]}>
                      {slot.split(" - ")[0]}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </Animated.View>

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* ── Fixed Bottom CTA ──────────────────────────────────── */}
      <View style={s.bottomCta}>
        <View style={s.ctaPriceCol}>
          <Text style={s.ctaPriceLabel}>Total Amount</Text>
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
              style={[s.addressInput, { marginBottom: 10 }]}
              placeholder="Street Address, Area, City"
              placeholderTextColor={colors.text.muted}
              value={newAddressText}
              onChangeText={setNewAddressText}
            />

            <View style={s.flatLandmarkRow}>
              <TextInput
                style={[s.addressInput, { flex: 1 }]}
                placeholder="House / Flat No."
                placeholderTextColor={colors.text.muted}
                value={newFlatNo}
                onChangeText={setNewFlatNo}
              />
              <TextInput
                style={[s.addressInput, { flex: 1.2 }]}
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

      {/* ── Modal: Map Location Picker ────────────────────────── */}
      <Modal visible={showMapModal} transparent animationType="fade">
        <View style={s.mapModalRoot}>
          <MapView
            style={s.mapModalView}
            provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
            region={mapRegion}
            onRegionChangeComplete={(r) => {
              setMapRegion(r);
              setPinCoords({ lat: r.latitude, lng: r.longitude });
            }}
          >
            {pinCoords && (
              <Marker
                coordinate={{ latitude: pinCoords.lat, longitude: pinCoords.lng }}
                title="Service Location"
                draggable
                onDragEnd={(e) => setPinCoords({ lat: e.nativeEvent.coordinate.latitude, lng: e.nativeEvent.coordinate.longitude })}
              />
            )}
          </MapView>

          {/* Map Header */}
          <View style={s.mapModalHeader}>
            <Pressable onPress={() => setShowMapModal(false)} style={s.mapModalBackBtn}>
              <Ionicons name="arrow-back" size={22} color="white" />
            </Pressable>
            <Text style={s.mapModalTitle}>Pin Your Exact Location</Text>
          </View>

          {/* Map Confirm Button */}
          <View style={s.mapModalBottom}>
            <Text style={s.mapModalHint}>Move map or drag pin to exact doorstep</Text>
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

  addressInputWrap: { position: "relative", marginBottom: 10 },
  addressInput: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "white",
    fontSize: 13,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  addressInputWithIcon: { paddingRight: 40 },
  addressInputStatusIcon: { position: "absolute", right: 14, top: 14 },

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
});
