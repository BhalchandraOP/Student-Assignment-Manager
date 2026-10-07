import { ShieldAlert, ArrowLeft, LogOut } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Brand from '../components/Brand';
import { getSession, logout } from '../services/authService';
import '../auth.css';

export default function UnauthorizedPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const session = getSession();
  const userRole = session?.user?.roles?.[0] || 'Unknown';
  const allowedRoles = location.state?.allowedRoles?.join(', ') || 'Higher privilege required';

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <main className="login-page">
      <Link className="login-brand" to="/">
        <Brand />
      </Link>
      <section className="login-card" style={{ textAlign: 'center' }}>
        <div className="login-card__intro">
          <span style={{ background: 'linear-gradient(135deg, #e11d48, #be123c)' }}>
            <ShieldAlert size={28} />
          </span>
          <h1 style={{ color: '#be123c' }}>403 Forbidden</h1>
          <p>Access Denied: You do not have permission to access this resource.</p>
        </div>

        <div className="demo-credentials" style={{ textAlign: 'left', background: '#fff1f2', border: '1px solid #fecdd3' }}>
          <b style={{ color: '#9f1239' }}>Security Context:</b>
          <span><b>Your Current Role:</b> <code>{userRole}</code></span>
          <span><b>Required Role(s):</b> <code>{allowedRoles}</code></span>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '22px' }}>
          <Link
            to="/dashboard"
            className="login-submit"
            style={{
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <ArrowLeft size={16} /> Return to Dashboard
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="login-submit"
            style={{
              background: '#f1f5f9',
              color: '#334155',
              border: '1px solid #cbd5e1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <LogOut size={16} /> Switch Account
          </button>
        </div>
      </section>
    </main>
  );
}
