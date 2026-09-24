const db = require('../db');
const { AppError } = require('../middleware/errorHandler');
const {
  ALLOWED_PRIORITIES,
  ALLOWED_STATUSES,
  ALLOWED_SORT_COLUMNS,
  ALLOWED_SORT_ORDERS,
  isNonEmptyString,
} = require('../middleware/validate');

function mapTicket(row) {
  if (!row) return null;
  return {
    id: row.id,
    user_id: row.user_id,
    subject: row.subject,
    description: row.description,
    priority: row.priority,
    status: row.status,
    assigned_to: row.assigned_to,
    created_at: row.created_at,
    updated_at: row.updated_at,
    customer_name: row.customer_name || null,
    customer_email: row.customer_email || null,
    assigned_agent_name: row.assigned_agent_name || null,
    assigned_agent_email: row.assigned_agent_email || null,
  };
}

const TICKET_SELECT = `
  SELECT
    t.id,
    t.user_id,
    t.subject,
    t.description,
    t.priority,
    t.status,
    t.assigned_to,
    t.created_at,
    t.updated_at,
    c.name AS customer_name,
    c.email AS customer_email,
    a.name AS assigned_agent_name,
    a.email AS assigned_agent_email
  FROM tickets t
  INNER JOIN users c ON c.id = t.user_id
  LEFT JOIN users a ON a.id = t.assigned_to
`;

async function getTicketById(id) {
  const rows = await db.query(`${TICKET_SELECT} WHERE t.id = ? LIMIT 1`, [id]);
  return mapTicket(rows[0]);
}

async function assertTicketAccess(ticket, user) {
  if (!ticket) {
    throw new AppError(404, 'Ticket not found');
  }
  if (user.role === 'agent') return;
  if (ticket.user_id !== user.id) {
    throw new AppError(403, 'You are not authorized to access this ticket');
  }
}

async function createTicket(user, { subject, description, priority }) {
  if (user.role !== 'customer') {
    throw new AppError(403, 'Only customers can create tickets');
  }
  if (!isNonEmptyString(subject, 3, 200)) {
    throw new AppError(400, 'Subject is required (3-200 characters)');
  }
  if (!isNonEmptyString(description, 5, 5000)) {
    throw new AppError(400, 'Description is required (5-5000 characters)');
  }
  const normalizedPriority = typeof priority === 'string' ? priority.trim().toLowerCase() : '';
  if (!ALLOWED_PRIORITIES.includes(normalizedPriority)) {
    throw new AppError(400, 'Priority must be low, medium, or high');
  }

  const result = await db.query(
    'INSERT INTO tickets (user_id, subject, description, priority, status) VALUES (?, ?, ?, ?, ?)',
    [user.id, subject.trim(), description.trim(), normalizedPriority, 'open']
  );
  return getTicketById(result.insertId);
}

