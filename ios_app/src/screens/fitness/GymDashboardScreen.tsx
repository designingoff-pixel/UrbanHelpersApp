import React from "react";
import { ScrollView, Text, View, Pressable, StyleSheet, StatusBar } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/types";
import { colors } from "@/theme/colors";
import SamsungBottomNav from "@/components/SamsungBottomNav";
import OpenGymView from "@/components/fitness/OpenGymView";

type Props = NativeStackScreenProps<RootStackParamList, "GymDashboard">;

export default function GymDashboardScreen({ navigation }: Props) {
  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Header */}
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} style={s.iconBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.text.secondary} />
        </Pressable>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>OpenGym</Text>
          <View style={s.headerBadge}>
            <Text style={s.headerBadgeText}>INTEGRATED</Text>
          </View>
        </View>
        <Pressable
          style={s.iconBtn}
          onPress={() => navigation.navigate("FitnessDashboard")}
        >
          <Ionicons name="fitness-outline" size={22} color="#4ade80" />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        <OpenGymView navigation={navigation} />
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom Nav */}
      <SamsungBottomNav activeRoute="FitnessDashboard" />
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0a0a12",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 52,
    paddingBottom: 12,
  },
  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.text.primary,
  },
  headerBadge: {
    backgroundColor: "rgba(74, 222, 128, 0.15)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  headerBadgeText: {
    fontSize: 10,
    fontWeight: "900",
    color: "#4ade80",
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.07)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  scroll: {
    paddingHorizontal: 16,
  },
});
