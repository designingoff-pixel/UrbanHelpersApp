import React from "react";
import { ScrollView, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ScreenContainer, Card, BottomNav, TopAppBar } from "@/components";
import { careTabs } from "@/navigation/navTabs";

const TIPS = [
  { title: "Seasonal Flu Alert", desc: "Flu cases rising in your area. Consider a booster.", icon: "medical" as const },
  { title: "Air Quality", desc: "Moderate AQI today — limit prolonged outdoor exertion.", icon: "cloud" as const },
  { title: "Hydration Reminder", desc: "Warmer weather this week — increase water intake.", icon: "water" as const },
];

export default function HealthPrecautionsScreen() {
  return (
    <ScreenContainer>
      <TopAppBar title="Health Precautions" />
      <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 16 }}>
        <View className="gap-3">
          {TIPS.map((t) => (
            <Card key={t.title}>
              <View className="flex-row items-center">
                <View className="w-11 h-11 rounded-pill bg-accent-amber/10 items-center justify-center mr-3">
                  <Ionicons name={t.icon} size={20} color="#D97706" />
                </View>
                <View className="flex-1">
                  <Text className="font-body-medium text-base text-text-body">{t.title}</Text>
                  <Text className="font-body text-sm text-text-muted">{t.desc}</Text>
                </View>
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>
      <BottomNav tabs={careTabs} active="HealthPrecautions" />
    </ScreenContainer>
  );
}
