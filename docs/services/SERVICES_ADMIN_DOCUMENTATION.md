# Urban Helpers — Services Module Documentation
**For Admin Web Panel Development**
Version 2.0 | Generated: 2026-08-18

---

## Overview

Urban Helpers offers **10 service categories** with **65+ bookable sub-services**. Every booking goes through a **vendor verification + optional recording flow** before service starts.

---

## Service Categories & Full Catalogue

---

### 1. 🚰 RO Service
**Category ID:** `ro`
**Tagline:** Pure water, every drop
**Gradient:** `#0284c7` → `#38bdf8`
**Accent Color:** `#38bdf8`
**Total Sub-Services:** 7

| Sub-Service ID | Name | Price | Duration | Popular |
|---|---|---|---|---|
| `ro-filter` | Filter Change | ₹399 | 45 min | ✅ |
| `ro-clean` | RO Cleaning | ₹299 | 60 min | |
| `ro-new` | New RO System | ₹5,999 | 2 hrs | |
| `ro-monthly` | Monthly Maintenance | ₹199 | 30 min | |
| `ro-shift` | RO Shifting | ₹349 | 90 min | |
| `ro-leak` | Leakage Repair | ₹249 | 45 min | |
| `ro-tds` | TDS Checking | ₹99 | 20 min | |

**Admin Fields Required:**
- Vendor skill tags: `plumbing`, `water-purifier`, `ro-technician`
- Required tools: Filter set, TDS meter, spanner kit
- Service zone: Home / Office
- Advance booking required: No (same-day available)

---

### 2. 🐾 Pet Care
**Category ID:** `pet`
**Tagline:** Love them the right way
**Gradient:** `#db2777` → `#f472b6`
**Accent Color:** `#f472b6`
**Total Sub-Services:** 7

| Sub-Service ID | Name | Price | Duration | Popular |
|---|---|---|---|---|
| `pet-bath` | Pet Bathing | ₹399 | 45 min | |
| `pet-groom` | Pet Grooming | ₹599 | 90 min | ✅ |
| `pet-walk` | Pet Walking | ₹149 | 30 min | |
| `pet-train` | Pet Training | ₹999 | 60 min | |
| `pet-hostel` | Pet Hostel | ₹499/day | 24 hrs | |
| `pet-hospital` | Pet Hospital | ₹199 | Varies | |
| `pet-emer` | Pet Emergency | ₹0 (call) | ASAP | |

**Admin Fields Required:**
- Vendor skill tags: `grooming`, `pet-handling`, `veterinary-basic`
- Pet types handled: Dog, Cat, Bird, Rabbit
- Emergency availability: 24/7
- Special notes: Pet emergency is free dispatch call only

---

### 3. 🐛 Pest Control
**Category ID:** `pest`
**Tagline:** Your home, pest-free
**Gradient:** `#15803d` → `#4ade80`
**Accent Color:** `#4ade80`
**Total Sub-Services:** 6

| Sub-Service ID | Name | Price | Duration | Popular |
|---|---|---|---|---|
| `pest-cock` | Anti-Cockroach | ₹499 | 60 min | ✅ |
| `pest-liz` | Anti-Lizard | ₹399 | 45 min | |
| `pest-term` | Anti-Termite | ₹1,499 | 3 hrs | |
| `pest-rodent` | Anti-Rodent | ₹699 | 90 min | |
| `pest-bug` | Anti-Bed Bug | ₹999 | 2 hrs | |
| `pest-snake` | Snake Rescue | ₹299 | 30 min | |

**Admin Fields Required:**
- Vendor skill tags: `pest-control`, `chemical-handling`, `wildlife-rescue`
- Chemical safety certification: Required
- Post-service re-entry time: 2 hrs (chemical), immediate (gel)
- Warranty: Anti-Termite carries 1-year warranty

---

### 4. 🌱 Horticulture
**Category ID:** `hort`
**Tagline:** Grow green, live better
**Gradient:** `#065f46` → `#34d399`
**Accent Color:** `#34d399`
**Total Sub-Services:** 7

| Sub-Service ID | Name | Price | Duration | Popular |
|---|---|---|---|---|
| `hort-setup` | Terrace Garden Setup | ₹2,999 | Half day | ✅ |
| `hort-plant` | Plantation | ₹999 | 2 hrs | |
| `hort-manure` | Organic Manures | ₹499 | 1 hr | |
| `hort-advice` | Planting Advice | ₹199 | 45 min | |
| `hort-med` | Medicinal Plants Setup | ₹1,499 | 3 hrs | |
| `hort-shed` | Plantation Shed Setup | ₹3,999 | 1 day | |
| `hort-veg` | Vegetable Pot Setup | ₹799 | 2 hrs | |

