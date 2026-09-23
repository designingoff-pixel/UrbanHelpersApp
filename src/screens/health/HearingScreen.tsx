import React, { useState, useEffect, useCallback } from "react";
import {
  ScrollView,
  Text,
  View,
  Pressable,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Alert,
  Modal,
} from "react-native";
import Svg, { Rect, Circle, Path } from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/types";
import { useAuth } from "@/context/AuthContext";
import {
  HearingEntry,
  HearingStatus,
  getHearingForDate,
  getLast7DaysHearing,
  hearingStatusLabel,
} from "@/services/healthLogService";

type Props = NativeStackScreenProps<RootStackParamList, "Hearing">;

const { width: SW } = Dimensions.get("window");

// ─── Colour tokens ───────────────────────────────────────────
const BG = "#041423";
const CARD_BG = "#0d1c29";
const CARD_BORDER = "rgba(255,255,255,0.08)";
const TEXT_PRIMARY = "#d4e4f9";
const TEXT_SECONDARY = "rgba(255,255,255,0.55)";
const TEXT_MUTED = "rgba(255,255,255,0.35)";

const STATUS_COLORS: Record<HearingStatus, string> = {
  ok: "#22c55e",
  caution: "#facc15",
  unsafe: "#f97316",
};

// ─── Helpers ─────────────────────────────────────────────────
function dateToKey(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-");
}

