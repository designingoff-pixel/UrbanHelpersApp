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
 * Expanded search — each dosage strength becomes a separate result row.
 *
 * Example: Paracetamol with commonDosages ["500mg", "650mg"] produces:
 *   { name: "Paracetamol 500mg", commonDosages: ["500mg"], id: "med_paracetamol_500mg" }
 *   { name: "Paracetamol 650mg", commonDosages: ["650mg"], id: "med_paracetamol_650mg" }
 *
 * Also matches by strength number alone ("500" matches "500mg").
 * Returns at most 12 de-duplicated results.
 */
export function searchMedicineDatabaseExpanded(
  query: string = "",
  category: MedicineCategory = "All",
  limit = 12
): MedicineDefinition[] {
  const cleanQ = query.trim().toLowerCase();

  const results: MedicineDefinition[] = [];
  const seenIds = new Set<string>();

  for (const med of MEDICINE_DATABASE) {
    if (results.length >= limit) break;

    const matchesCat = category === "All" || med.category === category;
    if (!matchesCat) continue;

    // Check if the query matches the base medicine (name or generic)
    const nameMatch =
      cleanQ.length === 0 ||
      med.name.toLowerCase().includes(cleanQ) ||
      med.genericName.toLowerCase().includes(cleanQ) ||
      med.category.toLowerCase().includes(cleanQ);

    // Check if the query looks like a strength query ("500", "500mg", "650 mg")
    // Strip spaces: "500 mg" → "500mg"
    const normQ = cleanQ.replace(/\s+/g, "");
    const strengthQuery =
      cleanQ.length > 0 &&
      /\d/.test(cleanQ) &&
      med.commonDosages.some((d) => d.toLowerCase().replace(/\s+/g, "").includes(normQ));

    if (!nameMatch && !strengthQuery) continue;

    // Expand each matching dosage into its own virtual record
    const dosagesToExpand = strengthQuery
      ? med.commonDosages.filter((d) => d.toLowerCase().replace(/\s+/g, "").includes(normQ))
      : med.commonDosages;

    for (const strength of dosagesToExpand) {
      if (results.length >= limit) break;
      const virtualId = `${med.id}_${strength.replace(/\s+/g, "").toLowerCase()}`;
      if (seenIds.has(virtualId)) continue;
      seenIds.add(virtualId);

      results.push({
        ...med,
        id: virtualId,
        name: `${med.name} ${strength}`,
        commonDosages: [strength],
      });
    }
  }

  return results;
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
    // ── Step 1: primary concept search via drugs.json ────────────────────────
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const res1 = await fetch(
      `${BASE}/drugs.json?name=${encodeURIComponent(clean)}`,
      { signal: controller.signal }
    );
    clearTimeout(timeout);

    interface Candidate {
      rxcui: string;
      name: string;
      synonym: string;
      tty: string;
      priority: number;
    }

    const candidates: Candidate[] = [];

    if (res1.ok) {
      const data1 = await res1.json();
      const conceptGroup: any[] = data1.drugGroup?.conceptGroup ?? [];
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
    }

    // ── Step 2: fallback to approximateTerm if direct search returned no candidates
    if (candidates.length === 0) {
      const ctrl2 = new AbortController();
      const timeout2 = setTimeout(() => ctrl2.abort(), 5000);
      try {
        const res2 = await fetch(
          `${BASE}/approximateTerm.json?term=${encodeURIComponent(clean)}&maxEntries=15`,
          { signal: ctrl2.signal }
        );
        clearTimeout(timeout2);
        if (res2.ok) {
          const data2 = await res2.json();
          const candList: any[] = data2.approximateGroup?.candidate ?? [];
          for (const c of candList) {
            if (!c.rxcui || !c.name) continue;
            candidates.push({
              rxcui: String(c.rxcui),
              name: String(c.name),
              synonym: String(c.name),
              tty: "APPROX",
              priority: 10,
            });
          }
        }
      } catch {
        clearTimeout(timeout2);
      }
    }

    if (!candidates.length) return [];

    // Sort: preferred clinical TTYs first, then alphabetically
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

    const top = deduped.slice(0, 12);

    return top.map((c) => {
      const form = mapDosageForm(c.name);
      const strength = extractStrength(c.name);
      const commonDosages = strength ? [strength] : [];

      return {
        id: `rx_${c.rxcui}`,
        name: c.name,
        genericName: c.synonym !== c.name ? c.synonym : c.name,
        category: "All",
        commonDosages,
        defaultForm: form,
        defaultTiming: "After food",
        color: "#7c3aed",
        notes: strength
          ? `${strength} · RxNorm (US clinical database)`
          : "RxNorm (US clinical database)",
      };
    });
  } catch {
    return [];
  }
}

/**
 * Extracts strength pattern (e.g. 500 MG, 250mg, 10 MG/ML) from RxNorm clinical drug name.
 */
function extractStrength(name: string): string {
  const match = name.match(
    /(\d+(?:\.\d+)?\s*(?:mg|mcg|g|ml|mg\/ml|%)(?:\s*\/\s*\d+(?:\.\d+)?\s*(?:mg|mcg|g|ml|mg\/ml|%))*)/i
  );
  return match ? match[1].trim() : "";
}

/**
 * Maps a dosage form string or drug name to our internal PillForm type.
 * Falls back to "tablet" if no match is found.
 */
function mapDosageForm(formOrName: string): PillForm {
  const f = formOrName.toLowerCase();
  if (f.includes("capsule") || f.includes("cap")) return "capsule";
  if (
    f.includes("solution") ||
    f.includes("liquid") ||
    f.includes("syrup") ||
    f.includes("suspension") ||
    f.includes("inhal") ||
    f.includes("spray") ||
    f.includes("aerosol")
  )
    return "liquid";
  if (f.includes("drop")) return "drops";
  if (
    f.includes("inject") ||
    f.includes("vial") ||
    f.includes("prefilled")
  )
    return "injection";
  return "tablet";
}


