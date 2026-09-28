import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { colors } from "@/theme/colors";
import { BleManager } from "@/services/ble/BleManager";
import { ConnectedDeviceInfo, ConnectionState } from "@/services/ble/types";

export default function MyDevicesCard() {
  const navigation = useNavigation<any>();
  const [deviceInfo, setDeviceInfo] = useState<ConnectedDeviceInfo | null>(BleManager.getDeviceInfo());
  const [connState, setConnState] = useState<ConnectionState>(BleManager.getConnectionState());

  useEffect(() => {
    // Check auto-reconnect on mount if previously paired
    BleManager.checkAutoConnect();

    const unsub = BleManager.subscribeRepository(() => {
      setDeviceInfo(BleManager.getDeviceInfo());
      setConnState(BleManager.getConnectionState());
    });
    return unsub;
  }, []);

  const isConnected = connState === "connected";

  const formatLastSync = (timestamp?: number) => {
    if (!timestamp) return "Never";
    const diff = Math.floor((Date.now() - timestamp) / 1000);
    if (diff < 30) return "Just now";
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <View style={s.container}>
      <View style={s.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={s.title}>My Devices</Text>
          <Text style={s.subtitle}>
            Connect your smartwatch and track your health data
          </Text>
        </View>
        <Pressable
          style={s.iconButton}
          onPress={() => navigation.navigate("ConnectWatch")}
        >
          <Ionicons name="bluetooth" size={18} color={colors.secondary} />
        </Pressable>
      </View>

      <View style={s.divider} />

      {isConnected && deviceInfo ? (
        <View style={s.deviceCard}>
          <View style={s.deviceRow}>
            <View style={s.watchIconWrap}>
              <MaterialCommunityIcons name="watch" size={28} color={colors.secondary} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <View style={s.titleStatusRow}>
                <Text style={s.deviceName}>{deviceInfo.name}</Text>
                <View style={s.statusBadge}>
                  <View style={s.greenDot} />
                  <Text style={s.statusText}>Connected</Text>
                </View>
              </View>

              <View style={s.metaRow}>
                <Text style={s.metaText}>
                  Last synced: {formatLastSync(deviceInfo.lastSyncedAt)}
                </Text>
                {deviceInfo.batteryPercent != null && (
                  <Text style={s.metaText}> • Battery: {deviceInfo.batteryPercent}%</Text>
                )}
              </View>
            </View>
          </View>

          <View style={s.actionRow}>
            <Pressable
              style={s.manageBtn}
              onPress={() => navigation.navigate("DeviceDetails")}
            >
              <Text style={s.manageBtnText}>Manage Device</Text>
            </Pressable>

            <Pressable
              style={s.addNewBtn}
              onPress={() => navigation.navigate("ConnectWatch")}
            >
              <Ionicons name="add" size={16} color={colors.primary} />
              <Text style={s.addNewBtnText}>Connect New Device</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <View style={s.emptyWrap}>
          <Text style={s.emptyDesc}>
            Connect a compatible smartwatch to automatically track your health data.
          </Text>
          <Pressable
            style={s.connectWatchBtn}
            onPress={() => navigation.navigate("ConnectWatch")}
          >
            <Ionicons name="add-circle-outline" size={18} color="#041423" style={{ marginRight: 6 }} />
            <Text style={s.connectWatchBtnText}>+ Connect Watch</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    backgroundColor: colors.surface.container,
    borderRadius: 22,
    padding: 18,
    marginHorizontal: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: 12,
    color: colors.text.muted,
    marginTop: 2,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface.containerHigh,
    justifyContent: "center",
    alignItems: "center",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.07)",
    marginVertical: 14,
  },
  deviceCard: {
    backgroundColor: colors.surface.containerLow,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(79, 219, 200, 0.2)",
  },
  deviceRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  watchIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(79, 219, 200, 0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
  titleStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  deviceName: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text.primary,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(74, 222, 128, 0.12)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#4ade80",
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#4ade80",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  metaText: {
    fontSize: 11,
    color: colors.text.muted,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.05)",
    paddingTop: 12,
  },
  manageBtn: {
    flex: 1,
    backgroundColor: colors.secondary,
    paddingVertical: 9,
    borderRadius: 12,
    alignItems: "center",
  },
  manageBtnText: {
    color: "#041423",
    fontSize: 13,
    fontWeight: "700",
  },
  addNewBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: colors.surface.containerHighest,
    gap: 4,
  },
  addNewBtnText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "600",
  },
  emptyWrap: {
    alignItems: "center",
    paddingVertical: 6,
  },
  emptyDesc: {
    fontSize: 13,
    color: colors.text.secondary,
    textAlign: "center",
    marginBottom: 14,
    lineHeight: 18,
  },
  connectWatchBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.secondary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 16,
  },
  connectWatchBtnText: {
    color: "#041423",
    fontSize: 13,
    fontWeight: "700",
  },
});
