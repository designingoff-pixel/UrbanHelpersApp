// Comprehensive Clinical Medicine & Tablet Database with Standard Strengths (mg), Forms & Timings
import { PillForm } from "./healthLogService";

export type MedicineCategory =
  | "All"
  | "Pain & Fever"
  | "Antibiotics"
  | "Acidity & Digestion"
  | "Diabetes"
  | "Hypertension & Heart"
  | "Cholesterol"
  | "Allergy & Cold"
  | "Vitamins & Minerals"
  | "Thyroid & Hormones";

export interface MedicineDefinition {
  id: string;
  name: string;
  genericName: string;
  category: MedicineCategory;
  commonDosages: string[]; // e.g. ["500mg", "650mg"]
  defaultForm: PillForm;
  defaultTiming: "After food" | "Before food" | "Empty stomach" | "At bedtime";
  color: string;
  notes?: string;
}

export const MEDICINE_CATEGORIES: MedicineCategory[] = [
  "All",
  "Pain & Fever",
  "Antibiotics",
  "Acidity & Digestion",
  "Diabetes",
  "Hypertension & Heart",
  "Cholesterol",
  "Allergy & Cold",
  "Vitamins & Minerals",
  "Thyroid & Hormones",
];

export const MEDICINE_DATABASE: MedicineDefinition[] = [
  // ─── PAIN & FEVER ───
  {
    id: "med_dolo",
    name: "Dolo",
    genericName: "Paracetamol",
    category: "Pain & Fever",
    commonDosages: ["650mg", "500mg"],
    defaultForm: "tablet",
    defaultTiming: "After food",
    color: "#ef4444",
    notes: "For fever, headache, body pain",
  },
  {
    id: "med_paracetamol",
    name: "Paracetamol",
    genericName: "Acetaminophen",
    category: "Pain & Fever",
    commonDosages: ["500mg", "650mg", "1000mg"],
    defaultForm: "tablet",
    defaultTiming: "After food",
    color: "#f87171",
    notes: "Analgesic and antipyretic",
  },
  {
    id: "med_calpol",
    name: "Calpol",
    genericName: "Paracetamol",
    category: "Pain & Fever",
    commonDosages: ["500mg", "650mg", "250mg"],
    defaultForm: "tablet",
    defaultTiming: "After food",
    color: "#f43f5e",
    notes: "For fever and mild to moderate pain",
  },
  {
    id: "med_crocin",
    name: "Crocin",
    genericName: "Paracetamol",
    category: "Pain & Fever",
    commonDosages: ["500mg", "650mg"],
    defaultForm: "tablet",
    defaultTiming: "After food",
    color: "#e11d48",
    notes: "Fast relief for pain and fever",
  },
  {
    id: "med_combiflam",
    name: "Combiflam",
    genericName: "Ibuprofen + Paracetamol",
    category: "Pain & Fever",
    commonDosages: ["400mg + 325mg"],
    defaultForm: "tablet",
    defaultTiming: "After food",
    color: "#fb7185",
    notes: "Inflammation, joint pain, dental pain",
  },
  {
    id: "med_ibuprofen",
    name: "Ibuprofen",
    genericName: "Ibuprofen",
    category: "Pain & Fever",
    commonDosages: ["200mg", "400mg", "600mg"],
    defaultForm: "tablet",
    defaultTiming: "After food",
    color: "#fda4af",
    notes: "Nonsteroidal anti-inflammatory (NSAID)",
  },
  {
    id: "med_tramadol",
    name: "Tramadol",
    genericName: "Tramadol HCl",
    category: "Pain & Fever",
    commonDosages: ["50mg", "100mg"],
    defaultForm: "tablet",
    defaultTiming: "After food",
    color: "#f43f5e",
    notes: "Moderate to severe acute pain",
  },

  // ─── ANTIBIOTICS ───
  {
    id: "med_augmentin",
    name: "Augmentin",
    genericName: "Amoxicillin + Potassium Clavulanate",
    category: "Antibiotics",
    commonDosages: ["625mg", "375mg", "1000mg"],
    defaultForm: "tablet",
    defaultTiming: "After food",
    color: "#3b82f6",
    notes: "Broad-spectrum bacterial infections",
  },
  {
    id: "med_amoxicillin",
    name: "Amoxicillin",
    genericName: "Amoxicillin Trihydrate",
    category: "Antibiotics",
    commonDosages: ["250mg", "500mg", "875mg"],
    defaultForm: "capsule",
    defaultTiming: "After food",
    color: "#60a5fa",
    notes: "Ear, nose, throat, chest infections",
  },
  {
    id: "med_azithromycin",
    name: "Azithromycin (Azithral)",
    genericName: "Azithromycin",
    category: "Antibiotics",
    commonDosages: ["250mg", "500mg"],
    defaultForm: "tablet",
    defaultTiming: "Before food",
    color: "#2563eb",
    notes: "Respiratory tract & skin infections",
  },
  {
    id: "med_cefixime",
    name: "Cefixime (Zifi)",
    genericName: "Cefixime",
    category: "Antibiotics",
    commonDosages: ["100mg", "200mg"],
    defaultForm: "tablet",
    defaultTiming: "After food",
    color: "#1d4ed8",
    notes: "Typhoid, urinary, respiratory infections",
  },
  {
    id: "med_ciprofloxacin",
    name: "Ciprofloxacin (Ciplox)",
    genericName: "Ciprofloxacin HCl",
    category: "Antibiotics",
    commonDosages: ["250mg", "500mg", "750mg"],
    defaultForm: "tablet",
    defaultTiming: "Before food",
    color: "#1e40af",
    notes: "Bacterial infections & gastrointestinal",
  },
  {
    id: "med_doxycycline",
    name: "Doxycycline",
    genericName: "Doxycycline Hyclate",
    category: "Antibiotics",
    commonDosages: ["100mg"],
    defaultForm: "capsule",
    defaultTiming: "After food",
    color: "#38bdf8",
    notes: "Acne, respiratory infections, tick bites",
  },

  // ─── ACIDITY & DIGESTION ───
  {
    id: "med_pantoprazole",
    name: "Pantoprazole (Pan 40)",
    genericName: "Pantoprazole Sodium",
    category: "Acidity & Digestion",
    commonDosages: ["40mg", "20mg"],
    defaultForm: "tablet",
    defaultTiming: "Empty stomach",
    color: "#10b981",
    notes: "GERD, heartburn, stomach ulcer",
  },
  {
    id: "med_pan_d",
    name: "Pan-D",
    genericName: "Pantoprazole + Domperidone",
    category: "Acidity & Digestion",
    commonDosages: ["40mg + 30mg"],
    defaultForm: "capsule",
    defaultTiming: "Empty stomach",
    color: "#059669",
    notes: "Acid reflux, nausea, gas, bloating",
  },
  {
    id: "med_omeprazole",
    name: "Omeprazole (Omez)",
    genericName: "Omeprazole",
    category: "Acidity & Digestion",
    commonDosages: ["20mg", "40mg"],
    defaultForm: "capsule",
    defaultTiming: "Empty stomach",
    color: "#34d399",
    notes: "Proton-pump inhibitor for acid relief",
  },
  {
    id: "med_rabeprazole",
    name: "Rabeprazole (Razo)",
    genericName: "Rabeprazole Sodium",
    category: "Acidity & Digestion",
    commonDosages: ["20mg"],
    defaultForm: "tablet",
    defaultTiming: "Empty stomach",
    color: "#6ee7b7",
    notes: "Fast acting for acid peptic disorder",
  },
  {
    id: "med_digene",
    name: "Digene",
    genericName: "Magnesium Hydroxide + Aluminium Hydroxide",
    category: "Acidity & Digestion",
    commonDosages: ["1 tablet", "2 tablets"],
    defaultForm: "tablet",
    defaultTiming: "After food",
    color: "#a7f3d0",
    notes: "Chewable antacid for instant relief",
  },

  // ─── DIABETES ───
  {
    id: "med_metformin",
    name: "Metformin (Glycomet)",
    genericName: "Metformin Hydrochloride",
    category: "Diabetes",
    commonDosages: ["500mg", "850mg", "1000mg"],
    defaultForm: "tablet",
    defaultTiming: "After food",
    color: "#f59e0b",
    notes: "Type 2 diabetes blood glucose regulation",
  },
  {
    id: "med_glimepiride",
    name: "Glimepiride (Amaryl)",
    genericName: "Glimepiride",
    category: "Diabetes",
    commonDosages: ["1mg", "2mg", "3mg", "4mg"],
    defaultForm: "tablet",
    defaultTiming: "Before food",
    color: "#d97706",
    notes: "Stimulates pancreatic insulin release",
  },
  {
    id: "med_vildagliptin",
    name: "Vildagliptin (Galvus)",
    genericName: "Vildagliptin",
    category: "Diabetes",
    commonDosages: ["50mg"],
    defaultForm: "tablet",
    defaultTiming: "After food",
    color: "#b45309",
    notes: "DPP-4 inhibitor for glycemic control",
  },
  {
    id: "med_dapagliflozin",
    name: "Dapagliflozin (Forxiga)",
    genericName: "Dapagliflozin",
    category: "Diabetes",
    commonDosages: ["5mg", "10mg"],
    defaultForm: "tablet",
    defaultTiming: "After food",
    color: "#78350f",
    notes: "SGLT2 inhibitor; cardiac & kidney support",
  },

  // ─── HYPERTENSION & HEART ───
  {
    id: "med_telmisartan",
    name: "Telmisartan (Telma)",
    genericName: "Telmisartan",
    category: "Hypertension & Heart",
    commonDosages: ["20mg", "40mg", "80mg"],
    defaultForm: "tablet",
    defaultTiming: "After food",
    color: "#8b5cf6",
    notes: "Angiotensin receptor blocker for high BP",
  },
  {
    id: "med_amlodipine",
    name: "Amlodipine (Stamlo)",
    genericName: "Amlodipine Besylate",
    category: "Hypertension & Heart",
    commonDosages: ["2.5mg", "5mg", "10mg"],
    defaultForm: "tablet",
    defaultTiming: "After food",
    color: "#7c3aed",
    notes: "Calcium channel blocker for hypertension",
  },
  {
    id: "med_atenolol",
    name: "Atenolol (Aten)",
    genericName: "Atenolol",
    category: "Hypertension & Heart",
    commonDosages: ["25mg", "50mg"],
    defaultForm: "tablet",
    defaultTiming: "After food",
    color: "#6d28d9",
    notes: "Beta-blocker for BP and angina",
  },
  {
    id: "med_losartan",
    name: "Losartan",
    genericName: "Losartan Potassium",
    category: "Hypertension & Heart",
    commonDosages: ["25mg", "50mg", "100mg"],
    defaultForm: "tablet",
    defaultTiming: "After food",
    color: "#a78bfa",
    notes: "Blood pressure regulation",
  },

  // ─── CHOLESTEROL ───
  {
    id: "med_atorvastatin",
    name: "Atorvastatin (Atorva)",
    genericName: "Atorvastatin Calcium",
    category: "Cholesterol",
    commonDosages: ["10mg", "20mg", "40mg"],
    defaultForm: "tablet",
    defaultTiming: "At bedtime",
    color: "#ec4899",
    notes: "Lowers LDL cholesterol and triglycerides",
  },
  {
    id: "med_rosuvastatin",
    name: "Rosuvastatin (Rozavel)",
    genericName: "Rosuvastatin Calcium",
    category: "Cholesterol",
    commonDosages: ["5mg", "10mg", "20mg"],
    defaultForm: "tablet",
    defaultTiming: "At bedtime",
    color: "#db2777",
    notes: "Statin for cardiovascular risk reduction",
  },

  // ─── ALLERGY & COLD ───
  {
    id: "med_cetirizine",
    name: "Cetirizine (Cetzine)",
    genericName: "Cetirizine Dihydrochloride",
    category: "Allergy & Cold",
    commonDosages: ["5mg", "10mg"],
    defaultForm: "tablet",
    defaultTiming: "At bedtime",
    color: "#06b6d4",
    notes: "Runny nose, sneezing, itching, hives",
  },
  {
    id: "med_allegra",
    name: "Allegra",
    genericName: "Fexofenadine HCl",
    category: "Allergy & Cold",
    commonDosages: ["120mg", "180mg"],
    defaultForm: "tablet",
    defaultTiming: "After food",
    color: "#0891b2",
    notes: "Non-drowsy antihistamine for allergies",
  },
  {
    id: "med_montair_lc",
    name: "Montair-LC",
    genericName: "Montelukast + Levocetirizine",
    category: "Allergy & Cold",
    commonDosages: ["10mg + 5mg"],
    defaultForm: "tablet",
    defaultTiming: "At bedtime",
    color: "#0e7490",
    notes: "Allergic rhinitis and asthma prevention",
  },
  {
    id: "med_sinarest",
    name: "Sinarest",
    genericName: "Paracetamol + Phenylephrine + CPM",
    category: "Allergy & Cold",
    commonDosages: ["1 tablet"],
    defaultForm: "tablet",
    defaultTiming: "After food",
    color: "#22d3ee",
    notes: "Nasal congestion, sinus headache, cold",
  },

  // ─── VITAMINS & MINERALS ───
  {
    id: "med_vitamin_d3",
    name: "Vitamin D3 (Calcirol)",
    genericName: "Cholecalciferol",
    category: "Vitamins & Minerals",
    commonDosages: ["1000 IU", "2000 IU", "60000 IU"],
    defaultForm: "capsule",
    defaultTiming: "After food",
    color: "#eab308",
    notes: "Bone density, immunity & calcium absorption",
  },
  {
    id: "med_shelcal",
    name: "Shelcal 500",
    genericName: "Calcium Carbonate + Vitamin D3",
    category: "Vitamins & Minerals",
    commonDosages: ["500mg"],
    defaultForm: "tablet",
    defaultTiming: "After food",
    color: "#ca8a04",
    notes: "Calcium supplement for strong bones",
  },
  {
    id: "med_becosules",
    name: "Becosules",
    genericName: "B-Complex + Vitamin C",
    category: "Vitamins & Minerals",
    commonDosages: ["1 capsule"],
    defaultForm: "capsule",
    defaultTiming: "After food",
    color: "#a16207",
    notes: "Mouth ulcers, fatigue, nutritional recovery",
  },
  {
    id: "med_limcee",
    name: "Limcee / Celin",
    genericName: "Vitamin C (Ascorbic Acid)",
    category: "Vitamins & Minerals",
    commonDosages: ["500mg"],
    defaultForm: "tablet",
    defaultTiming: "After food",
    color: "#84cc16",
    notes: "Chewable antioxidant for immunity and skin",
  },
  {
    id: "med_evion",
    name: "Evion",
    genericName: "Vitamin E (Tocopheryl Acetate)",
    category: "Vitamins & Minerals",
    commonDosages: ["400mg", "600mg"],
    defaultForm: "capsule",
    defaultTiming: "After food",
    color: "#65a30d",
    notes: "Antioxidant for muscle cramps and skin",
  },
  {
    id: "med_zincovit",
    name: "Zincovit",
    genericName: "Multivitamin + Multimineral with Zinc",
    category: "Vitamins & Minerals",
    commonDosages: ["1 tablet"],
    defaultForm: "tablet",
    defaultTiming: "After food",
    color: "#4d7c0f",
    notes: "Daily wellness & immune defense",
  },

  // ─── THYROID & HORMONES ───
  {
    id: "med_thyronorm",
    name: "Thyronorm / Eltroxin",
    genericName: "Levothyroxine Sodium",
    category: "Thyroid & Hormones",
    commonDosages: ["25mcg", "50mcg", "75mcg", "100mcg"],
    defaultForm: "tablet",
    defaultTiming: "Empty stomach",
    color: "#6366f1",
    notes: "Hypothyroidism; take 30 mins before breakfast",
  },
];

