import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path, Circle, Rect, Polyline } from "react-native-svg";

const { width: SW } = Dimensions.get("window");

interface Props {
  visible: boolean;
  onClose: () => void;
  featureName: string;
  onConnectSuccess?: () => void;
  onBuyWatch?: () => void;
  onContinueDemo?: () => void;
}

export default function SmartwatchPromptModal({
  visible,
  onClose,
  featureName,
  onConnectSuccess,
  onBuyWatch,
  onContinueDemo,
}: Props) {
  const [pairingState, setPairingState] = useState<"prompt" | "scanning" | "paired">("prompt");
  const [discoveredDevices, setDiscoveredDevices] = useState<string[]>([]);

  const handleStartScan = () => {
    setPairingState("scanning");
    setTimeout(() => {
      setDiscoveredDevices(["Galaxy Watch Ultra 2 (BLE)", "Urban Helpers Health Band", "Apple Watch Series 9"]);
    }, 1200);
  };

  const handlePairDevice = (device: string) => {
    setPairingState("paired");
    setTimeout(() => {
      setPairingState("prompt");
      onClose();
      if (onConnectSuccess) onConnectSuccess();
    }, 1500);
  };

  const resetAndClose = () => {
    setPairingState("prompt");
    setDiscoveredDevices([]);
    onClose();
  };

  const displayTitle = featureName ? featureName : "Heart Health & ECG Score";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={resetAndClose}
    >
      <View style={s.overlay}>
        <Pressable style={s.backdrop} onPress={resetAndClose} />

        <View style={s.modalCard}>
          {/* Top Handle */}
          <View style={s.handle} />

          {/* Top Bar: AI Powered Badge & Close Button */}
          <View style={s.topBarRow}>
            <View style={s.aiBadge}>
              <Ionicons name="sparkles" size={13} color="#15803d" />
              <Text style={s.aiBadgeText}>AI Powered</Text>
            </View>

            <Pressable style={s.closeBtn} onPress={resetAndClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close" size={18} color="#475569" />
            </Pressable>
          </View>

          {pairingState === "prompt" && (
            <>
              {/* Hero Section: Left Text + Right Smartwatch Graphic */}
              <View style={s.heroRow}>
                <View style={s.heroTextCol}>
                  <Text style={s.heroTitle}>{displayTitle}</Text>
                  <Text style={s.heroSub}>
                    Get advanced heart monitoring with optical PPG & bio-sensors for real-time telemetry.
                  </Text>
                </View>

                {/* Smartwatch Illustration matching Reference Photo */}
                <View style={s.watchGraphicWrap}>
                  {/* Soft Background Leaf/Aura */}
                  <View style={s.leafAuraOuter}>
                    <View style={s.leafAura1} />
                    <View style={s.leafAura2} />
                  </View>

                  {/* Smartwatch Body */}
                  <View style={s.watchBody}>
                    <View style={s.watchScreen}>
                      {/* Top Heart Rate readout */}
                      <View style={s.watchScreenHeader}>
                        <Ionicons name="heart" size={12} color="#f43f5e" />
                        <Text style={s.watchBpmText}>
                          72 <Text style={s.watchBpmUnit}>bpm</Text>
                        </Text>
                      </View>

                      {/* Green ECG Wave */}
                      <Svg height="16" width="48" viewBox="0 0 48 16">
                        <Polyline
                          points="0,8 10,8 14,2 18,14 22,5 26,11 30,8 48,8"
                          fill="none"
                          stroke="#22c55e"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </Svg>
                    </View>
                  </View>

                  {/* Bluetooth Badge */}
                  <View style={s.watchBtBadge}>
                    <Ionicons name="bluetooth" size={13} color="#ffffff" />
                  </View>
                </View>
              </View>

              {/* 3 Feature Highlights (Rows with soft circle badges) */}
              <View style={s.featuresList}>
                {/* 1. Continuous Monitoring */}
                <View style={s.featureRow}>
                  <View style={[s.featureIconCircle, { backgroundColor: "#fee2e2" }]}>
                    <Ionicons name="pulse" size={20} color="#ec4899" />
                  </View>
                  <View style={s.featureTextCol}>
                    <Text style={s.featureTitle}>Continuous Monitoring</Text>
                    <Text style={s.featureSub}>Track your heart rate & HRV with precision.</Text>
                  </View>
                </View>

                {/* 2. SpO2 Tracking */}
                <View style={s.featureRow}>
                  <View style={[s.featureIconCircle, { backgroundColor: "#e0f2fe" }]}>
                    <Ionicons name="water" size={20} color="#0284c7" />
                  </View>
                  <View style={s.featureTextCol}>
                    <Text style={s.featureTitle}>SpO2 Tracking</Text>
                    <Text style={s.featureSub}>Monitor your blood oxygen levels 24/7.</Text>
                  </View>
                </View>

                {/* 3. Sleep & Recovery */}
                <View style={s.featureRow}>
                  <View style={[s.featureIconCircle, { backgroundColor: "#f3e8ff" }]}>
                    <Ionicons name="moon" size={20} color="#9333ea" />
                  </View>
                  <View style={s.featureTextCol}>
                    <Text style={s.featureTitle}>Sleep & Recovery</Text>
                    <Text style={s.featureSub}>Understand your sleep patterns and recovery status.</Text>
                  </View>
                </View>
              </View>

              {/* Promo Mint Capsule Banner */}
              <Pressable
                style={s.promoBanner}
                onPress={() => {
                  resetAndClose();
                  if (onBuyWatch) onBuyWatch();
                }}
              >
                <View style={s.promoSmarterIcon}>
                  <Ionicons name="sparkles" size={14} color="#059669" />
                </View>
                <View style={s.promoTextCol}>
                  <Text style={s.promoTitle}>Your health, smarter</Text>
                  <Text style={s.promoSub}>Real-time insights. Better decisions.</Text>
                </View>
                <View style={s.promoArrowBtn}>
                  <Ionicons name="arrow-forward" size={14} color="#065f46" />
                </View>
              </Pressable>

              {/* Main CTA: Connect My Smartwatch (Forest Green Pill Button) */}
              <Pressable style={s.connectMainBtn} onPress={handleStartScan}>
                <LinearGradient
                  colors={["#166534", "#14532d"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={s.connectMainBtnGrad}
                >
                  <MaterialCommunityIcons name="watch" size={20} color="#ffffff" />
                  <Text style={s.connectMainBtnText}>Connect My Smartwatch</Text>
                  <Ionicons name="arrow-forward" size={18} color="#ffffff" style={{ marginLeft: 4 }} />
                </LinearGradient>
              </Pressable>

              {/* Tertiary Action: Preview with Demo Data */}
              <Pressable
                style={s.demoLink}
                onPress={() => {
                  resetAndClose();
                  if (onContinueDemo) onContinueDemo();
                }}
              >
                <Text style={s.demoLinkText}>Preview with Demo Data</Text>
              </Pressable>
            </>
          )}

          {pairingState === "scanning" && (
            <View style={s.scanningBox}>
              <ActivityIndicator size="large" color="#166534" style={{ marginBottom: 16 }} />
              <Text style={s.scanningTitle}>Scanning for Bluetooth Devices...</Text>
              <Text style={s.scanningSub}>Ensure your Galaxy Watch, Apple Watch, or Health Band is nearby and in pairing mode.</Text>

              {discoveredDevices.length > 0 ? (
                <View style={s.deviceList}>
                  <Text style={s.deviceListTitle}>Discovered Devices:</Text>
                  {discoveredDevices.map((dev, i) => (
                    <Pressable
                      key={i}
                      style={s.deviceItem}
                      onPress={() => handlePairDevice(dev)}
                    >
                      <MaterialCommunityIcons name="watch" size={20} color="#166534" />
                      <Text style={s.deviceName}>{dev}</Text>
                      <View style={s.pairBadge}>
                        <Text style={s.pairBadgeText}>Pair</Text>
                      </View>
                    </Pressable>
                  ))}
                </View>
              ) : (
                <Text style={s.searchingText}>Searching nearby BLE signals...</Text>
              )}

              <Pressable style={s.cancelScanBtn} onPress={() => setPairingState("prompt")}>
                <Text style={s.cancelScanText}>Cancel</Text>
              </Pressable>
            </View>
          )}

          {pairingState === "paired" && (
            <View style={s.pairedBox}>
              <View style={s.successCircle}>
                <Ionicons name="checkmark" size={32} color="#16a34a" />
              </View>
              <Text style={s.pairedTitle}>Smartwatch Paired!</Text>
              <Text style={s.pairedSub}>Live sensor telemetry is now streaming to your Urban Helpers dashboard.</Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.75)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalCard: {
    width: "100%",
    maxWidth: 390,
    backgroundColor: "#ffffff",
    borderRadius: 32,
    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom: 22,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 16,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#cbd5e1",
    alignSelf: "center",
    marginBottom: 12,
  },
  topBarRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  aiBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#dcfce7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },
  aiBadgeText: {
    fontSize: 11.5,
    fontWeight: "700",
    color: "#15803d",
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
  },

  // Hero Section
  heroRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  heroTextCol: {
    flex: 1,
    paddingRight: 10,
  },
  heroTitle: {
    fontSize: 21,
    fontWeight: "800",
    color: "#0f172a",
    lineHeight: 27,
  },
  heroSub: {
    fontSize: 12.5,
    color: "#64748b",
    lineHeight: 17,
    marginTop: 6,
  },

  // Smartwatch Graphic
  watchGraphicWrap: {
    width: 90,
    height: 90,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  leafAuraOuter: {
    position: "absolute",
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: "rgba(220, 252, 231, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  leafAura1: {
    position: "absolute",
    top: -4,
    right: 8,
    width: 22,
    height: 36,
    borderRadius: 14,
    backgroundColor: "#86efac",
    transform: [{ rotate: "30deg" }],
    opacity: 0.6,
  },
  leafAura2: {
    position: "absolute",
    bottom: 0,
    left: 4,
    width: 26,
    height: 34,
    borderRadius: 14,
    backgroundColor: "#bbf7d0",
    transform: [{ rotate: "-35deg" }],
    opacity: 0.8,
  },
  watchBody: {
    width: 62,
    height: 72,
    borderRadius: 16,
    backgroundColor: "#1e293b",
    padding: 3,
    borderWidth: 2,
    borderColor: "#334155",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  watchScreen: {
    flex: 1,
    width: "100%",
    backgroundColor: "#090d16",
    borderRadius: 12,
    padding: 4,
    alignItems: "center",
    justifyContent: "space-around",
  },
  watchScreenHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  watchBpmText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#ffffff",
  },
  watchBpmUnit: {
    fontSize: 7,
    color: "rgba(255,255,255,0.7)",
  },
  watchBtBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#8b5cf6",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#ffffff",
    elevation: 4,
  },

  // Features List
  featuresList: {
    backgroundColor: "#f8fafc",
    borderRadius: 20,
    padding: 12,
    gap: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  featureIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  featureTextCol: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 1,
  },
  featureSub: {
    fontSize: 11.5,
    color: "#64748b",
    lineHeight: 15,
  },

  // Promo Mint Banner
  promoBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ecfdf5",
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#a7f3d0",
    marginBottom: 14,
  },
  promoSmarterIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#d1fae5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  promoTextCol: {
    flex: 1,
  },
  promoTitle: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#065f46",
  },
  promoSub: {
    fontSize: 11,
    color: "#047857",
  },
  promoArrowBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#d1fae5",
    justifyContent: "center",
    alignItems: "center",
  },

  // Main CTA Button
  connectMainBtn: {
    width: "100%",
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#14532d",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  connectMainBtnGrad: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 13,
    paddingHorizontal: 16,
  },
  connectMainBtnText: {
    fontSize: 14.5,
    fontWeight: "700",
    color: "#ffffff",
  },

  // Demo Link
  demoLink: {
    alignSelf: "center",
    paddingVertical: 6,
    marginTop: 4,
  },
  demoLinkText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#94a3b8",
  },

  // Scanning & Paired States
  scanningBox: {
    width: "100%",
    alignItems: "center",
    paddingVertical: 16,
  },
  scanningTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 6,
  },
  scanningSub: {
    fontSize: 12,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 17,
    marginBottom: 14,
  },
  deviceList: {
    width: "100%",
    gap: 8,
    marginBottom: 14,
  },
  deviceListTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#166534",
    marginBottom: 2,
  },
  deviceItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#f8fafc",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  deviceName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0f172a",
    flex: 1,
  },
  pairBadge: {
    backgroundColor: "#166534",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  pairBadgeText: {
    fontSize: 10.5,
    fontWeight: "700",
    color: "#ffffff",
  },
  searchingText: {
    fontSize: 12,
    color: "#94a3b8",
    fontStyle: "italic",
    marginBottom: 14,
  },
  cancelScanBtn: {
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  cancelScanText: {
    fontSize: 12.5,
    color: "#64748b",
  },
  pairedBox: {
    width: "100%",
    alignItems: "center",
    paddingVertical: 20,
  },
  successCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#dcfce7",
    borderWidth: 2,
    borderColor: "#16a34a",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  pairedTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#15803d",
    marginBottom: 4,
  },
  pairedSub: {
    fontSize: 12.5,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 17,
  },
});
