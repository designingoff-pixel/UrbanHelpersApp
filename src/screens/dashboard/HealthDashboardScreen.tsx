import React from "react";
import { ScrollView, Text, View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/types";
import { ScreenContainer } from "@/components";

type Props = NativeStackScreenProps<RootStackParamList, "HealthDashboard">;

export default function HealthDashboardScreen({ navigation }: Props) {
  return (
    <ScreenContainer style={{ backgroundColor: "#081826" }}>
      <View className="flex-1 bg-[#081826]">
        {/* Header */}
        <View className="px-5 pt-4 pb-3 flex-row justify-between items-center">
          <View>
            <Text className="text-white text-2xl font-bold">Health Hub</Text>
            <Text className="text-slate-400 text-xs mt-0.5">Real-time vitals & medical records</Text>
          </View>
          <Pressable
            className="w-10 h-10 rounded-full bg-[#1B2B3B] items-center justify-center border border-white/10"
            onPress={() => navigation.navigate("EmergencyAssistance")}
          >
            <Ionicons name="alert-circle" size={22} color="#EF4444" />
          </Pressable>
        </View>

        <ScrollView className="flex-1 px-5 pt-2" contentContainerStyle={{ paddingBottom: 90 }}>
          {/* Hero Banner: AI Health Insights */}
          <Pressable onPress={() => navigation.navigate("AICoach")}>
            <LinearGradient
              colors={["#0052D4", "#4364F7", "#6FB1FC"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="rounded-3xl p-5 mb-4 relative overflow-hidden"
            >
              <View className="flex-row items-center mb-2">
                <View className="w-8 h-8 rounded-full bg-white/20 items-center justify-center mr-2">
                  <Ionicons name="sparkles" size={18} color="#FFFFFF" />
                </View>
                <Text className="text-white text-xs font-bold uppercase tracking-wider">AI Health Companion</Text>
              </View>
              <Text className="text-white text-xl font-bold max-w-[240px] leading-tight mb-2">
                "Your heart rate & hydration look optimal today!"
              </Text>
              <Text className="text-white/80 text-xs mb-3">Tap to talk with your AI Coach for custom advice →</Text>
            </LinearGradient>
          </Pressable>

          {/* Real-time Vitals Header */}
          <Text className="text-white font-bold text-base mb-3">Live Vitals & Analytics</Text>

          {/* Vitals Grid: Heart Rate & Oxygen */}
          <View className="flex-row gap-3 mb-3">
            <Pressable
              className="flex-1"
              onPress={() => navigation.navigate("HealthDataAnalytics")}
            >
              <LinearGradient
                colors={["#E11D48", "#BE123C"]}
                className="rounded-2xl p-4 h-36 justify-between"
              >
                <View className="flex-row justify-between items-center">
                  <Ionicons name="heart" size={24} color="#FFFFFF" />
                  <Text className="text-white/80 text-[10px] font-bold uppercase">BPM</Text>
                </View>
                <View>
                  <Text className="text-white text-2xl font-extrabold">72 bpm</Text>
                  <Text className="text-white/90 text-xs font-medium">Heart Rate • Normal</Text>
                </View>
              </LinearGradient>
            </Pressable>

            <Pressable
              className="flex-1"
              onPress={() => navigation.navigate("BloodTestReports")}
            >
              <LinearGradient
                colors={["#2563EB", "#1D4ED8"]}
                className="rounded-2xl p-4 h-36 justify-between"
              >
                <View className="flex-row justify-between items-center">
                  <Ionicons name="water" size={24} color="#FFFFFF" />
                  <Text className="text-white/80 text-[10px] font-bold uppercase">SpO2</Text>
                </View>
                <View>
                  <Text className="text-white text-2xl font-extrabold">98%</Text>
                  <Text className="text-white/90 text-xs font-medium">Blood Oxygen • Optimal</Text>
                </View>
              </LinearGradient>
            </Pressable>
          </View>

          {/* Medical Records Shortcuts */}
          <Text className="text-white font-bold text-base mb-3 mt-2">Clinical Records Vault</Text>
          <View className="flex-row gap-3 mb-4">
            <Pressable
              className="flex-1 bg-[#1B2B3B] p-4 rounded-2xl border border-white/10 items-center justify-center py-4"
              onPress={() => navigation.navigate("PrescriptionManagement")}
            >
              <Ionicons name="document-text" size={24} color="#38BDF8" />
              <Text className="text-white text-xs font-semibold mt-2">Prescriptions</Text>
            </Pressable>

            <Pressable
              className="flex-1 bg-[#1B2B3B] p-4 rounded-2xl border border-white/10 items-center justify-center py-4"
              onPress={() => navigation.navigate("LabReportsHub")}
            >
              <Ionicons name="flask" size={24} color="#A78BFA" />
              <Text className="text-white text-xs font-semibold mt-2">Lab Reports</Text>
            </Pressable>

            <Pressable
              className="flex-1 bg-[#1B2B3B] p-4 rounded-2xl border border-white/10 items-center justify-center py-4"
              onPress={() => navigation.navigate("DoctorAdvice")}
            >
              <Ionicons name="chatbubbles" size={24} color="#4ADE80" />
              <Text className="text-white text-xs font-semibold mt-2">Doctor Advice</Text>
            </Pressable>
          </View>

          {/* Daily Care Reminders */}
          <Text className="text-white font-bold text-base mb-3">Daily Care & Reminders</Text>
          <Pressable
            className="mb-3"
            onPress={() => navigation.navigate("MedicationCenter")}
          >
            <LinearGradient
              colors={["#059669", "#047857"]}
              className="rounded-2xl p-4 flex-row items-center justify-between"
            >
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-full bg-white/20 items-center justify-center mr-3">
                  <Ionicons name="medical" size={20} color="#FFFFFF" />
                </View>
                <View>
                  <Text className="text-white font-bold text-base">Medication Tracker</Text>
                  <Text className="text-white/80 text-xs">2 pills scheduled for today</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
            </LinearGradient>
          </Pressable>

          <Pressable
            onPress={() => navigation.navigate("VaccinationCenter")}
          >
            <LinearGradient
              colors={["#7C3AED", "#6D28D9"]}
              className="rounded-2xl p-4 flex-row items-center justify-between"
            >
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-full bg-white/20 items-center justify-center mr-3">
                  <Ionicons name="shield-checkmark" size={20} color="#FFFFFF" />
                </View>
                <View>
                  <Text className="text-white font-bold text-base">Vaccination History</Text>
                  <Text className="text-white/80 text-xs">Flu Shot due in 2 weeks</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
            </LinearGradient>
          </Pressable>
        </ScrollView>

        {/* Samsung Health Style Dark Navigation */}
        <View className="bg-[#0F2027] flex-row justify-around items-center py-3 px-4 rounded-t-3xl border-t border-white/10">
          <Pressable className="items-center" onPress={() => navigation.navigate("HomeDashboard")}>
            <Ionicons name="home-outline" size={22} color="#94A3B8" />
            <Text className="text-[10px] text-slate-400 mt-1">Home</Text>
          </Pressable>
          <Pressable className="items-center" onPress={() => navigation.navigate("HealthDashboard")}>
            <View className="w-10 h-10 rounded-full bg-blue-500/20 items-center justify-center">
              <Ionicons name="heart" size={20} color="#3B82F6" />
            </View>
          </Pressable>
          <Pressable className="items-center" onPress={() => navigation.navigate("FitnessDashboard")}>
            <Ionicons name="fitness-outline" size={22} color="#94A3B8" />
            <Text className="text-[10px] text-slate-400 mt-1">Fitness</Text>
          </Pressable>
          <Pressable className="items-center" onPress={() => navigation.navigate("Discover")}>
            <Ionicons name="compass-outline" size={22} color="#94A3B8" />
            <Text className="text-[10px] text-slate-400 mt-1">Market</Text>
          </Pressable>
        </View>
      </View>
    </ScreenContainer>
  );
}

