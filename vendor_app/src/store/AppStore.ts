// Simple reactive store — no Redux needed for this scale
import { MOCK_NOTIFICATIONS, MOCK_VENDOR } from '../data/mockData';
import { Job, JobStatus, Vendor, Notification } from '../data/types';
import { FirestoreBooking } from '../services/firestoreService';

type Listener = () => void;

class AppStore {
  vendor: Vendor = { ...MOCK_VENDOR, isOnline: true, isLocked: false, skippedCount: 0 };
  jobs: Job[] = [];
  notifications: Notification[] = [];
  currentJobId: string | null = null;
  recordingSeconds: number = 0;
  isRecording: boolean = false;

  // ── Cancellation tracking (3 cancels in 7 days → temp block) ─────────────
  cancelCount: number = 0;          // cancellations in current 7-day window
  cancelWeekStart: number = Date.now(); // timestamp when the current window started
  readonly CANCEL_LIMIT = 3;        // block threshold
  readonly CANCEL_WINDOW_MS = 7 * 24 * 60 * 60 * 1000; // 7 days in ms

  // ── Firebase identity ─────────────────────────────────────────────────────
  firebaseUid: string | null = null;   // Firebase Auth UID (= vendorId in Firestore)
  vendorId: string | null = null;      // same value, explicit alias for clarity
  isFirebaseReady: boolean = false;    // true once auth + Firestore listener running

  private _listeners: Set<Listener> = new Set();

  subscribe(fn: Listener): () => void {
    this._listeners.add(fn);
    return () => { this._listeners.delete(fn); };
  }

  notify() {
    this._listeners.forEach(fn => fn());
  }

  // ── Called by LoginScreen after Firebase Auth succeeds ───────────────────
  setFirebaseUser(uid: string, displayName: string, mobile: string) {
    this.firebaseUid     = uid;
    this.vendorId        = uid;
    this.isFirebaseReady = true;
    this.vendor.vendorId = uid;
    if (displayName) this.vendor.name = displayName;
    if (mobile)      this.vendor.mobile = mobile;
    this.notify();
  }

  // ── Update vendor profile from live Firestore /vendors/{id} ──────────────
  syncVendorProfile(data: any) {
    if (!data) return;
    if (typeof data.rating === 'number') this.vendor.rating = data.rating;
    if (data.name) this.vendor.name = data.name;
    if (data.mobile) this.vendor.mobile = data.mobile;
    if (data.avatar) this.vendor.avatar = data.avatar;
    if (data.services) this.vendor.services = data.services;
    if (data.serviceArea) this.vendor.serviceArea = data.serviceArea;
    if (data.serviceRadius) this.vendor.serviceRadius = data.serviceRadius;
    if (typeof data.skippedCount === 'number') this.vendor.skippedCount = data.skippedCount;
    if (typeof data.cancelCount === 'number') {
      this.cancelCount = data.cancelCount;
      this.vendor.cancelCount = data.cancelCount;
    }
    if (data.status === 'locked' || data.isLocked === true) {
      this.vendor.isLocked = true;
      this.vendor.status = 'locked';
      this.vendor.lockReason = data.lockReason || 'Profile is locked due to skipped services or complaint review.';
    } else {
      this.vendor.isLocked = false;
      this.vendor.status = 'active';
      this.vendor.lockReason = undefined;
    }
    if (data.documents) {
      this.vendor.documents = data.documents;
    }
    this.notify();
  }

  // ── Sync New Requests ────────────────────────────────────────────────────
  syncNewRequests(firestoreJobs: FirestoreBooking[]) {
    const otherJobs = this.jobs.filter(j => j.status !== 'NEW_REQUEST');
    const mapped = this._mapFirestore(firestoreJobs);
    this.jobs = [...mapped, ...otherJobs];
    this.notify();
  }

  // ── Sync Assigned & Completed Jobs ───────────────────────────────────────
  syncAssignedJobs(firestoreJobs: FirestoreBooking[]) {
    const newReqs = this.jobs.filter(j => j.status === 'NEW_REQUEST');
    const mapped = this._mapFirestore(firestoreJobs);
    this.jobs = [...mapped, ...newReqs];

    // Compute rolling 7-day cancellation count from Firestore jobs
    const now = Date.now();
    const sevenDaysAgo = now - this.CANCEL_WINDOW_MS;
    const recentCancels = firestoreJobs.filter(b => {
      if (b.status !== 'cancelled') return false;
      let cTime = now;
      if (b.cancelledAt) {
        cTime = b.cancelledAt.toMillis ? b.cancelledAt.toMillis() : new Date(b.cancelledAt).getTime();
      }
      return cTime >= sevenDaysAgo;
    });

    if (recentCancels.length > 0) {
      this.cancelCount = Math.max(this.cancelCount, recentCancels.length);
      this.vendor.cancelCount = this.cancelCount;
      if (this.cancelCount >= this.CANCEL_LIMIT) {
        this.vendor.isLocked = true;
        this.vendor.isOnline = false;
        this.vendor.status = 'locked';
        this.vendor.lockReason = `Profile temporarily blocked: ${this.CANCEL_LIMIT} job cancellations recorded in 7 days. Contact Admin to unlock.`;
      }
    }

    this.notify();
  }

