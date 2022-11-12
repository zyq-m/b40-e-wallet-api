const pool = require("../routes/query");

const addUser = async (id, socketId) => {
  const sql = `INSERT INTO socket_users (socket_id, user_id) VALUES ($1, $2)`;
  return await pool.query(sql, [socketId, id]);
};

const getUser = async id => {
  const sql = `SELECT * FROM socket_users WHERE user_id = $1`;
  const result = await pool.query(sql, [id]);
  const user = await result.rows[0];

  return user;
};

const updateSocketId = async (socketId, id) => {
  const sql = `UPDATE socket_users SET socket_id = $1 WHERE user_id = $2`;
  return await pool.query(sql, [socketId, id]);
};

const removeUser = async id => {
  const sql = `DELETE FROM socket_users WHERE user_id = $1`;
  return await pool.query(sql, [id]);
};

module.exports = { addUser, getUser, removeUser, updateSocketId };

// TODO: create table to store online user
