import React from "react";
import { ScrollView, Text, View, Pressable, StyleSheet, Image, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import Animated, { FadeInDown } from "react-native-reanimated";
import { RootStackParamList } from "@/navigation/types";
import { colors } from "@/theme/colors";

type Props = NativeStackScreenProps<RootStackParamList, "Offers">;

import { OFFERS, setStoredCoupon } from "@/services/offersService";

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
                <Text style={s.discountBadge}>{offer.discountDisplay}</Text>
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
                <View style={{ flexDirection: "row", gap: 12 }}>
                  <Pressable
                    onPress={async () => {
                      if (new Date() > offer.validTillDate) {
                        Alert.alert("Expired", "This coupon has expired and cannot be applied.");
                        return;
                      }
                      await setStoredCoupon(offer.code);
                      Alert.alert("Coupon Applied", `Code ${offer.code} has been applied to your session.`);
                      if (offer.categoryId) {
                        navigation.navigate("ServiceCategory", { categoryId: offer.categoryId });
                      } else {
                        navigation.navigate("ServicesDashboard");
                      }
                    }}
                    style={[s.applyBtn, { backgroundColor: offer.gradient[0] + "22", borderColor: offer.gradient[0] + "55", flex: 1, justifyContent: "center" }]}
                  >
                    <Text style={[s.applyBtnText, { color: offer.gradient[0] }]}>
                      Apply Coupon
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => {
                      if (offer.categoryId) {
                        navigation.navigate("ServiceCategory", { categoryId: offer.categoryId });
                      } else {
                        navigation.navigate("ServicesDashboard");
                      }
                    }}
                    style={[s.applyBtn, { backgroundColor: offer.gradient[0], borderColor: offer.gradient[0], flex: 1, justifyContent: "center" }]}
                  >
                    <Text style={[s.applyBtnText, { color: "white" }]}>
                      {offer.categoryId ? "Book Now" : "Explore"}
                    </Text>
                  </Pressable>
                </View>
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
