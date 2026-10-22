/**
 * OpenGym Complete Catalogue & Data Models
 * Bundled offline from OpenGym (https://github.com/opengym/opengym)
 */

export type OpenGymBodyPart =
  | "all"
  | "chest"
  | "back"
  | "shoulders"
  | "arms"
  | "legs"
  | "core"
  | "cardio"
  | "full-body";

export interface OpenGymExercise {
  id: string;
  name: string;
  bodyPart: "chest" | "back" | "shoulders" | "arms" | "legs" | "core" | "cardio" | "full-body" | "other";
  target: string;
  secondaryMuscles: string[];
  equipment: string;
  category: string;
  instructions: string[];
  defaultSets: number;
  defaultReps: number;
  defaultWeight: number;
}

export interface OpenGymSet {
  setNumber: number;
  reps: number;
  weightKg: number;
  completed: boolean;
  rpe?: number; // Rate of Perceived Exertion (1-10)
  isWarmup?: boolean;
}

export interface OpenGymActiveExercise {
  exerciseId: string;
  name: string;
  bodyPart: string;
  equipment: string;
  sets: OpenGymSet[];
}

export interface OpenGymSession {
  id: string;
  routineId?: string;
  routineName: string;
  startTime: number;
  endTime?: number;
  durationMins: number;
  totalVolumeKg: number;
  totalSetsCompleted: number;
  caloriesBurned: number;
  exercises: OpenGymActiveExercise[];
  notes?: string;
}

export interface OpenGymRoutine {
  id: string;
  name: string;
  category: string;
  description: string;
  targetMuscles: string;
  icon: string;
  color: string;
  exerciseIds: string[];
}

export interface OpenGymBodyweightEntry {
  id: string;
  weightKg: number;
  date: string;
  timestamp: number;
}

