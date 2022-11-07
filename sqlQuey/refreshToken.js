const pool = require("../routes/query");

const createRefreshToken = async token => {
  const sql = `INSERT INTO refresh_token(token) VALUES($1) RETURNING *`;
  return await pool.query(sql, [token]).then(res => res.rows);
};

const getRefreshToken = async token => {
  const sql = `SELECT * FROM refresh_token WHERE token = $1`;
  return await pool.query(sql, [token]).then(res => res.rows);
};

const removeRefreshToken = async token => {
  const sql = `DELETE FROM refresh_token WHERE token = $1`;
  return await pool.query(sql, [token]).then(res => res);
};

module.exports = { createRefreshToken, removeRefreshToken, getRefreshToken };
