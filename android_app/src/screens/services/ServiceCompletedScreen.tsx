import React, { useState, useEffect } from "react";
import {
  ScrollView,
  Text,
  View,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Share,
  Alert,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import Animated, { FadeInDown } from "react-native-reanimated";
import { doc, onSnapshot, getDoc } from "firebase/firestore";
import { ref, getDownloadURL } from "firebase/storage";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import { auth, db, storage } from "@/services/firebase";
import { RootStackParamList } from "@/navigation/types";
import { colors } from "@/theme/colors";

function numberToWordsINR(amount: number): string {
  const ones = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
    "Seventeen", "Eighteen", "Nineteen"
  ];
  const tens = [
    "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"
  ];

  const numToWords = (n: number): string => {
    if (n === 0) return "";
    if (n < 20) return ones[n] + " ";
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? "-" + ones[n % 10] : "") + " ";
    if (n < 1000) return ones[Math.floor(n / 100)] + " Hundred " + (n % 100 !== 0 ? numToWords(n % 100) : "");
    if (n < 100000) return numToWords(Math.floor(n / 1000)) + "Thousand " + (n % 1000 !== 0 ? numToWords(n % 1000) : "");
    if (n < 10000000) return numToWords(Math.floor(n / 100000)) + "Lakh " + (n % 100000 !== 0 ? numToWords(n % 100000) : "");
    return numToWords(Math.floor(n / 10000000)) + "Crore " + (n % 10000000 !== 0 ? numToWords(n % 10000000) : "");
  };

  const whole = Math.floor(amount);
  if (whole === 0) return "INR Zero Rupees Only.";
  const words = numToWords(whole).replace(/\s+/g, " ").trim();
  return `INR ${words} Rupees Only.`;
}

type Props = NativeStackScreenProps<RootStackParamList, "ServiceCompleted">;

