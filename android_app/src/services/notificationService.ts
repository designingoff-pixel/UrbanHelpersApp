// ─────────────────────────────────────────────────────────────────────────────
// Urban Helpers — Notification Service
// expo-notifications v0.27.x  (Expo SDK 50)
// Trigger API: { hour, minute, repeats } for daily  |  { seconds, repeats } for interval
// ─────────────────────────────────────────────────────────────────────────────

import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const NOTIF_SETUP_KEY = "@urban_notif_setup_date";

// ── How notifications appear when app is OPEN ────────────────────────────────
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// ── Helpers ───────────────────────────────────────────────────────────────────

function dailyTrigger(hour: number, minute: number) {
  return { hour, minute, repeats: true } as any;
}

function intervalTrigger(seconds: number) {
  return { seconds, repeats: false } as any;
}

function weeklyTrigger(weekday: number, hour: number, minute: number) {
  // weekday 1=Sunday … 7=Saturday (Expo SDK 50 convention)
  return { weekday, hour, minute, repeats: true } as any;
}

// ── Permission + Channel Setup ────────────────────────────────────────────────

export async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) {
    console.log("[Notifications] Skipped — not a real device");
    return null;
  }

  if (Platform.OS === "android") {
    // Create notification channels (Android 8+)
    await Notifications.setNotificationChannelAsync("default", {
      name: "Urban Helpers",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#00bcd4",
      sound: "default",
      enableVibrate: true,
      showBadge: true,
    });
    await Notifications.setNotificationChannelAsync("medicine", {
      name: "Medicine Reminders",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 500, 200, 500],
      lightColor: "#10b981",
      sound: "default",
      enableVibrate: true,
      showBadge: true,
    });
    await Notifications.setNotificationChannelAsync("fitness", {
      name: "Fitness Reminders",
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#3b82f6",
      sound: "default",
    });
    await Notifications.setNotificationChannelAsync("services", {
      name: "Service Updates",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 300, 200, 300],
      lightColor: "#00bcd4",
      sound: "default",
      showBadge: true,
    });
    await Notifications.setNotificationChannelAsync("emergency", {
      name: "Emergency Alerts",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 1000, 500, 1000],
      lightColor: "#ef4444",
      sound: "default",
      enableVibrate: true,
      showBadge: true,
    });
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;
  if (existing !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== "granted") {
    console.log("[Notifications] Permission denied");
    return null;
  }

  try {
    const token = await Notifications.getExpoPushTokenAsync();
    console.log("[Notifications] Push token:", token.data);
    return token.data;
  } catch (e) {
    console.log("[Notifications] Token error:", e);
    return null;
  }
}

export async function cancelAllScheduledNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function cancelNotificationById(id: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(id);
}

export function getNextTriggerDate(hour: number, minute: number): Date {
  const target = new Date();
  target.setHours(hour, minute, 0, 0);
  if (target.getTime() <= Date.now()) {
    target.setDate(target.getDate() + 1);
  }
  return target;
}

// ─────────────────────────────────────────────────────────────────────────────
// 💊 MEDICINE
// ─────────────────────────────────────────────────────────────────────────────

export async function scheduleMedicineReminder(
  medicineName: string,
  dosage: string,
  hour: number,
  minute: number,
  instructions?: string
): Promise<string> {
  const bodyLine = `Time to take ${medicineName} ${dosage}`;
  const fullBody = instructions ? `${bodyLine}\n${instructions}` : bodyLine;
  const identifier = `medicine_${medicineName.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
  try {
    await Notifications.cancelScheduledNotificationAsync(identifier);
  } catch {}
  return Notifications.scheduleNotificationAsync({
    identifier,
    content: {
      title: "🔔 Medication Reminder",
      body: fullBody,
      sound: true,
      data: { screen: "MedicationCenter", medicine: medicineName },
    },
    trigger: {
      date: getNextTriggerDate(hour, minute),
      channelId: "medicine",
    },
  });
}

export async function scheduleMissedMedicineAlert(
  medicineName: string,
  delayMinutes = 120
): Promise<string> {
  return Notifications.scheduleNotificationAsync({
    content: {
      title: "⚠️ Missed Medication",
      body: `You haven't taken ${medicineName} yet. Please take it now.`,
      sound: true,
      data: { screen: "MedicationCenter" },
    },
    trigger: { ...intervalTrigger(delayMinutes * 60), channelId: "medicine" },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 💧 HYDRATION
