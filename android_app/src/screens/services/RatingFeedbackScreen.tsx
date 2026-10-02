import React, { useState, useEffect } from "react";
import {
  ScrollView,
  Text,
  View,
  Pressable,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import Animated, { FadeInDown } from "react-native-reanimated";
import { doc, getDoc, updateDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/services/firebase";
import { submitBookingRating } from "@/services/bookingService";
import { RootStackParamList } from "@/navigation/types";
import { colors } from "@/theme/colors";

type Props = NativeStackScreenProps<RootStackParamList, "RatingFeedback">;

const STAR_LABELS = ["", "Disappointing 😞", "Could be better 😐", "Good service 🙂", "Very good! 😊", "Outstanding! 🌟"];

const COMPLIMENT_TAGS = [
  "On-time arrival ⏰",
  "Super polite & courteous 👔",
  "Clean & hygienic 🧼",
  "Expert craftsmanship 🛠️",
  "Great value for money 💎",
  "Clear communication 💬",
];

const COMPLAINT_REASONS = [
  "Incomplete work / Poor quality",
  "Damaged household property / item",
  "Unprofessional conduct or behavior",
  "Unreasonable overcharging dispute",
  "Safety / Security violation",
];

const TIPS = ["No Tip", "₹50", "₹100", "₹200"];

export default function RatingFeedbackScreen({ navigation, route }: Props) {
  const bookingId = route.params?.bookingId;
  const initialVendorName = route.params?.vendorName || "Service Partner";
  const initialCategory = route.params?.serviceCategory || route.params?.categoryId || "Home Service";

  const [bookingData, setBookingData] = useState<any>(null);
  const [stars, setStars] = useState(5);
  const [selectedTags, setSelectedTags] = useState<string[]>([COMPLIMENT_TAGS[0], COMPLIMENT_TAGS[1]]);
  const [activeTip, setActiveTip] = useState(0);
  const [review, setReview] = useState("");
  const [isComplaint, setIsComplaint] = useState(false);
  const [selectedComplaintReason, setSelectedComplaintReason] = useState(COMPLAINT_REASONS[0]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!bookingId) return;
    getDoc(doc(db, "bookings", bookingId))
      .then((snap) => {
        if (snap.exists()) {
          setBookingData(snap.data());
        }
      })
      .catch((e) => console.log("[RatingFeedback] error fetching booking:", e));
  }, [bookingId]);

  const vendorName = bookingData?.vendorName || initialVendorName;
  const serviceName = bookingData?.subServiceName || bookingData?.serviceCategory || initialCategory;
  const vendorId = bookingData?.vendorId || null;

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmitRating = async () => {
    if (!bookingId) {
      navigation.replace("ServiceCompleted", { bookingId: "UH-DEMO982" });
      return;
    }

    setSubmitting(true);
    try {
      // 1. Submit rating & review to booking doc
      await submitBookingRating({
        bookingId,
        rating: stars,
        tags: isComplaint ? [selectedComplaintReason] : selectedTags,
        review: review.trim(),
        tip: activeTip > 0 ? TIPS[activeTip] : undefined,
      });

      // 2. If complaint filed or rating <= 2, register in complaints & lock vendor profile
      if (isComplaint || stars <= 2) {
        try {
          await addDoc(collection(db, "complaints"), {
            bookingId,
            vendorId: vendorId || "unknown",
            vendorName,
            customerName: bookingData?.customerName || "Customer",
            customerPhone: bookingData?.customerPhone || "",
            complaintReason: isComplaint ? selectedComplaintReason : "Low Rating (≤2 Stars)",
            customerNotes: review.trim() || "Quality dissatisfaction",
            stars,
            status: "OPEN_INVESTIGATION",
            createdAt: serverTimestamp(),
          });

          // Auto-lock vendor profile pending admin review
          if (vendorId) {
            await updateDoc(doc(db, "vendors", vendorId), {
              status: "locked",
              isLocked: true,
              lockReason: `Locked due to Customer Complaint on Booking #${bookingId.slice(-6).toUpperCase()}: ${isComplaint ? selectedComplaintReason : "Low Quality Score"}`,
              lockedAt: serverTimestamp(),
            });
          }
        } catch (compErr) {
          console.warn("[RatingFeedback] Could not auto-lock vendor:", compErr);
        }
      }

      if (isComplaint || stars <= 2) {
        Alert.alert(
          "🚨 Complaint Escalated",
          "Your complaint has been escalated directly to Senior Incident Management. The partner's profile has been placed on hold pending quality investigation.",
          [
            {
              text: "View Receipt",
              onPress: () => navigation.replace("ServiceCompleted", { bookingId }),
            },
          ]
        );
      } else {
        navigation.replace("ServiceCompleted", { bookingId });
      }
    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed to submit feedback.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <Pressable
          style={s.iconBtn}
          onPress={() => navigation.replace("ServiceCompleted", { bookingId })}
        >
          <Ionicons name="close" size={20} color="white" />
        </Pressable>
        <Text style={s.headerTitle}>Rate &amp; Review</Text>
        <Pressable
          style={s.skipHeaderBtn}
          onPress={() => navigation.replace("ServiceCompleted", { bookingId })}
        >
          <Text style={s.skipHeaderText}>Skip</Text>
        </Pressable>
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero Partner Info */}
        <Animated.View entering={FadeInDown.duration(380)} style={s.hero}>
          <LinearGradient
            colors={["#10283b", "#091724"]}
            style={[StyleSheet.absoluteFillObject, { borderRadius: 20 }]}
          />
          <View style={s.avatarWrap}>
            <Ionicons name="person" size={26} color="#00bcd4" />
          </View>
          <View style={s.heroTextWrap}>
            <View style={s.verifiedRow}>
              <Ionicons name="shield-checkmark" size={13} color="#10b981" />
              <Text style={s.verifiedText}>Verified Professional</Text>
            </View>
            <Text style={s.vendorName}>{vendorName}</Text>
            <Text style={s.serviceSub}>{serviceName}</Text>
          </View>
        </Animated.View>

        {/* Stars Rating */}
        <Animated.View entering={FadeInDown.delay(80).duration(380)} style={s.card}>
          <Text style={s.cardTitle}>How would you rate the service?</Text>
          <View style={s.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Pressable
                key={star}
                onPress={() => {
                  setStars(star);
                  if (star <= 2) setIsComplaint(true);
                }}
                hitSlop={8}
                style={s.starTouch}
              >
                <Ionicons
                  name={star <= stars ? "star" : "star-outline"}
                  size={42}
                  color={star <= stars ? "#f59e0b" : "rgba(255,255,255,0.2)"}
                />
              </Pressable>
            ))}
          </View>
          <Text style={s.starSentiment}>{STAR_LABELS[stars]}</Text>
        </Animated.View>

        {/* File Complaint / Issue Toggle */}
        <Animated.View entering={FadeInDown.delay(120).duration(380)} style={s.card}>
          <View style={s.complaintHeader}>
            <View style={{ flex: 1 }}>
              <Text style={[s.cardTitle, { marginBottom: 2 }]}>Report Service Complaint</Text>
              <Text style={s.complaintSub}>Flag serious property damage, safety, or quality issue</Text>
            </View>
            <Pressable
              style={[s.toggleBtn, isComplaint && s.toggleBtnActive]}
              onPress={() => setIsComplaint(!isComplaint)}
            >
              <Ionicons
                name={isComplaint ? "warning" : "warning-outline"}
                size={16}
                color={isComplaint ? "#ffffff" : "rgba(255,255,255,0.6)"}
              />
              <Text style={[s.toggleText, isComplaint && s.toggleTextActive]}>
                {isComplaint ? "Complaint Active" : "Report"}
              </Text>
            </Pressable>
          </View>

          {isComplaint && (
            <View style={s.complaintOptionsWrap}>
              <Text style={s.selectLabel}>Select primary issue:</Text>
              {COMPLAINT_REASONS.map((reason) => (
                <Pressable
                  key={reason}
                  style={[s.reasonChip, selectedComplaintReason === reason && s.reasonChipActive]}
                  onPress={() => setSelectedComplaintReason(reason)}
                >
                  <Ionicons
                    name={selectedComplaintReason === reason ? "radio-button-on" : "radio-button-off"}
                    size={16}
                    color={selectedComplaintReason === reason ? "#ef4444" : "#94a3b8"}
                  />
                  <Text style={[s.reasonText, selectedComplaintReason === reason && s.reasonTextActive]}>
                    {reason}
                  </Text>
                </Pressable>
              ))}
              <View style={s.lockNotice}>
                <Ionicons name="lock-closed" size={14} color="#ef4444" />
                <Text style={s.lockNoticeText}>
                  Submitting a complaint will freeze the vendor's profile pending Admin review.
                </Text>
              </View>
            </View>
          )}
        </Animated.View>

        {/* Compliments / Tags (if not a complaint) */}
        {!isComplaint && (
          <Animated.View entering={FadeInDown.delay(160).duration(380)} style={s.card}>
            <Text style={s.cardTitle}>What did you like the most?</Text>
            <View style={s.tagsGrid}>
              {COMPLIMENT_TAGS.map((tag) => {
                const active = selectedTags.includes(tag);
                return (
                  <Pressable
                    key={tag}
                    onPress={() => toggleTag(tag)}
                    style={[s.tagChip, active && s.tagChipActive]}
                  >
                    <Text style={[s.tagText, active && s.tagTextActive]}>{tag}</Text>
                  </Pressable>
                );
              })}
            </View>
          </Animated.View>
        )}

        {/* Write Review */}
        <Animated.View entering={FadeInDown.delay(200).duration(380)} style={s.card}>
          <Text style={s.cardTitle}>{isComplaint ? "Detailed Issue Description" : "Share your thoughts (Optional)"}</Text>
          <TextInput
            style={s.reviewInput}
            placeholder={isComplaint ? "Please describe what happened in detail..." : "Tell us about the service quality, cleanliness, or recommendations..."}
            placeholderTextColor="rgba(255,255,255,0.3)"
            multiline
            value={review}
            onChangeText={setReview}
          />
        </Animated.View>

        {/* Tip Captain (if not complaint) */}
        {!isComplaint && (
          <Animated.View entering={FadeInDown.delay(240).duration(380)} style={s.card}>
            <View style={s.tipHeader}>
              <View>
                <Text style={s.cardTitle}>Tip {vendorName}</Text>
                <Text style={s.tipSub}>100% of the tip goes directly to your professional</Text>
              </View>
              <Ionicons name="heart" size={20} color="#ec4899" />
            </View>
            <View style={s.tipGrid}>
              {TIPS.map((tip, i) => {
                const active = activeTip === i;
                return (
                  <Pressable
                    key={tip}
                    onPress={() => setActiveTip(i)}
                    style={[s.tipBtn, active && s.tipBtnActive]}
                  >
                    <Text style={[s.tipText, active && s.tipTextActive]}>{tip}</Text>
                  </Pressable>
                );
              })}
            </View>
          </Animated.View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom CTA */}
      <View style={s.cta}>
        <Pressable
          style={[s.submitBtn, submitting && s.btnDisabled, isComplaint && { backgroundColor: "#ef4444" }]}
          onPress={handleSubmitRating}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <View style={s.submitContent}>
              <Text style={s.submitBtnText}>{isComplaint ? "Submit Complaint & Lock Partner" : "Submit & View Bill"}</Text>
              <Ionicons name="arrow-forward" size={18} color="white" />
            </View>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#081826" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 52,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  headerTitle: { fontSize: 17, fontWeight: "700", color: "white" },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.08)",
    justifyContent: "center",
    alignItems: "center",
  },
  skipHeaderBtn: { paddingHorizontal: 12, paddingVertical: 6 },
  skipHeaderText: { color: "rgba(255,255,255,0.6)", fontSize: 14, fontWeight: "600" },
  scroll: { paddingHorizontal: 16, paddingTop: 16 },

  // Hero
  hero: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  avatarWrap: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "rgba(0,188,212,0.15)",
    borderWidth: 1.5,
    borderColor: "#00bcd4",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  heroTextWrap: { flex: 1 },
  verifiedRow: { flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 2 },
  verifiedText: { fontSize: 11, color: "#10b981", fontWeight: "600" },
  vendorName: { fontSize: 17, fontWeight: "700", color: "white" },
  serviceSub: { fontSize: 13, color: "rgba(255,255,255,0.6)", marginTop: 2 },

  // Cards
  card: {
    backgroundColor: "#102336",
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
  },
  cardTitle: { fontSize: 15, fontWeight: "700", color: "white", marginBottom: 12 },

  // Stars
  starsRow: { flexDirection: "row", justifyContent: "center", gap: 10, marginVertical: 8 },
  starTouch: { padding: 4 },
  starSentiment: {
    textAlign: "center",
    color: "#f59e0b",
    fontSize: 14,
    fontWeight: "700",
    marginTop: 6,
  },

  // Complaint
  complaintHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  complaintSub: { fontSize: 11.5, color: "rgba(255,255,255,0.5)", marginTop: 1 },
  toggleBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  toggleBtnActive: {
    backgroundColor: "#dc2626",
    borderColor: "#ef4444",
  },
  toggleText: { fontSize: 12, color: "rgba(255,255,255,0.7)", fontWeight: "600" },
  toggleTextActive: { color: "#ffffff", fontWeight: "700" },
  complaintOptionsWrap: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)",
    gap: 8,
  },
  selectLabel: { fontSize: 12, color: "rgba(255,255,255,0.6)", fontWeight: "600" },
  reasonChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#091724",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  reasonChipActive: {
    borderColor: "#ef4444",
    backgroundColor: "rgba(239,68,68,0.12)",
  },
  reasonText: { fontSize: 13, color: "rgba(255,255,255,0.8)", fontWeight: "500", flex: 1 },
  reasonTextActive: { color: "#fca5a5", fontWeight: "700" },
  lockNotice: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(239,68,68,0.1)",
    padding: 10,
    borderRadius: 10,
    marginTop: 4,
  },
  lockNoticeText: { fontSize: 11, color: "#fca5a5", flex: 1, lineHeight: 15 },

  // Tags
  tagsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tagChip: {
    backgroundColor: "rgba(255,255,255,0.06)",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  tagChipActive: {
    backgroundColor: "rgba(0,188,212,0.15)",
    borderColor: "#00bcd4",
  },
  tagText: { color: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: "500" },
  tagTextActive: { color: "#00e5ff", fontWeight: "700" },

  // Review Input
  reviewInput: {
    backgroundColor: "#091724",
    borderRadius: 14,
    padding: 14,
    color: "white",
    fontSize: 14,
    minHeight: 88,
    textAlignVertical: "top",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },

  // Tip
  tipHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  tipSub: { fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 2 },
  tipGrid: { flexDirection: "row", gap: 8 },
  tipBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
  },
  tipBtnActive: {
    backgroundColor: "rgba(236,72,153,0.18)",
    borderColor: "#ec4899",
  },
  tipText: { fontSize: 13, fontWeight: "700", color: "rgba(255,255,255,0.7)" },
  tipTextActive: { color: "#f472b6" },

  // CTA
  cta: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 32,
    paddingTop: 12,
    backgroundColor: "rgba(8,24,38,0.97)",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)",
  },
  submitBtn: {
    backgroundColor: "#00bcd4",
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  btnDisabled: { opacity: 0.7 },
  submitContent: { flexDirection: "row", alignItems: "center", gap: 8 },
  submitBtnText: { fontSize: 16, fontWeight: "700", color: "#081826" },
});
