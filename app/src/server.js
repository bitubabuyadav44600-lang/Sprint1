const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const { pingDb } = require("./db");
const { checkAuth } = require("./middleware/auth");

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const listingsRouter = require("./routes/listings");
const tagsRouter = require("./routes/tags");
const authRouter = require("./routes/auth");
const messagesRouter = require("./routes/messages");

const app = express();
const PORT = Number(process.env.PORT || 3000);

// View engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(checkAuth); // Checks if user is logged in, adds req.user and res.locals.user

// Health check (Sprint 1 proof)
app.get("/health", async (req, res) => {
  try {
    const ok = await pingDb();
    res.status(200).json({ status: "ok", db: ok ? "connected" : "not_connected" });
  } catch (err) {
    res.status(500).json({ status: "error", error: String(err?.message || err) });
  }
});

// Routes
app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/listings", listingsRouter);
app.use("/tags", tagsRouter);
app.use("/auth", authRouter);
app.use("/messages", messagesRouter);

// 404
app.use((req, res) => {
  res.status(404).render("error", {
    title: "Not Found",
    message: "Page not found."
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render("error", {
    title: "Server Error",
    message: err?.message || "Something went wrong."
  });
});

app.listen(PORT, () => {
  console.log(`Balen app running on http://localhost:${PORT}`);
});
