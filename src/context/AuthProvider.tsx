// src/context/AuthProvider.tsx
"use client"
import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { 
  User,
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup,
  signOut, 
  updateProfile,
  onAuthStateChanged,
  UserCredential,
  AuthProvider as FirebaseAuthProvider
} from 'firebase/auth';
import { toast } from 'react-hot-toast';
import { auth } from '../Firebase/Firebase.config';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  createUser: (email: string, password: string) => Promise<UserCredential>;
  loginWithPopUp: (provider: FirebaseAuthProvider) => Promise<UserCredential>;
  loginWithEmailAndPassword: (email: string, password: string) => Promise<UserCredential>;
  updateUserProfile: (name: string, photo: string) => Promise<void>;
  providerLogOut: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const createUser = useCallback((email: string, password: string) => {
    setLoading(true);
    return createUserWithEmailAndPassword(auth, email, password);
  }, []);

  const loginWithPopUp = useCallback((provider: FirebaseAuthProvider) => {
    setLoading(true);
    return signInWithPopup(auth, provider);
  }, []);

  const loginWithEmailAndPassword = useCallback((email: string, password: string) => {
    setLoading(true);
    return signInWithEmailAndPassword(auth, email, password);
  }, []);

  const updateUserProfile = useCallback((name: string, photo: string) => {
    if (auth.currentUser) {
      return updateProfile(auth.currentUser, { displayName: name, photoURL: photo });
    }
    return Promise.reject(new Error('No user is signed in'));
  }, []);

  const providerLogOut = useCallback(() => {
    setLoading(true);
    signOut(auth)
      .then(() => {
        toast.success('LogOut Success');
      })
      .catch(error => {
        console.error(error);
        toast.error('Logout failed');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const authInfo: AuthContextType = {
    user,
    loading,
    createUser,
    loginWithPopUp,
    loginWithEmailAndPassword,
    updateUserProfile,
    providerLogOut
  };

  return (
    <AuthContext.Provider value={authInfo}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;