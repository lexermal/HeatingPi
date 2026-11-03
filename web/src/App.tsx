import { useEffect, useState, MouseEvent } from 'react';
import { api, getToken, setToken } from './api';
import { FlameIcon, Toasts } from './components/ui';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Schemas from './pages/Schemas';
import SettingsPage from './pages/Settings';
import Temperature from './pages/Temperature';

// Same URLs as the old Next.js app, so bookmarks keep working.
const PAGES: Record<string, () => JSX.Element> = {
  '/': Dashboard,
  '/schema': Schemas,
  '/temperature': Temperature,
  '/settings': SettingsPage,
};

export function navigate(path: string) {
  window.history.pushState(null, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

function NavLink({ to, children, onNavigate }: { to: string; children: React.ReactNode; onNavigate: () => void }) {
  const active = window.location.pathname === to;
  return (
    <li className="nav-item">
      <a
        href={to}
        className={`nav-link${active ? ' active' : ''}`}
        aria-current={active ? 'page' : undefined}
        onClick={(e: MouseEvent) => {
          e.preventDefault();
          onNavigate();
          navigate(to);
        }}
      >
        {children}
      </a>
    </li>
  );
}

export default function App() {
  const [path, setPath] = useState(window.location.pathname.replace(/\.html$/, '').replace(/\/$/, '') || '/');
  const [authed, setAuthed] = useState<boolean | null>(getToken() ? null : false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname.replace(/\/$/, '') || '/');
    const onLogout = () => setAuthed(false);
    window.addEventListener('popstate', onPop);
    window.addEventListener('heatingpi:logout', onLogout);
    return () => {
      window.removeEventListener('popstate', onPop);
      window.removeEventListener('heatingpi:logout', onLogout);
    };
  }, []);

  // Validate a stored token once on load.
  useEffect(() => {
    if (authed !== null) return;
    api.me().then(({ error }) => setAuthed(!error));
  }, [authed]);

  if (authed === null) return <Toasts />;

  if (!authed) {
    return (
      <>
        <Toasts />
        <Login
          onLoggedIn={() => {
            setAuthed(true);
            if (path === '/login') navigate('/');
          }}
        />
      </>
    );
  }

  const Page = PAGES[path] || Dashboard;
  const close = () => setMenuOpen(false);

  return (
    <>
      <Toasts />
      <nav className="navbar navbar-expand-md hp-nav">
        <div className="container">
          <a
            className="navbar-brand hp-brand"
            href="/"
            onClick={(e) => {
              e.preventDefault();
              close();
              navigate('/');
            }}
          >
            <FlameIcon color="var(--hp-ember)" />
            HeizungsPi
          </a>
          <button className="navbar-toggler" type="button" aria-label="Toggle navigation" onClick={() => setMenuOpen(!menuOpen)}>
            <span className="navbar-toggler-icon" />
          </button>
          <div className={`collapse navbar-collapse${menuOpen ? ' show' : ''}`}>
            <ul className="navbar-nav ms-auto gap-md-1 py-2 py-md-0">
              <NavLink to="/" onNavigate={close}>
                Overview
              </NavLink>
              <NavLink to="/schema" onNavigate={close}>
                Schema
              </NavLink>
              <NavLink to="/temperature" onNavigate={close}>
                Temperature
              </NavLink>
              <NavLink to="/settings" onNavigate={close}>
                Settings
              </NavLink>
              <li className="nav-item">
                <button
                  type="button"
                  className="nav-link"
                  onClick={() => {
                    setToken(null);
                    setAuthed(false);
                    close();
                  }}
                >
                  Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      <main className="container pb-5">
        <Page />
      </main>
    </>
  );
}
