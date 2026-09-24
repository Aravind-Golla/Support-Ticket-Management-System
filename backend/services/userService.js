const db = require('../db');

async function listAgents() {
  const rows = await db.query(
    `SELECT id, name, email, role, created_at
     FROM users
     WHERE role = ?
     ORDER BY name ASC`,
    ['agent']
  );
  return rows;
}

module.exports = { listAgents };
