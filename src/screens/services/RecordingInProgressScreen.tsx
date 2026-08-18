import React, { useState, useEffect } from "react";
import {
  ScrollView,
  Text,
  View,
  Pressable,
  StyleSheet,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import Animated, { FadeInDown } from "react-native-reanimated";
import { RootStackParamList } from "@/navigation/types";
import { colors } from "@/theme/colors";
import {
  startRecording,
  pauseRecording,
  getLiveRecordingSeconds,
  formatRecordingTime,
  getVendorById,
  getSession,
} from "@/services/recordingService";

type Props = NativeStackScreenProps<RootStackParamList, "RecordingInProgress">;

export default function RecordingInProgressScreen({ navigation, route }: Props) {
  const { bookingId, vendorId } = route.params;
  const vendor = getVendorById(vendorId);

  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    // Start recording when screen mounts
    startRecording(bookingId);

    // Tick timer every second
    const timer = setInterval(() => {
      setElapsedSeconds(getLiveRecordingSeconds(bookingId));
    }, 1000);
    return () => clearInterval(timer);
  }, [bookingId]);

  const handlePause = () => {
    pauseRecording(bookingId);
    navigation.navigate("RecordingPaused", { bookingId, vendorId });
  };

  const handleEndService = () => {
    navigation.navigate("EndServiceRecording", { bookingId, vendorId });
  };

  return (
    <View style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </Pressable>
        <Text style={s.headerTitle}>Book Service</Text>
        <Pressable style={s.moreBtn}>
          <Ionicons name="ellipsis-vertical" size={24} color={colors.text.primary} />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
      >
        {/* Title */}
        <Animated.View entering={FadeInDown.duration(350)} style={s.titleSection}>
          <Text style={s.title}>Service in Progress</Text>

          {/* Recording Indicator */}
          <View style={s.recordingBadge}>
            <View style={s.recordingDot}>
              <View style={s.recordingPulse} />
              <View style={s.recordingCore} />
            </View>
            <Text style={s.recordingLabel}>RECORDING</Text>
            <Text style={s.recordingTime}>{formatRecordingTime(elapsedSeconds)}</Text>
          </View>
        </Animated.View>

        {/* Vendor Card */}
        <Animated.View entering={FadeInDown.delay(100).duration(380)} style={s.vendorSection}>
          <View style={s.vendorCard}>
            <View style={s.vendorImageWrap}>
              {vendor?.avatar ? (
                <Image source={{ uri: vendor.avatar }} style={{ width: "100%", height: "100%" }} />
              ) : (
                <View style={s.vendorAvatar} />
              )}
            </View>
            <View style={s.vendorInfo}>
              <Text style={s.vendorName}>{vendor?.name ?? "Helper"}</Text>
              <Text style={s.vendorService}>{vendor?.service ?? "Service"}</Text>
            </View>
          </View>

          <View style={s.statusBadge}>
            <Text style={s.statusText}>Service Started</Text>
          </View>
        </Animated.View>

        {/* Recording Visual */}
        <Animated.View
          entering={FadeInDown.delay(160).duration(380)}
          style={s.visualSection}
        >
          <View style={s.recordingVisual}>
            <View style={s.ring1} />
            <View style={s.ring2} />
            <View style={s.ring3} />
            <View style={s.centerIcon}>
              <Ionicons name="videocam" size={48} color="#ff8f94" />
            </View>
          </View>
          <Text style={s.recordingMessage}>
            Service session is being recorded
          </Text>
        </Animated.View>

        {/* Privacy Info */}
        <Animated.View entering={FadeInDown.delay(220).duration(380)} style={s.privacySection}>
          <Ionicons name="shield" size={20} color={colors.text.secondary} />
          <Text style={s.privacyText}>
            Recording is visible to both customer and helper. Protected under
            Urban Helpers Privacy Policy.
          </Text>
        </Animated.View>

        {/* Action Buttons */}
        <Animated.View entering={FadeInDown.delay(280).duration(380)} style={s.actionsSection}>
          <Pressable onPress={handlePause} style={s.pauseBtn}>
            <Ionicons name="pause" size={20} color={colors.text.primary} />
            <Text style={s.pauseBtnText}>Pause Recording</Text>
          </Pressable>

          <LinearGradient
            colors={["#ff8f94", "#e36870"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={s.endBtn}
          >
            <Pressable onPress={handleEndService} style={s.endBtnInner}>
              <Ionicons name="stop-circle" size={20} color="#4a151a" />
              <Text style={s.endBtnText}>End Service</Text>
            </Pressable>
          </LinearGradient>
        </Animated.View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0e0d15",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: "rgba(14, 13, 21, 0.8)",
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
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text.primary,
  },
  moreBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(29, 27, 32, 1)",
    justifyContent: "center",
    alignItems: "center",
  },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  titleSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.text.primary,
    marginBottom: 16,
  },
  recordingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(45, 26, 31, 1)",
    borderWidth: 1,
    borderColor: "rgba(90, 44, 53, 1)",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  recordingDot: {
    position: "relative",
    width: 12,
    height: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  recordingPulse: {
    position: "absolute",
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#ff8f94",
    opacity: 0.7,
  },
  recordingCore: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ff8f94",
  },
  recordingLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#ff8f94",
    letterSpacing: 1,
  },
  recordingTime: {
    fontSize: 12,
    fontWeight: "700",
    color: "#ff8f94",
    marginLeft: 8,
  },
  vendorSection: {
    marginBottom: 32,
    alignItems: "center",
    gap: 12,
  },
  vendorCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "rgba(33, 31, 36, 1)",
    borderRadius: 16,
    padding: 12,
    width: "100%",
  },
  vendorImageWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: "hidden",
  },
  vendorAvatar: {
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(103, 80, 164, 1)",
  },
  vendorInfo: {
    flex: 1,
  },
  vendorName: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text.primary,
  },
  vendorService: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  statusBadge: {
    backgroundColor: "rgba(45, 40, 62, 1)",
    borderWidth: 1,
    borderColor: "rgba(68, 60, 92, 1)",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#b8a5e6",
  },
  visualSection: {
    alignItems: "center",
    marginBottom: 32,
    paddingVertical: 24,
  },
  recordingVisual: {
    position: "relative",
    width: 160,
    height: 160,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  ring1: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 1,
    borderColor: "rgba(90, 44, 53, 1)",
  },
  ring2: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1,
    borderColor: "rgba(122, 54, 68, 1)",
  },
  ring3: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: "rgba(68, 60, 92, 1)",
  },
  centerIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "rgba(29, 26, 36, 1)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  recordingMessage: {
    fontSize: 18,
    color: colors.text.primary,
    textAlign: "center",
  },
  privacySection: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: "rgba(33, 31, 36, 1)",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
    marginBottom: 24,
    alignItems: "flex-start",
  },
  privacyText: {
    fontSize: 13,
    color: colors.text.secondary,
    flex: 1,
    lineHeight: 20,
    marginTop: 2,
  },
  actionsSection: {
    gap: 12,
    marginBottom: 24,
  },
  pauseBtn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: colors.glass.border,
    borderRadius: 24,
    paddingVertical: 14,
    backgroundColor: "transparent",
  },
  pauseBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.primary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  endBtn: {
    borderRadius: 24,
    overflow: "hidden",
  },
  endBtnInner: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    paddingVertical: 14,
  },
  endBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#4a151a",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});
