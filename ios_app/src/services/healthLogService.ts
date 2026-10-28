import AsyncStorage from "@react-native-async-storage/async-storage";
import { cancelNotificationById } from "@/services/notificationService";
import { auth, db } from "./firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

// ═════════════════════════════════════════════════════════════
// MULTI-USER ISOLATION & FIRESTORE CLOUD PERSISTENCE
// ═════════════════════════════════════════════════════════════

export function getCurrentUid(): string {
  try {
    return auth?.currentUser?.uid || "guest";
  } catch {
    return "guest";
  }
}

export function getUserScopedKey(baseKey: string, explicitUid?: string): string {
  const uid = explicitUid || getCurrentUid();
  return `${baseKey}_${uid}`;
}

export async function syncHealthLogToCloud(
  logType: string,
  payload: Record<string, any>,
  explicitUid?: string
): Promise<void> {
  try {
    const uid = explicitUid || getCurrentUid();
    if (!uid || uid === "guest" || !db) return;
    await addDoc(collection(db, "health_logs"), {
      userId: uid,
      uid,
      logType,
      type: logType,
      ...payload,
      createdAt: serverTimestamp(),
      timestamp: serverTimestamp(),
    });
  } catch (err) {
    // Non-blocking background sync warning
    console.warn("[HealthSync] Background upload skipped/offline:", err);
  }
}

// ═════════════════════════════════════════════════════════════
// SLEEP LOGGING
// ═════════════════════════════════════════════════════════════

const SLEEP_KEY = "@urban_health_sleep_v1";
const SLEEP_ALARM_KEY = "@urban_health_sleep_alarm_v1";

export interface SleepStages {
  awakeMins: number;   // minutes spent awake
  remMins: number;     // REM sleep
  lightMins: number;   // light sleep
  deepMins: number;    // deep sleep
}

export interface SleepEntry {
  id: string;
  date: string;          // YYYY-MM-DD (the date the person woke up / "night of")
  bedtime: string;       // e.g. "11:08 PM"
  wakeTime: string;      // e.g. "06:50 AM"
  durationMins: number;  // total sleep in minutes
  score: number;         // 0–100
  stages?: SleepStages;
  timestamp: number;
}

export interface SleepAlarmConfig {
  enabled: boolean;
  hour: number;          // wake-up 0–23
  minute: number;        // wake-up 0–59
  bedtimeHour: number;   // bedtime 0–23 (default 23 = 11 PM)
  bedtimeMinute: number; // bedtime 0–59
  notificationId?: string;
  targetSet?: boolean;   // true if the user explicitly set their sleep target
}

/** Format minutes as "Xh Ym" */
export function formatSleepDuration(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/** Format 24h hour+minute to "HH:MM AM/PM" */
export function formatAlarmTime(hour: number, minute: number): string {
  const ampm = hour >= 12 ? "PM" : "AM";
  const h = hour % 12 || 12;
  const m = String(minute).padStart(2, "0");
  return `${String(h).padStart(2, "0")}:${m} ${ampm}`;
}

/** Derive a quality label from score */
export function sleepQualityLabel(score: number): string {
  if (score >= 90) return "Excellent";
  if (score >= 75) return "Good";
  if (score >= 60) return "Fair";
  return "Poor";
}

export async function getSleepEntries(uid: string): Promise<SleepEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(`${SLEEP_KEY}_${uid}`);
    if (!raw) return [];
    return JSON.parse(raw) as SleepEntry[];
  } catch (e) {
    console.error("Error loading sleep entries:", e);
    return [];
  }
}

