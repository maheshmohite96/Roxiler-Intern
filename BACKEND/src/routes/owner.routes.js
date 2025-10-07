const express = require('express');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth.middleware');
const DB = require('../db/db');

const router = express.Router();

// Get ratings for the logged-in owner's store
router.get('/my-ratings', authenticateToken, authorizeRoles('Owner'), async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Find the store owned by the current user
        const [store] = await DB.query('SELECT id FROM stores WHERE ownerId = ?', [userId]);

        if (!store.length) {
            return res.status(404).json({ error: 'Store not found for this owner' });
        }
        
        const storeId = store[0].id;
        
        // Fetch all ratings for that specific store, along with detailed user information
        const [ratings] = await DB.query(
            `SELECT r.id, r.rating, r.created_at, 
                    u.id AS user_id, u.fullName AS userName, u.email AS userEmail
             FROM ratings r
             JOIN users u ON r.user_id = u.id
             WHERE r.store_id = ?
             ORDER BY r.created_at DESC`,
            [storeId]
        );

        // Format the response to include success flag and data structure
        res.json({ 
            success: true, 
            data: { 
                ratings: ratings.map(rating => ({
                    ...rating,
                    date: rating.created_at // Ensure date field is available for frontend
                }))
            } 
        });
    } catch (error) {
        console.error('Error fetching owner ratings:', error);
        res.status(500).json({ error: 'Failed to fetch ratings' });
    }
});

module.exports = router;