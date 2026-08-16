import { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { supabase, isDemoBackend, SETUP_MESSAGE } from '../lib/supabase';
import * as local from '../lib/localBackend';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    // Dev with no .env — restore the demo session from localStorage.
    if (isDemoBackend) {
      setSession(local.getSession());
      setLoading(false);
      return;
    }

    // No .env yet — stay signed out instead of crashing the whole app.
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session ?? null);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setLoading(false);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email, password) => {
    if (isDemoBackend) {
      setSession(local.signIn(email, password));
      return;
    }
    if (!supabase) throw new Error(SETUP_MESSAGE);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }, []);

  const signOut = useCallback(async () => {
    if (isDemoBackend) {
      local.signOut();
      setSession(null);
      return;
    }
    if (supabase) await supabase.auth.signOut();
  }, []);

  const value = useMemo(
    () => ({ session, user: session?.user ?? null, loading, signIn, signOut }),
    [session, loading, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
