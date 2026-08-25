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
  vendorName: string;
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
  customerId: string;
  customerName: string;
  serviceCategory: string;
  subServiceName: string;
  address: string;
  scheduledAt: string;
  price: number;
  priceLabel: string;
}

/** Generates a random 4-digit OTP string */
function generateOTP(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

/** Writes a new booking request. Matches the `Booking` shape the admin dashboard reads. */
export async function createBooking(input: CreateBookingInput): Promise<string> {
  const docRef = await addDoc(collection(db, "bookings"), {
    ...input,
    vendorName: "Vendor pending",
    status: "requested" as BookingStatus,
    paymentStatus: "pending",
    safety: "normal",
    otp: generateOTP(),          // ← customer OTP for vendor verification
    createdAt: serverTimestamp(),
  });
  return docRef.id;
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
