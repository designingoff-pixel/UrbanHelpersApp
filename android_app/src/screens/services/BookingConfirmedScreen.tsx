import React, { useEffect, useState } from "react";
import {
  View, Text, Pressable, StyleSheet,
  ScrollView, Platform, Image, Alert,
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

const TEAL   = "#00bcd4";
const TEAL_D = "#0097a7";

const FEATURES = [
  { icon: "shield-checkmark", title: "Trusted Professionals", desc: "Background verified" },
  { icon: "leaf", title: "Eco-Friendly Products", desc: "Safe for kids & pets" },
  { icon: "ribbon", title: "100% Satisfaction", desc: "Re-service guarantee" },
  { icon: "time", title: "Flexible Slots", desc: "Reschedule anytime" },
];

export default function BookingConfirmedScreen({ navigation, route }: Props) {
  const { bookingId, otp, categoryId, subServiceId, dayIndex, scheduledDate } =
    route.params;

  const category = SERVICE_CATEGORIES.find((c) => c.id === categoryId);
  const sub      = category?.subServices.find((s) => s.id === subServiceId);

  const [copied, setCopied] = useState(false);

  const bookingDateStr =
    scheduledDate ||
    (dayIndex !== undefined && DAYS[dayIndex]
      ? `${DAYS[dayIndex]}, Aug ${DATES[dayIndex]}`
      : new Date().toLocaleDateString("en-US", {
          weekday: "short", month: "short", day: "numeric", year: "numeric",
        }));

  // Entrance animations
  const sealScale  = useSharedValue(0);
  const checkScale = useSharedValue(0);
  const ring1Scale = useSharedValue(0.6);
  const ring1Op    = useSharedValue(0);

  useEffect(() => {
    ring1Op.value    = withTiming(1, { duration: 320 });
    ring1Scale.value = withSpring(1, { damping: 16, stiffness: 180 });

    sealScale.value  = withDelay(120, withSpring(1, { damping: 13, stiffness: 220 }));
    checkScale.value = withDelay(280, withSpring(1, { damping: 11, stiffness: 260 }));

    if (category && sub) {
      sendBookingConfirmation(category.name, sub.name, bookingDateStr, undefined, otp);
    }
  }, []);

  const ring1Style  = useAnimatedStyle(() => ({ transform: [{ scale: ring1Scale.value }], opacity: ring1Op.value }));
  const sealStyle   = useAnimatedStyle(() => ({ transform: [{ scale: sealScale.value }] }));
  const checkStyle  = useAnimatedStyle(() => ({ transform: [{ scale: checkScale.value }] }));

  const copyBookingId = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (!category || !sub) return null;

  const accent  = category.accent || TEAL;
  const shortId = `#${bookingId.slice(-8).toUpperCase()}`;
  const otpDigits = otp.split("");

  return (
    <View style={s.root}>
      <LinearGradient
        colors={["#081826", "#0c2338", "#081826"]}
        style={StyleSheet.absoluteFill}
      />

      {/* Top Header */}
      <View style={s.header}>
        <Pressable
          onPress={() => navigation.navigate("HomeDashboard")}
          style={s.headerBtn}
          accessibilityLabel="Back to Home"
        >
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </Pressable>
        <Text style={s.headerTitle}>Booking Confirmed</Text>
        <View style={s.headerRightPlaceholder} />
      </View>

      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Big Success Checkmark Seal */}
        <Animated.View entering={FadeIn.duration(400)} style={s.sealWrapper}>
          <Animated.View style={[s.ringOuter, ring1Style]} />
          <Animated.View style={[s.sealCircle, sealStyle]}>
            <LinearGradient
              colors={["#22c55e", "#16a34a"]}
              style={s.sealInner}
            >
              <Animated.View style={checkStyle}>
                <Ionicons name="checkmark-sharp" size={38} color="#fff" />
              </Animated.View>
            </LinearGradient>
          </Animated.View>
        </Animated.View>

        {/* 2. Heading Texts */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={s.headingBlock}>
          <Text style={s.title}>Booking Confirmed!</Text>
          <Text style={s.subtitle}>
            Your service has been scheduled. Our verified professional will arrive on time.
          </Text>
        </Animated.View>

        {/* 3. Hero Promo Card / Banner */}
        <Animated.View entering={FadeInDown.delay(180).duration(400)} style={s.bannerCard}>
          <Image
            source={require("../../../assets/booking_confirmed_banner.png")}
            style={s.bannerImage}
            resizeMode="cover"
          />
        </Animated.View>

        {/* 4. Booking Pass Summary Card */}
        <Animated.View entering={FadeInDown.delay(260).duration(400)} style={s.passCard}>
          {/* Header Row */}
          <View style={s.passHeader}>
            <View style={s.passTag}>
              <Ionicons name="sparkles" size={13} color={TEAL} />
              <Text style={s.passTagText}>SERVICE DETAILS</Text>
            </View>
            <Text style={s.passPrice}>{sub.price}</Text>
          </View>

          {/* Service Info */}
          <View style={s.serviceRow}>
            <View style={[s.serviceIconBox, { backgroundColor: accent + "25" }]}>
              <Ionicons name={category.icon as any} size={26} color={accent} />
            </View>
            <View style={s.serviceDetails}>
              <Text style={s.serviceName}>{sub.name}</Text>
              <Text style={s.serviceCat}>{category.name}</Text>
            </View>
          </View>

          {/* Perforated Line */}
          <View style={s.perfContainer}>
            <View style={[s.perfNib, s.perfNibLeft]} />
            <View style={s.perfDash} />
            <View style={[s.perfNib, s.perfNibRight]} />
          </View>

          {/* Date, Time & Duration Grid */}
          <View style={s.metaGrid}>
            <View style={s.metaCol}>
              <View style={s.metaIconLabel}>
                <Ionicons name="calendar-outline" size={14} color={TEAL} />
                <Text style={s.metaLabel}>SCHEDULED DATE</Text>
              </View>
              <Text style={s.metaVal}>{bookingDateStr}</Text>
            </View>
            <View style={s.metaDivider} />
            <View style={s.metaCol}>
              <View style={s.metaIconLabel}>
                <Ionicons name="time-outline" size={14} color="#f59e0b" />
                <Text style={s.metaLabel}>DURATION</Text>
              </View>
              <Text style={s.metaVal}>{sub.duration}</Text>
            </View>
          </View>

          {/* OTP Section (4 digits) */}
          <View style={s.otpSection}>
            <View style={s.otpHeader}>
              <Ionicons name="shield-checkmark" size={14} color={TEAL} />
              <Text style={s.otpHeading}>START-SERVICE OTP</Text>
            </View>
            <View style={s.otpDigitsRow}>
              {otpDigits.map((digit, i) => (
                <View key={i} style={s.otpDigitBox}>
                  <Text style={s.otpDigit}>{digit}</Text>
                </View>
              ))}
            </View>
            <Text style={s.otpNotice}>
              Share this 4-digit code with the technician only when they arrive at your location.
            </Text>
          </View>

          {/* Booking ID & Copy Button */}
          <View style={s.bookingIdRow}>
            <View>
              <Text style={s.bookingIdTitle}>BOOKING ID</Text>
              <Text style={s.bookingIdVal}>{shortId}</Text>
            </View>
            <Pressable
              onPress={copyBookingId}
              style={({ pressed }) => [s.copyBtn, { opacity: pressed ? 0.7 : 1 }]}
            >
              <Ionicons
                name={copied ? "checkmark-circle" : "copy-outline"}
                size={16}
                color={copied ? "#22c55e" : TEAL}
              />
              <Text style={[s.copyBtnText, copied && { color: "#22c55e" }]}>
                {copied ? "Copied" : "Copy"}
              </Text>
            </Pressable>
          </View>
        </Animated.View>

        {/* 5. Assigned Professional Preview Card */}
        <Animated.View entering={FadeInDown.delay(340).duration(400)} style={s.proCard}>
          <View style={s.proAvatarContainer}>
            <Image
              source={require("../../../assets/technician_ramesh.png")}
              style={s.proAvatar}
              resizeMode="cover"
            />
            <View style={s.proBadgeCheck}>
              <Ionicons name="checkmark-circle" size={18} color="#22c55e" />
            </View>
          </View>
          <View style={s.proInfo}>
            <View style={s.proNameRow}>
              <Text style={s.proName}>Ramesh Kumar</Text>
              <View style={s.ratingBadge}>
                <Ionicons name="star" size={12} color="#f59e0b" />
                <Text style={s.ratingText}>4.8</Text>
              </View>
            </View>
            <Text style={s.proSkill}>Senior {category.name} Partner</Text>
            <View style={s.proVerifiedRow}>
              <Ionicons name="shield-checkmark-outline" size={13} color="#22c55e" />
              <Text style={s.proVerifiedText}>Verified & Background Checked</Text>
            </View>
          </View>
        </Animated.View>

        {/* 6. Why Urban Helpers (4 Pills Grid) */}
        <Animated.View entering={FadeInDown.delay(420).duration(400)} style={s.featuresGrid}>
          {FEATURES.map((item, idx) => (
            <View key={idx} style={s.featureCard}>
              <View style={s.featureIconCircle}>
                <Ionicons name={item.icon as any} size={18} color={TEAL} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.featureTitle}>{item.title}</Text>
                <Text style={s.featureDesc}>{item.desc}</Text>
              </View>
            </View>
          ))}
        </Animated.View>

        {/* 7. Action Buttons */}
        <Animated.View entering={FadeInDown.delay(500).duration(400)} style={s.actionBlock}>
          <Pressable
            style={({ pressed }) => [s.primaryBtn, { opacity: pressed ? 0.88 : 1 }]}
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
              style={s.primaryGradient}
            >
              <Ionicons name="navigate-circle-outline" size={22} color="#fff" />
              <Text style={s.primaryBtnText}>View Booking Details</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </LinearGradient>
          </Pressable>

          <Pressable
            style={({ pressed }) => [s.secondaryBtn, { opacity: pressed ? 0.75 : 1 }]}
            onPress={() => navigation.navigate("HomeDashboard")}
          >
            <Ionicons name="home-outline" size={18} color="#94a3b8" />
            <Text style={s.secondaryBtnText}>Back to Home</Text>
          </Pressable>
        </Animated.View>

        <View style={{ height: 30 }} />
      </ScrollView>
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
    paddingTop: Platform.OS === "ios" ? 54 : 44,
    paddingBottom: 12,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  headerRightPlaceholder: {
    width: 40,
  },
  scroll: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 40,
  },

  // Seal Checkmark
  sealWrapper: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 14,
    height: 100,
  },
  ringOuter: {
    position: "absolute",
    width: 104,
    height: 104,
    borderRadius: 52,
    borderWidth: 2,
    borderColor: "rgba(34, 197, 94, 0.25)",
  },
  sealCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: "hidden",
    elevation: 12,
    shadowColor: "#22c55e",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
  },
  sealInner: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },

  // Headings
  headingBlock: {
    alignItems: "center",
    marginBottom: 18,
    paddingHorizontal: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#fff",
    textAlign: "center",
    letterSpacing: -0.4,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: "#94a3b8",
    textAlign: "center",
    lineHeight: 19,
  },

  // Hero Promo Banner
  bannerCard: {
    width: "100%",
    height: 140,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(0,188,212,0.2)",
    elevation: 6,
  },
  bannerImage: {
    width: "100%",
    height: "100%",
  },

  // Pass Card
  passCard: {
    backgroundColor: "#0d2135",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(0,188,212,0.18)",
    padding: 18,
    marginBottom: 16,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 18,
  },
  passHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  passTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(0,188,212,0.12)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  passTagText: {
    fontSize: 10,
    fontWeight: "800",
    color: TEAL,
    letterSpacing: 1.2,
  },
  passPrice: {
    fontSize: 20,
    fontWeight: "800",
    color: "#fff",
  },
  serviceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 14,
  },
  serviceIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  serviceDetails: {
    flex: 1,
  },
  serviceName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 2,
  },
  serviceCat: {
    fontSize: 12,
    color: "#94a3b8",
  },

  // Perforation
  perfContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
    marginHorizontal: -18,
    position: "relative",
  },
  perfNib: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#081826",
    position: "absolute",
    zIndex: 2,
  },
  perfNibLeft: { left: -9 },
  perfNibRight: { right: -9 },
  perfDash: {
    flex: 1,
    height: 1,
    borderTopWidth: 1,
    borderStyle: "dashed",
    borderColor: "rgba(255,255,255,0.12)",
    marginHorizontal: 16,
  },

  // Meta Grid
  metaGrid: {
    flexDirection: "row",
    paddingVertical: 14,
  },
  metaCol: {
    flex: 1,
  },
  metaIconLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 4,
  },
  metaLabel: {
    fontSize: 9.5,
    fontWeight: "700",
    color: "#64748b",
    letterSpacing: 1.1,
  },
  metaVal: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#fff",
  },
  metaDivider: {
    width: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
    marginHorizontal: 14,
  },

  // OTP
  otpSection: {
    backgroundColor: "rgba(0,188,212,0.08)",
    borderWidth: 1,
    borderColor: "rgba(0,188,212,0.25)",
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    marginVertical: 10,
  },
  otpHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  otpHeading: {
    fontSize: 10,
    fontWeight: "800",
    color: TEAL,
    letterSpacing: 1.5,
  },
  otpDigitsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 8,
  },
  otpDigitBox: {
    width: 44,
    height: 48,
    borderRadius: 10,
    backgroundColor: "rgba(0,188,212,0.15)",
    borderWidth: 1,
    borderColor: "rgba(0,188,212,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  otpDigit: {
    fontSize: 24,
    fontWeight: "800",
    color: "#fff",
  },
  otpNotice: {
    fontSize: 11,
    color: "#94a3b8",
    textAlign: "center",
    lineHeight: 16,
    marginTop: 2,
  },

  // Booking ID
  bookingIdRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 10,
  },
  bookingIdTitle: {
    fontSize: 10,
    fontWeight: "700",
    color: "#64748b",
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  bookingIdVal: {
    fontSize: 17,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 0.8,
  },
  copyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255,255,255,0.06)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  copyBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: TEAL,
  },

  // Assigned Pro Card
  proCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0f273d",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    padding: 14,
    marginBottom: 16,
    gap: 14,
  },
  proAvatarContainer: {
    position: "relative",
  },
  proAvatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 2,
    borderColor: TEAL,
  },
  proBadgeCheck: {
    position: "absolute",
    bottom: -2,
    right: -2,
    backgroundColor: "#0f273d",
    borderRadius: 9,
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
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(245,158,11,0.15)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#f59e0b",
  },
  proSkill: {
    fontSize: 12,
    color: "#94a3b8",
    marginBottom: 4,
  },
  proVerifiedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  proVerifiedText: {
    fontSize: 11,
    color: "#22c55e",
    fontWeight: "600",
  },

  // Features Grid
  featuresGrid: {
    gap: 8,
    marginBottom: 22,
  },
  featureCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    borderRadius: 14,
    padding: 12,
    gap: 12,
  },
  featureIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,188,212,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  featureTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 1,
  },
  featureDesc: {
    fontSize: 11,
    color: "#64748b",
  },

  // Actions
  actionBlock: {
    gap: 10,
  },
  primaryBtn: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: TEAL,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  primaryGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 10,
  },
  primaryBtnText: {
    flex: 1,
    textAlign: "center",
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
  },
  secondaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 16,
    paddingVertical: 14,
  },
  secondaryBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#94a3b8",
  },
});
