const express = require("express");
const router = express.Router();
const { pool } = require("../db");

router.get("/", (req, res) => {
  res.render("index", {
    title: "Balen Community Food Share"
  });
});

router.get("/dashboard", async (req, res, next) => {
  try {
    const [[stats]] = await pool.query(`
      SELECT 
        COUNT(*) as total_items,
        SUM(CASE WHEN status = 'Collected' THEN 1 ELSE 0 END) as items_collected,
        COUNT(DISTINCT user_id) as active_donors
      FROM items
    `);

    // Mock environmental impact calculation (e.g., 2.5kg CO2 saved per item)
    stats.co2_saved = (stats.items_collected * 2.5).toFixed(1);

    res.render("dashboard", { title: "Community Impact", stats });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
