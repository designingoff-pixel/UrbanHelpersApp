import { db } from "./firebase";
import {
  collection,
  onSnapshot,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type ShopCategory = "All" | "Health" | "Fitness" | "Wellness" | "Tools" | "More";

export interface ShopProduct {
  id: string;
  name: string;
  subtitle: string;
  category: ShopCategory;
  price: number;
  pointsPrice: number;
  rating: number;
  reviewsCount: number;
  badge?: string;
  badgeColor?: string;
  btnColor?: string;
  hasBluetooth?: boolean;
  imageUrl?: string;
  bgGradient?: [string, string];
  inStock?: boolean;
  isPopular?: boolean;
  createdAt?: any;
}

export interface CartItem {
  product: ShopProduct;
  quantity: number;
}

export const DEFAULT_SHOP_PRODUCTS: ShopProduct[] = [
  {
    id: "prod-scale-1",
    name: "Smart Body Composition Scale",
    subtitle: "Auto-syncs Weight, BMI, Body Fat & Skeletal Muscle",
    category: "Health",
    price: 2999,
    pointsPrice: 2800,
    rating: 4.7,
    reviewsCount: 184,
    badge: "SYNC COMPATIBLE",
    badgeColor: "#0f5132",
    btnColor: "#0f5132",
    hasBluetooth: true,
    imageUrl: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&q=80",
    bgGradient: ["#ebf7ee", "#d8f3e0"],
    inStock: true,
  },
  {
    id: "prod-bp-2",
    name: "Wireless Bluetooth BP Monitor",
    subtitle: "One-tap sync to Vitals Dashboard & Health log",
    category: "Health",
    price: 3499,
    pointsPrice: 3200,
    rating: 4.9,
    reviewsCount: 147,
    badge: "CLINICAL GRADE",
    badgeColor: "#be123c",
    btnColor: "#be185d",
    hasBluetooth: false,
    imageUrl: "https://images.unsplash.com/photo-1628771065518-0d82f1938462?w=600&q=80",
    bgGradient: ["#fdf2f8", "#fce7f3"],
    inStock: true,
  },
  {
    id: "prod-detox-3",
    name: "Herbal Detox & Cleanse Pack",
    subtitle: "14-Day digestive cleanse & antioxidant immunity blend",
    category: "Wellness",
    price: 1299,
    pointsPrice: 1200,
    rating: 4.6,
    reviewsCount: 95,
    badge: "HERBAL",
    badgeColor: "#15803d",
    btnColor: "#0f5132",
    hasBluetooth: false,
    imageUrl: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600&q=80",
    bgGradient: ["#f0fdf4", "#dcfce7"],
    inStock: true,
  },
  {
    id: "prod-brush-4",
    name: "Sonic Smart Electric Toothbrush",
    subtitle: "40,000 VPM acoustic cleaning & 2-min reminder timer",
    category: "Tools",
    price: 1899,
    pointsPrice: 1750,
    rating: 4.8,
    reviewsCount: 310,
    badge: "POPULAR",
    badgeColor: "#0284c7",
    btnColor: "#1d4ed8",
    hasBluetooth: false,
    imageUrl: "https://images.unsplash.com/photo-1559591937-e1032c5453e0?w=600&q=80",
    bgGradient: ["#f0f9ff", "#e0f2fe"],
    inStock: true,
  },
  {
    id: "prod-mat-5",
    name: "Orthopedic Yoga & Pilates Mat",
    subtitle: "High-density 8mm cushioning with alignment guide",
    category: "Fitness",
    price: 1499,
    pointsPrice: 1400,
    rating: 4.9,
    reviewsCount: 420,
    badge: "PRO FITNESS",
    badgeColor: "#854d0e",
    btnColor: "#5c2c16",
    hasBluetooth: false,
    imageUrl: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600&q=80",
    bgGradient: ["#fff7ed", "#ffedd5"],
    inStock: true,
  },
  {
    id: "prod-db-6",
    name: "Adjustable Quick-Select Dumbbells",
    subtitle: "2.5kg to 24kg dial mechanism for home workouts",
    category: "Fitness",
    price: 7999,
    pointsPrice: 7500,
    rating: 4.9,
    reviewsCount: 168,
    badge: "POPULAR",
    badgeColor: "#6b21a8",
    btnColor: "#4c1d95",
    hasBluetooth: false,
    imageUrl: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=600&q=80",
    bgGradient: ["#faf5ff", "#f3e8ff"],
    inStock: true,
  },
];

const SHOP_CACHE_KEY = "@urban_shop_cached_products_v2";
const CART_CACHE_KEY = "@urban_shop_user_cart_v2";

/**
 * Subscribe to Firestore "shop_products" in real-time.
 * If Firestore returns data, calls callback with parsed products.
 * If empty or error, falls back to local cache or DEFAULT_SHOP_PRODUCTS.
 */
export function subscribeToShopProducts(
  onProductsUpdate: (products: ShopProduct[]) => void
): () => void {
  try {
    const productsColl = collection(db, "shop_products");

    const unsubscribe = onSnapshot(
      productsColl,
      async (snapshot) => {
        if (!snapshot.empty) {
          const list: ShopProduct[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            list.push({
              id: docSnap.id,
              name: data.name || "Product",
              subtitle: data.subtitle || "",
              category: (data.category as ShopCategory) || "Health",
              price: Number(data.price) || 999,
              pointsPrice: Number(data.pointsPrice) || 800,
              rating: Number(data.rating) || 4.8,
              reviewsCount: Number(data.reviewsCount) || 50,
              badge: data.badge || undefined,
              badgeColor: data.badgeColor || undefined,
              btnColor: data.btnColor || undefined,
              hasBluetooth: Boolean(data.hasBluetooth),
              imageUrl: data.imageUrl || undefined,
              bgGradient: data.bgGradient || ["#f8fafc", "#f1f5f9"],
              inStock: data.inStock !== false,
              isPopular: Boolean(data.isPopular),
              createdAt: data.createdAt,
            });
          });

          // Save cache
          await AsyncStorage.setItem(SHOP_CACHE_KEY, JSON.stringify(list));
          onProductsUpdate(list);
        } else {
          // Firestore collection is currently empty: load default products
          loadCachedOrDefaultProducts().then(onProductsUpdate);
        }
      },
      (error) => {
        console.warn("Firestore shop_products subscription warning:", error.message);
        loadCachedOrDefaultProducts().then(onProductsUpdate);
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn("Error setting up shop products listener:", err);
    loadCachedOrDefaultProducts().then(onProductsUpdate);
    return () => {};
  }
}

/**
 * Get products from local cache or default list
 */
export async function loadCachedOrDefaultProducts(): Promise<ShopProduct[]> {
  try {
    const cached = await AsyncStorage.getItem(SHOP_CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn("Failed reading shop cache", e);
  }
  return DEFAULT_SHOP_PRODUCTS;
}

/**
 * Add a new product into Firestore "shop_products" (Accessible by Admin in Web or App)
 */
export async function addProductToFirestore(
  product: Omit<ShopProduct, "id">
): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, "shop_products"), {
      ...product,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (err: any) {
    console.warn("Failed adding product to Firestore:", err);
    // Fallback: save to local cache
    const current = await loadCachedOrDefaultProducts();
    const newId = `local-${Date.now()}`;
    const newProd: ShopProduct = { ...product, id: newId };
    const updated = [newProd, ...current];
    await AsyncStorage.setItem(SHOP_CACHE_KEY, JSON.stringify(updated));
    return newId;
  }
}

/**
 * Seed initial products to Firestore if collection is empty
 */
export async function seedDefaultProductsIfEmpty(): Promise<void> {
  try {
    const snapshot = await getDocs(collection(db, "shop_products"));
    if (snapshot.empty) {
      for (const item of DEFAULT_SHOP_PRODUCTS) {
        const { id, ...data } = item;
        await addDoc(collection(db, "shop_products"), {
          ...data,
          createdAt: serverTimestamp(),
        });
      }
    }
  } catch (err) {
    console.warn("Seed check error:", err);
  }
}

/**
 * Cart Management Helpers
 */
export async function getSavedCart(): Promise<CartItem[]> {
  try {
    const data = await AsyncStorage.getItem(CART_CACHE_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.warn("Error reading cart", e);
  }
  return [];
}

export async function saveUserCart(cart: CartItem[]): Promise<void> {
  try {
    await AsyncStorage.setItem(CART_CACHE_KEY, JSON.stringify(cart));
  } catch (e) {
    console.warn("Error saving cart", e);
  }
}
