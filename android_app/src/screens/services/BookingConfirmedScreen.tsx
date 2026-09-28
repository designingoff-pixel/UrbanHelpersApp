/**
 * BookingConfirmedScreen — success state after confirming a service booking.
 *
 * REDESIGN (2026-09):
 *  - Removed confetti floating dots (unprofessional, visual noise)
 *  - Compact, refined success icon instead of oversized 120 px ring
 *  - Premium booking summary card with structured information rows
 *  - OTP displayed in a dedicated highlighted band (high visual priority)
 *  - Clear primary / secondary CTA hierarchy
 *  - ScrollView wrapper so content never clips on small screens
 *  - All real booking data props and navigation preserved unchanged
 */
import React, { useEffect } from "react";
import {
  View, Text, Pressable, StyleSheet,
  ScrollView, Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import Animated, {
  useSharedValue, useAnimatedStyle,
  withSpring, withDelay, withTiming,
  FadeInDown,
} from "react-native-reanimated";
import { RootStackParamList } from "@/navigation/types";
import { colors } from "@/theme/colors";
import { SERVICE_CATEGORIES } from "./servicesData";
import { sendBookingConfirmation } from "@/services/notificationService";

type Props = NativeStackScreenProps<RootStackParamList, "BookingConfirmed">;

const DAYS  = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DATES = ["11",  "12",  "13",  "14",  "15",  "16",  "17"];

export default function BookingConfirmedScreen({ navigation, route }: Props) {
  const { bookingId, otp, categoryId, subServiceId, dayIndex, scheduledDate } = route.params;

  const category = SERVICE_CATEGORIES.find((c) => c.id === categoryId);
  const sub      = category?.subServices.find((s) => s.id === subServiceId);

  const bookingDateStr =
    scheduledDate ||
    (dayIndex !== undefined && DAYS[dayIndex]
      ? `${DAYS[dayIndex]}, Aug ${DATES[dayIndex]}`
      : new Date().toLocaleDateString("en-US", {
          weekday: "short", month: "short", day: "numeric", year: "numeric",
        }));

  // ── Animations ─────────────────────────────────────────────────────────────
  const badgeScale = useSharedValue(0);
  const badgeOp    = useSharedValue(0);
  const checkScale = useSharedValue(0);

  useEffect(() => {
    badgeOp.value    = withTiming(1, { duration: 280 });
    badgeScale.value = withSpring(1, { damping: 14, stiffness: 220 });
    checkScale.value = withDelay(180, withSpring(1, { damping: 11, stiffness: 280 }));

    if (category && sub) {
      sendBookingConfirmation(category.name, sub.name, bookingDateStr, undefined, otp);
    }
  }, []);

  const badgeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: badgeScale.value }],
    opacity:   badgeOp.value,
  }));
  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));

  if (!category || !sub) return null;

  const accent   = category.accent;
  const shortId  = `#${bookingId.slice(-8).toUpperCase()}`;

  return (
    <View style={s.root}>
      {/* Background */}
      <LinearGradient
        colors={["#071622", "#0c1e2e", "#071622"]}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* ── Success Badge ─────────────────────────────────────────────── */}
        <Animated.View style={[s.badgeWrap, badgeStyle]}>
          {/* Outer subtle ring */}
          <View style={[s.badgeRingOuter, { borderColor: accent + "30" }]} />
          {/* Inner teal-filled circle */}
          <LinearGradient
            colors={category.gradient}
            style={s.badgeCircle}
          >
            <Animated.View style={checkStyle}>
              <Ionicons name="checkmark" size={32} color="#fff" />
            </Animated.View>
          </LinearGradient>
        </Animated.View>

        {/* ── Heading ───────────────────────────────────────────────────── */}
        <Animated.View
          entering={FadeInDown.delay(260).duration(380)}
          style={s.headingBlock}
        >
          <Text style={s.title}>Booking Confirmed</Text>
          <Text style={s.subtitle}>
            Your service is scheduled.{"\n"}We'll remind you before arrival.
          </Text>
        </Animated.View>

        {/* ── Booking Summary Card ──────────────────────────────────────── */}
        <Animated.View
          entering={FadeInDown.delay(360).duration(400).springify()}
          style={s.card}
        >
          {/* ── Service header row ─────────────────────── */}
          <View style={s.serviceRow}>
            <View style={[s.serviceIconWrap, { backgroundColor: accent + "1A" }]}>
              <Ionicons name={category.icon as any} size={22} color={accent} />
            </View>
            <View style={s.serviceInfo}>
              <Text style={s.serviceName}>{sub.name}</Text>
              <Text style={s.serviceCategory}>{category.name}</Text>
            </View>
            <Text style={[s.servicePrice, { color: accent }]}>{sub.price}</Text>
          </View>

          {/* ── Divider ────────────────────────────────── */}
          <View style={s.divider} />

          {/* ── Date & Duration ────────────────────────── */}
          <View style={s.metaGrid}>
            <View style={s.metaCell}>
              <View style={s.metaIconRow}>
                <Ionicons name="calendar-outline" size={14} color={accent} />
                <Text style={s.metaLabel}>Date</Text>
              </View>
              <Text style={s.metaValue}>{bookingDateStr}</Text>
            </View>
            <View style={[s.metaCell, s.metaCellRight]}>
              <View style={s.metaIconRow}>
                <Ionicons name="hourglass-outline" size={14} color={colors.text.muted} />
                <Text style={s.metaLabel}>Duration</Text>
              </View>
              <Text style={s.metaValue}>{sub.duration}</Text>
            </View>
          </View>

          {/* ── Divider ────────────────────────────────── */}
          <View style={s.divider} />

          {/* ── Booking ID ─────────────────────────────── */}
          <View style={s.infoRow}>
            <Text style={s.infoLabel}>BOOKING ID</Text>
            <Text style={[s.infoValue, { color: colors.text.primary }]}>{shortId}</Text>
          </View>

          {/* ── OTP Band ───────────────────────────────── */}
          <View style={[s.otpBand, { borderColor: accent + "40", backgroundColor: accent + "12" }]}>
            <View style={s.otpLeft}>
              <Ionicons name="keypad-outline" size={15} color={accent} />
              <Text style={[s.otpLabel, { color: accent }]}>OTP FOR VENDOR</Text>
            </View>
            <Text style={[s.otpValue, { color: accent }]}>{otp}</Text>
          </View>
        </Animated.View>

        {/* ── Action Buttons ────────────────────────────────────────────── */}
        <Animated.View
          entering={FadeInDown.delay(500).duration(360)}
          style={s.actions}
        >
          {/* Primary — Track Booking */}
          <Pressable
            accessibilityLabel="Track Booking"
            style={({ pressed }) => [
              s.trackBtn,
              { backgroundColor: category.gradient[0], opacity: pressed ? 0.87 : 1 },
            ]}
            onPress={() =>
              navigation.navigate("LiveTracking", {
                bookingId,
                categoryId: category.id,
                subServiceId: sub.id,
              })
            }
          >
            <Ionicons name="navigate-outline" size={18} color="#fff" />
            <Text style={s.trackBtnText}>Track Booking</Text>
            <Ionicons name="arrow-forward" size={15} color="rgba(255,255,255,0.7)" />
          </Pressable>

          {/* Secondary — Go Home */}
          <Pressable
            accessibilityLabel="Go Home"
            style={({ pressed }) => [s.homeBtn, { opacity: pressed ? 0.7 : 1 }]}
            onPress={() => navigation.navigate("HomeDashboard")}
          >
            <Ionicons name="home-outline" size={17} color={colors.text.secondary} />
            <Text style={s.homeBtnText}>Go Home</Text>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
