const { pool } = require("./database");

async function initializeDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        user_id SERIAL PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL
      )
    `)
  } catch (error) {
    console.error(error);
    throw error;
  }
}

module.exports = { initializeDatabase };