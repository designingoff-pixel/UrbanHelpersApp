# Urban Helpers — Complete Navigation Map
**All Screens + Every Navigation Path**
Version 2.0 | Generated: 2026-08-18

---

## Total Screen Count: **72 Screens**

| Module | Screens |
|---|---|
| Auth / Onboarding | 11 |
| Main Dashboard | 11 |
| Medical Records | 6 |
| Fitness | 6 |
| Daily Health | 4 |
| Daily Care | 6 |
| Services — Booking Flow | 9 |
| Services — Vendor Verification & Recording | 8 *(NEW)* |
| Profile | 1 |
| Notifications | 1 |
| **Total** | **63** *(app)* |

> Note: 9 recording/OTP screens added in this release. Total navigable routes: **200+**

---

## Module 1 — Auth / Onboarding (11 screens)

```
App Start
  └── Splash
        ├── [First launch] ──→ Welcome
        │     ├── ──→ OnboardingHealth
        │     │     └── ──→ OnboardingHomeServices
        │     │           └── ──→ OnboardingFamily
        │     │                 └── ──→ SignIn / CreateAccount
        │     └── ──→ SignIn (returning user)
        │
        └── [Returning user with token] ──→ HomeDashboard
```

### Screens
| # | Screen Name | Route Key | Navigates To |
|---|---|---|---|
| 1 | Splash | `Splash` | `Welcome`, `HomeDashboard` |
| 2 | Welcome | `Welcome` | `OnboardingHealth`, `SignIn`, `CreateAccount` |
| 3 | Onboarding Health | `OnboardingHealth` | `OnboardingHomeServices` |
| 4 | Onboarding Home Services | `OnboardingHomeServices` | `OnboardingFamily` |
| 5 | Onboarding Family | `OnboardingFamily` | `SignIn`, `CreateAccount` |
| 6 | Sign In | `SignIn` | `HomeDashboard`, `CreateAccount`, `ForgotPassword`, `OTPVerification` |
| 7 | Create Account | `CreateAccount` | `OTPVerification`, `SignIn` |
| 8 | OTP Verification | `OTPVerification` | `CreateProfile`, `SignIn` |
| 9 | Create Profile | `CreateProfile` | `SystemPermissions` |
| 10 | System Permissions | `SystemPermissions` | `HomeDashboard` |
| 11 | Forgot Password | `ForgotPassword` | `SignIn` |

---

## Module 2 — Main Dashboard (11 screens)

```
HomeDashboard (hub)
  ├── Bottom Tab: Health ──→ HealthDashboard
  ├── Bottom Tab: Fitness ──→ FitnessDashboard
  ├── Bottom Tab: Discover ──→ Discover
  ├── Bottom Tab: Profile ──→ Profile
  ├── Notification Bell ──→ Notifications
  │
  ├── Feature Card: Medical ──→ MedicalRecords
  ├── Feature Card: Medication ──→ MedicationCenter
  ├── Feature Card: Family ──→ FamilyDashboard
  ├── Feature Card: AI Coach ──→ AICoach
  ├── Feature Card: Emergency ──→ EmergencyAssistance
  ├── Feature Card: Nutrition ──→ NutritionDashboard
  ├── Feature Card: Sleep ──→ SleepDashboard
  └── Quick Action: Book Service ──→ ServicesDashboard
```

