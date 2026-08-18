// ─────────────────────────────────────────────────────────────────────────────
// Urban Helpers — Service Image Registry
// Maps service category IDs and sub-service IDs to remote image URLs.
//
// NOTE: Replace these Unsplash URLs with your own assets once you have them.
// All URLs are free-to-use high-quality images from Unsplash.com
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Hero image for each of the 10 service categories.
 * Displayed on the ServicesDashboardScreen category cards.
 */
export const SERVICE_CATEGORY_IMAGES: Record<string, string> = {
  // 🚰 RO Service — Water purifier / clean water
  ro: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&q=80",

  // 🐾 Pet Care — Groomed dog / happy pet
  pet: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&q=80",

  // 🐛 Pest Control — Professional pest control
  pest: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&q=80",

  // 🌱 Horticulture — Green garden / plants
  hort: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&q=80",

  // 🚴 Delivery — Courier / delivery person
  delivery: "https://images.unsplash.com/photo-1618516976920-83eba0a2bcf0?w=400&q=80",

  // ⚡ Appliance Cleaning — Clean appliances
  appliance: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80",

  // 👨‍⚕️ Home Care — Caregiver / nurse
  homecare: "https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?w=400&q=80",

  // 🛡️ Insurance — Family / protection
  insurance: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400&q=80",

  // 🚨 Emergency — Ambulance / emergency response
  emergency: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80",

  // 🧹 Home Cleaning — Sparkling clean home
  cleaning: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&q=80",
};

/**
 * Hero images for each sub-service.
 * Displayed on the ServiceDetailScreen above the booking form.
 * Key format: "<categoryId>-<subServiceId>"
 */
export const SERVICE_DETAIL_IMAGES: Record<string, string> = {
  // ── RO Service ──────────────────────────────────────────────
  "ro-filter":
    "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&q=80",
  "ro-clean":
    "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=600&q=80",
  "ro-new":
    "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&q=80",
  "ro-monthly":
    "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80",
  "ro-shift":
    "https://images.unsplash.com/photo-1618516976920-83eba0a2bcf0?w=600&q=80",
  "ro-leak":
    "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80",
  "ro-tds":
    "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=600&q=80",

  // ── Pet Care ─────────────────────────────────────────────────
  "pet-bath":
    "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&q=80",
  "pet-groom":
    "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&q=80",
  "pet-walk":
    "https://images.unsplash.com/photo-1601758174947-8f17b8a0f292?w=600&q=80",
  "pet-train":
    "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&q=80",
  "pet-hostel":
    "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&q=80",
  "pet-hospital":
    "https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=600&q=80",
  "pet-emer":
    "https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=600&q=80",

  // ── Pest Control ─────────────────────────────────────────────
  "pest-cock":
    "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80",
  "pest-liz":
    "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80",
  "pest-term":
    "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80",
  "pest-rodent":
    "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80",
  "pest-bug":
    "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80",
  "pest-snake":
    "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80",

  // ── Horticulture ─────────────────────────────────────────────
  "hort-setup":
    "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80",
  "hort-plant":
    "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80",
  "hort-manure":
    "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80",
  "hort-advice":
    "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80",
  "hort-med":
    "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80",
  "hort-shed":
    "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80",
  "hort-veg":
    "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80",

  // ── Delivery ─────────────────────────────────────────────────
  "del-med":
    "https://images.unsplash.com/photo-1618516976920-83eba0a2bcf0?w=600&q=80",
  "del-veg":
    "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80",
  "del-food":
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80",
  "del-grocery":
    "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80",
  "del-equip":
    "https://images.unsplash.com/photo-1618516976920-83eba0a2bcf0?w=600&q=80",
  "del-diet":
    "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&q=80",

  // ── Appliance Cleaning ────────────────────────────────────────
  "app-bed":
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
  "app-sofa":
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
  "app-curtain":
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
  "app-wardrobe":
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
  "app-dining":
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
  "app-fridge":
    "https://images.unsplash.com/photo-1571898183439-ff92af6f0a8a?w=600&q=80",
  "app-ac":
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
  "app-fan":
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
  "app-tv":
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
  "app-stove":
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
  "app-chimney":
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",

  // ── Home Care ─────────────────────────────────────────────────
  "hc-day":
    "https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?w=600&q=80",
  "hc-maid":
    "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&q=80",
  "hc-nurse":
    "https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?w=600&q=80",
  "hc-elderly":
    "https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?w=600&q=80",

  // ── Insurance ─────────────────────────────────────────────────
  "ins-health":
    "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&q=80",
  "ins-life":
    "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&q=80",
  "ins-vehicle":
    "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&q=80",
  "ins-general":
    "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&q=80",

  // ── Emergency ─────────────────────────────────────────────────
  "em-amb":
    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80",
  "em-road":
    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80",
  "em-women":
    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80",
  "em-child":
    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80",
  "em-precaution":
    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80",

  // ── Home Cleaning ─────────────────────────────────────────────
  "cl-full":
    "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&q=80",
  "cl-kitchen":
    "https://images.unsplash.com/photo-1556909114-44e3e70034e2?w=600&q=80",
  "cl-restroom":
    "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&q=80",
  "cl-tank":
    "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&q=80",
  "cl-appliance":
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
  "cl-window":
    "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&q=80",
  "cl-fan":
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
  "cl-sofa":
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
  "cl-floor":
    "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&q=80",
  "cl-sanitary":
    "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&q=80",
  "cl-disinfect":
    "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&q=80",
};

/**
 * Hero banner images for the HomeDashboard carousel.
 */
export const HOME_BANNER_IMAGES: string[] = [
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80", // Home Cleaning
  "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&q=80", // RO Water
  "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=80", // Pet Care
  "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80", // Emergency
  "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80", // Insurance
];

/**
 * Vendor avatar placeholder images.
 * Used as fallback when vendor has no profile photo.
 */
export const VENDOR_AVATAR_PLACEHOLDERS: string[] = [
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80",
];

/**
 * Returns the category image URL for a given category ID.
 * Falls back to a default cleaning image if not found.
 */
export function getCategoryImage(categoryId: string): string {
  return (
    SERVICE_CATEGORY_IMAGES[categoryId] ??
    "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&q=80"
  );
}

/**
 * Returns the detail image URL for a given sub-service ID.
 * Falls back to the category image if sub-service image not found.
 */
export function getSubServiceImage(
  subServiceId: string,
  categoryId: string
): string {
  return (
    SERVICE_DETAIL_IMAGES[subServiceId] ??
    SERVICE_CATEGORY_IMAGES[categoryId] ??
    "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&q=80"
  );
}

/**
 * Returns a random vendor avatar placeholder.
 */
export function getVendorAvatar(vendorId?: string): string {
  const idx = vendorId
    ? vendorId.charCodeAt(vendorId.length - 1) % VENDOR_AVATAR_PLACEHOLDERS.length
    : 0;
  return VENDOR_AVATAR_PLACEHOLDERS[idx];
}
