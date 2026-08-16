const express = require("express");

const communicationController = require("./communication.controller");

const authenticate = require("../../middleware/auth.middleware");
const authorizeRoles = require("../../middleware/role.middleware");

const router = express.Router();

router.post(
  "/conversations",
  authenticate,
  authorizeRoles("admin", "specialist", "parent"),
  communicationController.createConversation
);

router.get(
  "/conversations",
  authenticate,
  communicationController.getAllConversations
);

router.get(
  "/users/:id/conversations",
  authenticate,
  communicationController.getUserConversations
);

router.get(
  "/patients/:id/conversations",
  authenticate,
  communicationController.getPatientConversations
);

router.post(
  "/conversations/:id/messages",
  authenticate,
  authorizeRoles("admin", "specialist", "parent"),
  communicationController.createMessage
);

router.post(
  "/conversations/:id/attachments",
  authenticate,
  authorizeRoles("admin", "specialist", "parent"),
  communicationController.createConversationAttachment
);

router.get(
  "/conversations/:id/messages",
  authenticate,
  communicationController.getConversationMessages
);

router.patch(
  "/conversations/:id/messages/read",
  authenticate,
  communicationController.markConversationMessagesAsRead
);

router.post(
  "/messages/:id/attachments",
  authenticate,
  authorizeRoles("admin", "specialist", "parent"),
  communicationController.addMessageAttachment
);

router.patch(
  "/messages/:id/read",
  authenticate,
  communicationController.markMessageAsRead
);

router.get(
  "/conversations/:id",
  authenticate,
  communicationController.getConversationById
);

module.exports = router;