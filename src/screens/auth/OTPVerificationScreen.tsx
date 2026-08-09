import React, { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/types";
import { ScreenContainer, Button, TopAppBar } from "@/components";

type Props = NativeStackScreenProps<RootStackParamList, "OTPVerification">;

export default function OTPVerificationScreen({ navigation }: Props) {
  const [otp, setOtp] = useState("");

  return (
    <ScreenContainer>
      <TopAppBar title="Verify Phone" showBack />
      <View className="flex-1 px-6 pt-4">
        <Text className="font-heading text-2xl text-text-body mb-2">Enter verification code</Text>
        <Text className="font-body text-base text-text-muted mb-6">
          We&apos;ve sent a 6-digit code to your phone number.
        </Text>

        <TextInput
          value={otp}
          onChangeText={setOtp}
          placeholder="000000"
          keyboardType="number-pad"
          maxLength={6}
          className="border border-border-light rounded-2xl px-4 py-4 mb-4 font-heading text-2xl text-center tracking-[8px]"
        />

        <Pressable
          className="self-center mb-8"
          onPress={() => navigation.navigate("CreateProfile")}
        >
          <Text className="font-body-medium text-sm text-brand-blue">Edit Number</Text>
        </Pressable>

        <Button label="Verify" onPress={() => navigation.navigate("SystemPermissions")} />
      </View>
    </ScreenContainer>
  );
}
