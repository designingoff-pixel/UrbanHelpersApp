import React from "react";
import { ScrollView, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ScreenContainer, Card, BottomNav, TopAppBar } from "@/components";
import { medicalTabs } from "@/navigation/navTabs";

const REPORTS = [
  { name: "Complete Blood Count", date: "Jul 28, 2026", status: "Normal" },
  { name: "Lipid Profile", date: "Jul 10, 2026", status: "Review" },
  { name: "Thyroid Panel", date: "Jun 22, 2026", status: "Normal" },
];

export default function LabReportsHubScreen() {
  return (
    <ScreenContainer>
      <TopAppBar title="Lab Reports" />
      <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 16 }}>
        <View className="gap-3">
          {REPORTS.map((r) => (
            <Card key={r.name}>
              <View className="flex-row items-center">
                <View className="w-11 h-11 rounded-pill bg-accent-blue/10 items-center justify-center mr-3">
                  <Ionicons name="flask" size={20} color="#2563EB" />
                </View>
                <View className="flex-1">
                  <Text className="font-body-medium text-base text-text-body">{r.name}</Text>
                  <Text className="font-body text-sm text-text-muted">{r.date}</Text>
                </View>
                <Text
                  className={`font-body-medium text-xs ${r.status === "Normal" ? "text-accent-emerald" : "text-accent-amber"}`}
                >
                  {r.status}
                </Text>
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>
      <BottomNav tabs={medicalTabs} active="LabReportsHub" />
    </ScreenContainer>
  );
}
