const DB = require("../db/db");

// View User Details function
async function viewUserDetails(req, res) {
  const { userId } = req.params;

  try {
    const [userDetails] = await DB.query(
      "SELECT fullName, email, address, role FROM users WHERE id = ?",
      [userId]
    );

    if (userDetails.length === 0) {
      return res.status(404).json({ message: "User Not Found" });
    }

    const user = userDetails[0];

    if (user.role === "Store Owner") {
      const [ratings] = await DB.query(
        "SELECT AVG(rating) as averageRating FROM ratings WHERE storeOwnerId = ?",
        [userId]
      );
      user.averageRating = ratings[0].averageRating || 0;
    }

    res.status(200).json({
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

module.exports = {
  viewUserDetails,
};