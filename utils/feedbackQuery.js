const pool = require("../routes/query");

const sendFeedback = async (id, title, desc) => {
  const sql =
    "INSERT INTO feedback (id, title, description) VALUES ($1, $2, $3) RETURNING *";
  return await (
    await pool.query(sql, [id, title, desc])
  ).rows;
};

const getFeedback = async () => {
  const sql = "SELECT * FROM feedback";
  return await (
    await pool.query(sql)
  ).rows;
};

module.exports = { sendFeedback, getFeedback };
