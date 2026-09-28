import { EventEmitter, NativeModulesProxy, requireNativeModule } from "expo-modules-core";

let UrbanBleNativeModule: any = null;
try {
  UrbanBleNativeModule = requireNativeModule("UrbanBle");
} catch {
  UrbanBleNativeModule = (NativeModulesProxy as any)?.UrbanBle || null;
}

const emitter = UrbanBleNativeModule ? new EventEmitter(UrbanBleNativeModule) : null;

export interface RawBleScanResult {
  id: string; // MAC address
  name: string;
  rssi: number;
  serviceUuids: string[];
  timestamp: number;
}

export interface RawConnectionStateEvent {
  deviceId: string;
  deviceName: string;
  state: "connecting" | "connected" | "disconnecting" | "disconnected";
  status: number;
  timestamp: number;
}

export interface RawDiscoveredCharacteristic {
  uuid: string;
  properties: number;
  permissions: number;
  propertyFlags: string[];
}

export interface RawDiscoveredService {
  uuid: string;
  isPrimary: boolean;
  characteristics: RawDiscoveredCharacteristic[];
}

export interface RawServicesDiscoveredEvent {
  deviceId: string;
  services: RawDiscoveredService[];
  timestamp: number;
}

export interface RawCharacteristicDataEvent {
  serviceUuid: string;
  characteristicUuid: string;
  valueHex: string;
  valueBytes: number[];
  status?: number;
  timestamp: number;
}

export const NativeBle = {
  isAvailable(): boolean {
    return UrbanBleNativeModule != null;
  },

  isBluetoothEnabled(): boolean {
    try {
      return UrbanBleNativeModule ? UrbanBleNativeModule.isBluetoothEnabled() : false;
    } catch {
      return false;
    }
  },

  requestEnableBluetooth(): boolean {
    try {
      return UrbanBleNativeModule ? UrbanBleNativeModule.requestEnableBluetooth() : false;
    } catch {
      return false;
    }
  },

  checkPermissions(): boolean {
    try {
      return UrbanBleNativeModule ? UrbanBleNativeModule.checkPermissions() : false;
    } catch {
      return false;
    }
  },

  async requestPermissionsAsync(): Promise<boolean> {
    try {
      if (!UrbanBleNativeModule) return false;
      const res = await UrbanBleNativeModule.requestPermissionsAsync();
      return typeof res === "boolean" ? res : res?.granted ?? false;
    } catch {
      return false;
    }
  },

  startScan(): boolean {
    try {
      return UrbanBleNativeModule ? UrbanBleNativeModule.startScan() : false;
    } catch {
      return false;
    }
  },

  stopScan(): void {
    try {
      UrbanBleNativeModule?.stopScan();
    } catch {}
  },

  connect(deviceAddress: string): boolean {
    try {
      return UrbanBleNativeModule ? UrbanBleNativeModule.connect(deviceAddress) : false;
    } catch {
      return false;
    }
  },

  disconnect(): void {
    try {
      UrbanBleNativeModule?.disconnect();
    } catch {}
  },

  discoverServices(): boolean {
    try {
      return UrbanBleNativeModule ? UrbanBleNativeModule.discoverServices() : false;
    } catch {
      return false;
    }
  },

  readRssi(): boolean {
    try {
      return UrbanBleNativeModule ? UrbanBleNativeModule.readRssi() : false;
    } catch {
      return false;
    }
  },

  readCharacteristic(serviceUuid: string, charUuid: string): boolean {
    try {
      return UrbanBleNativeModule ? UrbanBleNativeModule.readCharacteristic(serviceUuid, charUuid) : false;
    } catch {
      return false;
    }
  },

  subscribeCharacteristic(serviceUuid: string, charUuid: string, useIndication: boolean = false): boolean {
    try {
      return UrbanBleNativeModule ? UrbanBleNativeModule.subscribeCharacteristic(serviceUuid, charUuid, useIndication) : false;
    } catch {
      return false;
    }
  },

  unsubscribeCharacteristic(serviceUuid: string, charUuid: string): boolean {
    try {
      return UrbanBleNativeModule ? UrbanBleNativeModule.unsubscribeCharacteristic(serviceUuid, charUuid) : false;
    } catch {
      return false;
    }
  },

  writeCharacteristic(serviceUuid: string, charUuid: string, hexData: string, withResponse: boolean = false): boolean {
    try {
      return UrbanBleNativeModule ? UrbanBleNativeModule.writeCharacteristic(serviceUuid, charUuid, hexData, withResponse) : false;
    } catch {
      return false;
    }
  },

  onScanResult(callback: (event: RawBleScanResult) => void) {
    return emitter?.addListener("onScanResult", callback);
  },

  onScanFailed(callback: (event: { errorCode: number; message: string }) => void) {
    return emitter?.addListener("onScanFailed", callback);
  },

  onConnectionStateChange(callback: (event: RawConnectionStateEvent) => void) {
    return emitter?.addListener("onConnectionStateChange", callback);
  },

  onServicesDiscovered(callback: (event: RawServicesDiscoveredEvent) => void) {
    return emitter?.addListener("onServicesDiscovered", callback);
  },

  onCharacteristicRead(callback: (event: RawCharacteristicDataEvent) => void) {
    return emitter?.addListener("onCharacteristicRead", callback);
  },

  onCharacteristicChanged(callback: (event: RawCharacteristicDataEvent) => void) {
    return emitter?.addListener("onCharacteristicChanged", callback);
  },

  onRssiRead(callback: (event: { deviceId: string; rssi: number; status: number }) => void) {
    return emitter?.addListener("onRssiRead", callback);
  },
};
