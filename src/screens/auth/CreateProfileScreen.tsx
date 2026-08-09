import React, { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/types";
import { ScreenContainer, Button, TopAppBar } from "@/components";

type Props = NativeStackScreenProps<RootStackParamList, "CreateProfile">;

const GENDERS = ["Female", "Male", "Other"] as const;

export default function CreateProfileScreen({ navigation }: Props) {
  const [gender, setGender] = useState<(typeof GENDERS)[number]>("Female");
  const [height, setHeight] = useState("170");
  const [weight, setWeight] = useState("65");
  const [phone, setPhone] = useState("");

  return (
    <ScreenContainer>
      <TopAppBar title="Create Profile" showBack />
      <ScrollView className="flex-1 px-6" contentContainerStyle={{ paddingBottom: 32 }}>
        <Text className="font-body-medium text-sm text-text-body mb-1 mt-2">Full name</Text>
        <TextInput
          placeholder="Jane Doe"
          className="border border-border-light rounded-2xl px-4 py-3 mb-4 font-body text-base"
        />

        <Text className="font-body-medium text-sm text-text-body mb-2">Gender</Text>
        <View className="flex-row gap-2 mb-4">
          {GENDERS.map((g) => (
            <Pressable
              key={g}
              onPress={() => setGender(g)}
              className={`flex-1 py-3 rounded-pill items-center border ${
                gender === g ? "bg-brand-blue border-brand-blue" : "border-border-light"
              }`}
            >
              <Text className={`font-body-medium text-sm ${gender === g ? "text-white" : "text-text-body"}`}>
                {g}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text className="font-body-medium text-sm text-text-body mb-1">Date of birth</Text>
        <TextInput
          placeholder="DD/MM/YYYY"
          className="border border-border-light rounded-2xl px-4 py-3 mb-4 font-body text-base"
        />

        <View className="flex-row gap-3 mb-4">
          <View className="flex-1">
            <Text className="font-body-medium text-sm text-text-body mb-1">Height (cm)</Text>
            <TextInput
              value={height}
              onChangeText={setHeight}
              keyboardType="numeric"
              className="border border-border-light rounded-2xl px-4 py-3 font-body text-base"
            />
          </View>
          <View className="flex-1">
            <Text className="font-body-medium text-sm text-text-body mb-1">Weight (kg)</Text>
            <TextInput
              value={weight}
              onChangeText={setWeight}
              keyboardType="numeric"
              className="border border-border-light rounded-2xl px-4 py-3 font-body text-base"
            />
          </View>
        </View>

        <Text className="font-body-medium text-sm text-text-body mb-1">Phone number</Text>
        <TextInput
          value={phone}
          onChangeText={setPhone}
          placeholder="+1 (555) 000-0000"
          keyboardType="phone-pad"
          className="border border-border-light rounded-2xl px-4 py-3 mb-8 font-body text-base"
        />

        <Button label="Continue" onPress={() => navigation.navigate("OTPVerification")} />
      </ScrollView>
    </ScreenContainer>
  );
}
