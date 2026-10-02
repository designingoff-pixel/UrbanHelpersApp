import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
  setDoc,
} from "firebase/firestore";
import { db } from "./firebase";

// ── Types ─────────────────────────────────────────────────────────────────────

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
  customerPhone?:  string;
  vendorId?:       string;
  vendorName?:     string;
  vendorPhone?:    string;
  vendorImage?:    string;
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
  beforePhoto?:    string;
  afterPhoto?:     string;
  rating?:         number;
  review?:         string;
  reviewTags?:     string[];
  rated?:          boolean;
  completedAt?:    any;
  createdAt?:      any;
}

// ── JOBS: Listen for all bookings assigned to this vendor ───────────────────
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
      const jobs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as FirestoreBooking));
      onChange(jobs);
    },
    (err) => {
      console.warn("[subscribeToVendorJobs] Error:", err);
    }
  );
}

// ── Listen for live vendor profile rating & earnings from Admin / Customers ───
export function subscribeToVendorProfile(
  vendorId: string,
  onChange: (vendorData: any) => void
) {
  return onSnapshot(
    doc(db, "vendors", vendorId),
    (snap) => {
      if (snap.exists()) {
        onChange(snap.data());
      }
    },
    (err) => console.warn("[subscribeToVendorProfile] Error:", err)
  );
}

// ── Direct unassigned broadcasts (managed via Admin portal) ───────────────────
export function subscribeToNewRequests(
  onChange: (bookings: FirestoreBooking[]) => void
) {
  onChange([]);
  return () => {};
}

// ── Accept a job ─────────────────────────────────────────────────────────────
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
      vendorPhone,
      vendorImage: vendorImage ?? null,
      status:     "accepted",
      acceptedAt: serverTimestamp(),
    });
  });
}

// ── Reject / Skip a job with 3-Skip Auto-Lock enforcement ────────────────────
export async function rejectJob(bookingId: string, vendorId?: string): Promise<{ locked: boolean; skippedCount: number }> {
  await updateDoc(doc(db, "bookings", bookingId), {
    status:     "requested",
    vendorId:   null,
    vendorName: "Pending Admin Assignment",
    vendorImage: null,
    rejectedAt: serverTimestamp(),
  });

  let locked = false;
  let newCount = 1;

  if (vendorId) {
    try {
      const vRef = doc(db, "vendors", vendorId);
      const vSnap = await getDoc(vRef);
      if (vSnap.exists()) {
        const vData = vSnap.data();
        newCount = (vData.skippedCount || 0) + 1;
        const updateData: Record<string, any> = {
          skippedCount: newCount,
          lastSkippedAt: serverTimestamp(),
        };

        if (newCount >= 3) {
          updateData.status = "locked";
          updateData.isLocked = true;
          updateData.lockReason = "Profile locked automatically due to 3 consecutive skipped service requests.";
          locked = true;
        }

        await updateDoc(vRef, updateData);
      }
    } catch (err) {
      console.warn("[rejectJob] Could not update vendor skip count:", err);
    }
  }

  return { locked, skippedCount: newCount };
}

// ── Update booking status & sync with vendor statistics ───────────────────────
export async function updateBookingStatus(
  bookingId: string,
  status:    BookingStatus,
  vendorId?: string,
  vendorEarnings?: number
): Promise<void> {
  const update: Record<string, any> = {
    status,
    [`${status}At`]: serverTimestamp(),
  };

  if (status === "completed") {
    update.completedAt = serverTimestamp();
    update.paymentStatus = "paid";
  }

  await updateDoc(doc(db, "bookings", bookingId), update);

  // When completing a job, update the vendor document in Firestore for Admin Web visibility
  if (status === "completed" && vendorId) {
    try {
      const vRef = doc(db, "vendors", vendorId);
      const vSnap = await getDoc(vRef);
      if (vSnap.exists()) {
        const vData = vSnap.data();
        const prevCompleted = vData.completedJobs || 0;
        const prevTotal = vData.totalEarnings || 0;
        const prevToday = vData.todayEarnings || 0;
        await updateDoc(vRef, {
          completedJobs: prevCompleted + 1,
          totalEarnings: prevTotal + (vendorEarnings || 0),
          todayEarnings: prevToday + (vendorEarnings || 0),
          skippedCount: 0, // Reset skip counter on successful completion
          lastCompletedAt: serverTimestamp(),
        });
      }
    } catch (err) {
      console.warn("[updateBookingStatus] Could not update vendor doc stats:", err);
    }
  }
}

export async function updateBookingPhotos(
  bookingId: string,
  photos: { beforePhoto?: string | null; afterPhoto?: string | null }
): Promise<void> {
  const updateData: Record<string, any> = {};
  if (photos.beforePhoto !== undefined) updateData.beforePhoto = photos.beforePhoto;
  if (photos.afterPhoto !== undefined) updateData.afterPhoto = photos.afterPhoto;
  await updateDoc(doc(db, "bookings", bookingId), updateData);
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
  const snap = await getDoc(doc(db, "bookings", bookingId));

  if (!snap.exists()) return false;

  const booking = snap.data() as FirestoreBooking;
  const storedOtp = String(booking.otp || '').trim();
  const inputOtp = String(enteredOTP || '').trim();
  const correct  = storedOtp === inputOtp || (Boolean(storedOtp) && parseInt(storedOtp, 10) === parseInt(inputOtp, 10));

  if (correct) {
    await updateDoc(doc(db, "bookings", bookingId), {
      status:       "in_progress",
      otpVerified:  true,
      startedAt:    serverTimestamp(),
    });
  }

  return correct;
}

// ── Send OTP via Expo Push API to Customer ────────────────────────────────────
export async function notifyCustomerOTP(customerId: string, otp: string) {
  try {
    const userDoc = await getDoc(doc(db, "users", customerId));
    if (userDoc.exists()) {
      const data = userDoc.data();
      if (data.pushToken) {
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
            title: "📍 Vendor Arrived!",
            body: `Your vendor has arrived. Share this OTP with them: ${otp}`,
            data: { screen: "LiveTracking" },
          }),
        });
        console.log("OTP Push sent to customer");
      }
    }
  } catch (error) {
    console.error("Failed to send OTP push notification:", error);
  }
}
