import React, { useEffect } from "react";
import {
  ImageBackground,
  StyleSheet,
  Dimensions,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/types";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/services/firebase";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Props = NativeStackScreenProps<RootStackParamList, "Splash">;
const { width, height } = Dimensions.get("window");

export default function SplashScreen({ navigation }: Props) {
  useEffect(() => {
    let isMounted = true;

    (async () => {
      // Hold splash screen for 2.2 seconds
      const minDisplayPromise = new Promise((resolve) => setTimeout(resolve, 2200));

      let determinedRoute: keyof RootStackParamList = "Welcome";

      try {
        const isLocalLoggedIn = await AsyncStorage.getItem("@customer_logged_in");
        const currentFirebaseUser = auth.currentUser;

        if (currentFirebaseUser || isLocalLoggedIn === "true") {
          determinedRoute = "ServicesDashboard";
        } else {
          determinedRoute = await new Promise<keyof RootStackParamList>((resolve) => {
            const timeout = setTimeout(() => resolve("Welcome"), 1200);
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

      await minDisplayPromise;

      if (isMounted) {
        navigation.reset({
          index: 0,
          routes: [{ name: determinedRoute }],
        });
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [navigation]);

  return (
    <ImageBackground
      source={require("../../../assets/splash_art.png")}
      style={styles.bg}
      resizeMode="cover"
    />
  );
}

const styles = StyleSheet.create({
  bg: {
    width,
    height,
    flex: 1,
  },
});
