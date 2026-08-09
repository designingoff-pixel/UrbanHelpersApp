import React from "react";
import { ScrollView, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList, ScreenName } from "@/navigation/types";
import { ScreenContainer, Button, Card, BottomNav, TopAppBar } from "@/components";
import { NavTab } from "@/components/BottomNav";

type Props = NativeStackScreenProps<RootStackParamList, "MedicalRecords">;

const recordsTabs: NavTab[] = [
  { label: "Home", icon: "home", screen: "HomeDashboard" },
  { label: "Activity", icon: "pulse" },
  { label: "Profile", icon: "person" },
];

const QUICK_ACCESS: { label: string; icon: keyof typeof Ionicons.glyphMap; target: ScreenName }[] = [
  { label: "Lab Reports", icon: "flask", target: "LabReportsHub" },
  { label: "Blood Test", icon: "water", target: "BloodTestReports" },
  { label: "Vaccinations", icon: "shield-checkmark", target: "VaccinationCenter" },
  { label: "Prescription", icon: "document-text", target: "PrescriptionManagement" },
];

export default function MedicalRecordsScreen({ navigation }: Props) {
  return (
    <ScreenContainer>
      <TopAppBar title="Medical Records" showBack={false} />
      <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 16 }}>
        <Card large className="mb-5" style={{ backgroundColor: "#0D9488" }}>
          <Text className="font-heading text-xl text-white mb-2">Your Complete Medical History</Text>
          <Text className="font-body text-sm text-white/80 mb-4">
            Securely store all your reports and prescriptions.
          </Text>
          <Button label="Upload Report" variant="secondary" fullWidth={false} />
        </Card>

        <Text className="font-heading-semibold text-base text-text-body mb-3">Quick Access</Text>
        <View className="flex-row flex-wrap gap-3 mb-5">
          {QUICK_ACCESS.map((q) => (
            <Card key={q.label} onPress={() => navigation.navigate(q.target as never)} style={{ width: "47%" }}>
              <Ionicons name={q.icon} size={22} color="#0D9488" />
              <Text className="font-body-medium text-sm text-text-body mt-2">{q.label}</Text>
            </Card>
          ))}
        </View>

        <Text className="font-heading-semibold text-base text-text-body mb-3">Health Summary</Text>
        <Card>
          <View className="flex-row flex-wrap gap-4">
            <View style={{ width: "45%" }}>
              <Text className="font-body text-xs text-text-muted">Blood Group</Text>
              <Text className="font-heading-semibold text-base text-text-body">O+</Text>
            </View>
            <View style={{ width: "45%" }}>
              <Text className="font-body text-xs text-text-muted">BMI</Text>
              <Text className="font-heading-semibold text-base text-text-body">22.4 Normal</Text>
            </View>
            <View style={{ width: "45%" }}>
              <Text className="font-body text-xs text-text-muted">Height</Text>
              <Text className="font-heading-semibold text-base text-text-body">178 cm</Text>
            </View>
            <View style={{ width: "45%" }}>
              <Text className="font-body text-xs text-text-muted">Weight</Text>
              <Text className="font-heading-semibold text-base text-text-body">72 kg</Text>
            </View>
          </View>
        </Card>
      </ScrollView>
      <BottomNav tabs={recordsTabs} active="MedicalRecords" />
    </ScreenContainer>
  );
}
