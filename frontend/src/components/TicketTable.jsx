import { Link } from 'react-router-dom';
import { PriorityBadge, StatusBadge } from './Badges.jsx';
import EmptyState from './EmptyState.jsx';

function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleString();
}

export default function TicketTable({ tickets, detailsPrefix = '/tickets' }) {
  if (!tickets.length) {
    return <EmptyState message="No tickets match your filters." />;
  }

  return (
    <div className="table-wrap card">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Subject</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Created</th>
            <th>Updated</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((ticket) => (
            <tr key={ticket.id}>
              <td>#{ticket.id}</td>
              <td>{ticket.subject}</td>
              <td><PriorityBadge priority={ticket.priority} /></td>
              <td><StatusBadge status={ticket.status} /></td>
              <td>{formatDate(ticket.created_at)}</td>
              <td>{formatDate(ticket.updated_at)}</td>
              <td>
                <Link className="btn secondary" to={`${detailsPrefix}/${ticket.id}`.replace('//', '/')}>
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
