import React, { useState } from "react";
import {
  ScrollView,
  Text,
  View,
  Pressable,
  StyleSheet,
  StatusBar,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/types";
import SamsungBottomNav from "@/components/SamsungBottomNav";

type Props = NativeStackScreenProps<RootStackParamList, "NearbyUpdates">;

type UpdateCategory = "All" | "Environmental" | "Regional Outbreak" | "Govt Bulletins" | "Food Safety";

interface HealthAlert {
  id: string;
  category: UpdateCategory;
  title: string;
  source: string;
  timeAgo: string;
  severity: "urgent" | "warning" | "info" | "good";
  summary: string;
  recommendations: string[];
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  color: string;
}

const ALERTS: HealthAlert[] = [
  {
    id: "env-1",
    category: "Environmental",
    title: "Air Quality Index (AQI): 74 - Moderate",
    source: "Central Pollution Control Board",
    timeAgo: "15m ago",
    severity: "warning",
    summary:
      "PM2.5 levels are slightly elevated. Sensitive individuals with respiratory conditions should consider limiting intense outdoor cardio during peak afternoon traffic.",
    recommendations: [
      "Wear N95 mask in heavy traffic zones",
      "Keep indoor windows closed during 12 PM - 4 PM",
      "Indoor air purifier recommended for asthmatic members",
    ],
    icon: "weather-fog",
    color: "#f59e0b",
  },
  {
    id: "env-2",
    category: "Environmental",
    title: "UV Index Alert: 8 (Very High Exposure)",
    source: "National Meteorological Dept",
    timeAgo: "1h ago",
    severity: "warning",
    summary:
      "Peak solar ultraviolet radiation expected between 11:00 AM and 03:30 PM. Skin damage can occur within 15-20 minutes of unprotected direct sun exposure.",
    recommendations: [
      "Apply broad-spectrum SPF 30+ sunscreen",
      "Wear UV-blocking sunglasses & wide-brim hat",
      "Hydrate every 45 minutes when outdoors",
    ],
    icon: "weather-sunny-alert",
    color: "#f97316",
  },
  {
    id: "reg-1",
    category: "Regional Outbreak",
    title: "Seasonal Viral & Flu Watch in Your District",
    source: "Regional Directorate of Health",
    timeAgo: "3h ago",
    severity: "urgent",
    summary:
      "A 14% increase in acute upper respiratory infections reported across local clinics. Frequent hand hygiene and warm hydration advised.",
    recommendations: [
      "Wash hands thoroughly after public transport",
      "Avoid crowded enclosed indoor spaces if experiencing mild fever",
      "Log body temperature in Vitals Screen if chills persist",
    ],
    icon: "virus",
    color: "#ef4444",
  },
  {
    id: "gov-1",
    category: "Govt Bulletins",
    title: "Free Adult & Child Immunization Camp This Weekend",
    source: "Ministry of Health & Family Welfare",
    timeAgo: "6h ago",
    severity: "info",
    summary:
      "Primary Health Centers (PHCs) are conducting booster vaccination and preventive health screening camps open to all citizens.",
    recommendations: [
      "Bring Aadhaar or ID for fast check-in",
      "Free blood pressure & random blood sugar screening included",
    ],
    icon: "shield-plus",
    color: "#3b82f6",
  },
  {
    id: "food-1",
    category: "Food Safety",
    title: "Food Safety Advisory: Summer Hydration & Safe Water",
    source: "FSSAI & Public Health Council",
    timeAgo: "1d ago",
    severity: "good",
    summary:
      "Consume boiled or RO-purified water. Ensure street food stalls use certified drinking ice during warm weather to prevent gastroenteritis.",
    recommendations: [
      "Prefer tender coconut and home-brewed buttermilk",
      "Avoid cut fruits exposed in open stalls",
      "Maintain 2.5L to 3L daily water intake",
    ],
    icon: "food-apple",
    color: "#10b981",
  },
];

export default function NearbyUpdatesScreen({ navigation }: Props) {
  const [selectedCat, setSelectedCat] = useState<UpdateCategory>("All");
  const [expandedId, setExpandedId] = useState<string | null>("env-1");

  const filteredAlerts = ALERTS.filter(
    (a) => selectedCat === "All" || a.category === selectedCat
  );

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0c0e12" />

      {/* Header */}
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} style={s.iconBtn}>
          <Ionicons name="arrow-back" size={22} color="#ffffff" />
        </Pressable>
        <View style={{ flex: 1, marginLeft: 14 }}>
          <Text style={s.headerSubtitle}>REGIONAL HEALTH RADAR</Text>
          <Text style={s.headerTitle}>Nearby Updates</Text>
        </View>
        <View style={s.liveBadge}>
          <View style={s.liveDot} />
          <Text style={s.liveText}>LIVE</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {/* Location Banner */}
        <View style={s.locationBanner}>
          <Ionicons name="location-sharp" size={16} color="#60a5fa" />
          <Text style={s.locationText}>Auto-detected: Regional District & Metro Health Zone</Text>
        </View>

        {/* Top 2 Environmental Meters */}
        <View style={s.meterRow}>
          {/* AQI Meter */}
          <LinearGradient
            colors={["#1c2638", "#121b2b"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={s.meterCard}
          >
            <View style={s.meterTop}>
              <Text style={s.meterTitle}>AIR QUALITY (AQI)</Text>
              <MaterialCommunityIcons name="weather-fog" size={20} color="#f59e0b" />
            </View>
            <Text style={[s.meterVal, { color: "#f59e0b" }]}>74</Text>
            <View style={s.meterStatusRow}>
              <View style={[s.statusDot, { backgroundColor: "#f59e0b" }]} />
              <Text style={s.meterStatus}>Moderate</Text>
            </View>
            <Text style={s.meterHint}>PM2.5: 22.4 µg/m³</Text>
          </LinearGradient>

          {/* UV Index Meter */}
          <LinearGradient
            colors={["#2b1828", "#180d17"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={s.meterCard}
          >
            <View style={s.meterTop}>
              <Text style={s.meterTitle}>UV INDEX</Text>
              <MaterialCommunityIcons name="weather-sunny" size={20} color="#f97316" />
            </View>
            <Text style={[s.meterVal, { color: "#f97316" }]}>8.0</Text>
            <View style={s.meterStatusRow}>
              <View style={[s.statusDot, { backgroundColor: "#f97316" }]} />
              <Text style={s.meterStatus}>Very High</Text>
            </View>
            <Text style={s.meterHint}>SPF 30+ required</Text>
          </LinearGradient>
        </View>

        {/* Category Horizontal Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.catScroll}
        >
          {(["All", "Environmental", "Regional Outbreak", "Govt Bulletins", "Food Safety"] as UpdateCategory[]).map(
            (c) => {
              const isSelected = selectedCat === c;
              return (
                <Pressable
                  key={c}
                  onPress={() => setSelectedCat(c)}
                  style={[s.catChip, isSelected && s.catChipActive]}
                >
                  <Text style={[s.catChipText, isSelected && s.catChipTextActive]}>{c}</Text>
                </Pressable>
              );
            }
          )}
        </ScrollView>

        {/* Feed List */}
        <View style={s.feedList}>
          {filteredAlerts.map((alert) => {
            const isExpanded = expandedId === alert.id;
            return (
              <Pressable
                key={alert.id}
                onPress={() => setExpandedId(isExpanded ? null : alert.id)}
                style={s.alertCard}
              >
                <View style={s.alertHeader}>
                  <View style={[s.alertIconWrap, { backgroundColor: `${alert.color}22` }]}>
                    <MaterialCommunityIcons name={alert.icon} size={24} color={alert.color} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                      <Text style={[s.alertCat, { color: alert.color }]}>{alert.category}</Text>
                      <Text style={s.alertTime}>{alert.timeAgo}</Text>
                    </View>
                    <Text style={s.alertTitle}>{alert.title}</Text>
                  </View>
                  <Ionicons
                    name={isExpanded ? "chevron-up" : "chevron-down"}
                    size={20}
                    color="rgba(255,255,255,0.4)"
                  />
                </View>

                <Text style={s.alertSummary}>{alert.summary}</Text>

                {/* Expanded Recommendations */}
                {isExpanded && (
                  <View style={s.recBox}>
                    <Text style={s.recHeader}>RECOMMENDED SAFETY MEASURES:</Text>
                    {alert.recommendations.map((rec, i) => (
                      <View key={i} style={s.recRow}>
                        <Ionicons name="checkmark-circle" size={14} color="#10b981" />
                        <Text style={s.recText}>{rec}</Text>
                      </View>
                    ))}
                    <Text style={s.sourceFooter}>Verified Source: {alert.source}</Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Nav */}
      <SamsungBottomNav />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0c0e12" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 52,
    paddingBottom: 14,
  },
  headerSubtitle: {
    fontSize: 10,
    fontWeight: "700",
    color: "rgba(255,255,255,0.5)",
    letterSpacing: 0.8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#ffffff",
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.08)",
    justifyContent: "center",
    alignItems: "center",
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#ef4444",
  },
  liveText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#ef4444",
    letterSpacing: 0.5,
  },
  scroll: { paddingHorizontal: 16 },

  locationBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(96, 165, 250, 0.1)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(96, 165, 250, 0.2)",
  },
  locationText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#93c5fd",
  },

  // Meters
  meterRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  meterCard: {
    flex: 1,
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  meterTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  meterTitle: {
    fontSize: 10,
    fontWeight: "700",
    color: "rgba(255,255,255,0.6)",
    letterSpacing: 0.5,
  },
  meterVal: {
    fontSize: 32,
    fontWeight: "900",
    lineHeight: 38,
  },
  meterStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginVertical: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  meterStatus: {
    fontSize: 12,
    fontWeight: "700",
    color: "#ffffff",
  },
  meterHint: {
    fontSize: 10,
    color: "rgba(255,255,255,0.45)",
    marginTop: 2,
  },

  // Category
  catScroll: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  catChip: {
    backgroundColor: "#1c2128",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  catChipActive: {
    backgroundColor: "#2563eb",
    borderColor: "#60a5fa",
  },
  catChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(255,255,255,0.6)",
  },
  catChipTextActive: {
    color: "#ffffff",
    fontWeight: "700",
  },

  // Feed
  feedList: {
    gap: 12,
  },
  alertCard: {
    backgroundColor: "#181c24",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  alertHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  alertIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  alertCat: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  alertTime: {
    fontSize: 11,
    color: "rgba(255,255,255,0.4)",
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
    marginTop: 2,
  },
  alertSummary: {
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
    lineHeight: 17,
    marginTop: 10,
  },

  // Rec box
  recBox: {
    backgroundColor: "rgba(0,0,0,0.25)",
    borderRadius: 14,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  recHeader: {
    fontSize: 10,
    fontWeight: "700",
    color: "rgba(255,255,255,0.5)",
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  recRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 6,
  },
  recText: {
    flex: 1,
    fontSize: 11,
    color: "rgba(255,255,255,0.85)",
    lineHeight: 15,
  },
  sourceFooter: {
    fontSize: 10,
    color: "rgba(255,255,255,0.35)",
    fontStyle: "italic",
    marginTop: 6,
  },
});
