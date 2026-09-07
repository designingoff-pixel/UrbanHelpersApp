import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { RootStackParamList } from "@/navigation/types";
import { useNavigation } from "@react-navigation/native";

export type HealthTab = "Home" | "Together" | "Discover" | "Fitness";

export const NAV_TABS: {
  icon: keyof typeof Ionicons.glyphMap;
  route: keyof RootStackParamList;
  label: HealthTab;
  hasDot: boolean;
}[] = [
  { icon: "home",            route: "HomeDashboard",    label: "Home",     hasDot: false },
  { icon: "flag-outline",    route: "FamilyDashboard",  label: "Together", hasDot: true },
  { icon: "compass-outline", route: "Discover",         label: "Discover", hasDot: true },
  { icon: "calendar-outline",route: "FitnessDashboard", label: "Fitness",  hasDot: true },
];

export interface Props {
  activeRoute?: keyof RootStackParamList;
  activeTab?: HealthTab;
  onTabPress?: (tab: HealthTab) => void;
}

export default function SamsungBottomNav({ activeRoute, activeTab, onTabPress }: Props) {
  const navigation = useNavigation<any>();

  return (
    <View style={s.bottomContainer} pointerEvents="box-none">
      {/* Main navigation pill */}
      <View style={s.navBar}>
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
              <View style={[s.navIconWrapper, isActive && s.navIconWrapperActive]}>
                <Ionicons
                  name={isActive ? (n.icon === "home" ? "home" : n.icon.replace("-outline", "")) as any : (n.icon as any)}
                  size={20}
                  color={isActive ? "#FFFFFF" : "rgba(255,255,255,0.7)"}
                />
                {n.hasDot && <View style={s.tabOrangeDot} />}
              </View>
              <Text style={[s.navLabel, isActive && s.navLabelActive]}>
                {n.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Floating scanner button on right */}
      <Pressable
        style={s.scannerBtn}
        onPress={() => navigation.navigate("Discover")}
        accessibilityLabel="Scan or Add"
      >
        <Ionicons name="scan-outline" size={22} color="rgba(255,255,255,0.9)" />
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  bottomContainer: {
    position: "absolute",
    bottom: 16,
    left: 14,
    right: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  navBar: {
    flex: 1,
    flexDirection: "row",
    height: 62,
    backgroundColor: "rgba(28, 33, 40, 0.94)",
    borderRadius: 36,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    elevation: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.45,
    shadowRadius: 15,
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 6,
  },
  navBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
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
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  tabOrangeDot: {
    position: "absolute",
    top: 2,
    right: 8,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#ff6a00",
  },
  navLabel: {
    fontSize: 10,
    color: "rgba(255,255,255,0.6)",
    marginTop: 2,
    fontWeight: "500",
  },
  navLabelActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  scannerBtn: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "rgba(35, 42, 53, 0.95)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    elevation: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
});

