import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  User 
} from 'firebase/auth';
import { auth, googleProvider, db } from '../firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (isAdminOnly?: boolean) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkIsAdmin = useCallback(async (email: string): Promise<boolean> => {
    const key = `kk_admin_${email.toLowerCase()}`;
    try {
      const cached = localStorage.getItem(key);
      if (cached !== null) {
        // Fire non-blocking background check
        getDoc(doc(db, 'admins', email.toLowerCase())).then(adminSnap => {
          const status = adminSnap.exists() && adminSnap.data()?.active !== false;
          localStorage.setItem(key, String(status));
          setIsAdmin(status);
        }).catch(() => {});
        return cached === 'true';
      }
      const adminRef = doc(db, 'admins', email.toLowerCase());
      const adminSnap = await getDoc(adminRef);
      const status = adminSnap.exists() && adminSnap.data()?.active !== false;
      localStorage.setItem(key, String(status));
      return status;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser?.email) {
        const adminStatus = await checkIsAdmin(firebaseUser.email);
        setIsAdmin(adminStatus);
      } else {
        setIsAdmin(false);
      }
      setIsLoading(false);
    });
    return unsubscribe;
  }, [checkIsAdmin]);

  const login = useCallback(async (isAdminOnly: boolean = false) => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const loggedInUser = result.user;

      // Sync user profile to Firestore
      const userRef = doc(db, 'users', loggedInUser.uid);
      await setDoc(userRef, {
        uid: loggedInUser.uid,
        name: loggedInUser.displayName,
        email: loggedInUser.email,
        photoURL: loggedInUser.photoURL,
        lastLogin: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true });

      // Check admin status
      let adminStatus = false;
      if (loggedInUser.email) {
        adminStatus = await checkIsAdmin(loggedInUser.email);
        setIsAdmin(adminStatus);
      } else {
        setIsAdmin(false);
      }

      if (isAdminOnly && !adminStatus) {
        if (loggedInUser.email) {
          localStorage.removeItem(`kk_admin_${loggedInUser.email.toLowerCase()}`);
        }
        await signOut(auth);
        setIsAdmin(false);
        setUser(null);
        throw new Error('Access denied. Your account is not authorised as an admin.');
      }

    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  }, [checkIsAdmin]);

  const logout = useCallback(async () => {
    try {
      if (user?.email) {
        localStorage.removeItem(`kk_admin_${user.email.toLowerCase()}`);
      }
      await signOut(auth);
      setIsAdmin(false);
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }, [user]);

  const value = useMemo(() => ({
    user, 
    isAuthenticated: !!user && isAdmin,
    isAdmin,
    isLoading,
    login, 
    logout 
  }), [user, isAdmin, isLoading, login, logout]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
