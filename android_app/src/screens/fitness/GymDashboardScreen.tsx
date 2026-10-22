import React, { useState } from "react";
import {
  ScrollView,
  Text,
  View,
  Pressable,
  StyleSheet,
  StatusBar,
  Dimensions,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/types";
import { colors } from "@/theme/colors";
import SamsungBottomNav from "@/components/SamsungBottomNav";
import { addActivity } from "@/services/healthLogService";

type Props = NativeStackScreenProps<RootStackParamList, "GymDashboard">;
const { width: SW } = Dimensions.get("window");

interface GymTarget {
  id: string;
  name: string;
  focus: string;
  durationMins: number;
  estCalories: number;
  gradient: [string, string];
  exercises: string[];
}

const GYM_TARGETS: GymTarget[] = [
  {
    id: "upper",
    name: "Upper Body Strength",
    focus: "Chest, Shoulders & Arms",
    durationMins: 35,
    estCalories: 260,
    gradient: ["#1e3a8a", "#0284c7"],
    exercises: ["Dumbbell Bench Press (3x10)", "Overhead Shoulder Press (3x10)", "Lateral Raises (3x12)", "Tricep Dips (3x12)", "Bicep Curls (3x12)"],
  },
  {
    id: "lower",
    name: "Lower Body Power",
    focus: "Quads, Glutes & Hamstrings",
    durationMins: 40,
    estCalories: 310,
    gradient: ["#0f766e", "#059669"],
    exercises: ["Goblet Squats (4x10)", "Romanian Deadlifts (3x10)", "Walking Lunges (3x12)", "Calf Raises (4x15)", "Glute Bridges (3x15)"],
  },
  {
    id: "fullbody",
    name: "Full Body Functional",
    focus: "Total Body Conditioning",
    durationMins: 30,
    estCalories: 240,
    gradient: ["#581c87", "#7e22ce"],
    exercises: ["Kettlebell Swings (4x15)", "Push-Ups (3x12)", "Pull-Ups or Lat Pulldowns (3x8)", "Plank to Push-Up (3x10)", "Jump Squats (3x12)"],
  },
  {
    id: "core",
    name: "Core & Stability",
    focus: "Abs, Obliques & Lower Back",
    durationMins: 20,
    estCalories: 150,
    gradient: ["#c2410c", "#ea580c"],
    exercises: ["Hanging Knee Raises (3x12)", "Ab Wheel Rollouts (3x10)", "Side Plank Hold (3x30s)", "Superman Extensions (3x15)"],
  },
];

export default function GymDashboardScreen({ navigation }: Props) {
  const [selectedTarget, setSelectedTarget] = useState<GymTarget>(GYM_TARGETS[0]);
  const [completedExercises, setCompletedExercises] = useState<string[]>([]);

  const toggleExercise = (name: string) => {
    if (completedExercises.includes(name)) {
      setCompletedExercises((prev) => prev.filter((ex) => ex !== name));
    } else {
      setCompletedExercises((prev) => [...prev, name]);
    }
  };

  const handleLogCompletedSession = async () => {
    try {
      await addActivity({
        type: "gym",
        title: `${selectedTarget.name} Session`,
        durationMins: selectedTarget.durationMins,
        caloriesBurned: selectedTarget.estCalories,
      });
      setCompletedExercises([]);
      Alert.alert(
        "🎉 Great Workout!",
        `Saved ${selectedTarget.name} to your fitness activity log (~${selectedTarget.estCalories} kcal burned).`,
        [
          {
            text: "View in Fitness",
            onPress: () => navigation.navigate("FitnessDashboard"),
          },
          { text: "Done", style: "cancel" },
        ]
      );
    } catch (e) {
      console.warn("Error logging gym session:", e);
    }
  };

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Header */}
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} style={s.iconBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.text.secondary} />
        </Pressable>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>Strength & Gym</Text>
        </View>
        <Pressable
          style={s.iconBtn}
          onPress={() => navigation.navigate("FitnessDashboard")}
        >
          <Ionicons name="fitness-outline" size={22} color={colors.primary} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {/* Hero Card */}
        <LinearGradient
          colors={selectedTarget.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.heroCard}
        >
          <View style={s.heroTop}>
            <View style={s.heroBadge}>
              <Text style={s.heroBadgeText}>{selectedTarget.focus}</Text>
            </View>
            <Text style={s.heroMeta}>
              ⏱️ {selectedTarget.durationMins}m • 🔥 ~{selectedTarget.estCalories} kcal
            </Text>
          </View>

          <Text style={s.heroTitle}>{selectedTarget.name}</Text>
          <Text style={s.heroSub}>
            Complete the target set below to build strength and track progress.
          </Text>
        </LinearGradient>

        {/* Workout Category Selector */}
        <Text style={s.sectionTitle}>Workout Focus</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.targetScroll}>
          {GYM_TARGETS.map((target) => {
            const isSelected = selectedTarget.id === target.id;
            return (
              <Pressable
                key={target.id}
                style={[s.targetChip, isSelected && s.targetChipSelected]}
                onPress={() => {
                  setSelectedTarget(target);
                  setCompletedExercises([]);
                }}
              >
                <Ionicons
                  name="barbell"
                  size={16}
                  color={isSelected ? "#041423" : colors.text.secondary}
                />
                <Text style={[s.targetChipText, isSelected && s.targetChipTextSelected]}>
                  {target.name}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Exercise Checklist */}
        <View style={s.checklistHeader}>
          <Text style={s.sectionTitle}>Exercise Checklist</Text>
          <Text style={s.checklistProgress}>
            {completedExercises.length} / {selectedTarget.exercises.length} Done
          </Text>
        </View>

        <View style={s.checklistCard}>
          {selectedTarget.exercises.map((exercise, index) => {
            const isDone = completedExercises.includes(exercise);
            return (
              <Pressable
                key={index}
                style={[s.checkItem, isDone && s.checkItemDone]}
                onPress={() => toggleExercise(exercise)}
              >
                <View style={[s.checkbox, isDone && s.checkboxDone]}>
                  {isDone && <Ionicons name="checkmark" size={14} color="#041423" />}
                </View>
                <Text style={[s.checkText, isDone && s.checkTextDone]}>
                  {exercise}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Complete Workout Button */}
        <Pressable
          style={s.completeBtn}
          onPress={handleLogCompletedSession}
        >
          <Ionicons name="checkmark-circle" size={20} color="#041423" />
          <Text style={s.completeBtnText}>Save Completed Session</Text>
        </Pressable>

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
    backgroundColor: colors.surface.dim, // #041423
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 52,
    paddingBottom: 14,
    backgroundColor: colors.surface.dim,
  },
  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.text.primary,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface.container,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },

  // Hero Card
  heroCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  heroBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  heroBadgeText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "700",
  },
  heroMeta: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 12,
    fontWeight: "600",
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#ffffff",
    letterSpacing: -0.3,
  },
  heroSub: {
    fontSize: 12.5,
    color: "rgba(255,255,255,0.8)",
    marginTop: 4,
    lineHeight: 18,
  },

  sectionTitle: {
    fontSize: 16.5,
    fontWeight: "800",
    color: colors.text.primary,
    marginBottom: 10,
  },
  targetScroll: {
    marginBottom: 20,
  },
  targetChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.surface.container,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  targetChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  targetChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text.secondary,
  },
  targetChipTextSelected: {
    color: "#041423",
    fontWeight: "800",
  },

  checklistHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 8,
  },
  checklistProgress: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.secondary,
  },
  checklistCard: {
    backgroundColor: colors.surface.container,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    marginBottom: 18,
  },
  checkItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.04)",
  },
  checkItemDone: {
    opacity: 0.6,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border.light,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  checkboxDone: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
  checkText: {
    fontSize: 14,
    color: colors.text.primary,
    fontWeight: "600",
    flex: 1,
  },
  checkTextDone: {
    textDecorationLine: "line-through",
    color: colors.text.muted,
  },

  completeBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: 4,
  },
  completeBtnText: {
    color: "#041423",
    fontSize: 14.5,
    fontWeight: "800",
  },
});
