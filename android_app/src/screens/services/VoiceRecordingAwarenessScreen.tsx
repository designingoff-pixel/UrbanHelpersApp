import React, { useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  FadeInDown,
} from "react-native-reanimated";
import { RootStackParamList } from "@/navigation/types";
import { useTheme } from "@/context/ThemeContext";

type Props = NativeStackScreenProps<RootStackParamList, "VoiceRecordingAwareness">;

export default function VoiceRecordingAwarenessScreen({ route, navigation }: Props) {
  const { isDark } = useTheme();
  const serviceName = (route.params as any)?.serviceName || "Active Home Service";
  const vendorName = (route.params as any)?.vendorName;

  // Pulsing recording dot
  const pulse = useSharedValue(1);
  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.3, { duration: 600 }),
        withTiming(1, { duration: 600 })
      ),
      -1,
      false
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const handleCallHelpline = () => {
    Linking.openURL("tel:1800123456").catch(() => {});
  };

  return (
    <View
      style={[
        s.root,
        { backgroundColor: isDark ? "#081826" : "#F4F6F9" },
      ]}
    >
      {/* Top Header */}
      <View
        style={[
          s.header,
          {
            backgroundColor: isDark ? "#081826" : "#FFFFFF",
            borderBottomColor: isDark ? "rgba(255,255,255,0.06)" : "#E2E8F0",
          },
        ]}
      >
        <Pressable
          onPress={() => navigation.goBack()}
          style={[
            s.headerBtn,
            { backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "#F1F5F9" },
          ]}
          accessibilityLabel="Go Back"
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color={isDark ? "#FFFFFF" : "#0F172A"}
          />
        </Pressable>
        <Text
          style={[
            s.headerTitle,
            { color: isDark ? "#FFFFFF" : "#0F172A" },
          ]}
        >
          Safe Hands Trust & Audio Safety
        </Text>
        <Pressable
          onPress={handleCallHelpline}
          style={[
            s.headerBtn,
            { backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "#F1F5F9" },
          ]}
          accessibilityLabel="Call Helpline"
        >
          <Ionicons name="call-outline" size={19} color="#0D9488" />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
      >
        {/* Hero Card */}
        <Animated.View entering={FadeInDown.duration(380)}>
          <LinearGradient
            colors={
              isDark
                ? ["#064e3b", "#022c22", "#0f172a"]
                : ["#ECFDF5", "#D1FAE5", "#F0FDFA"]
            }
            style={s.hero}
          >
            <View style={s.heroTop}>
              <View style={s.micBox}>
                <Ionicons name="mic" size={28} color="#059669" />
              </View>
              <View style={{ flex: 1, marginLeft: 14 }}>
                <View style={s.badge}>
                  <Ionicons name="shield-checkmark" size={13} color="#059669" />
                  <Text style={s.badgeText}>SAFE HANDS GUARANTEE</Text>
                </View>
                <Text
                  style={[
                    s.heroTitle,
                    { color: isDark ? "#ECFDF5" : "#065F46" },
                  ]}
                >
                  You're in Safe Hands
                </Text>
                <Text
                  style={[
                    s.heroSub,
                    { color: isDark ? "#A7F3D0" : "#047857" },
                  ]}
                >
                  Audio-monitored in real-time for your complete safety & peace of mind.
                </Text>
              </View>
            </View>

            {/* Exact Live Audio Recording Card matching technician app */}
            <View
              style={[
                s.recordingBanner,
                {
                  backgroundColor: isDark ? "rgba(244,63,94,0.14)" : "#FFF1F2",
                  borderColor: isDark ? "rgba(244,63,94,0.35)" : "#FECDD3",
                },
              ]}
            >
              <View style={s.recHeader}>
                <Ionicons name="mic-outline" size={16} color="#E11D48" />
                <Text style={s.recTitle}>SERVICE AUDIO RECORDING PROOF</Text>
              </View>
              <Text style={s.recSub}>
                Audio monitoring for service quality, customer security & work verification.
              </Text>

              <View style={s.recPill}>
                <Animated.View style={[s.recDot, pulseStyle]} />
                <Text style={s.recPillText}>
                  Automatic Voice Recording Active
                </Text>
              </View>
              <Text style={s.recNote}>
                ● Recording in background • Automatically stops & saves when service is completed
              </Text>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Why Audio Monitoring Protects You */}
        <Animated.View entering={FadeInDown.delay(120).duration(380)}>
          <Text
            style={[
              s.sectionTitle,
              { color: isDark ? "#FFFFFF" : "#0F172A" },
            ]}
          >
            Why We Audio Monitor Services
          </Text>
          <Text
            style={[
              s.sectionSub,
              { color: isDark ? "#94A3B8" : "#64748B" },
            ]}
          >
            We believe you and your family deserve 100% peace of mind whenever a service professional visits your home.
          </Text>

          <View style={s.cardsWrap}>
            {/* 1 */}
            <View
              style={[
                s.card,
                {
                  backgroundColor: isDark ? "#0B1E30" : "#FFFFFF",
                  borderColor: isDark ? "rgba(255,255,255,0.06)" : "#E2E8F0",
                },
              ]}
            >
              <View style={[s.iconCircle, { backgroundColor: "#ECFDF5" }]}>
                <Ionicons name="shield-checkmark" size={22} color="#059669" />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    s.cardTitle,
                    { color: isDark ? "#FFFFFF" : "#0F172A" },
                  ]}
                >
                  Personal In-Home Protection
                </Text>
                <Text
                  style={[
                    s.cardDesc,
                    { color: isDark ? "#94A3B8" : "#64748B" },
                  ]}
                >
                  Strict accountability guarantees courteous, polite, and respectful behavior at all times during the service.
                </Text>
              </View>
            </View>

            {/* 2 */}
            <View
              style={[
                s.card,
                {
                  backgroundColor: isDark ? "#0B1E30" : "#FFFFFF",
                  borderColor: isDark ? "rgba(255,255,255,0.06)" : "#E2E8F0",
                },
              ]}
            >
              <View style={[s.iconCircle, { backgroundColor: "#EFF6FF" }]}>
                <Ionicons name="cash-outline" size={22} color="#2563EB" />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    s.cardTitle,
                    { color: isDark ? "#FFFFFF" : "#0F172A" },
                  ]}
                >
                  Fair Pricing & Zero Surprise Charges
                </Text>
                <Text
                  style={[
                    s.cardDesc,
                    { color: isDark ? "#94A3B8" : "#64748B" },
                  ]}
                >
                  Any discussions on extra spare parts, filters, or additional labor are captured on tape, preventing fraudulent price hikes.
                </Text>
              </View>
            </View>

            {/* 3 */}
            <View
              style={[
                s.card,
                {
                  backgroundColor: isDark ? "#0B1E30" : "#FFFFFF",
                  borderColor: isDark ? "rgba(255,255,255,0.06)" : "#E2E8F0",
                },
              ]}
            >
              <View style={[s.iconCircle, { backgroundColor: "#FAF5FF" }]}>
                <Ionicons name="lock-closed" size={22} color="#7C3AED" />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    s.cardTitle,
                    { color: isDark ? "#FFFFFF" : "#0F172A" },
                  ]}
                >
                  Bank-Grade Privacy & Confidentiality
                </Text>
                <Text
                  style={[
                    s.cardDesc,
                    { color: isDark ? "#94A3B8" : "#64748B" },
                  ]}
                >
                  Encrypted using AES-256 standards in our secure cloud. Neither the technician nor third parties can play or download this audio. Accessed strictly if you report an issue.
                </Text>
              </View>
            </View>

            {/* 4 */}
            <View
              style={[
                s.card,
                {
                  backgroundColor: isDark ? "#0B1E30" : "#FFFFFF",
                  borderColor: isDark ? "rgba(255,255,255,0.06)" : "#E2E8F0",
                },
              ]}
            >
              <View style={[s.iconCircle, { backgroundColor: "#FEF2F2" }]}>
                <Ionicons name="stop-circle-outline" size={22} color="#DC2626" />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    s.cardTitle,
                    { color: isDark ? "#FFFFFF" : "#0F172A" },
                  ]}
                >
                  Automatic Stop & Sealing
                </Text>
                <Text
                  style={[
                    s.cardDesc,
                    { color: isDark ? "#94A3B8" : "#64748B" },
                  ]}
                >
                  Recording only begins upon arrival and automatically ceases the moment the service is completed and signed off.
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* 24/7 Helpline Card */}
        <Animated.View entering={FadeInDown.delay(200).duration(380)}>
          <View
            style={[
              s.helpline,
              {
                backgroundColor: isDark ? "rgba(2,132,199,0.12)" : "#F0F9FF",
                borderColor: isDark ? "rgba(2,132,199,0.3)" : "#BAE6FD",
              },
            ]}
          >
            <View style={s.helplineIcon}>
              <Ionicons name="headset" size={24} color="#0284C7" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.helplineTitle}>24/7 Customer Trust & Safety Hotline</Text>
              <Text style={s.helplineText}>
                Need to speak with our compliance team? We are ready to help around the clock.
              </Text>
            </View>
            <Pressable
              onPress={handleCallHelpline}
              style={s.callBtn}
            >
              <Ionicons name="call" size={15} color="#FFFFFF" />
              <Text style={s.callBtnText}>1800-123-456</Text>
            </Pressable>
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
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 52,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  scroll: {
    padding: 16,
  },
  hero: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
  },
  heroTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  micBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(5,150,105,0.12)",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "900",
    color: "#059669",
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: "800",
  },
  heroSub: {
    fontSize: 13,
    marginTop: 2,
    lineHeight: 18,
  },
  recordingBanner: {
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
  },
  recHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  recTitle: {
    fontSize: 11.5,
    fontWeight: "900",
    color: "#E11D48",
    letterSpacing: 0.5,
  },
  recSub: {
    fontSize: 12,
    color: "#475569",
    lineHeight: 16,
    marginBottom: 10,
  },
  recPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFFFFF",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FECDD3",
    marginBottom: 6,
  },
  recDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E11D48",
  },
  recPillText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#BE123C",
  },
  recNote: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    marginBottom: 4,
  },
  sectionSub: {
    fontSize: 13,
    marginBottom: 16,
    lineHeight: 18,
  },
  cardsWrap: {
    gap: 12,
    marginBottom: 20,
  },
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 14.5,
    fontWeight: "700",
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 12.5,
    lineHeight: 18,
  },
  helpline: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  helplineIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  helplineTitle: {
    fontSize: 13.5,
    fontWeight: "800",
    color: "#0369A1",
    marginBottom: 2,
  },
  helplineText: {
    fontSize: 11.5,
    color: "#0284C7",
    lineHeight: 16,
  },
  callBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#0284C7",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  callBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
});
