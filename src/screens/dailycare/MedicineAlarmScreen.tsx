import React from "react";
import { ScrollView, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/types";
import { ScreenContainer, Button, Card, BottomNav, TopAppBar } from "@/components";
import { careTabs } from "@/navigation/navTabs";

type Props = NativeStackScreenProps<RootStackParamList, "MedicineAlarm">;

const MEDS = [
  { name: "Amoxicillin", dose: "500mg · After Food", time: "14:00", status: "In 2h" },
  { name: "Vitamin D3", dose: "1000 IU · With Food", time: "20:00", status: "Tonight" },
];

export default function MedicineAlarmScreen({ navigation }: Props) {
  return (
    <ScreenContainer dark>
      <TopAppBar title="Medicine Alarm" dark />
      <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 16 }}>
        <Card dark large className="mb-5 items-center py-6">
          <Text className="font-body-medium text-xs text-text-secondary mb-1">ACTIVE TRACKING</Text>
          <Text className="font-heading text-xl text-white">Medicine Alarm</Text>
          <Text className="font-body text-sm text-text-secondary mt-1">
            Never miss your medicines again.
          </Text>
          <View className="flex-row gap-8 mt-4">
            <View className="items-center">
              <Text className="font-heading text-2xl text-white">02</Text>
              <Text className="font-body text-xs text-text-secondary">Pending Today</Text>
            </View>
            <View className="items-center">
              <Text className="font-heading text-2xl text-white">100%</Text>
              <Text className="font-body text-xs text-text-secondary">Adherence Rate</Text>
            </View>
          </View>
        </Card>

        <Text className="font-heading-semibold text-base text-white mb-3">Today&apos;s Medicines</Text>
        <View className="gap-3 mb-5">
          {MEDS.map((m) => (
            <Card key={m.name} dark>
              <View className="flex-row justify-between items-center">
                <View>
                  <Text className="font-body-medium text-base text-white">{m.name}</Text>
                  <Text className="font-body text-sm text-text-secondary">{m.dose}</Text>
                </View>
                <View className="items-end">
                  <Text className="font-body-medium text-sm text-white">{m.time}</Text>
                  <Text className="font-body text-xs text-text-tertiary">{m.status}</Text>
                </View>
              </View>
            </Card>
          ))}
        </View>

        <Card dark className="mb-5">
          <Text className="font-body-medium text-xs text-text-tertiary mb-1">AI INSIGHTS</Text>
          <Text className="font-body-medium text-base text-white mb-1">Optimal Timing</Text>
          <Text className="font-body text-sm text-text-secondary mb-3">
            Based on your sleep patterns, we suggest moving your Vitamin D intake to mornings for
            better absorption and sleep quality.
          </Text>
          <Button
            label="Review Schedule"
            variant="secondary"
            fullWidth={false}
            onPress={() => navigation.navigate("SmartReminders")}
          />
        </Card>
      </ScrollView>
      <BottomNav tabs={careTabs} active="MedicineAlarm" dark />
    </ScreenContainer>
  );
}
