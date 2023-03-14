const pool = require("../routes/query");

const getStudent = async id => {
  const sql =
    "SELECT matric_no, student_name, wallet_amount FROM students WHERE matric_no = $1";
  const value = [id];
  return await (
    await pool.query(sql, value)
  ).rows[0];
};

const getCafe = async id => {
  const sql = "SELECT * FROM cafe_owners WHERE username = $1";
  const value = [id];
  return await (
    await pool.query(sql, value)
  ).rows[0];
};

module.exports = { getStudent, getCafe };
