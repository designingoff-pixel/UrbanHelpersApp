import React from "react";
import { ScrollView, Text, View, Pressable, StyleSheet, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import Animated, { FadeInDown } from "react-native-reanimated";
import { RootStackParamList } from "@/navigation/types";
import { colors } from "@/theme/colors";

type Props = NativeStackScreenProps<RootStackParamList, "HomeCleaning">;
const { width: W } = Dimensions.get("window");

const HIGHLIGHTS = [
  { label: "Verified\nProfessionals", icon: "shield-checkmark-outline" as const, gradient: ["#2563eb", "#1e40af"] as string[] },
  { label: "Eco-Friendly\nProducts",  icon: "leaf-outline" as const,             gradient: ["#15803d", "#166534"] as string[] },
  { label: "Same-Day\nBooking",        icon: "calendar-outline" as const,         gradient: ["#d97706", "#b45309"] as string[] },
  { label: "100%\nSatisfaction",       icon: "thumbs-up-outline" as const,        gradient: ["#db2777", "#be185d"] as string[] },
];

const ROOMS = [
  { label: "Living Room",  sub: "Dusting & Mopping",      gradient: ["#4cc9f0", "#4361ee"] as string[] },
  { label: "Bedroom",      sub: "Deep Cleaning",           gradient: ["#8b5cf6", "#c084fc"] as string[] },
  { label: "Kitchen",      sub: "Degreasing & Scrubbing",  gradient: ["#10b981", "#34d399"] as string[] },
  { label: "Bathroom",     sub: "Sanitization",            gradient: ["#0ea5e9", "#38bdf8"] as string[] },
];

const PACKAGES = [
  { name: "Basic",   price: "₹699",  duration: "2 hrs", desc: "1 room deep clean + floor mopping.",      gradient: ["#1e3a8a", "#2563eb"] as string[] },
  { name: "Standard",price: "₹1,299",duration: "4 hrs", desc: "3 rooms + kitchen + bathrooms.",          gradient: ["#0d9488", "#14b8a6"] as string[], popular: true },
  { name: "Premium", price: "₹1,999",duration: "5 hrs", desc: "Full home clean + sofa + water tank.",    gradient: ["#7c3aed", "#8b5cf6"] as string[] },
];

export default function HomeCleaningScreen({ navigation }: Props) {
  return (
    <View style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} style={s.iconBtn}>
          <Ionicons name="arrow-back" size={22} color="white" />
        </Pressable>
        <Text style={s.headerTitle}>Home Cleaning</Text>
        <View style={s.headerRight}>
          <Pressable style={s.iconBtn}>
            <Ionicons name="heart-outline" size={20} color="white" />
          </Pressable>
          <Pressable style={s.iconBtn}>
            <Ionicons name="share-outline" size={20} color="white" />
          </Pressable>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* ── Hero ────────────────────────────────────────── */}
        <Animated.View entering={FadeInDown.duration(380)}>
          <LinearGradient colors={["#00bcd4", "#0097a7"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.hero}>
            <View style={s.heroBlobTL} />
            <View style={s.heroBlobBR} />
            <Text style={s.heroTitle}>Professional Home Cleaning</Text>
            <Text style={s.heroSub}>Book trained professionals for a cleaner, healthier home.</Text>
            <View style={s.heroButtons}>
              <Pressable
                style={s.heroBookBtn}
                onPress={() => navigation.navigate("ServiceCategory", { categoryId: "cleaning" })}
              >
                <Text style={s.heroBookText}>Book Now</Text>
              </Pressable>
              <Pressable style={s.heroExploreBtn}>
                <Text style={s.heroExploreText}>View Packages</Text>
              </Pressable>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* ── Service Highlights ───────────────────────────── */}
        <Text style={s.sectionTitle}>Service Highlights</Text>
        <View style={s.highlightsGrid}>
          {HIGHLIGHTS.map((h, i) => (
            <Animated.View key={h.label} entering={FadeInDown.delay(i * 60).duration(350).springify()}>
              <LinearGradient colors={h.gradient} style={s.highlightCard}>
                <View style={s.highlightIconWrap}>
                  <Ionicons name={h.icon} size={28} color="white" />
                </View>
                <Text style={s.highlightLabel}>{h.label}</Text>
              </LinearGradient>
            </Animated.View>
          ))}
        </View>

        {/* ── What We Clean ────────────────────────────────── */}
        <Text style={s.sectionTitle}>What We Clean</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.roomsScroll}>
          {ROOMS.map((room, i) => (
            <Animated.View key={room.label} entering={FadeInDown.delay(i * 50).duration(350)}>
              <LinearGradient colors={room.gradient} style={s.roomCard}>
                <View style={s.roomOverlay} />
                <Text style={s.roomTitle}>{room.label}</Text>
                <Text style={s.roomSub}>{room.sub}</Text>
              </LinearGradient>
            </Animated.View>
          ))}
        </ScrollView>

        {/* ── Packages ─────────────────────────────────────── */}
        <Text style={s.sectionTitle}>Choose a Package</Text>
        {PACKAGES.map((pkg, i) => (
          <Animated.View key={pkg.name} entering={FadeInDown.delay(i * 70).duration(380).springify()}>
            <Pressable
              onPress={() => navigation.navigate("ServiceDetail", { categoryId: "cleaning", subServiceId: "cl-full" })}
              style={({ pressed }) => ({ opacity: pressed ? 0.88 : 1 })}
            >
              <LinearGradient colors={pkg.gradient} style={s.pkgCard}>
                {pkg.popular && (
                  <View style={s.pkgBadge}>
                    <Text style={s.pkgBadgeText}>⭐ BEST SELLER</Text>
                  </View>
                )}
                <View style={s.pkgLeft}>
                  <Text style={s.pkgName}>{pkg.name}</Text>
                  <Text style={s.pkgDesc}>{pkg.desc}</Text>
                  <View style={s.pkgMeta}>
                    <Ionicons name="time-outline" size={13} color="rgba(255,255,255,0.7)" />
                    <Text style={s.pkgMetaText}>{pkg.duration}</Text>
                  </View>
                </View>
                <View style={s.pkgRight}>
                  <Text style={s.pkgPrice}>{pkg.price}</Text>
                  <Pressable style={s.pkgBookBtn} onPress={() => navigation.navigate("ServiceDetail", { categoryId: "cleaning", subServiceId: "cl-full" })}>
                    <Text style={s.pkgBookText}>Book</Text>
                  </Pressable>
                </View>
              </LinearGradient>
            </Pressable>
          </Animated.View>
        ))}

        {/* ── Guarantee strip ──────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(300).duration(380)} style={s.guaranteeStrip}>
          {[
            { icon: "shield-checkmark-outline" as const, label: "Verified Pros" },
            { icon: "flash-outline" as const,            label: "Same Day" },
            { icon: "thumbs-up-outline" as const,        label: "Guaranteed" },
            { icon: "ribbon-outline" as const,           label: "30-Day Warranty" },
          ].map((g) => (
            <View key={g.label} style={s.guaranteeItem}>
              <View style={s.guaranteeIcon}>
                <Ionicons name={g.icon} size={18} color="#00bcd4" />
              </View>
              <Text style={s.guaranteeLabel}>{g.label}</Text>
            </View>
          ))}
        </Animated.View>

        <View style={{ height: 60 }} />
      </ScrollView>
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
    backgroundColor: "rgba(255,255,255,0.12)", justifyContent: "center", alignItems: "center",
  },
  scroll: { paddingHorizontal: 16 },

  // Hero
  hero: { borderRadius: 28, padding: 24, marginBottom: 20, minHeight: 190, overflow: "hidden", justifyContent: "flex-end" },
  heroBlobTL: { position: "absolute", top: -40, left: -40, width: 160, height: 160, borderRadius: 80, backgroundColor: "rgba(255,255,255,0.08)" },
  heroBlobBR: { position: "absolute", bottom: -40, right: -40, width: 180, height: 180, borderRadius: 90, backgroundColor: "rgba(0,0,0,0.1)" },
  heroTitle: { fontSize: 24, fontWeight: "700", color: "white", marginBottom: 8 },
  heroSub: { fontSize: 14, color: "rgba(255,255,255,0.8)", marginBottom: 20, lineHeight: 20 },
  heroButtons: { flexDirection: "row", gap: 12 },
  heroBookBtn: { backgroundColor: "white", borderRadius: 20, paddingHorizontal: 20, paddingVertical: 11 },
  heroBookText: { fontSize: 13, fontWeight: "700", color: "#0097a7" },
  heroExploreBtn: { backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 20, paddingHorizontal: 20, paddingVertical: 11, borderWidth: 1, borderColor: "rgba(255,255,255,0.25)" },
  heroExploreText: { fontSize: 13, fontWeight: "600", color: "white" },

  sectionTitle: { fontSize: 18, fontWeight: "700", color: "white", marginBottom: 14 },

  // Highlights
  highlightsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 24 },
  highlightCard: { width: (W - 32 - 10) / 2, borderRadius: 20, padding: 18, alignItems: "center", gap: 10, borderWidth: 1, borderColor: "rgba(255,255,255,0.12)" },
  highlightIconWrap: { width: 56, height: 56, borderRadius: 28, backgroundColor: "rgba(255,255,255,0.2)", justifyContent: "center", alignItems: "center" },
  highlightLabel: { fontSize: 13, fontWeight: "700", color: "white", textAlign: "center", lineHeight: 18 },

  // Rooms
  roomsScroll: { gap: 12, paddingBottom: 4, marginBottom: 24 },
  roomCard: { width: 220, height: 140, borderRadius: 22, padding: 18, justifyContent: "flex-end", overflow: "hidden" },
  roomOverlay: { position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.2)" },
  roomTitle: { fontSize: 18, fontWeight: "700", color: "white" },
  roomSub: { fontSize: 12, color: "rgba(255,255,255,0.75)", marginTop: 4 },

  // Packages
  pkgCard: { borderRadius: 22, padding: 20, marginBottom: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.12)", overflow: "hidden" },
  pkgBadge: { position: "absolute", top: 10, right: 10, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: "rgba(255,255,255,0.3)" },
  pkgBadgeText: { fontSize: 9, fontWeight: "800", color: "white", letterSpacing: 0.8 },
  pkgLeft: { flex: 1, paddingRight: 14 },
  pkgName: { fontSize: 18, fontWeight: "700", color: "white", marginBottom: 6 },
  pkgDesc: { fontSize: 13, color: "rgba(255,255,255,0.75)", lineHeight: 18, marginBottom: 8 },
  pkgMeta: { flexDirection: "row", alignItems: "center", gap: 5 },
  pkgMetaText: { fontSize: 12, color: "rgba(255,255,255,0.7)" },
  pkgRight: { alignItems: "flex-end", gap: 10 },
  pkgPrice: { fontSize: 22, fontWeight: "700", color: "white" },
  pkgBookBtn: { backgroundColor: "white", borderRadius: 16, paddingHorizontal: 16, paddingVertical: 9 },
  pkgBookText: { fontSize: 13, fontWeight: "700", color: "#0d9488" },

  // Guarantee
  guaranteeStrip: { flexDirection: "row", flexWrap: "wrap", gap: 10, backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 20, padding: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  guaranteeItem: { width: "47%", flexDirection: "row", alignItems: "center", gap: 10 },
  guaranteeIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(0,188,212,0.12)", justifyContent: "center", alignItems: "center" },
  guaranteeLabel: { fontSize: 12, fontWeight: "600", color: "rgba(255,255,255,0.75)" },
});
