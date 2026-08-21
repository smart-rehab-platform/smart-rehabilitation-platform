const express = require("express");

const notificationsController = require("./notifications.controller");
const deviceTokensController = require("./deviceTokens.controller");

const authenticate = require("../../middleware/auth.middleware");
const authorizeRoles = require("../../middleware/role.middleware");

const router = express.Router();

router.post(
  "/notifications",
  authenticate,
  authorizeRoles("admin", "specialist"),
  notificationsController.createNotification
);

router.get(
  "/notifications",
  authenticate,
  notificationsController.getAllNotifications
);

router.get(
  "/users/:id/notifications/unread",
  authenticate,
  notificationsController.getUserUnreadNotifications
);

router.get(
  "/users/:id/notifications",
  authenticate,
  notificationsController.getUserNotifications
);

router.patch(
  "/notifications/read-all",
  authenticate,
  notificationsController.markAllAsRead
);

router.post(
  "/notifications/device-tokens",
  authenticate,
  deviceTokensController.registerDeviceToken
);

router.delete(
  "/notifications/device-tokens",
  authenticate,
  deviceTokensController.unregisterDeviceToken
);

router.patch(
  "/notifications/:id/read",
  authenticate,
  notificationsController.markAsRead
);

router.get(
  "/notifications/:id",
  authenticate,
  notificationsController.getNotificationById
);

router.delete(
  "/notifications/:id",
  authenticate,
  authorizeRoles("admin"),
  notificationsController.deleteNotification
);

module.exports = router;