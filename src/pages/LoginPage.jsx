import { useState } from 'react';
import { Eye, EyeOff, LockKeyhole, Mail, GraduationCap, School, ShieldCheck } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Brand from '../components/Brand';
import { login } from '../services/authService';
import '../auth.css';

const DEMO_PRESETS = [
  { role: 'Student', email: 'student@example.com', pass: 'Student@123', icon: GraduationCap },
  { role: 'Teacher', email: 'teacher@example.com', pass: 'Teacher@123', icon: School },
  { role: 'Admin', email: 'admin@example.com', pass: 'Admin@123', icon: ShieldCheck },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('student@example.com');
  const [password, setPassword] = useState('Student@123');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  function applyPreset(preset) {
    setEmail(preset.email);
    setPassword(preset.pass);
    setError('');
  }

  async function submit(event) {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login({ email, password });
      navigate(location.state?.from ?? '/dashboard', { replace: true });
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="login-page">
      <Link className="login-brand" to="/">
        <Brand />
      </Link>
      <section className="login-card">
        <div className="login-card__intro">
          <span>
            <LockKeyhole size={25} />
          </span>
          <h1>Welcome back</h1>
          <p>Sign in to manage your assignments and deadlines.</p>
        </div>

        <form onSubmit={submit} noValidate>
          <label htmlFor="email">Email address</label>
          <div className="login-input">
            <Mail size={18} />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              required
            />
          </div>

          <label htmlFor="password">Password</label>
          <div className="login-input">
            <LockKeyhole size={18} />
            <input
              id="password"
              type={show ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              aria-label={show ? 'Hide password' : 'Show password'}
            >
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {error && (
            <p className="login-error" role="alert">
              {error}
            </p>
          )}

          <button className="login-submit" type="submit" disabled={busy}>
            {busy ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <div className="demo-credentials" style={{ marginTop: '20px' }}>
          <b style={{ marginBottom: '4px' }}>Quick Demo Login (Select Role):</b>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
            {DEMO_PRESETS.map((p) => {
              const Icon = p.icon;
              const isSelected = email === p.email;
              return (
                <button
                  key={p.role}
                  type="button"
                  onClick={() => applyPreset(p)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '8px 4px',
                    borderRadius: '6px',
                    border: isSelected ? '1.5px solid #2856dd' : '1px solid #dce2ec',
                    background: isSelected ? '#eef2ff' : '#ffffff',
                    cursor: 'pointer',
                    fontSize: '11px',
                    fontWeight: isSelected ? 650 : 500,
                    color: isSelected ? '#1e40af' : '#475674',
                  }}
                >
                  <Icon size={16} />
                  <span>{p.role}</span>
                </button>
              );
            })}
          </div>
          <div style={{ marginTop: '6px', fontSize: '11px', color: '#64748b' }}>
            <span>Active: <code>{email}</code> / <code>{password}</code></span>
          </div>
        </div>

        <Link className="back-home" to="/">
          ← Back to home
        </Link>
      </section>
    </main>
  );
}
