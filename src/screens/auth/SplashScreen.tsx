import React, { useEffect } from "react";
import { Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/types";
import { colors } from "@/theme/colors";

type Props = NativeStackScreenProps<RootStackParamList, "Splash">;

/** Auto-advances to Welcome after 2s, matching the Figma AFTER_TIMEOUT reaction. */
export default function SplashScreen({ navigation }: Props) {
  useEffect(() => {
    const timer = setTimeout(() => navigation.replace("Welcome"), 2000);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <LinearGradient
      colors={[...colors.gradients.splash]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <View className="flex-1 items-center justify-center">
        <View className="w-32 h-32 rounded-full bg-white/10 items-center justify-center mb-6">
          <Ionicons name="hand-left" size={56} color="#FFFFFF" />
        </View>
        <Text className="font-heading text-3xl text-white tracking-tight">Urban Helpers</Text>
      </View>
      <View className="items-center px-6 pb-12">
        <Text className="font-body text-base text-white/90 text-center max-w-[280px] mb-6">
          One App. Better Health. Better Home.{"\n"}Better Living.
        </Text>
        <View className="w-48 h-1.5 rounded-pill bg-white/10 overflow-hidden">
          <View className="w-1/3 h-full rounded-pill bg-white" />
        </View>
      </View>
    </LinearGradient>
  );
}
