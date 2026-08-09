import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList, ScreenName } from "@/navigation/types";
import { ScreenContainer, Card, BottomNav, TopAppBar } from "@/components";
import { NavTab } from "@/components/BottomNav";

type Props = NativeStackScreenProps<RootStackParamList, "AICoach">;

const coachTabs: NavTab[] = [
  { label: "Coach", icon: "chatbubble-ellipses", screen: "AICoach" },
  { label: "Health", icon: "heart", screen: "HealthDashboard" },
  { label: "Challenges", icon: "trophy" },
  { label: "Badges", icon: "ribbon" },
];

const SUGGESTIONS: { label: string; desc: string; icon: keyof typeof Ionicons.glyphMap; target: ScreenName }[] = [
  { label: "Hydration", desc: "Drink 500ml now", icon: "water", target: "HydrationDashboard" },
  { label: "Exercise", desc: "15min Yoga suggested", icon: "body", target: "YogaDashboard" },
  { label: "Nutrition", desc: "Healthy dinner ideas", icon: "nutrition", target: "NutritionDashboard" },
  { label: "Medication", desc: "Lisinopril due in 1hr", icon: "medkit", target: "MedicineAlarm" },
];

export default function AICoachScreen({ navigation }: Props) {
  return (
    <ScreenContainer dark>
      <TopAppBar title="AI Coach" dark showBack={false} />
      <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 16 }}>
        <Card dark className="mb-5 items-center py-8">
          <Ionicons name="sparkles" size={40} color="#B4C5FF" />
          <Text className="font-heading text-xl text-white mt-3">AI Assistant</Text>
          <Text className="font-body text-sm text-text-secondary">Active & Ready to Help</Text>
        </Card>

        <Card dark className="mb-3">
          <Text className="font-body text-sm text-text-accent italic">
            &quot;Good morning! You&apos;re 2,000 steps ahead of yesterday. I recommend focusing on
            hydration today.&quot;
          </Text>
        </Card>

        <Pressable className="items-center py-4 mb-5 rounded-pill bg-surface-card active:opacity-80">
          <Ionicons name="mic" size={20} color="#B4C5FF" />
          <Text className="font-body-medium text-xs text-text-secondary mt-1">TAP TO SPEAK</Text>
        </Pressable>

        <Text className="font-heading-semibold text-base text-white mb-3">Daily Focus</Text>
        <View className="flex-row flex-wrap gap-3 mb-5">
          {SUGGESTIONS.map((s) => (
            <Card
              key={s.label}
              dark
              onPress={() => navigation.navigate(s.target as never)}
              style={{ width: "47%" }}
            >
              <Ionicons name={s.icon} size={20} color="#B4C5FF" />
              <Text className="font-body-medium text-sm text-white mt-2">{s.label}</Text>
              <Text className="font-body text-xs text-text-secondary">{s.desc}</Text>
            </Card>
          ))}
        </View>

        <Text className="font-heading-semibold text-base text-white mb-3">Today&apos;s Goals</Text>
        <View className="gap-2">
          <Card dark>
            <Text className="font-body text-sm text-text-secondary">Complete 10,000 steps</Text>
            <Text className="font-body-medium text-base text-white">7,500 / 10k</Text>
          </Card>
          <Card dark>
            <Text className="font-body text-sm text-text-secondary">Drink 2.5L Water</Text>
            <Text className="font-body-medium text-base text-white">1.5 / 2.5L</Text>
          </Card>
          <Card dark>
            <Text className="font-body text-sm text-text-secondary">Sleep 8 Hours</Text>
            <Text className="font-body-medium text-base text-white">6.5 / 8H</Text>
          </Card>
        </View>
      </ScrollView>
      <BottomNav tabs={coachTabs} active="AICoach" dark />
    </ScreenContainer>
  );
}
