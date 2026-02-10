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

module.exports = { pool, pingDb };

