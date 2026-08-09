import React from "react";
import { ScrollView, Text, View } from "react-native";
import { ScreenContainer, Card, BottomNav, TopAppBar } from "@/components";
import { wellnessTabs } from "@/navigation/navTabs";

const AREAS = [
  { label: "Mindfulness", value: "80%" },
  { label: "Social Connection", value: "65%" },
  { label: "Sleep Quality", value: "90%" },
  { label: "Stress Level", value: "Low" },
];

export default function WellnessDashboardScreen() {
  return (
    <ScreenContainer>
      <TopAppBar title="Wellness" />
      <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 16 }}>
        <Text className="font-body text-sm text-text-muted mb-4">
          A holistic view of how you&apos;re doing.
        </Text>
        <View className="flex-row flex-wrap gap-3">
          {AREAS.map((a) => (
            <Card key={a.label} style={{ width: "47%" }}>
              <Text className="font-body text-xs text-text-muted">{a.label}</Text>
              <Text className="font-heading-semibold text-lg text-text-body">{a.value}</Text>
            </Card>
          ))}
        </View>
      </ScrollView>
      <BottomNav tabs={wellnessTabs} active="WellnessDashboard" />
    </ScreenContainer>
  );
}
