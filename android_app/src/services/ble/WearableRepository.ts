import {
  BleCharacteristicInfo,
  BleLogEntry,
  BleServiceInfo,
  ConnectedDeviceInfo,
  ConnectionState,
  HealthMetricValue,
  WearableHealthData,
} from "./types";
import { DecodedHealthPacket } from "./CharacteristicDecoder";

type RepositoryListener = () => void;

function createInitialMetric<T>(unit: string): HealthMetricValue<T> {
  return {
    value: null,
    unit,
    timestamp: 0,
    availability: "UNKNOWN",
    source: "",
  };
}

export class WearableRepositoryClass {
  private listeners: Set<RepositoryListener> = new Set();
  private connectionState: ConnectionState = "disconnected";
  private deviceInfo: ConnectedDeviceInfo | null = null;
  private services: BleServiceInfo[] = [];
  private logs: BleLogEntry[] = [];
  private maxLogs: number = 100;

  private healthData: WearableHealthData = {
    steps: createInitialMetric<number>("steps"),
    heartRate: createInitialMetric<number>("bpm"),
    spo2: createInitialMetric<number>("%"),
    calories: createInitialMetric<number>("kcal"),
    distance: createInitialMetric<number>("km"),
    sleep: createInitialMetric<{ totalMinutes: number; deepMinutes: number; lightMinutes: number }>("min"),
    batteryLevel: createInitialMetric<number>("%"),
    timestamp: Date.now(),
    sourceDevice: "",
  };

  public getHealthData(): WearableHealthData {
    return { ...this.healthData };
  }

  public getConnectionState(): ConnectionState {
    return this.connectionState;
  }

  public getDeviceInfo(): ConnectedDeviceInfo | null {
    return this.deviceInfo ? { ...this.deviceInfo } : null;
  }

  public getServices(): BleServiceInfo[] {
    return [...this.services];
  }

  public getLogs(): BleLogEntry[] {
    return [...this.logs];
  }

  public setConnectionState(state: ConnectionState, deviceId?: string, deviceName?: string): void {
    this.connectionState = state;
    if (state === "connected" && deviceId) {
      if (!this.deviceInfo || this.deviceInfo.id !== deviceId) {
        this.deviceInfo = {
          id: deviceId,
          name: deviceName || "ColorFit Pulse",
          connectedAt: Date.now(),
          lastSyncedAt: Date.now(),
          batteryPercent: null,
          rssi: null,
          supportedMetrics: [],
          unavailableMetrics: [],
        };
      }
      this.healthData.sourceDevice = this.deviceInfo.name;
      this.addLog("info", "CONNECTION", `Connected to ${this.deviceInfo.name} (${deviceId})`);
    } else if (state === "disconnected") {
      this.addLog("warn", "CONNECTION", "Device disconnected");
      // When disconnected, mark active streaming metrics back to UNKNOWN or maintain last known if requested
      if (this.deviceInfo) {
        this.deviceInfo.lastSyncedAt = Date.now();
      }
    }
    this.notify();
  }

