import { NativeBle, RawCharacteristicDataEvent } from "../../../modules/urban-ble";
import { CharacteristicDecoder, DecodedHealthPacket } from "./CharacteristicDecoder";
import { BleCharacteristicInfo, BleServiceInfo } from "./types";

type PacketListener = (packet: DecodedHealthPacket, raw: RawCharacteristicDataEvent) => void;

export class BleCharacteristicManagerClass {
  private subscribedChars: Set<string> = new Set();
  private packetListeners: Set<PacketListener> = new Set();
  private readSub: any = null;
  private notifySub: any = null;

  constructor() {
    this.setupListeners();
  }

  private setupListeners() {
    this.readSub = NativeBle.onCharacteristicRead((event: RawCharacteristicDataEvent) => {
      this.handleIncomingData(event, false);
    });

    this.notifySub = NativeBle.onCharacteristicChanged((event: RawCharacteristicDataEvent) => {
      this.handleIncomingData(event, true);
    });
  }

  private handleIncomingData(event: RawCharacteristicDataEvent, isNotification: boolean) {
    const charUuid = event.characteristicUuid.toUpperCase();
    const serviceUuid = event.serviceUuid.toUpperCase();
    const bytes = event.valueBytes || [];

    const decoded = CharacteristicDecoder.decode(serviceUuid, charUuid, bytes);

    this.packetListeners.forEach((listener) => {
      listener(decoded, event);
    });
  }

  public subscribeToStandardCharacteristics(services: BleServiceInfo[]): void {
    // 1. Subscribe to Heart Rate Measurement (0x2A37) if available
    const hrService = services.find(
      (s) => s.uuid.includes("180D") || s.characteristics.some((c) => c.uuid.includes("2A37"))
    );
    if (hrService) {
      const hrChar = hrService.characteristics.find((c) => c.uuid.includes("2A37"));
      if (hrChar && (hrChar.isNotifiable || hrChar.isIndicatable)) {
        this.subscribe(hrService.uuid, hrChar.uuid, hrChar.isIndicatable && !hrChar.isNotifiable);
      }
    }

    // 2. Read Battery Level (0x2A19) and subscribe if notifiable
    const battService = services.find(
      (s) => s.uuid.includes("180F") || s.characteristics.some((c) => c.uuid.includes("2A19"))
    );
    if (battService) {
      const battChar = battService.characteristics.find((c) => c.uuid.includes("2A19"));
      if (battChar) {
        if (battChar.isReadable) {
          NativeBle.readCharacteristic(battService.uuid, battChar.uuid);
        }
        if (battChar.isNotifiable || battChar.isIndicatable) {
          this.subscribe(battService.uuid, battChar.uuid, battChar.isIndicatable);
        }
      }
    }

    // 3. Read Device Information Service (0x180A) strings (Model, Manufacturer, Firmware)
    const infoService = services.find((s) => s.uuid.includes("180A"));
    if (infoService) {
      for (const char of infoService.characteristics) {
        if (char.isReadable) {
          setTimeout(() => {
            NativeBle.readCharacteristic(infoService.uuid, char.uuid);
          }, 300);
        }
      }
    }

    // 4. Subscribe to vendor notification endpoints for ColorFit / Goodix / Nordic UART if present
    for (const s of services) {
      if (s.uuid.includes("6E40") || s.uuid.includes("FEE7") || s.uuid.includes("FFF0")) {
        for (const c of s.characteristics) {
          if (c.isNotifiable || c.isIndicatable) {
            this.subscribe(s.uuid, c.uuid, c.isIndicatable && !c.isNotifiable);
          }
        }
      }
    }
  }

  public subscribe(serviceUuid: string, charUuid: string, useIndication: boolean = false): boolean {
    const key = `${serviceUuid}:${charUuid}`.toUpperCase();
    if (this.subscribedChars.has(key)) {
      return true;
    }
    const success = NativeBle.subscribeCharacteristic(serviceUuid, charUuid, useIndication);
    if (success) {
      this.subscribedChars.add(key);
    }
    return success;
  }

  public readCharacteristic(serviceUuid: string, charUuid: string): boolean {
    return NativeBle.readCharacteristic(serviceUuid, charUuid);
  }

  public onPacketReceived(listener: PacketListener): () => void {
    this.packetListeners.add(listener);
    return () => {
      this.packetListeners.delete(listener);
    };
  }

  public clearSubscriptions(): void {
    this.subscribedChars.clear();
  }
}

export const BleCharacteristicManager = new BleCharacteristicManagerClass();
