import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from '../firebase';
import { UserSubscription, HistoryItem, PlanTier } from '../types';
import { getStoredSubscription, saveSubscription } from '../utils/subscription';

interface AuthContextType {
  currentUser: User | null;
  loadingAuth: boolean;
  signInWithGoogle: () => Promise<void>;
  logOut: () => Promise<void>;
  saveHumanizationToCloud: (item: HistoryItem) => Promise<void>;
  cloudHistory: HistoryItem[];
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  loadingAuth: true,
  signInWithGoogle: async () => {},
  logOut: async () => {},
  saveHumanizationToCloud: async () => {},
  cloudHistory: [],
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [cloudHistory, setCloudHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Sync or initialize user profile in Firestore
        const userDocRef = doc(db, 'users', user.uid);
        try {
          const userSnap = await getDoc(userDocRef);
          if (!userSnap.exists()) {
            const localSub = getStoredSubscription();
            await setDoc(userDocRef, {
              userId: user.uid,
              email: user.email || '',
              displayName: user.displayName || 'GhostWriter User',
              planTier: localSub.tier || 'free',
              runsUsedToday: localSub.runsUsedToday || 0,
              totalWordsHumanized: localSub.totalWordsHumanized || 0,
              customBannedWords: ['synergistic', 'holistic'],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
        }
      }
      setLoadingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  // Sync cloud history if logged in
  useEffect(() => {
    if (!currentUser) {
      setCloudHistory([]);
      return;
    }

    const humanizationsRef = collection(db, 'users', currentUser.uid, 'humanizations');
    const q = query(humanizationsRef, orderBy('createdAt', 'desc'), limit(30));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items: HistoryItem[] = snapshot.docs.map((doc) => {
          const d = doc.data();
          return {
            id: d.id || doc.id,
            timestamp: new Date(d.createdAt).getTime() || Date.now(),
            originalText: d.originalText,
            humanizedText: d.humanizedText,
            tone: d.tone,
            typoRate: d.typoRate || 6,
            originalScore: d.originalScore,
            humanizedScore: d.humanizedScore,
          };
        });
        setCloudHistory(items);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, `users/${currentUser.uid}/humanizations`);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Google Sign-in failed:', error);
      throw error;
    }
  };

  const logOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Sign-out failed:', error);
    }
  };

  const saveHumanizationToCloud = async (item: HistoryItem) => {
    if (!currentUser) return;
    const docRef = doc(db, 'users', currentUser.uid, 'humanizations', item.id);
    try {
      await setDoc(docRef, {
        id: item.id,
        userId: currentUser.uid,
        originalText: item.originalText,
        humanizedText: item.humanizedText,
        tone: item.tone,
        originalScore: item.originalScore,
        humanizedScore: item.humanizedScore,
        typoRate: item.typoRate,
        createdAt: new Date(item.timestamp).toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `users/${currentUser.uid}/humanizations/${item.id}`);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loadingAuth,
        signInWithGoogle,
        logOut,
        saveHumanizationToCloud,
        cloudHistory,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
