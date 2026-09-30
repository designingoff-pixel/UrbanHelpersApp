// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Urban Captain Vendor App â€” Firestore Service
//
// Replaces Socket.io with Firestore real-time listeners.
// Same Firebase project as customer app + admin dashboard.
//
// Collections used:
//   /bookings/{bookingId}  â€” booking status + OTP
//   /vendors/{vendorId}    â€” vendor online status + live location
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "./firebase";

// â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type BookingStatus =
  | "requested"
  | "assigned"
  | "accepted"
  | "en_route"
  | "arrived"
  | "in_progress"
  | "completed"
  | "cancelled";

export interface FirestoreBooking {
  id:              string;
  customerId:      string;
  customerName:    string;
  customerPhone?:  string; // â† added
  vendorId?:       string;
  vendorName?:     string;
  vendorPhone?:    string; // â† added
  vendorImage?:    string; // â† added
  serviceCategory: string;
  subServiceName:  string;
  status:          BookingStatus;
  address:         string;
  scheduledAt:     string;
  price:           number;
  priceLabel:      string;
  paymentStatus:   string;
  safety:          string;
  otp?:            string;
  customerLat?:    number;
  customerLng?:    number;
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// JOBS â€” Listen for bookings assigned to this vendor
// Call this on the HomeScreen / JobsScreen to get live job list
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function subscribeToVendorJobs(
  vendorId: string,
  onChange:  (bookings: FirestoreBooking[]) => void
) {
  const q = query(
    collection(db, "bookings"),
    where("vendorId", "==", vendorId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const jobs = snapshot.docs
        .map((d) => ({ id: d.id, ...d.data() } as FirestoreBooking))
        .filter((b) =>
          ["assigned", "accepted", "en_route", "arrived", "in_progress"].includes(b.status)
        );
      onChange(jobs);
    },
    (err) => {
      console.warn("[subscribeToVendorJobs] Error:", err);
    }
  );
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Listen for new booking requests that have NO vendor assigned yet.
// These are broadcast to ALL online vendors â€” first to accept wins.
// Uses vendorName == "Vendor pending" as the unassigned signal
// (set by customer app's createBooking).
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function subscribeToNewRequests(
  onChange: (bookings: FirestoreBooking[]) => void
) {
  // Direct unassigned broadcasts disabled. Bookings are assigned exclusively by Admin.
  onChange([]);
  return () => {};
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Accept a job â€” uses a Firestore TRANSACTION to prevent two vendors
// accepting the same job simultaneously (race condition protection).
// Only succeeds if booking is still "requested" or "assigned" with no vendor.
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function acceptJob(
  bookingId: string,
  vendorId:  string,
  vendorName: string,
  vendorPhone: string,
  vendorImage?: string
): Promise<void> {
  const { runTransaction } = await import("firebase/firestore");

  await runTransaction(db, async (transaction) => {
    const bookingRef  = doc(db, "bookings", bookingId);
    const bookingSnap = await transaction.get(bookingRef);

    if (!bookingSnap.exists()) {
      throw new Error("Booking not found.");
    }

    const data = bookingSnap.data() as FirestoreBooking;

    if (
      data.status === "accepted" ||
      data.status === "en_route"  ||
      data.status === "in_progress"
    ) {
      throw new Error("This service is taken by another vendor.");
    }

    // Lock the booking to this vendor
    transaction.update(bookingRef, {
      vendorId,
      vendorName,
      vendorPhone, // â† save vendor phone to booking
      vendorImage: vendorImage ?? null, // â† save vendor avatar
      status:     "accepted",
      acceptedAt: serverTimestamp(),
    });
  });
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Reject a job
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function rejectJob(bookingId: string): Promise<void> {
  await updateDoc(doc(db, "bookings", bookingId), {
    status:     "requested",   // back to requested so admin can reassign
    vendorId:   null,
    vendorName: "Pending Admin Assignment",
    vendorImage: null,
    rejectedAt: serverTimestamp(),
  });
}

// ============================================================================
// Update booking status
// ============================================================================
export async function updateBookingStatus(
  bookingId: string,
  status:    BookingStatus
): Promise<void> {
  const update: Record<string, any> = {
    status,
    [`${status}At`]: serverTimestamp(),
  };

  if (status === "completed") {
    update.completedAt = serverTimestamp();
  }

  await updateDoc(doc(db, "bookings", bookingId), update);
}

export async function updateBookingAudio(
  bookingId: string,
  audioUrl: string
): Promise<void> {
  await updateDoc(doc(db, "bookings", bookingId), {
    audioUrl,
  });
}

export async function updateVendorLocation(
  vendorId:  string,
  lat:       number,
  lng:       number,
  heading:   number = 0,
  speed:     number = 0
): Promise<void> {
  await updateDoc(doc(db, "vendors", vendorId), {
    location: {
      lat,
      lng,
      heading,
      speed,
      updatedAt: serverTimestamp(),
    },
    isOnline: true,
  });
}

export async function setVendorOnlineStatus(
  vendorId: string,
  isOnline: boolean
): Promise<void> {
  await updateDoc(doc(db, "vendors", vendorId), {
    isOnline,
    lastSeen: serverTimestamp(),
  });
}


export async function verifyOTP(
  bookingId:   string,
  enteredOTP:  string
): Promise<boolean> {
  // Read current OTP from Firestore
  const { getDoc } = await import("firebase/firestore");
  const snap = await getDoc(doc(db, "bookings", bookingId));

  if (!snap.exists()) return false;

  const booking = snap.data() as FirestoreBooking;
  const storedOtp = String(booking.otp || '').trim();
  const inputOtp = String(enteredOTP || '').trim();
  const correct  = storedOtp === inputOtp || (Boolean(storedOtp) && parseInt(storedOtp, 10) === parseInt(inputOtp, 10));

  if (correct) {
    // OTP verified â€” start service
    await updateDoc(doc(db, "bookings", bookingId), {
      status:       "in_progress",
      otpVerified:  true,
      startedAt:    serverTimestamp(),
    });
  }

  return correct;
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Send OTP via Expo Push API to Customer
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function notifyCustomerOTP(customerId: string, otp: string) {
  try {
    const userDoc = await getDoc(doc(db, "users", customerId));
    if (userDoc.exists()) {
      const data = userDoc.data();
      if (data.pushToken) {
        // Send Expo Push Notification
        await fetch("https://exp.host/--/api/v2/push/send", {
          method: "POST",
          headers: {
            "Accept": "application/json",
            "Accept-encoding": "gzip, deflate",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            to: data.pushToken,
            sound: "default",
            title: "ðŸ“ Vendor Arrived!",
            body: `Your vendor has arrived. Share this OTP with them: ${otp}`,
            data: { screen: "LiveTracking" },
          }),
        });
        console.log("OTP Push sent to customer");
      } else {
        console.warn("Customer does not have a push token saved.");
      }
    }
  } catch (error) {
    console.error("Failed to send OTP push notification:", error);
  }
}

