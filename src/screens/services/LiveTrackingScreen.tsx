import React, { useEffect, useState } from "react";
import { ScrollView, Text, View, Pressable, StyleSheet, Linking, Alert, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import Animated, {
  useSharedValue, useAnimatedStyle,
  withRepeat, withSequence, withTiming,
  FadeInDown,
} from "react-native-reanimated";
import {
  doc, onSnapshot, collection, query, where, limit,
} from "firebase/firestore";
import { db } from "@/services/firebase";
import { useAuth } from "@/context/AuthContext";
import { RootStackParamList } from "@/navigation/types";
import { colors } from "@/theme/colors";

const { width } = Dimensions.get("window");

type Props = NativeStackScreenProps<RootStackParamList, "LiveTracking">;

// ── Status → timeline step mapping ──────────────────────────────────────────
type BookingStatus =
  | "requested" | "assigned" | "accepted"
  | "en_route" | "arrived" | "in_progress" | "completed" | "cancelled";

type StepState = { label: string; done: boolean; active: boolean; time: string };

function buildSteps(status: BookingStatus, scheduledAt?: string): StepState[] {
  const timeStr = scheduledAt
    ? new Date(scheduledAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
    : "";

  const order: BookingStatus[] = [
    "requested", "assigned", "en_route", "arrived", "in_progress", "completed",
  ];
  const labels: Record<string, string> = {
    requested:   "Booking Confirmed",
    assigned:    "Professional Assigned",
    en_route:    "On The Way",
    arrived:     "Arriving",
    in_progress: "Service Started",
    completed:   "Completed",
  };

  const currentIdx = order.indexOf(status);

  return order.map((s, i) => ({
    label:  labels[s],
    done:   i < currentIdx,
    active: i === currentIdx,
    time:   i === 0 ? timeStr : i === currentIdx ? (s === "en_route" ? "ETA 15 Mins" : "Now") : "",
  }));
}

// ── Hero title from status ────────────────────────────────────────────────────
function heroTitle(status: BookingStatus): string {
  const map: Partial<Record<BookingStatus, string>> = {
    requested:   "Finding\nProfessional",
    assigned:    "Professional\nAssigned",
    accepted:    "Professional\nConfirmed",
    en_route:    "Professional\nOn The Way",
    arrived:     "Professional\nArrived",
    in_progress: "Service\nIn Progress",
    completed:   "Service\nCompleted",
  };
  return map[status] ?? "Tracking\nYour Service";
}

interface LiveBooking {
  id: string;
  vendorId?: string;
  vendorName?: string;
  serviceCategory?: string;
  status: BookingStatus;
  address?: string;
  scheduledAt?: string;
  price?: number;
  priceLabel?: string;
}

interface VendorLocation {
  lat: number;
  lng: number;
  heading?: number;
  speed?: number;
}

export default function LiveTrackingScreen({ navigation, route }: Props) {
  const { user } = useAuth();

  // ── Shared values for animations ─────────────────────────────────────────
  const pulse = useSharedValue(1);
  const ring  = useSharedValue(0.8);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(withTiming(1.3, { duration: 800 }), withTiming(1, { duration: 800 })),
      -1, false,
    );
    ring.value = withRepeat(
      withSequence(withTiming(1.4, { duration: 900 }), withTiming(0.8, { duration: 900 })),
      -1, false,
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));
  const ringStyle  = useAnimatedStyle(() => ({
    transform: [{ scale: ring.value }],
    opacity: 2 - ring.value,
  }));

  // ── Firestore state ───────────────────────────────────────────────────────
  const [booking, setBooking]           = useState<LiveBooking | null>(null);
  const [vendorLocation, setVendorLocation] = useState<VendorLocation | null>(null);
  const [loading, setLoading]           = useState(true);

  // Subscribe to the most recent active booking for this user
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "bookings"),
      where("customerId", "==", user.uid),
      where("status", "in", ["assigned", "accepted", "en_route", "arrived", "in_progress"]),
      limit(1),
    );

    const unsubBooking = onSnapshot(q, (snap) => {
      if (snap.empty) {
        setBooking(null);
        setLoading(false);
        return;
      }
      const d = snap.docs[0];
      setBooking({ id: d.id, ...d.data() } as LiveBooking);
      setLoading(false);
    });

    return unsubBooking;
  }, [user]);

  // Subscribe to vendor's live location once we know vendorId
  useEffect(() => {
    if (!booking?.vendorId) return;

    const unsubLocation = onSnapshot(
      doc(db, "vendors", booking.vendorId),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          if (data?.location?.lat) {
            setVendorLocation({
              lat:     data.location.lat,
              lng:     data.location.lng,
              heading: data.location.heading,
              speed:   data.location.speed,
            });
          }
        }
      },
    );

    return unsubLocation;
  }, [booking?.vendorId]);

  // Auto-navigate to rating screen when completed
  useEffect(() => {
    if (booking?.status === "completed") {
      navigation.navigate("RatingFeedback", {});
    }
  }, [booking?.status]);

  // ── Derived state ─────────────────────────────────────────────────────────
  const status   = booking?.status ?? "requested";
  const steps    = buildSteps(status as BookingStatus, booking?.scheduledAt);
  const vendorInitials = (booking?.vendorName ?? "VC")
    .split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();

  const handleCallVendor = () => {
    Alert.alert("Call Professional", "This will call the assigned professional.", [
      { text: "Cancel", style: "cancel" },
      { text: "Call", onPress: () => Linking.openURL("tel:+919999999999") },
    ]);
  };

  return (
    <View style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} style={s.iconBtn}>
          <Ionicons name="arrow-back" size={22} color="white" />
        </Pressable>
        <Text style={s.headerTitle}>Live Tracking</Text>
        <View style={s.headerRight}>
          <Pressable style={s.iconBtn} onPress={() => navigation.navigate("Notifications")}>
            <Ionicons name="notifications-outline" size={20} color="white" />
          </Pressable>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* ── ETA Hero ─────────────────────────────────────── */}
        <Animated.View entering={FadeInDown.duration(380)}>
          <LinearGradient
            colors={status === "completed" ? ["#064e3b", "#047857"] : ["#15803d", "#22c55e"]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={s.hero}
          >
            <View style={s.heroBlobTL} />
            <View style={s.heroBlobBR} />
            <View style={s.heroLeft}>
              <View style={s.liveBadge}>
                <Animated.View style={[s.liveDot, pulseStyle]} />
                <Text style={s.liveBadgeText}>
                  {status === "completed" ? "COMPLETED" : "LIVE UPDATE"}
                </Text>
              </View>
              <Text style={s.heroTitle}>{heroTitle(status as BookingStatus)}</Text>

              {status === "en_route" && (
                <View style={s.etaRow}>
                  <Text style={s.etaNumber}>~15</Text>
                  <Text style={s.etaUnit}>Minutes ETA</Text>
                </View>
              )}

              <Text style={s.bookingId}>
                ID: #{booking?.id?.slice(-8).toUpperCase() ?? "—"}
              </Text>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* ── Real Map ─────────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(80).duration(380)} style={s.mapCard}>
          <MapView
            style={s.map}
            provider={PROVIDER_GOOGLE}
            region={
              vendorLocation
                ? {
                    latitude:       vendorLocation.lat,
                    longitude:      vendorLocation.lng,
                    latitudeDelta:  0.02,
                    longitudeDelta: 0.02,
                  }
                : {
                    latitude:      20.5937,
                    longitude:     78.9629,
                    latitudeDelta: 10,
                    longitudeDelta: 10,
                  }
            }
            showsUserLocation={false}
            showsTraffic={false}
            showsCompass={false}
            scrollEnabled={false}
            zoomEnabled={false}
          >
            {/* Vendor marker — moves as GPS updates arrive */}
            {vendorLocation && (
              <Marker
                coordinate={{ latitude: vendorLocation.lat, longitude: vendorLocation.lng }}
                title={booking?.vendorName ?? "Professional"}
                anchor={{ x: 0.5, y: 0.5 }}
              >
                <View style={s.vendorPin}>
                  <LinearGradient colors={["#2563eb", "#06b6d4"]} style={s.vendorPinInner}>
                    <Ionicons name="car" size={16} color="white" />
                  </LinearGradient>
                </View>
              </Marker>
            )}
          </MapView>

          {/* Overlay label */}
          <View style={s.mapOverlay}>
            <View style={s.mapLivePill}>
              <Animated.View style={[s.liveDotSmall, pulseStyle]} />
              <Text style={s.mapLiveText}>
                {vendorLocation ? "Vendor location — live" : "Waiting for vendor GPS…"}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* ── Professional Card ──────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(140).duration(380)}>
          <LinearGradient colors={["#1e3a8a", "#0f172a"]} style={s.proCard}>
            <View style={s.proLeft}>
              <View style={s.proAvatarWrap}>
                <LinearGradient colors={["#2563eb", "#8343f4"]} style={s.proAvatar}>
                  <Text style={s.proAvatarText}>{vendorInitials}</Text>
                </LinearGradient>
                {booking?.vendorId && (
                  <View style={s.proVerified}>
                    <Ionicons name="checkmark-circle" size={16} color="#22c55e" />
                  </View>
                )}
              </View>
              <View>
                <Text style={s.proName}>
                  {booking?.vendorName ?? "Assigning…"}
                </Text>
                <Text style={s.proSub}>{booking?.serviceCategory ?? ""}</Text>
              </View>
            </View>
            <View style={s.proActions}>
              <Pressable style={s.proActionBtn} onPress={handleCallVendor}>
                <Ionicons name="call" size={20} color="white" />
              </Pressable>
              <Pressable style={s.proActionBtn}>
                <Ionicons name="chatbubble-outline" size={20} color="white" />
              </Pressable>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* ── Status Timeline ─────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(200).duration(380)} style={s.timelineCard}>
          <Text style={s.timelineTitle}>Status</Text>
          {steps.map((step, i) => (
            <View key={step.label} style={s.stepRow}>
              {i < steps.length - 1 && (
                <View style={[s.stepLine, step.done && s.stepLineDone]} />
              )}
              {step.active ? (
                <View style={s.stepDotActiveWrap}>
                  <Animated.View style={[s.stepDotRing, ringStyle]} />
                  <View style={s.stepDotActive} />
                </View>
              ) : (
                <View style={[s.stepDot, step.done && s.stepDotDone]}>
                  {step.done && <Ionicons name="checkmark" size={12} color="white" />}
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

        {/* ── Booking + Payment Info ───────────────────────── */}
        <Animated.View entering={FadeInDown.delay(260).duration(380)} style={s.infoRow}>
          <LinearGradient colors={["#4338ca", "#312e81"]} style={s.infoCard}>
            <View style={s.infoIconRow}>
              <Ionicons name="sparkles" size={18} color="white" />
              <Text style={s.infoCardTitle}>Booking Info</Text>
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
            <Text style={[s.infoSub, { marginTop: 8 }]}>{booking?.address ?? ""}</Text>
          </LinearGradient>

          <LinearGradient colors={["#047857", "#064e3b"]} style={s.infoCard}>
            <View style={s.infoIconRow}>
              <Ionicons name="card" size={18} color="white" />
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
          <Text style={s.loadingText}>Connecting to live tracking…</Text>
        )}
        {!loading && !booking && (
          <Text style={s.loadingText}>No active booking found.</Text>
        )}

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* ── Bottom CTA ─────────────────────────────────────── */}
      <View style={s.cta}>
        <Pressable style={s.ctaBtn} onPress={handleCallVendor}>
          <Ionicons name="call" size={20} color="white" />
          <Text style={s.ctaBtnText}>Contact Professional</Text>
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#081826" },
  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 16, paddingTop: 52, paddingBottom: 12,
  },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "white" },
  headerRight: { flexDirection: "row", gap: 8 },
  iconBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.12)",
    justifyContent: "center", alignItems: "center",
  },
  scroll: { paddingHorizontal: 16 },
  loadingText: { textAlign: "center", color: "rgba(255,255,255,0.4)", fontSize: 13, marginTop: 20 },

  hero: { borderRadius: 28, padding: 24, marginBottom: 14, minHeight: 180, overflow: "hidden" },
  heroBlobTL: { position: "absolute", top: -40, left: -40, width: 160, height: 160, borderRadius: 80, backgroundColor: "rgba(255,255,255,0.08)" },
  heroBlobBR: { position: "absolute", bottom: -50, right: -30, width: 200, height: 200, borderRadius: 100, backgroundColor: "rgba(0,0,0,0.1)" },
  heroLeft: { zIndex: 1 },
  liveBadge: {
    flexDirection: "row", alignItems: "center", gap: 7,
    backgroundColor: "rgba(0,0,0,0.25)", borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 6, alignSelf: "flex-start",
    marginBottom: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.2)",
  },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "white" },
  liveBadgeText: { fontSize: 11, fontWeight: "800", color: "white", letterSpacing: 1 },
  heroTitle: { fontSize: 28, fontWeight: "700", color: "white", lineHeight: 36, marginBottom: 12 },
  etaRow: { flexDirection: "row", alignItems: "baseline", gap: 8, marginBottom: 8 },
  etaNumber: { fontSize: 52, fontWeight: "700", color: "white", lineHeight: 56 },
  etaUnit: { fontSize: 18, color: "rgba(255,255,255,0.85)" },
  bookingId: { fontSize: 12, color: "rgba(255,255,255,0.6)" },

  mapCard:    { borderRadius: 24, overflow: "hidden", marginBottom: 14, height: 220 },
  map:        { flex: 1, height: 220 },
  mapOverlay: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    padding: 12,
  },
  mapLivePill:{
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "rgba(8,24,38,0.75)", borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 6, alignSelf: "flex-start",
  },
  liveDotSmall:{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: "#22c55e" },
  mapLiveText: { fontSize: 11, fontWeight: "700", color: "rgba(255,255,255,0.85)" },
  vendorPin:       { alignItems: "center" },
  vendorPinInner:  {
    width: 36, height: 36, borderRadius: 18,
    justifyContent: "center", alignItems: "center",
    borderWidth: 2, borderColor: "white",
  },

  proCard: {
    borderRadius: 24, padding: 18, marginBottom: 14,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
  },
  proLeft: { flexDirection: "row", alignItems: "center", gap: 14 },
  proAvatarWrap: { position: "relative" },
  proAvatar: { width: 56, height: 56, borderRadius: 28, justifyContent: "center", alignItems: "center" },
  proAvatarText: { fontSize: 20, fontWeight: "700", color: "white" },
  proVerified: { position: "absolute", bottom: 0, right: -2 },
  proName: { fontSize: 16, fontWeight: "700", color: "white" },
  proSub: { fontSize: 12, color: "rgba(255,255,255,0.55)", marginTop: 2 },
  proActions: { flexDirection: "row", gap: 10 },
  proActionBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center", alignItems: "center",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.15)",
  },

  timelineCard: {
    backgroundColor: colors.surface.container, borderRadius: 24, padding: 20,
    marginBottom: 14, borderWidth: 1, borderColor: colors.glass.border,
  },
  timelineTitle: { fontSize: 16, fontWeight: "700", color: "white", marginBottom: 20 },
  stepRow: { flexDirection: "row", alignItems: "flex-start", gap: 14, paddingLeft: 8, minHeight: 52 },
  stepLine: {
    position: "absolute", left: 19, top: 26, width: 2, height: 34,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  stepLineDone: { backgroundColor: "#22c55e" },
  stepDot: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: colors.surface.containerHighest,
    borderWidth: 2, borderColor: "rgba(255,255,255,0.2)",
    justifyContent: "center", alignItems: "center", flexShrink: 0,
  },
  stepDotDone: { backgroundColor: "#22c55e", borderColor: "#22c55e" },
  stepDotActiveWrap: { width: 24, height: 24, justifyContent: "center", alignItems: "center", flexShrink: 0 },
  stepDotRing: {
    position: "absolute", width: 24, height: 24, borderRadius: 12,
    borderWidth: 2, borderColor: "#3b82f6",
  },
  stepDotActive: { width: 14, height: 14, borderRadius: 7, backgroundColor: "#3b82f6" },
  stepText: { flex: 1, paddingTop: 2 },
  stepLabel: { fontSize: 14, fontWeight: "600", color: colors.text.secondary },
  stepLabelActive: { color: "#3b82f6", fontWeight: "700" },
  stepLabelPending: { opacity: 0.4 },
  stepTime: { fontSize: 12, color: colors.text.muted, marginTop: 2 },
  stepTimeActive: { color: "#3b82f6" },

  infoRow: { flexDirection: "row", gap: 12, marginBottom: 8 },
  infoCard: { flex: 1, borderRadius: 24, padding: 18, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  infoIconRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 14 },
  infoCardTitle: { fontSize: 14, fontWeight: "700", color: "white" },
  infoValue: { fontSize: 14, fontWeight: "700", color: "white", marginBottom: 4 },
  infoSub: { fontSize: 12, color: "rgba(255,255,255,0.6)" },
  infoPrice: { fontSize: 28, fontWeight: "700", color: "white", marginTop: 4, marginBottom: 12 },
  invoiceBtn: {
    backgroundColor: "rgba(255,255,255,0.12)", borderRadius: 14, padding: 10,
    alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.2)",
  },
  invoiceBtnText: { fontSize: 12, fontWeight: "700", color: "white" },

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
