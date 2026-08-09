import React from "react";
import { ScrollView, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/types";
import { ScreenContainer, Button, Card, BottomNav } from "@/components";
import { mainTabs } from "@/navigation/navTabs";

type Props = NativeStackScreenProps<RootStackParamList, "HomeDashboard">;

const PILLS = ["Home", "Health", "Fitness", "Home Care", "Family"];

const CARDS: {
  title: string;
  desc?: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  onPress: (nav: Props["navigation"]) => void;
}[] = [
  {
    title: "Energy Score",
    desc: "Understand how your day is shaping up.",
    icon: "flash",
    color: "#2563EB",
    onPress: (nav) => nav.navigate("FitnessDashboard"),
  },
  {
    title: "Heart Health",
    desc: "View your heart insights.",
    icon: "heart",
    color: "#DC2626",
    onPress: (nav) => nav.navigate("HealthDataAnalytics"),
  },
  {
    title: "Sleep",
    desc: "Track your sleep quality.",
    icon: "moon",
    color: "#4338CA",
    onPress: (nav) => nav.navigate("SleepDashboard"),
  },
  {
    title: "Nutrition",
    desc: "Build healthier eating habits.",
    icon: "nutrition",
    color: "#059669",
    onPress: (nav) => nav.navigate("NutritionDashboard"),
  },
  {
    title: "Family Care",
    desc: "Stay connected with loved ones.",
    icon: "people",
    color: "#D97706",
    onPress: (nav) => nav.navigate("FamilyDashboard"),
  },
  {
    title: "Medication",
    icon: "medkit",
    color: "#0D9488",
    onPress: (nav) => nav.navigate("MedicationCenter"),
  },
];

export default function HomeDashboardScreen({ navigation }: Props) {
  return (
    <ScreenContainer>
      <ScrollView className="flex-1 px-5 pt-4" contentContainerStyle={{ paddingBottom: 16 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-5">
          <View className="flex-row gap-2">
            {PILLS.map((p, i) => (
              <View
                key={p}
                className={`px-4 py-2 rounded-pill ${i === 0 ? "bg-brand-blue" : "bg-background-card border border-border-light"}`}
              >
                <Text className={`font-body-medium text-sm ${i === 0 ? "text-white" : "text-text-body"}`}>
                  {p}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>

        <Card large className="mb-5" style={{ backgroundColor: "#004AC6" }}>
          <Text className="font-heading text-xl text-white mb-2">
            Take care of your family&apos;s wellbeing
          </Text>
          <Text className="font-body text-sm text-white/80 mb-4">
            Manage health, appointments, reminders, and home services in one place.
          </Text>
          <Button
            label="Explore"
            variant="secondary"
            fullWidth={false}
            onPress={() => navigation.navigate("Discover")}
          />
        </Card>

        <View className="flex-row flex-wrap gap-3">
          {CARDS.map((c) => (
            <Card key={c.title} onPress={() => c.onPress(navigation)} style={{ width: "47%" }}>
              <View
                className="w-9 h-9 rounded-pill items-center justify-center mb-3"
                style={{ backgroundColor: `${c.color}22` }}
              >
                <Ionicons name={c.icon} size={18} color={c.color} />
              </View>
              <Text className="font-body-medium text-base text-text-body">{c.title}</Text>
              {c.desc ? <Text className="font-body text-xs text-text-muted mt-1">{c.desc}</Text> : null}
            </Card>
          ))}
        </View>
      </ScrollView>
      <BottomNav tabs={mainTabs} active="HomeDashboard" />
    </ScreenContainer>
  );
}
