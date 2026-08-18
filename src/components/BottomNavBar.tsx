/**
 * BottomNavBar — shared animated bottom navigation bar
 * Used across all health module screens.
 * Renders the 5 standard tabs (Home, Health, Discover, Fitness, Profile)
 * with the active tab highlighted and labeled.
 *
 * Usage:
 *   <BottomNavBar navigation={navigation} active="HealthDashboard" />
 */
import React from "react";
import { View, Text, Pressable, StyleSheet, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/theme/colors";

const { width: W } = Dimensions.get("window");

const TABS = [
  { icon: "home-outline" as const,           route: "HomeDashboard" as const,    label: "Home" },
  { icon: "heart-outline" as const,          route: "HealthDashboard" as const,  label: "Health" },
  { icon: "compass-outline" as const,        route: "Discover" as const,         label: "Discover" },
  { icon: "barbell-outline" as const,        route: "FitnessDashboard" as const, label: "Fitness" },
  { icon: "person-outline" as const,         route: "Profile" as const,          label: "Profile" },
];

interface BottomNavBarProps {
  navigation: { navigate: (route: string) => void };
  active: string;
}

export function BottomNavBar({ navigation, active }: BottomNavBarProps) {
  return (
    <View style={s.navBar}>
      {TABS.map((tab) => {
        const isActive = active === tab.route;
        return (
          <Pressable
            key={tab.route}
            onPress={() => { if (!isActive) navigation.navigate(tab.route); }}
            style={s.navBtn}
          >
            <Ionicons
              name={tab.icon}
              size={22}
              color={isActive ? colors.primary : colors.text.secondary}
            />
            <Text style={[s.navLabel, isActive && s.navLabelActive]}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  navBar: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    flexDirection: "row",
    height: 72,
    marginHorizontal: 12,
    marginBottom: 12,
    backgroundColor: "rgba(10,22,36,0.97)",
    borderRadius: 28,
    borderWidth: 1,
    borderColor: colors.glass.border,
    elevation: 16,
    alignItems: "center",
  },
  navBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  navLabel: {
    fontSize: 10,
    color: colors.text.secondary,
    marginTop: 3,
    fontWeight: "500",
  },
  navLabelActive: {
    color: colors.primary,
    fontWeight: "700",
  },
});
