import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";

// ── How notifications appear when vendor app is OPEN ─────────────────────────
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// ── Register for Push Notifications + Loud Channel Setup ─────────────────────
export async function registerVendorPushNotifications(): Promise<string | null> {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("urgent-orders", {
      name: "🔔 New Booking Assignments",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 200, 100, 200],
      lightColor: "#00BCD4",
      sound: "default",
      enableVibrate: true,
      showBadge: true,
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      bypassDnd: true,
    });
  }

  if (!Device.isDevice) {
    console.log("[VendorNotification] Simulated environment: push skipped");
    return null;
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.warn("[VendorNotification] Push notification permission denied");
      return null;
    }

    const tokenData = await Notifications.getExpoPushTokenAsync();
    return tokenData.data;
  } catch (err) {
    console.warn("[VendorNotification] Error obtaining push token:", err);
    return null;
  }
}

// ── Trigger a loud notification for incoming booking requests ─────────────────
export async function triggerLoudNewOrderNotification(
  serviceName: string,
  price: string,
  address: string,
  bookingId: string
): Promise<void> {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `⚡ New Booking Allotment: ${serviceName} (${price})`,
        body: `You have been assigned a service near ${address.slice(0, 30)}. Tap to review and accept.`,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        data: { screen: "HomeScreen", bookingId },
      },
      trigger: null, // deliver immediately
    });
  } catch (err) {
    console.warn("[VendorNotification] Failed to schedule local alert:", err);
  }
}