// ─────────────────────────────────────────────────────────────────────────────

export async function scheduleHydrationReminders(): Promise<void> {
  const identifier = "wellness_hydration_periodic";
  try {
    await Notifications.cancelScheduledNotificationAsync(identifier);
    for (const h of [9, 11, 13, 15, 17, 19, 21]) {
      await Notifications.cancelScheduledNotificationAsync(`wellness_hydration_${h}`);
    }
  } catch {}

  const next2Hours = new Date(Date.now() + 2 * 60 * 60 * 1000);
  await Notifications.scheduleNotificationAsync({
    identifier,
    content: {
      title: "💧 Hydration Reminder",
      body: "Drink a glass of water to stay healthy and energised!",
      sound: true,
      data: { screen: "HydrationDashboard", channel: "wellness_default" },
    },
    trigger: {
      date: next2Hours,
    } as any,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 🏃 FITNESS
// ─────────────────────────────────────────────────────────────────────────────

export async function scheduleInactivityAlert(afterMinutes = 60): Promise<string> {
  // Cancel existing inactivity alerts first
  const all = await Notifications.getAllScheduledNotificationsAsync();
  for (const n of all) {
    if ((n.content.data as any)?.type === "inactivity") {
      await Notifications.cancelScheduledNotificationAsync(n.identifier);
    }
  }
  return Notifications.scheduleNotificationAsync({
    content: {
      title: "🚶 Time to Move!",
      body: `You've been inactive for ${afterMinutes} min. Take a short walk!`,
      sound: true,
      data: { screen: "DailyStepsDashboard", type: "inactivity" },
    },
    trigger: { ...intervalTrigger(afterMinutes * 60), channelId: "fitness" },
  });
}

export async function sendStepGoalNotification(
  currentSteps: number,
  goalSteps: number
): Promise<void> {
  const pct = Math.round((currentSteps / goalSteps) * 100);
  let title = "";
  let body = "";

  if (pct >= 100) {
    title = "🎉 Step Goal Reached!";
    body = `Amazing! You hit ${goalSteps.toLocaleString()} steps today!`;
  } else if (pct >= 80) {
    title = "🔥 Almost There!";
    body = `Only ${goalSteps - currentSteps} steps left to reach your goal!`;
  } else if (pct >= 50) {
    title = "👟 Halfway to Your Goal!";
    body = `${currentSteps.toLocaleString()} / ${goalSteps.toLocaleString()} steps. Keep it up!`;
  } else {
    return;
  }

  await Notifications.scheduleNotificationAsync({
    content: { title, body, sound: true, data: { screen: "DailyStepsDashboard" } },
    trigger: { ...intervalTrigger(2), channelId: "fitness" }, // fire after 2s delay
  });
}

export async function scheduleWorkoutReminder(
  workoutType: string,
  hour: number,
  minute: number
): Promise<string> {
  const icons: Record<string, string> = {
    Yoga: "🧘", Gym: "💪", Meditation: "🧠", Walk: "🚶", Run: "🏃",
  };
  const screenMap: Record<string, string> = {
    Yoga: "YogaDashboard", Gym: "GymDashboard", Meditation: "MeditationDashboard",
  };
  return Notifications.scheduleNotificationAsync({
    content: {
      title: `${icons[workoutType] ?? "🏋️"} Workout Reminder`,
      body: `Your ${workoutType} session starts in 10 minutes. Get ready!`,
      sound: true,
      data: { screen: screenMap[workoutType] ?? "FitnessDashboard" },
    },
    trigger: {
      date: getNextTriggerDate(hour, minute),
      channelId: "fitness",
    },
  });
}

// ── Deduplication Tracker ───────────────────────────────────────────────────
const recentNotificationKeys = new Map<string, number>();
const deliveredNotificationKeys = new Set<string>();

export function shouldDeliverNotification(key: string, cooldownMs = 25000): boolean {
  const now = Date.now();
  const lastTime = recentNotificationKeys.get(key);
  if (lastTime && now - lastTime < cooldownMs) {
    console.log(`[Notification Deduplication] Dropped duplicate notification: ${key}`);
    return false;
  }
  recentNotificationKeys.set(key, now);
  return true;
}

export async function hasDeliveredOnce(key: string): Promise<boolean> {
  if (deliveredNotificationKeys.has(key)) return true;
  try {
    const val = await AsyncStorage.getItem(`@notif_delivered_${key}`);
    if (val) {
      deliveredNotificationKeys.add(key);
      return true;
    }
  } catch {
    // Ignore AsyncStorage read errors
  }
  return false;
}

export async function markAsDelivered(key: string): Promise<void> {
  deliveredNotificationKeys.add(key);
  try {
    await AsyncStorage.setItem(`@notif_delivered_${key}`, "1");
  } catch {
    // Ignore AsyncStorage write errors
  }
}

export interface InAppNotice {
  id: string;
  tag: string;
  title: string;
  date: string;
  body: string;
  isRead?: boolean;
}

const IN_APP_NOTICES_KEY = "@urban_in_app_notices_v3";

export async function getInAppNotices(): Promise<InAppNotice[]> {
  try {
    const data = await AsyncStorage.getItem(IN_APP_NOTICES_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Strip out any legacy mock items
        const real = parsed.filter(
          (n: InAppNotice) =>
            !n.id?.startsWith("notif-") &&
            !n.title?.includes("Samsung Health") &&
            !n.title?.includes("Galaxy Watch") &&
            !n.title?.includes("Together feature")
        );
        if (real.length !== parsed.length) {
          await AsyncStorage.setItem(IN_APP_NOTICES_KEY, JSON.stringify(real));
        }
        if (real.length > 0) return real;
      }
    }

    // Default Seed Reminders for repeat appliance maintenance
    const defaultReminders: InAppNotice[] = [
      {
        id: "appliance-chimney-init",
        tag: "[Appliance Reminder]",
        title: "🔔 Kitchen Chimney Cleaning Due!",
        date: "Recommended: Every 60 Days",
        body: "Heavy oil, soot and grease build up in filters every 60 days. Schedule suction degreasing now to keep your kitchen fresh & safe.",
        isRead: false,
      },
      {
        id: "appliance-fridge-init",
        tag: "[Appliance Reminder]",
        title: "❄️ Refrigerator Deep Clean & Coil Sanitation Due!",
        date: "Recommended: Every 90 Days",
        body: "90 days since your fridge check. Regular coil cleaning cuts power bills by 20% and prevents food odor & bacteria.",
        isRead: false,
      },
      {
        id: "appliance-ac-init",
        tag: "[Appliance Reminder]",
        title: "💨 AC Jet Foam Wash Due!",
        date: "Recommended: Every 90 Days",
        body: "Keep cooling efficiency at 100% and eliminate indoor allergens. Scheduled every 90 days for peak compressor life.",
        isRead: false,
      },
    ];
    await AsyncStorage.setItem(IN_APP_NOTICES_KEY, JSON.stringify(defaultReminders));
    return defaultReminders;
  } catch (e) {
    console.warn("Error reading in-app notices", e);
  }
  return [];
}

export async function addInAppNotice(notice: Omit<InAppNotice, "id">): Promise<void> {
  try {
    const list = await getInAppNotices();
    // Drop rapid duplicates within same 10 seconds
    if (list.length > 0 && list[0].title === notice.title && list[0].body === notice.body) {
      return;
    }
    const newNotice: InAppNotice = {
      ...notice,
      id: `notice-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      isRead: notice.isRead ?? false,
    };
    const updated = [newNotice, ...list].slice(0, 60);
    await AsyncStorage.setItem(IN_APP_NOTICES_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn("Error saving notice", e);
  }
}

export async function markNoticeAsRead(id: string): Promise<void> {
  try {
    const list = await getInAppNotices();
    const updated = list.map((item) =>
      item.id === id ? { ...item, isRead: true } : item
    );
    await AsyncStorage.setItem(IN_APP_NOTICES_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn("Error marking notice as read", e);
  }
}

export async function markAllNoticesAsRead(): Promise<void> {
  try {
    const list = await getInAppNotices();
    const updated = list.map((item) => ({ ...item, isRead: true }));
    await AsyncStorage.setItem(IN_APP_NOTICES_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn("Error marking all notices as read", e);
  }
}

export async function clearAllNotices(): Promise<void> {
  try {
    await AsyncStorage.removeItem(IN_APP_NOTICES_KEY);
  } catch (e) {
    console.warn("Error clearing notices", e);
  }
}

export async function sendVendorArrivedOTPNotification(otp: string, bookingId = "default"): Promise<string | null> {
  const dedupKey = `vendor-arrived-${bookingId}-${otp}`;
  if (!shouldDeliverNotification(dedupKey)) {
    return null;
  }

  // Add to in-app notices
  await addInAppNotice({
    tag: "[Important Notice]",
    title: `Your Helper Has Arrived! OTP: ${otp}`,
    date: "Just now",
    body: `Please share this secure 4-digit OTP with your service technician: ${otp}`,
  });

  return Notifications.scheduleNotificationAsync({
    content: {
      title: "📍 Your Vendor Has Arrived!",
      body: `Please share this secure OTP with your vendor: ${otp}`,
      sound: true,
      data: { screen: "LiveTracking" },
    },
    trigger: null, // trigger immediately
  });
}

export async function scheduleWeeklySummary(): Promise<void> {
  const identifier = "wellness_weekly_summary";
  try {
    await Notifications.cancelScheduledNotificationAsync(identifier);
  } catch {}
  await Notifications.scheduleNotificationAsync({
    identifier,
    content: {
      title: "📊 Weekly Fitness Summary",
      body: "Check your weekly health & fitness highlights inside the app.",
      sound: true,
      data: { screen: "FitnessDashboard", channel: "wellness_default" },
    },
    trigger: { ...weeklyTrigger(1, 8, 0), channelId: "fitness" }, // Sunday 8 AM
  });
}

export async function scheduleSleepReminder(hour = 22, minute = 30): Promise<void> {
  const identifier = "wellness_sleep_reminder";
  try {
    await Notifications.cancelScheduledNotificationAsync(identifier);
  } catch {}
  await Notifications.scheduleNotificationAsync({
    identifier,
    content: {
      title: "😴 Sleep Reminder",
      body: "Bedtime in 30 minutes. Wind down for a great night's sleep.",
      sound: true,
      data: { screen: "SleepDashboard", channel: "wellness_default" },
    },
    trigger: {
      date: getNextTriggerDate(hour, minute),
      channelId: "fitness",
    },
  });
}

export async function scheduleMorningHealthReminder(): Promise<void> {
  const identifier = "wellness_morning_health";
  try {
    await Notifications.cancelScheduledNotificationAsync(identifier);
  } catch {}
  await Notifications.scheduleNotificationAsync({
    identifier,
    content: {
      title: "🌅 Good Morning!",
      body: "Log your weight and check today's health score.",
      sound: true,
      data: { screen: "HealthDashboard", channel: "wellness_default" },
    },
    trigger: {
      date: getNextTriggerDate(7, 0),
      channelId: "fitness",
    },
  });
}

export async function scheduleCalorieReminder(): Promise<void> {
  const identifier = "wellness_calorie_check";
  try {
    await Notifications.cancelScheduledNotificationAsync(identifier);
  } catch {}
  await Notifications.scheduleNotificationAsync({
    identifier,
    content: {
      title: "🔥 Daily Calorie Check",
      body: "How are your calories looking today? Tap to check your progress.",
      sound: true,
      data: { screen: "CaloriesDashboard", channel: "wellness_default" },
    },
    trigger: {
      date: getNextTriggerDate(18, 0),
      channelId: "fitness",
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 🔧 SERVICES
// ─────────────────────────────────────────────────────────────────────────────

export async function sendBookingPlaced(
  serviceName: string,
  arg2: string = "default", // bookingId or subServiceName
  dateLabel?: string,
  timeLabel?: string,
  explicitBookingId?: string
): Promise<void> {
  let resolvedServiceName = serviceName;
  let bookingId = "default";

  if (explicitBookingId) {
    resolvedServiceName = arg2 || serviceName;
    bookingId = explicitBookingId;
  } else if (arg2 && arg2 !== "default") {
    if (arg2.startsWith("AP4") || arg2.startsWith("booking-") || !arg2.includes(" ")) {
      bookingId = arg2;
    } else {
      resolvedServiceName = arg2;
      bookingId = dateLabel || "default";
    }
  }

  const dedupKey = `booking-placed-${bookingId}`;
  if (bookingId && bookingId !== "default") {
    if (await hasDeliveredOnce(dedupKey)) {
      console.log(`[Notification Deduplication] Dropped duplicate booking placed: ${dedupKey}`);
      return;
    }
  } else if (!shouldDeliverNotification(dedupKey)) {
    return;
  }

  const title = "Booking Placed Successfully";
  const body = `Your booking for ${resolvedServiceName} has been placed successfully. We’ll notify you when a service partner accepts your booking.`;

  await addInAppNotice({
    tag: "[Notice]",
    title,
    date: "Just now",
    body,
  });

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
        data: { screen: "MyBookings", bookingId },
      },
      trigger: { ...intervalTrigger(1), channelId: "services" },
    });
  } catch (err) {
    console.warn("[sendBookingPlaced] Error scheduling notification:", err);
  }

  if (bookingId && bookingId !== "default") {
    await markAsDelivered(dedupKey);
  }
}

// ── Broadcast high-priority push notification to all available vendors ──────
export async function notifyVendorsBookingPlaced(
  serviceCategory: string,
  subServiceName: string,
  priceLabel: string,
  address: string,
  bookingId: string
): Promise<void> {
  try {
    const { collection, getDocs } = await import("firebase/firestore");
    const { db } = await import("@/services/firebase");
    const vSnap = await getDocs(collection(db, "vendors"));
    const tokens: string[] = [];

    vSnap.forEach((docSnap) => {
      const data = docSnap.data();
      if (
        data.pushToken &&
        data.isLocked !== true &&
        data.status !== "locked"
      ) {
        tokens.push(data.pushToken);
      }
    });

    if (tokens.length === 0) return;

    const messages = tokens.map((pushToken) => ({
      to: pushToken,
      sound: "default",
      priority: "high",
      channelId: "urgent-orders",
      title: `🚨 NEW BOOKING PLACED! (${priceLabel})`,
      body: `⚡ Urgent: ${subServiceName} (${serviceCategory}) near ${address.slice(0, 30)}. Open app to accept!`,
      data: { screen: "HomeScreen", bookingId },
    }));

    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Accept-encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(messages),
    });
    console.log(`[notifyVendorsBookingPlaced] Sent loud push alert to ${tokens.length} vendors`);
  } catch (err) {
    console.warn("[notifyVendorsBookingPlaced] Push error:", err);
  }
}

export async function sendBookingConfirmation(
  serviceName: string,
  vendorName: string,
  scheduledDate: string,
  scheduledTime?: string,
  otp: string = "",
  bookingId: string = "default"
): Promise<void> {
  const dedupKey = `booking-confirm-${bookingId}`;
  if (bookingId && bookingId !== "default") {
    if (await hasDeliveredOnce(dedupKey)) {
      console.log(`[Notification Deduplication] Dropped duplicate booking confirmation: ${dedupKey}`);
      return;
    }
  } else if (!shouldDeliverNotification(dedupKey)) {
    return;
  }

  let cleanDate = (scheduledDate || "").trim();
  let cleanTime = (scheduledTime || "").trim();
  if (cleanDate.includes(" at ")) {
    const parts = cleanDate.split(" at ");
    cleanDate = parts[0].trim();
    if (!cleanTime) cleanTime = parts[1].trim();
  }

  const timePart = cleanTime ? ` at ${cleanTime}` : "";
  const title = "Booking Confirmed!";
  const baseMessage = `Your ${serviceName} booking has been accepted by ${vendorName || "Service Partner"} for ${cleanDate || "the scheduled date"}${timePart}.`;
  const otpPart = otp ? ` Your OTP for the service is ${otp}.` : "";
  const body = `${baseMessage}${otpPart}`;

  await addInAppNotice({
    tag: "[Notice]",
    title,
    date: "Just now",
    body,
  });

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
        data: { screen: "MyBookings", bookingId },
      },
      trigger: { ...intervalTrigger(1), channelId: "services" },
    });
  } catch (err) {
    console.warn("[sendBookingConfirmation] Error scheduling notification:", err);
  }

  if (bookingId && bookingId !== "default") {
    await markAsDelivered(dedupKey);
  }
}

export async function scheduleBookingReminder(
  serviceName: string,
  secondsUntilBooking: number
): Promise<string> {
  const reminderSeconds = secondsUntilBooking - 86400;
  if (reminderSeconds <= 0) return "";
  return Notifications.scheduleNotificationAsync({
    content: {
      title: "🗓️ Booking Tomorrow",
      body: `Reminder: ${serviceName} is scheduled for tomorrow. Be ready!`,
      sound: true,
      data: { screen: "MyBookings" },
    },
    trigger: { ...intervalTrigger(reminderSeconds), channelId: "services" },
  });
}

export async function sendVendorOnTheWayNotification(
  vendorName: string,
  serviceName: string,
  bookingId: string = "default"
): Promise<void> {
  const dedupKey = `vendor-otw-${bookingId}-${vendorName}`;
  if (!shouldDeliverNotification(dedupKey)) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "🔧 Helper On the Way",
      body: `${vendorName} is heading to you for ${serviceName}.`,
      sound: true,
      data: { screen: "LiveTracking" },
    },
    trigger: { ...intervalTrigger(1), channelId: "services" },
  });
}

export async function sendVendorArrivedNotification(vendorName: string, bookingId: string = "default"): Promise<void> {
  const dedupKey = `vendor-arrived-alert-${bookingId}-${vendorName}`;
  if (!shouldDeliverNotification(dedupKey)) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "📍 Helper Has Arrived",
      body: `${vendorName} is at your location. Please let them in.`,
      sound: true,
      data: { screen: "ServicesDashboard" },
    },
    trigger: { ...intervalTrigger(1), channelId: "services" },
  });
}

export async function sendServiceCompletedNotification(serviceName: string, bookingId: string = "default"): Promise<void> {
  const dedupKey = `service-completed-${bookingId}-${serviceName}`;
  if (!shouldDeliverNotification(dedupKey)) return;

  await addInAppNotice({
    tag: "[Notice]",
    title: `Service Completed: ${serviceName}`,
    date: "Just now",
    body: `Your service session for ${serviceName} is completed. Please rate your professional!`,
  });

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "⭐ Rate Your Service",
      body: `${serviceName} is complete! Share your experience.`,
      sound: true,
      data: { screen: "RatingFeedback" },
    },
    trigger: { ...intervalTrigger(1), channelId: "services" },
  });
}

export async function sendPaymentSuccessNotification(
  amount: string,
  serviceName: string
): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "💳 Payment Successful",
      body: `₹${amount} paid for ${serviceName}. Thank you!`,
      sound: true,
      data: { screen: "MyBookings" },
    },
    trigger: { ...intervalTrigger(2), channelId: "services" },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 🧼 APPLIANCE REPEAT CLEANING & MAINTENANCE REMINDERS
// ─────────────────────────────────────────────────────────────────────────────

export interface ApplianceReminderConfig {
  id: string;
  name: string;
  intervalDays: number;
  icon: string;
  title: string;
  body: string;
  category: string;
  recommendedSubService: string;
}

export const APPLIANCE_REPEAT_INTERVALS: ApplianceReminderConfig[] = [
  {
    id: "chimney",
    name: "Kitchen Chimney",
    intervalDays: 60,
    icon: "flame-outline",
    title: "🔔 Kitchen Chimney Cleaning Due!",
    body: "Heavy oil, soot and grease build up in filters every 60 days. Schedule suction degreasing now to keep your kitchen fresh & safe.",
    category: "Appliances",
    recommendedSubService: "Chimney Deep Clean",
  },
  {
    id: "refrigerator",
    name: "Refrigerator",
    intervalDays: 90,
    icon: "snow-outline",
    title: "❄️ Refrigerator Deep Clean & Coil Sanitation Due!",
    body: "90 days since your fridge check. Regular coil cleaning cuts power bills by 20% and prevents food odor & bacteria.",
    category: "Appliances",
    recommendedSubService: "Refrigerator Sanitization",
  },
  {
    id: "ac",
    name: "Air Conditioner (AC)",
    intervalDays: 90,
    icon: "thermometer-outline",
    title: "💨 AC Jet Foam Wash Due!",
    body: "Keep cooling efficiency at 100% and eliminate indoor allergens. Scheduled every 90 days for peak compressor life.",
    category: "Appliances",
    recommendedSubService: "AC Jet Wash & Service",
  },
  {
    id: "water_purifier",
    name: "Water Purifier (RO)",
    intervalDays: 90,
    icon: "water-outline",
    title: "💧 RO & Water Purifier Filter Check Due!",
    body: "Safe drinking water requires sediment filter and membrane check every 90 days. Keep your family protected.",
    category: "Appliances",
    recommendedSubService: "RO Water Purifier Service",
  },
  {
    id: "washing_machine",
    name: "Washing Machine",
    intervalDays: 60,
    icon: "sync-outline",
    title: "🫧 Washing Machine Tub Descaling Due!",
    body: "Limescale & detergent sludge build up in 60 days. Deep drum descaling prevents clothes odor and pump damage.",
    category: "Appliances",
    recommendedSubService: "Washing Machine Descaling",
  },
];

export async function scheduleApplianceRepeatReminder(
  applianceId: string,
  serviceName?: string,
  customDays?: number
): Promise<string> {
  const config = APPLIANCE_REPEAT_INTERVALS.find(
    (a) => a.id === applianceId || (serviceName && serviceName.toLowerCase().includes(a.id))
  );
  if (!config) return "";

  const days = customDays || config.intervalDays;
  const seconds = days * 86400; // in seconds
  const identifier = `appliance_repeat_${config.id}`;

  try {
    await Notifications.cancelScheduledNotificationAsync(identifier);
  } catch {}

  // 1. In-App Notice for immediate visibility & record
  await addInAppNotice({
    tag: "[Appliance Reminder]",
    title: config.title,
    date: `Repeat in ${days} days`,
    body: config.body,
  });

  // 2. Schedule push notification
  return Notifications.scheduleNotificationAsync({
    identifier,
    content: {
      title: config.title,
      body: config.body,
      sound: true,
      data: {
        screen: "ServicesDashboard",
        category: config.category,
        subService: config.recommendedSubService,
        applianceId: config.id,
      },
    },
    trigger: { ...intervalTrigger(seconds), channelId: "services" },
  });
}

export async function scheduleAllApplianceReminders(): Promise<void> {
  for (const config of APPLIANCE_REPEAT_INTERVALS) {
    const identifier = `appliance_repeat_${config.id}`;
    const seconds = config.intervalDays * 86400;
    try {
      await Notifications.cancelScheduledNotificationAsync(identifier);
    } catch {}

    await Notifications.scheduleNotificationAsync({
      identifier,
      content: {
        title: config.title,
        body: config.body,
        sound: true,
        data: {
          screen: "ServicesDashboard",
          category: config.category,
          subService: config.recommendedSubService,
          applianceId: config.id,
        },
      },
      trigger: { ...intervalTrigger(seconds), channelId: "services" },
    });
  }
}

export async function triggerImmediateApplianceReminder(applianceId: string): Promise<void> {
  const config =
    APPLIANCE_REPEAT_INTERVALS.find((a) => a.id === applianceId) || APPLIANCE_REPEAT_INTERVALS[0];
  await addInAppNotice({
    tag: "[Appliance Reminder]",
    title: config.title,
    date: "Just now",
    body: config.body,
  });
  await Notifications.scheduleNotificationAsync({
    content: {
      title: config.title,
      body: config.body,
      sound: true,
      data: {
        screen: "ServicesDashboard",
        category: config.category,
        subService: config.recommendedSubService,
        applianceId: config.id,
      },
    },
    trigger: { ...intervalTrigger(1), channelId: "services" },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 🛍️ SHOP ORDERS NOTIFICATIONS
// ─────────────────────────────────────────────────────────────────────────────

export async function sendOrderPlacedNotification(
  orderNumber: string,
  totalAmount: number,
  itemCount: number
): Promise<void> {
  const dedupKey = `order-placed-${orderNumber}`;
  if (!shouldDeliverNotification(dedupKey)) return;

  await addInAppNotice({
    tag: "[Order]",
    title: `Order Placed: ${orderNumber}`,
    date: "Just now",
    body: `Your order of ${itemCount} item(s) for ₹${totalAmount.toLocaleString("en-IN")} is placed. Delivery in 2-3 business days.`,
  });

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "🛍️ Order Placed Successfully!",
      body: `Order #${orderNumber} for ₹${totalAmount.toLocaleString("en-IN")} is confirmed and being packed.`,
      sound: true,
      data: { screen: "OrderHistory" },
    },
    trigger: { ...intervalTrigger(1), channelId: "services" },
  });
}

export async function sendOrderStatusUpdateNotification(
  orderNumber: string,
  status: string
): Promise<void> {
  const dedupKey = `order-status-${orderNumber}-${status}`;
  if (!shouldDeliverNotification(dedupKey)) return;

  const statusEmojis: Record<string, string> = {
    shipped: "📦 Your order has been shipped!",
    delivered: "🎉 Order Delivered!",
    cancelled: "❌ Order Cancelled",
    processing: "⚙️ Your order is being packed",
  };

  const title = statusEmojis[status.toLowerCase()] || `Order Update: #${orderNumber}`;

  await addInAppNotice({
    tag: "[Order]",
    title,
    date: "Just now",
    body: `Your Urban Helpers order #${orderNumber} is now ${status.toUpperCase()}.`,
  });

  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body: `Status for order #${orderNumber} is now: ${status.toUpperCase()}`,
      sound: true,
      data: { screen: "OrderHistory" },
    },
    trigger: { ...intervalTrigger(1), channelId: "services" },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 🆘 EMERGENCY
// ─────────────────────────────────────────────────────────────────────────────

export async function sendSOSConfirmation(): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "🚨 SOS Alert Sent",
      body: "Your emergency contacts and Urban Helpers support have been notified.",
      sound: true,
      data: { screen: "EmergencyAssistance" },
    },
    trigger: { ...intervalTrigger(1), channelId: "emergency" },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 🌟 ENGAGEMENT
