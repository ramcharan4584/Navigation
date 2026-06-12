const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
});

/* TEST DATABASE CONNECTION */

pool.connect((err) => {

  if (err) {
    console.log("PostgreSQL Connection Error:", err.message);
  }

  else {
    console.log("PostgreSQL Connected Successfully");
  }

});

module.exports = pool;