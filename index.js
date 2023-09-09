require("dotenv").config();

const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const bodyParser = require("body-parser");
const cors = require("cors");
const { authenticateToken } = require("./middleware/auth");

const authRouter = require("./routes/auth");
const studentRouter = require("./routes/students");
const cafeRouter = require("./routes/cafeOwners");
const { transactionRouter } = require("./routes/transactions");
const feedbackRouter = require("./routes/feedback");
const passwordRouter = require("./routes/password");

const {
  getSenderTransaction,
  getRecipientTransaction,
  pay,
  getSalesAmount,
} = require("./utils/transactionQuery");
const { getStudent, getCafe } = require("./utils/profile");

const app = express();
const httpServer = createServer(app);
let port = process.env.PORT || 3000;
const io = new Server(httpServer, {
  cors: {
    origin: "*", // accept all client origin
  },
});

app.use(cors({ origin: "*" }));

app.use(bodyParser.json());

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

io.on("connect", socket => {
  socket.on("new_user", async id => {
    // join a room
    socket.join(`${id}`);
  });

  // get cafe sales amount
  socket.on("get_sales_amount", async id => {
    const salesAmount = await getSalesAmount(id);

    io.to(`${id}`).emit("set_sales_amount", salesAmount?.[0]);
  });

  // recieve id to get transaction
  socket.on("get_transaction_student", async id => {
    const transaction = await getSenderTransaction(id);

    io.to(`${id}`).emit("set_transaction_student", transaction);
  });

  socket.on("get_transaction_cafe", async id => {
    const res = await getRecipientTransaction(id);

    io.to(`${id}`).emit("set_transaction_cafe", res);
  });

  socket.on("get_student", async id => {
    const profile = await getStudent(id);

    io.to(`${id}`).emit("set_student", profile);
  });

  socket.on("get_cafe", async id => {
    const cafe = await getCafe(id);

    return io.to(`${id}`).emit("set_cafe", cafe);
  });

  // TODO!: terminate this line of code
  socket.on("pay", async (id, sender, amount) => {
    try {
      const res = await pay(id, sender, amount);
      io.emit("pay_detail", res);
    } catch (error) {
      // TODO: update for better error message
      io.emit("pay_detail", error);
    }
  });

  socket.on("send_notification", async (id, notification) => {
    io.to(`${id}`).emit("get_notification", notification);
  });

  socket.on("logout", async id => socket.leave(id));
});

app.use(authRouter);
app.use(authenticateToken);
app.use("/api", studentRouter);
app.use("/api", cafeRouter);
app.use("/api", transactionRouter);
app.use("/api", feedbackRouter);
app.use("/api", passwordRouter);

httpServer.listen(port, () => {
  console.log(`app running on port ${port}`);
});