function offsetToLabel(offset: number): string {
  if (offset === 0) return "Today";
  if (offset === -1) return "Yesterday";
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function shortDay(dateStr: string): string {
  return String(parseInt(dateStr.split("-")[2], 10));
}

// ─── SVG smartwatch graphic ───────────────────────────────────
function WatchGraphic() {
  return (
    <Svg width={60} height={60} viewBox="0 0 80 80">
      <Rect x="27" y="2" width="26" height="76" rx="8" fill="#1e2d3d" />
      <Circle cx="40" cy="40" r="29" fill="#112130" stroke="#2b3b4b" strokeWidth="2.5" />
      <Circle cx="40" cy="40" r="22" fill="#041423" />
      <Path
        d="M30 40 Q30 33 40 33 Q50 33 50 40"
        stroke="#4fdbc8"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d="M26 40 Q26 28 40 28 Q54 28 54 40"
        stroke="#b4c5ff"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity={0.6}
      />
      <Path
        d="M22 40 Q22 23 40 23 Q58 23 58 40"
        stroke="#b4c5ff"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        opacity={0.3}
      />
      <Circle cx="40" cy="40" r="4" fill="#4fdbc8" />
    </Svg>
  );
}

// ─── 3-segment exposure bar ───────────────────────────────────
function ExposureBar({ activeStatus }: { activeStatus: HearingStatus | null }) {
  const totalWidth = SW - 48;
  const gap = 6;
  const segWidth = (totalWidth - gap * 2) / 3;

  const segments: { status: HearingStatus; label: string; color: string }[] = [
    { status: "ok", label: "OK", color: STATUS_COLORS.ok },
    { status: "caution", label: "Caution", color: STATUS_COLORS.caution },
    { status: "unsafe", label: "Unsafe", color: STATUS_COLORS.unsafe },
  ];

  return (
    <View style={barS.wrap}>
      <View style={barS.segRow}>
        {segments.map((seg, i) => (
          <View
            key={seg.status}
            style={[
              barS.seg,
              {
                width: segWidth,
                backgroundColor: seg.color,
                opacity: activeStatus === null ? 1 : activeStatus === seg.status ? 1 : 0.22,
                marginLeft: i === 0 ? 0 : gap,
                borderRadius: i === 0 ? 6 : i === 2 ? 6 : 4,
              },
            ]}
          />
        ))}
      </View>
      <View style={barS.labelRow}>
        {segments.map((seg, i) => (
          <View key={seg.status} style={{ width: segWidth, alignItems: i === 0 ? "flex-start" : i === 2 ? "flex-end" : "center" }}>
            <Text
              style={[
                barS.label,
                {
                  color:
                    activeStatus === null
                      ? TEXT_SECONDARY
                      : activeStatus === seg.status
                      ? seg.color
                      : TEXT_MUTED,
                  fontWeight: activeStatus === seg.status ? "700" : "400",
                },
              ]}
            >
              {seg.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const barS = StyleSheet.create({
  wrap: { marginTop: 18 },
  segRow: { flexDirection: "row" },
  seg: { height: 16, borderRadius: 6 },
  labelRow: { flexDirection: "row", marginTop: 6 },
  label: { fontSize: 11 },
});

// ─── 7-day chart ─────────────────────────────────────────────
function SevenDayChart({
  slots,
  todayKey,
}: {
  slots: { date: string; entry: HearingEntry | null }[];
  todayKey: string;
}) {
  const hasAnyData = slots.some((s) => s.entry !== null);
  const colWidth = (SW - 48) / 7;

  if (!hasAnyData) {
    return (
      <View style={chartS.emptyWrap}>
        <Ionicons name="analytics-outline" size={30} color={TEXT_MUTED} />
        <Text style={chartS.emptyText}>No hearing exposure data available yet.</Text>
      </View>
    );
  }

  return (
    <View style={chartS.wrap}>
      {slots.map((slot) => {
        const isToday = slot.date === todayKey;
        const status = slot.entry?.status ?? null;
        const barColor = status ? STATUS_COLORS[status] : "transparent";

        return (
          <View key={slot.date} style={[chartS.col, { width: colWidth }]}>
            <View style={chartS.barArea}>
              {slot.entry && (
                <View style={[chartS.bar, { backgroundColor: barColor }]} />
              )}
            </View>
            <Text style={[chartS.dayLabel, isToday && chartS.dayLabelToday]}>
              {shortDay(slot.date)}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const chartS = StyleSheet.create({
  wrap: { flexDirection: "row", paddingTop: 8 },
  col: { alignItems: "center" },
  barArea: { height: 32, justifyContent: "flex-end", alignItems: "center" },
  bar: { width: 10, height: 26, borderRadius: 4 },
  dayLabel: { fontSize: 11, color: TEXT_MUTED, marginTop: 6 },
  dayLabelToday: { color: "#b4c5ff", fontWeight: "700" },
  emptyWrap: { alignItems: "center", paddingVertical: 20, gap: 8 },
  emptyText: { fontSize: 12.5, color: TEXT_SECONDARY, textAlign: "center" },
});

// ─── Main Screen ──────────────────────────────────────────────
type LoadState = "loading" | "done" | "error";

export default function HearingScreen({ navigation }: Props) {
  const { user } = useAuth();

  const [dayOffset, setDayOffset] = useState(0);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [currentEntry, setCurrentEntry] = useState<HearingEntry | null>(null);
  const [weekSlots, setWeekSlots] = useState<{ date: string; entry: HearingEntry | null }[]>([]);
  const [showInfoModal, setShowInfoModal] = useState(false);

  const todayKey = dateToKey(0);
  const selectedKey = dateToKey(dayOffset);

  const loadData = useCallback(async () => {
    if (!user?.uid) {
      setLoadState("done");
      return;
    }
    setLoadState("loading");
    try {
      const [entry, slots] = await Promise.all([
        getHearingForDate(user.uid, selectedKey),
        getLast7DaysHearing(user.uid),
      ]);
      setCurrentEntry(entry);
      setWeekSlots(slots);
      setLoadState("done");
    } catch {
      setLoadState("error");
    }
  }, [user?.uid, selectedKey]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const canGoNext = dayOffset < 0;

  const handleStatsPress = () =>
    Alert.alert(
      "Hearing Statistics",
      "No statistics available yet.\n\nConnect a compatible wearable to start tracking your sound exposure.",
      [{ text: "OK" }]
    );

  const handleMorePress = () =>
    Alert.alert("Hearing Options", "", [
      {
        text: "About Hearing Tracking",
        onPress: () =>
          Alert.alert(
            "About Hearing Tracking",
            "Urban Helpers tracks sound exposure to protect your hearing health.\n\n• OK  — below 70 dB\n• Caution  — 70–85 dB\n• Unsafe  — above 85 dB\n\nA compatible wearable device is required for automatic measurement.",
            [{ text: "OK" }]
          ),
      },
      {
        text: "Connect a Device",
        onPress: () =>
          Alert.alert(
            "Device Connection",
            "Wearable integration is planned for a future Urban Helpers update. Stay tuned.",
            [{ text: "OK" }]
          ),
      },
      { text: "Cancel", style: "cancel" },
    ]);

  return (
    <View style={s.root}>
      <View style={s.topSafeArea} />

      {/* ── Header ── */}
      <View style={s.header}>
        <Pressable style={s.iconBtn} onPress={() => navigation.goBack()} hitSlop={10}>
          <Ionicons name="chevron-back" size={22} color={TEXT_PRIMARY} />
        </Pressable>

        <Text style={s.headerTitle}>Hearing</Text>

        <View style={s.headerRight}>
          <Pressable style={s.iconBtn} onPress={handleStatsPress} hitSlop={10}>
            <Ionicons name="bar-chart-outline" size={19} color={TEXT_SECONDARY} />
          </Pressable>
          <Pressable style={s.iconBtn} onPress={handleMorePress} hitSlop={10}>
            <Ionicons name="ellipsis-vertical" size={19} color={TEXT_SECONDARY} />
          </Pressable>
        </View>
      </View>

      {/* ── Date Selector ── */}
      <View style={s.dateRow}>
        <Pressable style={s.dateArrow} onPress={() => setDayOffset((o) => o - 1)} hitSlop={12}>
          <Ionicons name="chevron-back" size={18} color={TEXT_PRIMARY} />
        </Pressable>

        <View style={s.datePill}>
          <Text style={s.datePillText}>{offsetToLabel(dayOffset)}</Text>
        </View>

        <Pressable
          style={[s.dateArrow, !canGoNext && s.dateArrowDim]}
          onPress={() => canGoNext && setDayOffset((o) => o + 1)}
          hitSlop={12}
        >
          <Ionicons name="chevron-forward" size={18} color={canGoNext ? TEXT_PRIMARY : TEXT_MUTED} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll} bounces>
        {/* ── Current Exposure Card ── */}
        <Animated.View entering={FadeInDown.delay(60).springify()} style={s.card}>
          <Pressable style={s.infoBtn} onPress={() => setShowInfoModal(true)} hitSlop={8}>
            <Ionicons name="information-circle-outline" size={20} color={TEXT_SECONDARY} />
          </Pressable>

          {loadState === "loading" && (
            <View style={s.centredRow}>
              <ActivityIndicator color="#b4c5ff" size="small" />
              <Text style={s.mutedText}>  Loading…</Text>
            </View>
          )}

          {loadState === "error" && (
            <View style={s.centredCol}>
              <Ionicons name="alert-circle-outline" size={26} color="#ffb4ab" />
              <Text style={[s.mutedText, { color: "#ffb4ab", marginTop: 6 }]}>Failed to load data.</Text>
              <Pressable style={s.retryBtn} onPress={loadData}>
                <Text style={s.retryText}>Retry</Text>
              </Pressable>
            </View>
          )}

          {loadState === "done" && (
            <>
              <View style={s.valueRow}>
                {currentEntry ? (
                  <>
                    <Text style={s.valueText}>{currentEntry.dBAvg}</Text>
                    <Text style={s.unitText}> dB</Text>
                  </>
                ) : (
                  <Text style={s.dashText}>--</Text>
                )}
              </View>

              {currentEntry && (
                <View style={s.statusRow}>
                  <View style={[s.statusDot, { backgroundColor: STATUS_COLORS[currentEntry.status] }]} />
                  <Text style={[s.statusLabel, { color: STATUS_COLORS[currentEntry.status] }]}>
                    {hearingStatusLabel(currentEntry.status)}
                  </Text>
                </View>
              )}

              <ExposureBar activeStatus={currentEntry?.status ?? null} />

              {!currentEntry && (
                <Text style={s.noDeviceText}>
                  Connect a compatible wearable or device to measure sound exposure.
                </Text>
              )}
            </>
          )}
        </Animated.View>

        {/* ── 7-Day Card ── */}
        <Animated.View entering={FadeInDown.delay(130).springify()} style={s.card}>
          <Pressable
            style={s.cardHeaderRow}
            onPress={() =>
              Alert.alert(
                "Exposure Trends",
                "Detailed weekly statistics require a connected device.\n\nConnect a wearable to build your 7-day exposure history.",
                [{ text: "OK" }]
              )
            }
          >
            <Text style={s.cardTitle}>Exposure over last 7 days</Text>
            <Ionicons name="chevron-forward" size={16} color={TEXT_SECONDARY} />
          </Pressable>

          <View style={s.legendRow}>
            {(["unsafe", "caution", "ok"] as HearingStatus[]).map((st) => (
              <View key={st} style={s.legendItem}>
                <View style={[s.legendDot, { backgroundColor: STATUS_COLORS[st] }]} />
                <Text style={[s.legendLabel, { color: STATUS_COLORS[st] }]}>
                  {hearingStatusLabel(st)}
                </Text>
              </View>
            ))}
          </View>

          {loadState === "loading" ? (
            <View style={s.centredRow}>
              <ActivityIndicator color="#b4c5ff" size="small" />
            </View>
          ) : loadState === "error" ? (
            <Text style={[s.mutedText, { color: "#ffb4ab" }]}>Could not load history.</Text>
          ) : (
            <SevenDayChart slots={weekSlots} todayKey={todayKey} />
          )}
        </Animated.View>

        {/* ── Track Noise Card ── */}
        <Animated.View entering={FadeInDown.delay(200).springify()} style={s.trackCard}>
          <View style={s.trackTextCol}>
            <Text style={s.trackTitle}>Track noise around you</Text>
            <Text style={s.trackSub}>
              Connect a compatible wearable or device to measure sound exposure and protect your hearing.
            </Text>
            <Pressable
              style={s.learnBtn}
              onPress={() =>
                Alert.alert(
                  "Compatible Devices",
                  "Urban Helpers hearing tracking is designed to work with compatible wearable devices.\n\nWearable integration is planned for a future update.",
                  [{ text: "OK" }]
                )
              }
            >
              <Text style={s.learnText}>Learn more</Text>
              <Ionicons name="chevron-forward" size={12} color="#b4c5ff" />
            </Pressable>
          </View>
          <View style={s.watchWrap}>
            <WatchGraphic />
          </View>
        </Animated.View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ── Info Modal ── */}
      <Modal
        visible={showInfoModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowInfoModal(false)}
      >
        <Pressable style={s.overlay} onPress={() => setShowInfoModal(false)}>
          <Animated.View entering={FadeIn.springify()} style={s.infoModal}>
            <View style={s.infoModalHead}>
              <Ionicons name="volume-high" size={18} color="#b4c5ff" />
              <Text style={s.infoModalTitle}>About Sound Exposure</Text>
            </View>
            <Text style={s.infoModalBody}>
              Hearing exposure is measured in decibels (dB).{"\n\n"}
              <Text style={{ color: STATUS_COLORS.ok, fontWeight: "700" }}>OK</Text>
              {"  "}Below 70 dB — safe for extended periods.{"\n"}
              <Text style={{ color: STATUS_COLORS.caution, fontWeight: "700" }}>Caution</Text>
              {"  "}70–85 dB — limit to 2 hours/day.{"\n"}
              <Text style={{ color: STATUS_COLORS.unsafe, fontWeight: "700" }}>Unsafe</Text>
              {"  "}Above 85 dB — risk of hearing damage.{"\n\n"}
              Data is only recorded when a compatible device is connected.
            </Text>
            <Pressable style={s.infoClose} onPress={() => setShowInfoModal(false)}>
              <Text style={s.infoCloseText}>Got it</Text>
            </Pressable>
          </Animated.View>
        </Pressable>
      </Modal>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  topSafeArea: { height: 44 },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingBottom: 10,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1,
    borderColor: CARD_BORDER,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    textAlign: "center",
    letterSpacing: -0.3,
  },
  headerRight: { flexDirection: "row", gap: 6 },

  // Date row
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingBottom: 14,
    gap: 10,
  },
  dateArrow: { width: 36, height: 36, justifyContent: "center", alignItems: "center" },
  dateArrowDim: { opacity: 0.3 },
  datePill: {
    flex: 1,
    maxWidth: 210,
    backgroundColor: "rgba(255,255,255,0.09)",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    paddingVertical: 10,
    alignItems: "center",
  },
  datePillText: { fontSize: 15, fontWeight: "600", color: TEXT_PRIMARY },

  // Scroll
  scroll: { paddingHorizontal: 16, paddingTop: 2 },

  // Card
  card: {
    backgroundColor: CARD_BG,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    padding: 18,
    marginBottom: 14,
    position: "relative",
    overflow: "hidden",
  },
  infoBtn: { position: "absolute", top: 14, right: 14, zIndex: 1 },

  // Utility layouts
  centredRow: { flexDirection: "row", alignItems: "center", paddingVertical: 14 },
  centredCol: { alignItems: "center", gap: 6, paddingVertical: 14 },
  mutedText: { fontSize: 13, color: TEXT_SECONDARY },

  // Retry
  retryBtn: {
    marginTop: 6,
    backgroundColor: "rgba(255,180,171,0.12)",
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "rgba(255,180,171,0.3)",
  },
  retryText: { fontSize: 13, fontWeight: "600", color: "#ffb4ab" },

  // Exposure value
  valueRow: { flexDirection: "row", alignItems: "flex-end", marginTop: 4, paddingRight: 30 },
  dashText: { fontSize: 36, fontWeight: "700", color: TEXT_SECONDARY, letterSpacing: 3 },
  valueText: { fontSize: 48, fontWeight: "700", color: TEXT_PRIMARY, letterSpacing: -1, lineHeight: 56 },
  unitText: { fontSize: 18, fontWeight: "400", color: TEXT_SECONDARY, marginBottom: 8, marginLeft: 2 },

  // Status
  statusRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusLabel: { fontSize: 13, fontWeight: "600" },
  noDeviceText: { fontSize: 12, color: TEXT_SECONDARY, lineHeight: 18, marginTop: 14 },

  // 7-day card header
  cardHeaderRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  cardTitle: { fontSize: 16, fontWeight: "700", color: TEXT_PRIMARY },

  // Legend
  legendRow: { flexDirection: "row", justifyContent: "flex-end", gap: 12, marginBottom: 2 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  legendDot: { width: 7, height: 7, borderRadius: 3.5 },
  legendLabel: { fontSize: 10.5, fontWeight: "600" },

  // Track noise card
  trackCard: {
    backgroundColor: CARD_BG,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    padding: 18,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  trackTextCol: { flex: 1, marginRight: 12 },
  trackTitle: { fontSize: 15, fontWeight: "700", color: TEXT_PRIMARY, marginBottom: 5 },
  trackSub: { fontSize: 12, color: TEXT_SECONDARY, lineHeight: 17 },
  learnBtn: { flexDirection: "row", alignItems: "center", gap: 3, marginTop: 10 },
  learnText: { fontSize: 12, fontWeight: "600", color: "#b4c5ff" },
  watchWrap: {
    width: 68,
    height: 68,
    borderRadius: 14,
    backgroundColor: "rgba(180,197,255,0.08)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(180,197,255,0.15)",
  },

  // Modal
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  infoModal: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#0d1c29",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    padding: 22,
  },
  infoModalHead: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 14 },
  infoModalTitle: { fontSize: 16, fontWeight: "700", color: TEXT_PRIMARY },
  infoModalBody: { fontSize: 13, color: TEXT_SECONDARY, lineHeight: 20, marginBottom: 18 },
  infoClose: {
    backgroundColor: "rgba(180,197,255,0.12)",
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(180,197,255,0.2)",
  },
  infoCloseText: { fontSize: 14, fontWeight: "700", color: "#b4c5ff" },
});
