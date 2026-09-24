import {
  collection,
  onSnapshot,
  query,
  orderBy,
  where,
  getDocs,
  doc,
  getDoc,
  DocumentData,
} from "firebase/firestore";
import { db } from "./firebase";
import { Linking, Alert } from "react-native";
import * as WebBrowser from "expo-web-browser";

export type FitnessCategory =
  | "All"
  | "Workout"
  | "Yoga"
  | "Cardio"
  | "Strength"
  | "Pilates"
  | "Stretching"
  | "Meditation"
  | "Running"
  | "Nutrition"
  | "Other";

export interface FitnessVideo {
  id: string;
  title: string;
  youtubeUrl: string;
  youtubeId: string;
  thumbnailUrl: string;
  category: FitnessCategory;
  duration: string;
  difficulty: "All Levels" | "Beginner" | "Intermediate" | "Advanced";
  instructor: string;
  description?: string;
  isFeatured?: boolean;
  createdAt?: any;
  updatedAt?: any;
}

/**
 * Extracts YouTube Video ID from standard / short / embed / shorts URLs
 */
export function extractYouTubeId(url: string): string {
  if (!url) return "";
  const cleaned = url.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(cleaned)) {
    return cleaned;
  }
  const watchMatch = cleaned.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (watchMatch && watchMatch[1]) return watchMatch[1];

  const shortMatch = cleaned.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (shortMatch && shortMatch[1]) return shortMatch[1];

  const embedMatch = cleaned.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
  if (embedMatch && embedMatch[1]) return embedMatch[1];

  const shortsMatch = cleaned.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/);
  if (shortsMatch && shortsMatch[1]) return shortsMatch[1];

  const liveMatch = cleaned.match(/youtube\.com\/live\/([a-zA-Z0-9_-]{11})/);
  if (liveMatch && liveMatch[1]) return liveMatch[1];

  return "";
}

/**
 * Opens YouTube Video directly in the YouTube app if available,
 * or seamless in-app WebBrowser / browser fallback.
 */
export async function openYouTubeVideo(video: FitnessVideo | { youtubeId?: string; youtubeUrl?: string }) {
  const ytId = video.youtubeId || (video.youtubeUrl ? extractYouTubeId(video.youtubeUrl) : "");
  const targetUrl = video.youtubeUrl || (ytId ? `https://www.youtube.com/watch?v=${ytId}` : "");

  if (!targetUrl && !ytId) {
    Alert.alert("Video Error", "Could not find a valid YouTube link for this workout.");
    return;
  }

  // Try deep-linking to YouTube app first
  const nativeAppUrl = ytId ? `vnd.youtube:${ytId}` : targetUrl;
  
  try {
    const supported = await Linking.canOpenURL(nativeAppUrl);
    if (supported) {
      await Linking.openURL(nativeAppUrl);
      return;
    }
  } catch (err) {
    // ignore and fallback
  }

  // Fallback to web URL or Expo WebBrowser
  try {
    const canOpenWeb = await Linking.canOpenURL(targetUrl);
    if (canOpenWeb) {
      await Linking.openURL(targetUrl);
    } else {
      await WebBrowser.openBrowserAsync(targetUrl);
    }
  } catch (e: any) {
    console.error("Error opening YouTube video:", e);
    try {
      await WebBrowser.openBrowserAsync(targetUrl);
    } catch {
      Alert.alert("Unable to Play", "Please check your internet connection.");
    }
  }
}

/**
 * Real-time listener for all active Fitness Videos from Firestore
 */
export function subscribeToFitnessVideos(
  callback: (videos: FitnessVideo[]) => void,
  category?: FitnessCategory
): () => void {
  const colRef = collection(db, "fitness_videos");
  
  // Try ordered query
  const q = query(colRef, orderBy("createdAt", "desc"));

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const list: FitnessVideo[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const ytId = data.youtubeId || extractYouTubeId(data.youtubeUrl || "");
        list.push({
          id: docSnap.id,
          title: data.title || "Workout Video",
          youtubeUrl: data.youtubeUrl || (ytId ? `https://www.youtube.com/watch?v=${ytId}` : ""),
          youtubeId: ytId,
          thumbnailUrl:
            data.thumbnailUrl || (ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : ""),
          category: data.category || "Workout",
          duration: data.duration || "15 mins",
          difficulty: data.difficulty || "All Levels",
          instructor: data.instructor || "Urban Health",
          description: data.description || "",
          isFeatured: data.isFeatured || false,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        });
      });

      if (category && category !== "All") {
        callback(list.filter((v) => v.category.toLowerCase() === category.toLowerCase()));
      } else {
        callback(list);
      }
    },
    (error) => {
      console.warn("Firestore ordered subscription warning, falling back to unordered:", error);
      const fallbackUnsub = onSnapshot(colRef, (snap) => {
        const list: FitnessVideo[] = [];
        snap.forEach((docSnap) => {
          const data = docSnap.data();
          const ytId = data.youtubeId || extractYouTubeId(data.youtubeUrl || "");
          list.push({
            id: docSnap.id,
            title: data.title || "Workout Video",
            youtubeUrl: data.youtubeUrl || (ytId ? `https://www.youtube.com/watch?v=${ytId}` : ""),
            youtubeId: ytId,
            thumbnailUrl:
              data.thumbnailUrl || (ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : ""),
            category: data.category || "Workout",
            duration: data.duration || "15 mins",
            difficulty: data.difficulty || "All Levels",
            instructor: data.instructor || "Urban Health",
            description: data.description || "",
            isFeatured: data.isFeatured || false,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          });
        });
        if (category && category !== "All") {
          callback(list.filter((v) => v.category.toLowerCase() === category.toLowerCase()));
        } else {
          callback(list);
        }
      });
      return fallbackUnsub;
    }
  );

  return unsubscribe;
}
