import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Alert from '../components/Alert.jsx';

export default function Register() {
  const { register, isAuthenticated, user, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (isAuthenticated) {
    return <Navigate to={user.role === 'agent' ? '/agent' : '/dashboard'} replace />;
  }

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (form.name.trim().length < 2) return setError('Name is required.');
    if (!form.email.includes('@')) return setError('A valid email is required.');
    if (form.password.length < 8) return setError('Password must be at least 8 characters.');
    if (form.password !== form.confirm) return setError('Passwords do not match.');
    try {
      await register({ name: form.name.trim(), email: form.email.trim(), password: form.password });
      setSuccess('Account created. Redirecting...');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    }
  };

  return (
    <div className="auth-wrap">
      <form className="card auth-card" onSubmit={onSubmit}>
        <h1>Create account</h1>
        <p className="muted">Customer registration only</p>
        <Alert>{error}</Alert>
        <Alert type="success">{success}</Alert>
        <label>Name</label>
        <input value={form.name} onChange={(e) => update('name', e.target.value)} />
        <label>Email</label>
        <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} />
        <label>Password</label>
        <input type="password" value={form.password} onChange={(e) => update('password', e.target.value)} />
        <label>Confirm password</label>
        <input type="password" value={form.confirm} onChange={(e) => update('confirm', e.target.value)} />
        <button className="btn" style={{ marginTop: 16, width: '100%' }} disabled={loading}>
          {loading ? 'Creating...' : 'Register'}
        </button>
        <p className="muted" style={{ marginTop: 16 }}>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </div>
  );
}
