import React, { useEffect } from "react";
import { View, Text, ImageBackground, StyleSheet, Dimensions } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/types";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/services/firebase";
import { doc, getDoc } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Props = NativeStackScreenProps<RootStackParamList, "Splash">;
const { width, height } = Dimensions.get("window");

export default function SplashScreen({ navigation }: Props) {
  useEffect(() => {
    let resolved = false;

    const checkAuth = async () => {
      const isLocalLoggedIn = await AsyncStorage.getItem("@customer_logged_in");

      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (resolved) return;
        resolved = true;
        unsubscribe();

        if (firebaseUser) {
          try {
            const uSnap = await getDoc(doc(db, "users", firebaseUser.uid));
            if (uSnap.exists() && uSnap.data().profileCompleted) {
              navigation.reset({
                index: 0,
                routes: [{ name: "ServicesDashboard" }],
              });
              return;
            }
          } catch (_) {}
          navigation.reset({
            index: 0,
            routes: [{ name: "ServicesDashboard" }],
          });
        } else if (isLocalLoggedIn === "true") {
          navigation.reset({
            index: 0,
            routes: [{ name: "ServicesDashboard" }],
          });
        } else {
          navigation.reset({
            index: 0,
            routes: [{ name: "Welcome" }],
          });
        }
      });

      setTimeout(() => {
        if (!resolved) {
          resolved = true;
          unsubscribe();
          if (auth.currentUser || isLocalLoggedIn === "true") {
            navigation.reset({
              index: 0,
              routes: [{ name: "ServicesDashboard" }],
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
    <ImageBackground
      source={require("../../../assets/splash_art.jpg")}
      style={styles.bg}
      resizeMode="cover"
    >
      <View style={styles.loaderContainer}>
        <Text style={styles.loadingText}>LOADING...</Text>
        <View style={styles.progressBar}>
          <View style={styles.progressFill} />
        </View>
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
    paddingBottom: 44,
    alignItems: "center",
  },
  loadingText: {
    color: "#93C5FD",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2,
    marginBottom: 8,
  },
  progressBar: {
    width: 140,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.25)",
    overflow: "hidden",
  },
  progressFill: {
    width: "60%",
    height: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 2,
  },
});
