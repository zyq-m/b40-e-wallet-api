require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const app = express();
const cors = require("cors");
let port = process.env.PORT || 3000;

const authRouter = require("./routes/auth");
const studentRouter = require("./routes/students");
const cafeRouter = require("./routes/cafeOwners");
const transactionRouter = require("./routes/transactions");

app.use(cors());
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

const authenticateToken = (request, response, next) => {
  const authHeader = request.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) return response.sendStatus(401);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, user) => {
    if (error) return response.sendStatus(403);
    request.user = user;
    next();
  });
};

app.use(authRouter);
app.use(authenticateToken);
app.use("/api", studentRouter);
app.use("/api", cafeRouter);
app.use("/api", transactionRouter);

app.listen(port, () => {
  console.log(`app running on port ${port}`);
});
