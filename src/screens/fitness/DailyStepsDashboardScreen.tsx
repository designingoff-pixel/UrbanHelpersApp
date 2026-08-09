import React from "react";
import { ScrollView, Text, View } from "react-native";
import { ScreenContainer, Card, BottomNav, TopAppBar } from "@/components";
import { mainTabs } from "@/navigation/navTabs";

export default function DailyStepsDashboardScreen() {
  return (
    <ScreenContainer>
      <TopAppBar title="Daily Steps" />
      <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 16 }}>
        <Card large className="items-center py-10 mb-5" style={{ backgroundColor: "#2563EB" }}>
          <Text className="font-heading text-4xl text-white">7,842</Text>
          <Text className="font-body text-sm text-white/80 mt-1">of 10,000 steps</Text>
          <View className="w-48 h-2 rounded-pill bg-white/20 mt-4 overflow-hidden">
            <View className="w-3/4 h-full rounded-pill bg-white" />
          </View>
        </Card>
        <View className="flex-row gap-3">
          <Card style={{ flex: 1 }}>
            <Text className="font-body text-xs text-text-muted">DISTANCE</Text>
            <Text className="font-heading-semibold text-lg text-text-body">5.4 km</Text>
          </Card>
          <Card style={{ flex: 1 }}>
            <Text className="font-body text-xs text-text-muted">ACTIVE TIME</Text>
            <Text className="font-heading-semibold text-lg text-text-body">1h 12m</Text>
          </Card>
        </View>
      </ScrollView>
      <BottomNav tabs={mainTabs} active="DailyStepsDashboard" />
    </ScreenContainer>
  );
}
