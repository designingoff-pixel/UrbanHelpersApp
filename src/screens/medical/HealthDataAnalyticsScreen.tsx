import React from "react";
import { ScrollView, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/types";
import { ScreenContainer, Button, Card, BottomNav, TopAppBar, StatTile } from "@/components";
import { medicalTabs } from "@/navigation/navTabs";

type Props = NativeStackScreenProps<RootStackParamList, "HealthDataAnalytics">;

export default function HealthDataAnalyticsScreen({ navigation }: Props) {
  return (
    <ScreenContainer>
      <TopAppBar title="Health Overview" />
      <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 16 }}>
        <Card large className="mb-5" style={{ backgroundColor: "#2563EB" }}>
          <Text className="font-heading text-xl text-white mb-2">Health Overview</Text>
          <Text className="font-body text-sm text-white/80 mb-4">
            Your complete health insights in one place. Monitor your vitals, track your progress,
            and optimize your well-being with precision analytics.
          </Text>
          <Button
            label="View Detailed Report"
            variant="secondary"
            fullWidth={false}
            onPress={() => navigation.navigate("LabReportsHub")}
          />
        </Card>

        <Text className="font-heading-semibold text-base text-text-body mb-3">Health Summary</Text>
        <View className="flex-row flex-wrap gap-3">
          <StatTile icon="heart" label="Heart Rate" value="72 bpm" accentColor="#DC2626" />
          <StatTile icon="pulse" label="Blood Pressure" value="120/80" accentColor="#059669" />
          <StatTile icon="water" label="SpO2" value="98%" accentColor="#2563EB" />
          <StatTile icon="moon" label="Sleep" value="7h 20m" accentColor="#4338CA" />
        </View>
      </ScrollView>
      <BottomNav tabs={medicalTabs} active="HealthDataAnalytics" />
    </ScreenContainer>
  );
}
