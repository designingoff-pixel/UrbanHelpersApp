import React from "react";
import { ScrollView, Switch, Text, View } from "react-native";
import { ScreenContainer, Card, BottomNav, TopAppBar } from "@/components";
import { careTabs } from "@/navigation/navTabs";

const REMINDERS = [
  { name: "Morning Medication", time: "8:00 AM", enabled: true },
  { name: "Hydration Check-in", time: "Every 2h", enabled: true },
  { name: "Evening Walk", time: "6:30 PM", enabled: false },
];

export default function SmartRemindersScreen() {
  return (
    <ScreenContainer dark>
      <TopAppBar title="Smart Reminders" dark />
      <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 16 }}>
        <View className="gap-3">
          {REMINDERS.map((r) => (
            <Card key={r.name} dark>
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="font-body-medium text-base text-white">{r.name}</Text>
                  <Text className="font-body text-sm text-text-secondary">{r.time}</Text>
                </View>
                <Switch value={r.enabled} trackColor={{ true: "#B4C5FF" }} />
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>
      <BottomNav tabs={careTabs} active="SmartReminders" dark />
    </ScreenContainer>
  );
}
