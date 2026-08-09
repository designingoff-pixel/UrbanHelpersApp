import React from "react";
import { ScrollView, Text, View } from "react-native";
import { ScreenContainer, Card, BottomNav, TopAppBar } from "@/components";
import { wellnessTabs } from "@/navigation/navTabs";

export default function HydrationDashboardScreen() {
  return (
    <ScreenContainer>
      <TopAppBar title="Hydration" />
      <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 16 }}>
        <Card large className="items-center py-8 mb-5" style={{ backgroundColor: "#2563EB" }}>
          <Text className="font-body text-sm text-white/80">Today&apos;s Intake</Text>
          <Text className="font-heading text-3xl text-white mt-1">1.5 / 2.5 L</Text>
          <View className="w-48 h-2 rounded-pill bg-white/20 mt-4 overflow-hidden">
            <View className="w-3/5 h-full rounded-pill bg-white" />
          </View>
        </Card>
        <View className="flex-row gap-2">
          {["250ml", "500ml", "750ml"].map((amt) => (
            <Card key={amt} style={{ flex: 1 }}>
              <Text className="font-body-medium text-sm text-text-body text-center">+ {amt}</Text>
            </Card>
          ))}
        </View>
      </ScrollView>
      <BottomNav tabs={wellnessTabs} active="HydrationDashboard" />
    </ScreenContainer>
  );
}
