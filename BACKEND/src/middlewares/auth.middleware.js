const jwt = require("jsonwebtoken");
const { query } = require("../db/db");

// Authentication middleware
const authenticateToken = async (req, res, next) => {
    try {
        const token = req.cookies?.token;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Access token required"
            });
        }

        const payload = jwt.verify(token, process.env.JWT_SECRET);

        const [rows] = await query(
            "SELECT id, email, fullName, address, role FROM users WHERE id = ?",
            [payload.id]
        );

        if (!rows?.length) {
            return res.status(401).json({
                success: false,
                message: "Invalid token"
            });
        }

        req.user = rows[0];
        next();
    } catch (error) {
        console.error("Authentication error:", error);
        return res.status(401).json({
            success: false,
            message: "Invalid token"
        });
    }
};

// Role-based authorization middleware
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "Access denied. Insufficient permissions"
            });
        }

        next();
    };
};

module.exports = {
    authenticateToken,
    authorizeRoles
};
