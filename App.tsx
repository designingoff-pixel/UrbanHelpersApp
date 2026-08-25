import React, { useEffect, useRef } from "react";
import { StyleSheet } from "react-native";
import { NavigationContainer, NavigationContainerRef } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as Notifications from "expo-notifications";
import { RootNavigator } from "@/navigation/RootNavigator";
import {
  registerForPushNotifications,
  setupDefaultNotifications,
  isValidScreen,
} from "@/services/notificationService";
import { RootStackParamList } from "@/navigation/types";
import { AuthProvider } from "@/context/AuthContext";

export default function App() {
  // Ref to access navigation from outside React tree (notification taps)
  const navigationRef = useRef<NavigationContainerRef<RootStackParamList>>(null);
  const notifListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    // ── 1. Register for push notifications + set up defaults ──────────────
    (async () => {
      const token = await registerForPushNotifications();
      if (token) {
        console.log("[App] Expo push token:", token);
        // TODO: send token to your backend → POST /api/user/push-token
      }
      await setupDefaultNotifications();
    })();

    // ── 2. Listener: notification arrives while app is OPEN ───────────────
    notifListener.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log(
          "[App] Notification received:",
          notification.request.content.title
        );
      }
    );

    // ── 3. Listener: user TAPS a notification ──────────────────────────────
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const screen =
          response.notification.request.content.data?.screen;

        if (isValidScreen(screen) && navigationRef.current) {
          console.log("[App] Navigating to:", screen);
          navigationRef.current.navigate(screen as any);
        }
      });

    return () => {
      if (notifListener.current) {
        Notifications.removeNotificationSubscription(notifListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <AuthProvider>
          <NavigationContainer ref={navigationRef}>
            <StatusBar style="light" />
            <RootNavigator />
          </NavigationContainer>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
