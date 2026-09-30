/**
 * BookingConfirmedScreen — Premium redesign (2026-09)
 *
 * Visual structure:
 *   Status pill → Heading → Success Seal
 *   → Booking Pass (ticket-style card)
 *   → What's Next stepper
 *   → Primary CTA (Track My Booking)
 *   → Secondary CTA (Go to Home)
 *
 * All existing booking data props, navigation and business logic are
 * preserved exactly as before.  Only the presentation layer changed.
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
  FadeInDown, FadeIn,
} from "react-native-reanimated";
import { RootStackParamList } from "@/navigation/types";
import { colors } from "@/theme/colors";
import { SERVICE_CATEGORIES } from "./servicesData";
import { sendBookingConfirmation } from "@/services/notificationService";

type Props = NativeStackScreenProps<RootStackParamList, "BookingConfirmed">;

const DAYS  = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DATES = ["11",  "12",  "13",  "14",  "15",  "16",  "17"];

// Teal/cyan constants matching the Urban Helpers brand
const TEAL   = "#00bcd4";
const TEAL_D = "#0097a7";   // darker teal for gradient start

// "What's Next" steps — based only on real booking states the app supports
const NEXT_STEPS = [
  { n: "01", label: "Booking confirmed",        done: true  },
  { n: "02", label: "Track when vendor is assigned", done: false },
  { n: "03", label: "Share OTP when professional arrives", done: false },
];

export default function BookingConfirmedScreen({ navigation, route }: Props) {
  const { bookingId, otp, categoryId, subServiceId, dayIndex, scheduledDate } =
    route.params;

  const category = SERVICE_CATEGORIES.find((c) => c.id === categoryId);
  const sub      = category?.subServices.find((s) => s.id === subServiceId);

  const bookingDateStr =
    scheduledDate ||
    (dayIndex !== undefined && DAYS[dayIndex]
      ? `${DAYS[dayIndex]}, Aug ${DATES[dayIndex]}`
      : new Date().toLocaleDateString("en-US", {
          weekday: "short", month: "short", day: "numeric", year: "numeric",
        }));

  // ── Orchestrated entrance animations ─────────────────────────────────────
  const sealScale  = useSharedValue(0);
  const sealOp     = useSharedValue(0);
  const checkScale = useSharedValue(0);
  const ring1Scale = useSharedValue(0.6);
  const ring1Op    = useSharedValue(0);
  const ring2Scale = useSharedValue(0.6);
  const ring2Op    = useSharedValue(0);

  useEffect(() => {
    // Outer rings pulse in first, then inner seal, then checkmark
    ring2Op.value    = withTiming(1, { duration: 320 });
    ring2Scale.value = withSpring(1, { damping: 18, stiffness: 160 });

    ring1Op.value    = withDelay(80,  withTiming(1, { duration: 280 }));
    ring1Scale.value = withDelay(80,  withSpring(1, { damping: 16, stiffness: 180 }));

    sealOp.value    = withDelay(160, withTiming(1, { duration: 260 }));
    sealScale.value = withDelay(160, withSpring(1, { damping: 13, stiffness: 220 }));

    checkScale.value = withDelay(320, withSpring(1, { damping: 11, stiffness: 260 }));

    if (category && sub) {
      sendBookingConfirmation(category.name, sub.name, bookingDateStr, undefined, otp);
    }
  }, []);

  const ring2Style  = useAnimatedStyle(() => ({ transform: [{ scale: ring2Scale.value }], opacity: ring2Op.value }));
  const ring1Style  = useAnimatedStyle(() => ({ transform: [{ scale: ring1Scale.value }], opacity: ring1Op.value }));
  const sealStyle   = useAnimatedStyle(() => ({ transform: [{ scale: sealScale.value }], opacity: sealOp.value }));
  const checkStyle  = useAnimatedStyle(() => ({ transform: [{ scale: checkScale.value }] }));

  if (!category || !sub) return null;

  const accent  = category.accent;
  const shortId = `#${bookingId.slice(-8).toUpperCase()}`;
  // Split OTP digits for spaced display
  const otpDigits = otp.split("");

  return (
    <View style={s.root}>
      {/* ── Deep navy background with subtle radial glow ─────────────────── */}
      <LinearGradient
        colors={["#071622", "#081e30", "#071622"]}
        style={StyleSheet.absoluteFill}
      />
      {/* Extremely subtle teal radial bloom behind the seal */}
      <View style={s.bgBloom} pointerEvents="none" />

      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >

        {/* ══════════════════════════════════════════════════════════════════
            1. STATUS PILL + HEADING
        ══════════════════════════════════════════════════════════════════ */}
        <Animated.View entering={FadeIn.duration(340)} style={s.topBlock}>
          {/* Status pill */}
          <View style={s.statusPill}>
            <View style={s.statusDot} />
            <Text style={s.statusPillText}>BOOKING CONFIRMED</Text>
          </View>

          <Text style={s.headingBig}>You're all set!</Text>
          <Text style={s.headingSub}>
            Your service has been scheduled successfully.
          </Text>
        </Animated.View>

        {/* ══════════════════════════════════════════════════════════════════
            2. SUCCESS SEAL — concentric rings + gradient circle + checkmark
        ══════════════════════════════════════════════════════════════════ */}
        <View style={s.sealOuter} pointerEvents="none">
          {/* Ring 3 — outermost, very faint */}
          <Animated.View style={[s.ring3, ring2Style]} />
          {/* Ring 2 — mid */}
          <Animated.View style={[s.ring2, ring1Style]} />
          {/* Ring 1 — inner ring, slightly opaque */}
          <Animated.View style={[s.ring1, sealStyle]}>
            {/* Gradient circle */}
            <LinearGradient
              colors={[TEAL, TEAL_D]}
              style={s.sealCircle}
            >
              <Animated.View style={checkStyle}>
                <Ionicons name="checkmark" size={30} color="#fff" />
              </Animated.View>
            </LinearGradient>
          </Animated.View>
        </View>

        {/* ══════════════════════════════════════════════════════════════════
            3. BOOKING PASS — ticket-style card
        ══════════════════════════════════════════════════════════════════ */}
        <Animated.View
          entering={FadeInDown.delay(380).duration(420).springify()}
          style={s.pass}
        >
          {/* BOOKING PASS label */}
          <View style={s.passHeader}>
            <View style={s.passHeaderLeft}>
              <Ionicons name="ticket-outline" size={12} color={TEAL} />
              <Text style={s.passHeaderText}>BOOKING PASS</Text>
            </View>
          </View>

          {/* Service row */}
          <View style={s.serviceRow}>
            <View style={[s.serviceIcon, { backgroundColor: accent + "22" }]}>
              <Ionicons name={category.icon as any} size={24} color={accent} />
            </View>
            <View style={s.serviceInfo}>
              <Text style={s.serviceName} numberOfLines={1}>{sub.name}</Text>
              <Text style={s.serviceCategory}>{category.name}</Text>
            </View>
            <Text style={[s.servicePrice, { color: accent }]}>{sub.price}</Text>
          </View>

          {/* Perforated separator */}
          <View style={s.perfRow}>
            <View style={[s.perfNib, s.perfNibLeft]} />
            <View style={s.perfLine} />
            <View style={[s.perfNib, s.perfNibRight]} />
          </View>

          {/* Date + Duration grid */}
          <View style={s.metaGrid}>
            <View style={s.metaCell}>
              <View style={s.metaLabelRow}>
                <Ionicons name="calendar-outline" size={12} color={TEAL} />
                <Text style={s.metaLabel}>DATE</Text>
              </View>
              <Text style={s.metaValue}>{bookingDateStr}</Text>
            </View>
            <View style={s.metaVDivider} />
            <View style={s.metaCell}>
              <View style={s.metaLabelRow}>
                <Ionicons name="hourglass-outline" size={12} color={colors.text.muted} />
                <Text style={s.metaLabel}>DURATION</Text>
              </View>
              <Text style={s.metaValue}>{sub.duration}</Text>
            </View>
          </View>

          {/* Second perforated separator */}
          <View style={s.perfRow}>
            <View style={[s.perfNib, s.perfNibLeft]} />
            <View style={s.perfLine} />
            <View style={[s.perfNib, s.perfNibRight]} />
          </View>

          {/* Booking ID */}
          <View style={s.bookingIdBlock}>
            <Text style={s.bookingIdLabel}>BOOKING ID</Text>
            <Text style={s.bookingIdValue}>{shortId}</Text>
          </View>

          {/* OTP — Vendor Verification Code */}
          <View style={s.otpCard}>
            <View style={s.otpTopRow}>
              <Ionicons name="shield-checkmark-outline" size={14} color={TEAL} />
              <Text style={s.otpCardLabel}>VENDOR VERIFICATION CODE</Text>
            </View>
            <View style={s.otpDigitsRow}>
              {otpDigits.map((d, i) => (
                <View key={i} style={s.otpDigitBox}>
                  <Text style={s.otpDigit}>{d}</Text>
                </View>
              ))}
            </View>
            <Text style={s.otpHint}>
              Share this code when your professional arrives
            </Text>
          </View>
        </Animated.View>

        {/* ══════════════════════════════════════════════════════════════════
            4. WHAT'S NEXT — minimal stepper
        ══════════════════════════════════════════════════════════════════ */}
        <Animated.View
          entering={FadeInDown.delay(520).duration(380)}
          style={s.nextBlock}
        >
          <Text style={s.nextTitle}>What's Next?</Text>
          {NEXT_STEPS.map((step, idx) => (
            <View key={step.n} style={s.stepRow}>
              {/* Left: connector + dot */}
              <View style={s.stepLeft}>
                <View style={[
                  s.stepDot,
                  step.done
                    ? { backgroundColor: TEAL, borderColor: TEAL }
                    : { backgroundColor: "transparent", borderColor: "rgba(255,255,255,0.18)" }
                ]}>
                  {step.done
                    ? <Ionicons name="checkmark" size={10} color="#fff" />
                    : <Text style={s.stepNumber}>{step.n}</Text>
                  }
                </View>
                {idx < NEXT_STEPS.length - 1 && (
                  <View style={[
                    s.stepLine,
                    { borderColor: step.done ? TEAL + "40" : "rgba(255,255,255,0.08)" }
                  ]} />
                )}
              </View>
              {/* Right: label */}
              <Text style={[
                s.stepLabel,
                step.done && { color: colors.text.primary, fontWeight: "600" }
              ]}>
                {step.label}
              </Text>
            </View>
          ))}
        </Animated.View>

        {/* ══════════════════════════════════════════════════════════════════
            5. ACTION BUTTONS
        ══════════════════════════════════════════════════════════════════ */}
        <Animated.View
          entering={FadeInDown.delay(640).duration(360)}
          style={s.actions}
        >
          {/* Primary — Track My Booking */}
          <Pressable
            accessibilityLabel="Track My Booking"
            style={({ pressed }) => [s.trackBtn, { opacity: pressed ? 0.88 : 1 }]}
            onPress={() =>
              navigation.navigate("LiveTracking", {
                bookingId,
                categoryId: category.id,
                subServiceId: sub.id,
              })
            }
          >
            <LinearGradient
              colors={[TEAL, TEAL_D]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={s.trackBtnGradient}
            >
              <Ionicons name="navigate-circle-outline" size={20} color="#fff" />
              <Text style={s.trackBtnText}>Track My Booking</Text>
              <Ionicons name="arrow-forward" size={17} color="rgba(255,255,255,0.8)" />
            </LinearGradient>
          </Pressable>

          {/* Secondary — Go to Home */}
          <Pressable
            accessibilityLabel="Go to Home"
            style={({ pressed }) => [s.homeBtn, { opacity: pressed ? 0.7 : 1 }]}
            onPress={() => navigation.navigate("HomeDashboard")}
          >
            <Ionicons name="home-outline" size={16} color={colors.text.muted} />
            <Text style={s.homeBtnText}>Go to Home</Text>
          </Pressable>
        </Animated.View>

      </ScrollView>
    </View>
  );
}



