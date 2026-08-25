import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/types";
import { ScreenContainer, Button, TopAppBar } from "@/components";
import { useAuth } from "@/context/AuthContext";

type Props = NativeStackScreenProps<RootStackParamList, "SignIn">;

export default function SignInScreen({ navigation }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { user, signingIn, signInWithGoogle } = useAuth();

  useEffect(() => {
    if (user) navigation.navigate("HomeDashboard");
  }, [user]);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      Alert.alert("Sign in failed", "Couldn't sign in with Google. Please try again.");
    }
  };

  return (
    <ScreenContainer>
      <TopAppBar title="" showBack />
      <ScrollView className="flex-1 px-6" contentContainerStyle={{ paddingBottom: 32 }}>
        <Text className="font-heading text-2xl text-text-body mt-2">Welcome back</Text>
        <Text className="font-body text-base text-text-muted mt-1 mb-6">
          Sign in to continue to Urban Helpers.
        </Text>

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
          className="border border-border-light rounded-2xl px-4 py-3 mb-2 font-body text-base"
        />

        <Pressable
          className="self-end mb-6"
          onPress={() => navigation.navigate("ForgotPassword")}
        >
          <Text className="font-body-medium text-sm text-brand-blue">Forgot Password?</Text>
        </Pressable>

        <Button label="Sign In" onPress={() => navigation.navigate("HomeDashboard")} />

        <View className="flex-row items-center my-6">
          <View className="flex-1 h-px bg-border-light" />
          <Text className="font-body text-xs text-text-muted mx-3">or continue with</Text>
          <View className="flex-1 h-px bg-border-light" />
        </View>

        <View className="gap-3">
          <Pressable
            onPress={handleGoogleSignIn}
            disabled={signingIn}
            className="flex-row items-center justify-center border border-border-light rounded-pill py-3"
          >
            {signingIn ? (
              <ActivityIndicator size="small" color="#111827" />
            ) : (
              <>
                <Ionicons name="logo-google" size={18} color="#111827" />
                <Text className="font-body-medium text-sm ml-2">Continue with Google</Text>
              </>
            )}
          </Pressable>
          <Pressable
            onPress={() => navigation.navigate("HomeDashboard")}
            className="flex-row items-center justify-center border border-border-light rounded-pill py-3"
          >
            <Ionicons name="logo-apple" size={18} color="#111827" />
            <Text className="font-body-medium text-sm ml-2">Continue with Apple</Text>
          </Pressable>
          <Pressable
            onPress={() => navigation.navigate("HomeDashboard")}
            className="flex-row items-center justify-center border border-border-light rounded-pill py-3"
          >
            <Ionicons name="call" size={18} color="#111827" />
            <Text className="font-body-medium text-sm ml-2">Continue with Phone</Text>
          </Pressable>
        </View>

        <View className="flex-row justify-center mt-6">
          <Text className="font-body text-sm text-text-muted">Don&apos;t have an account? </Text>
          <Pressable onPress={() => navigation.navigate("CreateAccount")}>
            <Text className="font-body-medium text-sm text-brand-blue">Create Account</Text>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
