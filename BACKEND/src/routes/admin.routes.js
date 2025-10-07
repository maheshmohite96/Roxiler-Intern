const express = require('express');
const { authenticateToken } = require('../middlewares/auth.middleware');
const DB = require('../db/db');
const { 
    handleDashboardStats, 
    handleGetAllUsersBySortingAndFiltering,
    handleCreateUser,
    handleUpdateUser,
    handleGetUserDetail,
    handleDeleteUser,
    handleGetAllStoresBySortingAndSearching,
    handleCreateStore,
    handleDeleteStore,
} = require('../controllers/admin.controller')
const router = express.Router();

// Simple admin check based on users.role === 'Admin'
async function requireAdmin(req, res, next) {
    try {
        const user = req.user;
        if (!user || user.role !== 'Admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }
        next();
    } catch (e) {
        return res.status(403).json({ error: 'Admin access required' });
    }
}

// Dashboard stats
router.get('/dashboard', authenticateToken, requireAdmin, handleDashboardStats);

// Get all users with filtering and sorting
router.get('/users', authenticateToken, requireAdmin, handleGetAllUsersBySortingAndFiltering);


// Create user
router.post('/users', authenticateToken, requireAdmin, handleCreateUser);

// Update user
router.put('/users/:id', authenticateToken, requireAdmin, handleUpdateUser);

// User detail
router.get('/users/:id', authenticateToken, requireAdmin, handleGetUserDetail );

// Delete user
router.delete('/users/:id', authenticateToken, requireAdmin, handleDeleteUser);

// Stores list with search/sort
router.get('/stores', authenticateToken, requireAdmin, handleGetAllStoresBySortingAndSearching);

// Create store (admin)
router.post('/stores', authenticateToken, requireAdmin, handleCreateStore);

// Delete store
router.delete('/stores/:id', authenticateToken, requireAdmin, handleDeleteStore);

module.exports = router;