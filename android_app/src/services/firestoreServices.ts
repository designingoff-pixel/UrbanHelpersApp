// ─────────────────────────────────────────────────────────────────────────────
// firestoreServices.ts
// Real-time hook that fetches service categories from Firestore.
// Features instant local persistence + memory caching + image prefetching
// to completely eliminate default image flashing on app launch.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import { Image } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "./firebase";
import { SERVICE_CATEGORIES, ServiceCategory } from "@/screens/services/servicesData";

const COLLECTION = "serviceCategories";
const CACHE_KEY = "@uh_service_categories_cache_v2";

// In-memory module-level cache for instant synchronous state on re-renders
let inMemoryCategoriesCache: ServiceCategory[] | null = null;

// Preload cache asynchronously at module load
AsyncStorage.getItem(CACHE_KEY).then((raw) => {
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        inMemoryCategoriesCache = parsed;
        prefetchCategoryImages(parsed);
      }
    } catch (_) {}
  }
}).catch(() => {});

function prefetchCategoryImages(cats: ServiceCategory[]) {
  cats.forEach((cat) => {
    if (cat.imageUrl && typeof cat.imageUrl === "string" && cat.imageUrl.startsWith("http")) {
      Image.prefetch(cat.imageUrl).catch(() => {});
    }
    if (Array.isArray(cat.subServices)) {
      cat.subServices.forEach((sub) => {
        if (sub.imageUrl && typeof sub.imageUrl === "string" && sub.imageUrl.startsWith("http")) {
          Image.prefetch(sub.imageUrl).catch(() => {});
        }
      });
    }
  });
}

/**
 * Returns live service categories from Firestore.
 * Initializes immediately with cached admin-uploaded data/images (no flash).
 */
export function useServiceCategories(): {
  categories: ServiceCategory[];
  loading: boolean;
} {
  const [categories, setCategories] = useState<ServiceCategory[]>(
    inMemoryCategoriesCache ?? SERVICE_CATEGORIES
  );
  const [loading, setLoading] = useState(!inMemoryCategoriesCache);

  useEffect(() => {
    // If not in memory yet, check AsyncStorage on mount
    if (!inMemoryCategoriesCache) {
      AsyncStorage.getItem(CACHE_KEY).then((raw) => {
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > 0) {
              inMemoryCategoriesCache = parsed;
              setCategories(parsed);
              prefetchCategoryImages(parsed);
            }
          } catch (_) {}
        }
      }).catch(() => {});
    }

    const q = query(collection(db, COLLECTION), orderBy("order", "asc"));

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) {
          // Firestore not seeded yet — use local static data
          if (!inMemoryCategoriesCache) {
            setCategories(SERVICE_CATEGORIES);
          }
        } else {
          const fetched: ServiceCategory[] = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: data.id ?? doc.id,
              name: data.name,
              icon: data.icon,
              gradient: data.gradient as [string, string],
              accent: data.accent,
              tagline: data.tagline,
              imageUrl: data.imageUrl,
              subServices: (data.subServices ?? []).map((s: any) => ({
                id: s.id,
                name: s.name,
                price: s.price,
                duration: s.duration,
                description: s.description,
                popular: s.popular ?? false,
                imageUrl: s.imageUrl,
              })),
            } as ServiceCategory;
          });

          inMemoryCategoriesCache = fetched;
          setCategories(fetched);
          AsyncStorage.setItem(CACHE_KEY, JSON.stringify(fetched)).catch(() => {});
          prefetchCategoryImages(fetched);
        }
        setLoading(false);
      },
      (error) => {
        console.warn("[firestoreServices] onSnapshot error, using cached data:", error.message);
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  return { categories, loading };
}
