import React, { useState, useMemo } from "react";
import {
  ScrollView,
  Text,
  View,
  Pressable,
  StyleSheet,
  Dimensions,
  Image,
  TextInput,
  TouchableOpacity,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/types";
import { useServiceCategories } from "@/services/firestoreServices";
import { useTheme } from "@/context/ThemeContext";
import { SERVICE_CATEGORIES, SubService } from "./servicesData";
import { getSubServiceImageSource } from "@/assets/serviceImages";

type Props = NativeStackScreenProps<RootStackParamList, "ServiceCategory">;
const { width } = Dimensions.get("window");

const SUB_FILTERS = [
  { id: "all", label: "All", icon: "home" },
  { id: "bathroom", label: "Bathroom", icon: "water" },
  { id: "kitchen", label: "Kitchen", icon: "restaurant" },
  { id: "windows", label: "Windows", icon: "grid" },
  { id: "deep", label: "Deep Clean", icon: "sparkles" },
];

export default function ServiceCategoryScreen({ navigation, route }: Props) {
  const { categoryId } = route.params;
  const { categories } = useServiceCategories();
  const { isDark, colors } = useTheme();

  const staticCategory = SERVICE_CATEGORIES.find((c) => c.id === categoryId);
  const firestoreCategory = categories.find((c) => c.id === categoryId);

  const category = useMemo(() => {
    if (!staticCategory && !firestoreCategory) return undefined;
    if (!firestoreCategory) return staticCategory;
    if (!staticCategory) return firestoreCategory;

    const existingIds = new Set((firestoreCategory.subServices ?? []).map((s) => s.id));
    const mergedSubServices = [
      ...(firestoreCategory.subServices ?? []),
      ...staticCategory.subServices.filter((s) => !existingIds.has(s.id)),
    ];

    return {
      ...staticCategory,
      ...firestoreCategory,
      subServices: mergedSubServices,
    };
  }, [staticCategory, firestoreCategory]);

  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const subServices = useMemo(() => {
    if (!category) return [];
    let list = category.subServices || [];

    // Filter by query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (s) => s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q)
      );
    }

    // Filter by sub-category pill
    if (activeFilter === "bathroom") {
      list = list.filter((s) =>
        s.id.includes("restroom") || s.name.toLowerCase().includes("bathroom") || s.name.toLowerCase().includes("toilet")
      );
    } else if (activeFilter === "kitchen") {
      list = list.filter((s) =>
        s.id.includes("kitchen") || s.name.toLowerCase().includes("kitchen")
      );
    } else if (activeFilter === "windows") {
      list = list.filter((s) =>
        s.id.includes("window") || s.name.toLowerCase().includes("window") || s.name.toLowerCase().includes("glass")
      );
    } else if (activeFilter === "deep") {
      list = list.filter((s) =>
        s.id.includes("full") || s.id.includes("tank") || s.id.includes("disinfect") || s.name.toLowerCase().includes("deep")
      );
    }

    return list;
  }, [category, searchQuery, activeFilter]);

  if (!category) {
    return (
      <View style={[styles.root, { backgroundColor: isDark ? "#081826" : "#F4F6F9" }]}>
        <Text style={{ color: isDark ? "#fff" : "#000", padding: 24 }}>Category not found.</Text>
      </View>
    );
  }

  const bgStyle = { backgroundColor: isDark ? "#081826" : "#F4F6F9" };
  const cardBgStyle = {
    backgroundColor: isDark ? "#0D2135" : "#FFFFFF",
    borderColor: isDark ? "rgba(0,188,212,0.18)" : "#E2E8F0",
  };
  const textPrimary = { color: isDark ? "#FFFFFF" : "#0F172A" };
  const textSecondary = { color: isDark ? "#94A3B8" : "#64748B" };

  return (
    <View style={[styles.root, bgStyle]}>
      {/* ── Top Header Bar ────────────────────────────────────────────── */}
      <SafeAreaView edges={["top"]} style={[styles.headerSafeArea, { backgroundColor: isDark ? "#081826" : "#0F766E" }]}>
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerIconBtn}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{category.name}</Text>
          <View style={styles.headerRightActions}>
            <TouchableOpacity
              onPress={() => setShowSearch(!showSearch)}
              style={styles.headerRoundBtn}
            >
              <Ionicons name="search" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {showSearch && (
          <View style={styles.searchBarWrap}>
            <Ionicons name="search" size={18} color="#94A3B8" style={{ marginRight: 8 }} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search in this category..."
              placeholderTextColor="#94A3B8"
              style={styles.searchInput}
              autoFocus
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons name="close-circle" size={18} color="#94A3B8" />
              </TouchableOpacity>
            ) : null}
          </View>
        )}
      </SafeAreaView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── Hero Banner Card (Cleanly Framed & Centered) ────────────── */}
        <View style={styles.heroBannerCard}>
          <Image
            source={require("../../../assets/category_banner_cleaning.png")}
            style={styles.heroBannerImg}
            resizeMode="cover"
          />
        </View>

        {/* ── Horizontal Filter Pills ──────────────────────────────────── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pillsRow}
        >
          {SUB_FILTERS.map((f) => {
            const isActive = activeFilter === f.id;
            return (
              <TouchableOpacity
                key={f.id}
                onPress={() => setActiveFilter(f.id)}
                style={[
                  styles.pillBtn,
                  {
                    backgroundColor: isActive
                      ? "#0F766E"
                      : isDark
                      ? "#0D2135"
                      : "#FFFFFF",
                    borderColor: isActive
                      ? "#0F766E"
                      : isDark
                      ? "rgba(255,255,255,0.1)"
                      : "#E2E8F0",
                  },
                ]}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={f.icon as any}
                  size={16}
                  color={isActive ? "#FFFFFF" : isDark ? "#00BCD4" : "#0F766E"}
                  style={{ marginRight: 6 }}
                />
                <Text
                  style={[
                    styles.pillText,
                    {
                      color: isActive
                        ? "#FFFFFF"
                        : isDark
                        ? "#00BCD4"
                        : "#0F766E",
                    },
                  ]}
                >
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ── Sub-Services List (Spacious & No Overlapping Text) ───────── */}
        <View style={styles.cardsContainer}>
          {subServices.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Ionicons name="search-outline" size={40} color="#94A3B8" />
              <Text style={[styles.emptyTitle, textPrimary]}>No services found</Text>
              <Text style={[styles.emptySub, textSecondary]}>Try clearing search or choosing "All".</Text>
            </View>
          ) : (
            subServices.map((sub: SubService) => {
              const imgSource = getSubServiceImageSource(sub.id, category.id, sub.imageUrl);
              const origPriceNum = parseInt(sub.price.replace(/[^\d]/g, ""), 10) || 499;
              const slashedPrice = `₹${origPriceNum + 200}`;

              return (
                <TouchableOpacity
                  key={sub.id}
                  style={[styles.serviceCard, cardBgStyle]}
                  activeOpacity={0.88}
                  onPress={() =>
                    navigation.navigate("ServiceDetail", {
                      categoryId: category.id,
                      subServiceId: sub.id,
                    })
                  }
                >
                  {/* Top Section: Image + Details */}
                  <View style={styles.cardTopRow}>
                    <View style={styles.cardImgWrap}>
                      <Image
                        source={imgSource}
                        style={styles.cardImg}
                        resizeMode="cover"
                      />
                      <View style={styles.popularBadge}>
                        <Ionicons name="star" size={9} color="#92400E" />
                        <Text style={styles.popularBadgeText}>4.8</Text>
                      </View>
                    </View>

                    <View style={styles.cardDetails}>
                      <Text style={[styles.cardTitle, textPrimary]} numberOfLines={2}>
                        {sub.name}
                      </Text>
                      <Text style={[styles.cardDesc, textSecondary]} numberOfLines={2}>
                        {sub.description}
                      </Text>
                      <View style={styles.cardMetaRow}>
                        <View style={styles.metaItem}>
                          <Ionicons name="time-outline" size={13} color={textSecondary.color} />
                          <Text style={[styles.metaText, textSecondary]}>{sub.duration}</Text>
                        </View>
                        <View style={styles.metaItem}>
                          <Ionicons name="shield-checkmark-outline" size={13} color="#059669" />
                          <Text style={[styles.metaText, { color: "#059669" }]}>Verified</Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  {/* Bottom Divider & Action Row */}
                  <View style={[styles.cardBottomRow, { borderTopColor: isDark ? "rgba(255,255,255,0.06)" : "#F1F5F9" }]}>
                    <View style={styles.priceRow}>
                      <Text style={[styles.priceMain, { color: isDark ? "#00BCD4" : "#0F766E" }]}>{sub.price}</Text>
                      <Text style={styles.priceSlashed}>{slashedPrice}</Text>
                    </View>

                    <TouchableOpacity
                      style={styles.bookNowBtn}
                      onPress={() =>
                        navigation.navigate("ServiceDetail", {
                          categoryId: category.id,
                          subServiceId: sub.id,
                        })
                      }
                    >
                      <Text style={styles.bookNowText}>Book Now</Text>
                      <Ionicons name="arrow-forward" size={13} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* ── Included Benefits Guarantee Card ────────────────────────── */}
        <View style={[styles.guaranteeCard, { backgroundColor: isDark ? "#0A1F30" : "#F0FDF4", borderColor: isDark ? "rgba(0,188,212,0.2)" : "#BBF7D0" }]}>
          <View style={styles.guaranteeHeader}>
            <Ionicons name="shield-checkmark" size={20} color="#059669" />
            <Text style={[styles.guaranteeTitle, { color: isDark ? "#fff" : "#166534" }]}>Urban Helpers Guarantee</Text>
          </View>
          <View style={styles.benefitsRow}>
            <View style={styles.benefitItem}>
              <Ionicons name="checkmark-circle" size={14} color="#059669" />
              <Text style={[styles.benefitText, textSecondary]}>100% Verified Staff</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="checkmark-circle" size={14} color="#059669" />
              <Text style={[styles.benefitText, textSecondary]}>No Hidden Fees</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="checkmark-circle" size={14} color="#059669" />
              <Text style={[styles.benefitText, textSecondary]}>Re-service Policy</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  headerSafeArea: {
    paddingBottom: 4,
  },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 6 : 10,
    paddingBottom: 10,
  },
  headerIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  headerRightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerRoundBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  searchBarWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#0F172A",
  },
  scrollContent: {
    paddingBottom: 24,
  },

  // Hero Banner Card
  heroBannerCard: {
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 14,
    height: 140,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(0,188,212,0.25)",
    elevation: 3,
  },
  heroBannerImg: {
    width: "100%",
    height: "100%",
  },

  // Pills
  pillsRow: {
    paddingHorizontal: 16,
    gap: 8,
    paddingBottom: 14,
  },
  pillBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
  },
  pillText: {
    fontSize: 13,
    fontWeight: "700",
  },

  // Service Cards
  cardsContainer: {
    paddingHorizontal: 16,
    gap: 14,
  },
  serviceCard: {
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  cardImgWrap: {
    width: 82,
    height: 82,
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#E2E8F0",
  },
  cardImg: {
    width: "100%",
    height: "100%",
  },
  popularBadge: {
    position: "absolute",
    top: 4,
    left: 4,
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  popularBadgeText: {
    fontSize: 8.5,
    fontWeight: "800",
    color: "#92400E",
  },
  cardDetails: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 3,
  },
  cardDesc: {
    fontSize: 11.5,
    lineHeight: 16,
    marginBottom: 6,
  },
  cardMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  metaText: {
    fontSize: 11,
    fontWeight: "600",
  },

  // Bottom Row
  cardBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
  },
  priceMain: {
    fontSize: 17,
    fontWeight: "900",
  },
  priceSlashed: {
    fontSize: 12,
    color: "#94A3B8",
    textDecorationLine: "line-through",
  },
  bookNowBtn: {
    backgroundColor: "#0056D2",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    shadowColor: "#0056D2",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  bookNowText: {
    color: "#FFFFFF",
    fontSize: 12.5,
    fontWeight: "800",
  },

  // Guarantee Card
  guaranteeCard: {
    marginHorizontal: 16,
    marginTop: 18,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
  },
  guaranteeHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  guaranteeTitle: {
    fontSize: 14,
    fontWeight: "800",
  },
  benefitsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 6,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  benefitText: {
    fontSize: 11.5,
    fontWeight: "600",
  },

  // Empty
  emptyWrap: {
    alignItems: "center",
    paddingVertical: 36,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 8,
  },
  emptySub: {
    fontSize: 12,
    marginTop: 4,
  },
});
