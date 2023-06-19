const pool = require("../routes/query");

const checkCafe = async (id, pass) => {
  const sql = `select verify_pass($1, $2, false) as verified`;
  const data = await pool.query(sql, [id, pass]);

  return data.rows[0]?.verified;
};

const changeCafe = async (id, newPass) => {
  const sql = `select update_pass($1, $2, false) as updated`;
  const data = await pool.query(sql, [id, newPass]);

  return data.rows[0]?.updated;
};

const checkStudent = async (id, pass) => {
  const sql = `select verify_pass($1, $2, true) as verified`;
  const data = await pool.query(sql, [id, pass]);

  return data.rows;
};

const changeStudent = async (id, newPass) => {
  const sql = `select update_pass($1, $2, true) as updated`;
  const data = await pool.query(sql, [id, newPass]);

  return data.rows[0]?.updated;
};

module.exports = { checkStudent, changeStudent, checkCafe, changeCafe };
