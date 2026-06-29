const presenceService = require("./presence.service");

const getAllUsersPresence = async (req, res) => {
  try {
    const users = await presenceService.getAllUsersPresence();

    return res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getUserPresence = async (req, res) => {
  try {
    const user = await presenceService.getUserPresenceById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getBulkUsersPresence = async (req, res) => {
  try {
    const { user_ids: userIds } = req.body;

    if (!Array.isArray(userIds)) {
      return res.status(400).json({
        success: false,
        message: "user_ids must be an array"
      });
    }

    const users = await presenceService.getBulkUsersPresence(userIds);

    return res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getAllUsersPresence,
  getUserPresence,
  getBulkUsersPresence
};
