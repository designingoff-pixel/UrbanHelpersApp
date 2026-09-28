import AsyncStorage from "@react-native-async-storage/async-storage";
import { getDoc, doc, collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/services/firebase";

export interface Offer {
  id: string;
  title: string;
  description: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number; // e.g. 50 for 50%, or 100 for ₹100
  maxDiscount?: number; // useful for percentage (e.g. max ₹200 off)
  minBookingAmount?: number;
  discountDisplay: string;
  validTill: string;
  validTillDate: Date;
  categoryId: string | null;
  gradient: [string, string];
  icon: string;
  isFirstBookingOnly?: boolean;
}

export const OFFERS: Offer[] = [
  {
    id: "off-1",
    title: "50% OFF on First Booking",
    description: "Use code WELCOME50. Valid for all new users on any service.",
    code: "WELCOME50",
    discountType: "percentage",
    discountValue: 50,
    maxDiscount: 500, // Let's set a reasonable max discount
    discountDisplay: "50% OFF",
    validTill: "Aug 31, 2026",
    validTillDate: new Date("2026-08-31T23:59:59"),
    categoryId: null,
    gradient: ["#7c3aed", "#a78bfa"],
    icon: "gift-outline",
    isFirstBookingOnly: true,
  },
  {
    id: "off-2",
    title: "RO Service Special",
    description: "Get ₹100 off on Filter Change + Free TDS Checking.",
    code: "RO100",
    discountType: "fixed",
    discountValue: 100,
    discountDisplay: "₹100 OFF",
    validTill: "Sep 15, 2026",
    validTillDate: new Date("2026-09-15T23:59:59"),
    categoryId: "ro",
    gradient: ["#0284c7", "#38bdf8"],
    icon: "water-outline",
  },
  {
    id: "off-3",
    title: "Home Cleaning Bundle",
    description: "Book Full Home Cleaning + Kitchen Cleaning at ₹2,299 (save ₹399).",
    code: "CLEAN2X",
    discountType: "fixed",
    discountValue: 399,
    minBookingAmount: 2299,
    discountDisplay: "Save ₹399",
    validTill: "Sep 30, 2026",
    validTillDate: new Date("2026-09-30T23:59:59"),
    categoryId: "cleaning",
    gradient: ["#00bcd4", "#0097a7"],
    icon: "sparkles-outline",
  },
  {
    id: "off-4",
    title: "Pet Care Weekend Deal",
    description: "Saturday & Sunday — Get Grooming + Bathing at ₹799 (save ₹199).",
    code: "PETWEEKEND",
    discountType: "fixed",
    discountValue: 199,
    minBookingAmount: 799,
    discountDisplay: "Save ₹199",
    validTill: "Every Weekend",
    validTillDate: new Date("2026-12-31T23:59:59"), // Assuming valid for the year
    categoryId: "pet",
    gradient: ["#db2777", "#f472b6"],
    icon: "paw-outline",
  },
  {
    id: "off-5",
    title: "Refer & Earn",
    description: "Refer a friend and both of you get ₹150 wallet credits after their first booking.",
    code: "REFER150",
    discountType: "fixed",
    discountValue: 0, // This is a referral code, not an instant discount
    discountDisplay: "₹150 Credits",
    validTill: "Ongoing",
    validTillDate: new Date("2099-12-31T23:59:59"),
    categoryId: null,
    gradient: ["#065f46", "#34d399"],
    icon: "people-outline",
  },
  {
    id: "off-6",
    title: "Pest Control Season Offer",
    description: "Monsoon special — Anti-Cockroach + Anti-Rodent combo at ₹999.",
    code: "PEST999",
    discountType: "fixed",
    discountValue: 200, // Assuming normal is 1199
    minBookingAmount: 999,
    discountDisplay: "Combo ₹999",
    validTill: "Sep 30, 2026",
    validTillDate: new Date("2026-09-30T23:59:59"),
    categoryId: "pest",
    gradient: ["#15803d", "#4ade80"],
    icon: "bug-outline",
  },
];

export interface CouponValidationResult {
  valid: boolean;
  message?: string;
  discountAmount: number;
  offer?: Offer;
}

const COUPON_KEY = "urban_helpers_active_coupon";

export async function getStoredCoupon(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(COUPON_KEY);
  } catch (e) {
    return null;
  }
}

export async function setStoredCoupon(code: string | null): Promise<void> {
  try {
    if (code) {
      await AsyncStorage.setItem(COUPON_KEY, code);
    } else {
      await AsyncStorage.removeItem(COUPON_KEY);
    }
  } catch (e) {
    console.error("Failed to save coupon", e);
  }
}

export async function validateCoupon(
  code: string,
  categoryId: string | undefined,
  originalPrice: number,
  customerId: string
): Promise<CouponValidationResult> {
  const upperCode = code.trim().toUpperCase();
  const offer = OFFERS.find((o) => o.code.toUpperCase() === upperCode);

  if (!offer) {
    return { valid: false, message: "Invalid coupon code.", discountAmount: 0 };
  }

  // Check expiry
  if (new Date() > offer.validTillDate) {
    return { valid: false, message: "This coupon has expired.", discountAmount: 0 };
  }

  // Check category restriction
  if (offer.categoryId && offer.categoryId !== categoryId) {
    return { valid: false, message: "This coupon is not valid for this service.", discountAmount: 0 };
  }

  // Check minimum booking amount
  if (offer.minBookingAmount && originalPrice < offer.minBookingAmount) {
    return { valid: false, message: `Minimum booking amount is ₹${offer.minBookingAmount}.`, discountAmount: 0 };
  }

  // Check referral (not instant discount)
  if (upperCode === "REFER150") {
    return { valid: false, message: "Referral codes are applied to wallet after booking completion.", discountAmount: 0 };
  }

  // Check first booking
  if (offer.isFirstBookingOnly) {
    try {
      const bookingsQuery = query(collection(db, "bookings"), where("customerId", "==", customerId));
      const snap = await getDocs(bookingsQuery);
      if (!snap.empty) {
        return { valid: false, message: "This coupon is valid for first-time bookings only.", discountAmount: 0 };
      }
    } catch (e) {
      console.error("Failed to check past bookings for coupon validation", e);
      return { valid: false, message: "Could not validate eligibility. Try again later.", discountAmount: 0 };
    }
  }

  // Calculate discount
  let discount = 0;
  if (offer.discountType === "fixed") {
    discount = offer.discountValue;
  } else if (offer.discountType === "percentage") {
    discount = (originalPrice * offer.discountValue) / 100;
    if (offer.maxDiscount && discount > offer.maxDiscount) {
      discount = offer.maxDiscount;
    }
  }

  // Ensure discount doesn't exceed original price
  if (discount > originalPrice) {
    discount = originalPrice;
  }

  return {
    valid: true,
    discountAmount: Math.floor(discount), // Round down
    offer,
  };
}
