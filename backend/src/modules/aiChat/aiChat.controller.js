const pool = require("../../database/db");
const aiChatService = require("./aiChat.service");

const respondWithServiceError = (res, error, fallbackMessage) => {
  if (pool.isConnectionExhaustedError?.(error)) {
    pool.logDatabaseError?.("aiChat.controller", error);
    return res.status(503).json({
      success: false,
      message: "The service is temporarily busy. Please try again in a moment.",
    });
  }

  return res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || fallbackMessage,
  });
};

const createConversation = async (req, res) => {
  try {
    const conversation = await aiChatService.createConversation(
      req.user.id,
      req.body.patient_id || null,
      req.user
    );

    return res.status(201).json({
      success: true,
      message: "Chatbot conversation created successfully",
      data: conversation
    });
  } catch (error) {
    return respondWithServiceError(res, error, "Failed to create conversation");
  }
};

const getConversations = async (req, res) => {
  try {
    const patientId =
      typeof req.query.patient_id === "string" && req.query.patient_id.trim()
        ? req.query.patient_id.trim()
        : null;

    const conversations = await aiChatService.getUserConversations(req.user.id, {
      patientId,
      user: req.user
    });

    return res.status(200).json({
      success: true,
      count: conversations.length,
      data: conversations
    });
  } catch (error) {
    return respondWithServiceError(res, error, "Failed to load conversations");
  }
};

const getConversationById = async (req, res) => {
  try {
    const conversation = await aiChatService.getConversationById(
      req.params.id,
      req.user.id
    );

    return res.status(200).json({
      success: true,
      data: conversation
    });
  } catch (error) {
    return respondWithServiceError(res, error, "Failed to load conversation");
  }
};

const sendMessage = async (req, res) => {
  try {
    const result = await aiChatService.sendMessage({
      conversationId: req.params.id,
      user: req.user,
      content: req.body.content,
      patientId: req.body.patient_id || null
    });

    return res.status(201).json({
      success: true,
      message: "Chatbot messages saved successfully",
      data: result
    });
  } catch (error) {
    return respondWithServiceError(res, error, "Failed to send message");
  }
};

const getConversationMessages = async (req, res) => {
  try {
    const messages = await aiChatService.getConversationMessages(
      req.params.id,
      req.user.id
    );

    return res.status(200).json({
      success: true,
      count: messages.length,
      data: messages
    });
  } catch (error) {
    return respondWithServiceError(res, error, "Failed to load messages");
  }
};

const ask = async (req, res) => {
  try {
    const result = await aiChatService.ask({
      conversationId: req.body.conversation_id || null,
      user: req.user,
      content: req.body.content,
      patientId: req.body.patient_id || null
    });

    return res.status(201).json({
      success: true,
      message: "Chatbot response generated successfully",
      data: result
    });
  } catch (error) {
    return respondWithServiceError(res, error, "Failed to generate response");
  }
};

module.exports = {
  createConversation,
  getConversations,
  getConversationById,
  sendMessage,
  getConversationMessages,
  ask
};
