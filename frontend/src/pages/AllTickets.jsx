import { useEffect, useState } from 'react';
import api from '../services/api.js';
import Layout from '../components/Layout.jsx';
import TicketFilters from '../components/TicketFilters.jsx';
import TicketTable from '../components/TicketTable.jsx';
import Alert from '../components/Alert.jsx';
import Loading from '../components/Loading.jsx';

const defaultFilters = { search: '', status: '', priority: '', sortBy: 'created_at', sortOrder: 'DESC' };

export default function AllTickets() {
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

  return (
    <Layout title="All Tickets">
      <Alert>{error}</Alert>
      <TicketFilters values={filters} onChange={setFilters} />
      {loading ? <Loading /> : <TicketTable tickets={tickets} />}
    </Layout>
  );
}
