import React, { useState } from "react";
import { ScrollView, Text, View, Pressable, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/types";
import { ScreenContainer } from "@/components";

type Props = NativeStackScreenProps<RootStackParamList, "HomeDashboard">;

const PILLS = [
  { id: "home", label: "Home", icon: "home" },
  { id: "health", label: "Health", icon: "heart" },
  { id: "fitness", label: "Fitness", icon: "fitness" },
  { id: "care", label: "Home Care", icon: "construct" },
];

export default function HomeDashboardScreen({ navigation }: Props) {
  const [activePill, setActivePill] = useState("home");

  return (
    <ScreenContainer>
      <ScrollView className="flex-1 px-5 pt-3" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header Bar */}
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center gap-3">
            <View className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 items-center justify-center overflow-hidden">
              <Ionicons name="person-circle" size={40} color="#94A3B8" />
            </View>
            <View>
              <Text className="text-2xl font-bold text-slate-800 tracking-tight">Urban Helpers</Text>
              <Text className="text-xs text-slate-500 font-medium">Good Morning, Alex 👋</Text>
              <Text className="text-[11px] text-slate-400">Your companion for healthier living.</Text>
            </View>
          </View>
          <View className="flex-row gap-2">
            <View className="w-9 h-9 rounded-full bg-slate-800 items-center justify-center shadow-sm">
              <Ionicons name="notifications-outline" size={18} color="#FFFFFF" />
            </View>
            <View className="w-9 h-9 rounded-full bg-slate-800 items-center justify-center shadow-sm">
              <Ionicons name="ellipsis-vertical" size={18} color="#FFFFFF" />
            </View>
          </View>
        </View>

        {/* Category Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-5">
          <View className="flex-row gap-2.5">
            {PILLS.map((p) => {
              const isActive = activePill === p.id;
              return (
                <Pressable
                  key={p.id}
                  onPress={() => setActivePill(p.id)}
                  className={`flex-row items-center px-4 py-2 rounded-full ${
                    isActive ? "bg-slate-900 shadow-sm" : "bg-white border border-slate-200"
                  }`}
                >
                  <Ionicons name={p.icon as any} size={15} color={isActive ? "#38BDF8" : "#475569"} style={{ marginRight: 6 }} />
                  <Text className={`font-semibold text-xs ${isActive ? "text-white" : "text-slate-700"}`}>
                    {p.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        {/* Banner Card: Wellbeing */}
        <LinearGradient
          colors={["#274353", "#1B2A36"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ borderRadius: 24, padding: 20, marginBottom: 16, elevation: 4 }}
        >
          <View className="flex-row justify-between items-start">
            <View className="flex-1 pr-3">
              <Text className="text-xl font-bold text-white mb-1.5 leading-snug">
                Take care of your family's wellbeing
              </Text>
              <Text className="text-xs text-slate-300 leading-relaxed mb-4">
                Manage health, appointments, reminders, and home services in one place.
              </Text>
            </View>
            <View className="w-20 h-16 rounded-xl bg-slate-800/80 items-center justify-center border border-slate-600/40">
              <Ionicons name="shapes-sharp" size={28} color="#38BDF8" />
            </View>
          </View>
          <View className="flex-row justify-between items-center mt-1">
            <View className="flex-row gap-1.5 items-center">
              <View className="w-5 h-1.5 rounded-full bg-white" />
              <View className="w-1.5 h-1.5 rounded-full bg-white/40" />
              <View className="w-1.5 h-1.5 rounded-full bg-white/40" />
            </View>
            <Pressable
              onPress={() => navigation.navigate("Discover")}
              className="flex-row items-center bg-white/10 px-4 py-2 rounded-full border border-white/20 active:opacity-80"
            >
              <Text className="text-xs font-semibold text-white mr-1.5">Explore</Text>
              <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
            </Pressable>
          </View>
        </LinearGradient>

        {/* Energy Score Banner Card */}
        <Pressable onPress={() => navigation.navigate("FitnessDashboard")} className="mb-4 active:opacity-90">
          <LinearGradient
            colors={["#2584C6", "#38BDF8"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ borderRadius: 20, padding: 18, elevation: 3 }}
          >
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-lg font-bold text-white mb-0.5">Energy Score</Text>
                <Text className="text-xs text-white/80">Understand how your day is shaping up.</Text>
              </View>
              <View className="w-10 h-10 rounded-full bg-white/20 items-center justify-center border border-white/30">
                <View className="w-6 h-6 rounded-full bg-white shadow" />
              </View>
            </View>
          </LinearGradient>
        </Pressable>

        {/* Grid: Heart Health & Sleep */}
        <View className="flex-row gap-3 mb-4">
          <Pressable
            onPress={() => navigation.navigate("HealthDataAnalytics")}
            className="flex-1 active:opacity-90"
          >
            <LinearGradient
              colors={["#A21CAF", "#7E22CE"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ borderRadius: 20, padding: 16, height: 160, justifyContent: "space-between", elevation: 3 }}
            >
              <View className="w-10 h-10 rounded-full bg-white/20 items-center justify-center">
                <Ionicons name="heart" size={20} color="#FFFFFF" />
              </View>
              <View>
                <Text className="text-base font-bold text-white">Heart Health</Text>
                <Text className="text-[11px] text-white/80 mt-0.5">View your heart insights.</Text>
              </View>
            </LinearGradient>
          </Pressable>

          <Pressable
            onPress={() => navigation.navigate("SleepDashboard")}
            className="flex-1 active:opacity-90"
          >
            <LinearGradient
              colors={["#6366F1", "#4F46E5"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ borderRadius: 20, padding: 16, height: 160, justifyContent: "space-between", elevation: 3 }}
            >
              <View className="w-10 h-10 rounded-full bg-white/20 items-center justify-center">
                <Ionicons name="moon" size={20} color="#FFFFFF" />
              </View>
              <View>
                <Text className="text-base font-bold text-white">Sleep</Text>
                <Text className="text-[11px] text-white/80 mt-0.5">Track your sleep quality.</Text>
              </View>
            </LinearGradient>
          </Pressable>
        </View>

        {/* Nutrition Card */}
        <Pressable onPress={() => navigation.navigate("NutritionDashboard")} className="mb-4 active:opacity-90">
          <LinearGradient
            colors={["#D97706", "#EA580C"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ borderRadius: 20, padding: 18, elevation: 3 }}
          >
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-lg font-bold text-white mb-0.5">Nutrition</Text>
                <Text className="text-xs text-white/80">Build healthier eating habits.</Text>
              </View>
              <View className="w-10 h-10 rounded-full bg-white/20 items-center justify-center">
                <Ionicons name="nutrition" size={22} color="#FFFFFF" />
              </View>
            </View>
          </LinearGradient>
        </Pressable>

        {/* Family Care Card */}
        <Pressable onPress={() => navigation.navigate("FamilyDashboard")} className="mb-4 active:opacity-90">
          <LinearGradient
            colors={["#F59E0B", "#D97706"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ borderRadius: 20, padding: 18, elevation: 3 }}
          >
            <View className="w-10 h-10 rounded-full bg-white/20 items-center justify-center mb-3">
              <Ionicons name="people" size={22} color="#FFFFFF" />
            </View>
            <Text className="text-xl font-bold text-white mb-1">Family Care</Text>
            <Text className="text-xs text-white/80 mb-4 max-w-[200px]">
              Stay connected with loved ones and manage care plans.
            </Text>
            <View className="flex-row justify-end items-end">
              <Ionicons name="people-circle-outline" size={48} color="rgba(255,255,255,0.35)" />
            </View>
          </LinearGradient>
        </Pressable>

        {/* Grid: Medication & Home Care */}
        <View className="flex-row gap-3 mb-4">
          <Pressable
            onPress={() => navigation.navigate("MedicationCenter")}
            className="flex-1 active:opacity-90"
          >
            <LinearGradient
              colors={["#10B981", "#059669"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ borderRadius: 20, padding: 16, height: 90, alignItems: "center", justifyContent: "center", elevation: 3 }}
            >
              <Ionicons name="medical" size={24} color="#FFFFFF" />
              <Text className="text-sm font-bold text-white mt-1">Medication</Text>
            </LinearGradient>
          </Pressable>

          <Pressable
            onPress={() => navigation.navigate("Discover")}
            className="flex-1 active:opacity-90"
          >
            <LinearGradient
              colors={["#14B8A6", "#0D9488"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ borderRadius: 20, padding: 16, height: 90, alignItems: "center", justifyContent: "center", elevation: 3 }}
            >
              <Ionicons name="briefcase" size={24} color="#FFFFFF" />
              <Text className="text-sm font-bold text-white mt-1">Home Care</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </ScrollView>

      {/* Floating Action Button (+ Add) */}
      <View className="absolute bottom-20 right-6">
        <Pressable
          onPress={() => navigation.navigate("EmergencyAssistance")}
          className="w-14 h-14 rounded-full bg-indigo-600 items-center justify-center shadow-lg active:scale-95"
          style={{ elevation: 6 }}
        >
          <Ionicons name="add" size={30} color="#FFFFFF" />
        </Pressable>
      </View>

      {/* Bottom Navigation Bar */}
      <View className="bg-slate-900 flex-row justify-around items-center py-3 px-4 border-t border-slate-800">
        <Pressable className="items-center">
          <View className="w-10 h-10 rounded-full bg-sky-500/20 items-center justify-center">
            <Ionicons name="home" size={22} color="#38BDF8" />
          </View>
        </Pressable>
        <Pressable onPress={() => navigation.navigate("HealthDashboard")} className="items-center">
          <Ionicons name="medical" size={20} color="#94A3B8" />
          <Text className="text-[10px] text-slate-400 mt-0.5">Health</Text>
        </Pressable>
        <Pressable onPress={() => navigation.navigate("Discover")} className="items-center">
          <Ionicons name="compass" size={20} color="#94A3B8" />
          <Text className="text-[10px] text-slate-400 mt-0.5">Discover</Text>
        </Pressable>
        <Pressable onPress={() => navigation.navigate("FitnessDashboard")} className="items-center">
          <Ionicons name="barbell" size={20} color="#94A3B8" />
          <Text className="text-[10px] text-slate-400 mt-0.5">Fitness</Text>
        </Pressable>
        <Pressable onPress={() => navigation.navigate("SystemPermissions")} className="items-center">
          <Ionicons name="person" size={20} color="#94A3B8" />
          <Text className="text-[10px] text-slate-400 mt-0.5">Profile</Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

