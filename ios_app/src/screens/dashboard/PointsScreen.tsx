import React, { useState, useEffect, useRef } from "react";
import {
  ScrollView,
  Text,
  View,
  Pressable,
  StyleSheet,
  Share,
  Alert,
  StatusBar,
  Animated,
  Dimensions,
  Modal,
  TextInput,
} from "react-native";
import { Ionicons, MaterialCommunityIcons, FontAwesome5, Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "Points">;
const { width: SW } = Dimensions.get("window");

const STORAGE_KEY_POINTS = "@urban_health_reward_points_v1";
const STORAGE_KEY_LOGS = "@urban_health_reward_logs_v1";

interface EarnAction {
  id: string;
  title: string;
  points: number;
  sub: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  iconBg: string;
  badgeBg: string;
  badgeText: string;
  type: "invite" | "birthday" | "anniversary" | "profile" | "habits" | "fitness";
}

const EARN_ACTIONS: EarnAction[] = [
  {
    id: "invite",
    title: "Invite Friends & Family",
    points: 200,
    sub: "Share your link. Both of you get 200 bonus points.",
    icon: "account-group",
    iconBg: "rgba(59, 130, 246, 0.2)",
    badgeBg: "rgba(56, 189, 248, 0.18)",
    badgeText: "#38bdf8",
    type: "invite",
  },
  {
    id: "birthday",
    title: "Birthday Celebration",
    points: 500,
    sub: "Annual birthday bonus credited to your wallet.",
    icon: "gift",
    iconBg: "rgba(234, 179, 8, 0.2)",
    badgeBg: "rgba(250, 204, 21, 0.18)",
    badgeText: "#facc15",
    type: "birthday",
  },
  {
    id: "anniversary",
    title: "Wedding Anniversary",
    points: 500,
    sub: "Enter your anniversary date for a special surprise.",
    icon: "ring",
    iconBg: "rgba(236, 72, 153, 0.2)",
    badgeBg: "rgba(244, 114, 182, 0.18)",
    badgeText: "#f472b6",
    type: "anniversary",
  },
  {
    id: "profile",
    title: "100% Profile",
    points: 100,
    sub: "Complete your profile & earn extra points.",
    icon: "card-account-details-outline",
    iconBg: "rgba(16, 185, 129, 0.2)",
    badgeBg: "rgba(52, 211, 153, 0.18)",
    badgeText: "#34d399",
    type: "profile",
  },
  {
    id: "habits",
    title: "Daily Habit & Steps",
    points: 10,
    sub: "Earn points for each completed habit checklist.",
    icon: "checkbox-marked-circle-outline",
    iconBg: "rgba(139, 92, 246, 0.2)",
    badgeBg: "rgba(167, 139, 250, 0.18)",
    badgeText: "#a78bfa",
    type: "habits",
  },
  {
    id: "fitness",
    title: "Fitness & Health",
    points: 50,
    sub: "Stay active, earn more points.",
    icon: "shoe-sneaker",
    iconBg: "rgba(20, 184, 166, 0.2)",
    badgeBg: "rgba(45, 212, 191, 0.18)",
    badgeText: "#2dd4bf",
    type: "fitness",
  },
];

interface RewardActivity {
  id: string;
  title: string;
  time: string;
  points: number;
}

export default function PointsScreen({ navigation }: Props) {
  const [points, setPoints] = useState(1370);
  const [earnedTotal, setEarnedTotal] = useState(1750);
  const [redeemedTotal, setRedeemedTotal] = useState(500);
  const [expiringPoints, setExpiringPoints] = useState(0);

  const [activities, setActivities] = useState<RewardActivity[]>([
    {
      id: "act-1",
      title: "Completed Daily Walking Goal",
      time: "Today, 10:45 AM",
      points: 10,
    },
    {
      id: "act-2",
      title: "Hydration Milestone Reached",
      time: "Yesterday, 6:30 PM",
      points: 20,
    },
    {
      id: "act-3",
      title: "Medication Adherence Streak",
      time: "Sep 16, 9:00 AM",
      points: 15,
    },
  ]);

  // Modal for anniversary
  const [annivModal, setAnnivModal] = useState(false);
  const [annivDate, setAnnivDate] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY_POINTS);
        if (stored) {
          const val = parseInt(stored, 10);
          if (!isNaN(val)) setPoints(val);
        }
      } catch (e) {
        console.log("Error loading reward points:", e);
      }
    }
    loadData();
  }, []);

  const addPoints = async (amount: number, reason: string) => {
    const updated = points + amount;
    setPoints(updated);
    setEarnedTotal((prev) => prev + amount);
    await AsyncStorage.setItem(STORAGE_KEY_POINTS, String(updated));

    const newAct: RewardActivity = {
      id: `act_${Date.now()}`,
      title: reason,
      time: "Just now",
      points: amount,
    };
    setActivities((prev) => [newAct, ...prev]);
  };

  const handleAction = async (action: EarnAction) => {
    switch (action.type) {
      case "invite":
        try {
          await Share.share({
            message:
              "Join me on Urban Helpers App! Track health, sleep, and earn reward points redeemable for health gear. Use code: URBAN1370\nhttps://urbanhelpers.app",
            title: "Urban Helpers Reward Program",
          });
          addPoints(200, "Referral Invite Sent");
        } catch {}
        break;

      case "birthday":
        Alert.alert(
          "Birthday Celebration 🎂",
          "Claim your 500 annual birthday bonus points now?",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Claim +500 pts",
              onPress: () => {
                addPoints(500, "Birthday Celebration Gift");
                Alert.alert("Claimed! 🎉", "500 bonus points credited to your wallet.");
              },
            },
          ]
        );
        break;

      case "anniversary":
        setAnnivModal(true);
        break;

      case "profile":
        navigation.navigate("UserProfileScreen" as any);
        break;

      case "habits":
        navigation.navigate("SmartReminders" as any);
        break;

      case "fitness":
        navigation.navigate("DailyStepsDashboard" as any);
        break;
    }
  };

  const handleSaveAnniversary = () => {
    if (!annivDate.trim()) {
      Alert.alert("Input Required", "Please enter your anniversary date.");
      return;
    }
    addPoints(500, "Anniversary Celebration Reward");
    setAnnivModal(false);
    setAnnivDate("");
    Alert.alert("Anniversary Saved! 💍", "500 reward points credited for your celebration.");
  };

  const nextTierGoal = 2000;
  const progressRatio = Math.min(1, Math.max(0, points / nextTierGoal));

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="#07090e" />

      {/* ── Header ─────────────────────────────────────────────── */}
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} style={s.iconBtn}>
          <Ionicons name="arrow-back" size={22} color="#ffffff" />
        </Pressable>

        <View style={s.headerTitleWrap}>
          <Text style={s.headerTitle}>Points & Rewards</Text>
          <Text style={s.headerSubtitle}>Earn  •  Redeem  •  Get More</Text>
        </View>

        <View style={s.headerRightIcons}>
          <Pressable
            style={s.iconBtn}
            onPress={() => Alert.alert("Notifications", "You have no unread reward alerts.")}
          >
            <Ionicons name="notifications-outline" size={20} color="#ffffff" />
            <View style={s.notifBadge} />
          </Pressable>

          <Pressable
            style={s.iconBtn}
            onPress={() => navigation.navigate("UserProfileScreen" as any)}
          >
            <Ionicons name="person-outline" size={19} color="#ffffff" />
          </Pressable>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {/* ── 1. Top Balance Hero Card ─────────────────────────── */}
        <LinearGradient
          colors={["#16192b", "#101323", "#0b0d18"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.heroCard}
        >
          {/* Subtle gold decorative glow */}
          <View style={s.heroGlowWave} />

          <View style={s.heroTopRow}>
            <View style={s.balanceLabelRow}>
              <FontAwesome5 name="crown" size={13} color="#f59e0b" style={{ marginRight: 6 }} />
              <Text style={s.balanceLabel}>YOUR BALANCE</Text>
            </View>

            <View style={s.tierBadge}>
              <FontAwesome5 name="crown" size={11} color="#cbd5e1" style={{ marginRight: 5 }} />
              <Text style={s.tierBadgeText}>Silver Tier</Text>
            </View>
          </View>

          <View style={s.heroMiddleRow}>
            <View style={{ flex: 1 }}>
              <View style={s.coinValueRow}>
                <View style={s.goldCoinSmall}>
                  <Ionicons name="star" size={13} color="#0f172a" />
                </View>
                <Text style={s.pointsNumber}>{points.toLocaleString()}</Text>
              </View>

              <Text style={s.storeValueText}>≈ ₹{points.toLocaleString()} store value</Text>
            </View>

            {/* Right side link + 3D Coin Graphic */}
            <View style={s.heroCoinGraphicWrap}>
              <Text style={s.tierHintText}>Keep earning,{"\n"}reach Gold! →</Text>

              {/* 3D Coin on pedestal */}
              <View style={s.pedestalWrap}>
                <LinearGradient
                  colors={["#fde047", "#eab308", "#ca8a04"]}
                  style={s.bigGoldCoin}
                >
                  <View style={s.bigGoldCoinInner}>
                    <Ionicons name="star" size={24} color="#fef08a" />
                  </View>
                </LinearGradient>
                <View style={s.pedestalBase} />
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* ── 2. Three Quick Stats (Earned / Redeemed / Expiring) ── */}
        <View style={s.statsRow}>
          {/* Earned */}
          <View style={s.statCard}>
            <View style={[s.statIconWrap, { backgroundColor: "rgba(16, 185, 129, 0.18)" }]}>
              <Ionicons name="chatbubble-ellipses" size={17} color="#10b981" />
            </View>
            <View style={s.statTextCol}>
              <Text style={s.statLabel}>Earned</Text>
              <Text style={[s.statValue, { color: "#10b981" }]}>{earnedTotal.toLocaleString()}</Text>
            </View>
            <Ionicons name="chevron-forward" size={14} color="rgba(255,255,255,0.3)" />
          </View>

          {/* Redeemed */}
          <View style={s.statCard}>
            <View style={[s.statIconWrap, { backgroundColor: "rgba(168, 85, 247, 0.18)" }]}>
              <Ionicons name="gift" size={17} color="#a855f7" />
            </View>
            <View style={s.statTextCol}>
              <Text style={s.statLabel}>Redeemed</Text>
              <Text style={[s.statValue, { color: "#a855f7" }]}>{redeemedTotal}</Text>
            </View>
            <Ionicons name="chevron-forward" size={14} color="rgba(255,255,255,0.3)" />
          </View>

          {/* Expiring */}
          <View style={s.statCard}>
            <View style={[s.statIconWrap, { backgroundColor: "rgba(249, 115, 22, 0.18)" }]}>
              <Ionicons name="hourglass" size={17} color="#f97316" />
            </View>
            <View style={s.statTextCol}>
              <Text style={s.statLabel}>Expiring</Text>
              <Text style={[s.statValue, { color: "#f97316" }]}>{expiringPoints}</Text>
            </View>
            <Ionicons name="chevron-forward" size={14} color="rgba(255,255,255,0.3)" />
          </View>
        </View>

        {/* ── 3. Tier Progress Card ────────────────────────────── */}
        <View style={s.tierProgressCard}>
          <View style={s.tierProgressTop}>
            <View style={s.trophyWrap}>
              <Ionicons name="trophy" size={18} color="#eab308" />
            </View>

            <Text style={s.tierProgressTitle}>Progress to Gold Tier</Text>
            <Text style={s.tierProgressRatio}>{points.toLocaleString()} / 2,000 pts</Text>
            <Ionicons name="chevron-forward" size={14} color="rgba(255,255,255,0.4)" style={{ marginLeft: 4 }} />
          </View>

          {/* Bar */}
          <View style={s.progressBarTrack}>
            <View style={[s.progressBarFill, { width: `${progressRatio * 100}%` }]} />
          </View>
        </View>

        {/* ── 4. Gold Redeem Shop Banner ────────────────────────── */}
        <LinearGradient
          colors={["#fef08a", "#facc15", "#eab308", "#ca8a04"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.shopBanner}
        >
          <View style={s.shopBagCircle}>
            <Ionicons name="bag-handle" size={24} color="#1e293b" />
          </View>

          <View style={{ flex: 1, paddingHorizontal: 12 }}>
            <Text style={s.shopBannerSmallLabel}>REDEEM</Text>
            <Text style={s.shopBannerTitle}>Products in Shop</Text>
            <Text style={s.shopBannerSub}>Use your points for amazing products</Text>
          </View>

          <Pressable
            style={s.shopNowBtn}
            onPress={() => navigation.navigate("Shop" as any)}
          >
            <Text style={s.shopNowBtnText}>Shop Now →</Text>
          </Pressable>
        </LinearGradient>

        {/* ── 5. Ways to Earn Points ────────────────────────────── */}
        <View style={s.sectionHeaderWrap}>
          <View style={s.sectionTitleRow}>
            <View style={s.sectionBar} />
            <Text style={s.sectionTitle}>Ways to Earn Points</Text>
          </View>
          <Text style={s.sectionSub}>Complete simple actions and earn rewards</Text>
        </View>

        <View style={s.earnGrid}>
          {EARN_ACTIONS.map((act) => (
            <Pressable
              key={act.id}
              style={({ pressed }) => [s.earnCard, pressed && { opacity: 0.85 }]}
              onPress={() => handleAction(act)}
            >
              <View style={s.earnCardTop}>
                <View style={[s.earnIconCircle, { backgroundColor: act.iconBg }]}>
                  <MaterialCommunityIcons name={act.icon} size={22} color={act.badgeText} />
                </View>
                <Ionicons name="chevron-forward" size={14} color="rgba(255,255,255,0.3)" />
              </View>

              <Text style={s.earnCardTitle} numberOfLines={1}>{act.title}</Text>

              <View style={[s.earnBadge, { backgroundColor: act.badgeBg }]}>
                <Text style={[s.earnBadgeText, { color: act.badgeText }]}>+{act.points} pts</Text>
              </View>

              <Text style={s.earnCardSub} numberOfLines={2}>{act.sub}</Text>
            </Pressable>
          ))}
        </View>

        {/* ── 6. Recent Activity ────────────────────────────────── */}
        <View style={[s.sectionHeaderWrap, { marginTop: 24 }]}>
          <View style={s.recentHeaderRow}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <MaterialCommunityIcons name="pulse" size={18} color="#10b981" />
              <Text style={s.recentTitle}>Recent Activity</Text>
            </View>
            <Pressable onPress={() => Alert.alert("Activity History", "All point earnings and redemptions are recorded.")}>
              <Text style={s.viewAllLink}>View All →</Text>
            </Pressable>
          </View>
        </View>

        <View style={s.recentList}>
          {activities.map((item) => (
            <View key={item.id} style={s.activityItem}>
              <View style={s.actIconGreenWrap}>
                <Ionicons name="walk" size={18} color="#10b981" />
              </View>

              <View style={{ flex: 1, paddingHorizontal: 12 }}>
                <Text style={s.actItemTitle}>{item.title}</Text>
                <Text style={s.actItemTime}>{item.time}</Text>
              </View>

              <Text style={s.actPointsValue}>+{item.points} pts</Text>
              <Ionicons name="chevron-forward" size={14} color="rgba(255,255,255,0.3)" style={{ marginLeft: 6 }} />
            </View>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ── Modal: Wedding Anniversary ────────────────────────── */}
      <Modal visible={annivModal} transparent animationType="fade" onRequestClose={() => setAnnivModal(false)}>
        <Pressable style={s.modalOverlay} onPress={() => setAnnivModal(false)}>
          <Pressable style={s.modalSheet} onPress={(e) => e.stopPropagation()}>
            <View style={s.modalHandle} />
            <Text style={s.modalTitle}>Wedding Anniversary</Text>
            <Text style={s.modalSub}>Enter your anniversary date to receive 500 yearly points</Text>

            <TextInput
              style={s.annivInput}
              placeholder="e.g. 14 February"
              placeholderTextColor="#64748b"
              value={annivDate}
              onChangeText={setAnnivDate}
            />

            <Pressable style={s.claimAnnivBtn} onPress={handleSaveAnniversary}>
              <Text style={s.claimAnnivBtnText}>Save & Claim +500 pts</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#07090e",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 52,
    paddingBottom: 14,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.06)",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  notifBadge: {
    position: "absolute",
    top: 8,
    right: 9,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#ef4444",
  },
  headerTitleWrap: {
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#ffffff",
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 11,
    color: "rgba(255,255,255,0.5)",
    fontWeight: "500",
    marginTop: 2,
  },
  headerRightIcons: {
    flexDirection: "row",
    gap: 8,
  },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 40,
  },

  // 1. Hero Card
  heroCard: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 12,
    position: "relative",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  heroGlowWave: {
    position: "absolute",
    right: -40,
    top: -40,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(245, 158, 11, 0.06)",
  },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  balanceLabelRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  balanceLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "rgba(255,255,255,0.6)",
    letterSpacing: 0.8,
  },
  tierBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  tierBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#e2e8f0",
  },
  heroMiddleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  coinValueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  goldCoinSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#eab308",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#fef08a",
  },
  pointsNumber: {
    fontSize: 38,
    fontWeight: "900",
    color: "#ffffff",
    letterSpacing: -1,
    lineHeight: 44,
  },
  storeValueText: {
    fontSize: 13,
    color: "rgba(255,255,255,0.6)",
    fontWeight: "600",
  },
  heroCoinGraphicWrap: {
    alignItems: "flex-end",
  },
  tierHintText: {
    fontSize: 11,
    color: "rgba(255,255,255,0.7)",
    textAlign: "right",
    lineHeight: 15,
    marginBottom: 8,
    fontWeight: "500",
  },
  pedestalWrap: {
    alignItems: "center",
  },
  bigGoldCoin: {
    width: 58,
    height: 58,
    borderRadius: 29,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#eab308",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 6,
  },
  bigGoldCoinInner: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2,
    borderColor: "rgba(254, 240, 138, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(202, 138, 4, 0.3)",
  },
  pedestalBase: {
    width: 70,
    height: 10,
    borderRadius: 5,
    backgroundColor: "rgba(255,255,255,0.06)",
    marginTop: -4,
  },

  // 2. Stats Row
  statsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#11141f",
    borderRadius: 18,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  statIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  statTextCol: {
    flex: 1,
  },
  statLabel: {
    fontSize: 10,
    color: "rgba(255,255,255,0.5)",
    fontWeight: "600",
  },
  statValue: {
    fontSize: 15,
    fontWeight: "800",
  },

  // 3. Tier Progress Card
  tierProgressCard: {
    backgroundColor: "#11141f",
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  tierProgressTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  trophyWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(234, 179, 8, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  tierProgressTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#ffffff",
    flex: 1,
  },
  tierProgressRatio: {
    fontSize: 12,
    fontWeight: "700",
    color: "rgba(255,255,255,0.7)",
  },
  progressBarTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.08)",
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#eab308",
    borderRadius: 3,
  },

  // 4. Shop Banner
  shopBanner: {
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  shopBagCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
  shopBannerSmallLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#713f12",
    letterSpacing: 0.6,
  },
  shopBannerTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0f172a",
  },
  shopBannerSub: {
    fontSize: 11,
    color: "#475569",
    fontWeight: "500",
  },
  shopNowBtn: {
    backgroundColor: "#0f172a",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 16,
  },
  shopNowBtnText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700",
  },

  // 5. Ways to Earn Points
  sectionHeaderWrap: {
    marginBottom: 12,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 2,
  },
  sectionBar: {
    width: 3,
    height: 16,
    borderRadius: 2,
    backgroundColor: "#eab308",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: -0.2,
  },
  sectionSub: {
    fontSize: 12,
    color: "rgba(255,255,255,0.5)",
    marginLeft: 11,
  },
  earnGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 10,
  },
  earnCard: {
    width: (SW - 32 - 10) / 2,
    backgroundColor: "#11141f",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  earnCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  earnIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
  },
  earnCardTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 6,
  },
  earnBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginBottom: 8,
  },
  earnBadgeText: {
    fontSize: 11,
    fontWeight: "800",
  },
  earnCardSub: {
    fontSize: 11,
    color: "rgba(255,255,255,0.5)",
    lineHeight: 15,
  },

  // 6. Recent Activity
  recentHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  recentTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
  },
  viewAllLink: {
    fontSize: 12,
    fontWeight: "700",
    color: "rgba(255,255,255,0.6)",
  },
  recentList: {
    backgroundColor: "#11141f",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  actIconGreenWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  actItemTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 2,
  },
  actItemTime: {
    fontSize: 11,
    color: "rgba(255,255,255,0.45)",
  },
  actPointsValue: {
    fontSize: 13,
    fontWeight: "800",
    color: "#10b981",
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "#0f172a",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignSelf: "center",
    marginBottom: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: "800", color: "#ffffff", textAlign: "center", marginBottom: 4 },
  modalSub: { fontSize: 12, color: "#94a3b8", textAlign: "center", marginBottom: 18 },
  annivInput: {
    backgroundColor: "#1e293b",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#ffffff",
    fontSize: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    marginBottom: 14,
  },
  claimAnnivBtn: {
    backgroundColor: "#ec4899",
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
  },
  claimAnnivBtnText: { color: "#ffffff", fontSize: 14, fontWeight: "700" },
});
