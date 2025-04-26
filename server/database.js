const { Pool } = require("pg");
require("dotenv").config();


const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "Chat",
  password: process.env.DB_PASSWORD || "password",
  port: process.env.DB_PORT || 5432,
});

pool.connect((err, client, done) => {
  if (err) {
    console.error("Error connecting to the database", err);
    return;
  }
  console.log("Connected to the database");
  done();
});

module.exports = { pool };