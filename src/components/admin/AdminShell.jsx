import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const link = ({ isActive }) =>
  `rounded-full px-4 py-2 text-sm font-semibold transition ${
    isActive ? 'tab-active' : 'border border-cream/15 text-cream/65 hover:border-amber/60 hover:text-amber'
  }`;

export default function AdminShell({ title, action, children }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const onSignOut = async () => {
    await signOut();
    navigate('/admin/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-ink text-cream">
      <header className="glass sticky top-0 z-40">
        <div className="mx-auto flex max-w-shell flex-wrap items-center gap-4 px-5 py-4 lg:px-8">
          <a href="/" className="flex items-center gap-3">
            <img src="/img/logo.png" alt="Forno" className="h-9 w-auto" />
            <span className="font-display text-xl tracking-[.16em]">FORNO</span>
          </a>

          <nav className="flex items-center gap-2">
            <NavLink to="/admin" end className={link}>Menu items</NavLink>
            <NavLink to="/admin/categories" className={link}>Categories</NavLink>
          </nav>

          <div className="ms-auto flex items-center gap-4">
            <span className="hidden text-xs text-cream/40 sm:inline">{user?.email}</span>
            <button
              onClick={onSignOut}
              className="rounded-full border border-cream/20 px-4 py-2 text-xs font-semibold tracking-wide text-cream/70 transition hover:border-amber hover:text-amber"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-shell px-5 py-10 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Admin</p>
            <h1 className="mt-2 font-display text-4xl">{title}</h1>
          </div>
          {action}
        </div>

        <div className="mt-10">{children}</div>
      </main>
    </div>
  );
}
