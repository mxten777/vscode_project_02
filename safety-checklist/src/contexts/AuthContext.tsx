import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { auth, IS_MOCK } from '../firebase/config';
import { getUserDoc, setUserDoc } from '../firebase/firestore';
import type { AppUser } from '../types';
import { MOCK_ADMIN, MOCK_INSPECTOR } from '../mocks/mockData';

interface AuthContextValue {
  currentUser: User | null;
  appUser: AppUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ── Mock Provider ─────────────────────────────────────────────────────────────
function MockAuthProvider({ children }: { children: React.ReactNode }) {
  const [appUser, setAppUser] = useState<AppUser>(MOCK_ADMIN);
  const [loggedIn, setLoggedIn] = useState(true);

  const login = async (email: string, _password: string) => {
    const user = email.includes('inspector') ? MOCK_INSPECTOR : MOCK_ADMIN;
    setAppUser(user);
    setLoggedIn(true);
  };

  const logout = async () => setLoggedIn(false);

  return (
    <AuthContext.Provider
      value={{
        currentUser: loggedIn ? ({ uid: appUser.uid, email: appUser.email } as User) : null,
        appUser: loggedIn ? appUser : null,
        loading: false,
        login,
        logout,
      }}
    >
      {children}
      {/* 역할 전환 플로팅 버튼 (Mock 모드 전용) */}
      {loggedIn && (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
          <div className="bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1 rounded-full shadow">
            🔸 MOCK 모드
          </div>
          <button
            onClick={() => setAppUser(appUser.role === 'admin' ? MOCK_INSPECTOR : MOCK_ADMIN)}
            className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold px-3 py-2 rounded-xl shadow-lg transition-colors"
          >
            전환 → {appUser.role === 'admin' ? '점검자' : '관리자'}
          </button>
        </div>
      )}
    </AuthContext.Provider>
  );
}

// ── Real Firebase Provider ────────────────────────────────────────────────────
function FirebaseAuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        let doc = await getUserDoc(user.uid);
        if (!doc) {
          const newUser = {
            uid: user.uid,
            email: user.email ?? '',
            displayName: user.displayName ?? user.email?.split('@')[0] ?? '사용자',
            role: 'inspector' as const,
          };
          await setUserDoc(newUser);
          doc = await getUserDoc(user.uid);
        }
        setAppUser(doc);
      } else {
        setAppUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ currentUser, appUser, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ── Public Export ─────────────────────────────────────────────────────────────
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (IS_MOCK) return <MockAuthProvider>{children}</MockAuthProvider>;
  return <FirebaseAuthProvider>{children}</FirebaseAuthProvider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
