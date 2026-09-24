import React from "react";
import { ScrollView, Text, View, Pressable, StyleSheet, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import Animated, { FadeInDown } from "react-native-reanimated";
import { RootStackParamList } from "@/navigation/types";
import { colors } from "@/theme/colors";

type Props = NativeStackScreenProps<RootStackParamList, "Offers">;

const OFFERS = [
  {
    id: "off-1",
    title: "50% OFF on First Booking",
    description: "Use code WELCOME50. Valid for all new users on any service.",
    code: "WELCOME50",
    discount: "50% OFF",
    validTill: "Aug 31, 2026",
    categoryId: null,
    gradient: ["#7c3aed", "#a78bfa"] as [string, string],
    icon: "gift-outline",
  },
  {
    id: "off-2",
    title: "RO Service Special",
    description: "Get ₹100 off on Filter Change + Free TDS Checking.",
    code: "RO100",
    discount: "₹100 OFF",
    validTill: "Sep 15, 2026",
    categoryId: "ro",
    gradient: ["#0284c7", "#38bdf8"] as [string, string],
    icon: "water-outline",
  },
  {
    id: "off-3",
    title: "Home Cleaning Bundle",
    description: "Book Full Home Cleaning + Kitchen Cleaning at ₹2,299 (save ₹399).",
    code: "CLEAN2X",
    discount: "Save ₹399",
    validTill: "Sep 30, 2026",
    categoryId: "cleaning",
    gradient: ["#00bcd4", "#0097a7"] as [string, string],
    icon: "sparkles-outline",
  },
  {
    id: "off-4",
    title: "Pet Care Weekend Deal",
    description: "Saturday & Sunday — Get Grooming + Bathing at ₹799 (save ₹199).",
    code: "PETWEEKEND",
    discount: "Save ₹199",
    validTill: "Every Weekend",
    categoryId: "pet",
    gradient: ["#db2777", "#f472b6"] as [string, string],
    icon: "paw-outline",
  },
  {
    id: "off-5",
    title: "Refer & Earn",
    description: "Refer a friend and both of you get ₹150 wallet credits after their first booking.",
    code: "REFER150",
    discount: "₹150 Credits",
    validTill: "Ongoing",
    categoryId: null,
    gradient: ["#065f46", "#34d399"] as [string, string],
    icon: "people-outline",
  },
  {
    id: "off-6",
    title: "Pest Control Season Offer",
    description: "Monsoon special — Anti-Cockroach + Anti-Rodent combo at ₹999.",
    code: "PEST999",
    discount: "Combo ₹999",
    validTill: "Sep 30, 2026",
    categoryId: "pest",
    gradient: ["#15803d", "#4ade80"] as [string, string],
    icon: "bug-outline",
  },
];

export default function OffersScreen({ navigation }: Props) {
  const [copiedCode, setCopiedCode] = React.useState<string | null>(null);

  const handleCopy = (code: string) => {
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <View style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.text.primary} />
        </Pressable>
        <Text style={s.headerTitle}>Offers & Deals</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* Banner */}
        <Animated.View entering={FadeInDown.duration(300)}>
          <LinearGradient
            colors={["#f59e0b", "#ef4444"]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={s.banner}
          >
            <View style={s.bannerBlob} />
            <Ionicons name="pricetag" size={32} color="white" style={{ marginBottom: 8 }} />
            <Text style={s.bannerTitle}>Exclusive Deals Just For You</Text>
            <Text style={s.bannerSub}>Save big on every booking with our latest offers</Text>
          </LinearGradient>
        </Animated.View>

        {/* Offers list */}
        <Text style={s.sectionTitle}>Available Offers</Text>
        {OFFERS.map((offer, i) => (
          <Animated.View
            key={offer.id}
            entering={FadeInDown.delay(i * 70).duration(350)}
          >
            <View style={s.offerCard}>
              {/* Top gradient stripe */}
              <LinearGradient
                colors={offer.gradient}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={s.offerStripe}
              >
                <View style={s.offerIconWrap}>
                  <Ionicons name={offer.icon as any} size={22} color="white" />
                </View>
                <Text style={s.discountBadge}>{offer.discount}</Text>
              </LinearGradient>

              {/* Content */}
              <View style={s.offerContent}>
                <Text style={s.offerTitle}>{offer.title}</Text>
                <Text style={s.offerDesc}>{offer.description}</Text>

                <View style={s.offerBottom}>
                  {/* Code chip */}
                  <Pressable
                    onPress={() => handleCopy(offer.code)}
                    style={s.codeChip}
                  >
                    <Ionicons
                      name={copiedCode === offer.code ? "checkmark" : "copy-outline"}
                      size={14}
                      color={offer.gradient[0]}
                    />
                    <Text style={[s.codeText, { color: offer.gradient[0] }]}>
                      {copiedCode === offer.code ? "Copied!" : offer.code}
                    </Text>
                  </Pressable>

                  <View style={s.validityChip}>
                    <Ionicons name="time-outline" size={12} color={colors.text.secondary} />
                    <Text style={s.validityText}>Valid till {offer.validTill}</Text>
                  </View>
                </View>

                {/* CTA */}
                <Pressable
                  onPress={() => {
                    if (offer.categoryId) {
                      navigation.navigate("ServiceCategory", { categoryId: offer.categoryId });
                    } else {
                      navigation.navigate("ServicesDashboard");
                    }
                  }}
                  style={[s.applyBtn, { backgroundColor: offer.gradient[0] + "22", borderColor: offer.gradient[0] + "55" }]}
                >
                  <Text style={[s.applyBtnText, { color: offer.gradient[0] }]}>
                    {offer.categoryId ? "Book Now" : "Explore Services"}
                  </Text>
                  <Ionicons name="arrow-forward" size={14} color={offer.gradient[0]} />
                </Pressable>
              </View>
            </View>
          </Animated.View>
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#081826" },
  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 16, paddingTop: 52, paddingBottom: 14,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.1)",
    justifyContent: "center", alignItems: "center",
  },
  headerTitle: { fontSize: 20, fontWeight: "700", color: colors.text.primary },
  scroll: { paddingHorizontal: 16 },
  banner: {
    borderRadius: 24, padding: 24, marginBottom: 24,
    overflow: "hidden", alignItems: "center",
  },
  bannerBlob: {
    position: "absolute", top: -40, right: -40,
    width: 150, height: 150, borderRadius: 75,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  bannerTitle: { fontSize: 20, fontWeight: "700", color: "white", textAlign: "center", marginBottom: 6 },
  bannerSub: { fontSize: 13, color: "rgba(255,255,255,0.8)", textAlign: "center" },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: colors.text.primary, marginBottom: 14 },
  offerCard: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 18, marginBottom: 14, overflow: "hidden",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
  },
  offerStripe: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 12,
  },
  offerIconWrap: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center", alignItems: "center",
  },
  discountBadge: { fontSize: 15, fontWeight: "800", color: "white" },
  offerContent: { padding: 16 },
  offerTitle: { fontSize: 15, fontWeight: "700", color: colors.text.primary, marginBottom: 6 },
  offerDesc: { fontSize: 13, color: colors.text.secondary, lineHeight: 18, marginBottom: 14 },
  offerBottom: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 14, flexWrap: "wrap" },
  codeChip: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 12, paddingVertical: 7,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 10, borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    borderStyle: "dashed",
  },
  codeText: { fontSize: 13, fontWeight: "700" },
  validityChip: { flexDirection: "row", alignItems: "center", gap: 4 },
  validityText: { fontSize: 11, color: colors.text.secondary },
  applyBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
    borderWidth: 1, borderRadius: 12, paddingVertical: 10,
  },
  applyBtnText: { fontSize: 13, fontWeight: "700" },
});
