import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  FlatList,
  Alert,
  Clipboard,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/types";
import { colors } from "@/theme/colors";
import { BleManager } from "@/services/ble/BleManager";
import { NativeBle } from "../../../modules/urban-ble";
import {
  BleCharacteristicInfo,
  BleLogEntry,
  BleServiceInfo,
  ConnectedDeviceInfo,
  ConnectionState,
} from "@/services/ble/types";

type Props = NativeStackScreenProps<RootStackParamList, "BleDiagnostics">;

export default function BleDiagnosticsScreen({ navigation }: Props) {
  const [deviceInfo, setDeviceInfo] = useState<ConnectedDeviceInfo | null>(BleManager.getDeviceInfo());
  const [connState, setConnState] = useState<ConnectionState>(BleManager.getConnectionState());
  const [services, setServices] = useState<BleServiceInfo[]>(BleManager.getServices());
  const [logs, setLogs] = useState<BleLogEntry[]>(BleManager.getLogs());
  const [activeTab, setActiveTab] = useState<"services" | "logs">("services");
  const [expandedServices, setExpandedServices] = useState<Set<string>>(new Set());

  useEffect(() => {
    const unsub = BleManager.subscribeRepository(() => {
      setDeviceInfo(BleManager.getDeviceInfo());
      setConnState(BleManager.getConnectionState());
      setServices(BleManager.getServices());
      setLogs(BleManager.getLogs());
    });
    return unsub;
  }, []);

  const toggleExpand = (uuid: string) => {
    setExpandedServices((prev) => {
      const next = new Set(prev);
      if (next.has(uuid)) {
        next.delete(uuid);
      } else {
        next.add(uuid);
      }
      return next;
    });
  };

  const handleReadChar = (serviceUuid: string, charUuid: string) => {
    const success = NativeBle.readCharacteristic(serviceUuid, charUuid);
    if (!success) {
      Alert.alert("Read Error", "Could not send read request to characteristic.");
    }
  };

  const handleSubscribeChar = (serviceUuid: string, charUuid: string, isIndicatable: boolean) => {
    const success = NativeBle.subscribeCharacteristic(serviceUuid, charUuid, isIndicatable);
    if (success) {
      Alert.alert("Subscribed", `Listening for notifications on ${charUuid.slice(0, 8)}...`);
    } else {
      Alert.alert("Subscribe Error", "Could not subscribe to characteristic.");
    }
  };

  const handleCopyLogs = () => {
    const text = logs
      .map(
        (l) =>
          `[${new Date(l.timestamp).toLocaleTimeString()}] [${l.level.toUpperCase()}] [${l.tag}] ${l.message} ${
            l.dataHex ? `HEX: ${l.dataHex}` : ""
          }`
      )
      .join("\n");
    Clipboard.setString(text);
    Alert.alert("Copied", "Diagnostic logs copied to clipboard.");
  };

  const isConnected = connState === "connected";

  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={22} color={colors.text.primary} />
        </Pressable>
        <View style={s.headerTextWrap}>
          <Text style={s.headerTitle}>BLE Diagnostics</Text>
          <Text style={s.headerSubtitle}>GATT Protocol & Raw Packet Inspector</Text>
        </View>
        <Pressable
          onPress={() => NativeBle.readRssi()}
          style={s.refreshBtn}
        >
          <Ionicons name="refresh" size={18} color={colors.secondary} />
        </Pressable>
      </View>

      {/* Device Info Summary Bar */}
      <View style={s.summaryBar}>
        <View style={s.summaryCol}>
          <Text style={s.summaryLabel}>DEVICE</Text>
          <Text style={s.summaryVal} numberOfLines={1}>
            {deviceInfo?.name || "No Device"}
          </Text>
        </View>

        <View style={s.summaryCol}>
          <Text style={s.summaryLabel}>MAC ADDRESS</Text>
          <Text style={s.summaryValMono} numberOfLines={1}>
            {deviceInfo?.id || "--:--:--:--:--:--"}
          </Text>
        </View>

        <View style={s.summaryCol}>
          <Text style={s.summaryLabel}>STATE / RSSI</Text>
          <Text
            style={[
              s.summaryVal,
              { color: isConnected ? "#4ade80" : "#f87171" },
            ]}
          >
            {connState.toUpperCase()}{" "}
            {deviceInfo?.rssi != null ? `(${deviceInfo.rssi} dBm)` : ""}
          </Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={s.tabBar}>
        <Pressable
          style={[s.tabItem, activeTab === "services" && s.tabItemActive]}
          onPress={() => setActiveTab("services")}
        >
          <Ionicons
            name="layers-outline"
            size={16}
            color={activeTab === "services" ? colors.secondary : colors.text.muted}
          />
          <Text
            style={[s.tabText, activeTab === "services" && s.tabTextActive]}
          >
            Services & Chars ({services.length})
          </Text>
        </Pressable>

        <Pressable
          style={[s.tabItem, activeTab === "logs" && s.tabItemActive]}
          onPress={() => setActiveTab("logs")}
        >
          <Ionicons
            name="terminal-outline"
            size={16}
            color={activeTab === "logs" ? colors.secondary : colors.text.muted}
          />
          <Text style={[s.tabText, activeTab === "logs" && s.tabTextActive]}>
            Live Log & Packets ({logs.length})
          </Text>
        </Pressable>
      </View>

      {/* Tab 1: Services Tree */}
      {activeTab === "services" && (
        <ScrollView style={s.content} showsVerticalScrollIndicator={false}>
          {services.length === 0 ? (
            <View style={s.emptyBox}>
              <MaterialCommunityIcons
                name="bluetooth-connect"
                size={40}
                color={colors.text.muted}
              />
              <Text style={s.emptyTitle}>No GATT Services Discovered</Text>
              <Text style={s.emptySubtitle}>
                Connect to Noise ColorFit Pulse to discover services and characteristics.
              </Text>
            </View>
          ) : (
            services.map((srv) => {
              const isExpanded = expandedServices.has(srv.uuid);
              return (
                <View key={srv.uuid} style={s.serviceCard}>
                  <Pressable
                    style={s.serviceHeader}
                    onPress={() => toggleExpand(srv.uuid)}
                  >
                    <View style={s.serviceIconWrap}>
                      <Ionicons
                        name={srv.isStandard ? "shield-checkmark" : "cube-outline"}
                        size={18}
                        color={srv.isStandard ? colors.secondary : colors.tertiary}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.serviceName}>{srv.name}</Text>
                      <Text style={s.serviceUuid}>{srv.uuid}</Text>
                    </View>
                    <Ionicons
                      name={isExpanded ? "chevron-up" : "chevron-down"}
                      size={20}
                      color={colors.text.muted}
                    />
                  </Pressable>

                  {isExpanded && (
                    <View style={s.charsContainer}>
                      {srv.characteristics.map((ch) => (
                        <View key={ch.uuid} style={s.charRow}>
                          <View style={s.charInfo}>
                            <Text style={s.charName}>{ch.name}</Text>
                            <Text style={s.charUuid}>{ch.uuid}</Text>

                            <View style={s.flagsRow}>
                              {ch.propertyFlags.map((flag, idx) => (
                                <View key={idx} style={s.flagBadge}>
                                  <Text style={s.flagText}>{flag}</Text>
                                </View>
                              ))}
                            </View>
                          </View>

                          <View style={s.charActions}>
                            {ch.isReadable && (
                              <Pressable
                                style={s.actionBtn}
                                onPress={() => handleReadChar(srv.uuid, ch.uuid)}
                              >
                                <Text style={s.actionBtnText}>Read</Text>
                              </Pressable>
                            )}
                            {(ch.isNotifiable || ch.isIndicatable) && (
                              <Pressable
                                style={[s.actionBtn, s.actionBtnNotify]}
                                onPress={() =>
                                  handleSubscribeChar(
                                    srv.uuid,
                                    ch.uuid,
                                    ch.isIndicatable && !ch.isNotifiable
                                  )
                                }
                              >
                                <Text style={s.actionBtnText}>Notify</Text>
                              </Pressable>
                            )}
                          </View>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              );
            })
          )}
          <View style={{ height: 40 }} />
        </ScrollView>
      )}

      {/* Tab 2: Live Log & Packets */}
      {activeTab === "logs" && (
        <View style={{ flex: 1 }}>
          <View style={s.logControlsRow}>
            <Text style={s.logTitle}>Recent BLE Events</Text>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <Pressable style={s.logActionBtn} onPress={handleCopyLogs}>
                <Ionicons name="copy-outline" size={14} color={colors.secondary} />
                <Text style={s.logActionBtnText}>Copy</Text>
              </Pressable>
              <Pressable
                style={s.logActionBtn}
                onPress={() => BleManager.syncNow()}
              >
                <Ionicons name="refresh" size={14} color={colors.primary} />
                <Text style={s.logActionBtnText}>Poll</Text>
              </Pressable>
            </View>
          </View>

          <FlatList
            data={logs}
            keyExtractor={(item) => item.id}
            contentContainerStyle={s.logsList}
            renderItem={({ item }) => {
              const isPacket = item.level === "packet";
              const isError = item.level === "error";
              const isWarn = item.level === "warn";

              return (
                <View
                  style={[
                    s.logItem,
                    isPacket && s.logItemPacket,
                    isError && s.logItemError,
                    isWarn && s.logItemWarn,
                  ]}
                >
                  <View style={s.logHeaderRow}>
                    <Text style={s.logTime}>
                      {new Date(item.timestamp).toLocaleTimeString()}
                    </Text>
                    <View style={s.logTagBadge}>
                      <Text style={s.logTagText}>{item.tag}</Text>
                    </View>
                  </View>

                  <Text style={s.logMessage}>{item.message}</Text>

                  {item.dataHex && (
                    <View style={s.hexBox}>
                      <Text style={s.hexLabel}>RAW HEX:</Text>
                      <Text style={s.hexVal}>{item.dataHex}</Text>
                    </View>
                  )}
                </View>
              );
            }}
          />
        </View>
      )}
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
  refreshBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface.containerHigh,
    justifyContent: "center",
    alignItems: "center",
  },
  summaryBar: {
    flexDirection: "row",
    backgroundColor: colors.surface.container,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.glass.border,
  },
  summaryCol: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: colors.text.muted,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  summaryVal: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.text.primary,
  },
  summaryValMono: {
    fontSize: 11,
    color: colors.secondary,
    fontFamily: "monospace",
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: colors.surface.containerLow,
    borderBottomWidth: 1,
    borderBottomColor: colors.glass.border,
  },
  tabItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
  },
  tabItemActive: {
    borderBottomWidth: 2,
    borderBottomColor: colors.secondary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text.muted,
  },
  tabTextActive: {
    color: colors.secondary,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  emptyBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 50,
    paddingHorizontal: 30,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text.secondary,
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 12,
    color: colors.text.muted,
    textAlign: "center",
    marginTop: 4,
  },
  serviceCard: {
    backgroundColor: colors.surface.container,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.glass.border,
    overflow: "hidden",
  },
  serviceHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 10,
  },
  serviceIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface.containerHigh,
    justifyContent: "center",
    alignItems: "center",
  },
  serviceName: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text.primary,
  },
  serviceUuid: {
    fontSize: 10,
    color: colors.text.muted,
    fontFamily: "monospace",
    marginTop: 2,
  },
  charsContainer: {
    backgroundColor: colors.surface.containerLow,
    borderTopWidth: 1,
    borderTopColor: colors.glass.border,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  charRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.04)",
  },
  charInfo: {
    flex: 1,
    marginRight: 8,
  },
  charName: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.text.primary,
  },
  charUuid: {
    fontSize: 10,
    color: colors.text.muted,
    fontFamily: "monospace",
    marginTop: 1,
  },
  flagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginTop: 4,
  },
  flagBadge: {
    backgroundColor: colors.surface.containerHighest,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  flagText: {
    fontSize: 9,
    fontWeight: "700",
    color: colors.text.secondary,
  },
  charActions: {
    flexDirection: "row",
    gap: 6,
  },
  actionBtn: {
    backgroundColor: colors.primaryContainer,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  actionBtnNotify: {
    backgroundColor: "rgba(79, 219, 200, 0.2)",
  },
  actionBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  logControlsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.glass.border,
  },
  logTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.text.primary,
  },
  logActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.surface.containerHigh,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  logActionBtnText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.text.primary,
  },
  logsList: {
    padding: 12,
  },
  logItem: {
    backgroundColor: colors.surface.container,
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  logItemPacket: {
    borderColor: "rgba(79, 219, 200, 0.3)",
  },
  logItemError: {
    borderColor: "rgba(248, 113, 113, 0.4)",
    backgroundColor: "rgba(248, 113, 113, 0.05)",
  },
  logItemWarn: {
    borderColor: "rgba(250, 204, 21, 0.3)",
  },
  logHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  logTime: {
    fontSize: 10,
    color: colors.text.muted,
  },
  logTagBadge: {
    backgroundColor: colors.surface.containerHigh,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  logTagText: {
    fontSize: 9,
    fontWeight: "700",
    color: colors.text.secondary,
  },
  logMessage: {
    fontSize: 12,
    color: colors.text.primary,
  },
  hexBox: {
    marginTop: 6,
    padding: 6,
    borderRadius: 6,
    backgroundColor: "#030a10",
  },
  hexLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: colors.secondary,
    marginBottom: 2,
  },
  hexVal: {
    fontSize: 10,
    color: colors.text.secondary,
    fontFamily: "monospace",
  },
});
