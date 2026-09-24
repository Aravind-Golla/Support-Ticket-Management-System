import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api.js';
import Layout from '../components/Layout.jsx';
import Alert from '../components/Alert.jsx';
import Loading from '../components/Loading.jsx';
import { PriorityBadge, StatusBadge } from '../components/Badges.jsx';
import { useAuth } from '../context/AuthContext.jsx';

function formatDate(value) {
  return value ? new Date(value).toLocaleString() : '—';
}

export default function TicketDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAgent = user?.role === 'agent';
  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [agents, setAgents] = useState([]);
  const [comment, setComment] = useState('');
  const [form, setForm] = useState({ status: '', priority: '', assigned_to: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [ticketRes, commentsRes] = await Promise.all([
        api.get(`/tickets/${id}`),
        api.get(`/tickets/${id}/comments`),
      ]);
      setTicket(ticketRes.data.data);
      setComments(commentsRes.data.data);
      setForm({
        status: ticketRes.data.data.status,
        priority: ticketRes.data.data.priority,
        assigned_to: ticketRes.data.data.assigned_to || '',
      });
      if (user?.role === 'agent') {
        const agentsRes = await api.get('/users');
        setAgents(agentsRes.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load ticket.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const addComment = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!comment.trim()) return setError('Comment cannot be empty.');
    try {
      const res = await api.post(`/tickets/${id}/comments`, { comment });
      setComments((prev) => [...prev, res.data.data]);
      setComment('');
      setSuccess('Comment added.');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not add comment.');
    }
  };

  const saveAgentChanges = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const res = await api.put(`/tickets/${id}`, {
        status: form.status,
        priority: form.priority,
        assigned_to: form.assigned_to === '' ? null : Number(form.assigned_to),
      });
      setTicket(res.data.data);
      setSuccess('Ticket updated.');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update ticket.');
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    if (!window.confirm('Delete this ticket? This cannot be undone.')) return;
    try {
      await api.delete(`/tickets/${id}`);
      navigate(isAgent ? '/agent' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not delete ticket.');
    }
  };

  const canDelete = isAgent || (ticket && ticket.status === 'open' && ticket.user_id === user?.id);

  return (
    <Layout title={`Ticket #${id}`}>
      <Alert>{error}</Alert>
      <Alert type="success">{success}</Alert>
      {loading ? (
        <Loading />
      ) : !ticket ? (
        <div className="card">Ticket not found.</div>
      ) : (
        <>
          <section className="card" style={{ marginBottom: 16 }}>
            <h2 style={{ marginTop: 0 }}>{ticket.subject}</h2>
            <p>{ticket.description}</p>
            <div className="row">
              <PriorityBadge priority={ticket.priority} />
              <StatusBadge status={ticket.status} />
            </div>
            <p className="muted">Created {formatDate(ticket.created_at)} · Updated {formatDate(ticket.updated_at)}</p>
            <p>Customer: {ticket.customer_name} ({ticket.customer_email})</p>
            <p>Assigned agent: {ticket.assigned_agent_name || 'Unassigned'}</p>
            {canDelete && (
              <button className="btn danger" onClick={onDelete}>Delete ticket</button>
            )}
          </section>

          {isAgent && (
            <form className="card" onSubmit={saveAgentChanges} style={{ marginBottom: 16 }}>
              <h3>Agent controls</h3>
              <label>Status</label>
              <select value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}>
                <option value="open">Open</option>
                <option value="in_progress">In progress</option>
                <option value="closed">Closed</option>
              </select>
              <label>Priority</label>
              <select value={form.priority} onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value }))}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              <label>Assign to</label>
              <select value={form.assigned_to} onChange={(e) => setForm((p) => ({ ...p, assigned_to: e.target.value }))}>
                <option value="">Unassigned</option>
                {agents.map((agent) => (
                  <option key={agent.id} value={agent.id}>{agent.name}</option>
                ))}
              </select>
              <button className="btn" style={{ marginTop: 16 }} disabled={saving}>
                {saving ? 'Saving...' : 'Save changes'}
              </button>
            </form>
          )}

          <section className="card">
            <h3>Comments</h3>
            {comments.length === 0 && <p className="muted">No comments yet.</p>}
            {comments.map((item) => (
              <div className="comment" key={item.id}>
                <strong>{item.user.name}</strong> <span className="muted">({item.user.role})</span>
                <div>{item.comment}</div>
                <div className="muted">{formatDate(item.created_at)}</div>
              </div>
            ))}
            <form onSubmit={addComment}>
              <label>Add a comment</label>
              <textarea value={comment} onChange={(e) => setComment(e.target.value)} />
              <button className="btn" style={{ marginTop: 12 }}>Post comment</button>
            </form>
          </section>
        </>
      )}
    </Layout>
  );
}
