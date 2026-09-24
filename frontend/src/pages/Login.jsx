import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Alert from '../components/Alert.jsx';

export default function Login() {
  const { login, isAuthenticated, user, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (isAuthenticated) {
    return <Navigate to={user.role === 'agent' ? '/agent' : '/dashboard'} replace />;
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) {
      setError('Email and password are required.');
      return;
    }
    try {
      const nextUser = await login(email.trim(), password);
      navigate(nextUser.role === 'agent' ? '/agent' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed.');
    }
  };

  return (
    <div className="auth-wrap">
      <form className="card auth-card" onSubmit={onSubmit}>
        <h1>Sign in</h1>
        <p className="muted">Support Ticket Management System</p>
        <Alert>{error}</Alert>
        <label htmlFor="email">Email</label>
        <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <label htmlFor="password">Password</label>
        <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button className="btn" style={{ marginTop: 16, width: '100%' }} disabled={loading}>
          {loading ? 'Signing in...' : 'Login'}
        </button>
        <p className="muted" style={{ marginTop: 16 }}>
          New customer? <Link to="/register">Create an account</Link>
        </p>
      </form>
    </div>
  );
}
