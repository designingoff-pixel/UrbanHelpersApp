import React from "react";
import { ScrollView, Text, View } from "react-native";
import { ScreenContainer, Card, BottomNav, TopAppBar } from "@/components";
import { NavTab } from "@/components/BottomNav";

const physioTabs: NavTab[] = [
  { label: "Home", icon: "home", screen: "HomeDashboard" },
  { label: "Activity", icon: "pulse" },
  { label: "Profile", icon: "person" },
];

const EXERCISES = [
  { name: "Shoulder Mobility", sets: "3 sets x 12 reps" },
  { name: "Knee Strengthening", sets: "3 sets x 10 reps" },
  { name: "Lower Back Stretch", sets: "2 sets x 30 sec" },
];

export default function PhysiotherapyDashboardScreen() {
  return (
    <ScreenContainer>
      <TopAppBar title="Physiotherapy" />
      <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 16 }}>
        <Text className="font-body text-sm text-text-muted mb-4">
          Your prescribed recovery plan for this week.
        </Text>
        <View className="gap-3">
          {EXERCISES.map((e) => (
            <Card key={e.name}>
              <Text className="font-body-medium text-base text-text-body">{e.name}</Text>
              <Text className="font-body text-sm text-text-muted">{e.sets}</Text>
            </Card>
          ))}
        </View>
      </ScrollView>
      <BottomNav tabs={physioTabs} active="PhysiotherapyDashboard" />
    </ScreenContainer>
  );
}
