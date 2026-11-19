import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  StatusBar,
  Linking,
  Share,
  Modal,
  TextInput,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/types";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

type Props = NativeStackScreenProps<RootStackParamList, "Settings">;

const SETTINGS_STORAGE_KEY = "@urban_health_app_settings_v1";

interface AppSettingsState {
  pushNotifications: boolean;
  medicationAlerts: boolean;
  healthTips: boolean;
  shopPromotions: boolean;
  soundEffects: boolean;
  hapticFeedback: boolean;
  autoSyncSmartwatch: boolean;
  biometricLock: boolean;
  unitsMetric: boolean; // true = kg/cm, false = lbs/ft
}

const DEFAULT_SETTINGS: AppSettingsState = {
  pushNotifications: true,
  medicationAlerts: true,
  healthTips: true,
  shopPromotions: true,
  soundEffects: true,
  hapticFeedback: true,
  autoSyncSmartwatch: true,
  biometricLock: false,
  unitsMetric: true,
};

interface FlowScreenItem {
  id: string;
  name: string;
  route: keyof RootStackParamList;
  params?: any;
  category: "Shop & Buying" | "Home Services" | "Smartwatch & Vitals" | "Medical & Daily Care" | "Auth & Profile";
  badge: "Watch" | "No Watch";
  description: string;
}

