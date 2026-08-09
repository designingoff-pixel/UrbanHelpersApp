import { NavTab } from "@/components/BottomNav";

/** Shared tab set used by Module 2 dashboards + most Module 3/4 sub-screens. */
export const mainTabs: NavTab[] = [
  { label: "Home", icon: "home", screen: "HomeDashboard" },
  { label: "Health", icon: "heart", screen: "HealthDashboard" },
  { label: "Discover", icon: "compass", screen: "Discover" },
  { label: "Fitness", icon: "barbell", screen: "FitnessDashboard" },
  { label: "Profile", icon: "person" },
];

/** Tab set used across Medical Records sub-screens (Module 3). */
export const medicalTabs: NavTab[] = [
  { label: "Home", icon: "home", screen: "HomeDashboard" },
  { label: "Categories", icon: "grid", screen: "MedicalRecords" },
  { label: "Health", icon: "heart", screen: "HealthDashboard" },
  { label: "Profile", icon: "person" },
];

/** Tab set used across Daily Care sub-screens (Module 6). */
export const careTabs: NavTab[] = [
  { label: "Health", icon: "heart", screen: "HealthDashboard" },
  { label: "History", icon: "time", screen: "MedicineHistory" },
  { label: "Alarm", icon: "alarm", screen: "MedicineAlarm" },
  { label: "Reminders", icon: "notifications", screen: "SmartReminders" },
  { label: "Profile", icon: "person" },
];

/** Tab set used by Hydration/Wellness (Module 5) — Health/Coaching/Log/Nutrition/Profile. */
export const wellnessTabs: NavTab[] = [
  { label: "Health", icon: "heart", screen: "HealthDashboard" },
  { label: "Coaching", icon: "chatbubble-ellipses", screen: "AICoach" },
  { label: "Log", icon: "clipboard" },
  { label: "Nutrition", icon: "nutrition", screen: "NutritionDashboard" },
  { label: "Profile", icon: "person" },
];
