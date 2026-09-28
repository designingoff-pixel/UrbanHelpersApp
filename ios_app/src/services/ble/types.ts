/**
 * Ble Types for Urban Helpers Wearable Integration
 */

export type ConnectionState = "disconnected" | "connecting" | "connected" | "disconnecting";

export type MetricAvailability = "SUPPORTED" | "NOT_SUPPORTED" | "UNKNOWN" | "ERROR";

export interface HealthMetricValue<T> {
  value: T | null;
  unit: string;
  timestamp: number;
  availability: MetricAvailability;
  source: string;
}

export interface WearableHealthData {
  steps: HealthMetricValue<number>;
  heartRate: HealthMetricValue<number>;
  spo2: HealthMetricValue<number>;
  calories: HealthMetricValue<number>;
  distance: HealthMetricValue<number>;
  sleep: HealthMetricValue<{ totalMinutes: number; deepMinutes: number; lightMinutes: number }>;
  batteryLevel: HealthMetricValue<number>;
  timestamp: number;
  sourceDevice: string;
}

export interface BleDevice {
  id: string; // MAC address / UUID
  name: string;
  rssi: number;
  serviceUuids: string[];
  isTargetDevice: boolean; // true if ColorFit Pulse or Noise watch
  lastSeen: number;
}

export interface BleCharacteristicInfo {
  uuid: string;
  name: string;
  isStandard: boolean;
  properties: number;
  propertyFlags: string[];
  isReadable: boolean;
  isWritable: boolean;
  isNotifiable: boolean;
  isIndicatable: boolean;
  lastValueHex?: string;
  lastValueBytes?: number[];
  lastUpdated?: number;
}

export interface BleServiceInfo {
  uuid: string;
  name: string;
  isStandard: boolean;
  isPrimary: boolean;
  characteristics: BleCharacteristicInfo[];
}

export interface BleLogEntry {
  id: string;
  timestamp: number;
  level: "info" | "warn" | "error" | "packet";
  tag: string;
  message: string;
  dataHex?: string;
}

export interface ConnectedDeviceInfo {
  id: string;
  name: string;
  connectedAt: number;
  lastSyncedAt: number;
  batteryPercent: number | null;
  rssi: number | null;
  supportedMetrics: string[];
  unavailableMetrics: string[];
}
