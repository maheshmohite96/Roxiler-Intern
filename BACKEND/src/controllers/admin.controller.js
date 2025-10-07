const DB = require('../db/db');

async function handleDashboardStats (req, res) {
    try {
        const [[usersCount]] = await DB.query('SELECT COUNT(*) AS total_users FROM users');
        const [[storesCount]] = await DB.query('SELECT COUNT(*) AS total_stores FROM stores');
        // ratings table may not exist yet; handle gracefully
        let totalRatings = 0;
        try {
            const [[ratingsCount]] = await DB.query('SELECT COUNT(*) AS total_ratings FROM ratings');
            totalRatings = parseInt(ratingsCount.total_ratings || 0);
        } catch (_) { totalRatings = 0; }

        res.json({
            totalUsers: parseInt(usersCount.total_users || 0),
            totalStores: parseInt(storesCount.total_stores || 0),
            totalRatings
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ error: 'Failed to get dashboard data' });
    }
}


async function handleGetAllUsersBySortingAndFiltering (req, res) {
    try {
        const {
            search,
            role,
            sortBy = 'fullName',
            sortOrder = 'asc'
        } = req.query;

        // Map external role values to DB values
        let normalizedRole = role;
        if (role) {
            const lower = String(role).toLowerCase();
            if (lower === 'store_owner' || lower === 'owner') normalizedRole = 'Owner';
            else if (lower === 'admin') normalizedRole = 'Admin';
            else if (lower === 'normal user' || lower === 'user' || lower === 'customer') normalizedRole = 'Normal User';
        }

        // CORRECTED: Use CASE statement to only calculate average_rating for owners
        let query = `
            SELECT
                u.id,
                u.fullName,
                u.email,
                u.address,
                u.role,
                u.user_created AS created_at,
                CASE
                    WHEN u.role = 'Owner' THEN ROUND(AVG(r.rating), 2)
                    ELSE NULL
                END AS average_rating
            FROM users u
            LEFT JOIN stores s ON s.ownerId = u.id
            LEFT JOIN ratings r ON r.store_id = s.id
        `;

        const params = [];
        const where = [];

        if (search) {
            where.push('(u.fullName LIKE ? OR u.email LIKE ? OR u.address LIKE ?)');
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }
        if (normalizedRole) {
            where.push('u.role = ?');
            params.push(normalizedRole);
        }
        if (where.length) query += ' WHERE ' + where.join(' AND ');

        query += ' GROUP BY u.id, u.fullName, u.email, u.address, u.role, u.user_created';

        const validSort = ['fullName', 'email', 'address', 'role', 'created_at', 'average_rating'];
        const validOrder = ['asc', 'desc'];
        const sortField = validSort.includes(sortBy) ? sortBy : 'fullName';
        const order = validOrder.includes((sortOrder || '').toLowerCase()) ? sortOrder.toUpperCase() : 'ASC';
        const sortColumn = sortField === 'fullName' ? 'u.fullName' : sortField === 'created_at' ? 'u.user_created' : sortField;
        query += ` ORDER BY ${sortColumn} ${order}`;

        try {
            const [rows] = await DB.query(query, params);
            return res.json({ users: rows, total: rows.length });
        } catch (dbErr) {
            // If ratings table doesn't exist, retry without ratings join/columns
            const queryWithoutRatings = `
                SELECT *
                FROM users u
                ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
                ORDER BY ${sortColumn} ${order}
            `;
            const [fallbackRows] = await DB.query(queryWithoutRatings, params);
            return res.json({ users: fallbackRows, total: fallbackRows.length });
        }
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Failed to get users' });
    }
}

async function handleCreateUser (req, res) {
    try {
        const { name, email, password, address, role } = req.body;

        // Basic validations
        if (!name || !email || !password || !address || !role) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        // Validate password length
        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        // Validate role
        const validRoles = ['user', 'store_owner', 'admin'];
        const normalizedRole = role.toLowerCase();
        if (!validRoles.includes(normalizedRole)) {
            return res.status(400).json({ error: 'Invalid role' });
        }

        // Map frontend roles to database roles
        let dbRole;
        switch (normalizedRole) {
            case 'user':
                dbRole = 'Normal User';
                break;
            case 'store_owner':
                dbRole = 'Owner';
                break;
            case 'admin':
                dbRole = 'Admin';
                break;
            default:
                dbRole = 'Normal User';
        }

        // Check if email already exists
        const [existingUser] = await DB.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        // Hash password
        const bcrypt = require('bcryptjs');
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insert user
        await DB.query(
            'INSERT INTO users (fullName, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
            [name, email, hashedPassword, address, dbRole]
        );

        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({ error: 'Failed to create user' });
    }
}