export async function addSleepEntry(
  uid: string,
  entry: Omit<SleepEntry, "id" | "timestamp">
): Promise<SleepEntry> {
  const newEntry: SleepEntry = {
    ...entry,
    id: `sleep_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: Date.now(),
  };
  try {
    const raw = await AsyncStorage.getItem(`${SLEEP_KEY}_${uid}`);
    const all: SleepEntry[] = raw ? JSON.parse(raw) : [];
    // Replace same-date entry if one already exists
    const filtered = all.filter((e) => e.date !== newEntry.date);
    filtered.unshift(newEntry);
    await AsyncStorage.setItem(`${SLEEP_KEY}_${uid}`, JSON.stringify(filtered));
    // Background cloud sync to Firestore
    syncHealthLogToCloud("sleep", {
      date: newEntry.date,
      durationMins: newEntry.durationMins,
      sleepDuration: (newEntry.durationMins / 60).toFixed(1),
      score: newEntry.score,
      bedtime: newEntry.bedtime,
      wakeTime: newEntry.wakeTime,
      stages: newEntry.stages || null,
    }, uid);
  } catch (e) {
    console.error("Error saving sleep entry:", e);
  }
  return newEntry;
}

export async function deleteSleepEntry(uid: string, id: string): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(`${SLEEP_KEY}_${uid}`);
    if (!raw) return;
    const all: SleepEntry[] = JSON.parse(raw);
    await AsyncStorage.setItem(
      `${SLEEP_KEY}_${uid}`,
      JSON.stringify(all.filter((e) => e.id !== id))
    );
  } catch (e) {
    console.error("Error deleting sleep entry:", e);
  }
}

export async function getSleepAlarm(uid: string): Promise<SleepAlarmConfig> {
  try {
    const raw = await AsyncStorage.getItem(`${SLEEP_ALARM_KEY}_${uid}`);
    if (!raw) return { enabled: false, hour: 7, minute: 0, bedtimeHour: 23, bedtimeMinute: 0 };
    const parsed = JSON.parse(raw) as SleepAlarmConfig;
    // Migrate older records that lack bedtime fields
    if (parsed.bedtimeHour === undefined) parsed.bedtimeHour = 23;
    if (parsed.bedtimeMinute === undefined) parsed.bedtimeMinute = 0;
    if (parsed.targetSet === undefined) parsed.targetSet = false;
    return parsed;
  } catch (e) {
    console.error("Error loading sleep alarm:", e);
    return { enabled: false, hour: 7, minute: 0, bedtimeHour: 23, bedtimeMinute: 0 };
  }
}

export async function saveSleepAlarm(uid: string, config: SleepAlarmConfig): Promise<void> {
  try {
    await AsyncStorage.setItem(`${SLEEP_ALARM_KEY}_${uid}`, JSON.stringify(config));
  } catch (e) {
    console.error("Error saving sleep alarm:", e);
  }
}

/** Average sleep duration in minutes over a list of entries */
export function avgSleepDuration(entries: SleepEntry[]): number {
  if (entries.length === 0) return 0;
  return Math.round(entries.reduce((s, e) => s + e.durationMins, 0) / entries.length);
}

/** Build stage bar data (16 segments) from a SleepStages object */
export function buildStageBars(stages: SleepStages, totalMins: number): { h: number; c: string }[] {
  if (totalMins === 0) return [];
  const { awakeMins, remMins, lightMins, deepMins } = stages;
  // Distribute each stage across segments proportionally
  const stageList = [
    { mins: awakeMins, c: "#facc15" },
    { mins: remMins,   c: "#c084fc" },
    { mins: lightMins, c: "#a78bfa" },
    { mins: deepMins,  c: "#818cf8" },
  ];
  const bars: { h: number; c: string }[] = [];
  for (const st of stageList) {
    const segs = Math.max(1, Math.round((st.mins / totalMins) * 16 * (st.mins / totalMins + 0.5)));
    const heightPct = Math.round((st.mins / totalMins) * 100);
    for (let i = 0; i < Math.min(segs, 16 - bars.length); i++) {
      bars.push({ h: Math.max(10, heightPct + (Math.random() * 20 - 10)), c: st.c });
    }
  }
  // Pad or trim to exactly 16 bars
  while (bars.length < 16) bars.push({ h: 15, c: "#818cf8" });
  return bars.slice(0, 16);
}



export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export interface MealItem {
  id: string;
  mealType: MealType;
  name: string;
  grams: number;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  date: string; // YYYY-MM-DD
  time: string; // e.g. "08:30 AM"
  timestamp: number;
}

export type PillForm = "tablet" | "capsule" | "liquid" | "injection" | "drops";

export interface MedicationItem {
  id: string;
  name: string;
  dose: string; // e.g. "500mg" or "10g"
  form: PillForm;
  color: string; // hex code like "#ef4444", "#3b82f6", etc.
  scheduleTime: string; // e.g. "08:00 AM"
  takenDates: string[]; // array of YYYY-MM-DD when marked taken
  instructions?: string; // e.g. "After food"
  createdAt: number;
  notificationId?: string; // expo-notifications identifier for the daily reminder
}

export type ActivityType =
  | "walking"
  | "running"
  | "cycling"
  | "swimming"
  | "gym"
  | "yoga"
  | "pilates"
  | "other";

export interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  durationMins: number;
  distanceKm?: number;
  caloriesBurned: number;
  date: string; // YYYY-MM-DD
  time: string;
  timestamp: number;
}

const STORAGE_KEYS = {
  MEALS: "@urban_health_meals_v1",
  MEDICATIONS: "@urban_health_medications_v1",
  ACTIVITIES: "@urban_health_activities_v1",
  CALORIE_GOAL: "@urban_health_calorie_goal_v1",
  HIDDEN_CARDS: "@urban_health_hidden_cards_v1",
  STEP_COUNT: "@urban_health_step_count_v1",
  STEP_BASELINE: "@urban_health_step_baseline_v1",
  STEP_HISTORY: "@urban_health_step_history_v1",
  STEP_GOAL: "@urban_health_step_goal_v1",
  WATER: "@urban_health_water_v1",
  BODY_COMP: "@urban_health_body_comp_v1",
};

export const getTodayKey = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const formatCurrentTime = (): string => {
  const d = new Date();
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${String(hours).padStart(2, "0")}:${minutes} ${ampm}`;
};

// ═════════════════════════════════════════════════════════════
// MEAL LOGGING
// ═════════════════════════════════════════════════════════════

export async function getMeals(date: string = getTodayKey(), explicitUid?: string): Promise<MealItem[]> {
  try {
    const raw = await AsyncStorage.getItem(getUserScopedKey(STORAGE_KEYS.MEALS, explicitUid));
    if (!raw) return [];
    const allMeals: MealItem[] = JSON.parse(raw);
    return allMeals.filter((m) => m.date === date);
  } catch (e) {
    console.error("Error loading meals:", e);
    return [];
  }
}

export async function addMeal(
  meal: Omit<MealItem, "id" | "date" | "time" | "timestamp"> & {
    date?: string;
    time?: string;
  },
  explicitUid?: string
): Promise<MealItem> {
  const date = meal.date || getTodayKey();
  const time = meal.time || formatCurrentTime();
  const newItem: MealItem = {
    ...meal,
    id: `meal_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    date,
    time,
    timestamp: Date.now(),
  };

  try {
    const key = getUserScopedKey(STORAGE_KEYS.MEALS, explicitUid);
    const raw = await AsyncStorage.getItem(key);
    const allMeals: MealItem[] = raw ? JSON.parse(raw) : [];
    allMeals.unshift(newItem);
    await AsyncStorage.setItem(key, JSON.stringify(allMeals));
    // Background cloud sync
    syncHealthLogToCloud("nutrition", {
      mealName: newItem.name,
      mealType: newItem.mealType,
      calories: newItem.calories,
      protein: newItem.protein,
      carbs: newItem.carbs,
      fat: newItem.fat,
      date: newItem.date,
      time: newItem.time,
    }, explicitUid);
  } catch (e) {
    console.error("Error saving meal:", e);
  }
  return newItem;
}

export async function deleteMeal(id: string, explicitUid?: string): Promise<void> {
  try {
    const key = getUserScopedKey(STORAGE_KEYS.MEALS, explicitUid);
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return;
    const allMeals: MealItem[] = JSON.parse(raw);
    const filtered = allMeals.filter((m) => m.id !== id);
    await AsyncStorage.setItem(key, JSON.stringify(filtered));
  } catch (e) {
    console.error("Error deleting meal:", e);
  }
}

export async function getDailyNutritionTotals(date: string = getTodayKey(), explicitUid?: string): Promise<{
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  byCategory: Record<MealType, { count: number; calories: number }>;
}> {
  const meals = await getMeals(date, explicitUid);
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;
  const byCategory: Record<MealType, { count: number; calories: number }> = {
    breakfast: { count: 0, calories: 0 },
    lunch: { count: 0, calories: 0 },
    dinner: { count: 0, calories: 0 },
    snack: { count: 0, calories: 0 },
  };

  for (const m of meals) {
    totalCalories += m.calories || 0;
    totalProtein += m.protein || 0;
    totalCarbs += m.carbs || 0;
    totalFat += m.fat || 0;
    if (byCategory[m.mealType]) {
      byCategory[m.mealType].count += 1;
      byCategory[m.mealType].calories += m.calories || 0;
    }
  }

  return { totalCalories, totalProtein, totalCarbs, totalFat, byCategory };
}

// ═════════════════════════════════════════════════════════════
// MEDICATION LOGGING
// ═════════════════════════════════════════════════════════════

export const PILL_COLORS = [
  { name: "White", hex: "#f8fafc" },
  { name: "Coral Red", hex: "#ef4444" },
  { name: "Amber Yellow", hex: "#f59e0b" },
  { name: "Emerald Green", hex: "#10b981" },
  { name: "Sky Blue", hex: "#0ea5e9" },
  { name: "Royal Purple", hex: "#8b5cf6" },
  { name: "Rose Pink", hex: "#ec4899" },
  { name: "Tangerine", hex: "#f97316" },
];

export async function getMedications(explicitUid?: string): Promise<MedicationItem[]> {
  try {
    const raw = await AsyncStorage.getItem(getUserScopedKey(STORAGE_KEYS.MEDICATIONS, explicitUid));
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error("Error loading medications:", e);
    return [];
  }
}

export async function addMedication(
  med: Omit<MedicationItem, "id" | "takenDates" | "createdAt">,
  explicitUid?: string
): Promise<MedicationItem> {
  const newItem: MedicationItem = {
    ...med,
    id: `med_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    takenDates: [],
    createdAt: Date.now(),
  };

  try {
    const key = getUserScopedKey(STORAGE_KEYS.MEDICATIONS, explicitUid);
    const raw = await AsyncStorage.getItem(key);
    const allMeds: MedicationItem[] = raw ? JSON.parse(raw) : [];
    allMeds.push(newItem);
    await AsyncStorage.setItem(key, JSON.stringify(allMeds));
    syncHealthLogToCloud("medication", {
      name: newItem.name,
      dose: newItem.dose,
      form: newItem.form,
      color: newItem.color,
      scheduleTime: newItem.scheduleTime,
      instructions: newItem.instructions,
    }, explicitUid);
  } catch (e) {
    console.error("Error adding medication:", e);
  }
  return newItem;
}

export async function toggleMedicationTaken(
  id: string,
  date: string = getTodayKey(),
  explicitUid?: string
): Promise<boolean> {
  try {
    const key = getUserScopedKey(STORAGE_KEYS.MEDICATIONS, explicitUid);
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return false;
    const allMeds: MedicationItem[] = JSON.parse(raw);
    const index = allMeds.findIndex((m) => m.id === id);
    if (index === -1) return false;

    const med = allMeds[index];
    const hasTaken = med.takenDates && med.takenDates.includes(date);
    if (!med.takenDates) med.takenDates = [];

    if (hasTaken) {
      med.takenDates = med.takenDates.filter((d) => d !== date);
    } else {
      med.takenDates.push(date);
    }

    await AsyncStorage.setItem(key, JSON.stringify(allMeds));
    return !hasTaken;
  } catch (e) {
    console.error("Error toggling medication taken:", e);
    return false;
  }
}

export async function deleteMedication(id: string, explicitUid?: string): Promise<void> {
  try {
    const key = getUserScopedKey(STORAGE_KEYS.MEDICATIONS, explicitUid);
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return;
    const allMeds: MedicationItem[] = JSON.parse(raw);
    // Cancel the scheduled notification before removing the record
    const target = allMeds.find((m) => m.id === id);
    if (target?.notificationId) {
      try {
        await cancelNotificationById(target.notificationId);
      } catch (ne) {
        console.warn("Could not cancel medication notification:", ne);
      }
    }
    const filtered = allMeds.filter((m) => m.id !== id);
    await AsyncStorage.setItem(key, JSON.stringify(filtered));
  } catch (e) {
    console.error("Error deleting medication:", e);
  }
}

/**
 * Parse a time string like "08:00 AM" / "11:30 PM" into { hour, minute }.
 * Returns null if the string is not recognisable.
 */
export function parseScheduleTime(time: string): { hour: number; minute: number } | null {
  // Expected format: "HH:MM AM" or "HH:MM PM" (case-insensitive)
  const match = time.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return null;
  let hour = parseInt(match[1], 10);
  const minute = parseInt(match[2], 10);
  const period = match[3].toUpperCase();
  if (hour < 1 || hour > 12 || minute < 0 || minute > 59) return null;
  // Convert to 24-hour
  if (period === "AM") {
    hour = hour === 12 ? 0 : hour;        // 12:xx AM → 0:xx
  } else {
    hour = hour === 12 ? 12 : hour + 12;  // 12:xx PM → 12:xx, 1–11 PM → 13–23
  }
  return { hour, minute };
}

/**
 * Persist the notification ID on an existing medication record after scheduling.
 */
export async function updateMedicationNotificationId(
  id: string,
  notificationId: string,
  explicitUid?: string
): Promise<void> {
  try {
    const key = getUserScopedKey(STORAGE_KEYS.MEDICATIONS, explicitUid);
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return;
    const allMeds: MedicationItem[] = JSON.parse(raw);
    const index = allMeds.findIndex((m) => m.id === id);
    if (index === -1) return;
    allMeds[index] = { ...allMeds[index], notificationId };
    await AsyncStorage.setItem(key, JSON.stringify(allMeds));
  } catch (e) {
    console.error("Error updating medication notificationId:", e);
  }
}
// ═════════════════════════════════════════════════════════════
// ACTIVITIES / WORKOUT LOGGING
// ═════════════════════════════════════════════════════════════

export async function getActivities(date: string = getTodayKey(), explicitUid?: string): Promise<ActivityItem[]> {
  try {
    const key = getUserScopedKey(STORAGE_KEYS.ACTIVITIES, explicitUid);
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return [];
    const all: ActivityItem[] = JSON.parse(raw);
    return all.filter((a) => a.date === date);
  } catch (e) {
    console.error("Error loading activities:", e);
    return [];
  }
}

export async function addActivity(
  act: Omit<ActivityItem, "id" | "date" | "time" | "timestamp"> & {
    date?: string;
    time?: string;
  },
  explicitUid?: string
): Promise<ActivityItem> {
  const date = act.date || getTodayKey();
  const time = act.time || formatCurrentTime();
  const newItem: ActivityItem = {
    ...act,
    id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    date,
    time,
    timestamp: Date.now(),
  };

  try {
    const key = getUserScopedKey(STORAGE_KEYS.ACTIVITIES, explicitUid);
    const raw = await AsyncStorage.getItem(key);
    const all: ActivityItem[] = raw ? JSON.parse(raw) : [];
    all.unshift(newItem);
    await AsyncStorage.setItem(key, JSON.stringify(all));
    syncHealthLogToCloud("activity", {
      type: newItem.type,
      title: newItem.title,
      durationMins: newItem.durationMins,
      caloriesBurned: newItem.caloriesBurned,
      distanceKm: newItem.distanceKm || 0,
      date: newItem.date,
      time: newItem.time,
    }, explicitUid);
  } catch (e) {
    console.error("Error saving activity:", e);
  }
  return newItem;
}

export async function deleteActivity(id: string, explicitUid?: string): Promise<void> {
  try {
    const key = getUserScopedKey(STORAGE_KEYS.ACTIVITIES, explicitUid);
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return;
    const all: ActivityItem[] = JSON.parse(raw);
    const filtered = all.filter((a) => a.id !== id);
    await AsyncStorage.setItem(key, JSON.stringify(filtered));
  } catch (e) {
    console.error("Error deleting activity:", e);
  }
}

export async function getDailyActivityTotals(date: string = getTodayKey(), explicitUid?: string): Promise<{
  totalMins: number;
  totalCalories: number;
  totalDistanceKm: number;
  count: number;
}> {
  const list = await getActivities(date, explicitUid);
  let totalMins = 0;
  let totalCalories = 0;
  let totalDistanceKm = 0;
  for (const a of list) {
    totalMins += a.durationMins || 0;
    totalCalories += a.caloriesBurned || 0;
    totalDistanceKm += a.distanceKm || 0;
  }
  return {
    totalMins,
    totalCalories,
    totalDistanceKm: Number(totalDistanceKm.toFixed(2)),
    count: list.length,
  };
}

// ═════════════════════════════════════════════════════════════
// HOME SCREEN — HIDDEN CARDS PERSISTENCE
// ═════════════════════════════════════════════════════════════

export async function getHiddenCards(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.HIDDEN_CARDS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error("Error loading hidden cards:", e);
    return [];
  }
}

