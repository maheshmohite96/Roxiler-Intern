const { body } = require('express-validator');

// Auth: register
const validateUserRegistration = [
    body('fullName')
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be between 2 and 100 characters'),

    body('address')
        .optional()
        .isLength({ max: 400 })
        .withMessage('Address must be maximum 400 characters'),

    body('email')
        .isEmail()
        .withMessage('Invalid email format')
        .normalizeEmail(),

    body('password')
        .matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,16}$/)
        .withMessage('Password must be 8-16 chars, include 1 uppercase and 1 special character'),

    body('role')
        .optional()
        .isIn(['Admin', 'Normal User', 'Owner'])
        .withMessage('Invalid role'),
];

// Auth: change password
const validateChangePassword = [
    body('currentPassword')
        .notEmpty()
        .withMessage('Current password is required'),
    body('newPassword')
        .isLength({ min: 6, max: 50 })
        .withMessage('New password must be between 6 and 50 characters')
        .matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*]).{6,50}$/)
        .withMessage('New password must include at least 1 uppercase letter and 1 special character'),
];

// Auth: forgot / reset password
const validateForgotPassword = [
    body('email')
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail(),
];

const validateResetPassword = [
    body('token').notEmpty().withMessage('Reset token is required'),
    body('newPassword')
        .isLength({ min: 6, max: 50 })
        .withMessage('New password must be between 6 and 50 characters')
        .matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*]).{6,50}$/)
        .withMessage('New password must include at least 1 uppercase letter and 1 special character'),
];

// Store owner: profile upsert
const validateStoreProfile = [
    body('storeName')
        .notEmpty().withMessage('Store name is required')
        .isLength({ min: 1, max: 100 }).withMessage('Store name must be between 1 and 100 characters'),

    body('ownerName')
        .notEmpty().withMessage('Owner name is required')
        .isLength({ min: 1, max: 100 }).withMessage('Owner name must be between 1 and 100 characters'),

    body('email')
        .isEmail().withMessage('Please provide a valid email address')
        .normalizeEmail(),

    body('phone')
        .notEmpty().withMessage('Phone number is required')
        .isLength({ min: 5, max: 20 }).withMessage('Phone number must be between 5 and 20 characters'),

    body('address')
        .notEmpty().withMessage('Address is required')
        .isLength({ min: 5, max: 500 }).withMessage('Address must be between 5 and 500 characters'),

    body('description')
        .optional()
        .isLength({ max: 1000 }).withMessage('Description must not exceed 1000 characters'),

    body('establishedYear')
        .optional()
        .custom((value) => {
            if (value === '' || value === null || value === undefined) return true;
            const year = parseInt(value);
            if (isNaN(year) || year < 1900 || year > new Date().getFullYear()) {
                throw new Error('Please provide a valid establishment year between 1900 and current year');
            }
            return true;
        }),

    body('website')
        .optional()
        .custom((value) => {
            if (value === '' || value === null || value === undefined) return true;
            if (value.length > 0 && !value.includes('.')) {
                throw new Error('Please provide a valid website URL');
            }
            return true;
        }),
];

// Admin: create/update store payload (name/email/address/ownerId)
const validateAdminStorePayload = [
    body('name').notEmpty().withMessage('Store name is required').isLength({ max: 100 }).withMessage('Store name too long'),
    body('email').isEmail().withMessage('Invalid email').normalizeEmail(),
    body('address').notEmpty().withMessage('Address is required').isLength({ max: 400 }).withMessage('Address must not exceed 400 characters'),
    body('ownerId').optional().isInt().withMessage('ownerId must be an integer'),
];

module.exports = {
    validateUserRegistration,
    validateChangePassword,
    validateForgotPassword,
    validateResetPassword,
    validateStoreProfile,
    validateAdminStorePayload,
};


