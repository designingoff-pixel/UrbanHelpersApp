import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  Platform,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/types";
import { colors } from "@/theme/colors";
import { BleManager } from "@/services/ble/BleManager";
import { BleDevice } from "@/services/ble/types";

type Props = NativeStackScreenProps<RootStackParamList, "ConnectWatch">;

export default function ConnectWatchScreen({ navigation }: Props) {
  const [isBtEnabled, setIsBtEnabled] = useState<boolean>(BleManager.isBluetoothEnabled());
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [devices, setDevices] = useState<BleDevice[]>([]);
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [permissionNoticeVisible, setPermissionNoticeVisible] = useState<boolean>(false);

  // Radar pulse animation
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Initial check
    checkBtState();

    // Subscribe to scan results
    const unsubscribeScanner = BleManager.subscribeScanner((discovered, scanning) => {
      setDevices(discovered);
      setIsScanning(scanning);
    });

    // Subscribe to repository for state
    const unsubscribeRepo = BleManager.subscribeRepository(() => {
      const state = BleManager.getConnectionState();
      if (state === "connected") {
        setConnectingId(null);
        navigation.replace("DeviceDetails");
      } else if (state === "disconnected" && connectingId) {
        setConnectingId(null);
      }
    });

    return () => {
      unsubscribeScanner();
      unsubscribeRepo();
      BleManager.stopScan();
    };
  }, [connectingId]);

  useEffect(() => {
    if (isScanning) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.35,
            duration: 900,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 900,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isScanning]);

  const checkBtState = () => {
    const enabled = BleManager.isBluetoothEnabled();
    setIsBtEnabled(enabled);
  };

  const handleEnableBluetooth = () => {
    const requested = BleManager.requestEnableBluetooth();
    if (!requested) {
      Alert.alert(
        "Bluetooth Required",
        "Please enable Bluetooth in your device settings to discover your smartwatch.",
        [{ text: "OK" }]
      );
    }
    setTimeout(checkBtState, 1500);
  };

  const handleStartScan = async () => {
    checkBtState();
    if (!BleManager.isBluetoothEnabled()) {
      Alert.alert(
        "Bluetooth is Disabled",
        "Bluetooth is required to connect your smartwatch. Please turn on Bluetooth.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Turn On Bluetooth", onPress: handleEnableBluetooth },
        ]
      );
      return;
    }

    const hasPerm = BleManager.checkPermissions();
    if (!hasPerm) {
      setPermissionNoticeVisible(true);
      return;
    }

    await proceedScanning();
  };

  const proceedScanning = async () => {
    setPermissionNoticeVisible(false);
    const granted = await BleManager.requestPermissions();
    if (!granted) {
      Alert.alert(
        "Permission Denied",
        "Bluetooth scanning and connection permissions are needed to detect your Noise ColorFit Pulse.",
        [{ text: "OK" }]
      );
      return;
    }

    const started = await BleManager.startScan(15000);
    if (!started) {
      Alert.alert("Scan Error", "Unable to start Bluetooth Low Energy scan. Please try again.");
    }
  };

  const handleConnect = async (device: BleDevice) => {
    try {
      setConnectingId(device.id);
      BleManager.stopScan();

      const success = await BleManager.connect(device.id, device.name);
      if (!success) {
        setConnectingId(null);
        Alert.alert(
          "Connection Failed",
          "Unable to connect to the watch. Make sure it is nearby, powered on, and not connected to another app."
        );
      }
    } catch (e: any) {
      setConnectingId(null);
      Alert.alert("Connection Error", e?.message || "Failed to initiate GATT connection.");
    }
  };

  const getRssiLabel = (rssi: number) => {
    if (rssi >= -65) return { text: "Strong", color: "#4ade80" };
    if (rssi >= -80) return { text: "Good", color: "#38bdf8" };
    if (rssi >= -90) return { text: "Fair", color: "#facc15" };
    return { text: "Weak", color: "#f87171" };
  };

  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={22} color={colors.text.primary} />
        </Pressable>
        <View style={s.headerTextWrap}>
          <Text style={s.headerTitle}>Connect Your Watch</Text>
          <Text style={s.headerSubtitle}>Direct Bluetooth Low Energy (BLE)</Text>
        </View>
        <Pressable
          onPress={() => navigation.navigate("BleDiagnostics")}
          style={s.diagBtn}
        >
          <Ionicons name="terminal-outline" size={20} color={colors.secondary} />
        </Pressable>
      </View>

      {/* Permission Explanation Modal */}
      {permissionNoticeVisible && (
        <View style={s.permissionBanner}>
          <Ionicons name="shield-checkmark" size={28} color={colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={s.permissionTitle}>Bluetooth Permission</Text>
            <Text style={s.permissionDesc}>
              Urban Helpers uses Bluetooth to find and connect to your smartwatch. Your health data is read directly from the connected device.
            </Text>
          </View>
          <Pressable style={s.permissionBtn} onPress={proceedScanning}>
            <Text style={s.permissionBtnText}>Continue</Text>
          </Pressable>
        </View>
      )}

      {/* Bluetooth State Banner */}
      <View style={[s.statusCard, isBtEnabled ? s.statusCardOn : s.statusCardOff]}>
        <View style={s.statusIconWrap}>
          <Ionicons
            name={isBtEnabled ? "bluetooth" : "bluetooth-outline"}
            size={22}
            color={isBtEnabled ? "#38bdf8" : "#f87171"}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.statusTitle}>
            {isBtEnabled ? "Bluetooth ON" : "Bluetooth OFF"}
          </Text>
          <Text style={s.statusDesc}>
            {isBtEnabled
              ? "Ready to discover nearby smartwatches"
              : "Bluetooth is required to connect your smartwatch."}
          </Text>
        </View>
        {!isBtEnabled && (
          <Pressable style={s.enableBtBtn} onPress={handleEnableBluetooth}>
            <Text style={s.enableBtBtnText}>Turn On</Text>
          </Pressable>
        )}
      </View>

      {/* Main Scan Trigger / Animated Radar */}
      <View style={s.radarSection}>
        <Animated.View
          style={[
            s.radarCircleOuter,
            {
              transform: [{ scale: pulseAnim }],
              borderColor: isScanning ? "rgba(79, 219, 200, 0.4)" : "rgba(180, 197, 255, 0.15)",
            },
          ]}
        >
          <View style={s.radarCircleInner}>
            <MaterialCommunityIcons
              name="watch-vibrate"
              size={48}
              color={isScanning ? colors.secondary : colors.primary}
            />
          </View>
        </Animated.View>

        <Text style={s.radarTitle}>
          {isScanning ? "Scanning for nearby BLE devices..." : "Connect Your Smartwatch"}
        </Text>
        <Text style={s.radarSubtitle}>
          Connect your smartwatch directly to Urban Helpers using Bluetooth.
        </Text>

        <Pressable
          style={[s.scanButton, isScanning && s.scanButtonScanning]}
          onPress={isScanning ? () => BleManager.stopScan() : handleStartScan}
        >
          {isScanning ? (
            <View style={s.btnContentRow}>
              <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={s.scanButtonText}>Stop Scanning</Text>
            </View>
          ) : (
            <View style={s.btnContentRow}>
              <Ionicons name="search" size={18} color="#041423" style={{ marginRight: 8 }} />
              <Text style={[s.scanButtonText, { color: "#041423" }]}>Scan for Devices</Text>
            </View>
          )}
        </Pressable>
      </View>

      {/* Devices List Section */}
      <View style={s.listHeaderRow}>
        <Text style={s.listTitle}>Available Devices</Text>
        {devices.length > 0 && (
          <Text style={s.deviceCount}>{devices.length} found</Text>
        )}
      </View>

      <FlatList
        data={devices}
        keyExtractor={(item) => item.id}
        contentContainerStyle={s.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !isScanning ? (
            <View style={s.emptyContainer}>
              <Ionicons name="hardware-chip-outline" size={40} color={colors.text.subtle} />
              <Text style={s.emptyTitle}>No compatible Bluetooth devices found nearby</Text>
              <Text style={s.emptySubtitle}>
                Make sure your ColorFit Pulse is awake and within 5 meters.
              </Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => {
          const rssiInfo = getRssiLabel(item.rssi);
          const isConnectingThis = connectingId === item.id;

          return (
            <View
              style={[
                s.deviceCard,
                item.isTargetDevice && s.targetDeviceCard,
              ]}
            >
              <View style={s.deviceIconCol}>
                <View
                  style={[
                    s.deviceIconWrap,
                    item.isTargetDevice && s.targetIconWrap,
                  ]}
                >
                  <MaterialCommunityIcons
                    name="watch"
                    size={26}
                    color={item.isTargetDevice ? colors.secondary : colors.primary}
                  />
                </View>
              </View>

              <View style={s.deviceInfoCol}>
                <View style={s.deviceTitleRow}>
                  <Text style={s.deviceName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  {item.isTargetDevice && (
                    <View style={s.targetBadge}>
                      <Text style={s.targetBadgeText}>ColorFit Target</Text>
                    </View>
                  )}
                </View>

                <Text style={s.deviceMac}>{item.id}</Text>

                <View style={s.rssiRow}>
                  <Ionicons name="cellular" size={13} color={rssiInfo.color} />
                  <Text style={[s.rssiText, { color: rssiInfo.color }]}>
                    {rssiInfo.text} ({item.rssi} dBm)
                  </Text>
                </View>
              </View>

              <View style={s.deviceActionCol}>
                <Pressable
                  disabled={!!connectingId}
                  onPress={() => handleConnect(item)}
                  style={[
                    s.connectBtn,
                    item.isTargetDevice ? s.targetConnectBtn : s.standardConnectBtn,
                    !!connectingId && s.disabledBtn,
                  ]}
                >
                  {isConnectingThis ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={s.connectBtnText}>Connect</Text>
                  )}
                </Pressable>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface.dim,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 54,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: colors.surface.containerLow,
    borderBottomWidth: 1,
    borderBottomColor: colors.glass.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface.containerHigh,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  headerTextWrap: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text.primary,
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2,
  },
  diagBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface.containerHigh,
    justifyContent: "center",
    alignItems: "center",
  },
  permissionBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    margin: 16,
    padding: 16,
    borderRadius: 16,
    backgroundColor: "rgba(180, 197, 255, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(180, 197, 255, 0.25)",
  },
  permissionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primary,
  },
  permissionDesc: {
    fontSize: 12,
    color: colors.text.secondary,
    lineHeight: 17,
    marginTop: 2,
  },
  permissionBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: colors.primaryContainer,
  },
  permissionBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  statusCard: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  statusCardOn: {
    backgroundColor: "rgba(56, 189, 248, 0.08)",
    borderColor: "rgba(56, 189, 248, 0.25)",
  },
  statusCardOff: {
    backgroundColor: "rgba(248, 113, 113, 0.1)",
    borderColor: "rgba(248, 113, 113, 0.3)",
  },
  statusIconWrap: {
    marginRight: 12,
  },
  statusTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text.primary,
  },
  statusDesc: {
    fontSize: 11,
    color: colors.text.secondary,
    marginTop: 2,
  },
  enableBtBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: "#f87171",
  },
  enableBtBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  radarSection: {
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  radarCircleOuter: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  radarCircleInner: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: colors.surface.containerHigh,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  radarTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.text.primary,
    marginBottom: 6,
    textAlign: "center",
  },
  radarSubtitle: {
    fontSize: 12,
    color: colors.text.muted,
    textAlign: "center",
    maxWidth: 290,
    marginBottom: 18,
    lineHeight: 18,
  },
  scanButton: {
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 24,
    backgroundColor: colors.secondary,
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  scanButtonScanning: {
    backgroundColor: "#ef4444",
  },
  scanButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  btnContentRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  listHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text.primary,
  },
  deviceCount: {
    fontSize: 12,
    color: colors.text.muted,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  deviceCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface.container,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  targetDeviceCard: {
    borderColor: "rgba(79, 219, 200, 0.45)",
    backgroundColor: "rgba(79, 219, 200, 0.06)",
  },
  deviceIconCol: {
    marginRight: 14,
  },
  deviceIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.surface.containerHigh,
    justifyContent: "center",
    alignItems: "center",
  },
  targetIconWrap: {
    backgroundColor: "rgba(79, 219, 200, 0.18)",
  },
  deviceInfoCol: {
    flex: 1,
  },
  deviceTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
  },
  deviceName: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text.primary,
    maxWidth: 150,
  },
  targetBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: "rgba(79, 219, 200, 0.2)",
  },
  targetBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.secondary,
  },
  deviceMac: {
    fontSize: 11,
    color: colors.text.muted,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    marginTop: 2,
  },
  rssiRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  rssiText: {
    fontSize: 11,
    fontWeight: "600",
  },
  deviceActionCol: {
    marginLeft: 10,
  },
  connectBtn: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 84,
  },
  targetConnectBtn: {
    backgroundColor: colors.secondary,
  },
  standardConnectBtn: {
    backgroundColor: colors.surface.containerHighest,
  },
  connectBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  disabledBtn: {
    opacity: 0.6,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 36,
    paddingHorizontal: 30,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.secondary,
    textAlign: "center",
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 12,
    color: colors.text.muted,
    textAlign: "center",
    marginTop: 4,
  },
});
