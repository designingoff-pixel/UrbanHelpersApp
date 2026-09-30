import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "@/services/firebase";

export type BookingStatus =
  | "requested"
  | "assigned"
  | "accepted"
  | "en_route"
  | "arrived"
  | "in_progress"
  | "completed"
  | "cancelled";

export interface Booking {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  vendorName: string;
  vendorPhone?: string;
  vendorImage?: string; // ← added
  serviceCategory: string;
  subServiceName: string;
  status: BookingStatus;
  address: string;
  scheduledAt: string;
  price: number;
  priceLabel: string;
  originalPrice?: number;
  discountAmount?: number;
  couponCode?: string | null;
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  safety: "normal" | "watch" | "alert";
  otp?: string;
}

export interface CreateBookingInput {
  customerId:      string;
  customerName:    string;
  customerPhone:   string; // ← added customer phone
  serviceCategory: string;
  subServiceName:  string;
  address:         string;
  scheduledAt:     string;
  price:           number;
  priceLabel:      string;
  originalPrice?:  number;
  discountAmount?: number;
  couponCode?:     string | null;
  customerLat?:    number;   // GPS coords stored so vendor map + customer map can show both pins
  customerLng?:    number;
  paymentStatus?:  "pending" | "paid" | "failed" | "refunded";
  paymentId?:      string;
}

/** Generates a random 4-digit OTP string */
function generateOTP(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

/** Writes a new booking request. Matches the `Booking` shape the admin dashboard reads. */
export async function createBooking(input: CreateBookingInput): Promise<{ bookingId: string, otp: string }> {
  const generatedOTP = generateOTP();
  const docRef = await addDoc(collection(db, "bookings"), {
    ...input,
    vendorName: "Pending Admin Assignment",
    vendorId: null,
    status: "requested" as BookingStatus,
    paymentStatus: input.paymentStatus || "pending",
    paymentId: input.paymentId || null,
    safety: "normal",
    otp: generatedOTP,          // ← customer OTP for vendor verification
    createdAt: serverTimestamp(),
  });
  return { bookingId: docRef.id, otp: generatedOTP };
}

/** Live-subscribes to every booking made by this customer, newest first. */
export function subscribeToUserBookings(
  uid: string,
  onChange: (bookings: Booking[]) => void
) {
  const q = query(
    collection(db, "bookings"),
    where("customerId", "==", uid)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Booking));
      docs.sort((a, b) => {
        const timeA = (a as any).createdAt?.toMillis
          ? (a as any).createdAt.toMillis()
          : (a.scheduledAt ? new Date(a.scheduledAt).getTime() : 0);
        const timeB = (b as any).createdAt?.toMillis
          ? (b as any).createdAt.toMillis()
          : (b.scheduledAt ? new Date(b.scheduledAt).getTime() : 0);
        return timeB - timeA;
      });
      onChange(docs);
    },
    (err) => {
      console.warn("subscribeToUserBookings error:", err);
    }
  );
}

// ─── Cancellation ─────────────────────────────────────────────────────────────

export type CancellationReason =
  | "Changed my mind"
  | "Found another service"
  | "Booked by mistake"
  | "Service no longer required"
  | "Other";

export const CANCELLATION_REASONS: CancellationReason[] = [
  "Changed my mind",
  "Found another service",
  "Booked by mistake",
  "Service no longer required",
  "Other",
];

/** Statuses that are no longer eligible for customer cancellation. */
const NON_CANCELLABLE_STATUSES = new Set<BookingStatus>(["completed", "cancelled"]);

/**
 * Cancels a booking in Firestore.
 *
 * Safety guarantees:
 *  - Ownership: verifies the booking's customerId matches the caller's uid.
 *  - Race-condition guard: re-fetches the live document status immediately
 *    before writing, rejecting if the status has changed to non-cancellable.
 *  - No local-only mutation: only updates the UI indirectly via the live
 *    onSnapshot subscription in subscribeToUserBookings.
 *
 * @throws Error with descriptive message on ownership, status, or network failure.
 */
export async function cancelBooking(
  bookingId: string,
  callerUid: string,
  reason: CancellationReason
): Promise<void> {
  const bookingRef = doc(db, "bookings", bookingId);

  // Re-fetch the live document to guard against race conditions.
  const snap = await getDoc(bookingRef);
  if (!snap.exists()) {
    throw new Error("Booking not found.");
  }

  const data = snap.data() as Booking;

  // Ownership check — customer may only cancel their own bookings.
  if (data.customerId !== callerUid) {
    throw new Error("You are not authorised to cancel this booking.");
  }

  // Status validation — re-confirm eligibility using the live value.
  if (NON_CANCELLABLE_STATUSES.has(data.status)) {
    throw new Error(
      data.status === "cancelled"
        ? "This booking has already been cancelled."
        : "This booking cannot be cancelled because it is already completed."
    );
  }

  // Persist the cancellation.
  await updateDoc(bookingRef, {
    status: "cancelled" as BookingStatus,
    cancellationReason: reason,
    cancelledAt: serverTimestamp(),
    cancelledBy: "customer",
  });
}
