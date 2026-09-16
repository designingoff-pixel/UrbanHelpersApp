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
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/types";
import SamsungBottomNav from "@/components/SamsungBottomNav";

type Props = NativeStackScreenProps<RootStackParamList, "Points">;

const STORAGE_KEY_POINTS = "@urban_health_reward_points_v1";

// ─── Color palette ────────────────────────────────────────────────────────────
const C = {
  bg: "#0a0c12",
  surface: "#131720",
  card: "#181f2c",
  cardBorder: "rgba(255,255,255,0.07)",
  textPrimary: "#f0f4ff",
  textSecondary: "rgba(255,255,255,0.55)",
  textMuted: "rgba(255,255,255,0.30)",
  gold: "#f5c842",
  goldSoft: "#fde68a",
  purple: "#8b5cf6",
  purpleSoft: "#a78bfa",
  blue: "#3b82f6",
  teal: "#14b8a6",
  green: "#22c55e",
  orange: "#f97316",
  pink: "#ec4899",
  divider: "rgba(255,255,255,0.055)",
};

// ─── Types ────────────────────────────────────────────────────────────────────
interface EarnRule {
  id: string;
  title: string;
  points: number;
  sub: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  color: string;
  gradientStart: string;
  gradientEnd: string;
  actionText: string;
  type: "share" | "profile" | "claim" | "habits" | "shop";
}

interface ActivityItem {
  title: string;
  pts: string;
  time: string;
  positive: boolean;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  iconColor: string;
}

// ─── Earn rules ───────────────────────────────────────────────────────────────
const EARN_RULES: EarnRule[] = [
  {
    id: "rule-ref",
    title: "Invite Friends & Family",
    points: 200,
    sub: "Share your invite link. Both of you get 200 bonus reward points upon signup.",
    icon: "account-plus",
    color: "#3b82f6",
    gradientStart: "#1e3a6e",
    gradientEnd: "#0f1f42",
    actionText: "Invite",
    type: "share",
  },
  {
    id: "rule-bday",
    title: "Birthday Celebration Gift",
    points: 500,
    sub: "Annual birthday bonus credited to your health wallet every year.",
    icon: "cake-variant",
    color: "#f5c842",
    gradientStart: "#4a3000",
    gradientEnd: "#2a1a00",
    actionText: "Claim",
    type: "claim",
  },
  {
    id: "rule-anniv",
    title: "Wedding Anniversary Bonus",
    points: 500,
    sub: "Enter your anniversary in your profile for a special yearly health reward.",
    icon: "ring",
    color: "#ec4899",
    gradientStart: "#4a0d2e",
    gradientEnd: "#2a0519",
    actionText: "Set Date",
    type: "profile",
  },
  {
    id: "rule-profile",
    title: "100% Profile Completion",
    points: 100,
    sub: "Add your blood group, height, emergency contact, and vitals goals.",
    icon: "card-account-details-star",
    color: "#14b8a6",
    gradientStart: "#0a3530",
    gradientEnd: "#041f1c",
    actionText: "Complete",
    type: "profile",
  },
  {
    id: "rule-habits",
    title: "Daily Habit & Step Streaks",
    points: 10,
    sub: "Earn 10 points for each completed habit checklist item and 10k daily steps.",
    icon: "checkbox-marked-circle-outline",
    color: "#8b5cf6",
    gradientStart: "#2d1b5e",
    gradientEnd: "#180d3a",
    actionText: "View Habits",
    type: "habits",
  },
  {
    id: "rule-spend",
    title: "Shop Cashback Points",
    points: 50,
    sub: "Earn 5% points back on all orders in the Urban Health Store.",
    icon: "shopping-outline",
    color: "#f97316",
    gradientStart: "#4a1d00",
    gradientEnd: "#2a0f00",
    actionText: "Visit Shop",
    type: "shop",
  },
];

