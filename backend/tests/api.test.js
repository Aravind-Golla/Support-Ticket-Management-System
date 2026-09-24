const request = require('supertest');
const bcrypt = require('bcrypt');
const { ensureTestDatabase } = require('./helpers');

let app;
let db;

beforeAll(async () => {
  await ensureTestDatabase();
  app = require('../server');
  db = require('../db');
});

afterAll(async () => {
  if (db && db.pool) {
    await db.pool.end();
  }
});

async function createAgent(email, password, name = 'Test Agent') {
  const hash = await bcrypt.hash(password, 10);
  await db.query(
    'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
    [name, email, hash, 'agent']
  );
}

describe('Authentication', () => {
  test('registration works', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Alice Customer',
      email: 'alice@example.com',
      password: 'Password123',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeTruthy();
    expect(res.body.data.user.role).toBe('customer');
    expect(res.body.data.user.password_hash).toBeUndefined();
    expect(res.body.data.user.password).toBeUndefined();
  });

  test('valid login succeeds', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'alice@example.com',
      password: 'Password123',
    });
    expect(res.status).toBe(200);
    expect(res.body.data.token).toBeTruthy();
    expect(res.body.data.user.email).toBe('alice@example.com');
  });

  test('invalid password returns 401', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'alice@example.com',
      password: 'WrongPassword',
    });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

describe('Tickets and authorization', () => {
  let customerToken;
  let otherCustomerToken;
  let agentToken;
  let ticketId;

  beforeAll(async () => {
    const customer = await request(app).post('/api/auth/login').send({
      email: 'alice@example.com',
      password: 'Password123',
    });
    customerToken = customer.body.data.token;

    const other = await request(app).post('/api/auth/register').send({
      name: 'Bob Customer',
      email: 'bob@example.com',
      password: 'Password123',
    });
    otherCustomerToken = other.body.data.token;

    await createAgent('agent.test@example.com', 'Password123');
    const agent = await request(app).post('/api/auth/login').send({
      email: 'agent.test@example.com',
      password: 'Password123',
    });
    agentToken = agent.body.data.token;
  });

  test('ticket creation works', async () => {
    const res = await request(app)
      .post('/api/tickets')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        subject: 'Cannot login',
        description: 'I am unable to login to the portal.',
        priority: 'high',
      });
    expect(res.status).toBe(201);
    expect(res.body.data.subject).toBe('Cannot login');
    expect(res.body.data.user_id).toBeTruthy();
    ticketId = res.body.data.id;
  });

  test('invalid ticket input returns 400', async () => {
    const res = await request(app)
      .post('/api/tickets')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ subject: '', description: '', priority: 'urgent' });
    expect(res.status).toBe(400);
  });

  test('unauthenticated ticket request returns 401', async () => {
    const res = await request(app).get('/api/tickets');
    expect(res.status).toBe(401);
  });

  test('customer cannot access another customer ticket', async () => {
    const res = await request(app)
      .get(`/api/tickets/${ticketId}`)
      .set('Authorization', `Bearer ${otherCustomerToken}`);
    expect(res.status).toBe(403);
  });

  test('agent can update ticket status', async () => {
    const res = await request(app)
      .put(`/api/tickets/${ticketId}`)
      .set('Authorization', `Bearer ${agentToken}`)
      .send({ status: 'in_progress' });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('in_progress');
  });

  test('invalid ticket ID returns 404', async () => {
    const res = await request(app)
      .get('/api/tickets/999999')
      .set('Authorization', `Bearer ${agentToken}`);
    expect(res.status).toBe(404);
  });

  test('customer cannot access agent-only endpoint', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${customerToken}`);
    expect(res.status).toBe(403);
  });
});
