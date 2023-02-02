const express = require("express");
const transactionRouter = express.Router();
const pool = require("./query");
const {
  approved,
  getRecipientTransactionByDateRange,
} = require("../utils/transactionQuery");

const getTransactions = (request, response) => {
  const sql = `
    SELECT t.transaction_id, t.sender, t.created_at, t.created_on, t.amount, s.student_name, c.cafe_name, t.approved_by_recipient
    FROM transactions as t
    INNER JOIN students as s ON s.matric_no = t.sender
    INNER JOIN cafe_owners as c on c.username = t.recipient
    ORDER BY created_at DESC`;

  pool.query(sql, (error, results) => {
    if (error) return response.status(500);

    return response.status(200).json(results.rows);
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
    SELECT t.transaction_id, t.sender, t.created_at, t.created_on, t.amount, s.student_name, c.cafe_name, t.approved_by_recipient
    FROM transactions as t 
    INNER JOIN students as s ON s.matric_no = t.sender
    INNER JOIN cafe_owners as c on c.username = t.recipient
    WHERE t.sender = $1
    ORDER BY t.created_at DESC`;

  pool.query(sql, [id], (error, results) => {
    if (error) return res.sendStatus(500);

    if (results.rowCount == 0)
      return res.status(400).json("Transactions not found");

    return res.status(200).json(results.rows);
  });
};

const getRecipientTransaction = (req, res) => {
  const id = req.params.id;
  const sql = `
  SELECT t.transaction_id, t.sender, t.created_at, t.created_on, t.amount, s.student_name, c.cafe_name, t.approved_by_recipient
  FROM transactions as t 
  INNER JOIN students as s ON s.matric_no = t.sender
  INNER JOIN cafe_owners as c on c.username = t.recipient
  WHERE t.recipient = $1
  ORDER BY t.created_at DESC
  `;

  pool.query(sql, [id], (error, results) => {
    if (error) return res.status(500);

    if (results.rowCount == 0)
      return res.status(400).json("Transactions not found");

    return res.status(200).json(results.rows);
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

const dateRange = (request, res) => {
  const { id, from, to } = request.params;

  getRecipientTransactionByDateRange(id, from, to)
    .then(data => {
      if (data.length == 0) {
        return res.sendStatus(404);
      }
      return res.status(200).json(data);
    })
    .catch(err => {
      return res.sendStatus(500);
    });
};

const getOverallWithDate = async (req, res) => {
  const { from, to } = req.params;

  const sql = `
  SELECT c.cafe_name, SUM(t.amount) as total_amount, count(t.amount) as total_transaction FROM transactions as t
  INNER JOIN cafe_owners as c ON c.username = t.recipient
  WHERE t.created_on BETWEEN $1 AND $2
  GROUP BY c.cafe_name
  `;
  const sql2 = `
  SELECT sum(amount) sum_amount, count(amount) sum_transaction
  FROM transactions
  WHERE created_on BETWEEN $1 AND $2
  `;

  const transaction = pool.query(sql, [from, to]);
  const total = pool.query(sql2, [from, to]);

  try {
    const results = await Promise.all([transaction, total]);

    if (results[0].rowCount == 0) {
      return res.status(400).send("No transactions");
    }

    return res
      .status(200)
      .json({ transactions: results[0].rows, overall: results[1].rows[0] });
  } catch (error) {
    return res.status(500).json(error);
  }
};

const getOverall = async (req, res) => {
  const sql = `
  SELECT c.cafe_name, SUM(t.amount) as total_amount, count(t.amount) as total_transaction FROM transactions as t
  INNER JOIN cafe_owners as c ON c.username = t.recipient
  GROUP BY c.cafe_name
  `;
  const sql2 = `
  SELECT sum(amount) sum_amount, count(amount) sum_transaction
  FROM transactions
  `;

  const transaction = pool.query(sql);
  const total = pool.query(sql2);

  try {
    const results = await Promise.all([transaction, total]);

    if (results[0].rowCount == 0) {
      return res.status(400).send("No transactions");
    }

    return res
      .status(200)
      .json({ transactions: results[0].rows, overall: results[1].rows[0] });
  } catch (error) {
    return res.status(500).json(error);
  }
};

const getTotalToday = (req, res) => {
  const { id } = req.params;
  const sql = `
  SELECT s.matric_no, sum(t.amount) as total
  FROM transactions as t
  INNER JOIN students as s
  ON s.matric_no = t.sender
  WHERE s.matric_no = $1 AND t.created_on = CURRENT_DATE
  GROUP BY s.matric_no
  `;

  pool
    .query(sql, [id])
    .then(data => {
      if (data.rowCount == 0) {
        return res.status(200).send([{ total: 0 }]);
      }

      return res.status(200).json(data.rows);
    })
    .catch(err => res.status(500).json(err));
};

transactionRouter.get("/transactions", getTransactions);
transactionRouter.get("/transactions/cafe/overall", getOverall);
transactionRouter.get(
  "/transactions/cafe/overall/:from/:to",
  getOverallWithDate
);
transactionRouter.get("/transactions/students/:id", getSenderTransaction);
transactionRouter.get("/transactions/students/today/:id", getTotalToday);
transactionRouter.get("/transactions/cafe/:id", getRecipientTransaction);
transactionRouter.get("/transactions/cafe/range/:id/:from/:to", dateRange);
transactionRouter.post("/transactions/cafe/:id", pay);
transactionRouter.put("/transactions/approved", checked);

module.exports = { transactionRouter };
