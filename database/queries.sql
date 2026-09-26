-- Required JOIN: all open tickets with customer names and emails
-- Use this after schema and seed have been applied.

USE support_tickets;

SELECT
  t.id AS ticket_id,
  t.subject,
  t.status,
  u.name AS customer_name,
  u.email AS customer_email
FROM tickets t
INNER JOIN users u ON u.id = t.user_id
WHERE t.status = 'open';
