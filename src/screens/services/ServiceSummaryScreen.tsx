import React from "react";
import {
  ScrollView,
  Text,
  View,
  Pressable,
  StyleSheet,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import Animated, { FadeInDown } from "react-native-reanimated";
import { RootStackParamList } from "@/navigation/types";
import { colors } from "@/theme/colors";

type Props = NativeStackScreenProps<RootStackParamList, "ServiceSummary">;

export default function ServiceSummaryScreen({ navigation, route }: Props) {
  const { bookingId, vendorId } = route.params;
  return (
    <View style={s.root}>
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </Pressable>
        <Text style={s.headerTitle}>Summary</Text>
        <Pressable style={s.moreBtn}>
          <Ionicons name="share-social" size={24} color={colors.text.primary} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {/* Service Details Summary */}
        <Animated.View entering={FadeInDown.duration(350)} style={s.summaryCard}>
          <Image
            source={{ uri: "https://via.placeholder.com/80" }}
            style={s.avatar}
          />
          <View style={s.summaryInfo}>
            <Text style={s.serviceName}>Home Cleaning - Completed</Text>
            <Text style={s.vendorName}>Rahul Kumar</Text>
            <Text style={s.timestamp}>Today at 4:30 PM - 5:15 PM</Text>
          </View>
          <Ionicons name="checkmark-circle" size={24} color="#4ade80" />
        </Animated.View>

        {/* Cost Breakdown */}
        <Animated.View entering={FadeInDown.delay(100).duration(380)} style={s.breakdownCard}>
          <Text style={s.breakdownTitle}>Cost Breakdown</Text>
          <View style={s.breakdownRow}>
            <Text style={s.breakdownLabel}>Service Charge</Text>
            <Text style={s.breakdownValue}>₹1,199</Text>
          </View>
          <View style={s.breakdownRow}>
            <Text style={s.breakdownLabel}>Taxes & Fees</Text>
            <Text style={s.breakdownValue}>₹100</Text>
          </View>
          <View style={s.divider} />
          <View style={s.breakdownRow}>
            <Text style={s.breakdownTotal}>Total Amount</Text>
            <Text style={s.breakdownTotalValue}>₹1,299</Text>
          </View>
          <View style={s.paidBadge}>
            <Ionicons name="checkmark-circle" size={16} color="#4ade80" />
            <Text style={s.paidText}>Payment Completed</Text>
          </View>
        </Animated.View>

        {/* Recording */}
        <Animated.View entering={FadeInDown.delay(160).duration(380)} style={s.recordingCard}>
          <View style={s.recordingHeader}>
            <Ionicons name="videocam" size={20} color="#cfbcff" />
            <Text style={s.recordingTitle}>Service Recording</Text>
          </View>
          <Text style={s.recordingDuration}>45 minutes 32 seconds</Text>
          <Pressable style={s.playRecordingBtn}>
            <Ionicons name="play-circle" size={18} color="#cfbcff" />
            <Text style={s.playBtnText}>Play Recording</Text>
          </Pressable>
        </Animated.View>

        {/* Feedback */}
        <Animated.View entering={FadeInDown.delay(200).duration(380)} style={s.feedbackCard}>
          <Text style={s.feedbackTitle}>Your Feedback</Text>
          <View style={s.starRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Ionicons
                key={star}
                name="star"
                size={24}
                color={star <= 4 ? "#e7c365" : "rgba(148, 142, 156, 1)"}
              />
            ))}
          </View>
          <Text style={s.feedbackText}>
            Great service! The helper was professional and thorough.
          </Text>
        </Animated.View>

        {/* Action Buttons */}
        <Animated.View entering={FadeInDown.delay(240).duration(380)} style={s.actionsCard}>
          <Pressable style={s.actionBtn}>
            <Ionicons name="share-social" size={20} color={colors.text.primary} />
            <Text style={s.actionBtnText}>Share Booking</Text>
          </Pressable>
          <Pressable style={s.actionBtn}>
            <Ionicons name="download" size={20} color={colors.text.primary} />
            <Text style={s.actionBtnText}>Download Invoice</Text>
          </Pressable>
        </Animated.View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Bottom CTA */}
      <View style={s.bottomCta}>
        <Pressable
          onPress={() => navigation.navigate("ServicesDashboard")}
          style={s.bookAgainBtn}
        >
          <Text style={s.bookAgainBtnText}>Book Similar Service</Text>
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
  scroll: { paddingHorizontal: 16, paddingTop: 16 },
  summaryCard: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: "rgba(33, 31, 36, 1)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  avatar: { width: 64, height: 64, borderRadius: 32 },
  summaryInfo: { flex: 1 },
  serviceName: { fontSize: 15, fontWeight: "700", color: colors.text.primary },
  vendorName: { fontSize: 13, color: colors.text.secondary, marginBottom: 4 },
  timestamp: { fontSize: 12, color: "rgba(148, 142, 156, 1)" },
  breakdownCard: {
    backgroundColor: "rgba(33, 31, 36, 1)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  breakdownTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text.primary,
    marginBottom: 12,
  },
  breakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  breakdownLabel: { fontSize: 13, color: colors.text.secondary },
  breakdownValue: { fontSize: 13, fontWeight: "600", color: colors.text.primary },
  breakdownTotal: { fontSize: 15, fontWeight: "700", color: colors.text.primary },
  breakdownTotalValue: { fontSize: 15, fontWeight: "700", color: "#cfbcff" },
  divider: { height: 1, backgroundColor: "rgba(255, 255, 255, 0.1)", marginVertical: 8 },
  paidBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "rgba(74, 222, 128, 0.1)",
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  paidText: { fontSize: 12, fontWeight: "600", color: "#4ade80" },
  recordingCard: {
    backgroundColor: "rgba(33, 31, 36, 1)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  recordingHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  recordingTitle: { fontSize: 15, fontWeight: "700", color: colors.text.primary },
  recordingDuration: { fontSize: 13, color: colors.text.secondary, marginBottom: 12 },
  playRecordingBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "rgba(43, 41, 47, 1)",
    borderRadius: 10,
    justifyContent: "center",
  },
  playBtnText: { fontSize: 13, fontWeight: "600", color: "#cfbcff" },
  feedbackCard: {
    backgroundColor: "rgba(33, 31, 36, 1)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  feedbackTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text.primary,
    marginBottom: 8,
  },
  starRow: { flexDirection: "row", gap: 4, marginBottom: 12 },
  feedbackText: {
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 20,
    fontStyle: "italic",
  },
  actionsCard: { flexDirection: "row", gap: 12, marginBottom: 24 },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "rgba(33, 31, 36, 1)",
    borderRadius: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  actionBtnText: { fontSize: 13, fontWeight: "600", color: colors.text.primary },
  bottomCta: { paddingHorizontal: 16, paddingVertical: 12 },
  bookAgainBtn: {
    backgroundColor: "#6750a4",
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: "center",
  },
  bookAgainBtnText: { fontSize: 14, fontWeight: "700", color: "white", textTransform: "uppercase" },
});
