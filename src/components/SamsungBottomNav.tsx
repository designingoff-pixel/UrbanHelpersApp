/**
 * SamsungBottomNav.tsx
 * Samsung Health One UI 2026 — 3-tab bottom navigation bar
 * Flat, no pill, accent color #2AC1BC teal
 */
import React from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type HealthTab = "Home" | "Together" | "Discover";

interface TabItem {
  label: HealthTab;
  outlineIcon: keyof typeof Ionicons.glyphMap;
  solidIcon: keyof typeof Ionicons.glyphMap;
}

const TABS: TabItem[] = [
  { label: "Home",     outlineIcon: "home-outline",    solidIcon: "home"    },
  { label: "Together", outlineIcon: "people-outline",  solidIcon: "people"  },
  { label: "Discover", outlineIcon: "compass-outline", solidIcon: "compass" },
];

export const ACCENT = "#2AC1BC";
export const INACTIVE = "#8C8C8C";

interface Props {
  activeTab: HealthTab;
  onTabPress: (tab: HealthTab) => void;
}

export default function SamsungBottomNav({ activeTab, onTabPress }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[s.bar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {TABS.map((tab) => {
        const isActive = activeTab === tab.label;
        return (
          <Pressable
            key={tab.label}
            onPress={() => onTabPress(tab.label)}
            style={s.tabBtn}
            android_ripple={null}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
          >
            <Ionicons
              name={isActive ? tab.solidIcon : tab.outlineIcon}
              size={24}
              color={isActive ? ACCENT : INACTIVE}
            />
            <Text style={[s.label, isActive && s.labelActive]}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  bar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    height: 60,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#EAEAEA",
    // flat — no shadow, no elevation
    elevation: 0,
    shadowOpacity: 0,
  },
  tabBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    minHeight: 48,
  },
  label: {
    fontSize: 10,
    fontWeight: "500",
    color: INACTIVE,
    letterSpacing: 0.1,
  },
  labelActive: {
    color: ACCENT,
    fontWeight: "600",
  },
});
