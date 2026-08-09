import React from "react";
import { ScrollView, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/types";
import { ScreenContainer, Card, BottomNav, TopAppBar } from "@/components";
import { mainTabs } from "@/navigation/navTabs";

type Props = NativeStackScreenProps<RootStackParamList, "Discover">;

const ARTICLES: { title: string; category: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { title: "5 morning habits for better energy", category: "Wellness", icon: "sunny" },
  { title: "Understanding your sleep cycle", category: "Sleep", icon: "moon" },
  { title: "Home services worth booking this month", category: "Home Care", icon: "construct" },
  { title: "Strength training for beginners", category: "Fitness", icon: "barbell" },
];

export default function DiscoverScreen() {
  return (
    <ScreenContainer>
      <TopAppBar title="Discover" showBack={false} />
      <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 16 }}>
        <Text className="font-body text-sm text-text-muted mb-4">
          Curated wellness reads, picked for you.
        </Text>
        <View className="gap-3">
          {ARTICLES.map((a) => (
            <Card key={a.title}>
              <View className="flex-row items-center">
                <View className="w-11 h-11 rounded-pill bg-accent-blue/10 items-center justify-center mr-3">
                  <Ionicons name={a.icon} size={20} color="#2563EB" />
                </View>
                <View className="flex-1">
                  <Text className="font-body text-xs text-text-muted">{a.category}</Text>
                  <Text className="font-body-medium text-base text-text-body">{a.title}</Text>
                </View>
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>
      <BottomNav tabs={mainTabs} active="Discover" />
    </ScreenContainer>
  );
}
