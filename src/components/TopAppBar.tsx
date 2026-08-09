import React from "react";
import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

type Props = {
  title: string;
  dark?: boolean;
  showBack?: boolean;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightPress?: () => void;
};

/** Shared top app bar: optional back button, title, optional right action icon. */
export function TopAppBar({ title, dark, showBack = true, rightIcon, onRightPress }: Props) {
  const navigation = useNavigation();
  const textColor = dark ? "text-white" : "text-text-body";
  const iconColor = dark ? "#FFFFFF" : "#111827";

  return (
    <View className="flex-row items-center justify-between px-4 py-3">
      {showBack && navigation.canGoBack() ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => navigation.goBack()}
          className="w-10 h-10 items-center justify-center rounded-pill"
        >
          <Ionicons name="chevron-back" size={22} color={iconColor} />
        </Pressable>
      ) : (
        <View className="w-10 h-10" />
      )}
      <Text className={`font-heading-semibold text-lg flex-1 text-center ${textColor}`}>{title}</Text>
      {rightIcon ? (
        <Pressable
          accessibilityRole="button"
          onPress={onRightPress}
          className="w-10 h-10 items-center justify-center rounded-pill"
        >
          <Ionicons name={rightIcon} size={22} color={iconColor} />
        </Pressable>
      ) : (
        <View className="w-10 h-10" />
      )}
    </View>
  );
}
