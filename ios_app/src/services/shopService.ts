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
  where,
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

export interface ShopOrder {
  id: string;
  orderNumber?: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  shippingAddress?: {
    street: string;
    city: string;
    pincode: string;
  };
  items: {
    productId: string;
    name: string;
    category?: string;
    imageUrl?: string;
    quantity: number;
    price: number;
  }[];
  totalCash: number;
  totalPoints: number;
  paymentMethod: "cash" | "points" | "upi" | "card";
  paymentStatus?: "paid" | "cod" | "pending";
  status: "processing" | "shipped" | "delivered" | "cancelled";
  pointsEarned?: number;
  createdAt?: any;
}

// ─────────────────────────────────────────────────────────────────────────────
// Client Notes (Page 5) Catalog
// ─────────────────────────────────────────────────────────────────────────────
export const DEFAULT_SHOP_PRODUCTS: ShopProduct[] = [
  {
    id: "prod-watch-1",
    name: "Urban Smart Watch",
    subtitle: "Real-time ECG, SpO2, Heart Rate & Sleep Tracker",
    category: "Health",
    price: 4999,
    pointsPrice: 4500,
    rating: 4.9,
    reviewsCount: 312,
    badge: "BESTSELLER",
    badgeColor: "#4f46e5",
    btnColor: "#4338ca",
    hasBluetooth: true,
    imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80",
    bgGradient: ["#eef2ff", "#e0e7ff"],
    inStock: true,
    isPopular: true,
  },
  {
    id: "prod-cgm-2",
    name: "Continuous Glucose Monitor (CGM)",
    subtitle: "24/7 painless glucose monitoring with live mobile sync",
    category: "Health",
    price: 3999,
    pointsPrice: 3800,
    rating: 4.95,
    reviewsCount: 198,
    badge: "CLINICAL",
    badgeColor: "#059669",
    btnColor: "#047857",
    hasBluetooth: true,
    imageUrl: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&q=80",
    bgGradient: ["#ecfdf5", "#d1fae5"],
    inStock: true,
    isPopular: true,
  },
  {
    id: "prod-scale-3",
    name: "Smart Weighing Scale",
    subtitle: "Measures 14 body metrics: BMI, Body Fat, Muscle Mass",
    category: "Health",
    price: 2499,
    pointsPrice: 2200,
    rating: 4.8,
    reviewsCount: 260,
    badge: "SYNC READY",
    badgeColor: "#0284c7",
    btnColor: "#0369a1",
    hasBluetooth: true,
    imageUrl: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&q=80",
    bgGradient: ["#f0f9ff", "#e0f2fe"],
    inStock: true,
  },
  {
    id: "prod-bp-4",
    name: "Wireless Blood Pressure Monitor",
    subtitle: "Upper-arm automatic cuff with Bluetooth sync to health app",
    category: "Health",
    price: 2899,
    pointsPrice: 2600,
    rating: 4.85,
    reviewsCount: 174,
    badge: "ACCURATE",
    badgeColor: "#dc2626",
    btnColor: "#b91c1c",
    hasBluetooth: true,
    imageUrl: "https://images.unsplash.com/photo-1628771065518-0d82f1938462?w=600&q=80",
    bgGradient: ["#fef2f2", "#fee2e2"],
    inStock: true,
  },
  {
    id: "prod-oximeter-5",
    name: "Pulse Oximeter",
    subtitle: "Fast 5-second fingertip blood oxygen & pulse reading",
    category: "Health",
    price: 999,
    pointsPrice: 900,
    rating: 4.7,
    reviewsCount: 410,
    badge: "ESSENTIAL",
    badgeColor: "#ea580c",
    btnColor: "#c2410c",
    hasBluetooth: false,
    imageUrl: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=600&q=80",
    bgGradient: ["#fff7ed", "#ffedd5"],
    inStock: true,
  },
  {
    id: "prod-air-6",
    name: "Air Quality Monitor",
    subtitle: "Live detection of PM2.5, AQI, Temperature & Humidity",
    category: "Tools",
    price: 3499,
    pointsPrice: 3200,
    rating: 4.75,
    reviewsCount: 88,
    badge: "SMART HOME",
    badgeColor: "#0891b2",
    btnColor: "#0e7490",
    hasBluetooth: true,
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
    bgGradient: ["#ecfeff", "#cffafe"],
    inStock: true,
  },
  {
    id: "prod-humidifier-7",
    name: "Smart Humidifier & Diffuser",
    subtitle: "Ultrasonic cool mist with aroma oil diffuser & timer",
    category: "Wellness",
    price: 1999,
    pointsPrice: 1800,
    rating: 4.8,
    reviewsCount: 142,
    badge: "WELLNESS",
    badgeColor: "#7c3aed",
    btnColor: "#6d28d9",
    hasBluetooth: false,
    imageUrl: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600&q=80",
    bgGradient: ["#f5f3ff", "#ede9fe"],
    inStock: true,
  },
  {
    id: "prod-massager-8",
    name: "Deep Tissue Body Massager",
    subtitle: "High-torque muscle relief gun with 6 interchangeable heads",
    category: "Fitness",
    price: 3499,
    pointsPrice: 3100,
    rating: 4.9,
    reviewsCount: 215,
    badge: "RECOVERY",
    badgeColor: "#db2777",
    btnColor: "#be185d",
    hasBluetooth: false,
    imageUrl: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&q=80",
    bgGradient: ["#fdf2f8", "#fce7f3"],
    inStock: true,
  },
  {
    id: "prod-eyemask-9",
    name: "Sleep Eye Mask with Bluetooth Audio",
    subtitle: "100% blackout contoured 3D eye mask with HD stereo sound",
    category: "Wellness",
    price: 1299,
    pointsPrice: 1150,
    rating: 4.85,
    reviewsCount: 304,
    badge: "DEEP SLEEP",
    badgeColor: "#4338ca",
    btnColor: "#3730a3",
    hasBluetooth: true,
    imageUrl: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600&q=80",
    bgGradient: ["#eef2ff", "#e0e7ff"],
    inStock: true,
  },
  {
    id: "prod-safety-10",
    name: "Personal Safety Alarm & Gadget",
    subtitle: "130dB siren alarm with LED strobe & emergency keychain",
    category: "Tools",
    price: 799,
    pointsPrice: 700,
    rating: 4.9,
    reviewsCount: 160,
    badge: "SAFETY",
    badgeColor: "#e11d48",
    btnColor: "#be123c",
    hasBluetooth: false,
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
    bgGradient: ["#fff1f2", "#ffe4e6"],
    inStock: true,
  },
  {
    id: "prod-tag-11",
    name: "Location GPS Tag",
    subtitle: "Anti-lost tracker tag for elders, kids, bags & pets",
    category: "Tools",
    price: 1499,
    pointsPrice: 1350,
    rating: 4.8,
    reviewsCount: 220,
    badge: "GPS LIVE",
    badgeColor: "#059669",
    btnColor: "#047857",
    hasBluetooth: true,
    imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80",
    bgGradient: ["#ecfdf5", "#d1fae5"],
    inStock: true,
  },
  {
    id: "prod-cleaning-12",
    name: "Eco-Friendly Cleaning Agents Kit",
    subtitle: "Non-toxic, plant-based disinfectant sprays & concentrates",
    category: "Tools",
    price: 899,
    pointsPrice: 800,
    rating: 4.75,
    reviewsCount: 95,
    badge: "ORGANIC",
    badgeColor: "#15803d",
    btnColor: "#166534",
    hasBluetooth: false,
    imageUrl: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=600&q=80",
    bgGradient: ["#f0fdf4", "#dcfce7"],
    inStock: true,
  },
  {
    id: "prod-plants-13",
    name: "Medicinal Plants Herbal Garden",
    subtitle: "Set of 5 live plants: Tulsi, Aloe Vera, Mint, Neem, Lemongrass",
    category: "Wellness",
    price: 999,
    pointsPrice: 900,
    rating: 4.9,
    reviewsCount: 180,
    badge: "HERBAL",
    badgeColor: "#166534",
    btnColor: "#14532d",
    hasBluetooth: false,
    imageUrl: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600&q=80",
    bgGradient: ["#f0fdf4", "#dcfce7"],
    inStock: true,
  },
  {
    id: "prod-ro-14",
    name: "Advanced Multi-Stage RO Machine",
    subtitle: "8-Stage RO + UV + Alkaline purifier with copper boost",
    category: "Tools",
    price: 12999,
    pointsPrice: 12000,
    rating: 4.95,
    reviewsCount: 134,
    badge: "PURE WATER",
    badgeColor: "#0284c7",
    btnColor: "#0369a1",
    hasBluetooth: false,
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
    bgGradient: ["#f0f9ff", "#e0f2fe"],
    inStock: true,
  },
  {
    id: "prod-rospares-15",
    name: "RO Spares & Replacement Filter Kit",
    subtitle: "Sediment + Carbon + Post Carbon filter set for all brands",
    category: "Tools",
    price: 1499,
    pointsPrice: 1350,
    rating: 4.8,
    reviewsCount: 290,
    badge: "GENUINE",
    badgeColor: "#0284c7",
    btnColor: "#0369a1",
    hasBluetooth: false,
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
    bgGradient: ["#f0f9ff", "#e0f2fe"],
    inStock: true,
  },
];

