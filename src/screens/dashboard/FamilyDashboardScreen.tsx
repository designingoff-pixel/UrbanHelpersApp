import React from "react";
import { ScrollView, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/types";
import { ScreenContainer, Card, BottomNav, TopAppBar } from "@/components";
import { NavTab } from "@/components/BottomNav";

type Props = NativeStackScreenProps<RootStackParamList, "FamilyDashboard">;

const familyTabs: NavTab[] = [
  { label: "Family", icon: "people", screen: "FamilyDashboard" },
  { label: "Health", icon: "heart", screen: "HealthDashboard" },
  { label: "Calendar", icon: "calendar" },
  { label: "Timeline", icon: "time" },
];

const MEMBERS = [
  { name: "Sarah (Spouse)", status: "All good" },
  { name: "Liam (Son, 8)", status: "Vaccination due" },
  { name: "Grandma Rose", status: "Med reminder set" },
];

export default function FamilyDashboardScreen() {
  return (
    <ScreenContainer dark>
      <TopAppBar title="Family" dark showBack={false} />
      <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 16 }}>
        <Text className="font-body text-sm text-text-secondary mb-4">
          Stay connected with your loved ones and manage care plans.
        </Text>
        <View className="gap-3">
          {MEMBERS.map((m) => (
            <Card key={m.name} dark>
              <View className="flex-row items-center">
                <View className="w-11 h-11 rounded-pill bg-accent-indigo/20 items-center justify-center mr-3">
                  <Ionicons name="person" size={20} color="#B4C5FF" />
                </View>
                <View className="flex-1">
                  <Text className="font-body-medium text-base text-white">{m.name}</Text>
                  <Text className="font-body text-sm text-text-secondary">{m.status}</Text>
                </View>
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>
      <BottomNav tabs={familyTabs} active="FamilyDashboard" dark />
    </ScreenContainer>
  );
}
