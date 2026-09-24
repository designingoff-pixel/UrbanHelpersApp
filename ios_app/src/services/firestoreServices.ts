// ─────────────────────────────────────────────────────────────────────────────
// firestoreServices.ts
// Real-time hook that fetches service categories from Firestore.
// Falls back to static SERVICE_CATEGORIES (from servicesData.ts) when offline
// or when the Firestore collection has not been seeded yet.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "./firebase";
import { SERVICE_CATEGORIES, ServiceCategory } from "@/screens/services/servicesData";

const COLLECTION = "serviceCategories";

/**
 * Returns live service categories from Firestore.
 * Falls back to static data if the collection is empty or unreachable.
 */
export function useServiceCategories(): {
  categories: ServiceCategory[];
  loading: boolean;
} {
  const [categories, setCategories] = useState<ServiceCategory[]>(SERVICE_CATEGORIES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, COLLECTION), orderBy("order", "asc"));

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) {
          // Firestore not seeded yet — use local static data
          setCategories(SERVICE_CATEGORIES);
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
          setCategories(fetched);
        }
        setLoading(false);
      },
      (error) => {
        // Network / permission error → fall back to static data silently
        console.warn("[firestoreServices] onSnapshot error, using static data:", error.message);
        setCategories(SERVICE_CATEGORIES);
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  return { categories, loading };
}