// ─────────────────────────────────────────────────────────────────────────────

export async function sendStreakNotification(streakDays: number): Promise<void> {
  const milestones: Record<number, string> = {
    3: "🔥 3-Day Streak! You're building a habit!",
    7: "🔥 7-Day Streak! A full week of health wins!",
    14: "💪 2-Week Streak! You're unstoppable!",
    30: "🏆 30-Day Streak! Health champion!",
  };
  const body = milestones[streakDays];
  if (!body) return;
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "🎉 Streak Achievement!",
      body,
      sound: true,
      data: { screen: "FitnessDashboard" },
    },
    trigger: { ...intervalTrigger(2), channelId: "fitness" },
  });
}

export async function sendHealthScoreNotification(score: number): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "📈 Health Score Improved!",
      body: `Your health score is now ${score}%. Keep up the great work!`,
      sound: true,
      data: { screen: "HealthDashboard" },
    },
    trigger: { ...intervalTrigger(2), channelId: "fitness" },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 🔧 SETUP — call once after permission granted
// ─────────────────────────────────────────────────────────────────────────────

export async function setupDefaultNotifications(): Promise<void> {
  try {
    const today = new Date().toISOString().split("T")[0]; // e.g. "2026-09-18"
    const lastSetupDate = await AsyncStorage.getItem(NOTIF_SETUP_KEY);
    if (lastSetupDate === today) {
      console.log("[Notifications] Setup already run today — skipping.");
      return;
    }

    // Cancel all stale alarms to prevent past alarm floods
    await Notifications.cancelAllScheduledNotificationsAsync();

    // Schedule exact, deduplicated single instances with strict future triggers
    await scheduleMorningHealthReminder();   // 7:00 AM
    await scheduleHydrationReminders();      // +2 hrs
    await scheduleCalorieReminder();         // 6:00 PM
    await scheduleSleepReminder(22, 30);     // 10:30 PM
    await scheduleAllApplianceReminders();   // Periodic Chimney, Fridge, AC, RO cleaning

    await AsyncStorage.setItem(NOTIF_SETUP_KEY, today);
    console.log("[Notifications] Wellness and appliance reminders configured.");
  } catch (e) {
    console.log("[Notifications] Setup error:", e);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Navigation tap helper
// ─────────────────────────────────────────────────────────────────────────────

export type NotificationScreen =
  | "HomeDashboard" | "HealthDashboard" | "FitnessDashboard"
  | "MedicationCenter" | "HydrationDashboard" | "DailyStepsDashboard"
  | "CaloriesDashboard" | "SleepDashboard" | "YogaDashboard"
  | "GymDashboard" | "NutritionDashboard" | "MyBookings"
  | "LiveTracking" | "ServicesDashboard" | "RatingFeedback"
  | "EmergencyAssistance" | "Notifications";

export function isValidScreen(screen: unknown): screen is NotificationScreen {
  return [
    "HomeDashboard","HealthDashboard","FitnessDashboard",
    "MedicationCenter","HydrationDashboard","DailyStepsDashboard",
    "CaloriesDashboard","SleepDashboard","YogaDashboard",
    "GymDashboard","NutritionDashboard","MyBookings",
    "LiveTracking","ServicesDashboard","RatingFeedback",
    "EmergencyAssistance","Notifications",
  ].includes(screen as string);
}
