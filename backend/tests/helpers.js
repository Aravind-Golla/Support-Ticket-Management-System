const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function ensureTestDatabase() {
  const host = process.env.DB_HOST || 'localhost';
  const port = Number(process.env.DB_PORT || 3306);
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.TEST_DB_NAME || 'support_tickets_test';

  const root = await mysql.createConnection({ host, port, user, password, multipleStatements: true });
  await root.query(
    `CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  );
  await root.end();

  const schemaSql = fs
    .readFileSync(path.join(__dirname, '../../database/schema.sql'), 'utf8')
    .replace(/support_tickets/g, database);

  const conn = await mysql.createConnection({ host, port, user, password, database, multipleStatements: true });
  await conn.query(schemaSql);
  await conn.query('SET FOREIGN_KEY_CHECKS = 0');
  await conn.query('TRUNCATE TABLE ticket_comments');
  await conn.query('TRUNCATE TABLE tickets');
  await conn.query('TRUNCATE TABLE users');
  await conn.query('SET FOREIGN_KEY_CHECKS = 1');
  await conn.end();
}

module.exports = { ensureTestDatabase };
