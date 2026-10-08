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
import { cancelBooking } from "@/services/bookingService";
import { sendServiceCompletedNotification } from "@/services/notificationService";
import { RootStackParamList } from "@/navigation/types";
import { colors } from "@/theme/colors";
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

const TRACKING_STEPS = [
  { key: "requested", label: "Booking Confirmed", icon: "checkmark-circle" },
  { key: "en_route",  label: "On The Way",        icon: "bicycle" },
  { key: "arrived",   label: "Arrived At Location", icon: "location" },
  { key: "in_progress", label: "Service In Progress", icon: "sparkles" },
];

export default function LiveTrackingScreen({ navigation, route }: Props) {
  const { user } = useAuth();
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
  const [etaText,        setEtaText]        = useState("12 mins");
  const [distanceText,   setDistanceText]   = useState("1.8 km");
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

  const isVendorAccepted = !!booking?.vendorId && booking.status !== "requested";
  const isTrackingActive = isVendorAccepted && booking?.status !== "completed" && booking?.status !== "cancelled";

  // Subscribe to Vendor's live GPS coords
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
      if (!isVendorAccepted) {
        setEtaText("12 mins");
        setDistanceText("1.8 km");
      }
      return;
    }
    const km = getDistanceKm(vendorCoords.lat, vendorCoords.lng, customerCoords.lat, customerCoords.lng);
    setEtaText(formatETA(Math.max(1, Math.round((km / 25) * 60))));
    setDistanceText(formatDistance(km));
  }, [vendorCoords, customerCoords, isTrackingActive]);

  // Auto trigger review if completed
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

  const status = booking?.status ?? "en_route";
  const proName = booking?.vendorName || "Ramesh Kumar";
  const proPhone = booking?.vendorPhone || "+91 98765 43210";
  const proCategory = booking?.serviceCategory || "Cleaning";

  // Step Status calculations
  const getStepState = (stepKey: string) => {
    const order = ["requested", "en_route", "arrived", "in_progress", "completed"];
    const currentIdx = order.indexOf(status === "accepted" || status === "assigned" ? "en_route" : status);
    const stepIdx = order.indexOf(stepKey);

    if (status === "completed") return "done";
    if (stepIdx < currentIdx) return "done";
    if (stepIdx === currentIdx) return "active";
    return "pending";
  };

  const handleCall = () => {
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

  const mapRegion = customerCoords
    ? { latitude: customerCoords.lat, longitude: customerCoords.lng, latitudeDelta: 0.012, longitudeDelta: 0.012 }
    : { latitude: 11.0168, longitude: 76.9558, latitudeDelta: 0.05, longitudeDelta: 0.05 };

  return (
    <View style={s.root}>
      <LinearGradient
        colors={["#081826", "#0c2338", "#081826"]}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <View style={s.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={s.headerBtn}
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </Pressable>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>Live Tracking</Text>
          <Text style={s.headerSubtitle}>Your service is on the way</Text>
        </View>
        <View style={s.headerRight}>
          <Pressable
            style={[s.headerBtn, { backgroundColor: "rgba(239, 68, 68, 0.2)", borderColor: "#ef4444", borderWidth: 1 }]}
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
        {/* 1. Professional Gradient Card */}
        <Animated.View entering={FadeInDown.duration(380)} style={s.proCard}>
          <LinearGradient
            colors={["#0f2e46", "#091f33"]}
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
              <View style={s.onlineBadge} />
            </View>

            <View style={s.proInfo}>
              <View style={s.proNameRow}>
                <Text style={s.proName}>{proName}</Text>
                <View style={s.ratingBadge}>
                  <Ionicons name="star" size={12} color="#f59e0b" />
                  <Text style={s.ratingText}>4.8</Text>
                </View>
              </View>
              <Text style={s.proSubtitle}>{proCategory} Expert</Text>
              <View style={s.verifiedRow}>
                <Ionicons name="checkmark-circle" size={13} color="#22c55e" />
                <Text style={s.verifiedText}>Verified Professional</Text>
              </View>
            </View>

            <Pressable
              onPress={handleCall}
              style={({ pressed }) => [s.callCircleBtn, { opacity: pressed ? 0.8 : 1 }]}
              accessibilityLabel="Call Professional"
            >
              <Ionicons name="call" size={20} color="#fff" />
            </Pressable>
          </LinearGradient>
        </Animated.View>

        {/* 2. Stepper Timeline (Horizontal with 4 milestones) */}
        <Animated.View entering={FadeInDown.delay(100).duration(380)} style={s.stepperCard}>
          <View style={s.stepperRow}>
            {TRACKING_STEPS.map((step, idx) => {
              const st = getStepState(step.key);
              const isDone = st === "done";
              const isActive = st === "active";

              return (
                <View key={step.key} style={s.stepItem}>
                  {/* Step Icon / Circle */}
                  <View style={s.stepCircleWrap}>
                    {isActive ? (
                      <View style={s.activeRing}>
                        <Animated.View style={[s.activePulse, pulseStyle]} />
                        <View style={s.activeDot}>
                          <Ionicons name={step.icon as any} size={14} color="#fff" />
                        </View>
                      </View>
                    ) : isDone ? (
                      <View style={s.doneCircle}>
                        <Ionicons name="checkmark" size={14} color="#fff" />
                      </View>
                    ) : (
                      <View style={s.pendingCircle}>
                        <Ionicons name={step.icon as any} size={13} color="#64748b" />
                      </View>
                    )}

                    {/* Connecting Line to next step */}
                    {idx < TRACKING_STEPS.length - 1 && (
                      <View
                        style={[
                          s.connectingLine,
                          isDone && s.connectingLineDone,
                        ]}
                      />
                    )}
                  </View>

                  {/* Step Label */}
                  <Text
                    style={[
                      s.stepLabel,
                      isActive && s.stepLabelActive,
                      isDone && s.stepLabelDone,
                    ]}
                    numberOfLines={2}
                  >
                    {step.label}
                  </Text>
                </View>
              );
            })}
          </View>
        </Animated.View>

        {/* 3. Live Route Map Card */}
        <Animated.View entering={FadeInDown.delay(180).duration(380)} style={s.mapContainer}>
          {customerCoords ? (
            <MapView
              ref={mapRef}
              style={s.map}
              provider={PROVIDER_GOOGLE}
              region={mapRegion}
              showsUserLocation={false}
              showsTraffic={false}
              showsCompass={false}
            >
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

              {vendorCoords && (
                <Marker
                  coordinate={{ latitude: vendorCoords.lat, longitude: vendorCoords.lng }}
                  title={proName}
                >
                  <View style={s.vendorMarker}>
                    <Ionicons name="bicycle" size={16} color="#fff" />
                  </View>
                </Marker>
              )}

              {vendorCoords && customerCoords && (
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
          ) : (
            <Image
              source={require("../../../assets/live_tracking_map_route.png")}
              style={s.mapImageFallback}
              resizeMode="cover"
            />
          )}

          {/* Floating Top Pill on Map */}
          <View style={s.floatingMapPill}>
            <Animated.View style={[s.liveBlinkDot, pulseStyle]} />
            <Text style={s.floatingPillText}>
              Professional is on the way · Arriving in {etaText}
            </Text>
          </View>

          {/* Bottom Bar on Map */}
          <View style={s.mapBottomBar}>
            <View style={s.etaGroup}>
              <Ionicons name="time" size={16} color={TEAL} />
              <Text style={s.etaMainText}>{etaText}</Text>
              <Text style={s.etaSubText}>({distanceText} away)</Text>
            </View>
            <View style={s.liveLocBadge}>
              <Text style={s.liveLocText}>Live Location</Text>
              <Ionicons name="arrow-forward" size={14} color={TEAL} />
            </View>
          </View>
        </Animated.View>

        {/* 4. Booking Summary & OTP Card */}
        <Animated.View entering={FadeInDown.delay(260).duration(380)} style={s.detailCard}>
          <View style={s.detailHeader}>
            <View>
              <Text style={s.detailTitle}>Booking Reference</Text>
              <Text style={s.detailRef}>#{booking?.id?.slice(-8).toUpperCase() || "AP4AB0H3"}</Text>
            </View>
            {booking?.otp && (
              <View style={s.otpChip}>
                <Text style={s.otpChipLabel}>OTP</Text>
                <Text style={s.otpChipValue}>{booking.otp}</Text>
              </View>
            )}
          </View>

          <View style={s.addressRow}>
            <Ionicons name="location-outline" size={16} color={TEAL} />
            <Text style={s.addressText} numberOfLines={2}>
              {booking?.address || "142, Orchid Greens, 2nd Cross, HSR Layout, Sector 4"}
            </Text>
          </View>
        </Animated.View>

        {/* 5. Need to Make Changes / Help Card */}
        <Animated.View entering={FadeInDown.delay(340).duration(380)} style={s.helpCard}>
          <View style={s.helpIconWrap}>
            <Ionicons name="gift-outline" size={20} color={TEAL} />
          </View>
          <View style={s.helpContent}>
            <Text style={s.helpTitle}>Need to make changes?</Text>
            <Text style={s.helpSub}>Reschedule slot or update special instructions</Text>
          </View>
          <Pressable
            onPress={() => {
              Alert.alert(
                "Manage Booking",
                "Contact Urban Helpers customer support for rescheduling or custom instructions.",
                [
                  { text: "Chat with Support", onPress: () => Linking.openURL("https://wa.me/919876543210") },
                  { text: "Cancel", style: "cancel" },
                ]
              );
            }}
          >
            <Text style={s.manageLink}>Manage</Text>
          </Pressable>
        </Animated.View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Sticky Bottom Actions */}
      <View style={s.bottomCtaBar}>
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
              style={s.callFullBtn}
              onPress={handleCall}
            >
              <LinearGradient
                colors={[TEAL, TEAL_D]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={s.callFullGradient}
              >
                <Ionicons name="call" size={18} color="#fff" />
                <Text style={s.callFullText}>Call {proName.split(" ")[0]}</Text>
              </LinearGradient>
            </Pressable>

            {booking && booking.status !== "cancelled" && (
              <Pressable
                style={s.cancelBtn}
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
    backgroundColor: "#081826",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 52 : 42,
    paddingBottom: 14,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
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
    paddingTop: 6,
  },

  // 1. Professional Card
  proCard: {
    borderRadius: 22,
    overflow: "hidden",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(0,188,212,0.22)",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
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
    borderColor: TEAL,
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
    backgroundColor: "rgba(245,158,11,0.15)",
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
    color: "#94a3b8",
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
    color: "#22c55e",
  },
  callCircleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: TEAL,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
    shadowColor: TEAL,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },

  // 2. Stepper Card
  stepperCard: {
    backgroundColor: "#0d2135",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    paddingVertical: 18,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  stepperRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  stepItem: {
    flex: 1,
    alignItems: "center",
  },
  stepCircleWrap: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: 32,
    marginBottom: 8,
  },
  connectingLine: {
    position: "absolute",
    left: "50%",
    right: "-50%",
    top: 15,
    height: 2,
    backgroundColor: "rgba(255,255,255,0.12)",
    zIndex: 1,
  },
  connectingLineDone: {
    backgroundColor: "#22c55e",
  },
  doneCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#22c55e",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  activeRing: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  activePulse: {
    position: "absolute",
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0,188,212,0.3)",
  },
  activeDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: TEAL,
    alignItems: "center",
    justifyContent: "center",
  },
  pendingCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  stepLabel: {
    fontSize: 10,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 14,
    paddingHorizontal: 2,
  },
  stepLabelActive: {
    color: TEAL,
    fontWeight: "700",
  },
  stepLabelDone: {
    color: "#e2e8f0",
    fontWeight: "600",
  },

  // 3. Map Container
  mapContainer: {
    height: 240,
    borderRadius: 22,
    overflow: "hidden",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(0,188,212,0.2)",
    position: "relative",
    elevation: 8,
  },
  map: {
    width: "100%",
    height: "100%",
  },
  mapImageFallback: {
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
    backgroundColor: "rgba(8,24,38,0.9)",
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
    backgroundColor: "#22c55e",
  },
  floatingPillText: {
    fontSize: 11.5,
    fontWeight: "600",
    color: "#fff",
    flex: 1,
  },
  mapBottomBar: {
    position: "absolute",
    bottom: 12,
    left: 14,
    right: 14,
    backgroundColor: "rgba(8,24,38,0.92)",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  etaGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  etaMainText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#fff",
  },
  etaSubText: {
    fontSize: 12,
    color: "#94a3b8",
  },
  liveLocBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  liveLocText: {
    fontSize: 11.5,
    fontWeight: "700",
    color: TEAL,
  },

  // 4. Detail Card
  detailCard: {
    backgroundColor: "#0d2135",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    padding: 16,
    marginBottom: 14,
  },
  detailHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  detailTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748b",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  detailRef: {
    fontSize: 16,
    fontWeight: "800",
    color: "#fff",
    marginTop: 2,
  },
  otpChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(0,188,212,0.14)",
    borderWidth: 1,
    borderColor: "rgba(0,188,212,0.3)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  otpChipLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: TEAL,
  },
  otpChipValue: {
    fontSize: 14,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 2,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
  },
  addressText: {
    flex: 1,
    fontSize: 12,
    color: "#94a3b8",
    lineHeight: 17,
  },

  // 5. Help Card
  helpCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    padding: 14,
    gap: 12,
    marginBottom: 20,
  },
  helpIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(0,188,212,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  helpContent: {
    flex: 1,
  },
  helpTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 2,
  },
  helpSub: {
    fontSize: 11,
    color: "#64748b",
  },
  manageLink: {
    fontSize: 12.5,
    fontWeight: "700",
    color: TEAL,
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
    backgroundColor: "rgba(8,24,38,0.96)",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)",
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
    backgroundColor: "rgba(239,68,68,0.12)",
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
