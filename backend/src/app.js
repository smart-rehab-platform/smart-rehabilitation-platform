const express = require("express");
const cors = require("cors");
const usersRoutes = require("./modules/users/users.routes");
const authRoutes = require("./modules/auth/auth.routes");

const app = express();

app.use(cors());
app.use(express.json());
app.get("/", (req, res) => {
  res.json({
    message: "Smart Rehab Backend API Running"
  });
});
app.use("/api/v1/users", usersRoutes);

app.use("/api/v1/auth", authRoutes);

module.exports = app;