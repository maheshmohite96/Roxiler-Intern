const express = require("express");
const { body, validationResult } = require("express-validator");
const {
    getStoreProfile,
    createOrUpdateStoreProfile,
    deleteStoreProfile,
    getAllStores
} = require("../controllers/store.controller");
const { authenticateToken, authorizeRoles } = require("../middlewares/auth.middleware");

const router = express.Router();

// Use centralized validation rules
const { validateStoreProfile: storeValidation } = require('../middlewares/validationRules.middleware');

// Test endpoint for debugging (remove in production)
router.post("/test-validation", storeValidation, (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: errors.array()
        });
    }
    res.json({ success: true, message: "Validation passed", data: req.body });
});

// Routes (protected - owner only)
router.get("/profile", authenticateToken, authorizeRoles("Owner"), getStoreProfile);
router.post("/profile", authenticateToken, authorizeRoles("Owner"), storeValidation, createOrUpdateStoreProfile);
router.put("/profile", authenticateToken, authorizeRoles("Owner"), storeValidation, createOrUpdateStoreProfile);
router.delete("/profile", authenticateToken, authorizeRoles("Owner"), deleteStoreProfile);

// Admin routes
router.get("/all", authenticateToken, authorizeRoles("Admin"), getAllStores);

// Public routes (for users to browse stores)
router.get("/public", getAllStores);

// Authenticated public route (for users to browse stores with their ratings)
router.get("/public/authenticated", authenticateToken, getAllStores);

module.exports = router;
