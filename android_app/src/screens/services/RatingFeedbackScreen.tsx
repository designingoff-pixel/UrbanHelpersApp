import React, { useState } from "react";
import { ScrollView, Text, View, Pressable, StyleSheet, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";
import { RootStackParamList } from "@/navigation/types";
import { colors } from "@/theme/colors";

type Props = NativeStackScreenProps<RootStackParamList, "RatingFeedback">;

const EMOJIS = ["😍", "😀", "😐", "😕"];
const TIPS = ["₹50", "₹100", "₹200", "Custom"];
const SUGGESTED = [
  { label: "Appliance Repair", icon: "construct-outline" as const,   color: "#2563eb" },
  { label: "Pest Control",     icon: "bug-outline" as const,         color: "#15803d" },
  { label: "Plumbing",         icon: "water-outline" as const,       color: "#0284c7" },
  { label: "Electrical",       icon: "flash-outline" as const,       color: "#d97706" },
];

export default function RatingFeedbackScreen({ navigation }: Props) {
  const [stars, setStars] = useState(0);
  const [activeEmoji, setActiveEmoji] = useState(-1);
  const [activeTip, setActiveTip] = useState(-1);
  const [review, setReview] = useState("");

  return (
    <View style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} style={s.iconBtn}>
          <Ionicons name="arrow-back" size={22} color="white" />
        </Pressable>
        <Text style={s.headerTitle}>Thank You ❤️</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* ── Hero ────────────────────────────────────────── */}
        <Animated.View entering={FadeInDown.duration(350)}>
          <LinearGradient colors={["#f97316", "#fdba74"]} style={s.hero}>
            <Text style={s.heroTitle}>How was your experience?</Text>
            <Text style={s.heroSub}>Your feedback helps us improve.</Text>
          </LinearGradient>
        </Animated.View>

        {/* ── Star + Emoji Rating ──────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(80).duration(380)} style={s.ratingCard}>
          {/* Stars */}
          <View style={s.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Pressable key={star} onPress={() => setStars(star)}>
                <Ionicons
                  name={star <= stars ? "star" : "star-outline"}
                  size={40}
                  color={star <= stars ? "#eab308" : colors.text.muted}
                />
              </Pressable>
            ))}
          </View>
          {/* Emoji row */}
          <View style={s.emojiRow}>
            {EMOJIS.map((emoji, i) => (
              <Pressable
                key={i}
                onPress={() => setActiveEmoji(i)}
                style={[s.emojiBtn, activeEmoji === i && s.emojiBtnActive]}
              >
                <Text style={[s.emojiText, activeEmoji !== i && s.emojiGray]}>{emoji}</Text>
              </Pressable>
            ))}
          </View>
        </Animated.View>

        {/* ── Write Review ─────────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(130).duration(380)} style={s.reviewCard}>
          <Text style={s.sectionTitle}>Write a review</Text>
          <TextInput
            style={s.reviewInput}
            placeholder="Tell us about your experience..."
            placeholderTextColor={colors.text.muted}
            multiline
            value={review}
            onChangeText={setReview}
          />
        </Animated.View>

        {/* ── Photo Upload ─────────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(170).duration(380)}>
          <Text style={s.sectionLabel}>Add Photos</Text>
          <View style={s.photoRow}>
            {["Before", "After"].map((label) => (
              <Pressable key={label} style={s.photoBox}>
                <Ionicons name="camera-outline" size={28} color={colors.text.muted} />
                <Text style={s.photoLabel}>{label}</Text>
              </Pressable>
            ))}
          </View>
        </Animated.View>

        {/* ── Tip Professional ─────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(210).duration(380)} style={s.tipCard}>
          <View style={s.tipHeader}>
            <Text style={s.sectionTitle}>Tip the Professional</Text>
            <Ionicons name="heart" size={18} color="#f97316" />
          </View>
          <View style={s.tipGrid}>
            {TIPS.map((tip, i) => (
              <Pressable
                key={tip}
                onPress={() => setActiveTip(i)}
                style={[s.tipBtn, activeTip === i && s.tipBtnActive]}
              >
                <Text style={[s.tipText, activeTip === i && s.tipTextActive]}>{tip}</Text>
              </Pressable>
            ))}
          </View>
        </Animated.View>

        {/* ── Referral Banner ──────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(250).duration(380)}>
          <LinearGradient colors={["#4361ee", "#4cc9f0"]} style={s.referralCard}>
            <View style={s.referralLeft}>
              <Text style={s.referralTitle}>Recommend to Friends</Text>
              <Text style={s.referralSub}>Get ₹500 off your next service</Text>
            </View>
            <Pressable style={s.inviteBtn}>
              <Text style={s.inviteBtnText}>Invite & Earn</Text>
            </Pressable>
          </LinearGradient>
        </Animated.View>

        {/* ── Suggested Services ───────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(300).duration(380)}>
          <Text style={[s.sectionLabel, { marginTop: 8 }]}>Suggested Services</Text>
          <View style={s.suggestGrid}>
            {SUGGESTED.map((svc) => (
              <Pressable
                key={svc.label}
                onPress={() => navigation.navigate("ServicesDashboard")}
                style={[s.suggestCard, { backgroundColor: svc.color }]}
              >
                <Ionicons name={svc.icon} size={24} color="white" />
                <Text style={s.suggestLabel}>{svc.label}</Text>
              </Pressable>
            ))}
          </View>
        </Animated.View>

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* ── Bottom Buttons ───────────────────────────────────── */}
      <View style={s.cta}>
        <Pressable
          style={s.submitBtn}
          onPress={() => navigation.navigate("HomeDashboard")}
        >
          <Text style={s.submitBtnText}>Submit Feedback</Text>
        </Pressable>
        <Pressable
          style={s.skipBtn}
          onPress={() => navigation.navigate("HomeDashboard")}
        >
          <Text style={s.skipBtnText}>Go to Home</Text>
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
  iconBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.12)", justifyContent: "center", alignItems: "center",
  },
  scroll: { paddingHorizontal: 16 },

  // Hero
  hero: { borderRadius: 28, padding: 24, marginBottom: 16, overflow: "hidden" },
  heroTitle: { fontSize: 22, fontWeight: "700", color: "white", marginBottom: 6 },
  heroSub: { fontSize: 14, color: "rgba(255,255,255,0.85)" },

  // Rating
  ratingCard: {
    backgroundColor: "#1a2c3c", borderRadius: 24, padding: 24, marginBottom: 14,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
  },
  starsRow: { flexDirection: "row", justifyContent: "center", gap: 8, marginBottom: 20 },
  emojiRow: { flexDirection: "row", justifyContent: "space-around", paddingTop: 16, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.1)" },
  emojiBtn: { padding: 8, borderRadius: 16 },
  emojiBtnActive: { backgroundColor: "rgba(255,255,255,0.1)", transform: [{ scale: 1.2 }] },
  emojiText: { fontSize: 36 },
  emojiGray: { opacity: 0.45 },

  // Review
  reviewCard: {
    backgroundColor: "#1a2c3c", borderRadius: 24, padding: 20, marginBottom: 14,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
  },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: "white", marginBottom: 12 },
  reviewInput: {
    backgroundColor: "#081826", borderRadius: 16, padding: 14,
    color: "white", fontSize: 14, height: 110, textAlignVertical: "top",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.1)",
  },

  // Photo
  sectionLabel: { fontSize: 15, fontWeight: "700", color: "white", marginBottom: 12 },
  photoRow: { flexDirection: "row", gap: 12, marginBottom: 16 },
  photoBox: {
    flex: 1, height: 100, borderRadius: 20,
    borderWidth: 2, borderColor: "rgba(255,255,255,0.15)",
    borderStyle: "dashed", backgroundColor: "#1a2c3c",
    alignItems: "center", justifyContent: "center", gap: 8,
  },
  photoLabel: { fontSize: 12, fontWeight: "600", color: colors.text.muted },

  // Tip
  tipCard: {
    backgroundColor: "#1a2c3c", borderRadius: 24, padding: 20, marginBottom: 14,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
  },
  tipHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  tipGrid: { flexDirection: "row", gap: 10 },
  tipBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.08)", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
  },
  tipBtnActive: { backgroundColor: "#f97316", borderColor: "#f97316" },
  tipText: { fontSize: 13, fontWeight: "700", color: "rgba(255,255,255,0.8)" },
  tipTextActive: { color: "white" },

  // Referral
  referralCard: {
    borderRadius: 24, padding: 20, marginBottom: 14,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.15)",
  },
  referralLeft: { flex: 1 },
  referralTitle: { fontSize: 15, fontWeight: "700", color: "white" },
  referralSub: { fontSize: 12, color: "rgba(255,255,255,0.8)", marginTop: 3 },
  inviteBtn: {
    backgroundColor: "white", borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 9,
  },
  inviteBtnText: { fontSize: 13, fontWeight: "700", color: "#4361ee" },

  // Suggested
  suggestGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 8 },
  suggestCard: {
    width: "47%", borderRadius: 20, padding: 16, alignItems: "center", gap: 8,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.15)",
  },
  suggestLabel: { fontSize: 12, fontWeight: "600", color: "white", textAlign: "center" },

  // CTA
  cta: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    paddingHorizontal: 16, paddingBottom: 28, paddingTop: 12, gap: 10,
    backgroundColor: "rgba(8,24,38,0.97)",
    borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.08)",
  },
  submitBtn: {
    backgroundColor: "#f97316", borderRadius: 22, paddingVertical: 16,
    alignItems: "center",
  },
  submitBtnText: { fontSize: 15, fontWeight: "700", color: "white" },
  skipBtn: {
    backgroundColor: "rgba(255,255,255,0.07)", borderRadius: 22, paddingVertical: 14,
    alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.12)",
  },
  skipBtnText: { fontSize: 14, fontWeight: "600", color: colors.text.secondary },
});
