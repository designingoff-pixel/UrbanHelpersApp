import { RawDiscoveredService } from "../../../modules/urban-ble";
import { BleCharacteristicInfo, BleServiceInfo } from "./types";
import { STANDARD_SERVICES, STANDARD_CHARACTERISTICS } from "./CharacteristicDecoder";

export class BleServiceDiscoveryClass {
  public parseServices(rawServices: RawDiscoveredService[]): BleServiceInfo[] {
    return rawServices.map((raw) => {
      const cleanUuid = raw.uuid.toUpperCase();
      const stdName = STANDARD_SERVICES[cleanUuid];
      const isStandard = !!stdName;
      const serviceName = stdName || `Vendor Service (${cleanUuid.slice(0, 8)}...)`;

      const characteristics: BleCharacteristicInfo[] = (raw.characteristics || []).map((ch) => {
        const charUuid = ch.uuid.toUpperCase();
        const stdChar = STANDARD_CHARACTERISTICS[charUuid];
        const isStdChar = !!stdChar;
        const charName = stdChar || `Vendor Char (${charUuid.slice(0, 8)}...)`;

        const propertyFlags = ch.propertyFlags || [];
        const isReadable = propertyFlags.includes("READ") || (ch.properties & 0x02) !== 0;
        const isWritable =
          propertyFlags.includes("WRITE") ||
          propertyFlags.includes("WRITE_NO_RESPONSE") ||
          (ch.properties & 0x08) !== 0 ||
          (ch.properties & 0x04) !== 0;
        const isNotifiable = propertyFlags.includes("NOTIFY") || (ch.properties & 0x10) !== 0;
        const isIndicatable = propertyFlags.includes("INDICATE") || (ch.properties & 0x20) !== 0;

        return {
          uuid: charUuid,
          name: charName,
          isStandard: isStdChar,
          properties: ch.properties,
          propertyFlags,
          isReadable,
          isWritable,
          isNotifiable,
          isIndicatable,
        };
      });

      return {
        uuid: cleanUuid,
        name: serviceName,
        isStandard,
        isPrimary: raw.isPrimary,
        characteristics,
      };
    });
  }

  /**
   * Determine which health metrics are actually supported by the discovered services/characteristics.
   */
  public determineSupportedMetrics(services: BleServiceInfo[]): {
    supported: string[];
    unavailable: string[];
    hasVendorHealthStream: boolean;
  } {
    const supported: string[] = [];
    const unavailable: string[] = [];
    let hasVendorHealthStream = false;

    // Check Heart Rate Service (0x180D) and characteristic (0x2A37)
    const hrChar = this.findCharacteristic(services, "00002A37-0000-1000-8000-00805F9B34FB");
    if (hrChar && (hrChar.isNotifiable || hrChar.isReadable)) {
      supported.push("Heart Rate");
    } else {
      unavailable.push("Heart Rate");
    }

    // Check Battery Service (0x180F) and characteristic (0x2A19)
    const battChar = this.findCharacteristic(services, "00002A19-0000-1000-8000-00805F9B34FB");
    if (battChar && battChar.isReadable) {
      supported.push("Battery Level");
    } else {
      unavailable.push("Battery Level");
    }

    // Check standard steps / RSC / Cycling or vendor services
    const rscChar = this.findCharacteristic(services, "00002A53-0000-1000-8000-00805F9B34FB"); // RSC Measurement
    if (rscChar) {
      supported.push("Steps & Cadence");
    }

    // Check for vendor sports / health service (Noise ColorFit often uses 0000FEE7 or 6E400001 or 0000FFF0)
    for (const s of services) {
      const u = s.uuid;
      if (u.includes("FEE7") || u.includes("6E40") || u.includes("FFF0") || u.includes("FEA0")) {
        hasVendorHealthStream = true;
        break;
      }
    }

    // Unless a confirmed real data stream is decoded, mark SpO2, Sleep, Distance, Calories as not available
    const standardMetrics = ["SpO2 (Blood Oxygen)", "Sleep Analysis", "Distance", "Calories"];
    for (const m of standardMetrics) {
      if (!supported.includes(m)) {
        unavailable.push(m);
      }
    }

    return {
      supported,
      unavailable,
      hasVendorHealthStream,
    };
  }

  public findCharacteristic(services: BleServiceInfo[], uuid: string): BleCharacteristicInfo | null {
    const target = uuid.toUpperCase();
    for (const s of services) {
      for (const c of s.characteristics) {
        if (c.uuid === target) {
          return c;
        }
      }
    }
    return null;
  }
}

export const BleServiceDiscovery = new BleServiceDiscoveryClass();
