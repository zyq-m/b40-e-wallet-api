const Pool = require("pg").Pool;
const pool = new Pool({
  user: "me",
  host: "localhost",
  database: "b40api",
  password: "password",
  port: 5432,
});

module.exports = pool;
