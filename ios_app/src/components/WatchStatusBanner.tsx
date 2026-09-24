import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

interface Props {
  onPressPrompt: () => void;
  style?: any;
}

export default function WatchStatusBanner({ onPressPrompt, style }: Props) {
  return (
    <Pressable style={[s.banner, style]} onPress={onPressPrompt}>
      <View style={s.iconWrap}>
        <MaterialCommunityIcons name="watch-vibrate-off" size={18} color="#f59e0b" />
      </View>
      <View style={s.textCol}>
        <Text style={s.title}>Smartwatch Not Connected</Text>
        <Text style={s.sub}>Tap to connect watch or purchase compatible health band</Text>
      </View>
      <View style={s.actionBadge}>
        <Text style={s.actionBadgeText}>Pair / Buy</Text>
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
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(245,158,11,0.18)",
    justifyContent: "center",
    alignItems: "center",
  },
  textCol: {
    flex: 1,
  },
  title: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#fbbf24",
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
  actionBadgeText: {
    fontSize: 10.5,
    fontWeight: "700",
    color: "#ffffff",
  },
});
