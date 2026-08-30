import React, { useEffect, useRef } from "react";
import { useNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { RootStackParamList } from "./types";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/services/firebase";
import { collection, query, where, onSnapshot, limit } from "firebase/firestore";
import { sendVendorArrivedOTPNotification } from "@/services/notificationService";

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

// Notifications
import NotificationsScreen from "@/screens/notifications/NotificationsScreen";

// Services module
import ServicesDashboardScreen from "@/screens/services/ServicesDashboardScreen";
import ServiceCategoryScreen from "@/screens/services/ServiceCategoryScreen";
import ServiceDetailScreen from "@/screens/services/ServiceDetailScreen";
import BookingConfirmedScreen from "@/screens/services/BookingConfirmedScreen";
import LiveTrackingScreen from "@/screens/services/LiveTrackingScreen";
import ServiceInProgressScreen from "@/screens/services/ServiceInProgressScreen";
import ServiceCompletedScreen from "@/screens/services/ServiceCompletedScreen";
import RatingFeedbackScreen from "@/screens/services/RatingFeedbackScreen";
import HomeCleaningScreen from "@/screens/services/HomeCleaningScreen";
import MyBookingsScreen from "@/screens/services/MyBookingsScreen";
import OffersScreen from "@/screens/services/OffersScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Global component that listens to the user's active booking.
 * 1. Triggers a push notification if the vendor arrives.
 * 2. Auto-navigates to the RatingFeedback screen if the vendor completes the job.
 */
function GlobalBookingListener() {
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const prevStatus = useRef<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "bookings"),
      where("customerId", "==", user.uid),
      where("status", "in", ["assigned", "accepted", "en_route", "arrived", "in_progress", "completed"]),
      limit(1)
    );
    const unsub = onSnapshot(q, (snap) => {
      if (snap.empty) {
        prevStatus.current = null;
        return;
      }
      const data = snap.docs[0].data();
      const newStatus = data.status;

      // If transition to arrived, fire notification!
      if (prevStatus.current && prevStatus.current !== "arrived" && newStatus === "arrived") {
        if (data.otp) {
          sendVendorArrivedOTPNotification(data.otp);
        }
      }

      // If transition to completed, immediately open Rating/Feedback screen
      if (prevStatus.current && prevStatus.current !== "completed" && newStatus === "completed") {
        navigation.navigate("RatingFeedback", {});
      }

      prevStatus.current = newStatus;
    });
    return () => unsub();
  }, [user, navigation]);

  return null;
}

/**
 * Screen graph mirrors the 143 reactions wired into the Figma prototype
 */
export function RootNavigator() {
  return (
    <>
      <GlobalBookingListener />
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

      {/* Notifications */}
      <Stack.Screen name="Notifications" component={NotificationsScreen} />

      {/* Services module */}
      <Stack.Screen name="ServicesDashboard" component={ServicesDashboardScreen} />
      <Stack.Screen name="ServiceCategory" component={ServiceCategoryScreen} />
      <Stack.Screen name="ServiceDetail" component={ServiceDetailScreen} />
      <Stack.Screen name="BookingConfirmed" component={BookingConfirmedScreen} />
      <Stack.Screen name="LiveTracking" component={LiveTrackingScreen} />
      <Stack.Screen name="ServiceInProgress" component={ServiceInProgressScreen} />
      <Stack.Screen name="ServiceCompleted" component={ServiceCompletedScreen} />
      <Stack.Screen name="RatingFeedback" component={RatingFeedbackScreen} />
      <Stack.Screen name="HomeCleaning" component={HomeCleaningScreen} />
      <Stack.Screen name="MyBookings" component={MyBookingsScreen} />
      <Stack.Screen name="Offers" component={OffersScreen} />
    </Stack.Navigator>
    </>
  );
}
