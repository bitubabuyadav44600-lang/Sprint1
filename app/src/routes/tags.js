const express = require("express");
const router = express.Router();
const { pool } = require("../db");

// Tags list
router.get("/", async (req, res, next) => {
  try {
    const [tags] = await pool.query("SELECT id, name FROM tags ORDER BY name");
    res.render("tags", { title: "Tags", tags });
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

    const [listings] = await pool.query(
      `SELECT l.id, l.title, l.expiry_date, l.status, u.full_name AS owner_name
       FROM listings l
       JOIN users u ON u.id = l.user_id
       JOIN listing_tags lt ON lt.listing_id = l.id
       WHERE lt.tag_id = ?
       ORDER BY l.created_at DESC`,
      [tagId]
    );

    res.render("tag", { title: `Tag: ${tag.name}`, tag, listings });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
