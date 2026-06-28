// Global auth state: the signed-in profile + helpers. Wrap the app in
// <AuthProvider> (done in app/_layout.tsx) and read with useAuth().
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import {
  getCurrentProfile,
  login as loginSvc,
  logout as logoutSvc,
  register as registerSvc,
} from '@/services/auth';
import type { UserProfile } from '@/types';

interface AuthState {
  profile: UserProfile | null;
  loading: boolean;
  isLoggedIn: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
  setProfile: (p: UserProfile) => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const p = await getCurrentProfile();
    setProfile(p);
  }, []);

  useEffect(() => {
    (async () => {
      await refresh();
      setLoading(false);
    })();
  }, [refresh]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      await loginSvc(email, password);
      await refresh();
    },
    [refresh],
  );

  const signUp = useCallback(
    async (email: string, password: string, name: string) => {
      const p = await registerSvc(email, password, name);
      setProfile(p);
    },
    [],
  );

  const signOut = useCallback(async () => {
    await logoutSvc();
    setProfile(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        profile,
        loading,
        isLoggedIn: !!profile,
        signIn,
        signUp,
        signOut,
        refresh,
        setProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
