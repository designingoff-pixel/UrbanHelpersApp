import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
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
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  safety: "normal" | "watch" | "alert";
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
    vendorName: "Vendor pending",
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
    where("customerId", "==", uid),
    orderBy("scheduledAt", "desc")
  );

  return onSnapshot(q, (snapshot) => {
    onChange(
      snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Booking))
    );
  });
}
