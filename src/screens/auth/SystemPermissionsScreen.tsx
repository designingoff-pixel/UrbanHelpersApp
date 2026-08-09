import React from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/types";
import { ScreenContainer, Button, TopAppBar } from "@/components";

type Props = NativeStackScreenProps<RootStackParamList, "SystemPermissions">;

const PERMISSIONS: { icon: keyof typeof Ionicons.glyphMap; title: string; desc: string }[] = [
  { icon: "notifications", title: "Notifications", desc: "Get medicine and appointment reminders" },
  { icon: "location", title: "Location", desc: "Find nearby doctors and services" },
  { icon: "walk", title: "Motion & Fitness", desc: "Track your steps and activity" },
  { icon: "mic", title: "Microphone", desc: "Talk to your AI health coach" },
];

export default function SystemPermissionsScreen({ navigation }: Props) {
  const goHome = () => navigation.navigate("HomeDashboard");

  return (
    <ScreenContainer>
      <TopAppBar title="Permissions" showBack={false} />
      <View className="flex-1 px-6 pt-2">
        <Text className="font-heading text-2xl text-text-body mb-2">Stay in the loop</Text>
        <Text className="font-body text-base text-text-muted mb-6">
          Urban Helpers works best with a few permissions enabled.
        </Text>

        <View className="gap-4 mb-8">
          {PERMISSIONS.map((p) => (
            <View key={p.title} className="flex-row items-center">
              <View className="w-11 h-11 rounded-pill bg-brand-blue/10 items-center justify-center mr-3">
                <Ionicons name={p.icon} size={20} color="#004AC6" />
              </View>
              <View className="flex-1">
                <Text className="font-body-medium text-base text-text-body">{p.title}</Text>
                <Text className="font-body text-sm text-text-muted">{p.desc}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
      <View className="px-6 pb-4 gap-3">
        <Button label="Allow All" onPress={goHome} />
        <Button label="Allow Individually" variant="secondary" onPress={goHome} />
        <Button label="Continue" variant="ghost" onPress={goHome} />
      </View>
    </ScreenContainer>
  );
}
