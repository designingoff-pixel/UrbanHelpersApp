import React from "react";
import { ScrollView, Text, View } from "react-native";
import { ScreenContainer, Card, BottomNav, TopAppBar, StatTile } from "@/components";
import { NavTab } from "@/components/BottomNav";

const caloriesTabs: NavTab[] = [
  { label: "Home", icon: "home", screen: "HomeDashboard" },
  { label: "Health", icon: "heart", screen: "HealthDashboard" },
  { label: "Log", icon: "clipboard" },
  { label: "Plans", icon: "list" },
  { label: "Profile", icon: "person" },
];

export default function CaloriesDashboardScreen() {
  return (
    <ScreenContainer>
      <TopAppBar title="Calories" />
      <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 16 }}>
        <Card large className="items-center py-8 mb-5" style={{ backgroundColor: "#D97706" }}>
          <Text className="font-body text-sm text-white/80">Burned Today</Text>
          <Text className="font-heading text-3xl text-white mt-1">540 kcal</Text>
        </Card>
        <View className="flex-row gap-3">
          <StatTile icon="restaurant" label="CONSUMED" value="1,450 kcal" accentColor="#059669" />
          <StatTile icon="flame" label="BURNED" value="540 kcal" accentColor="#D97706" />
          <StatTile icon="trending-up" label="NET" value="910 kcal" accentColor="#2563EB" />
        </View>
      </ScrollView>
      <BottomNav tabs={caloriesTabs} active="CaloriesDashboard" />
    </ScreenContainer>
  );
}