/**
 * Filter and search medicines by query and category
 */
export function searchMedicineDatabase(
  query: string = "",
  category: MedicineCategory = "All"
): MedicineDefinition[] {
  const cleanQ = query.trim().toLowerCase();
  return MEDICINE_DATABASE.filter((med) => {
    const matchesCat = category === "All" || med.category === category;
    const matchesQ =
      cleanQ.length === 0 ||
      med.name.toLowerCase().includes(cleanQ) ||
      med.genericName.toLowerCase().includes(cleanQ) ||
      med.category.toLowerCase().includes(cleanQ);
    return matchesCat && matchesQ;
  });
}


/**
 * RxNorm term-type priority order.
 * SBD = branded drug, SCD = clinical drug, BPCK = brand pack, GPCK = generic pack
 * We prefer SCD > SBD > BPCK > GPCK > everything else.
 */
const RX_TTY_PRIORITY: Record<string, number> = {
  SCD: 1,
  SBD: 2,
  BPCK: 3,
  GPCK: 4,
};

/**
 * Search the official NLM RxNorm API (https://rxnav.nlm.nih.gov/REST/).
 *
 * Step 1 – /drugs.json?name= : find all concept groups for the query term.
 * Step 2 – For each unique rxcui, fetch /RxTerms/rxcui/{id}/allinfo.json to
 *           get real strength and dosage form (never invented values).
 *
 * Deduplicates against the local MEDICINE_DATABASE names.
 *
 * NOTE: RxNorm is a US-centric clinical database. Indian brand names may not
 * appear; results are based on generic/active-ingredient matching.
 */
