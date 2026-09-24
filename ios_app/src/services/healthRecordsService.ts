import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Alert, Platform } from "react-native";

export type DocumentCategory =
  | "Lab Report"
  | "Prescription"
  | "Doctor Advice"
  | "Blood Test"
  | "Vaccination"
  | "Scan & X-Ray"
  | "General";

export type DocumentType = "image" | "pdf" | "document";

export interface HealthDocument {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  category: DocumentCategory;
  type: DocumentType;
  uri: string;
  originalFileName?: string;
  fileSize?: string;
  notes?: string;
  createdAt: number;
}

const STORAGE_KEY = "@urban_health_documents_v2";

/**
 * Ensures permanent local file storage directory exists
 */
async function getPermanentDocDirectory(): Promise<string> {
  const dir = `${FileSystem.documentDirectory}health_records/`;
  const info = await FileSystem.getInfoAsync(dir);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  }
  return dir;
}

/**
 * Formats bytes to human-readable size
 */
export function formatBytes(bytes?: number): string {
  if (!bytes || bytes <= 0) return "Unknown size";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Get all saved health documents sorted with latest first
 */
export async function getHealthDocuments(): Promise<HealthDocument[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const list: HealthDocument[] = JSON.parse(raw);
    return list.sort((a, b) => b.createdAt - a.createdAt);
  } catch (error) {
    console.error("Failed to load health documents:", error);
    return [];
  }
}

/**
 * Saves a new health document, copying the source file to app storage for permanence
 */
export async function saveHealthDocument(
  input: Omit<HealthDocument, "id" | "createdAt">
): Promise<HealthDocument> {
  try {
    const id = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    let permanentUri = input.uri;

    try {
      if (input.uri && !input.uri.startsWith("data:")) {
        const dir = await getPermanentDocDirectory();
        const extension = input.uri.split(".").pop()?.split("?")[0] || (input.type === "image" ? "jpg" : "pdf");
        const destination = `${dir}${id}.${extension}`;
        
        await FileSystem.copyAsync({
          from: input.uri,
          to: destination,
        });
        permanentUri = destination;
      }
    } catch (fsErr) {
      console.warn("Could not copy file permanently, using source URI:", fsErr);
    }

    const newDoc: HealthDocument = {
      ...input,
      id,
      uri: permanentUri,
      createdAt: Date.now(),
    };

    const existing = await getHealthDocuments();
    const updated = [newDoc, ...existing];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    return newDoc;
  } catch (error) {
    console.error("Failed to save health document:", error);
    throw error;
  }
}

/**
 * Deletes a health document by ID and removes its file from storage
 */
export async function deleteHealthDocument(id: string): Promise<void> {
  try {
    const existing = await getHealthDocuments();
    const target = existing.find((d) => d.id === id);
    if (target && target.uri && target.uri.startsWith(FileSystem.documentDirectory || "")) {
      try {
        await FileSystem.deleteAsync(target.uri, { idempotent: true });
      } catch (e) {
        console.warn("Could not delete file from filesystem", e);
      }
    }

    const filtered = existing.filter((d) => d.id !== id);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error("Failed to delete health document:", error);
    throw error;
  }
}

/**
 * Downloads or shares the health document using system sharing
 */
export async function downloadOrShareDocument(doc: HealthDocument): Promise<void> {
  try {
    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      Alert.alert("Download/Share", "Sharing is not supported on this device/environment.");
      return;
    }

    // Check if file exists locally
    const fileInfo = await FileSystem.getInfoAsync(doc.uri);
    if (!fileInfo.exists) {
      Alert.alert("File Not Found", "The document file is no longer available locally.");
      return;
    }

    await Sharing.shareAsync(doc.uri, {
      mimeType: doc.type === "image" ? "image/jpeg" : doc.type === "pdf" ? "application/pdf" : "application/octet-stream",
      dialogTitle: `Download / Share ${doc.title}`,
      UTI: doc.type === "image" ? "public.jpeg" : doc.type === "pdf" ? "com.adobe.pdf" : "public.data",
    });
  } catch (error) {
    console.error("Failed to share document:", error);
    Alert.alert("Error", "Could not share or download this document.");
  }
}
