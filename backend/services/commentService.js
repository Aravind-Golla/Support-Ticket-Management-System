const db = require('../db');
const { AppError } = require('../middleware/errorHandler');
const { isNonEmptyString } = require('../middleware/validate');
const ticketService = require('./ticketService');

async function listComments(ticketId, user) {
  await ticketService.getTicketForUser(ticketId, user);
  const rows = await db.query(
    `SELECT
      tc.id,
      tc.ticket_id,
      tc.user_id,
      tc.comment,
      tc.created_at,
      u.name AS user_name,
      u.email AS user_email,
      u.role AS user_role
    FROM ticket_comments tc
    INNER JOIN users u ON u.id = tc.user_id
    WHERE tc.ticket_id = ?
    ORDER BY tc.created_at ASC`,
    [ticketId]
  );
  return rows.map((row) => ({
    id: row.id,
    ticket_id: row.ticket_id,
    comment: row.comment,
    created_at: row.created_at,
    user: {
      id: row.user_id,
      name: row.user_name,
      email: row.user_email,
      role: row.user_role,
    },
  }));
}

async function addComment(ticketId, user, comment) {
  await ticketService.getTicketForUser(ticketId, user);
  if (!isNonEmptyString(comment, 1, 3000)) {
    throw new AppError(400, 'Comment cannot be empty');
  }

  const result = await db.query(
    'INSERT INTO ticket_comments (ticket_id, user_id, comment) VALUES (?, ?, ?)',
    [ticketId, user.id, comment.trim()]
  );

  const rows = await db.query(
    `SELECT
      tc.id,
      tc.ticket_id,
      tc.user_id,
      tc.comment,
      tc.created_at,
      u.name AS user_name,
      u.email AS user_email,
      u.role AS user_role
    FROM ticket_comments tc
    INNER JOIN users u ON u.id = tc.user_id
    WHERE tc.id = ?
    LIMIT 1`,
    [result.insertId]
  );

  const row = rows[0];
  return {
    id: row.id,
    ticket_id: row.ticket_id,
    comment: row.comment,
    created_at: row.created_at,
    user: {
      id: row.user_id,
      name: row.user_name,
      email: row.user_email,
      role: row.user_role,
    },
  };
}

module.exports = { listComments, addComment };
