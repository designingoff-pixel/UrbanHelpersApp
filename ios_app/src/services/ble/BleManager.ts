import { NativeBle, RawServicesDiscoveredEvent } from "../../../modules/urban-ble";
import { BleScanner } from "./BleScanner";
import { BleConnectionManager } from "./BleConnectionManager";
import { BleServiceDiscovery } from "./BleServiceDiscovery";
import { BleCharacteristicManager } from "./BleCharacteristicManager";
import { WearableRepository } from "./WearableRepository";
import { BleDevice, ConnectionState, WearableHealthData, ConnectedDeviceInfo, BleLogEntry, BleServiceInfo } from "./types";

class BleManagerClass {
  private isInitialized: boolean = false;
  private servicesSub: any = null;
  private rssiSub: any = null;
  private packetSub: any = null;
  private connSub: any = null;

  public init(): void {
    if (this.isInitialized) return;
    this.isInitialized = true;

    // Listen for connection state changes
    this.connSub = BleConnectionManager.addListener((state, deviceId, deviceName) => {
      WearableRepository.setConnectionState(state, deviceId, deviceName);
      if (state === "disconnected") {
        BleCharacteristicManager.clearSubscriptions();
      }
    });

    // Listen for discovered services from Native module
    this.servicesSub = NativeBle.onServicesDiscovered((event: RawServicesDiscoveredEvent) => {
      const parsed = BleServiceDiscovery.parseServices(event.services || []);
      const { supported, unavailable } = BleServiceDiscovery.determineSupportedMetrics(parsed);

      WearableRepository.setServices(parsed, supported, unavailable);

      // Auto-subscribe to standard characteristics (Heart Rate, Battery, etc.)
      BleCharacteristicManager.subscribeToStandardCharacteristics(parsed);

      // Trigger RSSI read
      setTimeout(() => {
        NativeBle.readRssi();
      }, 800);
    });

    // Listen for incoming decoded packets
    this.packetSub = BleCharacteristicManager.onPacketReceived((packet, raw) => {
      WearableRepository.updateFromPacket(packet, raw.valueHex);
    });

    // Listen for RSSI reads
    this.rssiSub = NativeBle.onRssiRead((event) => {
      if (event.status === 0) {
        WearableRepository.updateRssi(event.rssi);
      }
    });
  }

  public isBluetoothEnabled(): boolean {
    return NativeBle.isBluetoothEnabled();
  }

  public requestEnableBluetooth(): boolean {
    return NativeBle.requestEnableBluetooth();
  }

  public checkPermissions(): boolean {
    return NativeBle.checkPermissions();
  }

  public async requestPermissions(): Promise<boolean> {
    return await NativeBle.requestPermissionsAsync();
  }

  public async startScan(durationMs?: number): Promise<boolean> {
    this.init();
    return await BleScanner.startScan(durationMs);
  }

  public stopScan(): void {
    BleScanner.stopScan();
  }

  public async connect(deviceAddress: string, deviceName?: string): Promise<boolean> {
    this.init();
    // Stop scanning before connecting for BLE radio stability
    BleScanner.stopScan();
    return await BleConnectionManager.connect(deviceAddress, deviceName);
  }

  public disconnect(): void {
    BleConnectionManager.disconnect();
  }

  public async syncNow(): Promise<void> {
    if (BleConnectionManager.getState() !== "connected") {
      return;
    }
    WearableRepository.addLog("info", "SYNC", "Manual sync triggered");
    NativeBle.readRssi();

    const services = WearableRepository.getServices();
    // Read battery if available
    const batt = services.find((s) => s.uuid.includes("180F"));
    if (batt) {
      const char = batt.characteristics.find((c) => c.uuid.includes("2A19"));
      if (char) {
        NativeBle.readCharacteristic(batt.uuid, char.uuid);
      }
    }
  }

  public async checkAutoConnect(): Promise<boolean> {
    this.init();
    const saved = await BleConnectionManager.getLastDevice();
    if (!saved || !saved.id) {
      return false;
    }

    if (!NativeBle.isBluetoothEnabled()) {
      return false;
    }

    if (BleConnectionManager.getState() === "connected") {
      return true;
    }

    WearableRepository.addLog("info", "AUTOCONNECT", `Attempting auto-reconnect to ${saved.name} (${saved.id})`);
    return await BleConnectionManager.connect(saved.id, saved.name, 10000);
  }

  // Repository delegates
  public getHealthData(): WearableHealthData {
    return WearableRepository.getHealthData();
  }

  public getConnectionState(): ConnectionState {
    return WearableRepository.getConnectionState();
  }

  public getDeviceInfo(): ConnectedDeviceInfo | null {
    return WearableRepository.getDeviceInfo();
  }

  public getServices(): BleServiceInfo[] {
    return WearableRepository.getServices();
  }

  public getLogs(): BleLogEntry[] {
    return WearableRepository.getLogs();
  }

  public subscribeRepository(listener: () => void): () => void {
    return WearableRepository.subscribe(listener);
  }

  public subscribeScanner(listener: (devices: BleDevice[], isScanning: boolean) => void): () => void {
    return BleScanner.addListener(listener);
  }
}

export const BleManager = new BleManagerClass();
