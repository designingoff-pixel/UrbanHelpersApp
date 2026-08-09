import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/types";
import { ScreenContainer, Card, BottomNav, TopAppBar } from "@/components";
import { NavTab } from "@/components/BottomNav";

type Props = NativeStackScreenProps<RootStackParamList, "EmergencyAssistance">;

const emergencyTabs: NavTab[] = [
  { label: "Emergency", icon: "alert-circle", screen: "EmergencyAssistance" },
  { label: "Contacts", icon: "people" },
  { label: "Medical ID", icon: "id-card", screen: "MedicalRecords" },
  { label: "Map", icon: "map" },
];

export default function EmergencyAssistanceScreen() {
  return (
    <ScreenContainer>
      <TopAppBar title="Emergency" showBack={false} />
      <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 16 }}>
        <Pressable className="items-center py-10 mb-5 rounded-card-lg bg-danger/20 active:opacity-80">
          <View className="w-24 h-24 rounded-full bg-danger items-center justify-center mb-3">
            <Ionicons name="call" size={36} color="#7A0000" />
          </View>
          <Text className="font-heading text-lg text-text-body">Call Emergency Services</Text>
          <Text className="font-body text-sm text-text-muted mt-1">Tap to call 911</Text>
        </Pressable>

        <Text className="font-heading-semibold text-base text-text-body mb-3">Emergency Contacts</Text>
        <View className="gap-3">
          <Card>
            <Text className="font-body-medium text-base text-text-body">Sarah (Spouse)</Text>
            <Text className="font-body text-sm text-text-muted">+1 (555) 123-4567</Text>
          </Card>
          <Card>
            <Text className="font-body-medium text-base text-text-body">Dr. Patel (Primary Care)</Text>
            <Text className="font-body text-sm text-text-muted">+1 (555) 987-6543</Text>
          </Card>
        </View>
      </ScrollView>
      <BottomNav tabs={emergencyTabs} active="EmergencyAssistance" />
    </ScreenContainer>
  );
}
