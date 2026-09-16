import React, { useState, useEffect } from "react";
import { ScrollView, Text, View, Pressable, StyleSheet, ActivityIndicator, Alert, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/types";
import { colors } from "@/theme/colors";

type Props = NativeStackScreenProps<RootStackParamList, "MedicalRecords">;

const QUICK_ACCESS = [
  { icon: "analytics", label: "Health Data", route: "HealthDataAnalytics", color: "#3b82f6" },
  { icon: "flask", label: "Lab Reports", route: "LabReportsHub", color: "#ef4444" },
  { icon: "medical", label: "Doctor Advice", route: "DoctorAdvice", color: "#10b981" },
  { icon: "water", label: "Blood Test", route: "BloodTestReports", color: "#dc2626" },
  { icon: "receipt", label: "Prescription", route: "PrescriptionManagement", color: "#8b5cf6" },
  { icon: "shield-checkmark", label: "Vaccination", route: "VaccinationCenter", color: "#0ea5e9" },
];

export default function MedicalRecordsScreen({ navigation }: Props) {
  const [loading, setLoading] = useState(true);
  const [heightRaw, setHeightRaw] = useState<string | null>(null);
  const [weightRaw, setWeightRaw] = useState<string | null>(null);
  
  useEffect(() => {
    async function loadProfile() {
      try {
        const raw = await AsyncStorage.getItem("@urban_health_user_profile_v2");
        if (raw) {
          const parsed = JSON.parse(raw);
          setHeightRaw(parsed.height);
          setWeightRaw(parsed.weight);
        }
      } catch (e) {
        console.error("Error loading profile", e);
      }
      setLoading(false);
    }
    loadProfile();
  }, []);

  // Calculate BMI if height and weight exist and are valid formats like "178 cm", "70 kg"
  let bmiValue = "Not Set";
  let bmiStatus = "";
  if (heightRaw && weightRaw) {
    const hNum = parseFloat(heightRaw.replace(/[^0-9.]/g, ""));
    const wNum = parseFloat(weightRaw.replace(/[^0-9.]/g, ""));
    if (!isNaN(hNum) && !isNaN(wNum) && hNum > 0) {
      const hMeters = hNum / 100;
      const bmi = wNum / (hMeters * hMeters);
      let status = "Normal";
      if (bmi < 18.5) status = "Underweight";
      else if (bmi >= 25 && bmi < 30) status = "Overweight";
      else if (bmi >= 30) status = "Obese";
      bmiValue = `${bmi.toFixed(1)} ${status}`;
      bmiStatus = status;
    }
  }

  const handleUpload = () => {
    Alert.alert("Upload Report", "Upload functionality will be implemented soon.");
  };

  const handleSearch = () => {
    Alert.alert("Search", "Search functionality will be available when records are synced.");
  };

  return (
    <View style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} style={s.iconBtn}>
          <Ionicons name="arrow-back" size={22} color="#ffffff" />
        </Pressable>
        <Text style={s.pageTitle}>Health Records</Text>
        <Pressable onPress={handleSearch} style={s.iconBtn}>
          <Ionicons name="search" size={20} color="#ffffff" />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        
        {/* HERO CARD */}
        <LinearGradient 
          colors={["#0c2a47", "#1e1b4b"]} 
          start={{ x: 0, y: 0 }} 
          end={{ x: 1, y: 1 }} 
          style={s.hero}
        >
          <View style={s.heroContent}>
            <Text style={s.heroTitle}>Your Complete{"\n"}Medical History</Text>
            <Text style={s.heroSub}>Securely store all your reports and prescriptions.</Text>
            
            <Pressable style={s.heroBtn} onPress={handleUpload}>
              <Ionicons name="cloud-upload" size={18} color="#ffffff" />
              <Text style={s.heroBtnText}>Upload Report</Text>
            </Pressable>
          </View>
          <View style={s.heroDecor}>
            <Ionicons name="folder-open" size={90} color="rgba(56,189,248,0.15)" />
          </View>
        </LinearGradient>

        {/* QUICK ACCESS GRID */}
        <Text style={s.sectionTitle}>Quick Access</Text>
        <View style={s.quickGrid}>
          {QUICK_ACCESS.map((q) => (
            <Pressable
              key={q.label}
              onPress={() => navigation.navigate(q.route as any)}
              style={({ pressed }) => [
                s.quickCard, 
                { opacity: pressed ? 0.8 : 1 }
              ]}
            >
              <View style={[s.quickIconWrap, { backgroundColor: `${q.color}15` }]}>
                <Ionicons name={q.icon as any} size={28} color={q.color} />
              </View>
              <Text style={s.quickLabel}>{q.label}</Text>
            </Pressable>
          ))}
        </View>

        {/* HEALTH SUMMARY */}
        <Text style={s.sectionTitle}>Health Summary</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#3b82f6" style={{ marginVertical: 20 }} />
        ) : (
          <View style={s.summaryGrid}>
            <View style={s.summaryCard}>
              <View style={[s.summaryIconWrap, { backgroundColor: "rgba(239,68,68,0.15)" }]}>
                <Ionicons name="heart" size={20} color="#ef4444" />
              </View>
              <Text style={s.summaryLabel}>Blood Group</Text>
              <Text style={[s.summaryValue, { color: "#94a3b8", fontSize: 16 }]}>Not Set</Text>
            </View>

            <View style={s.summaryCard}>
              <View style={[s.summaryIconWrap, { backgroundColor: "rgba(245,158,11,0.15)" }]}>
                <Ionicons name="barbell" size={20} color="#f59e0b" />
              </View>
              <Text style={s.summaryLabel}>BMI</Text>
              <Text style={s.summaryValue}>{bmiValue}</Text>
            </View>

            <View style={s.summaryCard}>
              <View style={[s.summaryIconWrap, { backgroundColor: "rgba(16,185,129,0.15)" }]}>
                <Ionicons name="resize" size={20} color="#10b981" />
              </View>
              <Text style={s.summaryLabel}>Height</Text>
              <Text style={s.summaryValue}>{heightRaw || "Not Set"}</Text>
            </View>

            <View style={s.summaryCard}>
              <View style={[s.summaryIconWrap, { backgroundColor: "rgba(59,130,246,0.15)" }]}>
                <Ionicons name="speedometer" size={20} color="#3b82f6" />
              </View>
              <Text style={s.summaryLabel}>Weight</Text>
              <Text style={s.summaryValue}>{weightRaw || "Not Set"}</Text>
            </View>
          </View>
        )}

        {/* RECENT RECORDS (EMPTY STATE) */}
        <Text style={s.sectionTitle}>Recent Records</Text>
        <View style={s.emptyState}>
          <View style={s.emptyStateIcon}>
            <Ionicons name="document-text-outline" size={48} color="#475569" />
          </View>
          <Text style={s.emptyStateTitle}>No health records yet</Text>
          <Text style={s.emptyStateSub}>
            Upload your first report to keep your medical history organized and accessible.
          </Text>
          <Pressable style={s.emptyStateBtn} onPress={handleUpload}>
            <Text style={s.emptyStateBtnText}>Upload Now</Text>
          </Pressable>
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#020813" },
  header: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
    paddingHorizontal: 16, 
    paddingTop: 56, 
    paddingBottom: 20 
  },
  iconBtn: { 
    width: 44, height: 44, 
    borderRadius: 22, 
    backgroundColor: "rgba(255,255,255,0.05)", 
    justifyContent: "center", alignItems: "center", 
    borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" 
  },
  pageTitle: { fontSize: 18, fontWeight: "700", color: "#f8fafc", letterSpacing: 0.3 },
  scroll: { paddingHorizontal: 16 },
  
  // Hero
  hero: { 
    borderRadius: 28, 
    padding: 24, 
    marginBottom: 28, 
    minHeight: 220, 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
    borderWidth: 1, 
    borderColor: "rgba(59,130,246,0.2)",
    overflow: "hidden"
  },
  heroContent: { flex: 1, zIndex: 2 },
  heroTitle: { fontSize: 26, fontWeight: "800", color: "#ffffff", marginBottom: 12, lineHeight: 32, letterSpacing: -0.5 },
  heroSub: { fontSize: 14, color: "#94a3b8", marginBottom: 24, lineHeight: 20, fontWeight: "500", maxWidth: "90%" },
  heroBtn: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 8, 
    backgroundColor: "#3b82f6", 
    paddingHorizontal: 20, 
    paddingVertical: 14, 
    borderRadius: 20, 
    alignSelf: "flex-start" 
  },
  heroBtnText: { color: "#ffffff", fontSize: 14, fontWeight: "700", letterSpacing: 0.3 },
  heroDecor: { 
    position: "absolute",
    right: -10,
    bottom: -10,
    opacity: 0.8,
    transform: [{ rotate: "-15deg" }]
  },

  // Typography
  sectionTitle: { fontSize: 20, fontWeight: "700", color: "#f8fafc", marginBottom: 16, letterSpacing: 0.2 },
  
  // Quick Access
  quickGrid: { 
    flexDirection: "row", 
    flexWrap: "wrap", 
    justifyContent: "space-between", 
    gap: 12,
    marginBottom: 32 
  },
  quickCard: { 
    width: "48%", 
    backgroundColor: "rgba(15,23,42,0.6)", 
    borderRadius: 24, 
    padding: 20, 
    alignItems: "center", 
    justifyContent: "center",
    gap: 12, 
    borderWidth: 1, 
    borderColor: "rgba(255,255,255,0.06)",
    minHeight: 120
  },
  quickIconWrap: { 
    width: 56, height: 56, 
    borderRadius: 28, 
    justifyContent: "center", alignItems: "center" 
  },
  quickLabel: { fontSize: 14, color: "#e2e8f0", fontWeight: "700", textAlign: "center" },

  // Summary Grid
  summaryGrid: { 
    flexDirection: "row", 
    flexWrap: "wrap", 
    justifyContent: "space-between", 
    gap: 12,
    marginBottom: 32
  },
  summaryCard: { 
    width: "48%", 
    backgroundColor: "rgba(15,23,42,0.6)", 
    borderRadius: 24, 
    padding: 20, 
    borderWidth: 1, 
    borderColor: "rgba(255,255,255,0.06)",
    justifyContent: "center"
  },
  summaryIconWrap: {
    width: 44, height: 44,
    borderRadius: 22,
    justifyContent: "center", alignItems: "center",
    marginBottom: 12
  },
  summaryLabel: { fontSize: 13, color: "#94a3b8", fontWeight: "600", marginBottom: 6 },
  summaryValue: { fontSize: 18, fontWeight: "800", color: "#ffffff", letterSpacing: -0.3 },

  // Empty State
  emptyState: {
    backgroundColor: "rgba(15,23,42,0.6)",
    borderRadius: 28,
    padding: 32,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    borderStyle: "dashed"
  },
  emptyStateIcon: {
    width: 80, height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.05)",
    justifyContent: "center", alignItems: "center",
    marginBottom: 20
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#e2e8f0",
    marginBottom: 10
  },
  emptyStateSub: {
    fontSize: 14,
    color: "#94a3b8",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24
  },
  emptyStateBtn: {
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)"
  },
  emptyStateBtnText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 14
  }
});
