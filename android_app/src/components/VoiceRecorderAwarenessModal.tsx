import React, { useEffect } from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Dimensions,
  Linking,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  FadeInDown,
} from "react-native-reanimated";
import { useTheme } from "@/context/ThemeContext";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const TEAL = "#00bcd4";
const TEAL_D = "#0097a7";

interface Props {
  visible: boolean;
  onClose: () => void;
  bookingId?: string;
  serviceName?: string;
  vendorName?: string;
  isLiveRecording?: boolean;
}

export default function VoiceRecorderAwarenessModal({
  visible,
  onClose,
  bookingId,
  serviceName = "Home Service",
  vendorName,
  isLiveRecording = true,
}: Props) {
  const { isDark } = useTheme();

  // Pulsing red recording dot animation
  const pulse = useSharedValue(1);
  useEffect(() => {
    if (visible) {
      pulse.value = withRepeat(
        withSequence(
          withTiming(1.3, { duration: 600 }),
          withTiming(1, { duration: 600 })
        ),
        -1,
        false
      );
    }
  }, [visible]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const handleCallSafetyLine = () => {
    Linking.openURL("tel:1800123456").catch(() => {});
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={s.overlay}>
        <Pressable style={s.backdrop} onPress={onClose} />

        <View
          style={[
            s.sheet,
            {
              backgroundColor: isDark ? "#0A1929" : "#FFFFFF",
              borderColor: isDark ? "rgba(255,255,255,0.08)" : "#E2E8F0",
            },
          ]}
        >
          {/* Top Grab Handle */}
          <View style={s.dragHandleWrap}>
            <View
              style={[
                s.dragHandle,
                { backgroundColor: isDark ? "rgba(255,255,255,0.2)" : "#CBD5E1" },
              ]}
            />
          </View>

          {/* Header */}
          <View style={s.header}>
            <View style={s.headerBadge}>
              <Ionicons name="shield-checkmark" size={15} color="#10B981" />
              <Text style={s.headerBadgeText}>SAFE HANDS PROTOCOL</Text>
            </View>
            <Pressable
              onPress={onClose}
              style={[
                s.closeBtn,
                { backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "#F1F5F9" },
              ]}
              accessibilityLabel="Close"
            >
              <Ionicons
                name="close"
                size={20}
                color={isDark ? "#FFFFFF" : "#0F172A"}
              />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={s.scrollContent}
          >
            {/* Hero Trust Badge */}
            <LinearGradient
              colors={
                isDark
                  ? ["#064e3b", "#022c22", "#0f172a"]
                  : ["#ECFDF5", "#D1FAE5", "#F0FDFA"]
              }
              style={s.heroCard}
            >
              <View style={s.heroTop}>
                <View style={s.micIconBox}>
                  <Ionicons name="mic" size={26} color="#059669" />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
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
                    Audio monitoring active for your safety & transparency
                  </Text>
                </View>
              </View>

              {/* Exact Replica of Live Active Recording Banner from Technician App */}
              <View
                style={[
                  s.recordingProofCard,
                  {
                    backgroundColor: isDark ? "rgba(244,63,94,0.12)" : "#FFF1F2",
                    borderColor: isDark ? "rgba(244,63,94,0.3)" : "#FECDD3",
                  },
                ]}
              >
                <View style={s.recTitleRow}>
                  <Ionicons name="mic-outline" size={15} color="#E11D48" />
                  <Text style={s.recProofTitle}>SERVICE AUDIO RECORDING PROOF</Text>
                </View>
                <Text style={s.recProofSub}>
                  Audio monitoring for service quality, customer security & work verification.
                </Text>

                <View style={s.recActivePill}>
                  <Animated.View style={[s.liveDot, pulseStyle]} />
                  <Text style={s.recActivePillText}>
                    Automatic Voice Recording Active
                  </Text>
                </View>
                <Text style={s.recAutoNote}>
                  ● Recording in background • Automatically stops & saves when service is completed
                </Text>
              </View>
            </LinearGradient>

            {/* Service & Technician Context */}
            {vendorName ? (
              <View
                style={[
                  s.contextBox,
                  {
                    backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "#F8FAFC",
                    borderColor: isDark ? "rgba(255,255,255,0.06)" : "#E2E8F0",
                  },
                ]}
              >
                <Ionicons name="person-circle-outline" size={20} color={TEAL} />
                <Text
                  style={[
                    s.contextText,
                    { color: isDark ? "#E2E8F0" : "#334155" },
                  ]}
                >
                  Assigned Partner: <Text style={{ fontWeight: "700" }}>{vendorName}</Text> (Service: {serviceName})
                </Text>
              </View>
            ) : null}

            {/* Why This Keeps You Safe (4 Pillars) */}
            <Text
              style={[
                s.sectionHeading,
                { color: isDark ? "#F8FAFC" : "#0F172A" },
              ]}
            >
              How Audio Monitoring Protects You
            </Text>

            <View style={s.pillarsList}>
              {/* Pillar 1: In-Home Protection */}
              <View
                style={[
                  s.pillarCard,
                  {
                    backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "#FFFFFF",
                    borderColor: isDark ? "rgba(255,255,255,0.06)" : "#E2E8F0",
                  },
                ]}
              >
                <View
                  style={[s.pillarIconBox, { backgroundColor: "#ECFDF5" }]}
                >
                  <Ionicons name="shield-checkmark" size={20} color="#059669" />
                </View>
                <View style={s.pillarContent}>
                  <Text
                    style={[
                      s.pillarTitle,
                      { color: isDark ? "#F8FAFC" : "#0F172A" },
                    ]}
                  >
                    100% In-Home Security & Zero Misconduct
                  </Text>
                  <Text
                    style={[
                      s.pillarDesc,
                      { color: isDark ? "#94A3B8" : "#64748B" },
                    ]}
                  >
                    Guarantees polite, respectful, and professional conduct while our technician is inside your home.
                  </Text>
                </View>
              </View>

              {/* Pillar 2: Pricing & Spare Parts Transparency */}
              <View
                style={[
                  s.pillarCard,
                  {
                    backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "#FFFFFF",
                    borderColor: isDark ? "rgba(255,255,255,0.06)" : "#E2E8F0",
                  },
                ]}
              >
                <View
                  style={[s.pillarIconBox, { backgroundColor: "#EFF6FF" }]}
                >
                  <Ionicons name="pricetag" size={19} color="#2563EB" />
                </View>
                <View style={s.pillarContent}>
                  <Text
                    style={[
                      s.pillarTitle,
                      { color: isDark ? "#F8FAFC" : "#0F172A" },
                    ]}
                  >
                    Transparent Quotations & No Hidden Costs
                  </Text>
                  <Text
                    style={[
                      s.pillarDesc,
                      { color: isDark ? "#94A3B8" : "#64748B" },
                    ]}
                  >
                    Discussions regarding filter replacements, spare parts, and pricing adjustments are documented on tape to eliminate surprise charges.
                  </Text>
                </View>
              </View>

              {/* Pillar 3: Bank-Grade Privacy & Encryption */}
              <View
                style={[
                  s.pillarCard,
                  {
                    backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "#FFFFFF",
                    borderColor: isDark ? "rgba(255,255,255,0.06)" : "#E2E8F0",
                  },
                ]}
              >
                <View
                  style={[s.pillarIconBox, { backgroundColor: "#FAF5FF" }]}
                >
                  <Ionicons name="lock-closed" size={19} color="#7C3AED" />
                </View>
                <View style={s.pillarContent}>
                  <Text
                    style={[
                      s.pillarTitle,
                      { color: isDark ? "#F8FAFC" : "#0F172A" },
                    ]}
                  >
                    Bank-Grade AES-256 Encrypted Privacy
                  </Text>
                  <Text
                    style={[
                      s.pillarDesc,
                      { color: isDark ? "#94A3B8" : "#64748B" },
                    ]}
                  >
                    The recording is encrypted and stored in secure cloud storage. Technicians cannot access or replay it. It is reviewed strictly upon explicit customer escalation or safety audit.
                  </Text>
                </View>
              </View>

              {/* Pillar 4: Automatic Termination */}
              <View
                style={[
                  s.pillarCard,
                  {
                    backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "#FFFFFF",
                    borderColor: isDark ? "rgba(255,255,255,0.06)" : "#E2E8F0",
                  },
                ]}
              >
                <View
                  style={[s.pillarIconBox, { backgroundColor: "#FEF2F2" }]}
                >
                  <Ionicons name="stop-circle" size={20} color="#DC2626" />
                </View>
                <View style={s.pillarContent}>
                  <Text
                    style={[
                      s.pillarTitle,
                      { color: isDark ? "#F8FAFC" : "#0F172A" },
                    ]}
                  >
                    Automatic Shutdown on Job Completion
                  </Text>
                  <Text
                    style={[
                      s.pillarDesc,
                      { color: isDark ? "#94A3B8" : "#64748B" },
                    ]}
                  >
                    Recording terminates and is sealed automatically the exact moment the technician checks the final checklist item and submits completion proofs.
                  </Text>
                </View>
              </View>
            </View>

            {/* Helpline Emergency Assurance */}
            <View
              style={[
                s.helplineCard,
                {
                  backgroundColor: isDark ? "rgba(2,132,199,0.1)" : "#F0F9FF",
                  borderColor: isDark ? "rgba(2,132,199,0.25)" : "#BAE6FD",
                },
              ]}
            >
              <Ionicons name="headset" size={22} color="#0284C7" />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={s.helplineTitle}>24/7 Safety & Dispute Helpline</Text>
                <Text style={s.helplineSub}>
                  Feel uncomfortable at any point? Our safety escalation team is on standby 24/7.
                </Text>
              </View>
              <Pressable
                onPress={handleCallSafetyLine}
                style={s.callSafetyBtn}
              >
                <Ionicons name="call" size={14} color="#FFFFFF" />
                <Text style={s.callSafetyBtnText}>Call</Text>
              </Pressable>
            </View>

            <View style={{ height: 16 }} />
          </ScrollView>

          {/* Bottom Fixed Action Buttons */}
          <View
            style={[
              s.footer,
              {
                backgroundColor: isDark ? "#0A1929" : "#FFFFFF",
                borderTopColor: isDark ? "rgba(255,255,255,0.06)" : "#E2E8F0",
              },
            ]}
          >
            <Pressable
              style={s.acknowledgeBtn}
              onPress={onClose}
            >
              <LinearGradient
                colors={["#059669", "#047857"]}
                style={s.acknowledgeBtnGrad}
              >
                <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
                <Text style={s.acknowledgeBtnText}>I Understand & Feel Safe</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderBottomWidth: 0,
    maxHeight: SCREEN_HEIGHT * 0.88,
    paddingTop: 8,
  },
  dragHandleWrap: {
    alignItems: "center",
    paddingVertical: 6,
  },
  dragHandle: {
    width: 44,
    height: 4,
    borderRadius: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  headerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(16,185,129,0.12)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  headerBadgeText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#10B981",
    letterSpacing: 0.5,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 20,
  },
  heroCard: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
  },
  heroTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  micIconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: "800",
  },
  heroSub: {
    fontSize: 12.5,
    marginTop: 2,
    fontWeight: "500",
  },
  recordingProofCard: {
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
  },
  recTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  recProofTitle: {
    fontSize: 11,
    fontWeight: "900",
    color: "#E11D48",
    letterSpacing: 0.5,
  },
  recProofSub: {
    fontSize: 11.5,
    color: "#475569",
    lineHeight: 16,
    marginBottom: 10,
  },
  recActivePill: {
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
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E11D48",
  },
  recActivePillText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#BE123C",
  },
  recAutoNote: {
    fontSize: 10.5,
    color: "#64748B",
    marginTop: 2,
  },
  contextBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 16,
  },
  contextText: {
    fontSize: 12,
    flex: 1,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 12,
  },
  pillarsList: {
    gap: 10,
    marginBottom: 16,
  },
  pillarCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  pillarIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  pillarContent: {
    flex: 1,
  },
  pillarTitle: {
    fontSize: 13.5,
    fontWeight: "700",
    marginBottom: 3,
  },
  pillarDesc: {
    fontSize: 12,
    lineHeight: 17,
  },
  helplineCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 4,
  },
  helplineTitle: {
    fontSize: 12.5,
    fontWeight: "800",
    color: "#0369A1",
  },
  helplineSub: {
    fontSize: 11,
    color: "#0284C7",
    marginTop: 2,
  },
  callSafetyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#0284C7",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 6,
  },
  callSafetyBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
  },
  acknowledgeBtn: {
    borderRadius: 14,
    overflow: "hidden",
  },
  acknowledgeBtnGrad: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
  },
  acknowledgeBtnText: {
    color: "#FFFFFF",
    fontSize: 14.5,
    fontWeight: "800",
  },
});