### Screens
| # | Screen Name | Route Key | Navigates To |
|---|---|---|---|
| 12 | Home Dashboard | `HomeDashboard` | All below + `ServicesDashboard`, `Notifications`, `Profile` |
| 13 | Health Dashboard | `HealthDashboard` | `BloodTestReports`, `DoctorAdvice`, `LabReportsHub`, `PrescriptionManagement`, `VaccinationCenter`, `HealthDataAnalytics` |
| 14 | Fitness Dashboard | `FitnessDashboard` | `DailyStepsDashboard`, `CaloriesDashboard`, `YogaDashboard`, `GymDashboard`, `MeditationDashboard`, `PhysiotherapyDashboard` |
| 15 | Family Dashboard | `FamilyDashboard` | `Profile`, `HomeDashboard` |
| 16 | Discover | `Discover` | `ServicesDashboard`, External articles |
| 17 | Medical Records | `MedicalRecords` | `BloodTestReports`, `DoctorAdvice`, `LabReportsHub`, `PrescriptionManagement`, `VaccinationCenter` |
| 18 | Medication Center | `MedicationCenter` | `MedicalRecords`, `HomeDashboard` |
| 19 | Emergency Assistance | `EmergencyAssistance` | `ServicesDashboard` (Emergency category), `HomeDashboard` |
| 20 | AI Coach | `AICoach` | `HomeDashboard` |
| 21 | Sleep Dashboard | `SleepDashboard` | `HomeDashboard` |
| 22 | Nutrition Dashboard | `NutritionDashboard` | `CaloriesDashboard`, `HomeDashboard` |

---

## Module 3 — Medical Records (6 screens)

```
HealthDashboard / MedicalRecords
  ├── ──→ BloodTestReports
  ├── ──→ DoctorAdvice
  ├── ──→ HealthDataAnalytics
  ├── ──→ LabReportsHub
  ├── ──→ PrescriptionManagement
  └── ──→ VaccinationCenter
```

### Screens
| # | Screen Name | Route Key | Navigates To |
|---|---|---|---|
| 23 | Blood Test Reports | `BloodTestReports` | `LabReportsHub`, Back |
| 24 | Doctor Advice | `DoctorAdvice` | `PrescriptionManagement`, Back |
| 25 | Health Data Analytics | `HealthDataAnalytics` | Back |
| 26 | Lab Reports Hub | `LabReportsHub` | `BloodTestReports`, Back |
| 27 | Prescription Management | `PrescriptionManagement` | `MedicationCenter`, Back |
| 28 | Vaccination Center | `VaccinationCenter` | Back |

---

## Module 4 — Fitness (6 screens)

```
FitnessDashboard
  ├── ──→ DailyStepsDashboard
  ├── ──→ CaloriesDashboard
  ├── ──→ YogaDashboard
  ├── ──→ GymDashboard
  ├── ──→ MeditationDashboard
  └── ──→ PhysiotherapyDashboard
```

### Screens
| # | Screen Name | Route Key | Navigates To |
|---|---|---|---|
| 29 | Daily Steps Dashboard | `DailyStepsDashboard` | `FitnessDashboard` |
| 30 | Calories Dashboard | `CaloriesDashboard` | `NutritionDashboard`, `FitnessDashboard` |
| 31 | Yoga Dashboard | `YogaDashboard` | `FitnessDashboard` |
| 32 | Gym Dashboard | `GymDashboard` | `FitnessDashboard` |
| 33 | Meditation Dashboard | `MeditationDashboard` | `SleepDashboard`, `FitnessDashboard` |
| 34 | Physiotherapy Dashboard | `PhysiotherapyDashboard` | `FitnessDashboard` |

---

## Module 5 — Daily Health (4 screens)

```
HomeDashboard (via bottom tab / card)
  ├── ──→ HydrationDashboard
  ├── ──→ WeightLogDashboard
  ├── ──→ WellnessDashboard
  └── ──→ AdvancedNutritionDashboard
```

### Screens
| # | Screen Name | Route Key | Navigates To |
|---|---|---|---|
| 35 | Hydration Dashboard | `HydrationDashboard` | `HomeDashboard` |
| 36 | Weight Log Dashboard | `WeightLogDashboard` | `HomeDashboard` |
| 37 | Wellness Dashboard | `WellnessDashboard` | `HomeDashboard` |
| 38 | Advanced Nutrition Dashboard | `AdvancedNutritionDashboard` | `NutritionDashboard` |

---

## Module 6 — Daily Care (6 screens)

```
HomeDashboard (via card)
  ├── ──→ MedicineAlarm
  ├── ──→ MedicineHistory
  ├── ──→ SmartReminders
  ├── ──→ PersonalHygiene
  ├── ──→ HealthPrecautions
  └── ──→ HealthCompanion
```

