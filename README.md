# Support Ticket Management System

A full-stack support desk for customers to open tickets and agents to triage, assign, and resolve them.

## Features

- Customer registration and JWT login
- Customer ticket creation, search, filtering, sorting, comments, and deletion of own open tickets
- Agent dashboard with statistics, assignment, status/priority updates, and comments
- Role-based API authorization (401 vs 403)
- MySQL persistence with foreign keys and indexes
- Jest + Supertest API tests against a dedicated test database
- Postman collection for manual API verification

## Tech Stack

- Frontend: React.js, JavaScript, React Router, Axios, Vite, CSS
- Backend: Node.js, Express.js
- Database: MySQL 8
- Auth: JWT + bcrypt
- Tests: Jest, Supertest
- API docs: Postman collection

## Architecture

The React SPA talks to a REST API over Axios. The Express app uses a layered layout: routes → controllers → services → `mysql2` connection pool. JWT middleware authenticates requests; `requireRole` enforces agent-only actions. Customers only see their own tickets.

## Project Structure

```
frontend/     React client (Vite)
backend/      Express API
database/     schema.sql, seed.sql, queries.sql
postman/      Postman collection
```

## Prerequisites

- Node.js 18+
- MySQL 8 running locally or remotely
- Git

## Installation

```bash
cd backend && npm install
cd ../frontend && npm install
```

Copy environment files:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Set `JWT_SECRET` to a long random value. Set `DB_PASSWORD` to your MySQL password.

## MySQL setup

Windows example (service `MySQL80` already installed):

```bash
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p
```

Optional Docker MySQL:

```bash
docker compose up -d
```

`docker-compose.yml` expects `MYSQL_ROOT_PASSWORD` in the environment.

## Database setup

```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

Windows:

```bash
"/c/Program Files/MySQL/MySQL Server 8.0/bin/mysql.exe" -u root -p < database/schema.sql
"/c/Program Files/MySQL/MySQL Server 8.0/bin/mysql.exe" -u root -p < database/seed.sql
```

Tests use a separate database named `support_tickets_test` so they do not wipe development data.

## Environment variables

Backend (`backend/.env`):

| Variable | Purpose |
| --- | --- |
| `PORT` | API port (default 5000) |
| `DB_HOST` `DB_PORT` `DB_USER` `DB_PASSWORD` `DB_NAME` | MySQL connection |
| `JWT_SECRET` | Signing key for JWT |
| `JWT_EXPIRES_IN` | Token lifetime (default 7d) |
| `CORS_ORIGIN` | Comma-separated allowed frontend origins |

Frontend (`frontend/.env`):

| Variable | Purpose |
| --- | --- |
| `VITE_API_URL` | API base URL, e.g. `http://localhost:5000/api` |

Never commit `.env` files.

## How to run backend

```bash
cd backend
npm run dev
```

Health check: `GET http://localhost:5000/api/health` → `{ "status": "ok" }`

## How to run frontend

```bash
cd frontend
npm run dev
```

Open `http://localhost:5173`.

## How to run tests

```bash
cd backend
npm test
```

Jest/Supertest create and truncate `support_tickets_test` only.

## How to import Postman collection

1. Open Postman
2. Import `postman/Support-Ticket-System.postman_collection.json`
3. Set `baseUrl` to `http://localhost:5000/api`
4. Run **Login customer** and **Login agent** to populate tokens
5. Run ticket, comment, user, and security folders

## API endpoint table

| Method | Path | Access | Description |
| --- | --- | --- | --- |
| GET | `/api/health` | Public | Health + DB ping |
| POST | `/api/auth/register` | Public | Register customer |
| POST | `/api/auth/login` | Public | Login, returns JWT |
| GET | `/api/tickets` | Auth | List tickets (own or all) |
| POST | `/api/tickets` | Customer | Create ticket |
| GET | `/api/tickets/:id` | Auth + ownership | Ticket details |
| PUT | `/api/tickets/:id` | Agent | Update status, priority, assignee |
| DELETE | `/api/tickets/:id` | Agent, or customer own **open** ticket | Delete ticket |
| GET | `/api/tickets/:id/comments` | Auth + ownership | List comments |
| POST | `/api/tickets/:id/comments` | Auth + ownership | Add comment |
| GET | `/api/users` | Agent | List agents for assignment |
| GET | `/api/tickets/reports/open` | Agent | Open tickets JOIN report |