export async function saveHiddenCards(ids: string[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.HIDDEN_CARDS, JSON.stringify(ids));
  } catch (e) {
    console.error("Error saving hidden cards:", e);
  }
}

export async function clearHiddenCards(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.HIDDEN_CARDS);
  } catch (e) {
    console.error("Error clearing hidden cards:", e);
  }
}

// ═════════════════════════════════════════════════════════════
// STEP COUNT PERSISTENCE
// ═════════════════════════════════════════════════════════════

export interface StepBaselineData {
  date: string; // YYYY-MM-DD
  startOfDaySensorSteps: number; // Baseline cumulative sensor count at midnight / day start
  lastSensorSteps: number; // Most recent reading from hardware sensor
  recordedSteps: number; // Current day's calculated steps
  rebootOffset: number; // Compensating offset if phone rebooted during day
  lastUpdated: number; // Unix timestamp
}

export interface DailyStepRecord {
  date: string; // YYYY-MM-DD
  dayLabel: string; // "Mon", "Tue", etc.
  steps: number;
  goal: number;
  completed: boolean;
  distanceKm: number;
  caloriesKcal: number;
}

export async function getTodayStepCount(explicitUid?: string): Promise<{ steps: number; date: string }> {
  try {
    const raw = await AsyncStorage.getItem(getUserScopedKey(STORAGE_KEYS.STEP_COUNT, explicitUid));
    if (!raw) return { steps: 0, date: getTodayKey() };
    const parsed = JSON.parse(raw);
    // Reset if it's a new day
    if (parsed.date !== getTodayKey()) return { steps: 0, date: getTodayKey() };
    return parsed;
  } catch (e) {
    console.error("Error loading step count:", e);
    return { steps: 0, date: getTodayKey() };
  }
}

