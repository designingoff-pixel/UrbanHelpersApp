import React, { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/types";
import { ScreenContainer, Button, TopAppBar } from "@/components";

type Props = NativeStackScreenProps<RootStackParamList, "CreateAccount">;

export default function CreateAccountScreen({ navigation }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <ScreenContainer>
      <TopAppBar title="" showBack />
      <ScrollView className="flex-1 px-6" contentContainerStyle={{ paddingBottom: 32 }}>
        <Text className="font-heading text-2xl text-text-body mt-2">Create your account</Text>
        <Text className="font-body text-base text-text-muted mt-1 mb-6">
          Start your journey to better health and home.
        </Text>

        <Text className="font-body-medium text-sm text-text-body mb-1">Full name</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Jane Doe"
          className="border border-border-light rounded-2xl px-4 py-3 mb-4 font-body text-base"
        />

        <Text className="font-body-medium text-sm text-text-body mb-1">Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          className="border border-border-light rounded-2xl px-4 py-3 mb-4 font-body text-base"
        />

        <Text className="font-body-medium text-sm text-text-body mb-1">Password</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          secureTextEntry
          className="border border-border-light rounded-2xl px-4 py-3 mb-6 font-body text-base"
        />

        <Button label="Create Account" onPress={() => navigation.navigate("CreateProfile")} />

        <View className="flex-row justify-center mt-6">
          <Text className="font-body text-sm text-text-muted">Already have an account? </Text>
          <Pressable onPress={() => navigation.navigate("SignIn")}>
            <Text className="font-body-medium text-sm text-brand-blue">Sign In</Text>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
