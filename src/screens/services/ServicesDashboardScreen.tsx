import React, { useEffect, useState, useMemo } from "react";
import {
  ScrollView, Text, View, Pressable, StyleSheet,
  TextInput, Dimensions, Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withTiming,
  FadeInDown, SlideInLeft, Easing,
} from "react-native-reanimated";
import { RootStackParamList } from "@/navigation/types";
import { colors } from "@/theme/colors";
import { SERVICE_CATEGORIES } from "./servicesData";
import { getCategoryImage } from "@/assets/serviceImages";

type Props = NativeStackScreenProps<RootStackParamList, "ServicesDashboard">;

const { width: W } = Dimensions.get("window");
// 2 cards per row with gap
const CARD_W = (W - 32 - 12) / 2;

// Top 4 services shown by default
const TOP_4_IDS = ["cleaning", "ro", "pest", "pet"];

const QUICK_ACTIONS = [
  { label: "My Bookings", icon: "calendar-outline" as const, color: "#3b82f6", route: "MyBookings" as const },
  { label: "Track",       icon: "location-outline" as const, color: "#10b981", route: "LiveTracking" as const },
  { label: "Offers",      icon: "pricetag-outline" as const, color: "#f59e0b", route: "Offers" as const },
  { label: "Emergency",   icon: "alert-circle-outline" as const, color: "#ef4444", route: "EmergencyAssistance" as const },
];

const SERVICE_NAV = [
  { icon: "home-outline" as const,      route: "HomeDashboard" as const,   label: "Home" },
  { icon: "construct-outline" as const, route: "ServicesDashboard" as const, label: "Services" },
  { icon: "calendar-outline" as const,  route: "MyBookings" as const,      label: "Bookings" },
  { icon: "pricetag-outline" as const,  route: "Offers" as const,          label: "Offers" },
  { icon: "person-outline" as const,    route: "Profile" as const,         label: "Profile" },
];

