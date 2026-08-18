/**
 * ServiceCategoryScreen
 * Reusable screen for any of the 10 service categories.
 * Shows sub-services as scrollable cards with price, duration, description.
 * Tapping any sub-service navigates to ServiceDetailScreen.
 */
import React from "react";
import {
  ScrollView, Text, View, Pressable, StyleSheet, Dimensions, Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";
import { RootStackParamList } from "@/navigation/types";
import { colors } from "@/theme/colors";
import { SERVICE_CATEGORIES, SubService } from "./servicesData";
import { getCategoryImage } from "@/assets/serviceImages";

type Props = NativeStackScreenProps<RootStackParamList, "ServiceCategory">;

const { width: W } = Dimensions.get("window");

// Trust badges shown on every category page
const TRUST_BADGES = [
  { icon: "shield-checkmark-outline" as const, label: "Verified Pros" },
  { icon: "flash-outline" as const,            label: "Same-Day" },
  { icon: "thumbs-up-outline" as const,        label: "Guaranteed" },
  { icon: "ribbon-outline" as const,           label: "30-Day Warranty" },
];

export default function ServiceCategoryScreen({ navigation, route }: Props) {
  const { categoryId } = route.params;
  const category = SERVICE_CATEGORIES.find((c) => c.id === categoryId);

  if (!category) {
    return (
      <View style={s.root}>
        <Text style={{ color: "white", padding: 24 }}>Category not found.</Text>
      </View>
    );
  }

  return (
    <View style={s.root}>

      {/* ── Top Bar ──────────────────────────────────────────── */}
      <LinearGradient colors={category.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.topBar}>
        {/* Background image overlay inside gradient header */}
        <Image
          source={{ uri: getCategoryImage(category.id) }}
          style={s.headerBgImage}
          resizeMode="cover"
        />
        <View style={s.headerImageOverlay} />
        <View style={s.topBarInner}>
          <Pressable onPress={() => navigation.goBack()} style={s.backBtn}>
            <Ionicons name="arrow-back" size={22} color="white" />
          </Pressable>
          <Text style={s.topBarTitle}>{category.name}</Text>
          <View style={s.topBarRight}>
            <Pressable style={s.iconBtn}>
              <Ionicons name="heart-outline" size={20} color="white" />
            </Pressable>
            <Pressable style={s.iconBtn}>
              <Ionicons name="share-outline" size={20} color="white" />
            </Pressable>
          </View>
        </View>
        {/* Hero section inside gradient */}
        <View style={s.heroContent}>
          <View style={s.heroIconBig}>
            <Ionicons name={category.icon as any} size={40} color="white" />
          </View>
          <Text style={s.heroTitle}>{category.name}</Text>
          <Text style={s.heroTagline}>{category.tagline}</Text>
          <View style={s.heroBadgeRow}>
            <View style={s.heroBadge}>
              <Text style={s.heroBadgeText}>{category.subServices.length} services available</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* ── Trust badges ─────────────────────────────────── */}
        <Animated.View entering={FadeInDown.duration(350)} style={s.trustRow}>
          {TRUST_BADGES.map((t) => (
            <View key={t.label} style={s.trustBadge}>
              <Ionicons name={t.icon} size={15} color={category.accent} />
              <Text style={[s.trustText, { color: category.accent }]}>{t.label}</Text>
            </View>
          ))}
        </Animated.View>

        {/* ── Sub-service cards ─────────────────────────────── */}
        <Text style={s.sectionTitle}>Choose a Service</Text>
        {category.subServices.map((sub, i) => (
          <Animated.View
            key={sub.id}
            entering={FadeInDown.delay(i * 60).duration(380).springify()}
          >
            <Pressable
              onPress={() =>
                navigation.navigate("ServiceDetail", {
                  categoryId: category.id,
                  subServiceId: sub.id,
                })
              }
              style={({ pressed }) => [s.subCard, { opacity: pressed ? 0.88 : 1 }]}
            >
              {/* Accent left bar */}
              <View style={[s.accentBar, { backgroundColor: category.accent }]} />

              <View style={s.subCardBody}>
                <View style={s.subCardTop}>
                  <View style={s.subCardTitleRow}>
                    <Text style={s.subName}>{sub.name}</Text>
                    {sub.popular && (
                      <View style={[s.popularBadge, { backgroundColor: category.accent + "22", borderColor: category.accent + "55" }]}>
                        <Ionicons name="star" size={10} color={category.accent} />
                        <Text style={[s.popularText, { color: category.accent }]}>Popular</Text>
                      </View>
                    )}
                  </View>
                  <Text style={s.subDesc}>{sub.description}</Text>
                </View>

                <View style={s.subCardBottom}>
                  <View style={s.subMeta}>
                    <View style={s.metaItem}>
                      <Ionicons name="time-outline" size={13} color={colors.text.muted} />
                      <Text style={s.metaText}>{sub.duration}</Text>
                    </View>
                  </View>
                  <View style={s.subPriceRow}>
                    <Text style={[s.subPrice, { color: category.accent }]}>{sub.price}</Text>
                    <View style={[s.bookMiniBtn, { backgroundColor: category.accent + "22", borderColor: category.accent + "44" }]}>
                      <Text style={[s.bookMiniText, { color: category.accent }]}>Book</Text>
                      <Ionicons name="arrow-forward" size={13} color={category.accent} />
                    </View>
                  </View>
                </View>
              </View>
            </Pressable>
          </Animated.View>
        ))}

        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#081826" },

  // Top bar + hero (inside gradient)
  topBar: { paddingBottom: 28, overflow: "hidden" },
  headerBgImage: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    width: "100%", height: "100%",
    opacity: 0.25,
  },
  headerImageOverlay: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  topBarInner: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 16, paddingTop: 52, paddingBottom: 16,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.25)", justifyContent: "center", alignItems: "center",
  },
  topBarTitle: { fontSize: 18, fontWeight: "700", color: "white" },
  topBarRight: { flexDirection: "row", gap: 8 },
  iconBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.25)", justifyContent: "center", alignItems: "center",
  },
  heroContent: { paddingHorizontal: 20, alignItems: "center", paddingBottom: 4 },
  heroIconBig: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center", alignItems: "center",
    marginBottom: 14,
    borderWidth: 2, borderColor: "rgba(255,255,255,0.3)",
  },
  heroTitle: { fontSize: 26, fontWeight: "700", color: "white", textAlign: "center" },
  heroTagline: { fontSize: 14, color: "rgba(255,255,255,0.8)", marginTop: 6, textAlign: "center" },
  heroBadgeRow: { flexDirection: "row", marginTop: 14, gap: 8 },
  heroBadge: {
    backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 6,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.25)",
  },
  heroBadgeText: { fontSize: 12, fontWeight: "600", color: "white" },

  scroll: { paddingHorizontal: 16, paddingTop: 16 },

  // Trust row
  trustRow: {
    flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 20,
  },
  trustBadge: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.1)",
  },
  trustText: { fontSize: 11, fontWeight: "600" },

  sectionTitle: {
    fontSize: 18, fontWeight: "700", color: "white", marginBottom: 12,
  },

  // Sub-service card
  subCard: {
    backgroundColor: colors.surface.container,
    borderRadius: 20, marginBottom: 12,
    borderWidth: 1, borderColor: colors.glass.border,
    flexDirection: "row", overflow: "hidden",
  },
  accentBar: { width: 4 },
  subCardBody: { flex: 1, padding: 16 },
  subCardTop: { marginBottom: 12 },
  subCardTitleRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  subName: { fontSize: 15, fontWeight: "700", color: colors.text.primary, flex: 1 },
  popularBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 10, borderWidth: 1,
  },
  popularText: { fontSize: 10, fontWeight: "700" },
  subDesc: { fontSize: 13, color: colors.text.secondary, lineHeight: 18 },
  subCardBottom: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
  },
  subMeta: { flexDirection: "row", gap: 12 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: 12, color: colors.text.muted },
  subPriceRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  subPrice: { fontSize: 17, fontWeight: "700" },
  bookMiniBtn: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 14, borderWidth: 1,
  },
  bookMiniText: { fontSize: 12, fontWeight: "700" },
});
