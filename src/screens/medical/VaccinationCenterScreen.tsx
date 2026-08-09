import React from "react";
import { ScrollView, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ScreenContainer, Card, BottomNav, TopAppBar } from "@/components";
import { NavTab } from "@/components/BottomNav";

const vaccinationTabs: NavTab[] = [
  { label: "Home", icon: "home", screen: "HomeDashboard" },
  { label: "Together", icon: "people" },
  { label: "Profile", icon: "person" },
  { label: "Categories", icon: "grid", screen: "MedicalRecords" },
  { label: "SOS", icon: "alert-circle", screen: "EmergencyAssistance" },
];

const VACCINES = [
  { name: "Tetanus Booster", date: "Due Sep 2026", status: "Upcoming" },
  { name: "Flu Shot", date: "Received Oct 2025", status: "Complete" },
  { name: "COVID-19 Booster", date: "Received Mar 2026", status: "Complete" },
];

export default function VaccinationCenterScreen() {
  return (
    <ScreenContainer>
      <TopAppBar title="Vaccination Center" />
      <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 16 }}>
        <View className="gap-3">
          {VACCINES.map((v) => (
            <Card key={v.name}>
              <View className="flex-row items-center">
                <View className="w-11 h-11 rounded-pill bg-accent-emerald/10 items-center justify-center mr-3">
                  <Ionicons name="shield-checkmark" size={20} color="#059669" />
                </View>
                <View className="flex-1">
                  <Text className="font-body-medium text-base text-text-body">{v.name}</Text>
                  <Text className="font-body text-sm text-text-muted">{v.date}</Text>
                </View>
                <Text
                  className={`font-body-medium text-xs ${v.status === "Complete" ? "text-accent-emerald" : "text-accent-amber"}`}
                >
                  {v.status}
                </Text>
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>
      <BottomNav tabs={vaccinationTabs} active="VaccinationCenter" />
    </ScreenContainer>
  );
}
