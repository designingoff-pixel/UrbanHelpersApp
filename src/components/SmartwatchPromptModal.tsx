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

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={resetAndClose}
    >
      <View style={s.overlay}>
        <Pressable style={s.backdrop} onPress={resetAndClose} />

        <View style={s.modalBox}>
          {/* Top Decorative Handle */}
          <View style={s.handle} />

          {pairingState === "prompt" && (
            <>
              {/* Watch Illustration with Glowing Ring */}
              <View style={s.iconRingOuter}>
                <LinearGradient
                  colors={["#4f46e5", "#7c3aed", "#ec4899"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={s.iconRing}
                >
                  <MaterialCommunityIcons name="watch-vibrate" size={44} color="#ffffff" />
                </LinearGradient>
                <View style={s.bluetoothBadge}>
                  <Ionicons name="bluetooth" size={14} color="#ffffff" />
                </View>
              </View>

              {/* Tag Pill */}
              <View style={s.pillBadge}>
                <Ionicons name="hardware-chip-outline" size={12} color="#a78bfa" />
                <Text style={s.pillBadgeText}>HARDWARE SENSOR REQUIRED</Text>
              </View>

              {/* Title & Description */}
              <Text style={s.title}>{featureName}</Text>
              <Text style={s.sub}>
                This health metric requires a paired smartwatch with optical PPG & bio-sensors to stream real-time telemetry.
              </Text>

              {/* Feature Points */}
              <View style={s.pointsBox}>
                <View style={s.pointRow}>
                  <Ionicons name="pulse" size={16} color="#ec4899" />
                  <Text style={s.pointText}>Continuous optical pulse & HRV measurements</Text>
                </View>
                <View style={s.pointRow}>
                  <Ionicons name="water" size={16} color="#38bdf8" />
                  <Text style={s.pointText}>Continuous SpO2 & nocturnal blood oxygen levels</Text>
                </View>
                <View style={s.pointRow}>
                  <Ionicons name="moon" size={16} color="#a855f7" />
                  <Text style={s.pointText}>Accurate REM, deep sleep & circadian rhythm staging</Text>
                </View>
              </View>

              {/* Primary Action: Connect Smartwatch */}
              <Pressable style={s.connectBtn} onPress={handleStartScan}>
                <LinearGradient
                  colors={["#6366f1", "#8b5cf6"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={s.connectBtnGrad}
                >
                  <Ionicons name="bluetooth" size={18} color="#ffffff" />
                  <Text style={s.connectBtnText}>Connect My Smartwatch</Text>
                </LinearGradient>
              </Pressable>

              {/* Secondary Action: Buy Smartwatch */}
              <Pressable
                style={s.buyBtn}
                onPress={() => {
                  resetAndClose();
                  if (onBuyWatch) onBuyWatch();
                }}
              >
                <View style={s.buyBtnContent}>
                  <MaterialCommunityIcons name="watch" size={18} color="#fbbf24" />
                  <Text style={s.buyBtnText}>Buy Health Watch (15% Off)</Text>
                  <Ionicons name="arrow-forward" size={15} color="#fbbf24" />
                </View>
              </Pressable>

              {/* Tertiary Action: Preview with Demo Data */}
              <Pressable
                style={s.demoBtn}
                onPress={() => {
                  resetAndClose();
                  if (onContinueDemo) onContinueDemo();
                }}
              >
                <Text style={s.demoBtnText}>Preview with Demo Data</Text>
              </Pressable>
            </>
          )}

          {pairingState === "scanning" && (
            <View style={s.scanningBox}>
              <ActivityIndicator size="large" color="#8b5cf6" style={{ marginBottom: 16 }} />
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
                      <MaterialCommunityIcons name="watch" size={20} color="#a78bfa" />
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
                <Ionicons name="checkmark" size={32} color="#10b981" />
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
    backgroundColor: "rgba(0,0,0,0.72)",
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalBox: {
    backgroundColor: "#161626",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 32,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginBottom: 20,
  },
  iconRingOuter: {
    position: "relative",
    marginBottom: 16,
  },
  iconRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#7c3aed",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  bluetoothBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#3b82f6",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#161626",
  },
  pillBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(167,139,250,0.12)",
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  pillBadgeText: {
    fontSize: 10.5,
    fontWeight: "800",
    color: "#a78bfa",
    letterSpacing: 0.8,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 8,
  },
  sub: {
    fontSize: 13,
    color: "rgba(255,255,255,0.65)",
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 18,
  },
  pointsBox: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 16,
    padding: 14,
    gap: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  pointRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  pointText: {
    fontSize: 12.5,
    color: "rgba(255,255,255,0.85)",
    flex: 1,
  },
  connectBtn: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 10,
  },
  connectBtnGrad: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
  },
  connectBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#ffffff",
  },
  buyBtn: {
    width: "100%",
    backgroundColor: "rgba(251,191,36,0.1)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(251,191,36,0.3)",
    paddingVertical: 13,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  buyBtnContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  buyBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fbbf24",
  },
  demoBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  demoBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: "rgba(255,255,255,0.45)",
    textDecorationLine: "underline",
  },
  scanningBox: {
    width: "100%",
    alignItems: "center",
    paddingVertical: 16,
  },
  scanningTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 6,
  },
  scanningSub: {
    fontSize: 12.5,
    color: "rgba(255,255,255,0.6)",
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 16,
  },
  deviceList: {
    width: "100%",
    gap: 8,
    marginBottom: 16,
  },
  deviceListTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#a78bfa",
    marginBottom: 4,
  },
  deviceItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(255,255,255,0.06)",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  deviceName: {
    fontSize: 13.5,
    fontWeight: "600",
    color: "#ffffff",
    flex: 1,
  },
  pairBadge: {
    backgroundColor: "#7c3aed",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  pairBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#ffffff",
  },
  searchingText: {
    fontSize: 12.5,
    color: "rgba(255,255,255,0.4)",
    fontStyle: "italic",
    marginBottom: 16,
  },
  cancelScanBtn: {
    paddingVertical: 8,
    paddingHorizontal: 18,
  },
  cancelScanText: {
    fontSize: 13,
    color: "rgba(255,255,255,0.5)",
  },
  pairedBox: {
    width: "100%",
    alignItems: "center",
    paddingVertical: 24,
  },
  successCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(16,185,129,0.15)",
    borderWidth: 2,
    borderColor: "#10b981",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  pairedTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#10b981",
    marginBottom: 6,
  },
  pairedSub: {
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
    textAlign: "center",
    lineHeight: 18,
  },
});
