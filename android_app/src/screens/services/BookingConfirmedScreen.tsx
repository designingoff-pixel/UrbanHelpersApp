import React, { useEffect, useState, useRef } from "react";
import {
  View, Text, Pressable, StyleSheet,
  ScrollView, Platform, Image, Alert, Linking, ActivityIndicator, Share,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import Animated, {
  useSharedValue, useAnimatedStyle,
  withSpring, withDelay, withTiming, withRepeat, withSequence,
  FadeInDown, FadeIn,
} from "react-native-reanimated";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/services/firebase";
import { RootStackParamList } from "@/navigation/types";
import { useTheme } from "@/context/ThemeContext";
import { SERVICE_CATEGORIES } from "./servicesData";
import {
  sendBookingConfirmation,
  sendBookingPlaced,
  scheduleApplianceRepeatReminder,
  APPLIANCE_REPEAT_INTERVALS,
} from "@/services/notificationService";

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
  const { isDark, colors: themeColors } = useTheme();
  const params = (route.params || {}) as any;
  const initialBookingData = params.booking || {};

  const bookingId = params.bookingId || initialBookingData.bookingId || initialBookingData.id || "AP4" + Math.random().toString(36).substring(2, 7).toUpperCase();
  const [booking, setBooking] = useState<any>(initialBookingData);
  const prevVendorIdRef = useRef<string | null>(initialBookingData.vendorId || null);
  const prevStatusRef = useRef<string | null>(initialBookingData.status || null);

  const rawOtp = booking.otp || params.otp || initialBookingData.otp || "5461";
  const categoryId = params.categoryId || booking.serviceId || initialBookingData.serviceId || "cleaning";
  const subServiceId = params.subServiceId || booking.subServiceId || initialBookingData.subServiceId || "cl-general";

  const category =
    SERVICE_CATEGORIES.find((c) => c.id === categoryId) || {
      id: "cleaning",
      name: booking.serviceCategory || initialBookingData.serviceCategory || "Cleaning",
      icon: "sparkles",
      accent: TEAL,
      subServices: [],
    };

  const sub =
    category.subServices?.find((s) => s.id === subServiceId) || {
      id: subServiceId,
      name: booking.subServiceName || initialBookingData.subServiceName || "Home Deep Cleaning",
      price: booking.priceLabel || initialBookingData.priceLabel || "₹600",
      duration: booking.duration || initialBookingData.duration || "5 hrs",
      description: "Complete service package",
    };

  const [copied, setCopied] = useState(false);

  const bookingDateStr =
    booking.scheduledAt ||
    params.scheduledDate ||
    initialBookingData.scheduledAt ||
    (params.dayIndex !== undefined && DAYS[params.dayIndex]
      ? `${DAYS[params.dayIndex]}, Aug ${DATES[params.dayIndex]}`
      : new Date().toLocaleDateString("en-US", {
          weekday: "short", month: "short", day: "numeric", year: "numeric",
        }));

  // Live Firestore subscription for real-time vendor assignment updates
  useEffect(() => {
    if (!bookingId) return;
    try {
      const unsub = onSnapshot(doc(db, "bookings", bookingId), (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setBooking((prev: any) => ({ ...prev, ...data }));

          // Trigger Booking Confirmed notification when vendor accepts
          const newlyAccepted =
            (!prevVendorIdRef.current && Boolean(data.vendorId)) ||
            (prevStatusRef.current !== "accepted" &&
              prevStatusRef.current !== "assigned" &&
              (data.status === "accepted" || data.status === "assigned"));

          if (newlyAccepted) {
            const dateStr = data.scheduledAt || data.bookingDate || bookingDateStr;
            const otpCode = data.otp || rawOtp;
            sendBookingConfirmation(
              category.name,
              sub.name,
              dateStr,
              data.bookingTime,
              String(otpCode),
              bookingId
            );
          }

          if (data.vendorId) prevVendorIdRef.current = data.vendorId;
          if (data.status) prevStatusRef.current = data.status;
        }
      });
      return () => unsub();
    } catch (err) {
      console.warn("Firestore subscription error in BookingConfirmed:", err);
    }
  }, [bookingId, category.name, sub.name, bookingDateStr, rawOtp]);

  // Entrance animations
  const sealScale  = useSharedValue(0);
  const checkScale = useSharedValue(0);
  const ring1Scale = useSharedValue(0.6);
  const ring1Op    = useSharedValue(0);

  // Pulse animation for searching vendor state
  const pulseAnim = useSharedValue(1);

  useEffect(() => {
    ring1Op.value    = withTiming(1, { duration: 320 });
    ring1Scale.value = withSpring(1, { damping: 16, stiffness: 180 });

    sealScale.value  = withDelay(120, withSpring(1, { damping: 13, stiffness: 220 }));
    checkScale.value = withDelay(280, withSpring(1, { damping: 11, stiffness: 260 }));

    pulseAnim.value = withRepeat(
      withSequence(withTiming(1.08, { duration: 900 }), withTiming(1, { duration: 900 })),
      -1,
      true
    );

    const isAlreadyAccepted =
      Boolean(initialBookingData.vendorId) ||
      initialBookingData.status === "accepted" ||
      initialBookingData.status === "assigned";

    if (!isAlreadyAccepted) {
      sendBookingPlaced(category.name, sub.name, bookingDateStr, undefined, bookingId);
    }
  }, []);

  const ring1Style  = useAnimatedStyle(() => ({ transform: [{ scale: ring1Scale.value }], opacity: ring1Op.value }));
  const sealStyle   = useAnimatedStyle(() => ({ transform: [{ scale: sealScale.value }] }));
  const checkStyle  = useAnimatedStyle(() => ({ transform: [{ scale: checkScale.value }] }));
  const searchingPulseStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulseAnim.value }] }));

  const copyBookingId = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const [copiedRef, setCopiedRef] = useState(false);
  const [repeatReminderScheduled, setRepeatReminderScheduled] = useState(false);

  const refCode = "URBAN-" + bookingId.slice(-6).toUpperCase();

  // Automatic match for appliances that require periodic repeat cleaning
  const matchedAppliance = APPLIANCE_REPEAT_INTERVALS.find(
    (a) =>
      sub.name.toLowerCase().includes(a.id) ||
      sub.name.toLowerCase().includes(a.name.toLowerCase()) ||
      category.name.toLowerCase().includes(a.id) ||
      (a.id === "chimney" && (sub.name.toLowerCase().includes("chimney") || sub.name.toLowerCase().includes("kitchen"))) ||
      (a.id === "refrigerator" && (sub.name.toLowerCase().includes("fridge") || sub.name.toLowerCase().includes("refrigerator"))) ||
      (a.id === "ac" && (sub.name.toLowerCase().includes("ac") || sub.name.toLowerCase().includes("air conditioner")))
  );

  useEffect(() => {
    if (matchedAppliance && booking?.status !== "cancelled") {
      scheduleApplianceRepeatReminder(matchedAppliance.id, sub.name);
      setRepeatReminderScheduled(true);
    }
  }, [matchedAppliance?.id, booking?.status]);

  const handleShareReferral = async () => {
    try {
      await Share.share({
        title: "₹100 Off on Urban Helpers",
        message: `Hey! I just booked ${sub.name} on Urban Helpers. Use my exclusive referral code *${refCode}* to get ₹100 OFF on your first booking!\n\nDownload the app: https://urbanhelpers.app/download`,
      });
    } catch (e) {
      Alert.alert("Referral Code", `Share this code with your friends: ${refCode}`);
    }
  };

  const handleCopyReferral = () => {
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2500);
  };

  const accent  = category.accent || TEAL;
  const shortId = `#${bookingId.slice(-8).toUpperCase()}`;
  const otpDigits = String(rawOtp).slice(0, 4).split("");

  const bgStyle = { backgroundColor: isDark ? "#081826" : "#F4F6F9" };
  const cardBgStyle = {
    backgroundColor: isDark ? "#0D2135" : "#FFFFFF",
    borderColor: isDark ? "rgba(0,188,212,0.18)" : "#E2E8F0",
  };
  const textPrimary = { color: isDark ? "#FFFFFF" : "#0F172A" };
  const textSecondary = { color: isDark ? "#94A3B8" : "#64748B" };

  const isCancelled = booking?.status === "cancelled";
  const isVendorAssigned = !isCancelled && (Boolean(booking?.vendorId) || booking?.status === "accepted" || booking?.status === "assigned");
  const vendorName = booking?.vendorName || "Assigned Partner";
  const vendorRating = booking?.vendorRating || "4.9";
  const vendorImage = booking?.vendorImage;
  const vendorPhone = booking?.vendorPhone;

  return (
    <View style={[s.root, bgStyle]}>
      {/* Top Header */}
      <View style={[s.header, { backgroundColor: isDark ? "#081826" : "#FFFFFF", borderBottomColor: isDark ? "rgba(255,255,255,0.06)" : "#E2E8F0" }]}>
        <Pressable
          onPress={() => navigation.navigate("HomeDashboard")}
          style={[s.headerBtn, { backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "#F1F5F9" }]}
          accessibilityLabel="Back to Home"
        >
          <Ionicons name="arrow-back" size={22} color={isDark ? "#fff" : "#0f172a"} />
        </Pressable>
        <Text style={[s.headerTitle, textPrimary, isCancelled && { color: "#ef4444" }]}>
          {isCancelled ? "Booking Cancelled" : isVendorAssigned ? "Booking Confirmed" : "Booking Placed"}
        </Text>
        <View style={s.headerRightPlaceholder} />
      </View>

      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Big Seal (Success or Cancelled) */}
        <Animated.View entering={FadeIn.duration(400)} style={s.sealWrapper}>
          <Animated.View style={[s.ringOuter, ring1Style, isCancelled && { borderColor: "rgba(239,68,68,0.25)" }]} />
          <Animated.View style={[s.sealCircle, sealStyle]}>
            <LinearGradient
              colors={isCancelled ? ["#ef4444", "#b91c1c"] : ["#22c55e", "#16a34a"]}
              style={s.sealInner}
            >
              <Animated.View style={checkStyle}>
                <Ionicons name={isCancelled ? "close-sharp" : "checkmark-sharp"} size={38} color="#fff" />
              </Animated.View>
            </LinearGradient>
          </Animated.View>
        </Animated.View>

        {/* 2. Heading Texts */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={s.headingBlock}>
          <Text style={[s.title, textPrimary, isCancelled && { color: "#ef4444" }]}>
            {isCancelled ? "Booking Cancelled" : isVendorAssigned ? "Booking Confirmed!" : "Booking Placed!"}
          </Text>
          <Text style={[s.subtitle, textSecondary]}>
            {isCancelled
              ? (booking?.cancellationReason || "This booking was cancelled by administrator. Any payment made will be refunded.")
              : isVendorAssigned
              ? "Your service partner has accepted and will arrive on time."
              : "Your booking has been placed. Waiting for partner confirmation."}
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
        <Animated.View entering={FadeInDown.delay(260).duration(400)} style={[s.passCard, cardBgStyle]}>
          {/* Header Row */}
          <View style={s.passHeader}>
            <View style={s.passTag}>
              <Ionicons name="sparkles" size={13} color={TEAL} />
              <Text style={s.passTagText}>SERVICE DETAILS</Text>
            </View>
            <Text style={[s.passPrice, textPrimary]}>{sub.price}</Text>
          </View>

          {/* Service Info */}
          <View style={s.serviceRow}>
            <View style={[s.serviceIconBox, { backgroundColor: accent + "25" }]}>
              <Ionicons name={category.icon as any || "sparkles"} size={26} color={accent} />
            </View>
            <View style={s.serviceDetails}>
              <Text style={[s.serviceName, textPrimary]}>{sub.name}</Text>
              <Text style={[s.serviceCat, textSecondary]}>{category.name}</Text>
            </View>
          </View>

          {/* Perforated Line */}
          <View style={s.perfContainer}>
            <View style={[s.perfNib, s.perfNibLeft, { backgroundColor: isDark ? "#081826" : "#F4F6F9" }]} />
            <View style={s.perfDash} />
            <View style={[s.perfNib, s.perfNibRight, { backgroundColor: isDark ? "#081826" : "#F4F6F9" }]} />
          </View>

          {/* Date, Time & Duration Grid */}
          <View style={s.metaGrid}>
            <View style={s.metaCol}>
              <View style={s.metaIconLabel}>
                <Ionicons name="calendar-outline" size={14} color={TEAL} />
                <Text style={s.metaLabel}>SCHEDULED DATE</Text>
              </View>
              <Text style={[s.metaVal, textPrimary]}>{bookingDateStr}</Text>
            </View>
            <View style={s.metaDivider} />
            <View style={s.metaCol}>
              <View style={s.metaIconLabel}>
                <Ionicons name="time-outline" size={14} color="#f59e0b" />
                <Text style={s.metaLabel}>DURATION</Text>
              </View>
              <Text style={[s.metaVal, textPrimary]}>{sub.duration}</Text>
            </View>
          </View>

          {/* OTP Section (4 digits) or Cancelled Notice */}
          {isCancelled ? (
            <View style={[s.otpSection, { backgroundColor: isDark ? "rgba(239,68,68,0.08)" : "#FEF2F2", borderColor: isDark ? "rgba(239,68,68,0.25)" : "#FECACA" }]}>
              <View style={s.otpHeader}>
                <Ionicons name="ban" size={14} color="#ef4444" />
                <Text style={[s.otpHeading, { color: "#ef4444" }]}>SERVICE CANCELLED</Text>
              </View>
              <Text style={[s.otpNotice, { color: isDark ? "#F87171" : "#B91C1C", marginTop: 4 }]}>
                {booking?.cancellationReason || "This booking was cancelled. No technician will arrive, and OTP verification is deactivated."}
              </Text>
            </View>
          ) : (
            <View style={[s.otpSection, { backgroundColor: isDark ? "rgba(0,188,212,0.08)" : "#F0FDFA", borderColor: isDark ? "rgba(0,188,212,0.25)" : "#99F6E4" }]}>
              <View style={s.otpHeader}>
                <Ionicons name="shield-checkmark" size={14} color={TEAL} />
                <Text style={s.otpHeading}>START-SERVICE OTP</Text>
              </View>
              <View style={s.otpDigitsRow}>
                {otpDigits.map((digit, i) => (
                  <View key={i} style={[s.otpDigitBox, { backgroundColor: isDark ? "rgba(0,188,212,0.15)" : "#CCFBF1", borderColor: isDark ? "rgba(0,188,212,0.35)" : "#5EEAD4" }]}>
                    <Text style={[s.otpDigit, { color: isDark ? "#fff" : "#0F766E" }]}>{digit}</Text>
                  </View>
                ))}
              </View>
              <Text style={[s.otpNotice, textSecondary]}>
                Share this 4-digit code with the technician only when they arrive at your location.
              </Text>
            </View>
          )}

          {/* Booking ID & Copy Button */}
          <View style={s.bookingIdRow}>
            <View>
              <Text style={s.bookingIdTitle}>BOOKING ID</Text>
              <Text style={[s.bookingIdVal, textPrimary]}>{shortId}</Text>
            </View>
            <Pressable
              onPress={copyBookingId}
              style={({ pressed }) => [s.copyBtn, { backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "#F1F5F9", borderColor: isDark ? "rgba(255,255,255,0.1)" : "#E2E8F0", opacity: pressed ? 0.7 : 1 }]}
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

        {/* 5. Assigned Professional Preview Card (Dynamic: Cancelled vs Assigned vs Finding) */}
        {isCancelled ? (
          <Animated.View entering={FadeInDown.delay(340).duration(400)} style={[s.proCard, cardBgStyle, { borderColor: "#ef4444", borderWidth: 1 }]}>
            <View style={[s.proAvatar, s.proAvatarFallback, { backgroundColor: "rgba(239, 68, 68, 0.15)" }]}>
              <Ionicons name="ban" size={26} color="#ef4444" />
            </View>
            <View style={s.proInfo}>
              <Text style={[s.proName, { color: "#ef4444" }]}>Booking Cancelled</Text>
              <Text style={[s.proSkill, textSecondary]}>
                {booking?.cancellationReason || "This service request was cancelled by administrator."}
              </Text>
              <View style={s.proVerifiedRow}>
                <Ionicons name="shield-checkmark-outline" size={13} color="#64748B" />
                <Text style={s.proVerifiedText}>Refund processing active (if pre-paid)</Text>
              </View>
            </View>
          </Animated.View>
        ) : isVendorAssigned ? (
          <Animated.View entering={FadeInDown.delay(340).duration(400)} style={[s.proCard, cardBgStyle]}>
            <View style={s.proAvatarContainer}>
              {vendorImage ? (
                <Image
                  source={{ uri: vendorImage }}
                  style={s.proAvatar}
                  resizeMode="cover"
                />
              ) : (
                <View style={[s.proAvatar, s.proAvatarFallback, { backgroundColor: TEAL + "20" }]}>
                  <Ionicons name="person" size={26} color={TEAL} />
                </View>
              )}
              <View style={s.proBadgeCheck}>
                <Ionicons name="checkmark-circle" size={18} color="#22c55e" />
              </View>
            </View>
            <View style={s.proInfo}>
              <View style={s.proNameRow}>
                <Text style={[s.proName, textPrimary]} numberOfLines={1}>{vendorName}</Text>
                <View style={s.ratingBadge}>
                  <Ionicons name="star" size={12} color="#f59e0b" />
                  <Text style={s.ratingText}>{vendorRating}</Text>
                </View>
              </View>
              <Text style={[s.proSkill, textSecondary]}>Senior {category.name} Partner</Text>
              <View style={s.proVerifiedRow}>
                <Ionicons name="shield-checkmark-outline" size={13} color="#22c55e" />
                <Text style={s.proVerifiedText}>Verified & Background Checked</Text>
              </View>
            </View>
            {vendorPhone ? (
              <Pressable
                onPress={() => Linking.openURL(`tel:${vendorPhone}`)}
                style={s.proCallBtn}
              >
                <Ionicons name="call" size={18} color="#0D9488" />
              </Pressable>
            ) : null}
          </Animated.View>
        ) : (
          <Animated.View entering={FadeInDown.delay(340).duration(400)} style={[s.findingProCard, cardBgStyle]}>
            <Animated.View style={[s.findingIconBox, searchingPulseStyle]}>
              <Ionicons name="search" size={22} color={TEAL} />
            </Animated.View>
            <View style={s.findingInfo}>
              <View style={s.findingBadgeRow}>
                <Text style={s.findingBadgeText}>ASSIGNING PROFESSIONAL</Text>
                <ActivityIndicator size="small" color={TEAL} />
              </View>
              <Text style={[s.findingTitle, textPrimary]}>Finding nearest verified expert</Text>
              <Text style={[s.findingSub, textSecondary]}>
                We are allocating the top-rated specialist in your area. You will be notified instantly!
              </Text>
            </View>
          </Animated.View>
        )}

        {/* 6. Why Urban Helpers (4 Pills Grid) */}
        <Animated.View entering={FadeInDown.delay(420).duration(400)} style={s.featuresGrid}>
          {FEATURES.map((item, idx) => (
            <View key={idx} style={[s.featureCard, { backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "#FFFFFF", borderColor: isDark ? "rgba(255,255,255,0.06)" : "#E2E8F0" }]}>
              <View style={s.featureIconCircle}>
                <Ionicons name={item.icon as any} size={18} color={TEAL} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.featureTitle, textPrimary]}>{item.title}</Text>
                <Text style={[s.featureDesc, textSecondary]}>{item.desc}</Text>
              </View>
            </View>
          ))}
        </Animated.View>

        {/* 6.1 Appliance Repeat Cleaning & Maintenance Cadence */}
        {!isCancelled && (
          <Animated.View entering={FadeInDown.delay(440).duration(400)} style={[s.applianceCard, cardBgStyle]}>
            <View style={s.applianceHeader}>
              <View style={s.applianceBadge}>
                <Ionicons name="repeat" size={13} color="#059669" />
                <Text style={s.applianceBadgeText}>APPLIANCE HEALTH CADENCE</Text>
              </View>
              <View style={s.applianceActiveTag}>
                <Ionicons name="notifications" size={13} color="#059669" />
                <Text style={s.applianceActiveText}>Repeat Alert Active</Text>
              </View>
            </View>

            <View style={s.applianceContentRow}>
              <View style={s.applianceIconBox}>
                <Ionicons
                  name={matchedAppliance ? (matchedAppliance.icon as any) : "sparkles"}
                  size={24}
                  color="#059669"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.applianceTitle, textPrimary]}>
                  {matchedAppliance ? `${matchedAppliance.name} Repeat Cleaning` : "Periodic Appliance Maintenance"}
                </Text>
                <Text style={[s.applianceDesc, textSecondary]}>
                  {matchedAppliance
                    ? `Heavy buildup requires servicing every ${matchedAppliance.intervalDays} days. We've set your automatic repeat reminder!`
                    : "Kitchen chimneys need filter degreasing every 60 days, and refrigerators need coil sanitization every 90 days to save electricity and prevent bacteria."}
                </Text>
              </View>
            </View>

            {/* Quick reminder pills for key appliances */}
            <View style={s.appliancePillsRow}>
              <View style={s.applianceIntervalPill}>
                <Ionicons name="flame" size={12} color="#D97706" />
                <Text style={s.applianceIntervalText}>Chimney: Every 60d</Text>
              </View>
              <View style={s.applianceIntervalPill}>
                <Ionicons name="snow" size={12} color="#0284C7" />
                <Text style={s.applianceIntervalText}>Fridge: Every 90d</Text>
              </View>
              <View style={s.applianceIntervalPill}>
                <Ionicons name="thermometer" size={12} color="#059669" />
                <Text style={s.applianceIntervalText}>AC Jet: Every 90d</Text>
              </View>
            </View>
          </Animated.View>
        )}

        {/* 6.2 Referral Booking & Cross-Sell Privilege Card */}
        {!isCancelled && (
          <Animated.View entering={FadeInDown.delay(460).duration(400)} style={[s.referralCard, cardBgStyle]}>
            <LinearGradient
              colors={isDark ? ["#064e3b", "#022c22"] : ["#ECFDF5", "#D1FAE5"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={s.referralGradient}
            >
              <View style={s.referralTopRow}>
                <View style={s.referralIconBox}>
                  <Ionicons name="gift" size={24} color="#059669" />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[s.referralTitle, { color: isDark ? "#A7F3D0" : "#065F46" }]}>
                    Refer a Friend & Earn ₹100
                  </Text>
                  <Text style={[s.referralSub, { color: isDark ? "#6EE7B7" : "#047857" }]}>
                    Give friends ₹100 off on their first service. You earn ₹100 Urban Coins when they book!
                  </Text>
                </View>
              </View>

              {/* Referral Code Box */}
              <View style={s.refCodeRow}>
                <View style={s.refCodeBox}>
                  <Text style={s.refCodeLabel}>YOUR REFERRAL CODE</Text>
                  <Text style={s.refCodeText}>{refCode}</Text>
                </View>
                <Pressable
                  onPress={handleCopyReferral}
                  style={[s.refCopyBtn, copiedRef && s.refCopyBtnActive]}
                >
                  <Ionicons
                    name={copiedRef ? "checkmark-done" : "copy-outline"}
                    size={16}
                    color="#FFFFFF"
                  />
                  <Text style={s.refCopyBtnText}>{copiedRef ? "Copied!" : "Copy"}</Text>
                </Pressable>
                <Pressable
                  onPress={handleShareReferral}
                  style={s.refShareBtn}
                >
                  <Ionicons name="share-social" size={16} color="#FFFFFF" />
                  <Text style={s.refShareBtnText}>Share</Text>
                </Pressable>
              </View>

              {/* Cross-Sell Popular Companion Services */}
              <View style={s.crossSellSection}>
                <View style={s.crossSellHeader}>
                  <Ionicons name="sparkles" size={14} color="#D97706" />
                  <Text style={[s.crossSellHeaderText, { color: isDark ? "#FCD34D" : "#92400E" }]}>
                    Frequently Booked Together (₹100 Referral Applied)
                  </Text>
                </View>

                <View style={s.crossSellList}>
                  {[
                    {
                      name: "Kitchen Chimney Degreasing",
                      desc: "Heavy grease suction wash • Every 60d",
                      price: "₹499",
                      icon: "flame-outline",
                    },
                    {
                      name: "Refrigerator Coil Sanitization",
                      desc: "Deep bacterial clean & coil wash • Every 90d",
                      price: "₹399",
                      icon: "snow-outline",
                    },
                    {
                      name: "AC Jet Pump Deep Cleaning",
                      desc: "Jet foam filter & coil wash • Every 90d",
                      price: "₹599",
                      icon: "thermometer-outline",
                    },
                  ].map((item, idx) => (
                    <View key={idx} style={[s.crossSellItem, { backgroundColor: isDark ? "rgba(0,0,0,0.35)" : "#FFFFFF" }]}>
                      <View style={s.crossSellIconWrap}>
                        <Ionicons name={item.icon as any} size={18} color="#059669" />
                      </View>
                      <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text style={[s.crossSellItemName, textPrimary]} numberOfLines={1}>{item.name}</Text>
                        <Text style={[s.crossSellItemDesc, textSecondary]} numberOfLines={1}>
                          {item.desc}
                        </Text>
                      </View>
                      <Pressable
                        onPress={() => navigation.navigate("ServicesDashboard")}
                        style={s.crossSellAddBtn}
                      >
                        <Text style={s.crossSellPrice}>{item.price}</Text>
                        <Text style={s.crossSellBookText}>+ Book</Text>
                      </Pressable>
                    </View>
                  ))}
                </View>
              </View>
            </LinearGradient>
          </Animated.View>
        )}

        {/* 7. Action Buttons */}
        <Animated.View entering={FadeInDown.delay(500).duration(400)} style={s.actionBlock}>
          <Pressable
            style={({ pressed }) => [s.primaryBtn, { opacity: pressed ? 0.88 : 1 }]}
            onPress={() => {
              if (isCancelled) {
                navigation.navigate("ServicesDashboard");
              } else {
                navigation.navigate("LiveTracking", {
                  bookingId,
                  categoryId: category.id,
                  subServiceId: sub.id,
                });
              }
            }}
          >
            <LinearGradient
              colors={isCancelled ? ["#0284C7", "#0369A1"] : [TEAL, TEAL_D]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={s.primaryGradient}
            >
              <Ionicons name={isCancelled ? "grid-outline" : "navigate-circle-outline"} size={22} color="#fff" />
              <Text style={s.primaryBtnText}>{isCancelled ? "Explore Other Services" : "View Booking Details"}</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </LinearGradient>
          </Pressable>

          <Pressable
            style={({ pressed }) => [s.secondaryBtn, { backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "#F1F5F9", borderColor: isDark ? "rgba(255,255,255,0.1)" : "#CBD5E1", opacity: pressed ? 0.75 : 1 }]}
            onPress={() => navigation.navigate("HomeDashboard")}
          >
            <Ionicons name="home-outline" size={18} color={isDark ? "#94a3b8" : "#475569"} />
            <Text style={[s.secondaryBtnText, { color: isDark ? "#94a3b8" : "#475569" }]}>Back to Home</Text>
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
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 54 : 44,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
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
    textAlign: "center",
    letterSpacing: -0.4,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
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
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
    marginBottom: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
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
    marginBottom: 2,
  },
  serviceCat: {
    fontSize: 12,
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
    borderColor: "rgba(148, 163, 184, 0.3)",
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
  },
  metaDivider: {
    width: 1,
    backgroundColor: "rgba(148, 163, 184, 0.2)",
    marginHorizontal: 14,
  },

  // OTP
  otpSection: {
    borderWidth: 1,
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
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  otpDigit: {
    fontSize: 24,
    fontWeight: "800",
  },
  otpNotice: {
    fontSize: 11,
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
    letterSpacing: 0.8,
  },
  copyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
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
    borderRadius: 20,
    borderWidth: 1,
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
  proAvatarFallback: {
    alignItems: "center",
    justifyContent: "center",
  },
  proBadgeCheck: {
    position: "absolute",
    bottom: -2,
    right: -2,
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
  proCallBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,188,212,0.12)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(0,188,212,0.25)",
  },

  // Finding Professional Card
  findingProCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
    gap: 14,
  },
  findingIconBox: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(0,188,212,0.14)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "rgba(0,188,212,0.35)",
  },
  findingInfo: {
    flex: 1,
  },
  findingBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  findingBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: TEAL,
    letterSpacing: 1.2,
  },
  findingTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 3,
  },
  findingSub: {
    fontSize: 11.5,
    lineHeight: 16,
  },

  // Features Grid
  featuresGrid: {
    gap: 8,
    marginBottom: 22,
  },
  featureCard: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
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
    marginBottom: 1,
  },
  featureDesc: {
    fontSize: 11,
  },

  // Appliance Cadence Card
  applianceCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
  },
  applianceHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  applianceBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(5, 150, 105, 0.12)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  applianceBadgeText: {
    fontSize: 10.5,
    fontWeight: "800",
    color: "#059669",
    letterSpacing: 0.8,
  },
  applianceActiveTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  applianceActiveText: {
    fontSize: 11.5,
    fontWeight: "700",
    color: "#059669",
  },
  applianceContentRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  applianceIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(5, 150, 105, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  applianceTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 3,
  },
  applianceDesc: {
    fontSize: 12,
    lineHeight: 17,
  },
  appliancePillsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.06)",
  },
  applianceIntervalPill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    backgroundColor: "rgba(0,0,0,0.04)",
    paddingVertical: 6,
    borderRadius: 8,
  },
  applianceIntervalText: {
    fontSize: 10.5,
    fontWeight: "700",
    color: "#475569",
  },

  // Referral Card
  referralCard: {
    borderRadius: 22,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 20,
    elevation: 4,
  },
  referralGradient: {
    padding: 16,
  },
  referralTopRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  referralIconBox: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  referralTitle: {
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 2,
  },
  referralSub: {
    fontSize: 12,
    lineHeight: 16,
  },
  refCodeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 8,
    paddingLeft: 12,
    borderWidth: 1.5,
    borderColor: "#A7F3D0",
    marginBottom: 16,
  },
  refCodeBox: {
    flex: 1,
  },
  refCodeLabel: {
    fontSize: 9.5,
    fontWeight: "800",
    color: "#059669",
    letterSpacing: 0.8,
  },
  refCodeText: {
    fontSize: 15,
    fontWeight: "900",
    color: "#0F172A",
    letterSpacing: 1.2,
  },
  refCopyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#0D9488",
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
  },
  refCopyBtnActive: {
    backgroundColor: "#059669",
  },
  refCopyBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
  refShareBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#0F766E",
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
  },
  refShareBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },

  // Cross Sell Section
  crossSellSection: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(5, 150, 105, 0.2)",
  },
  crossSellHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  crossSellHeaderText: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  crossSellList: {
    gap: 8,
  },
  crossSellItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
  },
  crossSellIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(5, 150, 105, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  crossSellItemName: {
    fontSize: 12.5,
    fontWeight: "700",
  },
  crossSellItemDesc: {
    fontSize: 11,
    marginTop: 1,
  },
  crossSellAddBtn: {
    alignItems: "flex-end",
    backgroundColor: "#059669",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 6,
  },
  crossSellPrice: {
    fontSize: 11.5,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  crossSellBookText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#D1FAE5",
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
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 14,
  },
  secondaryBtnText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
