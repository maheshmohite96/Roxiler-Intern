const mysql = require('mysql2/promise');
require('dotenv').config();

async function addResetTokenFields() {
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

        // Add reset token fields to users table
        try {
            await connection.execute(`
                ALTER TABLE users 
                ADD COLUMN resetToken VARCHAR(255) NULL,
                ADD COLUMN resetTokenExpiry TIMESTAMP NULL
            `);
            console.log('✅ Reset token fields added to users table');
        } catch (error) {
            if (error.code === 'ER_DUP_FIELDNAME') {
                console.log('ℹ️  Reset token fields already exist');
            } else {
                throw error;
            }
        }

        // Create index on resetToken
        try {
            await connection.execute(`
                CREATE INDEX idx_users_reset_token ON users(resetToken)
            `);
            console.log('✅ Index created on resetToken field');
        } catch (error) {
            if (error.code === 'ER_DUP_KEYNAME') {
                console.log('ℹ️  Index already exists');
            } else {
                console.log('⚠️  Index creation warning:', error.message);
            }
        }

        // Check table structure
        const [columns] = await connection.execute("DESCRIBE users");
        console.log('\n📋 Updated users table structure:');
        console.table(columns);

    } catch (error) {
        console.error('❌ Database update error:', error.message);
    } finally {
        if (connection) {
            await connection.end();
            console.log('\n🔌 Database connection closed');
        }
    }
}

// Run the update
addResetTokenFields();
