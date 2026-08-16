import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { isDemoBackend } from '../../lib/supabase';
import { DEMO_EMAIL, DEMO_PASSWORD } from '../../lib/localBackend';

export default function Login() {
  const { session, loading, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (!loading && session) {
    return <Navigate to={location.state?.from || '/admin'} replace />;
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await signIn(email.trim(), password);
      navigate(location.state?.from || '/admin', { replace: true });
    } catch (err) {
      setError(err.message || 'Could not sign in.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-5">
      <div className="glass-card w-full max-w-sm rounded-3xl p-8">
        <div className="flex items-center gap-3">
          <img src="/img/logo.png" alt="Forno" className="h-10 w-auto" />
          <span className="font-display text-2xl tracking-[.16em] text-cream">FORNO</span>
        </div>

        <p className="eyebrow mt-8">Admin</p>
        <h1 className="mt-3 font-display text-3xl">Sign in to the CMS</h1>

        {isDemoBackend && (
          <div className="mt-6 rounded-2xl border border-amber/25 bg-amber/[.06] p-4 text-xs leading-relaxed text-cream/65">
            <p className="font-semibold text-amber">Demo backend (dev only)</p>
            <p className="mt-2">
              Sign in with <code className="text-amber">{DEMO_EMAIL}</code> /{' '}
              <code className="text-amber">{DEMO_PASSWORD}</code>
            </p>
            <p className="mt-2 text-cream/45">
              Changes save to this browser only and are lost when you connect Supabase.
            </p>
            <button
              type="button"
              onClick={() => { setEmail(DEMO_EMAIL); setPassword(DEMO_PASSWORD); }}
              className="mt-3 underline underline-offset-4 hover:text-amber transition"
            >
              Fill these in
            </button>
          </div>
        )}

        <form className="mt-8 space-y-5" onSubmit={onSubmit}>
          <div>
            <label htmlFor="email" className="block text-xs uppercase tracking-[.16em] text-cream/45">
              Email
            </label>
            <input
              id="email" type="email" required autoComplete="username"
              value={email} onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-xl border border-cream/12 bg-ink/50 px-4 py-3.5 text-cream placeholder:text-cream/25 focus:border-amber focus:outline-none transition"
              placeholder="owner@forno-qa.site"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs uppercase tracking-[.16em] text-cream/45">
              Password
            </label>
            <input
              id="password" type="password" required autoComplete="current-password"
              value={password} onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full rounded-xl border border-cream/12 bg-ink/50 px-4 py-3.5 text-cream focus:border-amber focus:outline-none transition"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </p>
          )}

          <button
            type="submit" disabled={busy}
            className="btn-amber w-full rounded-full py-4 text-sm font-bold tracking-wide transition-all duration-300 disabled:opacity-60"
          >
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <a href="/" className="mt-6 block text-center text-xs text-cream/40 hover:text-amber transition">
          ← Back to the website
        </a>
      </div>
    </div>
  );
}
