const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.render("index", {
    title: "Balen Community Food Share",
    links: [
      { href: "/users", label: "Users" },
      { href: "/listings", label: "Listings" },
      { href: "/tags", label: "Tags" },
      { href: "/health", label: "Health (JSON)" }
    ]
  });
});

module.exports = router;
