import { FormEvent, useState } from 'react';
import { api, setToken } from '../api';
import { FlameIcon } from '../components/ui';

export default function Login({ onLoggedIn }: { onLoggedIn: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { data, error } = await api.login(email.trim(), password);
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    setToken(data.token);
    onLoggedIn();
  };

  return (
    <div className="login-wrap">
      <form className="hp-card hp-card-pad login-card rise" onSubmit={submit}>
        <div className="login-flame">
          <FlameIcon size={32} color="#fff" />
        </div>
        <h1 className="h2 mb-1">HeizungsPi</h1>
        <p className="text-body-secondary mb-4">Sign in to control the heating.</p>
        <div className="mb-3">
          <label htmlFor="email" className="eyebrow mb-1">
            E-mail
          </label>
          <input id="email" type="email" autoComplete="username" required className="form-control form-control-lg" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="mb-3">
          <label htmlFor="password" className="eyebrow mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            className="form-control form-control-lg"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && <div className="alert alert-danger py-2">{error}</div>}
        <button type="submit" className="btn btn-primary btn-lg w-100 mt-2" disabled={busy}>
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
