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
  increment,
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
  | "service_ended"
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
  audioUrl?:       string;
  rating?:         number;
  review?:         string;
  reviewTags?:     string[];
  tip?:            string;
  rated?:          boolean;
  checklist?:      string[];
  checklistDone?:  string[];
  completedAt?:    any;
  createdAt?:      any;
  cancelledAt?:    any;
  cancelledBy?:    string;
}

// ── JOBS: Listen for all bookings assigned to this vendor ───────────────────
export function subscribeToVendorJobs(
  vendorId: string,
  onChange: (bookings: FirestoreBooking[]) => void,
  alternateIds: (string | undefined | null)[] = []
) {
  const idSet = new Set<string>();
  const clean = (vendorId || '').trim();
  if (clean) {
    idSet.add(clean);
    idSet.add(clean.toUpperCase());
    idSet.add(clean.toLowerCase());
  }
  alternateIds.forEach((alt) => {
    if (alt && typeof alt === 'string') {
      const c = alt.trim();
      if (c) {
        idSet.add(c);
        idSet.add(c.toUpperCase());
        idSet.add(c.toLowerCase());
      }
    }
  });

  const ids = Array.from(idSet).slice(0, 10);
  if (ids.length === 0) {
    onChange([]);
    return () => {};
  }

  const q = ids.length === 1
    ? query(collection(db, "bookings"), where("vendorId", "==", ids[0]))
    : query(collection(db, "bookings"), where("vendorId", "in", ids));

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

// ── Direct unassigned broadcasts (all incoming customer bookings) ────────────
export function subscribeToNewRequests(
  onChange: (bookings: FirestoreBooking[]) => void
) {
  const q = query(
    collection(db, "bookings"),
    where("status", "==", "requested")
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const jobs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as FirestoreBooking));
      onChange(jobs);
    },
    (err) => {
      console.warn("[subscribeToNewRequests] Error:", err);
    }
  );
}

// ── Vendor cancels an accepted job ────────────────────────────────────────────
export async function cancelBooking(
  bookingId: string,
  vendorId?: string,
  vendorName?: string
): Promise<void> {
  await updateDoc(doc(db, "bookings", bookingId), {
    status:                "cancelled",
    cancelledAt:           serverTimestamp(),
    cancelledBy:           "vendor",
    vendorId:              vendorId ?? null,
    vendorName:            vendorName ?? "Vendor",
    rejected:              true,
    rejectedAt:            serverTimestamp(),
    lastRejectionNoticeId: Date.now().toString(),
  });

  if (vendorId) {
    try {
      await updateDoc(doc(db, "vendors", vendorId), {
        cancelCount: increment(1),
        lastCancelledAt: serverTimestamp(),
      });
    } catch (e) {
      console.warn("[cancelBooking] Could not increment vendor cancelCount:", e);
    }
  }
}

// ── Vendor updates checklist items ──────────────────────────────────────────
export async function updateBookingChecklist(
  bookingId: string,
  checklistDone: string[],
  checklist?: string[]
): Promise<void> {
  const data: Record<string, any> = { checklistDone };
  if (checklist && checklist.length > 0) {
    data.checklist = checklist;
  }
  await updateDoc(doc(db, "bookings", bookingId), data);
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

  let customerBookingData: FirestoreBooking | null = null;
  await runTransaction(db, async (transaction) => {
    const bookingRef  = doc(db, "bookings", bookingId);
    const bookingSnap = await transaction.get(bookingRef);

    if (!bookingSnap.exists()) {
      throw new Error("Booking not found.");
    }

    const data = bookingSnap.data() as FirestoreBooking;
    customerBookingData = data;

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

  // Notify customer that booking is confirmed with vendor assignment
  if (customerBookingData && (customerBookingData as any).customerId) {
    const d = customerBookingData as any;
    notifyCustomerBookingConfirmed(
      d.customerId,
      d.serviceCategory || "Service",
      d.subServiceName || "Service",
      d.scheduledAt || d.bookingDate || "Scheduled Date",
      d.otp || ""
    ).catch((err) => console.warn("[acceptJob] Failed to push confirmed notif to customer:", err));
  }

  // Reset consecutive skip count upon successfully accepting an order
  if (vendorId) {
    try {
      const vRef = doc(db, "vendors", vendorId);
      await updateDoc(vRef, {
        skippedCount: 0,
        status: "active",
        isLocked: false,
      });
    } catch (e) {
      console.warn("[acceptJob] Could not reset vendor skip count:", e);
    }
  }
}

// ── Reject / Skip a job with 3-Skip Auto-Lock enforcement ────────────────────
export async function rejectJob(
  bookingId: string,
  vendorId?: string,
  vendorName?: string
): Promise<{ locked: boolean; skippedCount: number }> {
  await updateDoc(doc(db, "bookings", bookingId), {
    status:                "requested",
    vendorId:              null,
    vendorName:            "Pending Admin Assignment",
    vendorImage:           null,
    rejected:              true,
    rejectedBy:            vendorId || null,
    rejectedByName:        vendorName || "Vendor",
    rejectedAt:            serverTimestamp(),
    lastRejectionNoticeId: Date.now().toString(),
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

  if (status === "completed" || status === "service_ended") {
    update.serviceEndedAt = serverTimestamp();
    update.paymentStatus = "paid";
  }

  await updateDoc(doc(db, "bookings", bookingId), update);

  // When ending/completing a job, update the vendor document in Firestore for Admin Web visibility
  if ((status === "completed" || status === "service_ended") && vendorId) {
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
  speed:     number = 0,
  bookingId?: string
): Promise<void> {
  const cleanId = (vendorId || "").trim();
  if (cleanId) {
    try {
      await setDoc(doc(db, "vendors", cleanId), {
        location: {
          lat,
          lng,
          heading,
          speed,
          updatedAt: serverTimestamp(),
        },
        isOnline: true,
      }, { merge: true });
    } catch (e) {
      console.warn("[updateVendorLocation] vendor doc update error:", e);
    }
  }

  if (bookingId) {
    try {
      await setDoc(doc(db, "bookings", bookingId), {
        vendorLat: lat,
        vendorLng: lng,
        vendorHeading: heading,
        vendorSpeed: speed,
      }, { merge: true });
    } catch (e) {
      console.warn("[updateVendorLocation] booking doc location update error:", e);
    }
  }
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

// ── Send Booking Confirmed via Expo Push API to Customer ───────────────────────
export async function notifyCustomerBookingConfirmed(
  customerId: string,
  serviceName: string,
  subServiceName: string,
  scheduledAt: string,
  otp: string
) {
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
            title: "✅ Booking Confirmed!",
            body: `${subServiceName} (${serviceName}) on ${scheduledAt}. Your OTP for the vendor is: ${otp}`,
            data: { screen: "MyBookings" },
          }),
        });
        console.log("Booking Confirmed Push sent to customer");
      }
    }
  } catch (error) {
    console.error("Failed to send booking confirmed push notification:", error);
  }
}

