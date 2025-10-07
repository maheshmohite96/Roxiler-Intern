const DB = require("../db/db");
const { validationResult } = require("express-validator");

// Get store profile by owner ID
const getStoreProfile = async (req, res) => {
    try {
        const ownerId = req.user.id;

        const [rows] = await DB.query(
            "SELECT * FROM stores WHERE ownerId = ?",
            [ownerId]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Store profile not found"
            });
        }

        res.status(200).json({
            success: true,
            data: rows[0]
        });
    } catch (error) {
        console.error("Error fetching store profile:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Create or update store profile
const createOrUpdateStoreProfile = async (req, res) => {
    try {
        console.log("Received data:", req.body);

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log("Validation errors:", errors.array());
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: errors.array()
            });
        }

        const ownerId = req.user.id;
        const {
            storeName,
            ownerName,
            email,
            phone,
            address,
            description,
            establishedYear,
            website
        } = req.body;

        // Check if store profile already exists
        const [existingStore] = await query(
            "SELECT id FROM stores WHERE ownerId = ?",
            [ownerId]
        );

        if (existingStore.length > 0) {
            // Update existing store
            await query(
                `UPDATE stores SET 
                    storeName = ?, 
                    ownerName = ?, 
                    email = ?, 
                    phone = ?, 
                    address = ?, 
                    description = ?, 
                    establishedYear = ?, 
                    updatedAt = NOW()
                WHERE ownerId = ?`,
                [
                    storeName,
                    ownerName,
                    email,
                    phone,
                    address,
                    description,
                    establishedYear,
                    ownerId
                ]
            );

            res.status(200).json({
                success: true,
                message: "Store profile updated successfully"
            });
        } else {
            // Create new store profile
            await query(
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
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    storeName,
                    ownerName,
                    email,
                    phone,
                    address,
                    description,
                    establishedYear,
                    website,
                    ownerId
                ]
            );

            res.status(201).json({
                success: true,
                message: "Store profile created successfully"
            });
        }
    } catch (error) {
        console.error("Error creating/updating store profile:", error);

        // Handle duplicate email error
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({
                success: false,
                message: "Email already exists"
            });
        }

        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Delete store profile
const deleteStoreProfile = async (req, res) => {
    try {
        const ownerId = req.user.id;

        const [result] = await query(
            "DELETE FROM stores WHERE ownerId = ?",
            [ownerId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Store profile not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Store profile deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting store profile:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Get all stores (for admin purposes and public browsing)
const getAllStores = async (req, res) => {
    try {
        // Get the current user ID if authenticated
        const userId = req.user?.id || null;

        // Try to get stores with ratings, fallback to stores without ratings if ratings table doesn't exist
        let query = `
            SELECT s.id, s.storeName as name, s.email, s.address, s.description, 
                   DATE_FORMAT(s.createdAt, '%Y-%m-%d %H:%i:%s') as created_at,
                   u.fullName as userFullName, u.fullName as owner_name,
                   COALESCE(AVG(r.rating), 0) as average_rating, 
                   COUNT(r.id) as total_ratings,
                   (SELECT rating FROM ratings WHERE store_id = s.id AND user_id = ?) as user_rating
            FROM stores s 
            JOIN users u ON s.ownerId = u.id
            LEFT JOIN ratings r ON s.id = r.store_id
            GROUP BY s.id, s.storeName, s.email, s.address, s.description, s.createdAt, u.fullName
            ORDER BY s.storeName ASC
        `;

        try {
            const [rows] = await DB.query(query, [userId]);
            res.status(200).json({
                success: true,
                data: rows
            });
        } catch (dbErr) {
            // If ratings table doesn't exist, retry without ratings
            console.log("Ratings table not found, fetching stores without ratings");
            const fallbackQuery = `
                SELECT s.id, s.storeName as name, s.email, s.address, s.description,
                       DATE_FORMAT(s.createdAt, '%Y-%m-%d %H:%i:%s') as created_at,
                       u.fullName as userFullName, u.fullName as owner_name,
                       0 as average_rating, 0 as total_ratings,
                       NULL as user_rating
                FROM stores s 
                JOIN users u ON s.ownerId = u.id
                ORDER BY s.storeName ASC
            `;
            const [fallbackRows] = await DB.query(fallbackQuery);
            res.status(200).json({
                success: true,
                data: fallbackRows
            });
        }
    } catch (error) {
        console.error("Error fetching all stores:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

module.exports = {
    getStoreProfile,
    createOrUpdateStoreProfile,
    deleteStoreProfile,
    getAllStores
};
