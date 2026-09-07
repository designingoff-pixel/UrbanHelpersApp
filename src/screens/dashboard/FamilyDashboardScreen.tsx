import React from "react";
import { Text, View, Pressable, StyleSheet, StatusBar, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import Animated, { FadeInDown } from "react-native-reanimated";
import { RootStackParamList } from "@/navigation/types";
import SamsungBottomNav from "@/components/SamsungBottomNav";

type Props = NativeStackScreenProps<RootStackParamList, "FamilyDashboard">;

export default function FamilyDashboardScreen({ navigation }: Props) {
  const handleGetStarted = () => {
    Alert.alert(
      "Together",
      "Coming soon!\nConnecting with your contacts and participating in activity challenges will be available in an upcoming update.",
      [{ text: "OK" }]
    );
  };

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      {/* ── Top Bar ──────────────────────────────────────────── */}
      <View style={s.header}>
        <Text style={s.pageTitle}>Together</Text>
        <Pressable
          style={s.menuBtn}
          onPress={() => navigation.navigate("Notifications" as any)}
        >
          <Ionicons name="ellipsis-vertical" size={20} color="rgba(255,255,255,0.85)" />
          <View style={s.menuDotBadge} />
        </Pressable>
      </View>

      {/* ── Centered Content ─────────────────────────────────── */}
      <View style={s.centerContainer}>
        <Animated.View entering={FadeInDown.duration(400).springify()} style={s.contentWrap}>
          <Text style={s.headline}>Team up for your health</Text>
          <Text style={s.subText}>
            Compete in activity-based challenges with friends and others around the world.
          </Text>

          <Pressable
            onPress={handleGetStarted}
            style={({ pressed }) => [s.getStartedBtn, pressed && s.getStartedBtnPressed]}
          >
            <Text style={s.getStartedText}>Get started</Text>
          </Pressable>
        </Animated.View>
      </View>

      {/* ── Fixed Samsung Bottom Nav (Together Active) ──────── */}
      <SamsungBottomNav activeRoute="FamilyDashboard" />
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#000000",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 52,
    paddingBottom: 16,
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
    top: 7,
    right: 7,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ff6a00",
    borderWidth: 1.5,
    borderColor: "#000000",
  },

  // Centered Content
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 28,
    paddingBottom: 80, // Clearance above bottom nav
  },
  contentWrap: {
    alignItems: "center",
    maxWidth: 340,
  },
  headline: {
    fontSize: 24,
    fontWeight: "700",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  subText: {
    fontSize: 15,
    color: "rgba(255,255,255,0.72)",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 36,
  },
  getStartedBtn: {
    backgroundColor: "#2c2f38",
    paddingVertical: 14,
    paddingHorizontal: 54,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 200,
  },
  getStartedBtnPressed: {
    backgroundColor: "#3a3e4a",
    transform: [{ scale: 0.98 }],
  },
  getStartedText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
  },
});