  private _mapFirestore(firestoreJobs: FirestoreBooking[]): Job[] {
    return firestoreJobs.map(fb => {
      const existing = this.jobs.find(j => j.jobId === fb.id);
      let dateStr = 'Today';
      let timeStr = '';
      try {
        if (fb.scheduledAt) {
          const d = new Date(fb.scheduledAt);
          if (!isNaN(d.getTime())) {
            dateStr = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
            timeStr = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
          }
        }
      } catch (_) {
        dateStr = 'Today';
        timeStr = 'Now';
      }

      const isAssigned = fb.status === 'assigned';
      let completedTimestamp = existing?.completedAt;
      if (fb.completedAt) {
        completedTimestamp = fb.completedAt.toMillis ? fb.completedAt.toMillis() : fb.completedAt;
      }

      // Preserve coordinates: if Firestore returns 0/missing, fall back to the
      // value we already have in local store so that a status-only update (e.g.
      // verifyOTP writing in_progress) never clears a valid navigation destination.
      const resolvedLat =
        (typeof fb.customerLat === 'number' && fb.customerLat !== 0)
          ? fb.customerLat
          : (existing?.latitude && existing.latitude !== 0 ? existing.latitude : 0);
      const resolvedLng =
        (typeof fb.customerLng === 'number' && fb.customerLng !== 0)
          ? fb.customerLng
          : (existing?.longitude && existing.longitude !== 0 ? existing.longitude : 0);

      // Preserve CUSTOMER_VERIFIED when Firestore fires in_progress before the
      // vendor has pressed "Start Service".  verifyOTP() writes in_progress to
      // Firestore immediately, but the vendor still needs to see the
      // CUSTOMER_VERIFIED state to be able to tap the Start Service button.
      // Once the vendor navigates to ServiceScreen and startRecording() is called,
      // the local status becomes RECORDING_ACTIVE and this guard no longer applies.
      const firestoreMapped = this._mapStatus(fb.status);
      const resolvedStatus: import('../data/types').JobStatus =
        (firestoreMapped === 'SERVICE_STARTED' && existing?.status === 'CUSTOMER_VERIFIED')
          ? 'CUSTOMER_VERIFIED'
          : firestoreMapped;

      return {
        jobId:               fb.id,
        customerId:          fb.customerId,
        customerName:        fb.customerName || 'Customer',
        customerPhone:       fb.customerPhone ?? '',
        serviceType:         fb.serviceCategory || 'Service',
        serviceName:         fb.subServiceName || fb.serviceCategory || 'Home Service',
        assignmentType:      isAssigned ? ('ADMIN_ASSIGNED' as const) : ('CUSTOMER_REQUEST' as const),
        status:              resolvedStatus,
        date:                dateStr,
        time:                timeStr,
        address:             fb.address || 'Customer Location',
        latitude:            resolvedLat,
        longitude:           resolvedLng,
        distance:            'Nearby',
        estimatedDuration:   '1 hr',
        customerInstructions:'',
        bookingId:           fb.id,
        paymentStatus:       fb.paymentStatus === 'paid' ? 'PAID' : 'PENDING',
        vendorEarnings:      Math.round((fb.price || 0) * 0.8),
        otp:                 fb.otp ?? '',
        checklist:           fb.checklist ?? existing?.checklist ?? [],
        checklistDone:       fb.checklistDone ?? existing?.checklistDone ?? [],
        beforePhoto:         fb.beforePhoto || existing?.beforePhoto || null,
        afterPhoto:          fb.afterPhoto || existing?.afterPhoto || null,
        createdAt:           Date.now(),
        completedAt:         completedTimestamp,
        rating:              fb.rating,
        review:              fb.review,
        reviewTags:          fb.reviewTags,
        tip:                 fb.tip,
        audioUrl:            fb.audioUrl || existing?.audioUrl,
      } as Job;
    });
  }

  // Map Firestore status string → vendor app JobStatus
  private _mapStatus(s: string): JobStatus {
    const map: Record<string, JobStatus> = {
      requested:   'NEW_REQUEST',
      assigned:    'ADMIN_ASSIGNED',
      accepted:    'ACCEPTED',
      en_route:    'NAVIGATING',
      arrived:     'ARRIVED',
      in_progress: 'SERVICE_STARTED',
      completed:   'COMPLETED',
      cancelled:   'CANCELLED',
    };
    return map[s] ?? 'NEW_REQUEST';
  }

  getJob(jobId: string): Job | undefined {
    return this.jobs.find(j => j.jobId === jobId);
  }

  getCurrentJob(): Job | undefined {
    return this.currentJobId ? this.getJob(this.currentJobId) : undefined;
  }

  setCurrentJob(jobId: string) {
    this.currentJobId = jobId;
    this.notify();
  }

