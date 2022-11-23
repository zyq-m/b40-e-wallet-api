const pool = require("../routes/query");

const checkCafe = async (id, pass) => {
  const sql = `SELECT username FROM cafe_owners
  WHERE username = $1 AND password = $2`;
  const data = await pool.query(sql, [id, pass]);

  return data.rowCount;
};

const changeCafe = async (id, newPass) => {
  const sql = `UPDATE cafe_owners
  SET password = $1
  WHERE username = $2`;
  const data = await pool.query(sql, [newPass, id]);

  return data.rowCount;
};

const checkStudent = async (id, pass) => {
  const sql = `SELECT matric_no FROM students
  WHERE matric_no = $1 AND password = $2`;
  const data = await pool.query(sql, [id, pass]);

  return data.rowCount;
};

const changeStudent = async (id, newPass) => {
  const sql = `UPDATE students
    SET password = $1
    WHERE matric_no = $2`;
  const data = await pool.query(sql, [newPass, id]);

  return data.rowCount;
};

module.exports = { checkStudent, changeStudent, checkCafe, changeCafe };