const FLOW_SCREENS: FlowScreenItem[] = [
  // Shop & Buying
  { id: "s1", name: "Shop Marketplace", route: "Shop", category: "Shop & Buying", badge: "No Watch", description: "Product catalogue, categories, search & flash sale countdown" },
  { id: "s2", name: "Product Detail", route: "ShopProductDetail", params: { productId: "prod-scale-3" }, category: "Shop & Buying", badge: "No Watch", description: "Product gallery, star reviews, quantity selector & Add to Cart" },
  { id: "s3", name: "Order History", route: "OrderHistory", category: "Shop & Buying", badge: "No Watch", description: "Past orders, real-time dispatch tracking & cancellation" },
  { id: "s4", name: "Urban Rewards Points", route: "Points", category: "Shop & Buying", badge: "No Watch", description: "Gamified reward points balance & loyalty perks" },

  // Home Services
  { id: "h1", name: "Services Dashboard", route: "ServicesDashboard", category: "Home Services", badge: "No Watch", description: "On-demand home services grid (RO, Cleaning, AC, Plumber, etc.)" },
  { id: "h2", name: "Service Category", route: "ServiceCategory", params: { categoryId: "ro" }, category: "Home Services", badge: "No Watch", description: "Sub-services list with pricing, durations & packages" },
  { id: "h3", name: "Service Detail Booking", route: "ServiceDetail", params: { categoryId: "ro", subServiceId: "ro-filter" }, category: "Home Services", badge: "No Watch", description: "Auto GPS address detection, schedule picker & price breakdown" },
  { id: "h4", name: "Booking Confirmed", route: "BookingConfirmed", params: { bookingId: "UH-DEMO-001", otp: "4892", serviceName: "Filter Change", vendorName: "Karthik R.", scheduledDate: "Today", scheduledTime: "11:00 AM" }, category: "Home Services", badge: "No Watch", description: "Booking receipt with 4-digit security OTP" },
  { id: "h5", name: "Live Vendor Tracking", route: "LiveTracking", params: { bookingId: "UH-DEMO-001" }, category: "Home Services", badge: "No Watch", description: "Real-time technician GPS tracking arriving at customer doorstep" },
  { id: "h6", name: "Service In Progress", route: "ServiceInProgress", params: { bookingId: "UH-DEMO-001" }, category: "Home Services", badge: "No Watch", description: "Job underway, security recording banner & SOP timer" },
  { id: "h7", name: "Service Completed", route: "ServiceCompleted", params: { bookingId: "UH-DEMO-001" }, category: "Home Services", badge: "No Watch", description: "Final work completion invoice & technician work proofs" },
  { id: "h8", name: "Rating & Feedback", route: "RatingFeedback", params: { bookingId: "UH-DEMO-001" }, category: "Home Services", badge: "No Watch", description: "5-star rating, review comments & technician tip" },
  { id: "h9", name: "My Bookings Hub", route: "MyBookings", category: "Home Services", badge: "No Watch", description: "Track all active, upcoming & completed service bookings" },

  // Smartwatch & Vitals
  { id: "w1", name: "Vitals Overview", route: "VitalsScreen", category: "Smartwatch & Vitals", badge: "Watch", description: "Full dashboard: Heart Rate, SpO2, Stress, BP, Blood Glucose" },
  { id: "w2", name: "Heart Rate Monitor", route: "HeartRate", category: "Smartwatch & Vitals", badge: "Watch", description: "Live optical BPM pulse stream, resting HR & cardio zones" },
  { id: "w3", name: "Blood Oxygen (SpO2)", route: "BloodOxygen", category: "Smartwatch & Vitals", badge: "Watch", description: "Real-time blood oxygen saturation level (95-100%)" },
  { id: "w4", name: "Stress Tracker", route: "Stress", category: "Smartwatch & Vitals", badge: "Watch", description: "HRV-derived stress index (0-100) & guided relaxation" },
  { id: "w5", name: "Blood Glucose (CGM)", route: "BloodGlucose", category: "Smartwatch & Vitals", badge: "Watch", description: "Continuous glucose sensor readings & fasting/post-meal tags" },
  { id: "w6", name: "Sleep Dashboard", route: "SleepDashboard", category: "Smartwatch & Vitals", badge: "Watch", description: "Nocturnal sleep stage analysis: Deep, REM, Light & sleep score" },
  { id: "w7", name: "Fitness & Pedometer", route: "FitnessDashboard", category: "Smartwatch & Vitals", badge: "Watch", description: "Accelerometer live steps, distance (km) & active calorie burn" },
  { id: "w8", name: "Connect Smartwatch", route: "ConnectWatch", category: "Smartwatch & Vitals", badge: "Watch", description: "Scan, pair & connect Bluetooth Low Energy (BLE) smartwatches" },
  { id: "w9", name: "BLE Diagnostics", route: "BleDiagnostics", category: "Smartwatch & Vitals", badge: "Watch", description: "Raw GATT service explorer (Heart Rate 0x180D, Battery 0x180F)" },

  // Medical & Daily Care
  { id: "m1", name: "Medicine Alarms", route: "MedicineAlarm", category: "Medical & Daily Care", badge: "No Watch", description: "Pill schedule, dosage alarms & take/snooze reminder alerts" },
  { id: "m2", name: "Medicine History", route: "MedicineHistory", category: "Medical & Daily Care", badge: "No Watch", description: "Full adherence audit log of taken vs missed medicines" },
  { id: "m3", name: "Prescription Hub", route: "PrescriptionManagement", category: "Medical & Daily Care", badge: "No Watch", description: "Camera & gallery upload of doctor prescription records" },
  { id: "m4", name: "Lab Reports Vault", route: "LabReportsHub", category: "Medical & Daily Care", badge: "No Watch", description: "Diagnostic lab tests, blood reports & PDF document storage" },
  { id: "m5", name: "Doctor Advice", route: "DoctorAdvice", category: "Medical & Daily Care", badge: "No Watch", description: "Doctor consultation notes & clinical treatment plans" },
  { id: "m6", name: "Hydration Tracker", route: "HydrationDashboard", category: "Medical & Daily Care", badge: "No Watch", description: "Daily water intake counter with +250ml glass logging" },
  { id: "m7", name: "Breathing Exercises", route: "BreathingExercises", category: "Medical & Daily Care", badge: "No Watch", description: "4-4-4 Box breathing circle animation with haptic guidance" },

  // Auth & Profile
  { id: "a1", name: "Welcome Screen", route: "Welcome", category: "Auth & Profile", badge: "No Watch", description: "Welcome landing page with 1-tap Guest exploration" },
  { id: "a2", name: "Sign In", route: "SignIn", category: "Auth & Profile", badge: "No Watch", description: "Email / mobile sign in with 1-Tap Demo Login" },
  { id: "a3", name: "Create Account", route: "CreateAccount", category: "Auth & Profile", badge: "No Watch", description: "New customer account registration" },
  { id: "a4", name: "Create Profile", route: "CreateProfile", category: "Auth & Profile", badge: "No Watch", description: "User demographic & emergency contact setup" },
  { id: "a5", name: "Profile Screen", route: "Profile", category: "Auth & Profile", badge: "No Watch", description: "Customer account, health documents & membership tier" },
];

