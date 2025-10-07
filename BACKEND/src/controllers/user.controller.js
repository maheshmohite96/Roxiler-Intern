const DB = require("../db/db");
const applyFilters = require("../middlewares/filter.middleware");

// List Users function
async function listUsers(req, res) {
  try {
    const filters = req.query;
    const baseQuery = "SELECT fullName, email, address, role FROM users";
    const { query, values } = applyFilters(baseQuery, filters);

    const [users] = await DB.query(query, values);

    res.status(200).json({
      users,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

module.exports = {
  listUsers,
};