### Screens
| # | Screen Name | Route Key | Navigates To |
|---|---|---|---|
| 39 | Medicine Alarm | `MedicineAlarm` | `MedicineHistory`, `MedicationCenter` |
| 40 | Medicine History | `MedicineHistory` | `MedicineAlarm` |
| 41 | Smart Reminders | `SmartReminders` | `HomeDashboard` |
| 42 | Personal Hygiene | `PersonalHygiene` | `HomeDashboard` |
| 43 | Health Precautions | `HealthPrecautions` | `EmergencyAssistance`, `HomeDashboard` |
| 44 | Health Companion | `HealthCompanion` | `AICoach`, `HomeDashboard` |

---

## Module 7 — Services Booking Flow (9 screens)

```
HomeDashboard / ServicesDashboard
  └── ──→ ServicesDashboard
        └── [Select Category] ──→ ServiceCategory
              └── [Select Sub-Service] ──→ ServiceDetail
                    └── [Confirm Booking] ──→ BookingConfirmed
                          └── [Track / Vendor Arrives] ──→ YourHelperHasArrived (Module 8)
                    (Also: ServiceDetail → HomeCleaning for cleaning deep-dive)
```

### Screens
| # | Screen Name | Route Key | Params | Navigates To |
|---|---|---|---|---|
| 45 | Services Dashboard | `ServicesDashboard` | — | `ServiceCategory`, `Notifications`, `Profile`, `HomeDashboard`, `EmergencyAssistance` |
| 46 | Service Category | `ServiceCategory` | `{ categoryId }` | `ServiceDetail` (×N sub-services) |
| 47 | Service Detail | `ServiceDetail` | `{ categoryId, subServiceId }` | `BookingConfirmed`, `Notifications` |
| 48 | Booking Confirmed | `BookingConfirmed` | `{ categoryId, subServiceId, dayIndex, slotIndex }` | `YourHelperHasArrived`, `ServicesDashboard`, `HomeDashboard` |
| 49 | Live Tracking | `LiveTracking` | `{ categoryId?, subServiceId? }` | `YourHelperHasArrived`, `ServicesDashboard` |
| 50 | Service In Progress | `ServiceInProgress` | `{ categoryId?, subServiceId? }` | `RecordingInProgress`, `ServiceCompleted` |
| 51 | Service Completed | `ServiceCompleted` | `{ categoryId?, subServiceId? }` | `ServiceSummary`, `RatingFeedback`, `ServicesDashboard` |
| 52 | Rating & Feedback | `RatingFeedback` | `{ categoryId?, subServiceId? }` | `ServiceSummary`, `ServicesDashboard` |
| 53 | Home Cleaning | `HomeCleaning` | — | `ServiceDetail`, `ServicesDashboard` |

---

## Module 8 — Vendor Verification & Recording (8 NEW screens)

> **This is the new flow added in this release.**
> Triggered after `BookingConfirmed` → vendor arrives.

### Complete Flow Diagram

```
BookingConfirmed
  └── [Helper Arrives / Track Booking] ──→ YourHelperHasArrived
        │  (Shows vendor profile, arrival status, booking details)
        │
        └── [Verify & Start Service] ──→ VerifyYourHelper
              │  (4-digit OTP input, timer countdown)
              │
              └── [OTP Correct] ──→ HelperVerified  ← ─ ─ ─ ─ ─ ─ ─ ─ ┐
              │    (Animated success, vendor card)                         │
              │    └── [Continue] ──→ ServiceRecordingConsent             │
              │          │  (Benefits info, consent checkbox)             │
              │          │                                                │
              │          ├── [Start Recording] ──→ RecordingInProgress   │
              │          │     │  (Live timer, vendor card, rings anim)   │
              │          │     ├── [Pause] ──→ RecordingPaused            │
              │          │     │     └── [Resume] ──────────────────────→┘
              │          │     │     └── [End Service] ──→ EndServiceRecording
              │          │     │                              └── [Confirm End] ──→ ServiceCompleted
              │          │     └── [End Service] ──→ EndServiceRecording
              │          │                            └── [Confirm End] ──→ ServiceCompleted
              │          │                                                      └── [Review] ──→ ServiceSummary
              │          │
              │          └── [Skip Recording] ──→ RecordingInProgress (no recording)
              │                                       └── [End] ──→ ServiceCompleted
              │                                                         └── ──→ ServiceSummary
              │
              └── [OTP Wrong] ──→ VerifyYourHelper (error state, retry)
```

