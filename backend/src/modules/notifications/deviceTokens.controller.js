const deviceTokensService = require("./deviceTokens.service");

const handleError = (res, err) => {
  const statusCode = err.statusCode || 500;
  const message =
    statusCode === 500 ? "Request failed." : err.message || "Request failed.";

  return res.status(statusCode).json({
    success: false,
    message,
  });
};

const registerDeviceToken = async (req, res) => {
  try {
    const token = await deviceTokensService.registerDeviceToken({
      userId: req.user.id,
      deviceToken: req.body?.device_token,
      platform: req.body?.platform,
      deviceName: req.body?.device_name,
    });

    return res.status(200).json({
      success: true,
      message: "Device token registered successfully",
      data: token,
    });
  } catch (err) {
    return handleError(res, err);
  }
};

const unregisterDeviceToken = async (req, res) => {
  try {
    const token = await deviceTokensService.unregisterDeviceToken({
      userId: req.user.id,
      deviceToken: req.body?.device_token,
    });

    if (!token) {
      return res.status(404).json({
        success: false,
        message: "Device token not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Device token unregistered successfully",
      data: token,
    });
  } catch (err) {
    return handleError(res, err);
  }
};

module.exports = {
  registerDeviceToken,
  unregisterDeviceToken,
};
