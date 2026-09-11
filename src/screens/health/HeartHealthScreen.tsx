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
import Svg, { Circle, Path, Rect, Line, G } from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import Animated, { FadeInDown } from "react-native-reanimated";
import { RootStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "HeartHealth">;

const { width: SW } = Dimensions.get("window");

export default function HeartHealthScreen({ navigation }: Props) {
  const [selectedDayOffset, setSelectedDayOffset] = useState(0);

  const dayLabel =
    selectedDayOffset === 0
      ? "Today"
      : selectedDayOffset === -1
      ? "Yesterday"
      : `${Math.abs(selectedDayOffset)} days ago`;

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      {/* Top Header */}
      <View style={s.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={s.headerBtn}
          accessibilityLabel="Back"
        >
          <Ionicons name="chevron-back" size={26} color="#ffffff" />
        </Pressable>
        <Text style={s.headerTitle}>Heart health</Text>
        <View style={s.headerRight}>
          <Pressable
            onPress={() => navigation.navigate("HeartRate" as any)}
            style={s.headerIconBtn}
            accessibilityLabel="Heart Trends"
          >
            <View style={s.barChartIcon}>
              <View style={[s.barChartCol, { height: 10 }]} />
              <View style={[s.barChartCol, { height: 18 }]} />
              <View style={[s.barChartCol, { height: 14 }]} />
            </View>
          </Pressable>
          <Pressable
            onPress={() => Alert.alert("Options", "Heart health settings")}
            style={s.headerIconBtn}
            accessibilityLabel="Options"
          >
            <Ionicons name="ellipsis-vertical" size={20} color="#ffffff" />
          </Pressable>
        </View>
      </View>

      {/* Date Navigator: < [ Today ] > */}
      <View style={s.dateNavWrap}>
        <Pressable
          onPress={() => setSelectedDayOffset((prev) => prev - 1)}
          style={s.dateNavArrow}
        >
          <Ionicons name="chevron-back" size={18} color="rgba(255,255,255,0.7)" />
        </Pressable>
        <View style={s.dateNavPill}>
          <Text style={s.dateNavText}>{dayLabel}</Text>
        </View>
        <Pressable
          onPress={() => setSelectedDayOffset((prev) => Math.min(0, prev + 1))}
          style={[s.dateNavArrow, selectedDayOffset === 0 && { opacity: 0.3 }]}
          disabled={selectedDayOffset === 0}
        >
          <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.7)" />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scrollContent}
      >
        {/* Score Area */}
        <Animated.View entering={FadeInDown.duration(300)} style={s.scoreArea}>
          <Text style={s.scoreBigVal}>--</Text>
          <Text style={s.scoreTitle}>No heart health score</Text>
          <Text style={s.scoreDesc}>
            To use this feature, you need a Galaxy Watch Ultra, Galaxy Watch7, or higher with One UI 9 Watch or higher.
          </Text>
        </Animated.View>

        {/* Card 1: Track your heart health */}
        <Animated.View entering={FadeInDown.delay(60).duration(300)} style={s.card}>
          <View style={s.cardContentRow}>
            <View style={s.cardTextCol}>
              <Text style={s.cardTitle}>Track your heart health</Text>
              <Text style={s.cardSub}>
                Find watches you can use to track your heart health on Samsung.com.
              </Text>
            </View>
            {/* Galaxy Watch Graphic */}
            <View style={s.watchGraphicWrap}>
              <View style={s.watchStrapTop} />
              <View style={s.watchBody}>
                <View style={s.watchBezel}>
                  <View style={s.watchFace}>
                    <Ionicons name="body" size={18} color="#ffffff" />
                  </View>
                </View>
              </View>
              <View style={s.watchStrapBottom} />
            </View>
          </View>
        </Animated.View>

        {/* Card 2: About your heart health score */}
        <Animated.View entering={FadeInDown.delay(120).duration(300)} style={s.card}>
          <View style={s.cardContentRow}>
            <View style={s.cardTextCol}>
              <Text style={s.cardTitle}>About your heart health score</Text>
              <Text style={s.cardSub}>
                Data from your sleep, exercise, BMI, and vascular load, is used to calculate a single score that offers insights into your heart health.
              </Text>
            </View>
            {/* Heart & Activity Graphic */}
            <LinearGradient
              colors={["#ec4899", "#a855f7", "#3b82f6"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={s.aboutGraphic}
            >
              <Ionicons name="heart" size={38} color="#ffffff" />
              <View style={s.aboutSparkle}>
                <Ionicons name="sparkles" size={14} color="#fef08a" />
              </View>
            </LinearGradient>
          </View>
        </Animated.View>

        {/* Card 3: Vascular load */}
        <Animated.View entering={FadeInDown.delay(180).duration(300)}>
          <Pressable
            style={s.card}
            onPress={() => navigation.navigate("VascularLoad" as any)}
          >
            <View style={s.cardContentRow}>
              <View style={s.cardTextCol}>
                <Text style={s.cardTitle}>Vascular load</Text>
                <Text style={s.cardSub}>
                  Tracking your vascular load while you sleep can help you live a heart-healthy lifestyle.{" "}
                  <Text style={s.linkText}>Why it matters</Text>
                </Text>
              </View>
              {/* Artery / Cells Graphic */}
              <LinearGradient
                colors={["#3b82f6", "#ec4899"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={s.vascularGraphic}
              >
                <Svg width={54} height={54} viewBox="0 0 54 54">
                  <Path
                    d="M 10 20 Q 27 34 44 20 Q 27 48 10 20 Z"
                    fill="#f43f5e"
                    opacity={0.9}
                  />
                  <Circle cx={27} cy={27} r={6} fill="#ffffff" />
                  <Circle cx={19} cy={23} r={3} fill="#fecdd3" />
                  <Circle cx={35} cy={24} r={3} fill="#fecdd3" />
                </Svg>
              </LinearGradient>
            </View>
          </Pressable>
        </Animated.View>

        {/* Section: Learn more about your heart */}
        <Animated.View entering={FadeInDown.delay(240).duration(300)} style={s.learnSection}>
          <Text style={s.sectionHeader}>Learn more about your heart</Text>

          {/* More heart metrics */}
          <View style={s.card}>
            <Text style={s.cardTitle}>More heart metrics</Text>
            <Text style={s.cardSubFull}>
              The metrics below aren't part of your heart health score. However, they provide important clinical insights, and we recommend reviewing them to get a more complete understanding of your heart health.
            </Text>
            <Text style={[s.cardSubFull, { marginTop: 12, marginBottom: 16 }]}>
              Use the Samsung Health Monitor app to record your ECG and blood pressure.
            </Text>
            <Pressable
              style={s.learnMoreBtn}
              onPress={() => Alert.alert("Samsung Health Monitor", "ECG and Blood Pressure features")}
            >
              <Text style={s.learnMoreBtnText}>Learn more</Text>
            </Pressable>
          </View>

          {/* Blood pressure */}
          <View style={s.card}>
            <View style={s.cardContentRow}>
              <View style={s.cardTextCol}>
                <Text style={s.cardTitle}>Blood pressure</Text>
                <Text style={s.cardSub}>
                  Blood pressure is the force of blood flow pushing against your artery walls. It includes two measurements. Systolic measures the pressure when your heart beats, while diastolic measures the pressure when your heart is resting between beats.
                </Text>
              </View>
              {/* Artery cross-section graphic */}
              <View style={s.bpGraphic}>
                <LinearGradient
                  colors={["#0284c7", "#e11d48"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={s.bpCircle}
                >
                  <Svg width={50} height={50} viewBox="0 0 50 50">
                    <Circle cx={25} cy={25} r={18} fill="rgba(255,255,255,0.2)" />
                    <Circle cx={20} cy={22} r={5} fill="#fecdd3" />
                    <Circle cx={30} cy={26} r={6} fill="#ffffff" />
                  </Svg>
                </LinearGradient>
              </View>
            </View>
          </View>

          {/* ECG */}
          <View style={s.card}>
            <View style={s.cardContentRow}>
              <View style={s.cardTextCol}>
                <Text style={s.cardTitle}>ECG</Text>
                <Text style={s.cardSub}>
                  An electrocardiogram (ECG) is a test that records electrical activity of the heart. It helps detect irregular heartbeats and rhythm issues.
                </Text>
              </View>
              {/* Heart & ECG pulse graphic */}
              <View style={s.ecgGraphic}>
                <LinearGradient
                  colors={["#f43f5e", "#fb7185"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={s.ecgCircle}
                >
                  <Svg width={50} height={50} viewBox="0 0 50 50">
                    <Path
                      d="M 12 25 L 18 25 L 22 14 L 28 36 L 32 25 L 38 25"
                      stroke="#ffffff"
                      strokeWidth={3}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                  </Svg>
                </LinearGradient>
              </View>
            </View>
          </View>
        </Animated.View>

        <View style={{ height: 40 }} />
      </ScrollView>
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
    paddingTop: 48,
    paddingBottom: 12,
  },
  headerBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#ffffff",
    flex: 1,
    marginLeft: 6,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  headerIconBtn: {
    padding: 4,
  },
  barChartIcon: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 3,
    height: 20,
    paddingBottom: 1,
  },
  barChartCol: {
    width: 3.5,
    backgroundColor: "#ffffff",
    borderRadius: 1.5,
  },
  dateNavWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    gap: 16,
  },
  dateNavArrow: {
    padding: 8,
  },
  dateNavPill: {
    backgroundColor: "rgba(255, 255, 255, 0.16)",
    paddingVertical: 8,
    paddingHorizontal: 38,
    borderRadius: 24,
  },
  dateNavText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 30,
  },
  scoreArea: {
    paddingVertical: 16,
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  scoreBigVal: {
    fontSize: 48,
    fontWeight: "700",
    color: "#ffffff",
    letterSpacing: 2,
    marginBottom: 8,
  },
  scoreTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 8,
  },
  scoreDesc: {
    fontSize: 13.5,
    color: "rgba(255, 255, 255, 0.65)",
    lineHeight: 19,
  },
  card: {
    backgroundColor: "#16161c",
    borderRadius: 26,
    padding: 20,
    marginBottom: 14,
  },
  cardContentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardTextCol: {
    flex: 1,
    paddingRight: 14,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 6,
  },
  cardSub: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.65)",
    lineHeight: 18,
  },
  cardSubFull: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.65)",
    lineHeight: 19,
  },
  linkText: {
    textDecorationLine: "underline",
    color: "#ffffff",
    fontWeight: "600",
  },
  watchGraphicWrap: {
    width: 68,
    height: 74,
    alignItems: "center",
    justifyContent: "center",
  },
  watchStrapTop: {
    width: 28,
    height: 8,
    backgroundColor: "rgba(255,255,255,0.25)",
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  watchBody: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "rgba(255,255,255,0.18)",
    justifyContent: "center",
    alignItems: "center",
  },
  watchBezel: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
  },
  watchFace: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#10b981",
    justifyContent: "center",
    alignItems: "center",
  },
  watchStrapBottom: {
    width: 28,
    height: 8,
    backgroundColor: "rgba(255,255,255,0.25)",
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
  },
  aboutGraphic: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  aboutSparkle: {
    position: "absolute",
    top: 6,
    right: 6,
  },
  vascularGraphic: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  learnSection: {
    marginTop: 8,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 12,
    marginLeft: 4,
  },
  learnMoreBtn: {
    backgroundColor: "rgba(255, 255, 255, 0.14)",
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  learnMoreBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ffffff",
  },
  bpGraphic: {
    width: 64,
    height: 64,
    justifyContent: "center",
    alignItems: "center",
  },
  bpCircle: {
    width: 60,
    height: 60,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  ecgGraphic: {
    width: 64,
    height: 64,
    justifyContent: "center",
    alignItems: "center",
  },
  ecgCircle: {
    width: 60,
    height: 60,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
});
