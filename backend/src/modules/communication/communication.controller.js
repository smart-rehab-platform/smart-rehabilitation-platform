const communicationService = require("./communication.service");

const createConversation = async (req, res) => {
  try {
    const conversation = await communicationService.createConversation(req.body);

    return res.status(201).json({
      success: true,
      message: "Conversation created successfully",
      data: conversation
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getAllConversations = async (req, res) => {
  try {
    const conversations = await communicationService.getAllConversations();

    return res.status(200).json({
      success: true,
      count: conversations.length,
      data: conversations
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getConversationById = async (req, res) => {
  try {
    const conversation = await communicationService.getConversationById(req.params.id);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: conversation
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getUserConversations = async (req, res) => {
  try {
    const conversations = await communicationService.getUserConversations(req.params.id);

    return res.status(200).json({
      success: true,
      count: conversations.length,
      data: conversations
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getPatientConversations = async (req, res) => {
  try {
    const conversations = await communicationService.getPatientConversations(req.params.id);

    return res.status(200).json({
      success: true,
      count: conversations.length,
      data: conversations
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const createMessage = async (req, res) => {
  try {
    const message = await communicationService.createMessage(
      req.params.id,
      req.body
    );

    return res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: message
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getConversationMessages = async (req, res) => {
  try {
    const messages = await communicationService.getConversationMessages(req.params.id);

    return res.status(200).json({
      success: true,
      count: messages.length,
      data: messages
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const addMessageAttachment = async (req, res) => {
  try {
    const attachment = await communicationService.addMessageAttachment(
      req.params.id,
      req.body
    );

    return res.status(201).json({
      success: true,
      message: "Attachment added successfully",
      data: attachment
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const markMessageAsRead = async (req, res) => {
  try {
    const message = await communicationService.markMessageAsRead(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Message marked as read successfully",
      data: message
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  createConversation,
  getAllConversations,
  getConversationById,
  getUserConversations,
  getPatientConversations,
  createMessage,
  getConversationMessages,
  addMessageAttachment,
  markMessageAsRead
};