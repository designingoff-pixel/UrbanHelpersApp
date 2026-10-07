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
  const gst = Math.round((taxablePortion * 0.18) / 1.18);
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
      padding: 10px 12px;
      font-size: 12px;
      text-transform: uppercase;
      color: #64748b;
      border-bottom: 1px solid #e2e8f0;
    }
    td {
      padding: 12px;
      font-size: 13px;
      border-bottom: 1px solid #f1f5f9;
    }
    .total-box {
      margin-left: auto;
      width: 280px;
      background: #f8fafc;
      border-radius: 8px;
      padding: 16px;
      border: 1px solid #e2e8f0;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      margin-bottom: 8px;
    }
    .total-row.grand {
      font-size: 16px;
      font-weight: 800;
      color: #065f46;
      border-top: 2px solid #059669;
      padding-top: 10px;
      margin-top: 10px;
    }
    .footer {
      margin-top: 40px;
      border-top: 1px solid #e2e8f0;
      padding-top: 16px;
      text-align: center;
      font-size: 11px;
      color: #94a3b8;
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1 class="brand-title">URBAN HELPERS</h1>
      <div class="brand-tag">Everyday Services, Seamlessly Delivered</div>
    </div>
    <div class="invoice-badge">
      <h2 class="invoice-title">TAX INVOICE</h2>
      <div class="invoice-no">${invoiceNo}</div>
      <div class="paid-stamp">PAID ONLINE</div>
    </div>
  </div>

  <div class="grid">
    <div class="card">
      <div class="card-title">Billed To</div>
      <div class="card-value-bold">${booking?.customerName || "Customer"}</div>
      <div class="card-text">${booking?.address || "Address"}</div>
    </div>
    <div class="card">
      <div class="card-title">Service Partner</div>
      <div class="card-value-bold">${booking?.vendorName || "Urban Captain Professional"}</div>
      <div class="card-text">Category: ${booking?.serviceCategory || "Home Service"}</div>
      <div class="card-text">Date: ${formattedDate}</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Service Description</th>
        <th style="text-align:right;">Amount (INR)</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>
          <strong>${booking?.subServiceName || booking?.serviceCategory || "Home Service"}</strong><br />
          <span style="font-size:11px; color:#64748b;">Professional execution by verified partner</span>
        </td>
        <td style="text-align:right;">₹${baseServiceFee}</td>
      </tr>
      <tr>
        <td>Platform &amp; Safety Convenience Fee</td>
        <td style="text-align:right;">₹${platformFee}</td>
      </tr>
      <tr>
        <td>Applicable Taxes (GST 18%)</td>
        <td style="text-align:right;">₹${gst}</td>
      </tr>
      ${
        discount > 0
          ? `<tr>
        <td style="color:#059669;">Promo Discount (${booking?.couponCode || "Applied"})</td>
        <td style="text-align:right; color:#059669;">-₹${discount}</td>
      </tr>`
          : ""
      }
    </tbody>
  </table>

  <div class="total-box">
    <div class="total-row">
      <span>Subtotal:</span>
      <span>₹${total}</span>
    </div>
    <div class="total-row grand">
      <span>Total Paid:</span>
      <span>₹${total}</span>
    </div>
  </div>

  ${(booking?.beforePhoto || booking?.afterPhoto) ? `
  <div style="margin-top: 28px; border-top: 1px solid #e2e8f0; padding-top: 18px;">
    <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: #64748b; margin-bottom: 12px;">Verified Service Proof Photos</div>
    <div style="display: flex; gap: 16px;">
      ${booking?.beforePhoto ? `
      <div style="flex: 1; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; text-align: center;">
        <div style="font-size: 11px; font-weight: 700; color: #475569; margin-bottom: 6px;">BEFORE SERVICE</div>
        <img src="${booking.beforePhoto}" style="width: 100%; max-height: 160px; object-fit: cover; border-radius: 6px;" />
      </div>` : ''}
      ${booking?.afterPhoto ? `
      <div style="flex: 1; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 10px; text-align: center;">
        <div style="font-size: 11px; font-weight: 700; color: #15803d; margin-bottom: 6px;">AFTER SERVICE</div>
        <img src="${booking.afterPhoto}" style="width: 100%; max-height: 160px; object-fit: cover; border-radius: 6px;" />
      </div>` : ''}
    </div>
  </div>` : ''}

  <div class="footer">
    Urban Helpers Services Private Limited • HSN/SAC: 998721 • GSTIN: 33AAECU1234F1Z5<br />
    This is a computer-generated tax receipt. For queries, contact support@urbanhelpers.app.
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
        {/* Success Hero Banner */}
        <Animated.View entering={FadeInDown.duration(380)} style={s.heroBanner}>
          <LinearGradient
            colors={["#065f46", "#042f2e"]}
            style={[StyleSheet.absoluteFillObject, { borderRadius: 22 }]}
          />
          <View style={s.successIconWrap}>
            <Ionicons name="checkmark-circle" size={38} color="#10b981" />
          </View>
          <Text style={s.heroTitle}>Service Completed Successfully</Text>
          <Text style={s.heroSub}>
            Your service has been completed and verified by {booking?.vendorName || "our captain"}.
          </Text>
        </Animated.View>

        {/* Work Verification Photos (Before & After Proof) */}
        {(booking?.beforePhoto || booking?.afterPhoto) && (
          <Animated.View entering={FadeInDown.delay(60).duration(380)} style={s.photoCard}>
            <View style={s.photoCardHeader}>
              <Ionicons name="camera" size={16} color="#00bcd4" />
              <Text style={s.photoCardTitle}>WORK VERIFICATION PROOF</Text>
            </View>
            <Text style={s.photoCardSub}>Verified photos captured by your technician before and after service</Text>

            <View style={s.photoGrid}>
              {booking.beforePhoto && (
                <View style={s.photoCol}>
                  <Text style={s.photoTag}>Before Service</Text>
                  <Image source={{ uri: booking.beforePhoto }} style={s.proofImg} />
                </View>
              )}
              {booking.afterPhoto && (
                <View style={s.photoCol}>
                  <Text style={s.photoTag}>After Service</Text>
                  <Image source={{ uri: booking.afterPhoto }} style={s.proofImg} />
                </View>
              )}
            </View>
          </Animated.View>
        )}

        {/* Invoice Summary Card */}
        <Animated.View entering={FadeInDown.delay(100).duration(380)} style={s.invoiceCard}>
          <View style={s.invoiceTop}>
            <View>
              <Text style={s.brandTitle}>URBAN HELPERS</Text>
              <Text style={s.brandSub}>Tax Invoice #{invoiceNo.slice(-8)}</Text>
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
              <Text style={s.metaLabel}>SERVICE CATEGORY</Text>
              <Text style={s.metaValBold}>{booking?.serviceCategory || "Home Service"}</Text>
            </View>
            <View style={s.metaCol}>
              <Text style={s.metaLabel}>SERVICE PARTNER</Text>
              <Text style={s.metaValBold}>{booking?.vendorName || "Assigned Partner"}</Text>
            </View>
          </View>

          <View style={s.metaGrid}>
            <View style={s.metaCol}>
              <Text style={s.metaLabel}>SCHEDULED TIME</Text>
              <Text style={s.metaVal}>{formattedDate}</Text>
            </View>
            <View style={s.metaCol}>
              <Text style={s.metaLabel}>LOCATION</Text>
              <Text style={s.metaVal} numberOfLines={1}>{booking?.address || "Customer Address"}</Text>
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
              <Text style={s.tableHeadText}>ITEM / DESCRIPTION</Text>
              <Text style={s.tableHeadTextRight}>AMOUNT</Text>
            </View>

            <View style={s.tableItemRow}>
              <View style={{ flex: 1 }}>
                <Text style={s.itemTitle}>{booking?.subServiceName || booking?.serviceCategory || "Service Fee"}</Text>
                <Text style={s.itemSub}>Standard Service Charge</Text>
              </View>
              <Text style={s.itemPrice}>₹{baseServiceFee}</Text>
            </View>

            <View style={s.tableItemRow}>
              <View style={{ flex: 1 }}>
                <Text style={s.itemTitle}>Platform &amp; Convenience</Text>
                <Text style={s.itemSub}>Safety assurance &amp; support</Text>
              </View>
              <Text style={s.itemPrice}>₹{platformFee}</Text>
            </View>

            <View style={s.tableItemRow}>
              <View style={{ flex: 1 }}>
                <Text style={s.itemTitle}>Taxes (GST 18%)</Text>
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
    height: 120,
    borderRadius: 12,
    backgroundColor: "#081826",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
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
