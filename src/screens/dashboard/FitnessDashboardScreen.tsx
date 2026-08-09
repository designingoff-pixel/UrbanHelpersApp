import React from "react";
import { ScrollView, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList, ScreenName } from "@/navigation/types";
import { ScreenContainer, Button, Card, BottomNav, TopAppBar } from "@/components";
import { mainTabs } from "@/navigation/navTabs";

type Props = NativeStackScreenProps<RootStackParamList, "FitnessDashboard">;

const CATEGORIES: { label: string; icon: keyof typeof Ionicons.glyphMap; target?: ScreenName }[] = [
  { label: "Running", icon: "walk" },
  { label: "Yoga", icon: "body", target: "YogaDashboard" },
  { label: "Gym", icon: "barbell", target: "GymDashboard" },
  { label: "Cycling", icon: "bicycle" },
  { label: "Meditation", icon: "leaf", target: "MeditationDashboard" },
  { label: "Dance", icon: "musical-notes" },
];

export default function FitnessDashboardScreen({ navigation }: Props) {
  return (
    <ScreenContainer>
      <TopAppBar title="Fitness" showBack={false} />
      <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 16 }}>
        <Text className="font-body text-sm text-text-muted mb-4">
          Track your progress and stay active.
        </Text>

        <Card large className="mb-5" style={{ backgroundColor: "#059669" }}>
          <Text className="font-body-medium text-xs text-white/70 mb-1">TODAY&apos;S FOCUS</Text>
          <Text className="font-heading text-xl text-white mb-2">Today&apos;s Fitness Goal</Text>
          <Text className="font-body text-sm text-white/80 mb-4">
            Keep moving toward a healthier lifestyle.
          </Text>
          <Button
            label="Start Workout"
            variant="secondary"
            fullWidth={false}
            onPress={() => navigation.navigate("GymDashboard")}
          />
        </Card>

        <Text className="font-heading-semibold text-base text-text-body mb-3">Categories</Text>
        <View className="flex-row flex-wrap gap-3">
          {CATEGORIES.map((c) => (
            <Card
              key={c.label}
              onPress={c.target ? () => navigation.navigate(c.target as never) : undefined}
              style={{ width: "30%" }}
            >
              <Ionicons name={c.icon} size={22} color="#059669" />
              <Text className="font-body-medium text-sm text-text-body mt-2">{c.label}</Text>
            </Card>
          ))}
        </View>
      </ScrollView>
      <BottomNav tabs={mainTabs} active="FitnessDashboard" />
    </ScreenContainer>
  );
}
