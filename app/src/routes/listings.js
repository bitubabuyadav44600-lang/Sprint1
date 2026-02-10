const express = require("express");
const router = express.Router();
const { pool } = require("../db");

// Listings list
router.get("/", async (req, res, next) => {
  try {
    const [listings] = await pool.query(
      `SELECT l.id, l.title, l.quantity, l.expiry_date, l.status, l.pickup_location,
              u.full_name AS owner_name
       FROM listings l
       JOIN users u ON u.id = l.user_id
       ORDER BY l.created_at DESC`
    );
    res.render("listings", { title: "Food Listings", listings });
  } catch (e) {
    next(e);
  }
});

// Listing detail
router.get("/:id", async (req, res, next) => {
  try {
    const listingId = Number(req.params.id);

    const [[listing]] = await pool.query(
      `SELECT l.*, u.full_name AS owner_name, u.area AS owner_area
       FROM listings l
       JOIN users u ON u.id = l.user_id
       WHERE l.id = ?`,
      [listingId]
    );
    if (!listing) return res.status(404).render("error", { title: "Not Found", message: "Listing not found." });

    const [tags] = await pool.query(
      `SELECT t.id, t.name
       FROM tags t
       JOIN listing_tags lt ON lt.tag_id = t.id
       WHERE lt.listing_id = ?
       ORDER BY t.name`,
      [listingId]
    );

    res.render("listing", { title: listing.title, listing, tags });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
