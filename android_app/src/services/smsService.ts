/**
 * Urban Helpers — Real SMS & OTP Service
 * Sends real SMS text messages directly to customer & vendor mobile numbers (Native Messages app)
 * Supports: Fast2SMS, Twilio, and configured test phone numbers in test environment.
 */

export interface SMSResponse {
  success: boolean;
  isTestMode?: boolean;
  messageId?: string;
  message: string;
}

export interface NormalizedPhone {
  isValid: boolean;
  raw: string;
  clean10: string; // 10-digit number without country code
  e164: string;    // Full E.164 (e.g. +919876543210)
  countryCode: string;
  displayMasked: string; // e.g. +91 ******3210
  error?: string;
}

// Configured SMS Gateway credentials from environment
const FAST2SMS_API_KEY = process.env.EXPO_PUBLIC_FAST2SMS_API_KEY || "";
const TWILIO_ACCOUNT_SID = process.env.EXPO_PUBLIC_TWILIO_ACCOUNT_SID || "";
const TWILIO_AUTH_TOKEN = process.env.EXPO_PUBLIC_TWILIO_AUTH_TOKEN || "";
const TWILIO_FROM_PHONE = process.env.EXPO_PUBLIC_TWILIO_FROM_PHONE || "";

// Configured test phone numbers for test environment (simulated OTP delivery without real SMS gateway charges)
const DEFAULT_TEST_PHONES = new Set([
  "9999999999",
  "9876543210",
  "9123456780",
  "9000000000",
  "9111111111",
]);

export function isConfiguredTestPhone(clean10: string): boolean {
  if (DEFAULT_TEST_PHONES.has(clean10)) return true;
  const envTestPhones = process.env.EXPO_PUBLIC_TEST_PHONE_NUMBERS;
  if (envTestPhones) {
    const list = envTestPhones.split(",").map((p) => p.trim().replace(/\D/g, "").slice(-10));
    if (list.includes(clean10)) return true;
  }
  return false;
}

/**
 * Normalizes and validates user-entered phone number.
 * Supports standard 10-digit Indian numbers, +91 prefixes, leading 0, and international formats.
 */
export function normalizeAndValidatePhone(phone: string, defaultCountry = "91"): NormalizedPhone {
  const raw = (phone || "").trim();
  if (!raw) {
    return {
      isValid: false,
      raw,
      clean10: "",
      e164: "",
      countryCode: defaultCountry,
      displayMasked: "",
      error: "Please enter your contact phone number.",
    };
  }

  // Strip spaces, dashes, parentheses
  const digits = raw.replace(/[^0-9+]/g, "");
  const hasPlus = digits.startsWith("+");
  let numOnly = digits.replace(/\D/g, "");

  // If starts with 0 and is 11 digits (e.g. 09876543210), strip leading 0
  if (numOnly.length === 11 && numOnly.startsWith("0")) {
    numOnly = numOnly.slice(1);
  }

  let clean10 = "";
  let countryCode = defaultCountry;
  let e164 = "";

  if (numOnly.length === 10) {
    clean10 = numOnly;
    countryCode = "91";
    e164 = `+91${clean10}`;
  } else if (numOnly.length === 12 && numOnly.startsWith("91")) {
    clean10 = numOnly.slice(2);
    countryCode = "91";
    e164 = `+91${clean10}`;
  } else if (hasPlus && numOnly.length >= 10 && numOnly.length <= 15) {
    clean10 = numOnly.slice(-10);
    countryCode = numOnly.slice(0, numOnly.length - clean10.length) || "91";
    e164 = `+${numOnly}`;
  } else {
    return {
      isValid: false,
      raw,
      clean10: numOnly,
      e164: digits,
      countryCode,
      displayMasked: raw,
      error: "Please enter a valid 10-digit mobile number.",
    };
  }

  // Validate Indian mobile numbers starting digit (6, 7, 8, 9)
  if (countryCode === "91") {
    if (!/^[6-9]\d{9}$/.test(clean10)) {
      return {
        isValid: false,
        raw,
        clean10,
        e164,
        countryCode,
        displayMasked: raw,
        error: "Indian mobile numbers must start with 6, 7, 8, or 9.",
      };
    }
  }

  // Privacy mask: e.g. "+91 ******3210"
  const last4 = clean10.slice(-4);
  const displayMasked = `+${countryCode} ******${last4}`;

  return {
    isValid: true,
    raw,
    clean10,
    e164,
    countryCode,
    displayMasked,
  };
}

/**
 * 1. Send OTP via Fast2SMS Gateway (Primary Indian SMS provider)
 */
