import React from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  sublabel?: string;
  dark?: boolean;
  accentColor?: string;
};

/** Small stat chip used for vitals/metrics (heart rate, hydration, sleep, etc.) */
export function StatTile({ icon, label, value, sublabel, dark, accentColor = "#2563EB" }: Props) {
  const textColor = dark ? "text-white" : "text-text-body";
  const labelColor = dark ? "text-text-secondary" : "text-text-muted";

  return (
    <View className={`rounded-card p-4 flex-1 ${dark ? "bg-surface-card" : "bg-background-card"}`}>
      <View
        className="w-9 h-9 rounded-pill items-center justify-center mb-2"
        style={{ backgroundColor: `${accentColor}22` }}
      >
        <Ionicons name={icon} size={18} color={accentColor} />
      </View>
      <Text className={`font-body text-xs ${labelColor}`}>{label}</Text>
      <Text className={`font-heading text-lg ${textColor}`}>{value}</Text>
      {sublabel ? <Text className={`font-body text-xs ${labelColor}`}>{sublabel}</Text> : null}
    </View>
  );
}