Query params for `GET /api/tickets`: `search`, `status`, `priority`, `sortBy`, `sortOrder`. `sortBy` is limited to `id`, `subject`, `priority`, `status`, `created_at`, `updated_at`.

## Authentication explanation

Passwords are hashed with bcrypt. Login compares hashes and returns a JWT containing `id`, `email`, and `role`. Send `Authorization: Bearer <token>` on protected routes. Tokens expire according to `JWT_EXPIRES_IN`.

## Authorization explanation

- `401` — missing, invalid, or expired JWT
- `403` — authenticated but not allowed (wrong role or another customer's ticket)
- Customers cannot register as agents
- Ticket `user_id` is always the authenticated customer; clients cannot supply another owner
- Agents can view/update any ticket
- Customers can delete only their own tickets while status is `open`
- Agents can delete any ticket

## Database schema explanation

- `users`: customers and agents (`role` ENUM)
- `tickets`: customer owner (`user_id`), optional agent (`assigned_to`), priority and status ENUMs, timestamps
- `ticket_comments`: comments linked to ticket and author
- Indexes on `users.email`, `tickets.status`, `tickets.user_id`, `tickets.assigned_to`

## JOIN query

```sql
SELECT
  t.id AS ticket_id,
  t.subject,
  t.status,
  u.name AS customer_name,
  u.email AS customer_email
FROM tickets t
INNER JOIN users u ON u.id = t.user_id
WHERE t.status = 'open';
```

Saved in `database/queries.sql` and exposed to agents at `GET /api/tickets/reports/open`.

## Security considerations

- Secrets only in environment variables
- Parameterized SQL everywhere; sort columns are allow-listed
- Password hashes never returned by the API
- Input validation on auth, tickets, and comments
- CORS restricted to `CORS_ORIGIN`
- Distinct 401 / 403 handling

## Deployment instructions

This repository is **deployment-ready**, not deployed from this environment (cloud logins are required).

### Frontend (Vercel)

1. Push the repo to GitHub
2. Import the `frontend` directory in Vercel
3. Set `VITE_API_URL` to `https://<your-api-host>/api`
4. Deploy

`frontend/vercel.json` enables SPA rewrites.

### Backend (Render)

1. Create a Node web service with root `backend`
2. Build: `npm install`
3. Start: `npm start`
4. Set `NODE_ENV=production`, MySQL variables, a strong `JWT_SECRET`, and `CORS_ORIGIN` to the Vercel URL
5. Confirm `GET /api/health` returns `{ "status": "ok" }`

A sample `backend/render.yaml` is included.

### Database

Provision a remotely reachable MySQL instance (PlanetScale, Railway, Amazon RDS, or a VPS). Run `database/schema.sql` and `database/seed.sql`. Open the port only to the backend host.

## Live URL placeholders

- Frontend: _not deployed_
- Backend: _not deployed_
- Database: local MySQL 8 (`MySQL80`) unless you provision a remote instance

## GitHub repository placeholder

- Repository URL: _create a GitHub remote and `git push -u origin main`_

## Test credentials for seeded users

| Role | Email | Password |
| --- | --- | --- |
| Customer | `customer@example.com` | `Password123` |
| Agent | `agent1@example.com` | `Password123` |
| Agent | `agent2@example.com` | `Password123` |

## Known limitations

- JWT is stored in `localStorage` (acceptable for this assessment; XSS would expose it)
- No email notifications or file attachments
- Stats on dashboards reflect the current filter result set plus listed tickets
- Agent accounts must be inserted via seed/SQL; public registration is customer-only

## Future enhancements

- Refresh tokens and HttpOnly cookies
- Pagination
- Attachments and SLA timers
- Audit log of assignment/status changes
- Real-time comment updates
