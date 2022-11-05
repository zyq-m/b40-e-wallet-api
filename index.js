require("dotenv").config();

const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const authRouter = require("./routes/auth");
const studentRouter = require("./routes/students");
const cafeRouter = require("./routes/cafeOwners");
const { transactionRouter } = require("./routes/transactions");
const feedbackRouter = require("./routes/feedback");

const {
  getSenderTransaction,
  getRecipientTransaction,
  pay,
} = require("./sqlQuey/transactionQuery");
const { getStudent, getCafe } = require("./sqlQuey/profile");

const app = express();
const httpServer = createServer(app);
let port = process.env.PORT || 3000;
const io = new Server(httpServer, {
  cors: {
    origin: "*", // accept all client origin
  },
});

app.use(cors());

app.use(bodyParser.json());

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

io.on("connect", socket => {
  console.log("conneted");
  // recieve id to get transaction
  socket.on("get_transaction_student", async id => {
    return getSenderTransaction(id).then(res => {
      io.emit("set_transaction_student", res);
    });
  });

  socket.on("get_transaction_cafe", async id => {
    return getRecipientTransaction(id).then(res => {
      io.emit("set_transaction_cafe", res);
    });
  });

  socket.on("get_student", async id => {
    return getStudent(id).then(res => {
      io.emit("set_student", res);
    });
  });

  socket.on("get_cafe", async id => {
    return getCafe(id).then(res => {
      io.emit("set_cafe", res);
    });
  });

  socket.on("pay", async (id, sender, amount) => {
    return pay(id, sender, amount).then(res => {
      io.emit("pay_detail", res);
    });
  });
});

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
app.use("/api", feedbackRouter);

httpServer.listen(port, () => {
  console.log(`app running on port ${port}`);
});
