import React from "react";
import { ScrollView, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/types";
import { ScreenContainer, Button, Card, BottomNav, TopAppBar, StatTile } from "@/components";
import { NavTab } from "@/components/BottomNav";

type Props = NativeStackScreenProps<RootStackParamList, "HealthDashboard">;

const healthTabs: NavTab[] = [
  { label: "Home", icon: "home", screen: "HomeDashboard" },
  { label: "SOS", icon: "alert-circle", screen: "EmergencyAssistance" },
  { label: "Daily", icon: "today" },
  { label: "Profile", icon: "person" },
  { label: "Health", icon: "heart", screen: "HealthDashboard" },
];

const TABS = ["Overview", "Vitals", "Medication", "Reports"];

export default function HealthDashboardScreen({ navigation }: Props) {
  return (
    <ScreenContainer>
      <TopAppBar title="Health" showBack={false} />
      <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 16 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
          <View className="flex-row gap-2">
            {TABS.map((t, i) => (
              <View
                key={t}
                className={`px-4 py-2 rounded-pill ${i === 0 ? "bg-brand-blue" : "bg-background-card border border-border-light"}`}
              >
                <Text className={`font-body-medium text-sm ${i === 0 ? "text-white" : "text-text-body"}`}>
                  {t}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>

        <Card large className="mb-5" style={{ backgroundColor: "#2563EB" }}>
          <Text className="font-heading text-xl text-white mb-2">Your Health Journey</Text>
          <Text className="font-body text-sm text-white/80 mb-4">
            Track every important aspect of your health in one place.
          </Text>
          <Button
            label="View Summary"
            variant="secondary"
            fullWidth={false}
            onPress={() => navigation.navigate("HealthDataAnalytics")}
          />
        </Card>

        <Text className="font-heading-semibold text-base text-text-body mb-3">Today&apos;s Vitals</Text>
        <View className="flex-row gap-3 mb-5">
          <StatTile icon="heart" label="HEART RATE" value="72 bpm" sublabel="Normal" accentColor="#DC2626" />
          <StatTile icon="water" label="OXYGEN" value="98%" sublabel="Healthy" accentColor="#2563EB" />
          <StatTile icon="pulse" label="PRESSURE" value="120/80" sublabel="Normal" accentColor="#059669" />
        </View>

        <Text className="font-heading-semibold text-base text-text-body mb-3">Daily Wellness</Text>
        <View className="flex-row gap-3 mb-5">
          <Card onPress={() => navigation.navigate("HydrationDashboard")} style={{ flex: 1 }}>
            <Text className="font-body text-xs text-text-muted">HYDRATION</Text>
            <Text className="font-heading text-lg text-text-body">2.1 L</Text>
          </Card>
          <Card onPress={() => navigation.navigate("SleepDashboard")} style={{ flex: 1 }}>
            <Text className="font-body text-xs text-text-muted">SLEEP</Text>
            <Text className="font-heading text-lg text-text-body">7h 45m</Text>
            <Text className="font-body text-xs text-text-muted">Excellent</Text>
          </Card>
        </View>

        <Text className="font-heading-semibold text-base text-text-body mb-3">AI & Reminders</Text>
        <View className="gap-3">
          <Card onPress={() => navigation.navigate("AICoach")}>
            <Text className="font-body-medium text-base text-text-body mb-1">AI Health Coach</Text>
            <Text className="font-body text-sm text-text-muted">
              Receive personalized health suggestions based on your recent vitals.
            </Text>
          </Card>
          <Card onPress={() => navigation.navigate("MedicineAlarm")}>
            <Text className="font-body-medium text-base text-text-body">Vitamin D</Text>
            <Text className="font-body text-sm text-text-muted">Today, 8:30 PM · Mark Taken</Text>
          </Card>
        </View>
      </ScrollView>
      <BottomNav tabs={healthTabs} active="HealthDashboard" />
    </ScreenContainer>
  );
}
