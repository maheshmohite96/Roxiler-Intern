const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/auth.routes");
const adminRoutes = require("./routes/admin.routes");
const storeRoutes = require("./routes/store.routes");
const ratingRoutes = require("./routes/rating.routes");
const ownerRoutes = require("./routes/owner.routes");
const cors = require("cors");

const app = express();

app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
}));

app.use("/api/auth", authRoutes);
app.use("/api/stores", storeRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/ratings", ratingRoutes);
app.use('/api/owner', ownerRoutes);

module.exports = app;