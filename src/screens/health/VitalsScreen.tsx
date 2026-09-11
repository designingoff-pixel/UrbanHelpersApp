import React, { useState } from "react";
import {
  ScrollView,
  Text,
  View,
  Pressable,
  StyleSheet,
  Dimensions,
  StatusBar,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import Animated, { FadeInDown } from "react-native-reanimated";
import { RootStackParamList } from "@/navigation/types";
import SamsungBottomNav from "@/components/SamsungBottomNav";

type Props = NativeStackScreenProps<RootStackParamList, "VitalsScreen">;

const { width: SW } = Dimensions.get("window");

interface VitalGauge {
  id: string;
  name: string;
  value: string;
  unit: string;
  fillPercentage: number; // 0 to 100
  color: string;
  trackColor: string;
  icon: keyof typeof Ionicons.glyphMap;
  route?: keyof RootStackParamList;
  status: string;
}

export default function VitalsScreen({ navigation }: Props) {
  const [selectedDayOffset, setSelectedDayOffset] = useState(0);

  const dayLabel =
    selectedDayOffset === 0
      ? "Today"
      : selectedDayOffset === -1
      ? "Yesterday"
      : `${Math.abs(selectedDayOffset)} days ago`;

  // 5 Vital Gauges matching Screenshot 6
  const gauges: VitalGauge[] = [
    {
      id: "hr",
      name: "Heart Rate",
      value: "72",
      unit: "bpm",
      fillPercentage: 65,
      color: "#f43f5e",
      trackColor: "rgba(244,63,94,0.15)",
      icon: "heart",
      route: "HeartRate",
      status: "Resting: 64 bpm",
    },
    {
      id: "ecg",
      name: "Pulse & ECG",
      value: "Normal",
      unit: "",
      fillPercentage: 80,
      color: "#38bdf8",
      trackColor: "rgba(56,189,248,0.15)",
      icon: "pulse",
      route: "HeartHealth",
      status: "Sinus rhythm",
    },
    {
      id: "resp",
      name: "Breathing",
      value: "16",
      unit: "rpm",
      fillPercentage: 55,
      color: "#a855f7",
      trackColor: "rgba(168,85,247,0.15)",
      icon: "fitness",
      status: "14 - 18 rpm",
    },
    {
      id: "temp",
      name: "Skin Temp",
      value: "34.2",
      unit: "°C",
      fillPercentage: 70,
      color: "#22c55e",
      trackColor: "rgba(34,197,94,0.15)",
      icon: "thermometer",
      status: "Within baseline",
    },
    {
      id: "spo2",
      name: "Blood Oxygen",
      value: "98",
      unit: "%",
      fillPercentage: 92,
      color: "#06b6d4",
      trackColor: "rgba(6,182,212,0.15)",
      icon: "water",
      route: "BloodOxygen",
      status: "Lowest: 94%",
    },
  ];

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      {/* Header */}
      <View style={s.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={s.headerBtn}
          accessibilityLabel="Back"
        >
          <Ionicons name="chevron-back" size={26} color="#ffffff" />
        </Pressable>
        <Text style={s.headerTitle}>Vitals</Text>
        <Pressable
          onPress={() => Alert.alert("Options", "Vitals settings and sensor calibration")}
          style={s.headerBtn}
          accessibilityLabel="Options"
        >
          <Ionicons name="ellipsis-vertical" size={20} color="#ffffff" />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Date Navigator: < [ Today ] > */}
        <View style={s.dateNavWrap}>
          <Pressable
            onPress={() => setSelectedDayOffset((prev) => prev - 1)}
            style={s.dateArrow}
          >
            <Ionicons name="chevron-back" size={18} color="#9ca3af" />
          </Pressable>
          <View style={s.datePill}>
            <Text style={s.datePillText}>{dayLabel}</Text>
          </View>
          <Pressable
            onPress={() => setSelectedDayOffset((prev) => Math.min(0, prev + 1))}
            style={[s.dateArrow, selectedDayOffset === 0 && s.dateArrowDisabled]}
            disabled={selectedDayOffset === 0}
          >
            <Ionicons
              name="chevron-forward"
              size={18}
              color={selectedDayOffset === 0 ? "#374151" : "#9ca3af"}
            />
          </Pressable>
        </View>

        {/* Overview Prompt */}
        <View style={s.overviewHeaderRow}>
          <Text style={s.overviewTitle}>Overview of your vital signs</Text>
          <Text style={s.overviewSub}>Measured continuously during sleep and rest</Text>
        </View>

        {/* 5 Vertical Pill Gauges Row (Screenshot 6 Reference) */}
        <Animated.View entering={FadeInDown.duration(400)} style={s.gaugesContainer}>
          <View style={s.gaugesRow}>
            {gauges.map((g) => {
              const handlePress = () => {
                if (g.route) {
                  navigation.navigate(g.route as any);
                } else {
                  Alert.alert(g.name, `${g.name}: ${g.value} ${g.unit}\nStatus: ${g.status}`);
                }
              };

              return (
                <Pressable
                  key={g.id}
                  style={({ pressed }) => [s.gaugeColumn, { opacity: pressed ? 0.7 : 1 }]}
                  onPress={handlePress}
                >
                  {/* Striped Top Cap */}
                  <View style={[s.gaugeCap, { backgroundColor: g.color }]} />

                  {/* Vertical Pill Capsule */}
                  <View style={[s.pillTrack, { backgroundColor: g.trackColor }]}>
                    {/* Fill */}
                    <View
                      style={[
                        s.pillFill,
                        {
                          height: `${g.fillPercentage}%`,
                          backgroundColor: g.color,
                        },
                      ]}
                    />

                    {/* Value overlay in pill */}
                    <View style={s.pillValueOverlay}>
                      <Text style={s.pillValueText} numberOfLines={1}>
                        {g.value}
                      </Text>
                      {g.unit ? (
                        <Text style={s.pillUnitText}>{g.unit}</Text>
                      ) : null}
                    </View>
                  </View>

                  {/* Bottom Circular Icon */}
                  <View style={[s.gaugeIconWrap, { backgroundColor: g.trackColor }]}>
                    <Ionicons name={g.icon} size={18} color={g.color} />
                  </View>

                  {/* Metric Name */}
                  <Text style={s.gaugeName} numberOfLines={1}>
                    {g.name.split(" ")[0]}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Animated.View>

        {/* Quick Links: Heart Health & Vascular Load */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={s.quickLinksRow}>
          <Pressable
            style={s.quickLinkCard}
            onPress={() => navigation.navigate("HeartHealth" as any)}
          >
            <View style={[s.quickLinkIcon, { backgroundColor: "rgba(244,63,94,0.12)" }]}>
              <Ionicons name="heart" size={20} color="#f43f5e" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.quickLinkTitle}>Heart health</Text>
              <Text style={s.quickLinkSub}>Score & vascular trends</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#6b7280" />
          </Pressable>

          <Pressable
            style={s.quickLinkCard}
            onPress={() => navigation.navigate("VascularLoad" as any)}
          >
            <View style={[s.quickLinkIcon, { backgroundColor: "rgba(6,182,212,0.12)" }]}>
              <Ionicons name="pulse" size={20} color="#06b6d4" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.quickLinkTitle}>Vascular load</Text>
              <Text style={s.quickLinkSub}>Arterial stress monitor</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#6b7280" />
          </Pressable>
        </Animated.View>

        {/* Track Your Vitals Card */}
        <Animated.View entering={FadeInDown.delay(150).duration(400)}>
          <Pressable
            style={s.card}
            onPress={() =>
              Alert.alert(
                "Track Your Vitals",
                "Ensure your Galaxy Watch or wearable is charged and worn snugly overnight. Vital signs are recorded during deep and REM rest intervals."
              )
            }
          >
            <View style={s.trackRow}>
              <View style={s.iconWrap}>
                <Ionicons name="watch-outline" size={26} color="#38bdf8" />
              </View>
              <View style={s.trackContent}>
                <Text style={s.trackTitle}>Track your vitals</Text>
                <Text style={s.trackSub}>
                  Wear your watch during sleep to continuously evaluate heart rate, respiratory rate, skin temperature, and oxygen saturation.
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#6b7280" />
            </View>
          </Pressable>
        </Animated.View>

        {/* About Vitals Card */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)} style={s.card}>
          <View style={s.cardHeaderRow}>
            <Text style={s.cardTitle}>About vitals</Text>
            <Ionicons name="information-circle-outline" size={20} color="#6b7280" />
          </View>
          <Text style={s.bodyText}>
            Your vital signs provide insight into physiological recovery and circadian balance. Variations from your personal baseline can reflect stress, physical fatigue, environment changes, or onset of illness.
          </Text>
        </Animated.View>
      </ScrollView>

      {/* Samsung Bottom Bar */}
      <SamsungBottomNav activeTab="Home" />
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#000000",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 12,
    backgroundColor: "#000000",
  },
  headerBtn: {
    padding: 6,
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#ffffff",
    letterSpacing: 0.2,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  dateNavWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    marginVertical: 12,
  },
  dateArrow: {
    padding: 6,
  },
  dateArrowDisabled: {
    opacity: 0.3,
  },
  datePill: {
    backgroundColor: "#18181b",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#27272a",
  },
  datePillText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#e5e7eb",
  },
  overviewHeaderRow: {
    marginBottom: 16,
    marginTop: 4,
  },
  overviewTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 4,
  },
  overviewSub: {
    fontSize: 13,
    color: "#9ca3af",
  },
  gaugesContainer: {
    backgroundColor: "#18181b",
    borderRadius: 24,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  gaugesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  gaugeColumn: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 2,
  },
  gaugeCap: {
    width: 22,
    height: 3,
    borderRadius: 1.5,
    marginBottom: 8,
  },
  pillTrack: {
    width: 44,
    height: 120,
    borderRadius: 22,
    overflow: "hidden",
    justifyContent: "flex-end",
    alignItems: "center",
    position: "relative",
  },
  pillFill: {
    width: "100%",
    borderRadius: 22,
    opacity: 0.35,
  },
  pillValueOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 2,
  },
  pillValueText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#ffffff",
    textAlign: "center",
  },
  pillUnitText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#d1d5db",
  },
  gaugeIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    marginBottom: 6,
  },
  gaugeName: {
    fontSize: 11,
    fontWeight: "600",
    color: "#9ca3af",
    textAlign: "center",
  },
  quickLinksRow: {
    gap: 10,
    marginBottom: 16,
  },
  quickLinkCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#18181b",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  quickLinkIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  quickLinkTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#ffffff",
  },
  quickLinkSub: {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 2,
  },
  card: {
    backgroundColor: "#18181b",
    borderRadius: 24,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
  },
  bodyText: {
    fontSize: 13,
    color: "#9ca3af",
    lineHeight: 19,
  },
  trackRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(56,189,248,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  trackContent: {
    flex: 1,
  },
  trackTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 3,
  },
  trackSub: {
    fontSize: 12,
    color: "#9ca3af",
    lineHeight: 17,
  },
});