**Admin Fields Required:**
- Vendor skill tags: `gardening`, `landscaping`, `plant-care`
- Material supply: Vendor brings pots, soil, plants unless customer requests custom
- Season availability: All seasons; summer pricing may vary

---

### 5. 🚴 Delivery
**Category ID:** `delivery`
**Tagline:** Everything at your doorstep
**Gradient:** `#7c3aed` → `#a78bfa`
**Accent Color:** `#a78bfa`
**Total Sub-Services:** 6

| Sub-Service ID | Name | Price | Duration | Popular |
|---|---|---|---|---|
| `del-med` | Medicine Delivery | ₹29 | 2 hrs | ✅ |
| `del-veg` | Vegetable Delivery | ₹19 | 3 hrs | |
| `del-food` | Food Delivery | ₹39 | 45 min | |
| `del-grocery` | Grocery Delivery | ₹29 | 2 hrs | |
| `del-equip` | Equipment Delivery | ₹99 | Same day | |
| `del-diet` | Diet Food Delivery | ₹149 | Daily | |

**Admin Fields Required:**
- Vendor type: Delivery partner (different from service vendor)
- Delivery radius: Configurable per city (default 10 km)
- Prescription required: Yes for Schedule H medicines
- Diet food: Requires kitchen partner integration

---

### 6. ⚡ Appliance Cleaning
**Category ID:** `appliance`
**Tagline:** Clean machines, clean home
**Gradient:** `#b45309` → `#fbbf24`
**Accent Color:** `#fbbf24`
**Total Sub-Services:** 11

| Sub-Service ID | Name | Price | Duration | Popular |
|---|---|---|---|---|
| `app-bed` | Bed Cleaning | ₹699 | 90 min | |
| `app-sofa` | Sofa Cleaning | ₹799 | 2 hrs | ✅ |
| `app-curtain` | Curtain Cleaning | ₹499 | 1 hr | |
| `app-wardrobe` | Wardrobe Cleaning | ₹399 | 60 min | |
| `app-dining` | Dining Table Cleaning | ₹299 | 30 min | |
| `app-fridge` | Refrigerator Cleaning | ₹499 | 60 min | |
| `app-ac` | AC Cleaning | ₹599 | 90 min | |
| `app-fan` | Fan Cleaning | ₹149 | 20 min | |
| `app-tv` | TV Cleaning | ₹199 | 20 min | |
| `app-stove` | Gas Stove Cleaning | ₹299 | 45 min | |
| `app-chimney` | Chimney Cleaning | ₹699 | 90 min | |

**Admin Fields Required:**
- Vendor skill tags: `cleaning`, `appliance-care`, `ac-service`
- Equipment brought by vendor: Steam cleaner, vacuum, cleaning solutions
- Pre-service requirement: Clear space around appliance

---

### 7. 👨‍⚕️ Home Care
**Category ID:** `homecare`
**Tagline:** Caring hands at home
**Gradient:** `#0e7490` → `#22d3ee`
**Accent Color:** `#22d3ee`
**Total Sub-Services:** 4

| Sub-Service ID | Name | Price | Duration | Popular |
|---|---|---|---|---|
| `hc-day` | Day Care | ₹599/day | 8 hrs | |
| `hc-maid` | Maid Service | ₹399/day | 4 hrs | ✅ |
| `hc-nurse` | Nurse Care | ₹1,199/day | 12 hrs | |
| `hc-elderly` | Elderly Care | ₹799/day | 8 hrs | |

**Admin Fields Required:**
- Vendor type: Caregiver (separate certification track)
- Background verification: Mandatory (police clearance)
- Gender preference: Customer can specify
- Recurring booking: Supported (daily/weekly)

---

### 8. 🛡️ Insurance
**Category ID:** `insurance`
**Tagline:** Protect what matters most
**Gradient:** `#1e3a8a` → `#60a5fa`
**Accent Color:** `#60a5fa`
**Total Sub-Services:** 4

| Sub-Service ID | Name | Price | Duration | Popular |
|---|---|---|---|---|
| `ins-health` | Health Insurance | Get quote | 15 min | ✅ |
| `ins-life` | Life Insurance | Get quote | 15 min | |
| `ins-vehicle` | Vehicle Insurance | Get quote | 10 min | |
| `ins-general` | General Insurance | Get quote | 10 min | |

