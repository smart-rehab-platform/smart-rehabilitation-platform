const express = require("express");

const usersController = require("./users.controller");

const authenticate = require("../../middleware/auth.middleware");
const authorizeRoles = require("../../middleware/role.middleware");
const upload =
  require("../../middleware/upload.middleware");
const router = express.Router();
console.log("getAllUsers:", typeof usersController.getAllUsers);
console.log("getMyProfile:", typeof usersController.getMyProfile);
console.log("updateMyProfile:", typeof usersController.updateMyProfile);
console.log("updateUserStatus:", typeof usersController.updateUserStatus);
console.log("getUserById:", typeof usersController.getUserById);


router.get(
  "/",
  authenticate,
  authorizeRoles("admin"),
  usersController.getAllUsers
);

router.get(
  "/profile/me",
  authenticate,
  usersController.getMyProfile
);

router.put(
  "/profile/me",
  authenticate,
  usersController.updateMyProfile
);

router.patch(
  "/:id/status",
  authenticate,
  authorizeRoles("admin"),
  usersController.updateUserStatus
);

router.put(
  "/:id",
  authenticate,
  authorizeRoles("admin"),
  usersController.updateUserById
);
router.delete(
  "/:id",
  authenticate,
  authorizeRoles("admin"),
  usersController.deleteUserById
);
router.post(
  "/profile/image",
  authenticate,
  upload.single("image"),
  usersController.uploadProfileImage
);

router.get(
  "/:id",
  authenticate,
  authorizeRoles("admin"),
  usersController.getUserById
);


module.exports = router;