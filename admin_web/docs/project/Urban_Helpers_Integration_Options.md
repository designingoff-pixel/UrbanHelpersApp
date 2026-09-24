# Urban Helpers — Integration Strategy Document
### Health + Home Services in One App
**Prepared for:** Client Review
**Date:** August 2026
**Version:** 1.0

---

## What Are We Deciding?

The Urban Helpers app currently covers **Health & Fitness** (like Samsung Health).
We now want to add **Home Services** (cleaning, repairs, appliances, etc.) into the same app.

The question is: **how does a user log in and access these two different worlds?**

There are **3 options**. Each is explained below in plain language — what it looks like, who it suits, pros, cons, and cost/effort.

---

## The Three Options at a Glance

| | Option A | Option B | Option C |
|---|---|---|---|
| **Name** | One App, Choose Your Plan | Two Separate Apps | Mode Selector at Welcome |
| **Login screens** | 1 | 2 (separate apps) | 1 with a mode picker before login |
| **Best for** | Most users, growth-focused | Enterprise / white-label | Simple pilot launch |
| **Complexity** | Medium | High | Low |
| **Recommended** | ✅ Yes | ❌ Not now | ⚠️ Short-term only |

---

## Option A — One App, Choose Your Plan
> *"Like Swiggy — one app, multiple services, one account"*

### How It Works

The user downloads **one app**. When they sign up, they choose a plan:

```
┌─────────────────────────────────────────────────────────┐
│                    Choose Your Plan                      │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Health &    │  │    Home      │  │  Full Access │  │
│  │  Fitness     │  │  Services    │  │    (Both)    │  │
│  │              │  │              │  │              │  │
│  │ Sleep, Steps │  │ Cleaning,    │  │ Everything   │  │
│  │ Nutrition,   │  │ Repairs,     │  │ in one place │  │
│  │ AI Coach     │  │ Appliances   │  │              │  │
│  │              │  │              │  │              │  │
│  │   Free /     │  │  ₹X/month   │  │  ₹Y/month   │  │
│  │  Basic plan  │  │              │  │              │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
```

After picking a plan, the user goes through one login and lands on a **Home Dashboard that is personalised to their plan.**

### What Each User Sees

**Health-only user (free/basic):**
- Sleep tracker, Step counter, Nutrition, AI Health Coach
- Heart Health, Fitness Dashboard, Medical Records
- Home Services cards appear but are **locked** with an "Upgrade" button

**Services-only user:**
- Home Cleaning, Appliance Repair, Plumber, Electrician bookings
- Track service, Payments, Support
- Health features appear but are **locked** with an "Add Health Plan" button

**Full Access user:**
- Everything from both worlds in one Home Dashboard
- One bottom navigation: Home · Health · Services · Fitness · Profile

### The Upgrade Flow

A locked card shows a padlock icon. Tapping it opens an in-app upgrade screen — the user adds their card and unlocks the module instantly, without re-registering.

### Real-World Examples Using This Pattern

- **Swiggy** — food delivery + Instamart + Dineout, one login
- **PhonePe** — payments + insurance + mutual funds, one login
- **Practo** — doctor consultation + pharmacy + lab tests, one login

### Pros

- ✅ One account for the user — no confusion
- ✅ Easy upsell: "You use Health, add Services with one tap"
- ✅ User data (profile, location, health history) shared across both modules
- ✅ One app to maintain and update
- ✅ Best for long-term growth

### Cons

- ⚠️ Requires a proper user plan/subscription system on the backend
- ⚠️ Home Dashboard logic is slightly more complex (conditional cards)
- ⚠️ Services module needs to be designed first (currently placeholder in Figma)

### Development Effort

| Task | Effort |
|---|---|
| Plan selection screen (onboarding step) | 1–2 days |
| UserPlan context + conditional Home Dashboard | 1–2 days |
| Lock/Upgrade card UI | 1 day |
| Services module screens (design + build) | 2–3 weeks |
| Backend: subscription & plan management | Separate backend sprint |

---

## Option B — Two Separate Apps, Shared Backend
> *"Like Google Maps and Waze — different apps, same company"*

### How It Works

Two completely separate apps are published on the Play Store / App Store:

- **Urban Helpers Health** — Health & Fitness only
- **Urban Helpers Services** — Home Services only

Both apps share the **same login backend** (same email/password works in both). A user who wants both just installs both apps.

```
User's Phone:
┌─────────────────────┐    ┌─────────────────────┐
│  Urban Helpers      │    │  Urban Helpers       │
│  Health             │    │  Services            │
│  [App Icon]         │    │  [App Icon]          │
└─────────────────────┘    └─────────────────────┘
         │                           │
         └──────────┬────────────────┘
                    ▼
          Shared Login Server
          (same account works in both)
```

### Pros

