import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
  setDoc,
  increment,
  runTransaction,
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
  customerPhoto?:  string;
  customerAvatar?: string;
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
  cancelledVendorId?: string;
  rejected?:       boolean;
  rejectedBy?:     string | null;
  rejectedByName?: string;
  rejectedAt?:     any;
  lastRejectionNoticeId?: string;
  acceptedAt?:     any;
  serviceEndedAt?: any;
  startedAt?:      any;
  otpVerified?:    boolean;
  vendorLat?:      number;
  vendorLng?:      number;
  vendorHeading?:  number;
  vendorSpeed?:    number;
}

// ── JOBS: Listen for all bookings assigned to this vendor ───────────────────
export function subscribeToVendorJobs(
  vendorId: string,
  onChange: (bookings: FirestoreBooking[]) => void,
  alternateIds: (string | undefined | null)[] = []
) {
  if (!db) {
    console.warn("[subscribeToVendorJobs] Firestore db is not initialized");
    onChange([]);
    return () => {};
  }

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

  try {
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
  } catch (err) {
    console.warn("[subscribeToVendorJobs] Failed to establish listener:", err);
    onChange([]);
    return () => {};
  }
}

// ── Listen for live vendor profile rating & earnings from Admin / Customers ───
export function subscribeToVendorProfile(
  vendorId: string,
  onChange: (vendorData: any) => void
) {
  if (!db || !vendorId) {
    return () => {};
  }
  try {
    return onSnapshot(
      doc(db, "vendors", vendorId),
      (snap) => {
        if (snap.exists()) {
          onChange(snap.data());
        }
      },
      (err) => console.warn("[subscribeToVendorProfile] Error:", err)
    );
  } catch (err) {
    console.warn("[subscribeToVendorProfile] Failed to establish listener:", err);
    return () => {};
  }
}

// ── Direct unassigned broadcasts disabled (Orders are assigned exclusively by Admin) ──
export function subscribeToNewRequests(
  onChange: (bookings: FirestoreBooking[]) => void
) {
  // Orders must only reach vendors when assigned by Admin.
  onChange([]);
  return () => {};
}

// ── Reject/Release assignment back to unassigned if vendor is blocked ────────
export async function rejectAssignmentDueToBlock(
  bookingId: string,
  vendorId: string
): Promise<void> {
  if (!db || !bookingId) return;
  try {
    await updateDoc(doc(db, "bookings", bookingId), {
      status: "requested",
      vendorId: null,
      vendorName: "Pending Admin Assignment",
      vendorImage: null,
      rejected: true,
      rejectedBy: vendorId,
      rejectedAt: serverTimestamp(),
      lastRejectionNoticeId: Date.now().toString(),
    });
  } catch (err) {
    console.warn("[rejectAssignmentDueToBlock] Failed to release booking:", err);
  }
}

