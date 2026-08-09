import React from "react";
import { ScrollView, Text, View } from "react-native";
import { ScreenContainer, Card, BottomNav, TopAppBar } from "@/components";
import { medicalTabs } from "@/navigation/navTabs";

const PANELS = [
  { name: "Hemoglobin", value: "14.2 g/dL", range: "13.5-17.5" },
  { name: "WBC Count", value: "6,800 /µL", range: "4,500-11,000" },
  { name: "Platelets", value: "250,000 /µL", range: "150,000-450,000" },
  { name: "Glucose (Fasting)", value: "92 mg/dL", range: "70-100" },
];

export default function BloodTestReportsScreen() {
  return (
    <ScreenContainer>
      <TopAppBar title="Blood Test Reports" />
      <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 16 }}>
        <View className="gap-3">
          {PANELS.map((p) => (
            <Card key={p.name}>
              <View className="flex-row justify-between items-center">
                <Text className="font-body-medium text-base text-text-body">{p.name}</Text>
                <Text className="font-heading-semibold text-base text-text-body">{p.value}</Text>
              </View>
              <Text className="font-body text-xs text-text-muted mt-1">Normal range: {p.range}</Text>
            </Card>
          ))}
        </View>
      </ScrollView>
      <BottomNav tabs={medicalTabs} active="BloodTestReports" />
    </ScreenContainer>
  );
}
