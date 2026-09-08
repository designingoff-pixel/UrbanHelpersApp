import React, { useEffect } from "react";
import { Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/types";
import { colors } from "@/theme/colors";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/services/firebase";

type Props = NativeStackScreenProps<RootStackParamList, "Splash">;

/**
 * Splash screen shown on app launch.
 * - Waits for Firebase to resolve auth state (max 2s).
 * - If a user session is already active → goes directly to HomeDashboard.
 * - If no session → goes to Welcome (login flow).
 */
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SplashScreen({ navigation }: Props) {
  useEffect(() => {
    let resolved = false;

    const checkAuth = async () => {
      const isLocalLoggedIn = await AsyncStorage.getItem("@customer_logged_in");

      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        if (resolved) return;
        resolved = true;
        unsubscribe();

        if (firebaseUser || isLocalLoggedIn === "true") {
          navigation.reset({
            index: 0,
            routes: [{ name: "HomeDashboard" }],
          });
        } else {
          navigation.reset({
            index: 0,
            routes: [{ name: "Welcome" }],
          });
        }
      });

      // Safety fallback
      const fallback = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          unsubscribe();
          if (auth.currentUser || isLocalLoggedIn === "true") {
            navigation.reset({
              index: 0,
              routes: [{ name: "HomeDashboard" }],
            });
          } else {
            navigation.reset({
              index: 0,
              routes: [{ name: "Welcome" }],
            });
          }
        }
      }, 2500);
    };

    checkAuth();
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