const STORAGE_CART_KEY = "@urban_shop_cart_v1";

export const subscribeToShopProducts = (callback: (products: ShopProduct[]) => void) => {
  try {
    const q = query(collection(db, "shop_products"), orderBy("createdAt", "desc"));
    return onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const list = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
          })) as ShopProduct[];
          callback(list);
        } else {
          callback(DEFAULT_SHOP_PRODUCTS);
        }
      },
      (error) => {
        console.warn("[ShopService] Firestore read fallback:", error);
        callback(DEFAULT_SHOP_PRODUCTS);
      }
    );
  } catch (e) {
    console.warn("[ShopService] Snapshot error:", e);
    callback(DEFAULT_SHOP_PRODUCTS);
    return () => {};
  }
};

export const addProductToFirestore = async (productData: Partial<ShopProduct>) => {
  return await addDoc(collection(db, "shop_products"), {
    ...productData,
    createdAt: serverTimestamp(),
  });
};

export const getSavedCart = async (): Promise<CartItem[]> => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

export const saveUserCart = async (cart: CartItem[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_CART_KEY, JSON.stringify(cart));
  } catch (e) {
    console.error("[ShopService] Save cart error:", e);
  }
};

export const placeShopOrder = async (orderData: Partial<ShopOrder>): Promise<string> => {
  const docRef = await addDoc(collection(db, "shop_orders"), {
    ...orderData,
    createdAt: serverTimestamp(),
  });
  await AsyncStorage.removeItem(STORAGE_CART_KEY);
  return docRef.id;
};

export const subscribeToCustomerOrders = (
  customerId: string,
  callback: (orders: ShopOrder[]) => void
) => {
  try {
    const q = query(
      collection(db, "shop_orders"),
      where("customerId", "==", customerId),
      orderBy("createdAt", "desc")
    );
    return onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        })) as ShopOrder[];
        callback(list);
      },
      (err) => {
        console.warn("[ShopService] Orders read error:", err);
        callback([]);
      }
    );
  } catch (e) {
    callback([]);
    return () => {};
  }
};

export const cancelShopOrder = async (orderId: string): Promise<void> => {
  const orderRef = doc(db, "shop_orders", orderId);
  await updateDoc(orderRef, {
    status: "cancelled",
    updatedAt: serverTimestamp(),
  });
};
