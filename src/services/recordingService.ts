// ─────────────────────────────────────────────────────────────────────────────
// Urban Helpers — Recording & Vendor Verification Logic
// Handles: OTP generation, session recording state, vendor verification
// ─────────────────────────────────────────────────────────────────────────────

// ── Types ────────────────────────────────────────────────────────────────────

export type RecordingStatus = "idle" | "recording" | "paused" | "ended";

export interface VendorProfile {
  id: string;
  name: string;
  service: string;
  avatar?: string;
  rating: number;
  jobsCompleted: number;
  isVerified: boolean;
  isBackgroundChecked: boolean;
  badge?: string;
}

export interface BookingSession {
  bookingId: string;
  vendorId: string;
  categoryId: string;
  subServiceId: string;
  customerId: string;
  scheduledTime: string;
  address: string;
  otpCode: string;
  otpExpiry: number;        // Unix timestamp
  recordingStatus: RecordingStatus;
  recordingStartTime?: number;
  recordingPauseTime?: number;
  recordingTotalSeconds: number;
  sessionStatus: "confirmed" | "vendor_arrived" | "otp_verified" | "in_progress" | "completed";
}

export interface OTPResult {
  success: boolean;
  code?: string;
  expirySeconds: number;
  message: string;
}

// ── Mock Vendor Data ─────────────────────────────────────────────────────────
// In production this comes from an API

const MOCK_VENDORS: Record<string, VendorProfile> = {
  "vendor-001": {
    id: "vendor-001",
    name: "Rahul Kumar",
    service: "Home Cleaning",
    avatar: undefined,
    rating: 4.8,
    jobsCompleted: 247,
    isVerified: true,
    isBackgroundChecked: true,
    badge: "Top Rated",
  },
  "vendor-002": {
    id: "vendor-002",
    name: "Priya Sharma",
    service: "RO Service",
    avatar: undefined,
    rating: 4.9,
    jobsCompleted: 183,
    isVerified: true,
    isBackgroundChecked: true,
    badge: "Expert",
  },
  "vendor-003": {
    id: "vendor-003",
    name: "Suresh Patel",
    service: "Pest Control",
    avatar: undefined,
    rating: 4.7,
    jobsCompleted: 312,
    isVerified: true,
    isBackgroundChecked: true,
  },
  "vendor-004": {
    id: "vendor-004",
    name: "Anita Nair",
    service: "Pet Care",
    avatar: undefined,
    rating: 4.9,
    jobsCompleted: 156,
    isVerified: true,
    isBackgroundChecked: true,
    badge: "Pet Specialist",
  },
};

// In-memory store for active sessions (in production use AsyncStorage / Redux)
const activeSessions: Record<string, BookingSession> = {};

// ── OTP Generation ───────────────────────────────────────────────────────────

/**
 * Generates a 4-digit OTP for vendor verification.
 * OTP expires in 3 minutes (180 seconds).
 */
export function generateOTP(): OTPResult {
  const code = Math.floor(1000 + Math.random() * 9000).toString();
  const expirySeconds = 180;
  return {
    success: true,
    code,
    expirySeconds,
    message: `OTP generated: ${code}. Valid for ${expirySeconds / 60} minutes.`,
  };
}

/**
 * Validates an OTP entered by the customer against the session OTP.
 * Returns true if valid and not expired.
 */
export function validateOTP(
  sessionOTP: string,
  enteredOTP: string,
  expiryTimestamp: number
): { valid: boolean; reason?: string } {
  const now = Date.now();
  if (now > expiryTimestamp) {
    return { valid: false, reason: "OTP has expired. Please request a new one." };
  }
  if (sessionOTP !== enteredOTP) {
    return { valid: false, reason: "Incorrect OTP. Please check and try again." };
  }
  return { valid: true };
}

/**
 * Formats seconds remaining for OTP expiry timer display.
 */
