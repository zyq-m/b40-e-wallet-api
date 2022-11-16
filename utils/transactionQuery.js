const pool = require("../routes/query");

const getSenderTransaction = async id => {
  const sql = `
      SELECT * FROM transactions as t
      INNER JOIN students as s ON s.matric_no = t.sender
      INNER JOIN cafe_owners as c on c.username = t.recipient
      WHERE t.sender = $1
      ORDER BY t.created_at DESC`;
  const values = [id];

  const res = await pool.query(sql, values);
  return res.rows;
};

const getRecipientTransaction = async id => {
  const sql = `
    SELECT * FROM transactions as t 
    INNER JOIN students as s ON s.matric_no = t.sender
    INNER JOIN cafe_owners as c on c.username = t.recipient
    WHERE t.recipient = $1
    ORDER BY t.created_at DESC`;
  const values = [id];

  const res = await pool.query(sql, values);
  return res.rows;
};

const pay = async (id, sender, amount) => {
  const res = await pool.query(
    "INSERT INTO transactions (sender, recipient, amount) VALUES ($1, $2, $3) RETURNING *",
    [sender, id, amount]
  );
  await pool.query(
    "UPDATE students SET wallet_amount = (SELECT wallet_amount WHERE matric_no = $1) - $2 WHERE matric_no = $3",
    [sender, amount, sender]
  );
  return res.rows;
};

const approved = async (transactionId, value) => {
  const sql = `UPDATE transactions 
    SET approved_by_recipient = $1 
    WHERE transaction_id = $2`;

  const data = await pool.query(sql, [value, transactionId]);
  return data.rowCount;
};

module.exports = {
  getSenderTransaction,
  pay,
  getRecipientTransaction,
  approved,
};