async function handleUpdateUser (req, res) {
    try {
        const { id } = req.params;
        const { name, email, password, address, role } = req.body;

        // Check if user exists
        const [userRows] = await DB.query('SELECT id, fullName, email, role FROM users WHERE id = ?', [id]);
        if (!userRows.length) {
            return res.status(404).json({ error: 'User not found' });
        }

        const existingUser = userRows[0];

        // Basic validations
        if (!name || !email || !address || !role) {
            return res.status(400).json({ error: 'Name, email, address and role are required' });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        // Validate role
        const validRoles = ['user', 'store_owner', 'admin'];
        const normalizedRole = role.toLowerCase();
        if (!validRoles.includes(normalizedRole)) {
            return res.status(400).json({ error: 'Invalid role' });
        }

        // Map frontend roles to database roles
        let dbRole;
        switch (normalizedRole) {
            case 'user':
                dbRole = 'Normal User';
                break;
            case 'store_owner':
                dbRole = 'Owner';
                break;
            case 'admin':
                dbRole = 'Admin';
                break;
            default:
                dbRole = 'Normal User';
        }

        // Check if email already exists (excluding current user)
        if (email !== existingUser.email) {
            const [emailCheck] = await DB.query('SELECT id FROM users WHERE email = ? AND id != ?', [email, id]);
            if (emailCheck.length > 0) {
                return res.status(400).json({ error: 'Email already exists' });
            }
        }

        // Execute update (no password update)
        await DB.query(
            'UPDATE users SET fullName = ?, email = ?, address = ?, role = ? WHERE id = ?',
            [name, email, address, dbRole, id]
        );

        res.json({ message: 'User updated successfully' });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ error: 'Failed to update user' });
    }
}

async function handleGetUserDetail (req, res) {
    try {
        const { id } = req.params;
        const [rows] = await DB.query(`
      SELECT u.id, u.fullName AS name, u.email, u.address, u.role, u.user_created AS created_at,
        CASE WHEN u.role = 'Owner' THEN ROUND(AVG(r.rating), 2) ELSE NULL END AS average_rating
      FROM users u
      LEFT JOIN stores s ON s.ownerId = u.id
      LEFT JOIN ratings r ON r.store_id = s.id
      WHERE u.id = ?
      GROUP BY u.id, u.fullName, u.email, u.address, u.role, u.user_created
    `, [id]);

        if (!rows.length) return res.status(404).json({ error: 'User not found' });
        res.json({ user: rows[0] });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Failed to get user' });
    }
}

