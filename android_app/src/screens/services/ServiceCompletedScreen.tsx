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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import Animated, { FadeInDown } from "react-native-reanimated";
import { doc, onSnapshot } from "firebase/firestore";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import { db } from "@/services/firebase";
import { RootStackParamList } from "@/navigation/types";
import { colors } from "@/theme/colors";

type Props = NativeStackScreenProps<RootStackParamList, "ServiceCompleted">;

export default function ServiceCompletedScreen({ navigation, route }: Props) {
  const bookingId = (route.params as any)?.bookingId ?? "";

  const [booking, setBooking] = useState<any>(null);
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
      (snap) => {
        if (snap.exists()) {
          setBooking({ id: snap.id, ...snap.data() });
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

  // Invoice calculations
  const total = booking?.price || 599;
  const platformFee = 29;
  const discount = booking?.discountAmount || 0;
  const taxablePortion = Math.max(0, total - platformFee + discount);
  const gst = Math.round(taxablePortion * 0.18 / 1.18);
  const baseServiceFee = Math.max(0, taxablePortion - gst);
  const invoiceNo = `INV-UH-${(booking?.id || "99999").slice(-8).toUpperCase()}`;

  const formattedDate = booking?.scheduledAt
    ? new Date(booking.scheduledAt).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Just now";

  const handleDownloadInvoicePDF = async () => {
    try {
      setDownloading(true);
      const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Urban Helpers Tax Invoice</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 30px;
      color: #1e293b;
      background: #ffffff;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #059669;
      padding-bottom: 20px;
      margin-bottom: 24px;
    }
    .brand-title {
      font-size: 26px;
      font-weight: 800;
      color: #065f46;
      letter-spacing: -0.5px;
      margin: 0;
    }
    .brand-tag {
      font-size: 12px;
      color: #059669;
      font-weight: 600;
      margin-top: 4px;
    }
    .invoice-badge {
      text-align: right;
    }
    .invoice-title {
      font-size: 20px;
      font-weight: 700;
      color: #0f172a;
      margin: 0;
    }
    .invoice-no {
      font-size: 13px;
      color: #64748b;
      font-weight: 600;
      margin-top: 4px;
    }
    .paid-stamp {
      display: inline-block;
      margin-top: 8px;
      background: #d1fae5;
      color: #065f46;
      font-weight: 800;
      font-size: 12px;
      padding: 4px 12px;
      border-radius: 6px;
      border: 1px solid #10b981;
    }
    .grid {
      display: flex;
      justify-content: space-between;
      gap: 20px;
      margin-bottom: 28px;
    }
    .card {
      flex: 1;
      background: #f8fafc;
      border-radius: 10px;
      padding: 16px;
      border: 1px solid #e2e8f0;
    }
    .card-title {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #64748b;
      margin-bottom: 8px;
    }
    .card-value-bold {
      font-size: 15px;
      font-weight: 700;
      color: #0f172a;
    }
    .card-text {
      font-size: 13px;
      color: #475569;
      margin-top: 4px;
      line-height: 1.4;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
    }
    th {
      background: #f1f5f9;
      text-align: left;
      padding: 12px 14px;
      font-size: 12px;
      font-weight: 700;
      color: #475569;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-top: 1px solid #e2e8f0;
      border-bottom: 1px solid #e2e8f0;
    }
    td {
      padding: 14px;
      font-size: 13.5px;
      border-bottom: 1px solid #f1f5f9;
      color: #1e293b;
    }
    .text-right {
      text-align: right;
    }
    .total-section {
      margin-left: auto;
      width: 320px;
      margin-bottom: 30px;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 6px 0;
      font-size: 13.5px;
      color: #475569;
    }
    .grand-total-row {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      border-top: 2px solid #0f172a;
      border-bottom: 2px solid #0f172a;
      font-size: 17px;
      font-weight: 800;
      color: #065f46;
      margin-top: 8px;
    }
    .footer {
      border-top: 1px solid #e2e8f0;
      padding-top: 18px;
      font-size: 11.5px;
      color: #94a3b8;
      text-align: center;
      line-height: 1.6;
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1 class="brand-title">URBAN HELPERS</h1>
      <div class="brand-tag">Premium Home &amp; Living Services • Verified Partner Network</div>
    </div>
    <div class="invoice-badge">
      <h2 class="invoice-title">TAX INVOICE</h2>
      <div class="invoice-no">${invoiceNo}</div>
      <div class="paid-stamp">✓ PAID ONLINE</div>
    </div>
  </div>

  <div class="grid">
    <div class="card">
      <div class="card-title">Billed To (Customer)</div>
      <div class="card-value-bold">${booking?.customerName || "Valued Customer"}</div>
      <div class="card-text">${booking?.address || "Address on record"}</div>
      <div class="card-text">Date: ${formattedDate}</div>
    </div>
    <div class="card">
      <div class="card-title">Service Specialist</div>
      <div class="card-value-bold">${booking?.vendorName || "Verified Specialist Captain"}</div>
      <div class="card-text">Category: ${booking?.serviceCategory || "General Service"}</div>
      <div class="card-text">Payment: Prepaid Online (Verified 100%)</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th>SAC Code</th>
        <th class="text-right">Amount</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>
          <strong>${booking?.subServiceName || booking?.serviceCategory || "Professional Home Service"}</strong><br/>
          <span style="color:#64748b; font-size:12px;">Completed with 100% Quality &amp; Safety Guarantee</span>
        </td>
        <td>998721</td>
        <td class="text-right">₹${baseServiceFee}</td>
      </tr>
      <tr>
        <td>Platform &amp; Safety Insurance Fee</td>
        <td>998319</td>
        <td class="text-right">₹${platformFee}</td>
      </tr>
      <tr>
        <td>Goods &amp; Services Tax (GST 18%)</td>
        <td>GST-18</td>
        <td class="text-right">₹${gst}</td>
      </tr>
      ${discount > 0 ? `
      <tr style="color: #059669;">
        <td><strong>Promo / Coupon Discount (${booking?.couponCode || "Applied"})</strong></td>
        <td>-</td>
        <td class="text-right"><strong>-₹${discount}</strong></td>
      </tr>
      ` : ""}
    </tbody>
  </table>

  <div class="total-section">
    <div class="total-row">
      <span>Subtotal</span>
      <span>₹${baseServiceFee + platformFee}</span>
    </div>
    <div class="total-row">
      <span>GST (CGST 9% + SGST 9%)</span>
      <span>₹${gst}</span>
    </div>
    ${discount > 0 ? `
    <div class="total-row" style="color: #059669;">
      <span>Discount</span>
      <span>-₹${discount}</span>
    </div>
    ` : ""}
    <div class="grand-total-row">
      <span>Grand Total Paid</span>
      <span>₹${total}</span>
    </div>
  </div>

  <div class="footer">
    <strong>Urban Helpers Technologies Private Limited</strong><br/>
    GSTIN: 33AAECU1234F1Z5 • CIN: U74999KA2024PTC123456 • HSN/SAC: 998721<br/>
    This is a computer-generated tax invoice and requires no physical signature.<br/>
    For support or queries, contact support@urbanhelpers.in
  </div>
</body>
</html>
      `;

      const { uri } = await Print.printToFileAsync({ html, base64: false });
      const targetPath = `${FileSystem.documentDirectory}UrbanHelpers_Invoice_${invoiceNo}.pdf`;
      await FileSystem.copyAsync({ from: uri, to: targetPath });

      const isShareAvailable = await Sharing.isAvailableAsync();
      if (isShareAvailable) {
        await Sharing.shareAsync(targetPath, {
          UTI: ".pdf",
          mimeType: "application/pdf",
          dialogTitle: `Download Urban Helpers Invoice ${invoiceNo}`,
        });
      } else {
        Alert.alert(
          "Invoice Downloaded",
          `Tax invoice PDF has been saved successfully:\n${targetPath}`
        );
      }
    } catch (e: any) {
      console.warn("PDF generation error:", e);
      Alert.alert("Invoice Download", "Failed to generate PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  const handleShareInvoice = async () => {
    try {
      const summary = `📄 URBAN HELPERS OFFICIAL TAX INVOICE\n` +
        `----------------------------------------\n` +
        `Invoice No : ${invoiceNo}\n` +
        `Service    : ${booking?.subServiceName || booking?.serviceCategory}\n` +
        `Partner    : ${booking?.vendorName || "Verified Specialist"}\n` +
        `Date       : ${formattedDate}\n` +
        `Address    : ${booking?.address || "On file"}\n` +
        `----------------------------------------\n` +
        `Base Service Fee : ₹${baseServiceFee}\n` +
        `Safety & Platform: ₹${platformFee}\n` +
        `Taxes & GST (18%): ₹${gst}\n` +
        (discount > 0 ? `Promo Discount   : -₹${discount}\n` : "") +
        `----------------------------------------\n` +
        `GRAND TOTAL PAID : ₹${total}\n` +
        `Payment Status   : PAID ONLINE (Verified)\n` +
        `----------------------------------------\n` +
        `Thank you for trusting Urban Helpers!`;

      await Share.share({
        title: `Urban Helpers Invoice ${invoiceNo}`,
        message: summary,
      });
    } catch (e) {
      console.log("[ShareInvoice] error:", e);
    }
  };

  if (loading) {
    return (
      <View style={[s.root, s.center]}>
        <ActivityIndicator size="large" color="#00bcd4" />
        <Text style={s.loadingText}>Generating Digital Invoice…</Text>
      </View>
    );
  }

  return (
    <View style={s.root}>
      {/* Top Header */}
      <View style={s.header}>
        <Pressable onPress={() => navigation.navigate("HomeDashboard")} style={s.iconBtn}>
          <Ionicons name="close" size={22} color="white" />
        </Pressable>
        <Text style={s.headerTitle}>Invoice & Receipt</Text>
        <Pressable onPress={handleShareInvoice} style={s.iconBtn}>
          <Ionicons name="share-social-outline" size={20} color="white" />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {/* Success Completion Banner */}
        <Animated.View entering={FadeInDown.duration(350)}>
          <LinearGradient
            colors={["#064e3b", "#065f46", "#047857"]}
            style={s.heroBanner}
          >
            <View style={s.successIconWrap}>
              <Ionicons name="checkmark-done" size={32} color="#10b981" />
            </View>
            <Text style={s.heroTitle}>Service Completed Successfully!</Text>
            <Text style={s.heroSub}>
              Your job has been verified and settled. Here is your official tax invoice.
            </Text>
          </LinearGradient>
        </Animated.View>

        {/* Official Tax Invoice Container */}
        <Animated.View entering={FadeInDown.delay(100).duration(380)} style={s.invoiceCard}>
          {/* Invoice Header */}
          <View style={s.invoiceTop}>
            <View>
              <Text style={s.brandTitle}>URBAN HELPERS</Text>
              <Text style={s.brandSub}>TAX INVOICE / RECEIPT</Text>
            </View>
            <View style={s.paidBadge}>
              <Ionicons name="shield-checkmark" size={14} color="#10b981" />
              <Text style={s.paidBadgeText}>PAID ONLINE</Text>
            </View>
          </View>

          <View style={s.dashDivider} />

          {/* Invoice Meta */}
          <View style={s.metaGrid}>
            <View style={s.metaCol}>
              <Text style={s.metaLabel}>INVOICE NO.</Text>
              <Text style={s.metaValBold}>{invoiceNo}</Text>
            </View>
            <View style={[s.metaCol, { alignItems: "flex-end" }]}>
              <Text style={s.metaLabel}>DATE & TIME</Text>
              <Text style={s.metaVal}>{formattedDate}</Text>
            </View>
          </View>

          <View style={s.metaGrid}>
            <View style={s.metaCol}>
              <Text style={s.metaLabel}>SERVICE PARTNER</Text>
              <Text style={s.metaValBold}>{booking?.vendorName || "Verified Specialist"}</Text>
            </View>
            <View style={[s.metaCol, { alignItems: "flex-end" }]}>
              <Text style={s.metaLabel}>SERVICE CATEGORY</Text>
              <Text style={s.metaVal}>{booking?.serviceCategory || "Home Care"}</Text>
            </View>
          </View>

          {/* Customer Address */}
          {booking?.address && (
            <View style={{ marginTop: 10 }}>
              <Text style={s.metaLabel}>SERVICE LOCATION</Text>
              <Text style={s.metaVal} numberOfLines={2}>{booking.address}</Text>
            </View>
          )}

          {/* Rating Given Badge if already rated */}
          {booking?.rated && (
            <View style={s.ratingBadgeWrap}>
              <View style={s.ratingStarsRow}>
                {[1, 2, 3, 4, 5].map((st) => (
                  <Ionicons
                    key={st}
                    name="star"
                    size={16}
                    color={st <= (booking.rating || 5) ? "#f59e0b" : "rgba(255,255,255,0.2)"}
                  />
                ))}
                <Text style={s.ratingScoreText}>{booking.rating || 5}.0 Rated</Text>
              </View>
              {booking.review ? (
                <Text style={s.ratingReviewSnippet}>"{booking.review}"</Text>
              ) : null}
            </View>
          )}

          <View style={s.solidDivider} />

          {/* Itemized Table */}
          <View style={s.tableWrap}>
            <View style={s.tableHeaderRow}>
              <Text style={s.tableHeadText}>ITEM DESCRIPTION</Text>
              <Text style={s.tableHeadTextRight}>AMOUNT</Text>
            </View>

            <View style={s.tableItemRow}>
              <View style={{ flex: 1 }}>
                <Text style={s.itemTitle}>{booking?.subServiceName || booking?.serviceCategory || "Service"}</Text>
                <Text style={s.itemSub}>Includes professional labor & equipment</Text>
              </View>
              <Text style={s.itemPrice}>₹{baseServiceFee}</Text>
            </View>

            <View style={s.tableItemRow}>
              <View style={{ flex: 1 }}>
                <Text style={s.itemTitle}>Safety & Platform Fee</Text>
                <Text style={s.itemSub}>Insurance & secure dispatch coverage</Text>
              </View>
              <Text style={s.itemPrice}>₹{platformFee}</Text>
            </View>

            <View style={s.tableItemRow}>
              <View style={{ flex: 1 }}>
                <Text style={s.itemTitle}>Taxes & GST (18%)</Text>
                <Text style={s.itemSub}>CGST 9% + SGST 9%</Text>
              </View>
              <Text style={s.itemPrice}>₹{gst}</Text>
            </View>

            {discount > 0 && (
              <View style={s.tableItemRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[s.itemTitle, { color: "#10b981" }]}>Coupon Discount</Text>
                  <Text style={s.itemSub}>{booking?.couponCode || "Special Offer"}</Text>
                </View>
                <Text style={[s.itemPrice, { color: "#10b981" }]}>-₹{discount}</Text>
              </View>
            )}

            {booking?.tip && (
              <View style={s.tableItemRow}>
                <View style={{ flex: 1 }}>
                  <Text style={s.itemTitle}>Captain Tip</Text>
                  <Text style={s.itemSub}>100% forwarded to partner</Text>
                </View>
                <Text style={s.itemPrice}>{booking.tip}</Text>
              </View>
            )}

            <View style={s.totalRow}>
              <Text style={s.totalLabel}>Grand Total Paid</Text>
              <Text style={s.totalAmount}>₹{total}</Text>
            </View>
          </View>

          {/* Statutory Footer */}
          <View style={s.invoiceFooter}>
            <Ionicons name="receipt-outline" size={14} color="rgba(255,255,255,0.4)" />
            <Text style={s.footerNote}>
              HSN/SAC: 998721 • GSTIN: 33AAECU1234F1Z5 • Computer-generated digital invoice.
            </Text>
          </View>
        </Animated.View>

        <View style={{ height: 140 }} />
      </ScrollView>

      {/* Bottom Floating Actions */}
      <View style={s.ctaWrap}>
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
    marginBottom: 16,
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