export async function saveTodayStepCount(steps: number, explicitUid?: string): Promise<void> {
  try {
    await AsyncStorage.setItem(
      getUserScopedKey(STORAGE_KEYS.STEP_COUNT, explicitUid),
      JSON.stringify({ steps, date: getTodayKey() })
    );
  } catch (e) {
    console.error("Error saving step count:", e);
  }
}

export async function getStepBaseline(explicitUid?: string): Promise<StepBaselineData | null> {
  try {
    const raw = await AsyncStorage.getItem(getUserScopedKey(STORAGE_KEYS.STEP_BASELINE, explicitUid));
    if (!raw) return null;
    return JSON.parse(raw) as StepBaselineData;
  } catch (e) {
    console.error("Error loading step baseline:", e);
    return null;
  }
}

export async function saveStepBaseline(data: StepBaselineData, explicitUid?: string): Promise<void> {
  try {
    await AsyncStorage.setItem(getUserScopedKey(STORAGE_KEYS.STEP_BASELINE, explicitUid), JSON.stringify(data));
  } catch (e) {
    console.error("Error saving step baseline:", e);
  }
}

export async function getStepHistory(explicitUid?: string): Promise<DailyStepRecord[]> {
  try {
    const raw = await AsyncStorage.getItem(getUserScopedKey(STORAGE_KEYS.STEP_HISTORY, explicitUid));
    if (!raw) return [];
    return JSON.parse(raw) as DailyStepRecord[];
  } catch (e) {
    console.error("Error loading step history:", e);
    return [];
  }
}