async function handleDeleteUser (req, res) {
    try {
        const { id } = req.params;
        const [userRows] = await DB.query('SELECT id, fullName AS name, role FROM users WHERE id = ?', [id]);
        if (!userRows.length) return res.status(404).json({ error: 'User not found' });
        const user = userRows[0];
        if (user.id === req.user.id) return res.status(400).json({ error: 'Cannot delete your own account' });

        if (user.role === 'Admin') {
            const [[adminCount]] = await DB.query('SELECT COUNT(*) AS count FROM users WHERE role = "Admin"');
            if (parseInt(adminCount.count || 0) <= 1) return res.status(400).json({ error: 'Cannot delete the last admin user' });
        }

        const [ownStores] = await DB.query('SELECT id FROM stores WHERE ownerId = ?', [id]);
        if (ownStores.length) return res.status(400).json({ error: 'Cannot delete user who owns stores. Please delete their stores first.' });

        await DB.query('DELETE FROM ratings WHERE user_id = ?', [id]);
        await DB.query('DELETE FROM users WHERE id = ?', [id]);
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
}

async function handleGetAllStoresBySortingAndSearching (req, res) {
    try {
        const { search, sortBy = 'name', sortOrder = 'asc' } = req.query;
        let query = `
      SELECT s.id, s.storeName AS name, s.email, s.address, s.createdAt AS created_at,
        u.fullName AS owner_name, u.email AS owner_email,
        COALESCE(AVG(r.rating), 0) AS average_rating, COUNT(r.id) AS total_ratings
      FROM stores s
      LEFT JOIN users u ON s.ownerId = u.id
      LEFT JOIN ratings r ON s.id = r.store_id
    `;

        const params = [];
        if (search) {
            query += ' WHERE s.storeName LIKE ? OR s.email LIKE ? OR s.address LIKE ? OR u.fullName LIKE ?';
            params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
        }
        query += ' GROUP BY s.id, s.storeName, s.email, s.address, s.createdAt, u.fullName, u.email';

        const validSort = ['name', 'email', 'address', 'created_at', 'average_rating', 'total_ratings'];
        const validOrder = ['asc', 'desc'];
        const sortField = validSort.includes(sortBy) ? sortBy : 'name';
        const order = validOrder.includes((sortOrder || '').toLowerCase()) ? sortOrder.toUpperCase() : 'ASC';
        const sortColumn = sortField === 'name' ? 's.storeName' : sortField === 'created_at' ? 's.createdAt' : sortField;
        query += ` ORDER BY ${sortColumn} ${order}`;

        try {
            const [rows] = await DB.query(query, params);
            return res.json({ stores: rows, total: rows.length });
        } catch (dbErr) {
            // Retry without ratings if ratings table is missing
            let fallbackQuery = `
        SELECT s.id, s.storeName AS name, s.email, s.address, s.createdAt AS created_at,
          u.fullName AS owner_name, u.email AS owner_email
        FROM stores s
        LEFT JOIN users u ON s.ownerId = u.id
      `;
            const fallbackParams = [...params];
            if (search) {
                fallbackQuery += ' WHERE s.storeName LIKE ? OR s.email LIKE ? OR s.address LIKE ? OR u.fullName LIKE ?';
            }
            fallbackQuery += ' GROUP BY s.id, s.storeName, s.email, s.address, s.createdAt, u.fullName, u.email';
            const sortField = ['name', 'email', 'address', 'created_at'].includes(sortBy) ? sortBy : 'name';
            const order = ['asc', 'desc'].includes((sortOrder || '').toLowerCase()) ? sortOrder.toUpperCase() : 'ASC';
            const sortColumn = sortField === 'name' ? 's.storeName' : sortField === 'created_at' ? 's.createdAt' : sortField;
            fallbackQuery += ` ORDER BY ${sortColumn} ${order}`;

            const [fallbackRows] = await DB.query(fallbackQuery, fallbackParams);
            return res.json({ stores: fallbackRows, total: fallbackRows.length });
        }
    } catch (error) {
        console.error('Get stores error:', error);
        res.status(500).json({ error: 'Failed to get stores' });
    }
}

async function handleCreateStore (req, res) {
    try {
        const { name, email, address, ownerId } = req.body;

        // Basic validations
        if (!name || !email || !address || !ownerId) {
            return res.status(400).json({ error: 'name, email, address and ownerId are required' });
        }

        // Ensure owner exists and is role Owner
        const [ownerRows] = await DB.query('SELECT id, fullName, role FROM users WHERE id = ?', [ownerId]);
        if (!ownerRows.length) {
            return res.status(404).json({ error: 'Owner not found' });
        }
        const owner = ownerRows[0];
        if (owner.role !== 'Owner') {
            return res.status(400).json({ error: 'Selected user is not an Owner' });
        }

        // Insert store. Some columns are NOT NULL in schema; provide safe defaults
        // phone is NOT NULL, so provide placeholder; other optional columns can be null
        const phonePlaceholder = 'N/A';
        await DB.query(
            `INSERT INTO stores (
                storeName,
                ownerName,
                email,
                phone,
                address,
                description,
                establishedYear,
                website,
                ownerId
            ) VALUES (?, ?, ?, ?, ?, NULL, NULL, NULL, ?)`,
            [name, owner.fullName, email, phonePlaceholder, address, ownerId]
        );

        return res.status(201).json({ message: 'Store created successfully' });
    } catch (error) {
        // Handle duplicate email gracefully
        if (error && error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'A store with this email already exists' });
        }
        console.error('Create store error:', error);
        return res.status(500).json({ error: 'Failed to create store' });
    }
}

async function handleDeleteStore (req, res) {
    try {
        const { id } = req.params;
        const [storeRows] = await DB.query('SELECT id, storeName AS name FROM stores WHERE id = ?', [id]);
        if (!storeRows.length) return res.status(404).json({ error: 'Store not found' });
        await DB.query('DELETE FROM ratings WHERE store_id = ?', [id]);
        await DB.query('DELETE FROM stores WHERE id = ?', [id]);
        res.json({ message: 'Store deleted successfully' });
    } catch (error) {
        console.error('Delete store error:', error);
        res.status(500).json({ error: 'Failed to delete store' });
    }
}

module.exports = {
    handleDashboardStats,
    handleGetAllUsersBySortingAndFiltering,
    handleCreateUser,
    handleUpdateUser,
    handleGetUserDetail,
    handleDeleteUser,
    handleGetAllStoresBySortingAndSearching,
    handleCreateStore,
    handleDeleteStore,
}