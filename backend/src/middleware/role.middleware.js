const getSpecialistVerificationMessage = (status) => {
  if (status === "rejected") {
    return "Your specialist account verification was rejected. Contact an administrator for help.";
  }

  return "Your specialist account is pending admin verification.";
};

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access forbidden. You do not have permission"
      });
    }

    // Specialists may authenticate and call /auth/me, but clinical/role-gated
    // specialist workflows require an approved verification_status.
    if (
      req.user.role === "specialist" &&
      allowedRoles.includes("specialist") &&
      req.user.verification_status !== "approved"
    ) {
      return res.status(403).json({
        success: false,
        message: getSpecialistVerificationMessage(req.user.verification_status),
        verification_status: req.user.verification_status || "pending",
      });
    }

    next();
  };
};

module.exports = authorizeRoles;
