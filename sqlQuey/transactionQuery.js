const pool = require("../routes/query");

const getSenderTransaction = id => {
  const sql = `
      SELECT * FROM transactions as t
      INNER JOIN students as s ON s.matric_no = t.sender
      INNER JOIN cafe_owners as c on c.username = t.recipient
      WHERE t.sender = $1
      ORDER BY t.created_at DESC`;
  const values = [id];

  return pool.query(sql, values).then(res => res.rows);
};

const getRecipientTransaction = id => {
  const sql = `
    SELECT * FROM transactions as t 
    INNER JOIN students as s ON s.matric_no = t.sender
    INNER JOIN cafe_owners as c on c.username = t.recipient
    WHERE t.recipient = $1
    ORDER BY t.created_at DESC`;
  const values = [id];

  return pool.query(sql, values).then(res => res.rows);
};

const pay = (id, sender, amount) => {
  return pool
    .query(
      "INSERT INTO transactions (sender, recipient, amount) VALUES ($1, $2, $3) RETURNING *",
      [sender, id, amount]
    )
    .then(res => {
      return pool
        .query(
          "UPDATE students SET wallet_amount = (SELECT wallet_amount WHERE matric_no = $1) - $2 WHERE matric_no = $3",
          [sender, amount, sender]
        )
        .then(() => res.rows);
    });
};

module.exports = { getSenderTransaction, pay, getRecipientTransaction };