### Screens
| # | Screen Name | Route Key | Params | Navigates To |
|---|---|---|---|---|
| 54 | Your Helper Has Arrived | `YourHelperHasArrived` | `{ bookingId, vendorId }` | `VerifyYourHelper`, `ServicesDashboard` |
| 55 | Verify Your Helper | `VerifyYourHelper` | `{ bookingId, vendorId }` | `HelperVerified` (success), stays on error |
| 56 | Helper Verified | `HelperVerified` | `{ bookingId, vendorId }` | `ServiceRecordingConsent` |
| 57 | Service Recording Consent | `ServiceRecordingConsent` | `{ bookingId, vendorId }` | `RecordingInProgress` (with/without recording) |
| 58 | Recording In Progress | `RecordingInProgress` | `{ bookingId, vendorId }` | `RecordingPaused`, `EndServiceRecording` |
| 59 | Recording Paused | `RecordingPaused` | `{ bookingId, vendorId }` | `RecordingInProgress` (resume), `EndServiceRecording` |
| 60 | End Service Recording | `EndServiceRecording` | `{ bookingId, vendorId }` | `ServiceCompleted` (confirm), back (cancel) |
| 61 | Service Summary | `ServiceSummary` | `{ bookingId, vendorId }` | `ServicesDashboard` (book again) |

---

## Module 9 — Profile (1 screen)

```
Any screen (via avatar icon or bottom tab)
  └── ──→ Profile
        ├── Edit profile info
        ├── My Bookings ──→ BookingConfirmed / ServiceSummary
        ├── Payment Methods
        ├── Settings
        ├── Help & Support
        ├── Terms & Conditions
        ├── Privacy Policy
        └── Logout ──→ SignIn
```

### Screens
| # | Screen Name | Route Key | Navigates To |
|---|---|---|---|
| 62 | Profile | `Profile` | `SignIn` (logout), `ServiceSummary`, `HomeDashboard` |

---

## Module 10 — Notifications (1 screen)

```
Any screen (via bell icon)
  └── ──→ Notifications
        └── Tap notification ──→ Relevant screen (BookingConfirmed, ServiceDetail, etc.)
```

### Screens
| # | Screen Name | Route Key | Navigates To |
|---|---|---|---|
| 63 | Notifications | `Notifications` | `BookingConfirmed`, `ServiceDetail`, `HomeDashboard` |

---

## Full Alphabetical Screen Index