export async function saveDailyStepRecord(record: DailyStepRecord, explicitUid?: string): Promise<void> {
  try {
    const existing = await getStepHistory(explicitUid);
    // Replace if same date exists, else unshift
    const filtered = existing.filter((r) => r.date !== record.date);
    filtered.unshift(record);
    // Keep up to 60 days
    await AsyncStorage.setItem(getUserScopedKey(STORAGE_KEYS.STEP_HISTORY, explicitUid), JSON.stringify(filtered.slice(0, 60)));
    // Cloud sync to Firestore
    syncHealthLogToCloud("steps", {
      steps: record.steps,
      stepCount: record.steps,
      goal: record.goal,
      distanceKm: record.distanceKm,
      caloriesKcal: record.caloriesKcal,
      completed: record.completed,
      date: record.date,
    }, explicitUid);
  } catch (e) {
    console.error("Error saving step record to history:", e);
  }
}

export async function getStoredStepGoal(explicitUid?: string): Promise<number> {
  try {
    const raw = await AsyncStorage.getItem(getUserScopedKey(STORAGE_KEYS.STEP_GOAL, explicitUid));
    if (!raw) return 6000;
    const val = parseInt(raw, 10);
    return isNaN(val) || val <= 0 ? 6000 : val;
  } catch (e) {
    return 6000;
  }
}

