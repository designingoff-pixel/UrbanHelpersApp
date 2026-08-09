import React from "react";
import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList, ScreenName } from "@/navigation/types";

export type NavTab = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  /** Omit for tabs with no destination screen yet (mirrors unwired tabs in the Figma prototype, e.g. Profile). */
  screen?: ScreenName;
};

type Props = {
  tabs: NavTab[];
  active: ScreenName;
  dark?: boolean;
};

/**
 * Renders whichever tab set a given screen uses in the Figma design
 * (screens intentionally use different tab groups, e.g. Home/Health/Fitness/Discover
 * vs. Health/History/Alarm/Reminders) — mirrors the per-screen custom nav bars.
 */
export function BottomNav({ tabs, active, dark }: Props) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const bg = dark ? "bg-surface-card" : "bg-background-card";
  const inactiveColor = dark ? "#C3C6D7" : "#6B7280";
  const activeColor = dark ? "#B4C5FF" : "#004AC6";

  return (
    <View className={`flex-row justify-around items-center py-2 px-2 border-t border-border-subtle ${bg}`}>
      {tabs.map((tab) => {
        const isActive = tab.screen === active;
        return (
          <Pressable
            key={tab.label}
            accessibilityRole="button"
            accessibilityLabel={tab.label}
            disabled={!tab.screen}
            onPress={() => {
              if (!isActive && tab.screen) navigation.navigate(tab.screen as never);
            }}
            className="items-center justify-center flex-1 py-1"
          >
            <Ionicons name={tab.icon} size={22} color={isActive ? activeColor : inactiveColor} />
            <Text
              className="font-body text-xs mt-1"
              style={{ color: isActive ? activeColor : inactiveColor }}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