const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#071622",
  },

  // Radial background glow — extremely subtle teal bloom at top-center
  bgBloom: {
    position: "absolute",
    top: -60,
    alignSelf: "center",
    width: 340,
    height: 340,
    borderRadius: 170,
    backgroundColor: "rgba(0,188,212,0.055)",
    // blur via shadow (no blurRadius on View, but elevation creates ambient)
    shadowColor: TEAL,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 80,
  },

  scroll: {
    flexGrow: 1,
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 66 : 50,
    paddingBottom: 40,
  },

  // ── 1. Status + heading ──────────────────────────────────────────────────
  topBlock: {
    alignItems: "center",
    marginBottom: 20,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(0,188,212,0.12)",
    borderWidth: 1,
    borderColor: "rgba(0,188,212,0.28)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 14,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: TEAL,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: "800",
    color: TEAL,
    letterSpacing: 1.8,
  },
  headingBig: {
    fontSize: 30,
    fontWeight: "800",
    color: colors.text.primary,
    textAlign: "center",
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  headingSub: {
    fontSize: 13,
    color: colors.text.muted,
    textAlign: "center",
    lineHeight: 19,
  },

  // ── 2. Success seal ──────────────────────────────────────────────────────
  sealOuter: {
    width: 116,
    height: 116,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  // Ring 3 — largest, most transparent
  ring3: {
    position: "absolute",
    width: 116,
    height: 116,
    borderRadius: 58,
    borderWidth: 1,
    borderColor: "rgba(0,188,212,0.10)",
  },
  // Ring 2
  ring2: {
    position: "absolute",
    width: 94,
    height: 94,
    borderRadius: 47,
    borderWidth: 1.5,
    borderColor: "rgba(0,188,212,0.20)",
  },
  // Ring 1 — tightest visible ring
  ring1: {
    width: 74,
    height: 74,
    borderRadius: 37,
    borderWidth: 1,
    borderColor: "rgba(0,188,212,0.40)",
    alignItems: "center",
    justifyContent: "center",
  },
  sealCircle: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: TEAL,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
  },

  // ── 3. Booking Pass ──────────────────────────────────────────────────────
  pass: {
    width: "100%",
    backgroundColor: "#0b1e2f",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(0,188,212,0.14)",
    overflow: "hidden",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 10,
  },

  passHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 10,
  },
  passHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  passHeaderText: {
    fontSize: 10,
    fontWeight: "800",
    color: TEAL,
    letterSpacing: 2,
  },

  // Service row
  serviceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 18,
    paddingBottom: 16,
  },
  serviceIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
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

  // Perforated separator
  perfRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 2,
  },
  perfNib: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#071622", // matches page background to "punch out" effect
    position: "absolute",
    zIndex: 2,
  },
  perfNibLeft:  { left: -8 },
  perfNibRight: { right: -8 },
  perfLine: {
    flex: 1,
    height: 1,
    marginHorizontal: 12,
    borderWidth: 0,
    borderTopWidth: 1,
    borderStyle: "dashed",
    borderColor: "rgba(255,255,255,0.10)",
  },

  // Meta grid
  metaGrid: {
    flexDirection: "row",
    paddingHorizontal: 18,
    paddingVertical: 14,
    gap: 0,
  },
  metaCell: {
    flex: 1,
    gap: 5,
  },
  metaVDivider: {
    width: 1,
    backgroundColor: "rgba(255,255,255,0.07)",
    marginHorizontal: 18,
    alignSelf: "stretch",
  },
  metaLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 2,
  },
  metaLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.text.muted,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  metaValue: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text.primary,
  },

  // Booking ID
  bookingIdBlock: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 14,
  },
  bookingIdLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.text.muted,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  bookingIdValue: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.text.primary,
    letterSpacing: 1,
  },

  // OTP verification card
  otpCard: {
    margin: 14,
    marginTop: 4,
    backgroundColor: "rgba(0,151,167,0.12)",
    borderWidth: 1,
    borderColor: "rgba(0,188,212,0.30)",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  otpTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  otpCardLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: TEAL,
    letterSpacing: 1.6,
  },
  otpDigitsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 8,
  },
  otpDigitBox: {
    width: 44,
    height: 52,
    borderRadius: 10,
    backgroundColor: "rgba(0,188,212,0.10)",
    borderWidth: 1,
    borderColor: "rgba(0,188,212,0.22)",
    alignItems: "center",
    justifyContent: "center",
  },
  otpDigit: {
    fontSize: 26,
    fontWeight: "800",
    color: TEAL,
    letterSpacing: 0,
  },
  otpHint: {
    fontSize: 11,
    color: colors.text.muted,
    textAlign: "center",
    lineHeight: 16,
  },

  // ── 4. What's Next stepper ───────────────────────────────────────────────
  nextBlock: {
    width: "100%",
    marginBottom: 22,
    paddingHorizontal: 4,
  },
  nextTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.text.secondary,
    marginBottom: 14,
    letterSpacing: 0.2,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    minHeight: 36,
  },
  stepLeft: {
    alignItems: "center",
    width: 24,
  },
  stepDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumber: {
    fontSize: 8,
    fontWeight: "800",
    color: colors.text.muted,
    letterSpacing: 0.5,
  },
  stepLine: {
    flex: 1,
    width: 0,
    borderLeftWidth: 1,
    borderStyle: "dashed",
    marginVertical: 3,
    minHeight: 14,
  },
  stepLabel: {
    fontSize: 13,
    color: colors.text.muted,
    flexShrink: 1,
    paddingTop: 4,
    lineHeight: 18,
  },

  // ── 5. Actions ───────────────────────────────────────────────────────────
  actions: {
    width: "100%",
    gap: 10,
  },
  trackBtn: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: TEAL,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
  },
  trackBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
    paddingHorizontal: 20,
    minHeight: 56,
  },
  trackBtnText: {
    flex: 1,
    textAlign: "center",
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
    marginLeft: -17, // optical center between two icons
  },
  homeBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 16,
    paddingVertical: 14,
    minHeight: 50,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.09)",
  },
  homeBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.muted,
  },
});