export const OPENGYM_EXERCISES: OpenGymExercise[] = [
  {
    "id": "0009",
    "name": "Assisted Chest Dip (kneeling)",
    "bodyPart": "chest",
    "target": "Pectorals",
    "secondaryMuscles": [
      "Triceps",
      "Shoulders"
    ],
    "equipment": "Leverage Machine",
    "category": "strength",
    "instructions": [
      "Adjust the machine to your desired height and secure your knees on the pad.",
      "Grasp the handles with your palms facing down and your arms fully extended.",
      "Lower your body by bending your elbows until your upper arms are parallel to the floor.",
      "Pause for a moment, then push yourself back up to the starting position.",
      "Repeat for the desired number of repetitions."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 20
  },
  {
    "id": "0024",
    "name": "Barbell Bench Front Squat",
    "bodyPart": "legs",
    "target": "Quads",
    "secondaryMuscles": [
      "Hamstrings",
      "Glutes",
      "Calves"
    ],
    "equipment": "Barbell",
    "category": "strength",
    "instructions": [
      "Start by standing with your feet shoulder-width apart and the barbell resting on your upper chest, just below your collarbone.",
      "Hold the barbell with an overhand grip, keeping your elbows up and your upper arms parallel to the ground.",
      "Lower your body down into a squat position by bending at the knees and hips, keeping your back straight and your chest up.",
      "Pause for a moment at the bottom of the squat, then push through your heels to return to the starting position.",
      "Repeat for the desired number of repetitions."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 20
  },
  {
    "id": "0025",
    "name": "Barbell Bench Press",
    "bodyPart": "chest",
    "target": "Pectorals",
    "secondaryMuscles": [
      "Triceps",
      "Shoulders"
    ],
    "equipment": "Barbell",
    "category": "strength",
    "instructions": [
      "Lie flat on a bench with your feet flat on the ground and your back pressed against the bench.",
      "Grasp the barbell with an overhand grip slightly wider than shoulder-width apart.",
      "Lift the barbell off the rack and hold it directly above your chest with your arms fully extended.",
      "Lower the barbell slowly towards your chest, keeping your elbows tucked in.",
      "Pause for a moment when the barbell touches your chest.",
      "Push the barbell back up to the starting position by extending your arms.",
      "Repeat for the desired number of repetitions."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 20
  },
  {
    "id": "0027",
    "name": "Barbell Bent Over Row",
    "bodyPart": "back",
    "target": "Upper Back",
    "secondaryMuscles": [
      "Biceps",
      "Forearms"
    ],
    "equipment": "Barbell",
    "category": "strength",
    "instructions": [
      "Stand with your feet shoulder-width apart and knees slightly bent.",
      "Bend forward at the hips while keeping your back straight and chest up.",
      "Grasp the barbell with an overhand grip, hands slightly wider than shoulder-width apart.",
      "Pull the barbell towards your lower chest by retracting your shoulder blades and squeezing your back muscles.",
      "Pause for a moment at the top, then slowly lower the barbell back to the starting position.",
      "Repeat for the desired number of repetitions."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 20
  },
  {
    "id": "0031",
    "name": "Barbell Curl",
    "bodyPart": "arms",
    "target": "Biceps",
    "secondaryMuscles": [
      "Forearms"
    ],
    "equipment": "Barbell",
    "category": "strength",
    "instructions": [
      "Stand up straight with your feet shoulder-width apart and hold a barbell with an underhand grip, palms facing forward.",
      "Keep your elbows close to your torso and exhale as you curl the weights while contracting your biceps.",
      "Continue to raise the bar until your biceps are fully contracted and the bar is at shoulder level.",
      "Hold the contracted position for a brief pause as you squeeze your biceps.",
      "Inhale as you slowly begin to lower the bar back to the starting position.",
      "Repeat for the desired number of repetitions."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 20
  },
  {
    "id": "0038",
    "name": "Barbell Drag Curl",
    "bodyPart": "arms",
    "target": "Biceps",
    "secondaryMuscles": [
      "Forearms"
    ],
    "equipment": "Barbell",
    "category": "strength",
    "instructions": [
      "Stand with your feet shoulder-width apart and hold a barbell with an underhand grip, palms facing up.",
      "Let the barbell hang at arm's length in front of your thighs.",
      "Keeping your upper arms stationary, curl the barbell up towards your chest by contracting your biceps.",
      "Pause for a moment at the top, then slowly lower the barbell back down to the starting position.",
      "Repeat for the desired number of repetitions."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 20
  },
  {
    "id": "0043",
    "name": "Barbell Full Squat",
    "bodyPart": "legs",
    "target": "Glutes",
    "secondaryMuscles": [
      "Quadriceps",
      "Hamstrings",
      "Calves",
      "Core"
    ],
    "equipment": "Barbell",
    "category": "strength",
    "instructions": [
      "Stand with your feet shoulder-width apart, toes slightly turned out.",
      "Hold the barbell across your upper back, resting it on your traps or rear delts.",
      "Engage your core and keep your chest up as you begin to lower your body down.",
      "Bend at the knees and hips, pushing your hips back and down as if sitting into a chair.",
      "Lower yourself until your thighs are parallel to the ground or slightly below.",
      "Keep your knees in line with your toes and your weight in your heels.",
      "Drive through your heels to stand back up, extending your hips and knees.",
      "Repeat for the desired number of repetitions."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 20
  },
  {
    "id": "0047",
    "name": "Barbell Incline Bench Press",
    "bodyPart": "chest",
    "target": "Pectorals",
    "secondaryMuscles": [
      "Shoulders",
      "Triceps"
    ],
    "equipment": "Barbell",
    "category": "strength",
    "instructions": [
      "Set up an incline bench at a 45-degree angle.",
      "Lie down on the bench with your feet flat on the ground.",
      "Grasp the barbell with an overhand grip, slightly wider than shoulder-width apart.",
      "Unrack the barbell and lower it slowly towards your chest, keeping your elbows at a 45-degree angle.",
      "Pause for a moment at the bottom, then push the barbell back up to the starting position.",
      "Repeat for the desired number of repetitions."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 20
  },
  {
    "id": "0052",
    "name": "Barbell Jm Bench Press",
    "bodyPart": "arms",
    "target": "Triceps",
    "secondaryMuscles": [
      "Chest",
      "Shoulders"
    ],
    "equipment": "Barbell",
    "category": "strength",
    "instructions": [
      "Lie flat on a bench with your feet flat on the ground and your back pressed against the bench.",
      "Grasp the barbell with an overhand grip, slightly wider than shoulder-width apart.",
      "Lower the barbell to your chest, keeping your elbows tucked in close to your body.",
      "Push the barbell back up to the starting position, fully extending your arms.",
      "Repeat for the desired number of repetitions."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 20
  },
  {
    "id": "0082",
    "name": "Barbell Reverse Wrist Curl",
    "bodyPart": "arms",
    "target": "Forearms",
    "secondaryMuscles": [
      "Biceps",
      "Brachialis"
    ],
    "equipment": "Barbell",
    "category": "strength",
    "instructions": [
      "Sit on a bench with your feet flat on the ground and hold a barbell with an overhand grip, palms facing down.",
      "Rest your forearms on your thighs, allowing your wrists to hang off the edge.",
      "Slowly curl your wrists upward, bringing the barbell towards your body.",
      "Pause for a moment at the top, then slowly lower the barbell back down to the starting position.",
      "Repeat for the desired number of repetitions."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 20
  },
  {
    "id": "0085",
    "name": "Barbell Romanian Deadlift",
    "bodyPart": "legs",
    "target": "Glutes",
    "secondaryMuscles": [
      "Hamstrings",
      "Lower Back"
    ],
    "equipment": "Barbell",
    "category": "strength",
    "instructions": [
      "Stand with your feet shoulder-width apart and your toes pointing forward.",
      "Hold the barbell with an overhand grip, hands slightly wider than shoulder-width apart.",
      "Bend at the hips, keeping your back straight and your knees slightly bent.",
      "Lower the barbell towards the ground, keeping it close to your body.",
      "Feel the stretch in your hamstrings as you lower the barbell.",
      "Once you feel a stretch in your hamstrings, push your hips forward and stand up straight.",
      "Squeeze your glutes at the top of the movement.",
      "Lower the barbell back down to the starting position and repeat for the desired number of repetitions."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 20
  },
  {
    "id": "0116",
    "name": "Barbell Straight Leg Deadlift",
    "bodyPart": "legs",
    "target": "Hamstrings",
    "secondaryMuscles": [
      "Glutes",
      "Lower Back"
    ],
    "equipment": "Barbell",
    "category": "strength",
    "instructions": [
      "Stand with your feet shoulder-width apart and your toes pointing forward.",
      "Hold the barbell with an overhand grip, hands slightly wider than shoulder-width apart.",
      "Bend at your hips and lower the barbell towards the ground, keeping your back straight and your knees slightly bent.",
      "Lower the barbell until you feel a stretch in your hamstrings.",
      "Engage your hamstrings and glutes to lift the barbell back up to the starting position.",
      "Repeat for the desired number of repetitions."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 20
  },
  {
    "id": "0123",
    "name": "Barbell Wide-grip Upright Row",
    "bodyPart": "shoulders",
    "target": "Delts",
    "secondaryMuscles": [
      "Traps",
      "Biceps"
    ],
    "equipment": "Barbell",
    "category": "strength",
    "instructions": [
      "Stand with your feet shoulder-width apart and hold a barbell with an overhand grip, hands wider than shoulder-width apart.",
      "Let the barbell hang in front of your thighs, arms fully extended.",
      "Keeping your back straight, exhale and lift the barbell straight up towards your chin, leading with your elbows.",
      "Pause for a moment at the top, then inhale and slowly lower the barbell back down to the starting position.",
      "Repeat for the desired number of repetitions."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 20
  },
  {
    "id": "0126",
    "name": "Barbell Wrist Curl",
    "bodyPart": "arms",
    "target": "Forearms",
    "secondaryMuscles": [
      "Biceps",
      "Brachialis"
    ],
    "equipment": "Barbell",
    "category": "strength",
    "instructions": [
      "Sit on a bench with your feet flat on the ground and your forearms resting on your thighs, holding a barbell with an underhand grip.",
      "Allow the barbell to roll down to your fingertips, keeping your wrists straight.",
      "Slowly curl the barbell up towards your forearms by flexing your wrists.",
      "Pause for a moment at the top, then slowly lower the barbell back down to the starting position.",
      "Repeat for the desired number of repetitions."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 20
  },
  {
    "id": "0148",
    "name": "Cable Alternate Shoulder Press",
    "bodyPart": "shoulders",
    "target": "Delts",
    "secondaryMuscles": [
      "Triceps",
      "Upper Back"
    ],
    "equipment": "Cable",
    "category": "strength",
    "instructions": [
      "Stand with your feet shoulder-width apart and grasp the handles of the cable machine with an overhand grip.",
      "Position your hands at shoulder height, with your palms facing forward.",
      "Keep your core engaged and your back straight.",
      "Press one handle up and forward until your arm is fully extended.",
      "Pause for a moment at the top, then slowly lower the handle back to the starting position.",
      "Repeat with the other arm.",
      "Alternate between arms for the desired number of repetitions."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 20
  },
  {
    "id": "0149",
    "name": "Cable Alternate Triceps Extension",
    "bodyPart": "arms",
    "target": "Triceps",
    "secondaryMuscles": [
      "Shoulders"
    ],
    "equipment": "Cable",
    "category": "strength",
    "instructions": [
      "Stand facing the cable machine with your feet shoulder-width apart.",
      "Hold the cable handle with your right hand and bring your arm up so that your upper arm is parallel to the ground and your elbow is bent at a 90-degree angle.",
      "Keep your upper arm stationary and extend your forearm backward, fully straightening your arm.",
      "Pause for a moment, then slowly return to the starting position.",
      "Repeat with your left arm.",
      "Continue alternating arms for the desired number of repetitions."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 20
  },
  {
    "id": "0152",
    "name": "Cable Concentration Extension (on Knee)",
    "bodyPart": "arms",
    "target": "Triceps",
    "secondaryMuscles": [
      "Forearms"
    ],
    "equipment": "Cable",
    "category": "strength",
    "instructions": [
      "Sit on a bench or chair with your knees bent and feet flat on the ground.",
      "Hold the cable handle with your right hand and place your elbow on the inside of your right knee.",
      "Extend your arm fully, keeping your elbow stationary and close to your knee.",
      "Pause for a moment at the top, then slowly lower your arm back to the starting position.",
      "Repeat for the desired number of repetitions, then switch sides."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 20
  },
  {
    "id": "0171",
    "name": "Cable Incline Fly",
    "bodyPart": "chest",
    "target": "Pectorals",
    "secondaryMuscles": [
      "Deltoids",
      "Triceps"
    ],
    "equipment": "Cable",
    "category": "strength",
    "instructions": [
      "Adjust the cable machine to a low position and attach the handles.",
      "Sit on an incline bench with your back against the pad and feet flat on the floor.",
      "Grasp the handles with an overhand grip and extend your arms straight out in front of you.",
      "Keeping a slight bend in your elbows, open your arms out to the sides in a controlled motion.",
      "Pause for a moment at the fully extended position, then slowly return to the starting position.",
      "Repeat for the desired number of repetitions."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 20
  },
  {
    "id": "0178",
    "name": "Cable Lateral Raise",
    "bodyPart": "shoulders",
    "target": "Delts",
    "secondaryMuscles": [
      "Traps",
      "Triceps"
    ],
    "equipment": "Cable",
    "category": "strength",
    "instructions": [
      "Stand with your feet shoulder-width apart and grasp the cable handles with an overhand grip.",
      "Keep your arms straight and your core engaged.",
      "Raise your arms out to the sides until they are parallel to the floor.",
      "Pause for a moment at the top, then slowly lower your arms back down to the starting position.",
      "Repeat for the desired number of repetitions."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 20
  },
  {
    "id": "0202",
    "name": "Cable Rear Delt Row (stirrups)",
    "bodyPart": "shoulders",
    "target": "Delts",
    "secondaryMuscles": [
      "Trapezius",
      "Rhomboids",
      "Biceps"
    ],
    "equipment": "Cable",
    "category": "strength",
    "instructions": [
      "Attach a stirrup handle to a low cable pulley and stand facing the machine.",
      "Grasp the handle with your left hand and take a step back with your right foot, positioning your body at a slight angle.",
      "Bend your knees slightly and hinge forward at the hips, keeping your back straight and your core engaged.",
      "With your left arm extended and your palm facing down, pull the handle towards your chest by retracting your shoulder blade.",
      "Pause for a moment at the top of the movement, squeezing your shoulder blade.",
      "Slowly release the handle back to the starting position and repeat for the desired number of repetitions.",
      "Switch sides and repeat the exercise with your right arm."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 20
  },
  {
    "id": "0211",
    "name": "Cable Russian Twists (on Stability Ball)",
    "bodyPart": "core",
    "target": "Abs",
    "secondaryMuscles": [
      "Obliques",
      "Lower Back"
    ],
    "equipment": "Cable",
    "category": "strength",
    "instructions": [
      "Sit on a stability ball with your feet flat on the ground and your knees bent at a 90-degree angle.",
      "Hold the cable handle with both hands and extend your arms straight out in front of you.",
      "Lean back slightly while keeping your back straight and your core engaged.",
      "Twist your torso to the right, bringing the cable handle towards your right hip.",
      "Pause for a moment, then twist your torso to the left, bringing the cable handle towards your left hip.",
      "Continue alternating twists for the desired number of repetitions."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 20
  },
  {
    "id": "0213",
    "name": "Cable Seated High Row (v-bar)",
    "bodyPart": "back",
    "target": "Lats",
    "secondaryMuscles": [
      "Biceps",
      "Rhomboids",
      "Rear Deltoids"
    ],
    "equipment": "Cable",
    "category": "strength",
    "instructions": [
      "Sit on the cable machine with your feet flat on the floor and your knees slightly bent.",
      "Grasp the v-bar attachment with an overhand grip, palms facing each other, and your hands shoulder-width apart.",
      "Keep your back straight and lean slightly forward from the hips.",
      "Pull the v-bar towards your torso by retracting your shoulder blades and squeezing your back muscles.",
      "Pause for a moment at the peak of the contraction, then slowly release the tension and return to the starting position.",
      "Repeat for the desired number of repetitions."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 20
  },
  {
    "id": "0219",
    "name": "Cable Shoulder Press",
    "bodyPart": "shoulders",
    "target": "Delts",
    "secondaryMuscles": [
      "Triceps",
      "Upper Back"
    ],
    "equipment": "Cable",
    "category": "strength",
    "instructions": [
      "Adjust the cable machine so that the handles are at shoulder height.",
      "Stand facing away from the machine with your feet shoulder-width apart.",
      "Grasp the handles with an overhand grip and bring them up to shoulder level, with your elbows bent and pointing outwards.",
      "Press the handles upwards until your arms are fully extended overhead.",
      "Pause for a moment at the top, then slowly lower the handles back down to shoulder level.",
      "Repeat for the desired number of repetitions."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 20
  },
  {
    "id": "0239",
    "name": "Cable Straight Back Seated Row",
    "bodyPart": "back",
    "target": "Upper Back",
    "secondaryMuscles": [
      "Biceps",
      "Forearms",
      "Shoulders"
    ],
    "equipment": "Cable",
    "category": "strength",
    "instructions": [
      "Sit on the cable row machine with your feet flat on the footrests and your knees slightly bent.",
      "Grasp the cable handles with an overhand grip, palms facing down.",
      "Keep your back straight and lean slightly forward from the hips.",
      "Pull the cable handles towards your body, squeezing your shoulder blades together.",
      "Pause for a moment at the peak of the movement, then slowly release the handles back to the starting position.",
      "Repeat for the desired number of repetitions."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 20
  },
  {
    "id": "0241",
    "name": "Cable Triceps Pushdown (v-bar)",
    "bodyPart": "arms",
    "target": "Triceps",
    "secondaryMuscles": [
      "Forearms"
    ],
    "equipment": "Cable",
    "category": "strength",
    "instructions": [
      "Attach a v-bar attachment to the cable machine at the highest setting.",
      "Stand facing the cable machine with your feet shoulder-width apart.",
      "Grasp the v-bar with an overhand grip, palms facing down, and your hands shoulder-width apart.",
      "Keep your elbows close to your sides and your upper arms stationary throughout the exercise.",
      "Engage your triceps and exhale as you push the v-bar down until your arms are fully extended.",
      "Pause for a moment at the bottom of the movement, squeezing your triceps.",
      "Inhale as you slowly return the v-bar to the starting position, maintaining control.",
      "Repeat for the desired number of repetitions."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 20
  },
  {
    "id": "0251",
    "name": "Chest Dip",
    "bodyPart": "chest",
    "target": "Pectorals",
    "secondaryMuscles": [
      "Triceps",
      "Shoulders"
    ],
    "equipment": "Body Weight",
    "category": "calisthenics",
    "instructions": [
      "Position yourself on parallel bars with your arms fully extended and your body straight.",
      "Lower your body by bending your elbows until your shoulders are below your elbows.",
      "Push yourself back up to the starting position by straightening your arms.",
      "Repeat for the desired number of repetitions."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 0
  },
  {
    "id": "0276",
    "name": "Dead Bug",
    "bodyPart": "core",
    "target": "Abs",
    "secondaryMuscles": [
      "Hip Flexors",
      "Lower Back"
    ],
    "equipment": "Body Weight",
    "category": "calisthenics",
    "instructions": [
      "Lie flat on your back with your arms extended towards the ceiling.",
      "Bend your knees and lift your legs off the ground, creating a 90-degree angle at your hips and knees.",
      "Engage your core and lower back to press your lower back into the ground.",
      "Slowly lower your right arm and left leg towards the ground, keeping them straight and hovering just above the floor.",
      "Pause for a moment, then return to the starting position.",
      "Repeat the movement with your left arm and right leg.",
      "Continue alternating sides for the desired number of repetitions."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 0
  },
  {
    "id": "0293",
    "name": "Dumbbell Bent Over Row",
    "bodyPart": "back",
    "target": "Upper Back",
    "secondaryMuscles": [
      "Biceps",
      "Forearms"
    ],
    "equipment": "Dumbbell",
    "category": "strength",
    "instructions": [
      "Stand with your feet shoulder-width apart, knees slightly bent, and hold a dumbbell in each hand with your palms facing your body.",
      "Bend forward at the hips, keeping your back straight and your core engaged.",
      "Let your arms hang straight down towards the floor, with your elbows slightly bent.",
      "Pull the dumbbells up towards your chest, squeezing your shoulder blades together.",
      "Pause for a moment at the top, then slowly lower the dumbbells back down to the starting position.",
      "Repeat for the desired number of repetitions."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 20
  },
  {
    "id": "0313",
    "name": "Dumbbell Hammer Curl",
    "bodyPart": "arms",
    "target": "Biceps",
    "secondaryMuscles": [
      "Forearms"
    ],
    "equipment": "Dumbbell",
    "category": "strength",
    "instructions": [
      "Stand up straight with a dumbbell in each hand, palms facing your torso.",
      "Keep your elbows close to your torso and rotate the palms of your hands until they are facing forward.",
      "This will be your starting position.",
      "Now, keeping the upper arms stationary, exhale and curl the weights while contracting your biceps.",
      "Continue to raise the weights until your biceps are fully contracted and the dumbbells are at shoulder level.",
      "Hold the contracted position for a brief pause as you squeeze your biceps.",
      "Then, inhale and slowly begin to lower the dumbbells back to the starting position.",
      "Repeat for the recommended amount of repetitions."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 20
  },
  {
    "id": "0334",
    "name": "Dumbbell Lateral Raise",
    "bodyPart": "shoulders",
    "target": "Delts",
    "secondaryMuscles": [
      "Traps"
    ],
    "equipment": "Dumbbell",
    "category": "strength",
    "instructions": [
      "Stand with your feet shoulder-width apart and hold a dumbbell in each hand, palms facing your body.",
      "Keep your back straight and engage your core.",
      "Raise your arms out to the sides until they are parallel to the floor, keeping a slight bend in your elbows.",
      "Pause for a moment at the top, then slowly lower your arms back down to the starting position.",
      "Repeat for the desired number of repetitions."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 20
  },
  {
    "id": "0394",
    "name": "Dumbbell Seated Kickback",
    "bodyPart": "arms",
    "target": "Triceps",
    "secondaryMuscles": [
      "Shoulders"
    ],
    "equipment": "Dumbbell",
    "category": "strength",
    "instructions": [
      "Sit on a bench with your feet flat on the ground and hold a dumbbell in each hand.",
      "Bend your knees slightly and lean forward from your hips, keeping your back straight.",
      "Bring your upper arms close to your sides and keep your elbows bent at a 90-degree angle.",
      "Extend your arms straight back, squeezing your triceps at the top of the movement.",
      "Pause for a moment, then slowly lower the dumbbells back to the starting position.",
      "Repeat for the desired number of repetitions."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 20
  },
  {
    "id": "0411",
    "name": "Dumbbell Single Leg Squat",
    "bodyPart": "legs",
    "target": "Glutes",
    "secondaryMuscles": [
      "Quadriceps",
      "Hamstrings",
      "Calves"
    ],
    "equipment": "Dumbbell",
    "category": "strength",
    "instructions": [
      "Stand with your feet shoulder-width apart, holding a dumbbell in each hand.",
      "Extend one leg forward and keep it off the ground throughout the exercise.",
      "Bend your standing leg and lower your body down as if sitting back into a chair.",
      "Keep your chest up and your back straight.",
      "Pause for a moment at the bottom, then push through your heel to return to the starting position.",
      "Repeat for the desired number of repetitions, then switch legs."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 20
  },
  {
    "id": "0426",
    "name": "Dumbbell Standing Overhead Press",
    "bodyPart": "shoulders",
    "target": "Delts",
    "secondaryMuscles": [
      "Triceps",
      "Upper Back"
    ],
    "equipment": "Dumbbell",
    "category": "strength",
    "instructions": [
      "Stand with your feet shoulder-width apart, holding a dumbbell in each hand at shoulder level with your palms facing forward.",
      "Press the dumbbells upward until your arms are fully extended overhead.",
      "Pause for a moment at the top, then slowly lower the dumbbells back down to shoulder level.",
      "Repeat for the desired number of repetitions."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 20
  },
  {
    "id": "0437",
    "name": "Dumbbell Upright Row",
    "bodyPart": "shoulders",
    "target": "Delts",
    "secondaryMuscles": [
      "Traps",
      "Biceps"
    ],
    "equipment": "Dumbbell",
    "category": "strength",
    "instructions": [
      "Stand with your feet shoulder-width apart, holding a dumbbell in each hand with an overhand grip.",
      "Let the dumbbells hang in front of your thighs, with your arms fully extended.",
      "Keeping your back straight and your core engaged, exhale and lift the dumbbells straight up towards your chin, leading with your elbows.",
      "Pause for a moment at the top, then inhale and slowly lower the dumbbells back down to the starting position.",
      "Repeat for the desired number of repetitions."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 20
  },
  {
    "id": "0445",
    "name": "Ez Barbell Anti Gravity Press",
    "bodyPart": "shoulders",
    "target": "Delts",
    "secondaryMuscles": [
      "Triceps",
      "Chest"
    ],
    "equipment": "Ez Barbell",
    "category": "strength",
    "instructions": [
      "Start by standing with your feet shoulder-width apart and holding the ez barbell with an overhand grip.",
      "Raise the barbell to shoulder height, keeping your elbows slightly bent and your palms facing forward.",
      "Press the barbell overhead, extending your arms fully.",
      "Lower the barbell back to shoulder height and repeat for the desired number of repetitions."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 20
  },
  {
    "id": "0474",
    "name": "Hanging Straight Leg Hip Raise",
    "bodyPart": "core",
    "target": "Abs",
    "secondaryMuscles": [
      "Hip Flexors"
    ],
    "equipment": "Body Weight",
    "category": "calisthenics",
    "instructions": [
      "Hang from a pull-up bar with your arms fully extended and your palms facing away from you.",
      "Engage your core and lift your legs up in front of you until they are parallel to the ground.",
      "Pause for a moment at the top, then slowly lower your legs back down to the starting position.",
      "Repeat for the desired number of repetitions."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 0
  },
  {
    "id": "0499",
    "name": "Inverted Row",
    "bodyPart": "back",
    "target": "Upper Back",
    "secondaryMuscles": [
      "Biceps",
      "Forearms"
    ],
    "equipment": "Body Weight",
    "category": "calisthenics",
    "instructions": [
      "Set up a bar at waist height or use a suspension trainer.",
      "Stand facing the bar or suspension trainer, with your feet shoulder-width apart.",
      "Grab the bar or handles with an overhand grip, slightly wider than shoulder-width apart.",
      "Lean back, keeping your body straight and your heels on the ground.",
      "Pull your chest towards the bar or handles, squeezing your shoulder blades together.",
      "Pause for a moment at the top, then slowly lower yourself back to the starting position.",
      "Repeat for the desired number of repetitions."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 0
  },
  {
    "id": "0562",
    "name": "Landmine 180",
    "bodyPart": "core",
    "target": "Abs",
    "secondaryMuscles": [
      "Obliques",
      "Quadriceps"
    ],
    "equipment": "Barbell",
    "category": "strength",
    "instructions": [
      "Stand with your feet shoulder-width apart and hold the barbell with both hands in front of your chest.",
      "Bend your knees slightly and rotate your torso to the right, swinging the barbell down towards your right hip.",
      "As you reach the bottom of the movement, quickly reverse the motion and rotate your torso to the left, swinging the barbell up and across your body towards your left shoulder.",
      "Continue this twisting motion, alternating sides, for the desired number of repetitions."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 20
  },
  {
    "id": "0573",
    "name": "Lever Back Extension",
    "bodyPart": "back",
    "target": "Spine",
    "secondaryMuscles": [
      "Glutes",
      "Hamstrings"
    ],
    "equipment": "Leverage Machine",
    "category": "strength",
    "instructions": [
      "Adjust the machine to fit your body size and range of motion.",
      "Sit on the machine with your back against the pad and your feet secured.",
      "Place your hands on the handles or grip bars.",
      "Engage your core and slowly lean forward, allowing your back to round slightly.",
      "Pause for a moment at the bottom position, feeling a stretch in your lower back.",
      "Using your back muscles, slowly raise your torso back to the starting position.",
      "Repeat for the desired number of repetitions."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 20
  },
  {
    "id": "0582",
    "name": "Lever Kneeling Leg Curl",
    "bodyPart": "legs",
    "target": "Hamstrings",
    "secondaryMuscles": [
      "Glutes"
    ],
    "equipment": "Leverage Machine",
    "category": "strength",
    "instructions": [
      "Adjust the machine to fit your body and select the desired weight.",
      "Kneel on the machine facing downwards, with your knees resting on the pad and your feet secured under the footpads.",
      "Grasp the handles or the sides of the machine for stability.",
      "Keeping your upper body stationary, exhale and curl your legs up towards your glutes by flexing your knees.",
      "Pause for a moment at the top of the movement, squeezing your hamstrings.",
      "Inhale and slowly lower your legs back to the starting position, fully extending your knees.",
      "Repeat for the desired number of repetitions."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 20
  },
  {
    "id": "0585",
    "name": "Lever Leg Extension",
    "bodyPart": "legs",
    "target": "Quads",
    "secondaryMuscles": [
      "Hamstrings"
    ],
    "equipment": "Leverage Machine",
    "category": "strength",
    "instructions": [
      "Adjust the seat height and backrest of the machine to fit your body.",
      "Sit on the machine with your back against the backrest and your feet on the footpad.",
      "Grasp the handles or sidebars for stability.",
      "Extend your legs forward by straightening your knees, lifting the weight.",
      "Pause for a moment at the top, then slowly lower the weight back to the starting position.",
      "Repeat for the desired number of repetitions."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 20
  },
  {
    "id": "0586",
    "name": "Lever Lying Leg Curl",
    "bodyPart": "legs",
    "target": "Hamstrings",
    "secondaryMuscles": [
      "Calves"
    ],
    "equipment": "Leverage Machine",
    "category": "strength",
    "instructions": [
      "Adjust the machine to fit your body and select the desired weight.",
      "Lie face down on the machine with your legs straight and your heels against the padded lever.",
      "Grasp the handles or the sides of the machine for stability.",
      "Keeping your upper body stationary, exhale and curl your legs up as far as possible without lifting your hips off the pad.",
      "Hold the contracted position for a brief pause as you squeeze your hamstrings.",
      "Inhale and slowly lower the lever back to the starting position.",
      "Repeat for the desired number of repetitions."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 20
  },
  {
    "id": "0594",
    "name": "Lever Seated Calf Raise",
    "bodyPart": "legs",
    "target": "Calves",
    "secondaryMuscles": [
      "Soleus",
      "Ankle Stabilizers"
    ],
    "equipment": "Leverage Machine",
    "category": "strength",
    "instructions": [
      "Adjust the seat height so that your knees are slightly bent and your feet are flat on the footplate.",
      "Place your toes on the footplate with your heels hanging off the edge.",
      "Grasp the handles or the sides of the seat for stability.",
      "Push through the balls of your feet to raise your heels as high as possible.",
      "Pause for a moment at the top, then slowly lower your heels back down to the starting position.",
      "Repeat for the desired number of repetitions."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 20
  },
  {
    "id": "0604",
    "name": "Lever Shrug",
    "bodyPart": "back",
    "target": "Traps",
    "secondaryMuscles": [
      "Shoulders"
    ],
    "equipment": "Leverage Machine",
    "category": "strength",
    "instructions": [
      "Adjust the seat height and position yourself on the leverage machine with your back against the pad.",
      "Grasp the handles with an overhand grip and keep your arms straight.",
      "Keeping your back straight, lift your shoulders up towards your ears as high as possible.",
      "Hold the contraction for a moment, then slowly lower your shoulders back down to the starting position.",
      "Repeat for the desired number of repetitions."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 20
  },
  {
    "id": "0605",
    "name": "Lever Standing Calf Raise",
    "bodyPart": "legs",
    "target": "Calves",
    "secondaryMuscles": [
      "Soleus",
      "Ankle Stabilizers"
    ],
    "equipment": "Leverage Machine",
    "category": "strength",
    "instructions": [
      "Adjust the machine to your height and stand with your feet shoulder-width apart.",
      "Place your shoulders under the pads and hold onto the handles for stability.",
      "Raise your heels as high as possible by extending your ankles.",
      "Pause for a moment at the top, then slowly lower your heels back down to the starting position.",
      "Repeat for the desired number of repetitions."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 20
  },
  {
    "id": "0641",
    "name": "Otis Up",
    "bodyPart": "core",
    "target": "Abs",
    "secondaryMuscles": [
      "Hip Flexors",
      "Lower Back"
    ],
    "equipment": "Weighted",
    "category": "strength",
    "instructions": [
      "Lie flat on your back with your knees bent and feet flat on the ground.",
      "Place your hands behind your head with your elbows pointing outwards.",
      "Engaging your abs, slowly lift your upper body off the ground, curling forward until your torso is at a 45-degree angle.",
      "Pause for a moment at the top, then slowly lower your upper body back down to the starting position.",
      "Repeat for the desired number of repetitions."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 20
  },
  {
    "id": "0650",
    "name": "Pull-in (on Stability Ball)",
    "bodyPart": "core",
    "target": "Abs",
    "secondaryMuscles": [
      "Hip Flexors"
    ],
    "equipment": "Stability Ball",
    "category": "strength",
    "instructions": [
      "Start by sitting on the stability ball with your feet flat on the ground and your knees bent at a 90-degree angle.",
      "Place your hands on the sides of the stability ball for support.",
      "Engage your abs and slowly roll your hips forward, bringing your knees towards your chest.",
      "Pause for a moment at the top of the movement, then slowly extend your legs back to the starting position.",
      "Repeat for the desired number of repetitions."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 20
  },
  {
    "id": "0673",
    "name": "Reverse Grip Machine Lat Pulldown",
    "bodyPart": "back",
    "target": "Lats",
    "secondaryMuscles": [
      "Biceps",
      "Forearms"
    ],
    "equipment": "Leverage Machine",
    "category": "strength",
    "instructions": [
      "Adjust the seat height and position yourself on the machine with your knees under the pads and your feet flat on the ground.",
      "Grasp the handles with an underhand grip, slightly wider than shoulder-width apart.",
      "Sit upright with your chest out and shoulders back, maintaining a slight arch in your lower back.",
      "Pull the handles down towards your chest, squeezing your shoulder blades together.",
      "Pause for a moment at the bottom of the movement, then slowly release the handles back to the starting position.",
      "Repeat for the desired number of repetitions."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 20
  },
  {
    "id": "0739",
    "name": "Sled 45° Leg Press",
    "bodyPart": "legs",
    "target": "Glutes",
    "secondaryMuscles": [
      "Quadriceps",
      "Hamstrings",
      "Calves"
    ],
    "equipment": "Sled Machine",
    "category": "strength",
    "instructions": [
      "Adjust the seat and footplate of the sled machine to a comfortable position.",
      "Sit on the sled machine with your back against the backrest and your feet shoulder-width apart on the footplate.",
      "Grip the handles on the sides of the seat for stability.",
      "Push the footplate away from your body by extending your legs, keeping your heels on the footplate.",
      "Continue pushing until your legs are almost fully extended, but without locking your knees.",
      "Pause for a moment at the top of the movement, then slowly lower the footplate back towards your body by bending your knees.",
      "Repeat for the desired number of repetitions."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 20
  },
  {
    "id": "0747",
    "name": "Smith Behind Neck Press",
    "bodyPart": "shoulders",
    "target": "Delts",
    "secondaryMuscles": [
      "Triceps",
      "Upper Back"
    ],
    "equipment": "Smith Machine",
    "category": "strength",
    "instructions": [
      "Adjust the seat height of the smith machine so that the bar is at shoulder level.",
      "Stand with your feet shoulder-width apart and your knees slightly bent.",
      "Grasp the bar with an overhand grip, slightly wider than shoulder-width apart.",
      "Lift the bar off the rack and step back, maintaining a stable stance.",
      "Lower the bar down to the back of your neck, keeping your elbows pointing forward.",
      "Press the bar up overhead until your arms are fully extended.",
      "Pause for a moment at the top, then slowly lower the bar back down to the starting position.",
      "Repeat for the desired number of repetitions."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 20
  },
  {
    "id": "0765",
    "name": "Smith Seated Shoulder Press",
    "bodyPart": "shoulders",
    "target": "Delts",
    "secondaryMuscles": [
      "Triceps",
      "Upper Back"
    ],
    "equipment": "Smith Machine",
    "category": "strength",
    "instructions": [
      "Adjust the seat height so that the handles are at shoulder level.",
      "Sit on the machine with your back against the pad and your feet flat on the floor.",
      "Grasp the handles with an overhand grip and lift them off the supports, extending your arms fully.",
      "Lower the handles down to shoulder level, keeping your elbows slightly bent.",
      "Press the handles up overhead until your arms are fully extended.",
      "Pause for a moment at the top, then slowly lower the handles back down to shoulder level.",
      "Repeat for the desired number of repetitions."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 20
  },
  {
    "id": "0814",
    "name": "Triceps Dip",
    "bodyPart": "arms",
    "target": "Triceps",
    "secondaryMuscles": [
      "Chest",
      "Shoulders"
    ],
    "equipment": "Body Weight",
    "category": "calisthenics",
    "instructions": [
      "Sit on the edge of a bench or chair with your hands gripping the edge, fingers pointing forward.",
      "Slide your butt off the bench, supporting your weight with your hands.",
      "Bend your elbows and lower your body towards the ground, keeping your back close to the bench.",
      "Pause for a moment at the bottom, then push yourself back up to the starting position.",
      "Repeat for the desired number of repetitions."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 0
  },
  {
    "id": "0851",
    "name": "Weighted Sissy Squat",
    "bodyPart": "legs",
    "target": "Quads",
    "secondaryMuscles": [
      "Glutes",
      "Hamstrings",
      "Calves"
    ],
    "equipment": "Weighted",
    "category": "strength",
    "instructions": [
      "Stand with your feet shoulder-width apart and your toes pointing slightly outward.",
      "Hold a weight in front of your chest with both hands, or place a barbell across your upper back.",
      "Keeping your chest up and your core engaged, slowly lower your body down by bending at the knees and hips.",
      "Continue lowering until your thighs are parallel to the ground or as low as you can comfortably go.",
      "Pause for a moment at the bottom, then push through your heels to return to the starting position.",
      "Repeat for the desired number of repetitions."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 20
  },
  {
    "id": "0861",
    "name": "Cable Seated Row",
    "bodyPart": "back",
    "target": "Upper Back",
    "secondaryMuscles": [
      "Biceps",
      "Forearms"
    ],
    "equipment": "Cable",
    "category": "strength",
    "instructions": [
      "Sit on the cable row machine with your feet flat on the footrests and your knees slightly bent.",
      "Grasp the handles with an overhand grip, keeping your back straight and your shoulders relaxed.",
      "Pull the handles towards your body, squeezing your shoulder blades together.",
      "Pause for a moment at the peak of the movement, then slowly release the handles back to the starting position.",
      "Repeat for the desired number of repetitions."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 20
  },
  {
    "id": "0866",
    "name": "Weighted Hanging Leg-hip Raise",
    "bodyPart": "core",
    "target": "Abs",
    "secondaryMuscles": [
      "Hip Flexors",
      "Lower Back"
    ],
    "equipment": "Weighted",
    "category": "calisthenics",
    "instructions": [
      "Hang from a pull-up bar with your arms fully extended and your palms facing away from you.",
      "Engage your core and lift your legs up in front of you, keeping them straight.",
      "Continue lifting until your legs are parallel to the ground or slightly higher.",
      "Pause for a moment at the top, then slowly lower your legs back down to the starting position.",
      "Repeat for the desired number of repetitions."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 20
  },
  {
    "id": "0915",
    "name": "Band Push Up",
    "bodyPart": "chest",
    "target": "Pectorals",
    "secondaryMuscles": [
      "Triceps",
      "Shoulders",
      "Core"
    ],
    "equipment": "Band",
    "category": "strength",
    "instructions": [
      "Loop the band across your upper back, holding the ends under your palms.",
      "Set up in a high plank.",
      "Lower your chest toward the floor.",
      "Press back up against the band.",
      "Keep your body in a straight line."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 20
  },
  {
    "id": "0997",
    "name": "Band Shoulder Press",
    "bodyPart": "shoulders",
    "target": "Delts",
    "secondaryMuscles": [
      "Triceps",
      "Upper Back"
    ],
    "equipment": "Band",
    "category": "strength",
    "instructions": [
      "Stand with your feet shoulder-width apart and place the band under your feet.",
      "Hold the band with your palms facing forward and raise your hands to shoulder height, elbows bent.",
      "Press the band overhead, fully extending your arms.",
      "Pause for a moment at the top, then slowly lower the band back to shoulder height.",
      "Repeat for the desired number of repetitions."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 20
  },
  {
    "id": "1005",
    "name": "Band Standing Crunch",
    "bodyPart": "core",
    "target": "Abs",
    "secondaryMuscles": [
      "Obliques"
    ],
    "equipment": "Band",
    "category": "strength",
    "instructions": [
      "Attach the band to a sturdy anchor point at waist height.",
      "Stand facing away from the anchor point with your feet shoulder-width apart.",
      "Hold the band with both hands and bring it up to your chest, keeping your elbows bent and close to your body.",
      "Engage your abs and slowly crunch forward, bringing your chest towards your knees.",
      "Pause for a moment at the top of the crunch, then slowly return to the starting position.",
      "Repeat for the desired number of repetitions."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 20
  },
  {
    "id": "1041",
    "name": "Lever Lying Chest Press (plate Loaded)",
    "bodyPart": "chest",
    "target": "Pectorals",
    "secondaryMuscles": [
      "Triceps",
      "Shoulders",
      "Upper Chest"
    ],
    "equipment": "Leverage Machine",
    "category": "strength",
    "instructions": [
      "Lie back on the machine bench and grip the handles at chest level.",
      "Plant your feet and keep your shoulders pulled back.",
      "Press the handles up until your arms are almost straight.",
      "Lower slowly until you feel a stretch in the chest.",
      "Keep your back on the pad throughout."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 20
  },
  {
    "id": "1051",
    "name": "Cat Stretch",
    "bodyPart": "back",
    "target": "Spine",
    "secondaryMuscles": [
      "Upper Back",
      "Core",
      "Lower Abs"
    ],
    "equipment": "Body Weight",
    "category": "stretching",
    "instructions": [
      "Start on hands and knees with hands under shoulders.",
      "Tuck your chin and round your back toward the ceiling.",
      "Draw your belly button in and hold for a few breaths.",
      "Return to a neutral spine.",
      "Repeat slowly, holding the rounded position 15-20 seconds."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 0
  },
  {
    "id": "1064",
    "name": "Sumo Squat",
    "bodyPart": "legs",
    "target": "Glutes",
    "secondaryMuscles": [
      "Adductors",
      "Quadriceps",
      "Hamstrings",
      "Core"
    ],
    "equipment": "Body Weight",
    "category": "calisthenics",
    "instructions": [
      "Stand with feet wide and toes turned out.",
      "Hold your hands together at your chest.",
      "Sit your hips down and back between your legs.",
      "Keep your knees over your toes and chest upright.",
      "Lower to thigh level.",
      "Push through your heels to stand and squeeze your glutes."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 0
  },
  {
    "id": "1163",
    "name": "Lying Leg Raise",
    "bodyPart": "core",
    "target": "Abs",
    "secondaryMuscles": [
      "Lower Abs",
      "Hip Flexors"
    ],
    "equipment": "Body Weight",
    "category": "calisthenics",
    "instructions": [
      "Lie on your back with legs straight and hands under your hips.",
      "Press your lower back gently into the floor.",
      "Lift your legs together until they point at the ceiling.",
      "Lower them slowly, stopping just above the floor.",
      "Keep your back from arching throughout."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 0
  },
  {
    "id": "1195",
    "name": "Lever Incline Hammer Chest Press",
    "bodyPart": "chest",
    "target": "Pectorals",
    "secondaryMuscles": [
      "Upper Chest",
      "Triceps",
      "Shoulders"
    ],
    "equipment": "Leverage Machine",
    "category": "strength",
    "instructions": [
      "Adjust the seat so the handles sit at upper chest height.",
      "Sit back with your shoulder blades pinned to the pad and grip the neutral handles.",
      "Press the handles up and forward until your arms are almost straight.",
      "Lower slowly until you feel a stretch across the chest.",
      "Keep your wrists straight and your back against the pad."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 20
  },
  {
    "id": "1204",
    "name": "Cable One Arm Lat Pulldown",
    "bodyPart": "back",
    "target": "Lats",
    "secondaryMuscles": [
      "Biceps",
      "Upper Back",
      "Rhomboids"
    ],
    "equipment": "Cable",
    "category": "strength",
    "instructions": [
      "Attach a handle to a high pulley and sit facing the stack.",
      "Grab the handle with one hand and sit tall.",
      "Pull the handle down to the side of your chest, driving your elbow toward your hip.",
      "Pause, then let your arm rise slowly.",
      "Complete your reps and switch sides."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 20
  },
  {
    "id": "1241",
    "name": "Bird Dog",
    "bodyPart": "core",
    "target": "Spine",
    "secondaryMuscles": [
      "Glutes",
      "Core",
      "Shoulders",
      "Hamstrings"
    ],
    "equipment": "Body Weight",
    "category": "calisthenics",
    "instructions": [
      "Start on all fours with hands under your shoulders and knees under your hips.",
      "Extend your right arm forward and left leg back.",
      "Keep your hips level and your back flat.",
      "Hold for a moment, then return.",
      "Repeat on the other side and alternate."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 0
  },
  {
    "id": "1254",
    "name": "Band Bench Press",
    "bodyPart": "chest",
    "target": "Pectorals",
    "secondaryMuscles": [
      "Triceps",
      "Shoulders"
    ],
    "equipment": "Band",
    "category": "strength",
    "instructions": [
      "Lie flat on a bench with your feet flat on the ground and your back pressed against the bench.",
      "Grasp the band handles with an overhand grip, slightly wider than shoulder-width apart.",
      "Extend your arms fully, pushing the bands away from your chest.",
      "Slowly lower the bands back down to your chest, keeping your elbows at a 90-degree angle.",
      "Repeat for the desired number of repetitions."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 20
  },
  {
    "id": "1323",
    "name": "Cable Rope Seated Row",
    "bodyPart": "back",
    "target": "Upper Back",
    "secondaryMuscles": [
      "Biceps",
      "Forearms"
    ],
    "equipment": "Cable",
    "category": "strength",
    "instructions": [
      "Sit on the rowing machine with your feet flat on the footrests and knees slightly bent.",
      "Grasp the cable ropes with an overhand grip, palms facing each other.",
      "Keep your back straight and lean slightly forward, maintaining a slight bend in your elbows.",
      "Pull the cable ropes towards your body, squeezing your shoulder blades together.",
      "Pause for a moment at the peak of the movement, then slowly release the tension and return to the starting position.",
      "Repeat for the desired number of repetitions."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 20
  },
  {
    "id": "1346",
    "name": "Kneeling Lat Stretch",
    "bodyPart": "back",
    "target": "Lats",
    "secondaryMuscles": [
      "Shoulders",
      "Triceps"
    ],
    "equipment": "Body Weight",
    "category": "stretching",
    "instructions": [
      "Kneel on the ground with your knees hip-width apart and your toes pointing back.",
      "Extend your arms overhead and interlace your fingers.",
      "Keeping your back straight, slowly lean to the right side, feeling a stretch in your left lat muscle.",
      "Hold the stretch for 20-30 seconds, then return to the starting position.",
      "Repeat the stretch on the left side, leaning to the left and feeling a stretch in your right lat muscle.",
      "Continue alternating sides for the desired number of repetitions."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 0
  },
  {
    "id": "1364",
    "name": "Standing Pelvic Tilt",
    "bodyPart": "back",
    "target": "Spine",
    "secondaryMuscles": [
      "Abdominals"
    ],
    "equipment": "Body Weight",
    "category": "mobility",
    "instructions": [
      "Stand with your feet shoulder-width apart and your knees slightly bent.",
      "Place your hands on your hips or let them hang by your sides.",
      "Engage your core muscles and tilt your pelvis forward, pushing your lower back towards the wall behind you.",
      "Hold the position for a few seconds, then release and return to the starting position.",
      "Repeat for the desired number of repetitions."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 0
  },
  {
    "id": "1379",
    "name": "Dumbbell Seated Calf Raise",
    "bodyPart": "legs",
    "target": "Calves",
    "secondaryMuscles": [
      "Hamstrings"
    ],
    "equipment": "Dumbbell",
    "category": "strength",
    "instructions": [
      "Sit on a bench or chair with your feet flat on the ground and a dumbbell resting on your thighs.",
      "Place the balls of your feet on a raised surface such as a step or block, with your heels hanging off the edge.",
      "Hold onto the dumbbell for stability.",
      "Raise your heels as high as possible, lifting your body weight onto the balls of your feet.",
      "Pause for a moment at the top, then slowly lower your heels back down to the starting position.",
      "Repeat for the desired number of repetitions."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 20
  },
  {
    "id": "1429",
    "name": "Wide Grip Pull-up",
    "bodyPart": "back",
    "target": "Lats",
    "secondaryMuscles": [
      "Biceps",
      "Forearms"
    ],
    "equipment": "Body Weight",
    "category": "calisthenics",
    "instructions": [
      "Hang from a pull-up bar with your palms facing away from you and your hands wider than shoulder-width apart.",
      "Engage your core and squeeze your shoulder blades together.",
      "Pull your body up towards the bar until your chin is above the bar.",
      "Lower your body back down to the starting position with control.",
      "Repeat for the desired number of repetitions."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 0
  },
  {
    "id": "1456",
    "name": "Barbell Standing Close Grip Military Press",
    "bodyPart": "shoulders",
    "target": "Delts",
    "secondaryMuscles": [
      "Triceps",
      "Upper Back"
    ],
    "equipment": "Barbell",
    "category": "strength",
    "instructions": [
      "Stand with your feet shoulder-width apart and hold the barbell with an overhand grip, hands slightly closer than shoulder-width apart.",
      "Lift the barbell to shoulder height, keeping your elbows close to your body.",
      "Press the barbell overhead, extending your arms fully.",
      "Lower the barbell back to shoulder height.",
      "Repeat for the desired number of repetitions."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 20
  },
  {
    "id": "1502",
    "name": "Band Pushdown",
    "bodyPart": "arms",
    "target": "Triceps",
    "secondaryMuscles": [
      "Forearms",
      "Shoulders"
    ],
    "equipment": "Band",
    "category": "strength",
    "instructions": [
      "Anchor the band high and hold the ends with your elbows at your sides.",
      "Stand tall with a slight forward lean.",
      "Push your hands down until your arms are straight.",
      "Pause and squeeze your triceps.",
      "Return slowly while keeping your elbows pinned to your sides."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 20
  },
  {
    "id": "1597",
    "name": "Smith Stiff Legged Deadlift",
    "bodyPart": "legs",
    "target": "Hamstrings",
    "secondaryMuscles": [
      "Glutes",
      "Lower Back",
      "Grip Muscles"
    ],
    "equipment": "Smith Machine",
    "category": "strength",
    "instructions": [
      "Stand close to the smith bar with feet hip-width apart and grip the bar overhand.",
      "Unrack it and keep your knees nearly straight.",
      "Push your hips back and slide the bar down your legs.",
      "Lower until you feel a deep stretch in your hamstrings.",
      "Squeeze your glutes to stand tall."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 20
  },
  {
    "id": "1611",
    "name": "Dumbbell Behind Back Finger Curl",
    "bodyPart": "arms",
    "target": "Forearms",
    "secondaryMuscles": [
      "Wrist Flexors",
      "Grip Muscles",
      "Hands"
    ],
    "equipment": "Dumbbell",
    "category": "strength",
    "instructions": [
      "Stand tall with a light dumbbell held in one hand behind your back.",
      "Let the dumbbell roll down until it rests on your fingertips.",
      "Close your fingers and curl the weight back into your palm.",
      "Keep your wrist still and your arm close to your body.",
      "Lower under control and repeat, then switch hands."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 20
  },
  {
    "id": "1630",
    "name": "Cable Close Grip Curl",
    "bodyPart": "arms",
    "target": "Biceps",
    "secondaryMuscles": [
      "Forearms"
    ],
    "equipment": "Cable",
    "category": "strength",
    "instructions": [
      "Attach a straight bar to a low pulley cable machine.",
      "Stand facing the machine with your feet shoulder-width apart and your knees slightly bent.",
      "Grasp the bar with an underhand grip, hands shoulder-width apart.",
      "Keep your elbows close to your sides and your upper arms stationary throughout the exercise.",
      "Exhale and curl the bar up towards your shoulders, contracting your biceps.",
      "Pause for a moment at the top of the movement, squeezing your biceps.",
      "Inhale and slowly lower the bar back to the starting position, fully extending your arms.",
      "Repeat for the desired number of repetitions."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 20
  },
  {
    "id": "1729",
    "name": "Dumbbell Lying Alternate Extension",
    "bodyPart": "arms",
    "target": "Triceps",
    "secondaryMuscles": [
      "Shoulders"
    ],
    "equipment": "Dumbbell",
    "category": "strength",
    "instructions": [
      "Lie flat on a bench with a dumbbell in each hand, palms facing each other.",
      "Extend your arms straight up over your chest, keeping a slight bend in your elbows.",
      "Lower one dumbbell down towards your head, bending at the elbow, while keeping the other arm extended.",
      "Pause for a moment at the bottom, then raise the dumbbell back up to the starting position.",
      "Repeat with the other arm, alternating sides for the desired number of repetitions."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 20
  },
  {
    "id": "1777",
    "name": "Above Head Chest Stretch",
    "bodyPart": "chest",
    "target": "Pectorals",
    "secondaryMuscles": [
      "Shoulders",
      "Upper Chest"
    ],
    "equipment": "Body Weight",
    "category": "stretching",
    "instructions": [
      "Stand tall and interlace your fingers, then raise your arms overhead.",
      "Press your arms slightly back and lift your chest without arching your lower back.",
      "Keep your shoulders relaxed and your breathing slow and steady.",
      "Hold for 20-30 seconds without bouncing.",
      "Release gently and repeat, switching sides if the stretch is one-sided."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 0
  },
  {
    "id": "1805",
    "name": "Sitting Bent Over Back Stretch",
    "bodyPart": "back",
    "target": "Spine",
    "secondaryMuscles": [
      "Lower Back",
      "Hamstrings",
      "Upper Back"
    ],
    "equipment": "Body Weight",
    "category": "stretching",
    "instructions": [
      "Sit on a bench or chair with your feet flat and your knees apart.",
      "Bend forward from your hips and let your head and arms hang between your knees.",
      "Keep your shoulders relaxed and your breathing slow and steady.",
      "Hold for 20-30 seconds without bouncing.",
      "Release gently and repeat, switching sides if the stretch is one-sided."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 0
  },
  {
    "id": "2141",
    "name": "Walk Elliptical Cross Trainer",
    "bodyPart": "cardio",
    "target": "Cardiovascular System",
    "secondaryMuscles": [
      "Quadriceps",
      "Hamstrings",
      "Glutes",
      "Calves"
    ],
    "equipment": "Elliptical Machine",
    "category": "cardio",
    "instructions": [
      "Adjust the resistance level and incline of the elliptical machine to your desired settings.",
      "Step onto the pedals of the machine and grip the handles lightly.",
      "Begin by pushing down with your feet and pulling the handles towards your body.",
      "Continue this motion, alternating between pushing and pulling, to simulate a walking or running motion.",
      "Maintain a steady pace and keep your core engaged throughout the exercise.",
      "Continue for the desired duration of your cardio workout.",
      "Gradually decrease the intensity and speed of the machine before stepping off."
    ],
    "defaultSets": 3,
    "defaultReps": 30,
    "defaultWeight": 20
  },
  {
    "id": "2330",
    "name": "Cable Lat Pulldown Full Range Of Motion",
    "bodyPart": "back",
    "target": "Lats",
    "secondaryMuscles": [
      "Biceps",
      "Rhomboids",
      "Rear Deltoids"
    ],
    "equipment": "Cable",
    "category": "strength",
    "instructions": [
      "Sit on the lat pulldown machine with your knees positioned under the pads.",
      "Grasp the cable bar with an overhand grip, slightly wider than shoulder-width apart.",
      "Lean back slightly and keep your chest up, maintaining a slight arch in your lower back.",
      "Pull the bar down towards your upper chest, squeezing your shoulder blades together.",
      "Pause for a moment at the bottom of the movement, then slowly release the bar back to the starting position.",
      "Repeat for the desired number of repetitions."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 20
  },
  {
    "id": "2401",
    "name": "Dumbbell Biceps Curl (with Arm Blaster)",
    "bodyPart": "arms",
    "target": "Biceps",
    "secondaryMuscles": [
      "Forearms"
    ],
    "equipment": "Dumbbell",
    "category": "strength",
    "instructions": [
      "Stand up straight with a dumbbell in each hand, palms facing forward.",
      "Keep your elbows close to your torso and your upper arms stationary.",
      "Exhale and curl the weights while contracting your biceps.",
      "Continue to raise the weights until your biceps are fully contracted and the dumbbells are at shoulder level.",
      "Hold the contracted position for a brief pause as you squeeze your biceps.",
      "Inhale and slowly begin to lower the dumbbells back to the starting position.",
      "Repeat for the desired number of repetitions."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 20
  },
  {
    "id": "3294",
    "name": "Archer Push Up",
    "bodyPart": "chest",
    "target": "Pectorals",
    "secondaryMuscles": [
      "Triceps",
      "Shoulders",
      "Core"
    ],
    "equipment": "Body Weight",
    "category": "calisthenics",
    "instructions": [
      "Start in a push-up position with your hands slightly wider than shoulder-width apart.",
      "Extend one arm straight out to the side, parallel to the ground.",
      "Lower your body by bending your elbows, keeping your back straight and core engaged.",
      "Push back up to the starting position.",
      "Repeat on the other side, extending the opposite arm out to the side.",
      "Continue alternating sides for the desired number of repetitions."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 0
  },
  {
    "id": "3422",
    "name": "Medicine Ball Crunch",
    "bodyPart": "core",
    "target": "Abs",
    "secondaryMuscles": [
      "Obliques",
      "Hip Flexors"
    ],
    "equipment": "Medicine Ball",
    "category": "strength",
    "instructions": [
      "Lie on your back with knees bent and hold a medicine ball on your chest.",
      "Curl your shoulders off the floor.",
      "Squeeze your abs at the top.",
      "Lower slowly.",
      "Keep your chin off your chest.",
      "Breathe out as you crunch up."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 20
  },
  {
    "id": "3503",
    "name": "Elbow To Knee Side Plank Crunch",
    "bodyPart": "core",
    "target": "Abs",
    "secondaryMuscles": [
      "Obliques",
      "Shoulders",
      "Core",
      "Hip Flexors"
    ],
    "equipment": "Body Weight",
    "category": "calisthenics",
    "instructions": [
      "Set up in a side plank on your forearm, top hand behind your head.",
      "Lift your hips so your body is in line.",
      "Bring your top elbow and knee together in a crunch.",
      "Extend back to the side plank.",
      "Keep your hips lifted throughout.",
      "Finish your reps, then switch sides."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 0
  },
  {
    "id": "3531",
    "name": "Alternate Punching",
    "bodyPart": "cardio",
    "target": "Cardiovascular System",
    "secondaryMuscles": [
      "Shoulders",
      "Triceps",
      "Core",
      "Obliques"
    ],
    "equipment": "Body Weight",
    "category": "cardio",
    "instructions": [
      "Stand with a staggered stance and fists up.",
      "Punch forward with one arm, rotating your torso slightly.",
      "Pull it back as you punch with the other.",
      "Keep your core tight.",
      "Keep a steady rhythm for 30-60 seconds.",
      "Rest briefly and repeat."
    ],
    "defaultSets": 3,
    "defaultReps": 30,
    "defaultWeight": 0
  },
  {
    "id": "3586",
    "name": "Scissors (advanced)",
    "bodyPart": "core",
    "target": "Abs",
    "secondaryMuscles": [
      "Lower Abs",
      "Hip Flexors",
      "Obliques"
    ],
    "equipment": "Body Weight",
    "category": "calisthenics",
    "instructions": [
      "Lie on your back with legs extended and hands under your hips.",
      "Lift your head, shoulders and legs slightly off the floor.",
      "Cross one leg over the other in a scissor motion.",
      "Alternate sides in a controlled rhythm.",
      "Keep your lower back pressed down."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 0
  },
  {
    "id": "3667",
    "name": "Side Lying Hip Adduction (male)",
    "bodyPart": "legs",
    "target": "Adductors",
    "secondaryMuscles": [
      "Glutes",
      "Hamstrings"
    ],
    "equipment": "Body Weight",
    "category": "calisthenics",
    "instructions": [
      "Lie on your side with your legs straight and stacked on top of each other.",
      "Place your bottom arm under your head for support.",
      "Engage your adductors and lift your top leg as high as possible without rotating your hips or leaning backward.",
      "Pause for a moment at the top, then slowly lower your leg back down to the starting position.",
      "Repeat for the desired number of repetitions, then switch sides."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 0
  },
  {
    "id": "3757",
    "name": "Band High Fly",
    "bodyPart": "chest",
    "target": "Pectorals",
    "secondaryMuscles": [
      "Shoulders",
      "Upper Chest"
    ],
    "equipment": "Band",
    "category": "strength",
    "instructions": [
      "Anchor a band high and hold one end in each hand, facing away.",
      "Step forward and lean slightly.",
      "Bring your hands together in front of your waist with a soft elbow.",
      "Squeeze your chest at the end.",
      "Return slowly."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 20
  },
  {
    "id": "3780",
    "name": "Band Standing Chest Press",
    "bodyPart": "chest",
    "target": "Pectorals",
    "secondaryMuscles": [
      "Triceps",
      "Shoulders",
      "Upper Chest"
    ],
    "equipment": "Band",
    "category": "strength",
    "instructions": [
      "Anchor the band behind you at chest height and hold the handles at your chest.",
      "Stand in a staggered stance with your core braced.",
      "Press both hands forward until your arms are straight.",
      "Pause briefly, then return slowly to your chest.",
      "Keep your shoulders down and your back still."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 20
  },
  {
    "id": "4075",
    "name": "Band Chest Fly",
    "bodyPart": "chest",
    "target": "Pectorals",
    "secondaryMuscles": [
      "Shoulders",
      "Biceps",
      "Upper Chest"
    ],
    "equipment": "Band",
    "category": "strength",
    "instructions": [
      "Anchor the band behind you at chest height and hold the ends.",
      "Stand in a staggered stance.",
      "Start with arms out to the sides and slightly bent.",
      "Bring your hands together in front of your chest.",
      "Return slowly under control."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 20
  },
  {
    "id": "4209",
    "name": "1 To 2 Jump Box",
    "bodyPart": "legs",
    "target": "Quads",
    "secondaryMuscles": [
      "Glutes",
      "Hamstrings",
      "Calves"
    ],
    "equipment": "Body Weight",
    "category": "plyometrics",
    "instructions": [
      "Stand facing a sturdy box on one leg.",
      "Drive your arms up and push off explosively from that leg.",
      "Land softly on the box with both feet at once.",
      "Stand fully upright before stepping down.",
      "Complete your reps, then switch legs.",
      "Keep your knees tracking over your toes."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 0
  },
  {
    "id": "4282",
    "name": "Feet And Ankles Stretch",
    "bodyPart": "legs",
    "target": "Calves",
    "secondaryMuscles": [
      "Ankles",
      "Feet",
      "Shins"
    ],
    "equipment": "Body Weight",
    "category": "stretching",
    "instructions": [
      "Sit on a chair or the floor with one leg extended.",
      "Point your toes away from you.",
      "Hold for 15 seconds.",
      "Pull your toes back toward your shin.",
      "Hold for another 15 seconds.",
      "Switch legs and repeat."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 0
  },
  {
    "id": "4544",
    "name": "Band Incline Bench Press",
    "bodyPart": "chest",
    "target": "Pectorals",
    "secondaryMuscles": [
      "Upper Chest",
      "Shoulders",
      "Triceps"
    ],
    "equipment": "Band",
    "category": "strength",
    "instructions": [
      "Set an incline bench and anchor a band behind it or under the bench.",
      "Sit back with the band handles at chest level.",
      "Brace your core and keep your shoulder blades pulled together.",
      "Press the handles up and slightly forward until your arms are straight.",
      "Lower slowly back to the start, feeling the band pull.",
      "Keep your wrists straight throughout."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 20
  },
  {
    "id": "5172",
    "name": "Arm Crossover",
    "bodyPart": "chest",
    "target": "Pectorals",
    "secondaryMuscles": [
      "Shoulders",
      "Upper Chest"
    ],
    "equipment": "Body Weight",
    "category": "mobility",
    "instructions": [
      "Stand tall with your arms out to the sides at shoulder height.",
      "Swing both arms forward and cross them in front of your chest.",
      "Open them back out and squeeze your shoulder blades slightly.",
      "Alternate which arm is on top.",
      "Keep a steady, relaxed rhythm."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 0
  },
  {
    "id": "5608",
    "name": "Band Standing Chest Press V. 2",
    "bodyPart": "chest",
    "target": "Pectorals",
    "secondaryMuscles": [
      "Triceps",
      "Shoulders",
      "Upper Chest"
    ],
    "equipment": "Band",
    "category": "strength",
    "instructions": [
      "Anchor a band behind you and hold the ends at chest height.",
      "Stand in a split stance for balance.",
      "Press your hands forward until arms are straight.",
      "Return slowly.",
      "Keep your core braced."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 20
  },
  {
    "id": "5965",
    "name": "1 2 Stick Drill",
    "bodyPart": "full-body",
    "target": "Cardiovascular System",
    "secondaryMuscles": [
      "Quadriceps",
      "Calves",
      "Core"
    ],
    "equipment": "Body Weight",
    "category": "plyometrics",
    "instructions": [
      "Stand in an athletic stance with knees slightly bent.",
      "Take quick steps in the set pattern, one then two.",
      "Stay on the balls of your feet.",
      "Keep your arms bent and swinging naturally.",
      "Repeat for 20-30 seconds with sharp, light steps."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 0
  },
  {
    "id": "6959",
    "name": "Band Assisted Push Up",
    "bodyPart": "chest",
    "target": "Pectorals",
    "secondaryMuscles": [
      "Triceps",
      "Shoulders",
      "Core"
    ],
    "equipment": "Band",
    "category": "calisthenics",
    "instructions": [
      "Anchor a band across a rack or set of bars at chest height.",
      "Rest your torso on the band in a plank position.",
      "Lower your chest toward the floor, elbows at 45 degrees.",
      "Press up using the bounce of the band as help.",
      "Keep your body in a straight line."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 20
  },
  {
    "id": "7384",
    "name": "Lever Hip Thrust (plate Loaded)",
    "bodyPart": "legs",
    "target": "Glutes",
    "secondaryMuscles": [
      "Hamstrings",
      "Quadriceps",
      "Core"
    ],
    "equipment": "Leverage Machine",
    "category": "strength",
    "instructions": [
      "Sit with your back against the pad and belt secured over your hips.",
      "Plant your feet flat, shoulder width apart.",
      "Drive your hips up until your body is level.",
      "Squeeze your glutes at the top.",
      "Lower with control."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 20
  },
  {
    "id": "8189",
    "name": "Wide Chin Up",
    "bodyPart": "back",
    "target": "Lats",
    "secondaryMuscles": [
      "Biceps",
      "Upper Back",
      "Forearms",
      "Rhomboids"
    ],
    "equipment": "Body Weight",
    "category": "calisthenics",
    "instructions": [
      "Hang from a bar with an underhand grip wider than shoulders.",
      "Brace your core.",
      "Pull until your chin is over the bar.",
      "Squeeze your back at the top.",
      "Lower slowly to a full hang."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 0
  },
  {
    "id": "9695",
    "name": "Landmine Half Kneeling Shoulders Press",
    "bodyPart": "shoulders",
    "target": "Delts",
    "secondaryMuscles": [
      "Triceps",
      "Upper Chest",
      "Core",
      "Glutes"
    ],
    "equipment": "Landmine",
    "category": "strength",
    "instructions": [
      "Kneel on one knee and hold the end of the landmine at your shoulder.",
      "Brace your core and squeeze your glutes.",
      "Press the end up and forward until your arm is straight.",
      "Lower slowly to your shoulder.",
      "Complete your reps, then switch sides."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 20
  },
  {
    "id": "0001",
    "name": "3/4 Sit-up",
    "bodyPart": "core",
    "target": "Abs",
    "secondaryMuscles": [
      "Hip Flexors",
      "Lower Back"
    ],
    "equipment": "Body Weight",
    "category": "calisthenics",
    "instructions": [
      "Lie flat on your back with your knees bent and feet flat on the ground.",
      "Place your hands behind your head with your elbows pointing outwards.",
      "Engaging your abs, slowly lift your upper body off the ground, curling forward until your torso is at a 45-degree angle.",
      "Pause for a moment at the top, then slowly lower your upper body back down to the starting position.",
      "Repeat for the desired number of repetitions."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 0
  },
  {
    "id": "0002",
    "name": "45° Side Bend",
    "bodyPart": "core",
    "target": "Abs",
    "secondaryMuscles": [
      "Obliques"
    ],
    "equipment": "Body Weight",
    "category": "strength",
    "instructions": [
      "Stand with your feet shoulder-width apart and your arms extended straight down by your sides.",
      "Keeping your back straight and your core engaged, slowly bend your torso to one side, lowering your hand towards your knee.",
      "Pause for a moment at the bottom, then slowly return to the starting position.",
      "Repeat on the other side.",
      "Continue alternating sides for the desired number of repetitions."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 0
  },
  {
    "id": "0003",
    "name": "Air Bike",
    "bodyPart": "core",
    "target": "Abs",
    "secondaryMuscles": [
      "Hip Flexors"
    ],
    "equipment": "Body Weight",
    "category": "calisthenics",
    "instructions": [
      "Lie flat on your back with your hands placed behind your head.",
      "Lift your legs off the ground and bend your knees at a 90-degree angle.",
      "Bring your right elbow towards your left knee while simultaneously straightening your right leg.",
      "Return to the starting position and repeat the movement on the opposite side, bringing your left elbow towards your right knee while straightening your left leg.",
      "Continue alternating sides in a pedaling motion for the desired number of repetitions."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 0
  },
  {
    "id": "0005",
    "name": "Band Alternate Biceps Curl",
    "bodyPart": "arms",
    "target": "Biceps",
    "secondaryMuscles": [
      "Brachialis",
      "Forearms"
    ],
    "equipment": "Band",
    "category": "strength",
    "instructions": [
      "Stand on the middle of a band and hold an end in each hand.",
      "Keep your elbows at your sides with palms forward.",
      "Curl one hand up toward your shoulder.",
      "Lower it slowly while curling the other hand.",
      "Keep your upper arms still and avoid leaning back.",
      "Alternate sides for your reps."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 20
  },
  {
    "id": "0006",
    "name": "Alternate Heel Touchers",
    "bodyPart": "core",
    "target": "Abs",
    "secondaryMuscles": [
      "Obliques"
    ],
    "equipment": "Body Weight",
    "category": "calisthenics",
    "instructions": [
      "Lie flat on your back with your knees bent and feet flat on the ground.",
      "Extend your arms straight out to the sides, parallel to the ground.",
      "Engaging your abs, lift your shoulders off the ground and reach your right hand towards your right heel.",
      "Return to the starting position and repeat on the left side, reaching your left hand towards your left heel.",
      "Continue alternating sides for the desired number of repetitions."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 0
  },
  {
    "id": "0007",
    "name": "Alternate Lateral Pulldown",
    "bodyPart": "back",
    "target": "Lats",
    "secondaryMuscles": [
      "Biceps",
      "Rhomboids"
    ],
    "equipment": "Cable",
    "category": "strength",
    "instructions": [
      "Sit on the cable machine with your back straight and feet flat on the ground.",
      "Grasp the handles with an overhand grip, slightly wider than shoulder-width apart.",
      "Lean back slightly and pull the handles towards your chest, squeezing your shoulder blades together.",
      "Pause for a moment at the peak of the movement, then slowly release the handles back to the starting position.",
      "Repeat for the desired number of repetitions."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 20
  },
  {
    "id": "0010",
    "name": "Assisted Hanging Knee Raise With Throw Down",
    "bodyPart": "core",
    "target": "Abs",
    "secondaryMuscles": [
      "Hip Flexors",
      "Lower Back"
    ],
    "equipment": "Assisted",
    "category": "strength",
    "instructions": [
      "Hang from a pull-up bar with your arms fully extended and your palms facing away from you.",
      "Engage your core and lift your knees towards your chest, keeping your legs together.",
      "Once your knees are at chest level, explosively throw your legs down towards the ground, extending them fully.",
      "Allow your legs to swing back up and repeat the movement for the desired number of repetitions."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 20
  },
  {
    "id": "0011",
    "name": "Assisted Hanging Knee Raise",
    "bodyPart": "core",
    "target": "Abs",
    "secondaryMuscles": [
      "Hip Flexors"
    ],
    "equipment": "Assisted",
    "category": "strength",
    "instructions": [
      "Hang from a pull-up bar with your arms fully extended and your palms facing away from you.",
      "Engage your core muscles and lift your knees towards your chest, bending at the hips and knees.",
      "Pause for a moment at the top of the movement, squeezing your abs.",
      "Slowly lower your legs back down to the starting position.",
      "Repeat for the desired number of repetitions."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 20
  },
  {
    "id": "0012",
    "name": "Assisted Lying Leg Raise With Lateral Throw Down",
    "bodyPart": "core",
    "target": "Abs",
    "secondaryMuscles": [
      "Hip Flexors",
      "Obliques"
    ],
    "equipment": "Assisted",
    "category": "strength",
    "instructions": [
      "Lie flat on your back with your legs extended and your arms by your sides.",
      "Place your hands under your glutes for support.",
      "Engage your abs and lift your legs off the ground, keeping them straight.",
      "While keeping your legs together, lower them to one side until they are a few inches above the ground.",
      "Pause for a moment, then lift your legs back to the starting position.",
      "Repeat the movement to the other side.",
      "Continue alternating sides for the desired number of repetitions."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 20
  },
  {
    "id": "0013",
    "name": "Assisted Lying Leg Raise With Throw Down",
    "bodyPart": "core",
    "target": "Abs",
    "secondaryMuscles": [
      "Hip Flexors",
      "Quadriceps"
    ],
    "equipment": "Assisted",
    "category": "strength",
    "instructions": [
      "Lie flat on your back with your legs extended and your arms by your sides.",
      "Place your hands under your glutes for support.",
      "Engage your core and lift your legs off the ground, keeping them straight.",
      "Raise your legs until they are perpendicular to the ground.",
      "Lower your legs back down to the starting position.",
      "Simultaneously, throw your legs down towards the ground, keeping them straight.",
      "Raise your legs back up to the starting position.",
      "Repeat for the desired number of repetitions."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 20
  },
  {
    "id": "0014",
    "name": "Assisted Motion Russian Twist",
    "bodyPart": "core",
    "target": "Abs",
    "secondaryMuscles": [
      "Obliques",
      "Lower Back"
    ],
    "equipment": "Medicine Ball",
    "category": "strength",
    "instructions": [
      "Sit on the ground with your knees bent and feet flat on the floor.",
      "Hold the medicine ball with both hands in front of your chest.",
      "Lean back slightly, engaging your abs and keeping your back straight.",
      "Slowly twist your torso to the right, bringing the medicine ball towards the right side of your body.",
      "Pause for a moment, then twist your torso to the left, bringing the medicine ball towards the left side of your body.",
      "Continue alternating sides for the desired number of repetitions."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 20
  },
  {
    "id": "0015",
    "name": "Assisted Parallel Close Grip Pull-up",
    "bodyPart": "back",
    "target": "Lats",
    "secondaryMuscles": [
      "Biceps",
      "Forearms"
    ],
    "equipment": "Leverage Machine",
    "category": "strength",
    "instructions": [
      "Adjust the machine to your desired weight and height.",
      "Place your hands on the parallel bars with a close grip, palms facing each other.",
      "Hang from the bars with your arms fully extended and your feet off the ground.",
      "Engage your back muscles and pull your body up towards the bars, keeping your elbows close to your body.",
      "Continue pulling until your chin is above the bars.",
      "Pause for a moment at the top, then slowly lower your body back down to the starting position.",
      "Repeat for the desired number of repetitions."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 20
  },
  {
    "id": "0016",
    "name": "Assisted Prone Hamstring",
    "bodyPart": "legs",
    "target": "Hamstrings",
    "secondaryMuscles": [
      "Glutes",
      "Lower Back"
    ],
    "equipment": "Assisted",
    "category": "strength",
    "instructions": [
      "Lie face down on a mat or bench with your legs fully extended.",
      "Have a partner or use a resistance band to secure your ankles.",
      "Engage your hamstrings and lift your legs towards your glutes, keeping your knees straight.",
      "Pause for a moment at the top, then slowly lower your legs back down to the starting position.",
      "Repeat for the desired number of repetitions."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 20
  },
  {
    "id": "0017",
    "name": "Assisted Pull-up",
    "bodyPart": "back",
    "target": "Lats",
    "secondaryMuscles": [
      "Biceps",
      "Forearms"
    ],
    "equipment": "Leverage Machine",
    "category": "strength",
    "instructions": [
      "Adjust the machine to your desired weight and height settings.",
      "Grasp the handles with an overhand grip, slightly wider than shoulder-width apart.",
      "Hang with your arms fully extended and your feet off the ground.",
      "Engage your back muscles and pull your body up towards the handles, keeping your elbows close to your body.",
      "Continue pulling until your chin is above the handles.",
      "Pause for a moment at the top, then slowly lower your body back down to the starting position.",
      "Repeat for the desired number of repetitions."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 20
  },
  {
    "id": "0018",
    "name": "Assisted Standing Triceps Extension (with Towel)",
    "bodyPart": "arms",
    "target": "Triceps",
    "secondaryMuscles": [
      "Shoulders"
    ],
    "equipment": "Assisted",
    "category": "strength",
    "instructions": [
      "Stand with your feet shoulder-width apart and hold a towel with both hands behind your head.",
      "Keep your elbows close to your ears and your upper arms stationary.",
      "Slowly extend your forearms upward, squeezing your triceps at the top.",
      "Pause for a moment, then slowly lower the towel back down to the starting position.",
      "Repeat for the desired number of repetitions."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 20
  },
  {
    "id": "0019",
    "name": "Assisted Triceps Dip (kneeling)",
    "bodyPart": "arms",
    "target": "Triceps",
    "secondaryMuscles": [
      "Chest",
      "Shoulders"
    ],
    "equipment": "Leverage Machine",
    "category": "strength",
    "instructions": [
      "Adjust the machine to your desired weight and height.",
      "Kneel down on the pad facing the machine, with your hands gripping the handles.",
      "Lower your body by bending your elbows, keeping your back straight and close to the machine.",
      "Pause for a moment at the bottom, then push yourself back up to the starting position.",
      "Repeat for the desired number of repetitions."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 20
  },
  {
    "id": "0020",
    "name": "Balance Board",
    "bodyPart": "legs",
    "target": "Quads",
    "secondaryMuscles": [
      "Calves",
      "Hamstrings",
      "Glutes"
    ],
    "equipment": "Body Weight",
    "category": "mobility",
    "instructions": [
      "Place the balance board on a flat surface.",
      "Step onto the balance board with one foot, ensuring it is centered.",
      "Slowly shift your weight onto the foot on the balance board, keeping your core engaged.",
      "Maintain your balance and stability as you hold the position for a desired amount of time.",
      "Repeat the exercise with the other foot."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 0
  },
  {
    "id": "0022",
    "name": "Barbell Pullover To Press",
    "bodyPart": "back",
    "target": "Lats",
    "secondaryMuscles": [
      "Triceps",
      "Chest",
      "Shoulders"
    ],
    "equipment": "Barbell",
    "category": "strength",
    "instructions": [
      "Lie flat on a bench with your head at one end and your feet on the ground.",
      "Hold the barbell with a pronated grip (palms facing away from you) and extend your arms straight above your chest.",
      "Keeping your arms straight, lower the barbell behind your head in an arc-like motion until you feel a stretch in your lats.",
      "Pause for a moment, then reverse the motion and press the barbell back to the starting position above your chest.",
      "Repeat for the desired number of repetitions."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 20
  },
  {
    "id": "0023",
    "name": "Barbell Alternate Biceps Curl",
    "bodyPart": "arms",
    "target": "Biceps",
    "secondaryMuscles": [
      "Forearms"
    ],
    "equipment": "Barbell",
    "category": "strength",
    "instructions": [
      "Stand up straight with your feet shoulder-width apart and hold a barbell in each hand, palms facing forward.",
      "Keep your upper arms stationary and exhale as you curl the weights while contracting your biceps.",
      "Continue to raise the barbells until your biceps are fully contracted and the barbells are at shoulder level.",
      "Hold the contracted position for a brief pause as you squeeze your biceps.",
      "Inhale as you slowly begin to lower the barbells back to the starting position.",
      "Repeat for the desired number of repetitions, alternating arms."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 20
  },
  {
    "id": "0026",
    "name": "Barbell Bench Squat",
    "bodyPart": "legs",
    "target": "Quads",
    "secondaryMuscles": [
      "Glutes",
      "Hamstrings",
      "Calves"
    ],
    "equipment": "Barbell",
    "category": "strength",
    "instructions": [
      "Set up a barbell on a squat rack at chest height.",
      "Stand facing away from the rack, with your feet shoulder-width apart.",
      "Bend your knees and lower your body down into a squat position, keeping your back straight and chest up.",
      "Grasp the barbell with an overhand grip, slightly wider than shoulder-width apart.",
      "Lift the barbell off the rack and step back, ensuring your feet are still shoulder-width apart.",
      "Lower your body down into a squat, keeping your knees in line with your toes.",
      "Pause for a moment at the bottom, then push through your heels to return to the starting position.",
      "Repeat for the desired number of repetitions."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 20
  },
  {
    "id": "0030",
    "name": "Barbell Close-grip Bench Press",
    "bodyPart": "arms",
    "target": "Triceps",
    "secondaryMuscles": [
      "Chest",
      "Shoulders"
    ],
    "equipment": "Barbell",
    "category": "strength",
    "instructions": [
      "Lie flat on a bench with your feet flat on the ground and your back pressed against the bench.",
      "Grasp the barbell with a close grip, slightly narrower than shoulder-width apart.",
      "Unrack the barbell and lower it slowly towards your chest, keeping your elbows close to your body.",
      "Pause for a moment when the barbell touches your chest.",
      "Push the barbell back up to the starting position, fully extending your arms.",
      "Repeat for the desired number of repetitions."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 20
  },
  {
    "id": "0033",
    "name": "Barbell Decline Bench Press",
    "bodyPart": "chest",
    "target": "Pectorals",
    "secondaryMuscles": [
      "Triceps",
      "Shoulders"
    ],
    "equipment": "Barbell",
    "category": "strength",
    "instructions": [
      "Lie on a decline bench with your feet secured and your head lower than your hips.",
      "Grasp the barbell with an overhand grip slightly wider than shoulder-width apart.",
      "Unrack the barbell and lower it slowly towards your chest, keeping your elbows tucked in.",
      "Pause for a moment at the bottom, then push the barbell back up to the starting position.",
      "Repeat for the desired number of repetitions."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 20
  },
  {
    "id": "0035",
    "name": "Barbell Decline Close Grip To Skull Press",
    "bodyPart": "arms",
    "target": "Triceps",
    "secondaryMuscles": [
      "Chest",
      "Shoulders"
    ],
    "equipment": "Barbell",
    "category": "strength",
    "instructions": [
      "Lie on a decline bench with your head lower than your feet and hold a barbell with a close grip.",
      "Lower the barbell towards your forehead by bending your elbows, keeping your upper arms stationary.",
      "Pause for a moment, then extend your arms to press the barbell back up to the starting position.",
      "Repeat for the desired number of repetitions."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 20
  },
  {
    "id": "0036",
    "name": "Barbell Decline Wide-grip Press",
    "bodyPart": "chest",
    "target": "Pectorals",
    "secondaryMuscles": [
      "Triceps",
      "Shoulders"
    ],
    "equipment": "Barbell",
    "category": "strength",
    "instructions": [
      "Lie on a decline bench with your feet secured and your head lower than your hips.",
      "Grasp the barbell with a wide grip, slightly wider than shoulder-width apart.",
      "Lower the barbell to your chest, keeping your elbows out to the sides.",
      "Push the barbell back up to the starting position, fully extending your arms.",
      "Repeat for the desired number of repetitions."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 20
  },
  {
    "id": "0040",
    "name": "Barbell Front Raise And Pullover",
    "bodyPart": "chest",
    "target": "Pectorals",
    "secondaryMuscles": [
      "Deltoids",
      "Triceps"
    ],
    "equipment": "Barbell",
    "category": "strength",
    "instructions": [
      "Stand with your feet shoulder-width apart and hold a barbell with an overhand grip, palms facing down.",
      "Keep your arms straight and raise the barbell in front of you until it reaches shoulder height.",
      "Pause for a moment at the top, then slowly lower the barbell back down to the starting position.",
      "Next, lower the barbell behind your head, keeping your arms straight.",
      "Pause for a moment at the bottom, then raise the barbell back up to the starting position.",
      "Repeat for the desired number of repetitions."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 20
  },
  {
    "id": "0041",
    "name": "Barbell Front Raise",
    "bodyPart": "shoulders",
    "target": "Delts",
    "secondaryMuscles": [
      "Biceps",
      "Triceps"
    ],
    "equipment": "Barbell",
    "category": "strength",
    "instructions": [
      "Stand with your feet shoulder-width apart and hold a barbell in front of your thighs with an overhand grip.",
      "Keep your arms straight and lift the barbell forward and upward until it reaches shoulder level.",
      "Pause for a moment at the top, then slowly lower the barbell back down to the starting position.",
      "Repeat for the desired number of repetitions."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 20
  },
  {
    "id": "0045",
    "name": "Barbell Guillotine Bench Press",
    "bodyPart": "chest",
    "target": "Pectorals",
    "secondaryMuscles": [
      "Shoulders",
      "Triceps"
    ],
    "equipment": "Barbell",
    "category": "strength",
    "instructions": [
      "Lie flat on a bench with your feet flat on the ground and your back pressed against the bench.",
      "Grasp the barbell with an overhand grip, slightly wider than shoulder-width apart.",
      "Lower the barbell slowly towards your neck, keeping your elbows pointed outwards.",
      "Pause for a moment when the barbell is just above your neck.",
      "Push the barbell back up to the starting position, fully extending your arms.",
      "Repeat for the desired number of repetitions."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 20
  },
  {
    "id": "0067",
    "name": "Barbell One Arm Snatch",
    "bodyPart": "shoulders",
    "target": "Delts",
    "secondaryMuscles": [
      "Traps",
      "Forearms",
      "Core"
    ],
    "equipment": "Barbell",
    "category": "olympic",
    "instructions": [
      "Stand with your feet shoulder-width apart, toes pointing slightly outwards.",
      "Hold the barbell with an overhand grip, hands slightly wider than shoulder-width apart.",
      "Bend your knees and lower your hips into a squat position, keeping your back straight and chest up.",
      "Explosively extend your hips, knees, and ankles, driving the barbell upwards.",
      "As the barbell reaches chest level, pull it upwards with your arm, keeping it close to your body.",
      "Rotate your elbow under the barbell and extend your arm fully overhead, locking out your elbow.",
      "Lower the barbell back down to the starting position in a controlled manner.",
      "Repeat for the desired number of repetitions, then switch arms."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 20
  },
  {
    "id": "0075",
    "name": "Barbell Rear Delt Raise",
    "bodyPart": "shoulders",
    "target": "Delts",
    "secondaryMuscles": [
      "Traps",
      "Rhomboids"
    ],
    "equipment": "Barbell",
    "category": "strength",
    "instructions": [
      "Stand with your feet shoulder-width apart and hold a barbell with an overhand grip, palms facing down.",
      "Bend your knees slightly and hinge forward at the hips, keeping your back straight.",
      "Raise the barbell out to the sides, keeping your arms straight, until they are parallel to the ground.",
      "Pause for a moment at the top, then slowly lower the barbell back to the starting position.",
      "Repeat for the desired number of repetitions."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 20
  },
  {
    "id": "0076",
    "name": "Barbell Rear Delt Row",
    "bodyPart": "shoulders",
    "target": "Delts",
    "secondaryMuscles": [
      "Trapezius",
      "Rhomboids",
      "Biceps"
    ],
    "equipment": "Barbell",
    "category": "strength",
    "instructions": [
      "Stand with your feet shoulder-width apart and knees slightly bent.",
      "Hold a barbell with an overhand grip, hands slightly wider than shoulder-width apart.",
      "Bend forward at the hips, keeping your back straight and chest up.",
      "Pull the barbell towards your chest, squeezing your shoulder blades together.",
      "Pause for a moment at the top, then slowly lower the barbell back to the starting position.",
      "Repeat for the desired number of repetitions."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 20
  },
  {
    "id": "0086",
    "name": "Barbell Seated Behind Head Military Press",
    "bodyPart": "shoulders",
    "target": "Delts",
    "secondaryMuscles": [
      "Triceps",
      "Upper Back"
    ],
    "equipment": "Barbell",
    "category": "strength",
    "instructions": [
      "Sit on a bench with your back straight and feet flat on the ground.",
      "Hold the barbell with an overhand grip, slightly wider than shoulder-width apart.",
      "Lift the barbell off the rack and bring it down to shoulder level, behind your head.",
      "Press the barbell upward until your arms are fully extended.",
      "Lower the barbell back down to the starting position.",
      "Repeat for the desired number of repetitions."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 20
  },
  {
    "id": "0087",
    "name": "Barbell Seated Bradford Rocky Press",
    "bodyPart": "shoulders",
    "target": "Delts",
    "secondaryMuscles": [
      "Triceps",
      "Upper Back"
    ],
    "equipment": "Barbell",
    "category": "strength",
    "instructions": [
      "Sit on a bench with your back straight and feet flat on the ground.",
      "Hold the barbell with an overhand grip, slightly wider than shoulder-width apart.",
      "Lift the barbell to shoulder height, keeping your elbows slightly bent and pointing forward.",
      "Press the barbell overhead, fully extending your arms.",
      "Lower the barbell back to shoulder height and repeat for the desired number of repetitions."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 20
  },
  {
    "id": "0091",
    "name": "Barbell Seated Overhead Press",
    "bodyPart": "shoulders",
    "target": "Delts",
    "secondaryMuscles": [
      "Triceps",
      "Upper Back"
    ],
    "equipment": "Barbell",
    "category": "strength",
    "instructions": [
      "Sit on a bench with your back straight and feet flat on the ground.",
      "Hold the barbell with an overhand grip, slightly wider than shoulder-width apart.",
      "Lift the barbell off the rack and bring it to shoulder level, with your elbows bent and palms facing forward.",
      "Press the barbell overhead by extending your arms fully.",
      "Pause for a moment at the top, then slowly lower the barbell back to shoulder level.",
      "Repeat for the desired number of repetitions."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 20
  },
  {
    "id": "0100",
    "name": "Barbell Skier",
    "bodyPart": "shoulders",
    "target": "Delts",
    "secondaryMuscles": [
      "Triceps",
      "Core"
    ],
    "equipment": "Barbell",
    "category": "strength",
    "instructions": [
      "Stand with your feet shoulder-width apart and hold a barbell in front of your thighs with an overhand grip.",
      "Bend your knees slightly and hinge forward at the hips, keeping your back straight and chest up.",
      "Simultaneously lift the barbell up towards your shoulders while jumping slightly off the ground.",
      "As you reach the top of the movement, quickly reverse the motion and lower the barbell back down to the starting position.",
      "Repeat for the desired number of repetitions."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 20
  },
  {
    "id": "0250",
    "name": "Ceiling Look Stretch",
    "bodyPart": "other",
    "target": "Levator Scapulae",
    "secondaryMuscles": [
      "Sternocleidomastoid",
      "Upper Back"
    ],
    "equipment": "Body Weight",
    "category": "stretching",
    "instructions": [
      "Sit or stand tall with relaxed shoulders.",
      "Slowly tilt your head back to look at the ceiling.",
      "Open your mouth slightly to relax the jaw.",
      "Feel the stretch along the front of your neck.",
      "Hold for 15-20 seconds.",
      "Return to neutral slowly."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 0
  },
  {
    "id": "0264",
    "name": "Cross Jacks",
    "bodyPart": "cardio",
    "target": "Cardiovascular System",
    "secondaryMuscles": [
      "Calves",
      "Glutes",
      "Shoulders",
      "Quadriceps"
    ],
    "equipment": "Body Weight",
    "category": "cardio",
    "instructions": [
      "Stand with your feet together and your arms at your sides.",
      "Jump your feet apart while raising your arms overhead.",
      "Jump back crossing your arms and one leg in front.",
      "Alternate which leg crosses on the next rep.",
      "Land softly on the balls of your feet.",
      "Keep a steady rhythm for 30-60 seconds."
    ],
    "defaultSets": 3,
    "defaultReps": 30,
    "defaultWeight": 0
  },
  {
    "id": "0462",
    "name": "Front And Back Neck Stretch",
    "bodyPart": "other",
    "target": "Levator Scapulae",
    "secondaryMuscles": [
      "Sternocleidomastoid",
      "Trapezius"
    ],
    "equipment": "Body Weight",
    "category": "stretching",
    "instructions": [
      "Sit or stand tall with your shoulders relaxed.",
      "Slowly lower your chin toward your chest until you feel a stretch at the back of the neck.",
      "Hold for 20-30 seconds.",
      "Raise your head and slowly tip it back to look up.",
      "Hold for 20-30 seconds, staying comfortable.",
      "Move slowly and keep your breathing relaxed."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 0
  },
  {
    "id": "0480",
    "name": "High Knee Twist",
    "bodyPart": "cardio",
    "target": "Cardiovascular System",
    "secondaryMuscles": [
      "Obliques",
      "Hip Flexors",
      "Quadriceps",
      "Core"
    ],
    "equipment": "Body Weight",
    "category": "cardio",
    "instructions": [
      "Stand tall with your hands behind your head.",
      "Lift one knee high and twist your torso to meet it with the opposite elbow.",
      "Lower and switch sides.",
      "Keep a quick, steady rhythm.",
      "Land softly on the balls of your feet.",
      "Go for 30-60 seconds."
    ],
    "defaultSets": 3,
    "defaultReps": 30,
    "defaultWeight": 0
  },
  {
    "id": "0481",
    "name": "High Knees Butt Kicks",
    "bodyPart": "cardio",
    "target": "Cardiovascular System",
    "secondaryMuscles": [
      "Hamstrings",
      "Quadriceps",
      "Hip Flexors",
      "Calves"
    ],
    "equipment": "Body Weight",
    "category": "cardio",
    "instructions": [
      "Stand tall with your arms ready to pump.",
      "Run in place and drive your knees up high.",
      "Switch to kicking your heels toward your buttocks.",
      "Alternate between the two patterns.",
      "Stay light on your feet.",
      "Keep going for 30-60 seconds."
    ],
    "defaultSets": 3,
    "defaultReps": 30,
    "defaultWeight": 0
  },
  {
    "id": "0501",
    "name": "Jack Burpee",
    "bodyPart": "cardio",
    "target": "Cardiovascular System",
    "secondaryMuscles": [
      "Quadriceps",
      "Hamstrings",
      "Calves",
      "Shoulders",
      "Triceps",
      "Core"
    ],
    "equipment": "Body Weight",
    "category": "cardio",
    "instructions": [
      "Start in a standing position with your feet shoulder-width apart.",
      "Lower your body into a squat position, placing your hands on the ground in front of you.",
      "Kick your feet back, landing in a push-up position.",
      "Perform a push-up, lowering your chest to the ground and then pushing back up.",
      "Jump your feet forward, landing in a squat position.",
      "Jump up explosively, reaching your arms overhead.",
      "Land softly and immediately lower back into the squat position to begin the next repetition."
    ],
    "defaultSets": 3,
    "defaultReps": 30,
    "defaultWeight": 0
  },
  {
    "id": "0504",
    "name": "Jack Press",
    "bodyPart": "cardio",
    "target": "Cardiovascular System",
    "secondaryMuscles": [
      "Shoulders",
      "Triceps",
      "Calves",
      "Glutes"
    ],
    "equipment": "Dumbbell",
    "category": "cardio",
    "instructions": [
      "Stand tall with a dumbbell in each hand at shoulder height.",
      "Jump your feet out wide as you press the dumbbells overhead.",
      "Lock out the arms without arching your back.",
      "Jump your feet together as you lower the weights to your shoulders.",
      "Land softly on the balls of your feet.",
      "Keep a steady rhythm for the set."
    ],
    "defaultSets": 3,
    "defaultReps": 30,
    "defaultWeight": 20
  },
  {
    "id": "0510",
    "name": "Jump Lunge To Feet Jack",
    "bodyPart": "full-body",
    "target": "Cardiovascular System",
    "secondaryMuscles": [
      "Quadriceps",
      "Glutes",
      "Hamstrings",
      "Calves",
      "Shoulders"
    ],
    "equipment": "Body Weight",
    "category": "plyometrics",
    "instructions": [
      "Start standing tall with feet together.",
      "Step into a lunge and drop your back knee toward the floor.",
      "Jump and switch legs in the air, landing in a lunge on the other side.",
      "Jump up and land with feet wide as you swing your arms overhead, like a jumping jack.",
      "Jump the feet back together and return to the start.",
      "Land softly and keep your chest up."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 0
  },
  {
    "id": "0610",
    "name": "Low Jacks",
    "bodyPart": "cardio",
    "target": "Cardiovascular System",
    "secondaryMuscles": [
      "Quadriceps",
      "Glutes",
      "Calves",
      "Adductors"
    ],
    "equipment": "Body Weight",
    "category": "cardio",
    "instructions": [
      "Start in a half squat with hands in front of your chest.",
      "Jump your feet out wide, staying low.",
      "Jump them back together and keep your knees bent.",
      "Keep your chest up and weight on your heels.",
      "Stay in the squat throughout.",
      "Keep a steady pace for 30-60 seconds."
    ],
    "defaultSets": 3,
    "defaultReps": 30,
    "defaultWeight": 0
  },
  {
    "id": "0611",
    "name": "Lunge Push Up",
    "bodyPart": "full-body",
    "target": "Pectorals",
    "secondaryMuscles": [
      "Triceps",
      "Quadriceps",
      "Glutes",
      "Shoulders"
    ],
    "equipment": "Body Weight",
    "category": "calisthenics",
    "instructions": [
      "Stand tall with feet together.",
      "Step back into a lunge and lower your back knee toward the floor.",
      "Place your hands on the floor and step into a plank.",
      "Lower into a push-up and press back up.",
      "Step back into the lunge and stand up.",
      "Alternate the lunging leg each rep."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 0
  },
  {
    "id": "0629",
    "name": "Mountain Climber Lunge",
    "bodyPart": "full-body",
    "target": "Cardiovascular System",
    "secondaryMuscles": [
      "Quadriceps",
      "Glutes",
      "Hip Flexors",
      "Core",
      "Shoulders"
    ],
    "equipment": "Body Weight",
    "category": "cardio",
    "instructions": [
      "Start in a plank with hands under your shoulders.",
      "Step one foot forward outside your hand.",
      "Lower your hips into a lunge stretch.",
      "Return the foot back to the plank.",
      "Switch legs.",
      "Keep your core tight and move at a steady pace."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 0
  },
  {
    "id": "0630",
    "name": "Mountain Climber",
    "bodyPart": "cardio",
    "target": "Cardiovascular System",
    "secondaryMuscles": [
      "Core",
      "Shoulders",
      "Triceps"
    ],
    "equipment": "Body Weight",
    "category": "calisthenics",
    "instructions": [
      "Start in a high plank position with your hands directly under your shoulders and your body in a straight line.",
      "Engage your core and bring your right knee towards your chest, then quickly switch and bring your left knee towards your chest.",
      "Continue alternating legs in a running motion, keeping your hips low and your core engaged.",
      "Maintain a steady pace and breathe evenly throughout the exercise.",
      "Repeat for the desired number of repetitions."
    ],
    "defaultSets": 3,
    "defaultReps": 30,
    "defaultWeight": 0
  },
  {
    "id": "0633",
    "name": "Neck Bridge Prone",
    "bodyPart": "other",
    "target": "Levator Scapulae",
    "secondaryMuscles": [
      "Trapezius",
      "Upper Back",
      "Sternocleidomastoid"
    ],
    "equipment": "Body Weight",
    "category": "calisthenics",
    "instructions": [
      "Kneel on a mat and lean forward so the top of your head rests lightly on the floor.",
      "Place your hands on the floor for support.",
      "Take some weight through your neck by rocking forward and back slowly.",
      "Keep your movements small and controlled.",
      "Return to the start and rest between sets.",
      "Never bounce and keep most weight on your hands at first."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 0
  },
  {
    "id": "0654",
    "name": "Push Up (knee Chest)",
    "bodyPart": "cardio",
    "target": "Pectorals",
    "secondaryMuscles": [
      "Triceps",
      "Hip Flexors",
      "Core",
      "Shoulders"
    ],
    "equipment": "Body Weight",
    "category": "calisthenics",
    "instructions": [
      "Start in a plank with your hands under your shoulders.",
      "Lower into a push-up.",
      "Press back up.",
      "Drive one knee toward your chest.",
      "Return that foot to the plank.",
      "Alternate legs each rep."
    ],
    "defaultSets": 3,
    "defaultReps": 30,
    "defaultWeight": 0
  },
  {
    "id": "0683",
    "name": "Rotational Jacks",
    "bodyPart": "cardio",
    "target": "Cardiovascular System",
    "secondaryMuscles": [
      "Obliques",
      "Calves",
      "Shoulders"
    ],
    "equipment": "Body Weight",
    "category": "cardio",
    "instructions": [
      "Stand tall with feet together and arms at your sides.",
      "Jump your feet wide and twist your torso to one side.",
      "Jump back together.",
      "Repeat and twist to the other side.",
      "Keep your knees soft.",
      "Maintain a steady pace."
    ],
    "defaultSets": 3,
    "defaultReps": 30,
    "defaultWeight": 0
  },
  {
    "id": "0684",
    "name": "Run (equipment)",
    "bodyPart": "cardio",
    "target": "Cardiovascular System",
    "secondaryMuscles": [
      "Quadriceps",
      "Hamstrings",
      "Calves"
    ],
    "equipment": "Body Weight",
    "category": "cardio",
    "instructions": [
      "Start by standing upright with your feet hip-width apart.",
      "Engage your core and keep your upper body relaxed.",
      "Begin jogging in place, lifting your knees up towards your chest and landing softly on the balls of your feet.",
      "Maintain a steady pace and continue jogging for the desired duration or distance.",
      "Remember to breathe deeply and maintain good posture throughout the exercise."
    ],
    "defaultSets": 3,
    "defaultReps": 30,
    "defaultWeight": 0
  },
  {
    "id": "0685",
    "name": "Run",
    "bodyPart": "cardio",
    "target": "Cardiovascular System",
    "secondaryMuscles": [
      "Quadriceps",
      "Hamstrings",
      "Calves"
    ],
    "equipment": "Body Weight",
    "category": "cardio",
    "instructions": [
      "Start by standing upright with your feet hip-width apart.",
      "Engage your core and keep your upper body relaxed.",
      "Begin jogging in place, lifting your knees up towards your chest and landing softly on the balls of your feet.",
      "Maintain a steady pace and continue jogging for the desired duration or distance.",
      "Remember to breathe deeply and maintain good posture throughout the exercise."
    ],
    "defaultSets": 3,
    "defaultReps": 30,
    "defaultWeight": 0
  },
  {
    "id": "0713",
    "name": "Side Neck Stretch",
    "bodyPart": "other",
    "target": "Levator Scapulae",
    "secondaryMuscles": [
      "Trapezius",
      "Sternocleidomastoid"
    ],
    "equipment": "Body Weight",
    "category": "stretching",
    "instructions": [
      "Sit or stand tall with your shoulders relaxed.",
      "Tilt your head so your ear moves toward one shoulder.",
      "Keep the opposite shoulder pressed down.",
      "Hold for 20-30 seconds.",
      "Return to centre and repeat on the other side.",
      "Don't pull hard on your head, a light weight of the hand is enough."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 0
  },
  {
    "id": "0716",
    "name": "Side Push Neck Stretch",
    "bodyPart": "other",
    "target": "Levator Scapulae",
    "secondaryMuscles": [
      "Trapezius",
      "Sternocleidomastoid"
    ],
    "equipment": "Body Weight",
    "category": "stretching",
    "instructions": [
      "Stand or sit up straight with your shoulders relaxed.",
      "Tilt your head to the right, bringing your right ear towards your right shoulder.",
      "Place your right hand on the left side of your head and gently apply pressure to increase the stretch.",
      "Hold the stretch for 15-30 seconds.",
      "Repeat on the other side, tilting your head to the left and applying pressure with your left hand.",
      "Repeat the stretch 2-3 times on each side."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 0
  },
  {
    "id": "0782",
    "name": "Square Hop",
    "bodyPart": "cardio",
    "target": "Cardiovascular System",
    "secondaryMuscles": [
      "Calves",
      "Quadriceps",
      "Glutes"
    ],
    "equipment": "Body Weight",
    "category": "plyometrics",
    "instructions": [
      "Imagine a square on the floor and stand at one corner.",
      "Hop on both feet to the next corner, staying light on your toes.",
      "Keep hopping around the square in order.",
      "Land softly with slightly bent knees.",
      "Reverse direction halfway through your set."
    ],
    "defaultSets": 3,
    "defaultReps": 30,
    "defaultWeight": 0
  },
  {
    "id": "0785",
    "name": "Squat Jacks",
    "bodyPart": "full-body",
    "target": "Cardiovascular System",
    "secondaryMuscles": [
      "Quadriceps",
      "Glutes",
      "Calves"
    ],
    "equipment": "Body Weight",
    "category": "cardio",
    "instructions": [
      "Start in a squat with hands together at your chest.",
      "Jump your feet wide while staying low in the squat.",
      "Jump your feet back together, still low.",
      "Keep your chest lifted and knees over your toes.",
      "Continue at a steady, quick pace."
    ],
    "defaultSets": 3,
    "defaultReps": 10,
    "defaultWeight": 0
  },
  {
    "id": "0798",
    "name": "Stationary Bike Walk",
    "bodyPart": "cardio",
    "target": "Cardiovascular System",
    "secondaryMuscles": [
      "Quadriceps",
      "Hamstrings",
      "Calves"
    ],
    "equipment": "Leverage Machine",
    "category": "cardio",
    "instructions": [
      "Adjust the seat height and position on the stationary bike to ensure proper alignment.",
      "Place your feet on the pedals and secure them with the straps if available.",
      "Start pedaling at a comfortable pace, keeping your back straight and core engaged.",
      "Maintain a steady rhythm and increase the resistance level if desired.",
      "Continue pedaling for the desired duration of your cardio workout.",
      "Cool down by gradually reducing your pace and resistance level.",
      "Stretch your leg muscles after the workout to prevent tightness and promote recovery."
    ],
    "defaultSets": 3,
    "defaultReps": 30,
    "defaultWeight": 20
  },
  {
    "id": "0827",
    "name": "Vertical Mountain Climber",
    "bodyPart": "cardio",
    "target": "Cardiovascular System",
    "secondaryMuscles": [
      "Core",
      "Hip Flexors",
      "Quadriceps"
    ],
    "equipment": "Body Weight",
    "category": "cardio",
    "instructions": [
      "Stand tall with hands raised in front of you at chest height.",
      "Drive one knee up toward your hands.",
      "Switch legs quickly, running in place.",
      "Stay on the balls of your feet.",
      "Keep a steady, brisk pace."
    ],
    "defaultSets": 3,
    "defaultReps": 30,
    "defaultWeight": 0
  },
  {
    "id": "0828",
    "name": "Walk (equipment)",
    "bodyPart": "cardio",
    "target": "Cardiovascular System",
    "secondaryMuscles": [
      "Calves",
      "Glutes",
      "Quadriceps",
      "Hamstrings"
    ],
    "equipment": "Body Weight",
    "category": "cardio",
    "instructions": [
      "Step onto the machine and set a comfortable speed.",
      "Stand tall with your shoulders relaxed.",
      "Swing your arms naturally as you walk.",
      "Land on your heel and roll through to your toes.",
      "Walk for 10-30 minutes at a pace where you can still talk.",
      "Slow down gradually at the end."
    ],
    "defaultSets": 3,
    "defaultReps": 30,
    "defaultWeight": 0
  },
  {
    "id": "0829",
    "name": "Walk (high Knees)",
    "bodyPart": "cardio",
    "target": "Cardiovascular System",
    "secondaryMuscles": [
      "Hip Flexors",
      "Quadriceps",
      "Calves"
    ],
    "equipment": "Body Weight",
    "category": "cardio",
    "instructions": [
      "Stand tall with your arms relaxed.",
      "Lift one knee to hip height.",
      "Step down and lift the other knee.",
      "Swing your arms naturally.",
      "Keep a steady rhythm for the set duration."
    ],
    "defaultSets": 3,
    "defaultReps": 30,
    "defaultWeight": 0
  }
];

export const OPENGYM_EXERCISE_MAP: Record<string, OpenGymExercise> = {};
OPENGYM_EXERCISES.forEach((ex) => {
  OPENGYM_EXERCISE_MAP[ex.id] = ex;
});

export const OPENGYM_ROUTINES: OpenGymRoutine[] = [
  {
    id: "routine_push",
    name: "Push Day",
    category: "Strength · Hypertrophy",
    description: "Focus on Chest, Anterior Shoulders, and Triceps push power.",
    targetMuscles: "Chest · Shoulders · Triceps",
    icon: "barbell",
    color: "#f43f5e",
    exerciseIds: ["0025", "0047", "0426", "0334", "0241", "0251"],
  },
  {
    id: "routine_pull",
    name: "Pull Day",
    category: "Strength · Hypertrophy",
    description: "Target Upper Back, Lats, Rear Deltoids, and Biceps pulling strength.",
    targetMuscles: "Back · Lats · Biceps",
    icon: "fitness",
    color: "#3b82f6",
    exerciseIds: ["2330", "0027", "1323", "0031", "0313"],
  },
  {
    id: "routine_legs",
    name: "Leg Day",
    category: "Lower Body Power",
    description: "Build massive quad, hamstring, glute, and calf strength.",
    targetMuscles: "Quads · Hamstrings · Glutes · Calves",
    icon: "walk",
    color: "#10b981",
    exerciseIds: ["0043", "0085", "0739", "0585", "0586", "0605"],
  },
  {
    id: "routine_upper",
    name: "Upper Body Power",
    category: "Full Upper Sculpt",
    description: "Balanced compound pushing and pulling routine for complete torso development.",
    targetMuscles: "Chest · Back · Shoulders · Arms",
    icon: "flash",
    color: "#8b5cf6",
    exerciseIds: ["0025", "2330", "0047", "1323", "0334", "0031"],
  },
  {
    id: "routine_lower",
    name: "Lower Body Focus",
    category: "Lower Body Strength",
    description: "Heavy squats, posterior chain activation, and quad burn.",
    targetMuscles: "Quads · Glutes · Calves",
    icon: "flame",
    color: "#f59e0b",
    exerciseIds: ["0043", "0085", "0739", "0586", "0605"],
  },
  {
    id: "routine_core_cardio",
    name: "Core & HIIT Cardio",
    category: "Endurance & Abs",
    description: "High intensity conditioning, abdominal endurance, and rotational core stability.",
    targetMuscles: "Abs · Obliques · Cardiovascular",
    icon: "heart",
    color: "#ec4899",
    exerciseIds: ["5965", "4209", "3294", "5172", "6959"],
  },
  {
    id: "routine_5x5",
    name: "5×5 Strength Foundation",
    category: "Raw Power",
    description: "The classic barbell protocol: 5 sets of 5 reps to build maximal raw strength.",
    targetMuscles: "Full Body Compound",
    icon: "shield-checkmark",
    color: "#6366f1",
    exerciseIds: ["0043", "0025", "0027", "0085"],
  },
];

export const OPENGYM_WEEKLY_SCHEDULE: { day: string; dayIndex: number; routineId: string; rest?: boolean }[] = [
  { day: "Monday", dayIndex: 1, routineId: "routine_push" },
  { day: "Tuesday", dayIndex: 2, routineId: "routine_pull" },
  { day: "Wednesday", dayIndex: 3, routineId: "routine_core_cardio" },
  { day: "Thursday", dayIndex: 4, routineId: "routine_legs" },
  { day: "Friday", dayIndex: 5, routineId: "routine_upper" },
  { day: "Saturday", dayIndex: 6, routineId: "routine_lower" },
  { day: "Sunday", dayIndex: 0, routineId: "", rest: true },
];
