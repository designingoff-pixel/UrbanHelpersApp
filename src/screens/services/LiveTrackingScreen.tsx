import React, { useEffect, useRef, useState } from "react";
import {
  View, Text, Pressable, StyleSheet,
  Linking, Alert, ScrollView, Dimensions,
} from "react-native";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import Animated, {
  useSharedValue, useAnimatedStyle,
  withRepeat, withSequence, withTiming, FadeInDown,
} from "react-native-reanimated";
import {
  doc, onSnapshot, collection, query, where, limit,
} from "firebase/firestore";
import { db } from "@/services/firebase";
import { useAuth } from "@/context/AuthContext";
import { RootStackParamList } from "@/navigation/types";
import { colors } from "@/theme/colors";
import {
  getDistanceKm,
  calculateETA,
  formatETA,
  formatDistance,
  startDemoSimulation,
  SimCoords,
} from "@/services/locationService";

type Props = NativeStackScreenProps<RootStackParamList, "LiveTracking">;
const { width: W } = Dimensions.get("window");

// ── Status types ──────────────────────────────────────────────────────────────
type BookingStatus =
  | "requested" | "assigned" | "accepted"
  | "en_route"  | "arrived"  | "in_progress"
  | "completed" | "cancelled";

interface LiveBooking {
  id:              string;
  vendorId?:       string;
  vendorName?:     string;
  serviceCategory?: string;
  status:          BookingStatus;
  address?:        string;
  scheduledAt?:    string;
  price?:          number;
  priceLabel?:     string;
  customerLat?:    number;
  customerLng?:    number;
}

interface VendorCoords {
  lat:      number;
  lng:      number;
  heading?: number;
  speed?:   number;
}

// ── Timeline steps ────────────────────────────────────────────────────────────
const STATUS_ORDER: BookingStatus[] = [
  "requested", "assigned", "en_route", "arrived", "in_progress", "completed",
];
const STATUS_LABELS: Record<string, string> = {
  requested:   "Booking Confirmed",
  assigned:    "Professional Assigned",
  en_route:    "On The Way",
  arrived:     "Professional Arrived",
  in_progress: "Service In Progress",
  completed:   "Completed",
};

function buildSteps(status: BookingStatus, etaText: string) {
  const idx = STATUS_ORDER.indexOf(status);
  return STATUS_ORDER.map((s, i) => ({
    label:  STATUS_LABELS[s],
    done:   i < idx,
    active: i === idx,
    time:   i === idx && s === "en_route" ? etaText
          : i === idx ? "Now"
          : i === 0 ? "Confirmed"
          : "",
  }));
}

// ── Hero text ─────────────────────────────────────────────────────────────────
const HERO_TITLES: Partial<Record<BookingStatus, string>> = {
  requested:   "Finding\nProfessional",
  assigned:    "Professional\nAssigned",
  accepted:    "Professional\nConfirmed",
  en_route:    "Professional\nOn The Way",
  arrived:     "Professional\nArrived",
  in_progress: "Service\nIn Progress",
  completed:   "Service\nCompleted",
};

// ─────────────────────────────────────────────────────────────────────────────

