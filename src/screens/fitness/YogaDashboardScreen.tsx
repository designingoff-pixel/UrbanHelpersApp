import React from "react";
import { ScrollView, Text, View } from "react-native";
import { ScreenContainer, Card, BottomNav, TopAppBar, StatTile } from "@/components";
import { mainTabs } from "@/navigation/navTabs";

const SESSIONS = [
  { name: "Morning Flow", duration: "20 min", level: "Beginner" },
  { name: "Power Yoga", duration: "35 min", level: "Advanced" },
  { name: "Evening Stretch", duration: "15 min", level: "All Levels" },
];

export default function YogaDashboardScreen() {
  return (
    <ScreenContainer>
      <TopAppBar title="Yoga" />
      <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 16 }}>
        <View className="flex-row gap-3 mb-5">
          <StatTile icon="flame" label="This Week" value="4 sessions" accentColor="#D97706" />
          <StatTile icon="time" label="Total Time" value="1h 40m" accentColor="#4338CA" />
        </View>
        <Text className="font-heading-semibold text-base text-text-body mb-3">Sessions</Text>
        <View className="gap-3">
          {SESSIONS.map((s) => (
            <Card key={s.name}>
              <Text className="font-body-medium text-base text-text-body">{s.name}</Text>
              <Text className="font-body text-sm text-text-muted">{s.duration} · {s.level}</Text>
            </Card>
          ))}
        </View>
      </ScrollView>
      <BottomNav tabs={mainTabs} active="YogaDashboard" />
    </ScreenContainer>
  );
}
