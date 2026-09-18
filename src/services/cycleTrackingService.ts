import AsyncStorage from "@react-native-async-storage/async-storage";

export interface CycleDayLog {
  date: string; // YYYY-MM-DD
  cycleDay: number;
  flow: "none" | "spotting" | "light" | "medium" | "heavy";
  symptoms: string[];
  mood: string;
  notes?: string;
  updatedAt: number;
}

export interface CycleConfig {
  cycleLength: number; // e.g., 28 days
  periodLength: number; // e.g., 5 days
  lutealLength: number; // e.g., 14 days
  lastPeriodStart: string; // YYYY-MM-DD
}

const CYCLE_LOGS_KEY = "@urban_cycle_daily_logs_v2";
const CYCLE_CONFIG_KEY = "@urban_cycle_user_config_v2";

const DEFAULT_CONFIG: CycleConfig = {
  cycleLength: 28,
  periodLength: 5,
  lutealLength: 14,
  lastPeriodStart: new Date(Date.now() - 13 * 86400000).toISOString().split("T")[0], // Day 14 today default
};

export async function getCycleConfig(): Promise<CycleConfig> {
  try {
    const raw = await AsyncStorage.getItem(CYCLE_CONFIG_KEY);
    if (!raw) return DEFAULT_CONFIG;
    return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_CONFIG;
  }
}

export async function saveCycleConfig(config: CycleConfig): Promise<void> {
  try {
    await AsyncStorage.setItem(CYCLE_CONFIG_KEY, JSON.stringify(config));
  } catch (err) {
    console.error("Failed to save cycle config", err);
  }
}

export async function getCycleLogs(): Promise<Record<string, CycleDayLog>> {
  try {
    const raw = await AsyncStorage.getItem(CYCLE_LOGS_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export async function saveCycleDayLog(log: CycleDayLog): Promise<void> {
  try {
    const current = await getCycleLogs();
    current[log.date] = log;
    await AsyncStorage.setItem(CYCLE_LOGS_KEY, JSON.stringify(current));
  } catch (err) {
    console.error("Failed to save cycle log", err);
  }
}