export default function SettingsScreen({ navigation }: Props) {
  const { user, signOut } = useAuth();
  const { theme, isDark, setTheme, colors } = useTheme();

  const [settings, setSettings] = useState<AppSettingsState>(DEFAULT_SETTINGS);
  const [clearingCache, setClearingCache] = useState(false);
  const [flowModalVisible, setFlowModalVisible] = useState(false);
  const [flowSearch, setFlowSearch] = useState("");
  const [flowCategory, setFlowCategory] = useState<string>("All");

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const saved = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
      if (saved) {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(saved) });
      }
    } catch (e) {
      console.warn("Failed to load settings", e);
    }
  };

  const updateSetting = async (key: keyof AppSettingsState, value: boolean) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    try {
      await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn("Failed to save setting", e);
    }
  };

  const handleClearCache = async () => {
    Alert.alert(
      "Clear Local Cache",
      "This will clear temporary cached images, health session drafts, and local temp logs. Your account and synced cloud data remain completely safe.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear Cache",
          style: "destructive",
          onPress: async () => {
            setClearingCache(true);
            setTimeout(() => {
              setClearingCache(false);
              Alert.alert("Cache Cleared", "Local cache (14.2 MB) was successfully cleared.");
            }, 800);
          },
        },
      ]
    );
  };

  const handleExportData = () => {
    Alert.alert(
      "Export Health & Account Data",
      "We will prepare your comprehensive health logs, vital history, and shop orders in a secure JSON/PDF bundle.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Export Now",
          onPress: () => {
            Share.share({
              title: "Urban Helpers Health Data Export",
              message: `Urban Helpers Health Data Export for ${user?.email || "User"}\nGenerated on ${new Date().toLocaleDateString()}\nIncludes: Vitals, ECG, Step History, Shop Orders.`,
            });
          },
        },
      ]
    );
  };

  const handleSignOut = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out of Urban Helpers?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            try {
              await signOut();
            } catch (e) {
              Alert.alert("Sign Out Failed", "Unable to sign out. Please check network connection.");
            }
          },
        },
      ]
    );
  };

  const displayName = user?.displayName || user?.email?.split("@")[0] || "Urban Member";
  const userEmail = user?.email || "member@urbanhelpers.com";

  return (
    <View style={[styles.container, { backgroundColor: isDark ? "#0f172a" : "#f8fafc" }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: isDark ? "#1e293b" : "#e2e8f0" }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.backBtn, { backgroundColor: isDark ? "#1e293b" : "#e2e8f0" }]}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="chevron-back" size={22} color={isDark ? "#f8fafc" : "#0f172a"} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDark ? "#f8fafc" : "#0f172a" }]}>Settings</Text>
        <View style={styles.headerRightPlaceholder} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Account Profile Card */}
        <TouchableOpacity
          style={[
            styles.profileCard,
            {
              backgroundColor: isDark ? "#1e293b" : "#ffffff",
              borderColor: isDark ? "#334155" : "#e2e8f0",
            },
          ]}
          onPress={() => navigation.navigate("Profile")}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={["#059669", "#10b981"]}
            style={styles.avatarGradient}
          >
            <Text style={styles.avatarLetter}>
              {displayName.charAt(0).toUpperCase()}
            </Text>
          </LinearGradient>

          <View style={styles.profileDetails}>
            <Text style={[styles.profileName, { color: isDark ? "#f8fafc" : "#0f172a" }]}>
              {displayName}
            </Text>
            <Text style={styles.profileEmail} numberOfLines={1}>
              {userEmail}
            </Text>
            <View style={styles.tierPill}>
              <Ionicons name="shield-checkmark" size={12} color="#059669" />
              <Text style={styles.tierPillText}>Verified Health Member</Text>
            </View>
          </View>

          <Ionicons name="chevron-forward" size={18} color={isDark ? "#64748b" : "#94a3b8"} />
        </TouchableOpacity>

        {/* Section: Appearance & Display */}
        <Text style={styles.sectionHeader}>APPEARANCE & THEME</Text>
        <View
          style={[
            styles.cardSection,
            {
              backgroundColor: isDark ? "#1e293b" : "#ffffff",
              borderColor: isDark ? "#334155" : "#e2e8f0",
            },
          ]}
        >
          <View style={styles.rowItem}>
            <View style={[styles.iconBox, { backgroundColor: "rgba(99, 102, 241, 0.15)" }]}>
              <Ionicons name="moon" size={18} color="#6366f1" />
            </View>
            <View style={styles.rowTextCol}>
              <Text style={[styles.rowTitle, { color: isDark ? "#f8fafc" : "#0f172a" }]}>
                Dark Mode
              </Text>
              <Text style={styles.rowSub}>
                {isDark ? "Comfortable high-contrast dark theme" : "Bright clean light theme"}
              </Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={(val) => setTheme(val ? "dark" : "light")}
              trackColor={{ false: "#cbd5e1", true: "#6366f1" }}
              thumbColor="#ffffff"
            />
          </View>

          <View style={styles.rowDivider} />

          <View style={styles.rowItem}>
            <View style={[styles.iconBox, { backgroundColor: "rgba(16, 185, 129, 0.15)" }]}>
              <MaterialCommunityIcons name="scale-bathroom" size={18} color="#10b981" />
            </View>
            <View style={styles.rowTextCol}>
              <Text style={[styles.rowTitle, { color: isDark ? "#f8fafc" : "#0f172a" }]}>
                Metric Units
              </Text>
              <Text style={styles.rowSub}>Use kilograms (kg) & centimeters (cm)</Text>
            </View>
            <Switch
              value={settings.unitsMetric}
              onValueChange={(val) => updateSetting("unitsMetric", val)}
              trackColor={{ false: "#cbd5e1", true: "#10b981" }}
              thumbColor="#ffffff"
            />
          </View>
        </View>

        {/* Section: Smartwatch & Device Sync */}
        <Text style={styles.sectionHeader}>DEVICES & HARDWARE</Text>
        <View
          style={[
            styles.cardSection,
            {
              backgroundColor: isDark ? "#1e293b" : "#ffffff",
              borderColor: isDark ? "#334155" : "#e2e8f0",
            },
          ]}
        >
          <View style={styles.rowItem}>
            <View style={[styles.iconBox, { backgroundColor: "rgba(14, 165, 233, 0.15)" }]}>
              <Ionicons name="watch" size={18} color="#0ea5e9" />
            </View>
            <View style={styles.rowTextCol}>
              <Text style={[styles.rowTitle, { color: isDark ? "#f8fafc" : "#0f172a" }]}>
                Auto-Sync Smartwatch
              </Text>
              <Text style={styles.rowSub}>Background sync for pulse, ECG & sleep</Text>
            </View>
            <Switch
              value={settings.autoSyncSmartwatch}
              onValueChange={(val) => updateSetting("autoSyncSmartwatch", val)}
              trackColor={{ false: "#cbd5e1", true: "#0ea5e9" }}
              thumbColor="#ffffff"
            />
          </View>

          <View style={styles.rowDivider} />

          <TouchableOpacity
            style={styles.rowItem}
            onPress={() => navigation.navigate("Shop")}
          >
            <View style={[styles.iconBox, { backgroundColor: "rgba(245, 158, 11, 0.15)" }]}>
              <Ionicons name="bag-handle" size={18} color="#f59e0b" />
            </View>
            <View style={styles.rowTextCol}>
              <Text style={[styles.rowTitle, { color: isDark ? "#f8fafc" : "#0f172a" }]}>
                Shop Compatible Devices
              </Text>
              <Text style={styles.rowSub}>Galaxy Watch, BP monitors, smart scales</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={isDark ? "#64748b" : "#94a3b8"} />
          </TouchableOpacity>
        </View>

        {/* Section: Notifications & Alerts */}
        <Text style={styles.sectionHeader}>NOTIFICATIONS & SOUNDS</Text>
        <View
          style={[
            styles.cardSection,
            {
              backgroundColor: isDark ? "#1e293b" : "#ffffff",
              borderColor: isDark ? "#334155" : "#e2e8f0",
            },
          ]}
        >
          <View style={styles.rowItem}>
            <View style={[styles.iconBox, { backgroundColor: "rgba(244, 63, 94, 0.15)" }]}>
              <Ionicons name="notifications" size={18} color="#f43f5e" />
            </View>
            <View style={styles.rowTextCol}>
              <Text style={[styles.rowTitle, { color: isDark ? "#f8fafc" : "#0f172a" }]}>
                Push Notifications
              </Text>
              <Text style={styles.rowSub}>General service & health announcements</Text>
            </View>
            <Switch
              value={settings.pushNotifications}
              onValueChange={(val) => updateSetting("pushNotifications", val)}
              trackColor={{ false: "#cbd5e1", true: "#f43f5e" }}
              thumbColor="#ffffff"
            />
          </View>

          <View style={styles.rowDivider} />

          <View style={styles.rowItem}>
            <View style={[styles.iconBox, { backgroundColor: "rgba(168, 85, 247, 0.15)" }]}>
              <Ionicons name="alarm" size={18} color="#a855f7" />
            </View>
            <View style={styles.rowTextCol}>
              <Text style={[styles.rowTitle, { color: isDark ? "#f8fafc" : "#0f172a" }]}>
                Medication Alarms
              </Text>
              <Text style={styles.rowSub}>Pill reminders & daily dose alerts</Text>
            </View>
            <Switch
              value={settings.medicationAlerts}
              onValueChange={(val) => updateSetting("medicationAlerts", val)}
              trackColor={{ false: "#cbd5e1", true: "#a855f7" }}
              thumbColor="#ffffff"
            />
          </View>

          <View style={styles.rowDivider} />

          <View style={styles.rowItem}>
            <View style={[styles.iconBox, { backgroundColor: "rgba(234, 88, 12, 0.15)" }]}>
              <Ionicons name="volume-high" size={18} color="#ea580c" />
            </View>
            <View style={styles.rowTextCol}>
              <Text style={[styles.rowTitle, { color: isDark ? "#f8fafc" : "#0f172a" }]}>
                Sound & Haptics
              </Text>
              <Text style={styles.rowSub}>Vibrate on completions & clicks</Text>
            </View>
            <Switch
              value={settings.soundEffects}
              onValueChange={(val) => updateSetting("soundEffects", val)}
              trackColor={{ false: "#cbd5e1", true: "#ea580c" }}
              thumbColor="#ffffff"
            />
          </View>
        </View>

        {/* Section: Data & Storage */}
        <Text style={styles.sectionHeader}>DATA & PRIVACY</Text>
        <View
          style={[
            styles.cardSection,
            {
              backgroundColor: isDark ? "#1e293b" : "#ffffff",
              borderColor: isDark ? "#334155" : "#e2e8f0",
            },
          ]}
        >
          <TouchableOpacity style={styles.rowItem} onPress={handleExportData}>
            <View style={[styles.iconBox, { backgroundColor: "rgba(5, 150, 105, 0.15)" }]}>
              <Ionicons name="download-outline" size={18} color="#059669" />
            </View>
            <View style={styles.rowTextCol}>
              <Text style={[styles.rowTitle, { color: isDark ? "#f8fafc" : "#0f172a" }]}>
                Export Health Data
              </Text>
              <Text style={styles.rowSub}>Download full medical and vitals history</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={isDark ? "#64748b" : "#94a3b8"} />
          </TouchableOpacity>

          <View style={styles.rowDivider} />

          <TouchableOpacity
            style={styles.rowItem}
            onPress={handleClearCache}
            disabled={clearingCache}
          >
            <View style={[styles.iconBox, { backgroundColor: "rgba(239, 68, 68, 0.15)" }]}>
              <Ionicons name="trash-outline" size={18} color="#ef4444" />
            </View>
            <View style={styles.rowTextCol}>
              <Text style={[styles.rowTitle, { color: isDark ? "#f8fafc" : "#0f172a" }]}>
                {clearingCache ? "Clearing Cache..." : "Clear Local Cache"}
              </Text>
              <Text style={styles.rowSub}>Free up disk space (14.2 MB)</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={isDark ? "#64748b" : "#94a3b8"} />
          </TouchableOpacity>
        </View>

        {/* Section: About & Support */}
        <Text style={styles.sectionHeader}>SUPPORT & ABOUT</Text>
        <View
          style={[
            styles.cardSection,
            {
              backgroundColor: isDark ? "#1e293b" : "#ffffff",
              borderColor: isDark ? "#334155" : "#e2e8f0",
            },
          ]}
        >
          <TouchableOpacity
            style={styles.rowItem}
            onPress={() => Linking.openURL("mailto:support@urbanhelpers.com?subject=Urban%20Helpers%20Support")}
          >
            <View style={[styles.iconBox, { backgroundColor: "rgba(59, 130, 246, 0.15)" }]}>
              <Ionicons name="headset" size={18} color="#3b82f6" />
            </View>
            <View style={styles.rowTextCol}>
              <Text style={[styles.rowTitle, { color: isDark ? "#f8fafc" : "#0f172a" }]}>
                Customer Support & Help
              </Text>
              <Text style={styles.rowSub}>support@urbanhelpers.com</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={isDark ? "#64748b" : "#94a3b8"} />
          </TouchableOpacity>

          <View style={styles.rowDivider} />

          <View style={styles.rowItem}>
            <View style={[styles.iconBox, { backgroundColor: "rgba(100, 116, 139, 0.15)" }]}>
              <Ionicons name="information-circle" size={18} color="#64748b" />
            </View>
            <View style={styles.rowTextCol}>
              <Text style={[styles.rowTitle, { color: isDark ? "#f8fafc" : "#0f172a" }]}>
                App Version
              </Text>
              <Text style={styles.rowSub}>v2.4.0 (Build 112) • Production</Text>
            </View>
            <Text style={styles.versionBadge}>LATEST</Text>
          </View>
        </View>

        {/* Section: Developer & Flow Audit */}
        <Text style={styles.sectionHeader}>DEVELOPER & FLOW AUDIT</Text>
        <View
          style={[
            styles.cardSection,
            {
              backgroundColor: isDark ? "#1e293b" : "#ffffff",
              borderColor: isDark ? "#334155" : "#e2e8f0",
            },
          ]}
        >
          <TouchableOpacity
            style={styles.rowItem}
            onPress={() => setFlowModalVisible(true)}
            activeOpacity={0.7}
          >
            <View style={[styles.iconBox, { backgroundColor: "rgba(16, 185, 129, 0.15)" }]}>
              <Ionicons name="compass" size={18} color="#10b981" />
            </View>
            <View style={styles.rowTextCol}>
              <Text style={[styles.rowTitle, { color: isDark ? "#f8fafc" : "#0f172a" }]}>
                Screen Directory & Flow Explorer
              </Text>
              <Text style={styles.rowSub}>Search & 1-tap test any screen (85 screens)</Text>
            </View>
            <View style={styles.auditBadge}>
              <Text style={styles.auditBadgeText}>AUDIT</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={isDark ? "#64748b" : "#94a3b8"} />
          </TouchableOpacity>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity
          style={[
            styles.signOutBtn,
            {
              backgroundColor: isDark ? "rgba(239, 68, 68, 0.12)" : "#fee2e2",
              borderColor: isDark ? "rgba(239, 68, 68, 0.3)" : "#fca5a5",
            },
          ]}
          onPress={handleSignOut}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={20} color="#ef4444" />
          <Text style={styles.signOutBtnText}>Sign Out of Account</Text>
        </TouchableOpacity>

        <View style={styles.footerSpacing} />
      </ScrollView>

      {/* Interactive Screen Directory & Flow Audit Modal */}
      <Modal
        visible={flowModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setFlowModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDark ? "#0f172a" : "#ffffff" }]}>
            {/* Modal Header */}
            <View style={[styles.modalHeader, { borderBottomColor: isDark ? "#334155" : "#e2e8f0" }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.modalTitle, { color: isDark ? "#f8fafc" : "#0f172a" }]}>
                  Screen Directory & Flow Audit
                </Text>
                <Text style={[styles.modalSub, { color: isDark ? "#94a3b8" : "#64748b" }]}>
                  85 Screens • 0 Errors • 1-Tap Instant Preview
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setFlowModalVisible(false)}
                style={[styles.closeModalBtn, { backgroundColor: isDark ? "#1e293b" : "#f1f5f9" }]}
              >
                <Ionicons name="close" size={20} color={isDark ? "#f8fafc" : "#0f172a"} />
              </TouchableOpacity>
            </View>

            {/* Search Input */}
            <View style={[styles.searchBox, { backgroundColor: isDark ? "#1e293b" : "#f8fafc", borderColor: isDark ? "#334155" : "#e2e8f0" }]}>
              <Ionicons name="search" size={18} color="#64748b" style={{ marginRight: 8 }} />
              <TextInput
                style={[styles.searchInput, { color: isDark ? "#f8fafc" : "#0f172a" }]}
                placeholder="Search screen, route name, or description..."
                placeholderTextColor="#94a3b8"
                value={flowSearch}
                onChangeText={setFlowSearch}
              />
              {flowSearch.length > 0 && (
                <TouchableOpacity onPress={() => setFlowSearch("")}>
                  <Ionicons name="close-circle" size={18} color="#94a3b8" />
                </TouchableOpacity>
              )}
            </View>

            {/* Category Filter Pills */}
            <View style={{ maxHeight: 44, marginVertical: 8 }}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.flowCatsRow}>
                {["All", "Shop & Buying", "Home Services", "Smartwatch & Vitals", "Medical & Daily Care", "Auth & Profile"].map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setFlowCategory(cat)}
                    style={[
                      styles.flowCatChip,
                      {
                        backgroundColor: flowCategory === cat ? "#059669" : (isDark ? "#1e293b" : "#f1f5f9"),
                        borderColor: flowCategory === cat ? "#059669" : (isDark ? "#334155" : "#e2e8f0"),
                      },
                    ]}
                  >
                    <Text style={[styles.flowCatText, { color: flowCategory === cat ? "#ffffff" : (isDark ? "#94a3b8" : "#64748b") }]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Screen List */}
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.screenListContent}>
              {FLOW_SCREENS.filter((s) => {
                const matchCat = flowCategory === "All" || s.category === flowCategory;
                const matchQuery =
                  s.name.toLowerCase().includes(flowSearch.toLowerCase()) ||
                  s.description.toLowerCase().includes(flowSearch.toLowerCase()) ||
                  s.route.toLowerCase().includes(flowSearch.toLowerCase());
                return matchCat && matchQuery;
              }).map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.screenCard, { backgroundColor: isDark ? "#1e293b" : "#f8fafc", borderColor: isDark ? "#334155" : "#e2e8f0" }]}
                  onPress={() => {
                    setFlowModalVisible(false);
                    if (item.params) {
                      (navigation as any).navigate(item.route, item.params);
                    } else {
                      (navigation as any).navigate(item.route);
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <View style={{ flex: 1, marginRight: 10 }}>
                    <View style={styles.screenCardHeader}>
                      <Text style={[styles.screenName, { color: isDark ? "#f8fafc" : "#0f172a" }]}>
                        {item.name}
                      </Text>
                      <View style={[styles.badgePill, { backgroundColor: item.badge === "Watch" ? "#FEF3C7" : "#DCFCE7" }]}>
                        <Ionicons
                          name={item.badge === "Watch" ? "watch-outline" : "phone-portrait-outline"}
                          size={11}
                          color={item.badge === "Watch" ? "#B45309" : "#15803D"}
                          style={{ marginRight: 3 }}
                        />
                        <Text style={[styles.badgeText, { color: item.badge === "Watch" ? "#B45309" : "#15803D" }]}>
                          {item.badge}
                        </Text>
                      </View>
                    </View>
                    <Text style={[styles.screenRoute, { color: isDark ? "#38bdf8" : "#0284c7" }]}>
                      Route: {item.route}
                    </Text>
                    <Text style={[styles.screenDesc, { color: isDark ? "#94a3b8" : "#64748b" }]} numberOfLines={2}>
                      {item.description}
                    </Text>
                  </View>
                  <View style={styles.launchBtn}>
                    <Text style={styles.launchBtnText}>Open</Text>
                    <Ionicons name="arrow-forward" size={13} color="#ffffff" style={{ marginLeft: 2 }} />
                  </View>
                </TouchableOpacity>
              ))}
              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  headerRightPlaceholder: {
    width: 38,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarLetter: {
    fontSize: 20,
    fontWeight: "800",
    color: "#ffffff",
  },
  profileDetails: {
    flex: 1,
    marginLeft: 14,
  },
  profileName: {
    fontSize: 16,
    fontWeight: "700",
  },
  profileEmail: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 1,
  },
  tierPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  tierPillText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#059669",
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748b",
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
  },
  cardSection: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  rowItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  rowTextCol: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  rowSub: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },
  rowDivider: {
    height: 1,
    backgroundColor: "rgba(100, 116, 139, 0.12)",
    marginLeft: 62,
  },
  versionBadge: {
    fontSize: 10,
    fontWeight: "800",
    color: "#059669",
    backgroundColor: "rgba(16, 185, 129, 0.12)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    letterSpacing: 0.5,
  },
  signOutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 10,
  },
  signOutBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#ef4444",
  },
  footerSpacing: {
    height: 30,
  },
  auditBadge: {
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: 6,
  },
  auditBadgeText: {
    color: "#059669",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "flex-end",
  },
  modalContent: {
    height: "88%",
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
  },
  modalSub: {
    fontSize: 12,
    marginTop: 2,
  },
  closeModalBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 44,
    marginTop: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
  },
  flowCatsRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    paddingVertical: 2,
  },
  flowCatChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  flowCatText: {
    fontSize: 12,
    fontWeight: "700",
  },
  screenListContent: {
    paddingTop: 8,
    gap: 10,
  },
  screenCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
  },
  screenCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 2,
  },
  screenName: {
    fontSize: 15,
    fontWeight: "800",
  },
  badgePill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "800",
  },
  screenRoute: {
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 4,
  },
  screenDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
  launchBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#059669",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  launchBtnText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "800",
  },
});