export function formatOTPTimer(seconds: number): string {
  if (seconds <= 0) return "00:00";
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

// ── Vendor Lookup ─────────────────────────────────────────────────────────────

export function getVendorById(vendorId: string): VendorProfile | null {
  return MOCK_VENDORS[vendorId] ?? null;
}

export function getAllVendors(): VendorProfile[] {
  return Object.values(MOCK_VENDORS);
}

// ── Session Management ────────────────────────────────────────────────────────

/**
 * Creates a new booking session when a booking is confirmed.
 */
export function createBookingSession(
  bookingId: string,
  vendorId: string,
  categoryId: string,
  subServiceId: string
): BookingSession {
  const otpResult = generateOTP();
  const session: BookingSession = {
    bookingId,
    vendorId,
    categoryId,
    subServiceId,
    customerId: "customer-001", // Comes from auth context in production
    scheduledTime: new Date().toISOString(),
    address: "Saved Home Address",
    otpCode: otpResult.code ?? "0000",
    otpExpiry: Date.now() + otpResult.expirySeconds * 1000,
    recordingStatus: "idle",
    recordingTotalSeconds: 0,
    sessionStatus: "confirmed",
  };
  activeSessions[bookingId] = session;
  return session;
}

export function getSession(bookingId: string): BookingSession | null {
  return activeSessions[bookingId] ?? null;
}

/**
 * Marks vendor as arrived and generates a fresh OTP.
 */
export function markVendorArrived(bookingId: string): BookingSession | null {
  const session = activeSessions[bookingId];
  if (!session) return null;
  const otp = generateOTP();
  session.sessionStatus = "vendor_arrived";
  session.otpCode = otp.code ?? "0000";
  session.otpExpiry = Date.now() + otp.expirySeconds * 1000;
  return session;
}

/**
 * Verifies the OTP entered by the customer.
 */
export function verifyVendorOTP(
  bookingId: string,
  enteredOTP: string
): { success: boolean; reason?: string } {
  const session = activeSessions[bookingId];
  if (!session) return { success: false, reason: "Session not found." };

  const result = validateOTP(session.otpCode, enteredOTP, session.otpExpiry);
  if (result.valid) {
    session.sessionStatus = "otp_verified";
    return { success: true };
  }
  return { success: false, reason: result.reason };
}

// ── Recording Management ──────────────────────────────────────────────────────

/**
 * Starts the recording session.
 */
export function startRecording(bookingId: string): boolean {
  const session = activeSessions[bookingId];
  if (!session) return false;
  session.recordingStatus = "recording";
  session.recordingStartTime = Date.now();
  session.sessionStatus = "in_progress";
  return true;
}

/**
 * Pauses the current recording.
 */
export function pauseRecording(bookingId: string): boolean {
  const session = activeSessions[bookingId];
  if (!session || session.recordingStatus !== "recording") return false;
  session.recordingStatus = "paused";
  session.recordingPauseTime = Date.now();
  // Accumulate time recorded so far
  if (session.recordingStartTime) {
    const elapsed = Math.floor(
      (Date.now() - session.recordingStartTime) / 1000
    );
    session.recordingTotalSeconds += elapsed;
    session.recordingStartTime = undefined;
  }
  return true;
}

/**
 * Resumes a paused recording.
 */
export function resumeRecording(bookingId: string): boolean {
  const session = activeSessions[bookingId];
  if (!session || session.recordingStatus !== "paused") return false;
  session.recordingStatus = "recording";
  session.recordingStartTime = Date.now();
  session.recordingPauseTime = undefined;
  return true;
}

/**
 * Ends the recording and marks the service as complete.
 */
export function endRecording(bookingId: string): { totalSeconds: number } {
  const session = activeSessions[bookingId];
  if (!session) return { totalSeconds: 0 };
  if (session.recordingStatus === "recording" && session.recordingStartTime) {
    const elapsed = Math.floor(
      (Date.now() - session.recordingStartTime) / 1000
    );
    session.recordingTotalSeconds += elapsed;
  }
  session.recordingStatus = "ended";
  session.sessionStatus = "completed";
  session.recordingStartTime = undefined;
  return { totalSeconds: session.recordingTotalSeconds };
}

/**
 * Gets live recording duration in seconds, including un-accumulated time.
 */
export function getLiveRecordingSeconds(bookingId: string): number {
  const session = activeSessions[bookingId];
  if (!session) return 0;
  let total = session.recordingTotalSeconds;
  if (
    session.recordingStatus === "recording" &&
    session.recordingStartTime
  ) {
    total += Math.floor((Date.now() - session.recordingStartTime) / 1000);
  }
  return total;
}

// ── Formatting Helpers ────────────────────────────────────────────────────────

/**
 * Formats seconds into HH:MM:SS for display in recording timer.
 */
export function formatRecordingTime(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600)
    .toString()
    .padStart(2, "0");
  const m = Math.floor((totalSeconds % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const s = (totalSeconds % 60).toString().padStart(2, "0");
  return `${h}:${m}:${s}`;
}

/**
 * Formats total recording seconds into a human readable string.
 * e.g. 2730 → "45 min 30 sec"
 */
export function formatRecordingDuration(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  if (mins === 0) return `${secs} sec`;
  if (secs === 0) return `${mins} min`;
  return `${mins} min ${secs} sec`;
}

/**
 * Formats vendor rating stars for display.
 * Returns array of { filled: boolean } for 5 stars.
 */
export function getRatingStars(rating: number): { filled: boolean }[] {
  return Array.from({ length: 5 }, (_, i) => ({
    filled: i < Math.round(rating),
  }));
}

// ── Booking ID Generator ──────────────────────────────────────────────────────

export function generateBookingId(): string {
  const prefix = "UH";
  const num = Math.floor(10000 + Math.random() * 90000);
  return `${prefix}-${num}`;
}
