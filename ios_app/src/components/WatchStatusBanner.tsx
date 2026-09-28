import React, { useState, useEffect } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { BleManager } from "@/services/ble/BleManager";
import { ConnectedDeviceInfo, ConnectionState } from "@/services/ble/types";

interface Props {
  onPressPrompt?: () => void;
  style?: any;
}

export default function WatchStatusBanner({ onPressPrompt, style }: Props) {
  const navigation = useNavigation<any>();
  const [connState, setConnState] = useState<ConnectionState>(BleManager.getConnectionState());
  const [deviceInfo, setDeviceInfo] = useState<ConnectedDeviceInfo | null>(BleManager.getDeviceInfo());

  useEffect(() => {
    const unsub = BleManager.subscribeRepository(() => {
      setConnState(BleManager.getConnectionState());
      setDeviceInfo(BleManager.getDeviceInfo());
    });
    return unsub;
  }, []);

  const isConnected = connState === "connected";

  const handlePress = () => {
    if (isConnected) {
      navigation.navigate("DeviceDetails");
    } else if (onPressPrompt) {
      onPressPrompt();
    } else {
      navigation.navigate("ConnectWatch");
    }
  };

  if (isConnected && deviceInfo) {
    return (
      <Pressable style={[s.banner, s.bannerConnected, style]} onPress={handlePress}>
        <View style={[s.iconWrap, s.iconWrapConnected]}>
          <MaterialCommunityIcons name="watch" size={18} color="#4ade80" />
        </View>
        <View style={s.textCol}>
          <Text style={[s.title, s.titleConnected]}>
            {deviceInfo.name} Connected
          </Text>
          <Text style={s.sub}>
            Direct BLE GATT • {deviceInfo.batteryPercent != null ? `Battery ${deviceInfo.batteryPercent}%` : "Signal Active"}
          </Text>
        </View>
        <View style={[s.actionBadge, s.actionBadgeConnected]}>
          <Text style={s.actionBadgeText}>Manage</Text>
          <Ionicons name="chevron-forward" size={12} color="#ffffff" />
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable style={[s.banner, style]} onPress={handlePress}>
      <View style={s.iconWrap}>
        <MaterialCommunityIcons name="watch-vibrate-off" size={18} color="#f59e0b" />
      </View>
      <View style={s.textCol}>
        <Text style={s.title}>Smartwatch Not Connected</Text>
        <Text style={s.sub}>Tap to connect Noise ColorFit Pulse or nearby BLE watch</Text>
      </View>
      <View style={s.actionBadge}>
        <Text style={s.actionBadgeText}>Connect</Text>
        <Ionicons name="chevron-forward" size={12} color="#ffffff" />
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(245,158,11,0.12)",
    borderWidth: 1,
    borderColor: "rgba(245,158,11,0.28)",
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 14,
    marginHorizontal: 16,
    marginBottom: 12,
    gap: 10,
  },
  bannerConnected: {
    backgroundColor: "rgba(74, 222, 128, 0.1)",
    borderColor: "rgba(74, 222, 128, 0.3)",
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(245,158,11,0.18)",
    justifyContent: "center",
    alignItems: "center",
  },
  iconWrapConnected: {
    backgroundColor: "rgba(74, 222, 128, 0.18)",
  },
  textCol: {
    flex: 1,
  },
  title: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#fbbf24",
  },
  titleConnected: {
    color: "#4ade80",
  },
  sub: {
    fontSize: 10.5,
    color: "rgba(255,255,255,0.6)",
    marginTop: 1,
  },
  actionBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#d97706",
    paddingVertical: 5,
    paddingHorizontal: 9,
    borderRadius: 8,
  },
  actionBadgeConnected: {
    backgroundColor: "#16a34a",
  },
  actionBadgeText: {
    fontSize: 10.5,
    fontWeight: "700",
    color: "#ffffff",
  },
});
