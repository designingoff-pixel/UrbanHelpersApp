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
// Client Notes (Page 5) Catalog & Expanded Store Inventory
// ─────────────────────────────────────────────────────────────────────────────
export const DEFAULT_SHOP_PRODUCTS: ShopProduct[] = [
  // Health
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
    imageUrl: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=600&q=80",
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
    id: "prod-thermo-16",
    name: "Digital Infrared Forehead Thermometer",
    subtitle: "Contactless 1-second body & ambient temperature fever scanner",
    category: "Health",
    price: 1299,
    pointsPrice: 1200,
    rating: 4.85,
    reviewsCount: 215,
    badge: "INSTANT",
    badgeColor: "#2563eb",
    btnColor: "#1d4ed8",
    hasBluetooth: false,
    imageUrl: "https://images.unsplash.com/photo-1584634731339-252c581abfc5?w=600&q=80",
    bgGradient: ["#eff6ff", "#dbeafe"],
    inStock: true,
    isPopular: true,
  },
  {
    id: "prod-nebulizer-17",
    name: "Portable Ultrasonic Mesh Nebulizer",
    subtitle: "Whisper-quiet pocket inhaler for asthma, cough & cold relief",
    category: "Health",
    price: 1899,
    pointsPrice: 1700,
    rating: 4.9,
    reviewsCount: 168,
    badge: "QUIET MESH",
    badgeColor: "#0284c7",
    btnColor: "#0369a1",
    hasBluetooth: false,
    imageUrl: "https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=600&q=80",
    bgGradient: ["#f0f9ff", "#e0f2fe"],
    inStock: true,
  },
  {
    id: "prod-pillbox-18",
    name: "Smart Pill Organizer & Dispenser",
    subtitle: "7-Day 4-compartment medication box with audio-visual chime",
    category: "Health",
    price: 1199,
    pointsPrice: 1050,
    rating: 4.8,
    reviewsCount: 142,
    badge: "ALARM TIMER",
    badgeColor: "#7c3aed",
    btnColor: "#6d28d9",
    hasBluetooth: false,
    imageUrl: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=600&q=80",
    bgGradient: ["#f5f3ff", "#ede9fe"],
    inStock: true,
  },
  {
    id: "prod-firstaid-19",
    name: "Emergency Trauma First Aid Kit",
    subtitle: "120-Piece certified medical response kit with shears & splints",
    category: "Health",
    price: 1499,
    pointsPrice: 1350,
    rating: 4.95,
    reviewsCount: 380,
    badge: "CERTIFIED",
    badgeColor: "#dc2626",
    btnColor: "#b91c1c",
    hasBluetooth: false,
    imageUrl: "https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=600&q=80",
    bgGradient: ["#fef2f2", "#fee2e2"],
    inStock: true,
  },

  // Fitness
  {
    id: "prod-massager-8",
    name: "Deep Tissue Body Massager Gun",
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
    imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80",
    bgGradient: ["#fdf2f8", "#fce7f3"],
    inStock: true,
    isPopular: true,
  },
  {
    id: "prod-band-20",
    name: "Smart Tension Resistance Bands Set",
    subtitle: "5 Color-coded stackable tubes with door anchor & ankle straps",
    category: "Fitness",
    price: 1299,
    pointsPrice: 1150,
    rating: 4.8,
    reviewsCount: 290,
    badge: "STRENGTH",
    badgeColor: "#059669",
    btnColor: "#047857",
    hasBluetooth: false,
    imageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&q=80",
    bgGradient: ["#ecfdf5", "#d1fae5"],
    inStock: true,
  },
  {
    id: "prod-roller-21",
    name: "High-Density EVA Foam Roller",
    subtitle: "Textured 3D trigger-point roller for back and muscle knot release",
    category: "Fitness",
    price: 899,
    pointsPrice: 800,
    rating: 4.75,
    reviewsCount: 155,
    badge: "THERAPY",
    badgeColor: "#0891b2",
    btnColor: "#0e7490",
    hasBluetooth: false,
    imageUrl: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&q=80",
    bgGradient: ["#ecfeff", "#cffafe"],
    inStock: true,
  },
  {
    id: "prod-mat-22",
    name: "Eco-Friendly Non-Slip Yoga Mat",
    subtitle: "8mm dual-texture cushioned alignment mat with carry sling",
    category: "Fitness",
    price: 1399,
    pointsPrice: 1250,
    rating: 4.9,
    reviewsCount: 320,
    badge: "PREMIUM CUSHION",
    badgeColor: "#7c3aed",
    btnColor: "#6d28d9",
    hasBluetooth: false,
    imageUrl: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600&q=80",
    bgGradient: ["#f5f3ff", "#ede9fe"],
    inStock: true,
  },
  {
    id: "prod-dumbbells-23",
    name: "Adjustable Hex Dumbbells & Grip Kit",
    subtitle: "Anti-roll neoprene coated weights with hand grip trainer",
    category: "Fitness",
    price: 2799,
    pointsPrice: 2500,
    rating: 4.85,
    reviewsCount: 180,
    badge: "HEX DESIGN",
    badgeColor: "#334155",
    btnColor: "#1e293b",
    hasBluetooth: false,
    imageUrl: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&q=80",
    bgGradient: ["#f8fafc", "#f1f5f9"],
    inStock: true,
  },
  {
    id: "prod-skipping-24",
    name: "Smart Digital Skipping Rope",
    subtitle: "Cordless & corded jump rope with HD LCD counter & calorie track",
    category: "Fitness",
    price: 999,
    pointsPrice: 900,
    rating: 4.8,
    reviewsCount: 140,
    badge: "LCD TRACKER",
    badgeColor: "#ea580c",
    btnColor: "#c2410c",
    hasBluetooth: true,
    imageUrl: "https://images.unsplash.com/photo-1598971861713-54ad16a7e72e?w=600&q=80",
    bgGradient: ["#fff7ed", "#ffedd5"],
    inStock: true,
  },
  {
    id: "prod-cushion-25",
    name: "Orthopedic Lumbar Back Support Cushion",
    subtitle: "Ergonomic high-rebound memory foam backrest for office & car",
    category: "Fitness",
    price: 1499,
    pointsPrice: 1350,
    rating: 4.85,
    reviewsCount: 230,
    badge: "POSTURE PRO",
    badgeColor: "#0284c7",
    btnColor: "#0369a1",
    hasBluetooth: false,
    imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80",
    bgGradient: ["#f0f9ff", "#e0f2fe"],
    inStock: true,
  },

  // Wellness
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
    isPopular: true,
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
    imageUrl: "https://images.unsplash.com/photo-1511295742362-92c96b124e52?w=600&q=80",
    bgGradient: ["#eef2ff", "#e0e7ff"],
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
    imageUrl: "https://images.unsplash.com/photo-1463936575829-25148e1db1b8?w=600&q=80",
    bgGradient: ["#f0fdf4", "#dcfce7"],
    inStock: true,
  },
  {
    id: "prod-neck-26",
    name: "Heated Shiatsu Neck & Shoulder Massager",
    subtitle: "8 Bi-directional kneading nodes with infrared soothing warmth",
    category: "Wellness",
    price: 2699,
    pointsPrice: 2400,
    rating: 4.9,
    reviewsCount: 275,
    badge: "HEATED NODES",
    badgeColor: "#db2777",
    btnColor: "#be185d",
    hasBluetooth: false,
    imageUrl: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=600&q=80",
    bgGradient: ["#fdf2f8", "#fce7f3"],
    inStock: true,
    isPopular: true,
  },
  {
    id: "prod-kneepillow-27",
    name: "Orthopedic Memory Foam Knee Pillow",
    subtitle: "Ergonomic leg bolster for spinal alignment & sciatica relief",
    category: "Wellness",
    price: 1199,
    pointsPrice: 1050,
    rating: 4.8,
    reviewsCount: 160,
    badge: "CONTOURED",
    badgeColor: "#059669",
    btnColor: "#047857",
    hasBluetooth: false,
    imageUrl: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600&q=80",
    bgGradient: ["#ecfdf5", "#d1fae5"],
    inStock: true,
  },
  {
    id: "prod-uvbox-28",
    name: "UV-C Sanitizing Box & Wireless Charger",
    subtitle: "360° Ultraviolet sterilization for phones, keys & 10W fast charge",
    category: "Wellness",
    price: 2199,
    pointsPrice: 1950,
    rating: 4.85,
    reviewsCount: 110,
    badge: "DUAL ACTION",
    badgeColor: "#0891b2",
    btnColor: "#0e7490",
    hasBluetooth: false,
    imageUrl: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=600&q=80",
    bgGradient: ["#ecfeff", "#cffafe"],
    inStock: true,
  },
  {
    id: "prod-diffuser-29",
    name: "Pure Aromatherapy Essential Oils Set",
    subtitle: "6 Pack 100% pure therapeutic grade oils: Lavender, Tea Tree, Mint",
    category: "Wellness",
    price: 899,
    pointsPrice: 800,
    rating: 4.9,
    reviewsCount: 340,
    badge: "100% ORGANIC",
    badgeColor: "#15803d",
    btnColor: "#166534",
    hasBluetooth: false,
    imageUrl: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600&q=80",
    bgGradient: ["#f0fdf4", "#dcfce7"],
    inStock: true,
  },

  // Tools
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
    imageUrl: "https://images.unsplash.com/photo-1508873696983-2df5293cb32f?w=600&q=80",
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
    imageUrl: "https://images.unsplash.com/photo-1616401784845-180882ba9ba8?w=600&q=80",
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
    imageUrl: "https://images.unsplash.com/photo-1585421514738-01798e348b17?w=600&q=80",
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
    imageUrl: "https://images.unsplash.com/photo-1585670149967-b4f4da88cc9f?w=600&q=80",
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
    imageUrl: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=600&q=80",
    bgGradient: ["#f0f9ff", "#e0f2fe"],
    inStock: true,
  },
  {
    id: "prod-toolkit-30",
    name: "Precision 108-Piece Home Tool Kit",
    subtitle: "Complete chrome-vanadium tool set with hammer, drill bits & case",
    category: "Tools",
    price: 2499,
    pointsPrice: 2200,
    rating: 4.85,
    reviewsCount: 310,
    badge: "PRO TOOLKIT",
    badgeColor: "#b45309",
    btnColor: "#92400e",
    hasBluetooth: false,
    imageUrl: "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=600&q=80",
    bgGradient: ["#fffbeb", "#fef3c7"],
    inStock: true,
  },
  {
    id: "prod-pressure-31",
    name: "Cordless High-Pressure Power Washer",
    subtitle: "Portable 48V battery washer for AC servicing, cars & balconies",
    category: "Tools",
    price: 4499,
    pointsPrice: 4000,
    rating: 4.9,
    reviewsCount: 145,
    badge: "CORDLESS 48V",
    badgeColor: "#0284c7",
    btnColor: "#0369a1",
    hasBluetooth: false,
    imageUrl: "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=600&q=80",
    bgGradient: ["#f0f9ff", "#e0f2fe"],
    inStock: true,
    isPopular: true,
  },
  {
    id: "prod-tdspen-32",
    name: "Digital Water TDS & Temp Testing Pen",
    subtitle: "Fast 0-9990 ppm drinking water purity tester with backlight",
    category: "Tools",
    price: 499,
    pointsPrice: 450,
    rating: 4.7,
    reviewsCount: 520,
    badge: "3-IN-1 TEST",
    badgeColor: "#059669",
    btnColor: "#047857",
    hasBluetooth: false,
    imageUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&q=80",
    bgGradient: ["#ecfdf5", "#d1fae5"],
    inStock: true,
  },

  // More (Senior Care, Home Security & Electronics)
  {
    id: "prod-grabbar-33",
    name: "Senior Safety Bed Assist Handle & Grab Bar",
    subtitle: "Heavy-duty fall prevention bed rail with slip-free grip & pouch",
    category: "More",
    price: 2299,
    pointsPrice: 2050,
    rating: 4.95,
    reviewsCount: 185,
    badge: "ELDER CARE",
    badgeColor: "#4f46e5",
    btnColor: "#4338ca",
    hasBluetooth: false,
    imageUrl: "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=600&q=80",
    bgGradient: ["#eef2ff", "#e0e7ff"],
    inStock: true,
    isPopular: true,
  },
  {
    id: "prod-cane-34",
    name: "Ergonomic Quad-Base Folding Walking Cane",
    subtitle: "Freestanding adjustable cane with LED light & pivoting base",
    category: "More",
    price: 1399,
    pointsPrice: 1250,
    rating: 4.85,
    reviewsCount: 195,
    badge: "PIVOT BASE",
    badgeColor: "#0f766e",
    btnColor: "#115e59",
    hasBluetooth: false,
    imageUrl: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=600&q=80",
    bgGradient: ["#f0fdfa", "#ccfbf1"],
    inStock: true,
  },
  {
    id: "prod-doorcam-35",
    name: "Smart Wireless Video Doorbell & Chime",
    subtitle: "1080p Full HD camera with 2-way audio, PIR motion & night vision",
    category: "More",
    price: 3699,
    pointsPrice: 3300,
    rating: 4.9,
    reviewsCount: 240,
    badge: "WIRELESS HD",
    badgeColor: "#7c3aed",
    btnColor: "#6d28d9",
    hasBluetooth: true,
    imageUrl: "https://images.unsplash.com/photo-1558002038-1055907df827?w=600&q=80",
    bgGradient: ["#f5f3ff", "#ede9fe"],
    inStock: true,
    isPopular: true,
  },
];

const STORAGE_CART_KEY = "@urban_shop_cart_v1";

export const subscribeToShopProducts = (callback: (products: ShopProduct[]) => void) => {
  try {
    const q = collection(db, "shop_products");
    return onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const list = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
          })) as ShopProduct[];

          // Merge live Firestore updates with defaults so customer catalog is always complete
          const productMap = new Map<string, ShopProduct>();
          DEFAULT_SHOP_PRODUCTS.forEach((dp) => productMap.set(dp.id, dp));
          list.forEach((lp) => {
            productMap.set(lp.id, { ...(productMap.get(lp.id) || {}), ...lp });
          });

          const merged = Array.from(productMap.values());
          callback(merged);
        } else {
          callback(DEFAULT_SHOP_PRODUCTS);
        }
      },
      (error) => {
        console.warn("[ShopService] Firestore read fallback, using default catalog:", error);
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
