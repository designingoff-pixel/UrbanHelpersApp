import React, { useEffect, useRef, useState } from "react";
import {
  View, Text, Pressable, StyleSheet,
  Linking, Alert, ScrollView, Image, Platform,
} from "react-native";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import Animated, {
  useSharedValue, useAnimatedStyle,
  withRepeat, withSequence, withTiming, FadeInDown, FadeIn,
} from "react-native-reanimated";
import {
  doc, onSnapshot, collection, query, where, limit, addDoc, serverTimestamp,
} from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { db } from "@/services/firebase";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { cancelBooking } from "@/services/bookingService";
import { sendServiceCompletedNotification } from "@/services/notificationService";
import { RootStackParamList } from "@/navigation/types";
import {
  getDistanceKm, formatETA, formatDistance,
} from "@/services/locationService";

type Props = NativeStackScreenProps<RootStackParamList, "LiveTracking">;

type BookingStatus =
  | "requested" | "assigned" | "accepted"
  | "en_route"  | "arrived"  | "in_progress"
  | "completed" | "cancelled";

interface LiveBooking {
  id: string;
  vendorId?: string;
  vendorName?: string;
  vendorImage?: string;
  serviceCategory?: string;
  status: BookingStatus;
  address?: string;
  scheduledAt?: string;
  price?: number;
  priceLabel?: string;
  customerLat?: number;
  customerLng?: number;
  otp?: string;
  vendorPhone?: string;
  rated?: boolean;
}

interface VendorCoords {
  lat: number;
  lng: number;
  heading?: number;
  speed?: number;
}

const TEAL = "#00bcd4";
const TEAL_D = "#0097a7";

// 6 Full Milestones matching exact workflow
const MILESTONES = [
  { key: "requested",   label: "Booking Confirmed",     icon: "checkmark-circle" },
  { key: "assigned",    label: "Vendor Assigned",       icon: "person" },
  { key: "en_route",    label: "On The Way",            icon: "bicycle" },
  { key: "arrived",     label: "Arrived at Location",   icon: "location" },
  { key: "in_progress", label: "Service in Progress",   icon: "sparkles" },
  { key: "completed",   label: "Completed",             icon: "star" },
];

