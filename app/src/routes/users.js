const express = require("express");
const router = express.Router();
const { pool } = require("../db");

// Users list
router.get("/", async (req, res, next) => {
  try {
    const [users] = await pool.query(
      "SELECT id, full_name, email, area, created_at FROM users ORDER BY created_at DESC"
    );
    res.render("users", { title: "Users", users });
  } catch (e) {
    next(e);
  }
});

// User profile
router.get("/:id", async (req, res, next) => {
  try {
    const userId = Number(req.params.id);
    const [[user]] = await pool.query(
      "SELECT id, full_name, email, area, bio, created_at FROM users WHERE id = ?",
      [userId]
    );
    if (!user) return res.status(404).render("error", { title: "Not Found", message: "User not found." });

    const [listings] = await pool.query(
      `SELECT id, title, quantity, expiry_date, status
       FROM listings
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [userId]
    );

    res.render("user", { title: `Profile: ${user.full_name}`, user, listings });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
