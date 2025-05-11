const { pool } = require("./database");

async function initializeDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        user_id SERIAL PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS сhats (
        chat_id SERIAL PRIMARY KEY,
        name VARCHAR(50) NOT NULL,
        is_group BOOLEAN NOT NULL DEFAULT FALSE,
        )`);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS chat_members (
        id SERIAL PRIMERY KEY,
        chat_id INTEGER REFERENCES chats(chat_id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
        joined_at TIMESTAMP DEFAULT NOW(),
        UNIQUE (chat_id, user_id)
      
      )`);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        message_id SERIAL PRIMARY KEY,
        chat_id INTEGER REFERENCES chats(chat_id) ON DELETE CASCADE,
        sender_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
        text TEXT NOT NULL,
        sent_at TIMESTAMP DEFAULT NOW(),
      )
    `);
  } catch (error) {
    console.error(error);
    throw error;
  }
}

module.exports = { initializeDatabase };
