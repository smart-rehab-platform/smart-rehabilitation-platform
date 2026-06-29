const express = require("express");
const authenticate = require("../../middleware/auth.middleware");
const presenceController = require("./presence.controller");

const router = express.Router();

router.get("/users", authenticate, presenceController.getAllUsersPresence);
router.post("/users/bulk", authenticate, presenceController.getBulkUsersPresence);
router.get("/users/:id", authenticate, presenceController.getUserPresence);

module.exports = router;