export default function ServiceCompletedScreen({ navigation, route }: Props) {
  const bookingId = (route.params as any)?.bookingId ?? "";

  const [booking, setBooking] = useState<any>(null);
  const [beforePhoto, setBeforePhoto] = useState<string | null>(null);
  const [afterPhoto, setAfterPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!bookingId || bookingId === "UH-SAMPLE") {
      setBooking({
        id: "UH-DEMO982",
        serviceCategory: "Home Cleaning",
        subServiceName: "Full Home Deep Cleaning",
        vendorName: "Rahul Kumar",
        customerName: "Customer",
        address: "14B Green Avenue, Bangalore",
        price: 599,
        priceLabel: "₹599",
        paymentStatus: "paid",
        rating: 5,
        reviewTags: ["On-time arrival ⏰", "Super polite 👔"],
        scheduledAt: new Date().toISOString(),
      });
      setLoading(false);
      return;
    }

    const unsub = onSnapshot(
      doc(db, "bookings", bookingId),
      async (snap) => {
        if (snap.exists()) {
          const data = { id: snap.id, ...snap.data() } as any;
          setBooking(data);

          const isValidPhotoUrl = (url: any): boolean => {
            return typeof url === "string" && (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:image/"));
          };

          let bPhoto = isValidPhotoUrl(data.beforePhoto) ? data.beforePhoto : null;
          let aPhoto = isValidPhotoUrl(data.afterPhoto) ? data.afterPhoto : null;

          // 1. If stored in subcollections, fetch the actual Base64 / URL
          if (!aPhoto) {
            try {
              const aSnap = await getDoc(doc(db, "bookings", bookingId, "evidence", "afterPhoto"));
              if (aSnap.exists()) {
                const aData = aSnap.data();
                if (isValidPhotoUrl(aData?.afterPhoto)) aPhoto = aData.afterPhoto;
              }
            } catch (_) {}
          }

          if (!bPhoto) {
            try {
              const bSnap = await getDoc(doc(db, "bookings", bookingId, "evidence", "beforePhoto"));
              if (bSnap.exists()) {
                const bData = bSnap.data();
                if (isValidPhotoUrl(bData?.beforePhoto)) bPhoto = bData.beforePhoto;
              }
            } catch (_) {}
          }

          if (!bPhoto || !aPhoto) {
            try {
              const evSnap = await getDoc(doc(db, "bookings", bookingId, "evidence", "photos"));
              if (evSnap.exists()) {
                const evData = evSnap.data();
                if (evData.beforePhoto && !bPhoto && isValidPhotoUrl(evData.beforePhoto)) bPhoto = evData.beforePhoto;
                if (evData.afterPhoto && !aPhoto && isValidPhotoUrl(evData.afterPhoto)) aPhoto = evData.afterPhoto;
              }
            } catch (err) {
              console.warn("[ServiceCompleted] Error fetching evidence photos:", err);
            }
          }

          // 2. If storage path or storage: reference is available, resolve public download URL
          if (!bPhoto && storage) {
            const bPath = (typeof data.beforePhoto === "string" && data.beforePhoto.startsWith("storage:"))
              ? data.beforePhoto.replace(/^storage:/, "")
              : data.beforePhotoPath;
            if (bPath) {
              try {
                bPhoto = await getDownloadURL(ref(storage, bPath));
              } catch {}
            }
          }
          if (!aPhoto && storage) {
            const aPath = (typeof data.afterPhoto === "string" && data.afterPhoto.startsWith("storage:"))
              ? data.afterPhoto.replace(/^storage:/, "")
              : data.afterPhotoPath;
            if (aPath) {
              try {
                aPhoto = await getDownloadURL(ref(storage, aPath));
              } catch {}
            }
          }

          if (bPhoto) setBeforePhoto(bPhoto);
          if (aPhoto) setAfterPhoto(aPhoto);
        }
        setLoading(false);
      },
      (err) => {
        console.warn("[ServiceCompleted] Error fetching booking:", err);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [bookingId]);

  // Status flags
  const isCompleted = booking?.status === "completed";
  const isCancelled = booking?.status === "cancelled";

  // Invoice calculations
  const total = booking?.price || 599;
  const platformFee = 29;
  const discount = booking?.discountAmount || 0;
  const taxablePortion = Math.max(0, total - platformFee + discount);
  const gst = Math.round((taxablePortion * 0.18) / 1.18);
  const baseServiceFee = Math.max(0, taxablePortion - gst);
  const invoiceNo = `INV-UH-${(booking?.id || "99999").slice(-8).toUpperCase()}`;

  // Robust safe date parsing
  const formatScheduledDate = (val?: string) => {
    if (!val) return "Scheduled";
    if (typeof val === "string") {
      if (val.includes("at") || val.includes("AM") || val.includes("PM") || val.includes(",")) {
        return val;
      }
      const d = new Date(val);
      if (!isNaN(d.getTime())) {
        return d.toLocaleString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      }
    }
    return String(val);
  };

  const formattedDate = formatScheduledDate(booking?.scheduledAt);

  // Customer & Partner identity resolution
  const currentUser = auth.currentUser;
  const rawCustomerName = booking?.customerName || currentUser?.displayName || "";
  const isGenericName =
    !rawCustomerName ||
    rawCustomerName.toLowerCase() === "urban helpers" ||
    rawCustomerName.toLowerCase() === "customer";
  const customerName = isGenericName ? (currentUser?.displayName || "Mr.Gobinath") : rawCustomerName;
  const customerOrg = booking?.customerOrg || booking?.organization || "StartupTN";
  const customerPhone = booking?.customerPhone || booking?.phone || currentUser?.phoneNumber || "7010128714";
  const customerAddress = booking?.address || "17, VELNAGAR FIRST CROSS, Salem, TAMIL NADU, 636302";
  const vendorName = booking?.vendorName || "MAHARISHI";
  const vendorCategory = booking?.serviceCategory || "RO Service";
  const subServiceName = booking?.subServiceName || booking?.serviceCategory || "Filter Change";
  const totalInWords = numberToWordsINR(total);

  const handleDownloadInvoicePDF = async () => {
    try {
      setDownloading(true);
      const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>URBAN HELPER'S Tax Invoice</title>
  <style>
    * {
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 28px 32px;
      color: #0f172a;
      background: #ffffff;
      font-size: 11.5px;
      line-height: 1.45;
    }
    .top-sub-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
    }
    .doc-type-tag {
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 2.5px;
      color: #059669;
      text-transform: uppercase;
    }
    .recipient-tag {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 1.5px;
      color: #64748b;
      text-transform: uppercase;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #059669;
      padding-bottom: 14px;
      margin-bottom: 16px;
    }
    .brand-title {
      font-size: 24px;
      font-weight: 900;
      color: #042f2e;
      letter-spacing: 0.5px;
      margin: 0;
      line-height: 1.1;
    }
    .pan-badge {
      font-size: 11.5px;
      font-weight: 800;
      color: #0f172a;
      margin-top: 3px;
      letter-spacing: 0.5px;
    }
    .company-addr {
      font-size: 11px;
      color: #334155;
      margin-top: 3px;
      line-height: 1.4;
    }
    .company-contact {
      font-size: 11px;
      color: #334155;
      margin-top: 3px;
    }
    .company-web {
      font-size: 11px;
      font-weight: 800;
      color: #059669;
      margin-top: 3px;
      letter-spacing: 0.5px;
    }
    .header-right {
      text-align: right;
    }
    .entity-badge {
      display: inline-block;
      background: #042f2e;
      color: #ffffff;
      font-weight: 800;
      font-size: 10px;
      padding: 3px 8px;
      border-radius: 4px;
      letter-spacing: 0.8px;
      margin-bottom: 4px;
    }
    .paid-stamp {
      display: inline-block;
      margin-top: 6px;
      background: #d1fae5;
      color: #065f46;
      font-weight: 800;
      font-size: 11px;
      padding: 4px 10px;
      border-radius: 4px;
      border: 1px solid #10b981;
      letter-spacing: 0.5px;
    }
    .meta-bar {
      display: flex;
      justify-content: space-between;
      flex-wrap: wrap;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 7px 12px;
      font-size: 11px;
      margin-bottom: 14px;
      gap: 8px;
    }
    .grid {
      display: flex;
      justify-content: space-between;
      gap: 14px;
      margin-bottom: 16px;
    }
    .card {
      flex: 1;
      background: #f8fafc;
      border-radius: 8px;
      padding: 12px 14px;
      border: 1px solid #e2e8f0;
    }
    .card-title {
      font-size: 10.5px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #64748b;
      margin-bottom: 5px;
    }
    .card-value-bold {
      font-size: 13.5px;
      font-weight: 800;
      color: #0f172a;
    }
    .card-text {
      font-size: 11.5px;
      color: #334155;
      margin-top: 2px;
      line-height: 1.4;
    }
    table.items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 12px;
    }
    table.items-table th {
      background: #f1f5f9;
      padding: 8px 10px;
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      color: #475569;
      border-top: 1px solid #cbd5e1;
      border-bottom: 1.5px solid #cbd5e1;
      letter-spacing: 0.5px;
    }
    table.items-table td {
      padding: 9px 10px;
      font-size: 11.5px;
      border-bottom: 1px solid #e2e8f0;
      color: #1e293b;
    }
    .summary-box {
      border-top: 1.5px solid #0f172a;
      border-bottom: 1.5px solid #0f172a;
      padding: 8px 12px;
      margin-bottom: 14px;
      background: #fafafa;
    }
    .summary-split {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
      font-weight: 700;
    }
    .grand-total {
      font-size: 16px;
      font-weight: 900;
      color: #042f2e;
    }
    .amount-words-text {
      font-size: 11px;
      color: #334155;
      margin-top: 5px;
      font-style: italic;
    }
    .amount-words-text strong {
      font-style: normal;
      color: #0f172a;
    }
    .bank-and-signatory {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;
      margin-bottom: 14px;
      padding: 12px 14px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
    }
    .bank-col {
      flex: 1.3;
    }
    .bank-title {
      font-size: 11.5px;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 5px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .bank-table {
      font-size: 11px;
      color: #334155;
    }
    .bank-table td {
      padding: 2px 6px 2px 0;
    }
    .signatory-col {
      flex: 0.8;
      text-align: right;
    }
    .signatory-company {
      font-size: 11.5px;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 6px;
    }
    .stamp-wrap {
      display: inline-block;
      width: 100px;
      height: 100px;
      border: 2px dashed #4338ca;
      border-radius: 50%;
      padding: 4px;
      text-align: center;
      background: rgba(238, 242, 255, 0.45);
      transform: rotate(-6deg);
    }
    .stamp-inner {
      width: 100%;
      height: 100%;
      border: 1.5px solid #4338ca;
      border-radius: 50%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .stamp-text-top {
      font-size: 8px;
      font-weight: 900;
      color: #4338ca;
      letter-spacing: 0.8px;
    }
    .stamp-text-mid {
      font-size: 7px;
      font-weight: 800;
      color: #1e1b4b;
      margin: 1px 0;
    }
    .stamp-sig {
      font-family: 'Brush Script MT', cursive, sans-serif;
      font-size: 14px;
      color: #3730a3;
      line-height: 1;
    }
    .stamp-text-bot {
      font-size: 6.5px;
      font-weight: 800;
      color: #4338ca;
      letter-spacing: 0.4px;
    }
    .signatory-tag {
      font-size: 11px;
      font-weight: 700;
      color: #475569;
      margin-top: 5px;
    }
    .notes-card {
      background: #f1f5f9;
      border-left: 3px solid #059669;
      padding: 7px 10px;
      border-radius: 4px;
      margin-bottom: 12px;
      font-size: 11px;
      color: #334155;
    }
    .notes-title {
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 2px;
    }
    .terms-card {
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 10px 12px;
      margin-bottom: 14px;
      background: #ffffff;
      font-size: 10.5px;
      color: #475569;
      line-height: 1.4;
    }
    .terms-title {
      font-size: 11px;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 4px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .terms-subhead {
      font-weight: 700;
      color: #1e293b;
      margin-top: 4px;
      margin-bottom: 2px;
    }
    .proof-section {
      margin-top: 12px;
      margin-bottom: 14px;
      border-top: 1px solid #e2e8f0;
      padding-top: 12px;
    }
    .proof-heading {
      font-size: 10.5px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #64748b;
      margin-bottom: 8px;
    }
    .proof-grid {
      display: flex;
      gap: 12px;
    }
    .proof-box {
      flex: 1;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 8px;
      text-align: center;
    }
    .proof-tag {
      font-size: 10px;
      font-weight: 800;
      color: #475569;
      margin-bottom: 5px;
      text-transform: uppercase;
    }
    .proof-img {
      width: 100%;
      max-height: 140px;
      object-fit: cover;
      border-radius: 6px;
    }
    .footer {
      border-top: 1px solid #cbd5e1;
      padding-top: 10px;
      margin-top: 14px;
      text-align: center;
      font-size: 10px;
      color: #64748b;
      line-height: 1.45;
    }
    .footer strong {
      color: #334155;
    }
    .footer-swipe {
      margin-top: 5px;
      font-size: 9.5px;
      color: #94a3b8;
    }
  </style>
</head>
<body>
  <div class="top-sub-bar">
    <div class="doc-type-tag">TAX INVOICE / QUOTATION</div>
    <div class="recipient-tag">ORIGINAL FOR RECIPIENT</div>
  </div>

  <div class="header">
    <div>
      <h1 class="brand-title">URBAN HELPER'S</h1>
      <div class="pan-badge">PAN ABTCS0325F</div>
      <div class="company-addr">
        17, VELNAGAR FIRST CROSS,<br />
        NEAR DSK KALYANA MANDABAM, SOLAMPALLAM GODOWN BS,<br />
        Salem, TAMIL NADU, 636302
      </div>
      <div class="company-contact">
        Mobile: <strong>+91 7639196202</strong> &nbsp;•&nbsp; Email: <strong>Urbangroupsalem@gmail.com</strong>
      </div>
      <div class="company-web">Website: WWW.URBANHELPERS.IN</div>
    </div>
    <div class="header-right">
      <div class="entity-badge">SHI AND SHI PRIVATE LIMITED</div><br />
      <div class="paid-stamp">✓ PAID ONLINE</div>
    </div>
  </div>

  <div class="meta-bar">
    <div><strong>Quotation / Invoice #:</strong> ${invoiceNo}</div>
    <div><strong>Invoice Date:</strong> ${formattedDate}</div>
    <div><strong>Validity:</strong> Immediate / Paid</div>
  </div>

  <div class="grid">
    <div class="card">
      <div class="card-title">Customer Details:</div>
      <div class="card-value-bold">${customerName}</div>
      ${customerOrg ? `<div class="card-text" style="font-weight:700; color:#059669;">${customerOrg}</div>` : ""}
      <div class="card-text"><strong>Ph:</strong> ${customerPhone}</div>
      <div class="card-text">${customerAddress}</div>
    </div>
    <div class="card">
      <div class="card-title">Service Partner &amp; Execution:</div>
      <div class="card-value-bold">${vendorName}</div>
      <div class="card-text"><strong>Category:</strong> ${vendorCategory}</div>
      <div class="card-text" style="color:#059669; font-weight:700;">✓ Verified &amp; Background Checked</div>
      <div class="card-text"><strong>Date:</strong> ${formattedDate}</div>
    </div>
  </div>

  <table class="items-table">
    <thead>
      <tr>
        <th style="width: 6%;">#</th>
        <th style="width: 44%;">Item / Service Description</th>
        <th style="width: 15%; text-align: right;">Rate / Item</th>
        <th style="width: 10%; text-align: center;">Disc (%)</th>
        <th style="width: 10%; text-align: center;">Qty</th>
        <th style="width: 15%; text-align: right;">Amount</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>1</td>
        <td>
          <strong>${subServiceName}</strong><br />
          <span style="font-size: 10.5px; color: #64748b;">Professional execution by verified partner</span>
        </td>
        <td style="text-align: right;">₹${baseServiceFee.toFixed(2)}</td>
        <td style="text-align: center;">-</td>
        <td style="text-align: center;">1 JOBS</td>
        <td style="text-align: right;">₹${baseServiceFee.toFixed(2)}</td>
      </tr>
      <tr>
        <td>2</td>
        <td>Platform &amp; Safety Convenience Fee</td>
        <td style="text-align: right;">₹${platformFee.toFixed(2)}</td>
        <td style="text-align: center;">-</td>
        <td style="text-align: center;">1</td>
        <td style="text-align: right;">₹${platformFee.toFixed(2)}</td>
      </tr>
      <tr>
        <td>3</td>
        <td>Applicable Taxes (GST 18%)</td>
        <td style="text-align: right;">₹${gst.toFixed(2)}</td>
        <td style="text-align: center;">-</td>
        <td style="text-align: center;">1</td>
        <td style="text-align: right;">₹${gst.toFixed(2)}</td>
      </tr>
      ${
        discount > 0
          ? `<tr>
        <td>4</td>
        <td style="color:#059669;">Promo Discount (${booking?.couponCode || "Applied"})</td>
        <td style="text-align: right; color:#059669;">-₹${discount.toFixed(2)}</td>
        <td style="text-align: center; color:#059669;">-</td>
        <td style="text-align: center; color:#059669;">1</td>
        <td style="text-align: right; color:#059669;">-₹${discount.toFixed(2)}</td>
      </tr>`
          : ""
      }
    </tbody>
  </table>

  <div class="summary-box">
    <div class="summary-split">
      <div>Total Items / Qty : 1 / 1</div>
      <div class="grand-total">Total: ₹${total.toFixed(2)}</div>
    </div>
    <div class="amount-words-text">
      <strong>Total amount (in words):</strong> ${totalInWords}
    </div>
  </div>

  <div class="bank-and-signatory">
    <div class="bank-col">
      <div class="bank-title">Bank Details:</div>
      <table class="bank-table">
        <tr><td><strong>Bank:</strong></td><td>Federal Bank</td></tr>
        <tr><td><strong>Account #:</strong></td><td>26670200000800</td></tr>
        <tr><td><strong>IFSC Code:</strong></td><td>FDRL0001462</td></tr>
        <tr><td><strong>Branch:</strong></td><td>THENI</td></tr>
        <tr><td><strong>Entity:</strong></td><td>SHI AND SHI PRIVATE LIMITED</td></tr>
      </table>
    </div>
    <div class="signatory-col">
      <div class="signatory-company">For URBAN HELPER'S</div>
      <div class="stamp-wrap">
        <div class="stamp-inner">
          <div class="stamp-text-top">URBAN HELPERS</div>
          <div class="stamp-text-mid">VERIFIED</div>
          <div class="stamp-sig">Authorized</div>
          <div class="stamp-text-bot">AUTH. SIGNATORY</div>
        </div>
      </div>
      <div class="signatory-tag">Authorized Signatory</div>
    </div>
  </div>

  <div class="notes-card">
    <div class="notes-title">Notes:</div>
    <div>Thank you for choosing URBAN HELPER'S</div>
    <div>For discount discussion or support call <strong>76391-96202</strong></div>
  </div>

  <div class="terms-card">
    <div class="terms-title">Terms and Conditions:</div>
    <div class="terms-subhead">Our work including,</div>
    <div>• Cleaning agents &amp; materials / genuine replacement spares appropriate for service.</div>
    <div>• Work including: Dusting, Mopping, Windows Cleaning, Doors Cleaning, Switch board &amp; Appliance diagnostic checks.</div>
    <div class="terms-subhead" style="margin-top: 5px;">Terms of Services:</div>
    <div>• Pls ensure one person need to monitor our works from start to end.</div>
    <div>• Pls don't force employees to arrange or rearrange your household without prior agreement.</div>
    <div>• Digital Before &amp; After proof photos verified on-site for customer satisfaction guarantee.</div>
  </div>

  ${(beforePhoto || afterPhoto) ? `
  <div class="proof-section">
    <div class="proof-heading">Verified Service Proof Photos</div>
    <div class="proof-grid">
      ${beforePhoto ? `
      <div class="proof-box">
        <div class="proof-tag">BEFORE SERVICE</div>
        <img src="${beforePhoto}" class="proof-img" />
      </div>` : ''}
      ${afterPhoto ? `
      <div class="proof-box" style="background:#f0fdf4; border-color:#bbf7d0;">
        <div class="proof-tag" style="color:#15803d;">AFTER SERVICE</div>
        <img src="${afterPhoto}" class="proof-img" />
      </div>` : ''}
    </div>
  </div>` : ''}

  <div class="footer">
    Urban Helpers (SHI AND SHI PRIVATE LIMITED) • PAN: ABTCS0325F • GSTIN: 33AAECU1234F1Z5 • HSN/SAC: 998721<br />
    17, VELNAGAR FIRST CROSS, NEAR DSK KALYANA MANDABAM, SOLAMPALLAM GODOWN BS, Salem, TAMIL NADU, 636302<br />
    Mobile: +91 7639196202 • Email: Urbangroupsalem@gmail.com • Website: WWW.URBANHELPERS.IN
    <div class="footer-swipe">
      Swipe | Simple Invoicing, Billing and Payments • Page 1 / 1 • This is a digitally signed document.
    </div>
  </div>
</body>
</html>
      `;

      const { uri } = await Print.printToFileAsync({ html });
      const filename = `UrbanHelpers_Invoice_${bookingId || "receipt"}.pdf`;
      const newPath = `${FileSystem.documentDirectory}${filename}`;
      await FileSystem.moveAsync({ from: uri, to: newPath });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(newPath);
      } else {
        Alert.alert("Invoice Downloaded", `Saved to ${newPath}`);
      }
    } catch (err: any) {
      console.warn("Error printing invoice:", err);
      Alert.alert("Download Error", "Could not generate invoice PDF: " + err.message);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <View style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <Pressable style={s.iconBtn} onPress={() => navigation.navigate("HomeDashboard")}>
          <Ionicons name="arrow-back" size={20} color="white" />
        </Pressable>
        <Text style={s.headerTitle}>Order Receipt &amp; Summary</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Status Hero Banner */}
        <Animated.View entering={FadeInDown.duration(380)} style={[
          s.heroBanner,
          {
            borderColor: isCompleted
              ? "rgba(16,185,129,0.3)"
              : isCancelled
              ? "rgba(239,68,68,0.3)"
              : "rgba(0,188,212,0.35)",
          }
        ]}>
          <LinearGradient
            colors={
              isCompleted
                ? ["#065f46", "#042f2e"]
                : isCancelled
                ? ["#7f1d1d", "#450a0a"]
                : ["#0e7490", "#083344"]
            }
            style={[StyleSheet.absoluteFillObject, { borderRadius: 22 }]}
          />
          <View style={[
            s.successIconWrap,
            {
              backgroundColor: isCompleted
                ? "rgba(16,185,129,0.18)"
                : isCancelled
                ? "rgba(239,68,68,0.18)"
                : "rgba(0,188,212,0.18)",
              borderColor: isCompleted ? "#10b981" : isCancelled ? "#ef4444" : "#00bcd4",
            }
          ]}>
            <Ionicons
              name={
                isCompleted
                  ? "checkmark-circle"
                  : isCancelled
                  ? "close-circle"
                  : "time"
              }
              size={38}
              color={isCompleted ? "#10b981" : isCancelled ? "#ef4444" : booking?.status === "service_ended" ? "#f59e0b" : "#00bcd4"}
            />
          </View>
          <Text style={s.heroTitle}>
            {isCompleted
              ? "Service Completed Successfully"
              : isCancelled
              ? "Booking Cancelled"
              : booking?.status === "service_ended"
              ? "Verification & Rating Required"
              : "Service In Progress"}
          </Text>
          <Text style={s.heroSub}>
            {isCompleted
              ? `Your service has been completed and verified by ${booking?.vendorName || "our captain"}.`
              : isCancelled
              ? "This booking was cancelled. Any refund has been processed."
              : booking?.status === "service_ended"
              ? `Partner ${booking?.vendorName || "Technician"} has ended work on site. Please verify the checklist and rate the service to finalize completion.`
              : `Your service is currently active and assigned to ${booking?.vendorName || "our certified partner"}.`}
          </Text>

          {!isCompleted && !isCancelled && (
            booking?.status === "service_ended" ? (
              <Pressable
                style={[s.trackLiveBannerBtn, { backgroundColor: "#f59e0b" }]}
                onPress={() =>
                  navigation.navigate("RatingFeedback", {
                    bookingId: booking?.id || bookingId,
                    vendorName: booking?.vendorName,
                    serviceCategory: booking?.serviceCategory,
                  })
                }
              >
                <Ionicons name="star" size={18} color="#081826" />
                <Text style={s.trackLiveBannerBtnText}>Rate &amp; Finalize Service</Text>
                <Ionicons name="arrow-forward" size={14} color="#081826" />
              </Pressable>
            ) : (
              <Pressable
                style={s.trackLiveBannerBtn}
                onPress={() =>
                  navigation.navigate("LiveTracking", {
                    bookingId: booking?.id || bookingId,
                    categoryId: booking?.serviceId,
                    subServiceId: booking?.subServiceId,
                  })
                }
              >
                <Ionicons name="navigate-circle" size={18} color="#081826" />
                <Text style={s.trackLiveBannerBtnText}>Live Track Partner on Map</Text>
                <Ionicons name="arrow-forward" size={14} color="#081826" />
              </Pressable>
            )
          )}
        </Animated.View>

        {/* Work Verification Photos (Before & After Proof) */}
        {(beforePhoto || afterPhoto) && (
          <Animated.View entering={FadeInDown.delay(60).duration(380)} style={s.photoCard}>
            <View style={s.photoCardHeader}>
              <Ionicons name="camera" size={16} color="#00bcd4" />
              <Text style={s.photoCardTitle}>WORK VERIFICATION PROOF</Text>
            </View>
            <Text style={s.photoCardSub}>Verified photos captured by your technician before and after service</Text>

            <View style={s.photoGrid}>
              {beforePhoto && (
                <View style={s.photoCol}>
                  <Text style={s.photoTag}>Before Service</Text>
                  <Image source={{ uri: beforePhoto }} style={s.proofImg} resizeMode="cover" />
                </View>
              )}
              {afterPhoto && (
                <View style={s.photoCol}>
                  <Text style={s.photoTag}>After Service</Text>
                  <Image source={{ uri: afterPhoto }} style={s.proofImg} resizeMode="cover" />
                </View>
              )}
            </View>
          </Animated.View>
        )}

        {/* Invoice Summary Card */}
        <Animated.View entering={FadeInDown.delay(100).duration(380)} style={s.invoiceCard}>
          <View style={s.invoiceTop}>
            <View>
              <Text style={s.brandTitle}>URBAN HELPER'S</Text>
              <Text style={s.brandSub}>SHI AND SHI PRIVATE LIMITED • PAN ABTCS0325F</Text>
              <Text style={[s.brandSub, { color: "#38bdf8", fontWeight: "700", marginTop: 3 }]}>
                Tax Invoice #{invoiceNo.slice(-8)}
              </Text>
            </View>
            <View style={s.paidBadge}>
              <Ionicons name="checkmark-circle" size={14} color="#10b981" />
              <Text style={s.paidBadgeText}>PAID ONLINE</Text>
            </View>
          </View>

          <View style={s.dashDivider} />

          {/* Details Grid */}
          <View style={s.metaGrid}>
            <View style={s.metaCol}>
              <Text style={s.metaLabel}>BILLED TO (CUSTOMER)</Text>
              <Text style={s.metaValBold}>{customerName}</Text>
              {customerOrg ? (
                <Text style={[s.metaVal, { color: "#10b981", fontWeight: "700" }]}>{customerOrg}</Text>
              ) : null}
              <Text style={s.metaVal}>Ph: {customerPhone}</Text>
            </View>
            <View style={s.metaCol}>
              <Text style={s.metaLabel}>SERVICE PARTNER</Text>
              <Text style={s.metaValBold}>{vendorName}</Text>
              <Text style={s.metaVal}>Category: {vendorCategory}</Text>
              <Text style={[s.metaVal, { color: "#10b981", fontWeight: "700" }]}>✓ Verified & Background Checked</Text>
            </View>
          </View>

          <View style={[s.metaGrid, { marginTop: 6 }]}>
            <View style={s.metaCol}>
              <Text style={s.metaLabel}>SCHEDULED TIME</Text>
              <Text style={s.metaVal}>{formattedDate}</Text>
            </View>
            <View style={s.metaCol}>
              <Text style={s.metaLabel}>LOCATION</Text>
              <Text style={s.metaVal} numberOfLines={2}>{customerAddress}</Text>
            </View>
          </View>

          {/* Star Rating Badge */}
          {booking?.rating && (
            <View style={s.ratingBadgeWrap}>
              <View style={s.ratingStarsRow}>
                {[1, 2, 3, 4, 5].map((st) => (
                  <Ionicons
                    key={st}
                    name={st <= booking.rating ? "star" : "star-outline"}
                    size={14}
                    color="#f59e0b"
                  />
                ))}
                <Text style={s.ratingScoreText}>{booking.rating}.0 Customer Rating</Text>
              </View>
              {booking?.review ? (
                <Text style={s.ratingReviewSnippet}>"{booking.review}"</Text>
              ) : null}
            </View>
          )}

          <View style={s.solidDivider} />

          {/* Line Items Table */}
          <View style={s.tableWrap}>
            <View style={s.tableHeaderRow}>
              <Text style={s.tableHeadText}># ITEM / DESCRIPTION</Text>
              <Text style={s.tableHeadTextRight}>AMOUNT</Text>
            </View>

            <View style={s.tableItemRow}>
              <View style={{ flex: 1 }}>
                <Text style={s.itemTitle}>1. {subServiceName}</Text>
                <Text style={s.itemSub}>Rate: ₹{baseServiceFee.toFixed(2)} • Qty: 1 JOBS</Text>
              </View>
              <Text style={s.itemPrice}>₹{baseServiceFee.toFixed(2)}</Text>
            </View>

            <View style={s.tableItemRow}>
              <View style={{ flex: 1 }}>
                <Text style={s.itemTitle}>2. Platform & Safety Convenience Fee</Text>
                <Text style={s.itemSub}>Safety assurance & support • Qty: 1</Text>
              </View>
              <Text style={s.itemPrice}>₹{platformFee.toFixed(2)}</Text>
            </View>

            <View style={s.tableItemRow}>
              <View style={{ flex: 1 }}>
                <Text style={s.itemTitle}>3. Taxes (GST 18%)</Text>
                <Text style={s.itemSub}>CGST 9% + SGST 9% • Qty: 1</Text>
              </View>
              <Text style={s.itemPrice}>₹{gst.toFixed(2)}</Text>
            </View>

            {discount > 0 && (
              <View style={s.tableItemRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[s.itemTitle, { color: "#10b981" }]}>4. Coupon Discount</Text>
                  <Text style={s.itemSub}>{booking?.couponCode || "Special Offer"}</Text>
                </View>
                <Text style={[s.itemPrice, { color: "#10b981" }]}>-₹{discount.toFixed(2)}</Text>
              </View>
            )}

            <View style={s.totalRow}>
              <Text style={s.totalLabel}>Grand Total Paid</Text>
              <Text style={s.totalAmount}>₹{total.toFixed(2)}</Text>
            </View>

            <View style={{ marginTop: 6, paddingVertical: 6, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.06)" }}>
              <Text style={{ fontSize: 11, fontStyle: "italic", color: "rgba(255,255,255,0.65)" }}>
                In words: <Text style={{ fontStyle: "normal", color: "#38bdf8", fontWeight: "700" }}>{totalInWords}</Text>
              </Text>
            </View>
          </View>

          {/* Bank & Settlement Details */}
          <View style={{ marginTop: 12, backgroundColor: "rgba(255,255,255,0.03)", borderRadius: 10, padding: 10, borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" }}>
            <Text style={{ fontSize: 11, fontWeight: "800", color: "#38bdf8", letterSpacing: 0.5, marginBottom: 4 }}>
              BANK DETAILS (SHI AND SHI PRIVATE LIMITED)
            </Text>
            <Text style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", lineHeight: 16 }}>
              Federal Bank • A/c: <Text style={{ color: "white", fontWeight: "700" }}>26670200000800</Text> • IFSC: <Text style={{ color: "white", fontWeight: "700" }}>FDRL0001462</Text> • Branch: THENI
            </Text>
          </View>

          {/* Statutory Footer */}
          <View style={s.invoiceFooter}>
            <Ionicons name="receipt-outline" size={14} color="rgba(255,255,255,0.4)" />
            <Text style={s.footerNote}>
              HSN/SAC: 998721 • GSTIN: 33AAECU1234F1Z5 • 17, Velnagar 1st Cross, Salem, TN 636302 • Support: +91 7639196202
            </Text>
          </View>
        </Animated.View>

        <View style={{ height: 140 }} />
      </ScrollView>

      {/* Bottom Floating Actions */}
      <View style={s.ctaWrap}>
        {!isCompleted && !isCancelled ? (
          <Pressable
            style={[s.shareBtn, { backgroundColor: "#00bcd4", borderColor: "#00bcd4" }]}
            onPress={() =>
              navigation.navigate("LiveTracking", {
                bookingId: booking?.id || bookingId,
                categoryId: booking?.serviceId,
                subServiceId: booking?.subServiceId,
              })
            }
          >
            <Ionicons name="navigate-circle" size={18} color="#081826" />
            <Text style={[s.shareBtnText, { color: "#081826", fontWeight: "800" }]}>
              Live Track Service on Map
            </Text>
          </Pressable>
        ) : (
          <Pressable
            style={[s.shareBtn, { backgroundColor: "#065f46", borderColor: "#10b981" }]}
            onPress={handleDownloadInvoicePDF}
            disabled={downloading}
          >
            {downloading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <>
                <Ionicons name="download-outline" size={18} color="#ffffff" />
                <Text style={[s.shareBtnText, { color: "#ffffff", fontWeight: "700" }]}>Download PDF Invoice</Text>
              </>
            )}
          </Pressable>
        )}

        <Pressable
          style={s.homeBtn}
          onPress={() => navigation.navigate("HomeDashboard")}
        >
          <Text style={s.homeBtnText}>Done • Back to Home</Text>
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#081826" },
  center: { justifyContent: "center", alignItems: "center" },
  loadingText: { color: "white", marginTop: 14, fontSize: 15, fontWeight: "600" },
  trackLiveBannerBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#00bcd4",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    marginTop: 14,
  },
  trackLiveBannerBtnText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#081826",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 52,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  headerTitle: { fontSize: 17, fontWeight: "700", color: "white" },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.08)",
    justifyContent: "center",
    alignItems: "center",
  },
  scroll: { paddingHorizontal: 16, paddingTop: 16 },

  // Hero Banner
  heroBanner: {
    borderRadius: 22,
    padding: 20,
    alignItems: "center",
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(16,185,129,0.3)",
  },
  successIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(16,185,129,0.18)",
    borderWidth: 2,
    borderColor: "#10b981",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  heroTitle: { fontSize: 18, fontWeight: "800", color: "white", textAlign: "center" },
  heroSub: {
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
    marginTop: 6,
    lineHeight: 18,
  },

  // Photo Proof Card
  photoCard: {
    backgroundColor: "#102336",
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  photoCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  photoCardTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#00bcd4",
    letterSpacing: 0.5,
  },
  photoCardSub: {
    fontSize: 11.5,
    color: "rgba(255,255,255,0.6)",
    marginBottom: 12,
  },
  photoGrid: {
    flexDirection: "row",
    gap: 12,
  },
  photoCol: {
    flex: 1,
    gap: 6,
  },
  photoTag: {
    fontSize: 11,
    fontWeight: "700",
    color: "#38bdf8",
  },
  proofImg: {
    width: "100%",
    height: 130,
    borderRadius: 12,
    backgroundColor: "#16283c",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    overflow: "hidden",
  },

  // Invoice Card
  invoiceCard: {
    backgroundColor: "#102336",
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    marginBottom: 16,
  },
  invoiceTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  brandTitle: { fontSize: 17, fontWeight: "900", color: "#00e5ff", letterSpacing: 0.5 },
  brandSub: { fontSize: 11, fontWeight: "600", color: "rgba(255,255,255,0.5)", marginTop: 2 },
  paidBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(16,185,129,0.15)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(16,185,129,0.3)",
  },
  paidBadgeText: { fontSize: 11, fontWeight: "800", color: "#10b981", letterSpacing: 0.5 },

  dashDivider: {
    height: 1,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderStyle: "dashed",
    marginVertical: 16,
  },
  solidDivider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
    marginVertical: 14,
  },

  metaGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  metaCol: { flex: 1 },
  metaLabel: { fontSize: 10, fontWeight: "700", color: "rgba(255,255,255,0.45)", letterSpacing: 0.5 },
  metaValBold: { fontSize: 13, fontWeight: "700", color: "white", marginTop: 3 },
  metaVal: { fontSize: 12, color: "rgba(255,255,255,0.75)", marginTop: 3 },

  ratingBadgeWrap: {
    backgroundColor: "rgba(245,158,11,0.1)",
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "rgba(245,158,11,0.25)",
  },
  ratingStarsRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  ratingScoreText: { fontSize: 13, fontWeight: "700", color: "#f59e0b", marginLeft: 6 },
  ratingReviewSnippet: {
    fontSize: 12,
    fontStyle: "italic",
    color: "rgba(255,255,255,0.8)",
    marginTop: 6,
  },

  // Table
  tableWrap: { marginTop: 4 },
  tableHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  tableHeadText: { fontSize: 11, fontWeight: "700", color: "rgba(255,255,255,0.45)" },
  tableHeadTextRight: { fontSize: 11, fontWeight: "700", color: "rgba(255,255,255,0.45)", textAlign: "right" },
  tableItemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  itemTitle: { fontSize: 13, fontWeight: "600", color: "white" },
  itemSub: { fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 },
  itemPrice: { fontSize: 13, fontWeight: "700", color: "white" },

  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 14,
    marginTop: 6,
  },
  totalLabel: { fontSize: 16, fontWeight: "800", color: "white" },
  totalAmount: { fontSize: 20, fontWeight: "900", color: "#00e5ff" },

  invoiceFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 18,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
  },
  footerNote: { flex: 1, fontSize: 10, color: "rgba(255,255,255,0.4)", lineHeight: 14 },

  // Bottom Floating CTA
  ctaWrap: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 32,
    paddingTop: 12,
    backgroundColor: "rgba(8,24,38,0.97)",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)",
    gap: 10,
  },
  shareBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "rgba(0,188,212,0.12)",
    borderRadius: 22,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "rgba(0,188,212,0.3)",
  },
  shareBtnText: { fontSize: 14, fontWeight: "700", color: "#00e5ff" },
  homeBtn: {
    backgroundColor: "#00bcd4",
    borderRadius: 22,
    paddingVertical: 15,
    alignItems: "center",
  },
  homeBtnText: { fontSize: 15, fontWeight: "800", color: "#081826" },
});
