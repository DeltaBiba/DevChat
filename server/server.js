const express = require("express");
const { pool } = require("./database");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const User = require("./models/User");
const bcrypt = require("bcrypt");
const { initializeDatabase } = require("./dbinit");
const chatRoutes = require("./routes/chat");
require("dotenv").config();

const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173", 
    methods: ["GET", "POST"],
  },
});

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
      return res.status(409).json({ error: "User already exists" });
    }

    const newUser = await User.create(username, password);

    const token = jwt.sign(
      { user_id: newUser.user_id, username },
      process.env.SECRET_KEY,
      { expiresIn: "1h" }
    );

    res.status(201).json({
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

app.use("/api/chats", chatRoutes);

app.get("/api/status", (req, res) => {
  res.status(200).json({ message: "Server is running" });
});

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("join_chat", (chatId) => {
    socket.join(chatId);
    console.log(`Client ${socket.id} joined chat ${chatId}`);
  });

  socket.on("send_message", async (data) => {
    try {
      const { chatId, text, userId, username } = data; 

      const result = await pool.query(
        "INSERT INTO messages (chat_id, sender_id, text) VALUES ($1, $2, $3) RETURNING *",
        [chatId, userId, text]
      );

      const message = {
        ...result.rows[0],
        sender_name: username,
      };

      io.to(chatId).emit("receive_message", message);
      console.log(`Message sent to chat ${chatId}:`, text);
    } catch (error) {
      console.error("Error sending message:", error);
      socket.emit("error", "Failed to send message");
    }
  });

  socket.on("typing", (data) => {
    socket.to(data.chatId).emit("user_typing", {
      username: data.username,
      chatId: data.chatId,
    });
  });

  socket.on("stop_typing", (data) => {
    socket.to(data.chatId).emit("user_stop_typing", {
      username: data.username,
      chatId: data.chatId,
    });
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

async function startServer() {
  try {
    await initializeDatabase();

    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

startServer();