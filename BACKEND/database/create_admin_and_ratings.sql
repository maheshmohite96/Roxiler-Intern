-- -- Admins table
-- CREATE TABLE IF NOT EXISTS admin (
--   id INT AUTO_INCREMENT PRIMARY KEY,
--   name VARCHAR(100) NOT NULL,
--   email VARCHAR(255) NOT NULL UNIQUE,
--   password_hash VARCHAR(255) NOT NULL,
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
-- );

-- Ratings table (if not exists)
CREATE TABLE IF NOT EXISTS ratings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  store_id INT NOT NULL,
  user_id INT NULL,
  rating TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_ratings_store ON ratings(store_id);
CREATE INDEX IF NOT EXISTS idx_ratings_user ON ratings(user_id);



-- Insert default admin user (password: Admin@1234)
INSERT INTO users (name, email, password_hash, address, role) 
VALUES (
    'System Administrator',
    'admin@example.com',
    '$2b$10$KZx2tmSArvdmQfeGDJ1qMOxpvzlKro1OujG8B5a/1W6eiaJHTtWNW',
    'Admin Street, Admin City, AC 12345',
    'admin'
) ON DUPLICATE KEY UPDATE id=id; 