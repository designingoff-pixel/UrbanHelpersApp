// ─────────────────────────────────────────────────────────────────────────────
// Urban Captain Vendor App — Firebase
// Uses initializeAuth with AsyncStorage persistence so vendor sessions survive
// app restarts. The vendor won't be pushed to login every time they reopen.
// ─────────────────────────────────────────────────────────────────────────────

import { getApp, getApps, initializeApp } from "firebase/app";
import { initializeAuth, getAuth, Auth } from "firebase/auth";
// @ts-expect-error - React Native persistence types
import { getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey:            "AIzaSyDhkD-wS-wCc2ZlMbHSNTEp3MFxSrLIUQY",
  authDomain:        "urban-helpers-admin.firebaseapp.com",
  projectId:         "urban-helpers-admin",
  storageBucket:     "urban-helpers-admin.firebasestorage.app",
  messagingSenderId: "843343743619",
  appId:             "1:843343743619:web:a0c09ea15fa85780d6a9b6",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Use initializeAuth with AsyncStorage persistence, with robust fallback
let _auth: Auth;
try {
  _auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (_) {
  try {
    _auth = getAuth(app);
  } catch (e) {
    console.warn("[Firebase] Auth fallback init:", e);
    _auth = {} as any;
  }
}

export const auth    = _auth;
export const db      = getFirestore(app);
export const storage = getStorage(app);

