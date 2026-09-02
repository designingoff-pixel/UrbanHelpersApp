import React from "react";
import { ScrollView, Text, Pressable, StyleSheet, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

export type Category = "Activity" | "Sleep" | "Vitals" | "Mindfulness" | "Nutrition";

interface ChipItem {
  id: Category;
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  color: string;
}

const CHIPS: ChipItem[] = [
  { id: "Activity",    label: "Activity",    icon: "directions-run",   color: "#1E88E5" }, // Blue
  { id: "Sleep",       label: "Sleep",       icon: "bedtime",          color: "#5E35B1" }, // Deep Purple
  { id: "Vitals",      label: "Vitals",      icon: "favorite",         color: "#E53935" }, // Red
  { id: "Mindfulness", label: "Mindfulness", icon: "self-improvement", color: "#00897B" }, // Teal
  { id: "Nutrition",   label: "Nutrition",   icon: "restaurant",       color: "#F4511E" }, // Deep Orange
];

interface Props {
  activeCategory: Category;
  onSelect: (category: Category) => void;
}

export default function TopCategoryChips({ activeCategory, onSelect }: Props) {
  return (
    <View style={s.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.scrollContent}
        bounces={false}
      >
        {CHIPS.map((chip) => {
          const isActive = activeCategory === chip.id;
          return (
            <Pressable
              key={chip.id}
              onPress={() => onSelect(chip.id)}
              style={[
                s.chip,
                isActive ? { backgroundColor: chip.color } : s.chipInactive,
              ]}
              android_ripple={{ color: "rgba(0,0,0,0.1)", borderless: false }}
            >
              <MaterialIcons
                name={chip.icon}
                size={18}
                color={isActive ? "#FFFFFF" : "#8C8C8C"}
                style={s.icon}
              />
              <Text style={[s.label, isActive ? s.labelActive : s.labelInactive]}>
                {chip.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    height: 52, // 36dp chip + 8dp top/bottom padding
    justifyContent: "center",
  },
  scrollContent: {
    paddingHorizontal: 16, // 16dp left padding on first chip
    alignItems: "center",
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    height: 36,
    borderRadius: 20, // pill shape
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8, // 8dp gap between chips
  },
  chipInactive: {
    backgroundColor: "#F2F2F2",
    borderWidth: 1,
    borderColor: "#EAEAEA", // optional 1px outline as requested
  },
  icon: {
    marginRight: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
  },
  labelActive: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  labelInactive: {
    color: "#3D3D3D",
  },
});
