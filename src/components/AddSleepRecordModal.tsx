import React, { useState, useEffect, useRef } from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  Dimensions,
  PanResponder,
} from "react-native";
import Svg, { Circle, Path, G, Text as SvgText, Line } from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";

interface AddSleepRecordModalProps {
  visible: boolean;
  initialBedtimeHour?: number;
  initialBedtimeMinute?: number;
  initialWakeHour?: number;
  initialWakeMinute?: number;
  onSave: (bedH: number, bedM: number, wakeH: number, wakeM: number) => void;
  onCancel: () => void;
}

const { width: SW, height: SH } = Dimensions.get("window");
const CARD_WIDTH = Math.min(SW - 24, 380);
const CLOCK_SIZE = CARD_WIDTH * 0.88;
const CLOCK_R = CLOCK_SIZE / 2;
const TRACK_R = CLOCK_R * 0.72;
const INNER_DIAL_R = TRACK_R - 22;
const HANDLE_R = 18;

function timeToAngle(hour: number, minute: number): number {
  const totalMins = (hour * 60 + minute) % (24 * 60);
  return (totalMins / (24 * 60)) * 2 * Math.PI - Math.PI / 2;
}

function angleToTime(angle: number): { hour: number; minute: number } {
  let a = ((angle + Math.PI / 2) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
  // Snap to 5-minute intervals for smooth and natural precision
  const totalMins = Math.round((a / (2 * Math.PI)) * 1440 / 5) * 5;
  const clamped = totalMins % 1440;
  return { hour: Math.floor(clamped / 60), minute: clamped % 60 };
}

function angleToPoint(angle: number, radius = TRACK_R): { x: number; y: number } {
  return {
    x: CLOCK_R + radius * Math.cos(angle),
    y: CLOCK_R + radius * Math.sin(angle),
  };
}

function arcPath(startAngle: number, endAngle: number, radius = TRACK_R): string {
  let sweep = endAngle - startAngle;
  if (sweep <= 0) sweep += 2 * Math.PI;
  const s = angleToPoint(startAngle, radius);
  const e = angleToPoint(endAngle, radius);
  const largeArc = sweep > Math.PI ? 1 : 0;
  return `M ${s.x} ${s.y} A ${radius} ${radius} 0 ${largeArc} 1 ${e.x} ${e.y}`;
}

function calcSleepDuration(btH: number, btM: number, wkH: number, wkM: number): { hours: number; minutes: number; totalMins: number } {
  const bt = btH * 60 + btM;
  const wk = wkH * 60 + wkM;
  const totalMins = wk >= bt ? wk - bt : 1440 - bt + wk;
  return {
    hours: Math.floor(totalMins / 60),
    minutes: totalMins % 60,
    totalMins,
  };
}

function format12h(hour: number, minute: number): { time: string; ampm: string } {
  const ampm = hour >= 12 ? "pm" : "am";
  const h = hour % 12 || 12;
  const m = String(minute).padStart(2, "0");
  return { time: `${h}:${m}`, ampm };
}

export default function AddSleepRecordModal({
  visible,
  initialBedtimeHour = 23,
  initialBedtimeMinute = 0,
  initialWakeHour = 7,
  initialWakeMinute = 0,
  onSave,
  onCancel,
}: AddSleepRecordModalProps) {
  const [bedH, setBedH] = useState(initialBedtimeHour);
  const [bedM, setBedM] = useState(initialBedtimeMinute);
  const [wakeH, setWakeH] = useState(initialWakeHour);
  const [wakeM, setWakeM] = useState(initialWakeMinute);

  const clockLayout = useRef({ pageX: 0, pageY: 0 }).current;
  const clockContainerRef = useRef<View>(null);

  useEffect(() => {
    if (visible) {
      setBedH(initialBedtimeHour);
      setBedM(initialBedtimeMinute);
      setWakeH(initialWakeHour);
      setWakeM(initialWakeMinute);
    }
  }, [visible, initialBedtimeHour, initialBedtimeMinute, initialWakeHour, initialWakeMinute]);

  const updateClockLayout = () => {
    clockContainerRef.current?.measure((_x, _y, _w, _h, pageX, pageY) => {
      clockLayout.pageX = pageX;
      clockLayout.pageY = pageY;
    });
  };

  const handleTouch = (pageX: number, pageY: number, which: "bed" | "wake") => {
    const cx = pageX - (clockLayout.pageX + CLOCK_R);
    const cy = pageY - (clockLayout.pageY + CLOCK_R);
    const angle = Math.atan2(cy, cx);
    const { hour, minute } = angleToTime(angle);
    if (which === "bed") {
      setBedH(hour);
      setBedM(minute);
    } else {
      setWakeH(hour);
      setWakeM(minute);
    }
  };

  const bedPan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        handleTouch(evt.nativeEvent.pageX, evt.nativeEvent.pageY, "bed");
      },
      onPanResponderMove: (evt) => {
        handleTouch(evt.nativeEvent.pageX, evt.nativeEvent.pageY, "bed");
      },
    })
  ).current;

  const wakePan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        handleTouch(evt.nativeEvent.pageX, evt.nativeEvent.pageY, "wake");
      },
      onPanResponderMove: (evt) => {
        handleTouch(evt.nativeEvent.pageX, evt.nativeEvent.pageY, "wake");
      },
    })
  ).current;

  const bedAngle = timeToAngle(bedH, bedM);
  const wakeAngle = timeToAngle(wakeH, wakeM);
  const bedPt = angleToPoint(bedAngle, TRACK_R);
  const wakePt = angleToPoint(wakeAngle, TRACK_R);

  const duration = calcSleepDuration(bedH, bedM, wakeH, wakeM);
  const bedFmt = format12h(bedH, bedM);
  const wakeFmt = format12h(wakeH, wakeM);

  const hoursText =
    duration.hours > 0 && duration.minutes > 0
      ? `${duration.hours} hours ${duration.minutes} min`
      : duration.hours > 0
      ? `${duration.hours} hours`
      : `${duration.minutes} min`;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onCancel}
    >
      <View style={s.modalOverlay}>
        <View style={s.cardContainer}>
          {/* Top "Today" Pill */}
          <View style={s.todayPill}>
            <Text style={s.todayPillText}>Today</Text>
          </View>

          {/* SVG 24-Hour Circular Dial */}
          <View
            ref={clockContainerRef}
            onLayout={updateClockLayout}
            style={s.clockWrap}
          >
            <Svg width={CLOCK_SIZE} height={CLOCK_SIZE}>
              {/* Outer dial dark circle */}
              <Circle
                cx={CLOCK_R}
                cy={CLOCK_R}
                r={CLOCK_R - 4}
                fill="#2c2c34"
              />

              {/* Inner dial darker center */}
              <Circle
                cx={CLOCK_R}
                cy={CLOCK_R}
                r={INNER_DIAL_R}
                fill="#16161c"
              />

              {/* Subtle ticks on inner dial rim */}
              {Array.from({ length: 96 }).map((_, i) => {
                const angle = (i / 96) * 2 * Math.PI - Math.PI / 2;
                const isMajor = i % 4 === 0;
                const r1 = INNER_DIAL_R - 2;
                const r2 = INNER_DIAL_R - (isMajor ? 10 : 5);
                const x1 = CLOCK_R + r1 * Math.cos(angle);
                const y1 = CLOCK_R + r1 * Math.sin(angle);
                const x2 = CLOCK_R + r2 * Math.cos(angle);
                const y2 = CLOCK_R + r2 * Math.sin(angle);
                return (
                  <Line
                    key={`tick-${i}`}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={isMajor ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.1)"}
                    strokeWidth={isMajor ? 1.5 : 1}
                  />
                );
              })}

              {/* 24-Hour major numerals: 0, 6, 12, 18 */}
              {[
                { label: "0", angle: -Math.PI / 2, yOffset: 16 },
                { label: "6", angle: 0, xOffset: -16 },
                { label: "12", angle: Math.PI / 2, yOffset: -10 },
                { label: "18", angle: Math.PI, xOffset: 16 },
              ].map((item) => {
                const r = INNER_DIAL_R - 20;
                const lx = CLOCK_R + r * Math.cos(item.angle) + (item.xOffset || 0);
                const ly = CLOCK_R + r * Math.sin(item.angle) + (item.yOffset || 0);
                return (
                  <SvgText
                    key={item.label}
                    x={lx}
                    y={ly + 4}
                    textAnchor="middle"
                    fontSize={13}
                    fill="rgba(255,255,255,0.65)"
                    fontWeight="600"
                  >
                    {item.label}
                  </SvgText>
                );
              })}

              {/* Sleep period purple arc */}
              <Path
                d={arcPath(bedAngle, wakeAngle, TRACK_R)}
                stroke="#7c3aed"
                strokeWidth={28}
                fill="none"
                strokeLinecap="round"
              />

              {/* Dotted inner line through the purple arc */}
              <Path
                d={arcPath(bedAngle, wakeAngle, TRACK_R)}
                stroke="rgba(255,255,255,0.85)"
                strokeWidth={2.5}
                fill="none"
                strokeDasharray="3, 5"
                strokeLinecap="round"
              />

              {/* Centre text display */}
              {/* Bedtime */}
              <G>
                <SvgText
                  x={CLOCK_R - 75}
                  y={CLOCK_R - 16}
                  fontSize={20}
                  fill="rgba(255,255,255,0.8)"
                >
                  🛏
                </SvgText>
                <SvgText
                  x={CLOCK_R - 45}
                  y={CLOCK_R - 16}
                  fontSize={28}
                  fill="#ffffff"
                  fontWeight="700"
                >
                  {bedFmt.time}
                </SvgText>
                <SvgText
                  x={CLOCK_R + 50}
                  y={CLOCK_R - 16}
                  fontSize={16}
                  fill="rgba(255,255,255,0.65)"
                  fontWeight="500"
                >
                  {bedFmt.ampm}
                </SvgText>
              </G>

              {/* Wake-up time */}
              <G>
                <SvgText
                  x={CLOCK_R - 75}
                  y={CLOCK_R + 26}
                  fontSize={20}
                  fill="rgba(255,255,255,0.8)"
                >
                  ⏰
                </SvgText>
                <SvgText
                  x={CLOCK_R - 45}
                  y={CLOCK_R + 26}
                  fontSize={28}
                  fill="#ffffff"
                  fontWeight="700"
                >
                  {wakeFmt.time}
                </SvgText>
                <SvgText
                  x={CLOCK_R + 50}
                  y={CLOCK_R + 26}
                  fontSize={16}
                  fill="rgba(255,255,255,0.65)"
                  fontWeight="500"
                >
                  {wakeFmt.ampm}
                </SvgText>
              </G>

              {/* Bedtime Draggable Handle */}
              <G {...bedPan.panHandlers}>
                {/* Generous touch target */}
                <Circle
                  cx={bedPt.x}
                  cy={bedPt.y}
                  r={HANDLE_R + 10}
                  fill="transparent"
                />
                <Circle
                  cx={bedPt.x}
                  cy={bedPt.y}
                  r={HANDLE_R}
                  fill="#1a1a24"
                  stroke="#7c3aed"
                  strokeWidth={2.5}
                />
                <SvgText
                  x={bedPt.x}
                  y={bedPt.y + 5}
                  textAnchor="middle"
                  fontSize={13}
                  fill="#ffffff"
                >
                  🛏
                </SvgText>
              </G>

              {/* Wake-up Draggable Handle */}
              <G {...wakePan.panHandlers}>
                {/* Generous touch target */}
                <Circle
                  cx={wakePt.x}
                  cy={wakePt.y}
                  r={HANDLE_R + 10}
                  fill="transparent"
                />
                <Circle
                  cx={wakePt.x}
                  cy={wakePt.y}
                  r={HANDLE_R}
                  fill="#7c3aed"
                  stroke="#a78bfa"
                  strokeWidth={2.5}
                />
                <SvgText
                  x={wakePt.x}
                  y={wakePt.y + 5}
                  textAnchor="middle"
                  fontSize={13}
                  fill="#ffffff"
                >
                  ⏰
                </SvgText>
              </G>
            </Svg>
          </View>

          {/* Sleep duration summary */}
          <Text style={s.durationText}>Sleep time: {hoursText}</Text>

          {/* Cancel / Save pill action container */}
          <View style={s.bottomBtnPill}>
            <Pressable style={s.actionBtn} onPress={onCancel}>
              <Text style={s.cancelText}>Cancel</Text>
            </Pressable>
            <View style={s.btnDivider} />
            <Pressable
              style={s.actionBtn}
              onPress={() => onSave(bedH, bedM, wakeH, wakeM)}
            >
              <Text style={s.saveText}>Save</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  cardContainer: {
    width: "100%",
    maxWidth: CARD_WIDTH,
    backgroundColor: "#16161c",
    borderRadius: 36,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
    elevation: 24,
  },
  todayPill: {
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    paddingVertical: 8,
    paddingHorizontal: 32,
    borderRadius: 24,
    marginBottom: 20,
  },
  todayPillText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  clockWrap: {
    width: CLOCK_SIZE,
    height: CLOCK_SIZE,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  durationText: {
    color: "#818cf8",
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 26,
    textAlign: "center",
  },
  bottomBtnPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 28,
    width: "92%",
    height: 54,
    overflow: "hidden",
  },
  actionBtn: {
    flex: 1,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  cancelText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 16,
    fontWeight: "600",
  },
  saveText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  btnDivider: {
    width: 1,
    height: 24,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
  },
});