- ✅ Each app is focused and lightweight
- ✅ Good for white-labelling (e.g. sell the Health app to a hospital separately)
- ✅ Different teams can work on each app independently

### Cons

- ❌ User needs to download two separate apps
- ❌ Two codebases to maintain (double the cost of updates, bug fixes, releases)
- ❌ No cross-sell within one app (can't show "also try our Services" inside the Health app easily)
- ❌ App Store reviews, ratings, and users are split across two listings
- ❌ Much higher development and maintenance cost

### Development Effort

Roughly **2× the effort** of Option A, because everything is built and maintained twice.

### When to Choose This

Only if the business decision is to position the two products as completely separate brands, or to white-label one of them to another company.

---

## Option C — Mode Selector at Welcome Screen
> *"Like choosing a lane at an airport — Health lane or Services lane"*

### How It Works

When the user first opens the app, before even logging in, they see a mode picker:

```
┌─────────────────────────────────────┐
│                                     │
│         Urban Helpers               │
│                                     │
│   What brings you here today?       │
│                                     │
│   ┌─────────────────────────────┐   │
│   │  🏥  Health & Fitness       │   │
│   │      Track sleep, steps,    │   │
│   │      nutrition & more       │   │
│   └─────────────────────────────┘   │
│                                     │
│   ┌─────────────────────────────┐   │
│   │  🏠  Home Services          │   │
│   │      Cleaning, repairs,     │   │
│   │      appliances & more      │   │
│   └─────────────────────────────┘   │
│                                     │
│   ┌─────────────────────────────┐   │
│   │  ✨  I want both            │   │
│   └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

The user picks their mode, then goes through login. The app remembers their mode and shows the relevant dashboard.

### Pros

- ✅ Simplest and fastest to build
- ✅ Clear visual separation — feels like two products in one
- ✅ No subscription/plan backend needed initially (mode is just a local setting)
- ✅ Good for a **pilot launch** or MVP

### Cons

- ⚠️ If a user wants to switch modes later, they have to go back to settings and re-select — can feel clunky
- ⚠️ No in-app upgrade path (can't upsell Health user to Services without navigating to settings)
- ⚠️ The "both" option still requires designing the combined dashboard
- ⚠️ Not a long-term scalable solution — you will likely migrate to Option A eventually anyway

### Development Effort

| Task | Effort |
|---|---|
| Mode selector welcome screen | 1 day |
| Mode-aware conditional dashboard | 1–2 days |
| Settings screen to change mode | 0.5 day |
| Services module screens | 2–3 weeks |

---

## Side-by-Side Comparison

| Criteria | Option A | Option B | Option C |
|---|---|---|---|
| **User experience** | Seamless, one account | Two apps on phone | Clean but limited |
| **Upsell potential** | High (locked cards) | Low (separate apps) | Medium (settings) |
| **Development cost** | Medium | High (2×) | Low |
| **Maintenance cost** | Low (one codebase) | High (two codebases) | Low |
| **Backend required** | Yes (plan management) | Yes (shared auth) | No (local setting) |
| **Good for MVP/pilot** | Yes | No | Yes |
| **Good for scale** | Yes | Maybe | No |
| **User data shared** | Yes | Yes (via backend) | Yes |
| **Works without internet** | Partially | Partially | Yes (mode stored locally) |

---

## Our Recommendation

### For a Pilot / Early Launch → Start with Option C

Get to market quickly. Let real users try both Health and Services. No backend subscription system needed. This takes **3–5 days** to implement on top of the existing app.

### For a Scaled Product → Move to Option A

Once you have confirmed demand from real users, migrate to Option A with a proper plan/subscription system. The codebase changes needed to go from C → A are minimal because the conditional dashboard logic is already in place.

### Never Option B (for now)

Unless you decide to white-label or sell the Health module to a third party (e.g. a hospital chain wants to use only the Health module under their own brand), Option B is unnecessary overhead.

---

## Recommended Roadmap

```
Month 1–2 (Now)
└── Option C — Mode selector + Services placeholder screens
    └── Pilot with early users
    └── Collect feedback: do users want both? which is more popular?

Month 3–4
└── Design Services module in Figma (Modules 7, 8, 9)
└── Build Services screens

Month 5–6
└── Migrate to Option A — Plan selection + subscription backend
└── Launch on Play Store / App Store
```

---

## Questions to Decide Before Next Sprint

1. **Pricing:** Will Health be free and Services paid, or will both be paid plans?
2. **Services scope:** Which services go in first — cleaning only, or cleaning + repairs + appliances?
3. **Backend:** Do you have a backend team, or do we use Firebase/Supabase for the plan management?
4. **Timeline:** Is there a hard launch date we are working toward?

---

*Document prepared by the Urban Helpers development team.*
*For questions, contact the project lead.*
