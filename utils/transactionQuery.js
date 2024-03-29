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
    WHERE t.recipient = $1 AND t.claimed = false
    ORDER BY t.created_at DESC`;
  const values = [id];

  const res = await pool.query(sql, values);
  return res.rows;
};

const pay = async (id, sender, amount) => {
  class UserException {
    constructor(message) {
      this.userException = true;
      this.message = message;
      this.name = "UserException";
    }
  }

  const active = await pool.query(
    "SELECT active from students WHERE matric_no = $1 AND active = true",
    [sender]
  );

  // check if sender is active
  if (active.rowCount == 0) {
    throw new UserException("Your account not active");
  } else {
    await pool.query(
      "INSERT INTO transactions (sender, recipient, amount) VALUES ($1, $2, $3) RETURNING *",
      [sender, id, amount]
    );
    await pool.query(
      "UPDATE students SET wallet_amount = (SELECT wallet_amount WHERE matric_no = $1) - $2 WHERE matric_no = $3",
      [sender, amount, sender]
    );
  }
};

const approved = async (transactionId, value) => {
  const sql = `UPDATE transactions 
    SET approved_by_recipient = $1 
    WHERE transaction_id = $2`;

  const data = await pool.query(sql, [value, transactionId]);
  return data.rowCount;
};

const getRecipientTransactionByDateRange = async (recipient, from, to) => {
  const sql = `SELECT transaction_id, amount, sender, s.student_name, 
  recipient, c.cafe_name, created_at, created_on, approved_by_recipient
  FROM transactions as t
  INNER JOIN students as s ON s.matric_no = t.sender
  INNER JOIN cafe_owners as c on c.username = t.recipient
  WHERE t.recipient = $1 AND t.created_on BETWEEN $2 AND $3
  ORDER BY t.created_at DESC, t.created_on DESC`;

  const data = await pool.query(sql, [recipient, from, to]);
  return data.rows;
};

const getSenderTransactionByDateRange = async (sender, from, to) => {
  const sql = `SELECT transaction_id, amount, sender, s.student_name, 
  recipient, c.cafe_name, created_at, created_on
  FROM transactions as t
  INNER JOIN students as s ON s.matric_no = t.sender
  INNER JOIN cafe_owners as c on c.username = t.recipient
  WHERE t.sender = $1 AND t.created_on BETWEEN $2 AND $3
  ORDER BY t.created_at DESC, t.created_on DESC`;

  const data = await pool.query(sql, [sender, from, to]);
  return data.rows;
};

const getWalletBalance = async matric_no => {
  const sql = `SELECT wallet_amount from students where matric_no = $1`;

  const data = await pool.query(sql, [matric_no]);
  return data.rows;
};

const getSalesAmount = async id => {
  const sql = `
  SELECT sum(amount) total_sales FROM transactions t 
  WHERE t.recipient = $1 AND t.claimed = false
  `;

  const data = await pool.query(sql, [id]);
  return data.rows;
};

module.exports = {
  getSenderTransaction,
  pay,
  getRecipientTransaction,
  approved,
  getRecipientTransactionByDateRange,
  getWalletBalance,
  getSalesAmount,
  getSenderTransactionByDateRange,
};