export async function searchRxNormDrugs(
  query: string,
  localNames: Set<string> = new Set()
): Promise<MedicineDefinition[]> {
  const clean = query.trim();
  if (!clean || clean.length < 2) return [];

  const BASE = "https://rxnav.nlm.nih.gov/REST";

  try {
    // ── Step 1: concept search ──────────────────────────────────────────────
    const controller1 = new AbortController();
    const t1 = setTimeout(() => controller1.abort(), 7000);

    const res1 = await fetch(
      `${BASE}/drugs.json?name=${encodeURIComponent(clean)}`,
      { signal: controller1.signal }
    );
    clearTimeout(t1);

    if (!res1.ok) return [];

    const data1 = await res1.json();
    const conceptGroup: any[] = data1.drugGroup?.conceptGroup ?? [];
    if (!conceptGroup.length) return [];

    // Collect candidate concepts, sorted by TTY priority
    interface Candidate {
      rxcui: string;
      name: string;
      synonym: string;
      tty: string;
      priority: number;
    }

    const candidates: Candidate[] = [];
    for (const group of conceptGroup) {
      const tty: string = group.tty ?? "";
      const priority = RX_TTY_PRIORITY[tty] ?? 99;
      for (const prop of group.conceptProperties ?? []) {
        if (!prop.rxcui || !prop.name) continue;
        candidates.push({
          rxcui: String(prop.rxcui),
          name: String(prop.name),
          synonym: String(prop.synonym || prop.name),
          tty,
          priority,
        });
      }
    }

    // Sort: preferred TTYs first, then alphabetically
    candidates.sort((a, b) =>
      a.priority !== b.priority
        ? a.priority - b.priority
        : a.name.localeCompare(b.name)
    );

    // Deduplicate by rxcui and remove entries already in local DB
    const seenRxcui = new Set<string>();
    const deduped = candidates.filter((c) => {
      const normName = c.name.toLowerCase().trim();
      if (seenRxcui.has(c.rxcui)) return false;
      if (localNames.has(normName)) return false;
      seenRxcui.add(c.rxcui);
      return true;
    });

    // Take top-15 candidates to fetch RxTerms for
    const top = deduped.slice(0, 15);
    if (!top.length) return [];

    // ── Step 2: fetch RxTerms for real strength + form ──────────────────────
    const rxTermsResults = await Promise.allSettled(
      top.map(async (c) => {
        const controller2 = new AbortController();
        const t2 = setTimeout(() => controller2.abort(), 5000);
        try {
          const res2 = await fetch(
            `${BASE}/RxTerms/rxcui/${c.rxcui}/allinfo.json`,
            { signal: controller2.signal }
          );
          clearTimeout(t2);
          if (!res2.ok) return { c, terms: null };
          const d2 = await res2.json();
          return { c, terms: d2.rxtermsProperties ?? null };
        } catch {
          clearTimeout(t2);
          return { c, terms: null };
        }
      })
    );

    const results: MedicineDefinition[] = [];

    for (const settled of rxTermsResults) {
      if (settled.status !== "fulfilled") continue;
      const { c, terms } = settled.value;

      // Derive display name: prefer RxTerms fullName > original concept name
      const displayName: string =
        (terms?.fullName ?? terms?.displayName ?? c.name).trim();

      // Real strength from RxTerms (may be empty string if not applicable)
      const strengthRaw: string = (terms?.strength ?? "").trim();
      const dosageFormRaw: string = (terms?.dosageForm ?? "").trim();

      // Map RxTerms dosageForm → our PillForm type
      const form: PillForm = mapDosageForm(dosageFormRaw);

      // Build commonDosages ONLY from real API data – never invented
      const commonDosages: string[] =
        strengthRaw.length > 0 ? [strengthRaw] : [];

      // Generic/active ingredient from RxTerms or synonym
      const genericIngredient: string = (
        terms?.synonym ??
        c.synonym ??
        ""
      ).trim();

      results.push({
        id: `rx_${c.rxcui}`,
        name: displayName,
        genericName: genericIngredient || displayName,
        category: "All",
        commonDosages,
        defaultForm: form,
        defaultTiming: "After food",
        color: "#7c3aed",
        notes: dosageFormRaw
          ? `${dosageFormRaw}${strengthRaw ? " · " + strengthRaw : ""} — RxNorm (US clinical database)`
          : "RxNorm (US clinical database)",
      });
    }

    return results;
  } catch {
    return [];
  }
}

/**
 * Maps a free-text RxTerms dosage form string to our internal PillForm type.
 * Falls back to "tablet" if no match is found.
 */
function mapDosageForm(form: string): PillForm {
  const f = form.toLowerCase();
  if (f.includes("capsule") || f.includes("cap")) return "capsule";
  if (f.includes("solution") || f.includes("liquid") || f.includes("syrup") || f.includes("suspension")) return "liquid";
  if (f.includes("drop")) return "drops";
  if (f.includes("inject") || f.includes("vial") || f.includes("prefilled")) return "injection";
  return "tablet";
}

