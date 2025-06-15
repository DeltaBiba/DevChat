const express = require("express");
const { pool } = require("../database");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// Получить все чаты пользователя
router.get("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.user_id;

    const result = await pool.query(
      `SELECT c.chat_id, c.name, c.is_group
            FROM chats c
            JOIN chat_members cm ON c.chat_id = cm.chat_id
            WHERE cm.user_id = $1`,
      [userId]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching chats:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Создать новый чат
router.post("/", authenticateToken, async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const { name, is_group, user_ids } = req.body;
    const creatorId = req.user.user_id;

    const allUserIds = [...new Set([creatorId, ...(user_ids || [])])];

    const chatResult = await client.query(
      `INSERT INTO chats (name, is_group)
            VALUES ($1, $2)
            RETURNING *`,
      [name, is_group || false]
    );

    const chatId = chatResult.rows[0].chat_id;

    for (const userId of allUserIds) {
      await client.query(
        `INSERT INTO chat_members (chat_id, user_id) VALUES ($1, $2)`,
        [chatId, userId]
      );
    }

    await client.query("COMMIT");

    res.status(201).json(chatResult.rows[0]);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error creating chat:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    client.release();
  }
});

// Удалить чат
router.delete("/:chatId", authenticateToken, async (req, res) => {
  try {
    const chatId = parseInt(req.params.chatId);
    const userId = req.user.user_id;

    if (!chatId || isNaN(chatId)) {
      return res.status(400).json({ error: "Invalid chat ID" });
    }

    const memberCheck = await pool.query(
      `SELECT * FROM chat_members WHERE chat_id = $1 AND user_id = $2`,
      [chatId, userId]
    );

    if (memberCheck.rowCount === 0) {
      return res
        .status(403)
        .json({ error: "User is not a member of this chat" });
    }

    await pool.query(`DELETE FROM chats WHERE chat_id = $1`, [chatId]);

    res.status(200).json({ message: "Chat deleted" });
  } catch (error) {
    console.error("Error deleting chat:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;