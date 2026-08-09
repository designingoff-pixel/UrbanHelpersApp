import React from "react";
import { ScrollView, Text, View } from "react-native";
import { ScreenContainer, Card, BottomNav, TopAppBar } from "@/components";
import { mainTabs } from "@/navigation/navTabs";

const LOG = [
  { date: "Aug 7, 2026", weight: "71.8 kg" },
  { date: "Jul 31, 2026", weight: "72.1 kg" },
  { date: "Jul 24, 2026", weight: "72.4 kg" },
];

export default function WeightLogDashboardScreen() {
  return (
    <ScreenContainer>
      <TopAppBar title="Weight Log" />
      <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 16 }}>
        <Card large className="items-center py-8 mb-5" style={{ backgroundColor: "#4338CA" }}>
          <Text className="font-body text-sm text-white/80">Current Weight</Text>
          <Text className="font-heading text-3xl text-white mt-1">71.8 kg</Text>
          <Text className="font-body text-sm text-white/80 mt-1">-0.6 kg this month</Text>
        </Card>
        <Text className="font-heading-semibold text-base text-text-body mb-3">History</Text>
        <View className="gap-3">
          {LOG.map((l) => (
            <Card key={l.date}>
              <View className="flex-row justify-between">
                <Text className="font-body text-sm text-text-muted">{l.date}</Text>
                <Text className="font-body-medium text-base text-text-body">{l.weight}</Text>
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>
      <BottomNav tabs={mainTabs} active="WeightLogDashboard" />
    </ScreenContainer>
  );
}
