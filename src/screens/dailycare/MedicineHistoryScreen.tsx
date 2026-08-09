import React from "react";
import { ScrollView, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ScreenContainer, Card, BottomNav, TopAppBar } from "@/components";
import { careTabs } from "@/navigation/navTabs";

const HISTORY = [
  { name: "Amoxicillin", time: "Yesterday, 14:02", taken: true },
  { name: "Vitamin D3", time: "Yesterday, 20:05", taken: true },
  { name: "Lisinopril", time: "Yesterday, 08:15", taken: false },
];

export default function MedicineHistoryScreen() {
  return (
    <ScreenContainer dark>
      <TopAppBar title="Medicine History" dark />
      <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 16 }}>
        <View className="gap-3">
          {HISTORY.map((h) => (
            <Card key={h.name + h.time} dark>
              <View className="flex-row items-center">
                <Ionicons
                  name={h.taken ? "checkmark-circle" : "close-circle"}
                  size={22}
                  color={h.taken ? "#059669" : "#FFB4AB"}
                />
                <View className="ml-3 flex-1">
                  <Text className="font-body-medium text-base text-white">{h.name}</Text>
                  <Text className="font-body text-sm text-text-secondary">{h.time}</Text>
                </View>
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>
      <BottomNav tabs={careTabs} active="MedicineHistory" dark />
    </ScreenContainer>
  );
}
