import React from "react";
import { ScrollView, Text, View } from "react-native";
import { ScreenContainer, Card, BottomNav, TopAppBar } from "@/components";
import { mainTabs } from "@/navigation/navTabs";

const MEALS = [
  { meal: "Breakfast", kcal: "350 kcal", macros: "P: 15g · C: 45g · F: 12g" },
  { meal: "Lunch", kcal: "650 kcal", macros: "P: 45g · C: 30g · F: 25g" },
  { meal: "Snacks", kcal: "450 kcal", macros: "P: 10g · C: 50g · F: 15g" },
  { meal: "Dinner", kcal: "Log your meal", macros: "" },
];

export default function AdvancedNutritionDashboardScreen() {
  return (
    <ScreenContainer>
      <TopAppBar title="Nutrition Detail" />
      <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 16 }}>
        <Card large className="items-center py-6 mb-5" style={{ backgroundColor: "#059669" }}>
          <Text className="font-body text-sm text-white/80">Today&apos;s Intake</Text>
          <Text className="font-heading text-2xl text-white mt-1">1,450 / 2,200 kcal</Text>
        </Card>
        <View className="gap-3">
          {MEALS.map((m) => (
            <Card key={m.meal}>
              <View className="flex-row justify-between">
                <Text className="font-body-medium text-base text-text-body">{m.meal}</Text>
                <Text className="font-body-medium text-sm text-text-body">{m.kcal}</Text>
              </View>
              {m.macros ? <Text className="font-body text-xs text-text-muted mt-1">{m.macros}</Text> : null}
            </Card>
          ))}
        </View>
      </ScrollView>
      <BottomNav tabs={mainTabs} active="AdvancedNutritionDashboard" />
    </ScreenContainer>
  );
}
