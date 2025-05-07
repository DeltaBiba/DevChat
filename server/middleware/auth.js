const jwt = require("jsonwebtoken");
require("dotenv").config();

const authenticateToken = (req, res, next) => {
  const authToken = req.headers["authorization"];
  const token = authToken && authToken.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Token not provided" });
  }

  try {
    const verifiedToken = jwt.verify(token, process.env.SECRET_KEY);
    req.user = verifiedToken;
    next();
  } catch (error) {
    console.error("Error verifying token:", error);
    return res.status(403).json({ error: "Invalid token" });
  }
};

module.exports = { authenticateToken };
