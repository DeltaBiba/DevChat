const express = require("express");
const { pool } = require("./database");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const User = require("./models/User");
const bcrypt = require("bcrypt");
const { initializeDatabase } = require("./dbinit");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password are required" });
    }

    const result = await pool.query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const user = result.rows[0];

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const token = jwt.sign(
      { user_id: user.user_id, username },
      process.env.SECRET_KEY,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user.user_id,
        username: user.username,
      },
      token,
    });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password are required" });
    }

    const userCheck = await pool.query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );

    if (userCheck.rows.length > 0) {
      return res.status(200).json({ error: "User already exists" });
    }

    const newUser = await User.create(username, password);

    const token = jwt.sign(
      { user_id: newUser.user_id, username },
      process.env.SECRET_KEY,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "User created successfully",
      user: {
        id: newUser.user_id,
        username: newUser.username,
      },
      token,
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

async function startServer() {
  try {
    await initializeDatabase();

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(PORT);
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

startServer();
