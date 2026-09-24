import React from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/types";
import { ScreenContainer, Button } from "@/components";

type Props = NativeStackScreenProps<RootStackParamList, "Welcome">;

export default function WelcomeScreen({ navigation }: Props) {
  return (
    <ScreenContainer>
      <View className="flex-1 justify-between p-6">
        <View className="items-end">
          <View className="flex-row items-center px-3 py-2 rounded-pill bg-background-card">
            <Ionicons name="globe-outline" size={16} color="#111827" />
            <Text className="font-body-medium text-sm ml-1">English</Text>
          </View>
        </View>

        <View className="items-center">
          <Ionicons name="hand-left" size={72} color="#004AC6" />
          <Text className="font-heading text-2xl text-text-body mt-6 text-center">
            One App. Better Health.{"\n"}Better Home. Better Living.
          </Text>
        </View>

        <View className="gap-3">
          <Button label="Get Started" onPress={() => navigation.navigate("OnboardingHealth")} />
          <Button
            label="Sign In"
            variant="secondary"
            onPress={() => navigation.navigate("SignIn")}
          />
        </View>
      </View>
    </ScreenContainer>
  );
}
