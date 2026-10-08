import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  Dimensions,
  Animated,
  Easing,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/types";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/services/firebase";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Props = NativeStackScreenProps<RootStackParamList, "Splash">;
const { width, height } = Dimensions.get("window");

export default function SplashScreen({ navigation }: Props) {
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Animate progress bar smoothly from 0% to 100% over 2.2 seconds
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 2200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();

    let isMounted = true;

    // 2. Perform authentication and profile check in background
    (async () => {
      const minDisplayPromise = new Promise((resolve) => setTimeout(resolve, 2200));

      let determinedRoute: keyof RootStackParamList = "Welcome";

      try {
        const isLocalLoggedIn = await AsyncStorage.getItem("@customer_logged_in");
        const currentFirebaseUser = auth.currentUser;

        if (currentFirebaseUser || isLocalLoggedIn === "true") {
          determinedRoute = "ServicesDashboard";
        } else {
          // Wait for onAuthStateChanged briefly (up to 1.2s)
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

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <ImageBackground
      source={require("../../../assets/splash_art.png")}
      style={styles.bg}
      resizeMode="cover"
    >
      <View style={styles.loaderContainer}>
        <Text style={styles.loadingText}>LOADING...</Text>
        <View style={styles.progressBar}>
          <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
        </View>
        <Text style={styles.versionText}>v2.4.0 · UrbanHelpers</Text>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: {
    width,
    height,
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  loaderContainer: {
    width: "100%",
    paddingBottom: 48,
    alignItems: "center",
  },
  loadingText: {
    color: "#BAE6FD",
    fontSize: 11.5,
    fontWeight: "800",
    letterSpacing: 2.5,
    marginBottom: 10,
  },
  progressBar: {
    width: 160,
    height: 5,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.22)",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 3,
  },
  versionText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 1,
    marginTop: 14,
  },
});
