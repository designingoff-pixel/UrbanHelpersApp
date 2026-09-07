/**
 * ServiceDetailScreen — booking flow
 * Package display → Address → Date/Time picker → Confirm button
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
import { SERVICE_CATEGORIES } from "./servicesData";
import { getSubServiceImage } from "@/assets/serviceImages";
import { useAuth } from "@/context/AuthContext";
import { createBooking } from "@/services/bookingService";

function parsePrice(priceLabel: string): number {
  const digits = priceLabel.replace(/[^0-9]/g, "");
  return digits ? parseInt(digits, 10) : 0;
}

type Props = NativeStackScreenProps<RootStackParamList, "ServiceDetail">;

// A single geocoded suggestion shown in the dropdown
interface AddressSuggestion {
  label: string;   // formatted address shown to user
  lat:   number;
  lng:   number;
}

export default function ServiceDetailScreen({ navigation, route }: Props) {
  const { categoryId, subServiceId } = route.params;

  const category = SERVICE_CATEGORIES.find((c) => c.id === categoryId);
  const sub = category?.subServices.find((s) => s.id === subServiceId);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<"date" | "time">("date");

  // ── Address state ──────────────────────────────────────────────────────────
  // addressText  : what is shown in the TextInput
  // resolvedAddr : the confirmed formatted address (set when user selects a suggestion OR map confirms)
  // customerLat/Lng: coordinates matching the resolved address
  // addressDirty : true when user has typed since last selection → coords invalidated
  const [addressText,  setAddressText]  = useState("");
  const [resolvedAddr, setResolvedAddr] = useState("");
  const [customerLat,  setCustomerLat]  = useState<number | undefined>();
  const [customerLng,  setCustomerLng]  = useState<number | undefined>();
  const [addressDirty, setAddressDirty] = useState(false);

  // ── Geocode suggestion state ───────────────────────────────────────────────
  const [suggestions,      setSuggestions]      = useState<AddressSuggestion[]>([]);
  const [searchingAddress, setSearchingAddress] = useState(false);
  const [showSuggestions,  setShowSuggestions]  = useState(false);
  const [geocodeError,     setGeocodeError]      = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [customerPhone, setCustomerPhone] = useState("");
  const [locType,       setLocType]       = useState("Home");

  // Map Modal State
  const [showMapModal, setShowMapModal] = useState(false);
  const [mapRegion,    setMapRegion]    = useState<Region>({
    latitude: 20.5937, longitude: 78.9629, latitudeDelta: 5, longitudeDelta: 5,
  });
  const [pinCoords, setPinCoords] = useState<{ lat: number; lng: number } | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();

  // ── Debounced geocode search ───────────────────────────────────────────────
  // Fires 600 ms after the user stops typing; uses expo-location's geocodeAsync
  // (backed by the Google Maps API key already configured in app.json).
  useEffect(() => {
    const query = addressText.trim();

    // Clear previous results whenever the text changes
    setSuggestions([]);
    setGeocodeError("");
    setShowSuggestions(false);

    if (query.length < 4) return; // don't search on very short strings

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      setSearchingAddress(true);
      try {
        const results = await Location.geocodeAsync(query);
        if (results.length === 0) {
          setGeocodeError("No locations found. Please try a more specific address.");
          setShowSuggestions(true);
        } else {
          // Build suggestion labels. We use the user's typed query as the primary
          // label text and append city/region from reverse-geocode as context.
          // This keeps the suggestion visually tied to what the user typed instead
          // of showing a completely different canonical place name.
          const top = results.slice(0, 5);
          const labelled: AddressSuggestion[] = await Promise.all(
            top.map(async (r) => {
              try {
                const rev = await Location.reverseGeocodeAsync({ latitude: r.latitude, longitude: r.longitude });
                if (rev.length > 0) {
                  const p = rev[0];
                  // Context: city + region to disambiguate multiple matches
                  const context = [p.city, p.region, p.country].filter(Boolean).join(", ");
                  // Show the user's own query first, then the resolved city/region
                  const label = context ? `${query}, ${context}` : query;
                  return { label, lat: r.latitude, lng: r.longitude };
                }
              } catch (_) {}
              return { label: query, lat: r.latitude, lng: r.longitude };
            })
          );
          // Deduplicate by label so identical city matches don't repeat
          const seen = new Set<string>();
          const unique = labelled.filter((s) => {
            if (seen.has(s.label)) return false;
            seen.add(s.label);
            return true;
          });
          setSuggestions(unique);
          setGeocodeError("");
          setShowSuggestions(true);
        }
      } catch (err) {
        setGeocodeError("Could not search for address. Check your connection and try again.");
        setShowSuggestions(true);
      } finally {
        setSearchingAddress(false);
      }
    }, 600);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [addressText]);

  // ── Called when user taps a suggestion row ────────────────────────────────
  const handleSelectSuggestion = (item: AddressSuggestion) => {
    setAddressText(item.label);
    setResolvedAddr(item.label);
    setCustomerLat(item.lat);
    setCustomerLng(item.lng);
    setAddressDirty(false);
    setSuggestions([]);
    setShowSuggestions(false);
    setGeocodeError("");
  };

  // ── Called when user edits the address field after a selection ────────────
  const handleAddressChange = (text: string) => {
    setAddressText(text);
    // If the user had already confirmed an address, invalidate the coordinates
    if (resolvedAddr && text !== resolvedAddr) {
      setResolvedAddr("");
      setCustomerLat(undefined);
      setCustomerLng(undefined);
      setAddressDirty(true);
    }
  };

  // ── Open map and center on current GPS location ───────────────────────────
  const handleOpenMap = async () => {
    setShowMapModal(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        setMapRegion({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        });
        setPinCoords({ lat: loc.coords.latitude, lng: loc.coords.longitude });
      }
    } catch (e) {
      console.warn("Location error:", e);
    }
  };

  // ── Confirm map pin location (existing behaviour, unchanged) ──────────────
  const handleConfirmLocation = async () => {
    if (pinCoords) {
      setCustomerLat(pinCoords.lat);
      setCustomerLng(pinCoords.lng);
      try {
        const geocode = await Location.reverseGeocodeAsync({
          latitude: pinCoords.lat, longitude: pinCoords.lng,
        });
        if (geocode.length > 0) {
          const place = geocode[0];
          const addrStr = [place.name, place.street, place.subregion, place.city, place.region]
            .filter(Boolean)
            .join(", ");
          setAddressText(addrStr);
          setResolvedAddr(addrStr);
          setAddressDirty(false);
        }
      } catch (_) {}
    }
    setShowMapModal(false);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  if (!category || !sub) return null;

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
      Alert.alert("Phone number required", "Please enter a valid phone number.");
      return;
    }
    if (!addressText.trim()) {
      Alert.alert("Address required", "Please enter your service address.");
      return;
    }

    setSubmitting(true);
    try {
      // customerLat/Lng are already set from either map-selection or geocode-selection.
      // If somehow still missing (edge case), attempt a quick GPS fallback.
      let finalLat = customerLat;
      let finalLng = customerLng;
      if (!finalLat || !finalLng) {
        try {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status === "granted") {
            const locationTimeout = new Promise<null>((resolve) =>
              setTimeout(() => resolve(null), 5000)
            );
            const locationFetch = Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.Balanced,
            });
            const loc = await Promise.race([locationFetch, locationTimeout]);
            if (loc) {
              finalLat = loc.coords.latitude;
              finalLng = loc.coords.longitude;
            }
          }
        } catch (e) {
          console.warn("GPS fallback error:", e);
        }
      }

      const { bookingId, otp } = await createBooking({
        customerId:      user.uid,
        customerName:    user.displayName ?? "Urban Helpers customer",
        customerPhone:   customerPhone.trim(),
        serviceCategory: category.name,
        subServiceName:  sub.name,
        address:         resolvedAddr || addressText.trim(),
        scheduledAt:     selectedDate.toISOString(),
        price:           parsePrice(sub.price),
        priceLabel:      sub.price,
        customerLat:     finalLat,
        customerLng:     finalLng,
      });

      navigation.navigate("BookingConfirmed", {
        bookingId,
        otp,
        categoryId:   category.id,
        subServiceId: sub.id,
        dayIndex:     0,
        slotIndex:    0,
      });
    } catch (err) {
      Alert.alert("Booking failed", "Something went wrong while confirming your booking. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Address confirmed indicator ───────────────────────────────────────────
  const addressConfirmed = !!resolvedAddr && !addressDirty;

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
            source={{ uri: getSubServiceImage(sub.id, category.id) }}
            style={s.heroImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={["rgba(8,24,38,0)", "rgba(8,24,38,0.85)"]}
            start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
            style={s.heroImageGradient}
          />
          <View style={[s.heroImagePill, { backgroundColor: category.gradient[0] + "dd" }]}>
            <Ionicons name={category.icon as any} size={14} color="white" />
            <Text style={s.heroImagePillText}>{category.name}</Text>
          </View>
        </Animated.View>

        {/* ── Selected service card ─────────────────────────── */}
        <Animated.View entering={FadeInDown.duration(350)}>
          <LinearGradient
            colors={category.gradient}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={s.serviceCard}
          >
            <View style={s.serviceCardBadge}>
              <Text style={s.serviceCardBadgeText}>
                {sub.popular ? "⭐ POPULAR CHOICE" : "YOUR SERVICE"}
              </Text>
            </View>
            <View style={s.serviceCardContent}>
              <View style={s.serviceIconWrap}>
                <Ionicons name={category.icon as any} size={32} color="white" />
              </View>
              <View style={s.serviceInfo}>
                <Text style={s.serviceName}>{sub.name}</Text>
                <Text style={s.serviceCat}>{category.name}</Text>
                <Text style={s.serviceDesc}>{sub.description}</Text>
                <View style={s.serviceMeta}>
                  <View style={s.metaChip}>
                    <Ionicons name="time-outline" size={13} color="rgba(255,255,255,0.8)" />
                    <Text style={s.metaChipText}>{sub.duration}</Text>
                  </View>
                  <View style={[s.metaChip, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
                    <Text style={[s.metaChipText, { fontSize: 14, fontWeight: "700" }]}>{sub.price}</Text>
                  </View>
                </View>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* ── Contact Info ───────────────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(100).duration(380)}>
          <View style={s.section}>
            <Text style={s.sectionTitle}>Contact Number</Text>
            <TextInput
              style={s.addressInput}
              placeholder="Your mobile number (for vendor to contact)"
              placeholderTextColor={colors.text.muted}
              value={customerPhone}
              onChangeText={setCustomerPhone}
              keyboardType="phone-pad"
            />
          </View>
        </Animated.View>

        {/* ── Address ──────────────────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(120).duration(380)}>
          <View style={s.section}>
            <Text style={s.sectionTitle}>Service Address</Text>

            {/* Location type chips */}
            <View style={s.locChips}>
              {["Home", "Office", "+ Add New"].map((l, i) => (
                <Pressable
                  key={l}
                  onPress={() => setLocType(l)}
                  style={[s.locChip, locType === l && s.locChipActive]}
                >
                  <Ionicons
                    name={i === 0 ? "home-outline" : i === 1 ? "briefcase-outline" : "add"}
                    size={13}
                    color={locType === l ? category.accent : colors.text.secondary}
                  />
                  <Text style={[s.locChipText, locType === l && { color: category.accent }]}>{l}</Text>
                </Pressable>
              ))}
            </View>

            {/* Map auto-fill button — unchanged */}
            <Pressable style={s.mapBtn} onPress={handleOpenMap}>
              <Ionicons name="navigate" size={16} color="white" />
              <Text style={s.mapBtnText}>Locate on Map (Auto-fill)</Text>
            </Pressable>

            {/* Address input with confirmed indicator */}
            <View style={s.addressInputWrap}>
              <TextInput
                style={[
                  s.addressInput,
                  s.addressInputWithIcon,
                  addressConfirmed && s.addressInputConfirmed,
                ]}
                placeholder="Type your address (e.g. 12, KK Nagar, Valapady)"
                placeholderTextColor={colors.text.muted}
                value={addressText}
                onChangeText={handleAddressChange}
                returnKeyType="search"
              />
              {/* Right-side status icon */}
              {searchingAddress ? (
                <ActivityIndicator
                  size="small"
                  color="#60a5fa"
                  style={s.addressInputStatusIcon}
                />
              ) : addressConfirmed ? (
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color="#22c55e"
                  style={s.addressInputStatusIcon}
                />
              ) : addressText.trim().length >= 4 ? (
                <Ionicons
                  name="search-outline"
                  size={18}
                  color={colors.text.muted}
                  style={s.addressInputStatusIcon}
                />
              ) : null}
            </View>

            {/* Search hint — shown while typing, suggestions are optional */}
            {addressText.trim().length >= 4 && !addressConfirmed && !searchingAddress && (
              <Text style={s.addressHint}>
                Select a suggestion to pin the exact location, or just confirm your booking
              </Text>
            )}

            {/* Suggestion dropdown */}
            {showSuggestions && (
              <View style={s.suggestionBox}>
                {geocodeError ? (
                  <View style={s.suggestionError}>
                    <Ionicons name="alert-circle-outline" size={16} color="#f87171" />
                    <Text style={s.suggestionErrorText}>{geocodeError}</Text>
                  </View>
                ) : (
                  <FlatList
                    data={suggestions}
                    keyExtractor={(_, i) => String(i)}
                    scrollEnabled={false}
                    keyboardShouldPersistTaps="handled"
                    renderItem={({ item }) => (
                      <Pressable
                        style={({ pressed }) => [
                          s.suggestionItem,
                          pressed && s.suggestionItemPressed,
                        ]}
                        onPress={() => handleSelectSuggestion(item)}
                      >
                        <Ionicons name="location-outline" size={16} color="#60a5fa" style={{ marginTop: 2 }} />
                        <Text style={s.suggestionText} numberOfLines={2}>{item.label}</Text>
                      </Pressable>
                    )}
                  />
                )}
              </View>
            )}

            <TextInput
              style={[s.addressInput, { marginTop: 10 }]}
              placeholder="Landmark (optional)"
              placeholderTextColor={colors.text.muted}
            />
          </View>
        </Animated.View>

        {/* ── Native Date & Time Picker ──────────────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(160).duration(380)}>
          <LinearGradient
            colors={["#4338ca", "#8b5cf6"]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={s.dateSection}
          >
            <Text style={s.dateSectionTitle}>Select Date & Time</Text>

            <View style={{ flexDirection: "row", gap: 10, marginTop: 15 }}>
              <Pressable
                style={{ flex: 1, backgroundColor: "rgba(255,255,255,0.2)", padding: 12, borderRadius: 12, alignItems: "center" }}
                onPress={() => { setPickerMode("date"); setShowPicker(true); }}
              >
                <Ionicons name="calendar-outline" size={20} color="white" />
                <Text style={{ color: "white", marginTop: 4, fontWeight: "600" }}>
                  {selectedDate.toLocaleDateString()}
                </Text>
              </Pressable>

              <Pressable
                style={{ flex: 1, backgroundColor: "rgba(255,255,255,0.2)", padding: 12, borderRadius: 12, alignItems: "center" }}
                onPress={() => { setPickerMode("time"); setShowPicker(true); }}
              >
                <Ionicons name="time-outline" size={20} color="white" />
                <Text style={{ color: "white", marginTop: 4, fontWeight: "600" }}>
                  {selectedDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </Text>
              </Pressable>
            </View>

            {showPicker && (
              <DateTimePicker
                value={selectedDate}
                mode={pickerMode}
                is24Hour={false}
                display="default"
                onChange={(event, date) => {
                  setShowPicker(false);
                  if (date) setSelectedDate(date);
                }}
              />
            )}
          </LinearGradient>
        </Animated.View>

        {/* ── Our Promise ──────────────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(220).duration(380)}>
          <View style={s.section}>
            <Text style={s.sectionTitle}>Our Promise</Text>
            <View style={s.promiseGrid}>
              {[
                { icon: "shield-checkmark-outline" as const, label: "Verified Pros",     sub: "Background checked" },
                { icon: "thumbs-up-outline" as const,        label: "100% Satisfaction", sub: "Guaranteed service" },
                { icon: "time-outline" as const,             label: "On-Time Arrival",   sub: "Or flat ₹200 off" },
              ].map((p) => (
                <View key={p.label} style={s.promiseCard}>
                  <View style={[s.promiseIcon, { backgroundColor: category.accent + "18" }]}>
                    <Ionicons name={p.icon} size={20} color={category.accent} />
                  </View>
                  <Text style={s.promiseLabel}>{p.label}</Text>
                  <Text style={s.promiseSub}>{p.sub}</Text>
                </View>
              ))}
            </View>
          </View>
        </Animated.View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ── Bottom CTA ───────────────────────────────────────────── */}
      <View style={s.cta}>
        <View>
          <Text style={s.ctaPrice}>{sub.price}</Text>
          <Text style={s.ctaDuration}>{sub.duration}</Text>
        </View>
        <Pressable
          onPress={handleConfirmBooking}
          disabled={submitting}
          style={({ pressed }) => [
            s.ctaBtn,
            { backgroundColor: category.gradient[0], opacity: pressed || submitting ? 0.7 : 1 },
          ]}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <Text style={s.ctaBtnText}>Confirm Booking</Text>
              <Ionicons name="arrow-forward" size={18} color="white" />
            </>
          )}
        </Pressable>
      </View>

      {/* ── Map Modal ───────────────────────────────────────────── */}
      <Modal visible={showMapModal} animationType="slide" transparent={false}>
        <View style={s.modalContainer}>
          <View style={s.modalHeader}>
            <Pressable onPress={() => setShowMapModal(false)} style={s.modalCloseBtn}>
              <Ionicons name="close" size={24} color="white" />
            </Pressable>
            <Text style={s.modalTitle}>Set Location</Text>
            <View style={{ width: 40 }} />
          </View>

          <MapView
            style={s.modalMap}
            provider={PROVIDER_GOOGLE}
            region={mapRegion}
            onRegionChangeComplete={(r) => setMapRegion(r)}
          >
            {pinCoords && (
              <Marker
                draggable
                coordinate={{ latitude: pinCoords.lat, longitude: pinCoords.lng }}
                onDragEnd={(e) =>
                  setPinCoords({
                    lat: e.nativeEvent.coordinate.latitude,
                    lng: e.nativeEvent.coordinate.longitude,
                  })
                }
              >
                <View style={s.draggablePin}>
                  <Ionicons name="location" size={36} color="#ef4444" />
                </View>
              </Marker>
            )}
          </MapView>

          <View style={s.modalFooter}>
            <Text style={s.modalFooterText}>Drag the red pin to your exact location</Text>
            <Pressable style={s.modalConfirmBtn} onPress={handleConfirmLocation}>
              <Text style={s.modalConfirmBtnText}>Confirm Location</Text>
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
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 16, paddingTop: 52, paddingBottom: 12,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.surface.containerHigh,
    borderWidth: 1, borderColor: colors.glass.border,
    justifyContent: "center", alignItems: "center",
  },
  topTitle: { fontSize: 18, fontWeight: "700", color: colors.text.primary, textAlign: "center" },
  topSub:   { fontSize: 12, color: colors.text.secondary, textAlign: "center" },
  iconBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.surface.containerHigh,
    borderWidth: 1, borderColor: colors.glass.border,
    justifyContent: "center", alignItems: "center",
  },

  scroll: { paddingHorizontal: 16 },

  // Hero Image
  heroImageWrap: {
    marginHorizontal: -16, height: 220,
    position: "relative", marginBottom: 16, overflow: "hidden",
  },
  heroImage: { width: "100%", height: "100%" },
  heroImageGradient: { position: "absolute", bottom: 0, left: 0, right: 0, height: 100 },
  heroImagePill: {
    position: "absolute", bottom: 14, left: 16,
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.25)",
  },
  heroImagePillText: { fontSize: 12, fontWeight: "700", color: "white" },

  // Service card
  serviceCard: {
    borderRadius: 26, padding: 20, marginBottom: 16,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.15)", overflow: "hidden",
  },
  serviceCardBadge: {
    backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 5, alignSelf: "flex-start",
    marginBottom: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.25)",
  },
  serviceCardBadgeText: { fontSize: 10, fontWeight: "800", color: "white", letterSpacing: 1 },
  serviceCardContent:   { flexDirection: "row", gap: 16, alignItems: "flex-start" },
  serviceIconWrap: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center", alignItems: "center", flexShrink: 0,
  },
  serviceInfo:  { flex: 1 },
  serviceName:  { fontSize: 20, fontWeight: "700", color: "white", marginBottom: 2 },
  serviceCat:   { fontSize: 12, color: "rgba(255,255,255,0.65)", marginBottom: 8 },
  serviceDesc:  { fontSize: 13, color: "rgba(255,255,255,0.8)", lineHeight: 18, marginBottom: 12 },
  serviceMeta:  { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  metaChip: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 12, paddingHorizontal: 10, paddingVertical: 5,
  },
  metaChipText: { fontSize: 12, color: "white", fontWeight: "600" },

  // Sections
  section: {
    backgroundColor: colors.surface.container, borderRadius: 22,
    padding: 18, marginBottom: 14,
    borderWidth: 1, borderColor: colors.glass.border,
  },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: colors.text.primary, marginBottom: 14 },
  locChips:     { flexDirection: "row", gap: 8, marginBottom: 14, flexWrap: "wrap" },
  locChip: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 13, paddingVertical: 8,
    borderRadius: 20, backgroundColor: colors.surface.containerHigh,
    borderWidth: 1, borderColor: colors.glass.border,
  },
  locChipActive: { borderColor: "#00bcd4", backgroundColor: "rgba(0,188,212,0.1)" },
  locChipText:   { fontSize: 12, fontWeight: "600", color: colors.text.secondary },

  addressInput: {
    backgroundColor: colors.surface.containerHigh,
    borderRadius: 14, height: 50, paddingHorizontal: 16,
    color: colors.text.primary, fontSize: 14,
    borderWidth: 1, borderColor: colors.glass.border,
  },
  // Address input wrapper — positions the status icon absolutely inside
  addressInputWrap: { position: "relative" },
  addressInputWithIcon:  { paddingRight: 44 },
  addressInputConfirmed: { borderColor: "#22c55e" },
  addressInputStatusIcon: {
    position: "absolute", right: 14, top: 15,
  },
  addressHint: {
    fontSize: 11, color: "#60a5fa",
    marginTop: 6, marginLeft: 4,
  },

  // Suggestion dropdown
  suggestionBox: {
    backgroundColor: colors.surface.containerHigh,
    borderRadius: 14, marginTop: 6,
    borderWidth: 1, borderColor: colors.glass.border,
    overflow: "hidden",
  },
  suggestionItem: {
    flexDirection: "row", alignItems: "flex-start", gap: 10,
    paddingHorizontal: 14, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: colors.glass.border,
  },
  suggestionItemPressed: { backgroundColor: "rgba(255,255,255,0.05)" },
  suggestionText: { flex: 1, fontSize: 13, color: colors.text.primary, lineHeight: 18 },
  suggestionError: {
    flexDirection: "row", alignItems: "center", gap: 8,
    padding: 14,
  },
  suggestionErrorText: { fontSize: 13, color: "#f87171", flex: 1 },

  mapBtn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "rgba(37,99,235,0.2)",
    borderWidth: 1, borderColor: "#3b82f6",
    paddingHorizontal: 14, paddingVertical: 12,
    borderRadius: 14, marginBottom: 14,
  },
  mapBtnText: { fontSize: 13, fontWeight: "600", color: "#60a5fa" },

  // Date/time section
  dateSection: {
    borderRadius: 22, padding: 20, marginBottom: 14,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.12)", overflow: "hidden",
  },
  dateSectionTitle: { fontSize: 16, fontWeight: "700", color: "white", marginBottom: 14 },

  // Promise
  promiseGrid: { flexDirection: "row", gap: 10 },
  promiseCard: {
    flex: 1, alignItems: "center", backgroundColor: colors.surface.containerHigh,
    borderRadius: 16, padding: 12, gap: 6,
    borderWidth: 1, borderColor: colors.glass.border,
  },
  promiseIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: "center", alignItems: "center" },
  promiseLabel: { fontSize: 12, fontWeight: "700", color: colors.text.primary, textAlign: "center" },
  promiseSub:   { fontSize: 10, color: colors.text.secondary, textAlign: "center" },

  // Bottom CTA
  cta: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 20, paddingVertical: 14,
    marginHorizontal: 12, marginBottom: 12,
    backgroundColor: "rgba(10,22,36,0.97)",
    borderRadius: 24, borderWidth: 1, borderColor: colors.glass.border,
    elevation: 14,
  },
  ctaPrice:    { fontSize: 22, fontWeight: "700", color: colors.text.primary },
  ctaDuration: { fontSize: 12, color: colors.text.secondary, marginTop: 2 },
  ctaBtn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: 22, paddingVertical: 14, borderRadius: 18,
  },
  ctaBtnText: { fontSize: 15, fontWeight: "700", color: "white" },

  // Map Modal
  modalContainer: { flex: 1, backgroundColor: "#081826" },
  modalHeader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 16, paddingTop: 50, paddingBottom: 16, backgroundColor: "#081826",
  },
  modalCloseBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center", alignItems: "center",
  },
  modalTitle:       { fontSize: 18, fontWeight: "700", color: "white" },
  modalMap:         { flex: 1 },
  draggablePin:     { alignItems: "center", justifyContent: "center", marginTop: -18 },
  modalFooter:      { padding: 24, backgroundColor: "#081826", paddingBottom: 40 },
  modalFooterText:  { fontSize: 13, color: "rgba(255,255,255,0.7)", textAlign: "center", marginBottom: 16 },
  modalConfirmBtn:  { backgroundColor: "#2563eb", paddingVertical: 16, borderRadius: 16, alignItems: "center" },
  modalConfirmBtnText: { fontSize: 16, fontWeight: "700", color: "white" },
});