| # | Screen | Route Key | Module |
|---|---|---|---|
| 1 | Advanced Nutrition Dashboard | `AdvancedNutritionDashboard` | Daily Health |
| 2 | AI Coach | `AICoach` | Dashboard |
| 3 | Blood Test Reports | `BloodTestReports` | Medical |
| 4 | Booking Confirmed | `BookingConfirmed` | Services |
| 5 | Calories Dashboard | `CaloriesDashboard` | Fitness |
| 6 | Create Account | `CreateAccount` | Auth |
| 7 | Create Profile | `CreateProfile` | Auth |
| 8 | Daily Steps Dashboard | `DailyStepsDashboard` | Fitness |
| 9 | Discover | `Discover` | Dashboard |
| 10 | Doctor Advice | `DoctorAdvice` | Medical |
| 11 | Emergency Assistance | `EmergencyAssistance` | Dashboard |
| 12 | End Service Recording | `EndServiceRecording` | Recording *(NEW)* |
| 13 | Family Dashboard | `FamilyDashboard` | Dashboard |
| 14 | Fitness Dashboard | `FitnessDashboard` | Dashboard |
| 15 | Forgot Password | `ForgotPassword` | Auth |
| 16 | Gym Dashboard | `GymDashboard` | Fitness |
| 17 | Health Companion | `HealthCompanion` | Daily Care |
| 18 | Health Dashboard | `HealthDashboard` | Dashboard |
| 19 | Health Data Analytics | `HealthDataAnalytics` | Medical |
| 20 | Health Precautions | `HealthPrecautions` | Daily Care |
| 21 | Helper Verified | `HelperVerified` | Recording *(NEW)* |
| 22 | Home Cleaning | `HomeCleaning` | Services |
| 23 | Home Dashboard | `HomeDashboard` | Dashboard |
| 24 | Hydration Dashboard | `HydrationDashboard` | Daily Health |
| 25 | Lab Reports Hub | `LabReportsHub` | Medical |
| 26 | Live Tracking | `LiveTracking` | Services |
| 27 | Meditation Dashboard | `MeditationDashboard` | Fitness |
| 28 | Medication Center | `MedicationCenter` | Dashboard |
| 29 | Medicine Alarm | `MedicineAlarm` | Daily Care |
| 30 | Medicine History | `MedicineHistory` | Daily Care |
| 31 | Medical Records | `MedicalRecords` | Dashboard |
| 32 | Notifications | `Notifications` | Notifications |
| 33 | Nutrition Dashboard | `NutritionDashboard` | Dashboard |
| 34 | Onboarding Family | `OnboardingFamily` | Auth |
| 35 | Onboarding Health | `OnboardingHealth` | Auth |
| 36 | Onboarding Home Services | `OnboardingHomeServices` | Auth |
| 37 | OTP Verification | `OTPVerification` | Auth |
| 38 | Personal Hygiene | `PersonalHygiene` | Daily Care |
| 39 | Physiotherapy Dashboard | `PhysiotherapyDashboard` | Fitness |
| 40 | Prescription Management | `PrescriptionManagement` | Medical |
| 41 | Profile | `Profile` | Profile |
| 42 | Rating & Feedback | `RatingFeedback` | Services |
| 43 | Recording In Progress | `RecordingInProgress` | Recording *(NEW)* |
| 44 | Recording Paused | `RecordingPaused` | Recording *(NEW)* |
| 45 | Service Category | `ServiceCategory` | Services |
| 46 | Service Completed | `ServiceCompleted` | Services |
| 47 | Service Detail | `ServiceDetail` | Services |
| 48 | Service In Progress | `ServiceInProgress` | Services |
| 49 | Service Recording Consent | `ServiceRecordingConsent` | Recording *(NEW)* |
| 50 | Service Summary | `ServiceSummary` | Recording *(NEW)* |
| 51 | Services Dashboard | `ServicesDashboard` | Services |
| 52 | Sign In | `SignIn` | Auth |
| 53 | Sleep Dashboard | `SleepDashboard` | Dashboard |
| 54 | Smart Reminders | `SmartReminders` | Daily Care |
| 55 | Splash | `Splash` | Auth |
| 56 | System Permissions | `SystemPermissions` | Auth |
| 57 | Vaccination Center | `VaccinationCenter` | Medical |
| 58 | Verify Your Helper | `VerifyYourHelper` | Recording *(NEW)* |
| 59 | Weight Log Dashboard | `WeightLogDashboard` | Daily Health |
| 60 | Welcome | `Welcome` | Auth |
| 61 | Wellness Dashboard | `WellnessDashboard` | Daily Health |
| 62 | Yoga Dashboard | `YogaDashboard` | Fitness |
| 63 | Your Helper Has Arrived | `YourHelperHasArrived` | Recording *(NEW)* |

---

## Key Navigation Rules

