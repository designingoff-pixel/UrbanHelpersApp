import React from "react";
import { ScrollView, Text, View, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/types";
import { colors } from "@/theme/colors";
import {
  endRecording,
  formatRecordingTime,
  formatRecordingDuration,
  getSession,
} from "@/services/recordingService";

type Props = NativeStackScreenProps<RootStackParamList, "EndServiceRecording">;

export default function EndServiceRecordingScreen({ navigation, route }: Props) {
  const { bookingId, vendorId } = route.params;
  const session = getSession(bookingId);

  const handleConfirmEnd = () => {
    endRecording(bookingId);
    navigation.navigate("ServiceCompleted", {});
  };
  return (
    <View style={s.root}>
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </Pressable>
        <Text style={s.headerTitle}>End Service</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        <View style={s.centerContent}>
          <View style={s.iconBox}>
            <Ionicons name="stop-circle" size={60} color="#ef4444" />
          </View>
          <Text style={s.title}>End Service?</Text>
          <Text style={s.subtitle}>
            Are you sure you want to end this service session? The recording will be saved.
          </Text>

          {/* Summary Card */}
          <View style={s.summaryCard}>
            <View style={s.summaryRow}>
              <Text style={s.summaryLabel}>Recording Duration</Text>
              <Text style={s.summaryValue}>
                {session
                  ? formatRecordingTime(session.recordingTotalSeconds)
                  : "00:00:00"}
              </Text>
            </View>
            <View style={s.divider} />
            <View style={s.summaryRow}>
              <Text style={s.summaryLabel}>Status</Text>
              <Text style={s.statusActive}>Recording Active</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={s.actionsBottom}>
        <Pressable onPress={() => navigation.goBack()} style={s.cancelBtn}>
          <Text style={s.cancelBtnText}>Continue Recording</Text>
        </Pressable>

        <LinearGradient
          colors={["#ef4444", "#dc2626"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.endBtn}
        >
          <Pressable onPress={handleConfirmEnd} style={s.endBtnInner}>
            <Ionicons name="stop-circle" size={20} color="white" />
            <Text style={s.endBtnText}>End Service</Text>
          </Pressable>
        </LinearGradient>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0e0d15" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "rgba(20, 18, 24, 0.8)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(29, 27, 32, 1)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: { fontSize: 18, fontWeight: "700", color: colors.text.primary },
  scroll: { flex: 1, paddingHorizontal: 16 },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
    paddingVertical: 40,
  },
  iconBox: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  title: { fontSize: 28, fontWeight: "700", color: colors.text.primary },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 12,
  },
  summaryCard: {
    width: "100%",
    backgroundColor: "rgba(33, 31, 36, 1)",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  summaryLabel: { fontSize: 14, color: colors.text.secondary },
  summaryValue: { fontSize: 16, fontWeight: "700", color: colors.text.primary },
  statusActive: { fontSize: 14, fontWeight: "600", color: "#4ade80" },
  divider: { height: 1, backgroundColor: "rgba(255, 255, 255, 0.1)", marginVertical: 12 },
  actionsBottom: { paddingHorizontal: 16, paddingVertical: 16, gap: 12 },
  cancelBtn: {
    borderWidth: 1,
    borderColor: colors.glass.border,
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: "center",
  },
  cancelBtnText: { fontSize: 14, fontWeight: "600", color: colors.text.primary },
  endBtn: { borderRadius: 24, overflow: "hidden" },
  endBtnInner: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    paddingVertical: 14,
  },
  endBtnText: { fontSize: 14, fontWeight: "700", color: "white", textTransform: "uppercase" },
});