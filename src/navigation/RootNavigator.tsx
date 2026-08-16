import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { RootStackParamList } from "./types";

// Module 1 — Onboarding / Auth
import SplashScreen from "@/screens/auth/SplashScreen";
import WelcomeScreen from "@/screens/auth/WelcomeScreen";
import SignInScreen from "@/screens/auth/SignInScreen";
import CreateAccountScreen from "@/screens/auth/CreateAccountScreen";
import CreateProfileScreen from "@/screens/auth/CreateProfileScreen";
import OTPVerificationScreen from "@/screens/auth/OTPVerificationScreen";
import ForgotPasswordScreen from "@/screens/auth/ForgotPasswordScreen";
import SystemPermissionsScreen from "@/screens/auth/SystemPermissionsScreen";
import OnboardingHealthScreen from "@/screens/auth/OnboardingHealthScreen";
import OnboardingHomeServicesScreen from "@/screens/auth/OnboardingHomeServicesScreen";
import OnboardingFamilyScreen from "@/screens/auth/OnboardingFamilyScreen";

// Module 2 — Main Dashboard
import HomeDashboardScreen from "@/screens/dashboard/HomeDashboardScreen";
import FitnessDashboardScreen from "@/screens/dashboard/FitnessDashboardScreen";
import FamilyDashboardScreen from "@/screens/dashboard/FamilyDashboardScreen";
import DiscoverScreen from "@/screens/dashboard/DiscoverScreen";
import HealthDashboardScreen from "@/screens/dashboard/HealthDashboardScreen";
import MedicalRecordsScreen from "@/screens/dashboard/MedicalRecordsScreen";
import MedicationCenterScreen from "@/screens/dashboard/MedicationCenterScreen";
import EmergencyAssistanceScreen from "@/screens/dashboard/EmergencyAssistanceScreen";
import AICoachScreen from "@/screens/dashboard/AICoachScreen";
import SleepDashboardScreen from "@/screens/dashboard/SleepDashboardScreen";
import NutritionDashboardScreen from "@/screens/dashboard/NutritionDashboardScreen";

// Module 3 — Medical Records
import HealthDataAnalyticsScreen from "@/screens/medical/HealthDataAnalyticsScreen";
import LabReportsHubScreen from "@/screens/medical/LabReportsHubScreen";
import DoctorAdviceScreen from "@/screens/medical/DoctorAdviceScreen";
import BloodTestReportsScreen from "@/screens/medical/BloodTestReportsScreen";
import PrescriptionManagementScreen from "@/screens/medical/PrescriptionManagementScreen";
import VaccinationCenterScreen from "@/screens/medical/VaccinationCenterScreen";

// Module 4 — Fitness
import YogaDashboardScreen from "@/screens/fitness/YogaDashboardScreen";
import CaloriesDashboardScreen from "@/screens/fitness/CaloriesDashboardScreen";
import DailyStepsDashboardScreen from "@/screens/fitness/DailyStepsDashboardScreen";
import PhysiotherapyDashboardScreen from "@/screens/fitness/PhysiotherapyDashboardScreen";
import MeditationDashboardScreen from "@/screens/fitness/MeditationDashboardScreen";
import GymDashboardScreen from "@/screens/fitness/GymDashboardScreen";

// Module 5 — Daily Health
import HydrationDashboardScreen from "@/screens/dailyhealth/HydrationDashboardScreen";
import WeightLogDashboardScreen from "@/screens/dailyhealth/WeightLogDashboardScreen";
import WellnessDashboardScreen from "@/screens/dailyhealth/WellnessDashboardScreen";
import AdvancedNutritionDashboardScreen from "@/screens/dailyhealth/AdvancedNutritionDashboardScreen";

// Module 6 — Daily Care
import MedicineAlarmScreen from "@/screens/dailycare/MedicineAlarmScreen";
import MedicineHistoryScreen from "@/screens/dailycare/MedicineHistoryScreen";
import SmartRemindersScreen from "@/screens/dailycare/SmartRemindersScreen";
import PersonalHygieneScreen from "@/screens/dailycare/PersonalHygieneScreen";
import HealthPrecautionsScreen from "@/screens/dailycare/HealthPrecautionsScreen";
import HealthCompanionScreen from "@/screens/dailycare/HealthCompanionScreen";

