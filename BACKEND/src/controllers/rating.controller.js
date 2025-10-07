const DB = require('../db/db');

// Get user's rating for a specific store
const getUserRating = async (req, res) => {
  try {
    const { storeId } = req.params;
    const userId = req.user.id;

    const [rows] = await DB.query(
      'SELECT * FROM ratings WHERE store_id = ? AND user_id = ?',
      [storeId, userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Rating not found' });
    }

    res.status(200).json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('Error getting user rating:', error);
    res.status(500).json({ success: false, message: 'Failed to get rating' });
  }
};

// Create or update a rating
const createOrUpdateRating = async (req, res) => {
  try {
    const { storeId } = req.params;
    const { rating } = req.body;
    const userId = req.user.id;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }

    // Check if store exists
    const [storeRows] = await DB.query('SELECT id FROM stores WHERE id = ?', [storeId]);
    if (storeRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Store not found' });
    }

    // Check for existing rating
    const [existingRating] = await DB.query(
      'SELECT id FROM ratings WHERE store_id = ? AND user_id = ?',
      [storeId, userId]
    );

    if (existingRating.length > 0) {
      // Update existing rating
      try {
        await DB.query(
          'UPDATE ratings SET rating = ? WHERE store_id = ? AND user_id = ?',
          [rating, storeId, userId]
        );
        res.status(200).json({ success: true, message: 'Rating updated successfully' });
      } catch (updateError) {
        // If update fails due to column issues, try without comment
        console.log('Update failed, trying without comment column:', updateError.message);
        await DB.query(
          'UPDATE ratings SET rating = ? WHERE store_id = ? AND user_id = ?',
          [rating, storeId, userId]
        );
        res.status(200).json({ success: true, message: 'Rating updated successfully' });
      }
    } else {
      // Create new rating
      try {
        await DB.query(
          'INSERT INTO ratings (store_id, user_id, rating) VALUES (?, ?, ?)',
          [storeId, userId, rating]
        );
        res.status(201).json({ success: true, message: 'Rating created successfully' });
      } catch (insertError) {
        // If insert fails due to column issues, try without comment
        console.log('Insert failed, trying without comment column:', insertError.message);
        await DB.query(
          'INSERT INTO ratings (store_id, user_id, rating) VALUES (?, ?, ?)',
          [storeId, userId, rating]
        );
        res.status(201).json({ success: true, message: 'Rating created successfully' });
      }
    }
  } catch (error) {
    console.error('Error creating/updating rating:', error);
    res.status(500).json({ success: false, message: 'Failed to create/update rating' });
  }
};

// Delete a rating
const deleteRating = async (req, res) => {
  try {
    const { storeId } = req.params;
    const userId = req.user.id;

    // Check for existing rating
    const [existingRating] = await DB.query(
      'SELECT id FROM ratings WHERE store_id = ? AND user_id = ?',
      [storeId, userId]
    );

    if (existingRating.length === 0) {
      return res.status(404).json({ success: false, message: 'Rating not found' });
    }

    await DB.query('DELETE FROM ratings WHERE store_id = ? AND user_id = ?', [storeId, userId]);
    res.status(200).json({ success: true, message: 'Rating deleted successfully' });
  } catch (error) {
    console.error('Error deleting rating:', error);
    res.status(500).json({ success: false, message: 'Failed to delete rating' });
  }
};

// Get all ratings for a store
const getStoreRatings = async (req, res) => {
  try {
    const { storeId } = req.params;
    // Verify store exists
    const [storeRows] = await DB.query('SELECT id FROM stores WHERE id = ?', [storeId]);
    if (storeRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Store not found' });
    }

    const [rows] = await DB.query(
      `SELECT r.*, u.fullName as user_name
      FROM ratings r
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.store_id = ?
      ORDER BY r.created_at DESC`,
      [storeId]
    );
    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error('Error getting store ratings:', error);
    res.status(500).json({ success: false, message: 'Failed to get store ratings' });
  }
};

module.exports = {
  getUserRating,
  createOrUpdateRating,
  deleteRating,
  getStoreRatings
};
