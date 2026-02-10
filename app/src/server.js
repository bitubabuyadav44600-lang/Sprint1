 const express = require("express");
const path = require("path");
const { pingDb } = require("./db");

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const listingsRouter = require("./routes/listings");
const tagsRouter = require("./routes/tags");

const app = express();
const PORT = Number(process.env.PORT || 3000);

// View engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

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
