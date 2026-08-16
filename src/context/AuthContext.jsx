import { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { api, getToken, setToken } from '../lib/apiClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // A token in localStorage only proves we had a session; the server decides
  // whether it is still valid.
  useEffect(() => {
    let active = true;

    if (!getToken()) {
      setLoading(false);
      return;
    }

    api('/auth/me', { auth: true })
      .then((res) => { if (active) setUser(res?.user ?? null); })
      .catch(() => { if (active) setUser(null); })
      .finally(() => { if (active) setLoading(false); });

    return () => { active = false; };
  }, []);

  const signIn = useCallback(async (email, password) => {
    const res = await api('/auth/login', { method: 'POST', body: { email, password } });
    setToken(res.token);
    setUser(res.user);
  }, []);

  const signOut = useCallback(async () => {
    try {
      await api('/auth/logout', { method: 'POST', auth: true });
    } catch {
      /* already expired server-side — clearing locally is enough */
    }
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, session: user ? { user } : null, loading, signIn, signOut }),
    [user, loading, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
