import React from "react";
import { ScrollView, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ScreenContainer, Card, BottomNav, TopAppBar } from "@/components";
import { medicalTabs } from "@/navigation/navTabs";

const NOTES = [
  { doctor: "Dr. Patel", note: "Continue current medication. Follow up in 3 weeks.", date: "Jul 20, 2026" },
  { doctor: "Dr. Nguyen", note: "Increase water intake, reduce sodium.", date: "Jun 15, 2026" },
];

export default function DoctorAdviceScreen() {
  return (
    <ScreenContainer>
      <TopAppBar title="Doctor Advice" />
      <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 16 }}>
        <View className="gap-3">
          {NOTES.map((n) => (
            <Card key={n.doctor + n.date}>
              <View className="flex-row items-center mb-2">
                <View className="w-9 h-9 rounded-pill bg-accent-indigo/10 items-center justify-center mr-2">
                  <Ionicons name="medical" size={16} color="#4338CA" />
                </View>
                <Text className="font-body-medium text-base text-text-body">{n.doctor}</Text>
                <Text className="font-body text-xs text-text-muted ml-auto">{n.date}</Text>
              </View>
              <Text className="font-body text-sm text-text-muted">{n.note}</Text>
            </Card>
          ))}
        </View>
      </ScrollView>
      <BottomNav tabs={medicalTabs} active="DoctorAdvice" />
    </ScreenContainer>
  );
}
