const express = require("express");
const router = express.Router();
const { pool } = require("../db");

// Users list
router.get("/", async (req, res, next) => {
  try {
    const [users] = await pool.query(
      "SELECT id, name, email, created_at FROM users ORDER BY created_at DESC"
    );
    res.render("users", { title: "Community Members", users });
  } catch (e) {
    next(e);
  }
});

// User profile
router.get("/:id", async (req, res, next) => {
  try {
    const userId = Number(req.params.id);
    const [[userProfile]] = await pool.query(
      "SELECT id, name, email, created_at FROM users WHERE id = ?",
      [userId]
    );
    if (!userProfile) return res.status(404).render("error", { title: "Not Found", message: "User not found." });

    const [items] = await pool.query(
      `SELECT id, title, expiry_date, status, pickup_location,
        (SELECT GROUP_CONCAT(c.name SEPARATOR ', ') FROM item_categories ic JOIN categories c ON ic.category_id = c.id WHERE ic.item_id = items.id) AS categories
       FROM items
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [userId]
    );

    const [claimedItems] = await pool.query(
      `SELECT i.id, i.title, i.expiry_date, i.status, i.pickup_location, u.name as owner_name,
        (SELECT GROUP_CONCAT(c.name SEPARATOR ', ') FROM item_categories ic JOIN categories c ON ic.category_id = c.id WHERE ic.item_id = i.id) AS categories
       FROM items i
       JOIN claims c ON c.item_id = i.id
       JOIN users u ON u.id = i.user_id
       WHERE c.user_id = ? AND c.status = 'Active'
       ORDER BY c.created_at DESC`,
      [userId]
    );

    const [[stats]] = await pool.query(
      `SELECT 
        (SELECT COUNT(*) FROM items WHERE user_id = ?) as items_given,
        (SELECT COUNT(*) FROM claims WHERE user_id = ? AND status = 'Completed') as items_saved`,
      [userId, userId]
    );

    res.render("user", { title: `Profile: ${userProfile.name}`, userProfile, items, claimedItems, stats });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
