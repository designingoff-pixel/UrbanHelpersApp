import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { RootStackParamList } from "@/navigation/types";
import { useNavigation } from "@react-navigation/native";

import { useTheme } from "@/context/ThemeContext";

export type HealthTab = "Home" | "Service" | "Together" | "Discover" | "Fitness";

export const NAV_TABS: {
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
  route: keyof RootStackParamList;
  label: HealthTab;
  hasDot: boolean;
}[] = [
  { icon: "home-outline",     activeIcon: "home",     route: "HomeDashboard",     label: "Home",     hasDot: false },
  { icon: "grid-outline",     activeIcon: "grid",     route: "ServicesDashboard", label: "Service",  hasDot: false },
  { icon: "people-outline",   activeIcon: "people",   route: "FamilyDashboard",   label: "Together", hasDot: true },
  { icon: "compass-outline",  activeIcon: "compass",  route: "Discover",          label: "Discover", hasDot: true },
  { icon: "barbell-outline",  activeIcon: "barbell",  route: "FitnessDashboard",  label: "Fitness",  hasDot: true },
];

export interface Props {
  activeRoute?: keyof RootStackParamList;
  activeTab?: HealthTab;
  onTabPress?: (tab: HealthTab) => void;
}

export default function SamsungBottomNav({ activeRoute, activeTab, onTabPress }: Props) {
  const navigation = useNavigation<any>();
  const { colors, isDark } = useTheme();
  const isShopActive = activeRoute === "Shop";

  const inactiveIconColor = isDark ? "rgba(255,255,255,0.65)" : "#64748b";
  const activeIconColor = isDark ? "#FFFFFF" : "#0f172a";
  const activeWrapperBg = isDark ? "rgba(255,255,255,0.16)" : "rgba(0,0,0,0.08)";
  const inactiveLabelColor = isDark ? "rgba(255,255,255,0.6)" : "#64748b";
  const activeLabelColor = isDark ? "#FFFFFF" : "#0f172a";

  return (
    <View style={s.bottomContainer} pointerEvents="box-none">
      {/* Main navigation pill */}
      <View style={[s.navBar, { backgroundColor: isDark ? "rgba(24, 28, 36, 0.95)" : "#ffffff", borderColor: colors.cardBorder }]}>
        {NAV_TABS.map((n) => {
          const isActive = activeRoute ? activeRoute === n.route : activeTab === n.label;
          return (
            <Pressable
              key={n.route}
              onPress={() => {
                if (onTabPress) {
                  onTabPress(n.label);
                } else if (!isActive) {
                  navigation.navigate(n.route);
                }
              }}
              style={s.navBtn}
            >
              <View style={[s.navIconWrapper, isActive && { backgroundColor: activeWrapperBg }]}>
                <Ionicons
                  name={isActive ? n.activeIcon : n.icon}
                  size={19}
                  color={isActive ? activeIconColor : inactiveIconColor}
                />
                {n.hasDot && <View style={s.tabOrangeDot} />}
              </View>
              <Text
                style={[s.navLabel, { color: isActive ? activeLabelColor : inactiveLabelColor }, isActive && s.navLabelActive]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {n.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Floating Shop button on right (replaces scan icon) */}
      <Pressable
        style={[
          s.shopBtn,
          {
            backgroundColor: isShopActive ? "#2563eb" : (isDark ? "rgba(35, 42, 53, 0.96)" : "#ffffff"),
            borderColor: isShopActive ? "#60a5fa" : colors.cardBorder,
          },
          isShopActive && s.shopBtnActive
        ]}
        onPress={() => navigation.navigate("Shop")}
        accessibilityLabel="Shop"
      >
        <Ionicons
          name={isShopActive ? "bag-handle" : "bag-handle-outline"}
          size={21}
          color={isShopActive ? "#ffffff" : (isDark ? "rgba(255,255,255,0.9)" : "#2563eb")}
        />
        <Text style={[s.shopBtnLabel, { color: isShopActive ? "#ffffff" : (isDark ? "rgba(255,255,255,0.75)" : "#2563eb") }, isShopActive && s.shopBtnLabelActive]}>Shop</Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  bottomContainer: {
    position: "absolute",
    bottom: 14,
    left: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  navBar: {
    flex: 1,
    flexDirection: "row",
    height: 60,
    backgroundColor: "rgba(24, 28, 36, 0.95)",
    borderRadius: 32,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    elevation: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.45,
    shadowRadius: 15,
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  navBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 2,
  },
  navIconWrapper: {
    width: 36,
    height: 26,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  navIconWrapperActive: {
    backgroundColor: "rgba(255,255,255,0.16)",
  },
  tabOrangeDot: {
    position: "absolute",
    top: 2,
    right: 4,
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#ff6a00",
  },
  navLabel: {
    fontSize: 9,
    color: "rgba(255,255,255,0.6)",
    marginTop: 1,
    fontWeight: "500",
    letterSpacing: -0.2,
  },
  navLabelActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  shopBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(35, 42, 53, 0.96)",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.15)",
    elevation: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    gap: 1,
  },
  shopBtnActive: {
    backgroundColor: "#2563eb",
    borderColor: "#60a5fa",
  },
  shopBtnLabel: {
    fontSize: 8.5,
    color: "rgba(255,255,255,0.75)",
    fontWeight: "700",
    letterSpacing: 0.2,
    textTransform: "uppercase",
  },
  shopBtnLabelActive: {
    color: "#ffffff",
  },
});
