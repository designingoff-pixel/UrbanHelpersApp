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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/types";
import { useServiceCategories } from "@/services/firestoreServices";
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
      <View style={styles.root}>
        <Text style={{ color: "white", padding: 24 }}>Category not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {/* ── Top Header Bar ────────────────────────────────────────────── */}
      <SafeAreaView edges={["top"]} style={styles.headerSafeArea}>
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
            <TouchableOpacity style={styles.headerRoundBtn}>
              <Ionicons name="options-outline" size={18} color="#FFFFFF" />
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
        {/* ── Hero Banner Card (Matching Design 1) ────────────────────── */}
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
                style={[styles.pillBtn, isActive && styles.pillBtnActive]}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={f.icon as any}
                  size={16}
                  color={isActive ? "#FFFFFF" : "#0F766E"}
                  style={{ marginRight: 6 }}
                />
                <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ── Sub-Services List ────────────────────────────────────────── */}
        <View style={styles.cardsContainer}>
          {subServices.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Ionicons name="search-outline" size={40} color="#94A3B8" />
              <Text style={styles.emptyTitle}>No services found</Text>
              <Text style={styles.emptySub}>Try clearing search or choosing "All".</Text>
            </View>
          ) : (
            subServices.map((sub: SubService) => {
              const imgSource = getSubServiceImageSource(sub.id, category.id, sub.imageUrl);
              const origPriceNum = parseInt(sub.price.replace(/[^\d]/g, ""), 10) || 499;
              const slashedPrice = `₹${origPriceNum + 200}`;

              return (
                <View key={sub.id} style={styles.serviceCard}>
                  {/* Left: Square Photo */}
                  <View style={styles.cardImgWrap}>
                    <Image source={imgSource} style={styles.cardImg} resizeMode="cover" />
                    {sub.popular && (
                      <View style={styles.popularBadge}>
                        <Ionicons name="star" size={10} color="#92400E" />
                        <Text style={styles.popularBadgeText}>Most Popular</Text>
                      </View>
                    )}
                  </View>

                  {/* Middle: Details */}
                  <View style={styles.cardDetails}>
                    <Text style={styles.cardTitle} numberOfLines={1}>
                      {sub.name}
                    </Text>
                    <Text style={styles.cardDesc} numberOfLines={2}>
                      {sub.description}
                    </Text>

                    <View style={styles.cardMetaRow}>
                      <View style={styles.metaItem}>
                        <Ionicons name="time-outline" size={13} color="#64748B" />
                        <Text style={styles.metaText}>{sub.duration}</Text>
                      </View>
                      <View style={styles.metaItem}>
                        <Ionicons name="star" size={13} color="#F59E0B" />
                        <Text style={styles.metaText}>4.8 (1.2k)</Text>
                      </View>
                    </View>

                    {/* Price Row */}
                    <View style={styles.priceRow}>
                      <Text style={styles.priceMain}>{sub.price}</Text>
                      <Text style={styles.priceSlashed}>{slashedPrice}</Text>
                    </View>
                  </View>

                  {/* Right: Book Now Button */}
                  <View style={styles.cardRightCol}>
                    <TouchableOpacity
                      style={styles.bookNowBtn}
                      onPress={() =>
                        navigation.navigate("ServiceDetail", {
                          categoryId: category.id,
                          subServiceId: sub.id,
                        })
                      }
                      activeOpacity={0.88}
                    >
                      <Text style={styles.bookNowText}>Book Now</Text>
                      <Ionicons name="arrow-forward" size={13} color="#FFFFFF" style={{ marginLeft: 3 }} />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F1F5F9",
  },
  headerSafeArea: {
    backgroundColor: "#0B2238",
  },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.3,
  },
  headerRightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerRoundBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(255, 255, 255, 0.14)",
    justifyContent: "center",
    alignItems: "center",
  },
  searchBarWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 14,
    height: 42,
  },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
    color: "#0F172A",
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroBannerCard: {
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 24,
    overflow: "hidden",
    height: 185,
    backgroundColor: "#FFFFFF",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  heroBannerImg: {
    width: "100%",
    height: "100%",
  },
  pillsRow: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 8,
  },
  pillBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  pillBtnActive: {
    backgroundColor: "#0F766E",
    borderColor: "#0F766E",
  },
  pillText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F766E",
  },
  pillTextActive: {
    color: "#FFFFFF",
  },
  cardsContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  serviceCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  cardImgWrap: {
    width: 92,
    height: 92,
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
    marginLeft: 12,
    marginRight: 6,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 2,
  },
  cardDesc: {
    fontSize: 11.5,
    color: "#64748B",
    lineHeight: 16,
    marginBottom: 6,
  },
  cardMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 4,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  metaText: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "600",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
  },
  priceMain: {
    fontSize: 16,
    fontWeight: "900",
    color: "#0F766E",
  },
  priceSlashed: {
    fontSize: 12,
    color: "#94A3B8",
    textDecorationLine: "line-through",
    fontWeight: "600",
  },
  cardRightCol: {
    justifyContent: "center",
    alignItems: "flex-end",
  },
  bookNowBtn: {
    backgroundColor: "#0F766E",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#0F766E",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  bookNowText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
  emptyWrap: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#334155",
    marginTop: 10,
  },
  emptySub: {
    fontSize: 13,
    color: "#94A3B8",
    marginTop: 4,
  },
});
