import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import Layout from '../components/Layout.jsx';
import Alert from '../components/Alert.jsx';

export default function CreateTicket() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ subject: '', description: '', priority: 'medium' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!form.subject.trim()) return setError('Subject is required.');
    if (!form.description.trim()) return setError('Description is required.');
    if (!form.priority) return setError('Priority is required.');
    setLoading(true);
    try {
      const res = await api.post('/tickets', form);
      setSuccess('Ticket created.');
      navigate(`/tickets/${res.data.data.id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create ticket.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Create Ticket">
      <form className="card" onSubmit={onSubmit} style={{ maxWidth: 720 }}>
        <Alert>{error}</Alert>
        <Alert type="success">{success}</Alert>
        <label>Subject</label>
        <input value={form.subject} onChange={(e) => update('subject', e.target.value)} />
        <label>Description</label>
        <textarea value={form.description} onChange={(e) => update('description', e.target.value)} />
        <label>Priority</label>
        <select value={form.priority} onChange={(e) => update('priority', e.target.value)}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <button className="btn" style={{ marginTop: 16 }} disabled={loading}>
          {loading ? 'Submitting...' : 'Submit ticket'}
        </button>
      </form>
    </Layout>
  );
}
