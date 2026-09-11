import React, { useState } from "react";
import {
  ScrollView,
  Text,
  View,
  Pressable,
  TextInput,
  StyleSheet,
  Dimensions,
  StatusBar,
  Alert,
} from "react-native";
import Svg, { Circle, Path, G, Rect } from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { RootStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "MoodCheckIn">;

const { width: SW } = Dimensions.get("window");

// Mood Levels (Screenshot 6)
interface MoodOption {
  id: string;
  label: string;
  color: string;
  type: "awesome" | "good" | "fine" | "bad" | "terrible";
}

const MOODS: MoodOption[] = [
  { id: "awesome", label: "Awesome!", color: "#60a5fa", type: "awesome" },
  { id: "good", label: "Good", color: "#4ade80", type: "good" },
  { id: "fine", label: "Fine", color: "#facc15", type: "fine" },
  { id: "bad", label: "Bad", color: "#fb923c", type: "bad" },
  { id: "terrible", label: "Terrible", color: "#f87171", type: "terrible" },
];

// Emotions (Screenshot 5)
const EMOTIONS = [
  "Joyful", "Hopeful", "Amazed",
  "Relieved", "Confident", "Content",
  "Satisfied", "Happy", "Passionate",
  "Enthusiastic", "Excited", "Brave",
  "Proud", "Calm", "Curious",
  "Grateful", "Peaceful"
];

// Factors (Screenshot 4)
const FACTORS = [
  "Health", "Sleep", "Exercise", "Food",
  "Hobby", "Money",
  "Identity", "Partner", "Friends", "Pet",
  "Family", "Colleagues", "Dating",
  "Work", "Home", "School",
  "Outdoors", "Travel", "Weather"
];

export default function MoodCheckInScreen({ navigation }: Props) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedMood, setSelectedMood] = useState<MoodOption>(MOODS[0]);
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>(["Joyful", "Happy"]);
  const [selectedFactors, setSelectedFactors] = useState<string[]>(["Health", "Exercise"]);
  const [note, setNote] = useState("");
  const [helpfulFeedback, setHelpfulFeedback] = useState<"up" | "down" | null>(null);

  // Clay Face SVG Renderer
  const renderClayFace = (type: MoodOption["type"], size: number = 44) => {
    switch (type) {
      case "awesome":
        return (
          <Svg width={size} height={size} viewBox="0 0 50 50">
            {/* Eyes */}
            <Circle cx="19" cy="18" r="3.5" fill="#60a5fa" />
            <Circle cx="31" cy="18" r="3.5" fill="#60a5fa" />
            {/* Broad smile clay mouth */}
            <Path
              d="M12 26 C12 38, 38 38, 38 26 C38 23, 12 23, 12 26 Z"
              fill="#60a5fa"
            />
          </Svg>
        );
      case "good":
        return (
          <Svg width={size} height={size} viewBox="0 0 50 50">
            <Circle cx="19" cy="20" r="3.2" fill="#4ade80" />
            <Circle cx="31" cy="20" r="3.2" fill="#4ade80" />
            {/* Gentle smile */}
            <Path
              d="M15 28 C15 36, 35 36, 35 28 C35 26, 15 26, 15 28 Z"
              fill="#4ade80"
            />
          </Svg>
        );
      case "fine":
        return (
          <Svg width={size} height={size} viewBox="0 0 50 50">
            <Circle cx="19" cy="22" r="3" fill="#facc15" />
            <Circle cx="31" cy="22" r="3" fill="#facc15" />
            {/* Neutral straight pill line */}
            <Rect x="14" y="28" width="22" height="6" rx="3" fill="#facc15" />
          </Svg>
        );
      case "bad":
        return (
          <Svg width={size} height={size} viewBox="0 0 50 50">
            <Circle cx="19" cy="22" r="3.2" fill="#fb923c" />
            <Circle cx="31" cy="22" r="3.2" fill="#fb923c" />
            {/* Slight frown mouth */}
            <Path
              d="M15 34 C15 28, 35 28, 35 34 C35 37, 15 37, 15 34 Z"
              fill="#fb923c"
            />
          </Svg>
        );
      case "terrible":
        return (
          <Svg width={size} height={size} viewBox="0 0 50 50">
            <Circle cx="19" cy="24" r="3.5" fill="#f87171" />
            <Circle cx="31" cy="24" r="3.5" fill="#f87171" />
            {/* Deep frown mouth */}
            <Path
              d="M12 36 C12 26, 38 26, 38 36 C38 40, 12 40, 12 36 Z"
              fill="#f87171"
            />
          </Svg>
        );
    }
  };

  const toggleEmotion = (e: string) => {
    if (selectedEmotions.includes(e)) {
      setSelectedEmotions(selectedEmotions.filter((x) => x !== e));
    } else {
      setSelectedEmotions([...selectedEmotions, e]);
    }
  };

  const toggleFactor = (f: string) => {
    if (selectedFactors.includes(f)) {
      setSelectedFactors(selectedFactors.filter((x) => x !== f));
    } else {
      setSelectedFactors([...selectedFactors, f]);
    }
  };

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0d0f26" />

      {/* Header */}
      <View style={s.header}>
        <Pressable
          onPress={() => {
            if (step > 1 && step < 4) {
              setStep((prev) => (prev - 1) as any);
            } else {
              navigation.goBack();
            }
          }}
          style={s.headerBtn}
          accessibilityLabel="Back"
        >
          <Ionicons name="chevron-back" size={26} color="#ffffff" />
        </Pressable>
        {step < 4 ? (
          <Text style={s.headerTitle}>Mood check-in</Text>
        ) : (
          <View style={{ flex: 1 }} />
        )}
        <Pressable
          onPress={() =>
            Alert.alert(
              "Mood Check-in",
              "Checking in on your emotional state allows you to discover personal triggers and track long-term mental well-being."
            )
          }
          style={s.headerBtn}
        >
          <Ionicons name="information-circle-outline" size={24} color="#ffffff" />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={s.scrollContent}>
        {/* STEP 1: How are you feeling? (Screenshot 6) */}
        {step === 1 && (
          <Animated.View entering={FadeIn.duration(300)}>
            <View style={s.card}>
              <Text style={s.stepQuestion}>How are you feeling?</Text>

              <View style={s.moodList}>
                {MOODS.map((m) => {
                  const isSelected = selectedMood.id === m.id;
                  return (
                    <Pressable
                      key={m.id}
                      style={s.moodRow}
                      onPress={() => setSelectedMood(m)}
                    >
                      {/* Radio Circle */}
                      <View style={[s.radioCircle, isSelected && s.radioSelected]}>
                        {isSelected && <View style={s.radioInnerDot} />}
                      </View>

                      {/* Clay Face */}
                      <View style={s.clayFaceWrap}>
                        {renderClayFace(m.type, 38)}
                      </View>

                      {/* Mood Label */}
                      <Text style={s.moodLabel}>{m.label}</Text>
                    </Pressable>
                  );
                })}
              </View>

              <Text style={s.stepNote}>
                A mood is an overall state of mind that's long lasting.
              </Text>
            </View>
          </Animated.View>
        )}

        {/* STEP 2: Which emotions best describe how you feel? (Screenshot 5) */}
        {step === 2 && (
          <Animated.View entering={FadeIn.duration(300)}>
            <View style={s.card}>
              <View style={s.titleWithIconRow}>
                <Text style={s.stepQuestion}>
                  Which emotions best describe how you feel?
                </Text>
                <Ionicons name="chevron-down" size={20} color="#94a3b8" />
              </View>

              <View style={s.chipsWrap}>
                {EMOTIONS.map((e) => {
                  const active = selectedEmotions.includes(e);
                  return (
                    <Pressable
                      key={e}
                      style={[s.chip, active && s.chipActive]}
                      onPress={() => toggleEmotion(e)}
                    >
                      <Text style={[s.chipText, active && s.chipTextActive]}>
                        {e}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <Text style={s.stepNote}>
                An emotion is a short-lived reaction, such as joy, anger, or sadness, to an event or meaningful experience.
              </Text>
            </View>
          </Animated.View>
        )}

        {/* STEP 3: What's making you feel this way? (Screenshot 4) */}
        {step === 3 && (
          <Animated.View entering={FadeIn.duration(300)}>
            <View style={s.card}>
              <Text style={s.stepQuestion}>What's making you feel this way?</Text>

              <View style={s.chipsWrap}>
                {FACTORS.map((f) => {
                  const active = selectedFactors.includes(f);
                  return (
                    <Pressable
                      key={f}
                      style={[s.chip, active && s.chipActive]}
                      onPress={() => toggleFactor(f)}
                    >
                      <Text style={[s.chipText, active && s.chipTextActive]}>
                        {f}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <Text style={[s.stepQuestion, { marginTop: 24 }]}>
                Anything else to add?
              </Text>

              <TextInput
                style={s.noteInput}
                placeholder="Add a note to help you remember this feeling or moment"
                placeholderTextColor="#64748b"
                value={note}
                onChangeText={setNote}
                multiline
                numberOfLines={3}
              />
            </View>
          </Animated.View>
        )}

        {/* STEP 4: Summary / Confirmation (Screenshot 3) */}
        {step === 4 && (
          <Animated.View entering={FadeInDown.duration(400)}>
            {/* Big Clay Emoji Hero Card */}
            <View style={s.heroResultCard}>
              <View style={s.bigClayFaceWrap}>
                {renderClayFace(selectedMood.type, 130)}
              </View>
              <Text style={s.heroResultTitle}>{selectedMood.label}</Text>
            </View>

            {/* Check-in Streak Card */}
            <View style={s.card}>
              <Text style={s.streakCardTitle}>1 check-in this week.</Text>
              <View style={s.weekDaysRow}>
                {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                  <View key={i} style={s.weekDayCol}>
                    <Text style={[s.weekDayText, i === 0 && { color: "#f87171" }]}>
                      {d}
                    </Text>
                    {i === 5 ? (
                      <View style={s.activeCheckinIcon}>
                        {renderClayFace(selectedMood.type, 24)}
                      </View>
                    ) : (
                      <View style={s.emptyDayDot} />
                    )}
                  </View>
                ))}
              </View>
            </View>

            {/* Was this helpful? */}
            <View style={s.feedbackRow}>
              <Text style={s.feedbackText}>Was this helpful?</Text>
              <View style={s.feedbackPill}>
                <Pressable
                  onPress={() => setHelpfulFeedback("up")}
                  style={[s.feedbackBtn, helpfulFeedback === "up" && s.feedbackBtnActive]}
                >
                  <Ionicons
                    name="thumbs-up-outline"
                    size={16}
                    color={helpfulFeedback === "up" ? "#60a5fa" : "#cbd5e1"}
                  />
                </Pressable>
                <View style={s.feedbackDivider} />
                <Pressable
                  onPress={() => setHelpfulFeedback("down")}
                  style={[s.feedbackBtn, helpfulFeedback === "down" && s.feedbackBtnActive]}
                >
                  <Ionicons
                    name="thumbs-down-outline"
                    size={16}
                    color={helpfulFeedback === "down" ? "#f87171" : "#cbd5e1"}
                  />
                </Pressable>
              </View>
            </View>
          </Animated.View>
        )}
      </ScrollView>

      {/* Bottom Sticky Action Button */}
      <View style={s.bottomBar}>
        {step < 3 ? (
          <Pressable
            style={s.actionBtn}
            onPress={() => setStep((prev) => (prev + 1) as any)}
          >
            <Text style={s.actionBtnText}>Next</Text>
          </Pressable>
        ) : step === 3 ? (
          <Pressable
            style={s.actionBtn}
            onPress={() => setStep(4)}
          >
            <Text style={s.actionBtnText}>Save</Text>
          </Pressable>
        ) : (
          <Pressable
            style={s.actionBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={s.actionBtnText}>Done</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0d0f26",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 12,
    backgroundColor: "#0d0f26",
  },
  headerBtn: {
    padding: 6,
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#ffffff",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 110,
    paddingTop: 10,
  },
  card: {
    backgroundColor: "#161938",
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
  },
  stepQuestion: {
    fontSize: 24,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 20,
    lineHeight: 30,
  },
  titleWithIconRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  moodList: {
    marginBottom: 24,
    gap: 16,
  },
  moodRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#64748b",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  radioSelected: {
    borderColor: "#60a5fa",
  },
  radioInnerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#60a5fa",
  },
  clayFaceWrap: {
    width: 44,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  moodLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff",
  },
  stepNote: {
    fontSize: 13,
    color: "#94a3b8",
    lineHeight: 19,
    marginTop: 8,
  },
  chipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },
  chip: {
    backgroundColor: "#20254d",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  chipActive: {
    backgroundColor: "#4f46e5",
  },
  chipText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#cbd5e1",
  },
  chipTextActive: {
    color: "#ffffff",
    fontWeight: "700",
  },
  noteInput: {
    backgroundColor: "#20254d",
    borderRadius: 16,
    padding: 16,
    color: "#ffffff",
    fontSize: 14,
    textAlignVertical: "top",
    minHeight: 80,
    marginTop: 6,
  },
  heroResultCard: {
    backgroundColor: "#161938",
    borderRadius: 28,
    paddingVertical: 44,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  bigClayFaceWrap: {
    marginBottom: 24,
  },
  heroResultTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: "#ffffff",
  },
  streakCardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 16,
  },
  weekDaysRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  weekDayCol: {
    alignItems: "center",
    gap: 8,
  },
  weekDayText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#94a3b8",
  },
  emptyDayDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  activeCheckinIcon: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  feedbackRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 4,
    marginTop: 10,
  },
  feedbackText: {
    fontSize: 14,
    color: "#94a3b8",
  },
  feedbackPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#161938",
    borderRadius: 16,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  feedbackBtn: {
    padding: 8,
  },
  feedbackBtnActive: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 12,
  },
  feedbackDivider: {
    width: 1,
    height: 16,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: "#0d0f26",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
  },
  actionBtn: {
    backgroundColor: "#555be8",
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: "center",
  },
  actionBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
  },
});