  public setServices(services: BleServiceInfo[], supported: string[], unavailable: string[]): void {
    this.services = services;
    if (this.deviceInfo) {
      this.deviceInfo.supportedMetrics = supported;
      this.deviceInfo.unavailableMetrics = unavailable;
    }

    // Set availability states explicitly based on GATT discovery
    const devName = this.deviceInfo?.name || "Smartwatch";

    // Heart rate
    if (!supported.includes("Heart Rate")) {
      this.healthData.heartRate = {
        value: null,
        unit: "bpm",
        timestamp: Date.now(),
        availability: "NOT_SUPPORTED",
        source: devName,
      };
    }

    // Battery
    if (!supported.includes("Battery Level")) {
      this.healthData.batteryLevel = {
        value: null,
        unit: "%",
        timestamp: Date.now(),
        availability: "NOT_SUPPORTED",
        source: devName,
      };
    }

    // SpO2
    if (!supported.includes("SpO2 (Blood Oxygen)")) {
      this.healthData.spo2 = {
        value: null,
        unit: "%",
        timestamp: Date.now(),
        availability: "NOT_SUPPORTED",
        source: devName,
      };
    }

    // Sleep
    if (!supported.includes("Sleep Analysis")) {
      this.healthData.sleep = {
        value: null,
        unit: "min",
        timestamp: Date.now(),
        availability: "NOT_SUPPORTED",
        source: devName,
      };
    }

    // Calories & Distance
    if (unavailable.includes("Calories")) {
      this.healthData.calories.availability = "NOT_SUPPORTED";
    }
    if (unavailable.includes("Distance")) {
      this.healthData.distance.availability = "NOT_SUPPORTED";
    }

    this.addLog("info", "DISCOVERY", `Discovered ${services.length} GATT services. Supported: [${supported.join(", ")}]. Unavailable: [${unavailable.join(", ")}]`);
    this.notify();
  }

  public updateRssi(rssi: number): void {
    if (this.deviceInfo) {
      this.deviceInfo.rssi = rssi;
      this.notify();
    }
  }

  public updateFromPacket(packet: DecodedHealthPacket, rawHex?: string): void {
    const devName = this.deviceInfo?.name || "ColorFit Pulse";
    const now = Date.now();

    if (this.deviceInfo) {
      this.deviceInfo.lastSyncedAt = now;
    }

    if (packet.metric === "heart_rate" && packet.data?.heartRate != null) {
      const hr = packet.data.heartRate;
      this.healthData.heartRate = {
        value: hr,
        unit: "bpm",
        timestamp: now,
        availability: "SUPPORTED",
        source: devName,
      };
      this.addLog("packet", "HEART_RATE", `Heart Rate: ${hr} bpm`, rawHex);
    } else if (packet.metric === "battery" && packet.data?.batteryLevel != null) {
      const batt = packet.data.batteryLevel;
      this.healthData.batteryLevel = {
        value: batt,
        unit: "%",
        timestamp: now,
        availability: "SUPPORTED",
        source: devName,
      };
      if (this.deviceInfo) {
        this.deviceInfo.batteryPercent = batt;
      }
      this.addLog("packet", "BATTERY", `Battery: ${batt}%`, rawHex);
    } else if (packet.metric === "steps" && packet.data?.steps != null) {
      this.healthData.steps = {
        value: packet.data.steps,
        unit: "steps",
        timestamp: now,
        availability: "SUPPORTED",
        source: devName,
      };
      this.addLog("packet", "STEPS", `Steps: ${packet.data.steps}`, rawHex);
    } else if (packet.metric === "spo2" && packet.data?.spo2 != null) {
      this.healthData.spo2 = {
        value: packet.data.spo2,
        unit: "%",
        timestamp: now,
        availability: "SUPPORTED",
        source: devName,
      };
      this.addLog("packet", "SPO2", `SpO2: ${packet.data.spo2}%`, rawHex);
    } else if (packet.metric === "vendor_stream") {
      this.addLog("packet", "VENDOR_STREAM", `Vendor health stream payload: ${packet.message}`, rawHex);
    } else {
      this.addLog("packet", "RAW_GATT", `${packet.message || "Unknown packet"}`, rawHex);
    }

    this.healthData.timestamp = now;
    this.notify();
  }

  public addLog(level: "info" | "warn" | "error" | "packet", tag: string, message: string, dataHex?: string): void {
    const entry: BleLogEntry = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      timestamp: Date.now(),
      level,
      tag,
      message,
      dataHex,
    };
    this.logs.unshift(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.pop();
    }
    this.notify();
  }

  public clearLogs(): void {
    this.logs = [];
    this.notify();
  }

  public subscribe(listener: RepositoryListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    this.listeners.forEach((fn) => fn());
  }
}

export const WearableRepository = new WearableRepositoryClass();
