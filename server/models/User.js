const { pool } = require("../database");const bcrypt = require("bcrypt");

class User {
  static async findById(id) {
    try {
      const result = await pool.query(
        "SELECT user_id, username FROM users WHERE user_id = $1",
        [id]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Error finding user by ID:", error);
      throw error;
    }
  }

  static async findByUsername(username) {
    try {
      const result = await pool.query(
        "SELECT user_id, username FROM users WHERE username = $1",
        [username]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Error finding user by username:", error);
      throw error;
    }
  }

  static async create(username, password) {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      const result = await pool.query(
        "INSERT INTO users (username, password) VALUES ($1, $2) RETURNING user_id, username",
        [username, hashedPassword]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }
}

module.exports = User;