**Admin Fields Required:**
- Partner: Insurance aggregator API integration required
- Vendor type: IRDAI licensed advisor
- Quote engine: Third-party API (Policybazaar / Cover Fox)
- Commission structure: % of premium per policy sold

---

### 9. 🚨 Emergency
**Category ID:** `emergency`
**Tagline:** Help in seconds, not minutes
**Gradient:** `#7f1d1d` → `#ef4444`
**Accent Color:** `#ef4444`
**Total Sub-Services:** 5

| Sub-Service ID | Name | Price | Duration | Popular |
|---|---|---|---|---|
| `em-amb` | Ambulance Service | ₹0 (call) | ASAP | ✅ |
| `em-road` | Roadside Assistance | ₹499 | 30 min | |
| `em-women` | Women Helpline | ₹0 (call) | ASAP | |
| `em-child` | Child Protection | ₹0 (call) | ASAP | |
| `em-precaution` | Precaution Service | ₹199 | 1 hr | |

**Admin Fields Required:**
- Dispatch system: Real-time GPS dispatch required
- Government tie-up: 108 ambulance integration
- Free services: Ambulance, Women Helpline, Child Protection are zero-cost dispatch
- SLA: Response within 8 minutes in city limits

---

### 10. 🧹 Home Cleaning
**Category ID:** `cleaning`
**Tagline:** Spotless home, happy life
**Gradient:** `#00bcd4` → `#0097a7`
**Accent Color:** `#00bcd4`
**Total Sub-Services:** 11

| Sub-Service ID | Name | Price | Duration | Popular |
|---|---|---|---|---|
| `cl-full` | Full Home Cleaning | ₹1,999 | 5 hrs | ✅ |
| `cl-kitchen` | Kitchen Cleaning | ₹699 | 2 hrs | |
| `cl-restroom` | Restroom Cleaning | ₹399 | 60 min | |
| `cl-tank` | Water Tank Cleaning | ₹799 | 2 hrs | |
| `cl-appliance` | Appliances Cleaning | ₹599 | 90 min | |
| `cl-window` | Window Cleaning | ₹349 | 60 min | |
| `cl-fan` | Fan Cleaning | ₹149 | 20 min | |
| `cl-sofa` | Sofa Cleaning | ₹799 | 2 hrs | |
| `cl-floor` | Floor Cleaning | ₹499 | 90 min | |
| `cl-sanitary` | Sanitary & Waste Mgmt | ₹299 | 45 min | |
| `cl-disinfect` | Disinfectant Service | ₹999 | 2 hrs | |

**Admin Fields Required:**
- Vendor skill tags: `cleaning`, `deep-clean`, `disinfection`
- Team size: 1–4 cleaners depending on service
- Supplies: Vendor brings all cleaning materials

---

## Booking Flow (Customer Journey)

```
1. Browse ServicesDashboard
   └── Select Category
       └── Select Sub-Service
           └── Choose Date + Time Slot
               └── Enter Address
                   └── Confirm Booking
                       │
                       ▼
2. Booking Confirmed (BookingID generated)
   └── Vendor Assigned by Admin/System
       └── Vendor En Route (LiveTracking)
           └── Your Helper Has Arrived
               │
               ▼
3. OTP Verification (Customer verifies vendor)
   └── Customer enters 4-digit OTP
       └── OTP Valid → HelperVerified
           └── Recording Consent Screen
               │
               ▼
4. Service Execution
   └── (With Recording) RecordingInProgress
   │   ├── Pause → RecordingPaused
   │   └── End → EndServiceRecording
   └── (Without Recording) Service in Progress
               │
               ▼
5. Service Completed
   └── ServiceCompleted Screen
       └── Rating & Review
           └── ServiceSummary (with recording playback)
```

---

## Vendor Verification & OTP System

### How It Works

1. When vendor arrives at customer location, **vendor's app shows a 4-digit OTP**
2. Customer opens **"Your Helper Has Arrived"** screen (auto-triggered by GPS proximity)
3. Customer taps **"Verify & Start Service"** → enters OTP from vendor
4. System validates OTP against booking session
5. On success → **"Helper Verified"** screen → proceeds to recording consent

### OTP Specifications
| Property | Value |
|---|---|
| Length | 4 digits |
| Expiry | 3 minutes (180 seconds) |
| Regeneration | Customer can request new code |
| Attempts | Max 5 wrong attempts before lockout |
| Delivery | Shown on vendor's app (not SMS) |

### Admin Panel Requirements for OTP
- View live OTP status per booking
- Override OTP for support cases
- View OTP attempt logs
- Extend OTP expiry manually if needed

---