  updateJobStatus(jobId: string, status: JobStatus, extra?: Partial<Job>) {
    const job = this.jobs.find(j => j.jobId === jobId);
    if (!job) return;
    Object.assign(job, { status, ...extra });
    this.notify();
  }

  toggleChecklist(jobId: string, item: string) {
    const job = this.jobs.find(j => j.jobId === jobId);
    if (!job) return;
    const idx = job.checklistDone.indexOf(item);
    if (idx > -1) job.checklistDone.splice(idx, 1);
    else job.checklistDone.push(item);
    this.notify();
  }

  updateJobPhotos(jobId: string, beforePhoto?: string | null, afterPhoto?: string | null) {
    const job = this.jobs.find(j => j.jobId === jobId);
    if (!job) return;
    if (beforePhoto !== undefined) job.beforePhoto = beforePhoto;
    if (afterPhoto !== undefined) job.afterPhoto = afterPhoto;
    this.notify();
  }

  toggleOnline(isOnline: boolean) {
    // Blocked vendors cannot go online
    if (isOnline && (this.vendor.isLocked || this.cancelCount >= this.CANCEL_LIMIT)) return;
    this.vendor.isOnline = isOnline;
    this.notify();
  }

  // ── Record a vendor cancellation — auto-blocks at 3 in 7 days ────────────
  recordCancellation(): { blocked: boolean; cancelCount: number } {
    const now = Date.now();
    // Reset window if 7 days have passed since it started
    if (now - this.cancelWeekStart > this.CANCEL_WINDOW_MS) {
      this.cancelCount = 0;
      this.cancelWeekStart = now;
      // If block was due to cancels (not skips), unblock
      if (!this.vendor.isLocked || this.vendor.lockReason?.includes('cancell')) {
        this.vendor.isLocked = false;
        this.vendor.status = 'active';
        this.vendor.lockReason = undefined;
      }
    }

    this.cancelCount += 1;

    if (this.cancelCount >= this.CANCEL_LIMIT) {
      this.vendor.isLocked = true;
      this.vendor.isOnline = false;
      this.vendor.status = 'locked';
      this.vendor.lockReason =
        `Profile temporarily blocked: ${this.CANCEL_LIMIT} job cancellations recorded in 7 days. Contact Admin to unlock or wait for the 7-day window to reset.`;
    }

    this.notify();
    return { blocked: this.cancelCount >= this.CANCEL_LIMIT, cancelCount: this.cancelCount };
  }

  completeJob(jobId: string) {
    const job = this.jobs.find(j => j.jobId === jobId);
    if (!job) return;
    job.status = 'COMPLETED';
    job.completedAt = Date.now();
    job.recordingStoppedAt = Date.now();
    this.isRecording = false;
    this.recordingSeconds = 0;
    this.notify();
  }

  startRecording(jobId: string) {
    this.isRecording = true;
    this.recordingSeconds = 0;
    const job = this.jobs.find(j => j.jobId === jobId);
    if (job) {
      job.status = 'RECORDING_ACTIVE';
      job.recordingStartedAt = Date.now();
      job.serviceStartedAt = Date.now();
    }
    this.notify();
  }

  tickRecording() {
    if (this.isRecording) {
      this.recordingSeconds += 1;
      this.notify();
    }
  }

  markNotificationRead(id: string) {
    const n = this.notifications.find(n => n.id === id);
    if (n) { n.read = true; this.notify(); }
  }

  get unreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  getJobsForTab(tab: string): Job[] {
    const map: Record<string, JobStatus[]> = {
      requests: ['NEW_REQUEST', 'ADMIN_ASSIGNED'],
      upcoming: ['ACCEPTED', 'UPCOMING'],
      active: ['ACCEPTED', 'UPCOMING', 'NAVIGATING', 'ARRIVED', 'OTP_PENDING', 'CUSTOMER_VERIFIED', 'SERVICE_STARTED', 'RECORDING_ACTIVE', 'RECORDING_STOPPED'],
      completed: ['COMPLETED', 'REJECTED', 'CANCELLED'],
    };
    return this.jobs.filter(j => (map[tab] || []).includes(j.status));
  }

  // ── Computed Stats ──────────────────────────────────────────────────────────
  get effectiveRating(): number {
    const ratedJobs = this.jobs.filter(j => typeof j.rating === 'number' && j.rating > 0);
    if (ratedJobs.length > 0) {
      const sum = ratedJobs.reduce((acc, j) => acc + (j.rating || 5), 0);
      return Number((sum / ratedJobs.length).toFixed(1));
    }
    return this.vendor.rating || 5.0;
  }

  get completedJobsCount(): number {
    return this.jobs.filter(j => j.status === 'COMPLETED').length;
  }

  get totalEarnings(): number {
    return this.jobs.filter(j => j.status === 'COMPLETED').reduce((acc, job) => acc + job.vendorEarnings, 0);
  }

  get todayEarnings(): number {
    return this.jobs
      .filter(j => j.status === 'COMPLETED' && j.date === 'Today')
      .reduce((acc, job) => acc + job.vendorEarnings, 0);
  }
}

export const store = new AppStore();
