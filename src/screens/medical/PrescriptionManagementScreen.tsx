import React from "react";
import { ScrollView, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/types";
import { ScreenContainer, Card, BottomNav, TopAppBar } from "@/components";
import { medicalTabs } from "@/navigation/navTabs";

type Props = NativeStackScreenProps<RootStackParamList, "PrescriptionManagement">;

const PRESCRIPTIONS = [
  { name: "Amoxicillin 500mg", doctor: "Dr. Patel", refills: "2 refills left" },
  { name: "Lisinopril 10mg", doctor: "Dr. Nguyen", refills: "5 refills left" },
];

export default function PrescriptionManagementScreen({ navigation }: Props) {
  return (
    <ScreenContainer>
      <TopAppBar title="Prescriptions" />
      <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 16 }}>
        <View className="gap-3">
          {PRESCRIPTIONS.map((p) => (
            <Card key={p.name} onPress={() => navigation.navigate("MedicineAlarm")}>
              <View className="flex-row items-center">
                <View className="w-11 h-11 rounded-pill bg-accent-blue/10 items-center justify-center mr-3">
                  <Ionicons name="document-text" size={20} color="#2563EB" />
                </View>
                <View className="flex-1">
                  <Text className="font-body-medium text-base text-text-body">{p.name}</Text>
                  <Text className="font-body text-sm text-text-muted">{p.doctor} · {p.refills}</Text>
                </View>
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>
      <BottomNav tabs={medicalTabs} active="PrescriptionManagement" />
    </ScreenContainer>
  );
}
