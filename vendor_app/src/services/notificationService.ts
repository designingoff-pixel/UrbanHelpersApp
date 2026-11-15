import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
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
        vibrationPattern: [0, 400, 200, 400, 200, 400],
        lightColor: "#00BCD4",
        sound: "default",
        enableVibrate: true,
        showBadge: true,
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
        bypassDnd: true,
        audioAttributes: {
          usage: Notifications.AndroidAudioUsage.NOTIFICATION_EVENT,
          contentType: Notifications.AndroidAudioContentType.SONIFICATION,
        },
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

    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      Constants.easConfig?.projectId;

    let token: string | null = null;
    try {
      const tokenData = await Notifications.getExpoPushTokenAsync(
        projectId ? { projectId } : undefined
      );
      token = tokenData.data;
    } catch (expoErr) {
      console.warn("[VendorNotification] Expo push token fetch warning:", expoErr);
      try {
        const devToken = await Notifications.getDevicePushTokenAsync();
        token = devToken.data;
      } catch (devErr) {
        console.warn("[VendorNotification] Device push token error:", devErr);
      }
    }

    return token;
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
        sound: "default",
        channelId: "urgent-orders",
        priority: Notifications.AndroidNotificationPriority.MAX,
        vibrate: [0, 400, 200, 400, 200, 400],
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

