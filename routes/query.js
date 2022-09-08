require("dotenv").config();
const Pool = require("pg").Pool;

const isProduction = process.env.NODE_ENV === "production";

const connectionString = `postgresql://${process.env.PG_USER}:${process.env.PG_PASSWORD}@${process.env.PG_HOST}:${process.env.PG_PORT}/${process.env.PG_DATABASE}`;

const pool = new Pool({
  // connect db to application
  connectionString: isProduction ? process.env.DATABASE_URL : connectionString,
  // comment out ssl code if run in development
  ssl: {
    rejectUnauthorized: false,
  },
});

module.exports = pool;
