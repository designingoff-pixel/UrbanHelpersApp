import { NativeBle, RawBleScanResult } from "../../../modules/urban-ble";
import { BleDevice } from "./types";

type ScanListener = (devices: BleDevice[], isScanning: boolean) => void;

class BleScannerClass {
  private devicesMap: Map<string, BleDevice> = new Map();
  private isScanning: boolean = false;
  private scanTimer: any = null;
  private listeners: Set<ScanListener> = new Set();
  private scanSubscription: any = null;
  private scanFailedSubscription: any = null;

  constructor() {
    this.setupListeners();
  }

  private setupListeners() {
    this.scanSubscription = NativeBle.onScanResult((result: RawBleScanResult) => {
      this.handleScanResult(result);
    });

    this.scanFailedSubscription = NativeBle.onScanFailed((err) => {
      console.warn("[BleScanner] Scan failed:", err);
      this.stopScan();
    });
  }

  private isTarget(name: string): boolean {
    if (!name) return false;
    const lower = name.toLowerCase();
    return (
      lower.includes("colorfit") ||
      lower.includes("pulse") ||
      lower.includes("noise")
    );
  }

  private handleScanResult(result: RawBleScanResult) {
    const rawName = (result.name || "").trim();
    // Ignore unnamed beacons unless they have known services
    const displayName = rawName || `Device ${result.id.slice(-5)}`;
    const isTargetDevice = this.isTarget(rawName);

    const device: BleDevice = {
      id: result.id,
      name: displayName,
      rssi: result.rssi,
      serviceUuids: result.serviceUuids || [],
      isTargetDevice,
      lastSeen: Date.now(),
    };

    this.devicesMap.set(result.id, device);
    this.notifyListeners();
  }

  public async startScan(durationMs: number = 15000): Promise<boolean> {
    if (this.isScanning) {
      return true;
    }

    const enabled = NativeBle.isBluetoothEnabled();
    if (!enabled) {
      console.warn("[BleScanner] Bluetooth is disabled");
      return false;
    }

    const hasPerm = NativeBle.checkPermissions();
    if (!hasPerm) {
      const granted = await NativeBle.requestPermissionsAsync();
      if (!granted) {
        console.warn("[BleScanner] Permissions not granted");
        return false;
      }
    }

    this.devicesMap.clear();
    this.isScanning = true;
    this.notifyListeners();

    const started = NativeBle.startScan();
    if (!started) {
      this.isScanning = false;
      this.notifyListeners();
      return false;
    }

    if (this.scanTimer) {
      clearTimeout(this.scanTimer);
    }

    this.scanTimer = setTimeout(() => {
      this.stopScan();
    }, durationMs);

    return true;
  }

  public stopScan(): void {
    if (this.scanTimer) {
      clearTimeout(this.scanTimer);
      this.scanTimer = null;
    }

    if (this.isScanning) {
      NativeBle.stopScan();
      this.isScanning = false;
      this.notifyListeners();
    }
  }

  public getDiscoveredDevices(): BleDevice[] {
    const devices = Array.from(this.devicesMap.values());
    // Prioritize target devices, then sort by signal strength
    return devices.sort((a, b) => {
      if (a.isTargetDevice && !b.isTargetDevice) return -1;
      if (!a.isTargetDevice && b.isTargetDevice) return 1;
      return b.rssi - a.rssi;
    });
  }

  public getIsScanning(): boolean {
    return this.isScanning;
  }

  public addListener(listener: ScanListener): () => void {
    this.listeners.add(listener);
    listener(this.getDiscoveredDevices(), this.isScanning);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    const list = this.getDiscoveredDevices();
    this.listeners.forEach((fn) => fn(list, this.isScanning));
  }

  public clear(): void {
    this.devicesMap.clear();
    this.notifyListeners();
  }
}

export const BleScanner = new BleScannerClass();