export default function ServicesDashboardScreen({ navigation }: Props) {
  const [showAll, setShowAll] = useState(false);
  const [searchText, setSearchText] = useState("");

  const headerOp = useSharedValue(0);
  const headerY  = useSharedValue(-24);
  useEffect(() => {
    headerOp.value = withTiming(1, { duration: 450, easing: Easing.out(Easing.cubic) });
    headerY.value  = withSpring(0, { damping: 18, stiffness: 200 });
  }, []);
  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOp.value,
    transform: [{ translateY: headerY.value }],
  }));

  // Search filter across all 10 categories + their sub-services
  const searchResults = useMemo(() => {
    if (!searchText.trim()) return [];
    const q = searchText.toLowerCase();
    const results: { catId: string; catName: string; subId: string; subName: string; price: string }[] = [];
    SERVICE_CATEGORIES.forEach((cat) => {
      if (cat.name.toLowerCase().includes(q)) {
        // Add the category itself as a result
        cat.subServices.slice(0, 2).forEach((sub) => {
          results.push({ catId: cat.id, catName: cat.name, subId: sub.id, subName: sub.name, price: sub.price });
        });
      }
      cat.subServices.forEach((sub) => {
        if (sub.name.toLowerCase().includes(q)) {
          results.push({ catId: cat.id, catName: cat.name, subId: sub.id, subName: sub.name, price: sub.price });
        }
      });
    });
    // Deduplicate by subId
    return results.filter((r, i, arr) => arr.findIndex(x => x.subId === r.subId) === i).slice(0, 8);
  }, [searchText]);

  const isSearching = searchText.trim().length > 0;

  // Categories to show: top 4 by default, all if showAll or searching
  const top4 = SERVICE_CATEGORIES.filter((c) => TOP_4_IDS.includes(c.id));
  const rest = SERVICE_CATEGORIES.filter((c) => !TOP_4_IDS.includes(c.id));
  const displayedCategories = isSearching ? SERVICE_CATEGORIES : showAll ? SERVICE_CATEGORIES : top4;

  return (
    <View style={s.root}>
      {/* ── Header ─────────────────────────────────────────── */}
      <Animated.View style={[s.header, headerStyle]}>
        <View>
          <Text style={s.greeting}>Good Morning 👋</Text>
          <Text style={s.greetingSub}>What do you need today?</Text>
        </View>
        <View style={s.headerRight}>
          <Pressable style={s.iconBtn} onPress={() => navigation.navigate("Notifications")}>
            <Ionicons name="notifications-outline" size={20} color="white" />
            <View style={s.notifDot} />
          </Pressable>
          <Pressable style={s.avatarCircle} onPress={() => navigation.navigate("Profile")}>
            <Ionicons name="person" size={16} color="white" />
          </Pressable>
        </View>
      </Animated.View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* ── Search bar ─────────────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(80).duration(380).springify()} style={s.searchWrap}>
          <Ionicons name="search-outline" size={18} color="rgba(255,255,255,0.45)" style={s.searchIcon} />
          <TextInput
            style={s.searchInput}
            placeholder="Search cleaning, RO, pest control…"
            placeholderTextColor="rgba(255,255,255,0.35)"
            value={searchText}
            onChangeText={setSearchText}
            returnKeyType="search"
          />
          {searchText.length > 0 && (
            <Pressable onPress={() => setSearchText("")}>
              <Ionicons name="close-circle" size={18} color="rgba(255,255,255,0.4)" />
            </Pressable>
          )}
        </Animated.View>

        {/* ── Search Results ──────────────────────────────────── */}
        {isSearching && (
          <Animated.View entering={FadeInDown.duration(250)} style={s.searchResultsBox}>
            {searchResults.length === 0 ? (
              <View style={s.noResults}>
                <Ionicons name="search-outline" size={28} color="rgba(255,255,255,0.2)" />
                <Text style={s.noResultsText}>No services found for "{searchText}"</Text>
              </View>
            ) : (
              searchResults.map((r, i) => (
                <Pressable
                  key={r.subId}
                  onPress={() => navigation.navigate("ServiceDetail", { categoryId: r.catId, subServiceId: r.subId })}
                  style={[s.searchResultRow, i < searchResults.length - 1 && s.searchResultBorder]}
                >
                  <View style={s.searchResultIcon}>
                    <Ionicons
                      name={(SERVICE_CATEGORIES.find(c => c.id === r.catId)?.icon ?? "construct") as any}
                      size={18}
                      color="#00bcd4"
                    />
                  </View>
                  <View style={s.searchResultInfo}>
                    <Text style={s.searchResultName}>{r.subName}</Text>
                    <Text style={s.searchResultCat}>{r.catName}</Text>
                  </View>
                  <Text style={s.searchResultPrice}>{r.price}</Text>
                  <Ionicons name="arrow-forward" size={14} color="rgba(255,255,255,0.3)" />
                </Pressable>
              ))
            )}
          </Animated.View>
        )}

        {/* ── Hero Banner ─────────────────────────────────────── */}
        {!isSearching && (
          <Animated.View entering={FadeInDown.delay(130).duration(420).springify()}>
            <LinearGradient
              colors={["#2563eb", "#60a5fa"]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={s.hero}
            >
              <View style={s.heroBlob1} />
              <View style={s.heroBlob2} />
              <View style={s.heroBadge}><Text style={s.heroBadgeText}>PREMIUM CARE</Text></View>
              <Text style={s.heroTitle}>Everything Your Home Needs</Text>
              <Text style={s.heroSub}>Expert professionals at your doorstep in 60 minutes.</Text>
              <View style={s.heroButtons}>
                <Pressable
                  style={s.heroBookBtn}
                  onPress={() => setShowAll(true)}
                >
                  <Text style={s.heroBookText}>Book Service</Text>
                </Pressable>
                <Pressable
                  style={s.heroExploreBtn}
                  onPress={() => navigation.navigate("Offers")}
                >
                  <Text style={s.heroExploreText}>View Offers</Text>
                </Pressable>
              </View>
            </LinearGradient>
          </Animated.View>
        )}

        {/* ── Quick Actions ───────────────────────────────────── */}
        {!isSearching && (
          <Animated.View entering={SlideInLeft.delay(180).duration(380).springify()} style={s.quickRow}>
            {QUICK_ACTIONS.map((q) => (
              <Pressable
                key={q.label}
                style={s.quickCard}
                onPress={() => navigation.navigate(q.route as any)}
              >
                <View style={[s.quickIcon, { backgroundColor: q.color + "22" }]}>
                  <Ionicons name={q.icon} size={22} color={q.color} />
                </View>
                <Text style={s.quickLabel}>{q.label}</Text>
              </Pressable>
            ))}
          </Animated.View>
        )}

        {/* ── Services Grid (2 per row) ─────────────────────── */}
        <View style={s.sectionHeaderRow}>
          <Text style={s.sectionTitle}>
            {isSearching ? "Search Results" : showAll ? "All Services" : "Popular Services"}
          </Text>
          {!isSearching && !showAll && (
            <Pressable onPress={() => setShowAll(true)} style={s.seeMoreBtn}>
              <Text style={s.seeMoreText}>See All</Text>
              <Ionicons name="arrow-forward" size={14} color="#00bcd4" />
            </Pressable>
          )}
          {!isSearching && showAll && (
            <Pressable onPress={() => setShowAll(false)} style={s.seeMoreBtn}>
              <Text style={s.seeMoreText}>Show Less</Text>
              <Ionicons name="chevron-up" size={14} color="#00bcd4" />
            </Pressable>
          )}
        </View>

        {/* 2-column grid */}
        <View style={s.categoryGrid}>
          {displayedCategories.map((cat, i) => (
            <Animated.View
              key={cat.id}
              entering={FadeInDown.delay(240 + i * 50).duration(350).springify()}
              style={s.categoryOuter}
            >
              <Pressable
                onPress={() => navigation.navigate("ServiceCategory", { categoryId: cat.id })}
                style={({ pressed }) => [s.categoryCard, { opacity: pressed ? 0.88 : 1 }]}
              >
                <LinearGradient
                  colors={cat.gradient}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={s.categoryGradient}
                >
                  {/* Background image */}
                  <Image
                    source={{ uri: getCategoryImage(cat.id) }}
                    style={s.catBgImage}
                    resizeMode="cover"
                  />
                  {/* Gradient overlay so text is readable */}
                  <LinearGradient
                    colors={[cat.gradient[0] + "ee", cat.gradient[1] + "aa"]}
                    style={s.catOverlay}
                  />

                  {/* Icon */}
                  <View style={s.catIconWrap}>
                    <Ionicons name={cat.icon as any} size={28} color="white" />
                  </View>

                  {/* Name + tagline */}
                  <Text style={s.catName}>{cat.name}</Text>
                  <Text style={s.catTagline} numberOfLines={1}>{cat.tagline}</Text>

                  {/* Service count pill */}
                  <View style={s.catCountPill}>
                    <Text style={s.catCountText}>{cat.subServices.length} services</Text>
                  </View>
                </LinearGradient>
              </Pressable>
            </Animated.View>
          ))}
        </View>

        {/* Show More hint row (when collapsed) */}
        {!isSearching && !showAll && (
          <Animated.View entering={FadeInDown.delay(500).duration(300)}>
            <Pressable onPress={() => setShowAll(true)} style={s.showMoreRow}>
              <Text style={s.showMoreText}>+{rest.length} more services</Text>
              <Ionicons name="chevron-down" size={16} color="#00bcd4" />
            </Pressable>
          </Animated.View>
        )}

        {/* ── Trust strip ─────────────────────────────────────── */}
        {!isSearching && (
          <Animated.View entering={FadeInDown.delay(600).duration(380).springify()} style={s.trustStrip}>
            {[
              { icon: "shield-checkmark-outline" as const, label: "Verified Pros" },
              { icon: "flash-outline" as const,            label: "Same-Day Fix" },
              { icon: "thumbs-up-outline" as const,        label: "100% Guarantee" },
              { icon: "ribbon-outline" as const,           label: "30-Day Warranty" },
            ].map((t) => (
              <View key={t.label} style={s.trustItem}>
                <View style={s.trustIconWrap}>
                  <Ionicons name={t.icon} size={18} color="#00bcd4" />
                </View>
                <Text style={s.trustLabel}>{t.label}</Text>
              </View>
            ))}
          </Animated.View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ── Bottom Nav ──────────────────────────────────────────── */}
      <View style={s.navBar}>
        {SERVICE_NAV.map((n, i) => {
          const isActive = i === 1; // Services tab
          return (
            <Pressable
              key={n.label}
              onPress={() => navigation.navigate(n.route as any)}
              style={s.navBtn}
            >
              <Ionicons
                name={n.icon}
                size={22}
                color={isActive ? "#00bcd4" : colors.text.secondary}
              />
              <Text style={[s.navLabel, isActive && s.navLabelActive]}>{n.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#081826" },

  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start",
    paddingHorizontal: 16, paddingTop: 52, paddingBottom: 12,
  },
  greeting: { fontSize: 22, fontWeight: "700", color: "white" },
  greetingSub: { fontSize: 13, color: "rgba(255,255,255,0.55)", marginTop: 3 },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 10, paddingTop: 4 },
  iconBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.12)",
    justifyContent: "center", alignItems: "center",
  },
  notifDot: {
    position: "absolute", top: 9, right: 9,
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: "#ef4444",
    borderWidth: 1.5, borderColor: "#081826",
  },
  avatarCircle: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "rgba(37,99,235,0.4)",
    borderWidth: 2, borderColor: "#60a5fa",
    justifyContent: "center", alignItems: "center",
  },

  scroll: { paddingHorizontal: 16 },

  // Search
  searchWrap: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 14, marginBottom: 14, height: 50,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, color: "white", fontSize: 14 },

  // Search results dropdown
  searchResultsBox: {
    backgroundColor: "rgba(17,33,50,0.98)",
    borderRadius: 18, marginBottom: 14,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.1)",
    overflow: "hidden",
  },
  searchResultRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingHorizontal: 16, paddingVertical: 13,
  },
  searchResultBorder: { borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.06)" },
  searchResultIcon: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "rgba(0,188,212,0.12)",
    justifyContent: "center", alignItems: "center",
  },
  searchResultInfo: { flex: 1 },
  searchResultName: { fontSize: 14, fontWeight: "600", color: "white" },
  searchResultCat: { fontSize: 11, color: colors.text.secondary, marginTop: 2 },
  searchResultPrice: { fontSize: 13, fontWeight: "700", color: "#00bcd4" },
  noResults: { alignItems: "center", paddingVertical: 32, gap: 8 },
  noResultsText: { fontSize: 14, color: "rgba(255,255,255,0.3)" },

  // Hero
  hero: {
    borderRadius: 28, padding: 24, marginBottom: 18,
    minHeight: 190, overflow: "hidden",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.15)",
  },
  heroBlob1: {
    position: "absolute", top: -40, left: -40,
    width: 180, height: 180, borderRadius: 90,
    backgroundColor: "rgba(255,255,255,0.07)",
  },
  heroBlob2: {
    position: "absolute", bottom: -50, right: -30,
    width: 220, height: 220, borderRadius: 110,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  heroBadge: {
    backgroundColor: "rgba(255,255,255,0.18)", borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 4, alignSelf: "flex-start",
    marginBottom: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.25)",
  },
  heroBadgeText: { fontSize: 10, fontWeight: "800", color: "white", letterSpacing: 1.2 },
  heroTitle: { fontSize: 22, fontWeight: "700", color: "white", lineHeight: 30, marginBottom: 6 },
  heroSub: { fontSize: 13, color: "rgba(255,255,255,0.8)", lineHeight: 19, marginBottom: 18 },
  heroButtons: { flexDirection: "row", gap: 12 },
  heroBookBtn: {
    backgroundColor: "white", borderRadius: 20,
    paddingHorizontal: 20, paddingVertical: 10,
  },
  heroBookText: { fontSize: 13, fontWeight: "700", color: "#2563eb" },
  heroExploreBtn: {
    backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 20,
    paddingHorizontal: 20, paddingVertical: 10,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.25)",
  },
  heroExploreText: { fontSize: 13, fontWeight: "600", color: "white" },

  // Quick actions
  quickRow: { flexDirection: "row", gap: 10, marginBottom: 22 },
  quickCard: {
    flex: 1, alignItems: "center", justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 18,
    paddingVertical: 14, gap: 7,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
  },
  quickIcon: {
    width: 42, height: 42, borderRadius: 21,
    justifyContent: "center", alignItems: "center",
  },
  quickLabel: { fontSize: 10, fontWeight: "600", color: "rgba(255,255,255,0.75)", textAlign: "center" },

  sectionHeaderRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    marginBottom: 14,
  },
  sectionTitle: { fontSize: 20, fontWeight: "700", color: "white" },
  seeMoreBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  seeMoreText: { fontSize: 13, fontWeight: "600", color: "#00bcd4" },

  // 2-column category grid
  categoryGrid: {
    flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 14,
  },
  categoryOuter: { width: CARD_W },
  categoryCard: { width: CARD_W, height: 160, borderRadius: 20, overflow: "hidden" },
  categoryGradient: {
    flex: 1, padding: 14,
    justifyContent: "flex-start",
    position: "relative",
  },
  catBgImage: {
    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
    width: "100%", height: "100%",
    opacity: 0.35,
  },
  catOverlay: {
    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
  },
  catIconWrap: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center", alignItems: "center",
    marginBottom: 8,
    zIndex: 1,
  },
  catName: { fontSize: 14, fontWeight: "700", color: "white", zIndex: 1 },
  catTagline: { fontSize: 11, color: "rgba(255,255,255,0.7)", marginTop: 3, zIndex: 1 },
  catCountPill: {
    position: "absolute", bottom: 12, right: 12,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.2)",
  },
  catCountText: { fontSize: 10, color: "rgba(255,255,255,0.85)", fontWeight: "600" },

  // Show more row
  showMoreRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 6, paddingVertical: 12, marginBottom: 14,
    backgroundColor: "rgba(0,188,212,0.08)",
    borderRadius: 14, borderWidth: 1, borderColor: "rgba(0,188,212,0.2)",
  },
  showMoreText: { fontSize: 13, fontWeight: "700", color: "#00bcd4" },

  // Trust strip
  trustStrip: {
    flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 8,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 20, padding: 14,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.07)",
  },
  trustItem: { width: "45%", flexDirection: "row", alignItems: "center", gap: 10 },
  trustIconWrap: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: "rgba(0,188,212,0.12)",
    justifyContent: "center", alignItems: "center",
  },
  trustLabel: { fontSize: 11, fontWeight: "600", color: "rgba(255,255,255,0.7)" },

  // Bottom nav
  navBar: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    flexDirection: "row", height: 72,
    marginHorizontal: 12, marginBottom: 12,
    backgroundColor: "rgba(8,24,38,0.97)",
    borderRadius: 28, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)",
    elevation: 16, alignItems: "center",
  },
  navBtn: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 8 },
  navLabel: { fontSize: 10, color: colors.text.secondary, marginTop: 3, fontWeight: "500" },
  navLabelActive: { color: "#00bcd4", fontWeight: "700" },
});
