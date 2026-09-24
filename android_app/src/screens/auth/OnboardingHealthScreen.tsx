import React from "react";
import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/types";
import { ScreenContainer, Button } from "@/components";

type Props = NativeStackScreenProps<RootStackParamList, "OnboardingHealth">;

export default function OnboardingHealthScreen({ navigation }: Props) {
  return (
    <ScreenContainer>
      <View className="flex-1 p-6 justify-between">
        <View className="flex-row justify-end">
          <Pressable onPress={() => navigation.navigate("SignIn")}>
            <Text className="font-body-medium text-text-muted">Skip</Text>
          </Pressable>
        </View>

        <View className="items-center">
          <Ionicons name="pulse" size={96} color="#059669" />
          <Text className="font-heading text-2xl text-text-body mt-6 text-center">
            Track your health,{"\n"}stay ahead of tomorrow
          </Text>
          <Text className="font-body text-base text-text-muted mt-3 text-center">
            Monitor vitals, log symptoms, and get AI-powered insights on your wellbeing.
          </Text>
        </View>

        <View>
          <View className="flex-row justify-center gap-2 mb-6">
            <View className="w-6 h-1.5 rounded-pill bg-brand-blue" />
            <View className="w-1.5 h-1.5 rounded-pill bg-text-muted/30" />
            <View className="w-1.5 h-1.5 rounded-pill bg-text-muted/30" />
          </View>
          <Button label="Next" onPress={() => navigation.navigate("OnboardingHomeServices")} />
        </View>
      </View>
    </ScreenContainer>
  );
}
