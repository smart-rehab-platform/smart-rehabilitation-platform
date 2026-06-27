const usersService = require("./users.service");

const getAllUsers = async (req, res) => {
  try {
    const users = await usersService.getAllUsers();

    return res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await usersService.getUserById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({ success: true, data: user });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const updateUserStatus = async (req, res) => {
  try {
    const { is_active } = req.body;

    if (typeof is_active !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "is_active must be true or false"
      });
    }

    const user = await usersService.updateUserStatus(req.params.id, is_active);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      message: "User status updated successfully",
      data: user
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getMyProfile = async (req, res) => {
  return res.status(200).json({
    success: true,
    data: req.user
  });
};

const updateMyProfile = async (req, res) => {
  try {
    const updatedUser = await usersService.updateMyProfile(req.user.id, req.body);

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
const updateUserById = async (req, res) => {
  try {
    const user = await usersService.updateUserById(req.params.id, req.body);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: user
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};
const deleteUserById = async (req, res) => {
  try {
    const user = await usersService.deleteUserById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
      data: user
    });
  } catch (err) {
    if (err.code === "23503") {
      return res.status(409).json({
        success: false,
        message:
          "This user cannot be deleted because they are linked to existing records. You can deactivate the account instead.",
      });
    }

    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};
const uploadProfileImage = async (
  req,
  res
) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image uploaded"
      });
    }

    const imageUrl =
      "/uploads/" + req.file.filename;

    const user =
      await usersService.updateProfileImage(
        req.user.id,
        imageUrl
      );

    return res.status(200).json({
      success: true,
      message:
        "Profile image uploaded successfully",
      data: user
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

module.exports = {
    getAllUsers,
  getUserById,
  updateUserStatus,
  getMyProfile,
  updateMyProfile,
  updateUserById,
  deleteUserById,
  uploadProfileImage
};