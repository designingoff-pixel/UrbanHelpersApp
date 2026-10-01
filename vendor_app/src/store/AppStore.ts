// Simple reactive store â€” no Redux needed for this scale
import { MOCK_JOBS, MOCK_NOTIFICATIONS, MOCK_VENDOR } from '../data/mockData';
import { Job, JobStatus, Vendor, Notification } from '../data/types';

type Listener = () => void;

class AppStore {
  vendor: Vendor = { ...MOCK_VENDOR };
  jobs: Job[] = [];
  notifications: Notification[] = [];
  currentJobId: string | null = null;
  recordingSeconds: number = 0;
  isRecording: boolean = false;

  // â”€â”€ Firebase identity â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

  // â”€â”€ Called by LoginScreen after Firebase Auth succeeds â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  setFirebaseUser(uid: string, displayName: string, mobile: string) {
    this.firebaseUid    = uid;
    this.vendorId       = uid;
    this.isFirebaseReady = true;
    // Patch vendor identity fields
    this.vendor.vendorId = uid;
    if (displayName) this.vendor.name = displayName;
    if (mobile)      this.vendor.mobile = mobile;
    this.notify();
  }

  // â”€â”€ Sync New Requests (clears out stale requests) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  syncNewRequests(firestoreJobs: import('../services/firestoreService').FirestoreBooking[]) {
    const otherJobs = this.jobs.filter(j => j.status !== 'NEW_REQUEST');
    const mapped = this._mapFirestore(firestoreJobs);
    this.jobs = [...mapped, ...otherJobs];
    this.notify();
  }

  // â”€â”€ Sync Assigned Jobs (keeps current new requests) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  syncAssignedJobs(firestoreJobs: import('../services/firestoreService').FirestoreBooking[]) {
    const newReqs = this.jobs.filter(j => j.status === 'NEW_REQUEST');
    const mapped = this._mapFirestore(firestoreJobs);
    this.jobs = [...mapped, ...newReqs];
    this.notify();
  }

  private _mapFirestore(firestoreJobs: import('../services/firestoreService').FirestoreBooking[]): Job[] {
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

      return {
        jobId:               fb.id,
        customerId:          fb.customerId,
        customerName:        fb.customerName || 'Customer',
        customerPhone:       fb.customerPhone ?? '',
        serviceType:         fb.serviceCategory || 'Service',
        serviceName:         fb.subServiceName || fb.serviceCategory || 'Home Service',
        assignmentType:      isAssigned ? ('ADMIN_ASSIGNED' as const) : ('CUSTOMER_REQUEST' as const),
        status:              this._mapStatus(fb.status),
        date:                dateStr,
        time:                timeStr,
        address:             fb.address || 'Customer Location',
        latitude:            fb.customerLat || 0,
        longitude:           fb.customerLng || 0,
        distance:            'Nearby',
        estimatedDuration:   '1 hr',
        customerInstructions:'',
        bookingId:           fb.id,
        paymentStatus:       fb.paymentStatus === 'paid' ? 'PAID' : 'PENDING',
        vendorEarnings:      Math.round((fb.price || 0) * 0.8),
        otp:                 fb.otp ?? '',
        checklist:           existing?.checklist ?? [],
        checklistDone:       existing?.checklistDone ?? [],
        createdAt:           Date.now(),
      } as Job;
    });
  }

  // Map Firestore status string â†’ vendor app JobStatus
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

  toggleOnline(isOnline: boolean) {
    this.vendor.isOnline = isOnline;
    this.notify();
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
      active: ['ACCEPTED', 'ADMIN_ASSIGNED', 'UPCOMING', 'NAVIGATING', 'ARRIVED', 'OTP_PENDING', 'CUSTOMER_VERIFIED', 'SERVICE_STARTED', 'RECORDING_ACTIVE', 'RECORDING_STOPPED'],
      completed: ['COMPLETED', 'REJECTED', 'CANCELLED'],
    };
    return this.jobs.filter(j => (map[tab] || []).includes(j.status));
  }

  // â”€â”€ Computed Stats â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  get completedJobsCount(): number {
    return this.jobs.filter(j => j.status === 'COMPLETED').length;
  }

  get totalEarnings(): number {
    return this.jobs.filter(j => j.status === 'COMPLETED').reduce((acc, job) => acc + job.vendorEarnings, 0);
  }
}

export const store = new AppStore();


