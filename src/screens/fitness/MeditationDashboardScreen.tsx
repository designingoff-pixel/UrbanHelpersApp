import React from "react";
import { ScrollView, Text, View } from "react-native";
import { ScreenContainer, Card, BottomNav, TopAppBar } from "@/components";
import { NavTab } from "@/components/BottomNav";

const meditationTabs: NavTab[] = [
  { label: "Coach", icon: "chatbubble-ellipses", screen: "AICoach" },
  { label: "Health", icon: "heart", screen: "HealthDashboard" },
  { label: "Challenges", icon: "trophy" },
  { label: "Badges", icon: "ribbon" },
];

const SESSIONS = [
  { name: "Calm Breathing", duration: "5 min" },
  { name: "Deep Focus", duration: "10 min" },
  { name: "Sleep Wind-down", duration: "15 min" },
];

export default function MeditationDashboardScreen() {
  return (
    <ScreenContainer dark>
      <TopAppBar title="Meditation" dark />
      <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 16 }}>
        <Text className="font-body text-sm text-text-secondary mb-4">
          Find your calm with a guided session.
        </Text>
        <View className="gap-3">
          {SESSIONS.map((s) => (
            <Card key={s.name} dark>
              <Text className="font-body-medium text-base text-white">{s.name}</Text>
              <Text className="font-body text-sm text-text-secondary">{s.duration}</Text>
            </Card>
          ))}
        </View>
      </ScrollView>
      <BottomNav tabs={meditationTabs} active="MeditationDashboard" dark />
    </ScreenContainer>
  );
}
