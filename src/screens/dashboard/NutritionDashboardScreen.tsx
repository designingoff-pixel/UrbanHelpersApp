import React from "react";
import { ScrollView, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/types";
import { ScreenContainer, Button, Card, BottomNav, TopAppBar } from "@/components";
import { NavTab } from "@/components/BottomNav";

type Props = NativeStackScreenProps<RootStackParamList, "NutritionDashboard">;

const nutritionTabs: NavTab[] = [
  { label: "Home", icon: "home", screen: "HomeDashboard" },
  { label: "Health", icon: "heart", screen: "HealthDashboard" },
  { label: "Log", icon: "clipboard" },
  { label: "Plans", icon: "list" },
  { label: "Profile", icon: "person" },
];

export default function NutritionDashboardScreen({ navigation }: Props) {
  return (
    <ScreenContainer>
      <TopAppBar title="Nutrition" showBack={false} />
      <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 16 }}>
        <Card large className="mb-5" style={{ backgroundColor: "#059669" }}>
          <Text className="font-heading text-xl text-white mb-2">Eat Better Every Day</Text>
          <Text className="font-body text-sm text-white/80 mb-4">
            Track your meals, discover healthy recipes, and achieve your wellness goals.
          </Text>
          <Button
            label="Log Meal"
            variant="secondary"
            fullWidth={false}
            onPress={() => navigation.navigate("AdvancedNutritionDashboard")}
          />
        </Card>

        <View className="flex-row gap-3">
          <Card onPress={() => navigation.navigate("AdvancedNutritionDashboard")} style={{ flex: 2 }}>
            <Text className="font-body-medium text-base text-text-body mb-2">Today&apos;s Meals</Text>
            <Text className="font-heading text-lg text-text-body">1,450 / 2,200 kcal</Text>
            <Text className="font-body text-xs text-text-muted mt-1">
              Breakfast · Lunch · Snacks logged
            </Text>
          </Card>
          <Card onPress={() => navigation.navigate("HydrationDashboard")} style={{ flex: 1 }}>
            <Text className="font-body-medium text-base text-text-body mb-2">Hydration</Text>
            <Text className="font-heading text-lg text-text-body">1.5 / 2.5 L</Text>
            <Text className="font-body text-xs text-text-muted mt-1">60%</Text>
          </Card>
        </View>
      </ScrollView>
      <BottomNav tabs={nutritionTabs} active="NutritionDashboard" />
    </ScreenContainer>
  );
}
