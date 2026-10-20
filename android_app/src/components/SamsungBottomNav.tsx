import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { RootStackParamList } from "@/navigation/types";
import { useNavigation } from "@react-navigation/native";

import { useTheme } from "@/context/ThemeContext";

export type HealthTab = "Home" | "Service" | "Health" | "Together" | "Discover" | "Fitness";

export const NAV_TABS: {
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
  route: keyof RootStackParamList;
  label: HealthTab;
  hasDot: boolean;
}[] = [
  { icon: "construct-outline", activeIcon: "construct", route: "ServicesDashboard", label: "Service", hasDot: false },
  { icon: "heart-outline",     activeIcon: "heart",     route: "HomeDashboard",     label: "Health",   hasDot: false },
  { icon: "people-outline",    activeIcon: "people",    route: "FamilyDashboard",   label: "Together", hasDot: true },
  { icon: "compass-outline",   activeIcon: "compass",   route: "Discover",          label: "Discover", hasDot: true },
  { icon: "barbell-outline",   activeIcon: "barbell",   route: "FitnessDashboard",  label: "Fitness",  hasDot: true },
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

  // High-contrast accessibility colors so elderly users can clearly identify current page
  const activeColor = isDark ? "#00E5FF" : "#0F766E";
  const activePillBg = isDark ? "#0F766E" : "#0F766E";
  const inactiveIconColor = isDark ? "rgba(255,255,255,0.48)" : "#64748B";
  const inactiveLabelColor = isDark ? "rgba(255,255,255,0.52)" : "#64748B";

  return (
    <View style={s.bottomContainer} pointerEvents="box-none">
      {/* Main navigation pill (100% solid background prevents page content bleeding through) */}
      <View
        style={[
          s.navBar,
          {
            backgroundColor: isDark ? "#0F172A" : "#FFFFFF",
            borderColor: isDark ? "rgba(255, 255, 255, 0.16)" : "#E2E8F0",
          },
        ]}
      >
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
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={`${n.label} tab${isActive ? ", currently selected" : ""}`}
            >
              {/* Senior-friendly Top Active Indicator Notch */}
              {isActive && (
                <View style={[s.activeTopNotch, { backgroundColor: activeColor }]} />
              )}

              {/* Icon Capsule Pill: prominent solid highlight when active */}
              <View
                style={[
                  s.navIconWrapper,
                  isActive
                    ? [
                        s.navIconWrapperActive,
                        {
                          backgroundColor: activePillBg,
                          borderColor: isDark ? "#00E5FF" : "#0D9488",
                        },
                      ]
                    : null,
                ]}
              >
                <Ionicons
                  name={isActive ? n.activeIcon : n.icon}
                  size={isActive ? 20 : 19}
                  color={isActive ? "#FFFFFF" : inactiveIconColor}
                />
                {n.hasDot && !isActive && <View style={s.tabOrangeDot} />}
              </View>

              {/* Large, bold, high-contrast label */}
              <Text
                style={[
                  s.navLabel,
                  { color: isActive ? activeColor : inactiveLabelColor },
                  isActive && s.navLabelActive,
                ]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {n.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Floating Shop button on right */}
      <Pressable
        style={[
          s.shopBtn,
          {
            backgroundColor: isShopActive
              ? "#0F766E"
              : isDark
              ? "#1E293B"
              : "#FFFFFF",
            borderColor: isShopActive
              ? "#00E5FF"
              : isDark
              ? "rgba(255, 255, 255, 0.16)"
              : "#E2E8F0",
          },
          isShopActive && s.shopBtnActive,
        ]}
        onPress={() => navigation.navigate("Shop")}
        accessibilityRole="button"
        accessibilityLabel="Shop"
      >
        {isShopActive && (
          <View style={[s.activeShopNotch, { backgroundColor: "#00E5FF" }]} />
        )}
        <Ionicons
          name={isShopActive ? "bag-handle" : "bag-handle-outline"}
          size={isShopActive ? 22 : 20}
          color={isShopActive ? "#FFFFFF" : isDark ? "rgba(255,255,255,0.85)" : "#0F766E"}
        />
        <Text
          style={[
            s.shopBtnLabel,
            { color: isShopActive ? "#FFFFFF" : isDark ? "rgba(255,255,255,0.75)" : "#0F766E" },
            isShopActive && s.shopBtnLabelActive,
          ]}
        >
          Shop
        </Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  bottomContainer: {
    position: "absolute",
    bottom: 12,
    left: 10,
    right: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    zIndex: 9999,
  },
  navBar: {
    flex: 1,
    flexDirection: "row",
    height: 64,
    borderRadius: 32,
    borderWidth: 1.5,
    elevation: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 18,
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 4,
    overflow: "hidden",
  },
  navBtn: {
    flex: 1,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    paddingTop: 4,
    paddingBottom: 4,
  },
  activeTopNotch: {
    position: "absolute",
    top: 0,
    width: 26,
    height: 3.5,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
    shadowColor: "#00E5FF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 4,
  },
  navIconWrapper: {
    width: 44,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  navIconWrapperActive: {
    borderWidth: 1.5,
    shadowColor: "#00BCD4",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.45,
    shadowRadius: 6,
    elevation: 5,
  },
  tabOrangeDot: {
    position: "absolute",
    top: 2,
    right: 7,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FF5722",
  },
  navLabel: {
    fontSize: 10,
    marginTop: 2,
    fontWeight: "600",
    letterSpacing: -0.1,
  },
  navLabelActive: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.1,
  },
  shopBtn: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 1.5,
    elevation: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    gap: 1,
    position: "relative",
  },
  activeShopNotch: {
    position: "absolute",
    top: 0,
    width: 20,
    height: 3,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
  shopBtnActive: {
    shadowColor: "#00E5FF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  shopBtnLabel: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  shopBtnLabelActive: {
    fontWeight: "900",
  },
});
