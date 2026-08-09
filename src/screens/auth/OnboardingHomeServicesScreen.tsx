import React from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/types";
import { ScreenContainer, Button } from "@/components";

type Props = NativeStackScreenProps<RootStackParamList, "OnboardingHomeServices">;

export default function OnboardingHomeServicesScreen({ navigation }: Props) {
  return (
    <ScreenContainer>
      <View className="flex-1 p-6 justify-between">
        <View className="items-center mt-8">
          <Ionicons name="construct" size={96} color="#D97706" />
          <Text className="font-heading text-2xl text-text-body mt-6 text-center">
            Professional services at{"\n"}your fingertips
          </Text>
          <Text className="font-body text-base text-text-muted mt-3 text-center">
            Book electricians, plumbers, cleaning, appliance repair, gardening and more.
          </Text>
        </View>

        <View>
          <View className="flex-row justify-center gap-2 mb-6">
            <View className="w-1.5 h-1.5 rounded-pill bg-text-muted/30" />
            <View className="w-6 h-1.5 rounded-pill bg-brand-blue" />
            <View className="w-1.5 h-1.5 rounded-pill bg-text-muted/30" />
          </View>
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Button
                label="Back"
                variant="secondary"
                onPress={() => navigation.navigate("OnboardingHealth")}
              />
            </View>
            <View className="flex-1">
              <Button label="Next" onPress={() => navigation.navigate("OnboardingFamily")} />
            </View>
          </View>
        </View>
      </View>
    </ScreenContainer>
  );
}
