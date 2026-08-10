import React from "react";
import { ScrollView, Text, View, Pressable, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/types";
import { ScreenContainer } from "@/components";

type Props = NativeStackScreenProps<RootStackParamList, "HomeDashboard">;

const PILLS = [
  { name: "Home", icon: "home", active: true },
  { name: "Health", icon: "heart-outline", active: false },
  { name: "Fitness", icon: "fitness-outline", active: false },
  { name: "Home Care", icon: "briefcase-outline", active: false },
];

export default function HomeDashboardScreen({ navigation }: Props) {
  return (
    <ScreenContainer>
      <View className="flex-1 bg-white">
        {/* Top Header */}
        <View className="px-5 pt-3 pb-2 flex-row justify-between items-center">
          <View>
            <Text className="font-heading text-2xl text-blue-900 font-bold">Urban Helpers</Text>
            <View className="flex-row items-center mt-1">
              <View className="w-6 h-6 rounded-full bg-slate-300 items-center justify-center mr-1.5 overflow-hidden">
                <Ionicons name="person" size={14} color="#475569" />
              </View>
              <Text className="text-sm font-semibold text-slate-700">Good Morning, Alex 👋</Text>
            </View>
            <Text className="text-xs text-slate-400">Your companion for healthier living.</Text>
          </View>
          <View className="flex-row gap-2">
            <Pressable className="w-10 h-10 rounded-full bg-slate-800 items-center justify-center">
              <Ionicons name="notifications-outline" size={20} color="#FFFFFF" />
            </Pressable>
            <Pressable className="w-10 h-10 rounded-full bg-slate-800 items-center justify-center">
              <Ionicons name="ellipsis-vertical" size={20} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>

        {/* Horizontal Category Pills */}
        <View className="px-5 py-2">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-2">
              {PILLS.map((p) => (
                <Pressable
                  key={p.name}
                  className={`flex-row items-center px-4 py-2 rounded-full ${
                    p.active ? "bg-indigo-50 border border-indigo-200" : "bg-slate-800"
                  }`}
                >
                  <Ionicons
                    name={p.icon as any}
                    size={16}
                    color={p.active ? "#2563EB" : "#94A3B8"}
                    style={{ marginRight: 6 }}
                  />
                  <Text className={`text-xs font-semibold ${p.active ? "text-blue-600" : "text-white"}`}>
                    {p.name}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>

        <ScrollView className="flex-1 px-5 pt-2" contentContainerStyle={{ paddingBottom: 100 }}>
          {/* Hero Banner: Take care of your family's wellbeing */}
          <LinearGradient
            colors={["#1E3A5F", "#2D4A6F", "#1A2B3C"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="rounded-3xl p-5 mb-4 relative overflow-hidden"
          >
            <Text className="text-white text-xl font-bold max-w-[200px] mb-2 leading-tight">
              Take care of your family's wellbeing
            </Text>
            <Text className="text-slate-300 text-xs max-w-[200px] mb-4">
              Manage health, appointments, reminders, and home services in one place.
            </Text>
            
            <View className="flex-row items-center justify-between mt-2">
              <View className="flex-row gap-1">
                <View className="w-6 h-1.5 rounded-full bg-white" />
                <View className="w-1.5 h-1.5 rounded-full bg-white/40" />
                <View className="w-1.5 h-1.5 rounded-full bg-white/40" />
              </View>
              <Pressable
                onPress={() => navigation.navigate("Discover")}
                className="flex-row items-center bg-white/20 border border-white/30 px-4 py-2 rounded-full"
              >
                <Text className="text-white text-xs font-semibold mr-1">Explore</Text>
                <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
              </Pressable>
            </View>
          </LinearGradient>

          {/* Energy Score Card */}
          <Pressable onPress={() => navigation.navigate("FitnessDashboard")}>
            <LinearGradient
              colors={["#2B7FFF", "#00B4D8"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="rounded-2xl p-5 mb-4 flex-row justify-between items-center"
            >
              <View>
                <Text className="text-white text-lg font-bold">Energy Score</Text>
                <Text className="text-white/80 text-xs mt-1">Understand how your day is shaping up.</Text>
              </View>
              <View className="w-10 h-10 rounded-full bg-white/30 items-center justify-center">
                <View className="w-6 h-6 rounded-full bg-white" />
              </View>
            </LinearGradient>
          </Pressable>

          {/* Split 2-Column: Heart Health & Sleep */}
          <View className="flex-row gap-3 mb-4">
            {/* Heart Health */}
            <Pressable
              className="flex-1"
              onPress={() => navigation.navigate("HealthDataAnalytics")}
            >
              <LinearGradient
                colors={["#A81C7E", "#6C1D94"]}
                className="rounded-2xl p-4 h-48 justify-between"
              >
                <View className="w-10 h-10 rounded-full bg-white/20 items-center justify-center">
                  <Ionicons name="heart" size={20} color="#FFFFFF" />
                </View>
                <View>
                  <Text className="text-white text-base font-bold">Heart Health</Text>
                  <Text className="text-white/80 text-xs mt-1">View your heart insights.</Text>
                </View>
              </LinearGradient>
            </Pressable>

            {/* Sleep */}
            <Pressable
              className="flex-1"
              onPress={() => navigation.navigate("SleepDashboard")}
            >
              <LinearGradient
                colors={["#635BFF", "#8A4FFF"]}
                className="rounded-2xl p-4 h-48 justify-between"
              >
                <View className="w-10 h-10 rounded-full bg-white/20 items-center justify-center">
                  <Ionicons name="moon" size={20} color="#FFFFFF" />
                </View>
                <View>
                  <Text className="text-white text-base font-bold">Sleep</Text>
                  <Text className="text-white/80 text-xs mt-1">Track your sleep quality.</Text>
                </View>
              </LinearGradient>
            </Pressable>
          </View>

          {/* Nutrition Banner */}
          <Pressable onPress={() => navigation.navigate("NutritionDashboard")}>
            <LinearGradient
              colors={["#E65100", "#F57C00"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="rounded-2xl p-5 mb-4 flex-row justify-between items-center"
            >
              <View>
                <Text className="text-white text-lg font-bold">Nutrition</Text>
                <Text className="text-white/80 text-xs mt-1">Build healthier eating habits.</Text>
              </View>
              <View className="w-10 h-10 rounded-full bg-white/20 items-center justify-center">
                <Ionicons name="nutrition" size={22} color="#FFFFFF" />
              </View>
            </LinearGradient>
          </Pressable>

          {/* Family Care Card */}
          <Pressable onPress={() => navigation.navigate("FamilyDashboard")}>
            <LinearGradient
              colors={["#F59E0B", "#D97706"]}
              className="rounded-3xl p-5 mb-4 justify-between relative overflow-hidden min-h-[140px]"
            >
              <View className="w-10 h-10 rounded-full bg-white/20 items-center justify-center mb-3">
                <Ionicons name="people" size={20} color="#FFFFFF" />
              </View>
              <View className="max-w-[200px]">
                <Text className="text-white text-xl font-bold">Family Care</Text>
                <Text className="text-white/80 text-xs mt-1">
                  Stay connected with loved ones and manage care plans.
                </Text>
              </View>
              {/* Silhouette Illustration */}
              <View className="absolute right-4 bottom-2 flex-row items-end opacity-90">
                <Ionicons name="man" size={54} color="#FFF52E" />
                <Ionicons name="body" size={32} color="#FFF52E" style={{ marginHorizontal: -6 }} />
                <Ionicons name="woman" size={50} color="#FFF52E" />
              </View>
            </LinearGradient>
          </Pressable>

          {/* Bottom Dual Grid: Medication & Home Care */}
          <View className="flex-row gap-3">
            {/* Medication */}
            <Pressable
              className="flex-1"
              onPress={() => navigation.navigate("MedicationCenter")}
            >
              <LinearGradient
                colors={["#00B87C", "#00875A"]}
                className="rounded-2xl p-4 items-center justify-center py-5"
              >
                <Ionicons name="medical" size={24} color="#FFFFFF" />
                <Text className="text-white text-sm font-bold mt-2">Medication</Text>
              </LinearGradient>
            </Pressable>

            {/* Home Care */}
            <Pressable
              className="flex-1"
              onPress={() => navigation.navigate("OnboardingHomeServices")}
            >
              <LinearGradient
                colors={["#00A896", "#028090"]}
                className="rounded-2xl p-4 items-center justify-center py-5"
              >
                <Ionicons name="briefcase" size={24} color="#FFFFFF" />
                <Text className="text-white text-sm font-bold mt-2">Home Care</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </ScrollView>

        {/* Floating Action Plus (+) Button */}
        <Pressable
          className="absolute right-6 bottom-24 w-14 h-14 rounded-full bg-indigo-600 items-center justify-center shadow-lg"
          onPress={() => navigation.navigate("Discover")}
        >
          <Ionicons name="add" size={30} color="#FFFFFF" />
        </Pressable>

        {/* Dark Bottom Nav Bar */}
        <View className="bg-slate-900 flex-row justify-around items-center py-3 px-4 rounded-t-3xl">
          <Pressable className="items-center" onPress={() => navigation.navigate("HomeDashboard")}>
            <View className="w-10 h-10 rounded-full bg-blue-500/20 items-center justify-center">
              <Ionicons name="home" size={20} color="#60A5FA" />
            </View>
          </Pressable>
          <Pressable className="items-center" onPress={() => navigation.navigate("HealthDashboard")}>
            <Ionicons name="medical-outline" size={22} color="#94A3B8" />
            <Text className="text-[10px] text-slate-400 mt-1 font-medium">Health</Text>
          </Pressable>
          <Pressable className="items-center" onPress={() => navigation.navigate("Discover")}>
            <Ionicons name="compass-outline" size={22} color="#94A3B8" />
            <Text className="text-[10px] text-slate-400 mt-1 font-medium">Discover</Text>
          </Pressable>
          <Pressable className="items-center" onPress={() => navigation.navigate("FitnessDashboard")}>
            <Ionicons name="fitness-outline" size={22} color="#94A3B8" />
            <Text className="text-[10px] text-slate-400 mt-1 font-medium">Fitness</Text>
          </Pressable>
          <Pressable className="items-center" onPress={() => navigation.navigate("CreateProfile")}>
            <Ionicons name="person-outline" size={22} color="#94A3B8" />
            <Text className="text-[10px] text-slate-400 mt-1 font-medium">Profile</Text>
          </Pressable>
        </View>
      </View>
    </ScreenContainer>
  );
}

