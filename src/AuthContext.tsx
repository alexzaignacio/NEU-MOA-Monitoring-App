import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { UserProfile, UserRole } from './types';
import { handleFirestoreError, OperationType } from './utils/errorHandlers';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isFaculty: boolean;
  isStudent: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        // Listen to profile changes
        const profileRef = doc(db, 'users', firebaseUser.uid);
        
        const unsubProfile = onSnapshot(profileRef, async (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            const adminEmails = ['jcesperanza@neu.edu.ph', 'alexzagayle.ignacio@neu.edu.ph'];
            if (data.isBlocked && adminEmails.includes(firebaseUser.email || '')) {
              try {
                await updateDoc(profileRef, { isBlocked: false });
              } catch (error) {
                console.error("Failed to auto-unblock admin:", error);
              }
            }
            setProfile({ uid: firebaseUser.uid, ...data } as UserProfile);
          } else {
            // Create default profile for new users
            // Restrict to @neu.edu.ph domain
            if (firebaseUser.email && firebaseUser.email.toLowerCase().endsWith('@neu.edu.ph')) {
              const adminEmails = ['jcesperanza@neu.edu.ph', 'alexzagayle.ignacio@neu.edu.ph'];
              let role: UserRole = 'student';
              
              if (adminEmails.includes(firebaseUser.email)) {
                role = 'admin';
              } else if (firebaseUser.email === 'faculty@neu.edu.ph') {
                role = 'faculty';
              } else if (firebaseUser.email === 'student@neu.edu.ph') {
                role = 'student';
              }

              const newProfile: UserProfile = {
                uid: firebaseUser.uid,
                email: firebaseUser.email || '',
                displayName: firebaseUser.displayName || '',
                role,
                isBlocked: false,
                canMaintainMOA: false,
              };
              try {
                await setDoc(profileRef, newProfile);
                setProfile(newProfile);
              } catch (error) {
                handleFirestoreError(error, OperationType.CREATE, `users/${firebaseUser.uid}`);
              }
            } else {
              // If not a neu.edu.ph email, we don't create a profile and sign them out
              await auth.signOut();
            }
          }
          setLoading(false);
        });

        return () => unsubProfile();
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const value = {
    user,
    profile,
    loading,
    isAdmin: profile?.role === 'admin',
    isFaculty: profile?.role === 'faculty',
    isStudent: profile?.role === 'student',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
