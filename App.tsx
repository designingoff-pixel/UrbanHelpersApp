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
  addInAppNotice,
} from "@/services/notificationService";
import { RootStackParamList } from "@/navigation/types";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider, useTheme } from "@/context/ThemeContext";

function MainApp({ navigationRef }: { navigationRef: React.RefObject<NavigationContainerRef<RootStackParamList>> }) {
  const { colors, isDark } = useTheme();

  return (
    <NavigationContainer
      ref={navigationRef}
      theme={{
        dark: isDark,
        colors: {
          primary: colors.primary,
          background: colors.background,
          card: colors.card,
          text: colors.text,
          border: colors.cardBorder,
          notification: colors.accent,
        },
      }}
    >
      <StatusBar style={colors.statusBar} />
      <RootNavigator />
    </NavigationContainer>
  );
}

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
      }
      await setupDefaultNotifications();
    })();

    // ── 2. Listener: notification arrives while app is OPEN ───────────────
    notifListener.current = Notifications.addNotificationReceivedListener(
      async (notification) => {
        const title = notification.request.content.title || "Notification";
        const body = notification.request.content.body || "";

        let tag = "[Notice]";
        if (title.includes("Medication") || title.includes("Medicine")) tag = "[Medicine]";
        else if (title.includes("Hydration")) tag = "[Hydration]";
        else if (title.includes("Step") || title.includes("Move") || title.includes("Workout")) tag = "[Fitness]";
        else if (title.includes("Booking") || title.includes("Helper") || title.includes("Vendor")) tag = "[Service]";
        else if (title.includes("SOS") || title.includes("Emergency")) tag = "[Emergency]";

        await addInAppNotice({
          tag,
          title,
          date: "Just now",
          body,
          isRead: false,
        });
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
        <ThemeProvider>
          <AuthProvider>
            <MainApp navigationRef={navigationRef} />
          </AuthProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
