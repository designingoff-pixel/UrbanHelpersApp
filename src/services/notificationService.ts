// ─────────────────────────────────────────────────────────────────────────────
// Urban Helpers — Notification Service
// expo-notifications v0.27.x  (Expo SDK 50)
// Trigger API: { hour, minute, repeats } for daily  |  { seconds, repeats } for interval
// ─────────────────────────────────────────────────────────────────────────────

import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";

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

// ─────────────────────────────────────────────────────────────────────────────
// 💊 MEDICINE
// ─────────────────────────────────────────────────────────────────────────────

export async function scheduleMedicineReminder(
  medicineName: string,
  dosage: string,
  hour: number,
  minute: number
): Promise<string> {
  return Notifications.scheduleNotificationAsync({
    content: {
      title: "💊 Medicine Reminder",
      body: `Time to take ${medicineName} — ${dosage}`,
      sound: true,
      data: { screen: "MedicationCenter", medicine: medicineName },
    },
    trigger: { ...dailyTrigger(hour, minute), channelId: "medicine" },
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
  const hours = [9, 11, 13, 15, 17, 19, 21];
  for (const hour of hours) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "💧 Hydration Reminder",
        body: "Drink a glass of water to stay healthy and energised!",
        sound: true,
        data: { screen: "HydrationDashboard" },
      },
      trigger: { ...dailyTrigger(hour, 0), channelId: "fitness" },
    });
  }
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
    trigger: { ...dailyTrigger(hour, minute), channelId: "fitness" },
  });
}

export async function sendVendorArrivedOTPNotification(otp: string): Promise<string> {
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
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "📊 Weekly Fitness Summary",
      body: "Check your weekly health & fitness highlights inside the app.",
      sound: true,
      data: { screen: "FitnessDashboard" },
    },
    trigger: { ...weeklyTrigger(1, 8, 0), channelId: "fitness" }, // Sunday 8 AM
  });
}

export async function scheduleSleepReminder(hour = 22, minute = 30): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "😴 Sleep Reminder",
      body: "Bedtime in 30 minutes. Wind down for a great night's sleep.",
      sound: true,
      data: { screen: "SleepDashboard" },
    },
    trigger: { ...dailyTrigger(hour, minute), channelId: "fitness" },
  });
}

export async function scheduleMorningHealthReminder(): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "🌅 Good Morning!",
      body: "Log your weight and check today's health score.",
      sound: true,
      data: { screen: "HealthDashboard" },
    },
    trigger: { ...dailyTrigger(7, 0), channelId: "fitness" },
  });
}

export async function scheduleCalorieReminder(): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "🔥 Daily Calorie Check",
      body: "How are your calories looking today? Tap to check your progress.",
      sound: true,
      data: { screen: "CaloriesDashboard" },
    },
    trigger: { ...dailyTrigger(18, 0), channelId: "fitness" },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 🔧 SERVICES
// ─────────────────────────────────────────────────────────────────────────────

export async function sendBookingConfirmation(
  serviceName: string,
  subServiceName: string,
  dateLabel: string,
  timeLabel: string,
  otp: string // ← added OTP
): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "✅ Booking Confirmed!",
      body: `${subServiceName} (${serviceName}) on ${dateLabel} at ${timeLabel}. Your OTP for the vendor is: ${otp}`,
      sound: true,
      data: { screen: "MyBookings" },
    },
    trigger: { ...intervalTrigger(3), channelId: "services" }, // fires 3s after confirm
  });
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
  serviceName: string
): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "🔧 Helper On the Way",
      body: `${vendorName} is heading to you for ${serviceName}.`,
      sound: true,
      data: { screen: "LiveTracking" },
    },
    trigger: { ...intervalTrigger(2), channelId: "services" },
  });
}

export async function sendVendorArrivedNotification(vendorName: string): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "📍 Helper Has Arrived",
      body: `${vendorName} is at your location. Please let them in.`,
      sound: true,
      data: { screen: "ServicesDashboard" },
    },
    trigger: { ...intervalTrigger(2), channelId: "services" },
  });
}

export async function sendServiceCompletedNotification(serviceName: string): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "⭐ Rate Your Service",
      body: `${serviceName} is complete! Share your experience.`,
      sound: true,
      data: { screen: "RatingFeedback" },
    },
    trigger: { ...intervalTrigger(2), channelId: "services" },
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
    await Notifications.cancelAllScheduledNotificationsAsync();
    await scheduleMorningHealthReminder();   // 7:00 AM
    await scheduleHydrationReminders();      // every 2 hrs 9am–9pm
    await scheduleCalorieReminder();         // 6:00 PM
    await scheduleSleepReminder(22, 30);     // 10:30 PM
    await scheduleWeeklySummary();           // Sunday 8 AM
    console.log("[Notifications] Default notifications set up.");
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
