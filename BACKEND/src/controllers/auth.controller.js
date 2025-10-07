const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const DB = require("../db/db");


// User register function (supports role: Admin/Normal User/Owner)
async function registerUser(req, res) {
  const { fullName, email, password, address, role } = req.body;

  try {
    const [isUserExist] = await DB.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (isUserExist.length > 0) {
      return res.status(400).json({ message: "User Already Exist" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userRole = role && ["Admin", "Normal User", "Owner"].includes(role) ? role : "Normal User";

    const [result] = await DB.query(
      "INSERT INTO users (fullName, email, password, address, role) VALUES (?, ?, ?, ?, ?)",
      [fullName, email, hashedPassword, address, userRole]
    );

    const userId = result.insertId;

    const token = jwt.sign({ id: userId }, process.env.JWT_SECRET);
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });

    res.status(201).json({
      message: "User Registered Successfully",
      user: { id: userId, email, fullName, address, role: userRole },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

//User login function (role-aware: Admin / Normal User / Owner)
async function loginUser(req, res) {
  try {
    const { email, password, role } = req.body;

    // Map role variants to DB values if provided
    let roleFilter = null;
    if (role) {
      const lower = String(role).toLowerCase();
      if (lower === 'admin') roleFilter = 'Admin';
      else if (lower === 'owner') roleFilter = 'Owner';
      else if (lower === 'user' || lower === 'normal user') roleFilter = 'Normal User';
      else return res.status(400).json({ message: 'Invalid role' });
    }

    let query = "SELECT * FROM users WHERE email = ?";
    const params = [email];
    if (roleFilter) {
      query += " AND LOWER(role) = LOWER(?)";
      params.push(roleFilter);
    }

    const [user] = await DB.query(query, params);
    if (user.length === 0) {
      return res.status(400).json({ message: "User Not Found" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user[0].password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid email or Password" });
    }

    const token = jwt.sign({ id: user[0].id }, process.env.JWT_SECRET);
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });

    res.status(200).json({
      message: "User Logged In Successfully",
      user: {
        id: user[0].id,
        email: user[0].email,
        fullName: user[0].fullName || user[0].name,
        address: user[0].address,
        role: user[0].role || roleFilter || null,
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

//User logout function

function logoutUser(req, res) {
  res.clearCookie("token");
  res.status(200).json({
    message: "User Logged Out Successfully"
  });
}


// Return current session user using JWT cookie
async function me(req, res) {
  try {
    const token = req.cookies?.token;
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const [rows] = await DB.query("SELECT id, email, fullName, address, role FROM users WHERE id = ?", [payload.id]);
    if (!rows?.length) return res.status(401).json({ message: "Unauthorized" });
    return res.json({ user: rows[0] });
  } catch (e) {
    return res.status(401).json({ message: "Unauthorized" });
  }
}

// Change password function
async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required"
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long"
      });
    }

    // Get current user data
    const [userRows] = await DB.query(
      "SELECT password FROM users WHERE id = ?",
      [userId]
    );

    if (!userRows.length) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, userRows[0].password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect"
      });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password in database
    await DB.query(
      "UPDATE users SET password = ? WHERE id = ?",
      [hashedNewPassword, userId]
    );

    res.status(200).json({
      success: true,
      message: "Password changed successfully"
    });

  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
}

// Forgot password function
async function forgotPassword(req, res) {
  try {
    const { email } = req.body;

    // Validate input
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }

    // Check if user exists
    const [userRows] = await DB.query(
      "SELECT id, email, fullName FROM users WHERE email = ?",
      [email]
    );

    if (!userRows.length) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email address"
      });
    }

    const user = userRows[0];

    // Generate a simple reset token (in production, use a more secure method)
    const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now

    // Store reset token in database (you might want to create a separate table for this)
    await DB.query(
      "UPDATE users SET resetToken = ?, resetTokenExpiry = ? WHERE id = ?",
      [resetToken, resetTokenExpiry, user.id]
    );

    // In a real application, you would send an email here
    // For now, we'll just return the token (remove this in production)
    console.log(`Password reset token for ${email}: ${resetToken}`);

    res.status(200).json({
      success: true,
      message: "Password reset instructions have been sent to your email",
      // Remove this in production - only for development
      resetToken: resetToken
    });

  } catch (error) {
    console.error("Error in forgot password:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
}

// Reset password function
async function resetPassword(req, res) {
  try {
    const { token, newPassword } = req.body;

    // Validate input
    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Reset token and new password are required"
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long"
      });
    }

    // Check if token is valid and not expired
    const [userRows] = await DB.query(
      "SELECT id FROM users WHERE resetToken = ? AND resetTokenExpiry > NOW()",
      [token]
    );

    if (!userRows.length) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token"
      });
    }

    const userId = userRows[0].id;

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset token
    await DB.query(
      "UPDATE users SET password = ?, resetToken = NULL, resetTokenExpiry = NULL WHERE id = ?",
      [hashedNewPassword, userId]
    );

    res.status(200).json({
      success: true,
      message: "Password has been reset successfully"
    });

  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
}


// Update user profile function
async function updateProfile(req, res) {
  try {
    const userId = req.user.id;
    const { name, address } = req.body;

    // Update user profile in database
    await DB.query(
      "UPDATE users SET fullName = ?, address = ? WHERE id = ?",
      [name, address, userId]
    );

    res.status(200).json({
      success: true,
      message: "Profile updated successfully"
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
}

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  me,
  changePassword,
  forgotPassword,
  resetPassword,
  updateProfile,
};
