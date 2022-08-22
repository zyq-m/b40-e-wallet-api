const express = require("express");
const router = express.Router();
const pool = require("./query");

const getTransactions = (request, response) => {
  pool.query("SELECT * FROM transactions", (error, results) => {
    if (error) return response.status(500);
    return response.status(200).json(results.rows);
  });
};

const pay = (request, response) => {
  const id = request.params.id;
  const { sender, amount } = request.body;

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
};

const getSenderTransaction = (req, res) => {
  const id = req.params.id;

  pool.query(
    "SELECT * FROM transactions where sender = $1 order by created_at desc",
    [id],
    (error, results) => {
      if (error) return res.status(500);
      return res.status(200).json(results.rows);
    }
  );
};

const getRecipientTransaction = (req, res) => {
  const id = req.params.id;

  pool.query(
    "SELECT * FROM transactions WHERE recipient = $1 AND claimed = false ORDER BY created_at desc",
    [id],
    (error, results) => {
      if (error) return res.status(500);
      return res.status(200).json(results.rows);
    }
  );
};

router.get("/transactions", getTransactions);
router.get("/transactions/students/:id", getSenderTransaction);
router.get("/transactions/cafe/:id", getRecipientTransaction);
router.post("/transactions/cafe/:id", pay);

module.exports = router;
