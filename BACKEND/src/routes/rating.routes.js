const express = require('express');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth.middleware');
const {
  getUserRating,
  createOrUpdateRating,
  deleteRating,
  getStoreRatings
} = require('../controllers/rating.controller');
const router = express.Router();

// Get a user's rating for a specific store
router.get('/:storeId', authenticateToken, authorizeRoles('Normal User'), getUserRating);

// Create or update a rating for a store
router.post('/:storeId', authenticateToken, authorizeRoles('Normal User'), createOrUpdateRating);

// Delete user's rating for a store
router.delete('/:storeId', authenticateToken, authorizeRoles('Normal User'), deleteRating);

// Get all ratings for a particular store (owner/admin)
router.get('/store/:storeId', authenticateToken, getStoreRatings);

module.exports = router;
