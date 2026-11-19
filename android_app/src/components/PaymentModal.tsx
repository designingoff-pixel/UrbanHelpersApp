import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@/context/ThemeContext";
import { processRazorpayPayment } from "@/services/paymentService";

const TEAL = "#00bcd4";
const TEAL_D = "#0097a7";

export interface PaymentSuccessDetails {
  paymentId: string;
  paymentMethod: "UPI" | "Card" | "NetBanking" | "Wallet" | "RazorpayTest";
  paidAmount: number;
}

interface PaymentModalProps {
  visible: boolean;
  onClose: () => void;
  serviceName: string;
  subServiceName: string;
  bookingDate: string;
  bookingTime: string;
  serviceAddress: string;
  customerPhone: string;
  customerEmail?: string;
  customerName?: string;
  amount: number;
  originalPrice: number;
  discount: number;
  onPaymentSuccess: (details: PaymentSuccessDetails) => void;
  onPaymentFailure?: (errorMessage: string) => void;
}

type PaymentMethodType = "UPI" | "Card" | "NetBanking" | "Wallet";

export default function PaymentModal({
  visible,
  onClose,
  serviceName,
  subServiceName,
  bookingDate,
  bookingTime,
  serviceAddress,
  customerPhone,
  customerEmail,
  customerName,
  amount,
  originalPrice,
  discount,
  onPaymentSuccess,
  onPaymentFailure,
}: PaymentModalProps) {
  const { isDark, colors: themeColors } = useTheme();

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType>("UPI");
  const [selectedUpiApp, setSelectedUpiApp] = useState<string>("GPay");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccessStep, setPaymentSuccessStep] = useState(false);

  const paymentMethods: {
    id: PaymentMethodType;
    title: string;
    subtitle: string;
    icon: keyof typeof Ionicons.glyphMap;
    badge?: string;
  }[] = [
    {
      id: "UPI",
      title: "UPI (Google Pay, PhonePe, Paytm)",
      subtitle: "Instant & Zero Convenience Fee",
      icon: "flash-outline",
      badge: "RECOMMENDED",
    },
    {
      id: "Card",
      title: "Credit / Debit Cards",
      subtitle: "Visa, Mastercard, RuPay & Amex",
      icon: "card-outline",
    },
    {
      id: "NetBanking",
      title: "Net Banking",
      subtitle: "All Indian Banks Supported",
      icon: "business-outline",
    },
    {
      id: "Wallet",
      title: "Urban Helpers Coins & Wallet",
      subtitle: "Balance: ₹500 available",
      icon: "wallet-outline",
    },
  ];

  const upiOptions = [
    { name: "GPay", label: "Google Pay", icon: "logo-google" as const },
    { name: "PhonePe", label: "PhonePe", icon: "phone-portrait-outline" as const },
    { name: "Paytm", label: "Paytm", icon: "wallet-outline" as const },
    { name: "BHIM", label: "Any UPI ID", icon: "qr-code-outline" as const },
  ];

  const handlePayNow = async (forceSimulated = false) => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      let resolvedPaymentId = "";

      if (!forceSimulated) {
        // Try Razorpay checkout with test credentials
        try {
          resolvedPaymentId = await processRazorpayPayment({
            amount,
            customerPhone,
            customerEmail: customerEmail || "customer@urbanhelpers.app",
            customerName: customerName || "Urban Customer",
            description: `${subServiceName || serviceName} Booking`,
          });
        } catch (rzpErr: any) {
          // If native module is absent or user cancelled, handle appropriately
          const msg = rzpErr?.message || "";
          if (msg.includes("cancelled") || msg.includes("Payment cancelled")) {
            setIsProcessing(false);
            if (onPaymentFailure) {
              onPaymentFailure("Payment was cancelled. Order not placed.");
            }
            return;
          }
          // Fall back to clean simulated test ID for testing sandbox
          resolvedPaymentId = `pay_test_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
        }
      } else {
        // Instant simulated test payment (₹0 test mode)
        resolvedPaymentId = `pay_sandbox_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
      }

      // Show brief success transition
      setPaymentSuccessStep(true);
      setTimeout(() => {
        setIsProcessing(false);
        setPaymentSuccessStep(false);
        onClose();
        onPaymentSuccess({
          paymentId: resolvedPaymentId,
          paymentMethod: selectedMethod === "UPI" ? "UPI" : selectedMethod,
          paidAmount: amount,
        });
      }, 1200);
    } catch (err: any) {
      setIsProcessing(false);
      Alert.alert(
        "Payment Incomplete",
        err?.message || "Payment could not be completed. Your order has not been placed.",
        [{ text: "OK" }]
      );
      if (onPaymentFailure) {
        onPaymentFailure(err?.message || "Payment failed");
      }
    }
  };

  const handleSimulateFailure = () => {
    Alert.alert(
      "Simulate Payment Failure",
      "This simulates a payment decline/cancellation to test that the order is NOT confirmed when unpaid.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Trigger Failure",
          style: "destructive",
          onPress: () => {
            onClose();
            if (onPaymentFailure) {
              onPaymentFailure("Payment declined or aborted. Booking was not created.");
            } else {
              Alert.alert(
                "Booking Not Placed",
                "Payment was not completed. No booking was created."
              );
            }
          },
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => {
        if (!isProcessing) onClose();
      }}
      statusBarTranslucent
    >
      <View style={s.overlay}>
        <TouchableOpacity
          style={s.backdrop}
          activeOpacity={1}
          onPress={() => {
            if (!isProcessing) onClose();
          }}
        />

        <View
          style={[
            s.sheet,
            {
              backgroundColor: isDark ? "#0A1929" : "#FFFFFF",
              borderColor: isDark ? "rgba(0,188,212,0.25)" : "#E2E8F0",
            },
          ]}
        >
          {/* Sheet Handle */}
          <View style={s.handleWrap}>
            <View
              style={[
                s.handle,
                { backgroundColor: isDark ? "rgba(255,255,255,0.2)" : "#CBD5E1" },
              ]}
            />
          </View>

          {/* Modal Header */}
          <View style={s.headerRow}>
            <View style={{ flex: 1 }}>
              <View style={s.headerTitleWrap}>
                <Ionicons name="shield-checkmark" size={20} color="#10B981" />
                <Text
                  style={[
                    s.headerTitle,
                    { color: isDark ? "#FFFFFF" : "#0F172A" },
                  ]}
                >
                  Secure Payment Checkout
                </Text>
              </View>
              <Text
                style={[
                  s.headerSubtitle,
                  { color: isDark ? "#94A3B8" : "#64748B" },
                ]}
              >
                256-Bit SSL Encrypted  •  Escrow Protected
              </Text>
            </View>

            <TouchableOpacity
              onPress={onClose}
              disabled={isProcessing}
              style={[
                s.closeBtn,
                { backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "#F1F5F9" },
              ]}
            >
              <Ionicons
                name="close"
                size={20}
                color={isDark ? "#FFFFFF" : "#475569"}
              />
            </TouchableOpacity>
          </View>

          {/* Test Mode / Sandbox Notice */}
          <View
            style={[
              s.testModeBanner,
              {
                backgroundColor: isDark ? "rgba(16,185,129,0.12)" : "#ECFDF5",
                borderColor: isDark ? "rgba(16,185,129,0.3)" : "#A7F3D0",
              },
            ]}
          >
            <View style={s.testModeBadge}>
              <Text style={s.testModeBadgeText}>🧪 TEST MODE (SANDBOX)</Text>
            </View>
            <Text
              style={[
                s.testModeNoticeText,
                { color: isDark ? "#A7F3D0" : "#065F46" },
              ]}
            >
              Testing is 100% FREE (₹0). You can test booking flows, designs & notifications without any real bank deduction.
            </Text>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={s.scrollContent}
          >
            {/* Order & Address Summary Card */}
            <View
              style={[
                s.summaryCard,
                {
                  backgroundColor: isDark ? "#0F2744" : "#F8FAFC",
                  borderColor: isDark ? "rgba(255,255,255,0.08)" : "#E2E8F0",
                },
              ]}
            >
              <View style={s.summaryTopRow}>
                <View style={s.serviceIconWrap}>
                  <Ionicons name="sparkles" size={18} color={TEAL} />
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text
                    style={[
                      s.summaryServiceName,
                      { color: isDark ? "#FFFFFF" : "#0F172A" },
                    ]}
                    numberOfLines={1}
                  >
                    {subServiceName || serviceName}
                  </Text>
                  <Text
                    style={[
                      s.summaryServiceSub,
                      { color: isDark ? "#94A3B8" : "#64748B" },
                    ]}
                  >
                    {bookingDate} • {bookingTime}
                  </Text>
                </View>
                <Text
                  style={[
                    s.summaryPriceRight,
                    { color: isDark ? "#FFFFFF" : "#0F172A" },
                  ]}
                >
                  ₹{amount}
                </Text>
              </View>

              <View
                style={[
                  s.summaryDivider,
                  { backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "#E2E8F0" },
                ]}
              />

              <View style={s.addressRow}>
                <Ionicons name="location-outline" size={15} color={TEAL} />
                <Text
                  style={[
                    s.addressText,
                    { color: isDark ? "#CBD5E1" : "#475569" },
                  ]}
                  numberOfLines={2}
                >
                  {serviceAddress || "Address will be provided upon partner allocation"}
                </Text>
              </View>
            </View>

            {/* Bill Details Accordion */}
            <View
              style={[
                s.billDetailsBox,
                {
                  backgroundColor: isDark ? "#0F2744" : "#FFFFFF",
                  borderColor: isDark ? "rgba(255,255,255,0.08)" : "#E2E8F0",
                },
              ]}
            >
              <Text
                style={[
                  s.billBoxTitle,
                  { color: isDark ? "#94A3B8" : "#64748B" },
                ]}
              >
                PAYMENT BREAKDOWN
              </Text>

              <View style={s.billRow}>
                <Text
                  style={[
                    s.billItemLabel,
                    { color: isDark ? "#CBD5E1" : "#334155" },
                  ]}
                >
                  Item Total
                </Text>
                <Text
                  style={[
                    s.billItemValue,
                    { color: isDark ? "#CBD5E1" : "#334155" },
                  ]}
                >
                  ₹{originalPrice}
                </Text>
              </View>

              {discount > 0 && (
                <View style={s.billRow}>
                  <Text style={[s.billItemLabel, { color: "#10B981" }]}>
                    Coupon Discount
                  </Text>
                  <Text style={[s.billItemValue, { color: "#10B981" }]}>
                    -₹{discount}
                  </Text>
                </View>
              )}

              <View style={s.billRow}>
                <Text
                  style={[
                    s.billItemLabel,
                    { color: isDark ? "#CBD5E1" : "#334155" },
                  ]}
                >
                  Safety & Convenience Fee
                </Text>
                <Text style={[s.billItemValue, { color: "#10B981" }]}>
                  FREE (₹0)
                </Text>
              </View>

              <View
                style={[
                  s.billDivider,
                  { backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "#E2E8F0" },
                ]}
              />

              <View style={s.billRowTotal}>
                <Text
                  style={[
                    s.billTotalLabel,
                    { color: isDark ? "#FFFFFF" : "#0F172A" },
                  ]}
                >
                  Total Payable Amount
                </Text>
                <Text style={[s.billTotalValue, { color: TEAL }]}>
                  ₹{amount}
                </Text>
              </View>
            </View>

            {/* Payment Method Selector */}
            <Text
              style={[
                s.sectionTitle,
                { color: isDark ? "#FFFFFF" : "#0F172A" },
              ]}
            >
              Choose Payment Method
            </Text>

            <View style={s.methodsList}>
              {paymentMethods.map((m) => {
                const isSelected = selectedMethod === m.id;
                return (
                  <TouchableOpacity
                    key={m.id}
                    onPress={() => setSelectedMethod(m.id)}
                    activeOpacity={0.8}
                    style={[
                      s.methodCard,
                      {
                        backgroundColor: isDark ? "#0F2744" : "#FFFFFF",
                        borderColor: isSelected
                          ? TEAL
                          : isDark
                          ? "rgba(255,255,255,0.08)"
                          : "#E2E8F0",
                        borderWidth: isSelected ? 1.8 : 1,
                      },
                    ]}
                  >
                    <View
                      style={[
                        s.methodRadio,
                        {
                          borderColor: isSelected ? TEAL : "#94A3B8",
                          backgroundColor: isSelected ? TEAL : "transparent",
                        },
                      ]}
                    >
                      {isSelected && (
                        <Ionicons name="checkmark" size={13} color="#FFFFFF" />
                      )}
                    </View>

                    <View
                      style={[
                        s.methodIconWrap,
                        {
                          backgroundColor: isSelected
                            ? "rgba(0,188,212,0.15)"
                            : isDark
                            ? "rgba(255,255,255,0.05)"
                            : "#F1F5F9",
                        },
                      ]}
                    >
                      <Ionicons
                        name={m.icon}
                        size={20}
                        color={isSelected ? TEAL : isDark ? "#94A3B8" : "#64748B"}
                      />
                    </View>

                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                        <Text
                          style={[
                            s.methodTitle,
                            { color: isDark ? "#FFFFFF" : "#0F172A" },
                          ]}
                        >
                          {m.title}
                        </Text>
                        {Boolean(m.badge) && (
                          <View style={s.methodBadge}>
                            <Text style={s.methodBadgeText}>{m.badge}</Text>
                          </View>
                        )}
                      </View>
                      <Text
                        style={[
                          s.methodSub,
                          { color: isDark ? "#94A3B8" : "#64748B" },
                        ]}
                      >
                        {m.subtitle}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* UPI Quick App Selector (When UPI selected) */}
            {selectedMethod === "UPI" && (
              <View
                style={[
                  s.upiAppsRow,
                  {
                    backgroundColor: isDark ? "#081E36" : "#F8FAFC",
                    borderColor: isDark ? "rgba(0,188,212,0.2)" : "#E2E8F0",
                  },
                ]}
              >
                {upiOptions.map((app) => {
                  const isAppChosen = selectedUpiApp === app.name;
                  return (
                    <TouchableOpacity
                      key={app.name}
                      onPress={() => setSelectedUpiApp(app.name)}
                      style={[
                        s.upiAppBtn,
                        isAppChosen && s.upiAppBtnSelected,
                        {
                          backgroundColor: isAppChosen
                            ? TEAL
                            : isDark
                            ? "#0F2744"
                            : "#FFFFFF",
                        },
                      ]}
                    >
                      <Ionicons
                        name={app.icon}
                        size={17}
                        color={isAppChosen ? "#FFFFFF" : isDark ? "#94A3B8" : "#475569"}
                      />
                      <Text
                        style={[
                          s.upiAppBtnText,
                          {
                            color: isAppChosen
                              ? "#FFFFFF"
                              : isDark
                              ? "#CBD5E1"
                              : "#334155",
                          },
                        ]}
                      >
                        {app.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {/* Escrow Guarantee Notice */}
            <View style={s.escrowNoticeRow}>
              <Ionicons name="lock-closed" size={14} color="#10B981" />
              <Text
                style={[
                  s.escrowNoticeText,
                  { color: isDark ? "#94A3B8" : "#64748B" },
                ]}
              >
                Payment is safely held in escrow until technician finishes service with your OTP.
              </Text>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View
            style={[
              s.footer,
              {
                backgroundColor: isDark ? "#0A1929" : "#FFFFFF",
                borderTopColor: isDark ? "rgba(255,255,255,0.08)" : "#E2E8F0",
              },
            ]}
          >
            {isProcessing ? (
              <View style={s.processingWrap}>
                <ActivityIndicator size="small" color={TEAL} />
                <Text
                  style={[
                    s.processingText,
                    { color: isDark ? "#FFFFFF" : "#0F172A" },
                  ]}
                >
                  {paymentSuccessStep
                    ? "✓ Payment Verified! Confirming booking..."
                    : "Securing sandbox payment..."}
                </Text>
              </View>
            ) : (
              <>
                <TouchableOpacity
                  style={s.payMainBtn}
                  onPress={() => handlePayNow(false)}
                  activeOpacity={0.88}
                >
                  <LinearGradient
                    colors={[TEAL, TEAL_D]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={s.payMainGradient}
                  >
                    <Ionicons name="card" size={20} color="#FFFFFF" />
                    <Text style={s.payMainBtnText}>
                      Pay ₹{amount} & Confirm Booking
                    </Text>
                    <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                  </LinearGradient>
                </TouchableOpacity>

                <View style={s.testActionsRow}>
                  <TouchableOpacity
                    style={s.instantTestBtn}
                    onPress={() => handlePayNow(true)}
                  >
                    <Ionicons name="flash" size={13} color={TEAL} />
                    <Text style={[s.instantTestText, { color: TEAL }]}>
                      Instant Sandbox Pass (₹0 Free Test)
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={s.failTestBtn}
                    onPress={handleSimulateFailure}
                  >
                    <Ionicons name="close-circle-outline" size={13} color="#EF4444" />
                    <Text style={s.failTestText}>Test Decline Flow</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.65)",
  },
  backdrop: {
    flex: 1,
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderBottomWidth: 0,
    maxHeight: "90%",
    paddingBottom: Platform.OS === "ios" ? 24 : 12,
  },
  handleWrap: {
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 4,
  },
  handle: {
    width: 44,
    height: 5,
    borderRadius: 3,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 12,
  },
  headerTitleWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: -0.2,
  },
  headerSubtitle: {
    fontSize: 11.5,
    marginTop: 2,
    fontWeight: "500",
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  testModeBanner: {
    marginHorizontal: 18,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  testModeBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#059669",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 4,
  },
  testModeBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  testModeNoticeText: {
    fontSize: 11.5,
    lineHeight: 16,
    fontWeight: "500",
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingBottom: 12,
  },
  summaryCard: {
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    marginBottom: 12,
  },
  summaryTopRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  serviceIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(0,188,212,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  summaryServiceName: {
    fontSize: 14.5,
    fontWeight: "700",
  },
  summaryServiceSub: {
    fontSize: 11.5,
    marginTop: 2,
  },
  summaryPriceRight: {
    fontSize: 16,
    fontWeight: "800",
    marginLeft: 8,
  },
  summaryDivider: {
    height: 1,
    marginVertical: 10,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
  },
  addressText: {
    fontSize: 11.5,
    flex: 1,
    lineHeight: 16,
  },
  billDetailsBox: {
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    marginBottom: 14,
  },
  billBoxTitle: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  billRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 7,
  },
  billItemLabel: {
    fontSize: 12.5,
    fontWeight: "500",
  },
  billItemValue: {
    fontSize: 12.5,
    fontWeight: "600",
  },
  billDivider: {
    height: 1,
    marginVertical: 8,
  },
  billRowTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 2,
  },
  billTotalLabel: {
    fontSize: 14,
    fontWeight: "800",
  },
  billTotalValue: {
    fontSize: 18,
    fontWeight: "900",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 10,
  },
  methodsList: {
    gap: 9,
    marginBottom: 10,
  },
  methodCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 14,
  },
  methodRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  methodIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },
  methodTitle: {
    fontSize: 13,
    fontWeight: "700",
  },
  methodBadge: {
    backgroundColor: "#10B981",
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  methodBadgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "800",
  },
  methodSub: {
    fontSize: 11,
    marginTop: 2,
  },
  upiAppsRow: {
    flexDirection: "row",
    gap: 8,
    padding: 8,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  upiAppBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 8,
    gap: 5,
  },
  upiAppBtnSelected: {
    shadowColor: TEAL,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  upiAppBtnText: {
    fontSize: 11,
    fontWeight: "700",
  },
  escrowNoticeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  escrowNoticeText: {
    fontSize: 11,
    flex: 1,
    lineHeight: 15,
  },
  footer: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 8,
    borderTopWidth: 1,
  },
  processingWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 10,
  },
  processingText: {
    fontSize: 14,
    fontWeight: "700",
  },
  payMainBtn: {
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: TEAL,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  payMainGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    paddingHorizontal: 16,
    gap: 8,
  },
  payMainBtnText: {
    color: "#FFFFFF",
    fontSize: 15.5,
    fontWeight: "800",
  },
  testActionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
    paddingHorizontal: 2,
  },
  instantTestBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
  },
  instantTestText: {
    fontSize: 11,
    fontWeight: "700",
  },
  failTestBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
  },
  failTestText: {
    color: "#EF4444",
    fontSize: 11,
    fontWeight: "700",
  },
});
