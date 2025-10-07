const express = require("express");
const authController = require('../controllers/auth.controller');
const { body } = require("express-validator");
const validationResult = require("../middlewares/validate.middleware");
const {
  validateUserRegistration,
  validateChangePassword,
  validateForgotPassword,
  validateResetPassword,
} = require('../middlewares/validationRules.middleware');
const { authenticateToken } = require("../middlewares/auth.middleware");

const router = express.Router();

const registerValidationRules = validateUserRegistration;

const changePasswordValidationRules = [
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),

  body("newPassword")
    .isLength({ min: 6, max: 50 })
    .withMessage("New password must be between 6 and 50 characters")
    .matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*]).{6,50}$/)
    .withMessage("New password must include at least 1 uppercase letter and 1 special character"),
];

const forgotPasswordValidationRules = [
  body("email")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),
];

const resetPasswordValidationRules = [
  body("token")
    .notEmpty()
    .withMessage("Reset token is required"),

  body("newPassword")
    .isLength({ min: 6, max: 50 })
    .withMessage("New password must be between 6 and 50 characters")
    .matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*]).{6,50}$/)
    .withMessage("New password must include at least 1 uppercase letter and 1 special character"),
];


router.post("/register",
  registerValidationRules,
  validationResult,
  authController.registerUser
);
// router.post("/user/login", authController.loginUser);
router.post("/login", authController.loginUser);
router.get("/user/logout", authController.logoutUser);
router.get("/me", authController.me);
router.put("/change-password",
  authenticateToken,
  validateChangePassword,
  validationResult,
  authController.changePassword
);

router.put("/profile",
  authenticateToken,
  [
    body("name")
      .isLength({ min: 20, max: 60 })
      .withMessage("Name must be between 20 and 60 characters"),
    body("address")
      .isLength({ max: 400 })
      .withMessage("Address must not exceed 400 characters"),
  ],
  validationResult,
  authController.updateProfile
);

router.post("/forgot-password",
  validateForgotPassword,
  validationResult,
  authController.forgotPassword
);

router.post("/reset-password",
  validateResetPassword,
  validationResult,
  authController.resetPassword
);


module.exports = router;
