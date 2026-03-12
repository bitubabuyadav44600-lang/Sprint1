const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { pool } = require("../db");
const { JWT_SECRET } = require("../middleware/auth");

const router = express.Router();

router.get("/register", (req, res) => {
  res.render("register", { title: "Register" });
});

router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword } = req.body;
    
    if (!email.endsWith("@university.edu")) {
      return res.render("register", { title: "Register", error: "Registration is restricted to @university.edu email domains." });
    }
    
    if (password !== confirmPassword) {
      return res.render("register", { title: "Register", error: "Passwords do not match." });
    }

    const [existing] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
    if (existing.length > 0) {
      return res.render("register", { title: "Register", error: "Email already in use." });
    }

    const hash = await bcrypt.hash(password, 10);
    await pool.query("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", [name, email, hash]);

    res.redirect("/auth/login?msg=Account created successfully. Please log in.");
  } catch (err) {
    next(err);
  }
});

router.get("/login", (req, res) => {
  const msg = req.query.msg;
  res.render("login", { title: "Login", msg });
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const [users] = await pool.query("SELECT id, name, email, password FROM users WHERE email = ?", [email]);
    
    if (users.length === 0) {
      return res.render("login", { title: "Login", error: "Invalid email or password." });
    }

    const user = users[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.render("login", { title: "Login", error: "Invalid email or password." });
    }

    const token = jwt.sign({ id: user.id, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: '1d' });
    
    res.cookie("token", token, { httpOnly: true });
    res.redirect("/listings");
  } catch (err) {
    next(err);
  }
});

router.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/");
});

module.exports = router;
