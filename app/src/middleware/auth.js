const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "supersecretbalenkey";

function requireAuth(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    return res.redirect("/auth/login");
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, name, email }
    res.locals.user = decoded; // make available in templates
    next();
  } catch (err) {
    res.clearCookie("token");
    return res.redirect("/auth/login");
  }
}

function checkAuth(req, res, next) {
  const token = req.cookies.token;
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      res.locals.user = decoded;
    } catch (err) {
      res.clearCookie("token");
    }
  }
  next();
}

module.exports = { requireAuth, checkAuth, JWT_SECRET };
