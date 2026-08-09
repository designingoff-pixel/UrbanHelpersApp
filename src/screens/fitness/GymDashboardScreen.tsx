import React from "react";
import { ScrollView, Text, View } from "react-native";
import { ScreenContainer, Card, BottomNav, TopAppBar } from "@/components";
import { NavTab } from "@/components/BottomNav";

const gymTabs: NavTab[] = [
  { label: "Home", icon: "home", screen: "HomeDashboard" },
  { label: "Health", icon: "heart", screen: "HealthDashboard" },
  { label: "Fitness", icon: "barbell", screen: "FitnessDashboard" },
  { label: "Meds", icon: "medkit" },
];

const WORKOUT = [
  { name: "Bench Press", sets: "4 x 8" },
  { name: "Squats", sets: "4 x 10" },
  { name: "Deadlift", sets: "3 x 6" },
  { name: "Pull-ups", sets: "3 x max" },
];

export default function GymDashboardScreen() {
  return (
    <ScreenContainer dark>
      <TopAppBar title="Gym" dark />
      <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 16 }}>
        <Text className="font-heading-semibold text-base text-white mb-3">Today&apos;s Workout</Text>
        <View className="gap-3">
          {WORKOUT.map((w) => (
            <Card key={w.name} dark>
              <View className="flex-row justify-between items-center">
                <Text className="font-body-medium text-base text-white">{w.name}</Text>
                <Text className="font-body text-sm text-text-secondary">{w.sets}</Text>
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>
      <BottomNav tabs={gymTabs} active="GymDashboard" dark />
    </ScreenContainer>
  );
}
