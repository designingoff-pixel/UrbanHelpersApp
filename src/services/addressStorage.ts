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

const STORAGE_KEY = "urban_helpers_saved_addresses_v2";

export async function getSavedAddresses(): Promise<SavedAddress[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn("Failed to load saved addresses:", error);
    return [];
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