export default function LiveTrackingScreen({ navigation }: Props) {
  const { user } = useAuth();
  const mapRef   = useRef<MapView>(null);

  // ── Animation ─────────────────────────────────────────────────────────────
  const pulse = useSharedValue(1);
  const ring  = useSharedValue(0.8);
  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(withTiming(1.35, { duration: 800 }), withTiming(1, { duration: 800 })),
      -1, false,
    );
    ring.value = withRepeat(
      withSequence(withTiming(1.45, { duration: 900 }), withTiming(0.8, { duration: 900 })),
      -1, false,
    );
  }, []);
  const pulseStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));
  const ringStyle  = useAnimatedStyle(() => ({
    transform: [{ scale: ring.value }],
    opacity: Math.max(0, 2 - ring.value),
  }));

  // ── State ─────────────────────────────────────────────────────────────────
  const [booking,        setBooking]        = useState<LiveBooking | null>(null);
  const [vendorCoords,   setVendorCoords]   = useState<VendorCoords | null>(null);
  const [customerCoords, setCustomerCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [etaText,        setEtaText]        = useState("Calculating…");
  const [distanceText,   setDistanceText]   = useState("");
  const [loading,        setLoading]        = useState(true);
  const [demoMode,       setDemoMode]       = useState(false);

  const demoCleanup = useRef<(() => void) | null>(null);

  // ── Subscribe to active booking ───────────────────────────────────────────
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "bookings"),
      where("customerId", "==", user.uid),
      where("status", "in", [
        "assigned", "accepted", "en_route", "arrived", "in_progress",
      ]),
      limit(1),
    );

    return onSnapshot(q, (snap) => {
      if (snap.empty) {
        setBooking(null);
        setLoading(false);
        return;
      }
      const d    = snap.docs[0];
      const data = { id: d.id, ...d.data() } as LiveBooking;
      setBooking(data);
      setLoading(false);

      // Store customer coords from booking
      if (data.customerLat && data.customerLng) {
        setCustomerCoords({ lat: data.customerLat, lng: data.customerLng });
      }
    });
  }, [user]);

  // ── Subscribe to vendor live location ─────────────────────────────────────
  useEffect(() => {
    if (!booking?.vendorId) return;

    // Give vendor GPS 10s to arrive before starting demo
    const demoTimeout = setTimeout(() => {
      if (!vendorCoords && customerCoords) {
        setDemoMode(true);
        demoCleanup.current = startDemoSimulation(
          customerCoords.lat, customerCoords.lng,
          (sim: SimCoords) => {
            setVendorCoords({ lat: sim.lat, lng: sim.lng, heading: sim.heading, speed: sim.speed });
          },
        );
      }
    }, 10000);

    const unsub = onSnapshot(doc(db, "vendors", booking.vendorId), (snap) => {
      if (!snap.exists()) return;
      const data = snap.data();
      if (data?.location?.lat) {
        clearTimeout(demoTimeout);
        // Real GPS arrived — stop demo
        if (demoMode) {
          demoCleanup.current?.();
          setDemoMode(false);
        }
        setVendorCoords({
          lat:     data.location.lat,
          lng:     data.location.lng,
          heading: data.location.heading,
          speed:   data.location.speed,
        });
      }
    });

    return () => {
      clearTimeout(demoTimeout);
      unsub();
      demoCleanup.current?.();
    };
  }, [booking?.vendorId, !!customerCoords]);

  // ── Recalculate ETA whenever vendor moves ─────────────────────────────────
  useEffect(() => {
    if (!vendorCoords || !customerCoords) return;
    const km  = getDistanceKm(
      vendorCoords.lat, vendorCoords.lng,
      customerCoords.lat, customerCoords.lng,
    );
    const eta = calculateETA(km);
    setEtaText(formatETA(eta));
    setDistanceText(formatDistance(km));
  }, [vendorCoords, customerCoords]);

  // ── Fit map to show both markers ──────────────────────────────────────────
  useEffect(() => {
    if (!vendorCoords || !customerCoords) return;
    mapRef.current?.fitToCoordinates(
      [
        { latitude: vendorCoords.lat,   longitude: vendorCoords.lng },
        { latitude: customerCoords.lat, longitude: customerCoords.lng },
      ],
      { edgePadding: { top: 60, right: 50, bottom: 300, left: 50 }, animated: true },
    );
  }, [vendorCoords, customerCoords]);

  // ── Auto-navigate when completed ──────────────────────────────────────────
  useEffect(() => {
    if (booking?.status === "completed") {
      setTimeout(() => navigation.navigate("RatingFeedback", {}), 1500);
    }
  }, [booking?.status]);

  // ── Derived ───────────────────────────────────────────────────────────────
  const status   = booking?.status ?? "requested";
  const steps    = buildSteps(status as BookingStatus, etaText);
  const initials = (booking?.vendorName ?? "VC")
    .split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();

  const mapRegion = vendorCoords
    ? { latitude: vendorCoords.lat,   longitude: vendorCoords.lng,   latitudeDelta: 0.02, longitudeDelta: 0.02 }
    : customerCoords
    ? { latitude: customerCoords.lat, longitude: customerCoords.lng, latitudeDelta: 0.02, longitudeDelta: 0.02 }
    : { latitude: 20.5937, longitude: 78.9629, latitudeDelta: 10, longitudeDelta: 10 };

  const handleCall = () => {
    Alert.alert("Call Professional", "This will call the assigned professional.", [
      { text: "Cancel", style: "cancel" },
      { text: "Call", onPress: () => Linking.openURL("tel:+919999999999") },
    ]);
  };

  return (
    <View style={s.root}>

      {/* ── Header ──────────────────────────────────────────────── */}
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} style={s.iconBtn}>
          <Ionicons name="arrow-back" size={22} color="white" />
        </Pressable>
        <Text style={s.headerTitle}>Live Tracking</Text>
        <Pressable style={s.iconBtn} onPress={() => navigation.navigate("Notifications")}>
          <Ionicons name="notifications-outline" size={20} color="white" />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
      >
        {/* ── ETA Hero ──────────────────────────────────────────── */}
        <Animated.View entering={FadeInDown.duration(350)}>
          <LinearGradient
            colors={status === "completed" ? ["#064e3b", "#047857"] : ["#15803d", "#22c55e"]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={s.hero}
          >
            <View style={s.heroBlobTL} />
            <View style={s.heroBlobBR} />

            <View style={s.heroContent}>
              {/* Live badge */}
              <View style={s.liveBadge}>
                <Animated.View style={[s.liveDot, pulseStyle]} />
                <Text style={s.liveBadgeText}>
                  {demoMode ? "DEMO MODE" : status === "completed" ? "COMPLETED" : "LIVE"}
                </Text>
              </View>

              <Text style={s.heroTitle}>
                {HERO_TITLES[status as BookingStatus] ?? "Tracking\nYour Service"}
              </Text>

              {/* ETA row — only when en_route */}
              {(status === "en_route" || status === "accepted") && (
                <View style={s.etaRow}>
                  <View>
                    <Text style={s.etaNumber}>{etaText}</Text>
                    <Text style={s.etaUnit}>Estimated Arrival</Text>
                  </View>
                  {distanceText ? (
                    <View style={s.distPill}>
                      <Ionicons name="navigate" size={13} color="rgba(255,255,255,0.8)" />
                      <Text style={s.distText}>{distanceText} away</Text>
                    </View>
                  ) : null}
                </View>
              )}

              <Text style={s.bookingId}>
                #{booking?.id?.slice(-8).toUpperCase() ?? "—"}
              </Text>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* ── Real MapView ───────────────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(80).duration(350)} style={s.mapCard}>
          <MapView
            ref={mapRef}
            style={s.map}
            provider={PROVIDER_GOOGLE}
            region={mapRegion}
            showsUserLocation={false}
            showsTraffic={false}
            showsCompass={false}
            scrollEnabled={true}
            zoomEnabled={true}
            rotateEnabled={false}
          >
            {/* Vendor marker */}
            {vendorCoords && (
              <Marker
                coordinate={{ latitude: vendorCoords.lat, longitude: vendorCoords.lng }}
                title={booking?.vendorName ?? "Professional"}
                anchor={{ x: 0.5, y: 0.5 }}
              >
                <View style={s.vendorPin}>
                  <LinearGradient
                    colors={demoMode ? ["#f59e0b", "#d97706"] : ["#2563eb", "#06b6d4"]}
                    style={s.vendorPinInner}
                  >
                    <Ionicons name="car" size={16} color="white" />
                  </LinearGradient>
                </View>
              </Marker>
            )}

            {/* Customer home marker */}
            {customerCoords && (
              <Marker
                coordinate={{ latitude: customerCoords.lat, longitude: customerCoords.lng }}
                title="Your Location"
                anchor={{ x: 0.5, y: 1 }}
              >
                <View style={s.homePin}>
                  <View style={s.homePinInner}>
                    <Ionicons name="home" size={16} color="white" />
                  </View>
                  <View style={s.homePinTail} />
                </View>
              </Marker>
            )}

            {/* Dashed route line */}
            {vendorCoords && customerCoords && (
              <Polyline
                coordinates={[
                  { latitude: vendorCoords.lat,   longitude: vendorCoords.lng },
                  { latitude: customerCoords.lat, longitude: customerCoords.lng },
                ]}
                strokeColor={demoMode ? "#f59e0b" : "#3b82f6"}
                strokeWidth={3}
                lineDashPattern={[10, 6]}
              />
            )}
          </MapView>

          {/* Map overlay pill */}
          <View style={s.mapOverlay}>
            <View style={[s.mapPill, demoMode && { backgroundColor: "rgba(245,158,11,0.85)" }]}>
              <Animated.View style={[s.mapPillDot, pulseStyle,
                demoMode && { backgroundColor: "#fef08a" }]} />
              <Text style={s.mapPillText}>
                {vendorCoords
                  ? demoMode
                    ? "Demo — real GPS not yet available"
                    : "Live vendor location"
                  : "Waiting for vendor GPS…"}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* ── Professional card ──────────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(140).duration(350)}>
          <LinearGradient colors={["#1e3a8a", "#0f172a"]} style={s.proCard}>
            <View style={s.proLeft}>
              <View style={s.proAvatarWrap}>
                <LinearGradient colors={["#2563eb", "#8b5cf6"]} style={s.proAvatar}>
                  <Text style={s.proAvatarText}>{initials}</Text>
                </LinearGradient>
                {booking?.vendorId && (
                  <View style={s.proVerified}>
                    <Ionicons name="checkmark-circle" size={16} color="#22c55e" />
                  </View>
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.proName}>{booking?.vendorName ?? "Assigning…"}</Text>
                <Text style={s.proSub}>{booking?.serviceCategory ?? ""}</Text>
                {distanceText ? (
                  <Text style={s.proETA}>
                    {distanceText} · {etaText}
                  </Text>
                ) : null}
              </View>
            </View>
            <View style={s.proActions}>
              <Pressable style={s.proBtn} onPress={handleCall}>
                <Ionicons name="call" size={20} color="white" />
              </Pressable>
              <Pressable style={s.proBtn}>
                <Ionicons name="chatbubble-outline" size={20} color="white" />
              </Pressable>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* ── Status Timeline ─────────────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(200).duration(350)} style={s.timelineCard}>
          <Text style={s.timelineTitle}>Status</Text>
          {steps.map((step, i) => (
            <View key={step.label} style={s.stepRow}>
              {i < steps.length - 1 && (
                <View style={[s.stepLine, step.done && s.stepLineDone]} />
              )}
              {step.active ? (
                <View style={s.stepActiveWrap}>
                  <Animated.View style={[s.stepRing, ringStyle]} />
                  <View style={s.stepActiveDot} />
                </View>
              ) : (
                <View style={[s.stepDot, step.done && s.stepDotDone]}>
                  {step.done && <Ionicons name="checkmark" size={11} color="white" />}
                </View>
              )}
              <View style={s.stepText}>
                <Text style={[
                  s.stepLabel,
                  step.active  && s.stepLabelActive,
                  !step.done && !step.active && s.stepLabelPending,
                ]}>
                  {step.label}
                </Text>
                {step.time ? (
                  <Text style={[s.stepTime, step.active && s.stepTimeActive]}>
                    {step.time}
                  </Text>
                ) : null}
              </View>
            </View>
          ))}
        </Animated.View>

        {/* ── Booking + Payment Info ───────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(260).duration(350)} style={s.infoRow}>
          <LinearGradient colors={["#4338ca", "#312e81"]} style={s.infoCard}>
            <View style={s.infoIconRow}>
              <Ionicons name="sparkles" size={16} color="white" />
              <Text style={s.infoCardTitle}>Booking</Text>
            </View>
            <Text style={s.infoValue}>{booking?.serviceCategory ?? "—"}</Text>
            <Text style={s.infoSub}>
              {booking?.scheduledAt
                ? new Date(booking.scheduledAt).toLocaleString("en-IN", {
                    month: "short", day: "numeric",
                    hour: "2-digit", minute: "2-digit",
                  })
                : "—"}
            </Text>
            <Text style={[s.infoSub, { marginTop: 6 }]} numberOfLines={2}>
              {booking?.address ?? ""}
            </Text>
          </LinearGradient>

          <LinearGradient colors={["#047857", "#064e3b"]} style={s.infoCard}>
            <View style={s.infoIconRow}>
              <Ionicons name="card" size={16} color="white" />
              <Text style={s.infoCardTitle}>Payment</Text>
            </View>
            <Text style={s.infoSub}>Total</Text>
            <Text style={s.infoPrice}>
              {booking?.priceLabel ?? (booking?.price ? `₹${booking.price}` : "—")}
            </Text>
            <Pressable style={s.invoiceBtn}>
              <Text style={s.invoiceBtnText}>View Invoice</Text>
            </Pressable>
          </LinearGradient>
        </Animated.View>

        {loading && (
          <Text style={s.statusMsg}>Connecting to live tracking…</Text>
        )}
        {!loading && !booking && (
          <Text style={s.statusMsg}>No active booking found.</Text>
        )}

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* ── Bottom CTA ──────────────────────────────────────────────── */}
      <View style={s.cta}>
        <Pressable style={s.ctaBtn} onPress={handleCall}>
          <Ionicons name="call" size={20} color="white" />
          <Text style={s.ctaBtnText}>Contact Professional</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root:        { flex: 1, backgroundColor: "#081826" },
  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 16, paddingTop: 52, paddingBottom: 12,
  },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "white" },
  iconBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.12)",
    justifyContent: "center", alignItems: "center",
  },
  scroll:    { paddingHorizontal: 16 },
  statusMsg: { textAlign: "center", color: "rgba(255,255,255,0.4)", fontSize: 13, marginTop: 24 },

  // Hero
  hero: { borderRadius: 28, padding: 24, marginBottom: 14, minHeight: 160, overflow: "hidden" },
  heroBlobTL: {
    position: "absolute", top: -40, left: -40,
    width: 160, height: 160, borderRadius: 80,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  heroBlobBR: {
    position: "absolute", bottom: -50, right: -30,
    width: 200, height: 200, borderRadius: 100,
    backgroundColor: "rgba(0,0,0,0.1)",
  },
  heroContent: { zIndex: 1 },
  liveBadge: {
    flexDirection: "row", alignItems: "center", gap: 7,
    backgroundColor: "rgba(0,0,0,0.25)", borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 6, alignSelf: "flex-start",
    marginBottom: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.2)",
  },
  liveDot:       { width: 8, height: 8, borderRadius: 4, backgroundColor: "white" },
  liveBadgeText: { fontSize: 11, fontWeight: "800", color: "white", letterSpacing: 1 },
  heroTitle:     { fontSize: 28, fontWeight: "700", color: "white", lineHeight: 36, marginBottom: 12 },
  etaRow:        { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  etaNumber:     { fontSize: 36, fontWeight: "700", color: "white" },
  etaUnit:       { fontSize: 13, color: "rgba(255,255,255,0.75)", marginTop: 2 },
  distPill: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: "rgba(0,0,0,0.25)", borderRadius: 16,
    paddingHorizontal: 12, paddingVertical: 8,
  },
  distText:  { fontSize: 13, color: "rgba(255,255,255,0.85)", fontWeight: "600" },
  bookingId: { fontSize: 12, color: "rgba(255,255,255,0.55)", marginTop: 4 },

  // Map
  mapCard:    { borderRadius: 24, overflow: "hidden", marginBottom: 14, height: 240 },
  map:        { flex: 1 },
  mapOverlay: { position: "absolute", bottom: 10, left: 10, right: 10 },
  mapPill: {
    flexDirection: "row", alignItems: "center", gap: 7,
    backgroundColor: "rgba(8,24,38,0.8)", borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 7, alignSelf: "flex-start",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.12)",
  },
  mapPillDot:  { width: 7, height: 7, borderRadius: 3.5, backgroundColor: "#22c55e" },
  mapPillText: { fontSize: 11, fontWeight: "600", color: "rgba(255,255,255,0.9)" },

  // Markers
  vendorPin:      { alignItems: "center" },
  vendorPinInner: {
    width: 38, height: 38, borderRadius: 19,
    justifyContent: "center", alignItems: "center",
    borderWidth: 2.5, borderColor: "white",
    elevation: 6,
  },
  homePin:      { alignItems: "center" },
  homePinInner: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "#ef4444",
    justifyContent: "center", alignItems: "center",
    borderWidth: 2.5, borderColor: "white",
    elevation: 6,
  },
  homePinTail: {
    width: 0, height: 0,
    borderLeftWidth: 6, borderRightWidth: 6, borderTopWidth: 10,
    borderLeftColor: "transparent", borderRightColor: "transparent",
    borderTopColor: "#ef4444", marginTop: -1,
  },

  // Professional card
  proCard: {
    borderRadius: 24, padding: 18, marginBottom: 14,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
  },
  proLeft:       { flexDirection: "row", alignItems: "center", gap: 14, flex: 1 },
  proAvatarWrap: { position: "relative" },
  proAvatar: {
    width: 56, height: 56, borderRadius: 28,
    justifyContent: "center", alignItems: "center",
  },
  proAvatarText: { fontSize: 20, fontWeight: "700", color: "white" },
  proVerified:   { position: "absolute", bottom: -2, right: -2 },
  proName:       { fontSize: 16, fontWeight: "700", color: "white" },
  proSub:        { fontSize: 12, color: "rgba(255,255,255,0.55)", marginTop: 2 },
  proETA:        { fontSize: 12, color: "#4ade80", marginTop: 4, fontWeight: "600" },
  proActions:    { flexDirection: "row", gap: 10 },
  proBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center", alignItems: "center",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.15)",
  },

  // Timeline
  timelineCard: {
    backgroundColor: colors.surface.container, borderRadius: 24, padding: 20,
    marginBottom: 14, borderWidth: 1, borderColor: colors.glass.border,
  },
  timelineTitle: { fontSize: 16, fontWeight: "700", color: "white", marginBottom: 20 },
  stepRow:       { flexDirection: "row", alignItems: "flex-start", gap: 14, paddingLeft: 8, minHeight: 52 },
  stepLine: {
    position: "absolute", left: 19, top: 26, width: 2, height: 34,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  stepLineDone:  { backgroundColor: "#22c55e" },
  stepDot: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: colors.surface.containerHighest,
    borderWidth: 2, borderColor: "rgba(255,255,255,0.2)",
    justifyContent: "center", alignItems: "center", flexShrink: 0,
  },
  stepDotDone:   { backgroundColor: "#22c55e", borderColor: "#22c55e" },
  stepActiveWrap:{ width: 24, height: 24, justifyContent: "center", alignItems: "center", flexShrink: 0 },
  stepRing: {
    position: "absolute", width: 24, height: 24, borderRadius: 12,
    borderWidth: 2, borderColor: "#3b82f6",
  },
  stepActiveDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: "#3b82f6" },
  stepText:      { flex: 1, paddingTop: 2 },
  stepLabel:     { fontSize: 14, fontWeight: "600", color: colors.text.secondary },
  stepLabelActive:  { color: "#3b82f6", fontWeight: "700" },
  stepLabelPending: { opacity: 0.4 },
  stepTime:         { fontSize: 12, color: colors.text.muted, marginTop: 2 },
  stepTimeActive:   { color: "#3b82f6" },

  // Info cards
  infoRow:      { flexDirection: "row", gap: 12, marginBottom: 8 },
  infoCard:     { flex: 1, borderRadius: 24, padding: 18, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  infoIconRow:  { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  infoCardTitle:{ fontSize: 14, fontWeight: "700", color: "white" },
  infoValue:    { fontSize: 14, fontWeight: "700", color: "white", marginBottom: 4 },
  infoSub:      { fontSize: 12, color: "rgba(255,255,255,0.6)" },
  infoPrice:    { fontSize: 26, fontWeight: "700", color: "white", marginTop: 4, marginBottom: 10 },
  invoiceBtn: {
    backgroundColor: "rgba(255,255,255,0.12)", borderRadius: 12, padding: 9,
    alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.2)",
  },
  invoiceBtnText: { fontSize: 12, fontWeight: "700", color: "white" },

  // CTA
  cta: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    paddingHorizontal: 16, paddingBottom: 28, paddingTop: 12,
    backgroundColor: "rgba(8,24,38,0.95)",
    borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.08)",
  },
  ctaBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
    backgroundColor: "#2563eb", borderRadius: 22, paddingVertical: 16,
  },
  ctaBtnText: { fontSize: 15, fontWeight: "700", color: "white" },
});
