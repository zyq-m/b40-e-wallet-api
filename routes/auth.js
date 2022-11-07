require("dotenv").config();

const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const pool = require("./query");
const {
  createRefreshToken,
  getRefreshToken,
  removeRefreshToken,
} = require("../sqlQuey/refreshToken");

const login = (response, sql, id, password, user) => {
  pool
    .query(sql, [id, password])
    .then(results => {
      if (results.rowCount === 0) return response.sendStatus(404);

      const accessToken = generateAccessToken(user);
      const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);

      // * store token
      createRefreshToken(refreshToken);

      return response.json({
        accessToken: accessToken,
        refreshToken: refreshToken,
      });
    })
    .catch(() => response.sendStatus(500));
};

const loginStudents = (request, response) => {
  const { matric_no, password } = request.body;
  const user = { user: matric_no };
  const sql =
    "SELECT matric_no FROM students WHERE matric_no = $1 AND ic_no = $2";

  login(response, sql, matric_no, password, user);
};

const loginCafe = (request, response) => {
  const { username, password } = request.body;
  const user = { user: username };
  const sql =
    "SELECT username FROM cafe_owners WHERE username = $1 AND password = $2";

  login(response, sql, username, password, user);
};

const loginAdmin = (request, response) => {
  const { email, password } = request.body;
  const user = { user: email };
  const sql = "SELECT email FROM admin_b40 WHERE email = $1 AND password = $2";

  login(response, sql, email, password, user);
};

const generateAccessToken = user =>
  jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "30s" });

router.post("/students/login", loginStudents);

router.post("/cafe/login", loginCafe);

router.post("/admin/login", loginAdmin);

router.post("/token", (req, res) => {
  const refreshToken = req.body.refreshToken;

  if (refreshToken == null) return res.sendStatus(401);

  // * if no token
  if (!getRefreshToken(refreshToken)) return res.sendStatus(403);

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    const accessToken = generateAccessToken({ user: user.user });

    return res.json({ accessToken: accessToken });
  });
});

router.delete("/logout", (req, res) => {
  const refreshToken = req.body.token;
  // * remove token
  removeRefreshToken(refreshToken);

  return res.sendStatus(204);
});

module.exports = router;
