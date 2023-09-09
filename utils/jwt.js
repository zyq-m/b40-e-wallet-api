const jwt = require("jsonwebtoken");

exports.generateToken = user => {
  const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "30s",
  });
  const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);

  return { accessToken, refreshToken };
};

exports.verifyToken = token => {
  jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
};
