const communicationService = require("./communication.service");

const handleError = (res, err) => {
  const statusCode = err.statusCode || 500;
  const message =
    statusCode === 500
      ? "Request failed."
      : err.message || "Request failed.";

  return res.status(statusCode).json({
    success: false,
    message,
  });
};

const createConversation = async (req, res) => {
  try {
    const { conversation, created } = await communicationService.createConversation(
      req.body,
      req.user
    );

    return res.status(created ? 201 : 200).json({
      success: true,
      message: created
        ? "Conversation created successfully"
        : "Conversation already exists",
      data: conversation,
    });
  } catch (err) {
    return handleError(res, err);
  }
};

const getAllConversations = async (req, res) => {
  try {
    if (!communicationService.isAdmin(req.user)) {
      return res.status(403).json({
        success: false,
        message: "Access denied.",
      });
    }

    const conversations = await communicationService.getAllConversations();

    return res.status(200).json({
      success: true,
      count: conversations.length,
      data: conversations,
    });
  } catch (err) {
    return handleError(res, err);
  }
};

const getConversationById = async (req, res) => {
  try {
    const conversation = await communicationService.getConversationByIdForUser(
      req.params.id,
      req.user
    );

    return res.status(200).json({
      success: true,
      data: conversation,
    });
  } catch (err) {
    return handleError(res, err);
  }
};

const getUserConversations = async (req, res) => {
  try {
    if (
      !communicationService.isAdmin(req.user) &&
      req.params.id !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied.",
      });
    }

    const conversations = await communicationService.getUserConversations(
      req.params.id
    );

    return res.status(200).json({
      success: true,
      count: conversations.length,
      data: conversations,
    });
  } catch (err) {
    return handleError(res, err);
  }
};

const getPatientConversations = async (req, res) => {
  try {
    const allowed = await communicationService.canAccessPatientConversations(
      req.params.id,
      req.user
    );

    if (!allowed) {
      return res.status(403).json({
        success: false,
        message: "Access denied.",
      });
    }

    const conversations = await communicationService.getPatientConversations(
      req.params.id
    );

    return res.status(200).json({
      success: true,
      count: conversations.length,
      data: conversations,
    });
  } catch (err) {
    return handleError(res, err);
  }
};

const createMessage = async (req, res) => {
  try {
    const message = await communicationService.createMessage(
      req.params.id,
      req.body.content,
      req.user.id,
      req.user
    );

    return res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: message,
    });
  } catch (err) {
    return handleError(res, err);
  }
};

const createConversationAttachment = async (req, res) => {
  try {
    const message = await communicationService.createConversationAttachmentMessage(
      req.params.id,
      req.body,
      req.user.id,
      req.user
    );

    return res.status(201).json({
      success: true,
      message: "Attachment message sent successfully",
      data: message,
    });
  } catch (err) {
    return handleError(res, err);
  }
};

const getConversationMessages = async (req, res) => {
  try {
    const messages = await communicationService.getConversationMessages(
      req.params.id,
      req.user
    );

    return res.status(200).json({
      success: true,
      count: messages.length,
      data: messages,
    });
  } catch (err) {
    return handleError(res, err);
  }
};

const addMessageAttachment = async (req, res) => {
  try {
    const attachment = await communicationService.addMessageAttachment(
      req.params.id,
      req.body,
      req.user
    );

    return res.status(201).json({
      success: true,
      message: "Attachment added successfully",
      data: attachment,
    });
  } catch (err) {
    return handleError(res, err);
  }
};

const markMessageAsRead = async (req, res) => {
  try {
    const message = await communicationService.markMessageAsRead(
      req.params.id,
      req.user
    );

    return res.status(200).json({
      success: true,
      message: "Message marked as read successfully",
      data: message,
    });
  } catch (err) {
    return handleError(res, err);
  }
};

module.exports = {
  createConversation,
  getAllConversations,
  getConversationById,
  getUserConversations,
  getPatientConversations,
  createMessage,
  createConversationAttachment,
  getConversationMessages,
  addMessageAttachment,
  markMessageAsRead,
};
