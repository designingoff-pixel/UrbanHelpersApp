import React from "react";
import { View, Text, ScrollView, StyleSheet, Pressable, StatusBar } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/types";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Rect, Path, G, Text as SvgText, Circle } from "react-native-svg";

type Props = NativeStackScreenProps<RootStackParamList, "SleepInfo">;

export default function SleepInfoScreen({ navigation }: Props) {
  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="#09061e" />

      {/* Header */}
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} style={s.backBtn} hitSlop={10}>
          <Ionicons name="chevron-back" size={28} color="white" />
        </Pressable>
        <Text style={s.pageTitle}>Sleep</Text>
      </View>

      <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Why do we need sleep? */}
        <Text style={[s.sectionTitle, { marginTop: 0 }]}>Why do we need sleep?</Text>
        <Text style={s.paragraph}>
          Sleep is an essential function that allows your body and mind to recharge, leaving you refreshed and alert when you wake up. Healthy sleep also helps the body remain healthy and stave off diseases.
        </Text>

        {/* Why does sleep consistency matter? */}
        <Text style={s.sectionTitle}>Why does sleep consistency matter?</Text>
        <Text style={s.paragraph}>
          Keeping a regular sleep schedule, even on weekends, maintains the timing of the body's internal clock and can help you fall asleep and wake up more easily.
        </Text>

        {/* Sleep schedule tips */}
        <Text style={s.sectionTitle}>Sleep schedule tips</Text>
        <View style={s.tipsList}>
          {[
            "Set a fixed wake-up time.",
            "Take a short nap, about 20 minutes, after lunch in the early afternoon.",
            "Budget time for sleep in your schedule. Work backwards from your fixed wake-up time to set your bedtime.",
            "If you need to change your sleep schedule, do it gradually. Try not to change by more than an hour or two per night.",
          ].map((tip, idx) => (
            <View key={idx} style={s.tipItem}>
              <View style={s.bullet} />
              <Text style={s.tipText}>{tip}</Text>
            </View>
          ))}
        </View>

        {/* Tracking Card */}
        <View style={s.trackingCard}>
          <Text style={s.trackingText}>
            Wear your watch, band, or ring while you sleep to track your sleep time, sleep stages, snoring, blood oxygen level, and more.
          </Text>

          {/* SVG Mock of the Tracking Chart */}
          <View style={s.chartBox}>
            <Svg width="100%" height={220} viewBox="0 0 300 220">
              {/* Card backgrounds */}
              <Rect x="10" y="10" width="280" height="90" rx="8" fill="#1a1c23" />
              <Rect x="10" y="110" width="280" height="50" rx="8" fill="#1a1c23" />
              <Rect x="10" y="170" width="280" height="40" rx="8" fill="#1a1c23" />

              {/* Top Chart (Sleep Stages) */}
              <G y="10">
                {/* Labels */}
                <SvgText x="230" y="25" fontSize="10" fill="#f87171">Awake</SvgText>
                <SvgText x="230" y="45" fontSize="10" fill="#c084fc">REM</SvgText>
                <SvgText x="230" y="65" fontSize="10" fill="#818cf8">Light</SvgText>
                <SvgText x="230" y="85" fontSize="10" fill="#4f46e5">Deep</SvgText>

                {/* Bars (Mock) */}
                <Path d="M25 20 v30" stroke="#f87171" strokeWidth="4" strokeLinecap="round" />
                <Path d="M35 50 v10" stroke="#818cf8" strokeWidth="4" strokeLinecap="round" />
                <Path d="M45 60 v20" stroke="#4f46e5" strokeWidth="4" strokeLinecap="round" />
                <Path d="M55 80 v-15" stroke="#818cf8" strokeWidth="4" strokeLinecap="round" />
                <Path d="M65 65 v-20" stroke="#c084fc" strokeWidth="4" strokeLinecap="round" />
                <Path d="M75 45 v20" stroke="#818cf8" strokeWidth="4" strokeLinecap="round" />
                <Path d="M85 65 v20" stroke="#4f46e5" strokeWidth="4" strokeLinecap="round" />
                <Path d="M95 85 v-25" stroke="#818cf8" strokeWidth="4" strokeLinecap="round" />
                <Path d="M105 60 v-30" stroke="#f87171" strokeWidth="4" strokeLinecap="round" />
                <Path d="M115 30 v15" stroke="#c084fc" strokeWidth="4" strokeLinecap="round" />
                <Path d="M125 45 v20" stroke="#818cf8" strokeWidth="4" strokeLinecap="round" />
                <Path d="M135 65 v-20" stroke="#c084fc" strokeWidth="4" strokeLinecap="round" />
                <Path d="M145 45 v20" stroke="#818cf8" strokeWidth="4" strokeLinecap="round" />
                <Path d="M155 65 v-20" stroke="#c084fc" strokeWidth="4" strokeLinecap="round" />
                <Path d="M165 45 v-20" stroke="#f87171" strokeWidth="4" strokeLinecap="round" />
                <Path d="M175 25 v20" stroke="#c084fc" strokeWidth="4" strokeLinecap="round" />
                <Path d="M185 45 v15" stroke="#818cf8" strokeWidth="4" strokeLinecap="round" />
                <Path d="M195 60 v-15" stroke="#c084fc" strokeWidth="4" strokeLinecap="round" />
                <Path d="M205 45 v-15" stroke="#f87171" strokeWidth="4" strokeLinecap="round" />

                {/* Connecting horizontal lines mock */}
                <Path d="M25 50 H35 V60 H45 V80 H55 V65 H65 V45 H75 V65 H85 V85 H95 V60 H105 V30 H115 V45 H125 V65 H135 V45 H145 V65 H155 V45 H165 V25 H175 V45 H185 V60 H195 V45 H205 V30" stroke="rgba(255,255,255,0.1)" strokeWidth="1" fill="none" />
              </G>

              {/* Middle Chart (Blood oxygen) */}
              <G y="110">
                <SvgText x="20" y="20" fontSize="10" fill="rgba(255,255,255,0.4)">Blood oxygen</SvgText>
                <Path d="M20 35 L40 33 L60 38 L80 34 L100 37 L120 45 L130 38 L140 33 L160 36 L180 34 L200 35 L220 32 L240 34 L260 36 L280 35" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" fill="none" />
                {/* Random blue/purple accent lines */}
                <Path d="M110 38 L120 45 L130 38" stroke="#4f46e5" strokeWidth="2" fill="none" />
                <Path d="M190 34 L200 35 L210 33" stroke="#4f46e5" strokeWidth="2" fill="none" />
              </G>

              {/* Bottom Chart (Snoring) */}
              <G y="170">
                <SvgText x="20" y="18" fontSize="10" fill="rgba(255,255,255,0.4)">Snoring</SvgText>
                <Rect x="20" y="26" width="250" height="6" rx="3" fill="#2a2c33" />
                {/* Snoring segments */}
                <Rect x="120" y="26" width="15" height="6" fill="#4f46e5" />
                <Rect x="140" y="26" width="25" height="6" fill="#4f46e5" />
                <Rect x="230" y="26" width="5" height="6" fill="#4f46e5" />
              </G>
            </Svg>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Actions */}
      <View style={s.bottomActions}>
        <Pressable
          style={s.skipBtn}
          onPress={() => navigation.replace("SleepDashboard")}
        >
          <Text style={s.skipText}>Skip</Text>
        </Pressable>
        <Pressable
          style={s.targetBtn}
          onPress={() => navigation.navigate("SleepTarget")}
        >
          <Text style={s.targetText}>Set target</Text>
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#09061e", // Dark background to match screenshot
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  backBtn: {
    marginRight: 12,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "white",
  },
  scrollContent: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: "white",
    marginBottom: 12,
    marginTop: 32,
  },
  paragraph: {
    fontSize: 15,
    color: "rgba(255,255,255,0.85)",
    lineHeight: 22,
  },
  tipsList: {
    marginTop: 4,
    gap: 12,
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  bullet: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "rgba(255,255,255,0.8)",
    marginTop: 9,
    marginRight: 10,
  },
  tipText: {
    flex: 1,
    fontSize: 15,
    color: "rgba(255,255,255,0.85)",
    lineHeight: 22,
  },
  trackingCard: {
    backgroundColor: "#16171d", // Dark gray card background
    borderRadius: 24,
    padding: 20,
    marginTop: 32,
  },
  trackingText: {
    fontSize: 15,
    fontWeight: "600",
    color: "white",
    lineHeight: 22,
    marginBottom: 20,
  },
  chartBox: {
    backgroundColor: "#22242a",
    borderRadius: 16,
    overflow: "hidden",
  },
  bottomActions: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingBottom: 30,
    paddingTop: 16,
    backgroundColor: "#09061e",
  },
  skipBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 24,
    backgroundColor: "#333333", // Dark gray
    alignItems: "center",
    marginRight: 10,
  },
  skipText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  targetBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 24,
    backgroundColor: "#059669", // Emerald green from screenshot
    alignItems: "center",
    marginLeft: 10,
  },
  targetText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
});
