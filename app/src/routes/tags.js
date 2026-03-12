const express = require("express");
const router = express.Router();
const { pool } = require("../db");

// Tags list
router.get("/", async (req, res, next) => {
  try {
    const [tags] = await pool.query("SELECT id, name FROM tags ORDER BY name");
    res.render("tags", { title: "Dietary & Allergen Tags", tags });
  } catch (e) {
    next(e);
  }
});

// Tag detail -> show listings in this tag
router.get("/:id", async (req, res, next) => {
  try {
    const tagId = Number(req.params.id);

    const [[tag]] = await pool.query("SELECT id, name FROM tags WHERE id = ?", [tagId]);
    if (!tag) return res.status(404).render("error", { title: "Not Found", message: "Tag not found." });

    const [items] = await pool.query(
      `SELECT i.id, i.title, i.category, i.expiry_date, i.status, i.pickup_location, u.name AS owner_name
       FROM items i
       JOIN users u ON u.id = i.user_id
       JOIN item_tags it ON it.item_id = i.id
       WHERE it.tag_id = ?
       ORDER BY i.created_at DESC`,
      [tagId]
    );

    res.render("tag", { title: `Tag: ${tag.name}`, tag, items });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
