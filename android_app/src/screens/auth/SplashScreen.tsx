import React, { useEffect, useRef } from "react";
import {
  ImageBackground,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/types";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/services/firebase";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Props = NativeStackScreenProps<RootStackParamList, "Splash">;
const { width, height } = Dimensions.get("window");

export default function SplashScreen({ navigation }: Props) {
  const hasNavigated = useRef(false);

  const navigateTo = (target: keyof RootStackParamList) => {
    if (hasNavigated.current) return;
    hasNavigated.current = true;
    try {
      navigation.reset({
        index: 0,
        routes: [{ name: target }],
      });
    } catch {
      navigation.replace(target as any);
    }
  };

  useEffect(() => {
    // Failsafe timer: Guaranteed transition within 1.5 seconds maximum
    const failsafeTimeout = setTimeout(() => {
      navigateTo("Welcome");
    }, 1500);

    (async () => {
      let determinedRoute: keyof RootStackParamList = "Welcome";

      try {
        const isLocalLoggedIn = await AsyncStorage.getItem("@customer_logged_in");
        const currentFirebaseUser = auth.currentUser;

        if (currentFirebaseUser || isLocalLoggedIn === "true") {
          determinedRoute = "ServicesDashboard";
        } else {
          determinedRoute = await new Promise<keyof RootStackParamList>((resolve) => {
            const timeout = setTimeout(() => resolve("Welcome"), 600);
            const unsub = onAuthStateChanged(auth, (u) => {
              clearTimeout(timeout);
              unsub();
              if (u) {
                resolve("ServicesDashboard");
              } else {
                resolve("Welcome");
              }
            });
          });
        }
      } catch (_) {
        determinedRoute = "Welcome";
      }

      clearTimeout(failsafeTimeout);
      // Brief smooth transition
      setTimeout(() => {
        navigateTo(determinedRoute);
      }, 500);
    })();

    return () => {
      clearTimeout(failsafeTimeout);
    };
  }, [navigation]);

  return (
    <TouchableOpacity
      activeOpacity={1}
      style={{ flex: 1 }}
      onPress={() => navigateTo("Welcome")}
    >
      <ImageBackground
        source={require("../../../assets/splash_art.png")}
        style={styles.bg}
        resizeMode="cover"
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  bg: {
    width,
    height,
    flex: 1,
  },
});
