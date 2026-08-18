import React, { useState } from "react";
import { ScrollView, Text, View, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/types";
import { colors } from "@/theme/colors";
import { resumeRecording, formatRecordingTime, getSession } from "@/services/recordingService";

type Props = NativeStackScreenProps<RootStackParamList, "RecordingPaused">;

export default function RecordingPausedScreen({ navigation, route }: Props) {
  const { bookingId, vendorId } = route.params;
  const session = getSession(bookingId);

  const handleResume = () => {
    resumeRecording(bookingId);
    navigation.navigate("RecordingInProgress", { bookingId, vendorId });
  };

  const handleEndService = () => {
    navigation.navigate("EndServiceRecording", { bookingId, vendorId });
  };
  return (
    <View style={s.root}>
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </Pressable>
        <Text style={s.headerTitle}>Book Service</Text>
        <Pressable style={s.moreBtn}>
          <Ionicons name="ellipsis-vertical" size={24} color={colors.text.primary} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        <View style={s.centerContent}>
          <View style={s.pauseIcon}>
            <Ionicons name="pause-circle" size={60} color="#fbbf24" />
          </View>
          <Text style={s.title}>Recording Paused</Text>
          <Text style={s.subtitle}>
            The service session is paused. You can resume recording or end the service.
          </Text>
          {session && (
            <View style={s.durationCard}>
              <Text style={s.durationLabel}>Recorded so far</Text>
              <Text style={s.durationValue}>
                {formatRecordingTime(session.recordingTotalSeconds)}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={s.actionsBottom}>
        <LinearGradient
          colors={["#fbbf24", "#f59e0b"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.resumeBtn}
        >
          <Pressable onPress={handleResume} style={s.resumeBtnInner}>
            <Ionicons name="play" size={20} color="white" />
            <Text style={s.resumeBtnText}>Resume Recording</Text>
          </Pressable>
        </LinearGradient>

        <Pressable onPress={handleEndService} style={s.endBtn}>
          <Ionicons name="stop-circle" size={20} color="#ff8f94" />
          <Text style={s.endBtnText}>End Service</Text>
        </Pressable>
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
  moreBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(29, 27, 32, 1)",
    justifyContent: "center",
    alignItems: "center",
  },
  scroll: { flex: 1, paddingHorizontal: 16 },
  centerContent: { flex: 1, justifyContent: "center", alignItems: "center", gap: 16 },
  pauseIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(245, 158, 11, 0.1)",
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
  durationCard: {
    backgroundColor: "rgba(33, 31, 36, 1)",
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.2)",
    marginTop: 8,
  },
  durationLabel: { fontSize: 12, color: colors.text.secondary, marginBottom: 4 },
  durationValue: { fontSize: 22, fontWeight: "700", color: "#fbbf24" },
  actionsBottom: { paddingHorizontal: 16, paddingVertical: 16, gap: 12 },
  resumeBtn: { borderRadius: 24, overflow: "hidden" },
  resumeBtnInner: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    paddingVertical: 14,
  },
  resumeBtnText: { fontSize: 14, fontWeight: "700", color: "white", textTransform: "uppercase" },
  endBtn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: colors.glass.border,
    borderRadius: 24,
    paddingVertical: 14,
  },
  endBtnText: { fontSize: 14, fontWeight: "600", color: "#ff8f94" },
});