async function listTickets(user, queryParams) {
  const { search, status, priority, sortBy, sortOrder } = queryParams || {};
  const conditions = [];
  const params = [];

  if (user.role === 'customer') {
    conditions.push('t.user_id = ?');
    params.push(user.id);
  }

  if (status) {
    const normalized = String(status).trim().toLowerCase();
    if (!ALLOWED_STATUSES.includes(normalized)) {
      throw new AppError(400, 'Invalid status filter');
    }
    conditions.push('t.status = ?');
    params.push(normalized);
  }

  if (priority) {
    const normalized = String(priority).trim().toLowerCase();
    if (!ALLOWED_PRIORITIES.includes(normalized)) {
      throw new AppError(400, 'Invalid priority filter');
    }
    conditions.push('t.priority = ?');
    params.push(normalized);
  }

  if (search && String(search).trim()) {
    const term = `%${String(search).trim()}%`;
    conditions.push('(t.subject LIKE ? OR t.description LIKE ?)');
    params.push(term, term);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const column = ALLOWED_SORT_COLUMNS.includes(sortBy) ? sortBy : 'created_at';
  const order = ALLOWED_SORT_ORDERS.includes(String(sortOrder || '').toUpperCase())
    ? String(sortOrder).toUpperCase()
    : 'DESC';

  const sql = `${TICKET_SELECT} ${where} ORDER BY t.${column} ${order}`;
  const rows = await db.query(sql, params);
  return rows.map(mapTicket);
}

async function getTicketForUser(id, user) {
  const ticketId = Number(id);
  if (!Number.isInteger(ticketId) || ticketId <= 0) {
    throw new AppError(400, 'Invalid ticket id');
  }
  const ticket = await getTicketById(ticketId);
  await assertTicketAccess(ticket, user);
  return ticket;
}

async function updateTicket(id, user, payload) {
  if (user.role !== 'agent') {
    throw new AppError(403, 'Only agents can update tickets');
  }

  const ticketId = Number(id);
  if (!Number.isInteger(ticketId) || ticketId <= 0) {
    throw new AppError(400, 'Invalid ticket id');
  }

  const ticket = await getTicketById(ticketId);
  if (!ticket) {
    throw new AppError(404, 'Ticket not found');
  }

  const updates = [];
  const params = [];

  if (payload.status !== undefined) {
    const status = String(payload.status).trim().toLowerCase();
    if (!ALLOWED_STATUSES.includes(status)) {
      throw new AppError(400, 'Status must be open, in_progress, or closed');
    }
    updates.push('status = ?');
    params.push(status);
  }

  if (payload.priority !== undefined) {
    const priority = String(payload.priority).trim().toLowerCase();
    if (!ALLOWED_PRIORITIES.includes(priority)) {
      throw new AppError(400, 'Priority must be low, medium, or high');
    }
    updates.push('priority = ?');
    params.push(priority);
  }

  if (payload.assigned_to !== undefined) {
    if (payload.assigned_to === null || payload.assigned_to === '') {
      updates.push('assigned_to = NULL');
    } else {
      const agentId = Number(payload.assigned_to);
      if (!Number.isInteger(agentId) || agentId <= 0) {
        throw new AppError(400, 'Invalid assigned agent');
      }
      const agents = await db.query(
        'SELECT id, role FROM users WHERE id = ? LIMIT 1',
        [agentId]
      );
      if (agents.length === 0) {
        throw new AppError(400, 'Assigned user does not exist');
      }
      if (agents[0].role !== 'agent') {
        throw new AppError(400, 'Assigned user must have the agent role');
      }
      updates.push('assigned_to = ?');
      params.push(agentId);
    }
  }

  if (updates.length === 0) {
    throw new AppError(400, 'No valid fields provided to update');
  }

  params.push(ticketId);
  await db.query(`UPDATE tickets SET ${updates.join(', ')} WHERE id = ?`, params);
  return getTicketById(ticketId);
}

async function deleteTicket(id, user) {
  const ticketId = Number(id);
  if (!Number.isInteger(ticketId) || ticketId <= 0) {
    throw new AppError(400, 'Invalid ticket id');
  }

  const ticket = await getTicketById(ticketId);
  if (!ticket) {
    throw new AppError(404, 'Ticket not found');
  }

  if (user.role === 'customer') {
    if (ticket.user_id !== user.id) {
      throw new AppError(403, 'You are not authorized to delete this ticket');
    }
    if (ticket.status !== 'open') {
      throw new AppError(403, 'Customers can only delete their own open tickets');
    }
  } else if (user.role !== 'agent') {
    throw new AppError(403, 'You are not authorized to delete this ticket');
  }

  await db.query('DELETE FROM tickets WHERE id = ?', [ticketId]);
  return { id: ticketId };
}

async function getOpenTicketsWithCustomers() {
  const rows = await db.query(
    `SELECT
      t.id AS ticket_id,
      t.subject,
      t.status,
      u.name AS customer_name,
      u.email AS customer_email
    FROM tickets t
    INNER JOIN users u ON u.id = t.user_id
    WHERE t.status = ?`,
    ['open']
  );
  return rows;
}

module.exports = {
  createTicket,
  listTickets,
  getTicketForUser,
  updateTicket,
  deleteTicket,
  getOpenTicketsWithCustomers,
};