1. **Global Access** — These screens are reachable from anywhere:
   - `Profile` (avatar icon in header)
   - `Notifications` (bell icon in header)
   - `ServicesDashboard` (via HomeDashboard quick action)
   - `EmergencyAssistance` (via HomeDashboard card or bottom nav)

2. **Back Navigation** — All screens support:
   - Hardware back button (Android)
   - Back arrow in top-left header
   - Swipe-back gesture (iOS)

3. **Tab Navigation Contexts:**
   - `HomeDashboard` tab bar: Home | Health | Fitness | Discover | Profile
   - `ServicesDashboard` tab bar: Home | Services | Bookings | Offers | Profile
   - Medical tabs: used within Health module

4. **Deep Link Targets** (for push notifications):
   - `BookingConfirmed?bookingId=UH-20481`
   - `YourHelperHasArrived?bookingId=UH-20481&vendorId=vendor-001`
   - `ServiceDetail?categoryId=cleaning&subServiceId=cl-full`
   - `LiveTracking?bookingId=UH-20481`

5. **Recording Flow Lock** — Once `RecordingInProgress` starts:
   - Back button shows `EndServiceRecording` confirmation
   - Cannot skip to unrelated screens without ending service

---

## Navigation Stack Type Reference (`types.ts`)

```typescript
// Auth
Splash: undefined
Welcome: undefined
SignIn: undefined
CreateAccount: undefined
CreateProfile: undefined
OTPVerification: undefined
ForgotPassword: undefined
SystemPermissions: undefined
OnboardingHealth: undefined
OnboardingHomeServices: undefined
OnboardingFamily: undefined

// Dashboard
HomeDashboard: undefined
FitnessDashboard: undefined
FamilyDashboard: undefined
Discover: undefined
HealthDashboard: undefined
MedicalRecords: undefined
MedicationCenter: undefined
EmergencyAssistance: undefined
AICoach: undefined
SleepDashboard: undefined
NutritionDashboard: undefined

// Medical
HealthDataAnalytics: undefined
LabReportsHub: undefined
DoctorAdvice: undefined
BloodTestReports: undefined
PrescriptionManagement: undefined
VaccinationCenter: undefined

// Fitness
YogaDashboard: undefined
CaloriesDashboard: undefined
DailyStepsDashboard: undefined
PhysiotherapyDashboard: undefined
MeditationDashboard: undefined
GymDashboard: undefined

// Daily Health
HydrationDashboard: undefined
WeightLogDashboard: undefined
WellnessDashboard: undefined
AdvancedNutritionDashboard: undefined

// Daily Care
MedicineAlarm: undefined
MedicineHistory: undefined
SmartReminders: undefined
PersonalHygiene: undefined
HealthPrecautions: undefined
HealthCompanion: undefined

// Profile & Notifications
Profile: undefined
Notifications: undefined

// Services — Booking Flow
ServicesDashboard: undefined
ServiceCategory: { categoryId: string }
ServiceDetail: { categoryId: string; subServiceId: string }
BookingConfirmed: { categoryId: string; subServiceId: string; dayIndex: number; slotIndex: number }
LiveTracking: { categoryId?: string; subServiceId?: string }
ServiceInProgress: { categoryId?: string; subServiceId?: string }
ServiceCompleted: { categoryId?: string; subServiceId?: string }
RatingFeedback: { categoryId?: string; subServiceId?: string }
HomeCleaning: undefined

// Services — Recording & OTP (NEW)
YourHelperHasArrived: { bookingId: string; vendorId: string }
VerifyYourHelper: { bookingId: string; vendorId: string }
HelperVerified: { bookingId: string; vendorId: string }
ServiceRecordingConsent: { bookingId: string; vendorId: string }
RecordingInProgress: { bookingId: string; vendorId: string }
RecordingPaused: { bookingId: string; vendorId: string }
EndServiceRecording: { bookingId: string; vendorId: string }
ServiceSummary: { bookingId: string; vendorId: string }
```

---

*End of Navigation Map. 63 screens, 200+ navigation routes.*
*Updated for Urban Helpers v2.0 with Recording & OTP Vendor Verification.*
