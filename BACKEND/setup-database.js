const mysql = require('mysql2/promise');
require('dotenv').config();

async function setupDatabase() {
    let connection;

    try {
        // Create connection to MySQL server
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.USER_DB_NAME || 'roxiler_assignment'
        });

        console.log('Connected to MySQL database');

        // Create stores table
        const createStoresTable = `
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
            )
        `;

        await connection.execute(createStoresTable);
        console.log('✅ Stores table created successfully');

        // Create indexes
        const createIndexes = [
            'CREATE INDEX IF NOT EXISTS idx_stores_owner_id ON stores(ownerId)',
            'CREATE INDEX IF NOT EXISTS idx_stores_email ON stores(email)'
        ];

        for (const indexQuery of createIndexes) {
            try {
                await connection.execute(indexQuery);
                console.log('✅ Index created successfully');
            } catch (error) {
                if (error.code === 'ER_DUP_KEYNAME') {
                    console.log('ℹ️  Index already exists');
                } else {
                    console.log('⚠️  Index creation warning:', error.message);
                }
            }
        }

        // Check if table was created
        const [tables] = await connection.execute("SHOW TABLES LIKE 'stores'");
        if (tables.length > 0) {
            console.log('✅ Stores table exists and is ready to use');

            // Show table structure
            const [columns] = await connection.execute("DESCRIBE stores");
            console.log('\n📋 Table structure:');
            console.table(columns);
        } else {
            console.log('❌ Stores table was not created');
        }

    } catch (error) {
        console.error('❌ Database setup error:', error.message);

        if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.log('\n💡 Make sure your database credentials are correct in the .env file');
        } else if (error.code === 'ER_BAD_DB_ERROR') {
            console.log('\n💡 Make sure the database exists. You may need to create it first.');
        }
    } finally {
        if (connection) {
            await connection.end();
            console.log('\n🔌 Database connection closed');
        }
    }
}

// Run the setup
setupDatabase();
