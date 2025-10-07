# Database Setup for Store Profile

## Overview
This document explains how to set up the MySQL database for the store profile functionality.

## Database Table Creation

### 1. Create the `stores` table
Run the SQL script to create the stores table:

```sql
-- Execute the create_stores_table.sql file
source database/create_stores_table.sql;
```

Or manually run the following SQL commands:

```sql
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
```

## API Endpoints

### Store Profile Endpoints (Owner Only)
- `GET /api/stores/profile` - Get store profile
- `POST /api/stores/profile` - Create store profile
- `PUT /api/stores/profile` - Update store profile
- `DELETE /api/stores/profile` - Delete store profile

### Admin Endpoints
- `GET /api/stores/all` - Get all stores (Admin only)

## Authentication
All store endpoints require authentication and are restricted to users with the "Owner" role, except for the admin endpoint which requires "Admin" role.

## Environment Variables
Make sure your `.env` file contains the following database configuration:

```env
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
USER_DB_NAME=your_database_name
JWT_SECRET=your_jwt_secret
```

## Testing the API

### 1. Create/Update Store Profile
```bash
curl -X PUT http://localhost:3000/api/stores/profile \
  -H "Content-Type: application/json" \
  -b "token=your_jwt_token" \
  -d '{
    "storeName": "My Electronics Store",
    "ownerName": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "address": "123 Main St, City, State 12345",
    "description": "Best electronics store in town",
    "establishedYear": 2020,
    "website": "https://myelectronics.com"
  }'
```

### 2. Get Store Profile
```bash
curl -X GET http://localhost:3000/api/stores/profile \
  -b "token=your_jwt_token"
```

## Frontend Integration
The frontend Profile component automatically:
- Loads profile data on page load
- Saves changes to the database
- Shows loading states and error messages
- Validates form data before submission

## Notes
- The `ownerId` field links to the `users` table
- Email must be unique across all stores
- All timestamps are automatically managed
- Foreign key constraint ensures data integrity