// ─── Default activity ─────────────────────────────────────────────────────────
const DEFAULT_ACTIVITY: ActivityItem[] = [
  {
    title: "Completed Daily Walking Goal",
    pts: "+10 pts",
    time: "Today, 10:45 AM",
    positive: true,
    icon: "walk",
    iconColor: "#22c55e",
  },
  {
    title: "Logged Hydration Targets",
    pts: "+10 pts",
    time: "Today, 09:15 AM",
    positive: true,
    icon: "water",
    iconColor: "#3b82f6",
  },
  {
    title: "Took Morning Medication",
    pts: "+10 pts",
    time: "Today, 08:30 AM",
    positive: true,
    icon: "pill",
    iconColor: "#8b5cf6",
  },
  {
    title: "Initial Welcome Bonus",
    pts: "+500 pts",
    time: "Sep 11, 2026",
    positive: true,
    icon: "gift",
    iconColor: "#f5c842",
  },
];

// ─── Stat Pill ────────────────────────────────────────────────────────────────
function StatPill({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={s.statPill}>
      <Text style={[s.statValue, { color }]}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

// ─── Earn card with press animation ──────────────────────────────────────────
function EarnCard({ rule, onPress }: { rule: EarnRule; onPress: () => void }) {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 50, bounciness: 4 }).start();
  };
  const onPressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 6 }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable onPressIn={onPressIn} onPressOut={onPressOut} onPress={onPress} style={s.earnCard}>
        <LinearGradient colors={[rule.gradientStart, rule.gradientEnd]} style={s.earnIconWrap}>
          <MaterialCommunityIcons name={rule.icon} size={22} color={rule.color} />
        </LinearGradient>

        <View style={s.earnCardBody}>
          <View style={s.earnCardTitleRow}>
            <Text style={s.earnCardTitle} numberOfLines={1}>{rule.title}</Text>
            <View style={[s.pointsBadge, { backgroundColor: `${rule.color}20`, borderColor: `${rule.color}45` }]}>
              <Text style={[s.pointsBadgeText, { color: rule.color }]}>+{rule.points} pts</Text>
            </View>
          </View>
          <Text style={s.earnCardSub} numberOfLines={2}>{rule.sub}</Text>
        </View>

        <Pressable
          onPress={onPress}
          style={[s.earnActionBtn, { borderColor: `${rule.color}55`, backgroundColor: `${rule.color}18` }]}
          hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
        >
          <Text style={[s.earnActionBtnText, { color: rule.color }]}>{rule.actionText}</Text>
        </Pressable>
      </Pressable>
    </Animated.View>
  );
}

