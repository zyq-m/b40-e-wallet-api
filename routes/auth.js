require("dotenv").config();

const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const pool = require("./query");
let refreshTokens = [];

const loginStudents = (request, response) => {
  const { matric_no, password } = request.body;
  const user = { user: matric_no };

  pool.query(
    "SELECT matric_no FROM students WHERE matric_no = $1 AND ic_no = $2",
    [matric_no, password],
    (error, results) => {
      if (error) return response.sendStatus(500);
      if (results.rowCount === 0) return response.sendStatus(404);

      const accessToken = generateAccessToken(user);
      const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);
      refreshTokens.push(refreshToken);

      return response.json({
        accessToken: accessToken,
        refreshToken: refreshToken,
      });
    }
  );
};

const loginCafe = (request, response) => {
  const { username, password } = request.body;
  const user = { user: username };

  pool.query(
    "SELECT username FROM cafe_owners WHERE username = $1 AND password = $2",
    [username, password],
    (error, results) => {
      if (error) return response.sendStatus(500);
      if (results.rowCount === 0) return response.sendStatus(404);

      const accessToken = generateAccessToken(user);
      const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);
      refreshTokens.push(refreshToken);

      return response.json({
        accessToken: accessToken,
        refreshToken: refreshToken,
      });
    }
  );
};

const loginAdmin = (request, response) => {
  const { email, password } = request.body;
  const user = { user: email };

  pool.query(
    "SELECT email FROM admin_b40 WHERE email = $1 AND password = $2",
    [email, password],
    (error, results) => {
      if (error) return response.sendStatus(500);
      if (results.rowCount === 0) return response.sendStatus(404);

      const accessToken = generateAccessToken(user);
      const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);
      refreshTokens.push(refreshToken);

      return response.json({
        accessToken: accessToken,
        refreshToken: refreshToken,
      });
    }
  );
};

const generateAccessToken = user =>
  jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "120min" });

router.post("/students/login", loginStudents);

router.post("/cafe/login", loginCafe);

router.post("/admin/login", loginAdmin);

router.post("/token", (req, res) => {
  const refreshToken = req.body.refreshToken;

  if (refreshToken == null) return res.sendStatus(401);

  if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403);

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    const accessToken = generateAccessToken({ user: user.user });

    return res.json({ accessToken: accessToken });
  });
});

router.delete("/logout", (req, res) => {
  const refreshToken = req.body.token;
  refreshTokens = refreshTokens.filter(token => token !== refreshToken);

  return res.sendStatus(204);
});

module.exports = router;
