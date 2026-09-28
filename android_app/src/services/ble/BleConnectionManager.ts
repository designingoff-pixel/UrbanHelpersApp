import AsyncStorage from "@react-native-async-storage/async-storage";
import { NativeBle, RawConnectionStateEvent } from "../../../modules/urban-ble";
import { ConnectionState } from "./types";

const LAST_DEVICE_STORAGE_KEY = "@urban_helpers_ble_last_device";

export interface SavedDeviceInfo {
  id: string;
  name: string;
  connectedAt: number;
}

type ConnectionStateListener = (state: ConnectionState, deviceId: string, deviceName: string) => void;

export class BleConnectionManagerClass {
  private currentState: ConnectionState = "disconnected";
  private currentDeviceId: string = "";
  private currentDeviceName: string = "";
  private connectTimeoutTimer: any = null;
  private listeners: Set<ConnectionStateListener> = new Set();
  private stateChangeSub: any = null;

  constructor() {
    this.setupListeners();
  }

  private setupListeners() {
    this.stateChangeSub = NativeBle.onConnectionStateChange((event: RawConnectionStateEvent) => {
      this.handleStateChange(event);
    });
  }

  private handleStateChange(event: RawConnectionStateEvent) {
    if (this.connectTimeoutTimer && (event.state === "connected" || event.state === "disconnected")) {
      clearTimeout(this.connectTimeoutTimer);
      this.connectTimeoutTimer = null;
    }

    this.currentState = event.state as ConnectionState;
    this.currentDeviceId = event.deviceId || this.currentDeviceId;
    if (event.deviceName) {
      this.currentDeviceName = event.deviceName;
    }

    if (this.currentState === "connected") {
      this.saveLastDevice({
        id: this.currentDeviceId,
        name: this.currentDeviceName,
        connectedAt: Date.now(),
      });
    }

    this.notifyListeners();
  }

  public async connect(deviceAddress: string, deviceName: string = "ColorFit Pulse", timeoutMs: number = 15000): Promise<boolean> {
    if (this.currentState === "connected" && this.currentDeviceId === deviceAddress) {
      return true;
    }

    const enabled = NativeBle.isBluetoothEnabled();
    if (!enabled) {
      console.warn("[BleConnectionManager] Bluetooth is disabled");
      return false;
    }

    this.currentState = "connecting";
    this.currentDeviceId = deviceAddress;
    this.currentDeviceName = deviceName;
    this.notifyListeners();

    if (this.connectTimeoutTimer) {
      clearTimeout(this.connectTimeoutTimer);
    }

    this.connectTimeoutTimer = setTimeout(() => {
      if (this.currentState === "connecting") {
        console.warn("[BleConnectionManager] Connection timed out after " + timeoutMs + "ms");
        this.disconnect();
      }
    }, timeoutMs);

    const started = NativeBle.connect(deviceAddress);
    if (!started) {
      this.currentState = "disconnected";
      this.notifyListeners();
      if (this.connectTimeoutTimer) {
        clearTimeout(this.connectTimeoutTimer);
        this.connectTimeoutTimer = null;
      }
      return false;
    }

    return true;
  }

  public disconnect(): void {
    if (this.connectTimeoutTimer) {
      clearTimeout(this.connectTimeoutTimer);
      this.connectTimeoutTimer = null;
    }
    this.currentState = "disconnecting";
    this.notifyListeners();
    NativeBle.disconnect();
  }

  public async saveLastDevice(info: SavedDeviceInfo): Promise<void> {
    try {
      await AsyncStorage.setItem(LAST_DEVICE_STORAGE_KEY, JSON.stringify(info));
    } catch (e) {
      console.warn("[BleConnectionManager] Failed to save last device:", e);
    }
  }

  public async getLastDevice(): Promise<SavedDeviceInfo | null> {
    try {
      const data = await AsyncStorage.getItem(LAST_DEVICE_STORAGE_KEY);
      if (!data) return null;
      return JSON.parse(data) as SavedDeviceInfo;
    } catch {
      return null;
    }
  }

  public async clearLastDevice(): Promise<void> {
    try {
      await AsyncStorage.removeItem(LAST_DEVICE_STORAGE_KEY);
    } catch {}
  }

  public getState(): ConnectionState {
    return this.currentState;
  }

  public getConnectedDeviceId(): string {
    return this.currentDeviceId;
  }

  public getConnectedDeviceName(): string {
    return this.currentDeviceName;
  }

  public addListener(listener: ConnectionStateListener): () => void {
    this.listeners.add(listener);
    listener(this.currentState, this.currentDeviceId, this.currentDeviceName);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach((fn) => fn(this.currentState, this.currentDeviceId, this.currentDeviceName));
  }
}

export const BleConnectionManager = new BleConnectionManagerClass();
