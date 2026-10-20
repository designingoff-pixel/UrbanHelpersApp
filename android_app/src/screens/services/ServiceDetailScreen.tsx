import React, { useState, useEffect, useRef } from "react";
import {
  ScrollView,
  Text,
  View,
  StyleSheet,
  Dimensions,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import MapView, { PROVIDER_GOOGLE, Region } from "react-native-maps";
import * as Location from "expo-location";
import { RootStackParamList } from "@/navigation/types";
import { SERVICE_CATEGORIES, SubService } from "./servicesData";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { auth, db } from "@/services/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  collection,
  query,
  where,
  limit,
  getDocs,
} from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { notifyVendorsBookingPlaced, sendBookingPlaced } from "@/services/notificationService";
import {
  normalizeAndValidatePhone,
  sendBookingVerificationOTP,
  NormalizedPhone,
} from "@/services/smsService";
import { reverseGeocodeLocation, searchAddressSuggestions, GeocodedLocation } from "@/services/geocodingService";

type Props = NativeStackScreenProps<RootStackParamList, "ServiceDetail">;
const { width } = Dimensions.get("window");

// Calendar & Date helpers for advance booking
const WEEKDAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const formatReadableDate = (d: Date): string => {
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatShortDate = (d: Date): string => {
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

const isSameDay = (d1: Date, d2: Date): boolean => {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

const isDateInPast = (d: Date): boolean => {
  const today = new Date();
  const dZero = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const todayZero = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return dZero.getTime() < todayZero.getTime();
};

const getFirstDayOfMonth = (year: number, month: number) => {
  return new Date(year, month, 1).getDay();
};

const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate();
};

const POPULAR_TIME_SLOTS = [
  "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM",
  "12:00 PM", "02:00 PM", "04:00 PM", "06:00 PM", "08:00 PM"
];

// Comprehensive time slots from morning to night
const ALL_TIME_SLOTS = [
  "06:00 AM", "06:30 AM", "07:00 AM", "07:30 AM", "08:00 AM", "08:30 AM",
  "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "12:00 PM", "12:30 PM", "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM",
  "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM", "05:00 PM", "05:30 PM",
  "06:00 PM", "06:30 PM", "07:00 PM", "07:30 PM", "08:00 PM", "08:30 PM",
  "09:00 PM", "09:30 PM", "10:00 PM"
];

const EMPTY_CALENDAR_PAD_KEYS = [
  "cal-pad-0", "cal-pad-1", "cal-pad-2", "cal-pad-3", "cal-pad-4", "cal-pad-5", "cal-pad-6"
];

interface ResolvedUserContact {
  phone?: string;
  address?: string;
}

const getPhoneFromDedicatedKeys = async (): Promise<string> => {
  const p1 = await AsyncStorage.getItem("@customer_contact_phone");
  if (p1?.trim()) return p1.trim();
  const p2 = await AsyncStorage.getItem("@customer_phone");
  return p2?.trim() || "";
};

const parseProfileContact = (raw: string | null): ResolvedUserContact => {
  if (!raw) return {};
  try {
    const p = JSON.parse(raw);
    const phone = p.phone?.trim() || p.mobile?.trim() || "";
    const address = p.address?.trim() || p.deliveryAddress?.trim() || "";
    return { phone, address };
  } catch {
    return {};
  }
};

const scanAllStorageProfiles = async (): Promise<ResolvedUserContact> => {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const profileKeys = allKeys.filter(
      (k) => k.startsWith("@customer_profile_") || k.includes("profile")
    );
    let phone = "";
    let address = "";
    for (const k of profileKeys) {
      const data = await AsyncStorage.getItem(k);
      const parsed = parseProfileContact(data);
      phone = phone || parsed.phone || "";
      address = address || parsed.address || "";
      if (phone && address) break;
    }
    return { phone, address };
  } catch {
    return {};
  }
};

const findPhoneAndAddressInStorage = async (uid?: string): Promise<ResolvedUserContact> => {
  let phone = await getPhoneFromDedicatedKeys();
  let address = "";

  if (uid) {
    const userProfile = parseProfileContact(await AsyncStorage.getItem(`@customer_profile_${uid}`));
    phone = phone || userProfile.phone || "";
    address = address || userProfile.address || "";
  }

  if (!phone || !address) {
    const guestProfile = parseProfileContact(await AsyncStorage.getItem("@customer_profile_guest"));
    phone = phone || guestProfile.phone || "";
    address = address || guestProfile.address || "";
  }

  if (!phone || !address) {
    const scanned = await scanAllStorageProfiles();
    phone = phone || scanned.phone || "";
    address = address || scanned.address || "";
  }

  return { phone, address };
};

const getContactFromUserDoc = async (uid: string): Promise<ResolvedUserContact> => {
  try {
    const snap = await getDoc(doc(db, "users", uid));
    if (!snap.exists()) return {};
    const d = snap.data();
    const phone = d.phone || d.mobile || d.phoneNumber || d.contactNumber || d.contact || d.emergencyPhone;
    const address = d.address || d.deliveryAddress;
    return {
      phone: phone ? String(phone).trim() : "",
      address: address ? String(address).trim() : "",
    };
  } catch (err) {
    console.warn("[ServiceDetail] Firestore user fetch error:", err);
    return {};
  }
};

const getContactFromUserEmail = async (email: string): Promise<ResolvedUserContact> => {
  try {
    const qUsers = query(collection(db, "users"), where("email", "==", email), limit(1));
    const snap = await getDocs(qUsers);
    if (snap.empty) return {};
    const d = snap.docs[0].data();
    const phone = d.phone || d.mobile || d.phoneNumber || d.contactNumber || d.contact;
    const address = d.address || d.deliveryAddress;
    return {
      phone: phone ? String(phone).trim() : "",
      address: address ? String(address).trim() : "",
    };
  } catch {
    return {};
  }
};

const getPhoneFromPreviousBookings = async (uid?: string, email?: string | null): Promise<string> => {
  try {
    const qB = uid
      ? query(collection(db, "bookings"), where("customerId", "==", uid), limit(3))
      : query(collection(db, "bookings"), where("customerEmail", "==", email), limit(3));
    const snap = await getDocs(qB);
    for (const docSnap of snap.docs) {
      const phone = docSnap.data().customerPhone;
      if (phone && String(phone).trim()) {
        return String(phone).trim();
      }
    }
  } catch {
    // Ignore past booking lookup fallback errors
  }
  return "";
};

const findPhoneAndAddressInFirestore = async (
  uid?: string,
  email?: string | null
): Promise<ResolvedUserContact> => {
  let phone = "";
  let address = "";

  if (uid) {
    const userDoc = await getContactFromUserDoc(uid);
    phone = userDoc.phone || "";
    address = userDoc.address || "";
  }

  if (!phone && email) {
    const emailDoc = await getContactFromUserEmail(email);
    phone = emailDoc.phone || "";
    address = address || emailDoc.address || "";
  }

  if (!phone && (uid || email)) {
    phone = await getPhoneFromPreviousBookings(uid, email);
  }

  return { phone, address };
};

export default function ServiceDetailScreen({ navigation, route }: Readonly<Props>) {
  const { categoryId, subServiceId } = route.params;
  const { user } = useAuth();
  const { isDark, colors: themeColors } = useTheme();
  const activeUser = auth.currentUser || user;

  const defaultTextColor = isDark ? themeColors.text : "#0F172A";
  const defaultSubTextColor = isDark ? themeColors.textSecondary : "#64748B";
  const phoneErrorColor = isDark ? "#f87171" : "#ef4444";
  const timeChipSelectedBg = isDark ? "rgba(0,198,170,0.22)" : "#CCFBF1";
  const timeChipUnselectedBg = isDark ? themeColors.surface : "#F8FAFC";

  const category =
    SERVICE_CATEGORIES.find((c) => c.id === categoryId) || SERVICE_CATEGORIES[0];
  const selectedSub: SubService =
    category.subServices.find((s) => s.id === subServiceId) ||
    category.subServices[0] || {
      id: "cl-restroom",
      name: "Restroom Cleaning",
      price: "₹399",
      duration: "60 min",
      description: "Tile scrub, commode, basin and mirror sanitisation.",
    };

  // User input states - strictly fetch from authenticated profile or empty (NEVER fake dummy number)
  const [contactNumber, setContactNumber] = useState(
    activeUser?.phoneNumber || ""
  );
  const [isEditingPhone, setIsEditingPhone] = useState(false);

  const [verifiedPhone, setVerifiedPhone] = useState<string | null>(null);
  const [targetPhoneNorm, setTargetPhoneNorm] = useState<NormalizedPhone | null>(null);
  const [resendCooldown, setResendCooldown] = useState<number>(0);
  const [otpExpiresAt, setOtpExpiresAt] = useState<number>(0);
  const [isTestModeOtp, setIsTestModeOtp] = useState<boolean>(false);
  const isSubmittingBooking = useRef<boolean>(false);
  const [otpModalVisible, setOtpModalVisible] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [enteredOtp, setEnteredOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);

  // Active countdown timer for OTP resend cooldown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const [serviceAddress, setServiceAddress] = useState(
    "Fetching current location..."
  );
  const [addressCoords, setAddressCoords] = useState<{ latitude: number; longitude: number }>({
    latitude: 12.9141,
    longitude: 77.6411,
  });
  const [isFetchingLocation, setIsFetchingLocation] = useState(true);

  // Advance Date & Calendar selection states
  const today = new Date();
  const tomorrowObj = new Date();
  tomorrowObj.setDate(tomorrowObj.getDate() + 1);

  const [selectedDateObj, setSelectedDateObj] = useState<Date>(() => new Date());
  const [calendarYear, setCalendarYear] = useState<number>(() => new Date().getFullYear());
  const [calendarMonth, setCalendarMonth] = useState<number>(() => new Date().getMonth());
  const [bookingDate, setBookingDate] = useState<string>(() => formatReadableDate(new Date()));
  const [bookingTime, setBookingTime] = useState<string>("10:00 AM");

  const isTodaySelected = isSameDay(selectedDateObj, today);
  const isTomorrowSelected = isSameDay(selectedDateObj, tomorrowObj);
  const isAdvanceSelected = !isTodaySelected && !isTomorrowSelected;

  let arrivalScheduleLabel = "Advance Arrival Date";
  let quickScheduleSub = "Advance Arrival";
  if (isTodaySelected) {
    arrivalScheduleLabel = "Arrival Today";
    quickScheduleSub = "Arrival Today";
  } else if (isTomorrowSelected) {
    arrivalScheduleLabel = "Arrival Tomorrow";
    quickScheduleSub = "Arrival Tomorrow";
  }

  const isPrevMonthDisabled =
    calendarYear === today.getFullYear() && calendarMonth === today.getMonth();
  const maxNavDate = new Date(today.getFullYear(), today.getMonth() + 11, 1);
  const isNextMonthDisabled =
    calendarYear > maxNavDate.getFullYear() ||
    (calendarYear === maxNavDate.getFullYear() && calendarMonth >= maxNavDate.getMonth());

  const handleSelectToday = () => {
    const t = new Date();
    setSelectedDateObj(t);
    setCalendarYear(t.getFullYear());
    setCalendarMonth(t.getMonth());
    setBookingDate(formatReadableDate(t));
  };

  const handleSelectTomorrow = () => {
    const tom = new Date();
    tom.setDate(tom.getDate() + 1);
    setSelectedDateObj(tom);
    setCalendarYear(tom.getFullYear());
    setCalendarMonth(tom.getMonth());
    setBookingDate(formatReadableDate(tom));
  };

  const handleSelectCalendarDay = (dayNum: number) => {
    const picked = new Date(calendarYear, calendarMonth, dayNum);
    setSelectedDateObj(picked);
    setBookingDate(formatReadableDate(picked));
  };

  const handlePrevMonth = () => {
    if (isPrevMonthDisabled) return;
    if (calendarMonth === 0) {
      setCalendarYear((y) => y - 1);
      setCalendarMonth(11);
    } else {
      setCalendarMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (isNextMonthDisabled) return;
    if (calendarMonth === 11) {
      setCalendarYear((y) => y + 1);
      setCalendarMonth(0);
    } else {
      setCalendarMonth((m) => m + 1);
    }
  };

  // Dynamic Date & Any-Time Selection Modal States
  const [dateModalVisible, setDateModalVisible] = useState(false);
  const [timeModalVisible, setTimeModalVisible] = useState(false);
  const [customTimeInput, setCustomTimeInput] = useState("");
  const [customAmPm, setCustomAmPm] = useState<"AM" | "PM">("AM");

  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);

  const [loading, setLoading] = useState(false);

  // Map Picker Modal States
  const [mapModalVisible, setMapModalVisible] = useState(false);
  const [mapRegion, setMapRegion] = useState<Region>({
    latitude: 12.9141,
    longitude: 77.6411,
    latitudeDelta: 0.008,
    longitudeDelta: 0.008,
  });
  const [draggedAddress, setDraggedAddress] = useState(serviceAddress);
  const mapRef = useRef<MapView>(null);

  // Map search & suggestions state
  const [mapSearchQuery, setMapSearchQuery] = useState("");
  const [mapSuggestions, setMapSuggestions] = useState<GeocodedLocation[]>([]);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [isGeocodingAddress, setIsGeocodingAddress] = useState(false);
  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Comprehensive multi-source automatic fetcher for user phone & address
  const loadUserDetails = async (currentUserUid?: string, currentUserEmail?: string | null) => {
    try {
      const currUser = auth.currentUser || user;
      const uid = currentUserUid || currUser?.uid;
      const email = currentUserEmail ?? currUser?.email;

      let foundPhone = currUser?.phoneNumber?.trim() || "";
      let foundAddress = "";

      if (!foundPhone || !foundAddress) {
        const local = await findPhoneAndAddressInStorage(uid);
        foundPhone = foundPhone || local.phone || "";
        foundAddress = foundAddress || local.address || "";
      }

      if (!foundPhone || !foundAddress) {
        const remote = await findPhoneAndAddressInFirestore(uid, email);
        foundPhone = foundPhone || remote.phone || "";
        foundAddress = foundAddress || remote.address || "";
      }

      // Apply results
      if (foundPhone) {
        setContactNumber(foundPhone);
      }
      if (foundAddress) {
        setServiceAddress(foundAddress);
        setDraggedAddress(foundAddress);
      }
    } catch (e) {
      console.warn("[ServiceDetail] Error loading user details:", e);
    }
  };

  // Real-time auth and user details listener
  useEffect(() => {
    void loadUserDetails(activeUser?.uid, activeUser?.email);

    // Listen to Firebase Auth state
    const authUnsub = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        void loadUserDetails(firebaseUser.uid, firebaseUser.email);
      }
    });

    // Listen to Firestore real-time changes on users/{uid}
    let firestoreUnsub: (() => void) | null = null;
    const currUid = activeUser?.uid;
    if (currUid) {
      firestoreUnsub = onSnapshot(doc(db, "users", currUid), (snap) => {
        if (snap.exists()) {
          const d = snap.data();
          const p =
            d.phone ||
            d.mobile ||
            d.phoneNumber ||
            d.contactNumber ||
            d.contact;
          if (p && String(p).trim()) {
            setContactNumber(String(p).trim());
          }
          const a = d.address || d.deliveryAddress;
          if (a && String(a).trim()) {
            setServiceAddress(String(a).trim());
            setDraggedAddress(String(a).trim());
          }
        }
      });
    }

    return () => {
      authUnsub();
      if (firestoreUnsub) firestoreUnsub();
    };
  }, [activeUser?.uid]);

  // Save updated contact number to all persistence stores (strictly user-entered, never dummy)
  const handleSaveContactNumber = async (text: string) => {
    const trimmed = text.trim();
    setContactNumber(trimmed);
    // Invalidate previous verification if edited
    if (verifiedPhone && verifiedPhone !== trimmed) {
      setVerifiedPhone(null);
    }
    setIsEditingPhone(false);
    if (!trimmed) return;
    try {
      await AsyncStorage.setItem("@customer_contact_phone", trimmed);
      await AsyncStorage.setItem("@customer_phone", trimmed);
      const currUid = auth.currentUser?.uid || user?.uid;
      if (currUid) {
        await AsyncStorage.setItem(
          `@customer_profile_${currUid}`,
          JSON.stringify({ phone: trimmed, mobile: trimmed })
        );
        await setDoc(
          doc(db, "users", currUid),
          { phone: trimmed, mobile: trimmed },
          { merge: true }
        );
      }
    } catch {
      // Ignore background persistence errors
    }
  };

  const loadCachedAddressFallback = async () => {
    const cached = await AsyncStorage.getItem("@customer_last_address");
    if (cached?.trim()) {
      setServiceAddress(cached.trim());
      setDraggedAddress(cached.trim());
      const cachedCoords = await AsyncStorage.getItem("@customer_last_coords");
      if (cachedCoords) {
        try {
          const c = JSON.parse(cachedCoords);
          if (c.latitude && c.longitude) setAddressCoords(c);
        } catch {
          // Ignore corrupted cached coordinates
        }
      }
    } else if (serviceAddress === "Fetching current location...") {
      setServiceAddress("Select location on map");
      setDraggedAddress("Select location on map");
    }
  };

  const persistCurrentLocation = async (lat: number, lng: number, address: string) => {
    await AsyncStorage.setItem("@customer_last_address", address).catch(() => {});
    await AsyncStorage.setItem("@customer_last_coords", JSON.stringify({ latitude: lat, longitude: lng })).catch(() => {});

    const currUid = auth.currentUser?.uid || user?.uid;
    if (currUid) {
      await setDoc(
        doc(db, "users", currUid),
        { address, deliveryAddress: address, customerLat: lat, customerLng: lng },
        { merge: true }
      ).catch(() => {});
    }
  };

  // Ultra-fast doorstep location detection with instant last-known cache and quick GPS race
  const fetchCurrentLocation = async (showAlertOnError = false) => {
    setIsFetchingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        if (showAlertOnError) {
          Alert.alert(
            "Location Permission Required",
            "Please enable location access in settings to automatically fetch your doorstep address."
          );
        }
        await loadCachedAddressFallback();
        return;
      }

      // STEP 1: Ultra-fast instant position check (< 50ms)
      const lastKnown = await Location.getLastKnownPositionAsync().catch(() => null);
      if (lastKnown?.coords) {
        const lat = lastKnown.coords.latitude;
        const lng = lastKnown.coords.longitude;
        setAddressCoords({ latitude: lat, longitude: lng });
        setMapRegion({
          latitude: lat,
          longitude: lng,
          latitudeDelta: 0.008,
          longitudeDelta: 0.008,
        });

        // Instant reverse geocode in parallel
        reverseGeocodeLocation(lat, lng).then((resolved) => {
          if (resolved && resolved.trim().length > 3) {
            setServiceAddress(resolved.trim());
            setDraggedAddress(resolved.trim());
            setIsFetchingLocation(false);
          }
        }).catch(() => {});
      }

      // STEP 2: Concurrently get fresh position with tight 3-second timeout race
      const freshPromise = Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 3000));
      const loc = (await Promise.race([freshPromise, timeoutPromise])) || lastKnown;

      if (loc?.coords) {
        const lat = loc.coords.latitude;
        const lng = loc.coords.longitude;

        setAddressCoords({ latitude: lat, longitude: lng });
        setMapRegion({
          latitude: lat,
          longitude: lng,
          latitudeDelta: 0.008,
          longitudeDelta: 0.008,
        });

        const resolvedAddress = await reverseGeocodeLocation(lat, lng);
        const finalAddress =
          resolvedAddress && resolvedAddress.trim().length > 3
            ? resolvedAddress.trim()
            : `${lat.toFixed(4)}, ${lng.toFixed(4)}`;

        setServiceAddress(finalAddress);
        setDraggedAddress(finalAddress);

        await persistCurrentLocation(lat, lng, finalAddress);
      }
    } catch (err: any) {
      console.warn("[ServiceDetail] Error fetching auto location:", err);
      if (showAlertOnError) {
        Alert.alert("Location Error", "Could not retrieve your current location. Please check your GPS connection or select on the map.");
      }
      await loadCachedAddressFallback();
    } finally {
      setIsFetchingLocation(false);
    }
  };

  // Trigger automatic location fetch on component mount
  useEffect(() => {
    void fetchCurrentLocation();
  }, []);

  // Open Map: Defaults automatically to current location with live camera animation
  const handleOpenMapPicker = async () => {
    // 1. Immediately position map to user's detected coordinates
    if (addressCoords.latitude && addressCoords.longitude) {
      const currentRegion: Region = {
        latitude: addressCoords.latitude,
        longitude: addressCoords.longitude,
        latitudeDelta: 0.006,
        longitudeDelta: 0.006,
      };
      setMapRegion(currentRegion);
      setDraggedAddress(serviceAddress);
    }

    setMapModalVisible(true);

    // 2. Animate camera and verify latest position smoothly without blocking UI
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const lastKnown = await Location.getLastKnownPositionAsync().catch(() => null);
        const coords = lastKnown?.coords || addressCoords;
        if (coords) {
          const freshRegion: Region = {
            latitude: coords.latitude,
            longitude: coords.longitude,
            latitudeDelta: 0.006,
            longitudeDelta: 0.006,
          };
          setMapRegion(freshRegion);
          setTimeout(() => {
            mapRef.current?.animateToRegion(freshRegion, 600);
          }, 200);
        }
      }
    } catch (err) {
      console.warn("Location fetch error:", err);
    }
  };

  // Map location search handler with debouncing
  const handleMapSearchChange = (text: string) => {
    setMapSearchQuery(text);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    if (text.trim().length < 2) {
      setMapSuggestions([]);
      setIsSearchingLocation(false);
      return;
    }
    setIsSearchingLocation(true);
    searchDebounceRef.current = setTimeout(async () => {
      try {
        const results = await searchAddressSuggestions(text);
        setMapSuggestions(results);
      } catch (e) {
        console.warn("Search location error:", e);
      } finally {
        setIsSearchingLocation(false);
      }
    }, 350);
  };

  const handleSelectSuggestion = (loc: GeocodedLocation) => {
    setMapSearchQuery(loc.label);
    setMapSuggestions([]);
    setDraggedAddress(loc.label);
    setAddressCoords({ latitude: loc.lat, longitude: loc.lng });

    const newRegion: Region = {
      latitude: loc.lat,
      longitude: loc.lng,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    };
    setMapRegion(newRegion);
    mapRef.current?.animateToRegion(newRegion, 600);
  };

  // Reverse geocode on region change complete
  const handleRegionChangeComplete = async (region: Region) => {
    setMapRegion(region);
    setIsGeocodingAddress(true);
    try {
      const address = await reverseGeocodeLocation(region.latitude, region.longitude);
      if (address) {
        setDraggedAddress(address);
        setAddressCoords({ latitude: region.latitude, longitude: region.longitude });
      } else {
        const reverse = await Location.reverseGeocodeAsync({
          latitude: region.latitude,
          longitude: region.longitude,
        });
        if (reverse && reverse.length > 0) {
          const place = reverse[0];
          const formatted = [
            place.name || place.street,
            place.district || place.subregion,
            place.city,
            place.postalCode,
          ]
            .filter(Boolean)
            .join(", ");

          if (formatted) {
            setDraggedAddress(formatted);
            setAddressCoords({ latitude: region.latitude, longitude: region.longitude });
          }
        }
      }
    } catch {
      // Reverse geocoding failed, retain current coordinates
    } finally {
      setIsGeocodingAddress(false);
    }
  };

  const handleConfirmMapLocation = () => {
    if (draggedAddress) {
      setServiceAddress(draggedAddress);
    }
    setMapModalVisible(false);
    setMapSuggestions([]);
  };

  // Calculate pricing
  const basePriceNum = Number.parseInt(selectedSub.price.replace(/[^\d]/g, ""), 10) || 399;
  const originalPrice = basePriceNum >= 500 ? basePriceNum + 300 : 699;
  const finalPrice = Math.max(99, basePriceNum - couponDiscount);

  const handleApplyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) {
      Alert.alert("Coupon Code", "Please enter a valid discount code.");
      return;
    }
    if (code === "URBAN50" || code === "SAVE50" || code === "CLEAN50") {
      setCouponDiscount(50);
      setCouponApplied(true);
      Alert.alert("Coupon Applied! 🎉", "₹50 discount applied to your order.");
    } else if (code === "URBAN100" || code === "WELCOME100") {
      setCouponDiscount(100);
      setCouponApplied(true);
      Alert.alert("Coupon Applied! 🎉", "₹100 discount applied to your order.");
    } else {
      Alert.alert("Invalid Coupon", "This coupon code is expired or invalid.");
    }
  };

  const requestAndSendOTP = async (phoneNorm: NormalizedPhone, isResend = false) => {
    if (otpLoading) return;
    if (isResend && resendCooldown > 0) {
      Alert.alert("Please Wait", `You can request a new OTP in ${resendCooldown} seconds.`);
      return;
    }

    setOtpLoading(true);
    // Generate secure 4-digit numeric OTP (1000 - 9999)
    const newOtp = Math.floor(1000 + Math.random() * 9000).toString();

    try {
      const res = await sendBookingVerificationOTP(
        phoneNorm.clean10,
        newOtp,
        selectedSub.name || category.name
      );

      if (!res.success) {
        Alert.alert(
          "SMS Delivery Failed",
          res.message || "Failed to deliver OTP SMS. Please check your phone number and SMS quota."
        );
        return;
      }

      setGeneratedOtp(newOtp);
      setEnteredOtp("");
      setTargetPhoneNorm(phoneNorm);
      setOtpExpiresAt(Date.now() + 10 * 60 * 1000); // 10 minute expiry
      setResendCooldown(30); // 30-second cooldown
      setIsTestModeOtp(Boolean(res.isTestMode));
      setOtpModalVisible(true);
    } catch (err: any) {
      Alert.alert("SMS Error", err?.message || "An unexpected error occurred while requesting OTP.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!targetPhoneNorm) {
      const norm = normalizeAndValidatePhone(contactNumber);
      if (!norm.isValid) {
        Alert.alert("Invalid Phone", norm.error || "Please enter a valid mobile number.");
        return;
      }
      await requestAndSendOTP(norm, true);
      return;
    }
    await requestAndSendOTP(targetPhoneNorm, true);
  };

  const handleConfirmBooking = async () => {
    // 1. Read latest Contact Number entered
    const phoneNorm = normalizeAndValidatePhone(contactNumber);
    if (!phoneNorm.isValid) {
      Alert.alert("Phone Required", phoneNorm.error || "Please enter a valid 10-digit mobile number.");
      return;
    }

    // 2. Validate service address and location
    const trimmedAddress = serviceAddress.trim();
    if (!trimmedAddress || trimmedAddress === "Fetching current location..." || trimmedAddress === "Location unavailable") {
      Alert.alert("Address Required", "Please select or confirm your service location on the map.");
      return;
    }

    // 3. Check if phone is verified for this exact number
    if (verifiedPhone !== phoneNorm.clean10) {
      await requestAndSendOTP(phoneNorm);
      return;
    }

    // Already verified for this exact number
    await executeBooking(phoneNorm);
  };

  const handleVerifyOtpSubmit = () => {
    if (!targetPhoneNorm) {
      Alert.alert("Verification Error", "Target phone number is missing. Please try again.");
      setOtpModalVisible(false);
      return;
    }

    const trimmedInput = enteredOtp.trim();
    if (trimmedInput.length !== 4) {
      Alert.alert("Incomplete OTP", "Please enter the complete 4-digit OTP sent to your phone.");
      return;
    }

    if (Date.now() > otpExpiresAt) {
      Alert.alert("OTP Expired", "The OTP code has expired. Please tap 'Resend OTP' to request a new code.");
      return;
    }

    if (trimmedInput !== generatedOtp) {
      Alert.alert("Invalid OTP", "The code you entered is incorrect. Please check and try again.");
      return;
    }

    // OTP Verified successfully!
    const verifiedClean10 = targetPhoneNorm.clean10;
    setVerifiedPhone(verifiedClean10);
    setOtpModalVisible(false);
    setEnteredOtp("");

    void executeBooking(targetPhoneNorm);
  };

  const executeBooking = async (phoneNorm: NormalizedPhone) => {
    if (isSubmittingBooking.current) return;
    isSubmittingBooking.current = true;
    setLoading(true);

    try {
      // Final security guard: ensure verified phone matches booking phone
      if (verifiedPhone !== phoneNorm.clean10) {
        Alert.alert("Verification Required", "Please verify your mobile number via OTP before booking.");
        return;
      }

      const bookingId = "AP4" + Math.random().toString(36).substring(2, 7).toUpperCase();
      const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
      const uid = activeUser?.uid || `guest_${Date.now()}`;
      const custName = activeUser?.displayName || (activeUser?.email ? activeUser.email.split("@")[0] : "Customer");
      const scheduledDateTimeStr = `${bookingDate} at ${bookingTime}`;

      const bookingPayload = {
        id: bookingId,
        bookingId,
        customerId: uid,
        customerName: custName,
        customerPhone: phoneNorm.e164,
        customerEmail: activeUser?.email || "",
        address: serviceAddress.trim(),
        customerLat: addressCoords.latitude,
        customerLng: addressCoords.longitude,
        serviceCategory: category.name,
        serviceId: category.id,
        subServiceId: selectedSub.id,
        subServiceName: selectedSub.name,
        price: finalPrice,
        priceLabel: `₹${finalPrice}`,
        originalPrice: `₹${originalPrice}`,
        otp: otpCode,
        status: "requested",
        vendorId: null,
        vendorName: null,
        vendorPhone: null,
        vendorImage: null,
        scheduledAt: scheduledDateTimeStr,
        bookingDate,
        bookingTime,
        duration: selectedSub.duration || "60 min",
        createdAt: new Date().toISOString(),
      };

      // Write booking to Firestore
      try {
        await setDoc(doc(db, "bookings", bookingId), bookingPayload);
        // Blast loud push alert to all registered vendors
        notifyVendorsBookingPlaced(
          category.name,
          selectedSub.name,
          `₹${finalPrice}`,
          serviceAddress.trim(),
          bookingId
        ).catch((err) => console.warn("Failed to blast vendors push:", err));

        // Immediately trigger Stage 1 notification: Booking Placed Successfully
        await sendBookingPlaced(
          selectedSub.name || category.name,
          bookingId,
          bookingDate,
          bookingTime
        );
      } catch (err) {
        console.warn("Firestore booking write warning:", err);
      }

      // Save to local cache
      try {
        const localKey = `@customer_bookings_${uid}`;
        const prev = await AsyncStorage.getItem(localKey);
        const list = prev ? JSON.parse(prev) : [];
        list.unshift(bookingPayload);
        await AsyncStorage.setItem(localKey, JSON.stringify(list));
      } catch {
        // Ignore local booking cache errors
      }

      // Save newly verified phone to profile
      if (uid && !uid.includes("guest_")) {
        try {
          await setDoc(doc(db, "users", uid), { phone: phoneNorm.e164, mobile: phoneNorm.e164 }, { merge: true });
          const prev = await AsyncStorage.getItem(`@customer_profile_${uid}`);
          const p = prev ? JSON.parse(prev) : {};
          p.phone = phoneNorm.e164;
          await AsyncStorage.setItem(`@customer_profile_${uid}`, JSON.stringify(p));
        } catch {
          // Ignore customer profile background save errors
        }
      }

      // Navigate to confirmation screen
      navigation.navigate("BookingConfirmed", {
        bookingId,
        otp: otpCode,
        categoryId: category.id,
        subServiceId: selectedSub.id,
        scheduledDate: scheduledDateTimeStr,
        booking: bookingPayload,
      } as any);
    } catch (e: any) {
      Alert.alert("Booking Error", e.message || "Failed to confirm booking. Please try again.");
    } finally {
      isSubmittingBooking.current = false;
      setLoading(false);
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: isDark ? themeColors.background : "#F8FAFC" }]}>
      {/* ── Top Header ────────────────────────────────────────────────── */}
      <SafeAreaView
        edges={["top"]}
        style={[styles.headerSafeArea, { backgroundColor: isDark ? themeColors.surface : "#FFFFFF" }]}
      >
        <View style={[styles.headerBar, { backgroundColor: isDark ? themeColors.surface : "#FFFFFF", borderBottomColor: themeColors.cardBorder }]}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={[styles.headerBackBtn, { backgroundColor: isDark ? themeColors.cardAlt : "#F1F5F9" }]}
          >
            <Ionicons name="arrow-back" size={22} color={isDark ? themeColors.text : "#0F172A"} />
          </TouchableOpacity>

          <View style={styles.headerTitleWrap}>
            <Text style={[styles.headerTitleText, { color: isDark ? themeColors.text : "#0F172A" }]}>
              {selectedSub.name}
            </Text>
            <Text style={[styles.headerSubtitleText, { color: themeColors.primary }]}>
              Clean  •  Fresh  •  Hygienic
            </Text>
          </View>

          <View style={styles.headerLeafTag}>
            <Text style={styles.leafTagIcon}>🌿</Text>
            <Text style={[styles.leafTagText, { color: isDark ? themeColors.textSecondary : "#475569" }]}>
              A healthier space{"\n"}for you
            </Text>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── 1. Hero Promo Card ────────────────────────────────────── */}
        <View style={[styles.heroBannerCard, { borderColor: themeColors.cardBorder }]}>
          <LinearGradient
            colors={isDark ? ["#0a2233", "#102331", "#091a24"] : ["#E0F2FE", "#F0FDFA", "#E6FFFA"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroBannerGradient}
          >
            <View style={styles.heroBannerTextCol}>
              <Text style={[styles.heroSmallTag, { color: themeColors.primary }]}>
                PROFESSIONAL {category.name.toUpperCase()} SERVICE
              </Text>
              <Text style={[styles.heroMainHeading, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
                Sparkling {selectedSub.name.split(" ")[0]},{"\n"}Happier Spaces
              </Text>
              <Text style={[styles.heroSubText, { color: isDark ? themeColors.textSecondary : "#64748B" }]}>
                We take care of your space so you can focus on what matters.
              </Text>

              {/* 3 Value Inset Badges */}
              <View style={styles.heroBadgesRow}>
                <View style={[styles.heroBadgeItem, { backgroundColor: isDark ? "rgba(255,255,255,0.07)" : "#FFFFFF", borderColor: themeColors.cardBorder }]}>
                  <Ionicons name="shield-checkmark" size={12} color={themeColors.primary} />
                  <Text style={[styles.heroBadgeText, { color: themeColors.primary }]}>Hygienic</Text>
                </View>
                <View style={[styles.heroBadgeItem, { backgroundColor: isDark ? "rgba(255,255,255,0.07)" : "#FFFFFF", borderColor: themeColors.cardBorder }]}>
                  <Ionicons name="leaf" size={12} color={themeColors.primary} />
                  <Text style={[styles.heroBadgeText, { color: themeColors.primary }]}>Eco-Friendly</Text>
                </View>
                <View style={[styles.heroBadgeItem, { backgroundColor: isDark ? "rgba(255,255,255,0.07)" : "#FFFFFF", borderColor: themeColors.cardBorder }]}>
                  <Ionicons name="star" size={12} color={themeColors.primary} />
                  <Text style={[styles.heroBadgeText, { color: themeColors.primary }]}>Trusted Staff</Text>
                </View>
              </View>
            </View>

            <View style={styles.heroBannerIconCol}>
              <View style={[styles.heroIconBubble, { backgroundColor: isDark ? "rgba(0,198,170,0.15)" : "#CCFBF1" }]}>
                <Ionicons name={category.icon as any || "sparkles"} size={36} color={themeColors.primary} />
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* ── 2. Service Summary Card ───────────────────────────────── */}
        <View style={[styles.serviceSummaryCard, { backgroundColor: isDark ? themeColors.card : "#F0FDFA", borderColor: isDark ? themeColors.cardBorder : "#CCFBF1" }]}>
          <View style={styles.serviceSummaryLeft}>
            <View style={[styles.mintIconBox, { backgroundColor: isDark ? "rgba(0,198,170,0.15)" : "#CCFBF1" }]}>
              <Ionicons name="sparkles" size={24} color={themeColors.primary} />
            </View>
            <View style={styles.serviceSummaryTextCol}>
              <Text style={[styles.serviceSummaryTitle, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>{selectedSub.name}</Text>
              <Text style={[styles.serviceSummaryDesc, { color: isDark ? themeColors.textSecondary : "#64748B" }]} numberOfLines={2}>
                {selectedSub.description}
              </Text>
            </View>
          </View>

          <View style={styles.leafDividerImgWrap}>
            <Text style={{ fontSize: 24 }}>🌿</Text>
          </View>

          <View style={styles.serviceSummaryPriceCol}>
            <Text style={[styles.startsFromSmall, { color: isDark ? themeColors.textMuted : "#94A3B8" }]}>Starts from</Text>
            <View style={styles.priceWithSlashedRow}>
              <Text style={[styles.priceGreenMain, { color: themeColors.primary }]}>₹{basePriceNum}</Text>
              <Text style={[styles.priceSlashedSmall, { color: isDark ? themeColors.textMuted : "#94A3B8" }]}>₹{originalPrice}</Text>
            </View>
            <View style={[styles.durationPill, { backgroundColor: isDark ? themeColors.surface : "#FFFFFF", borderColor: themeColors.cardBorder }]}>
              <Ionicons name="time-outline" size={13} color={isDark ? themeColors.textSecondary : "#475569"} />
              <Text style={[styles.durationPillText, { color: isDark ? themeColors.text : "#0F172A" }]}>{selectedSub.duration}</Text>
            </View>
          </View>
        </View>

        {/* ── 3. Service Address & Map Selector Card ─────────────────── */}
        <View style={[styles.serviceAddressCard, { backgroundColor: isDark ? themeColors.card : "#FFFFFF", borderColor: themeColors.cardBorder }]}>
          <View style={styles.addressCardHeader}>
            <View style={[styles.greenPinCircle, { backgroundColor: isDark ? "rgba(0,198,170,0.15)" : "#CCFBF1" }]}>
              <Ionicons name="location" size={18} color={themeColors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <Text style={[styles.addressCardTitle, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>Service Address</Text>
                <TouchableOpacity
                  onPress={() => fetchCurrentLocation(true)}
                  style={[styles.gpsDetectBtn, { backgroundColor: isDark ? "rgba(0,198,170,0.12)" : "#F0FDFA", borderColor: isDark ? "rgba(0,198,170,0.3)" : "#CCFBF1" }]}
                  disabled={isFetchingLocation}
                  activeOpacity={0.7}
                >
                  {isFetchingLocation ? (
                    <ActivityIndicator size={12} color={themeColors.primary} />
                  ) : (
                    <Ionicons name="locate" size={13} color={themeColors.primary} />
                  )}
                  <Text style={[styles.gpsDetectBtnText, { color: themeColors.primary }]}>
                    {isFetchingLocation ? "Detecting..." : "Current GPS"}
                  </Text>
                </TouchableOpacity>
              </View>
              <Text style={[styles.addressCardSub, { color: isDark ? themeColors.textSecondary : "#64748B" }]}>
                Fetched automatically from your current location
              </Text>
            </View>
          </View>

          {/* Interactive Map Graphic Card */}
          <View style={[styles.mapGraphicCard, { borderColor: themeColors.cardBorder }]}>
            <LinearGradient
              colors={isDark ? ["#0b1e2c", "#0f2330", "#081b22"] : ["#EFF6FF", "#ECFDF5", "#F0FDFA"]}
              style={StyleSheet.absoluteFill}
            />

            {/* Subtle Grid / Street Vector Lines */}
            <View style={styles.vectorMapLines}>
              <View style={[styles.mapRoad1, isDark && { backgroundColor: "rgba(255,255,255,0.1)" }]} />
              <View style={[styles.mapRoad2, isDark && { backgroundColor: "rgba(255,255,255,0.1)" }]} />
              <View style={[styles.mapRoad3, isDark && { backgroundColor: "rgba(255,255,255,0.1)" }]} />
            </View>

            {/* Centered Map Pin */}
            <View style={styles.mapCenterPin}>
              <Ionicons name="location" size={32} color={themeColors.primary} />
            </View>

            {/* Clickable Select on Map Button */}
            <TouchableOpacity
              style={[styles.selectOnMapFloatingBtn, { backgroundColor: isDark ? themeColors.surface : "#FFFFFF", borderColor: themeColors.cardBorder }]}
              onPress={handleOpenMapPicker}
              activeOpacity={0.88}
            >
              <Ionicons name="map-outline" size={16} color={isDark ? themeColors.text : "#0F172A"} style={{ marginRight: 6 }} />
              <Text style={[styles.selectOnMapText, { color: isDark ? themeColors.text : "#0F172A" }]}>Select on Map</Text>
              <Ionicons name="chevron-forward" size={14} color={isDark ? themeColors.text : "#0F172A"} style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          </View>

          {/* Selected Address Displayed Directly Below the Map */}
          <View style={[styles.selectedAddressBelowMap, { backgroundColor: isDark ? themeColors.cardAlt : "#F8FAFC", borderColor: themeColors.cardBorder }]}>
            {isFetchingLocation ? (
              <ActivityIndicator size={16} color={themeColors.primary} style={{ marginTop: 2, marginRight: 2 }} />
            ) : (
              <Ionicons name="navigate-circle-outline" size={18} color={themeColors.primary} style={{ marginTop: 2 }} />
            )}
            <Text style={[styles.selectedAddressBelowText, { color: isDark ? themeColors.text : "#1E293B" }]} numberOfLines={2}>
              {isFetchingLocation ? "Fetching your current location..." : serviceAddress}
            </Text>
            <TouchableOpacity onPress={handleOpenMapPicker}>
              <Text style={[styles.changeAddressLink, { color: themeColors.primary }]}>Change</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── 4. Two Side-by-Side Cards: Contact Number & Schedule Slot ── */}
        <View style={styles.twoColsRow}>
          {/* Card 1: Contact Number */}
          <View style={[styles.contactCard, { backgroundColor: isDark ? themeColors.card : "#F0F9FF", borderColor: isDark ? themeColors.cardBorder : "#E0F2FE" }]}>
            <View style={styles.cardHeaderSmall}>
              <View style={[styles.bluePhoneCircle, isDark && { backgroundColor: "rgba(2,132,199,0.18)" }]}>
                <Ionicons name="call" size={16} color="#0284C7" />
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={[styles.smallCardTitle, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>Contact Number</Text>
                <Text style={[styles.smallCardSub, { color: isDark ? themeColors.textSecondary : "#64748B" }]}>We will contact you</Text>
              </View>
            </View>

            {isEditingPhone ? (
              <TextInput
                value={contactNumber}
                onChangeText={(text) => {
                  setContactNumber(text);
                  if (verifiedPhone !== null) {
                    setVerifiedPhone(null);
                  }
                }}
                onBlur={() => handleSaveContactNumber(contactNumber)}
                onSubmitEditing={() => handleSaveContactNumber(contactNumber)}
                keyboardType="phone-pad"
                placeholder="Enter 10-digit mobile"
                placeholderTextColor={isDark ? themeColors.textMuted : "#94A3B8"}
                style={[styles.phoneInputActive, { backgroundColor: isDark ? themeColors.surface : "#FFFFFF", color: isDark ? themeColors.text : "#0F172A", borderColor: themeColors.primary }]}
                autoFocus
              />
            ) : (
              <TouchableOpacity
                style={[styles.whiteInputPill, { backgroundColor: isDark ? themeColors.surface : "#FFFFFF", borderColor: themeColors.cardBorder }]}
                onPress={() => setIsEditingPhone(true)}
              >
                <Ionicons name="call-outline" size={15} color={isDark ? themeColors.textSecondary : "#0F172A"} style={{ marginRight: 8 }} />
                <Text
                  style={[
                    styles.phoneTextMain,
                    { color: contactNumber ? defaultTextColor : phoneErrorColor },
                  ]}
                  numberOfLines={1}
                >
                  {contactNumber || "Tap to enter phone"}
                </Text>
                {verifiedPhone && contactNumber && normalizeAndValidatePhone(contactNumber).clean10 === verifiedPhone ? (
                  <View style={{ flexDirection: "row", alignItems: "center", marginLeft: "auto", marginRight: 6 }}>
                    <Ionicons name="checkmark-circle" size={15} color="#10B981" />
                    <Text style={{ fontSize: 11, color: "#10B981", fontWeight: "600", marginLeft: 3 }}>Verified</Text>
                  </View>
                ) : null}
                <Ionicons name="pencil" size={14} color={isDark ? themeColors.textMuted : "#64748B"} style={{ marginLeft: verifiedPhone ? 0 : "auto" }} />
              </TouchableOpacity>
            )}
          </View>

          {/* Card 2: Schedule Slot */}
          <View style={[styles.scheduleCard, { backgroundColor: isDark ? themeColors.card : "#FAF5FF", borderColor: isDark ? themeColors.cardBorder : "#F3E8FF" }]}>
            <View style={styles.cardHeaderSmall}>
              <View style={[styles.purpleCalCircle, isDark && { backgroundColor: "rgba(124,58,237,0.18)" }]}>
                <Ionicons name="calendar" size={16} color="#7C3AED" />
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={[styles.smallCardTitle, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>Schedule Slot</Text>
                <Text style={[styles.smallCardSub, { color: isDark ? themeColors.textSecondary : "#64748B" }]}>
                  {quickScheduleSub}
                </Text>
              </View>
            </View>

            {/* Quick 1-tap Day Chips: Today & Tomorrow */}
            <View style={styles.quickDayChipsRow}>
              <TouchableOpacity
                style={[
                  styles.quickDayChip,
                  isTodaySelected
                    ? { backgroundColor: "#7C3AED", borderColor: "#7C3AED" }
                    : { backgroundColor: isDark ? themeColors.surface : "#FFFFFF", borderColor: themeColors.cardBorder },
                ]}
                onPress={handleSelectToday}
                activeOpacity={0.8}
              >
                <Ionicons name="flash" size={11} color={isTodaySelected ? "#FFFFFF" : "#F59E0B"} style={{ marginRight: 3 }} />
                <Text style={[styles.quickDayChipText, { color: isTodaySelected ? "#FFFFFF" : defaultTextColor }]}>
                  Today
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.quickDayChip,
                  isTomorrowSelected
                    ? { backgroundColor: "#7C3AED", borderColor: "#7C3AED" }
                    : { backgroundColor: isDark ? themeColors.surface : "#FFFFFF", borderColor: themeColors.cardBorder },
                ]}
                onPress={handleSelectTomorrow}
                activeOpacity={0.8}
              >
                <Ionicons name="calendar-outline" size={11} color={isTomorrowSelected ? "#FFFFFF" : "#0284C7"} style={{ marginRight: 3 }} />
                <Text style={[styles.quickDayChipText, { color: isTomorrowSelected ? "#FFFFFF" : defaultTextColor }]}>
                  Tomorrow
                </Text>
              </TouchableOpacity>
            </View>

            {/* Date Pill (Opens interactive advance calendar) */}
            <TouchableOpacity
              style={[
                styles.whiteInputPill,
                {
                  marginTop: 6,
                  backgroundColor: isDark ? themeColors.surface : "#FFFFFF",
                  borderColor: isAdvanceSelected ? "#7C3AED" : themeColors.cardBorder,
                },
              ]}
              onPress={() => setDateModalVisible(true)}
            >
              <Ionicons
                name="calendar"
                size={14}
                color={isAdvanceSelected ? "#7C3AED" : defaultSubTextColor}
                style={{ marginRight: 6 }}
              />
              <Text
                style={[
                  styles.schedulePillText,
                  { color: isDark ? themeColors.text : "#0F172A", fontSize: 11 },
                  isAdvanceSelected && { fontWeight: "800", color: "#7C3AED" },
                ]}
                numberOfLines={1}
              >
                {bookingDate}
              </Text>
              <Ionicons name="chevron-forward" size={13} color={isDark ? themeColors.textMuted : "#94A3B8"} style={{ marginLeft: "auto" }} />
            </TouchableOpacity>

            {/* Time Pill (Opens comprehensive any-time slot picker) */}
            <TouchableOpacity
              style={[
                styles.whiteInputPill,
                { marginTop: 6, backgroundColor: isDark ? themeColors.surface : "#FFFFFF", borderColor: themeColors.cardBorder },
              ]}
              onPress={() => {
                setCustomTimeInput(bookingTime.replace(/[AP]M/gi, "").trim());
                setCustomAmPm(bookingTime.toUpperCase().includes("PM") ? "PM" : "AM");
                setTimeModalVisible(true);
              }}
            >
              <Ionicons name="time-outline" size={14} color={isDark ? themeColors.textSecondary : "#64748B"} style={{ marginRight: 6 }} />
              <Text style={[styles.schedulePillText, { color: isDark ? themeColors.text : "#0F172A", fontSize: 11 }]} numberOfLines={1}>
                {bookingTime}
              </Text>
              <Ionicons name="chevron-forward" size={13} color={isDark ? themeColors.textMuted : "#94A3B8"} style={{ marginLeft: "auto" }} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── 5. Have a Coupon Code? Card ─────────────────────────────── */}
        <View style={[styles.couponCard, { backgroundColor: isDark ? themeColors.card : "#FFF7ED", borderColor: isDark ? themeColors.cardBorder : "#FFEDD5" }]}>
          <View style={styles.couponHeaderRow}>
            <View style={[styles.peachGiftCircle, isDark && { backgroundColor: "rgba(234,88,12,0.18)" }]}>
              <Ionicons name="gift" size={16} color="#EA580C" />
            </View>
            <View style={{ marginLeft: 8 }}>
              <Text style={[styles.couponCardTitle, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>Have a Coupon Code?</Text>
              <Text style={[styles.couponCardSub, { color: isDark ? themeColors.textSecondary : "#64748B" }]}>Apply URBAN50 for ₹50 off</Text>
            </View>
          </View>

          <View style={styles.couponInputRow}>
            <TextInput
              value={couponCode}
              onChangeText={setCouponCode}
              placeholder="e.g. URBAN50"
              placeholderTextColor={isDark ? themeColors.textMuted : "#94A3B8"}
              autoCapitalize="characters"
              style={[styles.couponTextInput, { backgroundColor: isDark ? themeColors.surface : "#FFFFFF", color: isDark ? themeColors.text : "#0F172A", borderColor: isDark ? themeColors.cardBorder : "#FED7AA" }]}
            />
            <TouchableOpacity
              style={[styles.couponApplyBtn, couponApplied && { backgroundColor: "#059669" }]}
              onPress={handleApplyCoupon}
              activeOpacity={0.85}
            >
              <Text style={styles.couponApplyBtnText}>{couponApplied ? "APPLIED" : "APPLY"}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ── 6. Bottom Sticky Checkout Bar ────────────────────────────── */}
      <View style={[styles.bottomStickyBar, { backgroundColor: isDark ? themeColors.surface : "#FFFFFF", borderTopColor: themeColors.cardBorder }]}>
        <View style={styles.bottomPriceWrap}>
          <Text style={[styles.totalAmountLabel, { color: isDark ? themeColors.textSecondary : "#64748B" }]}>Total Amount</Text>
          <View style={styles.totalPriceRow}>
            <Text style={[styles.totalPriceGreen, { color: themeColors.primary }]}>₹{finalPrice}</Text>
            <Text style={[styles.totalPriceSlashed, { color: isDark ? themeColors.textMuted : "#94A3B8" }]}>₹{originalPrice}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.confirmBookingMainBtn}
          onPress={handleConfirmBooking}
          disabled={loading || otpLoading}
          activeOpacity={0.88}
        >
          {loading || otpLoading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.confirmBookingMainBtnText}>Confirm Booking</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={{ marginLeft: 8 }} />
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* ── 7. Full-Screen Interactive Google Map Modal ──────────────── */}
      <Modal visible={mapModalVisible} animationType="slide">
        <SafeAreaView style={[styles.mapModalRoot, { backgroundColor: isDark ? themeColors.background : "#FFFFFF" }]} edges={["top", "bottom"]}>
          {/* Modal Header */}
          <View style={[styles.mapModalHeader, { backgroundColor: isDark ? themeColors.surface : "#FFFFFF", borderBottomColor: themeColors.cardBorder }]}>
            <TouchableOpacity
              onPress={() => {
                setMapModalVisible(false);
                setMapSuggestions([]);
              }}
              style={[styles.mapCloseBtn, { backgroundColor: isDark ? themeColors.cardAlt : "#F1F5F9" }]}
            >
              <Ionicons name="close" size={24} color={isDark ? themeColors.text : "#0F172A"} />
            </TouchableOpacity>
            <Text style={[styles.mapModalHeaderTitle, { color: isDark ? themeColors.text : "#0F172A" }]}>
              Select Delivery Doorstep
            </Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Interactive Google Map Container */}
          <View style={styles.mapViewContainer}>
            <MapView
              ref={mapRef}
              style={styles.fullMapView}
              provider={PROVIDER_GOOGLE}
              initialRegion={mapRegion}
              onRegionChangeComplete={handleRegionChangeComplete}
              showsUserLocation={true}
              showsMyLocationButton={false}
            />

            {/* Floating Top Search Bar */}
            <View style={styles.floatingSearchContainer}>
              <View style={[styles.searchBoxCard, { backgroundColor: isDark ? themeColors.surface : "#FFFFFF", borderColor: themeColors.cardBorder }]}>
                <Ionicons name="search" size={19} color={themeColors.primary} style={{ marginRight: 8 }} />
                <TextInput
                  style={[styles.mapSearchInput, { color: isDark ? themeColors.text : "#0F172A" }]}
                  placeholder="Search locality, street, or landmark..."
                  placeholderTextColor="#94A3B8"
                  value={mapSearchQuery}
                  onChangeText={handleMapSearchChange}
                  clearButtonMode="while-editing"
                  autoCorrect={false}
                />
                {isSearchingLocation && (
                  <ActivityIndicator size="small" color={themeColors.primary} style={{ marginLeft: 6 }} />
                )}
                {!isSearchingLocation && mapSearchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => { setMapSearchQuery(""); setMapSuggestions([]); }} style={{ padding: 4 }}>
                    <Ionicons name="close-circle" size={18} color="#94A3B8" />
                  </TouchableOpacity>
                )}
              </View>

              {/* Suggestions Dropdown */}
              {mapSuggestions.length > 0 && (
                <View style={[styles.suggestionsDropdown, { backgroundColor: isDark ? themeColors.surface : "#FFFFFF", borderColor: themeColors.cardBorder }]}>
                  <ScrollView keyboardShouldPersistTaps="handled" nestedScrollEnabled style={{ maxHeight: 220 }}>
                    {mapSuggestions.map((item, idx) => (
                      <TouchableOpacity
                        key={item.placeId ?? `${item.lat}-${item.lng}-${idx}`}
                        style={[styles.suggestionItem, { borderBottomColor: isDark ? "rgba(255,255,255,0.08)" : "#F1F5F9" }]}
                        onPress={() => handleSelectSuggestion(item)}
                        activeOpacity={0.7}
                      >
                        <View style={[styles.suggestionIconWrap, { backgroundColor: isDark ? "rgba(0,188,212,0.15)" : "#F0FDFA" }]}>
                          <Ionicons name="location" size={16} color={themeColors.primary} />
                        </View>
                        <View style={{ flex: 1, marginLeft: 10 }}>
                          <Text style={[styles.suggestionLabelText, { color: isDark ? themeColors.text : "#0F172A" }]} numberOfLines={1}>
                            {item.label}
                          </Text>
                          {Boolean(item.city) && (
                            <Text style={[styles.suggestionSubText, { color: isDark ? "#94A3B8" : "#64748B" }]}>
                              {item.city}{item.state ? `, ${item.state}` : ""}
                            </Text>
                          )}
                        </View>
                        <Ionicons name="arrow-forward" size={14} color="#94A3B8" />
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* Quick GPS Location Chip */}
              <TouchableOpacity
                style={[styles.floatingGpsChip, { backgroundColor: isDark ? themeColors.surface : "#FFFFFF", borderColor: themeColors.cardBorder }]}
                onPress={async () => {
                  const last = await Location.getLastKnownPositionAsync().catch(() => null);
                  const coords = last?.coords || addressCoords;
                  if (coords) {
                    const reg: Region = {
                      latitude: coords.latitude,
                      longitude: coords.longitude,
                      latitudeDelta: 0.005,
                      longitudeDelta: 0.005,
                    };
                    setMapRegion(reg);
                    mapRef.current?.animateToRegion(reg, 600);
                  }
                }}
                activeOpacity={0.85}
              >
                <Ionicons name="locate" size={15} color={themeColors.primary} style={{ marginRight: 6 }} />
                <Text style={[styles.floatingGpsChipText, { color: isDark ? themeColors.text : "#0F172A" }]}>
                  Use My Current GPS Location
                </Text>
              </TouchableOpacity>
            </View>

            {/* Fixed Center Pin */}
            <View style={styles.fixedCenterPinWrap} pointerEvents="none">
              <View style={[styles.pinBubble, { backgroundColor: isDark ? themeColors.surface : "#0F172A" }]}>
                <Text style={styles.pinBubbleText}>Service Location</Text>
              </View>
              <Ionicons name="location" size={42} color={themeColors.primary} style={{ marginTop: -4 }} />
              <View style={styles.pinShadowDot} />
            </View>
          </View>

          {/* Bottom Selected Location Card */}
          <View style={[styles.mapBottomCard, { backgroundColor: isDark ? themeColors.card : "#FFFFFF", borderTopColor: themeColors.cardBorder }]}>
            <View style={styles.mapAddressInfoRow}>
              <View style={[styles.doorstepIconBubble, { backgroundColor: isDark ? "rgba(0,188,212,0.15)" : "#E6FFFA" }]}>
                <Ionicons name="home" size={20} color={themeColors.primary} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.mapSelectedTitle, { color: isDark ? themeColors.textSecondary : "#64748B" }]}>
                  SELECTED DOORSTEP
                </Text>
                {isGeocodingAddress ? (
                  <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
                    <ActivityIndicator size="small" color={themeColors.primary} style={{ marginRight: 6 }} />
                    <Text style={{ fontSize: 13, color: isDark ? "#94A3B8" : "#64748B", fontStyle: "italic" }}>
                      Pinpointing address...
                    </Text>
                  </View>
                ) : (
                  <Text style={[styles.mapSelectedAddress, { color: isDark ? themeColors.text : "#0F172A" }]} numberOfLines={2}>
                    {draggedAddress || "Position pin at your doorstep"}
                  </Text>
                )}
              </View>
            </View>

            <TouchableOpacity
              style={[styles.useThisLocationBtn, { backgroundColor: themeColors.primary }]}
              onPress={handleConfirmMapLocation}
              activeOpacity={0.85}
            >
              <Text style={styles.useThisLocationText}>Confirm Location</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* ── 8. Advance Calendar & Date Selector Modal ──────────────────── */}
      <Modal visible={dateModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlayDark}>
          <View style={[styles.dateModalSheet, { backgroundColor: isDark ? themeColors.card : "#FFFFFF", borderColor: themeColors.cardBorder }]}>
            <View style={styles.modalHeaderRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.modalTitleText, { color: isDark ? themeColors.text : "#0F172A" }]}>
                  Select Arrival Date
                </Text>
                <Text style={{ fontSize: 11.5, color: isDark ? themeColors.textSecondary : "#64748B", marginTop: 2 }}>
                  Book for today, tomorrow, or any date in advance
                </Text>
              </View>
              <TouchableOpacity onPress={() => setDateModalVisible(false)} style={styles.modalCloseIconBtn}>
                <Ionicons name="close" size={22} color={isDark ? themeColors.textSecondary : "#64748B"} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: Dimensions.get("window").height * 0.72 }} showsVerticalScrollIndicator={false}>
              {/* Quick Choice Buttons: Today & Tomorrow (NO Saturday) */}
              <View style={styles.modalQuickRow}>
                <TouchableOpacity
                  style={[
                    styles.modalQuickBtn,
                    isTodaySelected
                      ? { backgroundColor: themeColors.primary, borderColor: themeColors.primary }
                      : { backgroundColor: isDark ? themeColors.surface : "#F8FAFC", borderColor: themeColors.cardBorder },
                  ]}
                  onPress={handleSelectToday}
                  activeOpacity={0.8}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Ionicons name="flash" size={15} color={isTodaySelected ? "#FFFFFF" : "#F59E0B"} style={{ marginRight: 6 }} />
                    <Text style={[styles.modalQuickBtnTitle, isTodaySelected ? { color: "#FFFFFF" } : { color: isDark ? themeColors.text : "#0F172A" }]}>
                      Today
                    </Text>
                  </View>
                  <Text style={[styles.modalQuickBtnSub, isTodaySelected ? { color: "rgba(255,255,255,0.85)" } : { color: isDark ? themeColors.textSecondary : "#64748B" }]}>
                    {formatShortDate(today)}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.modalQuickBtn,
                    isTomorrowSelected
                      ? { backgroundColor: themeColors.primary, borderColor: themeColors.primary }
                      : { backgroundColor: isDark ? themeColors.surface : "#F8FAFC", borderColor: themeColors.cardBorder },
                  ]}
                  onPress={handleSelectTomorrow}
                  activeOpacity={0.8}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Ionicons name="calendar-outline" size={15} color={isTomorrowSelected ? "#FFFFFF" : "#0284C7"} style={{ marginRight: 6 }} />
                    <Text style={[styles.modalQuickBtnTitle, isTomorrowSelected ? { color: "#FFFFFF" } : { color: isDark ? themeColors.text : "#0F172A" }]}>
                      Tomorrow
                    </Text>
                  </View>
                  <Text style={[styles.modalQuickBtnSub, isTomorrowSelected ? { color: "rgba(255,255,255,0.85)" } : { color: isDark ? themeColors.textSecondary : "#64748B" }]}>
                    {formatShortDate(tomorrowObj)}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Advance Booking Month Navigation Header */}
              <View style={styles.calendarNavHeader}>
                <TouchableOpacity
                  style={[styles.calMonthArrowBtn, isPrevMonthDisabled && { opacity: 0.25 }]}
                  onPress={handlePrevMonth}
                  disabled={isPrevMonthDisabled}
                >
                  <Ionicons name="chevron-back" size={18} color={isDark ? themeColors.text : "#0F172A"} />
                </TouchableOpacity>

                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Ionicons name="calendar" size={16} color={themeColors.primary} />
                  <Text style={[styles.calMonthTitleText, { color: isDark ? themeColors.text : "#0F172A" }]}>
                    {MONTH_NAMES[calendarMonth]} {calendarYear}
                  </Text>
                </View>

                <TouchableOpacity
                  style={[styles.calMonthArrowBtn, isNextMonthDisabled && { opacity: 0.25 }]}
                  onPress={handleNextMonth}
                  disabled={isNextMonthDisabled}
                >
                  <Ionicons name="chevron-forward" size={18} color={isDark ? themeColors.text : "#0F172A"} />
                </TouchableOpacity>
              </View>

              {/* Days of Week Row */}
              <View style={styles.calendarWeekdaysRow}>
                {WEEKDAY_NAMES.map((w, idx) => (
                  <Text
                    key={idx}
                    style={[
                      styles.calendarWeekdayText,
                      { color: isDark ? themeColors.textSecondary : "#94A3B8" },
                      (idx === 0 || idx === 6) && { color: "#EF4444" },
                    ]}
                  >
                    {w}
                  </Text>
                ))}
              </View>

              {/* Calendar Days 7-Column Grid */}
              <View style={styles.calendarGrid}>
                {EMPTY_CALENDAR_PAD_KEYS.slice(0, getFirstDayOfMonth(calendarYear, calendarMonth)).map((padKey) => (
                  <View key={padKey} style={styles.calendarDayCell} />
                ))}

                {Array.from({ length: getDaysInMonth(calendarYear, calendarMonth) }).map((_, i) => {
                  const dayNum = i + 1;
                  const cellDate = new Date(calendarYear, calendarMonth, dayNum);
                  const isPast = isDateInPast(cellDate);
                  const isCellToday = isSameDay(cellDate, today);
                  const isCellSelected = isSameDay(cellDate, selectedDateObj);

                  return (
                    <TouchableOpacity
                      key={`day-${dayNum}`}
                      style={[
                        styles.calendarDayCell,
                        isCellSelected && { backgroundColor: themeColors.primary, borderRadius: 20 },
                        isCellToday && !isCellSelected && {
                          borderWidth: 1.5,
                          borderColor: themeColors.primary,
                          borderRadius: 20,
                        },
                        isPast && { opacity: 0.28 },
                      ]}
                      disabled={isPast}
                      onPress={() => handleSelectCalendarDay(dayNum)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.calendarDayText,
                          { color: isDark ? themeColors.text : "#0F172A" },
                          isCellSelected && { color: "#FFFFFF", fontWeight: "900" },
                          isCellToday && !isCellSelected && { color: themeColors.primary, fontWeight: "900" },
                          isPast && { color: isDark ? "#64748B" : "#94A3B8" },
                        ]}
                      >
                        {dayNum}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Preferred Arrival Time Section */}
              <View style={{ marginTop: 14 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <Text style={[styles.modalSectionLabel, { color: isDark ? themeColors.textSecondary : "#64748B", marginBottom: 0 }]}>
                    Preferred Arrival Time
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      setDateModalVisible(false);
                      setCustomTimeInput(bookingTime.replace(/[AP]M/gi, "").trim());
                      setCustomAmPm(bookingTime.toUpperCase().includes("PM") ? "PM" : "AM");
                      setTimeModalVisible(true);
                    }}
                  >
                    <Text style={{ fontSize: 12, fontWeight: "800", color: themeColors.primary }}>More Times & Custom ›</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 2 }}>
                  {POPULAR_TIME_SLOTS.map((slot) => {
                    const isSelected = bookingTime === slot;
                    return (
                      <TouchableOpacity
                        key={slot}
                        style={[
                          styles.quickTimeSlotPill,
                          isSelected
                            ? { backgroundColor: themeColors.primary, borderColor: themeColors.primary }
                            : { backgroundColor: isDark ? themeColors.surface : "#F1F5F9", borderColor: themeColors.cardBorder },
                        ]}
                        onPress={() => setBookingTime(slot)}
                      >
                        <Ionicons
                          name="time-outline"
                          size={13}
                          color={isSelected ? "#FFFFFF" : defaultSubTextColor}
                          style={{ marginRight: 4 }}
                        />
                        <Text
                          style={[
                            styles.quickTimeSlotPillText,
                            { color: isSelected ? "#FFFFFF" : defaultTextColor },
                            isSelected && { fontWeight: "800" },
                          ]}
                        >
                          {slot}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              {/* Schedule Summary Banner */}
              <View
                style={[
                  styles.scheduleSummaryBanner,
                  {
                    backgroundColor: isDark ? "rgba(15,118,110,0.15)" : "#F0FDFA",
                    borderColor: isDark ? "rgba(15,118,110,0.3)" : "#CCFBF1",
                  },
                ]}
              >
                <Ionicons name="calendar-outline" size={20} color={themeColors.primary} style={{ marginRight: 10 }} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.scheduleSummaryTitle, { color: isDark ? themeColors.textSecondary : "#0F766E" }]}>
                    {arrivalScheduleLabel}
                  </Text>
                  <Text style={[styles.scheduleSummaryVal, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
                    {bookingDate} • {bookingTime}
                  </Text>
                </View>
              </View>

              {/* Confirm Schedule Button */}
              <TouchableOpacity
                style={[styles.confirmScheduleBtn, { backgroundColor: themeColors.primary }]}
                onPress={() => setDateModalVisible(false)}
                activeOpacity={0.88}
              >
                <Text style={styles.confirmScheduleBtnText}>Confirm Date & Time</Text>
                <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" style={{ marginLeft: 8 }} />
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── 9. Flexible Any-Time Slot Selector Modal ──────────────────── */}
      <Modal visible={timeModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlayDark}>
          <View style={[styles.timeModalSheet, { backgroundColor: isDark ? themeColors.card : "#FFFFFF", borderColor: themeColors.cardBorder }]}>
            <View style={styles.modalHeaderRow}>
              <Text style={[styles.modalTitleText, { color: isDark ? themeColors.text : "#0F172A" }]}>
                Select Preferred Time
              </Text>
              <TouchableOpacity onPress={() => setTimeModalVisible(false)} style={styles.modalCloseIconBtn}>
                <Ionicons name="close" size={22} color={isDark ? themeColors.textSecondary : "#64748B"} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalSectionLabel, { color: isDark ? themeColors.textSecondary : "#64748B" }]}>
              Enter Any Custom Time (e.g. 07:15, 11:45, 04:20)
            </Text>

            <View style={styles.customTimeRow}>
              <TextInput
                value={customTimeInput}
                onChangeText={setCustomTimeInput}
                placeholder="10:00"
                placeholderTextColor={isDark ? themeColors.textMuted : "#94A3B8"}
                style={[
                  styles.customTimeTextInput,
                  {
                    backgroundColor: isDark ? themeColors.surface : "#F1F5F9",
                    color: isDark ? themeColors.text : "#0F172A",
                    borderColor: themeColors.cardBorder,
                  },
                ]}
              />

              <View style={styles.amPmToggleRow}>
                <TouchableOpacity
                  style={[
                    styles.amPmBtn,
                    customAmPm === "AM" && { backgroundColor: themeColors.primary },
                  ]}
                  onPress={() => setCustomAmPm("AM")}
                >
                  <Text style={[styles.amPmBtnText, customAmPm === "AM" && { color: "#FFFFFF" }]}>AM</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.amPmBtn,
                    customAmPm === "PM" && { backgroundColor: themeColors.primary },
                  ]}
                  onPress={() => setCustomAmPm("PM")}
                >
                  <Text style={[styles.amPmBtnText, customAmPm === "PM" && { color: "#FFFFFF" }]}>PM</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.setCustomTimeBtn, { backgroundColor: themeColors.primary }]}
                onPress={() => {
                  const cleaned = customTimeInput.trim();
                  if (!cleaned) {
                    Alert.alert("Time", "Please enter a preferred time like 10:30.");
                    return;
                  }
                  const formatted = `${cleaned} ${customAmPm}`;
                  setBookingTime(formatted);
                  setTimeModalVisible(false);
                }}
              >
                <Text style={styles.setCustomTimeBtnText}>Set Time</Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalSectionLabel, { color: isDark ? themeColors.textSecondary : "#64748B", marginTop: 14 }]}>
              Or Choose Any Slot from 6:00 AM to 10:00 PM:
            </Text>

            <ScrollView style={{ maxHeight: 220 }} showsVerticalScrollIndicator={false}>
              <View style={styles.timeChipsGrid}>
                {ALL_TIME_SLOTS.map((t, idx) => {
                  const isSelected = bookingTime === t;
                  return (
                    <TouchableOpacity
                      key={t}
                      style={[
                        styles.timeChip,
                        {
                          backgroundColor: isSelected ? timeChipSelectedBg : timeChipUnselectedBg,
                          borderColor: isSelected ? themeColors.primary : themeColors.cardBorder,
                        },
                      ]}
                      onPress={() => {
                        setBookingTime(t);
                        setTimeModalVisible(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.timeChipText,
                          {
                            color: isSelected ? themeColors.primary : defaultTextColor,
                            fontWeight: isSelected ? "800" : "600",
                          },
                        ]}
                      >
                        {t}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── 10. OTP Verification Modal ───────────────────────────────── */}
      <Modal visible={otpModalVisible} transparent animationType="fade">
        <View style={styles.otpModalOverlay}>
          <View style={[styles.otpModalContent, { backgroundColor: isDark ? themeColors.card : "#FFFFFF", borderColor: themeColors.cardBorder }]}>
            <Text style={[styles.otpModalTitle, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>Verify Phone Number</Text>
            <Text style={[styles.otpModalDesc, { color: isDark ? themeColors.textSecondary : "#64748B" }]}>
              Enter the 4-digit OTP sent to {targetPhoneNorm?.displayMasked || contactNumber}
            </Text>

            {isTestModeOtp ? (
              <View style={{ backgroundColor: "#FEF3C7", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, marginVertical: 8, borderWidth: 1, borderColor: "#FCD34D" }}>
                <Text style={{ fontSize: 12, color: "#92400E", textAlign: "center", fontWeight: "600" }}>
                  🧪 Test Environment Active • Simulated OTP: {generatedOtp}
                </Text>
              </View>
            ) : null}

            <TextInput
              style={[
                styles.otpInput,
                {
                  backgroundColor: isDark ? themeColors.surface : "#F1F5F9",
                  color: isDark ? themeColors.text : "#0F172A",
                  borderColor: themeColors.cardBorder,
                },
              ]}
              value={enteredOtp}
              onChangeText={setEnteredOtp}
              keyboardType="number-pad"
              maxLength={4}
              placeholder="0000"
              placeholderTextColor={isDark ? themeColors.textMuted : "#94A3B8"}
              textAlign="center"
              autoFocus
            />

            {/* Resend OTP button with cooldown */}
            <TouchableOpacity
              disabled={resendCooldown > 0 || otpLoading}
              onPress={handleResendOTP}
              style={{ marginVertical: 10, alignItems: "center" }}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "600",
                  color: resendCooldown > 0 || otpLoading ? (isDark ? "#64748B" : "#94A3B8") : themeColors.primary,
                }}
              >
                {otpLoading
                  ? "Sending OTP..."
                  : resendCooldown > 0
                  ? `Resend OTP in ${resendCooldown}s`
                  : "Didn't receive SMS? Resend OTP"}
              </Text>
            </TouchableOpacity>

            <View style={styles.otpModalButtons}>
              <TouchableOpacity
                style={[styles.otpModalCancel, { backgroundColor: isDark ? themeColors.surface : "#F1F5F9" }]}
                onPress={() => {
                  setOtpModalVisible(false);
                  setEnteredOtp("");
                }}
              >
                <Text style={[styles.otpModalCancelText, { color: isDark ? themeColors.textSecondary : "#475569" }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.otpModalConfirm, { backgroundColor: themeColors.primary }]}
                onPress={handleVerifyOtpSubmit}
              >
                <Text style={styles.otpModalConfirmText}>Verify & Book</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  headerSafeArea: {
    backgroundColor: "#FFFFFF",
  },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 4 : 8,
    paddingBottom: 10,
    backgroundColor: "#FFFFFF",
  },
  headerBackBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitleWrap: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitleText: {
    fontSize: 20,
    fontWeight: "900",
    color: "#0F172A",
  },
  headerSubtitleText: {
    fontSize: 12,
    color: "#0D9488",
    fontWeight: "600",
    marginTop: 1,
  },
  headerLeafTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  leafTagIcon: {
    fontSize: 14,
  },
  leafTagText: {
    fontSize: 10,
    color: "#475569",
    fontWeight: "600",
    lineHeight: 12,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },

  // 1. Hero Promo Banner
  heroBannerCard: {
    width: "100%",
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  heroBannerGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  heroBannerTextCol: {
    flex: 1,
    paddingRight: 8,
  },
  heroSmallTag: {
    fontSize: 9.5,
    fontWeight: "800",
    color: "#0D9488",
    letterSpacing: 0.8,
    marginBottom: 3,
  },
  heroMainHeading: {
    fontSize: 17,
    fontWeight: "900",
    color: "#0F172A",
    lineHeight: 22,
    marginBottom: 4,
  },
  heroSubText: {
    fontSize: 11,
    color: "#64748B",
    lineHeight: 15,
    marginBottom: 10,
  },
  heroBadgesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  heroBadgeItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#CCFBF1",
  },
  heroBadgeText: {
    fontSize: 9.5,
    fontWeight: "700",
    color: "#0F766E",
  },
  heroBannerIconCol: {
    justifyContent: "center",
    alignItems: "center",
  },
  heroIconBubble: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#CCFBF1",
    justifyContent: "center",
    alignItems: "center",
  },

  // 2. Service Summary Card
  serviceSummaryCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDFA",
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: "#CCFBF1",
    marginBottom: 12,
  },
  serviceSummaryLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  mintIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#CCFBF1",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  serviceSummaryTextCol: {
    flex: 1,
    paddingRight: 4,
  },
  serviceSummaryTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 2,
  },
  serviceSummaryDesc: {
    fontSize: 11,
    color: "#64748B",
    lineHeight: 15,
  },
  leafDividerImgWrap: {
    marginHorizontal: 4,
  },
  serviceSummaryPriceCol: {
    alignItems: "flex-end",
  },
  startsFromSmall: {
    fontSize: 10,
    color: "#94A3B8",
    fontWeight: "600",
  },
  priceWithSlashedRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
    marginVertical: 1,
  },
  priceGreenMain: {
    fontSize: 18,
    fontWeight: "900",
    color: "#0F766E",
  },
  priceSlashedSmall: {
    fontSize: 12,
    color: "#94A3B8",
    textDecorationLine: "line-through",
  },
  durationPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  durationPillText: {
    fontSize: 10.5,
    fontWeight: "700",
    color: "#0F172A",
  },

  // 3. Service Address Card
  serviceAddressCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    marginBottom: 12,
    elevation: 1,
  },
  addressCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  greenPinCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#CCFBF1",
    justifyContent: "center",
    alignItems: "center",
  },
  addressCardTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
  },
  addressCardSub: {
    fontSize: 11.5,
    color: "#64748B",
    marginTop: 1,
  },
  gpsDetectBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F0FDFA",
    borderWidth: 1,
    borderColor: "#CCFBF1",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  gpsDetectBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#0D9488",
  },
  mapGraphicCard: {
    width: "100%",
    height: 125,
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  vectorMapLines: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.35,
  },
  mapRoad1: {
    position: "absolute",
    top: 30,
    left: -20,
    right: -20,
    height: 12,
    backgroundColor: "#CBD5E1",
    transform: [{ rotate: "-15deg" }],
  },
  mapRoad2: {
    position: "absolute",
    bottom: 25,
    left: -20,
    right: -20,
    height: 10,
    backgroundColor: "#CBD5E1",
    transform: [{ rotate: "10deg" }],
  },
  mapRoad3: {
    position: "absolute",
    left: "40%",
    top: -20,
    bottom: -20,
    width: 10,
    backgroundColor: "#CBD5E1",
  },
  mapCenterPin: {
    position: "absolute",
    top: 20,
    alignSelf: "center",
  },
  selectOnMapFloatingBtn: {
    position: "absolute",
    bottom: 12,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  selectOnMapText: {
    fontSize: 12.5,
    fontWeight: "800",
    color: "#0F172A",
  },
  selectedAddressBelowMap: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 10,
    marginTop: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  selectedAddressBelowText: {
    flex: 1,
    fontSize: 12,
    color: "#1E293B",
    fontWeight: "600",
    lineHeight: 17,
  },
  changeAddressLink: {
    fontSize: 12,
    fontWeight: "800",
    color: "#0D9488",
    marginLeft: 4,
  },

  // 4. Two Column Cards
  twoColsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },
  contactCard: {
    flex: 1,
    backgroundColor: "#F0F9FF",
    borderRadius: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E0F2FE",
  },
  scheduleCard: {
    flex: 1,
    backgroundColor: "#FAF5FF",
    borderRadius: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: "#F3E8FF",
  },
  cardHeaderSmall: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  bluePhoneCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E0F2FE",
    justifyContent: "center",
    alignItems: "center",
  },
  purpleCalCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F3E8FF",
    justifyContent: "center",
    alignItems: "center",
  },
  smallCardTitle: {
    fontSize: 12.5,
    fontWeight: "800",
    color: "#0F172A",
  },
  smallCardSub: {
    fontSize: 10,
    color: "#64748B",
  },
  whiteInputPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    height: 38,
    borderRadius: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  phoneTextMain: {
    fontSize: 12.5,
    fontWeight: "800",
    color: "#0F172A",
    flex: 1,
  },
  phoneInputActive: {
    backgroundColor: "#FFFFFF",
    height: 38,
    borderRadius: 12,
    paddingHorizontal: 10,
    fontSize: 12.5,
    fontWeight: "800",
    color: "#0F172A",
    borderWidth: 1.5,
    borderColor: "#0284C7",
  },
  schedulePillText: {
    fontSize: 11.5,
    fontWeight: "700",
    color: "#0F172A",
    flex: 1,
  },

  // 5. Coupon Card
  couponCard: {
    backgroundColor: "#FFF7ED",
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: "#FFEDD5",
    marginBottom: 12,
  },
  couponHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  peachGiftCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#FFEDD5",
    justifyContent: "center",
    alignItems: "center",
  },
  couponCardTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0F172A",
  },
  couponCardSub: {
    fontSize: 10.5,
    color: "#64748B",
  },
  couponInputRow: {
    flexDirection: "row",
    gap: 8,
  },
  couponTextInput: {
    flex: 1,
    height: 42,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FED7AA",
    paddingHorizontal: 12,
    fontSize: 13,
    fontWeight: "800",
    color: "#0F172A",
  },
  couponApplyBtn: {
    backgroundColor: "#FDBA74",
    paddingHorizontal: 18,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  couponApplyBtnText: {
    fontSize: 12,
    fontWeight: "900",
    color: "#FFFFFF",
  },

  // 6. Bottom Checkout Bar
  bottomStickyBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 34 : 16,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  bottomPriceWrap: {
    flex: 1,
  },
  totalAmountLabel: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "600",
  },
  totalPriceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
  },
  totalPriceGreen: {
    fontSize: 22,
    fontWeight: "900",
    color: "#0F766E",
  },
  totalPriceSlashed: {
    fontSize: 13,
    color: "#94A3B8",
    textDecorationLine: "line-through",
  },
  confirmBookingMainBtn: {
    backgroundColor: "#0F766E",
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: 24,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#0F766E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmBookingMainBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },

  // 7. Full Map Modal
  mapModalRoot: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  mapModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  mapCloseBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  mapModalHeaderTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },
  mapViewContainer: {
    flex: 1,
    position: "relative",
  },
  fullMapView: {
    width: "100%",
    height: "100%",
  },
  fixedCenterPinWrap: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -48,
    marginTop: -54,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  pinBubble: {
    backgroundColor: "#0F172A",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pinBubbleText: {
    color: "#FFFFFF",
    fontSize: 10.5,
    fontWeight: "700",
  },
  pinShadowDot: {
    width: 10,
    height: 4,
    borderRadius: 5,
    backgroundColor: "rgba(0,0,0,0.3)",
    marginTop: -2,
  },
  floatingSearchContainer: {
    position: "absolute",
    top: 14,
    left: 14,
    right: 14,
    zIndex: 30,
  },
  searchBoxCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 12 : 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
  },
  mapSearchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
    padding: 0,
  },
  suggestionsDropdown: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    marginTop: 6,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 8,
    overflow: "hidden",
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  suggestionIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F0FDFA",
    alignItems: "center",
    justifyContent: "center",
  },
  suggestionLabelText: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#0F172A",
  },
  suggestionSubText: {
    fontSize: 11.5,
    fontWeight: "500",
    color: "#64748B",
    marginTop: 1,
  },
  floatingGpsChip: {
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 4,
  },
  floatingGpsChipText: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#0F172A",
  },
  doorstepIconBubble: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E6FFFA",
    alignItems: "center",
    justifyContent: "center",
  },
  mapBottomCard: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
  },
  mapAddressInfoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  mapSelectedTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748B",
    textTransform: "uppercase",
  },
  mapSelectedAddress: {
    fontSize: 14.5,
    fontWeight: "800",
    color: "#0F172A",
    marginTop: 2,
    lineHeight: 20,
  },
  useThisLocationBtn: {
    backgroundColor: "#0F766E",
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0F766E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  useThisLocationText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },
  otpModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  otpModalContent: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
  },
  otpModalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0F172A",
    marginBottom: 8,
  },
  otpModalDesc: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 20,
  },
  otpInput: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    width: "100%",
    padding: 12,
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
    letterSpacing: 4,
  },
  otpModalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  otpModalCancel: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
  },
  otpModalCancelText: {
    color: "#475569",
    fontWeight: "600",
  },
  otpModalConfirm: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#0F766E",
    alignItems: "center",
  },
  otpModalConfirmText: {
    color: "#fff",
    fontWeight: "bold",
  },

  // Date & Time Modals
  modalOverlayDark: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "flex-end",
  },
  dateModalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    padding: 20,
    paddingBottom: Platform.OS === "ios" ? 36 : 24,
  },
  timeModalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    padding: 20,
    paddingBottom: Platform.OS === "ios" ? 36 : 24,
  },
  modalHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  modalTitleText: {
    fontSize: 17,
    fontWeight: "900",
  },
  modalCloseIconBtn: {
    padding: 4,
  },
  modalSectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 10,
  },
  // Quick day chips on Card 2
  quickDayChipsRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 2,
  },
  quickDayChip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 30,
    borderRadius: 10,
    borderWidth: 1,
  },
  quickDayChipText: {
    fontSize: 10.5,
    fontWeight: "700",
  },

  // Advance Calendar Modal Styles
  modalQuickRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  modalQuickBtn: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    justifyContent: "space-between",
  },
  modalQuickBtnTitle: {
    fontSize: 14,
    fontWeight: "800",
  },
  modalQuickBtnSub: {
    fontSize: 11.5,
    fontWeight: "600",
    marginTop: 4,
  },
  calendarNavHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    marginBottom: 8,
  },
  calMonthArrowBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.05)",
    justifyContent: "center",
    alignItems: "center",
  },
  calMonthTitleText: {
    fontSize: 15,
    fontWeight: "800",
  },
  calendarWeekdaysRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 6,
    paddingHorizontal: 2,
  },
  calendarWeekdayText: {
    width: "14.28%",
    textAlign: "center",
    fontSize: 11.5,
    fontWeight: "700",
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
  },
  calendarDayCell: {
    width: "14.28%",
    height: 38,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 2,
  },
  calendarDayText: {
    fontSize: 13.5,
    fontWeight: "600",
  },
  quickTimeSlotPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  quickTimeSlotPillText: {
    fontSize: 12,
    fontWeight: "600",
  },
  scheduleSummaryBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 14,
    marginBottom: 14,
  },
  scheduleSummaryTitle: {
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  scheduleSummaryVal: {
    fontSize: 13.5,
    fontWeight: "800",
    marginTop: 2,
  },
  confirmScheduleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 16,
    marginBottom: 10,
    shadowColor: "#0F766E",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  confirmScheduleBtnText: {
    color: "#FFFFFF",
    fontSize: 14.5,
    fontWeight: "900",
  },
  dateItemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
  },
  dateItemText: {
    fontSize: 14,
  },
  customTimeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  customTimeTextInput: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 16,
    fontWeight: "800",
  },
  amPmToggleRow: {
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.06)",
    borderRadius: 12,
    padding: 3,
  },
  amPmBtn: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 9,
  },
  amPmBtnText: {
    fontSize: 12.5,
    fontWeight: "800",
    color: "#64748B",
  },
  setCustomTimeBtn: {
    paddingHorizontal: 16,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  setCustomTimeBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },
  timeChipsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingBottom: 10,
  },
  timeChip: {
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1,
  },
  timeChipText: {
    fontSize: 12.5,
  },
});
