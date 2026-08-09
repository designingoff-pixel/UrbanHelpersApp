export type RootStackParamList = {
  // Module 1 — Onboarding / Auth
  Splash: undefined;
  Welcome: undefined;
  SignIn: undefined;
  CreateAccount: undefined;
  CreateProfile: undefined;
  OTPVerification: undefined;
  ForgotPassword: undefined;
  SystemPermissions: undefined;
  OnboardingHealth: undefined;
  OnboardingHomeServices: undefined;
  OnboardingFamily: undefined;

  // Module 2 — Main Dashboard
  HomeDashboard: undefined;
  FitnessDashboard: undefined;
  FamilyDashboard: undefined;
  Discover: undefined;
  HealthDashboard: undefined;
  MedicalRecords: undefined;
  MedicationCenter: undefined;
  EmergencyAssistance: undefined;
  AICoach: undefined;
  SleepDashboard: undefined;
  NutritionDashboard: undefined;

  // Module 3 — Medical Records
  HealthDataAnalytics: undefined;
  LabReportsHub: undefined;
  DoctorAdvice: undefined;
  BloodTestReports: undefined;
  PrescriptionManagement: undefined;
  VaccinationCenter: undefined;

  // Module 4 — Fitness
  YogaDashboard: undefined;
  CaloriesDashboard: undefined;
  DailyStepsDashboard: undefined;
  PhysiotherapyDashboard: undefined;
  MeditationDashboard: undefined;
  GymDashboard: undefined;

  // Module 5 — Daily Health
  HydrationDashboard: undefined;
  WeightLogDashboard: undefined;
  WellnessDashboard: undefined;
  AdvancedNutritionDashboard: undefined;

  // Module 6 — Daily Care
  MedicineAlarm: undefined;
  MedicineHistory: undefined;
  SmartReminders: undefined;
  PersonalHygiene: undefined;
  HealthPrecautions: undefined;
  HealthCompanion: undefined;
};

export type ScreenName = keyof RootStackParamList;
