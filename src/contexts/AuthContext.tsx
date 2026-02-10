import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
} from 'firebase/auth';
import type { User, AuthError } from 'firebase/auth';
import { auth, googleProvider, googleDriveProvider } from '../config/firebase';

interface GoogleToken {
  accessToken: string;
  obtainedAt: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  getGoogleAccessToken: () => Promise<string>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [googleToken, setGoogleToken] = useState<GoogleToken | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Handle redirect result on page load
  useEffect(() => {
    getRedirectResult(auth)
      .then((result) => {
        if (result) {
          const credential = GoogleAuthProvider.credentialFromResult(result);
          if (credential?.accessToken) {
            setGoogleToken({
              accessToken: credential.accessToken,
              obtainedAt: Date.now(),
            });
          }
        }
      })
      .catch((error) => {
        console.error('Redirect result error:', error);
      });
  }, []);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      const authError = error as AuthError;
      const ignorable = [
        'auth/popup-closed-by-user',
        'auth/cancelled-popup-request',
      ];
      if (ignorable.includes(authError.code)) {
        return;
      }
      if (
        authError.code === 'auth/popup-blocked' ||
        authError.code === 'auth/operation-not-supported-in-this-environment'
      ) {
        await signInWithRedirect(auth, googleProvider);
        return;
      }
      console.error('Google sign in error:', authError.code, error);
      throw error;
    }
  };

  const getGoogleAccessToken = async (): Promise<string> => {
    const TOKEN_LIFETIME_MS = 50 * 60 * 1000;

    if (
      googleToken &&
      Date.now() - googleToken.obtainedAt < TOKEN_LIFETIME_MS
    ) {
      return googleToken.accessToken;
    }

    // Request Drive scope via separate provider
    try {
      const result = await signInWithPopup(auth, googleDriveProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (!credential?.accessToken) {
        throw new Error('UNAUTHORIZED');
      }
      setGoogleToken({
        accessToken: credential.accessToken,
        obtainedAt: Date.now(),
      });
      return credential.accessToken;
    } catch (error) {
      const authError = error as AuthError;
      if (
        authError.code === 'auth/popup-blocked' ||
        authError.code === 'auth/operation-not-supported-in-this-environment'
      ) {
        await signInWithRedirect(auth, googleDriveProvider);
        throw new Error('UNAUTHORIZED');
      }
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setGoogleToken(null);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, signInWithGoogle, signOut, getGoogleAccessToken }}
    >
      {children}
    </AuthContext.Provider>
  );
};
