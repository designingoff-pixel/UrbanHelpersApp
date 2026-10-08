import React from "react";
import { Image, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/types";
import { ScreenContainer } from "@/components";

type Props = NativeStackScreenProps<RootStackParamList, "OnboardingHealth">;

export default function OnboardingHealthScreen({ navigation }: Props) {
  return (
    <ScreenContainer>
      <View className="flex-1 bg-slate-50 justify-between px-6 py-8">
        {/* Top bar with UrbanHelpers brand & Skip */}
        <View className="flex-row items-center justify-between pt-2">
          <View className="flex-row items-center gap-2">
            <Image
              source={require("../../../assets/icon.png")}
              style={{ width: 28, height: 28, borderRadius: 6 }}
              resizeMode="contain"
            />
            <Text className="text-base font-bold text-slate-800 tracking-tight">UrbanHelpers</Text>
          </View>
          <Pressable
            onPress={() => navigation.navigate("SignIn")}
            className="py-1.5 px-3 rounded-full bg-slate-100 active:opacity-70"
          >
            <Text className="font-semibold text-xs text-slate-500">Skip</Text>
          </Pressable>
        </View>

        {/* Center illustration & Info */}
        <View className="items-center">
          <View className="w-full h-64 rounded-3xl overflow-hidden bg-white shadow-md border border-slate-100 items-center justify-center p-2 mb-6">
            <Image
              source={require("../../../assets/onboard_health.jpg")}
              style={{ width: "100%", height: "100%", borderRadius: 20 }}
              resizeMode="cover"
            />
          </View>

          <View className="w-10 h-10 rounded-2xl bg-emerald-50 items-center justify-center mb-3">
            <Ionicons name="pulse" size={22} color="#059669" />
          </View>
          <Text className="text-2xl font-bold text-slate-900 text-center tracking-tight">
            Track your health,{"\n"}stay ahead of tomorrow
          </Text>
          <Text className="text-sm text-slate-500 text-center mt-2.5 px-4 leading-relaxed">
            Monitor vitals, log symptoms, track medications, and get real-time proactive health insights.
          </Text>
        </View>

        {/* Bottom controls */}
        <View className="pb-4">
          <View className="flex-row justify-center gap-2 mb-6">
            <View className="w-7 h-2 rounded-full bg-blue-600" />
            <View className="w-2 h-2 rounded-full bg-slate-300" />
            <View className="w-2 h-2 rounded-full bg-slate-300" />
          </View>

          <Pressable
            onPress={() => navigation.navigate("OnboardingHomeServices")}
            className="w-full bg-blue-600 py-3.5 rounded-2xl flex-row items-center justify-center shadow-md shadow-blue-500/20 active:opacity-85"
          >
            <Text className="text-white font-bold text-base mr-2">Continue</Text>
            <Ionicons name="arrow-forward" size={18} color="#ffffff" />
          </Pressable>
        </View>
      </View>
    </ScreenContainer>
  );
}
