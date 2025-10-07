-- Create stores table
CREATE TABLE IF NOT EXISTS stores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    storeName VARCHAR(100) NOT NULL,
    ownerName VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(15) NOT NULL,
    address TEXT NOT NULL,
    description TEXT,
    establishedYear INT,
    website VARCHAR(255),
    ownerId INT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (ownerId) REFERENCES users(id) ON DELETE CASCADE
);

-- Create index on ownerId for better performance
CREATE INDEX idx_stores_owner_id ON stores(ownerId);

-- Create index on email for better performance
CREATE INDEX idx_stores_email ON stores(email);
