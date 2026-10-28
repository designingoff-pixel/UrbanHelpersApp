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
    try {
      await Notifications.setNotificationChannelAsync("urgent-orders", {
        name: "🔔 New Booking Assignments",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 150, 250],
        lightColor: "#00BCD4",
        sound: "default",
        enableVibrate: true,
        showBadge: true,
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
        bypassDnd: true,
      });
    } catch (e) {
      console.warn("[VendorNotification] Error creating notification channel:", e);
    }
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

// ── Send random OTP notification to vendor upon login or resend ─────────────
export async function sendVendorLoginOTPNotification(
  otp: string,
  vendorId: string
): Promise<void> {
  try {
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("auth-otp", {
        name: "🔑 Security Verification",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 200, 250],
        lightColor: "#10B981",
        sound: "default",
        enableVibrate: true,
        showBadge: true,
        bypassDnd: true,
      }).catch(() => {});
    }

    // Ensure permissions if not granted
    const { status: existingStatus } = await Notifications.getPermissionsAsync().catch(() => ({ status: "undetermined" }));
    if (existingStatus !== "granted") {
      await Notifications.requestPermissionsAsync().catch(() => {});
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `🔑 Urban Helpers Partner Login OTP: ${otp}`,
        body: `Your verification code for Partner ID ${vendorId} is ${otp}. Valid for 10 minutes. Do not share this code.`,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.MAX,
        data: { otp, vendorId, type: "vendor_auth_otp" },
      },
      trigger: null, // deliver immediately
    });
  } catch (err) {
    console.warn("[VendorNotification] Failed to send login OTP notification:", err);
  }
}

