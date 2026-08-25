/**
 * ServiceDetailScreen — booking flow
 * Package display → Address → Date/Time picker → Confirm button
 */
import React, { useState } from "react";
import {
  ActivityIndicator, Alert,
  ScrollView, Text, View, Pressable, StyleSheet,
  TextInput, Dimensions, Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import Animated, { FadeInDown } from "react-native-reanimated";
import { RootStackParamList } from "@/navigation/types";
import { colors } from "@/theme/colors";
import { SERVICE_CATEGORIES } from "./servicesData";
import { getSubServiceImage } from "@/assets/serviceImages";
import { useAuth } from "@/context/AuthContext";
import { createBooking } from "@/services/bookingService";

const SLOT_START_HOUR = [8, 12, 16];

function slotToScheduledAt(dayIndex: number, slotIndex: number): string {
  const date = new Date();
  date.setDate(date.getDate() + dayIndex);
  date.setHours(SLOT_START_HOUR[slotIndex] ?? 8, 0, 0, 0);
  return date.toISOString();
}

function parsePrice(priceLabel: string): number {
  const digits = priceLabel.replace(/[^0-9]/g, "");
  return digits ? parseInt(digits, 10) : 0;
}

type Props = NativeStackScreenProps<RootStackParamList, "ServiceDetail">;

const { width: W } = Dimensions.get("window");

const DAYS = [
  { day: "Mon", date: "11" }, { day: "Tue", date: "12" },
  { day: "Wed", date: "13" }, { day: "Thu", date: "14" },
  { day: "Fri", date: "15" }, { day: "Sat", date: "16" },
  { day: "Sun", date: "17" },
];

const TIME_SLOTS = [
  { label: "Morning",   time: "8:00 AM – 11:00 AM" },
  { label: "Afternoon", time: "12:00 PM – 3:00 PM" },
  { label: "Evening",   time: "4:00 PM – 7:00 PM" },
];

export default function ServiceDetailScreen({ navigation, route }: Props) {
  const { categoryId, subServiceId } = route.params;

  const category = SERVICE_CATEGORIES.find((c) => c.id === categoryId);
  const sub = category?.subServices.find((s) => s.id === subServiceId);

  const [selectedDay, setSelectedDay] = useState(1);
  const [selectedSlot, setSelectedSlot] = useState(1);
  const [address, setAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();

  if (!category || !sub) return null;

  const handleConfirmBooking = async () => {
    if (!user) {
      Alert.alert("Sign in required", "Please sign in to book a service.", [
        { text: "Sign In", onPress: () => navigation.navigate("SignIn") },
        { text: "Cancel", style: "cancel" },
      ]);
      return;
    }
    if (!address.trim()) {
      Alert.alert("Address required", "Please enter your service address.");
      return;
    }

    setSubmitting(true);
    try {
      const bookingId = await createBooking({
        customerId: user.uid,
        customerName: user.displayName ?? "Urban Helpers customer",
        serviceCategory: category.name,
        subServiceName: sub.name,
        address: address.trim(),
        scheduledAt: slotToScheduledAt(selectedDay, selectedSlot),
        price: parsePrice(sub.price),
        priceLabel: sub.price,
      });

      navigation.navigate("BookingConfirmed", {
        bookingId,
        categoryId: category.id,
        subServiceId: sub.id,
        dayIndex: selectedDay,
        slotIndex: selectedSlot,
      });
    } catch (err) {
      Alert.alert("Booking failed", "Something went wrong while confirming your booking. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

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

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

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
          {/* Floating category pill on the image */}
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

        {/* ── Address ──────────────────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(100).duration(380)}>
          <View style={s.section}>
            <Text style={s.sectionTitle}>Service Address</Text>

            {/* Location type chips */}
            <View style={s.locChips}>
              {["Home", "Office", "+ Add New"].map((l, i) => (
                <Pressable key={l} style={[s.locChip, i === 0 && s.locChipActive]}>
                  <Ionicons
                    name={i === 0 ? "home-outline" : i === 1 ? "briefcase-outline" : "add"}
                    size={13}
                    color={i === 0 ? category.accent : colors.text.secondary}
                  />
                  <Text style={[s.locChipText, i === 0 && { color: category.accent }]}>{l}</Text>
                </Pressable>
              ))}
            </View>

            <TextInput
              style={s.addressInput}
              placeholder="House No / Flat / Villa…"
              placeholderTextColor={colors.text.muted}
              value={address}
              onChangeText={setAddress}
            />
            <TextInput
              style={[s.addressInput, { marginTop: 10 }]}
              placeholder="Landmark (optional)"
              placeholderTextColor={colors.text.muted}
            />
          </View>
        </Animated.View>

        {/* ── Date & Time ──────────────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(160).duration(380)}>
          <LinearGradient
            colors={["#4338ca", "#8b5cf6"]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={s.dateSection}
          >
            <Text style={s.dateSectionTitle}>Select Date & Time</Text>

            {/* Express toggle */}
            <View style={s.expressRow}>
              <Ionicons name="flash" size={16} color="white" />
              <Text style={s.expressText}>Express Service (within 2 hrs)</Text>
            </View>

            {/* Day strip */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.dayStrip}>
              {DAYS.map((d, i) => (
                <Pressable
                  key={i}
                  onPress={() => setSelectedDay(i)}
                  style={[s.dayCard, selectedDay === i && s.dayCardActive]}
                >
                  <Text style={[s.dayName, selectedDay === i && s.dayNameActive]}>{d.day}</Text>
                  <Text style={[s.dayDate, selectedDay === i && s.dayDateActive]}>{d.date}</Text>
                </Pressable>
              ))}
            </ScrollView>

            {/* Time slots */}
            <View style={s.slotGrid}>
              {TIME_SLOTS.map((slot, i) => (
                <Pressable
                  key={i}
                  onPress={() => setSelectedSlot(i)}
                  style={[s.slotCard, selectedSlot === i && s.slotCardActive]}
                >
                  <Text style={[s.slotLabel, selectedSlot === i && s.slotLabelActive]}>
                    {slot.label}
                  </Text>
                  <Text style={[s.slotTime, selectedSlot === i && s.slotTimeActive]}>
                    {slot.time}
                  </Text>
                </Pressable>
              ))}
            </View>
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
          style={({ pressed }) => [s.ctaBtn, { backgroundColor: category.gradient[0], opacity: pressed || submitting ? 0.7 : 1 }]}
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
  topSub: { fontSize: 12, color: colors.text.secondary, textAlign: "center" },
  iconBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.surface.containerHigh,
    borderWidth: 1, borderColor: colors.glass.border,
    justifyContent: "center", alignItems: "center",
  },

  scroll: { paddingHorizontal: 16 },

  // Hero Image
  heroImageWrap: {
    marginHorizontal: -16,
    height: 220,
    position: "relative",
    marginBottom: 16,
    overflow: "hidden",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroImageGradient: {
    position: "absolute",
    bottom: 0, left: 0, right: 0,
    height: 100,
  },
  heroImagePill: {
    position: "absolute",
    bottom: 14,
    left: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },
  heroImagePillText: {
    fontSize: 12,
    fontWeight: "700",
    color: "white",
  },

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
  serviceCardContent: { flexDirection: "row", gap: 16, alignItems: "flex-start" },
  serviceIconWrap: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center", alignItems: "center", flexShrink: 0,
  },
  serviceInfo: { flex: 1 },
  serviceName: { fontSize: 20, fontWeight: "700", color: "white", marginBottom: 2 },
  serviceCat: { fontSize: 12, color: "rgba(255,255,255,0.65)", marginBottom: 8 },
  serviceDesc: { fontSize: 13, color: "rgba(255,255,255,0.8)", lineHeight: 18, marginBottom: 12 },
  serviceMeta: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  metaChip: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 12, paddingHorizontal: 10, paddingVertical: 5,
  },
  metaChipText: { fontSize: 12, color: "white", fontWeight: "600" },

  // Address section
  section: {
    backgroundColor: colors.surface.container, borderRadius: 22,
    padding: 18, marginBottom: 14,
    borderWidth: 1, borderColor: colors.glass.border,
  },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: colors.text.primary, marginBottom: 14 },
  locChips: { flexDirection: "row", gap: 8, marginBottom: 14, flexWrap: "wrap" },
  locChip: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 13, paddingVertical: 8,
    borderRadius: 20, backgroundColor: colors.surface.containerHigh,
    borderWidth: 1, borderColor: colors.glass.border,
  },
  locChipActive: { borderColor: "#00bcd4", backgroundColor: "rgba(0,188,212,0.1)" },
  locChipText: { fontSize: 12, fontWeight: "600", color: colors.text.secondary },
  addressInput: {
    backgroundColor: colors.surface.containerHigh,
    borderRadius: 14, height: 50, paddingHorizontal: 16,
    color: colors.text.primary, fontSize: 14,
    borderWidth: 1, borderColor: colors.glass.border,
  },

  // Date/time section
  dateSection: {
    borderRadius: 22, padding: 20, marginBottom: 14,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.12)", overflow: "hidden",
  },
  dateSectionTitle: { fontSize: 16, fontWeight: "700", color: "white", marginBottom: 14 },
  expressRow: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "rgba(255,255,255,0.12)", borderRadius: 12,
    padding: 10, marginBottom: 16,
  },
  expressText: { fontSize: 13, color: "white", fontWeight: "600" },
  dayStrip: { gap: 8, paddingBottom: 4, marginBottom: 16 },
  dayCard: {
    width: 60, height: 70, borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center", justifyContent: "center", gap: 4,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.15)",
  },
  dayCardActive: { backgroundColor: "white" },
  dayName: { fontSize: 11, fontWeight: "600", color: "rgba(255,255,255,0.7)" },
  dayNameActive: { color: "#4338ca" },
  dayDate: { fontSize: 18, fontWeight: "700", color: "white" },
  dayDateActive: { color: "#4338ca" },
  slotGrid: { gap: 10 },
  slotCard: {
    backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 14,
    padding: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.15)",
  },
  slotCardActive: {
    backgroundColor: "white",
    borderColor: "transparent",
  },
  slotLabel: { fontSize: 11, color: "rgba(255,255,255,0.65)", fontWeight: "600", marginBottom: 3 },
  slotLabelActive: { color: "#4338ca" },
  slotTime: { fontSize: 14, color: "white", fontWeight: "600" },
  slotTimeActive: { color: "#4338ca" },

  // Promise
  promiseGrid: { flexDirection: "row", gap: 10 },
  promiseCard: {
    flex: 1, alignItems: "center", backgroundColor: colors.surface.containerHigh,
    borderRadius: 16, padding: 12, gap: 6,
    borderWidth: 1, borderColor: colors.glass.border,
  },
  promiseIcon: {
    width: 40, height: 40, borderRadius: 20,
    justifyContent: "center", alignItems: "center",
  },
  promiseLabel: { fontSize: 12, fontWeight: "700", color: colors.text.primary, textAlign: "center" },
  promiseSub: { fontSize: 10, color: colors.text.secondary, textAlign: "center" },

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
  ctaPrice: { fontSize: 22, fontWeight: "700", color: colors.text.primary },
  ctaDuration: { fontSize: 12, color: colors.text.secondary, marginTop: 2 },
  ctaBtn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: 22, paddingVertical: 14, borderRadius: 18,
  },
  ctaBtnText: { fontSize: 15, fontWeight: "700", color: "white" },
});
