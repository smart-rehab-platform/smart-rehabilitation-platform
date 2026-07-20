const jwt = require("jsonwebtoken");

const DEFAULT_ACCESS_TOKEN_EXPIRES_IN = "15m";

const getAccessTokenExpiresIn = () => {
  const configured = process.env.ACCESS_TOKEN_EXPIRES_IN;

  if (typeof configured === "string" && configured.trim()) {
    return configured.trim();
  }

  return DEFAULT_ACCESS_TOKEN_EXPIRES_IN;
};

const generateAccessToken = (user) =>
  jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: getAccessTokenExpiresIn() }
  );

module.exports = {
  DEFAULT_ACCESS_TOKEN_EXPIRES_IN,
  getAccessTokenExpiresIn,
  generateAccessToken,
};
