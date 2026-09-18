import AsyncStorage from "@react-native-async-storage/async-storage";

export interface SavedAddress {
  id: string;
  label: "Home" | "Office" | "Other" | string;
  addressText: string;
  flatNo?: string;
  landmark?: string;
  lat?: number;
  lng?: number;
  isDefault?: boolean;
}

const STORAGE_KEY = "urban_helpers_saved_addresses";

const DEFAULT_ADDRESSES: SavedAddress[] = [
  {
    id: "addr-home",
    label: "Home",
    addressText: "12, 1st Cross Street, Anna Nagar, Chennai",
    flatNo: "Flat 3B",
    landmark: "Near Tower Park",
    lat: 13.085,
    lng: 80.21,
    isDefault: true,
  },
  {
    id: "addr-office",
    label: "Office",
    addressText: "45, Rajiv Gandhi IT Expressway, OMR, Chennai",
    flatNo: "Tower 2, 4th Floor",
    landmark: "Opposite Tidel Park",
    lat: 12.986,
    lng: 80.243,
  },
];

export async function getSavedAddresses(): Promise<SavedAddress[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_ADDRESSES));
      return DEFAULT_ADDRESSES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_ADDRESSES;
  } catch (error) {
    console.warn("Failed to load saved addresses:", error);
    return DEFAULT_ADDRESSES;
  }
}

export async function saveAddress(address: SavedAddress): Promise<SavedAddress[]> {
  try {
    const current = await getSavedAddresses();
    const existingIdx = current.findIndex((a) => a.id === address.id);
    let updated: SavedAddress[];
    if (existingIdx >= 0) {
      updated = [...current];
      updated[existingIdx] = address;
    } else {
      updated = [address, ...current];
    }
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.warn("Failed to save address:", error);
    return [address];
  }
}

export async function deleteAddress(id: string): Promise<SavedAddress[]> {
  try {
    const current = await getSavedAddresses();
    const updated = current.filter((a) => a.id !== id);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.warn("Failed to delete address:", error);
    return [];
  }
}
