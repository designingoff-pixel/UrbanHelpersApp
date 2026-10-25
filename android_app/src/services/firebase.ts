import { getApp, getApps, initializeApp } from "firebase/app";
import { Auth, getAuth, initializeAuth } from "firebase/auth";
// tsc's "node" module resolution always picks firebase/auth's browser typings, which
// don't list getReactNativePersistence — Metro resolves the real RN implementation
// fine at runtime (firebase/auth has a "react-native" package.json condition), this
// gap is types-only.
// @ts-expect-error - see above
import { getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "AIzaSyDhkD-wS-wCc2ZlMbHSNTEp3MFxSrLIUQY",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "urban-helpers-admin.firebaseapp.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "urban-helpers-admin",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "urban-helpers-admin.firebasestorage.app",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "843343743619",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "1:843343743619:web:a0c09ea15fa85780d6a9b6",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// initializeAuth throws if it's already been called on this app (e.g. Fast Refresh
// re-running this module) — fall back to the existing instance in that case.
let auth: Auth;
try {
  auth = initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
} catch {
  auth = getAuth(app);
}

export { auth };
export const db = getFirestore(app);
export const storage = getStorage(app);

export const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
export const GOOGLE_ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;
