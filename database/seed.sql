-- Seed data for Support Ticket Management System
-- Passwords for all seeded users are hashed with bcrypt (Plaintext: Password123)

USE support_tickets;

-- Clear existing data
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE ticket_comments;
TRUNCATE TABLE tickets;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- Insert users (1 customer, 2 agents)
INSERT INTO users (id, name, email, password_hash, role) VALUES
(1, 'John Customer', 'customer@example.com', '$2b$10$9feVNwtEI8cO0EyhyeZWhOa.BCXnUwvEUh5/cOe.6kDhXLMx5Iym6', 'customer'),
(2, 'Sarah Agent', 'agent1@example.com', '$2b$10$9feVNwtEI8cO0EyhyeZWhOa.BCXnUwvEUh5/cOe.6kDhXLMx5Iym6', 'agent'),
(3, 'Michael Support', 'agent2@example.com', '$2b$10$9feVNwtEI8cO0EyhyeZWhOa.BCXnUwvEUh5/cOe.6kDhXLMx5Iym6', 'agent');

-- Insert tickets
INSERT INTO tickets (id, user_id, subject, description, priority, status, assigned_to) VALUES
(1, 1, 'Printer not connecting to Wi-Fi', 'The office printer on the second floor loses Wi-Fi connection randomly.', 'medium', 'open', NULL),
(2, 1, 'VPN access error', 'Getting error code 403 when trying to connect to corporate VPN from home.', 'high', 'in_progress', 2),
(3, 1, 'Software license renewal query', 'Requesting info on when our software licenses expire.', 'low', 'closed', 3);

-- Insert ticket comments
INSERT INTO ticket_comments (id, ticket_id, user_id, comment) VALUES
(1, 2, 2, 'Hi John, I am reviewing your VPN profile configuration.'),
(2, 2, 1, 'Thank you Sarah, let me know if you need my IP address.'),
(3, 3, 3, 'Your license has been renewed until Dec 2026. Closing this ticket.');
