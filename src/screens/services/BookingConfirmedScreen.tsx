/**
 * BookingConfirmedScreen — success state after confirming a service booking.
 * Shows animated checkmark, booking summary and CTA to track or go home.
 */
import React, { useEffect } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import Animated, {
  useSharedValue, useAnimatedStyle,
  withSpring, withDelay, withSequence, withTiming,
  FadeInDown, FadeIn,
} from "react-native-reanimated";
import { RootStackParamList } from "@/navigation/types";
import { colors } from "@/theme/colors";
import { SERVICE_CATEGORIES } from "./servicesData";
import { sendBookingConfirmation } from "@/services/notificationService";

type Props = NativeStackScreenProps<RootStackParamList, "BookingConfirmed">;

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DATES = ["11", "12", "13", "14", "15", "16", "17"];
const SLOTS = ["8:00 AM – 11:00 AM", "12:00 PM – 3:00 PM", "4:00 PM – 7:00 PM"];

export default function BookingConfirmedScreen({ navigation, route }: Props) {
  const { bookingId, otp, categoryId, subServiceId, dayIndex, slotIndex } = route.params;

  const category = SERVICE_CATEGORIES.find((c) => c.id === categoryId);
  const sub = category?.subServices.find((s) => s.id === subServiceId);

  // Checkmark ring animation
  const ringScale = useSharedValue(0);
  const ringOp = useSharedValue(0);
  const checkScale = useSharedValue(0);
  const confettiOp = useSharedValue(0);

  useEffect(() => {
    ringOp.value = withTiming(1, { duration: 300 });
    ringScale.value = withSpring(1, { damping: 12, stiffness: 200 });
    checkScale.value = withDelay(200, withSpring(1, { damping: 10, stiffness: 260 }));
    confettiOp.value = withDelay(400, withTiming(1, { duration: 400 }));

    // Fire booking confirmation notification
    if (category && sub) {
      const dayLabel = `${DAYS[dayIndex ?? 1]}, Aug ${DATES[dayIndex ?? 1]}`;
      const timeLabel = SLOTS[slotIndex ?? 1];
      sendBookingConfirmation(category.name, sub.name, dayLabel, timeLabel, otp);
    }
  }, []);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
    opacity: ringOp.value,
  }));
  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));
  const confettiStyle = useAnimatedStyle(() => ({ opacity: confettiOp.value }));

  if (!category || !sub) return null;

  return (
    <View style={s.root}>

      {/* ── Background gradient ──────────────────────────────── */}
      <LinearGradient
        colors={["#081826", "#0f2027", "#081826"]}
        style={StyleSheet.absoluteFill}
      />

      {/* ── Confetti dots (decorative) ───────────────────────── */}
      <Animated.View style={[s.confetti, confettiStyle]} pointerEvents="none">
        {[...Array(12)].map((_, i) => (
          <View
            key={i}
            style={[
              s.confettiDot,
              {
                backgroundColor: [category.accent, "#ffffff", colors.secondary, "#fbbf24"][i % 4],
                top: `${10 + Math.random() * 30}%` as any,
                left: `${5 + i * 8}%` as any,
                width: 6 + (i % 3) * 3,
                height: 6 + (i % 3) * 3,
                borderRadius: (6 + (i % 3) * 3) / 2,
              },
            ]}
          />
        ))}
      </Animated.View>

      {/* ── Main Content ─────────────────────────────────────── */}
      <View style={s.content}>

        {/* Checkmark */}
        <Animated.View style={[s.checkRing, ringStyle]}>
          <LinearGradient colors={category.gradient} style={s.checkGradient}>
            <Animated.View style={checkStyle}>
              <Ionicons name="checkmark" size={52} color="white" />
            </Animated.View>
          </LinearGradient>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(350).duration(400)}>
          <Text style={s.title}>Booking Confirmed!</Text>
          <Text style={s.subtitle}>Your service is scheduled. We'll send a reminder before arrival.</Text>
        </Animated.View>

        {/* Booking summary card */}
        <Animated.View entering={FadeInDown.delay(450).duration(420).springify()} style={s.summaryCard}>
          <LinearGradient
            colors={[category.gradient[0] + "44", category.gradient[1] + "22"]}
            style={s.summaryGradient}
          >
            <View style={s.summaryRow}>
              <View style={[s.summaryIcon, { backgroundColor: category.accent + "22" }]}>
                <Ionicons name={category.icon as any} size={22} color={category.accent} />
              </View>
              <View style={s.summaryInfo}>
                <Text style={s.summaryService}>{sub.name}</Text>
                <Text style={s.summaryCategory}>{category.name}</Text>
              </View>
              <Text style={[s.summaryPrice, { color: category.accent }]}>{sub.price}</Text>
            </View>

            <View style={s.divider} />

            <View style={s.summaryDetails}>
              <View style={s.detailRow}>
                <Ionicons name="calendar-outline" size={15} color={colors.text.muted} />
                <Text style={s.detailText}>
                  {DAYS[dayIndex ?? 1]}, Aug {DATES[dayIndex ?? 1]}
                </Text>
              </View>
              <View style={s.detailRow}>
                <Ionicons name="time-outline" size={15} color={colors.text.muted} />
                <Text style={s.detailText}>{SLOTS[slotIndex ?? 1]}</Text>
              </View>
              <View style={s.detailRow}>
                <Ionicons name="hourglass-outline" size={15} color={colors.text.muted} />
                <Text style={s.detailText}>{sub.duration}</Text>
              </View>
            </View>

            {/* Booking ID */}
            <View style={s.bookingIdRow}>
              <Text style={s.bookingIdLabel}>Booking ID</Text>
              <Text style={[s.bookingId, { color: category.accent }]}>
                #{bookingId.slice(-8).toUpperCase()}
              </Text>
            </View>

            {/* OTP for Vendor */}
            <View style={[s.bookingIdRow, { marginTop: 8 }]}>
              <Text style={s.bookingIdLabel}>OTP for Vendor</Text>
              <Text style={[s.bookingId, { color: category.accent, fontSize: 18, letterSpacing: 2 }]}>
                {otp}
              </Text>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Action buttons */}
        <Animated.View entering={FadeInDown.delay(580).duration(380)} style={s.actions}>
          <Pressable
            style={({ pressed }) => [s.trackBtn, { backgroundColor: category.gradient[0], opacity: pressed ? 0.88 : 1 }]}
            onPress={() => navigation.navigate("LiveTracking", { categoryId: category.id, subServiceId: sub.id })}
          >
            <Ionicons name="location-outline" size={18} color="white" />
            <Text style={s.trackBtnText}>Track Booking</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [s.homeBtn, { opacity: pressed ? 0.75 : 1 }]}
            onPress={() => navigation.navigate("HomeDashboard")}
          >
            <Ionicons name="home-outline" size={18} color={colors.text.secondary} />
            <Text style={s.homeBtnText}>Go Home</Text>
          </Pressable>
        </Animated.View>

      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#081826" },

  confetti: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  confettiDot: { position: "absolute", borderRadius: 4 },

  content: {
    flex: 1, alignItems: "center", justifyContent: "center",
    paddingHorizontal: 24,
  },

  // Checkmark
  checkRing: {
    width: 120, height: 120, borderRadius: 60,
    marginBottom: 28,
    shadowColor: "#00bcd4", shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6, shadowRadius: 30, elevation: 20,
  },
  checkGradient: {
    width: 120, height: 120, borderRadius: 60,
    justifyContent: "center", alignItems: "center",
  },

  title: {
    fontSize: 28, fontWeight: "700", color: colors.text.primary,
    textAlign: "center", marginBottom: 10,
  },
  subtitle: {
    fontSize: 14, color: colors.text.secondary, textAlign: "center",
    lineHeight: 20, marginBottom: 28,
  },

  // Summary card
  summaryCard: {
    width: "100%", borderRadius: 24, overflow: "hidden",
    borderWidth: 1, borderColor: colors.glass.border, marginBottom: 28,
  },
  summaryGradient: { padding: 20 },
  summaryRow: {
    flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 16,
  },
  summaryIcon: {
    width: 48, height: 48, borderRadius: 24,
    justifyContent: "center", alignItems: "center",
  },
  summaryInfo: { flex: 1 },
  summaryService: { fontSize: 16, fontWeight: "700", color: colors.text.primary },
  summaryCategory: { fontSize: 12, color: colors.text.secondary, marginTop: 2 },
  summaryPrice: { fontSize: 18, fontWeight: "700" },
  divider: {
    height: 1, backgroundColor: colors.glass.border, marginBottom: 14,
  },
  summaryDetails: { gap: 8, marginBottom: 14 },
  detailRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  detailText: { fontSize: 13, color: colors.text.secondary },
  bookingIdRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 12, padding: 10,
  },
  bookingIdLabel: { fontSize: 12, color: colors.text.muted },
  bookingId: { fontSize: 14, fontWeight: "700" },

  // Actions
  actions: { width: "100%", gap: 12 },
  trackBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    borderRadius: 22, paddingVertical: 16,
  },
  trackBtnText: { fontSize: 15, fontWeight: "700", color: "white" },
  homeBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    borderRadius: 22, paddingVertical: 14,
    backgroundColor: colors.surface.containerHigh,
    borderWidth: 1, borderColor: colors.glass.border,
  },
  homeBtnText: { fontSize: 15, fontWeight: "600", color: colors.text.secondary },
});