export async function sendRealSMSViaFast2SMS(
  cleanPhone: string,
  otpCode: string,
  serviceName: string = "Service"
): Promise<SMSResponse> {
  if (!FAST2SMS_API_KEY) {
    return {
      success: false,
      message: "Fast2SMS API key not configured (EXPO_PUBLIC_FAST2SMS_API_KEY).",
    };
  }

  try {
    const response = await fetch("https://www.fast2sms.com/dev/bulkV2", {
      method: "POST",
      headers: {
        authorization: FAST2SMS_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        route: "otp",
        variables_values: otpCode,
        numbers: cleanPhone,
      }),
    });

    const data: any = await response.json();
    const isSuccess = data.return === true || data.status_code === 200;
    const msg = Array.isArray(data.message) ? data.message[0] : (data.message || (isSuccess ? "SMS sent successfully" : "Fast2SMS rejected request"));

    return {
      success: isSuccess,
      messageId: data.request_id,
      message: msg,
    };
  } catch (error: any) {
    console.warn("Fast2SMS network error:", error);
    return {
      success: false,
      message: error.message || "Network error connecting to Fast2SMS",
    };
  }
}

/**
 * 2. Send SMS via Twilio Gateway (Secondary / International)
 */
export async function sendRealSMSViaTwilio(
  e164Phone: string,
  messageBody: string
): Promise<SMSResponse> {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_FROM_PHONE) {
    return {
      success: false,
      message: "Twilio credentials not configured.",
    };
  }

  try {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
    const formBody = new URLSearchParams({
      To: e164Phone,
      From: TWILIO_FROM_PHONE,
      Body: messageBody,
    }).toString();

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: "Basic " + btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formBody,
    });

    const data: any = await response.json();
    return {
      success: response.ok,
      messageId: data.sid,
      message: response.ok ? "Twilio SMS delivered" : (data.message || "Twilio delivery failed"),
    };
  } catch (err: any) {
    console.warn("Twilio SMS error:", err);
    return {
      success: false,
      message: err.message || "Network error connecting to Twilio",
    };
  }
}

/**
 * 3. Primary Dispatcher for Booking Phone Verification OTP
 * Validates the number, sends real SMS via configured provider,
 * or allows simulated delivery only for configured test environment numbers.
 * Displays error if provider rejects the request — never pretends it sent.
 */
export async function sendBookingVerificationOTP(
  phoneNumber: string,
  otpCode: string,
  serviceName: string = "Urban Helpers Service"
): Promise<SMSResponse> {
  const norm = normalizeAndValidatePhone(phoneNumber);
  if (!norm.isValid) {
    return {
      success: false,
      message: norm.error || "Please enter a valid 10-digit mobile number.",
    };
  }

  // Distinguish simulated OTPs for configured test environment phone numbers
  if (isConfiguredTestPhone(norm.clean10)) {
    if (__DEV__) {
      console.log(`[Test Environment] Simulated SMS to ${norm.displayMasked}: OTP is ${otpCode}`);
    }
    return {
      success: true,
      isTestMode: true,
      message: `[Test Mode] Verification OTP simulated for test number ${norm.displayMasked}`,
    };
  }

  // Attempt Fast2SMS if configured
  if (FAST2SMS_API_KEY) {
    const res = await sendRealSMSViaFast2SMS(norm.clean10, otpCode, serviceName);
    if (res.success) {
      return res;
    }
    console.warn("[sendBookingVerificationOTP] Fast2SMS failed:", res.message);
  }

  // Attempt Twilio if configured
  if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_FROM_PHONE) {
    const msg = `Your Urban Helpers OTP for ${serviceName} is ${otpCode}. Valid for 10 minutes.`;
    const res = await sendRealSMSViaTwilio(norm.e164, msg);
    if (res.success) {
      return res;
    }
    console.warn("[sendBookingVerificationOTP] Twilio failed:", res.message);
  }

  // If no provider succeeded or neither is configured:
  const reason = FAST2SMS_API_KEY || TWILIO_ACCOUNT_SID
    ? "SMS provider rejected delivery. Please check phone number format and SMS quota."
    : "SMS Gateway is not configured. Set EXPO_PUBLIC_FAST2SMS_API_KEY in .env for real SMS delivery, or use a configured test number in the test environment.";

  return {
    success: false,
    isTestMode: false,
    message: reason,
  };
}

/**
 * 4. Dispatcher for Vendor Notification
 */
export async function dispatchBookingOTPToMobile(params: {
  customerPhone?: string;
  vendorPhone?: string;
  otp: string;
  serviceName: string;
  bookingId: string;
}): Promise<void> {
  const { customerPhone, vendorPhone, otp, serviceName } = params;

  if (customerPhone) {
    await sendBookingVerificationOTP(customerPhone, otp, serviceName);
  }

  if (vendorPhone) {
    const vendorMsg = `Urban Helpers: You have arrived for ${serviceName}. Please ask customer for the 4-digit OTP to start service.`;
    await sendRealSMSViaTwilio(vendorPhone, vendorMsg);
  }
}
