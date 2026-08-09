import React from "react";
import { ScrollView, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/types";
import { ScreenContainer, Card, BottomNav, TopAppBar } from "@/components";
import { NavTab } from "@/components/BottomNav";

type Props = NativeStackScreenProps<RootStackParamList, "MedicationCenter">;

const medsTabs: NavTab[] = [
  { label: "Home", icon: "home", screen: "HomeDashboard" },
  { label: "Health", icon: "heart", screen: "HealthDashboard" },
  { label: "Fitness", icon: "barbell", screen: "FitnessDashboard" },
  { label: "Meds", icon: "medkit", screen: "MedicationCenter" },
];

const MEDS = [
  { name: "Amoxicillin", dose: "500mg · After Food", time: "14:00" },
  { name: "Vitamin D3", dose: "1000 IU · With Food", time: "20:00" },
  { name: "Lisinopril", dose: "10mg · Morning", time: "08:00" },
];

export default function MedicationCenterScreen({ navigation }: Props) {
  return (
    <ScreenContainer>
      <TopAppBar title="Medication Center" showBack={false} />
      <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 16 }}>
        <Text className="font-body text-sm text-text-muted mb-4">
          All your medications, organized in one place.
        </Text>
        <View className="gap-3">
          {MEDS.map((m) => (
            <Card key={m.name} onPress={() => navigation.navigate("MedicineAlarm")}>
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                  <View className="w-11 h-11 rounded-pill bg-accent-teal/10 items-center justify-center mr-3">
                    <Ionicons name="medkit" size={20} color="#0D9488" />
                  </View>
                  <View className="flex-1">
                    <Text className="font-body-medium text-base text-text-body">{m.name}</Text>
                    <Text className="font-body text-sm text-text-muted">{m.dose}</Text>
                  </View>
                </View>
                <Text className="font-body-medium text-sm text-text-body">{m.time}</Text>
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>
      <BottomNav tabs={medsTabs} active="MedicationCenter" />
    </ScreenContainer>
  );
}