// ── Vendor cancels an accepted/assigned job ──────────────────────────────────
export async function cancelBooking(
  bookingId: string,
  vendorId?: string,
  vendorName?: string
): Promise<{ blocked: boolean; cancelCount: number }> {
  if (!db) throw new Error("Firestore is not initialized");
  if (!bookingId) throw new Error("Booking ID is required for cancellation");

  let vRef: any = null;
  let resolvedVendorId = (vendorId || "").trim();

  // 1. Resolve vendor doc reference
  if (resolvedVendorId) {
    vRef = doc(db, "vendors", resolvedVendorId);
    const snap = await getDoc(vRef);
    if (!snap.exists()) {
      const q = query(collection(db, "vendors"), where("vendorId", "==", resolvedVendorId));
      const qSnap = await getDocs(q);
      if (!qSnap.empty) {
        vRef = qSnap.docs[0].ref;
        resolvedVendorId = qSnap.docs[0].data().vendorId || resolvedVendorId;
      }
    }
  }

  const bRef = doc(db, "bookings", bookingId);
  if (!vRef) {
    const bSnap = await getDoc(bRef);
    if (bSnap.exists()) {
      const bData = bSnap.data();
      const bVendorId = bData.vendorId || bData.assignedVendorId || bData.cancelledVendorId;
      if (bVendorId) {
        resolvedVendorId = bVendorId;
        vRef = doc(db, "vendors", bVendorId);
        const snap = await getDoc(vRef);
        if (!snap.exists()) {
          const q = query(collection(db, "vendors"), where("vendorId", "==", bVendorId));
          const qSnap = await getDocs(q);
          if (!qSnap.empty) {
            vRef = qSnap.docs[0].ref;
          }
        }
      }
    }
  }

  const now = Date.now();
  const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
  const cutoffTime = now - SEVEN_DAYS_MS;

  let isBlocked = false;
  let finalCancelCount = 0;

  // Run atomic transaction to guarantee exact consistency and concurrency safety
  await runTransaction(db, async (transaction) => {
    const bDoc = await transaction.get(bRef);
    if (!bDoc.exists()) {
      throw new Error(`Booking ${bookingId} not found in database.`);
    }
    const bData = bDoc.data();

    // Prevent duplicate cancellation requests from counting the same cancellation more than once
    const alreadyCancelledByThisVendor =
      bData.status === "cancelled" &&
      bData.cancelledBy === "vendor" &&
      (bData.vendorId === resolvedVendorId || bData.cancelledVendorId === resolvedVendorId);

    if (vRef) {
      const vDoc = await transaction.get(vRef);
      if (vDoc.exists()) {
        const vData = vDoc.data() as any;
        let cancellationsList: Array<{ bookingId: string; timestamp: number }> = [];

        if (Array.isArray(vData.cancellations)) {
          cancellationsList = vData.cancellations
            .map((c: any) => ({
              bookingId: c.bookingId || "",
              timestamp: typeof c.timestamp === "number"
                ? c.timestamp
                : (c.cancelledAt?.toMillis ? c.cancelledAt.toMillis() : new Date(c.cancelledAt || 0).getTime()),
            }))
            .filter((c: any) => c.timestamp >= cutoffTime);
        } else if (typeof vData.cancelCount === "number" && vData.cancelCount > 0) {
          // Backward compatibility: synthesize existing cancelCount
          const baseTime = vData.lastCancelledAt?.toMillis ? vData.lastCancelledAt.toMillis() : now;
          if (baseTime >= cutoffTime) {
            for (let i = 0; i < vData.cancelCount; i++) {
              cancellationsList.push({ bookingId: `legacy_${i}`, timestamp: baseTime - i * 1000 });
            }
          }
        }

        // Only add if this cancellation was not already counted for this specific booking
        const existsInList = cancellationsList.some((c) => c.bookingId === bookingId);
        if (!alreadyCancelledByThisVendor && !existsInList) {
          cancellationsList.push({ bookingId, timestamp: now });
        }

        // Exact rolling 7-day count, capped at 3
        finalCancelCount = Math.min(3, cancellationsList.length);
        isBlocked = finalCancelCount >= 3 || vData.isBlocked === true || vData.status === "locked";

        const vendorUpdates: Record<string, any> = {
          cancelCount: finalCancelCount,
          cancellations: cancellationsList,
          lastCancelledAt: serverTimestamp(),
          lastCancelledBookingId: bookingId,
        };

        if (finalCancelCount >= 3) {
          isBlocked = true;
          vendorUpdates.status = "locked";
          vendorUpdates.isLocked = true;
          vendorUpdates.isBlocked = true;
          vendorUpdates.blockedAt = serverTimestamp();
          vendorUpdates.blockExpiresAt = now + SEVEN_DAYS_MS;
          vendorUpdates.lockReason =
            "Account temporarily blocked: 3 job cancellations recorded in 7 days. Contact Admin to unblock or wait 7 days to reset.";
          vendorUpdates.isOnline = false;
        }

        transaction.update(vRef, vendorUpdates);
      }
    }

    // Atomically mark the booking cancelled
    transaction.update(bRef, {
      status: "cancelled",
      cancelledAt: serverTimestamp(),
      cancelledBy: "vendor",
      cancelledVendorId: resolvedVendorId || null,
      vendorId: resolvedVendorId || bData.vendorId || null,
      vendorName: vendorName || bData.vendorName || "Vendor",
      rejected: true,
      rejectedAt: serverTimestamp(),
      lastRejectionNoticeId: now.toString(),
      cancellationReason: "Cancelled by partner technician",
    });
  });

  return { blocked: isBlocked, cancelCount: finalCancelCount };
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
  // First check if vendor is currently blocked
  if (vendorId) {
    const vRef = doc(db, "vendors", vendorId);
    const vSnap = await getDoc(vRef);
    if (vSnap.exists()) {
      const vData = vSnap.data();
      const now = Date.now();
      const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
      let blockedAtMs = 0;
      if (vData.blockedAt) {
        if (typeof vData.blockedAt.toMillis === "function") blockedAtMs = vData.blockedAt.toMillis();
        else if (typeof vData.blockedAt === "number") blockedAtMs = vData.blockedAt;
        else if (vData.blockedAt.seconds) blockedAtMs = vData.blockedAt.seconds * 1000;
        else if (typeof vData.blockedAt === "string") {
          const p = new Date(vData.blockedAt).getTime();
          if (!isNaN(p)) blockedAtMs = p;
        }
      }

      const is7DaysPassed = blockedAtMs > 0 && (now - blockedAtMs) >= SEVEN_DAYS_MS;
      const isBlocked = !is7DaysPassed && (
        vData.isBlocked === true ||
        vData.isLocked === true ||
        vData.status === "locked" ||
        vData.status === "blocked" ||
        (vData.cancelCount || 0) >= 3 ||
        (vData.skippedCount || 0) >= 3
      );

      if (isBlocked) {
        throw new Error("Your account is currently blocked. Contact Admin to unblock or wait for the 7-day period to expire.");
      }
    }
  }

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
    const serviceName = d.subServiceName || d.serviceCategory || "Service";
    const dateStr = d.bookingDate || d.scheduledAt || "Scheduled Date";
    const timeStr = d.bookingTime || "";
    notifyCustomerBookingConfirmed(
      d.customerId,
      serviceName,
      vendorName,
      dateStr,
      timeStr,
      d.otp || "",
      bookingId
    ).catch((err) => console.warn("[acceptJob] Failed to push confirmed notif to customer:", err));
  }

  // Reset consecutive skip count upon successfully accepting an order (never unblock if blocked for cancellations)
  if (vendorId) {
    try {
      let vRef = doc(db, "vendors", vendorId);
      let vSnap = await getDoc(vRef);
      if (!vSnap.exists()) {
        const q = query(collection(db, "vendors"), where("vendorId", "==", vendorId));
        const qSnap = await getDocs(q);
        if (!qSnap.empty) {
          vRef = qSnap.docs[0].ref;
          vSnap = qSnap.docs[0];
        }
      }
      if (vSnap.exists()) {
        const vData = vSnap.data();
        const hasCancelBlock = (vData.cancelCount || 0) >= 3 || vData.isBlocked === true || vData.status === "locked";
        if (!hasCancelBlock) {
          await updateDoc(vRef, {
            skippedCount: 0,
          });
        }
      }
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
      let vRef = doc(db, "vendors", vendorId);
      let vSnap = await getDoc(vRef);
      if (!vSnap.exists()) {
        const q = query(collection(db, "vendors"), where("vendorId", "==", vendorId));
        const qSnap = await getDocs(q);
        if (!qSnap.empty) {
          vRef = qSnap.docs[0].ref;
          vSnap = qSnap.docs[0];
        }
      }
      if (vSnap.exists()) {
        const vData = vSnap.data();
        const now = Date.now();
        const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

        let currentSkips = typeof vData.skippedCount === "number" ? vData.skippedCount : (typeof vData.rejectedCount === "number" ? vData.rejectedCount : 0);
        let blockedAtMs = 0;
        if (vData.blockedAt) {
          if (typeof vData.blockedAt.toMillis === "function") blockedAtMs = vData.blockedAt.toMillis();
          else if (typeof vData.blockedAt === "number") blockedAtMs = vData.blockedAt;
          else if (vData.blockedAt.seconds) blockedAtMs = vData.blockedAt.seconds * 1000;
          else if (typeof vData.blockedAt === "string") {
            const p = new Date(vData.blockedAt).getTime();
            if (!isNaN(p)) blockedAtMs = p;
          }
        }

        if (blockedAtMs > 0 && (now - blockedAtMs) >= SEVEN_DAYS_MS) {
          currentSkips = 0;
        }

        // Increment rejection count
        newCount = Math.min(3, currentSkips + 1);
        const updateData: Record<string, any> = {
          skippedCount: newCount,
          rejectedCount: newCount,
          lastSkippedAt: serverTimestamp(),
          lastRejectedAt: serverTimestamp(),
          lastRejectedBookingId: bookingId,
        };

        if (newCount >= 3) {
          updateData.status = "locked";
          updateData.isLocked = true;
          updateData.isBlocked = true;
          updateData.blockedAt = serverTimestamp();
          updateData.blockExpiresAt = now + SEVEN_DAYS_MS;
          updateData.lockReason = "Account blocked automatically: 3 service requests rejected/skipped today. Contact Admin to unblock.";
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
  photos: { beforePhoto?: string | null; afterPhoto?: string | null; beforePhotoPath?: string; afterPhotoPath?: string }
): Promise<void> {
  const updateData: Record<string, any> = {};

  if (photos.beforePhoto !== undefined) {
    if (typeof photos.beforePhoto === 'string' && photos.beforePhoto.startsWith('data:')) {
      try {
        await setDoc(doc(db, "bookings", bookingId, "evidence", "beforePhoto"), {
          beforePhoto: photos.beforePhoto,
          updatedAt: new Date().toISOString(),
        });
        await setDoc(doc(db, "bookings", bookingId, "evidence", "photos"), {
          beforePhoto: photos.beforePhoto,
        }, { merge: true }).catch(() => {});
      } catch (e) {
        console.warn('[updateBookingPhotos] beforePhoto subcollection error:', e);
      }
      updateData.beforePhoto = 'subcollection:evidence/beforePhoto';
      updateData.hasPhotoProof = true;
    } else {
      updateData.beforePhoto = photos.beforePhoto;
      if (photos.beforePhoto) updateData.hasPhotoProof = true;
    }
  }

  if (photos.afterPhoto !== undefined) {
    if (typeof photos.afterPhoto === 'string' && photos.afterPhoto.startsWith('data:')) {
      try {
        await setDoc(doc(db, "bookings", bookingId, "evidence", "afterPhoto"), {
          afterPhoto: photos.afterPhoto,
          updatedAt: new Date().toISOString(),
        });
        await setDoc(doc(db, "bookings", bookingId, "evidence", "photos"), {
          afterPhoto: photos.afterPhoto,
        }, { merge: true }).catch(() => {});
      } catch (e) {
        console.warn('[updateBookingPhotos] afterPhoto subcollection error:', e);
      }
      updateData.afterPhoto = 'subcollection:evidence/afterPhoto';
      updateData.hasPhotoProof = true;
    } else {
      updateData.afterPhoto = photos.afterPhoto;
      if (photos.afterPhoto) updateData.hasPhotoProof = true;
    }
  }

  if (photos.beforePhotoPath) updateData.beforePhotoPath = photos.beforePhotoPath;
  if (photos.afterPhotoPath) updateData.afterPhotoPath = photos.afterPhotoPath;

  if (Object.keys(updateData).length > 0) {
    await updateDoc(doc(db, "bookings", bookingId), updateData);
  }
}

export async function updateBookingAudio(
  bookingId: string,
  audioUrl: string,
  metadata?: { storagePath?: string; audioMetadata?: Record<string, any> }
): Promise<void> {
  const updatePayload: Record<string, any> = {};

  if (typeof audioUrl === 'string' && audioUrl.startsWith('data:')) {
    if (audioUrl.length > 700000) {
      // Audio payload too large for Firestore 1MB limit; use reference
      updatePayload.audioUrl = metadata?.storagePath ? `storage:${metadata.storagePath}` : 'subcollection:evidence/audio';
      updatePayload.hasAudioProof = true;
    } else if (audioUrl.length > 50000) {
      try {
        await setDoc(doc(db, "bookings", bookingId, "evidence", "audio"), {
          audioData: audioUrl,
          recordedAt: new Date().toISOString(),
          bookingId,
        }, { merge: true });
        updatePayload.audioUrl = 'subcollection:evidence/audio';
        updatePayload.hasAudioProof = true;
      } catch (e) {
        console.warn('[updateBookingAudio] Subcollection audio write warning:', e);
        updatePayload.audioUrl = metadata?.storagePath ? `storage:${metadata.storagePath}` : 'subcollection:evidence/audio';
        updatePayload.hasAudioProof = true;
      }
    } else {
      updatePayload.audioUrl = audioUrl;
      updatePayload.hasAudioProof = true;
    }
  } else if (audioUrl !== undefined) {
    updatePayload.audioUrl = audioUrl;
    if (audioUrl) updatePayload.hasAudioProof = true;
  }

  if (metadata?.storagePath) {
    updatePayload.audioPath = metadata.storagePath;
  }
  if (metadata?.audioMetadata) {
    updatePayload.audioMetadata = metadata.audioMetadata;
  }
  if (Object.keys(updatePayload).length > 0) {
    try {
      await updateDoc(doc(db, "bookings", bookingId), updatePayload);
    } catch (err) {
      console.warn('[updateBookingAudio] updateDoc warning:', err);
    }
  }
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
  vendorName: string,
  scheduledDate: string,
  scheduledTime?: string,
  otp?: string,
  bookingId?: string
) {
  try {
    const userDoc = await getDoc(doc(db, "users", customerId));
    if (userDoc.exists()) {
      const data = userDoc.data();
      if (data.pushToken) {
        let cleanDate = (scheduledDate || "").trim();
        let cleanTime = (scheduledTime || "").trim();
        if (cleanDate.includes(" at ")) {
          const parts = cleanDate.split(" at ");
          cleanDate = parts[0].trim();
          if (!cleanTime) cleanTime = parts[1].trim();
        }

        const timePart = cleanTime ? ` at ${cleanTime}` : "";
        const baseMessage = `Your ${serviceName} booking has been accepted by ${vendorName || "Service Partner"} for ${cleanDate || "the scheduled date"}${timePart}.`;
        const otpPart = otp ? ` Your OTP for the service is ${otp}.` : "";
        const bodyText = `${baseMessage}${otpPart}`;

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
            title: "Booking Confirmed!",
            body: bodyText,
            data: { screen: "MyBookings", bookingId },
          }),
        });
        console.log("Booking Confirmed Push sent to customer");
      }
    }
  } catch (error) {
    console.error("Failed to send booking confirmed push notification:", error);
  }
}