## Service Recording Feature

### Overview
Urban Helpers allows **optional video recording** of the service session for safety, quality control, and dispute resolution.

### Recording Flow
```
ServiceRecordingConsent → RecordingInProgress → (RecordingPaused) → EndServiceRecording
```

### Recording Specifications
| Property | Value |
|---|---|
| Type | Audio + Video (device camera) |
| Consent | Both parties must consent |
| Storage | Cloud (admin configures bucket) |
| Retention | 30 days (configurable) |
| Access | Customer + Vendor + Admin |
| Format | MP4 |
| Quality | 720p max |

### Admin Panel Requirements for Recording
- View all session recordings by BookingID
- Download recordings
- Flag recordings for review
- Delete recordings (after retention period)
- Generate recording reports by vendor/date/category
- Dispute resolution: Assign recording to case
- Privacy controls: Customer can request deletion

---

## Pricing Structure

### Booking Fee Breakdown
| Component | Amount |
|---|---|
| Service Base Price | As listed per sub-service |
| Platform Fee | ₹29 (flat) |
| GST | 18% on platform fee |
| Convenience Fee | ₹0 (waived for now) |

### Payment Methods Supported
- UPI (PhonePe, Google Pay, Paytm)
- Credit / Debit Card
- Net Banking
- Cash on Completion (select services)
- Urban Helpers Wallet (future)

---

## Slot & Scheduling System

### Available Time Slots
| Slot | Time |
|---|---|
| Morning | 8:00 AM – 11:00 AM |
| Afternoon | 12:00 PM – 3:00 PM |
| Evening | 4:00 PM – 7:00 PM |
| Express | Within 2 hours (premium) |

### Booking Window
- **Advance:** Up to 7 days ahead
- **Same Day:** Available (subject to vendor availability)
- **Express:** Surcharge applies (admin configurable)

---

## Vendor Management (Admin)

### Vendor Profile Fields
| Field | Type | Required |
|---|---|---|
| Vendor ID | String (UUID) | ✅ |
| Full Name | String | ✅ |
| Phone | String | ✅ |
| Profile Photo | Image URL | ✅ |
| Service Category | Array[CategoryID] | ✅ |
| Skills / Tags | Array[String] | ✅ |
| Rating | Float (0–5) | Auto |
| Jobs Completed | Integer | Auto |
| Background Checked | Boolean | ✅ |
| ID Verified | Boolean | ✅ |
| Is Active | Boolean | ✅ |
| Service Zones | Array[String] | ✅ |
| Working Hours | Object | ✅ |
| Bank Details | Object | ✅ |
| Commission Rate | Float (%) | ✅ |

### Vendor Status States
- `available` — Ready to accept jobs
- `on_job` — Currently on a booking
- `offline` — Not accepting jobs
- `suspended` — Admin action
- `pending_verification` — Awaiting docs

---

## Booking Management (Admin)

### Booking Status States
| Status | Description |
|---|---|
| `confirmed` | Booking placed, vendor not yet assigned |
| `vendor_assigned` | Vendor matched and notified |
| `en_route` | Vendor travelling to location |
| `vendor_arrived` | Vendor at customer GPS location |
| `otp_verified` | Customer verified vendor OTP |
| `in_progress` | Service being performed |
| `recording` | Service being recorded |
| `paused` | Recording/service paused |
| `completed` | Service finished |
| `rated` | Customer submitted rating |
| `cancelled` | Booking cancelled |
| `disputed` | Dispute raised |

### Booking Data Model
```json
{
  "bookingId": "UH-20481",
  "customerId": "cust-uuid",
  "vendorId": "vend-uuid",
  "categoryId": "cleaning",
  "subServiceId": "cl-full",
  "address": {
    "line1": "Flat 3B, Sunrise Apartments",
    "landmark": "Near Metro Station",
    "city": "Chennai",
    "pincode": "600001",
    "lat": 13.0827,
    "lng": 80.2707
  },
  "scheduledDate": "2026-08-19",
  "scheduledSlot": "morning",
  "status": "confirmed",
  "price": 1999,
  "platformFee": 29,
  "totalAmount": 2034.22,
  "paymentStatus": "paid",
  "paymentMethod": "upi",
  "otpCode": "7823",
  "otpExpiry": 1692456780000,
  "recordingConsent": true,
  "recordingUrl": null,
  "recordingDuration": 0,
  "rating": null,
  "review": null,
  "createdAt": "2026-08-18T10:30:00Z",
  "updatedAt": "2026-08-18T10:30:00Z"
}
```

---

