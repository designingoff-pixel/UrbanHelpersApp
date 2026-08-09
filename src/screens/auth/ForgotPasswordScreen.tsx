import React, { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/types";
import { ScreenContainer, Button, TopAppBar } from "@/components";

type Props = NativeStackScreenProps<RootStackParamList, "ForgotPassword">;

export default function ForgotPasswordScreen({ navigation }: Props) {
  const [email, setEmail] = useState("");

  return (
    <ScreenContainer>
      <TopAppBar title="Reset Password" showBack />
      <View className="flex-1 px-6 pt-4">
        <Text className="font-heading text-2xl text-text-body mb-2">Forgot your password?</Text>
        <Text className="font-body text-base text-text-muted mb-6">
          Enter your email and we&apos;ll send you a code to reset it.
        </Text>

        <Text className="font-body-medium text-sm text-text-body mb-1">Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          className="border border-border-light rounded-2xl px-4 py-3 mb-8 font-body text-base"
        />

        <Button label="Send OTP" onPress={() => navigation.navigate("OTPVerification")} />

        <Pressable className="self-center mt-6" onPress={() => navigation.navigate("SignIn")}>
          <Text className="font-body-medium text-sm text-brand-blue">Back to Login</Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}
