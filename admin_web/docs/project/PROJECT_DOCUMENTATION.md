# Urban Helpers — Project Documentation

**Source:** Figma file `Xo1R4QcZCJVYpPy4ceHoSD`, Page 3 ("Untitled")
**Pipeline:** Figma design → Figma prototype (143 wired interactions) → React Native + TypeScript codebase
**Scope:** 44 designed screens across 6 modules (Modules 7–9 exist only as flat placeholder images in Figma and are out of scope — see [Out of Scope](#out-of-scope))

---

## Table of Contents

1. [Project Understanding](#1-project-understanding)
2. [Architecture & Tech Stack](#2-architecture--tech-stack)
3. [Screen Inventory](#3-screen-inventory)
4. [Complete Navigation Map](#4-complete-navigation-map) — every button/card and its destination
5. [Project Analytics](#5-project-analytics)
6. [Implementation Notes](#6-implementation-notes)
7. [Out of Scope](#7-out-of-scope)
8. [File Structure Reference](#8-file-structure-reference)

---

## 1. Project Understanding

**Urban Helpers** is a health-and-home-services mobile app concept ("One App. Better Health.
Better Home. Better Living."). The Figma file lays out 44 high-fidelity mobile screens (390px
wide) organized into 6 functional modules on a single canvas page ("Page 3"), grouped with text
dividers rather than separate Figma pages:

| Module | Theme | Screens |
|---|---|---|
| **Module 1** | Authentication & Onboarding | 11 |
| **Module 2** | Main Dashboard (hub) | 11 |
| **Module 3** | Medical Records | 6 |
| **Module 4** | Fitness | 6 |
| **Module 5** | Daily Health | 4 |
| **Module 6** | Daily Care | 6 |
| ~~Module 7~~ | ~~Services Dashboard~~ | 0 (placeholder image only) |
| ~~Module 8~~ | ~~Home Cleaning~~ | 0 (placeholder image only) |
| ~~Module 9~~ | ~~Appliance Repair~~ | 0 (placeholder image only) |

**Core user journey:** Splash → Welcome → (Get Started → 3-step onboarding carousel, or Sign In
directly) → Auth (Sign In / Create Account → Create Profile → OTP → System Permissions) →
**Home Dashboard** (the hub) → any of the 10 other Module 2 dashboards → their respective
Module 3–6 detail screens.

**Design intent:** Home Dashboard acts as a discovery hub (hero banner + masonry card grid);
each of the other Module 2 dashboards (Health, Fitness, Medical Records, etc.) is itself a
mini-hub for its module's detail screens, tied together by a shared bottom-nav tab convention
that differs slightly per module (see [Section 4](#4-complete-navigation-map)).

---

## 2. Architecture & Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **Expo (React Native)** | Single codebase for Android first, iOS next, per requirement |
| Language | **TypeScript** | Type-safe navigation params, catches route-name typos at compile time |
| Styling | **NativeWind v2** (Tailwind for RN) | Matches Figma's own Tailwind-flavored design tokens most directly |
| Navigation | **React Navigation** (native stack) | A single flat stack, not nested tabs — the source design's bottom navs differ per screen (Home/Health/Fitness/Discover vs. Health/History/Alarm/Reminders, etc.), so a fixed tab bar would misrepresent the design |
| Icons | **@expo/vector-icons (Ionicons)** | Figma's custom icon assets weren't exported; Ionicons used as semantic stand-ins |

**Design tokens** (`src/theme/`) were extracted directly from Figma via `get_design_context` on
two representative screens (Splash Screen, Home Dashboard) rather than pulled per-screen, to
avoid re-hitting Figma's MCP rate limit (hit once already during this project). Colors, radii,
and font families are real Figma values; the remaining 42 screens reuse this system consistently
rather than being individually pixel-audited.

---

## 3. Screen Inventory

### Module 1 — Authentication & Onboarding (`src/screens/auth/`)

| # | Screen | Route name | File |
|---|---|---|---|
| 1 | Splash Screen | `Splash` | `SplashScreen.tsx` |
| 2 | Welcome Screen | `Welcome` | `WelcomeScreen.tsx` |
| 3 | Onboarding: Health Tracking | `OnboardingHealth` | `OnboardingHealthScreen.tsx` |
| 4 | Onboarding: Home Services | `OnboardingHomeServices` | `OnboardingHomeServicesScreen.tsx` |
| 5 | Onboarding: Family & Emergency | `OnboardingFamily` | `OnboardingFamilyScreen.tsx` |
| 6 | Sign In | `SignIn` | `SignInScreen.tsx` |
| 7 | Create Account | `CreateAccount` | `CreateAccountScreen.tsx` |
| 8 | Create Profile | `CreateProfile` | `CreateProfileScreen.tsx` |
| 9 | OTP Verification | `OTPVerification` | `OTPVerificationScreen.tsx` |
| 10 | Forgot & Reset Password | `ForgotPassword` | `ForgotPasswordScreen.tsx` |
| 11 | System Permissions | `SystemPermissions` | `SystemPermissionsScreen.tsx` |

### Module 2 — Main Dashboard (`src/screens/dashboard/`)

| # | Screen | Route name | File |
|---|---|---|---|
| 12 | Home Dashboard | `HomeDashboard` | `HomeDashboardScreen.tsx` |
| 13 | Fitness Dashboard | `FitnessDashboard` | `FitnessDashboardScreen.tsx` |
| 14 | Family Dashboard | `FamilyDashboard` | `FamilyDashboardScreen.tsx` |
| 15 | Discover | `Discover` | `DiscoverScreen.tsx` |
| 16 | Health Dashboard | `HealthDashboard` | `HealthDashboardScreen.tsx` |
| 17 | Medical Records | `MedicalRecords` | `MedicalRecordsScreen.tsx` |
| 18 | Medication Center | `MedicationCenter` | `MedicationCenterScreen.tsx` |
| 19 | Emergency Assistance | `EmergencyAssistance` | `EmergencyAssistanceScreen.tsx` |
| 20 | AI Coach | `AICoach` | `AICoachScreen.tsx` |
| 21 | Sleep Dashboard | `SleepDashboard` | `SleepDashboardScreen.tsx` |
| 22 | Nutrition Dashboard | `NutritionDashboard` | `NutritionDashboardScreen.tsx` |

### Module 3 — Medical Records detail (`src/screens/medical/`)

| # | Screen | Route name | File |
|---|---|---|---|
| 23 | Health Data Analytics | `HealthDataAnalytics` | `HealthDataAnalyticsScreen.tsx` |
| 24 | Lab Reports Hub | `LabReportsHub` | `LabReportsHubScreen.tsx` |
| 25 | Doctor Advice | `DoctorAdvice` | `DoctorAdviceScreen.tsx` |
| 26 | Blood Test Reports | `BloodTestReports` | `BloodTestReportsScreen.tsx` |
| 27 | Prescription Management | `PrescriptionManagement` | `PrescriptionManagementScreen.tsx` |
| 28 | Vaccination Center | `VaccinationCenter` | `VaccinationCenterScreen.tsx` |

### Module 4 — Fitness detail (`src/screens/fitness/`)

| # | Screen | Route name | File |
|---|---|---|---|
| 29 | Yoga Dashboard | `YogaDashboard` | `YogaDashboardScreen.tsx` |
| 30 | Calories Dashboard | `CaloriesDashboard` | `CaloriesDashboardScreen.tsx` |
| 31 | Daily Steps Dashboard | `DailyStepsDashboard` | `DailyStepsDashboardScreen.tsx` |
| 32 | Physiotherapy Dashboard | `PhysiotherapyDashboard` | `PhysiotherapyDashboardScreen.tsx` |
| 33 | Meditation Dashboard | `MeditationDashboard` | `MeditationDashboardScreen.tsx` |
| 34 | Gym Dashboard | `GymDashboard` | `GymDashboardScreen.tsx` |

### Module 5 — Daily Health (`src/screens/dailyhealth/`)

| # | Screen | Route name | File |
|---|---|---|---|
| 35 | Hydration Dashboard | `HydrationDashboard` | `HydrationDashboardScreen.tsx` |
| 36 | Weight Log Dashboard | `WeightLogDashboard` | `WeightLogDashboardScreen.tsx` |
| 37 | Wellness Dashboard | `WellnessDashboard` | `WellnessDashboardScreen.tsx` |
| 38 | Advanced Nutrition Dashboard | `AdvancedNutritionDashboard` | `AdvancedNutritionDashboardScreen.tsx` |

### Module 6 — Daily Care (`src/screens/dailycare/`)

| # | Screen | Route name | File |
|---|---|---|---|
| 39 | Medicine Alarm | `MedicineAlarm` | `MedicineAlarmScreen.tsx` |
| 40 | Medicine History | `MedicineHistory` | `MedicineHistoryScreen.tsx` |
| 41 | Smart Reminders | `SmartReminders` | `SmartRemindersScreen.tsx` |
| 42 | Personal Hygiene | `PersonalHygiene` | `PersonalHygieneScreen.tsx` |
| 43 | Health Precautions | `HealthPrecautions` | `HealthPrecautionsScreen.tsx` |
| 44 | Health Companion | `HealthCompanion` | `HealthCompanionScreen.tsx` |

---

## 4. Complete Navigation Map

Every button/card/tab that has a wired destination, grouped by source screen. Items marked
**(unwired)** exist visually in both the Figma prototype and the code (e.g. a "Profile" tab)
but have no destination — either because the Figma design never designed a target screen for
them, or the label/icon had no legible text to infer intent from safely. These are intentional,
not omissions — see [Section 6](#6-implementation-notes) for the "why."

### Module 1 — Authentication & Onboarding

| Screen | Element | Action | Destination |
|---|---|---|---|
| Splash Screen | *(whole screen)* | auto-advance after 2s | → Welcome Screen |
| Welcome Screen | "Get Started" button | tap | → Onboarding: Health Tracking |
| Welcome Screen | "Sign In" button | tap | → Sign In |
| Onboarding: Health Tracking | "Next" | tap | → Onboarding: Home Services |
| Onboarding: Health Tracking | "Skip" | tap | → Sign In |
| Onboarding: Home Services | "Next" | tap | → Onboarding: Family & Emergency |
| Onboarding: Home Services | "Back" | tap | → Onboarding: Health Tracking |
| Onboarding: Family & Emergency | "Back" | tap | → Onboarding: Home Services |
| Onboarding: Family & Emergency | "Finish" | tap | → Sign In |
| Sign In | Back button | tap | → Welcome Screen |
| Sign In | "Forgot Password?" link | tap | → Forgot & Reset Password |
| Sign In | "Sign In" submit button | tap | → Home Dashboard |
| Sign In | "Continue with Google" | tap | → Home Dashboard |
| Sign In | "Continue with Apple" | tap | → Home Dashboard |
| Sign In | "Continue with Phone" | tap | → Home Dashboard |
| Sign In | "Create Account" link | tap | → Create Account |
| Create Account | "Create Account" submit | tap | → Create Profile |
| Create Account | "Sign In" footer link | tap | → Sign In |
| Create Profile | "Continue" button | tap | → OTP Verification |
| Create Profile | Gender selector (Female/Male/Other) | tap | *(selection only, no navigation)* |
| OTP Verification | "Verify" button | tap | → System Permissions |
| OTP Verification | "Edit Number" link | tap | → Create Profile |
| Forgot & Reset Password | "Send OTP" button | tap | → OTP Verification |
| Forgot & Reset Password | "Back to Login" link | tap | → Sign In |
| System Permissions | "Allow All" button | tap | → Home Dashboard |
| System Permissions | "Allow Individually" button | tap | → Home Dashboard |
| System Permissions | "Continue" button | tap | → Home Dashboard |

### Module 2 — Main Dashboard

| Screen | Element | Action | Destination |
|---|---|---|---|
| **Home Dashboard** | Category pills (Home/Health/Fitness/Home Care/Family) | tap | *(filter chips, unwired — filter the grid, don't navigate)* |
| Home Dashboard | Hero "Explore" button | tap | → Discover |
| Home Dashboard | Card: "Energy Score" (Daily Energy) | tap | → Fitness Dashboard |
| Home Dashboard | Card: "Heart Health" | tap | → Health Data Analytics |
| Home Dashboard | Card: "Sleep" | tap | → Sleep Dashboard |
| Home Dashboard | Card: "Nutrition" | tap | → Nutrition Dashboard |
| Home Dashboard | Card: "Family Care" | tap | → Family Dashboard |
| Home Dashboard | Card: "Medication" | tap | → Medication Center |
| Home Dashboard | Card: "Home Care" / Home Services | tap | *(unwired — no Module 7 screen exists yet)* |
| Home Dashboard | Bottom nav: Home | tap | *(active/self)* |
| Home Dashboard | Bottom nav: Health | tap | → Health Dashboard |
| Home Dashboard | Bottom nav: Discover | tap | → Discover |
| Home Dashboard | Bottom nav: Fitness | tap | → Fitness Dashboard |
| Home Dashboard | Bottom nav: Profile | tap | *(unwired — no Profile screen designed)* |
| **Fitness Dashboard** | Hero "Start Workout" button | tap | → Gym Dashboard |
| Fitness Dashboard | Category card: Running | tap | *(unwired — no matching screen)* |
| Fitness Dashboard | Category card: Yoga | tap | → Yoga Dashboard |
| Fitness Dashboard | Category card: Gym | tap | → Gym Dashboard |
| Fitness Dashboard | Category card: Cycling | tap | *(unwired — no matching screen)* |
| Fitness Dashboard | Category card: Meditation | tap | → Meditation Dashboard |
| Fitness Dashboard | Category card: Dance | tap | *(unwired — no matching screen)* |
| Fitness Dashboard | Bottom nav: Home | tap | → Home Dashboard |
| Fitness Dashboard | Bottom nav: Health | tap | → Health Dashboard |
| Fitness Dashboard | Bottom nav: Discover | tap | → Discover |
| Fitness Dashboard | Bottom nav: Fitness / Profile | tap | *(active/self, unwired)* |
| **Family Dashboard** | Bottom nav: Health | tap | → Health Dashboard |
| Family Dashboard | Bottom nav: Family / Calendar / Timeline | tap | *(unwired — active/self or no matching screen)* |
| **Discover** | Bottom nav: Home | tap | → Home Dashboard |
| Discover | Bottom nav: Health | tap | → Health Dashboard |
| Discover | Bottom nav: Fitness | tap | → Fitness Dashboard |
| Discover | Bottom nav: Discover / Profile | tap | *(active/self, unwired)* |
| **Health Dashboard** | Hero "View Summary" button | tap | → Health Data Analytics |
| Health Dashboard | "AI Health Coach" card | tap | → AI Coach |
| Health Dashboard | "Vitamin D" medication reminder card | tap | → Medicine Alarm |
| Health Dashboard | Daily Wellness: Hydration tile | tap | → Hydration Dashboard |
| Health Dashboard | Daily Wellness: Sleep tile | tap | → Sleep Dashboard |
| Health Dashboard | Today's Vitals (Heart Rate/Oxygen/Pressure) | tap | *(display only, no navigation)* |
| Health Dashboard | Quick Health Tabs (Overview/Vitals/Medication/Reports) | tap | *(filter chips, unwired)* |
| Health Dashboard | Bottom nav: Home | tap | → Home Dashboard |
| Health Dashboard | Bottom nav: SOS | tap | → Emergency Assistance |
| Health Dashboard | Bottom nav: Daily / Profile | tap | *(unwired — no matching screen)* |
| **Medical Records** | Hero "Upload Report" button | tap | *(unwired — action, not navigation)* |
| Medical Records | Quick Access: "Lab Reports" | tap | → Lab Reports Hub |
| Medical Records | Quick Access: "Blood Test" | tap | → Blood Test Reports |
| Medical Records | Quick Access: "Vaccinations" | tap | → Vaccination Center |
| Medical Records | Quick Access: "Prescription" | tap | → Prescription Management |
| Medical Records | Bottom nav: Home | tap | → Home Dashboard |
| Medical Records | Bottom nav: Activity / Profile | tap | *(unwired — no matching screen)* |
| **Medication Center** | Medication list item | tap | → Medicine Alarm |
| Medication Center | Bottom nav: Home | tap | → Home Dashboard |
| Medication Center | Bottom nav: Health | tap | → Health Dashboard |
| Medication Center | Bottom nav: Fitness | tap | → Fitness Dashboard |
| Medication Center | Bottom nav: Meds | tap | *(active/self)* |
| **Emergency Assistance** | Bottom nav: Medical ID | tap | → Medical Records |
| Emergency Assistance | Bottom nav: Emergency / Contacts / Map | tap | *(active/self or unwired — no matching screen)* |
| **AI Coach** | Daily Focus: "Hydration" card | tap | → Hydration Dashboard |
| AI Coach | Daily Focus: "Exercise" card | tap | → Yoga Dashboard |
| AI Coach | Daily Focus: "Nutrition" card | tap | → Nutrition Dashboard |
| AI Coach | Daily Focus: "Medication" card | tap | → Medicine Alarm |
| AI Coach | "TAP TO SPEAK" voice button | tap | *(unwired — action, not navigation)* |
| AI Coach | Bottom nav: Health | tap | → Health Dashboard |
| AI Coach | Bottom nav: Coach / Challenges / Badges | tap | *(active/self or unwired)* |
| **Sleep Dashboard** | Bottom nav: Home | tap | → Home Dashboard |
| Sleep Dashboard | Bottom nav: Health | tap | → Health Dashboard |
| Sleep Dashboard | Bottom nav: Insights / Profile | tap | *(unwired — no matching screen)* |
| **Nutrition Dashboard** | Hero "Log Meal" button | tap | → Advanced Nutrition Dashboard |
| Nutrition Dashboard | "Today's Meals" card | tap | → Advanced Nutrition Dashboard |
| Nutrition Dashboard | "Water Tracker / Hydration" card | tap | → Hydration Dashboard |
| Nutrition Dashboard | Bottom nav: Home | tap | → Home Dashboard |
| Nutrition Dashboard | Bottom nav: Health | tap | → Health Dashboard |
| Nutrition Dashboard | Bottom nav: Log / Plans / Profile | tap | *(unwired — no matching screen)* |

### Module 3 — Medical Records detail

| Screen | Element | Action | Destination |
|---|---|---|---|
| **Health Data Analytics** | "View Detailed Report" button | tap | → Lab Reports Hub |
| Health Data Analytics | Bottom nav: Home | tap | → Home Dashboard |
| Health Data Analytics | Bottom nav: Categories | tap | → Medical Records |
| Health Data Analytics | Bottom nav: Health | tap | → Health Dashboard |
| Health Data Analytics | Bottom nav: Profile | tap | *(unwired)* |
| **Lab Reports Hub** | Bottom nav: Home | tap | → Home Dashboard |
| Lab Reports Hub | Bottom nav: Categories | tap | → Medical Records |
| Lab Reports Hub | Bottom nav: Health | tap | → Health Dashboard |
| Lab Reports Hub | Bottom nav: Profile | tap | *(unwired)* |
| **Doctor Advice** | Bottom nav: Home | tap | → Home Dashboard |
| Doctor Advice | Bottom nav: Health | tap | → Health Dashboard |
| Doctor Advice | Bottom nav: Together / Profile | tap | *(unwired — no matching screen)* |
| **Blood Test Reports** | Bottom nav: Home | tap | → Home Dashboard |
| Blood Test Reports | Bottom nav: Health | tap | → Health Dashboard |
| Blood Test Reports | Bottom nav: Together / Profile | tap | *(unwired)* |
| **Prescription Management** | Bottom nav: Home | tap | → Home Dashboard |
| Prescription Management | Bottom nav: Categories | tap | → Medical Records |
| Prescription Management | Bottom nav: Together (active) / Profile | tap | *(unwired)* |
| **Vaccination Center** | Bottom nav: Home | tap | → Home Dashboard |
| Vaccination Center | Bottom nav: Categories | tap | → Medical Records |
| Vaccination Center | Bottom nav: SOS | tap | → Emergency Assistance |
| Vaccination Center | Bottom nav: Together / Profile | tap | *(unwired)* |

### Module 4 — Fitness detail

| Screen | Element | Action | Destination |
|---|---|---|---|
| **Yoga Dashboard** | Bottom nav: Home | tap | → Home Dashboard |
| Yoga Dashboard | Bottom nav: Health | tap | → Health Dashboard |
| Yoga Dashboard | Bottom nav: Discover | tap | → Discover |
| Yoga Dashboard | Bottom nav: Fitness / Profile | tap | *(active/self, unwired)* |
| **Calories Dashboard** | Bottom nav: Home | tap | → Home Dashboard |
| Calories Dashboard | Bottom nav: Health | tap | → Health Dashboard |
| Calories Dashboard | Bottom nav: Log / Plans / Profile | tap | *(unwired)* |
| **Daily Steps Dashboard** | Bottom nav: Home | tap | → Home Dashboard |
| Daily Steps Dashboard | Bottom nav: Health | tap | → Health Dashboard |
| Daily Steps Dashboard | Bottom nav: Discover | tap | → Discover |
| Daily Steps Dashboard | Bottom nav: Fitness / Profile | tap | *(unwired)* |
| **Physiotherapy Dashboard** | Bottom nav: Home | tap | → Home Dashboard |
| Physiotherapy Dashboard | Bottom nav: Activity / Profile | tap | *(unwired — no matching screen)* |
| **Meditation Dashboard** | Bottom nav: Coach | tap | → AI Coach |
| Meditation Dashboard | Bottom nav: Health | tap | → Health Dashboard |
| Meditation Dashboard | Bottom nav: Challenges / Badges | tap | *(unwired)* |
| **Gym Dashboard** | Bottom nav: Home | tap | → Home Dashboard |
| Gym Dashboard | Bottom nav: Health | tap | → Health Dashboard |
| Gym Dashboard | Bottom nav: Fitness | tap | → Fitness Dashboard |
| Gym Dashboard | Bottom nav: Meds | tap | *(unwired — no matching context)* |

### Module 5 — Daily Health

| Screen | Element | Action | Destination |
|---|---|---|---|
| **Hydration Dashboard** | Bottom nav: Health | tap | → Health Dashboard |
| Hydration Dashboard | Bottom nav: Coaching | tap | → AI Coach |
| Hydration Dashboard | Bottom nav: Nutrition | tap | → Nutrition Dashboard |
| Hydration Dashboard | Bottom nav: Log / Profile | tap | *(unwired)* |
| **Weight Log Dashboard** | Bottom nav (all icons, unlabeled) | tap | *(unwired — no text evidence to safely map; not guessed)* |
| **Wellness Dashboard** | Bottom nav: Coaching | tap | → AI Coach |
| Wellness Dashboard | Bottom nav: Nutrition | tap | → Nutrition Dashboard |
| Wellness Dashboard | Bottom nav: Health (active) / Log / Profile | tap | *(unwired)* |
| **Advanced Nutrition Dashboard** | Bottom nav (all icons, unlabeled) | tap | *(unwired — same reasoning as Weight Log)* |

### Module 6 — Daily Care

*(All six screens share a consistent Health / History / Alarm / Reminders / Profile nav set.)*

| Screen | Element | Action | Destination |
|---|---|---|---|
| **Medicine Alarm** | "Review Schedule" button (AI Insight) | tap | → Smart Reminders |
| Medicine Alarm | Bottom nav: Health | tap | → Health Dashboard |
| Medicine Alarm | Bottom nav: History | tap | → Medicine History |
| Medicine Alarm | Bottom nav: Reminders | tap | → Smart Reminders |
| Medicine Alarm | Bottom nav: Alarm / Profile | tap | *(active/self, unwired)* |
| **Medicine History** | Bottom nav: Health | tap | → Health Dashboard |
| Medicine History | Bottom nav: Alarm | tap | → Medicine Alarm |
| Medicine History | Bottom nav: Reminders | tap | → Smart Reminders |
| Medicine History | Bottom nav: History / Profile | tap | *(active/self, unwired)* |
| **Smart Reminders** | Bottom nav: Health | tap | → Health Dashboard |
| Smart Reminders | Bottom nav: History | tap | → Medicine History |
| Smart Reminders | Bottom nav: Alarm | tap | → Medicine Alarm |
| Smart Reminders | Bottom nav: Reminders / Profile | tap | *(active/self, unwired)* |
| **Personal Hygiene** | Bottom nav: Health | tap | → Health Dashboard |
| Personal Hygiene | Bottom nav: History | tap | → Medicine History |
| Personal Hygiene | Bottom nav: Alarm | tap | → Medicine Alarm |
| Personal Hygiene | Bottom nav: Reminders | tap | → Smart Reminders |
| Personal Hygiene | Bottom nav: Profile | tap | *(unwired)* |
| **Health Precautions** | Bottom nav: Health | tap | → Health Dashboard |
| Health Precautions | Bottom nav: History | tap | → Medicine History |
| Health Precautions | Bottom nav: Alarm | tap | → Medicine Alarm |
| Health Precautions | Bottom nav: Reminders | tap | → Smart Reminders |
| Health Precautions | Bottom nav: Profile | tap | *(unwired)* |
| **Health Companion** | Hero "Start Session" button | tap | → AI Coach |
| Health Companion | "CONNECT" (AI Conversation card) | tap | → AI Coach |
| Health Companion | Mood selector (😢/😐/😊) | tap | *(selection only, no navigation)* |
| Health Companion | Daily Health Tips cards | tap | *(display only, no navigation)* |
| Health Companion | Bottom nav: Health | tap | → Health Dashboard |
| Health Companion | Bottom nav: History | tap | → Medicine History |
| Health Companion | Bottom nav: Alarm | tap | → Medicine Alarm |
| Health Companion | Bottom nav: Reminders | tap | → Smart Reminders |
| Health Companion | Bottom nav: Profile | tap | *(unwired)* |

---

## 5. Project Analytics

| Metric | Count |
|---|---|
| Total designed screens implemented | **44** |
| Modules | 6 (of 9 total; 3 not yet designed in Figma) |
| Total wired interactions (Figma prototype) | **143** |
| Approx. wired interactions by module | M1: 26 · M2: 29 · M3: 27 · M4: 18 · M5: 10 · M6: 24 *(+ pre-existing/derived reactions accounting for the remainder of 143)* |
| Intentionally unwired elements | ~45 (filter chips, self-referencing active tabs, and tabs/cards with no matching destination screen — see tables above) |
| React Native screen files | 44 (1:1 with Figma screens) |
| Shared components | 7 (`ScreenContainer`, `Button`, `Card`, `TopAppBar`, `BottomNav`, `StatTile`, plus barrel `index.ts`) |
| Reusable bottom-nav tab-set configs | 4 (`mainTabs`, `medicalTabs`, `careTabs`, `wellnessTabs`) — reduces duplication across ~30 screens that share a nav pattern |
| Navigation route names (typed) | 44 (`RootStackParamList`) |
| Theme token files | 3 (`colors.ts`, `typography.ts`, `spacing.ts`) |
| Total project files | 67 |
| Total project size (zipped) | ~54 KB (source only — no `node_modules`) |
| `get_design_context` calls used (design fidelity source) | 2 (Splash Screen, Home Dashboard) — deliberately limited to avoid re-hitting Figma's MCP rate limit |
| External dependencies | Expo SDK 51, React Navigation 6, NativeWind 2, @expo/vector-icons 14 |

**Screens-per-module distribution:**

```
Module 1 (Auth/Onboarding)  ███████████ 11
Module 2 (Main Dashboard)   ███████████ 11
Module 3 (Medical Records)  ██████       6
Module 4 (Fitness)          ██████       6
Module 5 (Daily Health)     ████         4
Module 6 (Daily Care)       ██████       6
```

**Navigation hub analysis:** Home Dashboard and Health Dashboard are the two most-connected
screens — every module is reachable from Home Dashboard within 1–2 taps, and Health Dashboard
is the shared "Health" bottom-nav destination from all 44 screens that have a Health tab
(effectively the app's most-linked-to screen, ~20+ inbound connections).

---

## 6. Implementation Notes

- **Why a flat stack, not tabs:** React Navigation's bottom-tab-navigator assumes one fixed tab
  set for the whole app. This Figma file intentionally varies its bottom nav per module (Main
  Dashboard uses Home/Health/Fitness/Discover/Profile; Daily Care uses
  Health/History/Alarm/Reminders/Profile; etc.). A single native stack + a custom `BottomNav`
  component per screen (fed by one of 4 reusable tab-set configs) reproduces this faithfully.
- **Why some elements are "unwired" in both Figma and code:** unwired items fall into three
  categories, and each was left alone deliberately rather than guessed:
  1. **Filter/selection controls** (category pills, gender selector, mood picker) — these change
     in-page state, not screen.
  2. **Active/self-referencing tabs** — the tab representing the screen you're already on.
  3. **No matching destination** — e.g. a "Cycling" or "Dance" workout card with no designed
     Cycling/Dance screen in the file, or icon-only nav buttons with no text label to infer
     intent from (Weight Log Dashboard, Advanced Nutrition Dashboard's own nav bars).
- **Design fidelity tradeoff:** colors/type/spacing were extracted from 2 real Figma screens and
  applied as a consistent system across all 44, rather than pulling exact `get_design_context`
  specs per screen. Structure and content (text, hierarchy, card labels) were verified against
  the Figma file for every screen during the earlier prototyping pass, but visual pixel-parity
  is not guaranteed screen-by-screen.
- **No backend:** all forms (Sign In, Create Account, Create Profile, OTP, etc.) are UI-only.
- **Fonts referenced but not bundled:** the theme references "Plus Jakarta Sans" and "Manrope"
  by name; the actual font files aren't included, so text currently falls back to the system
  font until `expo-font` is wired up.

---

## 7. Out of Scope

- **Modules 7–9** (Services Dashboard, Home Cleaning, Appliance Repair): these exist in the
  Figma file only as flat placeholder `RECTANGLE` nodes with an image fill — no layers, no
  buttons, no real screen structure. Neither the Figma prototype nor this codebase includes
  them; they need to be actually designed in Figma first.
- **Backend/API integration, real authentication, data persistence.**
- **Pixel-exact fidelity for all 44 screens** (see tradeoff above).

---

## 8. File Structure Reference

```
UrbanHelpersApp/
├── App.tsx                          Entry point — wraps RootNavigator
├── app.json                         Expo config
├── babel.config.js                  NativeWind + path-alias (@/) setup
├── tailwind.config.js               Design tokens as Tailwind theme
├── tsconfig.json
├── package.json
├── README.md                        Setup instructions + known gaps
├── PROJECT_DOCUMENTATION.md         This file
└── src/
    ├── theme/
    │   ├── colors.ts                 Palette extracted from Figma
    │   ├── typography.ts             Font families + type scale
    │   └── spacing.ts                Spacing + radius scale
    ├── navigation/
    │   ├── types.ts                  RootStackParamList (44 routes)
    │   ├── navTabs.ts                4 reusable bottom-nav tab-set configs
    │   └── RootNavigator.tsx         Native stack registering all 44 screens
    ├── components/
    │   ├── ScreenContainer.tsx       Safe-area + background wrapper
    │   ├── Button.tsx                Primary/secondary/ghost pill button
    │   ├── Card.tsx                  Rounded surface, light/dark
    │   ├── TopAppBar.tsx             Back button + title + optional action
    │   ├── BottomNav.tsx             Per-screen configurable tab bar
    │   ├── StatTile.tsx              Vitals/metric chip
    │   └── index.ts                  Barrel export
    └── screens/
        ├── auth/          (11 files — Module 1)
        ├── dashboard/      (11 files — Module 2)
        ├── medical/        (6 files — Module 3)
        ├── fitness/        (6 files — Module 4)
        ├── dailyhealth/    (4 files — Module 5)
        └── dailycare/      (6 files — Module 6)
```
