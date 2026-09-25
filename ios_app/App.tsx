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

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: any }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("[ErrorBoundary caught error]:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <SafeAreaProvider>
          <View style={{ flex: 1, backgroundColor: "#081826", justifyContent: "center", alignItems: "center", padding: 24 }}>
            <Text style={{ color: "#ffffff", fontSize: 22, fontWeight: "bold", marginBottom: 12 }}>Urban Helpers</Text>
            <Text style={{ color: "#94a3b8", fontSize: 14, textAlign: "center", marginBottom: 16 }}>
              The application encountered a temporary display issue.
            </Text>
            <Text style={{ color: "#ef4444", fontSize: 12, textAlign: "center", marginBottom: 24 }}>
              {String(this.state.error?.message || this.state.error || "Loading...")}
            </Text>
            <Pressable
              style={{ backgroundColor: "#00c6aa", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24 }}
              onPress={() => this.setState({ hasError: false, error: null })}
            >
              <Text style={{ color: "#ffffff", fontWeight: "bold" }}>Reload App</Text>
            </Pressable>
          </View>
        </SafeAreaProvider>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  // Ref to access navigation from outside React tree (notification taps)
  const navigationRef = useRef<NavigationContainerRef<RootStackParamList>>(null);
  const notifListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();
  // Track recently seen notification IDs to block duplicates (identifier -> timestamp)
  const recentNotifIds = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    // ── 1. Register for push notifications + set up defaults ──────────────
    (async () => {
      try {
        const token = await registerForPushNotifications();
        if (token) {
          console.log("[App] Expo push token:", token);
        }
        await setupDefaultNotifications();
      } catch (e) {
        console.warn("[App] Notification setup error:", e);
      }
    })();

    // ── 2. Listener: notification arrives while app is OPEN ───────────────
    try {
      notifListener.current = Notifications.addNotificationReceivedListener(
        async (notification) => {
          try {
            // ── Strong deduplication: block same identifier within 30 seconds ──
            const nid = notification.request.identifier;
            const now = Date.now();
            const lastSeen = recentNotifIds.current.get(nid);
            if (lastSeen && now - lastSeen < 30000) {
              console.log("[App] Duplicate notification blocked:", nid);
              return;
            }
            recentNotifIds.current.set(nid, now);
            // Clean up old entries > 60s
            recentNotifIds.current.forEach((ts, key) => {
              if (now - ts > 60000) recentNotifIds.current.delete(key);
            });

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
          } catch (e) {
            console.warn("[App] Notif receive error:", e);
          }
        }
      );
    } catch (e) {
      console.warn("[App] addNotificationReceivedListener error:", e);
    }

    // ── 3. Listener: user TAPS a notification ──────────────────────────────
    try {
      responseListener.current =
        Notifications.addNotificationResponseReceivedListener((response) => {
          try {
            const screen =
              response.notification.request.content.data?.screen;

            if (isValidScreen(screen) && navigationRef.current) {
              console.log("[App] Navigating to:", screen);
              navigationRef.current.navigate(screen as any);
            }
          } catch (e) {
            console.warn("[App] Notif tap handle error:", e);
          }
        });
    } catch (e) {
      console.warn("[App] addNotificationResponseReceivedListener error:", e);
    }

    return () => {
      try {
        if (notifListener.current) {
          Notifications.removeNotificationSubscription(notifListener.current);
        }
        if (responseListener.current) {
          Notifications.removeNotificationSubscription(responseListener.current);
        }
      } catch {}
    };
  }, []);

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={styles.root}>
        <SafeAreaProvider>
          <ThemeProvider>
            <AuthProvider>
              <MainApp navigationRef={navigationRef} />
            </AuthProvider>
          </ThemeProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
