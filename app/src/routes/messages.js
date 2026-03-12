const express = require("express");
const router = express.Router();
const { pool } = require("../db");
const { requireAuth } = require("../middleware/auth");

// Get all conversations for a user
router.get("/", requireAuth, async (req, res, next) => {
  try {
    const userId = req.user.id;
    // Get unique items the user has messaged about
    const [conversations] = await pool.query(
      `SELECT DISTINCT i.id as item_id, i.title, i.photo_url,
        (SELECT content FROM messages WHERE item_id = i.id ORDER BY created_at DESC LIMIT 1) as last_message,
        (SELECT created_at FROM messages WHERE item_id = i.id ORDER BY created_at DESC LIMIT 1) as last_message_date
       FROM messages m
       JOIN items i ON m.item_id = i.id
       WHERE m.sender_id = ? OR m.receiver_id = ?
       ORDER BY last_message_date DESC`,
      [userId, userId]
    );

    res.render("messages", { title: "Your Messages", conversations });
  } catch (err) {
    next(err);
  }
});

// View a specific message thread for an item
router.get("/:item_id", requireAuth, async (req, res, next) => {
  try {
    const itemId = Number(req.params.item_id);
    const userId = req.user.id; // Usually either the owner or the interested party

    // Fetch the item
    const [[item]] = await pool.query("SELECT id, title, user_id FROM items WHERE id = ?", [itemId]);
    if (!item) return res.status(404).render("error", { title: "Not Found", message: "Item not found." });

    // Fetch messages for this item involving the current user
    const [messages] = await pool.query(
      `SELECT m.*, s.name as sender_name 
       FROM messages m
       JOIN users s ON m.sender_id = s.id
       WHERE m.item_id = ? AND (m.sender_id = ? OR m.receiver_id = ?)
       ORDER BY m.created_at ASC`,
      [itemId, userId, userId]
    );

    // Determine the "other user" to set as receiver for new messages.
    // If we're the owner, we need to know who we're talking to. If there are messages, find the other person.
    // If no messages yet and we're NOT the owner, the receiver is the owner.
    let receiverId = item.user_id; 
    
    if (messages.length > 0) {
      const otherUserMsg = messages.find(m => m.sender_id !== userId);
      if (otherUserMsg) receiverId = otherUserMsg.sender_id;
    }

    // If the owner just clicks on "Messages" but no one has messaged them yet, they shouldn't be able to just message themselves.
    // The view should handle this.

    res.render("message_thread", { title: `Chat: ${item.title}`, item, messages, receiverId });
  } catch (err) {
    next(err);
  }
});

// Send a message
router.post("/:item_id", requireAuth, async (req, res, next) => {
  try {
    const itemId = Number(req.params.item_id);
    const { receiver_id, content } = req.body;
    
    if (!content || !content.trim()) {
      return res.redirect(`/messages/${itemId}`);
    }

    await pool.query(
      "INSERT INTO messages (item_id, sender_id, receiver_id, content) VALUES (?, ?, ?, ?)",
      [itemId, req.user.id, receiver_id, content.trim()]
    );

    res.redirect(`/messages/${itemId}`);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