## API Endpoints Required (Admin Web → Backend)

### Bookings
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/admin/bookings` | List all bookings with filters |
| GET | `/api/admin/bookings/:id` | Get single booking detail |
| PUT | `/api/admin/bookings/:id/status` | Update booking status |
| PUT | `/api/admin/bookings/:id/assign-vendor` | Assign vendor to booking |
| DELETE | `/api/admin/bookings/:id` | Cancel booking |
| GET | `/api/admin/bookings/:id/recording` | Get recording for booking |

### Vendors
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/admin/vendors` | List all vendors |
| GET | `/api/admin/vendors/:id` | Vendor detail |
| POST | `/api/admin/vendors` | Create new vendor |
| PUT | `/api/admin/vendors/:id` | Update vendor |
| PUT | `/api/admin/vendors/:id/status` | Change vendor status |
| GET | `/api/admin/vendors/:id/bookings` | Vendor's booking history |
| GET | `/api/admin/vendors/:id/earnings` | Vendor earnings |

### Services / Catalogue
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/admin/services` | List all categories + sub-services |
| PUT | `/api/admin/services/:categoryId` | Update category details |
| PUT | `/api/admin/services/:categoryId/:subServiceId/price` | Update pricing |
| POST | `/api/admin/services/:categoryId/sub-service` | Add new sub-service |
| DELETE | `/api/admin/services/:categoryId/:subServiceId` | Remove sub-service |

### OTP & Verification
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/admin/otp/:bookingId` | View OTP status |
| POST | `/api/admin/otp/:bookingId/reset` | Reset OTP for booking |
| GET | `/api/admin/otp/logs` | All OTP attempt logs |

### Recordings
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/admin/recordings` | List all recordings |
| GET | `/api/admin/recordings/:bookingId` | Get recording URL |
| DELETE | `/api/admin/recordings/:bookingId` | Delete recording |
| POST | `/api/admin/recordings/:bookingId/flag` | Flag for review |

### Analytics
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/admin/analytics/overview` | Bookings, revenue, vendors summary |
| GET | `/api/admin/analytics/revenue` | Revenue by date/category |
| GET | `/api/admin/analytics/bookings` | Booking volume by category |
| GET | `/api/admin/analytics/vendors` | Vendor performance metrics |
| GET | `/api/admin/analytics/ratings` | Rating distribution |

---

## Admin Dashboard Recommended Sections

### 1. Overview Dashboard
- Total bookings today / this week / this month
- Revenue metrics
- Active vendors (live map)
- Pending assignments
- Recent alerts (disputes, emergency calls)

### 2. Bookings Management
- All bookings table with status filter
- Booking detail view (full timeline)
- Assign/reassign vendor
- View recording
- Handle disputes

### 3. Vendor Management
- Vendor list with status indicators
- Onboarding workflow
- Document verification queue
- Earnings & payouts
- Performance ratings

### 4. Service Catalogue
- Edit categories, sub-services, prices
- Enable/disable services by city
- Manage time slots and pricing rules
- Upload category images

### 5. OTP & Security Logs
- Live OTP status per booking
- Attempt history
- Suspicious activity alerts
- Override controls

### 6. Recordings Vault
- All session recordings
- Filter by date, category, vendor
- Dispute-linked recordings
- Storage usage stats

### 7. Analytics & Reports
- Revenue by category (chart)
- Booking heatmap by city
- Vendor utilisation rate
- Customer retention metrics
- Service completion rate

### 8. Emergency Dispatch
- Live emergency bookings
- Dispatch status board
- Partner coordination (108 ambulance, police)

### 9. Customer Management
- Customer profiles
- Booking history
- Complaints & support tickets
- Wallet / credits

---

## Trust & Safety Features

| Feature | Description |
|---|---|
| Vendor ID Verification | Government ID scan required |
| Background Check | Police clearance certificate |
| Service Recording | Optional but encouraged |
| OTP Gate | 4-digit code prevents wrong vendor |
| 30-Day Warranty | On select services (termite, appliance) |
| Rating System | 1–5 stars + written review |
| Dispute Resolution | Admin reviews recording + chat logs |
| SOS Button | In-app emergency during service |
| Verified Badge | Shown on vendor profile card |

---

## City Coverage

Currently configured for: **Chennai** (expandable)

Future cities configurable via admin:
- Bangalore
- Mumbai
- Hyderabad
- Delhi NCR
- Pune
- Coimbatore

---

*This document is intended for Urban Helpers Admin Web Panel development.*
*Keep in sync with `servicesData.ts` and `recordingService.ts` in the mobile app.*
