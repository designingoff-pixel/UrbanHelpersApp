/**
 * ServiceCategoryScreen
 * Reusable screen for any of the service categories.
 * Shows sub-services as scrollable cards with price, duration, description.
 * Tapping any sub-service navigates to ServiceDetailScreen with exact pricing.
 */
import React from "react";
import {
  ScrollView, Text, View, Pressable, StyleSheet, Dimensions, Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import Animated, { FadeInDown } from "react-native-reanimated";
import { RootStackParamList } from "@/navigation/types";
import { colors } from "@/theme/colors";
import { useServiceCategories } from "@/services/firestoreServices";
import { getSubServiceImageSource } from "@/assets/serviceImages";

type Props = NativeStackScreenProps<RootStackParamList, "ServiceCategory">;

function formatPrice(price: string): string {
  if (!price) return "₹299";
  if (price.startsWith("₹") || price.toLowerCase().includes("quote")) return price;
  return `₹${price}`;
}

export default function ServiceCategoryScreen({ navigation, route }: Props) {
  const { categoryId } = route.params;
  const { categories } = useServiceCategories();
  const category = categories.find((c) => c.id === categoryId);

  if (!category) {
    return (
      <View style={s.root}>
        <Text style={{ color: "white", padding: 24 }}>Category not found.</Text>
      </View>
    );
  }

  return (
    <View style={s.root}>
      {/* ── Sleek Clean Hero Top Bar ────────────────────────────── */}
      <LinearGradient
        colors={category.gradient || ["#0891b2", "#06b6d4"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={s.topBar}
      >
        {/* Subtle decorative glow circles */}
        <View style={s.heroGlowTL} />
        <View style={s.heroGlowBR} />

        {/* Top navigation row */}
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

        {/* Hero section */}
        <View style={s.heroContent}>
          <View style={s.heroIconBig}>
            <Ionicons name={category.icon as any} size={38} color="white" />
          </View>
          <Text style={s.heroTitle}>{category.name}</Text>
          <Text style={s.heroTagline}>{category.tagline}</Text>
          <View style={s.heroBadgeRow}>
            <View style={s.heroBadge}>
              <Ionicons name="sparkles" size={13} color="white" style={{ marginRight: 6 }} />
              <Text style={s.heroBadgeText}>{category.subServices.length} services available</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {/* ── Sub-service cards ─────────────────────────────── */}
        <Text style={s.sectionTitle}>Choose a Service</Text>
        {category.subServices.map((sub, i) => {
          const displayPrice = formatPrice(sub.price);
          return (
            <Animated.View
              key={sub.id}
              entering={FadeInDown.delay(i * 50).duration(350).springify()}
            >
              <Pressable
                onPress={() =>
                  navigation.navigate("ServiceDetail", {
                    categoryId: category.id,
                    subServiceId: sub.id,
                  })
                }
                style={({ pressed }) => [s.subCard, { opacity: pressed ? 0.9 : 1 }]}
              >
                {/* Sub-service image thumbnail */}
                <Image
                  source={getSubServiceImageSource(sub.id, category.id, sub.imageUrl)}
                  style={s.subCardImage}
                  resizeMode="cover"
                />
                {/* Accent left bar */}
                <View style={[s.accentBar, { backgroundColor: category.accent }]} />

                <View style={s.subCardBody}>
                  <View style={s.subCardTop}>
                    <View style={s.subCardTitleRow}>
                      <Text style={s.subName}>{sub.name}</Text>
                      {sub.popular && (
                        <View
                          style={[
                            s.popularBadge,
                            {
                              backgroundColor: category.accent + "22",
                              borderColor: category.accent + "55",
                            },
                          ]}
                        >
                          <Ionicons name="star" size={10} color={category.accent} />
                          <Text style={[s.popularText, { color: category.accent }]}>Popular</Text>
                        </View>
                      )}
                    </View>
                    <Text style={s.subDesc} numberOfLines={2}>
                      {sub.description}
                    </Text>
                  </View>

                  <View style={s.subCardBottom}>
                    <View style={s.subMeta}>
                      <View style={s.metaItem}>
                        <Ionicons name="time-outline" size={13} color={colors.text.muted} />
                        <Text style={s.metaText}>{sub.duration}</Text>
                      </View>
                    </View>
                    <View style={s.subPriceRow}>
                      <Text style={[s.subPrice, { color: category.accent }]}>
                        {displayPrice}
                      </Text>
                      <View
                        style={[
                          s.bookMiniBtn,
                          {
                            backgroundColor: category.accent + "25",
                            borderColor: category.accent + "55",
                          },
                        ]}
                      >
                        <Text style={[s.bookMiniText, { color: category.accent }]}>Book</Text>
                        <Ionicons name="arrow-forward" size={13} color={category.accent} />
                      </View>
                    </View>
                  </View>
                </View>
              </Pressable>
            </Animated.View>
          );
        })}

        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#081826" },

  // Clean Header without clashing background text
  topBar: {
    paddingBottom: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: "hidden",
  },
  heroGlowTL: {
    position: "absolute",
    top: -50,
    left: -50,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  heroGlowBR: {
    position: "absolute",
    bottom: -60,
    right: -40,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(0,0,0,0.15)",
  },
  topBarInner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 52,
    paddingBottom: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.25)",
    justifyContent: "center",
    alignItems: "center",
  },
  topBarTitle: { fontSize: 18, fontWeight: "700", color: "white" },
  topBarRight: { flexDirection: "row", gap: 8 },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.25)",
    justifyContent: "center",
    alignItems: "center",
  },
  heroContent: { paddingHorizontal: 20, alignItems: "center", paddingTop: 4 },
  heroIconBig: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.35)",
  },
  heroTitle: { fontSize: 26, fontWeight: "800", color: "white", textAlign: "center" },
  heroTagline: { fontSize: 14, color: "rgba(255,255,255,0.88)", marginTop: 4, textAlign: "center" },
  heroBadgeRow: { flexDirection: "row", marginTop: 12, gap: 8 },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.2)",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  heroBadgeText: { fontSize: 12, fontWeight: "700", color: "white" },

  scroll: { paddingHorizontal: 16, paddingTop: 20 },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "white",
    marginBottom: 14,
    letterSpacing: 0.3,
  },

  // Sub-service card
  subCard: {
    backgroundColor: colors.surface.container,
    borderRadius: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.glass.border,
    flexDirection: "row",
    overflow: "hidden",
  },
  subCardImage: {
    width: 90,
    height: "100%" as any,
    opacity: 0.9,
  },
  accentBar: { width: 4 },
  subCardBody: { flex: 1, padding: 14 },
  subCardTop: { marginBottom: 10 },
  subCardTitleRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  subName: { fontSize: 15, fontWeight: "700", color: colors.text.primary, flex: 1 },
  popularBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
  },
  popularText: { fontSize: 10, fontWeight: "700" },
  subDesc: { fontSize: 12, color: colors.text.secondary, lineHeight: 17 },
  subCardBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  subMeta: { flexDirection: "row", gap: 12 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: 12, color: colors.text.muted },
  subPriceRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  subPrice: { fontSize: 18, fontWeight: "800" },
  bookMiniBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
  },
  bookMiniText: { fontSize: 12, fontWeight: "700" },
});