export async function saveStoredStepGoal(goal: number, explicitUid?: string): Promise<void> {
  try {
    await AsyncStorage.setItem(getUserScopedKey(STORAGE_KEYS.STEP_GOAL, explicitUid), String(goal));
  } catch (e) {
    console.error("Error saving step goal:", e);
  }
}

// ═════════════════════════════════════════════════════════════
// WATER / HYDRATION LOGGING
// ═════════════════════════════════════════════════════════════

export interface WaterEntry {
  id: string;
  amount: number; // ml
  time: string; // e.g. "2:45 pm"
  date: string; // YYYY-MM-DD
  timestamp: number;
}

export async function getWaterLogs(date: string = getTodayKey(), explicitUid?: string): Promise<WaterEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(getUserScopedKey(STORAGE_KEYS.WATER, explicitUid));
    if (!raw) return [];
    const all: WaterEntry[] = JSON.parse(raw);
    return all.filter((w) => w.date === date);
  } catch (e) {
    console.error("Error loading water logs:", e);
    return [];
  }
}

export async function addWaterLog(amount: number = 250, date: string = getTodayKey(), explicitUid?: string): Promise<WaterEntry> {
  const now = new Date();
  const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }).toLowerCase();
  const newEntry: WaterEntry = {
    id: `water_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    amount,
    time,
    date,
    timestamp: Date.now(),
  };
  try {
    const key = getUserScopedKey(STORAGE_KEYS.WATER, explicitUid);
    const raw = await AsyncStorage.getItem(key);
    const all: WaterEntry[] = raw ? JSON.parse(raw) : [];
    all.unshift(newEntry);
    await AsyncStorage.setItem(key, JSON.stringify(all));
    // Cloud sync
    syncHealthLogToCloud("hydration", {
      amount,
      amountMl: amount,
      date,
      time,
    }, explicitUid);
  } catch (e) {
    console.error("Error saving water log:", e);
  }
  return newEntry;
}

export async function getTodayWaterIntake(date: string = getTodayKey(), explicitUid?: string): Promise<number> {
  const logs = await getWaterLogs(date, explicitUid);
  return logs.reduce((sum, item) => sum + (item.amount || 0), 0);
}

// ═════════════════════════════════════════════════════════════
// BODY COMPOSITION / WEIGHT LOGGING
// ═════════════════════════════════════════════════════════════

export interface BodyCompEntry {
  id: string;
  weight: number; // kg
  muscle?: string;
  bodyFat?: string;
  notes?: string;
  date: string;
  time: string;
  timestamp: number;
}

export async function getLatestBodyComp(explicitUid?: string): Promise<BodyCompEntry | null> {
  try {
    const raw = await AsyncStorage.getItem(getUserScopedKey(STORAGE_KEYS.BODY_COMP, explicitUid));
    if (!raw) return null;
    const all: BodyCompEntry[] = JSON.parse(raw);
    return all.length > 0 ? all[0] : null;
  } catch (e) {
    console.error("Error loading body comp:", e);
    return null;
  }
}

export async function getAllBodyComp(explicitUid?: string): Promise<BodyCompEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(getUserScopedKey(STORAGE_KEYS.BODY_COMP, explicitUid));
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error("Error loading all body comp entries:", e);
    return [];
  }
}

export async function saveBodyComp(data: {
  weight: number;
  muscle?: string;
  bodyFat?: string;
  notes?: string;
}, explicitUid?: string): Promise<BodyCompEntry> {
  const now = new Date();
  const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }).toLowerCase();
  const newEntry: BodyCompEntry = {
    id: `body_${Date.now()}`,
    weight: data.weight,
    muscle: data.muscle,
    bodyFat: data.bodyFat,
    notes: data.notes,
    date: getTodayKey(),
    time: `${time} (manual input)`,
    timestamp: Date.now(),
  };
  try {
    const key = getUserScopedKey(STORAGE_KEYS.BODY_COMP, explicitUid);
    const raw = await AsyncStorage.getItem(key);
    const all: BodyCompEntry[] = raw ? JSON.parse(raw) : [];
    all.unshift(newEntry);
    await AsyncStorage.setItem(key, JSON.stringify(all));
    // Cloud sync
    syncHealthLogToCloud("body_comp", {
      weight: data.weight,
      muscle: data.muscle || null,
      bodyFat: data.bodyFat || null,
      notes: data.notes || null,
      date: newEntry.date,
    }, explicitUid);
  } catch (e) {
    console.error("Error saving body comp:", e);
  }
  return newEntry;
}

// ═════════════════════════════════════════════════════════════
// VITALS: HEART RATE & SPO2 LOGGING (MANUAL + BLE FALLBACK)
// ═════════════════════════════════════════════════════════════

const HEART_RATE_KEY = "@urban_health_heart_rate_v1";
const BLOOD_OXYGEN_KEY = "@urban_health_spo2_v1";

export interface VitalEntry {
  id: string;
  value: number;
  unit: string;
  source: string; // e.g. "Manual Log", "Smartwatch BLE"
  date: string;
  time: string;
  timestamp: number;
}

export async function saveHeartRateLog(
  bpm: number,
  source: string = "Manual Entry",
  explicitUid?: string
): Promise<VitalEntry> {
  const newEntry: VitalEntry = {
    id: `hr_${Date.now()}`,
    value: bpm,
    unit: "bpm",
    source,
    date: getTodayKey(),
    time: formatCurrentTime(),
    timestamp: Date.now(),
  };
  try {
    const key = getUserScopedKey(HEART_RATE_KEY, explicitUid);
    const raw = await AsyncStorage.getItem(key);
    const list: VitalEntry[] = raw ? JSON.parse(raw) : [];
    list.unshift(newEntry);
    await AsyncStorage.setItem(key, JSON.stringify(list.slice(0, 50)));
    // Cloud sync
    syncHealthLogToCloud("vitals", {
      heartRate: bpm,
      hr: bpm,
      unit: "bpm",
      source,
      date: newEntry.date,
      time: newEntry.time,
    }, explicitUid);
  } catch (e) {
    console.error("Error saving heart rate:", e);
  }
  return newEntry;
}

export async function getHeartRateLogs(explicitUid?: string): Promise<VitalEntry[]> {
  try {
    const key = getUserScopedKey(HEART_RATE_KEY, explicitUid);
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export async function saveBloodOxygenLog(
  spo2: number,
  source: string = "Manual Entry",
  explicitUid?: string
): Promise<VitalEntry> {
  const newEntry: VitalEntry = {
    id: `spo2_${Date.now()}`,
    value: spo2,
    unit: "%",
    source,
    date: getTodayKey(),
    time: formatCurrentTime(),
    timestamp: Date.now(),
  };
  try {
    const key = getUserScopedKey(BLOOD_OXYGEN_KEY, explicitUid);
    const raw = await AsyncStorage.getItem(key);
    const list: VitalEntry[] = raw ? JSON.parse(raw) : [];
    list.unshift(newEntry);
    await AsyncStorage.setItem(key, JSON.stringify(list.slice(0, 50)));
    // Cloud sync
    syncHealthLogToCloud("vitals", {
      spo2,
      bloodOxygen: spo2,
      unit: "%",
      source,
      date: newEntry.date,
      time: newEntry.time,
    }, explicitUid);
  } catch (e) {
    console.error("Error saving blood oxygen:", e);
  }
  return newEntry;
}

export async function getBloodOxygenLogs(explicitUid?: string): Promise<VitalEntry[]> {
  try {
    const key = getUserScopedKey(BLOOD_OXYGEN_KEY, explicitUid);
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

// ═════════════════════════════════════════════════════════════
// HEARING LOGGING
// ═════════════════════════════════════════════════════════════

const HEARING_KEY = "@urban_health_hearing_v1";

export type HearingStatus = "ok" | "caution" | "unsafe";

export interface HearingEntry {
  id: string;
  date: string;          // YYYY-MM-DD
  dBAvg: number;         // average dB measured (0–120)
  status: HearingStatus; // derived from dBAvg
  durationMins: number;  // minutes of exposure tracked
  timestamp: number;
}

/** Derive hearing status from an average dB value.
 *  < 70 dB  → OK
 *  70–85 dB → Caution
 *  > 85 dB  → Unsafe
 */
export function hearingStatusFromDB(dbLevel: number): HearingStatus {
  if (dbLevel < 70) return "ok";
  if (dbLevel <= 85) return "caution";
  return "unsafe";
}

/** Human-readable label for a hearing status */
export function hearingStatusLabel(status: HearingStatus): string {
  switch (status) {
    case "ok": return "OK";
    case "caution": return "Caution";
    case "unsafe": return "Unsafe";
  }
}

export async function getHearingEntries(uid: string): Promise<HearingEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(`${HEARING_KEY}_${uid}`);
    if (!raw) return [];
    return JSON.parse(raw) as HearingEntry[];
  } catch (e) {
    console.error("Error loading hearing entries:", e);
    return [];
  }
}

export async function getHearingForDate(
  uid: string,
  date: string
): Promise<HearingEntry | null> {
  try {
    const all = await getHearingEntries(uid);
    return all.find((e) => e.date === date) ?? null;
  } catch (e) {
    console.error("Error loading hearing entry for date:", e);
    return null;
  }
}

/**
 * Returns an array of 7 slots from (today − 6 days) through today.
 * Each slot is { date: string, entry: HearingEntry | null }.
 */
export async function getLast7DaysHearing(
  uid: string
): Promise<{ date: string; entry: HearingEntry | null }[]> {
  try {
    const all = await getHearingEntries(uid);
    const result: { date: string; entry: HearingEntry | null }[] = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const entry = all.find((e) => e.date === dateStr) ?? null;
      result.push({ date: dateStr, entry });
    }
    return result;
  } catch (e) {
    console.error("Error loading 7-day hearing data:", e);
    return [];
  }
}

export async function addHearingEntry(
  uid: string,
  entry: Omit<HearingEntry, "id" | "timestamp">
): Promise<HearingEntry> {
  const newEntry: HearingEntry = {
    ...entry,
    id: `hearing_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: Date.now(),
  };
  try {
    const raw = await AsyncStorage.getItem(`${HEARING_KEY}_${uid}`);
    const all: HearingEntry[] = raw ? JSON.parse(raw) : [];
    const filtered = all.filter((e) => e.date !== newEntry.date);
    filtered.unshift(newEntry);
    await AsyncStorage.setItem(`${HEARING_KEY}_${uid}`, JSON.stringify(filtered));
  } catch (e) {
    console.error("Error saving hearing entry:", e);
  }
  return newEntry;
}
