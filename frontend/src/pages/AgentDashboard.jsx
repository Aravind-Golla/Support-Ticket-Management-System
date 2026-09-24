import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api.js';
import Layout from '../components/Layout.jsx';
import StatsCards from '../components/StatsCards.jsx';
import TicketFilters from '../components/TicketFilters.jsx';
import TicketTable from '../components/TicketTable.jsx';
import Alert from '../components/Alert.jsx';
import Loading from '../components/Loading.jsx';

const defaultFilters = { search: '', status: '', priority: '', sortBy: 'created_at', sortOrder: 'DESC' };

export default function AgentDashboard() {
  const [tickets, setTickets] = useState([]);
  const [filters, setFilters] = useState(defaultFilters);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setLoading(true);
      setError('');
      try {
        const res = await api.get('/tickets', { params: filters, signal: controller.signal });
        setTickets(res.data.data);
      } catch (err) {
        if (err.name !== 'CanceledError') {
          setError(err.response?.data?.message || 'Could not load tickets.');
        }
      } finally {
        setLoading(false);
      }
    }
    load();
    return () => controller.abort();
  }, [filters]);

  const stats = useMemo(() => ([
    { label: 'Total tickets', value: tickets.length },
    { label: 'Open', value: tickets.filter((t) => t.status === 'open').length },
    { label: 'In progress', value: tickets.filter((t) => t.status === 'in_progress').length },
    { label: 'Closed', value: tickets.filter((t) => t.status === 'closed').length },
    { label: 'High priority', value: tickets.filter((t) => t.priority === 'high').length },
  ]), [tickets]);

  return (
    <Layout
      title="Agent Dashboard"
      actions={<Link className="btn secondary" to="/agent/tickets">View all tickets</Link>}
    >
      <Alert>{error}</Alert>
      <StatsCards items={stats} />
      <TicketFilters values={filters} onChange={setFilters} />
      {loading ? <Loading /> : <TicketTable tickets={tickets} />}
    </Layout>
  );
}
