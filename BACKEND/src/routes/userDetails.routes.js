const express = require("express");
const userDetailsController = require("../controllers/userDetails.controller");

const router = express.Router();

router.get("/:userId", userDetailsController.viewUserDetails);

module.exports = router;