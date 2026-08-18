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
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import Animated, { FadeInDown } from "react-native-reanimated";
import { RootStackParamList } from "@/navigation/types";
import { colors } from "@/theme/colors";

type Props = NativeStackScreenProps<RootStackParamList, "ServiceCompleted">;

const CHECKLIST = [
  { icon: "checkmark-circle", label: "Helper Verified" },
  { icon: "checkmark-circle", label: "Service Completed" },
  { icon: "checkmark-circle", label: "Recording Saved" },
];

export default function ServiceCompletedScreen({ navigation, route }: Props) {
  // bookingId/vendorId available if coming from recording flow; fallback gracefully
  const bookingId = (route.params as any)?.bookingId ?? "UH-00000";
  const vendorId = (route.params as any)?.vendorId ?? "vendor-001";
  return (
    <View style={s.root}>
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </Pressable>
        <Text style={s.headerTitle}>Service Summary</Text>
        <Pressable style={s.moreBtn}>
          <Ionicons name="ellipsis-vertical" size={24} color={colors.text.primary} />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
      >
        {/* Checklist */}
        <Animated.View entering={FadeInDown.duration(350)} style={s.checklistSection}>
          <View style={s.checklistCard}>
            {CHECKLIST.map((item, idx) => (
              <View key={idx} style={s.checklistItem}>
                <Ionicons name={item.icon as any} size={20} color="#cfbcff" />
                <Text style={s.checklistText}>{item.label}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Service Details */}
        <Animated.View entering={FadeInDown.delay(100).duration(380)} style={s.detailsSection}>
          <View style={s.detailsCard}>
            <Image
              source={{ uri: "https://via.placeholder.com/80" }}
              style={s.avatar}
            />
            <View style={s.detailsInfo}>
              <Text style={s.serviceName}>Home Cleaning</Text>
              <Text style={s.vendorName}>Rahul Kumar</Text>
              <View style={s.metaRow}>
                <Ionicons name="calendar" size={14} color={colors.text.secondary} />
                <Text style={s.metaText}>Today • 4:30 PM</Text>
                <Text style={s.duration}>42 minutes</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Recording Section */}
        <Animated.View entering={FadeInDown.delay(160).duration(380)} style={s.recordingSection}>
          <View style={s.recordingCard}>
            <View style={s.recordingHeader}>
              <Ionicons name="videocam" size={20} color="#cfbcff" />
              <Text style={s.recordingTitle}>Service Recording</Text>
              <Text style={s.recordingDuration}>42 min recording</Text>
            </View>
            <View style={s.recordingActions}>
              <Pressable
                onPress={() => navigation.navigate("RatingFeedback", {})}
                style={s.playBtn}
              >
                <Ionicons name="play-circle" size={18} color={colors.text.primary} />
                <Text style={s.playBtnText}>View Recording</Text>
              </Pressable>
              <Pressable style={s.reportBtn}>
                <Ionicons name="flag" size={18} color={colors.text.secondary} />
                <Text style={s.reportBtnText}>Report an Issue</Text>
              </Pressable>
            </View>
          </View>
        </Animated.View>

        {/* Payment Section */}
        <Animated.View entering={FadeInDown.delay(200).duration(380)} style={s.paymentSection}>
          <View style={s.paymentCard}>
            <Text style={s.paymentLabel}>Total Payment</Text>
            <View style={s.paymentRow}>
              <Text style={s.paymentAmount}>₹1,299</Text>
              <View style={s.paidBadge}>
                <Text style={s.paidText}>Paid</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Rating Section */}
        <Animated.View entering={FadeInDown.delay(240).duration(380)} style={s.ratingSection}>
          <View style={s.ratingCard}>
            <Text style={s.ratingTitle}>How was your experience?</Text>
            <View style={s.starRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Pressable key={star} style={s.starBtn}>
                  <Ionicons
                    name="star"
                    size={36}
                    color={star <= 4 ? "#e7c365" : "rgba(148, 142, 156, 1)"}
                  />
                </Pressable>
              ))}
            </View>
          </View>
        </Animated.View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Bottom CTA */}
      <View style={s.bottomCta}>
        <Pressable
          onPress={() => navigation.navigate("RatingFeedback", {})}
          style={s.submitBtn}
        >
          <Text style={s.submitBtnText}>Submit Review</Text>
        </Pressable>
      </View>
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
    backgroundColor: "rgba(20, 18, 24, 0.9)",
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
    color: "#cfbcff",
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
  checklistSection: {
    marginBottom: 16,
  },
  checklistCard: {
    backgroundColor: "rgba(33, 31, 36, 1)",
    borderRadius: 12,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  checklistItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  checklistText: {
    fontSize: 14,
    color: colors.text.primary,
  },
  detailsSection: {
    marginBottom: 16,
  },
  detailsCard: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: "rgba(33, 31, 36, 1)",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
    alignItems: "center",
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  detailsInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text.primary,
  },
  vendorName: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  metaText: {
    fontSize: 12,
    color: "#cfbcff",
    fontWeight: "500",
  },
  duration: {
    fontSize: 12,
    color: colors.text.secondary,
    backgroundColor: "rgba(43, 41, 47, 1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: "auto",
  },
  recordingSection: {
    marginBottom: 16,
  },
  recordingCard: {
    backgroundColor: "rgba(33, 31, 36, 1)",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  recordingHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  recordingTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text.primary,
    flex: 1,
  },
  recordingDuration: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  recordingActions: {
    flexDirection: "row",
    gap: 8,
  },
  playBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "rgba(43, 41, 47, 1)",
    borderRadius: 10,
    paddingVertical: 10,
  },
  playBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.text.primary,
  },
  reportBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "rgba(43, 41, 47, 1)",
    borderRadius: 10,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  reportBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.text.secondary,
  },
  paymentSection: {
    marginBottom: 16,
  },
  paymentCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(33, 31, 36, 1)",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  paymentLabel: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  paymentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  paymentAmount: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.text.primary,
  },
  paidBadge: {
    backgroundColor: "#cfbcff",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  paidText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#381e72",
  },
  ratingSection: {
    marginBottom: 24,
  },
  ratingCard: {
    backgroundColor: "rgba(33, 31, 36, 1)",
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
    alignItems: "center",
  },
  ratingTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text.primary,
    marginBottom: 12,
  },
  starRow: {
    flexDirection: "row",
    gap: 8,
  },
  starBtn: {
    padding: 4,
  },
  bottomCta: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  submitBtn: {
    backgroundColor: "#6750a4",
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "white",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});