export default function LiveTrackingScreen({ navigation, route }: Props) {
  const { user } = useAuth();
  const { isDark, colors: themeColors } = useTheme();
  const routeBookingId = route.params?.bookingId;
  const mapRef = useRef<MapView>(null);

  const pulse = useSharedValue(1);
  const ring  = useSharedValue(0.8);
  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(withTiming(1.3, { duration: 800 }), withTiming(1, { duration: 800 })),
      -1,
      false
    );
    ring.value  = withRepeat(
      withSequence(withTiming(1.4, { duration: 900 }), withTiming(0.8, { duration: 900 })),
      -1,
      false
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));
  const ringStyle  = useAnimatedStyle(() => ({
    transform: [{ scale: ring.value }],
    opacity: Math.max(0, 2 - ring.value),
  }));

  const [booking,        setBooking]        = useState<LiveBooking | null>(null);
  const [vendorCoords,   setVendorCoords]   = useState<VendorCoords | null>(null);
  const [customerCoords, setCustomerCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [etaText,        setEtaText]        = useState("Calculating...");
  const [distanceText,   setDistanceText]   = useState("");
  const [loading,        setLoading]        = useState(true);

  // Subscribe to exact booking or customer's latest active booking
  useEffect(() => {
    if (!user) return;

    if (routeBookingId) {
      const unsub = onSnapshot(doc(db, "bookings", routeBookingId), (snap) => {
        if (!snap.exists()) {
          setBooking(null);
          setLoading(false);
          return;
        }
        const data = { id: snap.id, ...snap.data() } as LiveBooking;
        setBooking(data);
        setLoading(false);
        if (data.customerLat && data.customerLng) {
          setCustomerCoords({ lat: data.customerLat, lng: data.customerLng });
        }
      });
      return () => unsub();
    }

    const q = query(
      collection(db, "bookings"),
      where("customerId", "==", user.uid),
      limit(10)
    );
    const unsub = onSnapshot(q, (snap) => {
      if (snap.empty) {
        setBooking(null);
        setLoading(false);
        return;
      }
      const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as LiveBooking & { createdAt?: any }));
      docs.sort((a, b) => {
        const aActive = a.status !== "completed" && a.status !== "cancelled";
        const bActive = b.status !== "completed" && b.status !== "cancelled";
        if (aActive && !bActive) return -1;
        if (!aActive && bActive) return 1;
        const aTime = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt ? new Date(a.createdAt).getTime() : 0);
        const bTime = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt ? new Date(b.createdAt).getTime() : 0);
        return bTime - aTime;
      });

      const chosen = docs[0];
      setBooking(chosen);
      setLoading(false);
      if (chosen.customerLat && chosen.customerLng) {
        setCustomerCoords({ lat: chosen.customerLat, lng: chosen.customerLng });
      }
    });
    return () => unsub();
  }, [user, routeBookingId]);

  // Vendor assignment condition: only show location and live GPS when vendor is assigned
  const isVendorAssigned = !!booking?.vendorId && booking.status !== "requested";
  const isTrackingActive = isVendorAssigned && booking?.status !== "completed" && booking?.status !== "cancelled";

  // Subscribe to Vendor's live GPS coords ONLY when assigned
  useEffect(() => {
    if (!isTrackingActive || !booking?.vendorId) {
      setVendorCoords(null);
      return;
    }

    const unsub = onSnapshot(doc(db, "vendors", booking.vendorId), (snap) => {
      if (!snap.exists()) return;
      const data = snap.data();
      if (data?.location?.lat && data?.location?.lng) {
        setVendorCoords({
          lat: data.location.lat,
          lng: data.location.lng,
          heading: data.location.heading,
          speed: data.location.speed,
        });
      }
    });
    return () => unsub();
  }, [isTrackingActive, booking?.vendorId]);

  // Recalculate ETA and Distance
  useEffect(() => {
    if (!vendorCoords || !customerCoords || !isTrackingActive) {
      if (!isVendorAssigned) {
        setEtaText("Finding Pro...");
        setDistanceText("");
      }
      return;
    }
    const km = getDistanceKm(vendorCoords.lat, vendorCoords.lng, customerCoords.lat, customerCoords.lng);
    setEtaText(formatETA(Math.max(1, Math.round((km / 25) * 60))));
    setDistanceText(formatDistance(km));
  }, [vendorCoords, customerCoords, isTrackingActive, isVendorAssigned]);

  // Auto trigger review & rating when status becomes "completed"
  const reviewTriggeredRef = useRef(false);
  useEffect(() => {
    if (!booking) return;
    if (booking.status === "completed" && !booking.rated && !reviewTriggeredRef.current) {
      const checkAndTriggerReview = async () => {
        const reviewedKey = `booking_reviewed_${booking.id}`;
        const alreadyReviewed = await AsyncStorage.getItem(reviewedKey);
        if (!alreadyReviewed) {
          reviewTriggeredRef.current = true;
          await AsyncStorage.setItem(reviewedKey, "true");
          sendServiceCompletedNotification(booking.serviceCategory ?? "Service", booking.id).catch(console.warn);
          setTimeout(() => {
            navigation.navigate("RatingFeedback", {
              bookingId: booking.id,
              serviceCategory: booking.serviceCategory,
              vendorName: booking.vendorName,
            } as any);
          }, 1500);
        }
      };
      checkAndTriggerReview();
    }
  }, [booking?.status, booking?.id, booking?.rated]);

  const status = booking?.status ?? "requested";
  const proName = booking?.vendorName || (isVendorAssigned ? "Ramesh Kumar" : "Assigning Professional...");
  const proPhone = booking?.vendorPhone || "+91 98765 43210";
  const proCategory = booking?.serviceCategory || "Cleaning";

  // Step milestone status calculations
  const getStepState = (stepKey: string) => {
    const order = ["requested", "assigned", "en_route", "arrived", "in_progress", "completed"];
    const currentIdx = order.indexOf(status === "accepted" ? "assigned" : status);
    const stepIdx = order.indexOf(stepKey);

    if (status === "completed") return "done";
    if (stepIdx < currentIdx) return "done";
    if (stepIdx === currentIdx) return "active";
    return "pending";
  };

  const handleCall = () => {
    if (!isVendorAssigned) {
      Alert.alert("Professional Not Assigned", "We are currently assigning a verified professional to your booking.");
      return;
    }
    Alert.alert(
      "Call Professional",
      `Call ${proName} at ${proPhone}?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Call", onPress: () => Linking.openURL(`tel:${proPhone}`) },
      ]
    );
  };

  const handleCustomerSOS = () => {
    Alert.alert(
      "🚨 Emergency Safety SOS",
      "Do you require immediate emergency assistance at your location?",
      [
        {
          text: "Call Police (112)",
          style: "destructive",
          onPress: async () => {
            try {
              await addDoc(collection(db, "sos_alerts"), {
                alertType: "POLICE_CUSTOMER_EMERGENCY",
                bookingId: booking?.id || null,
                customerId: user?.uid || null,
                createdAt: serverTimestamp(),
              });
            } catch (_) {}
            Linking.openURL("tel:112");
          },
        },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  // Map Region
  const mapRegion = customerCoords
    ? { latitude: customerCoords.lat, longitude: customerCoords.lng, latitudeDelta: 0.012, longitudeDelta: 0.012 }
    : { latitude: 11.0168, longitude: 76.9558, latitudeDelta: 0.05, longitudeDelta: 0.05 };

  const bgStyle = { backgroundColor: isDark ? "#081826" : "#F4F6F9" };
  const cardBgStyle = {
    backgroundColor: isDark ? "#0D2135" : "#FFFFFF",
    borderColor: isDark ? "rgba(0,188,212,0.18)" : "#E2E8F0",
  };
  const textPrimary = { color: isDark ? "#FFFFFF" : "#0F172A" };
  const textSecondary = { color: isDark ? "#94A3B8" : "#64748B" };

  return (
    <View style={[s.root, bgStyle]}>
      {/* ── Top Header ──────────────────────────────────────────────── */}
      <View style={[s.header, { backgroundColor: isDark ? "#081826" : "#FFFFFF", borderBottomColor: isDark ? "rgba(255,255,255,0.06)" : "#E2E8F0" }]}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={[s.headerBtn, { backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "#F1F5F9" }]}
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={22} color={isDark ? "#fff" : "#0f172a"} />
        </Pressable>
        <View style={s.headerCenter}>
          <Text style={[s.headerTitle, textPrimary]}>Live Tracking</Text>
          <Text style={s.headerSubtitle}>
            {isVendorAssigned ? "Professional is on the way" : "Finding nearest professional"}
          </Text>
        </View>
        <View style={s.headerRight}>
          <Pressable
            style={[s.headerBtn, { backgroundColor: "rgba(239, 68, 68, 0.15)", borderColor: "#ef4444", borderWidth: 1 }]}
            onPress={handleCustomerSOS}
          >
            <Ionicons name="warning" size={17} color="#ef4444" />
          </Pressable>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
      >
        {/* ── 1. Assigned Vendor Hero Card ────────────────────────────── */}
        <Animated.View entering={FadeInDown.duration(380)} style={s.proCard}>
          <LinearGradient
            colors={isDark ? ["#0f2e46", "#091f33"] : ["#0F766E", "#0D5E58"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={s.proCardGradient}
          >
            <View style={s.proAvatarWrapper}>
              <Image
                source={
                  booking?.vendorImage
                    ? { uri: booking.vendorImage }
                    : require("../../../assets/technician_ramesh.png")
                }
                style={s.proAvatar}
                resizeMode="cover"
              />
              {isVendorAssigned && <View style={s.onlineBadge} />}
            </View>

            <View style={s.proInfo}>
              <View style={s.proNameRow}>
                <Text style={s.proName}>{proName}</Text>
                {isVendorAssigned && (
                  <View style={s.ratingBadge}>
                    <Ionicons name="star" size={12} color="#f59e0b" />
                    <Text style={s.ratingText}>4.8</Text>
                  </View>
                )}
              </View>
              <Text style={s.proSubtitle}>
                {isVendorAssigned ? `${proCategory} Expert` : "Connecting to nearby partner..."}
              </Text>
              <View style={s.verifiedRow}>
                <Ionicons
                  name={isVendorAssigned ? "checkmark-circle" : "sync"}
                  size={13}
                  color={isVendorAssigned ? "#22c55e" : "#f59e0b"}
                />
                <Text style={[s.verifiedText, !isVendorAssigned && { color: "#f59e0b" }]}>
                  {isVendorAssigned ? "Verified Professional" : "Assigning Expert..."}
                </Text>
              </View>
            </View>

            {isVendorAssigned && (
              <Pressable
                onPress={handleCall}
                style={({ pressed }) => [s.callCircleBtn, { opacity: pressed ? 0.8 : 1 }]}
                accessibilityLabel="Call Professional"
              >
                <Ionicons name="call" size={20} color="#0F766E" />
              </Pressable>
            )}
          </LinearGradient>
        </Animated.View>

        {/* ── 2. Full Stepper Timeline (6 Milestones) ─────────────────── */}
        <Animated.View entering={FadeInDown.delay(100).duration(380)} style={[s.stepperCard, cardBgStyle]}>
          <Text style={[s.stepperSectionTitle, textPrimary]}>Service Status Timeline</Text>
          <View style={s.timelineVertical}>
            {MILESTONES.map((step, idx) => {
              const st = getStepState(step.key);
              const isDone = st === "done";
              const isActive = st === "active";

              return (
                <View key={step.key} style={s.timelineStepRow}>
                  {/* Left Icon & Connector Line */}
                  <View style={s.timelineStepLeft}>
                    {isActive ? (
                      <View style={s.activeRing}>
                        <Animated.View style={[s.activePulse, pulseStyle]} />
                        <View style={s.activeDot}>
                          <Ionicons name={step.icon as any} size={13} color="#fff" />
                        </View>
                      </View>
                    ) : isDone ? (
                      <View style={s.doneCircle}>
                        <Ionicons name="checkmark" size={13} color="#fff" />
                      </View>
                    ) : (
                      <View style={[s.pendingCircle, { backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "#F1F5F9", borderColor: isDark ? "rgba(255,255,255,0.15)" : "#CBD5E1" }]}>
                        <Ionicons name={step.icon as any} size={12} color="#94A3B8" />
                      </View>
                    )}

                    {idx < MILESTONES.length - 1 && (
                      <View
                        style={[
                          s.verticalLine,
                          { backgroundColor: isDark ? "rgba(255,255,255,0.12)" : "#E2E8F0" },
                          isDone && s.verticalLineDone,
                        ]}
                      />
                    )}
                  </View>

                  {/* Right Details */}
                  <View style={s.timelineStepRight}>
                    <Text
                      style={[
                        s.timelineStepLabel,
                        { color: isDark ? "#94A3B8" : "#64748B" },
                        isActive && [s.timelineStepLabelActive, { color: isDark ? TEAL : "#0F766E" }],
                        isDone && [s.timelineStepLabelDone, textPrimary],
                      ]}
                    >
                      {step.label}
                    </Text>
                    {isActive && (
                      <Text style={s.timelineStepActiveHint}>
                        {step.key === "requested"
                          ? "We are locating the best professional near your address."
                          : step.key === "assigned"
                          ? `${proName} accepted your booking and is preparing.`
                          : step.key === "en_route"
                          ? `On the way to your doorstep. Arriving in ~${etaText}.`
                          : step.key === "arrived"
                          ? "Technician is outside. Please provide the OTP below to begin."
                          : step.key === "in_progress"
                          ? "Service is actively being performed with care."
                          : "Job completed! Rate your experience."}
                      </Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </Animated.View>

        {/* ── 3. Real Interactive Google Map ──────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(180).duration(380)} style={s.mapContainer}>
          <MapView
            ref={mapRef}
            style={s.map}
            provider={PROVIDER_GOOGLE}
            region={mapRegion}
            showsUserLocation={false}
            showsTraffic={false}
            showsCompass={false}
          >
            {/* Customer Doorstep Marker */}
            {customerCoords && (
              <Marker
                coordinate={{ latitude: customerCoords.lat, longitude: customerCoords.lng }}
                title="Your Doorstep"
              >
                <View style={s.homeMarker}>
                  <Ionicons name="home" size={15} color="#fff" />
                </View>
              </Marker>
            )}

            {/* Vendor Live Marker (ONLY when assigned) */}
            {isVendorAssigned && vendorCoords && (
              <Marker
                coordinate={{ latitude: vendorCoords.lat, longitude: vendorCoords.lng }}
                title={proName}
              >
                <View style={s.vendorMarker}>
                  <Ionicons name="bicycle" size={16} color="#fff" />
                </View>
              </Marker>
            )}

            {/* Route Polyline (ONLY when assigned and both coords exist) */}
            {isVendorAssigned && vendorCoords && customerCoords && (
              <Polyline
                coordinates={[
                  { latitude: vendorCoords.lat,   longitude: vendorCoords.lng },
                  { latitude: customerCoords.lat, longitude: customerCoords.lng },
                ]}
                strokeColor={TEAL}
                strokeWidth={4}
                lineDashPattern={[6, 4]}
              />
            )}
          </MapView>

          {/* Floating Map Pill */}
          <View style={s.floatingMapPill}>
            <Animated.View
              style={[
                s.liveBlinkDot,
                pulseStyle,
                { backgroundColor: isVendorAssigned ? "#22c55e" : "#f59e0b" },
              ]}
            />
            <Text style={s.floatingPillText}>
              {isVendorAssigned
                ? `Professional En Route · ETA ${etaText}`
                : "Locating nearest verified partner..."}
            </Text>
          </View>
        </Animated.View>

        {/* ── 4. Separate Prominent ETA & Distance Stats Bar (Below Map) ── */}
        <Animated.View entering={FadeInDown.delay(220).duration(380)} style={[s.etaStatsCard, cardBgStyle]}>
          <View style={s.etaStatsLeft}>
            <View style={[s.etaStatsIconCircle, { backgroundColor: isDark ? "rgba(0,188,212,0.15)" : "#E0F2FE" }]}>
              <Ionicons name="time" size={20} color={isDark ? TEAL : "#0284C7"} />
            </View>
            <View>
              <Text style={[s.etaStatsTitle, textPrimary]}>
                {isVendorAssigned ? etaText : "Assigning..."}
              </Text>
              <Text style={[s.etaStatsSub, textSecondary]}>
                {distanceText ? `${distanceText} away from doorstep` : "Real-time GPS tracking active"}
              </Text>
            </View>
          </View>

          <View style={[s.liveLocBadge, { backgroundColor: isDark ? "rgba(0,188,212,0.12)" : "#F0FDFA" }]}>
            <Ionicons name="navigate" size={13} color={isDark ? TEAL : "#059669"} />
            <Text style={[s.liveLocText, { color: isDark ? TEAL : "#059669" }]}>Live GPS</Text>
          </View>
        </Animated.View>

        {/* ── 5. OTP Display Box (Highlighted when Arrived or In Progress) */}
        {booking?.otp && (
          <Animated.View entering={FadeInDown.delay(260).duration(380)} style={[s.otpHighlightCard, { backgroundColor: isDark ? "rgba(0,188,212,0.1)" : "#F0FDFA", borderColor: isDark ? "rgba(0,188,212,0.3)" : "#5EEAD4" }]}>
            <View style={s.otpCardTop}>
              <Ionicons name="shield-checkmark" size={18} color={TEAL} />
              <Text style={[s.otpCardHeading, { color: isDark ? TEAL : "#0F766E" }]}>START-SERVICE OTP</Text>
            </View>
            <View style={s.otpDigitsRow}>
              {String(booking.otp).slice(0, 4).split("").map((digit, i) => (
                <View key={i} style={[s.otpBox, { backgroundColor: isDark ? "rgba(0,188,212,0.2)" : "#CCFBF1", borderColor: isDark ? "rgba(0,188,212,0.4)" : "#2DD4BF" }]}>
                  <Text style={[s.otpDigitText, { color: isDark ? "#fff" : "#0F766E" }]}>{digit}</Text>
                </View>
              ))}
            </View>
            <Text style={[s.otpCardNotice, textSecondary]}>
              Share this 4-digit verification code with {proName.split(" ")[0]} when they arrive to start the service.
            </Text>
          </Animated.View>
        )}

        {/* ── 6. Booking Summary Card ─────────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(300).duration(380)} style={[s.detailCard, cardBgStyle]}>
          <View style={s.detailHeader}>
            <View>
              <Text style={[s.detailTitle, textSecondary]}>Booking Reference</Text>
              <Text style={[s.detailRef, textPrimary]}>#{booking?.id?.slice(-8).toUpperCase() || "AP4AB0H3"}</Text>
            </View>
            <Text style={[s.detailPrice, { color: isDark ? TEAL : "#0F766E" }]}>
              {booking?.priceLabel || "₹600"}
            </Text>
          </View>

          <View style={[s.addressRow, { borderTopColor: isDark ? "rgba(255,255,255,0.06)" : "#E2E8F0" }]}>
            <Ionicons name="location-outline" size={16} color={TEAL} />
            <Text style={[s.addressText, textSecondary]} numberOfLines={2}>
              {booking?.address || "142, Orchid Greens, 2nd Cross, HSR Layout, Sector 4"}
            </Text>
          </View>
        </Animated.View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* ── Sticky Bottom Actions ───────────────────────────────────── */}
      <View style={[s.bottomCtaBar, { backgroundColor: isDark ? "rgba(8,24,38,0.96)" : "#FFFFFF", borderTopColor: isDark ? "rgba(255,255,255,0.08)" : "#E2E8F0" }]}>
        {booking?.status === "completed" ? (
          <Pressable
            style={s.rateBtn}
            onPress={() =>
              navigation.navigate("RatingFeedback", {
                bookingId: booking?.id || "",
                vendorName: proName,
                serviceCategory: proCategory,
              })
            }
          >
            <Ionicons name="star" size={18} color="#081826" />
            <Text style={s.rateBtnText}>Rate Professional & View Bill</Text>
          </Pressable>
        ) : (
          <View style={s.ctaRow}>
            <Pressable
              style={[s.callFullBtn, !isVendorAssigned && { opacity: 0.7 }]}
              onPress={handleCall}
            >
              <LinearGradient
                colors={[TEAL, TEAL_D]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={s.callFullGradient}
              >
                <Ionicons name="call" size={18} color="#fff" />
                <Text style={s.callFullText}>
                  {isVendorAssigned ? `Call ${proName.split(" ")[0]}` : "Assigning Contact..."}
                </Text>
              </LinearGradient>
            </Pressable>

            {booking && booking.status !== "cancelled" && (
              <Pressable
                style={[s.cancelBtn, { backgroundColor: isDark ? "rgba(239,68,68,0.12)" : "#FEF2F2" }]}
                onPress={() => {
                  Alert.alert(
                    "Cancel Service?",
                    "Are you sure you want to cancel this booking?",
                    [
                      { text: "Keep Service", style: "cancel" },
                      {
                        text: "Yes, Cancel",
                        style: "destructive",
                        onPress: async () => {
                          try {
                            await cancelBooking(booking.id, user!.uid, "Service no longer required");
                            Alert.alert("Cancelled", "Your booking has been cancelled.");
                            navigation.goBack();
                          } catch (e: any) {
                            Alert.alert("Cancellation Failed", e.message || "Could not cancel booking.");
                          }
                        },
                      },
                    ]
                  );
                }}
              >
                <Ionicons name="close" size={18} color="#ef4444" />
                <Text style={s.cancelText}>Cancel</Text>
              </Pressable>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 52 : 42,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  headerSubtitle: {
    fontSize: 12,
    color: TEAL,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },

  // 1. Pro Card
  proCard: {
    borderRadius: 22,
    overflow: "hidden",
    marginBottom: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  proCardGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 14,
  },
  proAvatarWrapper: {
    position: "relative",
  },
  proAvatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  onlineBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 13,
    height: 13,
    borderRadius: 6.5,
    backgroundColor: "#22c55e",
    borderWidth: 2,
    borderColor: "#091f33",
  },
  proInfo: {
    flex: 1,
  },
  proNameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  proName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#fff",
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(245,158,11,0.2)",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#f59e0b",
  },
  proSubtitle: {
    fontSize: 12.5,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 4,
  },
  verifiedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#4ade80",
  },
  callCircleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
  },

  // 2. Stepper Card
  stepperCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  stepperSectionTitle: {
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 14,
  },
  timelineVertical: {
    paddingLeft: 4,
  },
  timelineStepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    minHeight: 48,
  },
  timelineStepLeft: {
    alignItems: "center",
    width: 28,
    marginRight: 12,
  },
  verticalLine: {
    width: 2,
    flex: 1,
    marginVertical: 4,
    minHeight: 20,
  },
  verticalLineDone: {
    backgroundColor: "#22c55e",
  },
  doneCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#22c55e",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  activeRing: {
    width: 26,
    height: 26,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  activePulse: {
    position: "absolute",
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "rgba(0,188,212,0.3)",
  },
  activeDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: TEAL,
    alignItems: "center",
    justifyContent: "center",
  },
  pendingCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  timelineStepRight: {
    flex: 1,
    paddingTop: 2,
    paddingBottom: 10,
  },
  timelineStepLabel: {
    fontSize: 13,
  },
  timelineStepLabelActive: {
    fontWeight: "800",
  },
  timelineStepLabelDone: {
    fontWeight: "700",
  },
  timelineStepActiveHint: {
    fontSize: 11.5,
    color: "#059669",
    marginTop: 2,
    lineHeight: 16,
  },

  // 3. Map Container
  mapContainer: {
    height: 240,
    borderRadius: 22,
    overflow: "hidden",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(0,188,212,0.25)",
    position: "relative",
    elevation: 6,
  },
  map: {
    width: "100%",
    height: "100%",
  },
  homeMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#ef4444",
    borderWidth: 2,
    borderColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  vendorMarker: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: TEAL,
    borderWidth: 2,
    borderColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  floatingMapPill: {
    position: "absolute",
    top: 12,
    left: 14,
    right: 14,
    backgroundColor: "rgba(8,24,38,0.92)",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 9,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  liveBlinkDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  floatingPillText: {
    fontSize: 11.5,
    fontWeight: "600",
    color: "#fff",
    flex: 1,
  },

  // 4. Separate ETA Stats Card (Below Map)
  etaStatsCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  etaStatsLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  etaStatsIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  etaStatsTitle: {
    fontSize: 16,
    fontWeight: "800",
  },
  etaStatsSub: {
    fontSize: 11.5,
    marginTop: 2,
  },
  liveLocBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  liveLocText: {
    fontSize: 11,
    fontWeight: "700",
  },

  // 5. OTP Highlight Card
  otpHighlightCard: {
    borderRadius: 18,
    borderWidth: 1.5,
    padding: 16,
    alignItems: "center",
    marginBottom: 14,
  },
  otpCardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  otpCardHeading: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  otpDigitsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 8,
  },
  otpBox: {
    width: 46,
    height: 50,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  otpDigitText: {
    fontSize: 24,
    fontWeight: "900",
  },
  otpCardNotice: {
    fontSize: 11,
    textAlign: "center",
    lineHeight: 16,
  },

  // 6. Detail Card
  detailCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
  },
  detailHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  detailTitle: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  detailRef: {
    fontSize: 16,
    fontWeight: "800",
    marginTop: 2,
  },
  detailPrice: {
    fontSize: 18,
    fontWeight: "900",
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  addressText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
  },

  // Bottom CTA
  bottomCtaBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
    borderTopWidth: 1,
  },
  ctaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  callFullBtn: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 6,
    shadowColor: TEAL,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
  },
  callFullGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    gap: 8,
  },
  callFullText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
  },
  cancelBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1.5,
    borderColor: "#ef4444",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#ef4444",
  },
  rateBtn: {
    backgroundColor: "#f59e0b",
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 15,
  },
  rateBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#081826",
  },
});
