const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');
const config = require('../config');
const { AppError } = require('../middleware/errorHandler');
const { isNonEmptyString, isValidEmail } = require('../middleware/validate');

function toPublicUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    created_at: row.created_at,
  };
}

function signToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role, email: user.email },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );
}

async function registerCustomer({ name, email, password }) {
  if (!isNonEmptyString(name, 2, 120)) {
    throw new AppError(400, 'Name is required (2-120 characters)');
  }
  if (!isValidEmail(email)) {
    throw new AppError(400, 'A valid email is required');
  }
  if (!isNonEmptyString(password, 8, 128)) {
    throw new AppError(400, 'Password must be at least 8 characters');
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existing = await db.query('SELECT id FROM users WHERE email = ? LIMIT 1', [normalizedEmail]);
  if (existing.length > 0) {
    throw new AppError(409, 'An account with this email already exists');
  }

  const passwordHash = await bcrypt.hash(password, config.bcryptRounds);
  const result = await db.query(
    'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
    [name.trim(), normalizedEmail, passwordHash, 'customer']
  );

  const rows = await db.query(
    'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
    [result.insertId]
  );
  const user = toPublicUser(rows[0]);
  const token = signToken(user);
  return { user, token };
}

async function login({ email, password }) {
  if (!isValidEmail(email) || !isNonEmptyString(password, 1, 128)) {
    throw new AppError(400, 'Email and password are required');
  }

  const normalizedEmail = email.trim().toLowerCase();
  const rows = await db.query(
    'SELECT id, name, email, password_hash, role, created_at FROM users WHERE email = ? LIMIT 1',
    [normalizedEmail]
  );
  if (rows.length === 0) {
    throw new AppError(401, 'Invalid email or password');
  }

  const userRow = rows[0];
  const match = await bcrypt.compare(password, userRow.password_hash);
  if (!match) {
    throw new AppError(401, 'Invalid email or password');
  }

  const user = toPublicUser(userRow);
  const token = signToken(user);
  return { user, token };
}

module.exports = { registerCustomer, login, toPublicUser, signToken };