const CARD_RADIUS = 20;

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#071622",
  },

  scroll: {
    flexGrow: 1,
    alignItems: "center",
    paddingHorizontal: 22,
    paddingTop: Platform.OS === "ios" ? 72 : 56,
    paddingBottom: 36,
  },

  // ── Success badge ────────────────────────────────────────────────────────
  badgeWrap: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 26,
    // Relative positioning so the outer ring stays behind the filled circle
    width: 90,
    height: 90,
  },
  badgeRingOuter: {
    position: "absolute",
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 1.5,
  },
  badgeCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: "center",
    alignItems: "center",
    // Subtle elevation
    shadowColor: "#00bcd4",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 10,
  },

  // ── Heading ──────────────────────────────────────────────────────────────
  headingBlock: {
    alignItems: "center",
    marginBottom: 28,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.text.primary,
    textAlign: "center",
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    color: colors.text.muted,
    textAlign: "center",
    lineHeight: 19,
  },

  // ── Booking card ─────────────────────────────────────────────────────────
  card: {
    width: "100%",
    backgroundColor: "#0d1f30",
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.09)",
    padding: 18,
    marginBottom: 26,
    // Subtle depth
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },

  // Service header
  serviceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  serviceIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  serviceInfo: { flex: 1 },
  serviceName: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text.primary,
    marginBottom: 2,
  },
  serviceCategory: {
    fontSize: 12,
    color: colors.text.muted,
  },
  servicePrice: {
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.5,
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.07)",
    marginBottom: 14,
  },

  // Meta grid (date / duration side-by-side)
  metaGrid: {
    flexDirection: "row",
    marginBottom: 14,
  },
  metaCell: {
    flex: 1,
    gap: 4,
  },
  metaCellRight: {
    paddingLeft: 16,
    borderLeftWidth: 1,
    borderLeftColor: "rgba(255,255,255,0.07)",
  },
  metaIconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  metaLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.text.muted,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  metaValue: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text.primary,
    marginTop: 2,
  },

  // Booking ID row
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.text.muted,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  infoValue: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  // OTP band (visually distinct, high priority)
  otpBand: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  otpLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  otpLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  otpValue: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: 4,
  },

  // ── Action buttons ───────────────────────────────────────────────────────
  actions: {
    width: "100%",
    gap: 11,
  },
  trackBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 16,
    paddingVertical: 16,
    // min-height for accessibility
    minHeight: 54,
  },
  trackBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
    flex: 1,
    textAlign: "center",
    marginLeft: -15, // optically center between two icons
  },
  homeBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 16,
    paddingVertical: 14,
    minHeight: 50,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  homeBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.secondary,
  },
});