// ─── Activity row ─────────────────────────────────────────────────────────────
function ActivityRow({ item, isLast }: { item: ActivityItem; isLast: boolean }) {
  return (
    <View style={[s.actRow, !isLast && s.actRowBorder]}>
      <View style={[s.actIconWrap, { backgroundColor: `${item.iconColor}18` }]}>
        <MaterialCommunityIcons name={item.icon} size={18} color={item.iconColor} />
      </View>
      <View style={s.actBody}>
        <Text style={s.actTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={s.actTime}>{item.time}</Text>
      </View>
      <Text style={[s.actPts, item.positive ? s.actPtsPositive : s.actPtsNegative]}>
        {item.pts}
      </Text>
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function PointsScreen({ navigation }: Props) {
  const [points, setPoints] = useState(1250);
  const activity = DEFAULT_ACTIVITY;

  useEffect(() => {
    async function loadPoints() {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY_POINTS);
        if (raw) {
          const parsed = parseInt(raw, 10);
          if (!isNaN(parsed)) setPoints(parsed);
        } else {
          await AsyncStorage.setItem(STORAGE_KEY_POINTS, "1250");
        }
      } catch (e) {
        console.log("Error reading points:", e);
      }
    }
    loadPoints();
  }, []);

  const handleAction = async (rule: EarnRule) => {
    if (rule.type === "share") {
      try {
        await Share.share({
          message:
            "Join me on Urban Helpers Health App! Track real steps, energy score, sleep, and redeem free health gear with reward points. Use my referral code: URBAN200",
        });
      } catch (e) {
        console.log("Error sharing:", e);
      }
    } else if (rule.type === "profile") {
      navigation.navigate("Profile");
    } else if (rule.type === "habits") {
      navigation.navigate("SmartReminders");
    } else if (rule.type === "shop") {
      navigation.navigate("Shop");
    } else if (rule.type === "claim") {
      Alert.alert(
        "Birthday Reward 🎂",
        "Your birthday bonus will automatically credit on your birthday month! Ensure your birth date is saved in Profile.",
        [
          { text: "Later", style: "cancel" },
          { text: "Check Profile", onPress: () => navigation.navigate("Profile") },
        ]
      );
    }
  };

  // Tier calculation
  const tier = points >= 2000 ? "Gold" : points >= 1000 ? "Silver" : "Bronze";
  const tierColor = tier === "Gold" ? "#f5c842" : tier === "Silver" ? "#94a3b8" : "#cd7f32";
  const nextTierPoints = tier === "Bronze" ? 1000 : tier === "Silver" ? 2000 : null;
  const progressPct = nextTierPoints ? Math.min((points / nextTierPoints) * 100, 100) : 100;

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      {/* ── Header ──────────────────────────────────────────── */}
      <View style={s.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={s.headerIconBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="arrow-back" size={20} color={C.textPrimary} />
        </Pressable>

        <Text style={s.headerTitle}>Points & Rewards</Text>

        <Pressable
          onPress={() => navigation.navigate("Shop")}
          style={s.headerIconBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="bag-handle-outline" size={20} color={C.blue} />
        </Pressable>
      </View>

      {/* ── Content ─────────────────────────────────────────── */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>

        {/* ── Hero Balance Card ──────────────────────────────── */}
        <LinearGradient
          colors={["#1a0a3d", "#0e0628", "#120832"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.heroCard}
        >
          {/* Decorative glows */}
          <View style={s.glowTopLeft} />
          <View style={s.glowBottomRight} />

          {/* Badge + tier row */}
          <View style={s.heroBadgeRow}>
            <View style={s.heroBadgeLeft}>
              <MaterialCommunityIcons name="shield-star" size={12} color={C.purple} />
              <Text style={s.heroBadgeText}>HEALTH LOYALTY REWARDS</Text>
            </View>
            <View style={[s.tierChip, { borderColor: `${tierColor}50`, backgroundColor: `${tierColor}18` }]}>
              <MaterialCommunityIcons name="crown" size={10} color={tierColor} />
              <Text style={[s.tierChipText, { color: tierColor }]}>{tier} Tier</Text>
            </View>
          </View>

          {/* Balance + emblem */}
          <View style={s.heroBalanceRow}>
            <View style={s.heroBalanceLeft}>
              <Text style={s.heroBalanceLabel}>Your Balance</Text>
              <View style={s.heroBalanceNumRow}>
                <View style={s.heroCoinBadge}>
                  <MaterialCommunityIcons name="star-circle" size={22} color={C.gold} />
                </View>
                <Text style={s.heroBalance}>{points.toLocaleString()}</Text>
              </View>
              <Text style={s.heroValuation}>≈ ₹{points.toLocaleString()} store value</Text>
            </View>

            <LinearGradient colors={["#3b1fa0", "#1a0a5e"]} style={s.heroEmblem}>
              <MaterialCommunityIcons name="trophy-award" size={30} color="#fde68a" />
            </LinearGradient>
          </View>

          {/* Stats row */}
          <View style={s.heroStatsRow}>
            <StatPill label="Earned" value="1,750" color={C.green} />
            <View style={s.statsDivider} />
            <StatPill label="Redeemed" value="500" color={C.purple} />
            <View style={s.statsDivider} />
            <StatPill label="Expiring" value="0" color={C.orange} />
          </View>

          {/* Tier progress */}
          {nextTierPoints && (
            <View style={s.tierProgressWrap}>
              <View style={s.tierProgressHeader}>
                <Text style={s.tierProgressLabel}>
                  Progress to {tier === "Bronze" ? "Silver" : "Gold"} Tier
                </Text>
                <Text style={s.tierProgressCount}>
                  {points.toLocaleString()} / {nextTierPoints.toLocaleString()} pts
                </Text>
              </View>
              <View style={s.tierProgressTrack}>
                <LinearGradient
                  colors={[C.purple, C.blue]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[s.tierProgressFill, { width: `${progressPct}%` as any }]}
                />
              </View>
            </View>
          )}

          {/* Redeem CTA */}
          <Pressable
            onPress={() => navigation.navigate("Shop")}
            style={s.redeemBtn}
          >
            <LinearGradient
              colors={[C.gold, "#e6a800"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={s.redeemBtnGradient}
            >
              <Ionicons name="cart-outline" size={17} color="#1a0a00" />
              <Text style={s.redeemBtnText}>Redeem Products in Shop</Text>
              <Ionicons name="arrow-forward" size={15} color="#1a0a00" />
            </LinearGradient>
          </Pressable>
        </LinearGradient>

        {/* ── Section: Ways to Earn ────────────────────────── */}
        <View style={s.sectionHeaderWrap}>
          <View style={s.sectionTitleRow}>
            <View style={s.sectionAccent} />
            <Text style={s.sectionTitle}>Ways to Earn Points</Text>
          </View>
          <Text style={s.sectionSubtitle}>Complete actions to grow your rewards</Text>
        </View>

        <View style={s.earnList}>
          {EARN_RULES.map((rule) => (
            <EarnCard key={rule.id} rule={rule} onPress={() => handleAction(rule)} />
          ))}
        </View>

        {/* ── Section: Recent Activity ────────────────────── */}
        <View style={[s.sectionHeaderWrap, { marginTop: 28 }]}>
          <View style={s.sectionTitleRow}>
            <View style={[s.sectionAccent, { backgroundColor: C.green }]} />
            <Text style={s.sectionTitle}>Recent Activity</Text>
          </View>
          <Text style={s.sectionSubtitle}>Your latest points transactions</Text>
        </View>

        <View style={s.activityCard}>
          {activity.map((item, idx) => (
            <ActivityRow key={idx} item={item} isLast={idx === activity.length - 1} />
          ))}
        </View>

        {/* ── Pro Tip Banner ───────────────────────────────── */}
        <LinearGradient colors={["#0e2a1e", "#091a13"]} style={s.tipBanner}>
          <View style={s.tipIconWrap}>
            <Ionicons name="bulb-outline" size={18} color={C.teal} />
          </View>
          <View style={s.tipBody}>
            <Text style={s.tipTitle}>Pro Tip</Text>
            <Text style={s.tipText}>
              Complete daily habits consistently to earn up to 70 pts/day and unlock exclusive rewards faster.
            </Text>
          </View>
        </LinearGradient>

        {/* Bottom spacer for floating nav */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ── Bottom Navigation ──────────────────────────────── */}
      <SamsungBottomNav />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 52,
    paddingBottom: 12,
    backgroundColor: C.bg,
    borderBottomWidth: 1,
    borderBottomColor: C.divider,
  },
  headerIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.07)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: C.cardBorder,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 17,
    fontWeight: "700",
    color: C.textPrimary,
    letterSpacing: 0.2,
  },

  // Scroll
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },

  // Hero Card
  heroCard: {
    borderRadius: 28,
    padding: 22,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: "rgba(139, 92, 246, 0.28)",
    overflow: "hidden",
    position: "relative",
  },
  glowTopLeft: {
    position: "absolute",
    top: -40,
    left: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(139,92,246,0.18)",
  },
  glowBottomRight: {
    position: "absolute",
    bottom: -50,
    right: -30,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(59,130,246,0.12)",
  },
  heroBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  heroBadgeLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  heroBadgeText: {
    fontSize: 9.5,
    fontWeight: "800",
    color: "rgba(255,255,255,0.6)",
    letterSpacing: 1.2,
  },
  tierChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  tierChipText: {
    fontSize: 10.5,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  heroBalanceRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  heroBalanceLeft: {
    flex: 1,
  },
  heroBalanceLabel: {
    fontSize: 11,
    color: C.textSecondary,
    fontWeight: "600",
    letterSpacing: 0.3,
    marginBottom: 5,
  },
  heroBalanceNumRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    marginBottom: 5,
  },
  heroCoinBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(245,200,66,0.14)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(245,200,66,0.28)",
  },
  heroBalance: {
    fontSize: 44,
    fontWeight: "900",
    color: C.textPrimary,
    letterSpacing: -1,
    lineHeight: 48,
  },
  heroValuation: {
    fontSize: 12,
    color: "#fde68a",
    fontWeight: "600",
    letterSpacing: 0.1,
  },
  heroEmblem: {
    width: 68,
    height: 68,
    borderRadius: 34,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(163,113,255,0.38)",
    marginLeft: 12,
    marginTop: 4,
    flexShrink: 0,
  },

  // Stats row
  heroStatsRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.25)",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  statPill: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  statLabel: {
    fontSize: 10,
    color: C.textSecondary,
    fontWeight: "500",
    letterSpacing: 0.2,
  },
  statsDivider: {
    width: 1,
    height: 32,
    backgroundColor: "rgba(255,255,255,0.08)",
  },

  // Tier progress
  tierProgressWrap: {
    marginBottom: 18,
  },
  tierProgressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 7,
  },
  tierProgressLabel: {
    fontSize: 11,
    color: C.textSecondary,
    fontWeight: "600",
  },
  tierProgressCount: {
    fontSize: 10.5,
    color: C.purple,
    fontWeight: "700",
  },
  tierProgressTrack: {
    height: 5,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 10,
    overflow: "hidden",
  },
  tierProgressFill: {
    height: "100%",
    borderRadius: 10,
  },

  // Redeem CTA
  redeemBtn: {
    borderRadius: 16,
    overflow: "hidden",
  },
  redeemBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 13,
    paddingHorizontal: 20,
  },
  redeemBtnText: {
    fontSize: 13.5,
    fontWeight: "800",
    color: "#1a0a00",
    letterSpacing: 0.2,
  },

  // Section headers
  sectionHeaderWrap: {
    marginBottom: 14,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 3,
  },
  sectionAccent: {
    width: 4,
    height: 18,
    borderRadius: 2,
    backgroundColor: C.purple,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: C.textPrimary,
    letterSpacing: 0.1,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: C.textSecondary,
    marginLeft: 12,
    fontWeight: "500",
  },

  // Earn cards
  earnList: {
    gap: 10,
  },
  earnCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.card,
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: C.cardBorder,
    gap: 12,
  },
  earnIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  earnCardBody: {
    flex: 1,
    minWidth: 0,
  },
  earnCardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
    flexWrap: "wrap",
  },
  earnCardTitle: {
    fontSize: 13.5,
    fontWeight: "700",
    color: C.textPrimary,
    flexShrink: 1,
  },
  pointsBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    flexShrink: 0,
  },
  pointsBadgeText: {
    fontSize: 9.5,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  earnCardSub: {
    fontSize: 11,
    color: C.textSecondary,
    lineHeight: 15.5,
  },
  earnActionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
    flexShrink: 0,
    alignSelf: "center",
  },
  earnActionBtnText: {
    fontSize: 11.5,
    fontWeight: "700",
    letterSpacing: 0.1,
  },

  // Activity
  activityCard: {
    backgroundColor: C.card,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: C.cardBorder,
    paddingHorizontal: 16,
  },
  actRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    gap: 12,
  },
  actRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: C.divider,
  },
  actIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  actBody: {
    flex: 1,
    minWidth: 0,
  },
  actTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: C.textPrimary,
    marginBottom: 2,
  },
  actTime: {
    fontSize: 11,
    color: C.textMuted,
    fontWeight: "400",
  },
  actPts: {
    fontSize: 13.5,
    fontWeight: "800",
    letterSpacing: 0.1,
    flexShrink: 0,
  },
  actPtsPositive: {
    color: "#22c55e",
  },
  actPtsNegative: {
    color: "#f97316",
  },

  // Tip banner
  tipBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    borderRadius: 18,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "rgba(20,184,166,0.2)",
  },
  tipIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "rgba(20,184,166,0.15)",
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  tipBody: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#14b8a6",
    marginBottom: 3,
  },
  tipText: {
    fontSize: 11.5,
    color: C.textSecondary,
    lineHeight: 16,
    fontWeight: "400",
  },
});

