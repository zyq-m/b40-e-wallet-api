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
const {
  addUser,
  getUser,
  removeUser,
  updateSocketId,
} = require("./utils/socketUser");

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
  socket.on("connected", async id => {
    if (id) {
      await updateSocketId(socket.id, id);
    }
  });

  socket.on("new_user", async id => {
    try {
      await addUser(id, socket.id);
      return io.to(socket.id).emit("login_error", false);
    } catch (error) {
      return io.to(socket.id).emit("login_error", true);
    }
  });

  // recieve id to get transaction
  socket.on("get_transaction_student", async id => {
    const transaction = await getSenderTransaction(id);
    io.emit("set_transaction_student", transaction);
  });

  socket.on("get_transaction_cafe", async id => {
    const res = await getRecipientTransaction(id);
    const user = await getUser(id);
    user && io.to(user.socket_id).emit("set_transaction_cafe", res);
  });

  socket.on("get_student", async id => {
    const res = await getStudent(id);
    io.emit("set_student", res);
  });

  socket.on("get_cafe", async id => {
    const res = await getCafe(id);
    io.emit("set_cafe", res);
  });

  socket.on("pay", async (id, sender, amount) => {
    const res = await pay(id, sender, amount);
    io.emit("pay_detail", res);
  });

  socket.on("send_notification", async (id, notification) => {
    const user = await getUser(id);
    user && io.to(user.socket_id).emit("get_notification", notification);
  });

  socket.on("logout", async id => await removeUser(id));
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