// Profile
import ProfileScreen from "@/screens/profile/ProfileScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Screen graph mirrors the 143 reactions wired into the Figma prototype
 * (Splash -> Welcome -> Onboarding/Auth -> Main Dashboard hub -> module sub-screens).
 * A plain stack is used (not nested tabs) because the source design's bottom navs
 * differ per screen rather than sharing one fixed tab set.
 */
export function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerShown: false,
        // Samsung Health-style: fast slide-up with a slight fade
        animation: "slide_from_bottom",
        animationDuration: 320,
        contentStyle: { backgroundColor: "#041423" },
        // Gesture back swipe works out of the box on iOS; enable on Android too
        gestureEnabled: true,
      }}
    >
      {/* Module 1 */}
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="SignIn" component={SignInScreen} />
      <Stack.Screen name="CreateAccount" component={CreateAccountScreen} />
      <Stack.Screen name="CreateProfile" component={CreateProfileScreen} />
      <Stack.Screen name="OTPVerification" component={OTPVerificationScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="SystemPermissions" component={SystemPermissionsScreen} />
      <Stack.Screen name="OnboardingHealth" component={OnboardingHealthScreen} />
      <Stack.Screen name="OnboardingHomeServices" component={OnboardingHomeServicesScreen} />
      <Stack.Screen name="OnboardingFamily" component={OnboardingFamilyScreen} />

      {/* Module 2 */}
      <Stack.Screen name="HomeDashboard" component={HomeDashboardScreen} />
      <Stack.Screen name="FitnessDashboard" component={FitnessDashboardScreen} />
      <Stack.Screen name="FamilyDashboard" component={FamilyDashboardScreen} />
      <Stack.Screen name="Discover" component={DiscoverScreen} />
      <Stack.Screen name="HealthDashboard" component={HealthDashboardScreen} />
      <Stack.Screen name="MedicalRecords" component={MedicalRecordsScreen} />
      <Stack.Screen name="MedicationCenter" component={MedicationCenterScreen} />
      <Stack.Screen name="EmergencyAssistance" component={EmergencyAssistanceScreen} />
      <Stack.Screen name="AICoach" component={AICoachScreen} />
      <Stack.Screen name="SleepDashboard" component={SleepDashboardScreen} />
      <Stack.Screen name="NutritionDashboard" component={NutritionDashboardScreen} />

      {/* Module 3 */}
      <Stack.Screen name="HealthDataAnalytics" component={HealthDataAnalyticsScreen} />
      <Stack.Screen name="LabReportsHub" component={LabReportsHubScreen} />
      <Stack.Screen name="DoctorAdvice" component={DoctorAdviceScreen} />
      <Stack.Screen name="BloodTestReports" component={BloodTestReportsScreen} />
      <Stack.Screen name="PrescriptionManagement" component={PrescriptionManagementScreen} />
      <Stack.Screen name="VaccinationCenter" component={VaccinationCenterScreen} />

      {/* Module 4 */}
      <Stack.Screen name="YogaDashboard" component={YogaDashboardScreen} />
      <Stack.Screen name="CaloriesDashboard" component={CaloriesDashboardScreen} />
      <Stack.Screen name="DailyStepsDashboard" component={DailyStepsDashboardScreen} />
      <Stack.Screen name="PhysiotherapyDashboard" component={PhysiotherapyDashboardScreen} />
      <Stack.Screen name="MeditationDashboard" component={MeditationDashboardScreen} />
      <Stack.Screen name="GymDashboard" component={GymDashboardScreen} />

      {/* Module 5 */}
      <Stack.Screen name="HydrationDashboard" component={HydrationDashboardScreen} />
      <Stack.Screen name="WeightLogDashboard" component={WeightLogDashboardScreen} />
      <Stack.Screen name="WellnessDashboard" component={WellnessDashboardScreen} />
      <Stack.Screen name="AdvancedNutritionDashboard" component={AdvancedNutritionDashboardScreen} />

      {/* Module 6 */}
      <Stack.Screen name="MedicineAlarm" component={MedicineAlarmScreen} />
      <Stack.Screen name="MedicineHistory" component={MedicineHistoryScreen} />
      <Stack.Screen name="SmartReminders" component={SmartRemindersScreen} />
      <Stack.Screen name="PersonalHygiene" component={PersonalHygieneScreen} />
      <Stack.Screen name="HealthPrecautions" component={HealthPrecautionsScreen} />
      <Stack.Screen name="HealthCompanion" component={HealthCompanionScreen} />

      {/* Profile */}
      <Stack.Screen name="Profile" component={ProfileScreen} />
    </Stack.Navigator>
  );
}
