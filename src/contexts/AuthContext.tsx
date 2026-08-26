import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { UserProfile } from "../types";
import { mockDb } from "../lib/mockDb";

interface AuthContextType {
  user: any | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isMock: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isAdmin: false,
  isMock: false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMock, setIsMock] = useState(false);

  const profileRef = useRef<UserProfile | null>(null);

  useEffect(() => {
    profileRef.current = profile;
  }, [profile]);

  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;

    // 1. Try to recover mock session first
    const mockSession = mockDb.getCurrentSession();
    if (mockSession) {
      setUser(mockSession);
      const mockProfile = mockDb.getUser(mockSession.uid);
      setProfile(mockProfile);
      setIsMock(true);
      setLoading(false);
      // We still want to listen to Firebase in case it comes back, 
      // but the mock session takes precedence for this request's context.
    }

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = null;
      }

      if (firebaseUser) {
        setUser(firebaseUser);
        setIsMock(false);
        
        // Listen to profile changes real-time
        const profileDocumentRef = doc(db, "users", firebaseUser.uid);
        unsubscribeProfile = onSnapshot(profileDocumentRef, (docSnap) => {
          if (docSnap.exists()) {
            setProfile(docSnap.data() as UserProfile);
          } else {
            // Fallback to mock profile if firestore fails to load it (e.g. permission issues)
            const fallback = mockDb.getUser(firebaseUser.uid);
            if (fallback) setProfile(fallback);
          }
          setLoading(false);
        }, (err) => {
          console.error("Firestore error, falling back to mock:", err);
          const fallback = mockDb.getUser(firebaseUser.uid);
          if (fallback) setProfile(fallback);
          setLoading(false);
        });
      } else {
        // If no firebase user, and no mock session, then we are logged out
        if (!mockDb.getCurrentSession()) {
          setUser(null);
          setProfile(null);
          setIsMock(false);
        }
        setLoading(false);
      }
    });

    // 2. Poll mock session for changes (reactive fallback)
    const pollInterval = setInterval(() => {
      const currentMock = mockDb.getCurrentSession();
      if (currentMock) {
        const freshProfile = mockDb.getUser(currentMock.uid);
        if (freshProfile && JSON.stringify(freshProfile) !== JSON.stringify(profileRef.current)) {
          setProfile(freshProfile);
        }
      }
    }, 2000);

    return () => {
      if (unsubscribeProfile) {
        unsubscribeProfile();
      }
      unsubscribeAuth();
      clearInterval(pollInterval);
    };
  }, []);

  const rawEmail = (user?.email || profile?.email || "").toLowerCase();
  const isLegacyAdmin = rawEmail === "admin@marketdigitaltrading.com" || rawEmail === "bitcointrading648@gmail.com";
  const currentEmail = isLegacyAdmin ? "termtransfer@gmail.com" : rawEmail;
  const isAdmin = profile?.role === "admin" || currentEmail === "termtransfer@gmail.com";

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isAdmin,
        isMock
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
