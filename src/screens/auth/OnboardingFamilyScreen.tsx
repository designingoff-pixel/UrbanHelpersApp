import React from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/types";
import { ScreenContainer, Button } from "@/components";

type Props = NativeStackScreenProps<RootStackParamList, "OnboardingFamily">;

export default function OnboardingFamilyScreen({ navigation }: Props) {
  return (
    <ScreenContainer>
      <View className="flex-1 p-6 justify-between">
        <View className="items-center mt-8">
          <Ionicons name="people" size={96} color="#4338CA" />
          <Text className="font-heading text-2xl text-text-body mt-6 text-center">
            Family & emergency,{"\n"}always covered
          </Text>
          <Text className="font-body text-base text-text-muted mt-3 text-center">
            Manage your family's care plans and get instant access to emergency assistance.
          </Text>
        </View>

        <View>
          <View className="flex-row justify-center gap-2 mb-6">
            <View className="w-1.5 h-1.5 rounded-pill bg-text-muted/30" />
            <View className="w-1.5 h-1.5 rounded-pill bg-text-muted/30" />
            <View className="w-6 h-1.5 rounded-pill bg-brand-blue" />
          </View>
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Button
                label="Back"
                variant="secondary"
                onPress={() => navigation.navigate("OnboardingHomeServices")}
              />
            </View>
            <View className="flex-1">
              <Button label="Finish" onPress={() => navigation.navigate("SignIn")} />
            </View>
          </View>
        </View>
      </View>
    </ScreenContainer>
  );
}
