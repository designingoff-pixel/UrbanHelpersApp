import { getApp, getApps, initializeApp } from "firebase/app";
import { Auth, getAuth, initializeAuth } from "firebase/auth";
// tsc's "node" module resolution always picks firebase/auth's browser typings, which
// don't list getReactNativePersistence — Metro resolves the real RN implementation
// fine at runtime (firebase/auth has a "react-native" package.json condition), this
// gap is types-only.
// @ts-expect-error - see above
import { getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "AIzaSyDhkD-wS-wCc2ZlMbHSNTEp3MFxSrLIUQY",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "urban-helpers-admin.firebaseapp.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "urban-helpers-admin",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "urban-helpers-admin.firebasestorage.app",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "843343743619",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "1:843343743619:web:a0c09ea15fa85780d6a9b6",
};

let app: any;
try {
  app = getApps().length ? getApp() : initializeApp(firebaseConfig);
} catch (e) {
  console.warn("[Firebase] Init error:", e);
}

// initializeAuth throws if it's already been called on this app (e.g. Fast Refresh
// re-running this module) — fall back to the existing instance in that case.
let auth: Auth;
try {
  auth = initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
} catch {
  try {
    auth = getAuth(app);
  } catch (e) {
    console.warn("[Firebase] Auth error:", e);
  }
}

let db: any;
try {
  db = getFirestore(app);
} catch (e) {
  console.warn("[Firebase] Firestore error:", e);
}

export { auth, db };

export const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || "843343743619-q4jpmh7eouc3kom1kias1hnh1ps4qom8.apps.googleusercontent.com";
export const GOOGLE_ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || "843343743619-u5nmtb1nhbmd6rhoptm6406lisjhna60.apps.googleusercontent.com";
