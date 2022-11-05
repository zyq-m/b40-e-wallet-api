const express = require("express");
const transactionRouter = express.Router();
const pool = require("./query");
const { approved } = require("../sqlQuey/transactionQuery");

const getTransactions = (request, response) => {
  const sql = `
    SELECT * FROM transactions 
    INNER JOIN students ON students.matric_no = transactions.sender
    INNER JOIN cafe_owners on cafe_owners.username = transactions.recipient
    ORDER BY created_at DESC`;

  pool.query(sql, (error, results) => {
    if (error) return response.status(500);
    const data = results.rows.map(
      ({
        transaction_id,
        sender,
        recipient,
        created_at,
        amount,
        student_name,
        cafe_name,
      }) => ({
        transaction_id: transaction_id,
        sender: sender,
        recipient: recipient,
        created_at: created_at,
        amount: amount,
        student_name: student_name,
        cafe_name: cafe_name,
      })
    );
    return response.status(200).json(data);
  });
};

const pay = (request, response) => {
  const id = request.params.id;
  const { sender, amount } = request.body;

  if (amount) {
    pool
      .query(
        "INSERT INTO transactions (sender, recipient, amount) VALUES ($1, $2, $3) RETURNING *",
        [sender, id, amount]
      )
      .then(res => {
        pool
          .query(
            "UPDATE students SET wallet_amount = (SELECT wallet_amount WHERE matric_no = $1) - $2 WHERE matric_no = $3",
            [sender, amount, sender]
          )
          .then(() => response.status(201).json(res.rows));
      })
      .catch(err => response.status(500).send(err));
  } else {
    return response.sendStatus(500);
  }
};

const getSenderTransaction = (req, res) => {
  const id = req.params.id;
  const sql = `
    SELECT * FROM transactions as t 
    INNER JOIN students as s ON s.matric_no = t.sender
    INNER JOIN cafe_owners as c on c.username = t.recipient
    WHERE t.sender = $1
    ORDER BY t.created_at DESC`;

  pool.query(sql, [id], (error, results) => {
    if (error) return res.status(500);

    const data = results.rows.map(
      ({
        transaction_id,
        sender,
        recipient,
        created_at,
        amount,
        student_name,
        cafe_name,
      }) => ({
        transaction_id: transaction_id,
        sender: sender,
        recipient: recipient,
        created_at: created_at,
        amount: amount,
        student_name: student_name,
        cafe_name: cafe_name,
      })
    );

    return res.status(200).json(data);
  });
};

const getRecipientTransaction = (req, res) => {
  const id = req.params.id;
  const sql = `
    SELECT * FROM transactions as t 
    INNER JOIN students as s ON s.matric_no = t.sender
    INNER JOIN cafe_owners as c on c.username = t.recipient
    WHERE t.recipient = $1
    ORDER BY t.created_at DESC`;

  pool.query(sql, [id], (error, results) => {
    if (error) return res.status(500);

    const data = results.rows.map(
      ({
        transaction_id,
        sender,
        recipient,
        created_at,
        amount,
        student_name,
        cafe_name,
        approved_by_recipient,
      }) => ({
        transaction_id: transaction_id,
        sender: sender,
        recipient: recipient,
        created_at: created_at,
        amount: amount,
        student_name: student_name,
        cafe_name: cafe_name,
        approved: approved_by_recipient,
      })
    );

    return res.status(200).json(data);
  });
};

const checked = (req, res) => {
  const { transactionId, value } = req.body;
  if (!transactionId) return res.sendStatus(400);
  approved(transactionId, value)
    .then(() => {
      return res.status(200).send({ message: "Payment status updated" });
    })
    .catch(err => {
      return res
        .status(404)
        .send({ message: "Transaction Id not found", detail: err });
    });
};

transactionRouter.get("/transactions", getTransactions);
transactionRouter.get("/transactions/students/:id", getSenderTransaction);
transactionRouter.get("/transactions/cafe/:id", getRecipientTransaction);
transactionRouter.post("/transactions/cafe/:id", pay);
transactionRouter.put("/transactions/approved", checked);

module.exports = { transactionRouter };
