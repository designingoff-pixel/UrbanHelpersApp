import React, { useState, useEffect, useRef } from "react";
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

function getServiceChecklist(serviceName: string, categoryName: string, existingList?: string[]): string[] {
  const text = `${serviceName} ${categoryName}`.toLowerCase();

  // Priority 1: AC / Air Conditioner (Must match before generic cleaning)
  if (text.includes("ac") || text.includes("air condition") || text.includes("cool")) {
    return [
      "Inspect indoor/outdoor units & power diagnostics",
      "Deep jet cleaning of filters & condenser coils",
      "Check refrigerant gas pressure & leak detection",
      "Measure air output temperature & voltage test",
      "Capture Before & After service proof photos",
      "Complete test run & handover to customer",
    ];
  }

  // Priority 2: Water purifier / RO
  if (text.includes("ro") || text.includes("water") || text.includes("purif")) {
    return [
      "Test raw inlet TDS and check water pressure",
      "Inspect pre-filter, sediment & activated carbon cartridges",
      "Check RO membrane rejection rate & pump PSI",
      "Sanitize storage tank & test output water purity",
      "Capture Before & After service proof photos",
      "Handover verified pure water sample to customer",
    ];
  }

  // Priority 3: Pest control
  if (text.includes("pest") || text.includes("cockroach") || text.includes("termite") || text.includes("bedbug") || text.includes("insect")) {
    return [
      "Identify infestation hotspots & entry gaps",
      "Chemical dilution & safety preparation check",
      "Targeted gel baiting & crack-and-crevice perimeter spray",
      "Safety briefing on ventilation to customer",
      "Capture Before & After treatment photos",
      "Final handover & prevention recommendations",
    ];
  }

  // Priority 4: Plumbing
  if (text.includes("plumb") || text.includes("pipe") || text.includes("drain") || text.includes("tap") || text.includes("leak") || text.includes("faucet")) {
    return [
      "Inspect pipeline joints, valves & pressure test",
      "Isolate main water line & disassemble faulty fittings",
      "Replace worn washers, seals, cartridges or pipes",
      "Re-pressurize system & verify zero leaks",
      "Capture Before & After repair photos",
      "Test water flow & cleanup work area",
    ];
  }

  // Priority 5: Electrical / Appliance
  if (text.includes("electr") || text.includes("wiring") || text.includes("switch") || text.includes("fan") || text.includes("appliance")) {
    return [
      "Voltage & circuit continuity safety check",
      "Inspect wiring insulation and terminal tightness",
      "Replace or repair malfunctioning electrical components",
      "Test load capacity and grounding safety",
      "Capture Before & After service photos",
      "Operational demonstration to customer",
    ];
  }

  // Priority 6: Home Cleaning / Deep Cleaning / Maid
  if (text.includes("clean") || text.includes("maid") || text.includes("housekeep") || text.includes("mop") || text.includes("scrub")) {
    return [
      "Inspect rooms, surfaces & high-touch areas",
      "Dusting, vacuuming & deep scrubbing of floors",
      "Kitchen counter, sink & appliance degreasing",
      "Bathroom sanitation & tile descaling",
      "Capture Before & After service proof photos",
      "Final walkthrough & customer satisfaction review",
    ];
  }

  if (existingList && existingList.length > 0) {
    return existingList;
  }

  return [
    "Quality of service executed to satisfaction",
    "Professionalism & punctuality verified",
    "Work area cleaned & sanitized post-service",
    "Capture Before & After service proof photos",
    "Final demonstration & invoice confirmed",
  ];
}

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
  const [customerChecklist, setCustomerChecklist] = useState<string[]>([]);
  const [customerChecklistDone, setCustomerChecklistDone] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Live countdown timer for forceful end (10 minutes = 600 seconds)
  const [secondsRemaining, setSecondsRemaining] = useState<number>(600);
  const hasForceEndedRef = useRef<boolean>(false);

  useEffect(() => {
    if (!bookingId) return;
    getDoc(doc(db, "bookings", bookingId))
      .then((snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setBookingData(data);
          const svcName = data.subServiceName || data.serviceCategory || initialCategory;
          const category = data.serviceCategory || initialCategory;
          const list = getServiceChecklist(svcName, category, data.checklist);
          setCustomerChecklist(list);
          setCustomerChecklistDone(data.customerChecklistDone || data.checklistDone || list);
        }
      })
      .catch((e) => console.log("[RatingFeedback] error fetching booking:", e));
  }, [bookingId]);

  // Live countdown timer ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (!hasForceEndedRef.current) {
            hasForceEndedRef.current = true;
            handleForcefulEnd("Auto-closed after 10-minute verification timeout");
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [bookingId, bookingData]);

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const vendorName = bookingData?.vendorName || initialVendorName;
  const serviceName = bookingData?.subServiceName || bookingData?.serviceCategory || initialCategory;
  const vendorId = bookingData?.vendorId || null;

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const toggleCustomerCheck = (item: string) => {
    setCustomerChecklistDone((prev) =>
      prev.includes(item) ? prev.filter((t) => t !== item) : [...prev, item]
    );
  };

  // Intercept Skip or Close with Forceful Ending Warning
  const handlePromptSkipOrClose = () => {
    Alert.alert(
      "⚠️ Forcefully End Service?",
      "Customer verification is required to finalize this booking. If you exit now, the service will be forcefully ended without your feedback and marked completed.",
      [
        {
          text: "Continue Review",
          style: "cancel",
        },
        {
          text: "Forcefully End Now",
          style: "destructive",
          onPress: () => handleForcefulEnd("Customer skipped review"),
        },
      ]
    );
  };

  // Forcefully end the service
  const handleForcefulEnd = async (reason: string) => {
    if (!bookingId) {
      navigation.replace("ServiceCompleted", { bookingId: "UH-DEMO982" });
      return;
    }

    setSubmitting(true);
    try {
      await updateDoc(doc(db, "bookings", bookingId), {
        status: "completed",
        completedAt: serverTimestamp(),
        forcefullyEnded: true,
        forcefullyEndedReason: reason,
        endedBy: "forcefully_ended",
        rated: false,
        customerReviewedAt: serverTimestamp(),
      });

      // Update vendor stats if present
      if (vendorId) {
        try {
          const vRef = doc(db, "vendors", vendorId);
          const vSnap = await getDoc(vRef);
          if (vSnap.exists()) {
            const vData = vSnap.data();
            await updateDoc(vRef, {
              completedJobs: (vData.completedJobs || 0) + 1,
              lastCompletedAt: serverTimestamp(),
            });
          }
        } catch (_) {}
      }

      Alert.alert(
        "Service Forcefully Ended",
        "The service has been forcefully closed without customer feedback.",
        [
          {
            text: "View Bill",
            onPress: () => navigation.replace("ServiceCompleted", { bookingId }),
          },
        ]
      );
    } catch (e: any) {
      console.warn("[handleForcefulEnd] error:", e);
      navigation.replace("ServiceCompleted", { bookingId });
    } finally {
      setSubmitting(false);
    }
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
        vendorId: vendorId || undefined,
      });

      // 2. Officially end and complete the service upon customer feedback
      await updateDoc(doc(db, "bookings", bookingId), {
        status: "completed",
        completedAt: serverTimestamp(),
        forcefullyEnded: false,
        endedBy: "customer_feedback",
        customerChecklistDone,
        customerChecklist,
        customerReviewedAt: serverTimestamp(),
      });

      // 3. Update vendor completed stats
      if (vendorId) {
        try {
          const vRef = doc(db, "vendors", vendorId);
          const vSnap = await getDoc(vRef);
          if (vSnap.exists()) {
            const vData = vSnap.data();
            await updateDoc(vRef, {
              completedJobs: (vData.completedJobs || 0) + 1,
              lastCompletedAt: serverTimestamp(),
            });
          }
        } catch (_) {}
      }

      // 4. If complaint filed or rating <= 2, register in complaints & lock vendor profile
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
          onPress={handlePromptSkipOrClose}
        >
          <Ionicons name="close" size={20} color="white" />
        </Pressable>
        <Text style={s.headerTitle}>Rate &amp; Review</Text>
        <Pressable
          style={s.skipHeaderBtn}
          onPress={handlePromptSkipOrClose}
        >
          <Text style={s.skipHeaderText}>Skip</Text>
        </Pressable>
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Forceful Ending Warning & Live Countdown Banner */}
        <Animated.View entering={FadeInDown.duration(340)} style={s.forcefulWarningCard}>
          <LinearGradient
            colors={["rgba(245, 158, 11, 0.16)", "rgba(180, 83, 9, 0.08)"]}
            style={[StyleSheet.absoluteFillObject, { borderRadius: 16 }]}
          />
          <View style={s.forcefulWarningHeader}>
            <View style={s.forcefulWarningIconWrap}>
              <Ionicons name="time" size={18} color="#f59e0b" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.forcefulWarningTitle}>ACTION REQUIRED: SERVICE COMPLETION</Text>
              <Text style={s.forcefulWarningSubtitle}>
                Service will only officially end once you submit feedback below. Otherwise, it will be forcefully ended automatically.
              </Text>
            </View>
          </View>

          <View style={s.countdownTimerBar}>
            <View style={s.countdownTag}>
              <Ionicons name="alert-circle" size={14} color="#f87171" />
              <Text style={s.countdownTagText}>Auto Force-End In</Text>
            </View>
            <View style={s.timerDigitsBox}>
              <Text style={s.timerDigitsText}>{formatCountdown(secondsRemaining)}</Text>
            </View>
          </View>
        </Animated.View>

        {/* Hero Partner Info */}
        <Animated.View entering={FadeInDown.delay(50).duration(380)} style={s.hero}>
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

        {/* Customer Quality Checklist Verification */}
        {customerChecklist.length > 0 && (
          <Animated.View entering={FadeInDown.delay(100).duration(380)} style={s.card}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <Ionicons name="checkbox" size={20} color="#10b981" />
              <Text style={s.cardTitle}>Verify Service Steps Completed</Text>
            </View>
            <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 12 }}>
              Confirm each step executed by the technician:
            </Text>
            <View style={{ gap: 8 }}>
              {customerChecklist.map((item, idx) => {
                const isChecked = customerChecklistDone.includes(item);
                return (
                  <Pressable
                    key={idx}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 10,
                      backgroundColor: isChecked ? "rgba(16,185,129,0.12)" : "rgba(255,255,255,0.04)",
                      borderWidth: 1,
                      borderColor: isChecked ? "rgba(16,185,129,0.4)" : "rgba(255,255,255,0.08)",
                      padding: 10,
                      borderRadius: 10,
                    }}
                    onPress={() => toggleCustomerCheck(item)}
                  >
                    <Ionicons
                      name={isChecked ? "checkbox" : "square-outline"}
                      size={20}
                      color={isChecked ? "#10b981" : "rgba(255,255,255,0.4)"}
                    />
                    <Text
                      style={{
                        flex: 1,
                        fontSize: 13,
                        color: isChecked ? "#ffffff" : "rgba(255,255,255,0.7)",
                        fontWeight: isChecked ? "600" : "400",
                      }}
                    >
                      {item}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </Animated.View>
        )}

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

  // Forceful Ending Warning Banner
  forcefulWarningCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(245,158,11,0.35)",
    backgroundColor: "rgba(245,158,11,0.06)",
  },
  forcefulWarningHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  forcefulWarningIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(245,158,11,0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(245,158,11,0.4)",
  },
  forcefulWarningTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#f59e0b",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  forcefulWarningSubtitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.72)",
    lineHeight: 16,
  },
  countdownTimerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(245,158,11,0.2)",
  },
  countdownTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(239,68,68,0.14)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.3)",
  },
  countdownTagText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#fca5a5",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  timerDigitsBox: {
    backgroundColor: "#07131e",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(245,158,11,0.5)",
  },
  timerDigitsText: {
    fontSize: 16,
    fontWeight: "900",
    color: "#f59e0b",
    fontVariant: ["tabular-nums"],
    letterSpacing: 1,
  },
});
