-- ========================================================
-- SUPPORT TICKET MANAGEMENT SYSTEM - CLOUD INIT SCRIPT
-- Compatible with TiDB Cloud, Aiven, Clever Cloud, MySQL 8
-- ========================================================

-- 1. Create Users Table
CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('customer', 'agent') NOT NULL DEFAULT 'customer',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email),
  KEY idx_users_role (role)
) ENGINE=InnoDB;

-- 2. Create Tickets Table
CREATE TABLE IF NOT EXISTS tickets (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  subject VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  priority ENUM('low', 'medium', 'high') NOT NULL DEFAULT 'medium',
  status ENUM('open', 'in_progress', 'closed') NOT NULL DEFAULT 'open',
  assigned_to INT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_tickets_status (status),
  KEY idx_tickets_user_id (user_id),
  KEY idx_tickets_assigned_to (assigned_to),
  KEY idx_tickets_priority (priority),
  KEY idx_tickets_created_at (created_at),
  CONSTRAINT fk_tickets_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_tickets_assigned_agent
    FOREIGN KEY (assigned_to) REFERENCES users(id)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 3. Create Ticket Comments Table
CREATE TABLE IF NOT EXISTS ticket_comments (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  ticket_id INT UNSIGNED NOT NULL,
  user_id INT UNSIGNED NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_comments_ticket_id (ticket_id),
  KEY idx_comments_user_id (user_id),
  CONSTRAINT fk_comments_ticket
    FOREIGN KEY (ticket_id) REFERENCES tickets(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_comments_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 4. Clean Any Existing Records
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE ticket_comments;
TRUNCATE TABLE tickets;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- 5. Seed Users (Plaintext password for all seeded users: Password123)
INSERT INTO users (id, name, email, password_hash, role) VALUES
(1, 'John Customer', 'customer@example.com', '$2b$10$9feVNwtEI8cO0EyhyeZWhOa.BCXnUwvEUh5/cOe.6kDhXLMx5Iym6', 'customer'),
(2, 'Sarah Agent', 'agent1@example.com', '$2b$10$9feVNwtEI8cO0EyhyeZWhOa.BCXnUwvEUh5/cOe.6kDhXLMx5Iym6', 'agent'),
(3, 'Michael Support', 'agent2@example.com', '$2b$10$9feVNwtEI8cO0EyhyeZWhOa.BCXnUwvEUh5/cOe.6kDhXLMx5Iym6', 'agent');

-- 6. Seed Sample Tickets
INSERT INTO tickets (id, user_id, subject, description, priority, status, assigned_to) VALUES
(1, 1, 'Printer not connecting to Wi-Fi', 'The office printer on the second floor loses Wi-Fi connection randomly.', 'medium', 'open', NULL),
(2, 1, 'VPN access error', 'Getting error code 403 when trying to connect to corporate VPN from home.', 'high', 'in_progress', 2),
(3, 1, 'Software license renewal query', 'Requesting info on when our software licenses expire.', 'low', 'closed', 3);

-- 7. Seed Sample Ticket Comments
INSERT INTO ticket_comments (id, ticket_id, user_id, comment) VALUES
(1, 2, 2, 'Hi John, I am reviewing your VPN profile configuration.'),
(2, 2, 1, 'Thank you Sarah, let me know if you need my IP address.'),
(3, 3, 3, 'Your license has been renewed until Dec 2026. Closing this ticket.');
