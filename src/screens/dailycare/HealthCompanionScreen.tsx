import React, { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/types";
import { ScreenContainer, Button, Card, BottomNav, TopAppBar } from "@/components";
import { careTabs } from "@/navigation/navTabs";

type Props = NativeStackScreenProps<RootStackParamList, "HealthCompanion">;

const MOODS = ["😢", "😐", "😊"];
const TIPS = [
  { title: "HYDRATION", desc: "Drink water before meals. Aids digestion and helps control portion sizes." },
  { title: "SLEEP", desc: "7-8 hours is optimal. Quality sleep repairs the body and mind." },
  { title: "MOVEMENT", desc: "Take short walks. Break up sedentary time every hour." },
];

export default function HealthCompanionScreen({ navigation }: Props) {
  const [mood, setMood] = useState(2);

  return (
    <ScreenContainer>
      <TopAppBar title="Health Companion" />
      <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 16 }}>
        <Card large className="mb-5" style={{ backgroundColor: "#0D9488" }}>
          <Text className="font-heading text-xl text-white mb-1">Health Companion</Text>
          <Text className="font-body text-sm text-white/80 mb-4">Your daily wellness companion.</Text>
          <Button
            label="Start Session"
            variant="secondary"
            fullWidth={false}
            onPress={() => navigation.navigate("AICoach")}
          />
        </Card>

        <Card className="mb-3">
          <Text className="font-body-medium text-base text-text-body mb-3">
            How are you feeling today?
          </Text>
          <View className="flex-row justify-around">
            {MOODS.map((m, i) => (
              <Pressable
                key={m}
                onPress={() => setMood(i)}
                className={`w-14 h-14 rounded-pill items-center justify-center ${mood === i ? "bg-brand-blue/10" : ""}`}
              >
                <Text style={{ fontSize: 28 }}>{m}</Text>
              </Pressable>
            ))}
          </View>
        </Card>

        <Card className="mb-5" onPress={() => navigation.navigate("AICoach")}>
          <Text className="font-body-medium text-base text-text-body mb-1">AI Conversation</Text>
          <Text className="font-body text-sm text-text-muted mb-2">
            Chat with your wellness guide
          </Text>
          <View className="self-start px-3 py-1.5 rounded-pill bg-brand-blue">
            <Text className="font-body-medium text-xs text-white">CONNECT</Text>
          </View>
        </Card>

        <Text className="font-heading-semibold text-base text-text-body mb-3">Daily Health Tips</Text>
        <View className="gap-3">
          {TIPS.map((t) => (
            <Card key={t.title}>
              <Text className="font-body-medium text-xs text-text-muted mb-1">{t.title}</Text>
              <Text className="font-body text-sm text-text-body">{t.desc}</Text>
            </Card>
          ))}
        </View>
      </ScrollView>
      <BottomNav tabs={careTabs} active="HealthCompanion" />
    </ScreenContainer>
  );
}
