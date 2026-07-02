const express = require("express");

const aiChatController = require("./aiChat.controller");
const aiChatValidation = require("./aiChat.validation");

const authenticate = require("../../middleware/auth.middleware");
const authorizeRoles = require("../../middleware/role.middleware");

const router = express.Router();

router.post(
  "/conversations",
  authenticate,
  authorizeRoles("admin", "specialist", "parent"),
  aiChatValidation.validateCreateConversation,
  aiChatController.createConversation
);

router.get(
  "/conversations",
  authenticate,
  authorizeRoles("admin", "specialist", "parent"),
  aiChatController.getConversations
);

router.get(
  "/conversations/:id",
  authenticate,
  authorizeRoles("admin", "specialist", "parent"),
  aiChatController.getConversationById
);

router.post(
  "/conversations/:id/messages",
  authenticate,
  authorizeRoles("admin", "specialist", "parent"),
  aiChatValidation.validateSendMessage,
  aiChatController.sendMessage
);

router.get(
  "/conversations/:id/messages",
  authenticate,
  authorizeRoles("admin", "specialist", "parent"),
  aiChatController.getConversationMessages
);

router.post(
  "/ask",
  authenticate,
  authorizeRoles("admin", "specialist", "parent"),
  aiChatValidation.validateAsk,
  aiChatController.ask
);

module.exports = router;
