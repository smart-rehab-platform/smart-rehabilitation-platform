const express = require("express");

const familyPatternsController = require("./familyPatterns.controller");
const authenticate = require("../../middleware/auth.middleware");

const router = express.Router();

router.get(
  "/patients/:id/family-patterns/details",
  authenticate,
  familyPatternsController.getFamilyPatternDetails
);

router.get(
  "/patients/:id/family-patterns",
  authenticate,
  familyPatternsController.getFamilyPatterns
);

module.exports = router;
