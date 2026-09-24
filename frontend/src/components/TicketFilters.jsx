import { useState } from 'react';

export default function TicketFilters({ values, onChange, extra }) {
  const [local, setLocal] = useState(values);

  const update = (key, value) => {
    const next = { ...local, [key]: value };
    setLocal(next);
    onChange(next);
  };

  return (
    <div className="toolbar">
      <input
        placeholder="Search subject or description"
        value={local.search}
        onChange={(e) => update('search', e.target.value)}
      />
      <select value={local.status} onChange={(e) => update('status', e.target.value)}>
        <option value="">All statuses</option>
        <option value="open">Open</option>
        <option value="in_progress">In progress</option>
        <option value="closed">Closed</option>
      </select>
      <select value={local.priority} onChange={(e) => update('priority', e.target.value)}>
        <option value="">All priorities</option>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>
      <select value={local.sortBy} onChange={(e) => update('sortBy', e.target.value)}>
        <option value="created_at">Created</option>
        <option value="updated_at">Updated</option>
        <option value="priority">Priority</option>
        <option value="status">Status</option>
        <option value="id">ID</option>
        <option value="subject">Subject</option>
      </select>
      <select value={local.sortOrder} onChange={(e) => update('sortOrder', e.target.value)}>
        <option value="DESC">Desc</option>
        <option value="ASC">Asc</option>
      </select>
      {extra}
    </div>
  );
}
