const aiChatService = require("./aiChat.service");

const createConversation = async (req, res) => {
  try {
    const conversation = await aiChatService.createConversation(req.user.id);

    return res.status(201).json({
      success: true,
      message: "Chatbot conversation created successfully",
      data: conversation
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message
    });
  }
};

const getConversations = async (req, res) => {
  try {
    const conversations = await aiChatService.getUserConversations(req.user.id);

    return res.status(200).json({
      success: true,
      count: conversations.length,
      data: conversations
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message
    });
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
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message
    });
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
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message
    });
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
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message
    });
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
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message
    });
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
