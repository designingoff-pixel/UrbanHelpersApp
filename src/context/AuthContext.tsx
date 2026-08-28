import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import * as WebBrowser from "expo-web-browser";
import { registerForPushNotifications } from "@/services/notificationService";
import * as Google from "expo-auth-session/providers/google";
import { GoogleAuthProvider, onAuthStateChanged, signInWithCredential, signOut as firebaseSignOut, User } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db, GOOGLE_ANDROID_CLIENT_ID, GOOGLE_WEB_CLIENT_ID } from "@/services/firebase";

WebBrowser.maybeCompleteAuthSession();

type AuthContextValue = {
  user: User | null;
  initializing: boolean;
  signingIn: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [signingIn, setSigningIn] = useState(false);

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    androidClientId: GOOGLE_ANDROID_CLIENT_ID,
  });

  useEffect(() => {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setInitializing(false);

      if (firebaseUser) {
        // Automatically request push token and save to user profile
        try {
          const token = await registerForPushNotifications();
          if (token) {
            await setDoc(
              doc(db, "users", firebaseUser.uid),
              { pushToken: token },
              { merge: true }
            );
          }
        } catch (e) {
          console.warn("Failed to save push token", e);
        }
      }
    });
  }, []);

  useEffect(() => {
    if (response?.type !== "success") return;

    const idToken = response.authentication?.idToken;
    if (!idToken) return;

    (async () => {
      try {
        const credential = GoogleAuthProvider.credential(idToken);
        const { user: signedInUser } = await signInWithCredential(auth, credential);
        await setDoc(
          doc(db, "users", signedInUser.uid),
          {
            uid: signedInUser.uid,
            name: signedInUser.displayName,
            email: signedInUser.email,
            photoURL: signedInUser.photoURL,
            createdAt: serverTimestamp(),
          },
          { merge: true }
        );
      } finally {
        setSigningIn(false);
      }
    })();
  }, [response]);

  const signInWithGoogle = async () => {
    if (!request) return;
    setSigningIn(true);
    const result = await promptAsync();
    if (result.type !== "success") setSigningIn(false);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  const value = useMemo(
    () => ({ user, initializing, signingIn, signInWithGoogle, signOut }),
    [user, initializing, signingIn, request]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
