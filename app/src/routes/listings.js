const express = require("express");
const multer = require("multer");
const path = require("path");
const router = express.Router();
const { pool } = require("../db");
const { requireAuth } = require("../middleware/auth");

const storage = multer.diskStorage({
  destination: function (req, file, cb) { cb(null, path.join(__dirname, "../public/uploads")); },
  filename: function (req, file, cb) { cb(null, Date.now() + '-' + file.originalname); }
});
const upload = multer({ storage: storage });

// Browse Feed
router.get("/", async (req, res, next) => {
  try {
    const filter = req.query.category;
    const search = req.query.q;
    
    let query = `
      SELECT i.id, i.title, i.expiry_date, i.status, i.pickup_location, i.photo_url, u.name AS owner_name,
             (SELECT GROUP_CONCAT(c.name SEPARATOR ', ') FROM item_categories ic JOIN categories c ON ic.category_id = c.id WHERE ic.item_id = i.id) AS categories
      FROM items i 
      JOIN users u ON u.id = i.user_id
      WHERE i.status = 'Available' AND i.expiry_date >= CURDATE()`;
    const params = [];
    
    if (filter) {
      query += ` AND EXISTS (SELECT 1 FROM item_categories ic JOIN categories c ON ic.category_id = c.id WHERE ic.item_id = i.id AND c.name = ?)`;
      params.push(filter);
    }
    
    if (search) {
      query += ` AND (i.title LIKE ? OR i.description LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }
    
    query += ` ORDER BY i.created_at DESC`;

    const [items] = await pool.query(query, params);
    res.render("listings", { title: "Food Feed", items, currentFilter: filter, currentSearch: search });
  } catch (e) { next(e); }
});

// GET New Item Form
router.get("/new", requireAuth, async (req, res, next) => {
  try {
    const [tags] = await pool.query("SELECT id, name FROM tags ORDER BY name");
    const [categories] = await pool.query("SELECT id, name FROM categories ORDER BY name");
    res.render("listing_new", { title: "Post an Item", tags, categories });
  } catch (err) { next(err); }
});

// POST New Item
router.post("/", requireAuth, upload.single("photo"), async (req, res, next) => {
  try {
    const { title, description, categories: requestCategories, expiry_date, pickup_location, tags } = req.body;
    const photo_url = req.file ? `/uploads/${req.file.filename}` : null;
    
    const [result] = await pool.query(
      `INSERT INTO items (user_id, title, description, expiry_date, pickup_location, photo_url, status)
       VALUES (?, ?, ?, ?, ?, ?, 'Available')`,
      [req.user.id, title, description, expiry_date, pickup_location, photo_url]
    );

    const itemId = result.insertId;
    
    // Insert Many-To-Many relationship for categories
    if (requestCategories) {
      const catIds = Array.isArray(requestCategories) ? requestCategories : [requestCategories];
      for (const cId of catIds) {
        await pool.query("INSERT INTO item_categories (item_id, category_id) VALUES (?, ?)", [itemId, cId]);
      }
    }

    if (tags) {
      const tagIds = Array.isArray(tags) ? tags : [tags];
      for (const tId of tagIds) {
        await pool.query("INSERT INTO item_tags (item_id, tag_id) VALUES (?, ?)", [itemId, tId]);
      }
    }
    
    res.redirect(`/listings/${itemId}`);
  } catch (err) { next(err); }
});

// GET Edit Item Form (User Story 07)
router.get("/:id/edit", requireAuth, async (req, res, next) => {
  try {
    const itemId = Number(req.params.id);
    const [[item]] = await pool.query("SELECT * FROM items WHERE id = ?", [itemId]);
    
    if (!item) return res.status(404).render("error", { title: "Not Found", message: "Item not found." });
    if (item.user_id !== req.user.id) {
      return res.status(403).render("error", { title: "Access Denied", message: "You can only edit your own items." });
    }

    const [tags] = await pool.query("SELECT id, name FROM tags ORDER BY name");
    const [itemTagRows] = await pool.query("SELECT tag_id FROM item_tags WHERE item_id = ?", [itemId]);
    const itemTagIds = itemTagRows.map(r => r.tag_id);

    const [categories] = await pool.query("SELECT id, name FROM categories ORDER BY name");
    const [itemCatRows] = await pool.query("SELECT category_id FROM item_categories WHERE item_id = ?", [itemId]);
    const itemCatIds = itemCatRows.map(r => r.category_id);

    res.render("listing_edit", { title: "Edit Item", item, tags, itemTagIds, categories, itemCatIds });
  } catch (err) { next(err); }
});

// POST Edit Item
router.post("/:id", requireAuth, upload.single("photo"), async (req, res, next) => {
  try {
    const itemId = Number(req.params.id);
    const [[item]] = await pool.query("SELECT user_id, photo_url FROM items WHERE id = ?", [itemId]);
    
    if (!item) return res.status(404).render("error", { title: "Not Found", message: "Item not found." });
    if (item.user_id !== req.user.id) {
      return res.status(403).render("error", { title: "Access Denied", message: "You can only edit your own items." });
    }

    const { title, description, categories: requestCategories, expiry_date, pickup_location, tags } = req.body;
    let photo_url = item.photo_url;
    if (req.file) {
      photo_url = `/uploads/${req.file.filename}`;
    }
    
    await pool.query(
      `UPDATE items SET title = ?, description = ?, expiry_date = ?, pickup_location = ?, photo_url = ?
       WHERE id = ?`,
      [title, description, expiry_date, pickup_location, photo_url, itemId]
    );

    // Update categories
    await pool.query("DELETE FROM item_categories WHERE item_id = ?", [itemId]);
    if (requestCategories) {
      const catIds = Array.isArray(requestCategories) ? requestCategories : [requestCategories];
      for (const cId of catIds) {
        await pool.query("INSERT INTO item_categories (item_id, category_id) VALUES (?, ?)", [itemId, cId]);
      }
    }

    // Update tags
    await pool.query("DELETE FROM item_tags WHERE item_id = ?", [itemId]);
    if (tags) {
      const tagIds = Array.isArray(tags) ? tags : [tags];
      for (const tId of tagIds) {
        await pool.query("INSERT INTO item_tags (item_id, tag_id) VALUES (?, ?)", [itemId, tId]);
      }
    }
    
    res.redirect(`/listings/${itemId}?msg=Item updated successfully!`);
  } catch (err) { next(err); }
});

// View Details
router.get("/:id", async (req, res, next) => {
  try {
    const itemId = Number(req.params.id);
    const [[item]] = await pool.query(
      `SELECT i.*, u.name AS owner_name FROM items i JOIN users u ON u.id = i.user_id WHERE i.id = ?`,
      [itemId]
    );
    if (!item) return res.status(404).render("error", { title: "Not Found", message: "Item not found." });

    const [tags] = await pool.query(
      `SELECT t.id, t.name FROM tags t JOIN item_tags it ON it.tag_id = t.id WHERE it.item_id = ? ORDER BY t.name`,
      [itemId]
    );

    const [categories] = await pool.query(
      `SELECT c.id, c.name FROM categories c JOIN item_categories ic ON ic.category_id = c.id WHERE ic.item_id = ? ORDER BY c.name`,
      [itemId]
    );

    res.render("listing", { title: item.title, item, tags, categories });
  } catch (e) { next(e); }
});

// Claim Item
router.post("/:id/claim", requireAuth, async (req, res, next) => {
  try {
    const itemId = Number(req.params.id);
    const [[item]] = await pool.query("SELECT status FROM items WHERE id = ?", [itemId]);
    
    if (!item || item.status !== 'Available') {
      return res.status(400).render("error", { title: "Error", message: "Item is no longer available." });
    }
    
    await pool.query("UPDATE items SET status = 'Reserved' WHERE id = ?", [itemId]);
    await pool.query("INSERT INTO claims (item_id, user_id, status) VALUES (?, ?, 'Active')", [itemId, req.user.id]);
    
    res.redirect(`/listings/${itemId}?msg=Item reserved successfully!`);
  } catch (e) { next(e); }
});

// Mark as Collected (User Story 10)
router.post("/:id/collect", requireAuth, async (req, res, next) => {
  try {
    const itemId = Number(req.params.id);
    const [[item]] = await pool.query("SELECT user_id FROM items WHERE id = ?", [itemId]);
    
    if (!item || item.user_id !== req.user.id) {
      return res.status(403).render("error", { title: "Access Denied", message: "You can only mark your own items as collected." });
    }
    
    await pool.query("UPDATE items SET status = 'Collected' WHERE id = ?", [itemId]);
    await pool.query("UPDATE claims SET status = 'Completed' WHERE item_id = ? AND status = 'Active'", [itemId]);
    
    res.redirect(`/listings/${itemId}?msg=Item marked as collected!`);
  } catch (e) { next(e); }
});

// Delete Listing (User Story 08)
router.post("/:id/delete", requireAuth, async (req, res, next) => {
  try {
    const itemId = Number(req.params.id);
    const [[item]] = await pool.query("SELECT user_id FROM items WHERE id = ?", [itemId]);
    
    if (!item || item.user_id !== req.user.id) {
      return res.status(403).render("error", { title: "Access Denied", message: "You can only delete your own items." });
    }
    
    await pool.query("DELETE FROM items WHERE id = ?", [itemId]);
    res.redirect("/listings?msg=Item deleted successfully.");
  } catch (e) { next(e); }
});

module.exports = router;
