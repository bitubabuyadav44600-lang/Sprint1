const mysql = require("mysql2/promise");

function getPoolFromEnv() {
  const {
    DB_HOST = "db",
    DB_PORT = "3306",
    DB_NAME = "balen_db",
    DB_USER = "balen_user",
    DB_PASSWORD = "balen_pass"
  } = process.env;

  return mysql.createPool({
    host: DB_HOST,
    port: Number(DB_PORT),
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    namedPlaceholders: true
  });
}

const pool = getPoolFromEnv();

async function pingDb() {
  const [rows] = await pool.query("SELECT 1 AS ok");
  return rows?.[0]?.ok === 1;
}

/**
 * US-14: Expiry auto-handling. 
 * Marks available items as Expired if the current date is past the expiry date.
 */
async function autoExpireItems() {
  try {
    const [result] = await pool.query(
      "UPDATE items SET status = 'Expired' WHERE status = 'Available' AND expiry_date < CURDATE()"
    );
    if (result.affectedRows > 0) {
      console.log(`[Auto-Maintenance] ${result.affectedRows} items marked as Expired.`);
    }
  } catch (err) {
    console.error("[Auto-Maintenance Error]", err);
  }
}

// Run expiry check every hour
setInterval(autoExpireItems, 60 * 60 * 1000);
// Run once on startup
autoExpireItems();

module.exports = { pool, pingDb, autoExpireItems };
