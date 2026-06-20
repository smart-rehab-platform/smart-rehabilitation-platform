
const notificationsService = require("./notifications.service");

const createNotification = async (req, res) => {
  try {
    const notification = await notificationsService.createNotification(req.body);

    return res.status(201).json({
      success: true,
      message: "Notification created successfully",
      data: notification
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getAllNotifications = async (req, res) => {
  try {
    const notifications = await notificationsService.getAllNotifications();

    return res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getNotificationById = async (req, res) => {
  try {
    const notification = await notificationsService.getNotificationById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: notification
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getUserNotifications = async (req, res) => {
  try {
    const notifications = await notificationsService.getUserNotifications(req.params.id);

    return res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getUserUnreadNotifications = async (req, res) => {
  try {
    const notifications = await notificationsService.getUserUnreadNotifications(req.params.id);

    return res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const markAsRead = async (req, res) => {
  try {
    const notification = await notificationsService.markAsRead(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notification marked as read",
      data: notification
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    const notifications = await notificationsService.markAllAsRead(req.user.id);

    return res.status(200).json({
      success: true,
      message: "All notifications marked as read",
      count: notifications.length,
      data: notifications
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const deleteNotification = async (req, res) => {
  try {
    const notification = await notificationsService.deleteNotification(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
      data: notification
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  createNotification,
  getAllNotifications,
  getNotificationById,
  getUserNotifications,
  getUserUnreadNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
};