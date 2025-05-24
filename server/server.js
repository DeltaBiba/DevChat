const express = require("express");
const { pool } = require("./database");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const User = require("./models/User");
const bcrypt = require("bcrypt");
const { initializeDatabase } = require("./dbinit");
const chatRoutes = require("./routes/chat");
const { authenticateToken } = require("./middleware/auth");
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


app.get("/api/users", authenticateToken, async (req, res) => {
  try {
    const currentUserId = req.user.user_id;
    
    const result = await pool.query(
      "SELECT user_id, username FROM users WHERE user_id != $1 ORDER BY username",
      [currentUserId]
    );
    
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/users/search/:username", authenticateToken, async (req, res) => {
  try {
    const { username } = req.params;
    
    if (!username || username.length < 2) {
      return res.status(400).json({ error: "Username must be at least 2 characters" });
    }
    
    const user = await User.findByUsername(username);
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    if (user.user_id === req.user.user_id) {
      return res.status(400).json({ error: "Cannot add yourself" });
    }
    
    res.status(200).json(user);
  } catch (error) {
    console.error("Error searching user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


app.post("/api/chats/by-usernames", authenticateToken, async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query("BEGIN");
    
    const { name, usernames = [], is_group } = req.body;
    const creatorId = req.user.user_id;
    
    if (!name) {
      return res.status(400).json({ error: "Chat name is required" });
    }
    
    const userIds = [];
    for (const username of usernames) {
      const user = await User.findByUsername(username);
      if (user) {
        userIds.push(user.user_id);
      } else {
        await client.query("ROLLBACK");
        return res.status(404).json({ error: `User '${username}' not found` });
      }
    }
    
    const allUserIds = [...new Set([creatorId, ...userIds])];
    
    const chatResult = await client.query(
      `INSERT INTO chats (name, is_group) VALUES ($1, $2) RETURNING *`,
      [name, is_group || userIds.length > 0]
    );
    
    const chatId = chatResult.rows[0].chat_id;
    
    for (const userId of allUserIds) {
      await client.query(
        `INSERT INTO chat_members (chat_id, user_id) VALUES ($1, $2)`,
        [chatId, userId]
      );
    }
    
    await client.query("COMMIT");
    
    res.status(201).json({
      ...chatResult.rows[0],
      members_added: allUserIds.length,
      message: "Chat created successfully"
    });
    
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error creating chat by usernames:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    client.release();
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