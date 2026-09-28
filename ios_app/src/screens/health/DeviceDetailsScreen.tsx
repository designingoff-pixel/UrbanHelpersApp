import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/types";
import { colors } from "@/theme/colors";
import { BleManager } from "@/services/ble/BleManager";
import { ConnectedDeviceInfo, ConnectionState, WearableHealthData } from "@/services/ble/types";

type Props = NativeStackScreenProps<RootStackParamList, "DeviceDetails">;

export default function DeviceDetailsScreen({ navigation }: Props) {
  const [deviceInfo, setDeviceInfo] = useState<ConnectedDeviceInfo | null>(BleManager.getDeviceInfo());
  const [connState, setConnState] = useState<ConnectionState>(BleManager.getConnectionState());
  const [healthData, setHealthData] = useState<WearableHealthData>(BleManager.getHealthData());
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  useEffect(() => {
    const unsub = BleManager.subscribeRepository(() => {
      setDeviceInfo(BleManager.getDeviceInfo());
      setConnState(BleManager.getConnectionState());
      setHealthData(BleManager.getHealthData());
    });
    return unsub;
  }, []);

  const handleSyncNow = async () => {
    setIsSyncing(true);
    await BleManager.syncNow();
    setTimeout(() => {
      setIsSyncing(false);
    }, 1200);
  };

  const handleDisconnect = () => {
    Alert.alert(
      "Disconnect Device",
      `Are you sure you want to disconnect ${deviceInfo?.name || "your smartwatch"}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Disconnect",
          style: "destructive",
          onPress: () => {
            BleManager.disconnect();
            navigation.goBack();
          },
        },
      ]
    );
  };

  const formatLastSync = (timestamp?: number) => {
    if (!timestamp) return "Never synced";
    const diff = Math.floor((Date.now() - timestamp) / 1000);
    if (diff < 30) return "Just now";
    if (diff < 60) return `${diff} seconds ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const isConnected = connState === "connected";
  const supported = deviceInfo?.supportedMetrics || [];
  const unavailable = deviceInfo?.unavailableMetrics || [
    "SpO2 (Blood Oxygen)",
    "Sleep Analysis",
    "Distance",
    "Calories",
  ];

  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={22} color={colors.text.primary} />
        </Pressable>
        <View style={s.headerTextWrap}>
          <Text style={s.headerTitle}>{deviceInfo?.name || "ColorFit Pulse"}</Text>
          <Text style={s.headerSubtitle}>Direct BLE Wearable</Text>
        </View>
        <Pressable
          onPress={() => navigation.navigate("BleDiagnostics")}
          style={s.diagBtn}
        >
          <Ionicons name="terminal-outline" size={20} color={colors.secondary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Device Hero Card */}
        <LinearGradient
          colors={["#0c1d2c", "#112130", "#182c3f"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.heroCard}
        >
          <View style={s.heroTopRow}>
            <View style={s.heroIconWrap}>
              <MaterialCommunityIcons name="watch" size={38} color={colors.secondary} />
            </View>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={s.heroName}>{deviceInfo?.name || "ColorFit Pulse"}</Text>
              <Text style={s.heroMac}>{deviceInfo?.id || "Direct GATT Connection"}</Text>
              <View style={s.statusRow}>
                <View
                  style={[
                    s.statusDot,
                    { backgroundColor: isConnected ? "#4ade80" : "#f87171" },
                  ]}
                />
                <Text
                  style={[
                    s.statusText,
                    { color: isConnected ? "#4ade80" : "#f87171" },
                  ]}
                >
                  {isConnected ? "Connected" : "Disconnected"}
                </Text>
              </View>
            </View>
          </View>

          <View style={s.heroDivider} />

          <View style={s.heroStatsRow}>
            {/* Battery */}
            <View style={s.statCol}>
              <Text style={s.statLabel}>BATTERY</Text>
              <View style={s.statValRow}>
                <Ionicons
                  name={
                    deviceInfo?.batteryPercent != null
                      ? deviceInfo.batteryPercent > 20
                        ? "battery-charging"
                        : "battery-dead"
                      : "battery-half"
                  }
                  size={16}
                  color={colors.primary}
                />
                <Text style={s.statValText}>
                  {deviceInfo?.batteryPercent != null
                    ? `${deviceInfo.batteryPercent}%`
                    : "Not available"}
                </Text>
              </View>
            </View>

            {/* Signal RSSI */}
            <View style={s.statCol}>
              <Text style={s.statLabel}>SIGNAL (RSSI)</Text>
              <View style={s.statValRow}>
                <Ionicons name="cellular" size={15} color={colors.secondary} />
                <Text style={s.statValText}>
                  {deviceInfo?.rssi != null ? `${deviceInfo.rssi} dBm` : "Active"}
                </Text>
              </View>
            </View>

            {/* Last Synced */}
            <View style={s.statCol}>
              <Text style={s.statLabel}>LAST SYNCED</Text>
              <View style={s.statValRow}>
                <Ionicons name="time-outline" size={15} color={colors.text.secondary} />
                <Text style={s.statValText}>
                  {formatLastSync(deviceInfo?.lastSyncedAt)}
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Real Live Metrics Card (Only shown if genuinely supported from watch) */}
        <Text style={s.sectionTitle}>Real-Time Watch Data</Text>

        <View style={s.metricsGrid}>
          {/* Heart Rate */}
          <View style={s.metricCard}>
            <View style={s.metricHeader}>
              <Ionicons name="heart" size={18} color="#ef4444" />
              <Text style={s.metricLabel}>Heart Rate</Text>
            </View>
            {healthData.heartRate.availability === "SUPPORTED" && healthData.heartRate.value != null ? (
              <View>
                <Text style={s.metricBigValue}>
                  {healthData.heartRate.value}{" "}
                  <Text style={s.metricUnit}>BPM</Text>
                </Text>
                <Text style={s.metricTimestamp}>
                  Real BLE GATT Stream
                </Text>
              </View>
            ) : (
              <View>
                <Text style={s.metricUnavailable}>
                  {healthData.heartRate.availability === "NOT_SUPPORTED"
                    ? "Not available from this device"
                    : "Waiting for pulse packet..."}
                </Text>
              </View>
            )}
          </View>

          {/* Steps */}
          <View style={s.metricCard}>
            <View style={s.metricHeader}>
              <Ionicons name="footsteps" size={18} color={colors.secondary} />
              <Text style={s.metricLabel}>Steps</Text>
            </View>
            {healthData.steps.availability === "SUPPORTED" && healthData.steps.value != null ? (
              <View>
                <Text style={s.metricBigValue}>
                  {healthData.steps.value.toLocaleString()}
                </Text>
                <Text style={s.metricTimestamp}>Today</Text>
              </View>
            ) : (
              <View>
                <Text style={s.metricUnavailable}>
                  {healthData.steps.availability === "NOT_SUPPORTED"
                    ? "Not available from this device"
                    : "Waiting for sync..."}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Supported Capabilities List */}
        <Text style={s.sectionTitle}>Confirmed Watch Capabilities</Text>
        <View style={s.capabilitiesCard}>
          <Text style={s.capSubtitle}>
            The following metrics are derived from actual BLE GATT services and characteristics:
          </Text>

          {supported.length > 0 ? (
            supported.map((item, idx) => (
              <View key={idx} style={s.capRow}>
                <Ionicons name="checkmark-circle" size={18} color="#4ade80" />
                <Text style={s.capTextSupported}>{item}</Text>
              </View>
            ))
          ) : (
            <View style={s.capRow}>
              <Ionicons name="checkmark-circle" size={18} color="#4ade80" />
              <Text style={s.capTextSupported}>Standard BLE GATT Connected</Text>
            </View>
          )}

          <View style={s.capDivider} />

          <Text style={[s.capSubtitle, { marginTop: 10 }]}>Not available from this device:</Text>
          {unavailable.map((item, idx) => (
            <View key={idx} style={s.capRow}>
              <Ionicons name="remove-circle-outline" size={18} color={colors.text.muted} />
              <Text style={s.capTextUnavailable}>{item}</Text>
            </View>
          ))}
        </View>

        {/* Action Buttons */}
        <View style={s.actionsWrap}>
          <Pressable
            disabled={!isConnected || isSyncing}
            style={[s.primaryActionBtn, (!isConnected || isSyncing) && s.disabledBtn]}
            onPress={handleSyncNow}
          >
            {isSyncing ? (
              <ActivityIndicator size="small" color="#041423" />
            ) : (
              <View style={s.btnContentRow}>
                <Ionicons name="sync" size={18} color="#041423" style={{ marginRight: 8 }} />
                <Text style={s.primaryActionText}>Sync Now</Text>
              </View>
            )}
          </Pressable>

          <Pressable
            style={s.diagnosticsBtn}
            onPress={() => navigation.navigate("BleDiagnostics")}
          >
            <View style={s.btnContentRow}>
              <Ionicons name="code-slash" size={18} color={colors.secondary} style={{ marginRight: 8 }} />
              <Text style={s.diagnosticsBtnText}>BLE Diagnostics & GATT Explorer</Text>
            </View>
          </Pressable>

          <Pressable style={s.disconnectBtn} onPress={handleDisconnect}>
            <View style={s.btnContentRow}>
              <Ionicons name="power" size={18} color="#f87171" style={{ marginRight: 8 }} />
              <Text style={s.disconnectBtnText}>Disconnect Device</Text>
            </View>
          </Pressable>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
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
  scrollContent: {
    padding: 16,
  },
  heroCard: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.glass.border,
    marginBottom: 24,
  },
  heroTopRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  heroIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(79, 219, 200, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  heroName: {
    fontSize: 19,
    fontWeight: "700",
    color: colors.text.primary,
  },
  heroMac: {
    fontSize: 12,
    color: colors.text.muted,
    fontFamily: "monospace",
    marginTop: 2,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
  },
  heroDivider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    marginVertical: 18,
  },
  heroStatsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statCol: {
    flex: 1,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.text.muted,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  statValRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  statValText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.text.primary,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text.primary,
    marginBottom: 12,
    marginLeft: 4,
  },
  metricsGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  metricCard: {
    flex: 1,
    backgroundColor: colors.surface.container,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  metricHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.text.secondary,
  },
  metricBigValue: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.text.primary,
  },
  metricUnit: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.text.muted,
  },
  metricTimestamp: {
    fontSize: 10,
    color: colors.text.muted,
    marginTop: 4,
  },
  metricUnavailable: {
    fontSize: 12,
    color: colors.text.muted,
    fontStyle: "italic",
    marginTop: 4,
  },
  capabilitiesCard: {
    backgroundColor: colors.surface.container,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.glass.border,
    marginBottom: 24,
  },
  capSubtitle: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 12,
  },
  capRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginVertical: 4,
  },
  capTextSupported: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.primary,
  },
  capTextUnavailable: {
    fontSize: 13,
    color: colors.text.muted,
  },
  capDivider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    marginVertical: 12,
  },
  actionsWrap: {
    gap: 12,
  },
  primaryActionBtn: {
    backgroundColor: colors.secondary,
    paddingVertical: 14,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  primaryActionText: {
    color: "#041423",
    fontSize: 14,
    fontWeight: "700",
  },
  diagnosticsBtn: {
    backgroundColor: "rgba(79, 219, 200, 0.12)",
    paddingVertical: 14,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(79, 219, 200, 0.3)",
  },
  diagnosticsBtnText: {
    color: colors.secondary,
    fontSize: 14,
    fontWeight: "700",
  },
  disconnectBtn: {
    backgroundColor: "rgba(248, 113, 113, 0.1)",
    paddingVertical: 14,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(248, 113, 113, 0.25)",
  },
  disconnectBtnText: {
    color: "#f87171",
    fontSize: 14,
    fontWeight: "700",
  },
  btnContentRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  disabledBtn: {
    opacity: 0.6,
  },
});
