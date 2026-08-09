import React from "react";
import { ScrollView, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ScreenContainer, Card, BottomNav, TopAppBar } from "@/components";
import { careTabs } from "@/navigation/navTabs";

const CHECKLIST = [
  { label: "Brush teeth (morning)", icon: "happy" as const, done: true },
  { label: "Wash hands before meals", icon: "hand-left" as const, done: true },
  { label: "Shower", icon: "water" as const, done: false },
  { label: "Brush teeth (night)", icon: "moon" as const, done: false },
];

export default function PersonalHygieneScreen() {
  return (
    <ScreenContainer>
      <TopAppBar title="Personal Hygiene" />
      <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 16 }}>
        <Text className="font-body text-sm text-text-muted mb-4">Today&apos;s hygiene checklist.</Text>
        <View className="gap-3">
          {CHECKLIST.map((c) => (
            <Card key={c.label}>
              <View className="flex-row items-center">
                <Ionicons name={c.icon} size={20} color="#0D9488" />
                <Text className="font-body-medium text-base text-text-body ml-3 flex-1">{c.label}</Text>
                <Ionicons
                  name={c.done ? "checkmark-circle" : "ellipse-outline"}
                  size={22}
                  color={c.done ? "#059669" : "#9CA3AF"}
                />
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>
      <BottomNav tabs={careTabs} active="PersonalHygiene" />
    </ScreenContainer>
  );
}
