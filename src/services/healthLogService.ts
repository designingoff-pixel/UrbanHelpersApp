import AsyncStorage from "@react-native-async-storage/async-storage";
import { cancelNotificationById } from "@/services/notificationService";

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

export async function getMeals(date: string = getTodayKey()): Promise<MealItem[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.MEALS);
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
  }
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
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.MEALS);
    const allMeals: MealItem[] = raw ? JSON.parse(raw) : [];
    allMeals.unshift(newItem);
    await AsyncStorage.setItem(STORAGE_KEYS.MEALS, JSON.stringify(allMeals));
  } catch (e) {
    console.error("Error saving meal:", e);
  }
  return newItem;
}

export async function deleteMeal(id: string): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.MEALS);
    if (!raw) return;
    const allMeals: MealItem[] = JSON.parse(raw);
    const filtered = allMeals.filter((m) => m.id !== id);
    await AsyncStorage.setItem(STORAGE_KEYS.MEALS, JSON.stringify(filtered));
  } catch (e) {
    console.error("Error deleting meal:", e);
  }
}

export async function getDailyNutritionTotals(date: string = getTodayKey()): Promise<{
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  byCategory: Record<MealType, { count: number; calories: number }>;
}> {
  const meals = await getMeals(date);
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

export async function getMedications(): Promise<MedicationItem[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.MEDICATIONS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error("Error loading medications:", e);
    return [];
  }
}

export async function addMedication(
  med: Omit<MedicationItem, "id" | "takenDates" | "createdAt">
): Promise<MedicationItem> {
  const newItem: MedicationItem = {
    ...med,
    id: `med_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    takenDates: [],
    createdAt: Date.now(),
  };

  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.MEDICATIONS);
    const allMeds: MedicationItem[] = raw ? JSON.parse(raw) : [];
    allMeds.push(newItem);
    await AsyncStorage.setItem(STORAGE_KEYS.MEDICATIONS, JSON.stringify(allMeds));
  } catch (e) {
    console.error("Error adding medication:", e);
  }
  return newItem;
}

export async function toggleMedicationTaken(
  id: string,
  date: string = getTodayKey()
): Promise<boolean> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.MEDICATIONS);
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

    await AsyncStorage.setItem(STORAGE_KEYS.MEDICATIONS, JSON.stringify(allMeds));
    return !hasTaken;
  } catch (e) {
    console.error("Error toggling medication taken:", e);
    return false;
  }
}

export async function deleteMedication(id: string): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.MEDICATIONS);
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
    await AsyncStorage.setItem(STORAGE_KEYS.MEDICATIONS, JSON.stringify(filtered));
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
  notificationId: string
): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.MEDICATIONS);
    if (!raw) return;
    const allMeds: MedicationItem[] = JSON.parse(raw);
    const index = allMeds.findIndex((m) => m.id === id);
    if (index === -1) return;
    allMeds[index] = { ...allMeds[index], notificationId };
    await AsyncStorage.setItem(STORAGE_KEYS.MEDICATIONS, JSON.stringify(allMeds));
  } catch (e) {
    console.error("Error updating medication notificationId:", e);
  }
}

// ═════════════════════════════════════════════════════════════
// ACTIVITIES / WORKOUT LOGGING
// ═════════════════════════════════════════════════════════════

export async function getActivities(date: string = getTodayKey()): Promise<ActivityItem[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.ACTIVITIES);
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
  }
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
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.ACTIVITIES);
    const all: ActivityItem[] = raw ? JSON.parse(raw) : [];
    all.unshift(newItem);
    await AsyncStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(all));
  } catch (e) {
    console.error("Error saving activity:", e);
  }
  return newItem;
}

export async function deleteActivity(id: string): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.ACTIVITIES);
    if (!raw) return;
    const all: ActivityItem[] = JSON.parse(raw);
    const filtered = all.filter((a) => a.id !== id);
    await AsyncStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(filtered));
  } catch (e) {
    console.error("Error deleting activity:", e);
  }
}

export async function getDailyActivityTotals(date: string = getTodayKey()): Promise<{
  totalMins: number;
  totalCalories: number;
  totalDistanceKm: number;
  count: number;
}> {
  const list = await getActivities(date);
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

export async function getTodayStepCount(): Promise<{ steps: number; date: string }> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.STEP_COUNT);
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

export async function saveTodayStepCount(steps: number): Promise<void> {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEYS.STEP_COUNT,
      JSON.stringify({ steps, date: getTodayKey() })
    );
  } catch (e) {
    console.error("Error saving step count:", e);
  }
}
