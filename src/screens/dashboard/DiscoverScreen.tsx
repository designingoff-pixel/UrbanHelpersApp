import React from "react";
import {
  ScrollView,
  Text,
  View,
  Pressable,
  StyleSheet,
  Dimensions,
  StatusBar,
  Linking,
  Alert,
} from "react-native";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import Animated, { FadeInDown } from "react-native-reanimated";
import { RootStackParamList } from "@/navigation/types";
import SamsungBottomNav from "@/components/SamsungBottomNav";

type Props = NativeStackScreenProps<RootStackParamList, "Discover">;

const { width: SW } = Dimensions.get("window");
const PROMO_CARD_W = SW * 0.78;

export default function DiscoverScreen({ navigation }: Props) {
  const handleCarePress = (provider: string) => {
    Alert.alert(
      provider,
      `Connecting to ${provider} partner services for health consultation and medicines.`
    );
  };

  const handleCalmPress = (track: string) => {
    navigation.navigate("MeditationDashboard");
  };

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0c10" />

      {/* ── Top Header ─────────────────────────────────────────── */}
      <View style={s.header}>
        <Text style={s.pageTitle}>Discover</Text>
        <Pressable
          style={s.menuBtn}
          onPress={() => navigation.navigate("Notifications" as any)}
        >
          <Ionicons name="ellipsis-vertical" size={20} color="rgba(255,255,255,0.85)" />
          <View style={s.menuDotBadge} />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
      >
        {/* ── Section Title: For healthy living ──────────────────── */}
        <Animated.View entering={FadeInDown.duration(350).springify()}>
          <Text style={s.sectionTitle}>For healthy living</Text>
        </Animated.View>

        {/* ── CARD 1: PharmEasy Find Care ────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(80).duration(380).springify()}>
          <Pressable
            onPress={() => handleCarePress("PharmEasy")}
            style={({ pressed }) => [s.cardWrapper, pressed && s.cardPressed]}
          >
            <LinearGradient
              colors={["#054a36", "#09664c", "#0d7f5e"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={s.cardContainer}
            >
              {/* Header inside card */}
              <View style={s.cardTopRow}>
                <View>
                  <Text style={s.cardCategory}>Find Care</Text>
                  <Text style={s.cardPartner}>Powered by PharmEasy</Text>
                </View>
                {/* PharmEasy Emblem Badge */}
                <View style={s.pharmeasyBadge}>
                  <Text style={s.pharmeasyIcon}>℞</Text>
                </View>
              </View>

              {/* 3 Offer Badges Box */}
              <View style={s.peOfferContainer}>
                {/* Offer 1 */}
                <View style={s.peOfferCol}>
                  <View style={[s.peIconCircle, { backgroundColor: "#15803d" }]}>
                    <Ionicons name="medkit" size={16} color="#ffffff" />
                  </View>
                  <Text style={s.peOfferTitle}>Save up to</Text>
                  <Text style={s.peOfferHighlight}>25% on</Text>
                  <Text style={s.peOfferSub}>medicine orders*</Text>
                </View>

                {/* Divider */}
                <View style={s.peDivider} />

                {/* Offer 2 */}
                <View style={s.peOfferCol}>
                  <View style={[s.peIconCircle, { backgroundColor: "#7c3aed" }]}>
                    <Ionicons name="flask" size={16} color="#ffffff" />
                  </View>
                  <Text style={s.peOfferTitle}>Buy 1 Get 1</Text>
                  <Text style={[s.peOfferHighlight, { color: "#6d28d9" }]}>FREE</Text>
                  <Text style={s.peOfferSub}>on Lab Tests*</Text>
                </View>

                {/* Divider */}
                <View style={s.peDivider} />

                {/* Offer 3 */}
                <View style={s.peOfferCol}>
                  <View style={[s.peIconCircle, { backgroundColor: "#0284c7" }]}>
                    <FontAwesome5 name="stethoscope" size={14} color="#ffffff" />
                  </View>
                  <Text style={s.peOfferTitle}>Doctor Consults</Text>
                  <Text style={s.peOfferSub}>Starting at</Text>
                  <Text style={[s.peOfferHighlight, { color: "#0369a1" }]}>₹199 only*</Text>
                </View>
              </View>

              {/* Headlines */}
              <Text style={s.cardMainHeading}>
                Get help with all of your healthcare needs
              </Text>
              <Text style={s.cardSubDesc}>
                The best offers on medications, lab tests, doctor consults, and more are just a tap away!
              </Text>
            </LinearGradient>
          </Pressable>
        </Animated.View>

        {/* ── CARD 2: Tata 1mg Find Care ─────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(140).duration(380).springify()}>
          <Pressable
            onPress={() => handleCarePress("Tata 1mg")}
            style={({ pressed }) => [s.cardWrapper, pressed && s.cardPressed]}
          >
            <LinearGradient
              colors={["#bd2a3d", "#d4374b", "#e7465c"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={s.cardContainer}
            >
              {/* Header inside card */}
              <View style={s.cardTopRow}>
                <View>
                  <Text style={s.cardCategory}>Find Care</Text>
                  <Text style={s.cardPartner}>Powered by Tata 1mg</Text>
                </View>
                {/* Tata 1mg Badge */}
                <View style={s.tataBadge}>
                  <Text style={s.tataBadgeBrand}>TATA</Text>
                  <Text style={s.tataBadgeName}>1mg</Text>
                </View>
              </View>

              {/* Promo Banner Peach Container */}
              <View style={s.tataPromoContainer}>
                <Text style={s.tataExclusiveTitle}>
                  Additional Discounts Exclusively for Samsung Health Users
                </Text>
                <View style={s.tataRow}>
                  {/* Item 1 */}
                  <View style={s.tataCol}>
                    <View style={s.tataIconBox}>
                      <Ionicons name="medical" size={20} color="#e11d48" />
                    </View>
                    <Text style={s.tataColText}>Genuine Medicines</Text>
                    <Text style={s.tataColHighlight}>Up to 25% off*</Text>
                  </View>

                  {/* Item 2 */}
                  <View style={s.tataCol}>
                    <View style={s.tataIconBox}>
                      <Ionicons name="color-filter" size={20} color="#e11d48" />
                    </View>
                    <Text style={s.tataColText}>Lab Tests</Text>
                    <Text style={s.tataColHighlight}>Up to 40% off*</Text>
                  </View>

                  {/* Item 3 */}
                  <View style={s.tataCol}>
                    <View style={s.tataIconBox}>
                      <Ionicons name="phone-portrait" size={20} color="#e11d48" />
                    </View>
                    <Text style={s.tataColText}>Online</Text>
                    <Text style={s.tataColHighlight}>Doctor Consults</Text>
                  </View>
                </View>
              </View>

              {/* Headlines */}
              <Text style={s.cardMainHeading}>Your healthcare, simplified</Text>
              <Text style={s.cardSubDesc}>
                Access to medicines, lab tests, and consultations is just a tap away.
              </Text>
            </LinearGradient>
          </Pressable>
        </Animated.View>

        {/* ── CARD 3: Stay balanced (Powered by Calm) ─────────────── */}
        <Animated.View entering={FadeInDown.delay(200).duration(380).springify()}>
          <Pressable
            onPress={() => navigation.navigate("MeditationDashboard")}
            style={({ pressed }) => [s.cardWrapper, pressed && s.cardPressed]}
          >
            <LinearGradient
              colors={["#4d2479", "#63309a", "#763cb3"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={s.cardContainer}
            >
              {/* Background Floral Overlay */}
              <View style={s.calmPetalGlow} />

              <Text style={s.calmTitle}>Stay balanced</Text>
              <Text style={s.calmSub}>
                Cultivate calm through mindful meditation.
              </Text>

              {/* 3 Calm Track Tiles */}
              <View style={s.calmTilesRow}>
                {/* Track 1 */}
                <Pressable
                  onPress={() => handleCalmPress("The Poetry")}
                  style={s.calmTile}
                >
                  <LinearGradient
                    colors={["#b45309", "#d97706"]}
                    style={s.calmTileImg}
                  >
                    <Ionicons name="book" size={26} color="rgba(255,255,255,0.9)" />
                    <View style={s.lockBadge}>
                      <Ionicons name="lock-closed" size={11} color="#ffffff" />
                    </View>
                  </LinearGradient>
                  <Text style={s.calmTileLabel} numberOfLines={1}>The Poetry ...</Text>
                </Pressable>

                {/* Track 2 */}
                <Pressable
                  onPress={() => handleCalmPress("7 Days of Sleep")}
                  style={s.calmTile}
                >
                  <LinearGradient
                    colors={["#1e3a8a", "#0284c7"]}
                    style={s.calmTileImg}
                  >
                    <Ionicons name="moon" size={26} color="rgba(255,255,255,0.9)" />
                  </LinearGradient>
                  <Text style={s.calmTileLabel} numberOfLines={1}>7 Days of S...</Text>
                </Pressable>

                {/* Track 3 */}
                <Pressable
                  onPress={() => handleCalmPress("Escape to the Coast")}
                  style={s.calmTile}
                >
                  <LinearGradient
                    colors={["#0f766e", "#14b8a6"]}
                    style={s.calmTileImg}
                  >
                    <Ionicons name="water" size={26} color="rgba(255,255,255,0.9)" />
                    <View style={s.lockBadge}>
                      <Ionicons name="lock-closed" size={11} color="#ffffff" />
                    </View>
                  </LinearGradient>
                  <Text style={s.calmTileLabel} numberOfLines={1}>Escape to t...</Text>
                </Pressable>
              </View>

              {/* Calm Branding Footer */}
              <View style={s.calmFooter}>
                <Text style={s.calmPowered}>Powered by <Text style={s.calmLogo}>Calm</Text></Text>
              </View>
            </LinearGradient>
          </Pressable>
        </Animated.View>

        {/* ── PROMOTIONS SECTION ─────────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(260).duration(380).springify()}>
          <View style={s.promoHeaderRow}>
            <View style={s.promoHeaderLeft}>
              <Text style={s.promoTitle}>Promotions</Text>
              <View style={s.promoDotBadge} />
            </View>
            <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.6)" />
          </View>

          {/* Horizontal Promotions Carousel */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.promoScrollContent}
            style={s.promoScroll}
          >
            {/* Promo Card 1: Galaxy Watch Fitness Index */}
            <Pressable
              onPress={() => navigation.navigate("FitnessDashboard")}
              style={s.promoCardOuter}
            >
              <View style={s.promoCardWhite}>
                <View style={s.promoCardTop}>
                  <Ionicons name="fitness" size={18} color="#0284c7" />
                  <Text style={s.promoBrandText}>Samsung Health</Text>
                </View>
                <Text style={s.promoCardHeading}>
                  Introducing Fitness Index and Daily Cardio Load
                </Text>
                <View style={s.watchGraphicsRow}>
                  {/* Smart Watch Mock graphic 1 */}
                  <View style={s.watchGraphicCircle1}>
                    <View style={s.watchScreen1}>
                      <Text style={s.watchScreenTxt}>86</Text>
                    </View>
                  </View>
                  {/* Smart Watch Mock graphic 2 */}
                  <View style={s.watchGraphicCircle2}>
                    <View style={s.watchScreen2}>
                      <Ionicons name="time" size={18} color="#22c55e" />
                    </View>
                  </View>
                </View>
                <Text style={s.promoDateText}>04.09.2026 ~ 20.09.2026</Text>
              </View>
            </Pressable>

            {/* Promo Card 2: Walk-a-thon Redemption */}
            <Pressable
              onPress={() => navigation.navigate("DailyStepsDashboard")}
              style={s.promoCardOuter}
            >
              <LinearGradient
                colors={["#1e293b", "#0f172a"]}
                style={s.promoCardDark}
              >
                {/* Tricolor Ribbon Gradient Accent */}
                <LinearGradient
                  colors={["#ff9933", "#ffffff", "#138808"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={s.tricolorRibbon}
                />
                <Text style={s.promoCardBadge}>Walk-a-thon</Text>
                <Text style={s.promoCardHeadingDark}>
                  Walk-a-thon Redemption
                </Text>
                <Text style={s.promoCardSubDark}>
                  10,000 steps challenge awards & prizes
                </Text>
                <View style={{ flex: 1 }} />
                <Text style={s.promoDateTextLight}>~ 30.09.2026</Text>
              </LinearGradient>
            </Pressable>

            {/* Promo Card 3: PharmEasy discount */}
            <Pressable
              onPress={() => handleCarePress("PharmEasy")}
              style={s.promoCardOuter}
            >
              <View style={s.promoCardWhite}>
                <View style={s.promoCardTop}>
                  <Ionicons name="shield-checkmark" size={18} color="#059669" />
                  <Text style={s.promoBrandText}>Samsung Health</Text>
                </View>
                <Text style={s.promoCardHeading}>
                  Save more on medicines with PharmEasy
                </Text>
                <Text style={s.peDiscountBig}>Up to 27% OFF</Text>
                <View style={s.buyNowBtn}>
                  <Text style={s.buyNowBtnText}>Buy now</Text>
                </View>
                <Text style={s.promoDateText}>03.09.2026 ~ 30.09.2026</Text>
              </View>
            </Pressable>
          </ScrollView>
        </Animated.View>

        {/* Bottom clearance */}
        <View style={{ height: 110 }} />
      </ScrollView>

      {/* ── Fixed Samsung Bottom Nav (Discover Active) ─────────── */}
      <SamsungBottomNav activeRoute="Discover" />
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0a0c10",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 52,
    paddingBottom: 14,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#ffffff",
    letterSpacing: -0.5,
  },
  menuBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  menuDotBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ff6a00",
    borderWidth: 1.5,
    borderColor: "#0a0c10",
  },

  scroll: {
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 14,
  },

  // Cards
  cardWrapper: {
    marginBottom: 16,
    borderRadius: 24,
    overflow: "hidden",
  },
  cardPressed: {
    opacity: 0.95,
    transform: [{ scale: 0.985 }],
  },
  cardContainer: {
    borderRadius: 24,
    padding: 20,
    overflow: "hidden",
    position: "relative",
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  cardCategory: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
  },
  cardPartner: {
    fontSize: 12.5,
    color: "rgba(255,255,255,0.75)",
    marginTop: 2,
    fontWeight: "500",
  },

  // Badges
  pharmeasyBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#0fa37f",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
  },
  pharmeasyIcon: {
    fontSize: 22,
    fontWeight: "800",
    color: "#ffffff",
  },

  tataBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  tataBadgeBrand: {
    fontSize: 10,
    fontWeight: "800",
    color: "#000000",
    letterSpacing: 0.5,
  },
  tataBadgeName: {
    fontSize: 13,
    fontWeight: "800",
    color: "#e11d48",
    lineHeight: 14,
  },

  // PharmEasy Offer Container
  peOfferContainer: {
    backgroundColor: "#a0e0cf",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  peOfferCol: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 2,
  },
  peIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  peOfferTitle: {
    fontSize: 10.5,
    color: "#064e3b",
    fontWeight: "600",
    textAlign: "center",
  },
  peOfferHighlight: {
    fontSize: 13,
    fontWeight: "800",
    color: "#065f46",
    textAlign: "center",
    lineHeight: 16,
  },
  peOfferSub: {
    fontSize: 9.5,
    color: "#047857",
    textAlign: "center",
  },
  peDivider: {
    width: 1,
    height: 44,
    backgroundColor: "rgba(6, 95, 70, 0.2)",
  },

  // Tata 1mg Promo Container
  tataPromoContainer: {
    backgroundColor: "#fdece6",
    borderRadius: 16,
    padding: 12,
    marginBottom: 18,
  },
  tataExclusiveTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#9f1239",
    textAlign: "center",
    marginBottom: 10,
  },
  tataRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  tataCol: {
    alignItems: "center",
  },
  tataIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(225, 29, 72, 0.12)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  tataColText: {
    fontSize: 10.5,
    fontWeight: "600",
    color: "#4c0519",
    textAlign: "center",
  },
  tataColHighlight: {
    fontSize: 11.5,
    fontWeight: "800",
    color: "#be123c",
    textAlign: "center",
  },

  // Common Card Headings
  cardMainHeading: {
    fontSize: 22,
    fontWeight: "800",
    color: "#ffffff",
    textAlign: "center",
    lineHeight: 28,
    marginBottom: 8,
  },
  cardSubDesc: {
    fontSize: 13.5,
    color: "rgba(255,255,255,0.85)",
    textAlign: "center",
    lineHeight: 19,
    paddingHorizontal: 12,
  },

  // Calm Meditation Card
  calmPetalGlow: {
    position: "absolute",
    top: -40,
    right: -40,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(192, 132, 252, 0.15)",
  },
  calmTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 6,
  },
  calmSub: {
    fontSize: 14,
    color: "rgba(255,255,255,0.85)",
    textAlign: "center",
    marginBottom: 20,
  },
  calmTilesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 16,
  },
  calmTile: {
    flex: 1,
    alignItems: "center",
  },
  calmTileImg: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
    position: "relative",
  },
  lockBadge: {
    position: "absolute",
    bottom: 6,
    right: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  calmTileLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#ffffff",
    textAlign: "center",
  },
  calmFooter: {
    alignItems: "flex-end",
    marginTop: 4,
  },
  calmPowered: {
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
  },
  calmLogo: {
    fontStyle: "italic",
    fontWeight: "800",
    color: "#ffffff",
    fontSize: 14,
  },

  // Promotions Section
  promoHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 14,
  },
  promoHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  promoTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#ffffff",
  },
  promoDotBadge: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#ff6a00",
  },
  promoScroll: {
    marginHorizontal: -16,
  },
  promoScrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  promoCardOuter: {
    width: PROMO_CARD_W,
    borderRadius: 22,
    overflow: "hidden",
  },
  promoCardWhite: {
    backgroundColor: "#ffffff",
    borderRadius: 22,
    padding: 18,
    minHeight: 180,
    justifyContent: "space-between",
  },
  promoCardDark: {
    borderRadius: 22,
    padding: 18,
    minHeight: 180,
    position: "relative",
    overflow: "hidden",
  },
  tricolorRibbon: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 6,
  },
  promoCardBadge: {
    fontSize: 11,
    fontWeight: "700",
    color: "#f59e0b",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  promoCardHeadingDark: {
    fontSize: 17,
    fontWeight: "800",
    color: "#ffffff",
    lineHeight: 22,
  },
  promoCardSubDark: {
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
    marginTop: 4,
  },
  promoDateTextLight: {
    fontSize: 11,
    color: "rgba(255,255,255,0.5)",
    fontWeight: "500",
  },
  promoCardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  promoBrandText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#334155",
  },
  promoCardHeading: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0f172a",
    lineHeight: 20,
  },
  watchGraphicsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 14,
    marginVertical: 10,
  },
  watchGraphicCircle1: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#e2e8f0",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#cbd5e1",
  },
  watchScreen1: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#0284c7",
    justifyContent: "center",
    alignItems: "center",
  },
  watchScreenTxt: {
    fontSize: 13,
    fontWeight: "800",
    color: "#ffffff",
  },
  watchGraphicCircle2: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#1e293b",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#475569",
  },
  watchScreen2: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#0f172a",
    justifyContent: "center",
    alignItems: "center",
  },
  peDiscountBig: {
    fontSize: 18,
    fontWeight: "900",
    color: "#059669",
    marginVertical: 6,
  },
  buyNowBtn: {
    backgroundColor: "#0f172a",
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 14,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  buyNowBtnText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700",
  },
  promoDateText: {
    fontSize: 11,
    color: "#64748b",
    fontWeight: "500",
  },
});
