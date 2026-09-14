import React, { useState, useEffect } from "react";
import {
  ScrollView,
  Text,
  View,
  Pressable,
  StyleSheet,
  Share,
  Alert,
  StatusBar,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/types";
import SamsungBottomNav from "@/components/SamsungBottomNav";

type Props = NativeStackScreenProps<RootStackParamList, "Points">;

const STORAGE_KEY_POINTS = "@urban_health_reward_points_v1";

interface EarnRule {
  id: string;
  title: string;
  points: number;
  sub: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  color: string;
  actionText: string;
  type: "share" | "profile" | "claim" | "habits" | "shop";
}

const EARN_RULES: EarnRule[] = [
  {
    id: "rule-ref",
    title: "Invite Friends & Family",
    points: 200,
    sub: "Share your invite link. Both of you get 200 bonus reward points upon signup.",
    icon: "account-plus",
    color: "#3b82f6",
    actionText: "Invite",
    type: "share",
  },
  {
    id: "rule-bday",
    title: "Birthday Celebration Gift",
    points: 500,
    sub: "Annual birthday bonus credited to your health wallet every year.",
    icon: "cake-variant",
    color: "#f59e0b",
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
    actionText: "Set Date",
    type: "profile",
  },
  {
    id: "rule-profile",
    title: "100% Profile Completion",
    points: 100,
    sub: "Add your blood group, height, emergency contact, and vitals goals.",
    icon: "card-account-details-star",
    color: "#10b981",
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
    actionText: "View Habits",
    type: "habits",
  },
  {
    id: "rule-spend",
    title: "Shop Cashback Points",
    points: 50,
    sub: "Earn 5% points back on all orders in the Urban Health Store.",
    icon: "shopping-outline",
    color: "#06b6d4",
    actionText: "Visit Shop",
    type: "shop",
  },
];

export default function PointsScreen({ navigation }: Props) {
  const [points, setPoints] = useState(1250);

  useEffect(() => {
    async function loadPoints() {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY_POINTS);
        if (raw) {
          setPoints(parseInt(raw, 10));
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
        "Birthday Reward",
        "Your birthday bonus will automatically credit on your birthday month! Ensure your birth date is saved in Profile.",
        [
          { text: "Later", style: "cancel" },
          { text: "Check Profile", onPress: () => navigation.navigate("Profile") },
        ]
      );
    }
  };

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0c0e12" />

      {/* Header */}
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} style={s.iconBtn}>
          <Ionicons name="arrow-back" size={22} color="#ffffff" />
        </Pressable>
        <Text style={s.headerTitle}>Points & Rewards</Text>
        <Pressable onPress={() => navigation.navigate("Shop")} style={s.iconBtn}>
          <Ionicons name="bag-handle-outline" size={22} color="#60a5fa" />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {/* Hero Points Wallet */}
        <LinearGradient
          colors={["#451a03", "#78350f", "#b45309"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.hero}
        >
          <View style={s.heroTop}>
            <View>
              <Text style={s.heroSubtitle}>HEALTH LOYALTY REWARDS</Text>
              <Text style={s.heroBalance}>{points.toLocaleString()}</Text>
              <Text style={s.heroValuation}>≈ ₹{points.toLocaleString()} store value</Text>
            </View>
            <View style={s.coinCircle}>
              <MaterialCommunityIcons name="coin" size={38} color="#fbbf24" />
            </View>
          </View>

          {/* Shop Redeem Button */}
          <Pressable
            style={s.redeemBtn}
            onPress={() => navigation.navigate("Shop")}
          >
            <Ionicons name="cart" size={18} color="#1c1917" />
            <Text style={s.redeemBtnText}>Redeem Products in Shop</Text>
            <Ionicons name="arrow-forward" size={16} color="#1c1917" />
          </Pressable>
        </LinearGradient>

        {/* Section Title */}
        <Text style={s.sectionTitle}>Ways to Earn Points</Text>

        {/* Earning Rules List */}
        <View style={s.rulesList}>
          {EARN_RULES.map((r) => (
            <View key={r.id} style={s.ruleCard}>
              <View style={[s.ruleIconWrap, { backgroundColor: `${r.color}22` }]}>
                <MaterialCommunityIcons name={r.icon} size={24} color={r.color} />
              </View>

              <View style={{ flex: 1, marginLeft: 12 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Text style={s.ruleTitle}>{r.title}</Text>
                  <View style={s.pointsBadge}>
                    <Text style={s.pointsBadgeText}>+{r.points} pts</Text>
                  </View>
                </View>
                <Text style={s.ruleSub}>{r.sub}</Text>
              </View>

              <Pressable style={s.actionBtn} onPress={() => handleAction(r)}>
                <Text style={s.actionBtnText}>{r.actionText}</Text>
              </Pressable>
            </View>
          ))}
        </View>

        {/* Recent Ledger History */}
        <Text style={[s.sectionTitle, { marginTop: 22 }]}>Recent Activity</Text>
        <View style={s.ledgerCard}>
          {[
            { title: "Completed Daily Walking Goal", pts: "+10 pts", time: "Today, 10:45 AM", positive: true },
            { title: "Logged Hydration Targets", pts: "+10 pts", time: "Today, 09:15 AM", positive: true },
            { title: "Took Morning Medication", pts: "+10 pts", time: "Today, 08:30 AM", positive: true },
            { title: "Initial Welcome Bonus", pts: "+500 pts", time: "Sep 11, 2026", positive: true },
          ].map((item, idx) => (
            <View key={idx} style={[s.ledgerRow, idx > 0 && s.ledgerRowBorder]}>
              <View style={s.ledgerLeft}>
                <Text style={s.ledgerTitle}>{item.title}</Text>
                <Text style={s.ledgerTime}>{item.time}</Text>
              </View>
              <Text style={s.ledgerPts}>{item.pts}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Nav */}
      <SamsungBottomNav />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0c0e12" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 52,
    paddingBottom: 14,
  },
  headerTitle: { fontSize: 22, fontWeight: "800", color: "#ffffff" },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.08)",
    justifyContent: "center",
    alignItems: "center",
  },
  scroll: { paddingHorizontal: 16 },

  // Hero
  hero: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: "rgba(251, 191, 36, 0.3)",
  },
  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  heroSubtitle: {
    fontSize: 10,
    fontWeight: "800",
    color: "rgba(255,255,255,0.75)",
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  heroBalance: {
    fontSize: 38,
    fontWeight: "900",
    color: "#ffffff",
    lineHeight: 44,
  },
  heroValuation: {
    fontSize: 12,
    color: "rgba(255,255,255,0.85)",
    marginTop: 2,
    fontWeight: "600",
  },
  coinCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(251, 191, 36, 0.4)",
  },
  redeemBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#fbbf24",
    paddingVertical: 12,
    borderRadius: 14,
  },
  redeemBtnText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1c1917",
  },

  // Section
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 12,
  },
  rulesList: {
    gap: 10,
  },
  ruleCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1c2128",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  ruleIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  ruleTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
  },
  pointsBadge: {
    backgroundColor: "rgba(245, 158, 11, 0.18)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  pointsBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#fbbf24",
  },
  ruleSub: {
    fontSize: 11,
    color: "rgba(255,255,255,0.5)",
    lineHeight: 15,
    marginTop: 3,
  },
  actionBtn: {
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    marginLeft: 8,
  },
  actionBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#ffffff",
  },

  // Ledger
  ledgerCard: {
    backgroundColor: "#181c24",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  ledgerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  ledgerRowBorder: {
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.05)",
  },
  ledgerLeft: {
    flex: 1,
  },
  ledgerTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#ffffff",
  },
  ledgerTime: {
    fontSize: 10,
    color: "rgba(255,255,255,0.4)",
    marginTop: 2,
  },
  ledgerPts: {
    fontSize: 13,
    fontWeight: "800",
    color: "#34d399",
  },
});
