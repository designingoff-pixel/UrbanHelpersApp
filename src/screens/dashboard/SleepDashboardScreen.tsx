import React from "react";
import { ScrollView, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/types";
import { ScreenContainer, Card, BottomNav, TopAppBar, StatTile } from "@/components";
import { NavTab } from "@/components/BottomNav";

type Props = NativeStackScreenProps<RootStackParamList, "SleepDashboard">;

const sleepTabs: NavTab[] = [
  { label: "Home", icon: "home", screen: "HomeDashboard" },
  { label: "Health", icon: "heart", screen: "HealthDashboard" },
  { label: "Insights", icon: "bar-chart" },
  { label: "Profile", icon: "person" },
];

export default function SleepDashboardScreen() {
  return (
    <ScreenContainer dark>
      <TopAppBar title="Sleep" dark showBack={false} />
      <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 16 }}>
        <Card dark large className="items-center py-8 mb-5">
          <Text className="font-body text-sm text-text-secondary">Last Night</Text>
          <Text className="font-heading text-3xl text-white mt-1">7h 45m</Text>
          <Text className="font-body text-sm text-accent-teal mt-1">Excellent Quality</Text>
        </Card>

        <View className="flex-row gap-3">
          <StatTile icon="moon" label="DEEP SLEEP" value="2h 10m" dark accentColor="#4338CA" />
          <StatTile icon="bed" label="LIGHT SLEEP" value="4h 30m" dark accentColor="#0D9488" />
          <StatTile icon="alarm" label="AWAKE" value="15m" dark accentColor="#D97706" />
        </View>
      </ScrollView>
      <BottomNav tabs={sleepTabs} active="SleepDashboard" dark />
    </ScreenContainer>
  );
}
